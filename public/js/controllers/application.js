define(['controllers', 'promise!loaders/projects'], function(controllers, projects) {
    return controllers.controller('Application', function($scope, $state, $timeout, Restangular) {
        $scope.current = {};
        $scope.current.config_dialog = {branch: 'master'};

        $scope.submit_config = function() {
            var loader = Restangular.all('projects');
            $scope.current.config_dialog.cloning = true;
            loader.post($scope.current.config_dialog).then(function(result) {
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

        $scope.projects = projects;
        $state.go('application.project');
    });
});