/*global chrome, document, setInterval, setTimeout, window, yt, ytplayer: true*/
"use strict";
// Initialize the wait time in milliseconds.
var waitTimeInMilliseconds = 50;

// ==================================================
//             I N I T   I N J E C T E E
// ==================================================

function init(waitTimeInMilliseconds) {
	// Initialize the locals.
	var _locals = {pathname: window.location.pathname};

	// Compose the query string.
	_locals.composeQueryString = function (pairs) {
		// Initialize the values.
		var values = [];
		// Iterate through the pairs.
		for (var key in pairs) {
			// Check if the key is not an inherited property.
			if (pairs.hasOwnProperty(key)) {
				// Initialize the value.
				var value = _locals.encodeRFC5987(pairs[key]);
				// Push the key and value pair.
				values.push(_locals.encodeRFC5987(key) + '=' + value);
			}
		}
		// Return the query string.
		return values.join('&');
	};

	// Compose the stream map.
	_locals.composeStreamMap = function (streams) {
		// Initialize the map.
		var map = [];
		// Iterate through each stream.
		for (var i = 0; i < streams.length; i += 1) {
			// Compose the query string.
			map.push(_locals.composeQueryString(streams[i]));
		}
		// Return the map.
		return map.join(',');
	};

	// Encode RFC5987 value characters.
	_locals.encodeRFC5987 = function (str) {
		// Encode the URI component ...
		return encodeURIComponent(str)
			// ... escape special characters ...
			.replace(/['()]/g, escape)
			// ... escape an asterisk.
			.replace(/\*/g, '%2A');
	};

	// Parse the query string.
	_locals.parseQueryString = function (query) {
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
	_locals.parseStreamMap = function (map) {
		// Initialize the streams.
		var streams = map.split(',');
		// Iterate through each stream.
		for (var i = 0; i < streams.length; i += 1) {
			// Parse the query string.
			streams[i] = _locals.parseQueryString(streams[i]);
		}
		// Return the streams.
		return streams;
	};

	// Reload the player.
	_locals.reload = function () {
		// Check if the player is available.
		if (typeof ytplayer !== undefined) {
			// Initialize the arguments.
			var args = ytplayer.config.args;
			// Initialize the stream map.
			var map = args.url_encoded_fmt_stream_map;
			// Initialize the streams.
			var streams = _locals.parseStreamMap(map);
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
					args.vq = stream.quality;
				}
			}
			// Compose the stream map and check if it is valid.
			if ((map = _locals.composeStreamMap(streams))) {
				// Initialize the acquisition function.
				var acq = document.getElementById.bind(document);
				// Initialize the player container.
				var container = acq('player-api-legacy') || acq('player-api');
				// Initialize the player.
				var player = container.firstElementChild;
				// Delete the adaptive streams.
				delete args.adaptive_fmts;
				// Delete the manifest location.
				delete args.dashmpd;
				// Set the stream map.
				args.url_encoded_fmt_stream_map = map;
				// Check if the flash player is in use.
				if (typeof player.attributes.flashvars !== 'undefined') {
					// Initialize the flash values.
					var values = [];
					// Iterate through the pairs.
					for (var property in args) {
						// Check if the key is not an inherited property.
						if (args.hasOwnProperty(property)) {
							// Initialize the key.
							var key = _locals.encodeRFC5987(property);
							// Initialize the value.
							var value = _locals.encodeRFC5987(args[property]);
							// Push the key and value pair.
							values.push(key + '=' + value);
						}
					}
					// Set the flash values attribute.
					player.attributes.flashvars.value = values.join('&');
					// Reload the container contents.
					container.innerHTML = container.innerHTML;
				} else if (ytplayer.config.loaded) {
					// Remove the player.
					_locals.remove();
					// Reload the player.
					yt.player.Application.create('player-api', ytplayer.config);
				}
				// Check if the link element is set.
				if (_locals.linkElement) {
					// Initialize the parent.
					var parent = _locals.linkElement.parentNode;
					// Remove the link element from the document.
					parent.removeChild(_locals.linkElement);
					// Remove the link element.
					_locals.linkElement = null;
				}
			}
		}
	};

	// Remove the player.
	_locals.remove = function () {
		// Initialize the acquisition function.
		var acq = document.getElementById.bind(document);
		// Initialize the container.
		var container = acq('player-api-legacy') || acq('player-api');
		// Iterate for each child.
		while (container.firstChild) {
			// Remove the child.
			container.removeChild(container.firstChild);
		}
	};
	
	// Update the player.
	_locals.update = function (data) {
		// Check if the player is available.
		if (typeof ytplayer !== undefined) {
			// Initialize the title element.
			var title = document.getElementById('watch7-headline');
			// Check if the title element is valid.
			if (title) {
				// Initialize the arguments.
				var args = ytplayer.config.args;
				// Initialize the stream map.
				var map = args.url_encoded_fmt_stream_map;
				// Initialize the query string.
				var qs = data.qs;
				// Initialize the streams.
				var streams = _locals.parseStreamMap(map);
				// Check if the link element is not set.
				if (!_locals.linkElement) {
					// Initialize the link element.
					_locals.linkElement = document.createElement('text');
					// Add the link element to the title element.
					title.appendChild(_locals.linkElement);
				}
				// Iterate through each stream.
				for (var i = 0; i < streams.length; i += 1) {
					// Initialize the stream.
					var stream = streams[i];
					// Check if the stream is valid.
					if (qs.itag === stream.itag) {
						// Initialize the address ...
						var address = stream.url + '&signature=' +
							// ... with the signature ...
							_locals.encodeRFC5987(qs.signature) + '&dl=' +
							// ... and the download title.
							_locals.encodeRFC5987(args.title);
						// Set the music- and video link element ...
						_locals.linkElement.innerHTML =
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
	
	// Set the configuration check function on an interval.
	setInterval(function () {
		// Check if the configuration has changed.
		if (_locals.config !== ytplayer.config) {
			// Set the config.
			_locals.config = ytplayer.config;
			// Reload the player.
			_locals.reload();
		}
		// Check if request data has been made available.
		if (_locals.config._yttd !== undefined) {
			// Update the player.
			_locals.update(_locals.config._yttd);
			// Delete the request data.
			delete _locals.config._yttd;
		}
		// Check if the pathname has changed.
		if (_locals.pathname !== window.location.pathname) {
			// Set the path.
			_locals.pathname = window.location.pathname;
			// Check if the path does not indicate a watch page.
			if (!/^\/watch/i.test(_locals.pathname)) {
				// Remove the player.
				_locals.remove();
			}
		}
	}, waitTimeInMilliseconds);
}

// ==================================================
//           U P D A T E   I N J E C T E E
// ==================================================

function update(data) {
	// Check if the player is available.
	if (typeof ytplayer !== undefined) {
		// Set the request data.
		ytplayer.config._yttd = data;
	} else {
		// Schedule the update.
		setTimeout(update, waitTimeInMilliseconds, data);
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
inject(init, waitTimeInMilliseconds);