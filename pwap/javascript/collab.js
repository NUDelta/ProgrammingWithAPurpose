/* global PWAP */
'use strict';

var collabCanvas = require('./collabCanvas'),
    classes = require('./bootstrapClasses'),
    logger = require('./logger');

module.exports = function() {
    var $document = $(document),
        $elementList = $('#element-list'),
        $styleguidePreview = $('#styleguide-preview'),
        //socket = io.connect('//localhost:3000'),
        updateBadges = function() {
            _.forEach(PWAP.state, function(entry) {
                var el = $('[data-item="' + entry.class + '"] .badge');
                el.text(_.parseInt(el.text()) + 1);
            });
        },
        updateStyleguide = function() {
            var $styleguideBody = $('#styleguide-body'),
                styleguide = {},
                bootClass, rect, scale, empty;
            $styleguideBody.empty();
            _.forEach(PWAP.state, function(rect) {
                bootClass = rect.class;
                if (styleguide.hasOwnProperty(bootClass)) {
                    styleguide[bootClass].push(rect.rectID);
                }
                else { 
                    styleguide[bootClass] = [rect.rectID];
                }
            });
            for (var category in classes) {
                empty = true;
                _.forEach(classes[category], function(tag) {
                    if (styleguide.hasOwnProperty(tag)) {

                        if (empty) {
                            $('<h2>' + category + '</h2><hr>').appendTo($styleguideBody);
                            empty = false;
                        }

                        $('<h3>' + tag + '</h2>').appendTo($styleguideBody);
                        _.forEach(styleguide[tag], function(rectID) {

                            rect = PWAP.rects[rectID];

                            // Hard coded modal width / 3  - 1 because can't get modal width when closed
                            scale = rect[2] > 185 ? 185 / rect[2] : 1;

                            $('<div>').css({
                                'background-image': 'url(' + $('#mockCanvas').find('image').attr('href') + ')',
                                'background-position': '-' + rect[0] * scale  + 'px -' + rect[1] * scale + 'px',
                                'width': rect[2] * scale,
                                'height': rect[3] * scale,
                                'background-size': $('#mockCanvas').find('image').attr('width') * scale + 'px',
                                'display': 'inline-block'
                            }).appendTo($styleguideBody);
                        });
                    }
                });
            }
        };

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
                scale = rect[2] > $styleguidePreview.width() ? $styleguidePreview.width() / rect[2] : 1;

            $('<div>').css({
                'background-image': 'url(' + $('#mockCanvas').find('image').attr('href') + ')',
                'background-position': '-' + rect[0] * scale  + 'px -' + rect[1] * scale + 'px',
                'width': rect[2] * scale,
                'height': rect[3] * scale,
                'background-size': $('#mockCanvas').find('image').attr('width') * scale + 'px'
            }).appendTo($styleguidePreview);
        });
    });

    $('#element-list').append(_.template($('#elementListPanelTemplate').text())({ groups: classes }));

    $document.on('update.pwap.state', function() {
        console.log('the object has been updated');
        $elementList.find('.badge').text(0);
        updateBadges();
        updateStyleguide();
    });

    updateBadges();

    // socket.on('connect', function() {
    //     socket.on('welcome', function(data) {
    //         console.log(data);
    //     });

    //     socket.on('time', function(data) {
    //         console.log(data);
    //         socket.emit('new_state', {});
    //     });

    //     socket.on('updated_state', function(data) {
    //         console.log(data);
    //     });
    // });

    // temporary code for logging
    if (!localStorage.PWAPSession) {
        localStorage.PWAPSession = Math.random().toString(36).substring(7);
    }
    logger('collab', 'userID: ' + localStorage.PWAPSession + '; loaded page');

    collabCanvas().updateMode('draw');
};