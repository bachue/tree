define(function(require,exports,module){"use strict";var generateSettingsMenu=require("./menu_tools/generate_settings_menu").generateSettingsMenu;var overlayPage=require("./menu_tools/overlay_page").overlayPage;function showSettingsMenu(editor){var sm=document.getElementById("ace_settingsmenu");if(!sm)overlayPage(editor,generateSettingsMenu(editor),"0","0","0")}module.exports.init=function(editor){var Editor=require("ace/editor").Editor;Editor.prototype.showSettingsMenu=function(){showSettingsMenu(this)}}});