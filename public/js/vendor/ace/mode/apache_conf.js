define(function(require,exports,module){"use strict";var oop=require("../lib/oop");var TextMode=require("./text").Mode;var Tokenizer=require("../tokenizer").Tokenizer;var ApacheConfHighlightRules=require("./apache_conf_highlight_rules").ApacheConfHighlightRules;var FoldMode=require("./folding/cstyle").FoldMode;var Mode=function(){this.HighlightRules=ApacheConfHighlightRules;this.foldingRules=new FoldMode};oop.inherits(Mode,TextMode);(function(){this.lineCommentStart="#";this.$id="ace/mode/apache_conf"}).call(Mode.prototype);exports.Mode=Mode});