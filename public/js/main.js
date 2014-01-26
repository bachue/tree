var shim = {
    underscope: {
        exports: '_'
    },
    angular: {
        exports: 'angular',
        deps: ['jquery']
    },
    angular_ui_router {
        deps: ['angular']
    },
    bootstrap: {
        deps: ['jquery']
    }
}

require.config({
    paths: {
        domReady: 'vendor/js/domReady',
        jquery: 'vendor/js/jquery',
        underscope: 'vendor/js/underscope',
        angular: 'vendor/js/angular',
        angular_ui_router: 'vendor/js/angular-ui-router.min',
        bootstrap: 'vendor/js/bootstrap',
    },
    shim: shim
});

require(['angular', 'app', 'domReady', 'jquery'], function(angular, app, domReady, $) {
    app.config(function() {
        domReady(function() {
            angular.bootstrap(document, ['TreeApp']);
        });
    });
});