define(['controllers', 'promise!loaders/projects'], function(controllers, projects) {
    return controllers.controller('Application', function($scope, $state, $location, Restangular) {
        $scope.current = {};
        $scope.current.config_dialog = {branch: 'master'};
        $scope.current.new_tag_dialog = {};
        $scope.current.searchbar = {};
        $scope.current.opening_modal = 0;
        $scope.current.loading = 0;

        $scope.submit_config = function() {
            $scope.current.config_dialog.cloning = true;
            Restangular.all('projects').post($scope.current.config_dialog).then(function(result) {
                if (result && !result['error']) {
                    $scope.projects.push(result);
                    $scope.current.config_dialog = {branch: 'master'};
                    $state.go('application.project', {project_name: result.name});
                    hide_project_config_dialog();
                } else {
                    // TODO: Error handling
                    delete $scope.current.config_dialog.cloning;
                    hide_project_config_dialog();
                    throw result['error'];
                }
            }, function(error) {
                // TODO: Error handling
                delete $scope.current.config_dialog.cloning;
                hide_project_config_dialog();
                throw result['error'];
            });
        };

        $scope.set_current_project = function(name) {
            if ($scope.current.project.name === name) return;
            delete $scope.current.tag_name;
            delete $scope.current.sections;
            delete $scope.current.document;
            delete $scope.current.document_path;
            $scope.current.searchbar = {};
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
            Restangular.one('projects', $scope.current.project.id).
                customPUT(null, $scope.current.new_tag_dialog.tag_name).then(function(project) {
                    if (!project || project['error']) {
                        // TODO: Error handling
                        delete $scope.current.new_tag_dialog.pushing;
                        hide_new_tag_dialog();
                        throw project['error'];
                    }
                    $scope.current.new_tag_dialog = {};
                    $scope.current.project.tags = project.tags;
                    hide_new_tag_dialog();
            }, function(error) {
                // TODO: Error handling
                delete $scope.current.new_tag_dialog.pushing;
                hide_new_tag_dialog();
                throw error;
            });
        };

        $scope.search = function() {
            if (!$scope.current.searchbar.query) return;
            $scope.current.searchbar.searching = true;
            Restangular.one('projects', $scope.current.project.id).
                getList($scope.current.tag_name + '/_search', {q: $scope.current.searchbar.query}).
                then(function(results) {
                    if (!results || results['error']) {
                        // TODO: Error handling
                        delete $scope.current.searchbar.searching;
                        throw results['error'];
                    }
                    $scope.current.searchbar.results = results;
                    delete $scope.current.searchbar.searching;
                }, function(error) {
                    // TODO: Error handling
                    delete $scope.current.searchbar.searching;
                    throw error;
                });
        };

        $scope.open_path = function(path) {
            $state.go('application.project.tag.doc', {document_path: path});
            $('#project-search').modal('hide');
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
            if (e.which == 47 && $scope.current.opening_modal === 0)
                $('#project-search').modal('show');
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