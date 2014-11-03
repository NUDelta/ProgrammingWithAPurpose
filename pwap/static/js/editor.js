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
        }, 500),
        img = $('#mock img');

    htmlEditor.getSession().setMode('ace/mode/html');
    cssEditor.getSession().setMode('ace/mode/css');

    img.load(function() {
        $('#iframe').width(img.width());
        $('#iframe').height(img.height());
    }).attr('src', img.data('src'));

    $('#htmlEditor').add('#cssEditor').on('keyup', update);

    $('#submit').on('click', function() {
        $.post('/save/codesnippet', {
            elementID: 1,
            html: htmlEditor.getValue(),
            css: cssEditor.getValue()
        }, function(res) {
            window.alert(res);
        });
    });
};
