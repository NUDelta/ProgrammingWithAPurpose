/* global state */
'use strict';

var traverseState = function(elements, cb) {
        console.log(elements);
        _.forEach(elements, function(element, elementClass) {
            cb(element, elementClass);
            traverseState(element.children, cb);
        });
    },
    draw = function() {
        var offset, i,
            canvas = $('#mockCanvas'),
            img = $('#mockImg'),
            ctx = canvas[0].getContext('2d'),
            isDragging = false,
            mxi = 0,
            myi = 0,
            mx = 0,
            my = 0,
            scale = img.width() / img.naturalWidth,
            tick = function() {
                traverseState(state, function(element) {
                    _.forEach(element.rects, function(rect) {
                        ctx.strokeRect.apply(ctx, rect);
                    });
                });

                //window.requestAnimationFrame(tick);
            };

        ctx.canvas.width = img.width();
        ctx.canvas.height = img.height();
        ctx.scale(scale, scale);

        offset = canvas.offset();
        ctx.strokeStyle = 'black';
        tick();

        canvas.parent().on('mousemove', function(e) {
            mx = Math.min(e.pageX - offset.left, img.width());
            my = Math.min(e.pageY - offset.top, img.height());

            mx = Math.max(0, mx);
            my = Math.max(0, my);
        }).on('mousedown', '#mockCanvas', function(e) {
            mxi = mx;
            myi = my;
            isDragging = true;
            e.preventDefault();
        }).on('mouseup', function(e) {
            if (isDragging) {
                isDragging = false;

            }
            e.preventDefault();
        });
    };

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
    $(document).ready(function() {
        if (!$.isEmptyObject(state)) {
            $('#element-list-empty-message').remove();
        }
        renderElementList(state);
    });
    $('form').on('submit', function() {
        var newElementType = this.elements[0].value,
            fragment = create('<a href="#" class="list-group-item">' + newElementType + '</a>'),
            list = document.getElementById('element-list');
        list.insertBefore(fragment, list.childNodes[0]);
        list.removeChild(document.getElementById('element-list-empty-message'));
    });
    var renderElementList = function(obj) {
        for (var element in obj) {
            renderElement(element);
            if (obj[element].children !== null) {
                renderElementList(obj[element].children);
            }
        }
    };
    var renderElement = function(element) {
        var $list = $('#element-list'),
            $template = $('#element-template').clone(),
            $listItem = $template.attr('id', element);
        $listItem.text(element);
        $list.append($listItem);
    };

    draw();
};
