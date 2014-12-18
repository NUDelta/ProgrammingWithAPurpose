'use strict';

module.exports = function() {
    var logger = require('./logger');

    $('a').on('click', function() {
        logger('Button clicked: ' + $(this).text());
    });
};