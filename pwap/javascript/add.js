'use strict';

module.exports = function() {
	var ctx1, ctx2, update,
		rasterize = require('rasterizehtml').drawHTML,
		intro = $('#intro');

	// detect if we're doing a module or task:
	if (intro.length > 0) {
		update = _.throttle(function() {
			$('#intro-preview').html(intro.val());
		}, 300);

		intro.on('focusin', function() {
			$('body').on('keyup', update);
		}).on('focusout', function() {
			$('body').off('keyup');
		});
	} else {
		ctx1 = $('#preview')[0].getContext('2d');
		ctx2 = $('#preview-answer')[0].getContext('2d');

		update = _.throttle(function() {
			rasterize('<style>*{font-size:16pt;}' + $('#starterCSS').val() + '</style>' +
				$('#HTML').val()).then(function(c) {
				ctx1.clearRect(0, 0, 600, 400);
				ctx1.drawImage(c.image, 0, 0);
			});

			rasterize('<style>*{font-size:16pt;}' + $('#starterCSS').val() + $('#answer').val() + '</style>' +
				$('#HTML').val()).then(function(c) {
				ctx2.clearRect(0, 0, 600, 400);
				ctx2.drawImage(c.image, 0, 0);
			});

		}, 300);

		$('#HTML').add('#starterCSS').add('#answer').on('focusin', function() {
			$('body').on('keyup', update);
		}).on('focusout', function() {
			$('body').off('keyup');
		});
	}
};