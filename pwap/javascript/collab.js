/* global state */
'use strict';

var traverseState = function(elements, cb) {
        _.forEach(elements, function(element, elementClass) {
            cb(element, elementClass);
            traverseState(element.children, cb);
        });
    },
    draw = function() {
        var offset,
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
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                traverseState(state, function(element, elementClass) {

                    // cache jQuery selectors
                    if (typeof(element.$) == 'undefined') {
                        element.$ = $('#' + elementClass);
                    }

                    ctx.save();
                    if (element.$.hasClass('active') && isDragging) {
                        ctx.strokeRect(mxi, myi, mx - mxi, my - myi);
                    } else if (element.$.is(':hover')) {
                        ctx.strokeStyle = 'green';
                    }

                    _.forEach(element.rects, function(rect) {
                        ctx.strokeRect.apply(ctx, rect);
                    });

                    ctx.restore();
                });

                $('#x').text(mx); $('#y').text(my);

                window.requestAnimationFrame(tick);
            };

        ctx.canvas.width = img.width();
        ctx.canvas.height = img.height();
        ctx.scale(scale, scale);

        offset = canvas.offset();
        ctx.strokeStyle = 'black';
        tick();

        canvas.parent().on('mousemove', function(e) {
            mx = Math.min(e.pageX - offset.left - 2, img.width());
            my = Math.min(e.pageY - offset.top - 2, img.height());

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

                var active = $('.list-group-item.active');
                if (active.length > 0) {
                    traverseState(state, function(element, elementClass) {
                        if (active.attr('id') == elementClass) {
                            element.rects.push([mxi, myi, mx - mxi, my - myi]);
                        }
                    });
                }
            }
            e.preventDefault();
        });
    };

module.exports = function() {
    var renderElementList = function(list, parentName, indent) {
            for (var element in list) {
                if (list.hasOwnProperty(element)) {
                    renderElement(element, parentName, indent);
                    if (list[element].children !== null) {
                        renderElementList(list[element].children, element, indent + 1);
                    }
                }
            }
        },
        renderElement = function(element, parentName, indent) {
            var $list = $('#element-list'),
                whitespace = '',
                $listItem = $('#element-template').clone(true),
                $add = $('#element-add-template').clone(true),
                // temporarily not allowing adding beneath 1 level
                addAllowed = true;

            $listItem.attr('id', element);

            if (indent > 0) {
                addAllowed = false;
            }

            while (indent > 0) {
                whitespace = whitespace + '\t';
                indent -= 1;
            }

            if (parentName === null) {
                $listItem.text(element);
                $add.attr('id', 'element-add-' + element);
            } else {
                $listItem.text(whitespace + parentName + '-' + element);
                $add.attr('id', 'element-add-' + parentName + '-' + element);
            }

            if (addAllowed) {
                $listItem.append($add);
            }

            $list.append($listItem);
        };

    $('#new-element-form').on('submit', function(e) {
        e.preventDefault();
        var element = this.elements[0].value;
        renderElement(element, null, 0);
        state[element] = { rects: [], children: null };
    });

    $('.element-add').on('click', function() {
        var $this = $(this),
            parentName = $this.attr('id').replace('element-add-', ''),
            $newElementListItem = $('#new-element-template').clone(true),
            $parentListItem = $this.closest('.list-group-item'),
            numIndents = ($parentListItem.text().match(/\t/g) || []).length,
            whitespace = '';

        while (numIndents >= 0) {
            whitespace = whitespace + '\t';
            numIndents -= 1;
        }

        $newElementListItem.attr('id', 'new-element-' + parentName);
        $newElementListItem.find('.new-element-prefix').text(whitespace + parentName + '-');
        $this.closest('.list-group-item').after($newElementListItem);

        return false;
    });

    $('.new-element-input').on('keypress', function(e) {
        if (e.keyCode === 13) {
            var $this = $(this),
                val = $this.val(),
                elementText = $this.siblings('.new-element-prefix').text() + val,
                elementName = elementText.trim(),
                $listItem = $('#element-template').clone(true),
                parentText = $this.siblings('.new-element-prefix').text().trim(),
                parentName = parentText.substring(0, parentText.length - 1);

            $listItem.attr('id', elementName);
            $listItem.text(elementText);
            $this.closest('.list-group-item').replaceWith($listItem);

            if (state[parentName].children === null) {
                state[parentName].children = { temp: { rects: [], children: null } };
                state[parentName].children[val] = state[parentName].children.temp;
                delete state[parentName].children.temp;
            } else {
                state[parentName].children[val] = { rects: [], children: null };
            }
        }
    });

    $('#element-list').on('click', '.list-group-item', function() {
        $(this).addClass('active').siblings().removeClass('active');

        return false;
    });

    //init
    if (!$.isEmptyObject(state)) {
        $('#element-list-empty-message').remove();
    }
    renderElementList(state, null, 0);

    draw();
};