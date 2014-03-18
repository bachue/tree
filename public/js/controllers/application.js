define(['controllers', 'promise!loaders/projects', 'factories/projects', 'ace'], function(controllers, projects) {
    return controllers.controller('Application', function($scope, $state, $location, $timeout, Projects) {
        $scope.current = {};
        $scope.current.config_dialog = {branch: 'master'};
        $scope.current.new_tag_dialog = {};
        $scope.current.commit_dialog = {};
        $scope.current.searchbar = {};
        $scope.current.tag_diff_dialog = {};
        $scope.current.opening_modal = 0;
        $scope.current.loading = 0;

        if (window.localStorage) $scope.current.screen_mode = localStorage['screen_mode'];
        $scope.current.screen_mode = $scope.current.screen_mode || 'sidebar-mode';

        $scope.submit_config = function() {
            $scope.current.config_dialog.cloning = true;
            Projects.new($scope.current.config_dialog).
                then(function(project) {
                    $scope.projects.push(project);
                    $scope.current.config_dialog = {branch: 'master'};
                    $scope.set_current_project(project.name);
                }).finally(function() {
                    delete $scope.current.config_dialog.cloning;
                    hide_project_config_dialog();
                });
        };

        $scope.set_current_project = function(name) {
            if ($scope.current.project && $scope.current.project.name === name)
                return;
            delete $scope.current.tag_name;
            delete $scope.current.sections;
            delete $scope.current.document;
            delete $scope.current.document_path;
            $scope.current.searchbar = {};
            $scope.current.commit_dialog = {};
            $scope.current.new_tag_dialog = {};
            $scope.current.tag_diff_dialog = {};
            // We don't specify tag_name in this project, so it'll be set to default value 'HEAD'
            $state.go('application.project', {project_name: name, tag_name: 'HEAD', document_path: null});
        };

        $scope.set_current_tag = function(tag_name) {
            if ($scope.current.tag === tag_name) return;
            delete $scope.current.sections;
            $scope.current.searchbar = {};
            $state.go('application.project.tag.doc', {tag_name: tag_name});
        };

        $scope.add_tag = function() {
            $scope.current.new_tag_dialog.pushing = true;
            Projects.get($scope.current.project.id).
                create_tag($scope.current.new_tag_dialog.tag_name).
                then(function(project) {
                    $scope.current.new_tag_dialog = {};
                    $scope.current.project.tags = project.tags;
                }).finally(function() {
                    delete $scope.current.new_tag_dialog.pushing;
                    hide_new_tag_dialog();
                });
        };

        // This helper selects all tags from current project, but without currect tag
        $scope.existed_tags_without_current = function() {
            return _.without(['HEAD'].concat($scope.current.project.tags), $scope.current.tag_name);
        };

        $scope.do_diff_between_tags = function() {
            $scope.current.tag_diff_dialog.processing = true;
            Projects.get($scope.current.project.id).
                tag($scope.current.tag_name).
                diff($scope.current.tag_diff_dialog.tag).
                then(function(results) {
                    $scope.current.tag_diff_dialog.diff_results = results;
                }).finally(function() {
                    delete $scope.current.tag_diff_dialog.processing;
                });
        };

        $('#tag-diff-dialog.modal').on('hidden.bs.modal', function() {
            $timeout(function() {
                delete $scope.current.tag_diff_dialog.diff_results;
            });
        });

        $scope.search = function() {
            if (!$scope.current.searchbar.query) return;
            $scope.current.searchbar.searching = true;
            Projects.get($scope.current.project.id).
                tag($scope.current.tag_name).
                search({q: $scope.current.searchbar.query}).
                then(function(results) {
                    $scope.current.searchbar.results = {};
                    $scope.current.searchbar.results.both = _.intersection(results.filenames, results.content);
                    $scope.current.searchbar.results.filenames = _.difference(results.filenames, results.content);
                    $scope.current.searchbar.results.content = _.difference(results.content, results.filenames);
                }).finally(function() {
                    delete $scope.current.searchbar.searching;
                });
        };

        $scope.open_path = function(path) {
            $state.go('application.project.tag.doc', {document_path: path});
            $scope.select_tree(path);
            $('#project-search').modal('hide');
        };

        $scope.create_new_repo = function() {
            if($scope.current.config_dialog.name.length > 1)
                $scope.current.config_dialog.url =
                    CONSTANTS['NEW_REPO_PREFIX'] + $scope.current.config_dialog.name;
        };

        $scope.select_tree = function(path) {
            if (path) $scope.$broadcast('toSelectBranches', path);
        };

        var close_commit_dialog = function() {
            $scope.current.commit_dialog = {};
            $('#commit-dialog').modal('hide');
        };

        var back_to_doc = function() {
            close_commit_dialog();
            $scope.$broadcast('aceEditorCleared');
            $state.go('application.project.tag.doc', {document_path: $scope.current.document_path});
        };

        $scope.cancel_and_back_to_doc = function() {
            if ($scope.current.commit_dialog.mode == 'Create')
                delete $scope.current.document_path;
            back_to_doc();
        };

        $scope.commit_placeholder = function() {
            // $scope.current.commit_dialog.mode could be 'Create', 'Edit' or 'Remove'
            return $scope.current.commit_dialog.mode + ' ' + $state.params.document_path;
        };

        $scope.open_commit_dialog = function() {
            $('#commit-dialog').modal('show');
        };

        $scope.open_removing_commit_dialog = function() {
            $scope.current.commit_dialog.mode = 'Delete';
            $scope.open_commit_dialog();
        };

        $scope.is_full_mode = function() {
            return $scope.current.screen_mode == 'full-mode';
        };

        $scope.set_full_mode = function() {
            $timeout(function() {
                $scope.current.screen_mode = 'full-mode';
                if (window.localStorage) localStorage['screen_mode'] = $scope.current.screen_mode;
            });
        };

        $scope.set_split_mode = function() {
            $timeout(function() {
                $scope.current.screen_mode = 'sidebar-mode';
                if (window.localStorage) localStorage['screen_mode'] = $scope.current.screen_mode;
            });
        };

        $scope.do_commit = function() {
            $scope.current.commit_dialog.pushing = true;
            switch($scope.current.commit_dialog.mode) {
            case 'Create':
            case 'Edit':
                var editor = ace.edit('editor');
                Projects.get($scope.current.project.id).
                update($scope.current.document_path, {
                    content: editor.getValue(),
                    message: $scope.current.commit_dialog.message,
                    description: $scope.current.commit_dialog.description,
                    base: $scope.current.commit_dialog.base
                }).then(function() {
                    if ($scope.current.commit_dialog.mode == 'Create') {
                        $scope.current.loading += 1;
                        Projects.get($scope.current.project.id).tag($scope.current.tag_name).tree().
                            then(function(tree) {
                                $scope.current.project.directory = tree;
                                $scope.select_tree($scope.current.document_path);
                            }).finally(function() {
                                $scope.current.loading -= 1;
                            });
                    }
                }).finally(back_to_doc);
                break;
            case 'Delete':
                Projects.get($scope.current.project.id).
                    delete($state.params.document_path, {
                        message: $scope.current.commit_dialog.message,
                        description: $scope.current.commit_dialog.description
                    }).then(function() {
                        Projects.get($scope.current.project.id).tag($scope.current.tag_name).tree().
                            then(function(tree) {
                                $scope.current.project.directory = tree;
                                $scope.select_tree($scope.current.document_path);
                            }).finally(close_commit_dialog);
                        delete $scope.current.document_path;
                        $state.go('application.project.tag.doc', {document_path: null});
                    });
                    break;
            default:
                throw 'Unexpected commit_dialog.mode';
            }
        };

        $('.modal').on('show.bs.modal', function() {
            $scope.current.opening_modal++;
        });

        $('.modal').on('hide.bs.modal', function() {
            $scope.current.opening_modal--;
        });

        $('.modal').each(function(idx, modal) {
            $(modal).on('shown.bs.modal', function() {
                $('input[type=text]:first', modal).focus();
            });
        });

        $('body').keypress(function(e) {
            if ($scope.current.opening_modal === 0 &&
                $state.current.controller != 'Edit') {
                switch (e.which) {
                case 43:
                    $('#project-config').modal('show');
                    break;
                case 47:
                    $('#project-search').modal('show');
                    break;
                case 63:
                    $('#project-help').modal('show');
                    break;
                }
            }
        });

        $scope.keypress_in_query = function(e) {
            if (e.which === 13) $scope.search();
        };

        $scope.projects = projects;
        $state.go('application.project', {}, {location: 'replace'});

        function hide_project_config_dialog() {
            $('#project-config').modal('hide');
        }

        function hide_new_tag_dialog() {
            $('#new-tag-dialog').modal('hide');
        }
    });
});
