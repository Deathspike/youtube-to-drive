/*global $, document, chrome, ytplayer: false */
(function () {
	// Initialize strict mode.
	"use strict";

	// ==================================================
	//                  I N J E C T E E
	// ==================================================

	// Define the main function.
	function main(local) {
		// Encode an Uniform Resource Identifier (URI) component.
		function encode(str) {
			// Initialize the encoded string.
			var encoded = encodeURIComponent(str);
			// Encode the omitted characters.
			return encoded.replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
		}

		// Parse the query string.
		function parseQueryString(queryString) {
			// Initialize the values.
			var values = queryString.split('&');
			// Initialize the pairs.
			var pairs = {};
			// Iterate through the values.
			for (var i = 0; i < values.length; i += 1) {
				// Initialize the pair.
				var p = values[i].split('=');
				// Initialize the value.
				var v = p.length === 2 ? decodeURIComponent(p[1]) : null;
				// Add the key and value to the pairs.
				pairs[decodeURIComponent(p[0])] = v;
			}
			// Return the pairs.
			return pairs;
		}

		// Parse the stream map.
		function parseStreamMap(streamMap) {
			// Initialize the streams.
			var streams = streamMap.split(',');
			// Iterate through each stream.
			for (var i = 0; i < streams.length; i += 1) {
				// Parse the query string.
				streams[i] = parseQueryString(streams[i]);
			}
			// Return the streams.
			return streams;
		}

		// Parse the signature.
		// Date: July 10th, 2013
		// Source: https://github.com/rg3/youtube-dl/blob/master/youtube_dl/extractor/youtube.py
		function parseSignature(s) {
			var r = s.split('').reverse().join('');
			switch (s.length) {
			case 88:
				return s[48] + r.substr(81, 67) + s[82] + r.substr(66, 62) + s[85] + r.substr(61, 48) + s[67] + r.substr(47, 12) + s[3] + r.substr(11, 3) + s[2] + s[12];
			case 87:
				return s[62] + r.substr(82, 62) + s[83] + r.substr(61, 52) + s[0] + r.substr(51, 2);
			case 86:
				return s.substr(2, 63) + s[82] + s.substr(64, 82) + s[63];
			case 85:
				return s[76] + r.substr(82, 76) + s[83] + r.substr(75, 60) + s[0] + r.substr(59, 50) + s[1] + r.substr(49, 2);
			case 84:
				return r.substr(83, 36) + s[2] + r.substr(35, 26) + s[3] + r.substr(25, 3) + s[26];
			case 83:
				return s.substr(0, 81);
			case 82:
				return s[36] + r.substr(79, 67) + s[81] + r.substr(66, 40) + s[33] + r.substr(39, 36) + s[40] + s[35] +	s[0] + s[67] + r.substr(32, 0) + s[34];
			}
		}

		// Check if the video is available.
		if (typeof ytplayer !== undefined) {
			// Retrieve the title.
			var title = document.getElementById('watch7-headline');
			// Check if the title is valid.
			if (title) {
				// Retrieve the arguments.
				var args = ytplayer.config.args;
				// Retrieve the streams.
				var streams = parseStreamMap(args.url_encoded_fmt_stream_map);
				// Iterate through each stream.
				for (var i = 0; i < streams.length; i += 1) {
					// Initialize the stream.
					var stream = streams[i];
					// Check if the stream is valid.
					if (stream.type.match(/^video\/mp4/gi)) {
						// Initialize the address ...
						var address = stream.url +
							// ... with the signature ...
							'&signature=' + encode(stream.sig || parseSignature(stream.s)) +
							// ... and the download title.
							'&dl=' + encode(args.title);
						// Add the music- and video download link ...
						title.innerHTML = title.innerHTML +
							// ... check if the local server is available ...
							(local ?
							// ... with the anchor if available ...
							'<a href="' + address + '&mc">Download Music</a>' :
							// ... with plain text when not available ...
							'Download Music') +
							// ... with the seperator ...
							' | ' +
							// ... and the video link.
							'<a href="' + address + '">Download Video</a>';
						// Break the iteration.
						break;
					}
				}
			}
		}
	}

	// ==================================================
	//                  I N J E C T O R
	// ==================================================

	// Retrieve the local enabled state.
	chrome.extension.sendMessage({}, function (data) {
		// Initialize the script node.
		var script = document.createElement('script');
		// Initialize the local enabled state.
		var local = data.localEnabled;
		// Initialize the text node.
		var node = document.createTextNode('(' + main + ')(' + local + ');');
		// Set the script function.
		script.appendChild(node);
		// Append the element to the document.
		(document.body || document.documentElement).appendChild(script);
	});
}());
