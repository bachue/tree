define(['directives'], function(directives) {
    directives.directive('uniqProject', function() {
        return {
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                scope.$watch('current.config_dialog.name', function(value) {
                    var names = _.map(scope.projects, function(project) { return project.name; });
                    ngModel.$setValidity('uniq', !_.contains(names, value));
                });
            }
        };
    });

    directives.directive('uniqTag', function() {
        return {
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                if (scope.current && scope.current.projects) {
                    scope.$watch('current.new_tag_dialog.tag_name', function(value) {
                        ngModel.$setValidity('uniq', !_.contains(scope.current.project.tags, value));
                    });
                }
            }
        };
    });
});