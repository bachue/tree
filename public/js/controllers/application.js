define(['controllers'], function(controllers) {
    return controllers.controller('Application', function($scope, $state, $timeout, Restangular) {
        $scope.current = {};

        Restangular.all('projects').getList().then(function(projects) {
            if(projects['error']) throw projects['error'];
            $timeout(function() {
                $scope.projects = projects;
                $state.go('application.project');
            });
        });
    });
});