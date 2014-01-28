define(['controllers', 'promise!loaders/projects'], function(controllers, projects) {
    return controllers.controller('Application', function($scope, $state, $timeout, Restangular) {
        $scope.current = {};

        $scope.projects = projects;
        $state.go('application.project');
    });
});