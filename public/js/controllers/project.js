define(['controllers/application', 'underscore'], function(application, _) {
    return application.controller('Project', function($scope, $state, Restangular) {
        if (!$scope.projects) {
            return $state.go('application');
        };

        if (!$state.params.project_name && $scope.current.project)
            return $state.go('application.project', {project_name: $scope.current.project.name});

        if ($state.params.project_name) {
            $scope.current.project = _.find($scope.projects, function(project) {
                return $state.params.project_name === project.name;
            });
        }

        if (!$scope.current.project)
            return $state.go('application.project', {project_name: $scope.projects[0].name});

        Restangular.one('projects', $scope.current.project.id).getList().then(function(tree) {
            $scope.current.project.directory = tree;
        });
    });
});