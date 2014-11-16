var editor = require('./editor'),
    upload = require('./upload'),
    compile = require('./compile');

window.jQuery = window.$ = require('jquery');
require('bootstrap');

window.PWAP = {
    editor: editor,
    upload: upload,
    compile: compile
};