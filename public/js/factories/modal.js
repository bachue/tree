define(['factories', 'jquery'], function(factories, $) {
    return factories.factory('Modal', function($state) {
        var current = {};
        return {
            setup_counter: function(element) {
                if(!current.opening_modals)
                    current.opening_modals = 0;

                element.on('shown.bs.modal', function() {
                    current.opening_modals++;
                });

                element.on('hidden.bs.modal', function() {
                    current.opening_modals--;
                });
            },
            setup_autofocus: function(element) {
                element.on('shown.bs.modal', function() {
                    $('input:first', element).focus();
                });
            },
            setup_shortcut: function(key, selector) {
                $('body').keypress(function(e) {
                    if (!current.opening_modals &&
                        $state.current.controller != 'Edit' &&
                        e.which === key) {
                        $(selector).modal('show');
                    }
                });
            }
        };
    });
});
