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
        deps: ['angular', 'underscore']
    },
    angular_animate: {
        deps: ['angular']
    },
    abn_tree_directive: {
        deps: ['angular', 'angular_animate', 'underscore']
    }
}

require.config({
    paths: {
        domReady: 'vendor/domReady',
        jquery: 'vendor/jquery',
        underscore: 'vendor/underscore',
        angular: 'vendor/angular',
        angular_ui_router: 'vendor/angular-ui-router',
        bootstrap: 'vendor/bootstrap',
        restangular: 'vendor/restangular',
        angular_animate: 'vendor/angular-animate',
        abn_tree_directive: 'vendor/abn_tree_directive',
        promise: 'vendor/requirejs-promise'
    },
    shim: shim
});

require(['angular', 'app', 'domReady', 'jquery', 'bootstrap', 'restangular',
         'controllers/application', 'controllers/project', 'controllers/doc'], function(angular, app, domReady, $) {
    app.config(function($stateProvider, $urlRouterProvider, RestangularProvider) {
        $stateProvider.
           state('application', {
            url: '',
            templateUrl: 'templates/application.html',
            controller: 'Application'
        }).state('application.project', {
            url: '/:project_name',
            controller: 'Project',
            templateUrl: 'templates/project.html'
        }).state('application.project.doc', {
            url: '/*document_path',
            controller: 'Doc',
            templateUrl: 'templates/doc.html'
        });
        $urlRouterProvider.otherwise('/');
        RestangularProvider.setBaseUrl('/api/');
    });

    domReady(function() {
        angular.bootstrap(document, ['TreeApp']);
    });
});