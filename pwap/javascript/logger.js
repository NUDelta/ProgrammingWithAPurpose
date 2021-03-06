'use strict';

var queue = [],
	submitLogs = function() {
		var queueLength = queue.length;

		if (queueLength > 0) {
			$.post('/learner/log', {
				logs: JSON.stringify(queue)
			}, function(res) {
				if (res.status == 'success') {
					queue = queue.slice(queueLength);
				}
			});
		}
	},
	throttleSubmitLogs = _.throttle(submitLogs, 5000, { leading: false, trailing: true }),
	log = function(type, content) {
		if (typeof(content) === 'undefined') {
			content = '';
		}

		queue.push({
			'timestamp': new Date().getTime(),
			'log_type': type,
			'content': content + '; URL: ' + location.href
		});

		throttleSubmitLogs();
	};

$(window).on('beforeunload', submitLogs);

module.exports = log;