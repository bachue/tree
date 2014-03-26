define(['filters', 'underscore', 'strftime'], function(filters, _, strftime) {
    filters.filter('withoutBinary', function() {
        return function(patches) {
            return _.filter(patches, function(patch) {
                return !patch.meta.binary;
            });
        };
    });

    filters.filter('timeFormat', function() {
        return function(string) {
            return strftime('%F %T %z', new Date(string));
        };
    });
});
