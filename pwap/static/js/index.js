var editor = require('./editor'),
    upload = require('./upload'),
    compile = require('./compile');

window.jQuery = window.$ = require('jquery');

window.PWAP = {
    editor: editor,
    upload: upload,
    compile: compile
};