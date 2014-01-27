define(['controllers/application', 'underscore'], function(application, _) {
    return application.controller('Project', function($scope, $state) {
        if (!$state.params.project_name && $scope.current.project)
            return $state.go('application.project', {project_name: $scope.current.project.name});

        if ($state.params.project_name) {
            $scope.current.project = _.find($scope.projects, function(project) {
                return $state.params.project_name === project.name;
            });
        }

        if (!$scope.current.project)
            return $state.go('application.project', {project_name: $scope.projects[0].name});
    });
});