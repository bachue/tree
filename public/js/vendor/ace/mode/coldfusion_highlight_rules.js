define(function(require,exports,module){"use strict";var oop=require("../lib/oop");var JavaScriptHighlightRules=require("./javascript_highlight_rules").JavaScriptHighlightRules;var HtmlHighlightRules=require("./html_highlight_rules").HtmlHighlightRules;var ColdfusionHighlightRules=function(){HtmlHighlightRules.call(this);this.embedTagRules(JavaScriptHighlightRules,"cfjs-","cfscript");this.normalizeRules()};oop.inherits(ColdfusionHighlightRules,HtmlHighlightRules);exports.ColdfusionHighlightRules=ColdfusionHighlightRules});