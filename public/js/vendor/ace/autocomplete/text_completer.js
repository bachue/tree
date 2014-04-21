define(function(require,exports,module){var Range=require("../range").Range;var splitRegex=/[^a-zA-Z_0-9\$\-]+/;function getWordIndex(doc,pos){var textBefore=doc.getTextRange(Range.fromPoints({row:0,column:0},pos));return textBefore.split(splitRegex).length-1}function wordDistance(doc,pos){var prefixPos=getWordIndex(doc,pos);var words=doc.getValue().split(splitRegex);var wordScores=Object.create(null);var currentWord=words[prefixPos];words.forEach(function(word,idx){if(!word||word===currentWord)return;var distance=Math.abs(prefixPos-idx);var score=words.length-distance;if(wordScores[word]){wordScores[word]=Math.max(score,wordScores[word])}else{wordScores[word]=score}});return wordScores}exports.getCompletions=function(editor,session,pos,prefix,callback){var wordScore=wordDistance(session,pos,prefix);var wordList=Object.keys(wordScore);callback(null,wordList.map(function(word){return{name:word,value:word,score:wordScore[word],meta:"local"}}))}});