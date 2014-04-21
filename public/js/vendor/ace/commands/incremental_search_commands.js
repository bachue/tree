define(function(require,exports,module){var config=require("../config");var oop=require("../lib/oop");var HashHandler=require("../keyboard/hash_handler").HashHandler;var occurStartCommand=require("./occur_commands").occurStartCommand;exports.iSearchStartCommands=[{name:"iSearch",bindKey:{win:"Ctrl-F",mac:"Command-F"},exec:function(editor,options){config.loadModule(["core","ace/incremental_search"],function(e){var iSearch=e.iSearch=e.iSearch||new e.IncrementalSearch;iSearch.activate(editor,options.backwards);if(options.jumpToFirstMatch)iSearch.next(options)})},readOnly:true},{name:"iSearchBackwards",exec:function(editor,jumpToNext){editor.execCommand("iSearch",{backwards:true})},readOnly:true},{name:"iSearchAndGo",bindKey:{win:"Ctrl-K",mac:"Command-G"},exec:function(editor,jumpToNext){editor.execCommand("iSearch",{jumpToFirstMatch:true,useCurrentOrPrevSearch:true})},readOnly:true},{name:"iSearchBackwardsAndGo",bindKey:{win:"Ctrl-Shift-K",mac:"Command-Shift-G"},exec:function(editor){editor.execCommand("iSearch",{jumpToFirstMatch:true,backwards:true,useCurrentOrPrevSearch:true})},readOnly:true}];exports.iSearchCommands=[{name:"restartSearch",bindKey:{win:"Ctrl-F",mac:"Command-F"},exec:function(iSearch){iSearch.cancelSearch(true)},readOnly:true,isIncrementalSearchCommand:true},{name:"searchForward",bindKey:{win:"Ctrl-S|Ctrl-K",mac:"Ctrl-S|Command-G"},exec:function(iSearch,options){options.useCurrentOrPrevSearch=true;iSearch.next(options)},readOnly:true,isIncrementalSearchCommand:true},{name:"searchBackward",bindKey:{win:"Ctrl-R|Ctrl-Shift-K",mac:"Ctrl-R|Command-Shift-G"},exec:function(iSearch,options){options.useCurrentOrPrevSearch=true;options.backwards=true;iSearch.next(options)},readOnly:true,isIncrementalSearchCommand:true},{name:"extendSearchTerm",exec:function(iSearch,string){iSearch.addString(string)},readOnly:true,isIncrementalSearchCommand:true},{name:"extendSearchTermSpace",bindKey:"space",exec:function(iSearch){iSearch.addString(" ")},readOnly:true,isIncrementalSearchCommand:true},{name:"shrinkSearchTerm",bindKey:"backspace",exec:function(iSearch){iSearch.removeChar()},readOnly:true,isIncrementalSearchCommand:true},{name:"confirmSearch",bindKey:"return",exec:function(iSearch){iSearch.deactivate()},readOnly:true,isIncrementalSearchCommand:true},{name:"cancelSearch",bindKey:"esc|Ctrl-G",exec:function(iSearch){iSearch.deactivate(true)},readOnly:true,isIncrementalSearchCommand:true},{name:"occurisearch",bindKey:"Ctrl-O",exec:function(iSearch){var options=oop.mixin({},iSearch.$options);iSearch.deactivate();occurStartCommand.exec(iSearch.$editor,options)},readOnly:true,isIncrementalSearchCommand:true},{name:"yankNextWord",bindKey:"Ctrl-w",exec:function(iSearch){var ed=iSearch.$editor,range=ed.selection.getRangeOfMovements(function(sel){sel.moveCursorWordRight()}),string=ed.session.getTextRange(range);iSearch.addString(string)},readOnly:true,isIncrementalSearchCommand:true},{name:"yankNextChar",bindKey:"Ctrl-Alt-y",exec:function(iSearch){var ed=iSearch.$editor,range=ed.selection.getRangeOfMovements(function(sel){sel.moveCursorRight()}),string=ed.session.getTextRange(range);iSearch.addString(string)},readOnly:true,isIncrementalSearchCommand:true},{name:"recenterTopBottom",bindKey:"Ctrl-l",exec:function(iSearch){iSearch.$editor.execCommand("recenterTopBottom")},readOnly:true,isIncrementalSearchCommand:true}];function IncrementalSearchKeyboardHandler(iSearch){this.$iSearch=iSearch}oop.inherits(IncrementalSearchKeyboardHandler,HashHandler);(function(){this.attach=function(editor){var iSearch=this.$iSearch;HashHandler.call(this,exports.iSearchCommands,editor.commands.platform);this.$commandExecHandler=editor.commands.addEventListener("exec",function(e){if(!e.command.isIncrementalSearchCommand)return undefined;e.stopPropagation();e.preventDefault();return e.command.exec(iSearch,e.args||{})})};this.detach=function(editor){if(!this.$commandExecHandler)return;editor.commands.removeEventListener("exec",this.$commandExecHandler);delete this.$commandExecHandler};var handleKeyboard$super=this.handleKeyboard;this.handleKeyboard=function(data,hashId,key,keyCode){if((hashId===1||hashId===8)&&key==="v"||hashId===1&&key==="y")return null;var cmd=handleKeyboard$super.call(this,data,hashId,key,keyCode);if(cmd.command){return cmd}if(hashId==-1){var extendCmd=this.commands.extendSearchTerm;if(extendCmd){return{command:extendCmd,args:key}}}return{command:"null",passEvent:hashId==0||hashId==4}}}).call(IncrementalSearchKeyboardHandler.prototype);exports.IncrementalSearchKeyboardHandler=IncrementalSearchKeyboardHandler});