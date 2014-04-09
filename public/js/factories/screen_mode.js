define(['factories'], function(factories) {
    return factories.factory('ScreenMode', function() {
        var current = {};
        return {
            set: function(mode) {
                if (!mode)
                    return;
                else if (mode.match(/full/i))
                    current.mode = 'full-mode';
                else if (mode.match(/side/i))
                    current.mode = 'sidebar-mode';
                else if (mode)
                    throw 'Unexpected mode';
            },
            switch_to_sidebar_mode: function() {
                current.mode = 'sidebar-mode';
            },
            switch_to_full_mode: function() {
                current.mode = 'full-mode';
            },
            switch_to_default_mode: function() {
                current.mode = 'sidebar-mode';
            },
            get: function() {
                return current.mode;
            },
            is_full_mode: function() {
                return current.mode === 'full-mode';
            },
            is_sidebar_mode: function() {
                return current.mode === 'sidebar-mode';
            },
            is_undefined: function() {
                return !current.mode;
            }
        };
    });
});
