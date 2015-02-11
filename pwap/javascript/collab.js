/* global PWAP */
'use strict';

var collabCanvas = require('./collabCanvas'),
    classes = require('./bootstrapClasses');

module.exports = function() {
    var $document = $(document),
        $elementList = $('#element-list'),
        $styleguidePreview = $('#styleguide-preview');

    $elementList.on('click', '.list-group-item', function() {
        $document.trigger('selected.pwap.el', $(this).data('item'));
        return false;
    });

    $document.on('selected.pwap.el', function(e, selectedClass) {
        // only perform action when not in "edit" mode
        if ($elementList.hasClass('edit')) {
            return false;
        }

        $(e.target).addClass('active').siblings().removeClass('active');

        $styleguidePreview.empty();

        _.forEach(_.filter(PWAP.state, { 'class': selectedClass }), function(item) {
            var rect = PWAP.rects[item.rectID],
                scale = rect[2] > $styleguidePreview.width() ? $styleguidePreview.width() / rect[2] : 1;

            $('<div>').css({
                'background-image': 'url("/static/img/emodo_mockup.png")',
                'background-position': '-' + rect[0] + 'px -' + rect[1] + 'px',
                'width': rect[2] * scale,
                'height': rect[3] * scale
            }).appendTo($styleguidePreview);
        });
    });

    $('#element-list').append(_.template($('#elementListPanelTemplate').text())({ groups: classes }));

    _.forEach(PWAP.state, function(entry) {
        var el = $('[data-item="' + entry.class + '"] .badge');

        el.text(_.parseInt(el.text()) + 1);
    });

    collabCanvas().updateMode('draw');
};