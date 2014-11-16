'use strict';

module.exports = function() {
    var _ = require('lodash'),
        ace = require('brace'),
        resemble = require('resemblejs').resemble;

    require('brace/mode/html');
    require('brace/mode/css');

    var htmlEditor = ace.edit('htmlEditor'),
        cssEditor = ace.edit('cssEditor'),
        preview = $('#preview'),
        diff = $('#diff'),
        componentToHex = function(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? '0' + hex : hex;
        },
        rgbToHex = function(dat) {
            return '#' + componentToHex(dat[0]) + componentToHex(dat[1]) + componentToHex(dat[2]);
        },
        update = _.throttle(function() {
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
        }, 2000, { leading: true, trailing: true }),
        img = $('#mock'),
        origin = { x: img.data('xorigin'), y: img.data('yorigin') },
        width = img.data('width'),
        height = img.data('height'),
        design = img.data('design'),
        canvas = $('#mycanvas'),
        color = $('#color'),
        ctx = canvas[0].getContext('2d');

    img.load(function() {
        ctx.drawImage(img[0], -origin.x, -origin.y);
    }).attr('src', img.data('src'));

    canvas.on('click', function(e) {
        var offset = canvas.offset(),
            dat = ctx.getImageData(e.pageX - offset.left - 2, e.pageY - offset.top - 2, 1, 1).data,
            col = rgbToHex(dat);
        color.css('color', col).html('&nbsp;' + col + '&nbsp;');

        if (dat[0] + dat[1] + dat[2] > 255) {
            color.css('background-color', 'black');
        } else {
            color.css('background-color', 'white');
        }
    });

    htmlEditor.getSession().setMode('ace/mode/html');
    htmlEditor.getSession().on('change', update);
    cssEditor.getSession().setMode('ace/mode/css');
    cssEditor.getSession().on('change', update);

    $('#submit').on('click', function() {
        $.post('/save/codesnippet', {
            elementID: 1,
            html: htmlEditor.getValue(),
            css: cssEditor.getValue()
        }, function(res) {
            window.alert(res);
            window.location.href = '/';
        });
    });
};
