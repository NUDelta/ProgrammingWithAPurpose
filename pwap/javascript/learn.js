'use strict';

var updateDisplay = function(hash) {
		if (hash === '') {
			$('#intro').modal('show');
		}
	};

module.exports = function() {
	var hash = location.hash;

	updateDisplay(hash);
};
