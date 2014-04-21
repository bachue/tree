define(function(require,exports,module){"use strict";var keyUtil=require("../lib/keys");var useragent=require("../lib/useragent");function HashHandler(config,platform){this.platform=platform||(useragent.isMac?"mac":"win");this.commands={};this.commandKeyBinding={};if(this.__defineGetter__&&this.__defineSetter__&&typeof console!="undefined"&&console.error){var warned=false;var warn=function(){if(!warned){warned=true;console.error("commmandKeyBinding has too many m's. use commandKeyBinding")}};this.__defineGetter__("commmandKeyBinding",function(){warn();return this.commandKeyBinding});this.__defineSetter__("commmandKeyBinding",function(val){warn();return this.commandKeyBinding=val})}else{this.commmandKeyBinding=this.commandKeyBinding}this.addCommands(config)}(function(){this.addCommand=function(command){if(this.commands[command.name])this.removeCommand(command);this.commands[command.name]=command;if(command.bindKey)this._buildKeyHash(command)};this.removeCommand=function(command){var name=typeof command==="string"?command:command.name;command=this.commands[name];delete this.commands[name];var ckb=this.commandKeyBinding;for(var hashId in ckb){for(var key in ckb[hashId]){if(ckb[hashId][key]==command)delete ckb[hashId][key]}}};this.bindKey=function(key,command){if(!key)return;if(typeof command=="function"){this.addCommand({exec:command,bindKey:key,name:command.name||key});return}var ckb=this.commandKeyBinding;key.split("|").forEach(function(keyPart){var binding=this.parseKeys(keyPart,command);var hashId=binding.hashId;(ckb[hashId]||(ckb[hashId]={}))[binding.key]=command},this)};this.addCommands=function(commands){commands&&Object.keys(commands).forEach(function(name){var command=commands[name];if(!command)return;if(typeof command==="string")return this.bindKey(command,name);if(typeof command==="function")command={exec:command};if(typeof command!=="object")return;if(!command.name)command.name=name;this.addCommand(command)},this)};this.removeCommands=function(commands){Object.keys(commands).forEach(function(name){this.removeCommand(commands[name])},this)};this.bindKeys=function(keyList){Object.keys(keyList).forEach(function(key){this.bindKey(key,keyList[key])},this)};this._buildKeyHash=function(command){var binding=command.bindKey;if(!binding)return;var key=typeof binding=="string"?binding:binding[this.platform];this.bindKey(key,command)};this.parseKeys=function(keys){if(keys.indexOf(" ")!=-1)keys=keys.split(/\s+/).pop();var parts=keys.toLowerCase().split(/[\-\+]([\-\+])?/).filter(function(x){return x});var key=parts.pop();var keyCode=keyUtil[key];if(keyUtil.FUNCTION_KEYS[keyCode])key=keyUtil.FUNCTION_KEYS[keyCode].toLowerCase();else if(!parts.length)return{key:key,hashId:-1};else if(parts.length==1&&parts[0]=="shift")return{key:key.toUpperCase(),hashId:-1};var hashId=0;for(var i=parts.length;i--;){var modifier=keyUtil.KEY_MODS[parts[i]];if(modifier==null){if(typeof console!="undefined")console.error("invalid modifier "+parts[i]+" in "+keys);return false}hashId|=modifier}return{key:key,hashId:hashId}};this.findKeyCommand=function findKeyCommand(hashId,keyString){var ckbr=this.commandKeyBinding;return ckbr[hashId]&&ckbr[hashId][keyString]};this.handleKeyboard=function(data,hashId,keyString,keyCode){return{command:this.findKeyCommand(hashId,keyString)}}}).call(HashHandler.prototype);exports.HashHandler=HashHandler});