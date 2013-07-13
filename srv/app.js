(function () {
	// Initialize strict mode.
	"use strict";
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
			// Set the content disposition header.
			res.setHeader('Content-Disposition', 'attachment; filename*=UTF-8\'\'' + match[1].replace('\'', '%27') + '.mp3');
			// Set the content type header.
			res.setHeader('Content-Type', 'audio/mpeg');
			// Set the transfer encoding header.
			res.setHeader('Transfer-Encoding', 'chunked');
			// Write the ID3 tag.
			res.write('ID3');
			// Open a stream to the video resource.
			http.get(match[2], function (downloadStream) {
				// Initialize the path to the music file.
				var music = 'working/' + new Date().getTime() + '.mp3';
				// Initialize the path to the video file.
				var video = 'working/' + new Date().getTime() + '.mp4';
				// Open a stream to the video file.
				var videoStream = fs.createWriteStream(video);
				// Wait for data on the download stream.
				downloadStream.on('data', function (buffer) {
					// Write the chunk of data to the video stream.
					videoStream.write(buffer);
				});
				// Wait for the download stream to end.
				downloadStream.on('end', function () {
					// End the video stream.
					videoStream.end();
					// Convert the video file to a music file with ffmpeg.
					exec('ffmpeg -i "' + video + '" -vn -f mp3 -ab 192k "' + music + '"').on('exit', function () {
						// Open a stream to the music file.
						var musicStream = fs.createReadStream(music, {start: 3});
						// Wait for the music stream to close.
						musicStream.on('close', function () {
							// Unlink the music file.
							fs.unlinkSync(music);
							// Unlink the video file.
							fs.unlinkSync(video);
						});
						// Pipe the music stream to the response.
						musicStream.pipe(res);
					});
				});
			});
		}
	}).listen(7974);
}());
