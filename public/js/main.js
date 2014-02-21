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
};

require.config({
    waitSeconds: 0,
    paths: {
        domReady: 'vendor/domReady',
        jquery: 'vendor/jquery.min',
        underscore: 'vendor/underscore.min',
        angular: 'vendor/angular.min',
        angular_ui_router: 'vendor/angular-ui-router.min',
        bootstrap: 'vendor/bootstrap.min',
        restangular: 'vendor/restangular.min',
        angular_animate: 'vendor/angular-animate.min',
        abn_tree_directive: 'vendor/abn_tree_directive',
        promise: 'vendor/requirejs-promise',
        highlight: 'vendor/highlight.min'
    },
    shim: shim
});

require(['angular', 'app', 'domReady', 'jquery', 'bootstrap', 'restangular', '_constants',
         'controllers/application', 'controllers/project', 'controllers/tag', 'controllers/doc',
         'directives/application', 'directives/doc'], function(angular, app, domReady, $) {
    app.config(function($stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider) {
        $stateProvider.
           state('application', {
            url: '',
            templateUrl: '/templates/application.html',
            controller: 'Application'
        }).state('application.project', {
            url: '/:project_name',
            controller: 'Project',
            template: '<ui-view />'
        }).state('application.project.tag', {
            url: '/:tag_name',
            controller: 'Tag',
            templateUrl: '/templates/tag.html'
        }).state('application.project.tag.doc', {
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