window.jQuery = window.$ = require('jquery');
window._ = require('lodash');
require('bootstrap');
require('../../node_modules/bootstrap-3-typeahead/bootstrap3-typeahead');

var editor = require('./editor'),
    upload = require('./upload'),
    compile = require('./compile'),
    learn = require('./learn'),
    learnerHome = require('./learnerHome'),
    add = require('./add'),
    logger = require('./logger'),
    collab = require('./collab'),
    bsEditor = require('./bsEditor');

logger('pageview');

window.PWAP = {
    editor: editor,
    upload: upload,
    compile: compile,
    learn: learn,
    learnerHome: learnerHome,
    add: add,
    collab: collab,
    bsEditor: bsEditor
};