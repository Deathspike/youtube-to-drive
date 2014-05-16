/*jslint browser: true*/
/*global chrome, escape, yt, ytplayer*/
(function () {
	// Enable restricted mode.
	"use strict";
	// Initialize the wait time in milliseconds.
	var waitTimeInMilliseconds = 50;

	// ==================================================
	//             I N I T   I N J E C T E E
	// ==================================================

	function init(waitTimeInMilliseconds) {
		// Initialize the locals.
		var locals = {pathname: window.location.pathname};

		// Compose the query string.
		locals.composeQueryString = function (pairs) {
			// Initialize the key.
			var key,
				// Initialize the value.
				value,
				// Initialize the values.
				values = [];
			// Iterate through the pairs.
			for (key in pairs) {
				// Check if the key is not an inherited property.
				if (pairs.hasOwnProperty(key)) {
					// Initialize the value.
					value = locals.encodeRFC5987(pairs[key]);
					// Push the key and value pair.
					values.push(locals.encodeRFC5987(key) + '=' + value);
				}
			}
			// Return the query string.
			return values.join('&');
		};

		// Compose the stream map.
		locals.composeStreamMap = function (streams) {
			// Initialize the iterator.
			var i,
				// Initialize the map.
				map = [];
			// Iterate through each stream.
			for (i = 0; i < streams.length; i += 1) {
				// Compose the query string.
				map.push(locals.composeQueryString(streams[i]));
			}
			// Return the map.
			return map.join(',');
		};

		// Encode RFC5987 value characters.
		locals.encodeRFC5987 = function (str) {
			// Encode the URI component ...
			return encodeURIComponent(str)
				// ... escape special characters ...
				.replace(/['()]/g, escape)
				// ... escape an asterisk.
				.replace(/\*/g, '%2A');
		};

		// Parse the query string.
		locals.parseQueryString = function (queryString) {
			// Intialize the iterator.
			var i,
				// Initialize the pair.
				pair,
				// Initialize the pairs.
				pairs = {},
				// Initialize the value.
				value,
				// Initialize the values.
				values = queryString.split('&');
			// Iterate through the values.
			for (i = 0; i < values.length; i += 1) {
				// Initialize the pair.
				pair = values[i].split('=');
				// Initialize the value.
				value = pair.length === 2 ? decodeURIComponent(pair[1]) : null;
				// Add the key and value to the pairs.
				pairs[decodeURIComponent(pair[0])] = value;
			}
			// Return the pairs.
			return pairs;
		};

		// Parse the stream map.
		locals.parseStreamMap = function (map) {
			// Initialize the iterator.
			var i,
				// Initialize the streams.
				streams = map.split(',');
			// Iterate through each stream.
			for (i = 0; i < streams.length; i += 1) {
				// Parse the query string.
				streams[i] = locals.parseQueryString(streams[i]);
			}
			// Return the streams.
			return streams;
		};

		// Reload the player.
		locals.reload = function () {
			// Check if the player is available.
			if (typeof ytplayer !== 'undefined') {
				// Initialize the acquisition function.
				var acq,
					// Initialize the arguments.
					args = ytplayer.config.args,
					// Initialize the container.
					container,
					// Initialize the iterator.
					i,
					// Initialize the key.
					key,
					// Initialize the stream map.
					map = args.url_encoded_fmt_stream_map,
					// Initialize the parent.
					parent,
					// Initialize the player.
					player,
					// Initialize the property.
					property,
					// Initialize the stream.
					stream,
					// Initialize the streams.
					streams = locals.parseStreamMap(map),
					// Initialize the value.
					value,
					// Initialize the values.
					values;
				// Iterate through each stream.
				for (i = 0; i < streams.length; i += 1) {
					// Initialize the stream.
					stream = streams[i];
					// Check if the stream is considered invalid.
					if (!stream.type.match(/^video\/mp4/gi)) {
						// Splice the stream.
						streams.splice(i, 1);
						// Decrement the iterator.
						i -= 1;
					} else if (i === 0) {
						// Set the preferred video quality.
						args.vq = stream.quality;
					}
				}
				// Compose the stream map and check if it is valid.
				if ((map = locals.composeStreamMap(streams)).length) {
					// Initialize the acquisition function.
					acq = document.getElementById.bind(document);
					// Initialize the player container.
					container = acq('player-api-legacy') || acq('player-api');
					// Initialize the player.
					player = container.firstElementChild;
					// Delete the adaptive streams.
					delete args.adaptive_fmts;
					// Delete the manifest location.
					delete args.dashmpd;
					// Set the stream map.
					args.url_encoded_fmt_stream_map = map;
					// Check if the flash player is in use.
					if (typeof player.attributes.flashvars !== 'undefined') {
						// Initialize the flash values.
						values = [];
						// Iterate through the pairs.
						for (property in args) {
							// Check if the key is not an inherited property.
							if (args.hasOwnProperty(property)) {
								// Initialize the key.
								key = locals.encodeRFC5987(property);
								// Initialize the value.
								value = locals.encodeRFC5987(args[property]);
								// Push the key and value pair.
								values.push(key + '=' + value);
							}
						}
						// Set the flash values attribute.
						player.attributes.flashvars.value = values.join('&');
						// Reload the container contents ...
						container.innerHTML = (function () {
							// ... with the container contents.
							return container.innerHTML;
						}());
					} else if (false) {
						// Remove the player.
						locals.remove();
						// Attempt the following code.
						try {
							// Reload the player ...
							yt.player.Application.create('player-api',
								// ... with the modified config.
								ytplayer.config);
						} catch (e) {
							// Remove the player.
							locals.remove();
						}
					}
					// Check if the link element is set.
					if (locals.linkElement) {
						// Initialize the parent.
						parent = locals.linkElement.parentNode;
						// Remove the link element from the document.
						parent.removeChild(locals.linkElement);
						// Remove the link element.
						locals.linkElement = null;
					}
				}
			}
		};

		// Remove the player.
		locals.remove = function () {
			// Initialize the acquisition function.
			var acq = document.getElementById.bind(document),
				// Initialize the container.
				container = acq('player-api-legacy') || acq('player-api');
			// Iterate for each child.
			while (container.firstChild) {
				// Remove the child.
				container.removeChild(container.firstChild);
			}
		};
		
		// Update the player.
		locals.update = function (data) {
			// Check if the player is available.
			if (typeof ytplayer !== 'undefined') {
				// Initialize the address.
				var address,
					// Initialize the arguments.
					args,
					// Initialize the iterator.
					i,
					// Initialize the stream map.
					map,
					// Initialize the query string.
					qs,
					// Initialize the stream.
					stream,
					// Initialize the streams.
					streams,
					// Initialize the title element.
					title = document.getElementById('watch7-headline');
				// Check if the title element is valid.
				if (title) {
					// Initialize the arguments.
					args = ytplayer.config.args;
					// Initialize the stream map.
					map = args.url_encoded_fmt_stream_map;
					// Initialize the query string.
					qs = data.qs;
					// Initialize the streams.
					streams = locals.parseStreamMap(map);
					// Check if the link element is not set.
					if (!locals.linkElement) {
						// Initialize the link element.
						locals.linkElement = document.createElement('text');
						// Add the link element to the title element.
						title.appendChild(locals.linkElement);
					}
					// Iterate through each stream.
					for (i = 0; i < streams.length; i += 1) {
						// Initialize the stream.
						stream = streams[i];
						// Check if the stream is valid.
						if (qs.itag === stream.itag) {
							// Initialize the address ...
							address = stream.url + '&signature=' +
								// ... with the signature ...
								locals.encodeRFC5987(qs.signature) + '&dl=' +
								// ... and the download title.
								locals.encodeRFC5987(args.title);
							// Set the music- and video link element ...
							locals.linkElement.innerHTML =
								// ... check the local server availability ...
								(data.localAvailable ? '<a href="' + address +
									// ... or use plain text when not available ...
									'&mc">♪ Music ♪</a>' : '♪ Music ♪') +
								// ... with the seperator ...
								' | ' +
								// ... and the video link.
								'<a href="' + address + '">♥ Video ♥</a>';
							// Break the iteration.
							break;
						}
					}
				}
			}
		};

		// Set the configuration check function on an interval.
		setInterval(function () {
			// Check if the pathname has changed.
			if (locals.pathname !== window.location.pathname) {
				// Set the path.
				locals.pathname = window.location.pathname;
				// Remove the player.
				locals.remove();
			}
			// Check if the player is available ...
			if (typeof ytplayer !== 'undefined' &&
					// ... and we are still on a watch page.
					/^\/watch/.test(locals.pathname)) {
				// Check if the configuration has changed.
				if (locals.config !== ytplayer.config) {
					// Set the config.
					locals.config = ytplayer.config;
					// Reload the player.
					locals.reload();
				}
				// Check if request data has been made available.
				if (locals.config.yttd !== undefined) {
					// Update the player.
					locals.update(locals.config.yttd);
					// Delete the request data.
					delete locals.config.yttd;
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
			ytplayer.config.yttd = data;
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
		var escaped = JSON.stringify(data),
			// Initialize the script node.
			script = document.createElement('script'),
			// Initialize the text node.
			text = document.createTextNode('(' + cb + ')(' + escaped + ');');
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
}());