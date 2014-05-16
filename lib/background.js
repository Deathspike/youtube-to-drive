/*jslint browser: true*/
/*global chrome, escape*/
(function () {
	// Enable restricted mode.
	"use strict";
	// Initialize the encodeRFC5987 function.
	var encodeRFC5987,
		// Initialize the address.
		localAddress = 'http://localhost:7974/',
		// Initialize the local server availability status.
		localAvailable = false,
		// Initialize the parseQueryString function.
		parseQueryString,
		// Initialize the requests.
		requests = [],
		// Initialize a XMLHttpRequest.
		xhr = new XMLHttpRequest();

	// ==================================================
	//                     L O C A L
	// ==================================================

	// Set the local address with a GET method.
	xhr.open('GET', localAddress);
	// Subscribe to the load event.
	xhr.addEventListener('load', function () {
		// Set the local server availability status.
		localAvailable = true;
	});
	// Begin the request.
	xhr.send(null);

	// ==================================================
	//             E V E N T   H A N D L E R
	// ==================================================

	// Called when a request is about to be sent.
	function onBeforeRequest(details) {
		// Initialize the address
		var address,
			// Initialize the download component.
			dl,
			// Initialize the query string.
			qs = parseQueryString(details.url);
		// Check if the query string contains the download.
		if (qs.dl) {
			console.log('onBeforeRequest: dl');
			// Initialize the download component.
			dl = encodeRFC5987(qs.dl);
			// Initialize the address.
			address = details.url.split('&dl=' + dl).shift();
			// Check if music conversion has been enabled.
			if (qs.hasOwnProperty('mc')) {
				// Return the modified address.
				return {redirectUrl: localAddress + dl + '/' + address};
			} else {
				// Store the request identifier and file name.
				requests[details.requestId] = qs.dl;
				// Return the modified address.
				return {redirectUrl: address};
			}
		} else if (details.tabId !== -1) {
			// Send an extension message to broadcast video signatures ...
			chrome.tabs.sendMessage(details.tabId, {
				// ... with the local availability status ...
				localAvailable: localAvailable,
				// ... with the query string ...
				qs: qs,
				// ... with the tab identifier ...
				tabId: details.tabId
			});
		}
		// Return null.
		return null;
	}

	// Called when an error has occurred.
	function onErrorOccurred(details) {
		// Check if the request has been added.
		if (requests.hasOwnProperty(details.requestId)) {
			// Delete the request.
			delete requests[details.requestId];
		}
	}

	// Called when headers are received.
	function onHeadersReceivedListener(details) {
		// Check if the request has been added.
		if (requests.hasOwnProperty(details.requestId)) {
			// Initialzie the iterator.
			var i,
				// Initialize the name.
				name;
			// Iterate through each response header.
			for (i = 0; i < details.responseHeaders.length; i += 1) {
				// Initialize the name.
				name = details.responseHeaders[i].name;
				// Check if this is a location header.
				if (name.toLowerCase() === 'location') {
					// Return null.
					return null;
				}
			}
			// Initialize the name.
			name = encodeRFC5987(requests[details.requestId] + '.mp4');
			// Push the response header ...
			details.responseHeaders.push({
				// ... with the name ...
				name: 'Content-Disposition',
				// .. and the value.
				value: 'attachment; filename*=UTF-8\'\'' + name
			});
			// Delete the request.
			delete requests[details.requestId];
			// Return the modified response headers.
			return {responseHeaders: details.responseHeaders};
		}
		// Return null.
		return null;
	}

	// ==================================================
	//        E V E N T   R E G I S T R A T I O N
	// ==================================================

	// Add a listener to the before request sent event ...
	chrome.webRequest.onBeforeRequest.addListener(
		// ... using the event listener ...
		onBeforeRequest,
		// ... on the appropriate address ...
		{urls: ['*://*.googlevideo.com/*', '*://*.youtube.com/*']},
		// ... using blocking.
		['blocking']
	);

	// Add a listener to the error event ...
	chrome.webRequest.onErrorOccurred.addListener(
		// ... using the event listener ...
		onErrorOccurred,
		// ... on the appropriate address.
		{urls: ['*://*.googlevideo.com/*', '*://*.youtube.com/*']}
	);

	// Add a listener to the received headers event ...
	chrome.webRequest.onHeadersReceived.addListener(
		// ... using the event listener ...
		onHeadersReceivedListener,
		// ... on the appropriate address ...
		{urls: ['*://*.googlevideo.com/*', '*://*.youtube.com/*']},
		// ... using blocking and optional response header modification.
		['blocking', 'responseHeaders']
	);

	// ==================================================
	//                 U T I L I T I E S
	// ==================================================

	// Encode RFC5987 value characters.
	encodeRFC5987 = function (value) {
		// Encode the URI component ...
		return encodeURIComponent(value)
			// ... escape special characters ...
			.replace(/['()]/g, escape)
			// ... escape an asterisk.
			.replace(/\*/g, '%2A');
	};

	// Parse the query string.
	parseQueryString = function (queryString) {
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
}());