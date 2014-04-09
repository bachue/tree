define(['directives', 'underscore', 'directives/modals', 'factories/projects', 'factories/modal'], function(directives, _) {
    directives.directive('newProjectDialog', function(Modal) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/modals/new_project_dialog.html',
            link: function(scope, element) {
                scope.new_project_dialog = {branch: 'master'};

                Modal.setup_counter(element);
                Modal.setup_autofocus(element);
                Modal.setup_shortcut(43, '#new-project-dialog');
            },
            controller: function($scope, $element, Projects) {
                $scope.create_new_repo = function() {
                    if($scope.new_project_dialog.name.length > 1)
                        $scope.new_project_dialog.url =
                            CONSTANTS['NEW_REPO_PREFIX'] + $scope.new_project_dialog.name;
                };

                $scope.submit = function() {
                    $scope.new_project_dialog.cloning = true;
                    Projects.new($scope.new_project_dialog).
                        then(function(project) {
                            $scope.projects.push(project);
                            $scope.set_current_project(project.name);
                            $scope.new_project_dialog = {branch: 'master'};
                        }).finally(function() {
                            delete $scope.new_project_dialog.cloning;
                            $element.modal('hide');
                        });
                };
            }
        };
    });

    directives.directive('uniqProject', function() {
        return {
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                scope.$watch('new_project_dialog.name', function(value) {
                    var names = _.map(scope.projects, function(project) { return project.name; });
                    ngModel.$setValidity('uniq', !_.contains(names, value));
                });
            }
        };
    });
});
