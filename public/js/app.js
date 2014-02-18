define(['angular', 'controllers', 'directives', 'filters', 'angular_ui_router', 'restangular', 'abn_tree_directive',
        'angular_animate'],
    function(angular) {
    return angular.module('TreeApp', ['controllers', 'directives', 'filters', 'ui.router', 'restangular', 'angularBootstrapNavTree',
                                      'ngAnimate']);
});