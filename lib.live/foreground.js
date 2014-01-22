/*global chrome: true*/
/*jshint evil:true*/
"use strict";

// ==================================================
//             E V E N T   H A N D L E R
// ==================================================

// Send a message to the background.
chrome.runtime.sendMessage({foreground: 1}, function (foreground) {
	// Evaluate the foreground script.
	eval(foreground);
});