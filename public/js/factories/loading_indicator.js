define(['factories'], function(factories) {
    return factories.factory('LoadingIndicator', function() {
        var counter = 0;
        return {
            load: function() {
                counter++;
            },
            loaded: function() {
                counter--;
            },
            loading: function() {
                return counter > 0;
            }
        };
    });
});
