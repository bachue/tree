define(['factories', 'underscore'], function(factories, _) {
    return factories.factory('CommitMode', function() {
        var current = {}, module = {};
        _.each(['Create', 'Edit', 'Delete'], function(mode) {
            module['switch_to_' + mode.toLowerCase() + '_mode'] = function() {
                current.mode = mode;
            };
            module['is_' + mode.toLowerCase() + '_mode'] = function() {
                return current.mode === mode;
            };
        });
        _.each(['last_commit_id', 'based_blob_id'], function(property) {
            module['set_' + property] = function(value) {
                current[property] = value;
            };
            module['get_' + property] = function() {
                return current[property];
            };
        });
        module.current_mode = function() {
            return current.mode;
        };
        return module;
    });
});
