'use strict';

module.exports = function() {
    var _ = require('lodash'),
    ace = require('brace');

    require('bootstrap');
    require('brace/mode/html');
    require('brace/mode/css');

    var htmlEditor = ace.edit('htmlEditor'),
        cssEditor = ace.edit('cssEditor'),
        update = _.throttle(function() {
            $('#iframe').attr('src', '/preview?css=' + encodeURIComponent(cssEditor.getValue()) +
                '&html=' + encodeURIComponent(htmlEditor.getValue()));
        }, 500),
        img = $('#mock img'),
        origin = { x: img.data('xorigin'), y: img.data('yorigin') },
        width = img.data('width'),
        height = img.data('height'),
        design = img.data('design'),
        canvas = $('#mycanvas'),
        ctx = canvas[0].getContext('2d');

    htmlEditor.getSession().setMode('ace/mode/html');
    cssEditor.getSession().setMode('ace/mode/css');
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    img.load(function() {
        ctx.drawImage(img[0], -origin.x, -origin.y);
    }).attr('src', img.data('src'));

    canvas.on('click', function(e) {
        var offset = canvas.offset(),
            dat = ctx.getImageData(e.pageX - offset.left, e.pageY - offset.top, 1, 1).data;
        $('body').css('background-color', 'rgba(' + Array.prototype.join.call(dat) + ')');
    });

    $('#htmlEditor').add('#cssEditor').on('keyup', update);

    $('#getDiff').on('click', function() {
        $.post('/evaluate', {
            opts: JSON.stringify({
                href: 'localhost:5000' + '/preview?css=' + encodeURIComponent(cssEditor.getValue()) +
                    '&html=' + encodeURIComponent(htmlEditor.getValue()),
                width: width,
                height: height,
                xorigin: origin.x,
                yorigin: origin.y,
                design: design
            })
        }, function(res) {
            $('#diff').attr('src', res.difference);
            window.alert('Percent: ' + (res.equality * 100).toFixed(2) + '%');
        },
        'json');
    });

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
