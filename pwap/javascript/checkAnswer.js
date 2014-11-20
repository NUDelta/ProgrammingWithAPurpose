'use strict';

var parseRules = function(ruleString) {
	var i, attribute, value, thisRule,
		rules = {},
		rulesArray = ruleString.split(';');

	rulesArray.pop();
	for (i = 0; i < rulesArray.length; i++) {
		thisRule = rulesArray[i];
		attribute = thisRule.substring(0, thisRule.indexOf(':')).trim();
		value = thisRule.substring(thisRule.indexOf(':') + 1).trim();
		rules[attribute] = value;
	}
	return rules;
},
convertToObject = function(cssString) {
	var i, rules, selector,
		//closeBraceIndex = 0,
		//openBraceIndex = 0,
		//currentIndex = 0,
		tree = {},
		//endIndex = cssString.length - 1,
		//currentString = cssString,
		blocks = cssString.split('}');

	blocks.pop();
	for (i = 0; i < blocks.length; i++) {
		selector = blocks[i].substring(0, blocks[i].indexOf('{')).trim();
		rules = parseRules(blocks[i].substring(blocks[i].indexOf('{') + 1));

		tree[selector] = _.merge(rules, tree[selector]);
	}
	return tree;
};

module.exports.checkAnswer = function(userCSS, correctCSS) {
	var userCSSObj = convertToObject(userCSS),
		correctCSSObj = convertToObject(correctCSS);

	return _.isEqual(userCSSObj, correctCSSObj);
};