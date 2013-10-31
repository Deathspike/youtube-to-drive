// Initialize strict mode.
"use strict";
// Initialize the download function.
var download;
// Initialize the exec function.
var exec = require('child_process').exec;
// Initialise the fs module.
var fs = require('fs');
// Initialise the http module.
var http = require('http');
// Initialize the match variable.
var match;

// ==================================================
//                    S E R V E R
// ==================================================

// Create the server and listen for requests on port 7974.
http.createServer(function (req, res) {
	// Check if the music request match is invalid.
	if ((match = req.url.match(/^\/([\w\W]*?)\/([\w\W]*)$/)) === null) {
		// Set the content-type header.
		res.setHeader('Content-Type', 'application/json');
		// Send the response.
		res.end('{"alive": true}');
	} else {
		// Initialize the name.
		var name = match[1].replace('\'', '%27');
		// Initialize the disposition.
		var disposition = 'attachment; filename*=UTF-8\'\'' + name + '.mp3';
		// Set the content disposition header.
		res.setHeader('Content-Disposition', disposition);
		// Set the content type header.
		res.setHeader('Content-Type', 'audio/mpeg');
		// Set the transfer encoding header.
		res.setHeader('Transfer-Encoding', 'chunked');
		// Write the ID3 tag.
		res.write('ID3');
		// Download the music file.
		download(res, match[2]);
	}
}).listen(7974);

// Download a music file.
var download = function (clientStream, location) {
	// Open a stream to the video resource.
	http.get(location, function (inputStream) {
		// Check if the server has answered with a redirect.
		if (inputStream.headers && inputStream.headers.location) {
			// Follow the redirect instruction.
			download(clientStream, inputStream.headers.location);
		} else {
			// Initialize the path to the music file.
			var m = 'working/' + new Date().getTime() + '.mp3';
			// Initialize the path to the video file.
			var v = 'working/' + new Date().getTime() + '.mp4';
			// Open a stream to the video file.
			var output = fs.createWriteStream(v);
			// Wait for data on the download stream.
			inputStream.on('data', function (buffer) {
				// Write the chunk of data to the output.
				output.write(buffer);
			});
			// Wait for the download stream to end.
			inputStream.on('end', function () {
				// Initialize the arguments.
				var args = '-i "' + v + '" -vn -f mp3 -ab 192k "' + m + '"';
				// End the output.
				output.end();
				// Convert the video file to a music file with ffmpeg.
				exec('ffmpeg ' + args).on('exit', function () {
					// Open a stream to the music file.
					var musicStream = fs.createReadStream(m, {start: 3});
					// Wait for the music stream to close.
					musicStream.on('close', function () {
						// Unlink the music file.
						fs.unlinkSync(m);
						// Unlink the video file.
						fs.unlinkSync(v);
					});
					// Pipe the music stream to the response.
					musicStream.pipe(clientStream);
				});
			});
		}
	});
};
