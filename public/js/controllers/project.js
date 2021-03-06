define(['controllers/application', 'underscore'], function(application_controller, _) {
    return application_controller.controller('Project', function($scope, $rootScope, $state) {
        if (!$state.params.project_name && $scope.current.project)
            return $state.go('application.project', {project_name: $scope.current.project.name}, {location: 'replace'});

        if ($state.params.project_name) {
            $scope.current.project = _.find($scope.projects, function(project) {
                return $state.params.project_name === project.name;
            });
        }

        if (!$scope.projects[0]) return;

        if (!$scope.current.project)
            return $state.go('application.project', {project_name: $scope.projects[0].name}, {location: 'replace'});

        $rootScope.$broadcast('ProjectSwitched');

        if ($state.current.controller == 'Project')
            $state.go('application.project.tag', {project_name: $scope.current.project.name}, {location: 'replace'});
    });
});
