define(function(require,exports,module){"use strict";var oop=require("../lib/oop");var TextMode=require("./text").Mode;var Tokenizer=require("../tokenizer").Tokenizer;var MakefileHighlightRules=require("./makefile_highlight_rules").MakefileHighlightRules;var FoldMode=require("./folding/coffee").FoldMode;var Mode=function(){this.HighlightRules=MakefileHighlightRules;this.foldingRules=new FoldMode};oop.inherits(Mode,TextMode);(function(){this.lineCommentStart="#";this.$indentWithTabs=true;this.$id="ace/mode/makefile"}).call(Mode.prototype);exports.Mode=Mode});