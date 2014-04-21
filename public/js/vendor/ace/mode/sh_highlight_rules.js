define(function(require,exports,module){"use strict";var oop=require("../lib/oop");var TextHighlightRules=require("./text_highlight_rules").TextHighlightRules;var reservedKeywords=exports.reservedKeywords="!|{|}|case|do|done|elif|else|"+"esac|fi|for|if|in|then|until|while|"+"&|;|export|local|read|typeset|unset|"+"elif|select|set";var languageConstructs=exports.languageConstructs="[|]|alias|bg|bind|break|builtin|"+"cd|command|compgen|complete|continue|"+"dirs|disown|echo|enable|eval|exec|"+"exit|fc|fg|getopts|hash|help|history|"+"jobs|kill|let|logout|popd|printf|pushd|"+"pwd|return|set|shift|shopt|source|"+"suspend|test|times|trap|type|ulimit|"+"umask|unalias|wait";var ShHighlightRules=function(){var keywordMapper=this.createKeywordMapper({keyword:reservedKeywords,"support.function.builtin":languageConstructs,"invalid.deprecated":"debugger"},"identifier");var integer="(?:(?:[1-9]\\d*)|(?:0))";var fraction="(?:\\.\\d+)";var intPart="(?:\\d+)";var pointFloat="(?:(?:"+intPart+"?"+fraction+")|(?:"+intPart+"\\.))";var exponentFloat="(?:(?:"+pointFloat+"|"+intPart+")"+")";var floatNumber="(?:"+exponentFloat+"|"+pointFloat+")";var fileDescriptor="(?:&"+intPart+")";var variableName="[a-zA-Z][a-zA-Z0-9_]*";var variable="(?:(?:\\$"+variableName+")|(?:"+variableName+"=))";var builtinVariable="(?:\\$(?:SHLVL|\\$|\\!|\\?))";var func="(?:"+variableName+"\\s*\\(\\))";this.$rules={start:[{token:"constant",regex:/\\./},{token:["text","comment"],regex:/(^|\s)(#.*)$/},{token:"string",regex:'"',push:[{token:"constant.language.escape",regex:/\\(?:[$abeEfnrtv\\'"]|x[a-fA-F\d]{1,2}|u[a-fA-F\d]{4}([a-fA-F\d]{4})?|c.|\d{1,3})/},{token:"constant",regex:/\$\w+/},{token:"string",regex:'"',next:"pop"},{defaultToken:"string"}]},{token:"variable.language",regex:builtinVariable},{token:"variable",regex:variable},{token:"support.function",regex:func},{token:"support.function",regex:fileDescriptor},{token:"string",start:"'",end:"'"},{token:"constant.numeric",regex:floatNumber},{token:"constant.numeric",regex:integer+"\\b"},{token:keywordMapper,regex:"[a-zA-Z_$][a-zA-Z0-9_$]*\\b"},{token:"keyword.operator",regex:"\\+|\\-|\\*|\\*\\*|\\/|\\/\\/|~|<|>|<=|=>|=|!="},{token:"paren.lparen",regex:"[\\[\\(\\{]"},{token:"paren.rparen",regex:"[\\]\\)\\}]"}]};this.normalizeRules()};oop.inherits(ShHighlightRules,TextHighlightRules);exports.ShHighlightRules=ShHighlightRules});