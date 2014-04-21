define(function(require,exports,module){"use strict";var oop=require("./lib/oop");var Range=require("./range").Range;var Search=require("./search").Search;var EditSession=require("./edit_session").EditSession;var SearchHighlight=require("./search_highlight").SearchHighlight;function Occur(){}oop.inherits(Occur,Search);(function(){this.enter=function(editor,options){if(!options.needle)return false;var pos=editor.getCursorPosition();this.displayOccurContent(editor,options);var translatedPos=this.originalToOccurPosition(editor.session,pos);editor.moveCursorToPosition(translatedPos);return true};this.exit=function(editor,options){var pos=options.translatePosition&&editor.getCursorPosition();var translatedPos=pos&&this.occurToOriginalPosition(editor.session,pos);this.displayOriginalContent(editor);if(translatedPos)editor.moveCursorToPosition(translatedPos);return true};this.highlight=function(sess,regexp){var hl=sess.$occurHighlight=sess.$occurHighlight||sess.addDynamicMarker(new SearchHighlight(null,"ace_occur-highlight","text"));hl.setRegexp(regexp);sess._emit("changeBackMarker")};this.displayOccurContent=function(editor,options){this.$originalSession=editor.session;var found=this.matchingLines(editor.session,options);var lines=found.map(function(foundLine){return foundLine.content});var occurSession=new EditSession(lines.join("\n"));occurSession.$occur=this;occurSession.$occurMatchingLines=found;editor.setSession(occurSession);this.$useEmacsStyleLineStart=this.$originalSession.$useEmacsStyleLineStart;occurSession.$useEmacsStyleLineStart=this.$useEmacsStyleLineStart;this.highlight(occurSession,options.re);occurSession._emit("changeBackMarker")};this.displayOriginalContent=function(editor){editor.setSession(this.$originalSession);this.$originalSession.$useEmacsStyleLineStart=this.$useEmacsStyleLineStart};this.originalToOccurPosition=function(session,pos){var lines=session.$occurMatchingLines;var nullPos={row:0,column:0};if(!lines)return nullPos;for(var i=0;i<lines.length;i++){if(lines[i].row===pos.row)return{row:i,column:pos.column}}return nullPos};this.occurToOriginalPosition=function(session,pos){var lines=session.$occurMatchingLines;if(!lines||!lines[pos.row])return pos;return{row:lines[pos.row].row,column:pos.column}};this.matchingLines=function(session,options){options=oop.mixin({},options);if(!session||!options.needle)return[];var search=new Search;search.set(options);return search.findAll(session).reduce(function(lines,range){var row=range.start.row;var last=lines[lines.length-1];return last&&last.row===row?lines:lines.concat({row:row,content:session.getLine(row)})},[])}}).call(Occur.prototype);var dom=require("./lib/dom");dom.importCssString(".ace_occur-highlight {\n    border-radius: 4px;\n    background-color: rgba(87, 255, 8, 0.25);\n    position: absolute;\n    z-index: 4;\n    -moz-box-sizing: border-box;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n    box-shadow: 0 0 4px rgb(91, 255, 50);\n}\n.ace_dark .ace_occur-highlight {\n    background-color: rgb(80, 140, 85);\n    box-shadow: 0 0 4px rgb(60, 120, 70);\n}\n","incremental-occur-highlighting");exports.Occur=Occur});