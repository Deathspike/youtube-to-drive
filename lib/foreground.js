// Define the main function.
function main(imageUrl) {
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

	// Parse the stream map.
	function parseStreamMap(streamMap) {
		// Initialize the streams.
		var streams = streamMap.split(',');
		// Iterate through each stream.
		for (var i = 0; i < streams.length; i++) {
			// Parse the query string.
			streams[i] = parseQueryString(streams[i]);
		}
		// Return the streams.
		return streams;
	}

	// Check if the video is available.
	if (typeof yt !== undefined) {
		// Retrieve the title.
		var title = document.getElementById('watch-headline-title');
		// Check if the title is valid.
		if (title) {
			// Retrieve the arguments.
			var args = yt.playerConfig.args;
			// Retrieve the streams.
			var streams = parseStreamMap(args.url_encoded_fmt_stream_map);
			// Iterate through each stream.
			for (var i = 0; i < streams.length; i++) {
				// Check if the stream is valid.
				if (streams[i].type.match(/^video\/mp4/gi)) {
					// Add the download address.
					title.innerHTML = '<a href="' + streams[i].url + '&signature=' + streams[i].sig + '&dl=' + args.title +'"><img src="' + imageUrl + '" style="vertical-align: middle;"/></a>' + title.innerHTML;
					// Break the iteration.
					break;
				}
			}
		}
	}
}

// Create an element.
var script = document.createElement('script');
// Create the main function.
script.appendChild(document.createTextNode('('+ main +')(\'' + chrome.extension.getURL('icon-24.png') +'\');'));
// Append the element to the document.
(document.body || document.head || document.documentElement).appendChild(script);