define(function(require,exports,module){"use strict";var oop=require("../lib/oop");var TextMode=require("./text").Mode;var Tokenizer=require("../tokenizer").Tokenizer;var PascalHighlightRules=require("./pascal_highlight_rules").PascalHighlightRules;var FoldMode=require("./folding/coffee").FoldMode;var Mode=function(){this.HighlightRules=PascalHighlightRules;this.foldingRules=new FoldMode};oop.inherits(Mode,TextMode);(function(){this.lineCommentStart=["--","//"];this.blockComment=[{start:"(*",end:"*)"},{start:"{",end:"}"}];this.$id="ace/mode/pascal"}).call(Mode.prototype);exports.Mode=Mode});