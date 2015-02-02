/* global state */
'use strict';

var CollabCanvas = require('./collabCanvas'),
    typeahead = [
        '.btn',
        '.btn-xs',
        '.btn-sm',
        '.btn-lg',
        '.btn-default',
        '.btn-primary',
        '.btn-success',
        '.btn-info',
        '.btn-warning',
        '.btn-danger',
        '.btn-link',
        '.btn-block',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'a',
        'strong',
        'em',
        '.text-muted',
        '.text-primary',
        '.text-warning',
        '.text-danger',
        '.text-success',
        '.text-info',
        'blockquote'
    ],
    traverseState = function(elements, cb) {
        _.forEach(elements, function(element, elementClass) {
            cb(element, elementClass);
            traverseState(element.children, cb);
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
                $listItem = $('#element-template').clone(true),
                parentText = $this.siblings('.new-element-prefix').text().trim(),
                parentName = parentText.substring(0, parentText.length - 1);

            $listItem.attr('id', val);
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

    $('#inputNewElement').typeahead({ source: typeahead });

    //init
    if (!$.isEmptyObject(state)) {
        $('#element-list-empty-message').remove();
    }
    renderElementList(state, null, 0);

    CollabCanvas('tmp', 'mockImg').updateMode('draw');
};