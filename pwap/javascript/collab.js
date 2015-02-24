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
                'background-image': 'url("/static/img/geekwire_mockup.png")',
                'background-position': '-' + rect[0]*scale + 'px -' + rect[1]*scale + 'px',
                'width': rect[2] * scale,
                'height': rect[3] * scale,
                'background-size': $('#mockCanvas').find('image').attr('width')*scale + 'px'
            }).appendTo($styleguidePreview);
        });
    });

    $('#element-list').append(_.template($('#elementListPanelTemplate').text())({ groups: classes }));

    $document.on('update.pwap.state', function() {
        console.log('the object has been updated');
        $elementList.find('.badge').text(0);
        updateBadges();
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