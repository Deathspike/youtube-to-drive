// Initialize the address.
var localAddress = 'http://localhost:7974/';
// Initialize the enabled state.
var localEnabled = false;
// Initialize the requests.
var requests = [];

// ==================================================
//                     L O C A L
// ==================================================

// Check if the local server is running.
$.getJSON(localAddress + 'ping', function(data) {
	// Set the local server as enabled.
	localEnabled = true;
});

// ==================================================
//             E V E N T   H A N D L E R
// ==================================================

// Called when a request is about to be sent.
function onBeforeRequest(details) {
	// Parse the query string.
	var qs = parseQueryString(details.url);
	// Check if the query string contains the download.
	if (qs.dl) {
		// Initialize the address.
		var address = details.url.split('&dl=' + encodeURIComponent(qs.dl)).shift();
		// Check if music conversion has been enabled.
		if ('mc' in qs) {
			// Return the modified address.
			return {redirectUrl: localAddress + encodeURIComponent(qs.dl) + '/' + encodeURIComponent(address.split('&mc').shift())};
		}
		// Otherwise retrieve the video.
		else {
			// Store the request identifier and file name.
			requests[details.requestId] = qs.dl;
			// Return the modified address.
			return {redirectUrl: address};
		}
	}
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
		// Push the response header ...
		details.responseHeaders.push({
			// ... with the name ...
			name: 'Content-Disposition',
			// .. and the value.
			value: 'attachment; filename*=UTF-8\'\'' + encodeURIComponent(requests[details.requestId] + '.mp4')
		});
		// Delete the request.
		delete requests[details.requestId];
		// Return the modified response headers.
		return {responseHeaders: details.responseHeaders};
	}
}

// Called when a message is received.
function onMessage(request, sender, sendResponse) {
	// Send the local enabled state.
	sendResponse({localEnabled: localEnabled});
}

// ==================================================
//        E V E N T   R E G I S T R A T I O N
// ==================================================

// Add a listener to extension message received event ...
chrome.extension.onMessage.addListener(
	// ... using the event listener.
	onMessage
);

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

// Parse the query string.
function parseQueryString(queryString) {
	// Initialize the values.
    var values = queryString.split('&');
    // Initialize the pairs.
    var pairs = {};
    // Iterate through the values.
    for (var i = 0; i < values.length; i++) {
    	// Retrieve the pair.
        var pair = values[i].split('=');
       	// Add the key and value to the pairs.
       	pairs[decodeURIComponent(pair[0])] = pair.length == 2 ? decodeURIComponent(pair[1]) : null;
	}
	// Return the pairs.
	return pairs;
}