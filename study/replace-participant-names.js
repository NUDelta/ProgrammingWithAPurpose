String.prototype.replaceArray = function (find, replace) {
    var replaceString = this;
    var regex;
    for (var i = 0; i < find.length; i++) {
        regex = new RegExp("<h4>" + find[i] + "</h4>", "g");
        replaceString = replaceString.replace(regex, "<h4>" + replace[i] + "</h4>");
    }
    return replaceString;
};

var text = $("body").html();
var f = ['hu', 'liu', 'rodriguez', 'rovira', 'ruswick', 'vazquez', 'calloway', 'cook', 'miller', 'saxena', 'vaid', 'bhandari', 'kaldjian', 'paredes', 'wong'];
var r = ['p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13', 'p14'];
text = text.replaceArray(f, r);
$("body").html(text);