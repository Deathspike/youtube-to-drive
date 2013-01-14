// Initialize the requests.
var requests = [];

// Called when a request is about to be sent.
function onBeforeRequest(details) {
	// Parse the query string.
	var qs = parseQueryString(details.url);
	// Check if the query string contains the download.
	if (qs.dl) {
		// Store the request identifier and file name.
		requests[details.requestId] = qs.dl;
		// Return the modified address.
		return {redirectUrl: details.url.split('&dl=' + encodeURIComponent(qs.dl)).shift()};
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
        // Check if the pair is valid.
        if (pair.length == 2) {
        	// Add the key and value to the pairs.
        	pairs[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
	}
	// Return the pairs.
	return pairs;
}

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