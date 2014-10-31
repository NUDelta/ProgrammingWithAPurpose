'use strict';
window.jQuery = require('jquery');

var $ = window.jQuery,
    _ = require('lodash'),
    ace = require('brace');

require('bootstrap');
require('brace/mode/html');
require('brace/mode/css');

module.exports = function() {
    var htmlEditor = ace.edit('htmlEditor'),
        cssEditor = ace.edit('cssEditor'),
        update = _.throttle(function() {
            $('#iframe').attr('src', '/preview?css=' + encodeURIComponent(cssEditor.getValue()) +
                '&html=' + encodeURIComponent(htmlEditor.getValue()));
        });
    
    htmlEditor.getSession().setMode('ace/mode/html');
    cssEditor.getSession().setMode('ace/mode/css');

    $('#htmlEditor').add('#cssEditor').on('keyup', update);
};