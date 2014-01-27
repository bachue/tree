define(['controllers', 'restangular'], function(controllers) {
    controllers.controller('Application', function($scope, $timeout, Restangular) {
        $scope.current = {};

        Restangular.all('projects').getList().then(function(projects) {
            $timeout(function() {
                $scope.projects = projects;
            });
        });
    });
});