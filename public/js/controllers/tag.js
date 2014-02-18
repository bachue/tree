define(['controllers/project', 'underscore'], function(project_controller, _) {
    return project_controller.controller('Tag', function($scope, $state, Restangular) {
        if (!$state.params.tag_name && $scope.current.tag_name)
            return $state.go('application.project.tag', {tag_name: $scope.current.tag_name});

        if ($state.params.tag_name) {
            if (_.contains($scope.current.project.tags.concat('HEAD'), $state.params.tag_name))
                $scope.current.tag_name = $state.params.tag_name;
        }

        if (!$scope.current.tag_name)
            return $state.go('application.project.tag', {tag_name: 'HEAD'});

        $scope.$on('treeInitialized', function() {
            if ($state.params.document_path)
                $scope.$broadcast('toSelectBranches', $state.params.document_path);
        });

        $scope.tree_selected_callback = function(branch) {
            var labels = _.map(branch.parents().concat(branch), function(branch) { return branch.label; });
            $state.go('application.project.tag.doc', {document_path: labels.join('/')});
        };

        $scope.current.loading = true;
        Restangular.one('projects', $scope.current.project.id).getList($scope.current.tag_name).then(function(tree) {
            delete $scope.current.loading;
            if(!tree || tree['error']) {
                // TODO: Error handling
                throw tree['error'];
            }
            $scope.current.project.directory = tree;
            $state.go('application.project.tag.doc');
        }, function(error) {
            // TODO: Error handling
            delete $scope.current.loading;
            throw error;
        });
    });
});