define(['controllers/application', 'underscore'], function(application, _) {
    return application.controller('Project', function($scope, $state, Restangular) {
        if (!$state.params.project_name && $scope.current.project)
            return $state.go('application.project', {project_name: $scope.current.project.name});

        if ($state.params.project_name) {
            $scope.current.project = _.find($scope.projects, function(project) {
                return $state.params.project_name === project.name;
            });
        }

        if (!$scope.current.project)
            return $state.go('application.project', {project_name: $scope.projects[0].name});

        $scope.$on('treeInitialized', function() {
            if ($state.params.document_path)
                $scope.$broadcast('toSelectBranches', $state.params.document_path);
        });

        $scope.tree_selected_callback = function(branch) {
            var labels = _.map(branch.parents().concat(branch), function(branch) { return branch.label; });
            $state.go('application.project.doc', {document_path: labels.join('/')});
        };

        Restangular.one('projects', $scope.current.project.id).getList().then(function(tree) {
            if(tree['error']) throw tree['error'];
            $scope.current.project.directory = tree;
            $state.go('application.project.doc');
        });
    });
});