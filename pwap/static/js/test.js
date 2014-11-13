'use strict';

var i,
	cropDesign,
	capture,
	sendResponse,
	fs = require('fs'),
	async = require('async'),
	tmp = require('tmp'),
	phantom = require('phantom'),
	gm = require('gm'),
	opts = JSON.parse(process.argv[2]),
	requiredOpts = ['css', 'html', 'design', 'xorigin', 'yorigin', 'width', 'height'];

tmp.setGracefulCleanup();

// Checking for all properties
for(i = 0; i < requiredOpts.length; i++) {
	if (!opts.hasOwnProperty(requiredOpts[i])) {
		throw 'Missing property: ' + requiredOpts[i];
	}
}

cropDesign = function(opts, path, cb) {
	gm('./pwap/static/uploads/designs/design_' + opts.design + '.png')
		.crop(opts.width, opts.height, opts.xorigin, opts.yorigin)
		.write(path, cb);
};

capture = function(opts, path, cb) {
	phantom.create(function(ph) {
		ph.createPage(function(page) {
			page.set('viewportSize', { width: opts.width, height: opts.height });
			page.open('http://localhost:5000/preview?css=' + encodeURIComponent(opts.css) +
				'&html=' + encodeURIComponent(opts.html), function() {
				page.render(path, function() {
					cb(null);
				});
				ph.exit();
			});
		});
	});
};

sendResponse = function(diffPaths, equality) {
	async.map(diffPaths, fs.readFile, function(err, data) {
		if (err) { throw err; }

		data[0] = new Buffer(data[0]).toString('base64');
		data[1] = new Buffer(data[1]).toString('base64');

		console.log(JSON.stringify({
			equality: equality,
			preview: 'data:image/png;base64,' + data[0],
			difference: 'data:image/png;base64,' + data[1]
		}));

		process.exit();
	});
};

async.times(
	3,
	function(n, cb) {
		tmp.tmpName({ postfix: '.png' }, cb);
	},
	function(err, paths) {
		if (err) { throw err; }

		async.parallel([
				function(cb) {
					cropDesign(opts, paths[0], cb);
				},
				function(cb) {
					capture(opts, paths[1], cb);
				}
			],
			function(err) {
				if (err) { throw err; }

				gm.compare(paths[0], paths[1], { file: paths[2] }, function(err, isEqual, equality) {
					if (err) { throw err; }

					sendResponse([paths[1], paths[2]], equality);
				});
			}
		);
	}
);