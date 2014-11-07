/* jshint node:true */
'use strict';

module.exports = function() {
	var less = require('less'),
		finalCSS = '',
		cssSnippets = $('script[data-id]'),
		count = cssSnippets.length,
		done = 0,
		lessCallback = function(err, css) {
			if (err) {
				console.log(err);
			}

			finalCSS += css;

			done++;
			if (done == count) {
				$('#compiledStyles').text(finalCSS);
			}
		};

	cssSnippets.each(function() {
		var self = $(this);
		less.render('#' + self.data('id') + ' { ' + self.text() + ' }', lessCallback);
	});
};