/* global PWAP */
'use strict';

module.exports = function() {
    var ace = require('brace'),
        logger = require('./logger'),
        cssEditor = ace.edit('cssEditor'),
        width = 200,
        height = 200,
        $goal = $('#goal'),
        goalCtx = $goal[0].getContext('2d'),
        $img = $('#mock'),
        $preview = $('#mockCanvas'),
        $color = $('#color'),
        previewCtx = $preview[0].getContext('2d'),
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

            logger('editBSElement-edit', 'userID: ' + localStorage.PWAPSession + '; code (in progress): ' + cssEditor.getValue())

            $.get('http://ec2-54-172-221-13.compute-1.amazonaws.com:3000/preview?opts=' +
                encodeURIComponent(JSON.stringify({
                    css: cssEditor.getValue() + 'body { background-color: #F8F8FF; }',
                    html: PWAP.html,
                    width: width,
                    height: height
                })),
                function(res) {
                    var tmp = new Image();
                    tmp.onload = function() {
                        previewCtx.clearRect(0, 0, width, height);
                        previewCtx.drawImage(tmp, 0, 0);
                    };
                    tmp.src = res;
                });
        }, 1000, { leading: true, trailing: true });

    require('brace/mode/css');
    $('#html').text(PWAP.html);

    cssEditor.getSession().setMode('ace/mode/css');
    cssEditor.getSession().on('change', update);
    cssEditor.getSession().setValue(PWAP.class + ' {\n\t\n}');

    $img.load(function() {
        var yPos = 0;

        goalCtx.scale(0.5, 0.5);
        _.forEach(_.filter(PWAP.state, { 'class': PWAP.class }), function(item) {
            var r = PWAP.rects[item.rectID];

            goalCtx.drawImage($img[0], r[0], r[1], r[2], r[3], 0, yPos, r[2], r[3]);

            yPos += r[3];
        });
    }).attr('src', $img.data('src'));

    $goal.on('click', function(e) {
        var offset = $goal.offset(),
            dat = goalCtx.getImageData(e.pageX - offset.left - 2, e.pageY - offset.top - 2, 1, 1).data,
            col = rgbToHex(dat);
        $color.css('color', col).html('&nbsp;' + col + '&nbsp;');

        if (dat[0] + dat[1] + dat[2] > 255) {
            $color.css('background-color', 'black');
        } else {
            $color.css('background-color', 'white');
        }
    });

    $('#submit').on('click', function() {
        logger('editBSElement-submit', 'userID: ' + localStorage.PWAPSession + '; code: ' + cssEditor.getValue());
    });

    // temporary code for logging
    if (!localStorage.PWAPSession) {
        localStorage.PWAPSession = Math.random().toString(36).substring(7);
    }
    logger('editBSElement', 'userID: ' + localStorage.PWAPSession + '; loaded page');

    update();
};