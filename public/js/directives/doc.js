define(['directives'], function(directives) {
    directives.directive('autoAnchors', function($timeout, $state, $location, $anchorScroll) {
        return {
            link: function(scope, element, attrs) {
                $timeout(function() { do_with(element); });
                function do_with(element) {
                    $(element).find('h1,h2,h3,h4,h5,h6').each(function(i, e) {
                        var id = e.innerText.replace(/\s/g, '-').replace(/[^\w-]/, '').toLowerCase();
                        var anchor = $('<a class="anchor" id="section-'+id+'"></a>');
                        anchor.prependTo(e);
                    });
                }
            }
        };
    });
});