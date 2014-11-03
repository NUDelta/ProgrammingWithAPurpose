'use strict';
window.jQuery = require('jquery');

var $ = window.jQuery;

$.loadImage = function(url) {
  // Define a "worker" function that should eventually resolve or reject the deferred object.
  var loadImage = function(deferred) {
    var image = new Image(),
        loaded = function() {
          unbindEvents();
          // Calling resolve means the image loaded sucessfully and is ready to use.
          deferred.resolve(image);
        },
        errored = function() {
          unbindEvents();
          // Calling reject means we failed to load the image (e.g. 404, server offline, etc).
          deferred.reject(image);
        },
        unbindEvents = function() {
          // Ensures the event callbacks only get called once.
          image.onload = null;
          image.onerror = null;
          image.onabort = null;
        };

    // Set up event handlers to know when the image has loaded
    // or fails to load due to an error or abort.
    image.onload = loaded;
    image.onerror = errored; // URL returns 404, etc
    image.onabort = errored; // IE may call this if user clicks "Stop"

    // Setting the src property begins loading the image.
    image.src = url;
  };

  // Create the deferred object that will contain the loaded image.
  // We don't want callers to have access to the resolve() and reject() methods,
  // <span class="goog_qs-tidbit goog_qs-tidbit-0">so convert to "read-only" by calling `promise()`.
  return $.Deferred(loadImage).promise();
};

module.exports = function() {
    var offset, img, i,
        canvas = $('#mycanvas'),
        ctx = canvas[0].getContext('2d'),
        isDragging = false,
        xi = 0,
        yi = 0,
        xm = 0,
        ym = 0,
        rects = [], // rectangles are arrays of [x origin, y origin, width, height]
        tick = function() {
            ctx.drawImage(img, 0, 0);
            for (i = 0; i < rects.length; i++) {
                ctx.strokeRect.apply(ctx, rects[i]);
            }

            if (isDragging) {
                ctx.strokeRect(xi, yi, xm - xi, ym - yi);
            }

            window.requestAnimationFrame(tick);
        };

    $.loadImage('/static/img/webpage.png').done(function(myimg) {
        img = myimg;
        ctx.canvas.width = img.width;
        ctx.canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        offset = canvas.offset();
        tick();
    });

    canvas.parent().on('mousemove', function(e) {
        xm = Math.min(e.pageX - offset.left, img.width);
        ym = Math.min(e.pageY - offset.top, img.height);
    }).on('mousedown', function() {
        console.log('mouse down');
        xi = xm;
        yi = ym;

        if (xi < 0) {
            xi = 0;
        }

        if (yi < 0) {
            yi = 0;
        }

        isDragging = true;
    }).on('mouseup', function() {
        console.log('mousup');
        if (isDragging) {
            isDragging = false;
            rects.push([xi, yi, xm - xi, ym - yi]);
            console.log(rects);
        }
    });
};
