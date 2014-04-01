define(['directives', 'underscore', 'factories/projects', 'factories/modal'], function(directives, _) {
    directives.directive('projectSearchDialog', function(Modal) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/modals/project_search_dialog.html',
            link: function(scope, element) {
                scope.searchbar = {};

                Modal.setup_counter(element);
                Modal.setup_autofocus(element);
                Modal.setup_shortcut(63, '#project-help-dialog');

                scope.$on('ProjectSwitched', function() {
                    scope.searchbar = {};
                });
                scope.$on('TagSwitched', function() {
                    scope.searchbar = {};
                });
            },
            controller: function($scope, $element, $state, Projects) {
                $scope.keypress_in_searchbar = function(e) {
                    if (e.which === 13) $scope.search();
                };

                $scope.open_path = function(path) {
                    $state.go('application.project.tag.doc', {document_path: path});
                    $element.modal('hide');
                };

                $scope.search = function() {
                    if (!$scope.searchbar.query) return;
                    $scope.searchbar.searching = true;
                    Projects.get($scope.current.project.id).
                        tag($scope.current.tag_name).
                        search({q: $scope.searchbar.query}).
                        then(function(results) {
                            $scope.searchbar.results = {};
                            $scope.searchbar.results.both = _.intersection(results.filenames, results.content);
                            $scope.searchbar.results.filenames = _.difference(results.filenames, results.content);
                            $scope.searchbar.results.content = _.difference(results.content, results.filenames);
                        }).finally(function() {
                            delete $scope.searchbar.searching;
                        });
                };
            }
        };
    });
});
