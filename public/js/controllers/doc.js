define(['controllers/project', 'highlight'], function(project, hljs) {
    return project.controller('Doc', function($scope, $state, $sce, $timeout, Restangular) {
        if (!$state.params.document_path && $scope.current.document_path)
            return $state.go('application.project.doc', {document_path: $scope.current.document_path});

        if ($state.params.document_path) {
            $scope.current.document_path = $state.params.document_path;
            Restangular.one('projects', $scope.current.project.id).getList($state.params.document_path).then(function(doc) {
                if(doc['error']) {
                    throw doc['error'];
                } else if(doc['doc']) {
                    $scope.current.document = $sce.trustAsHtml(doc['doc']);
                    highlight();
                }
            });
        }
        
        highlight();

        function highlight() {
            $timeout(function() {
                $('#current_document pre code').each(function(i, e) { 
                    $(e).addClass($(e).parent('pre').attr('lang'));
                    hljs.highlightBlock(e);
                });
            });
        }
    });
});