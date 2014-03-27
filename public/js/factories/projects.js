define(['factories', 'bootbox', 'essage'], function(factories, bootbox, essage) {
    return factories.factory('Projects', function($q, Restangular) {
        var resolveCallback = function(deferred) { return function(result) {
            if (result && !result['error']) deferred.resolve(result);
            else deferred.reject((result || {error: 'Unknown Error'}));
        }; };
        var rejectCallback = function(deferred) { return function(error) {
            if (error.status === 404 && error.data)
                ; // Do nothing because it's expected
            else if (error.data.message)
                bootbox.alert(error.data.message);
            else
                essage.show({
                    message: 'Ooh... Looks like somethings wrong... Please check the network connection and try again.',
                    status: 'error'
                }, 5000);
            deferred.reject(error);
        }; };

        return {
            // GET     /api/projects
            all: function() {
                var deferred = $q.defer();
                Restangular.all('projects').getList().
                    then(resolveCallback(deferred), rejectCallback(deferred));
                return deferred.promise;
            },
            // POST    /api/projects
            new: function(params) {
                var deferred = $q.defer();
                Restangular.all('projects').post(params).
                    then(resolveCallback(deferred), rejectCallback(deferred));
                return deferred.promise;
            },
            get: function(id) {
                return {
                    // PUT     /api/projects/:id/tags/:tag_name
                    create_tag: function(tag) {
                        var deferred = $q.defer();
                        Restangular.one('projects', id).one('tags', tag).put().
                            then(resolveCallback(deferred), rejectCallback(deferred));
                        return deferred.promise;
                    },
                    // PUT     /api/projects/:id/raw/*path
                    update: function(path, params) {
                        var deferred = $q.defer();
                        Restangular.one('projects', id).all('raw').customPUT(params, path).
                            then(resolveCallback(deferred), rejectCallback(deferred));
                        return deferred.promise;
                    },
                    // DELETE  /api/projects/:id/raw/*path
                    delete: function(path, params) {
                        var deferred = $q.defer();
                        Restangular.one('projects', id).all('raw').customDELETE(path, params).
                            then(resolveCallback(deferred), rejectCallback(deferred));
                        return deferred.promise;
                    },
                    // POST    /api/projects/:id/diff
                    diff_with: function(base, params) {
                        var deferred = $q.defer();
                        Restangular.one('projects', id).post('diff', _.extend(params, {base: base})).
                            then(resolveCallback(deferred), rejectCallback(deferred));
                        return deferred.promise;
                    },
                    tag: function(tag) {
                        return {
                            // GET     /api/projects/:id/tags/:tag_name
                            tree: function() {
                                var deferred = $q.defer();
                                Restangular.one('projects', id).one('tags', tag).getList().
                                    then(resolveCallback(deferred), rejectCallback(deferred));
                                return deferred.promise;
                            },
                            // GET     /api/projects/:id/tags/:tag_name/render/*path
                            get: function(path) {
                                var deferred = $q.defer();
                                Restangular.one('projects', id).one('tags', tag).
                                    all('render').all(path).getList().
                                    then(resolveCallback(deferred), rejectCallback(deferred));
                                return deferred.promise;
                            },
                            // GET     /api/projects/:id/tags/:tag_name/raw/*path
                            raw: function(path) {
                                var deferred = $q.defer();
                                Restangular.one('projects', id).one('tags', tag).
                                    all('raw').all(path).getList().
                                    then(resolveCallback(deferred), rejectCallback(deferred));
                                return deferred.promise;
                            },
                            // GET     /api/projects/:id/tags/:tag_name/search
                            search: function(params) {
                                var deferred = $q.defer();
                                Restangular.one('projects', id).one('tags', tag).
                                    getList('search', params).
                                    then(resolveCallback(deferred), rejectCallback(deferred));
                                return deferred.promise;
                            },
                            // GET     /api/projects/:id/tags/:tag_name/suggest(/*path)
                            suggest: function(path) {
                                var deferred = $q.defer();
                                var suggest = Restangular.one('projects', id).
                                    one('tags', tag).all('suggest');
                                if (path) suggest = suggest.all(path);
                                suggest.getList().
                                    then(resolveCallback(deferred), rejectCallback(deferred));
                                return deferred.promise;
                            },
                            // GET     /api/projects/:id/diff/:tag1/:tag2
                            diff: function(another) {
                                var deferred = $q.defer();
                                Restangular.one('projects', id).
                                    all('diff').all(another).all(tag).getList().
                                    then(resolveCallback(deferred), rejectCallback(deferred));
                                return deferred.promise;
                            },
                            // GET     /api/projects/:id/tags/:tag_name/logs/*path
                            logs: function(path) {
                                var deferred = $q.defer();
                                Restangular.one('projects', id).
                                    one('tags', tag).all('logs').all(path).getList().
                                    then(resolveCallback(deferred), rejectCallback(deferred));
                                return deferred.promise;
                            }
                        };
                    }
                };
            }
        };
    });
});
