define(['controllers/project', 'underscore', 'factories/projects'], function(project_controller, _) {
    return project_controller.controller('Tag', function($scope, $state, Projects) {
        if (!$scope.current.project) return;

        if (!$state.params.tag_name && $scope.current.tag_name)
            return $state.go('application.project.tag', {tag_name: $scope.current.tag_name}, {location: 'replace'});

        if ($state.params.tag_name) {
            if (_.contains($scope.current.project.tags.concat('HEAD'), $state.params.tag_name))
                $scope.current.tag_name = $state.params.tag_name;
        }

        if (!$scope.current.tag_name)
            return $state.go('application.project.tag', {tag_name: 'HEAD'}, {location: 'replace'});

        $scope.$on('treeInitialized', function() {
            $scope.select_tree($state.params.document_path);
        });

        $scope.tree_selected_callback = function(branch) {
            var labels = _.map(branch.parents().concat(branch), function(branch) { return branch.label; });
            if ($state.params.document_path === labels.join('/')) return;
            if (branch.children.length > 0) {
                if (!branch.expanded) return;
                $scope.current.loading += 1;

                Projects.get($scope.current.project.id).
                    tag($state.params.tag_name).
                    suggest(labels.join('/')).
                    then(function(result) {
                        $state.go('application.project.tag.doc', {document_path: result['suggest']}, {location: 'replace'});
                        $scope.select_tree(result['suggest']);
                    }).finally(function() {
                        $scope.current.loading -= 1;
                    });
            } else {
                $state.go('application.project.tag.doc', {document_path: labels.join('/')});
            }
        };

        var current_controller = $state.current.name;

        $scope.current.loading += 1;
        Projects.get($scope.current.project.id).tag($scope.current.tag_name).tree().
            then(function(tree) {
                $scope.current.project.directory = tree;

                var current_routes = current_controller.split('.');
                if (_.last(current_routes) === 'tag') $state.go(current_routes.concat('doc').join('.'), {}, {location: 'replace'});
                else                                  $state.go(current_controller, {}, {location: 'replace'}); // If current controller is EditController
            }).finally(function() {
                $scope.current.loading -= 1;
            });
    });
});
