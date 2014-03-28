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
                if (scope.current && scope.current.project) {
                    scope.$watch('current.new_tag_dialog.tag_name', function(value) {
                        ngModel.$setValidity('uniq', !_.contains(['HEAD'].concat(scope.current.project.tags), value));
                    });
                }
            }
        };
    });

    // This directive validate whether tags is existed in current project but not current tag
    directives.directive('existedTag', function() {
        return {
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                if (scope.current && scope.current.project) {
                    scope.$watch('current.tag_diff_dialog.tag', function(value) {
                        ngModel.$setValidity('existed', _.contains(scope.existed_tags_without_current(), value));
                    });
                }
            }
        };
    });

    directives.directive('uniqKeyName', function() {
        return {
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                scope.$watch('current.key_dialog.new.name', function(value) {
                    ngModel.$setValidity('uniq', !_.contains(_.map(scope.current.key_dialog.keys, function(key) { return key.name; }), value));
                });
            }
        };
    });
});
