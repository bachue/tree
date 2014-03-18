define(['filters', 'underscore'], function(filters, _) {
    filters.filter('withoutBinary', function() {
        return function(patches) {
            return _.filter(patches, function(patch) {
                return !patch.meta.binary;
            });
        };
    });
});
