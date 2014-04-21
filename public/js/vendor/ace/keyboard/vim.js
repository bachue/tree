define(function(require,exports,module){"use strict";var cmds=require("./vim/commands");var coreCommands=cmds.coreCommands;var util=require("./vim/maps/util");var useragent=require("../lib/useragent");var startCommands={i:{command:coreCommands.start},I:{command:coreCommands.startBeginning},a:{command:coreCommands.append},A:{command:coreCommands.appendEnd},"ctrl-f":{command:"gotopagedown"},"ctrl-b":{command:"gotopageup"}};exports.handler={$id:"ace/keyboard/vim",handleMacRepeat:function(data,hashId,key){if(hashId==-1){data.inputChar=key;data.lastEvent="input"}else if(data.inputChar&&data.$lastHash==hashId&&data.$lastKey==key){if(data.lastEvent=="input"){data.lastEvent="input1"}else if(data.lastEvent=="input1"){return true}}else{data.$lastHash=hashId;data.$lastKey=key;data.lastEvent="keypress"}},updateMacCompositionHandlers:function(editor,enable){var onCompositionUpdateOverride=function(text){if(util.currentMode!=="insert"){var el=this.textInput.getElement();el.blur();el.focus();el.value=text}else{this.onCompositionUpdateOrig(text)}};var onCompositionStartOverride=function(text){if(util.currentMode==="insert"){this.onCompositionStartOrig(text)}};if(enable){if(!editor.onCompositionUpdateOrig){editor.onCompositionUpdateOrig=editor.onCompositionUpdate;editor.onCompositionUpdate=onCompositionUpdateOverride;editor.onCompositionStartOrig=editor.onCompositionStart;editor.onCompositionStart=onCompositionStartOverride}}else{if(editor.onCompositionUpdateOrig){editor.onCompositionUpdate=editor.onCompositionUpdateOrig;editor.onCompositionUpdateOrig=null;editor.onCompositionStart=editor.onCompositionStartOrig;editor.onCompositionStartOrig=null}}},handleKeyboard:function(data,hashId,key,keyCode,e){if(hashId!==0&&(!key||keyCode==-1))return null;var editor=data.editor;if(hashId==1)key="ctrl-"+key;if(key=="ctrl-c"){if(!useragent.isMac&&editor.getCopyText()){editor.once("copy",function(){if(data.state=="start")coreCommands.stop.exec(editor);else editor.selection.clearSelection()});return{command:"null",passEvent:true}}return{command:coreCommands.stop}}else if(key=="esc"&&hashId===0||key=="ctrl-["){return{command:coreCommands.stop}}else if(data.state=="start"){if(useragent.isMac&&this.handleMacRepeat(data,hashId,key)){hashId=-1;key=data.inputChar}if(hashId==-1||hashId==1||hashId===0&&key.length>1){if(cmds.inputBuffer.idle&&startCommands[key])return startCommands[key];var isHandled=cmds.inputBuffer.push(editor,key);return{command:"null",passEvent:!isHandled}}else if(key.length==1&&(hashId===0||hashId==4)){return{command:"null",passEvent:true}}else if(key=="esc"&&hashId===0){return{command:coreCommands.stop}}}else{if(key=="ctrl-w"){return{command:"removewordleft"}}}},attach:function(editor){editor.on("click",exports.onCursorMove);if(util.currentMode!=="insert")cmds.coreCommands.stop.exec(editor);editor.$vimModeHandler=this;this.updateMacCompositionHandlers(editor,true)},detach:function(editor){editor.removeListener("click",exports.onCursorMove);util.noMode(editor);util.currentMode="normal";this.updateMacCompositionHandlers(editor,false)},actions:cmds.actions,getStatusText:function(){if(util.currentMode=="insert")return"INSERT";if(util.onVisualMode)return(util.onVisualLineMode?"VISUAL LINE ":"VISUAL ")+cmds.inputBuffer.status;return cmds.inputBuffer.status}};exports.onCursorMove=function(e){cmds.onCursorMove(e.editor,e);exports.onCursorMove.scheduled=false}});