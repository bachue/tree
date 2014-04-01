define(['factories', 'underscore', 'essage'], function(factories, _, essage) {
    return factories.factory('Notice', function() {
        var module = {};
        _.each(['success', 'warning', 'error'], function(status) {
            module[status] = function(message, timeout) {
                essage.show({
                    message: message,
                    status: status
                }, timeout || 5000);
            };
        });
        return module;
    });
});
