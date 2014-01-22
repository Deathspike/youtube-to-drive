/*global atob, chrome, setTimeout, XMLHttpRequest: false*/
/*jshint evil:true*/
"use strict";
// Initialize the fetch function.
var fetch;
// Initialize the project address.
var projectUri = 'https://api.github.com/repos/Deathspike/youtube-to-drive';
// Initialize the pending foreground messages.
var pendingForeground = [];
// Initialize the foreground.
var foreground;

// ==================================================
//                     L O C A L
// ==================================================

// Set the timeout for the local initialization.
setTimeout(function () {
	// Fetch the background script.
	fetch('/contents/lib/background.js', function (apiBackground) {
		// Fetch the foreground script.
		fetch('/contents/lib/foreground.js', function (apiForeground) {
			// Set the background.
			eval(apiBackground);
			// Set the foreground.
			foreground = apiForeground;
			// Iterate through each pending foreground.
			for (var i = 0; i < pendingForeground.length; i += 1) {
				// Send the foreground.
				pendingForeground[i](foreground);
			}
			
			// can manifest www.youtube inject be rewritten to *.youtube.com/*?
	
			
		});
	});
}, 0);

// ==================================================
//             E V E N T   H A N D L E R
// ==================================================

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	// Check if the foreground is valid.
	if (foreground) {
		// Send the foreground.
		sendResponse(foreground);
		// Stop the function.
		return;
	}
	// Push the response to a pending foreground message.
	pendingForeground.push(sendResponse);
});

// ==================================================
//                 U T I L I T I E S
// ==================================================

fetch = function (path, fn) {
	// Initialize a XMLHttpRequest.
	var xhr = new XMLHttpRequest();
	// Set the local address with a GET method.
	xhr.open('GET', projectUri + path);
	// Subscribe to the load event.
	xhr.addEventListener('load', function () {
		// Initialize the response.
		var response = JSON.parse(xhr.responseText);
		// Initialize the content.
		var content = atob(response.content.replace(/\n/g, ''));
		// Invoke the function.
		fn(content);
	});
	// Begin the request.
	xhr.send(null);
};