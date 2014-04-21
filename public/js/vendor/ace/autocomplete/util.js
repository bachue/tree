define(function(require,exports,module){"use strict";exports.parForEach=function(array,fn,callback){var completed=0;var arLength=array.length;if(arLength===0)callback();for(var i=0;i<arLength;i++){fn(array[i],function(result,err){completed++;if(completed===arLength)callback(result,err)})}};var ID_REGEX=/[a-zA-Z_0-9\$-]/;exports.retrievePrecedingIdentifier=function(text,pos,regex){regex=regex||ID_REGEX;var buf=[];for(var i=pos-1;i>=0;i--){if(regex.test(text[i]))buf.push(text[i]);else break}return buf.reverse().join("")};exports.retrieveFollowingIdentifier=function(text,pos,regex){regex=regex||ID_REGEX;var buf=[];for(var i=pos;i<text.length;i++){if(regex.test(text[i]))buf.push(text[i]);else break}return buf}});