define(['controllers/tag', 'jquery', 'marked', 'textile', 'highlight', 'ace', 'factories/projects'], function(tag_controller, $, marked, textile, hljs) {
    return tag_controller.controller('Edit', function($scope, $state, $sce, $timeout, Projects) {
        if (!$scope.current.tag_name) return;

        if (!$state.params.document_path && $scope.current.document_path)
            return $state.go('application.project.tag.edit', {document_path: $scope.current.document_path}, {location: 'replace'});

        if ($state.params.tag_name !== 'HEAD') {
            return $state.go('application.project.tag.doc', {document_path: null}, {location: 'replace'});
        }

        marked.setOptions({
            highlight: function(code, type) {
                var value;
                if (type) {
                    try {
                        value = hljs.highlight(type, code).value;
                    } catch(err) {
                        value = hljs.highlightAuto(code).value;
                    }
                }
                else
                    value = hljs.highlightAuto(code).value;
                return value;
            }
        });

        $scope.enable_preview = function() {
            $scope.current.preview_mode = 'with_preview';
            if (window.localStorage) localStorage['preview_mode'] = $scope.current.preview_mode;
        };

        $scope.disable_preview = function() {
            $scope.current.preview_mode = 'without_preview';
            if (window.localStorage) localStorage['preview_mode'] = $scope.current.preview_mode;
        };

        $scope.preview_disabled = function() {
            return $scope.current.doc_type && $scope.current.preview_mode == 'without_preview';
        };

        $scope.preview_enabled = function() {
            return $scope.current.doc_type && $scope.current.preview_mode == 'with_preview';
        };

        if (window.localStorage) $scope.current.preview_mode = $scope.current.preview_mode || localStorage['preview_mode'];
        $scope.current.preview_mode = $scope.current.preview_mode || 'with_preview';

        var initialize_ace = function(doc) {
            if(!_.isUndefined(doc['raw'])) {
                var callback;
                $scope.current.raw_document = doc['raw'];
                $scope.current.commit_dialog.base = doc['blob'];
                $scope.current.commit_dialog.last = doc['commit'];

                if (doc['type']) {
                    $scope.current.doc_type = doc['type'];
                    switch (doc['type']) {
                    case 'markdown':
                        callback = function(editor) {
                            var rendered = marked(editor.getValue());
                            var dom = handle($(rendered));
                            return $sce.trustAsHtml($('<div />').append(dom).html());
                        };
                        break;
                    case 'textile':
                        callback = function(editor) {
                            var rendered = textile(editor.getValue());
                            var dom = handle($(rendered));
                            return $sce.trustAsHtml($('<div />').append(dom).html());
                        };
                        break;
                    case 'html':
                        callback = function(editor) {
                            var dom = handle($(editor.getValue()));
                            return $sce.trustAsHtml($('<div />').append(dom).html());
                        };
                        break;
                    default:
                        delete $scope.current.doc_type;
                    }
                }

                $timeout(function() {
                    var editor = ace.edit('editor');
                    editor.setTheme('ace/theme/chrome');
                    if (doc['type']) editor.getSession().setMode('ace/mode/' + doc['type']);
                    editor.setAutoScrollEditorIntoView();
                    editor.setOptions({
                        maxLines: 5000,
                        minLines: 30
                    });
                    editor.setValue(doc['raw'], 1);
                    $scope.$broadcast('aceEditorInitilized', editor, doc['raw']);

                    if (callback) {
                        var update_preview = function() { $scope.current.preview = callback(editor); };
                        editor.getSession().on('change', function() { $timeout(update_preview); });
                        update_preview();
                    }
                }, 100);
            }
        };

        if ($state.params.document_path) {
            $scope.current.document_path = $state.params.document_path;

            if ($state.params.new === 'true') {
                $scope.current.commit_dialog.mode = 'Create';
                initialize_ace({raw: '', blob: null, commit: null, type: $state.params.type});
            } else {
                $scope.current.loading += 1;
                $scope.current.commit_dialog.mode = 'Edit';
                Projects.get($scope.current.project.id).
                    raw($scope.current.document_path).
                    then(initialize_ace, function(error) {
                        if (error.status === 404 && error.data.empty === true)
                            $state.go('application.project.tag.edit', {
                                document_path: $scope.current.document_path,
                                new: true, type: error.data.type
                            }, {location: 'replace'});
                        else
                            // TODO: use dialog lib here
                            alert("You can't create file " + $scope.current.document_path);
                    }).finally(function() {
                        $scope.current.loading -= 1;
                    });
            }
        }
        else throw 'document_path is not set, failed to edit it';

       function handle(dom) {
            dom.find('a[href]').each(function(i, e) { // Important for ui-router
                var href = $(e).attr('href');
                if (href.indexOf('javascript:') !== 0)
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
