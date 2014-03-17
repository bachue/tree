define(['controllers/tag', 'highlight', 'factories/projects'], function(tag_controller, hljs) {
    return tag_controller.controller('Doc', function($scope, $state, $sce, $timeout, Projects) {
        if (!$state.params.document_path && $scope.current.document_path)
            return $state.go('application.project.tag.doc', {document_path: $scope.current.document_path}, {location: 'replace'});

        $scope.has_document = function() {
            return !_.isUndefined($scope.current.document);
        };

        $scope.edit_doc = function() {
            $state.go('application.project.tag.edit', {document_path: $scope.current.document_path});
        };

        $scope.current.loading += 1;
        if ($state.params.document_path) {
            $scope.current.document_path = $state.params.document_path;

            Projects.get($scope.current.project.id).
                tag($scope.current.tag_name).
                get($scope.current.document_path).
                then(function(doc) {
                    if(!_.isUndefined(doc['doc'])) {
                        $scope.current.document = $sce.trustAsHtml(doc['doc']);
                        handle();
                    }
                }, function(error) {
                    if ($scope.current.tag_name != 'HEAD') {
                        delete $scope.current.document_path;
                        $state.go('application.project.tag.doc', {document_path: null}, {location: 'replace'});
                    }
                    else if (error.status === 404 && error.data.empty === true)
                        $state.go('application.project.tag.edit', {
                            document_path: $scope.current.document_path,
                            new: true, type: error.data.type
                        }, {location: 'replace'});
                    else
                        // TODO: use dialog lib here
                        alert("You can't create file " + $scope.current.document_path);
                }).finally(function() {
                    $scope.current.loading -= 1;
                });
        } else {
            Projects.get($scope.current.project.id).
                tag($scope.current.tag_name).
                suggest().
                then(function(result) {
                    $state.go('application.project.tag.doc', {document_path: result['suggest']}, {location: 'replace'});
                    $scope.select_tree(result['suggest']);
                }).finally(function() {
                    $scope.current.loading -= 1;
                });
        }

        function handle() {
            $timeout(function() {
                $('#current_document pre code').each(function(i, e) {
                    $(e).addClass($(e).parent('pre').attr('lang'));
                    hljs.highlightBlock(e);
                });

                $('#current_document a[href]').each(function(i, e) { // Important for ui-router
                    var href = $(e).attr('href');
                    if (href.indexOf('javascript:') !== 0)
                        $(e).attr('href', 'javascript:open("' + href + '")');
                });

                $('#current_document img, #current_document audio, #current_document video').each(function(i, e) {
                    var src = $(e).attr('src');
                    if (src.indexOf('://') === -1 && src.indexOf('/') !== 0) {
                        var url = '/' + $scope.current.project.name;
                        url += '/' + $scope.current.tag_name;
                        var base = $scope.current.document_path.split('/').slice(0, -1).join('/');
                        url += '/' + base + '/' + src;
                        $(e).attr('src', url);
                    }
                });
            });
        }
    });
});
