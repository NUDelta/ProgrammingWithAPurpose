/* global PWAP */
'use strict';

var collabCanvas = require('./collabCanvas'),
    classes = require('./bootstrapClasses');

module.exports = function() {
    var $document = $(document);

    $('#element-list').on('click', '.list-group-item', function() {
        $document.trigger('selected.pwap.el', $(this).data('item'));
        return false;
    });

    $document.on('selected.pwap.el', function(e, item) {
        $(e.target).addClass('active').siblings().removeClass('active');

        $('.styleguide-preview').remove(':not(#styleguide-preview-template)     ');

        var rectIDs = _.pluck(_.filter(PWAP.state, { 'class': item }), 'rectID'),
            i, $preview, position, width, height, scale;
        for (i = 0; i < rectIDs.length; i++) {
            $preview  = $('#styleguide-preview-template').clone(true);
            $preview.attr('id', 'styleguide-preview-' + item + '-' + i);
            position = '-' + PWAP.rects[rectIDs[i]][0] + 'px -' + PWAP.rects[rectIDs[i]][1] + 'px';
            width = PWAP.rects[rectIDs[i]][2];
            height = PWAP.rects[rectIDs[i]][3];
            // Scaling bacrgkound work in progress
            if (width > 358) {
                scale = 358 / width;
                width = scale * width;
                height = scale * height;
            }
            $preview.css({
                'background-image': 'url("/static/img/emodo_mockup.png")',
                'background-position': position,
                'width': width,
                'height': height
            });
            $preview.insertAfter('#styleguide-header');
        }
    });

    $('#element-list').append(_.template($('#elementListPanelTemplate').text())({ groups: classes }));

    _.forEach(PWAP.state, function(entry) {
        var el = $('[data-item="' + entry.class + '"] .badge');

        el.text(_.parseInt(el.text()) + 1);
    });

    collabCanvas('mockCanvas', 'mockImg').updateMode('draw');
};