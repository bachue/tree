define(['angular', 'controllers', 'directives', 'filters', 'factories', 'angular_ui_router', 'restangular', 'abn_tree_directive',
        'angular_animate'],
    function(angular) {
    return angular.module('TreeApp', ['controllers', 'directives', 'filters', 'factories', 'ui.router', 'restangular', 'angularBootstrapNavTree',
                                      'ngAnimate']);
});
