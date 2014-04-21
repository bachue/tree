define(['controllers/tag', 'jquery', 'bootbox', 'ace/ace', 'jquery_cookie', 'factories/projects', 'factories/preview', 'factories/loading_indicator', 'factories/preview_mode', 'factories/notice', 'factories/commit_mode', 'factories/comments_pre_handler'], function(tag_controller, $, bootbox, ace) {
    return tag_controller.controller('Edit', function($scope, $state, $timeout, Projects, PreviewFactory, LoadingIndicator, PreviewMode, Notice, CommitMode, CommentsPreHandler) {
        if (!$scope.current.project || !$scope.current.tag_name) return;

        if (!$state.params.document_path && $scope.current.document_path)
            return $state.go('application.project.tag.edit', {document_path: $scope.current.document_path}, {location: 'replace'});

        if ($state.params.tag_name !== 'HEAD')
            return $state.go('application.project.tag.doc', {document_path: null}, {location: 'replace'});

        $scope.supported_languages = {
            'Ruby': 'ruby', 'Html/XML': 'xml', 'CSS': 'css', 'Javascript': 'js', 'JSON': 'json', 'YAML': 'yml', 'Python': 'py', 'C/C++': 'cpp', 'Java': 'java', 'SQL': 'sql', 'Bash': 'bash', 'Apache Config': 'apache', 'Nginx Config': 'nginx'
        };

        $scope.insert_code_section = function(lang) {
            var editor = ace.edit('editor'), position = editor.getCursorPosition(), prefix = '', newLine = false;

            editor.getSelection().selectLineStart();
            if (editor.getSelectedText().match(/^\s*$/))
                prefix = editor.getSelectedText();
            else
                newLine = true;

            editor.getSelection().clearSelection();
            editor.getSelection().moveCursorToPosition(position);
            if (newLine) {
                editor.getSession().insert(position, "\n");
                position = editor.getCursorPosition();
            }
            editor.getSession().insert(position, '```' + lang + "\n" + prefix + "\n" + prefix + '```');
            editor.getSelection().moveCursorToPosition({row: position.row + 1, column: prefix.length});
            editor.focus();
        };

        $scope.insert_comment_section = function() {
            var editor = ace.edit('editor'), range = editor.getSelectionRange(), content = editor.getValue(), uid, name = $.cookie('current_user.name');
            for (uid = 1; content.match('<' + uid + '>'); ++uid);

            editor.getSelection().clearSelection();
            editor.getSelection().moveCursorToPosition(range.start);
            editor.getSession().insert(range.start, '[');

            range.end.column++;
            editor.getSelection().moveCursorToPosition(range.end);
            editor.getSession().insert(range.end, ']<' + uid + '>');
            editor.getSelection().moveCursorFileEnd();
            if (!content.match(/\n{2}$/))
                editor.getSession().insert(editor.getCursorPosition(), "\n");
            editor.getSession().insert(editor.getCursorPosition(), '<' + uid + '>:\n' + (name ? name + ': ' : '') + 'comment');
            editor.getSelection().selectAWord();
            editor.focus();
        };

        $scope.enable_preview = function() {
            PreviewMode.enable_preview_mode();
            if (window.localStorage) localStorage['preview_mode'] = PreviewMode.get();
        };

        $scope.disable_preview = function() {
            PreviewMode.disable_preview_mode();
            if (window.localStorage) localStorage['preview_mode'] = PreviewMode.get();
        };

        $scope.preview_disabled = function() {
            return $scope.doc_type && PreviewMode.preview_disabled();
        };

        $scope.preview_enabled = function() {
            return $scope.doc_type && PreviewMode.preview_enabled();
        };

        $scope.current_preview_mode = PreviewMode.get;

        $scope.cancel_and_back_to_doc = function() {
            bootbox.confirm({
                message: "Your changes will be lost.<br /><br />Are you sure you want to leave this page?",
                buttons: {
                    cancel: {label: 'No'},
                    confirm: {className: 'btn-danger', label: 'Sure'}
                },
                callback: function(result) {
                    if (result) {
                        if (CommitMode.is_create_mode())
                            delete $scope.current.document_path;
                        $scope.$broadcast('aceEditorCleared');
                        $state.go('application.project.tag.doc', {document_path: $scope.current.document_path});
                    }
                }
            });
        };

        if (window.localStorage && PreviewMode.is_undefined())
            PreviewMode.set(localStorage['preview_mode']);

        if (PreviewMode.is_undefined()) PreviewMode.switch_to_default_mode();

        var initialize_ace = function(doc) {
            if(!_.isUndefined(doc['raw'])) {
                var renderer;
                if (doc['last_commit']) CommitMode.set_last_commit_id(doc['last_commit']);

                if (doc['type']) {
                    $scope.doc_type = doc['type'];
                    renderer = PreviewFactory.renderer(doc['type'], {
                        before: function(content, type) {
                            content = CommentsPreHandler.render(content);
                            if (type === 'markdown')
                                return content.replace(/\[\[([^\]]+)\]\]/g, '[$1]($1)');
                            else
                                return content;
                        },
                        after: handle
                    });
                }

                $timeout(function() {
                    var editor = ace.edit('editor');
                    if (!editor.getTheme()) editor.setTheme('ace/theme/chrome');
                    if (doc['type']) editor.getSession().setMode('ace/mode/' + doc['type']);
                    editor.setAutoScrollEditorIntoView();
                    editor.setOptions({
                        maxLines: 5000,
                        minLines: 30
                    });
                    editor.setValue(doc['raw'], 1);
                    $scope.$broadcast('aceEditorInitilized', editor, doc['raw']);

                    if (renderer) {
                        var update_preview = function() {
                            $scope.preview = renderer(editor);
                            $timeout(function() { $scope.$broadcast('renderComments'); });
                        };
                        editor.getSession().on('change', function() { $timeout(update_preview); });
                        update_preview();
                    }
                }, 100);
            }
        };

        if ($state.params.document_path) {
            $scope.current.document_path = $state.params.document_path;
            $scope.select_tree($scope.current.document_path);

            if ($state.params.new === 'true') {
                CommitMode.switch_to_create_mode();
                initialize_ace({raw: '', last_commit: $state.params.last_commit, type: $state.params.type});
            } else {
                LoadingIndicator.load();
                CommitMode.switch_to_edit_mode();
                Projects.get($scope.current.project.id).
                    tag($scope.current.tag_name).
                    raw($scope.current.document_path).
                    then(initialize_ace, function(error) {
                        if (error.status === 404 && error.data.empty === true)
                            $state.go('application.project.tag.edit', {
                                document_path: $scope.current.document_path,
                                new: true, type: error.data.type, last_commit: error.data.last_commit
                            }, {location: 'replace'});
                        else if (error.status === 404 && error.data.not_found === true)
                            Notice.warning("Sorry, You're forbidden to create file " + $scope.current.document_path);
                    }).finally(LoadingIndicator.loaded);
            }
        }
        else throw 'document_path is not set, failed to edit it';

       function handle(dom) {
            dom.find('a[href]').each(function(i, e) { // Important for ui-router
                var href = $(e).attr('href');
                if (href.indexOf('javascript:') === -1)
                    $(e).attr('href', 'javascript:open("' + correct_url(href) + '");');
            });

            dom.find('img,audio,video').each(function(i, e) {
                $(e).attr('src', correct_url($(e).attr('src')));
            });

            return dom;

            function correct_url(src) {
                var url = src;
                if (src.indexOf('://') === -1 && src.indexOf('/') !== 0) {
                    url  = '/' + $scope.current.project.name;
                    url += '/' + $scope.current.tag_name;
                    var base = $scope.current.document_path.split('/').slice(0, -1).join('/');
                    url += '/' + base + '/' + src;
                }
                return url;
            }
        }
    });
});
