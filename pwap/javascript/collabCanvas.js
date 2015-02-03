/* globals PWAP */
'use strict';

var Raphael = require('raphael');
require('./raphael.free_transform');

module.exports = function(canvas, img) {
    var tmp,
        _$img      = $('#' + img),
        _$canvas   = $('#' + canvas),
        _imgWidth  = _$img.width(),
        _imgHeight = _$img.height(),
        _imgAspect = _imgWidth / _imgHeight,
        rPaper     = new Raphael(canvas).setViewBox(0, 0, _$canvas.width(), _$canvas.width() / _imgAspect, true)
                            .setSize('100%', '100%'),
        rImg       = rPaper.image(_$img.attr('src'), 0, 0, _$canvas.width(), _$canvas.width() / _imgAspect),
        _activeRect = null,
        updateMode = function(mode) {
            rImg.undrag();

            switch (mode) {
                case 'draw':
                    rImg.drag(function(dx, dy, x, y) {
                        if (typeof(tmp) != 'undefined') {
                            if (dx >= 0) {
                                tmp.attr('width', dx);
                            } else {
                                tmp.attr('x', x - _$canvas.offset().left).attr('width', -dx);
                            }

                            if (dy >= 0) {
                                tmp.attr('height', dy);
                            } else {
                                tmp.attr('y', y - _$canvas.offset().top).attr('height', -dy);
                            }
                        }
                    }, function(x, y) {
                        tmp = rPaper.rect(x - _$canvas.offset().left, y - _$canvas.offset().top, 0, 0);
                    }, function() {
                        _activeRect = tmp;
                        updateMode('edit', tmp.id);
                    });
                    break;
                case 'edit':
                    if (typeof(_activeRect) != 'undefined') {
                        window.ar = rPaper.freeTransform(_activeRect, {
                            keepRatio: false,
                            rotate: false,
                            draw: ['bbox'],
                            scale: ['bboxCorners', 'bboxSides']
                        });
                    }
            }
        };

    return {
        updateMode: updateMode
    };
};