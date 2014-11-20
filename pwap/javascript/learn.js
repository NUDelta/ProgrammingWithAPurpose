'use strict';

module.exports = function() {
	var ace = require('brace'),
		rasterize = require('rasterizehtml').drawHTML,
		currentTask,
		integer = /^\d+$/,
		cssEditor = ace.edit('cssEditor'),
		hash = location.hash.slice(1),
		intro = $('#intro'),
		preview = $('#tab-preview canvas'),
		goal = $('#tab-goal canvas'),
		html = $('#tab-src-html pre'),
		hintsRemaining = $('#hints-remaining'),
		hints = $('#hints'),
		previewCtx = preview[0].getContext('2d'),
		goalCtx = goal[0].getContext('2d'),
		updateDisplay = function() {
			// fade out display if needed.
			if (typeof(currentTask) !== 'undefined') {
				hints.empty();
			}

			if (hash === '') {
				intro.modal('show');
			} else if (integer.test(hash) && $('[data-task="' + hash + '"]').length > 0) {
				intro.modal('hide');

				currentTask = JSON.parse($('[data-task="' + hash + '"]').text());
				currentTask.hints = JSON.parse(currentTask.hints);
				hintsRemaining.text(currentTask.hints.length);

				rasterize('<style>* {font-size: 16pt;}' + currentTask.starterCSS + currentTask.answer + '</style>' +
					currentTask.HTML).then(function(c) {
						goalCtx.clearRect(0, 0, 1000, 1000);
						goalCtx.drawImage(c.image, 0, 0);
					});
				html.text(currentTask.HTML);
				updateCSS();
			}
		},
		updateCSS = _.throttle(function() {
			var hasError = false,
                annotationLists = cssEditor.getSession().getAnnotations();

            _.each(annotationLists, function(annotation) {
                if (annotation.type === 'error') {
                    hasError = true;
                }
            });

            if (hasError) {
                console.log('had error');
                return;
            }

            rasterize('<style>* {font-size: 16pt;}' + currentTask.starterCSS + cssEditor.getValue() + '</style>' +
				currentTask.HTML).then(function(c) {
					previewCtx.clearRect(0, 0, 1000, 1000);
					previewCtx.drawImage(c.image, 0, 0);
				});
        }, 500);

	require('brace/mode/css');
	cssEditor.getSession().setMode('ace/mode/css');

	cssEditor.getSession().on('change', updateCSS);

	setInterval(function() {
		var currentHash = location.hash.slice(1);

		if (hash !== currentHash) {
			hash = currentHash;
			updateDisplay();
		}
	}, 500);

	$('#get-hint').on('click', function() {
		var remaining = parseInt(hintsRemaining.text(), 10);

		$('<p/>').html(currentTask.hints[currentTask.hints.length - remaining]).appendTo(hints);
		hintsRemaining.text(remaining - 1);

		if (remaining - 1 === 0) {
			$(this).off('click').addClass('disabled');
		}
	});

	updateDisplay();
};
