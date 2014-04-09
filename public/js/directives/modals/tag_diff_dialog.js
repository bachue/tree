define(['directives', 'jquery', 'directives/modals', 'factories/projects', 'factories/modal'], function(directives, $) {
    directives.directive('tagDiffDialog', function($timeout, Modal) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/modals/tag_diff_dialog.html',
            link: function(scope, element) {
                scope.tag_diff_dialog = {};

                Modal.setup_counter(element);
                Modal.setup_autofocus(element);

                element.on('hidden.bs.modal', function() {
                    $timeout(function() {
                        delete scope.tag_diff_dialog.diff;
                    });
                });

                scope.$on('ProjectSwitched', function() {
                    scope.tag_diff_dialog = {};
                });
            },
            controller: function($scope, $element, Projects) {
                $scope.keypress_to_diff_tags = function(e) {
                    if ($(tag_diff_form).hasClass('ng-valid') && e.which === 13)
                        $scope.do_diff_between_tags();
                };
                // This helper selects all tags from current project, but without currect tag
                $scope.existed_tags_without_current = function() {
                    return _.without(['HEAD'].concat($scope.current.project.tags), $scope.current.tag_name);
                };

                $scope.do_diff_between_tags = function() {
                    $scope.tag_diff_dialog.processing = true;
                    Projects.get($scope.current.project.id).
                        tag($scope.current.tag_name).
                        diff($scope.tag_diff_dialog.tag).
                        then(function(results) {
                            $scope.tag_diff_dialog.diff = results;
                        }).finally(function() {
                            delete $scope.tag_diff_dialog.processing;
                        });
                };
            }
        };
    });

    // This directive validate whether tags is existed in current project but not current tag
    directives.directive('existedTag', function() {
        return {
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                if (scope.current && scope.current.project) {
                    scope.$watch('tag_diff_dialog.tag', function(value) {
                        ngModel.$setValidity('existed', _.contains(scope.existed_tags_without_current(), value));
                    });
                }
            }
        };
    });
});
