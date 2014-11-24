'use strict';

var fs = require('fs'),
	app = require('express')(),
	phantom = require('phantom'),
	requiredOpts = ['css', 'html', 'width', 'height'];

fs.writeFile("/tmp/node.pid", process.pid);

phantom.create(function(ph) {
	ph.createPage(function(page) {
		app.get('/preview', function(req, res) {
			var i,
				opts = JSON.parse(req.query.opts);

			// Checking for all properties
			for (i = 0; i < requiredOpts.length; i++) {
				if (!opts.hasOwnProperty(requiredOpts[i])) {
					throw 'Missing property: ' + requiredOpts[i];
				}
			}

			page.set('viewportSize', { width: opts.width, height: opts.height });
			page.open('http://localhost:5000/preview?css=' + encodeURIComponent(opts.css) +
				'&html=' + encodeURIComponent(opts.html), function() {
				page.renderBase64('PNG', function(img) {
					res.set('Access-Control-Allow-Origin', '*');
					res.send('data:image/png;base64,' + img);
				});
			});
		});

		app.listen(3000);
	});
});
