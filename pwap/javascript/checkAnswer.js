function checkAnswer(userCSS, correctCSS) {

	var userCSSObj = convertToObject(userCSS),
	correctCSSObj = convertToObject(correctCSS),
	matches = doTheyMatch(userCSSObj, correctCSSObj);
	return matches;

}

function doTheyMatch(test, correct) {
	for (var selector in correct) {
		if (test[selector] === undefined) {
			return false;
		}
		else {
			for (var rule in correct[selector]) {
				if (test[selector][rule] === undefined) {
					return false;
				}
				else if (test[selector][rule] != correct[selector][rule]) {
					return false;
				}
			}
		}
	}
	for (var selector in test) {
		if (correct[selector] === undefined) {
			return false;
		}
		else {
			for (var rule in test[selector]) {
				if (correct[selector][rule] === undefined) {
					return false;
				}
				else if (test[selector][rule] !== correct[selector][rule]) {
					return false;
				}
			}
		}
	}
	return true;
}

function convertToObject(cssString) {
	var closeBraceIndex = 0,
	openBraceIndex = 0,
	currentIndex = 0,
	tree = {},
	endIndex = cssString.length - 1,
	currentString = cssString,
	rules = {};

	var blocks = cssString.split('}'),
	selector;
	blocks.pop();
	for (var i = 0; i < blocks.length; i++) {
		selector = $.trim(blocks[i].substring(0, blocks[i].indexOf('{')));
		rules = parseRules(blocks[i].substring(blocks[i].indexOf('{')+1));
		if (tree[selector] == undefined) {
			tree[selector] = rules;
		}
		else {
			tree[selector] = mergeObjects(tree[selector], rules);
		}
	}
	return tree;
}

function parseRules(ruleString) {
	var rules = {},
	rulesArray = ruleString.split(';'),
	attribute, value, thisRule;
	rulesArray.pop();
	for (var i = 0; i < rulesArray.length; i++) {
		thisRule = rulesArray[i]
		attribute = $.trim(thisRule.substring(0, thisRule.indexOf(':')));
		value = $.trim(thisRule.substring(thisRule.indexOf(':')+1));
		rules[attribute] = value;
	}
	return rules;
}

function mergeObjects(obj1, obj2) {
	var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}