define(['controllers/tag', 'highlight'], function(tag_controller, hljs) {
    return tag_controller.controller('Doc', function($scope, $state, $sce, $timeout, Restangular) {
        if (!$state.params.document_path && $scope.current.document_path)
            return $state.go('application.project.tag.doc', {document_path: $scope.current.document_path});

        $scope.has_document = function() {
            return !_.isUndefined($scope.current.document);
        };

        if ($state.params.document_path) {
            $scope.current.document_path = $state.params.document_path;
            Restangular.one('projects', $scope.current.project.id).getList($state.params.tag_name + '/' + $state.params.document_path).then(function(doc) {
                if(!doc || doc['error']) {
                    // TODO: Error handling
                    throw doc['error'];
                } else if(!_.isUndefined(doc['doc'])) {
                    $scope.current.document = $sce.trustAsHtml(doc['doc']);
                    handle();
                }
            }, function(error) {
                // TODO: Error handling
                throw error;
            });
        }
        
        handle();

        function handle() {
            $timeout(function() {
                $('#current_document pre code').each(function(i, e) {
                    $(e).addClass($(e).parent('pre').attr('lang'));
                    hljs.highlightBlock(e);
                });

                $('#current_document a[href]').each(function(i, e) { // Important for ui-router
                    $(e).attr('target', '_self');
                });
            });
        }
    });
});