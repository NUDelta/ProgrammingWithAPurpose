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
		updateDisplay = function() {
			// fade out display if needed.
			if (typeof(currentTask) !== 'undefined') {

			}
			console.log('hi');

			if (hash === '') {
				intro.modal('show');
			} else if (integer.test(hash) && $('[data-task="' + hash + '"]').length > 0) {
				intro.modal('hide');

				currentTask = JSON.parse($('[data-task="' + hash + '"]').text());
				currentTask.hints = JSON.parse(currentTask.hints);
				console.log(currentTask);

				rasterize('<style>* {font-size: 16pt;}' + currentTask.answer + '</style>' + currentTask.HTML, goal[0]);
				window.r = rasterize;
				window.g = goal[0];
				html.text(currentTask.HTML);

			} else {
				console.log('shucks');
			}
		},
		updateCSS = function() {
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
        };

	require('brace/mode/css');
	cssEditor.getSession().setMode('ace/mode/css');

	cssEditor.getSession().on('change', updateCSS);

	$(document).on('hashchange', updateDisplay);

	updateDisplay();
};
