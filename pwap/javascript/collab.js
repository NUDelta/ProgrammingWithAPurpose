/* global PWAP */
'use strict';

var collabCanvas = require('./collabCanvas'),
    classes = require('./bootstrapClasses'),
    classDescriptions = require('./bootstrapClassDescriptions'),
    logger = require('./logger');



module.exports = function() {
    var $document = $(document),
        $elementList = $('#element-list'),
        $styleguidePreview = $('#styleguide-preview'),
        socket = io.connect('https://salty-temple-9580.herokuapp.com/'),
        updateBadges = function() {
            _.forEach(PWAP.state, function(entry) {
                var el = $('[data-item="' + entry.class + '"] .badge');
                el.text(_.parseInt(el.text()) + 1);
            });
        },
        updateStyleguide = function() {
            var $styleguideBody = $('#styleguide-body'),
                styleguide = {},
                bootClass, rect, scale, empty, $component;
            if (PWAP.state.length > 0) {
                $styleguideBody.empty();
            }
            _.forEach(PWAP.state, function(rect) {
                bootClass = rect.class;
                if (styleguide.hasOwnProperty(bootClass)) {
                    styleguide[bootClass].push(rect.rectID);
                } else {
                    styleguide[bootClass] = [rect.rectID];
                }
            });
            _.forEach(_.keys(classes), function(category) {
                empty = true;
                _.forEach(classes[category], function(tag) {
                    if (styleguide.hasOwnProperty(tag)) {

                        if (empty) {
                            $('<h2>' + category + '</h2><hr>').appendTo($styleguideBody);
                            empty = false;
                        }

                        $('<h3>' + tag + '</h3>').appendTo($styleguideBody);
                        $component = $('<div class="styleguide-preview-component"></div>');
                        $component.appendTo($styleguideBody);
                        _.forEach(styleguide[tag], function(rectID) {

                            rect = PWAP.rects[rectID];

                            // Hard coded modal width / 3  - 1 because can't get modal width when closed
                            scale = rect[2] > 155 ? 155 / rect[2] : 1;

                            $('<div>').css({
                                'background-image': 'url(' + $('#mockCanvas').find('image').attr('href') + ')',
                                'background-position': '-' + rect[0] * scale  + 'px -' + rect[1] * scale + 'px',
                                'width': rect[2] * scale,
                                'height': rect[3] * scale,
                                'background-size': $('#mockCanvas').find('image').attr('width') * scale + 'px',
                                'display': 'inline-block',
                                'margin': '5px'
                            }).appendTo($component);
                        });
                    }
                });
            });
        };

    socket.on('connect', function() {
        socket.on('welcome', function(data) {
            console.log(data);
        });

        socket.on('updated_state', function(data) {
            console.log('receiving new state');
            PWAP.state = data.newState;
            PWAP.rects = data.newRects;
            $document.trigger('update.pwap.state');
        });

        $document.on('emit.pwap.state', function() {
            socket.emit('newState', { state: PWAP.state, rects: PWAP.rects });
            console.log('sending new state');
        });
    });

    $elementList.on('click', '.list-group-item', function(e) {
        $document.trigger('selected.pwap.el', e.target);
        return false;
    });

    $document.on('selected.pwap.el', function(e, selectedClassEl) {
        // only perform action when not in "edit" mode
        if ($elementList.hasClass('edit')) {
            return;
        }
        logger('collab', 'userID: ' + localStorage.PWAPSession + '; clicked an element from left list in Draw mode');

        $(selectedClassEl).addClass('active').siblings().removeClass('active');

        $styleguidePreview.empty();

        _.forEach(_.filter(PWAP.state, { 'class': $(selectedClassEl).data('item') }), function(item) {
            var rect = PWAP.rects[item.rectID],
                scale = rect[2] > ($styleguidePreview.width()-10) ? ($styleguidePreview.width()-10) / rect[2] : 1;

            $('<div>').css({
                'background-image': 'url(' + $('#mockCanvas').find('image').attr('href') + ')',
                'background-position': '-' + rect[0] * scale  + 'px -' + rect[1] * scale + 'px',
                'width': rect[2] * scale,
                'height': rect[3] * scale,
                'background-size': $('#mockCanvas').find('image').attr('width') * scale + 'px',
                'margin': '5px'
            }).appendTo($styleguidePreview);
        });
    });

    $('#element-list').append(_.template($('#elementListPanelTemplate').text())({ groups: classes }));

    _.forEach(_.keys(classDescriptions), function(bootstrapClass) {
        var $listGroupItem = $('[data-item="' + bootstrapClass + '"]');
        $listGroupItem.attr('data-content', classDescriptions[bootstrapClass]);
        $listGroupItem.attr('title', bootstrapClass);

    });

    $document.on('update.pwap.state', function() {
        console.log('redrawing');
        $elementList.find('.badge').text(0);
        updateBadges();
        updateStyleguide();
    });

    updateBadges();

    $('#intro-modal').modal('show');

    $(function () {
      $('.popover-trigger').popover({
        container: "body",
        placement: "right",
        delay: {
            show: "800"
        }
      });
    });

    // temporary code for logging
    if (!localStorage.PWAPSession) {
        localStorage.PWAPSession = Math.random().toString(36).substring(7);
    }
    logger('collab', 'userID: ' + localStorage.PWAPSession + '; loaded page');

    collabCanvas().updateMode('draw');
};