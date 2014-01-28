define(['controllers', 'promise!loaders/projects'], function(controllers, projects) {
    return controllers.controller('Application', function($scope, $state, $timeout, Restangular) {
        $scope.current = {};
        $scope.current.config_dialog = {branch: 'master'};

        $scope.submit_config = function() {
            var loader = Restangular.all('projects');
            $scope.current.config_dialog.cloning = true;
            loader.post($scope.current.config_dialog).then(function(result) {
                if (result == 'true') {
                    loader.getList().then(function(projects) {
                        $timeout(function() {
                            $scope.projects = projects;
                            $scope.current.config_dialog = {branch: 'master'};
                            if ($scope.projects.length == 1)
                                $state.go('application.project', {project_name: projects[0].name});
                            $('#project-config').modal('hide');
                        });
                    }, function() {
                        // TODO: Error handling
                        $('#project-config').modal('hide');
                    });
                } else {
                    // TODO: Error handling
                    $('#project-config').modal('hide');
                };
            }, function() {
                // TODO: Error handling
                $('#project-config').modal('hide');
            });
        };

        $scope.set_current_project = function(name) {
            if ($scope.current.project.name === name) return;
            delete $scope.current.document;
            delete $scope.current.document_path;
            $state.go('application.project', {project_name: name, document_path: null});
        };

        $scope.projects = projects;
        $state.go('application.project');
    });
});