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
});