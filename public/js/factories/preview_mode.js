define(['factories'], function(factories) {
    return factories.factory('PreviewMode', function() {
        var current = {};
        return {
            set: function(mode) {
                if (mode.match(/without/i))
                    current.mode = 'without_preview';
                else if (mode.match(/with/i))
                    current.mode = 'with_preview';
                else if (mode)
                    throw 'Unexpected mode';
            },
            enable_preview_mode: function() {
                current.mode = 'with_preview';
            },
            disable_preview_mode: function() {
                current.mode = 'without_preview';
            },
            switch_to_default_mode: function() {
                current.mode = 'with_preview';
            },
            get: function() {
                return current.mode;
            },
            preview_enabled: function() {
                return current.mode === 'with_preview';
            },
            preview_disabled: function() {
                return current.mode === 'without_preview';
            },
            is_undefined: function() {
                return !current.mode;
            }
        };
    });
});
