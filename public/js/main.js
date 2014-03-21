var shim = {
    underscore: {
        exports: '_'
    },
    angular: {
        exports: 'angular',
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
    },
    textile: {
        exports: 'textile'
    },
    bootbox: {
        exports: 'bootbox',
        deps: ['bootstrap', 'jquery']
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
        highlight: 'vendor/highlight.min',
        marked: 'vendor/marked',
        textile: 'vendor/textile',
        ace: 'vendor/ace/ace',
        bootbox: 'vendor/bootbox.min'
    },
    shim: shim
});

require(['angular', 'app', 'domReady', 'jquery', 'bootstrap', 'restangular', '_constants', 'ace', 'bootbox',
         'controllers/application', 'controllers/project', 'controllers/tag', 'controllers/edit', 'controllers/doc',
         'directives/application', 'directives/doc', 'directives/editor',
         'filters/application', 'factories/projects'], function(angular, app, domReady, $) {
    app.config(function($stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider) {
        $stateProvider.
           state('application', {
            url: '',
            templateUrl: '/templates/application.html',
            controller: 'Application',
            abstract: true,
            resolve: {
                projects: function(Projects) {
                    return Projects.all();
                }
            }
        }).state('application.project', {
            url: '/:project_name',
            controller: 'Project',
            template: '<ui-view />'
        }).state('application.project.tag', {
            url: '/:tag_name',
            controller: 'Tag',
            templateUrl: '/templates/tag.html'
        }).state('application.project.tag.edit', {
            url: '/edit/*document_path?new&type',
            controller: 'Edit',
            templateUrl: '/templates/edit.html'
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
