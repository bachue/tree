define(['controllers/tag', 'highlight', 'factories/projects', 'factories/loading_indicator', 'factories/notice', 'factories/commit_mode'], function(tag_controller, hljs) {
    return tag_controller.controller('Doc', function($scope, $state, $sce, $timeout, Projects, LoadingIndicator, Notice, CommitMode) {
        if (!$scope.current.project || !$scope.current.tag_name) return;

        if (!$state.params.document_path && $scope.current.document_path)
            return $state.go('application.project.tag.doc', {document_path: $scope.current.document_path}, {location: 'replace'});

        $scope.has_document = function() {
            return !_.isUndefined($scope.current.document);
        };

        $scope.edit_doc = function() {
            $state.go('application.project.tag.edit', {document_path: $scope.current.document_path});
        };

        $scope.open_commit_dialog_to_remove = function() {
            CommitMode.switch_to_delete_mode();
            $('#code-commit-dialog').modal('show');
        };

        LoadingIndicator.load();
        if ($state.params.document_path) {
            $scope.current.document_path = $state.params.document_path;
            $scope.select_tree($scope.current.document_path);

            Projects.get($scope.current.project.id).
                tag($scope.current.tag_name).
                get($scope.current.document_path).
                then(function(doc) {
                    if(!_.isUndefined(doc['doc'])) {
                        var dom = $('<div />').append(doc['doc']);
                        handle(dom);
                        doc = $sce.trustAsHtml(dom.html());
                        $scope.current.document = doc;
                        $timeout(function() { $scope.$broadcast('renderComments'); });
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
                    else if (error.status === 404 && error.data.not_found === true)
                        Notice.warning("Sorry, You're forbidden to create file " + $scope.current.document_path);
                }).finally(LoadingIndicator.loaded);
        } else {
            Projects.get($scope.current.project.id).
                tag($scope.current.tag_name).
                suggest().
                then(function(result) {
                    $state.go('application.project.tag.doc', {document_path: result['suggest']}, {location: 'replace'});
                }).finally(LoadingIndicator.loaded);
        }

        function handle(dom) {
            $('pre code', dom).each(function(i, e) {
                var lang = $(e).parent('pre').attr('lang');
                hljs.highlightBlock(e);
            });

            $('a[href]', dom).each(function(i, e) { // Important for ui-router
                var href = $(e).attr('href');
                if (href.indexOf('javascript:') === -1 && href.indexOf('://') !== -1)
                    $(e).attr('href', 'javascript:open("' + href + '")');
            });

            $('img,audio,video', dom).each(function(i, e) {
                var src = $(e).attr('src');
                if (src.indexOf('://') === -1 && src.indexOf('/') !== 0) {
                    var url = '/' + $scope.current.project.name;
                    url += '/' + $scope.current.tag_name;
                    url += '/' + expand_path(src);
                    $(e).attr('src', url);
                }
            });

            function expand_path(path) {
                return $scope.current.document_path.split('/').slice(0, -1).concat(path).join('/');
            }
        }
    });
});
