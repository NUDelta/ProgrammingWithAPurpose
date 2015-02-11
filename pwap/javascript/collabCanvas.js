/* globals PWAP */
'use strict';

var Raphael = require('raphael');
require('./raphael.free_transform');

module.exports = function() {
    var rTmpRect, rFocus, _$maskWindow, _activeRect,
        _$img          = $('#mockImg'),
        _$canvas       = $('#mockCanvas'),
        _$elementList  = $('#element-list'),
        _$newElForm    = $('#newElementForm'),
        _$newElClasses = $('#newElementClasses'),
        _imgWidth      = _$img.width(),
        _imgHeight     = _$img.height(),
        _scale         = _imgWidth / _$canvas.width(),
        _offset        = { top: _$canvas.offset().top + 2, left: _$canvas.offset().left + 2 },
        rPaper         = new Raphael('mockCanvas').setViewBox(0, 0, _imgWidth, _imgHeight)
                            .setSize('100%', '100%'),
        rImg           = rPaper.image(_$img.attr('src'), 0, 0, _imgWidth, _imgHeight),
        updateMode = function(mode) {
            rImg.undrag();
            rFocus.hide();
            _$newElForm.hide();
            _$elementList.removeClass('edit');

            switch (mode) {
                case 'draw':
                    rImg.drag(function(dx, dy, x, y) {
                        if (typeof(rTmpRect) != 'undefined') {
                            if (dx >= 0) {
                                rTmpRect.attr('width', dx * _scale);
                            } else {
                                rTmpRect.attr('x', (x - _offset.left) * _scale).attr('width', -dx * _scale);
                            }

                            if (dy >= 0) {
                                rTmpRect.attr('height', dy * _scale);
                            } else {
                                rTmpRect.attr('y', (y - _offset.top) * _scale).attr('height', -dy * _scale);
                            }
                        }
                    }, function(x, y) {
                        rTmpRect = rPaper.rect(
                            (x - _offset.left) * _scale,
                            (y - _offset.top) * _scale,
                            0,
                            0
                        ).attr('stroke-width', _scale);
                    }, function() {
                        if (rTmpRect.attr('width') > 10 && rTmpRect.attr('height') > 10) {
                            _activeRect = rTmpRect;
                            updateMode('edit');
                        } else {
                            rTmpRect.remove();
                        }
                    });
                    break;
                case 'edit':
                    _$elementList.addClass('edit')
                        .find('.list-group-item').removeClass('active');

                    if (typeof(_activeRect) == 'undefined') {
                        console.log('something went wrong, _activeRect is undefined in Edit mode');
                        break;
                    }

                    rPaper.freeTransform(_activeRect, {
                        keepRatio: false,
                        rotate: false,
                        draw: ['bbox'],
                        scale: ['bboxCorners', 'bboxSides'],
                        size: 5 * _scale
                    }, function(ft) {
                        var bb = ft.subject.getBBox();

                        if (ft.subject[0].attributes.transform) {
                            _$maskWindow.attr('transform', ft.subject[0].attributes.transform.value);
                        }

                        _$newElForm.css({
                            top: (bb.y2 / _scale + _offset.top + 10) + 'px',
                            left: (bb.x2 / _scale + _offset.left - 400) + 'px'
                        });
                    });

                    var el = $(_activeRect[0]);

                    _$maskWindow.attr({
                        width: el.attr('width'),
                        height: el.attr('height'),
                        x: el.attr('x'),
                        y: el.attr('y')
                    });

                    _$newElClasses.empty();
                    if (_activeRect.data('id')) {
                        _.forEach(_.filter(PWAP.state, { rectID: _activeRect.data('id') }), function(item) {
                            $('[data-item="' + item.class + '"]').addClass('active');
                            $('<div>' + item.class + '<a class="fa fa-close"></a></div>').appendTo(_$newElClasses);
                        });
                    }

                    rFocus.show();
                    _$newElForm.show();
            }
        };

    // Setting up the grey "focus" overlay

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

    // Draw initial state

    _.forEach(PWAP.rects, function(rect, id) {
        rPaper.rect.apply(rPaper, rect).attr('stroke-width', _scale).data('id', id);
    });

    // Event handling

    $(window).on('resize', _.debounce(function() {
        _scale = _imgWidth / _$canvas.width();
        _offset = { top: _$canvas.offset().top + 2, left: _$canvas.offset().left + 2 };
    }, 200));

    _$canvas.on('click', function(e) {
        var els = rPaper.getElementsByPoint((e.pageX - _offset.left) * _scale, (e.pageY - _offset.top) * _scale);

        if (typeof(_activeRect) == 'undefined' && els.length > 1) {
            _activeRect = els[1];
            updateMode('edit');
        }
    });

    $('#newElementCancel').on('click', function() {
        _activeRect.freeTransform.unplug();
        _activeRect = undefined;
        if (typeof(rTmpRect) != 'undefined') {
            rTmpRect.remove();
        }

        updateMode('draw');
    });

    return {
        updateMode: updateMode
    };
};