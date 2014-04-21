define(['directives', 'ace/ace', 'directives/modals', 'factories/projects', 'factories/modal', 'factories/loading_indicator', 'factories/commit_mode'], function(directives, ace) {
    directives.directive('codeCommitDialog', function(Modal, LoadingIndicator, CommitMode) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/modals/code_commit_dialog.html',
            link: function(scope, element) {
                scope.code_commit_dialog = {};

                Modal.setup_counter(element);
                Modal.setup_autofocus(element);

                element.on('show.bs.modal', function() {
                    if (CommitMode.is_edit_mode())
                        scope.get_diff_info();
                });

                element.on('hidden.bs.modal', function() {
                    delete scope.code_commit_dialog.diff;
                });

            },
            controller: function($scope, $element, $state, $rootScope, Projects) {
                $scope.get_diff_info = function() {
                    var editor = ace.edit('editor');
                    Projects.get($scope.current.project.id).
                        diff_with(CommitMode.get_last_commit_id(), {
                            path: $scope.current.document_path,
                            content: editor.getValue()
                        }).then(function(results) {
                            $scope.code_commit_dialog.diff = results;
                        });
                };

                $scope.placeholder = function() {
                    return CommitMode.current_mode() + ' ' + $state.params.document_path;
                };

                $scope.show_loading_bar = function() {
                    return $scope.code_commit_dialog.pushing || (!$scope.code_commit_dialog.diff && CommitMode.is_edit_mode());
                };

                $scope.do_commit = function() {
                    $scope.code_commit_dialog.pushing = true;
                    if (CommitMode.is_create_mode() || CommitMode.is_edit_mode()) {
                        var editor = ace.edit('editor');
                        Projects.get($scope.current.project.id).
                            update($scope.current.document_path, {
                                content: editor.getValue(),
                                message: $scope.code_commit_dialog.message,
                                description: $scope.code_commit_dialog.description,
                                base: CommitMode.get_last_commit_id()
                            }).then(function() {
                                $rootScope.$broadcast('aceEditorCleared');
                                if (CommitMode.is_create_mode()) {
                                    LoadingIndicator.load();
                                    Projects.get($scope.current.project.id).tag($scope.current.tag_name).tree().
                                        then(function(tree) {
                                            $scope.current.project.directory = tree;
                                        }).finally(LoadingIndicator.loaded);
                                }
                            }).finally(back_to_doc);
                    } else if (CommitMode.is_delete_mode()) {
                        Projects.get($scope.current.project.id).
                            delete($state.params.document_path, {
                                message: $scope.code_commit_dialog.message,
                                description: $scope.code_commit_dialog.description
                            }).then(function() {
                                Projects.get($scope.current.project.id).tag($scope.current.tag_name).tree().
                                    then(function(tree) {
                                        $scope.current.project.directory = tree;
                                    }).finally(close_dialog);
                                delete $scope.current.document_path;
                                delete $scope.current.document;
                                $state.go('application.project.tag.doc', {document_path: null});
                            }, close_dialog); // If error happened, still close the dialog
                    } else {
                        throw 'Unexpected CommitMode.current_mode';
                    }
                };
                function close_dialog() {
                    $scope.code_commit_dialog = {};
                    $element.modal('hide');
                }

                function back_to_doc() {
                    close_dialog();
                    $state.go('application.project.tag.doc', {document_path: $scope.current.document_path});
                }
            }
        };
    });
});
