window.jQuery = window.$ = require('jquery');
window._ = require('lodash');
require('bootstrap');

var editor = require('./editor'),
    upload = require('./upload'),
    compile = require('./compile'),
    learn = require('./learn'),
    add = require('./add'),
    logger = require('./logger');

logger('pageview', window.location.href);

window.PWAP = {
    editor: editor,
    upload: upload,
    compile: compile,
    learn: learn,
    add: add
};