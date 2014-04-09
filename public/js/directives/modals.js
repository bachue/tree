define(['directives', 'underscore'], function(directives, _) {
    directives.directive('validationState', function() {
        return function(scope, element) {
            var candidate_names = ['ng-model', 'data-ng-model', 'x-ng-model'];
            var input = element.find(_.map(candidate_names, function(name) {
                return '[' + name + ']';
            }).join(','));
            if (input) {
                var model = _.reduce(candidate_names, function(result, name) {
                    return result || input.attr(name);
                }, null);

                if (model) {
                    scope.$watch(model, function() {
                        if (input.hasClass('ng-invalid')) {
                            element.addClass('has-error');
                            element.removeClass('has-success');
                        }
                        else if (input.hasClass('ng-valid')) {
                            element.addClass('has-success');
                            element.removeClass('has-error');
                        }
                    });
                }
            }
        };
    });
});
