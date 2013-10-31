/*global chrome, document, XMLHttpRequest: false */
"use strict";
// Initialize the encodeRFC5987 function.
var encodeRFC5987;
// Initialize the address.
var localAddress = 'http://localhost:7974/';
// Initialize the local server availability status.
var localAvailable = false;
// Initialize the parseQueryString function.
var parseQueryString;
// Initialize the requests.
var requests = [];

// ==================================================
//                     L O C A L
// ==================================================

// Initialize a XMLHttpRequest.
var xhr = new XMLHttpRequest();
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
	// Parse the query string.
	var qs = parseQueryString(details.url);
	// Check if the query string contains the download.
	if (qs.dl) {
		// Initialize the download component.
		var dl = encodeRFC5987(qs.dl);
		// Initialize the address.
		var address = details.url.split('&dl=' + dl).shift();
		// Check if music conversion has been enabled.
		if ('mc' in qs) {
			// Return the modified address.
			return {redirectUrl: localAddress + dl + '/' + address};
		}
		// Otherwise store the video.
		else {
			// Store the request identifier and file name.
			requests[details.requestId] = qs.dl;
			// Return the modified address.
			return {redirectUrl: address};
		}
	}
	// Otherwise this is a regular request.
	else if (details.tabId !== -1) {
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
	if (details.requestId in requests) {
		// Delete the request.
		delete requests[details.requestId];
	}
}

// Called when headers are received.
function onHeadersReceivedListener(details) {
	// Check if the request has been added.
	if (details.requestId in requests) {
		// Iterate through each response header.
		for (var i = 0; i < details.responseHeaders.length; i += 1) {
			// Check if this is a location header.
			if (details.responseHeaders[i].name.toLowerCase() === 'location') {
				// Return null.
				return null;
			}
		}
		// Add the content disposition.
		if (true) {
			// Initialize the name.
			var name = encodeRFC5987(requests[details.requestId] + '.mp4');
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
	{urls: ["http://*.youtube.com/*"]},
	// ... using blocking.
	['blocking']
);

// Add a listener to the error event ...
chrome.webRequest.onErrorOccurred.addListener(
	// ... using the event listener ...
	onErrorOccurred,
	// ... on the appropriate address.
	{urls: ["http://*.youtube.com/*"]}
);

// Add a listener to the received headers event ...
chrome.webRequest.onHeadersReceived.addListener(
	// ... using the event listener ...
	onHeadersReceivedListener,
	// ... on the appropriate address ...
	{urls: ["http://*.youtube.com/*"]},
	// ... using blocking and optional response header modification.
	['blocking', 'responseHeaders']
);

// ==================================================
//                 U T I L I T I E S
// ==================================================

// Encode RFC5987 value characters.
encodeRFC5987 = function (str) {
	// Encode the URI component ...
	return encodeURIComponent(str)
		// ... escape special characters ...
		.replace(/['()]/g, escape)
		// ... escape an asterisk.
		.replace(/\*/g, '%2A');
};

// Parse the query string.
parseQueryString = function (queryString) {
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
};
