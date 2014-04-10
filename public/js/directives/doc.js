define(['directives', 'factories/sections'], function(directives) {
    directives.directive('autoAnchors', function($timeout, Sections) {
        return function(scope, element) {
            $timeout(function() { Sections.generate_for(element); }, 100);
        };
    });
});
