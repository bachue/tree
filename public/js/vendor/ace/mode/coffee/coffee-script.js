define(function(require,exports,module){var Lexer=require("./lexer").Lexer;var parser=require("./parser");var lexer=new Lexer;parser.lexer={lex:function(){var tag,token;token=this.tokens[this.pos++];if(token){tag=token[0],this.yytext=token[1],this.yylloc=token[2];this.yylineno=this.yylloc.first_line}else{tag=""}return tag},setInput:function(tokens){this.tokens=tokens;return this.pos=0},upcomingInput:function(){return""}};parser.yy=require("./nodes");exports.parse=function(code){return parser.parse(lexer.tokenize(code))}});