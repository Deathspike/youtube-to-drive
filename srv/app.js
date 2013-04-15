(function () {
	// Initialize strict mode.
	"use strict";
	// Initialize the express application.
	var app = require('express')();
	// Initialize the child process module and retrieve the exec function.
	var exec = require('child_process').exec;
	// Initialize the file system module.
	var fs = require('fs');
	// Initialize the request module.
	var request = require('request');
	// Set the download handler.
	app.get('/:name/:url', function (req, res) {
		// Decode the address.
		var address = decodeURIComponent(req.params.url);
		// Check if the address is somewhat valid.
		if (!address.match(/^http:\/\/([\S]+)\.youtube\.com\//i)) {
			// Stop the function.
			return;
		}
		// Initialize the current time.
		var currentTime = new Date().getTime();
		// Initialize the input.
		var input = 'working/' + currentTime + '.mp4';
		// Initialize the output.
		var output = 'working/' + currentTime + '.mp3';
		// Initialize the name.
		var name = encode(decodeURIComponent(req.params.name));
		// Write the content disposition.
		res.set('Content-Disposition', 'attachment; filename*=UTF-8\'\'' + name + '.mp3');
		// Write the Content-Type header to indicate the file type.
		res.set('Content-Type', 'audio/mpeg');
		// Write the Transfer-Encoding header to indicate a chunked file.
		res.set('Transfer-Encoding', 'chunked');
		// Write the ID3 tag.
		res.write('ID3');
		// Request the video file ...
		request(address).pipe(fs.createWriteStream(input))
			// ... and wait for the stream to close.
			.on('close', function () {
			// Create a process and convert the video file.
			var process = exec('ffmpeg -i "' + input + '" -vn -f mp3 -ab 192k "' +  output + '"');
			// Wait for the process to exit.
			process.on('exit', function (error) {
				// Check if an error has occured.
				if (error) {
					// End the response.
					res.end();
					// Unlink the input file.
					fs.unlinkSync(input);
					// Unlink the output.
					fs.unlinkSync(output);
				} else {
					// Define the pipe stream to response function.
					var pipeStreamToResponse = function () {
						// Create a stream to the music file (skip ID3).
						var stream = fs.createReadStream(output, {start: 3});
						// Wait for an error to occur.
						stream.on('error', function () {
							// Set a time out and attempt again.
							setTimeout(pipeStreamToResponse, 500);
						});
						// Wait for the stream to close.
						stream.on('close', function () {
							// End the response.
							res.end();
							// Unlink the input file.
							fs.unlinkSync(input);
							// Unlink the output.
							fs.unlinkSync(output);
						});
						// Forward the file to the response.
						stream.pipe(res, {end: false});
					};
					// Pipe the stream to the response.
					pipeStreamToResponse();
				}
			});
		});
	});
	// Set the ping handler.
	app.get('/ping', function (req, res) {
		// Send pong.
		res.json({pong: true});
	});
	// Listen for requests.
	app.listen(7974);
	
	// Encode an Uniform Resource Identifier (URI) component.
	function encode(str) {
		// Initialize the encoded string.
		var encoded = encodeURIComponent(str);
		// Encode the omitted characters.
		return encoded.replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
	}
}());