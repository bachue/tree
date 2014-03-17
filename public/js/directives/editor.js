define(['directives', 'ace'], function(directives) {
    directives.directive('autoSaveSettings', function() {
        return function(scope, element) {
            if (window.localStorage) {
                var editor = ace.edit(element.attr('id'));
                if (localStorage['editor.options'])
                    editor.setOptions(JSON.parse(localStorage['editor.options']));
                if (localStorage['editor.keyBinding'])
                    editor.setKeyboardHandler(localStorage['editor.keyBinding']);

                element.bind('$destroy', function(e) {
                    var editor = ace.edit(e.target.id);
                    var options = editor.getOptions();
                    delete options.mode; // Mode is decided by current file
                    var keyBinding = editor.getKeyboardHandler().$id;
                    localStorage['editor.options'] = JSON.stringify(options);
                    if (keyBinding) localStorage['editor.keyBinding'] = keyBinding;
                    else            localStorage.removeItem('editor.keyBinding');
                    return true;
                });
            }
        };
    });

    directives.directive('autoSaveValue', function() {
        return function(scope, element) {
            if (window.localStorage) {
                var editor = ace.edit(element.attr('id'));
                var path = scope.current.project.name + '/' + scope.current.document_path;

                if (localStorage['editor.session.' + path]) {
                    localStorage['editor.lastSession.' + path] = localStorage['editor.session.' + path];
                }

                scope.$on('aceEditorInitilized', function(e, doc) {
                    if (localStorage['editor.lastSession.' + path] &&
                        localStorage['editor.lastSession.' + path] != doc) {
                        editor.setValue(localStorage['editor.lastSession.' + path], 1);
                    }

                    editor.getSession().on('change', function(e) {
                        localStorage['editor.session.' + path] = editor.getValue();
                    });
                });

                scope.$on('aceEditorCleared', function() {
                    localStorage.removeItem('editor.session.' + path);
                    localStorage.removeItem('editor.lastSession.' + path);
                });
            }
        };
    });
});