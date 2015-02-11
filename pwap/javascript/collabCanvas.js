/* globals PWAP */
'use strict';

var Raphael = require('raphael');
require('./raphael.free_transform');

module.exports = function(canvas, img) {
    var tmp, rFocus, _$maskWindow, _activeRect,
        _$img      = $('#' + img),
        _$canvas   = $('#' + canvas),
        _$newElForm = $('#newElementForm'),
        _imgWidth  = _$img.width(),
        _imgHeight = _$img.height(),
        _scale = _imgWidth / _$canvas.width(),
        rPaper     = new Raphael(canvas).setViewBox(0, 0, _imgWidth, _imgHeight)
                            .setSize('100%', '100%'),
        rImg       = rPaper.image(_$img.attr('src'), 0, 0, _imgWidth, _imgHeight),
        updateMode = function(mode) {
            rImg.undrag();
            rFocus.hide();
            _$newElForm.hide();

            switch (mode) {
                case 'draw':
                    rImg.drag(function(dx, dy, x, y) {
                        if (typeof(tmp) != 'undefined') {
                            if (dx >= 0) {
                                tmp.attr('width', dx * _scale);
                            } else {
                                tmp.attr('x', (x - _$canvas.offset().left) * _scale).attr('width', -dx * _scale);
                            }

                            if (dy >= 0) {
                                tmp.attr('height', dy * _scale);
                            } else {
                                tmp.attr('y', (y - _$canvas.offset().top) * _scale).attr('height', -dy * _scale);
                            }
                        }
                    }, function(x, y) {
                        tmp = rPaper.rect(
                            (x - _$canvas.offset().left) * _scale,
                            (y - _$canvas.offset().top) * _scale,
                            0,
                            0
                        );
                    }, function() {
                        if (tmp.attr('width') > 10 && tmp.attr('height') > 10) {
                            _activeRect = tmp;
                            updateMode('edit', tmp.id);
                        } else {
                            tmp.remove();
                        }
                    });
                    break;
                case 'edit':
                    if (typeof(_activeRect) != 'undefined') {
                        rPaper.freeTransform(_activeRect, {
                            keepRatio: false,
                            rotate: false,
                            draw: ['bbox'],
                            scale: ['bboxCorners', 'bboxSides']
                        }, function(ft) {
                            var bb = ft.subject.getBBox();

                            if (ft.subject[0].attributes.transform) {
                                _$maskWindow.attr('transform', ft.subject[0].attributes.transform.value);
                            }

                            _$newElForm.css({
                                top: (bb.y2 + _$canvas.offset().top + 10) + 'px',
                                left: (bb.x2 + _$canvas.offset().left - 400) + 'px'
                            });
                        });

                        var el = $(_activeRect[0]);

                        _$maskWindow.attr({
                            width: el.attr('width'),
                            height: el.attr('height'),
                            x: el.attr('x'),
                            y: el.attr('y')
                        });

                        rFocus.show();
                        _$newElForm.show();
                    }
            }
        };

    $('svg defs').append($.parseHTML('<svg>' +
        '<mask id="maskRect">' +
            '<rect width="100%" height="100%" x="0" y="0" fill="white"></rect>' +
            '<rect id="maskWindow"></rect>' +
        '</mask>' +
    '</svg>')[0].firstChild);

    _$maskWindow = $('#maskWindow');

    rFocus = rPaper.rect(0, 0, '100%', '100%').attr({
        'fill': 'black',
        'fill-opacity': 0.5,
        'stroke-width': 0
    }).hide();

    rFocus[0].setAttribute('mask', 'url(#maskRect)');

    _.forEach(PWAP.rects, function(rect) {
        rPaper.rect(rect[0], rect[1], rect[2], rect[3]);
    });

    $('#newElementCancel').on('click', function() {
        _activeRect.freeTransform.unplug();
        tmp.remove();

        updateMode('draw');
    });

    return {
        updateMode: updateMode
    };
};