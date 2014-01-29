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
    },
    highlight: {
        exports: 'hljs'
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
        promise: 'vendor/requirejs-promise',
        highlight: 'vendor/highlight.min'
    },
    shim: shim
});

require(['angular', 'app', 'domReady', 'jquery', 'bootstrap', 'restangular',
         'controllers/application', 'controllers/project', 'controllers/doc',
         'directives/application'], function(angular, app, domReady, $) {
    app.config(function($stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider) {
        $stateProvider.
           state('application', {
            url: '',
            templateUrl: '/templates/application.html',
            controller: 'Application'
        }).state('application.project', {
            url: '/:project_name',
            controller: 'Project',
            templateUrl: '/templates/project.html'
        }).state('application.project.doc', {
            url: '/*document_path',
            controller: 'Doc',
            templateUrl: '/templates/doc.html'
        });
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
        RestangularProvider.setBaseUrl('/api/');
    });

    domReady(function() {
        angular.bootstrap(document, ['TreeApp']);
    });
});