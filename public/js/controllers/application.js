define(['controllers', 'promise!loaders/projects'], function(controllers, projects) {
    return controllers.controller('Application', function($scope, $state, $location, Restangular) {
        $scope.current = {};
        $scope.current.config_dialog = {branch: 'master'};
        $scope.current.new_tag_dialog = {};
        $scope.current.searchbar = {};

        $scope.submit_config = function() {
            $scope.current.config_dialog.cloning = true;
            Restangular.all('projects').post($scope.current.config_dialog).then(function(result) {
                if (!result['error']) {
                    $scope.projects.push(result);
                    $scope.current.config_dialog = {branch: 'master'};
                    $state.go('application.project', {project_name: result.name});
                    $('#project-config').modal('hide');
                } else {
                    // TODO: Error handling
                    $('#project-config').modal('hide');
                    throw result['error'];
                };
            }, function(error) {
                // TODO: Error handling
                $('#project-config').modal('hide');
                throw result['error'];
            });
        };

        $scope.set_current_project = function(name) {
            if ($scope.current.project.name === name) return;
            delete $scope.current.tag_name;
            delete $scope.current.document;
            delete $scope.current.document_path;
            // We don't specify tag_name in this project, so it'll be set to default value 'HEAD'
            $state.go('application.project', {project_name: name, tag_name: 'HEAD', document_path: null});
        };

        $scope.set_current_tag = function(tag_name) {
            if ($scope.current.tag === tag_name) return;
            $state.go('application.project.tag.doc', {tag_name: tag_name});
        }

        $scope.open_new_tag_dialog = function() {
            $('#new-tag-dialog').modal('show');
        }

        $scope.add_tag = function() {
            $scope.current.new_tag_dialog.pushing = true;
            Restangular.one('projects', $scope.current.project.id).
                customPUT(null, $scope.current.new_tag_dialog.tag_name).then(function(project) {
                    if (project['error']) {
                        // TODO: Error handling
                        $('#new-tag-dialog').modal('hide');
                        throw project['error'];
                    }
                    $scope.current.new_tag_dialog = {};
                    $scope.current.project.tags = project.tags;
                    $('#new-tag-dialog').modal('hide');
            }, function(error) {
                // TODO: Error handling
                $('#new-tag-dialog').modal('hide');
                throw error;
            });
        }

        $scope.search = function() {
            if (!$scope.current.searchbar.query) return;
            $scope.current.searchbar.searching = true;
            Restangular.one('projects', $scope.current.project.id).
                getList($scope.current.tag_name + '/_search', {q: $scope.current.searchbar.query}).
                then(function(results) {
                    if (results['error']) {
                        delete $scope.current.searchbar.searching;
                        throw results['error'];
                    }
                    $scope.current.searchbar.results = results;
                    delete $scope.current.searchbar.searching;
            }, function(error) {
                delete $scope.current.searchbar.searching;
                throw error;
            });
        };

        $scope.open_path = function(path) {
            $state.go('application.project.tag.doc', {document_path: path});
            $('#project-search').modal('hide');
        }

        $scope.projects = projects;
        $state.go('application.project');
    });
});