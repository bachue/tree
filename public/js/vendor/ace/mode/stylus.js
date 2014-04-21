define(function(require,exports,module){"use strict";var oop=require("../lib/oop");var TextMode=require("./text").Mode;var Tokenizer=require("../tokenizer").Tokenizer;var StylusHighlightRules=require("./stylus_highlight_rules").StylusHighlightRules;var FoldMode=require("./folding/coffee").FoldMode;var Mode=function(){this.HighlightRules=StylusHighlightRules;this.foldingRules=new FoldMode};oop.inherits(Mode,TextMode);(function(){this.$id="ace/mode/stylus"}).call(Mode.prototype);exports.Mode=Mode});