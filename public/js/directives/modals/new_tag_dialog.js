define(['directives', 'jquery', 'underscore', 'directives/modals', 'factories/projects', 'factories/modal'], function(directives, $, _) {
    directives.directive('newTagDialog', function(Modal) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/modals/new_tag_dialog.html',
            link: function(scope, element) {
                scope.new_tag_dialog = {};

                Modal.setup_counter(element);
                Modal.setup_autofocus(element);

                scope.$on('ProjectSwitched', function() {
                    scope.new_tag_dialog = {};
                });
            },
            controller: function($scope, $element, Projects) {
                $scope.keypress_to_create_tag = function(e) {
                    if ($(new_tag_form).hasClass('ng-valid') && e.which === 13)
                        $scope.add_tag();
                };

                $scope.add_tag = function() {
                    $scope.new_tag_dialog.pushing = true;
                    Projects.get($scope.current.project.id).
                        create_tag($scope.new_tag_dialog.tag_name).
                        then(function(project) {
                            $scope.new_tag_dialog = {};
                            $scope.current.project.tags = project.tags;
                        }).finally(function() {
                            delete $scope.new_tag_dialog.pushing;
                            $element.modal('hide');
                        });
                };
            }
        };
    });

    directives.directive('uniqTag', function() {
        return {
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                if (scope.current && scope.current.project) {
                    scope.$watch('new_tag_dialog.tag_name', function(value) {
                        ngModel.$setValidity('uniq', !_.contains(['HEAD'].concat(scope.current.project.tags), value));
                    });
                }
            }
        };
    });
});
