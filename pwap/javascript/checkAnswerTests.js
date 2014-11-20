global._ = require('lodash');

var checkAnswer = require('./checkAnswer').checkAnswer,
	assert = require('assert');

assert(checkAnswer('div { color: blue; }', 'div { color: blue; }'));

assert(checkAnswer('div {\n	color: blue;\n}', 'div {color  :  blue   ;   }'), 'whitespace');

assert(checkAnswer('div { color: blue; } div { color: red; }', 'div { color: red; }'), 'cascade');

assert(checkAnswer('div { color: blue; font-size: 15px; }', 'div { font-size: 15px; color: blue; }'), 'rule order');

assert(checkAnswer('div, body { color: blue; }', 'body, div { color: blue; }'), 'selector order');