/*global chrome, document, setInterval, window, yt, ytplayer: false */
"use strict";

// ==================================================
//             I N I T   I N J E C T E E
// ==================================================

function init() {
	// Compose the query string.
	var composeQueryString = function (pairs) {
		// Initialize the values.
		var values = [];
		// Iterate through the pairs.
		for (var key in pairs) {
			// Check if the key is not an inherited property.
			if (pairs.hasOwnProperty(key)) {
				// Initialize the value.
				var value = encodeRFC5987(pairs[key]);
				// Push the key and value pair.
				values.push(encodeRFC5987(key) + '=' + value);
			}
		}
		// Return the query string.
		return values.join('&');
	};

	// Compose the stream map.
	var composeStreamMap = function (streams) {
		// Initialize the map.
		var map = [];
		// Iterate through each stream.
		for (var i = 0; i < streams.length; i += 1) {
			// Compose the query string.
			map.push(composeQueryString(streams[i]));
		}
		// Return the map.
		return map.join(',');
	};

	// Encode RFC5987 value characters.
	var encodeRFC5987 = function (str) {
		// Encode the URI component ...
		return encodeURIComponent(str)
			// ... escape special characters ...
			.replace(/['()]/g, escape)
			// ... escape an asterisk.
			.replace(/\*/g, '%2A');
	};

	// Parse the query string.
	var parseQueryString = function (query) {
		// Initialize the values.
		var values = query.split('&');
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
	};

	// Parse the stream map.
	var parseStreamMap = function (map) {
		// Initialize the streams.
		var streams = map.split(',');
		// Iterate through each stream.
		for (var i = 0; i < streams.length; i += 1) {
			// Parse the query string.
			streams[i] = parseQueryString(streams[i]);
		}
		// Return the streams.
		return streams;
	};

	// Reload the player.
	var reload = function () {
		// Check if the player is available.
		if (typeof ytplayer !== undefined) {
			// Initialize the arguments.
			var args = ytplayer.config.args;
			// Initialize the streams.
			var streams = parseStreamMap(args.url_encoded_fmt_stream_map);
			// Iterate through each stream.
			for (var i = 0; i < streams.length; i += 1) {
				// Initialize the stream.
				var stream = streams[i];
				// Check if the stream is considered invalid.
				if (!stream.type.match(/^video\/mp4/gi)) {
					// Splice the stream.
					streams.splice(i, 1);
					// Decrement the iterator.
					i -= 1;
				}
				// Otherwise check if this is the first stream.
				else if (i === 0) {
					// Set the preferred video quality.
					ytplayer.config.args.vq = stream.quality;
				}
			}
			// Compose the stream map and check if it is valid.
			if ((args.url_encoded_fmt_stream_map = composeStreamMap(streams))) {
				// Initialize the acquisition function.
				var acq = document.getElementById.bind(document);
				// Initialize the player container.
				var container = acq('player-api-legacy') || acq('player-api');
				// Initialize the player.
				var player = container.firstElementChild;
				// Delete the adaptive streams.
				delete ytplayer.config.args.adaptive_fmts;
				// Delete the manifest location.
				delete ytplayer.config.args.dashmpd;
				// Check if the flash player is in use.
				if (typeof player.attributes.flashvars !== 'undefined') {
					// Initialize the flash values.
					var values = [];
					// Iterate through the pairs.
					for (var key in args) {
						// Check if the key is not an inherited property.
						if (args.hasOwnProperty(key)) {
							// Initialize the value.
							var value = encodeRFC5987(args[key]);
							// Push the key and value pair.
							values.push(encodeRFC5987(key) + '=' + value);
						}
					}
					// Set the flash values attribute.
					player.attributes.flashvars.value = values.join('&');
					// Reload the container contents.
					container.innerHTML = container.innerHTML;
				} else {
					// Reload the player.
					yt.player.Application.create('player-api', ytplayer.config);
				}
				// Check if the link element is set.
				if (window.yttd.linkElement) {
					// Initialize the parent.
					var parent = window.yttd.linkElement.parentNode;
					// Remove the link element from the document.
					parent.removeChild(window.yttd.linkElement);
					// Remove the link element.
					window.yttd.linkElement = null;
				}
			}
		}
	};

	// Update the player.
	var update = function (data) {
		// Check if the player is available.
		if (typeof ytplayer !== undefined) {
			// Initialize the title element.
			var title = document.getElementById('watch7-headline');
			// Check if the title element is valid.
			if (title) {
				// Initialize the arguments.
				var args = ytplayer.config.args;
				// Initialize the query string.
				var qs = data.qs;
				// Initialize the streams.
				var streams = parseStreamMap(args.url_encoded_fmt_stream_map);
				// Check if the link element is not set.
				if (!window.yttd.linkElement) {
					// Initialize the link element.
					window.yttd.linkElement = document.createElement('text');
					// Add the link element to the title element.
					title.appendChild(window.yttd.linkElement);
				}
				// Iterate through each stream.
				for (var i = 0; i < streams.length; i += 1) {
					// Initialize the stream.
					var stream = streams[i];
					// Check if the stream is valid.
					if (qs.itag === stream.itag) {
						// Initialize the address ...
						var address = stream.url +
							// ... with the signature ...
							'&signature=' + encodeRFC5987(qs.signature) +
							// ... and the download title.
							'&dl=' + encodeRFC5987(args.title);
						// Set the music- and video link element ...
						window.yttd.linkElement.innerHTML =
							// ... check the local server availability ...
							(data.localAvailable ?
							// ... and use the anchor when available ...
							'<a href="' + address + '&mc">Download Music</a>' :
							// ... or use plain text when not available ...
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
	};

	// Configure the YYTD variable ...
	window.yttd = {
		// ... with the config ...
		config: null,
		// ... with the link element ...
		element: null,
		// ... with the reload function ...
		reload: reload,
		// ... with the update function.
		update: update
	};

	// Set the configuration check function on an interval
	setInterval(function () {
		// Check if the configuration has changed.
		if (window.yttd.config !== ytplayer.config) {
			// Reload the player.
			reload();
			// Set the config.
			window.yttd.config = ytplayer.config;
		}
	}, 50);
}

// ==================================================
//           U P D A T E   I N J E C T E E
// ==================================================

// Define the update function.
function update(data) {
	// Check if the YouTube-To-Drive variable is valid.
	if (typeof window.yttd !== 'undefined') {
		// Update the player.
		window.yttd.update(data);
	}
}

// ==================================================
//                  I N J E C T O R
// ==================================================

// Define the inject function.
function inject(cb, data) {
	// Initialize the escaped data.
	var escaped = JSON.stringify(data);
	// Initialize the script node.
	var script = document.createElement('script');
	// Initialize the text node.
	var text = document.createTextNode('(' + cb + ')(' + escaped + ');');
	// Add the text node to the script node.
	script.appendChild(text);
	// Append the element temporarily to the document.
	document.body.appendChild(script).parentNode.removeChild(script);
}

// Add a listener to extension message received event.
chrome.extension.onMessage.addListener(function (request, sender, send) {
	// Check if the video quality and signature are available.
	if (request.qs.itag && request.qs.signature) {
		// Inject the main function with the request.
		inject(update, request);
	}
});

// Inject the init function.
inject(init);
