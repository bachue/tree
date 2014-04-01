define(['directives', 'factories/projects', 'factories/modal'], function(directives) {
    directives.directive('historyDialog', function($timeout, Modal) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/modals/history_dialog.html',
            link: function(scope, element) {
                scope.history_dialog = {};

                Modal.setup_counter(element);

                element.on('shown.bs.modal', scope.get_history_info);

                element.on('hidden.bs.modal', function() {
                    $timeout(function() {
                        delete scope.history_dialog.logs;
                    });
                });

            },
            controller: function($scope, Projects) {
                $scope.get_history_info = function() {
                    return Projects.get($scope.current.project.id)
                        .tag($scope.current.tag_name).logs($scope.current.document_path)
                        .then(function(logs) {
                            _.each(logs, function(log) {
                                log.message = log.message.split('\n')[0];
                            });
                            $scope.history_dialog.logs = logs;
                        });
                };
            }
        };
    });
});
