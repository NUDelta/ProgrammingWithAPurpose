'use strict';

var Raphael = require('raphael');
require('./raphael.free_transform');

module.exports = function(canvas, img) {
    var tmp, rPaper, rImg,
        _$img = $('#' + img),
        _canvas = {
            $: $('#' + canvas),
            width: _$img.width(),
            height: _$img.height(),
            offset: $('#' + canvas).offset()
        },
        _currentMode = 'draw',
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
                                tmp.attr('x', x - _canvas.offset.left).attr('width', -dx);
                            }

                            if (dy >= 0) {
                                tmp.attr('height', dy);
                            } else {
                                tmp.attr('y', y - _canvas.offset.top).attr('height', -dy);
                            }
                        }
                    }, function(x, y) {
                        tmp = rPaper.rect(x - _canvas.offset.left, y - _canvas.offset.top, 0, 0);
                    }, function() {
                        _activeRect = tmp;
                        updateMode('edit', tmp.id);
                    });
                    break;
                case 'edit':
                    if (typeof(_activeRect) != 'undefined') {
                        rPaper.freeTransform(_activeRect, {
                            keepRatio: false,
                            rotate: false,
                            draw: ['bbox'],
                            scale: ['bboxCorners', 'bboxSides']
                        });
                    }
            }
        };

    // init
    rPaper = new Raphael(canvas, _canvas.width, _canvas.height);
    rImg = rPaper.image(_$img.attr('src'), 0, 0, _canvas.width, _canvas.height);

    return {
        updateMode: updateMode
    };
};