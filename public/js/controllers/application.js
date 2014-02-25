define(['controllers', 'promise!loaders/projects', 'factories/projects'], function(controllers, projects) {
    return controllers.controller('Application', function($scope, $state, $location, Projects) {
        $scope.current = {};
        $scope.current.config_dialog = {branch: 'master'};
        $scope.current.new_tag_dialog = {};
        $scope.current.removing_commit_dialog = {};
        $scope.current.searchbar = {};
        $scope.current.opening_modal = 0;
        $scope.current.loading = 0;

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
            $scope.current.removing_commit_dialog = {};
            $scope.current.new_tag_dialog = {};
            // We don't specify tag_name in this project, so it'll be set to default value 'HEAD'
            $state.go('application.project', {project_name: name, tag_name: 'HEAD', document_path: null});
        };

        $scope.set_current_tag = function(tag_name) {
            if ($scope.current.tag === tag_name) return;
            delete $scope.current.sections;
            $scope.current.searchbar = {};
            $state.go('application.project.tag.doc', {tag_name: tag_name});
        };

        $scope.open_new_tag_dialog = function() {
            $('#new-tag-dialog').modal('show');
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

        $scope.do_removing_commit = function() {
            $scope.current.removing_commit_dialog.pushing = true;
            Projects.get($scope.current.project.id).
                delete($state.params.document_path, {
                    message: $scope.current.removing_commit_dialog.message,
                    description: $scope.current.removing_commit_dialog.description
                }).then(function() {
                    $scope.current.loading += 1;
                    Projects.get($scope.current.project.id).tag($scope.current.tag_name).tree().
                        then(function(tree) {
                            $scope.current.project.directory = tree;
                            $scope.select_tree($scope.current.document_path);
                        }).finally(function() {
                            $scope.current.loading -= 1;
                        });
                    delete $scope.current.document_path;
                    $state.go('application.project.tag.doc', {document_path: null});
                }).finally(function() {
                    $('#removing-commit-dialog').modal('hide');
                    $scope.current.removing_commit_dialog = {};
                });
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
        $state.go('application.project');

        function hide_project_config_dialog() {
            $('#project-config').modal('hide');
        }

        function hide_new_tag_dialog() {
            $('#new-tag-dialog').modal('hide');
        }
    });
});
