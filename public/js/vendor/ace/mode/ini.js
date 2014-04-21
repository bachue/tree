define(function(require,exports,module){"use strict";var oop=require("../lib/oop");var TextMode=require("./text").Mode;var Tokenizer=require("../tokenizer").Tokenizer;var IniHighlightRules=require("./ini_highlight_rules").IniHighlightRules;var FoldMode=require("./folding/ini").FoldMode;var Mode=function(){this.HighlightRules=IniHighlightRules;this.foldingRules=new FoldMode};oop.inherits(Mode,TextMode);(function(){this.lineCommentStart=";";this.blockComment={start:"/*",end:"*/"};this.$id="ace/mode/ini"}).call(Mode.prototype);exports.Mode=Mode});