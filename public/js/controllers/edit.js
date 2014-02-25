define(['controllers/tag', 'ace', 'factories/projects'], function(tag_controller) {
    return tag_controller.controller('Edit', function($scope, $state, Projects) {
        if (!$state.params.document_path && $scope.current.document_path)
            return $state.go('application.project.tag.edit', {document_path: $scope.current.document_path});

        if ($state.params.tag_name !== 'HEAD') {
            return $state.go('application.project.tag.doc', {document_path: null});
        }

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
    });
});
