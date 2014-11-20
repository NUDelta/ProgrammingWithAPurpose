var editor = require('./editor'),
    upload = require('./upload'),
    compile = require('./compile'),
    learn = require('./learn'),
    add = require('./add');

window.jQuery = window.$ = require('jquery');
window._ = require('lodash');
require('bootstrap');

window.PWAP = {
    editor: editor,
    upload: upload,
    compile: compile,
    learn: learn,
    add: add
};