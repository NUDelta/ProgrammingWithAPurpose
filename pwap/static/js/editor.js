'use strict';

module.exports = function() {
    var _ = require('lodash'),
        ace = require('brace'),
        resemble = require('resemblejs').resemble;

    require('bootstrap');
    require('brace/mode/html');
    require('brace/mode/css');

    var htmlEditor = ace.edit('htmlEditor'),
        cssEditor = ace.edit('cssEditor'),
        preview = $('#preview'),
        diff = $('#diff'),
        update = _.throttle(function() {
            $.post('/evaluate', {
                opts: JSON.stringify({
                    css: cssEditor.getValue(),
                    html: htmlEditor.getValue(),
                    width: width,
                    height: height,
                    xorigin: origin.x,
                    yorigin: origin.y,
                    design: design
                })
            }, function(res) {
                preview.attr('src', res);
                resemble(canvas[0].toDataURL()).compareTo(res).ignoreAntialiasing().onComplete(function(data) {
                    $('#diffPercent').text(data.misMatchPercentage);
                    diff.attr('src', data.getImageDataUrl());
                });
            });
        }, 3000, { 'trailing': true }),
        img = $('#mock'),
        origin = { x: img.data('xorigin'), y: img.data('yorigin') },
        width = img.data('width'),
        height = img.data('height'),
        design = img.data('design'),
        canvas = $('#mycanvas'),
        ctx = canvas[0].getContext('2d');

    htmlEditor.getSession().setMode('ace/mode/html');
    cssEditor.getSession().setMode('ace/mode/css');

    img.load(function() {
        ctx.drawImage(img[0], -origin.x, -origin.y);
    }).attr('src', img.data('src'));

    canvas.on('click', function(e) {
        var offset = canvas.offset(),
            dat = ctx.getImageData(e.pageX - offset.left, e.pageY - offset.top, 1, 1).data;
        $('body').css('background-color', 'rgba(' + Array.prototype.join.call(dat) + ')');
    });

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
