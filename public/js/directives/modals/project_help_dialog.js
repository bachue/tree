define(['directives', 'factories/modal'], function(directives) {
    directives.directive('projectHelpDialog', function(Modal) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/modals/project_help_dialog.html',
            link: function(scope, element) {
                Modal.setup_counter(element);
                Modal.setup_shortcut(47, '#project-search-dialog');
            }
        };
    });
});
