define(function(require,exports,module){"use strict";var oop=require("../lib/oop");var JavaScriptHighlightRules=require("./javascript_highlight_rules").JavaScriptHighlightRules;var TextHighlightRules=require("./text_highlight_rules").TextHighlightRules;var SJSHighlightRules=function(){var parent=new JavaScriptHighlightRules;var escapedRe="\\\\(?:x[0-9a-fA-F]{2}|"+"u[0-9a-fA-F]{4}|"+"[0-2][0-7]{0,2}|"+"3[0-6][0-7]?|"+"37[0-7]?|"+"[4-7][0-7]?|"+".)";var contextAware=function(f){f.isContextAware=true;return f};var ctxBegin=function(opts){return{token:opts.token,regex:opts.regex,next:contextAware(function(currentState,stack){if(stack.length===0)stack.unshift(currentState);stack.unshift(opts.next);return opts.next})}};var ctxEnd=function(opts){return{token:opts.token,regex:opts.regex,next:contextAware(function(currentState,stack){stack.shift();return stack[0]||"start"})}};this.$rules=parent.$rules;this.$rules.no_regex=[{token:"keyword",regex:"(waitfor|or|and|collapse|spawn|retract)\\b"},{token:"keyword.operator",regex:"(->|=>|\\.\\.)"},{token:"variable.language",regex:"(hold|default)\\b"},ctxBegin({token:"string",regex:"`",next:"bstring"}),ctxBegin({token:"string",regex:'"',next:"qqstring"}),ctxBegin({token:"string",regex:'"',next:"qqstring"}),{token:["paren.lparen","text","paren.rparen"],regex:"(\\{)(\\s*)(\\|)",next:"block_arguments"}].concat(this.$rules.no_regex);this.$rules.block_arguments=[{token:"paren.rparen",regex:"\\|",next:"no_regex"}].concat(this.$rules.function_arguments);this.$rules.bstring=[{token:"constant.language.escape",regex:escapedRe},{token:"string",regex:"\\\\$",next:"bstring"},ctxBegin({token:"paren.lparen",regex:"\\$\\{",next:"string_interp"}),ctxBegin({token:"paren.lparen",regex:"\\$",next:"bstring_interp_single"}),ctxEnd({token:"string",regex:"`"}),{defaultToken:"string"}];this.$rules.qqstring=[{token:"constant.language.escape",regex:escapedRe},{token:"string",regex:"\\\\$",next:"qqstring"},ctxBegin({token:"paren.lparen",regex:"#\\{",next:"string_interp"}),ctxEnd({token:"string",regex:'"'}),{defaultToken:"string"}];var embeddableRules=[];for(var i=0;i<this.$rules.no_regex.length;i++){var rule=this.$rules.no_regex[i];var token=String(rule.token);if(token.indexOf("paren")==-1&&(!rule.next||rule.next.isContextAware)){embeddableRules.push(rule)}}this.$rules.string_interp=[ctxEnd({token:"paren.rparen",regex:"\\}"}),ctxBegin({token:"paren.lparen",regex:"{",next:"string_interp"})].concat(embeddableRules);this.$rules.bstring_interp_single=[{token:["identifier","paren.lparen"],regex:"(\\w+)(\\()",next:"bstring_interp_single_call"},ctxEnd({token:"identifier",regex:"\\w*"})];this.$rules.bstring_interp_single_call=[ctxBegin({token:"paren.lparen",regex:"\\(",next:"bstring_interp_single_call"}),ctxEnd({token:"paren.rparen",regex:"\\)"})].concat(embeddableRules)};oop.inherits(SJSHighlightRules,TextHighlightRules);exports.SJSHighlightRules=SJSHighlightRules});