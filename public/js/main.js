var shim = {
    underscore: {
        exports: '_'
    },
    angular: {
        exports: 'angular',
        deps: ['jquery']
    },
    angular_ui_router: {
        deps: ['angular']
    },
    bootstrap: {
        deps: ['jquery']
    },
    restangular: {
        exports: 'Restangular',
        deps: ['angular', 'underscore']
    }
}

require.config({
    paths: {
        domReady: 'vendor/domReady',
        jquery: 'vendor/jquery',
        underscore: 'vendor/underscore',
        angular: 'vendor/angular',
        angular_ui_router: 'vendor/angular-ui-router.min',
        bootstrap: 'vendor/bootstrap',
        restangular: 'vendor/restangular'
    },
    shim: shim
});

require(['angular', 'app', 'domReady', 'jquery', 'bootstrap', 'restangular', 'controllers/application'], function(angular, app, domReady, $) {
    app.config(function($stateProvider, $urlRouterProvider, RestangularProvider) {
        $stateProvider.state('application', {
            url: '',
            templateUrl: 'templates/application.html',
            controller: 'Application'
        });
        $urlRouterProvider.otherwise('');
        RestangularProvider.setBaseUrl('/api/');
    });

    domReady(function() {
        angular.bootstrap(document, ['TreeApp']);
    });
});