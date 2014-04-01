define(['directives', 'factories/sections'], function(directives) {
    directives.directive('autoAnchors', function($timeout, Sections) {
        return {
            link: function(scope, element) {
                $timeout(function() { Sections.generate_for(element); }, 100);
            }
        };
    });
});
