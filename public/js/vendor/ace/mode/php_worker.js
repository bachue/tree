define(function(require,exports,module){"use strict";var oop=require("../lib/oop");var Mirror=require("../worker/mirror").Mirror;var PHP=require("./php/php").PHP;var PhpWorker=exports.PhpWorker=function(sender){Mirror.call(this,sender);this.setTimeout(500)};oop.inherits(PhpWorker,Mirror);(function(){this.setOptions=function(opts){this.inlinePhp=opts&&opts.inline};this.onUpdate=function(){var value=this.doc.getValue();var errors=[];if(this.inlinePhp)value="<?"+value+"?>";var tokens=PHP.Lexer(value,{short_open_tag:1});try{new PHP.Parser(tokens)}catch(e){errors.push({row:e.line-1,column:null,text:e.message.charAt(0).toUpperCase()+e.message.substring(1),type:"error"})}if(errors.length){this.sender.emit("error",errors)}else{this.sender.emit("ok")}}}).call(PhpWorker.prototype)});