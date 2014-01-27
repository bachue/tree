define(['controllers/project'], function(project) {
    return project.controller('Doc', function($scope, $state, $sce, Restangular) {
        if (!$scope.projects) {
            return $state.go('application');
        };

        if (!$state.params.document_path && $scope.current.document_path)
            return $state.go('application.project.doc', {document_path: $scope.current.document_path});


        if ($state.params.document_path) {
            Restangular.one('projects', $scope.current.project.id).getList($state.params.document_path).then(function(doc) {
                if(doc['error']) {
                    throw doc['error'];
                } else if(doc['doc']) {
                    $scope.current.document = $sce.trustAsHtml(doc['doc']);
                }
            });
        }
    });
});