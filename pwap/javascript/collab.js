'use strict';

var draw = function(img) {
    var offset, i,
        canvas = $('#mockup'),
        ctx = canvas[0].getContext('2d'),
        isDragging = false,
        mxi = 0,
        myi = 0,
        mx = 0,
        my = 0;

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

        }
    });
}

module.exports = function() {

    var create = function(htmlStr) {
        var frag = document.createDocumentFragment(),
            temp = document.createElement('div');

        temp.innerHTML = htmlStr;
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
        }
        return frag;
    };
    $('form').on('submit', function() {
        var newElementType = this.elements[0].value,
            fragment = create('<a href="#" class="list-group-item">' + newElementType + '</a>'),
            list = document.getElementById('element-list');
        list.insertBefore(fragment, list.childNodes[0]);
        list.removeChild(document.getElementById('element-list-empty-message'));
    });


};
