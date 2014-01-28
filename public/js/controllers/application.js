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
                            $('#project-config').modal('hide');
                        });
                    });
                };
            });
        };

        $scope.projects = projects;
        $state.go('application.project');
    });
});