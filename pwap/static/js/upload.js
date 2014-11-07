'use strict';
//require('dropzone');

var editImage = function(img, file) {
    var offset, i,
    canvas = $('#mycanvas'),
    ctx = canvas[0].getContext('2d'),
    isDragging = false,
    mxi = 0,
    myi = 0,
    mx = 0,
    my = 0,
    rects = [], // rectangles are arrays of [x origin, y origin, width, height]
    isSmall = function() {
        return mx - mxi < 25 || my - myi < 25;
    },
    tick = function() {
        ctx.drawImage(img, 0, 0);
        for (i = 0; i < rects.length; i++) {
            ctx.strokeRect.apply(ctx, rects[i]);
        }

        if (isDragging) {
            ctx.save();

            if (isSmall()) {
                ctx.strokeStyle = 'red';
            }

            ctx.strokeRect(mxi, myi, mx - mxi, my - myi);

            ctx.restore();
        }

        window.requestAnimationFrame(tick);
    };

    ctx.canvas.width = img.width;
    ctx.canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    offset = canvas.offset();
    ctx.strokeStyle = 'black';
    tick();

    canvas.parent().on('mousemove', function(e) {
        mx = Math.min(e.pageX - offset.left, img.width);
        my = Math.min(e.pageY - offset.top, img.height);

        mx = Math.max(0, mx);
        my = Math.max(0, my);
    }).on('mousedown', function() {
        mxi = mx;
        myi = my;
        isDragging = true;
    }).on('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            if (!isSmall()) {
                rects.push([mxi, myi, mx - mxi, my - myi]);
            }
        }
    });

    $('#submit').on('click', function() {
        $.post('/client/design', { file: file, parts: JSON.stringify(rects) }, function() {
            console.log('hi');
        }, 'json');
    });

    $('#reset').on('click', function() {
        rects = [];
    });
},

// Stealing from http://lokeshdhakar.com/projects/color-thief/
// Drag'n'drop demo
// Thanks to Nathan Spady (http://nspady.com/) who did the bulk of the drag'n'drop work.
dragDrop = function() {
    // Setup the drag and drop behavior if supported
    if (typeof(FileReader) !== 'undefined') {
        $('#drag-drop').show();
        var $dropZone = $('#drop-zone'),
            handleDragEnter = function() {
                $dropZone.addClass('dragging');
                return false;
            },
            handleDragLeave = function() {
                $dropZone.removeClass('dragging');
                return false;
            },
            handleDragOver = function() {
                return false;
            },
            handleFiles = function(files) {
                var file = files[0],
                    reader = new FileReader();

                if (file.type.match(/image.*/)) {
                    reader.onload = function(event) {
                        var loadedFile = event.target.result,
                            $image = $('#myimg').attr('src', loadedFile);

                        // Must wait for image to load in DOM, not just load from FileReader
                        $image.on('load', function() {
                            $('#drag-drop').hide();
                            $('#partition').show();
                            editImage($image[0], loadedFile);
                        });
                    };
                    reader.readAsDataURL(file);
                } else {
                    window.alert('File must be a supported image type.');
                }
            },
            handleDrop = function(event) {
                $dropZone.removeClass('dragging');
                handleFiles(event.originalEvent.dataTransfer.files);
                return false;
            };
        $dropZone
            .on('dragenter', handleDragEnter)
            .on('dragleave', handleDragLeave)
            .on('dragover', handleDragOver)
            .on('drop', handleDrop);
    }
};

module.exports = dragDrop;
