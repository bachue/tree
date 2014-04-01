define(['factories', 'jquery', 'underscore'], function(factories, $, _) {
    return factories.factory('Sections', function() {
        var current = {};
        return {
            generate_for: function(element) {
                current.sections = [];
                $(element).find('h1,h2,h3,h4,h5,h6').each(function(i, e) {
                    var id = e.innerText.replace(/\s/g, '-').replace(/[^\w-]/g, '').toLowerCase();
                    if(!id) id = _.uniqueId('');
                    $('<a class="anchor" id="section-' + id + '"></a>').prependTo(e);
                    current.sections.push({level: e.nodeName[1], text: e.innerText, id: id});
                });
            },
            clear: function() {
                delete current.sections;
            },
            exists: function() {
                return current.sections && current.sections.length > 0;
            },
            get: function() {
                return current.sections;
            }
        };
    });
});
