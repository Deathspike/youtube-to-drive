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
	
		// Check if the video is available.
		if (typeof yt !== undefined) {
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
					// Check if the stream is valid.
					if (streams[i].type.match(/^video\/mp4/gi)) {
						// Initialize the address ...
						var address = streams[i].url +
							// ... with the signature ...
							'&signature=' + encode(streams[i].sig) +
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