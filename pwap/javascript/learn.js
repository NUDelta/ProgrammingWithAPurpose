'use strict';

module.exports = function() {
	var ace = require('brace'),
		_ = require('lodash'),
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
		clearCanvas = function(canvas) {
			canvas[0].getContext('2d').clearRect(0, 0, canvas.width(), canvas.height());
		},
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

				rasterize('<style>* {font-size: 16pt;}' + currentTask.answer + '</style>' + currentTask.HTML, goal[0]);
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

            clearCanvas(preview);
            rasterize('<style>* {font-size: 16pt;}' + cssEditor.getValue() + '</style>' + currentTask.HTML, preview[0]);
        }, 500);

	require('brace/mode/css');
	cssEditor.getSession().setMode('ace/mode/css');

	cssEditor.getSession().on('change', updateCSS);

	$('body a').on('click', function(e) {
		var href = $(e.target).attr('href');
		if (href[0] == '#') {
			hash = href.slice(1);
			updateDisplay();
		}
	});

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
