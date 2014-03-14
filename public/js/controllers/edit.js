define(['controllers/tag', 'jquery', 'marked', 'highlight', 'ace', 'factories/projects'], function(tag_controller, $, marked, hljs) {
    return tag_controller.controller('Edit', function($scope, $state, $sce, $timeout, Projects) {
        if (!$state.params.document_path && $scope.current.document_path)
            return $state.go('application.project.tag.edit', {document_path: $scope.current.document_path});

        if ($state.params.tag_name !== 'HEAD') {
            return $state.go('application.project.tag.doc', {document_path: null});
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

        $scope.commit_placeholder = function() {
            return ($state.params.new === 'true' ? 'Create' : 'Edit') + ' ' + $state.params.document_path;
        };

        $scope.back_to_doc = function() {
            $scope.$broadcast('aceEditorCleared');
            $scope.current.commit = {};
            $state.go('application.project.tag.doc');
        };

        $scope.do_commit = function() {
            var editor = ace.edit('editor');
            $scope.current.loading += 1;
            Projects.get($scope.current.project.id).
                update($state.params.document_path, {
                    content: editor.getValue(),
                    message: $scope.current.commit.message,
                    description: $scope.current.commit.description,
                    base: $scope.current.commit.base
                }).then(function() {
                    if ($state.params.new === 'true') {
                        $scope.current.loading += 1;
                        Projects.get($scope.current.project.id).tag($scope.current.tag_name).tree().
                            then(function(tree) {
                                $scope.current.project.directory = tree;
                                $scope.select_tree($scope.current.document_path);
                            }).finally(function() {
                                $scope.current.loading -= 1;
                            });
                    }
                }).finally(function() {
                    $scope.current.loading -= 1;
                    $scope.back_to_doc();
                });
        };

        var initialize_ace = function(doc) {
            if(!_.isUndefined(doc['raw'])) {
                $scope.current.raw_document = doc['raw'];
                $scope.current.commit = {base: doc['blob']};

                var editor = ace.edit('editor');
                editor.setTheme('ace/theme/chrome');
                if (doc['type']) editor.getSession().setMode('ace/mode/' + doc['type']);
                editor.setAutoScrollEditorIntoView();
                editor.setOptions({
                    maxLines: 5000,
                    minLines: 30
                });
                editor.setValue(doc['raw'], 1);
                $scope.$broadcast('aceEditorInitilized', doc['raw']);

                if (doc['type']) {
                    switch (doc['type']) {
                    case 'markdown':
                        $scope.current.doc_type = doc['type'];
                        var callback = function() {
                            var rendered = marked(editor.getValue());
                            var dom = handle($(rendered));
                            var html = $sce.trustAsHtml($('<div />').append(dom).html());
                            $timeout(function() {
                                $scope.current.preview = html;
                            });
                        };
                        editor.getSession().on('change', callback);
                        callback();
                        break;
                    case 'textile':
                        $scope.current.doc_type = doc['type'];
                        // TODO: Do it
                        break;
                    }
                }
            }
        };

        if ($state.params.document_path) {
            $scope.current.document_path = $state.params.document_path;

            if ($state.params.new === 'true') {
                initialize_ace({raw: '', blob: null, type: $state.params.type});
            } else {
                $scope.current.loading += 1;
                Projects.get($scope.current.project.id).
                    raw($scope.current.document_path).
                    then(initialize_ace, function(error) {
                        if (error.status === 404 && error.data.empty === true)
                            $state.go('application.project.tag.edit', {
                                document_path: $scope.current.document_path,
                                new: true, type: error.data.type
                            });
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
                if (href.indexOf('javascript:') != 0)
                    $(e).attr('href', 'javascript:open("' + correct_url(href) + '");');
            });

            dom.find('img,audio,video').each(function(i, e) {
                $(e).attr('src', correct_url($(e).attr('src')));
            });

            return dom;

            function correct_url(src) {
                var url;
                if (src.indexOf('://') !== -1 || src.indexOf('/') !== 0) {
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
