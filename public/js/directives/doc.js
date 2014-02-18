define(['directives'], function(directives) {
    directives.directive('autoAnchors', function($timeout, $state, $location, $anchorScroll) {
        return {
            link: function(scope, element, attrs) {
                $timeout(function() { do_with(scope, element); }, 100);
                function do_with(scope, element) {
                    scope.current.sections = [];
                    var feed = 0;
                    $(element).find('h1,h2,h3,h4,h5,h6').each(function(i, e) {
                        var id = e.innerText.replace(/\s/g, '-').replace(/[^\w-]/g, '').toLowerCase();
                        if(!id) id = ++feed;
                        var anchor = $('<a class="anchor" id="section-'+id+'"></a>');
                        scope.current.sections.push({level: e.nodeName[1], text: e.innerText, id: id});
                        anchor.prependTo(e);
                    });
                }
            }
        };
    });
});