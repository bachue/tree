define(function(require,exports,module){"use strict";var UndoManager=function(){this.reset()};(function(){this.execute=function(options){var deltas=options.args[0];this.$doc=options.args[1];if(options.merge&&this.hasUndo()){this.dirtyCounter--;deltas=this.$undoStack.pop().concat(deltas)}this.$undoStack.push(deltas);this.$redoStack=[];if(this.dirtyCounter<0){this.dirtyCounter=NaN}this.dirtyCounter++};this.undo=function(dontSelect){var deltas=this.$undoStack.pop();var undoSelectionRange=null;if(deltas){undoSelectionRange=this.$doc.undoChanges(deltas,dontSelect);this.$redoStack.push(deltas);this.dirtyCounter--}return undoSelectionRange};this.redo=function(dontSelect){var deltas=this.$redoStack.pop();var redoSelectionRange=null;if(deltas){redoSelectionRange=this.$doc.redoChanges(deltas,dontSelect);this.$undoStack.push(deltas);this.dirtyCounter++}return redoSelectionRange};this.reset=function(){this.$undoStack=[];this.$redoStack=[];this.dirtyCounter=0};this.hasUndo=function(){return this.$undoStack.length>0};this.hasRedo=function(){return this.$redoStack.length>0};this.markClean=function(){this.dirtyCounter=0};this.isClean=function(){return this.dirtyCounter===0}}).call(UndoManager.prototype);exports.UndoManager=UndoManager});