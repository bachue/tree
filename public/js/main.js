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
    },
    essage: {
        exports: 'Essage'
    },
    strftime: {
        exports: 'strftime'
    },
    jquery_cookie: {
        deps: ['jquery']
    }
};

require.config({
    waitSeconds: 0,
    baseUrl: '/js/',
    paths: {
        domReady: 'vendor/domReady.min',
        jquery: 'vendor/jquery.min',
        underscore: 'vendor/underscore.min',
        angular: 'vendor/angular.min',
        angular_ui_router: 'vendor/angular-ui-router.min',
        bootstrap: 'vendor/bootstrap.min',
        restangular: 'vendor/restangular.min',
        angular_animate: 'vendor/angular-animate.min',
        abn_tree_directive: 'vendor/abn_tree_directive',
        highlight: 'vendor/highlight.min',
        marked: 'vendor/marked.min',
        textile: 'vendor/textile.min',
        ace: 'vendor/ace',
        bootbox: 'vendor/bootbox.min',
        essage: 'vendor/essage.min',
        strftime: 'vendor/strftime.min',
        jquery_cookie: 'vendor/jquery.cookie.min'
    },
    shim: shim
});

require(['angular', 'app', 'domReady', 'jquery', 'bootstrap', 'restangular', '_constants',
         'controllers/application', 'controllers/project', 'controllers/tag', 'controllers/edit', 'controllers/doc',
         'filters/application', 'directives/doc', 'directives/editor', 'directives/comments',
         'directives/modals/new_project_dialog', 'directives/modals/new_tag_dialog',
         'directives/modals/project_search_dialog', 'directives/modals/project_help_dialog',
         'directives/modals/code_commit_dialog', 'directives/modals/tag_diff_dialog',
         'directives/modals/history_dialog', 'directives/modals/key_config_dialog'],
         function(angular, app, domReady, $) {
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
            url: '/edit/*document_path?new&type&last_commit',
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
