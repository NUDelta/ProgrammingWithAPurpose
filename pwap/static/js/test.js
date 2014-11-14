'use strict';

var i,
	phantom = require('phantom'),
	opts = JSON.parse(process.argv[2]),
	requiredOpts = ['css', 'html', 'design', 'xorigin', 'yorigin', 'width', 'height'];

// Checking for all properties
for(i = 0; i < requiredOpts.length; i++) {
	if (!opts.hasOwnProperty(requiredOpts[i])) {
		throw 'Missing property: ' + requiredOpts[i];
	}
}

phantom.create(function(ph) {
	ph.createPage(function(page) {
		page.set('viewportSize', { width: opts.width, height: opts.height });
		page.open('http://localhost:5000/preview?css=' + encodeURIComponent(opts.css) +
			'&html=' + encodeURIComponent(opts.html), function() {
			page.renderBase64('PNG', function(res) {
				console.log('data:image/png;base64,' + res);
				ph.exit();
				process.exit();
			});
		});
	});
});