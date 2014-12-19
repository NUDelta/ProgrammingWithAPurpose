'use strict';

module.exports = function() {
    var interval,
        ace = require('brace'),
        resemble = require('resemblejs').resemble,
        introJS = require('intro.js').introJs(),
        htmlEditor = ace.edit('htmlEditor'),
        cssEditor = ace.edit('cssEditor'),
        preview = $('#preview'),
        previewCtx = preview[0].getContext('2d'),
        previewVisible = true,
        previewBtn = $('#previewbtn'),
        goalBtn = $('#goalbtn'),
        startingDiff = null,
        //diff = $('#diff'),
        toggleView = function() {
            if ($('#fade').is(':checked')) {
                preview.fadeToggle(200, function() {

                });
            } else {
                preview.toggle();
            }

            if (previewVisible) {
                goalBtn.parent().addClass('active').siblings().removeClass('active');
            } else {
                previewBtn.parent().addClass('active').siblings().removeClass('active');
            }

            previewVisible = !previewVisible;
            return false;
        },
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

            $.get('http://ec2-54-172-221-13.compute-1.amazonaws.com:3000/preview?opts=' +
                encodeURIComponent(JSON.stringify({
                    css: cssEditor.getValue() + 'body { background-color: #F8F8FF; }',
                    html: htmlEditor.getValue(),
                    width: width,
                    height: height
                })),
                function(res) {
                    var tmp = new Image();
                    tmp.onload = function() {
                        previewCtx.clearRect(0, 0, width, height);
                        previewCtx.drawImage(tmp, 0, 0);

                        resemble(canvas[0].toDataURL())
                            .compareTo(preview[0].toDataURL())
                            .ignoreAntialiasing()
                            .onComplete(function(data) {
                            if (startingDiff === null) {
                                startingDiff = 100 - data.misMatchPercentage;
                            }
                            var current = 100 * (100 - data.misMatchPercentage - startingDiff) / (100 - startingDiff);
                            $('#diffPercent').text(current.toFixed(2));
                            //diff.attr('src', data.getImageDataUrl());
                        });
                    };
                    tmp.src = res;
                });
        }, 1000, { leading: true, trailing: true }),
        img = $('#mock'),
        element = img.data('element'),
        origin = { x: img.data('xorigin'), y: img.data('yorigin') },
        width = img.data('width'),
        height = img.data('height'),
        //design = img.data('design'),
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

    require('brace/mode/html');
    require('brace/mode/css');

    htmlEditor.getSession().setMode('ace/mode/html');
    htmlEditor.getSession().on('change', update);
    cssEditor.getSession().setMode('ace/mode/css');
    cssEditor.getSession().on('change', update);

    $('#togglespeed').on('change', function() {
        var speed = parseInt($(this).val(), 10);

        clearInterval(interval);
        if (speed !== 0) {
            interval = setInterval(toggleView, speed);
        }
    }).val('1000').trigger('change');

    $('#view').on('click', toggleView);

    $('#submit').on('click', function() {
        $.post('/save/codesnippet', {
            elementID: element,
            html: htmlEditor.getValue(),
            css: cssEditor.getValue()
        }, function(res) {
            window.alert(res);
            window.location.href = '/';
        });
    });

    window.addEventListener('beforeunload', function(e) {
        e.returnValue = 'You sure?';
        return 'You sure?';
    });

    if (!localStorage.sawTutE) {
        introJS.start();
        localStorage.sawTutE = '1';
    }

    update();
};
