'use strict';

module.exports = function() {
	var ace = require('brace'),
		rasterize = require('rasterizehtml').drawHTML,
		checkCSS = require('./checkAnswer').checkAnswer,
		logger = require('./logger'),
		currentTask,
		integer = /^\d+$/,
		cssEditor = ace.edit('cssEditor'),
		hash = location.hash.slice(1),
		intro = $('#intro'),
		preview = $('#tab-preview canvas'),
		goal = $('#tab-goal canvas'),
		html = $('#tab-src-html pre'),
		taskNumber = $('#task-number'),
		taskDescription = $('#task-description'),
		status = $('#status'),
		hintsRemaining = $('#hints-remaining'),
		hints = $('#hints'),
		checkAnswerBtn = $('#check-answer'),
		nextTaskBtn = $('#next-task'),
		previewCtx = preview[0].getContext('2d'),
		goalCtx = goal[0].getContext('2d'),
		render = function(css, ctx) {
			rasterize('<style>* {font-size: 16pt;}' + currentTask.starterCSS + css + '</style>' +
				currentTask.HTML).then(function(c) {
					ctx.clearRect(0, 0, 1000, 1000);
					ctx.drawImage(c.image, 0, 0);
				});
		},
		updateDisplay = function() {
			if (typeof(currentTask) !== 'undefined') {
				hints.empty();
			}

			if (hash === '') {
				intro.modal({
					backdrop: false,
					keyboard: false,
					show: true
				});
			} else if (integer.test(hash) && $('[data-task="' + hash + '"]').length > 0) {
				intro.modal('hide');

				currentTask = JSON.parse($('[data-task="' + hash + '"]').text());
				currentTask.hints = JSON.parse(currentTask.hints);
				hintsRemaining.text(currentTask.hints.length + 1);
				taskNumber.text(hash);
				taskDescription.text(currentTask.taskDescription);
				html.text(currentTask.HTML);
				nextTaskBtn.attr('href', '#' + (parseInt(hash, 10) + 1)).hide();
				checkAnswerBtn.show();
				currentTask.startTime = new Date();

				render(currentTask.answer, goalCtx);
				render('', previewCtx);

				cssEditor.setReadOnly(false);
				cssEditor.setValue('');
			} else {
				// we must be out of tasks I guess...
				logger('redirecting to learner home');
				location.href = '/learner/home';
			}
		},
		updateCSS = _.throttle(function() {
			var hasError = false,
				userCSS = cssEditor.getValue(),
				annotationLists = cssEditor.getSession().getAnnotations();

			status.hide();

			_.each(annotationLists, function(annotation) {
				if (annotation.type === 'error') {
					hasError = true;
				}
			});

			if (!hasError) {
				render(userCSS, previewCtx);
			}
		}, 500),
		getHint = function() {
			var remaining = parseInt(hintsRemaining.text(), 10),
				numHints = currentTask.hints.length;

			logger('get hint', 'hint #: ' + (numHints + 2 - remaining));
			hintsRemaining.text(remaining - 1);

			if (remaining - 1 === 0) {
				$('<pre/>').text(currentTask.answer).appendTo(hints);
				$(this).off('click').addClass('disabled');
			} else {
				$('<p/>').html(currentTask.hints[numHints - remaining + 1]).appendTo(hints);
			}
		},
		setStatus = function(statusClass, message) {
			status.removeClass('alert-success alert-warning alert-danger alert-info')
				.addClass('alert-' + statusClass).show()
				.find('span').text(message);
		},
		checkAnswer = function() {
			var currentTime,
				hasError = false,
				userCSS = cssEditor.getValue(),
				annotationLists = cssEditor.getSession().getAnnotations();

			logger('click check answer');

			if (userCSS.length === 0) {
				setStatus('info', 'Empty');
				logger('answer empty');
				return;
			}

			_.each(annotationLists, function(annotation) {
				if (annotation.type === 'error') {
					hasError = true;
				}
			});

			if (hasError) {
				setStatus('warning', 'Syntax error.');
				logger('answer has syntax error');
				return;
			}

			if (checkCSS(userCSS, currentTask.answer)) {
				cssEditor.setReadOnly(true);
				setStatus('success', 'Correct!');
				checkAnswerBtn.hide();
				nextTaskBtn.show();
				currentTime = new Date();
				$.post(
					'/learner/task/' + currentTask.id,
					{ time: currentTime - currentTask.startTime },
					function(res) {
						if (res.status == 'success') {
							if (res.tasks.length === 0) {
								location.href = '/learner/home';
							} else {
								nextTaskBtn.attr('href', '#' + res.tasks[0]);
							}
						}
						console.log('response: ', res);
					}
				);
				logger('correct answer', 'CSS: ' + userCSS);
			} else {
				setStatus('danger', 'Answer incorrect.');
				logger('incorrect answer', 'CSS: ' + userCSS);
			}
		};

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

	$('#show-intro-btn').on('click', function() {
		logger('click show intro');
		intro.find('[data-dismiss="modal"]').show().siblings().hide();
		intro.modal('show');
	});

	$('#get-hint').on('click', getHint);

	$('a[href="#tab-preview"]').on('click', function() { logger('click preview tab'); });
	$('a[href="#tab-goal"]').on('click', function() { logger('click goal tab'); });
	$('a[href="#tab-src-html"]').on('click', function() { logger('click src tab'); });
	$('a[href="#tab-hints"]').on('click', function() { logger('click hints tab'); });

	checkAnswerBtn.on('click', checkAnswer);

	updateDisplay();
};
