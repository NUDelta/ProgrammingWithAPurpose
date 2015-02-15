/* globals PWAP */
'use strict';

var Raphael = require('raphael');
require('./raphael.free_transform');

module.exports = function() {
    var rTmpRect, rFocus, _$maskWindow, _activeRect, _tmp,
        _$document     = $(document),
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
        canvasClick = function(e) {
            var els = rPaper.getElementsByPoint((e.pageX - _offset.left) * _scale, (e.pageY - _offset.top) * _scale);

            if (typeof(_activeRect) == 'undefined' && els.length > 1) {
                $('#newElementDelete').show();
                _activeRect = els[1];
                updateMode('edit');
            }
        },
        updateMode = function(mode) {
            rImg.undrag();
            rFocus.hide();
            _$newElForm.hide();
            _$elementList.removeClass('edit')
                .find('.list-group-item').removeClass('active');

            switch (mode) {
                case 'draw':
                    $('#newElementDelete').hide();
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
                        _tmp = new Date().getTime();
                        rTmpRect = rPaper.rect(
                            (x - _offset.left) * _scale,
                            (y - _offset.top) * _scale,
                            0,
                            0
                        ).attr('stroke-width', _scale);
                    }, function(e) {
                        if (rTmpRect.attr('width') > 10 && rTmpRect.attr('height') > 10) {
                            _activeRect = rTmpRect;
                            updateMode('edit');
                        } else {
                            rTmpRect.remove();
                            if (new Date().getTime() - _tmp < 200) {
                                canvasClick(e);
                            }
                        }
                    });
                    break;
                case 'edit':
                    _$elementList.addClass('edit');

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
                            $('<li class="list-group-item">' + item.class + '</li>')
                                .append($('<a href="#" class="pull-right remove"><i class="fa fa-times"></i></a>'))
                                .appendTo(_$newElClasses);
                        });
                    }

                    rFocus.show();
                    setTimeout(function() {
                        _$newElForm.show();
                    }, 10);
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

    _$document.on('selected.pwap.el', function(e, selectedClassEl) {
        if (_$elementList.hasClass('edit')) {
            $(selectedClassEl).toggleClass('active');

            _$newElClasses.empty();

            _$elementList.find('.active').each(function() {
                $('<li class="list-group-item">' + $(this).data('item') + '</li>')
                    .append($('<a href="#" class="pull-right remove"><i class="fa fa-times"></i></a>'))
                    .appendTo(_$newElClasses);
            });
        }
    }).on('update.pwap.state', function() {
        var seenIDs = [];

        rPaper.forEach(function(el) {
            var id = el.data('id');

            if (id) {
                if (PWAP.rects[id]) {
                    seenIDs.push(id);

                    el.attr({
                        'x': PWAP.rects[id][0],
                        'y': PWAP.rects[id][1],
                        'width': PWAP.rects[id][2],
                        'height': PWAP.rects[id][3]
                    });
                } else {
                    el.remove();
                }
            }
        });

        _.forEach(_.keys(PWAP.rects), function(id) {
            if (seenIDs.indexOf(id) == -1) {
                rPaper.rect.apply(rPaper, PWAP.rects[id]).attr('stroke-width', _scale).data('id', id);
            }
        });
    });

    _$newElClasses.on('click', '.remove', function() {
        var $el = $(this).closest('.list-group-item'),
            item = $el.text();

        $el.remove();

        $('[data-item="' + item + '"]').removeClass('active');
        return false;
    });

    $('#newElementSubmit').on('click', function() {
        var id,
            bbox = _activeRect.getBBox();

        if (_activeRect.data('id')) {
            id = _activeRect.data('id');

            // wipe everything and re-add
            PWAP.state = _.reject(PWAP.state, { rectID: id });
        } else {
            // find next available id
            id = 'r' + (Math.max.apply(null, (_.map(_.keys(PWAP.rects), function(id) {
                return _.parseInt(id.slice(1));
            }))) + 1);
        }

        _$elementList.find('.active').each(function() {
            PWAP.state.push({
                rectID: id,
                class: $(this).data('item')
            });
        });

        PWAP.rects[id] = [bbox.x, bbox.y, bbox.width, bbox.height];

        _activeRect.freeTransform.unplug();
        _activeRect = undefined;
        rTmpRect = undefined;

        _$document.trigger('update.pwap.state');
        updateMode('draw');
    });

    $('#newElementCancel').on('click', function() {
        _activeRect.freeTransform.unplug();
        _activeRect = undefined;
        if (typeof(rTmpRect) != 'undefined') {
            rTmpRect.remove();
        }

        updateMode('draw');
    });

    $('#newElementDelete').on('click', function() {
        if (window.confirm('Are you sure?')) {
            var id = _activeRect.data('id');

            _activeRect.freeTransform.unplug();
            _activeRect.remove();

            PWAP.state = _.reject(PWAP.state, { rectID: id });
            delete PWAP.rects[id];

            _$document.trigger('update.pwap.state');
            updateMode('draw');
        }
    });

    return {
        updateMode: updateMode
    };
};