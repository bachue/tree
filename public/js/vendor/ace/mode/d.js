define(function(require,exports,module){"use strict";var oop=require("../lib/oop");var TextMode=require("./text").Mode;var Tokenizer=require("../tokenizer").Tokenizer;var DHighlightRules=require("./d_highlight_rules").DHighlightRules;var FoldMode=require("./folding/cstyle").FoldMode;var Mode=function(){this.HighlightRules=DHighlightRules;this.foldingRules=new FoldMode};oop.inherits(Mode,TextMode);(function(){this.lineCommentStart="/\\+";this.blockComment={start:"/*",end:"*/"};this.$id="ace/mode/d"}).call(Mode.prototype);exports.Mode=Mode});