define(['factories'], function(factories) {
    return factories.factory('Projects', function($q, Restangular) {
        var resolveCallback = function(deferred) { return function(result) {
            if (result && !result['error']) deferred.resolve(result);
            else deferred.reject((result || {error: 'Unknown Error'})['error']);
        }; };
        var rejectCallback = function(deferred) { return function(error) {
            deferred.reject(error);
            throw error.data; // TODO: Error handling
        }; };

        return {
            all: function() {
                var deferred = $q.defer();
                Restangular.all('projects').getList().
                    then(resolveCallback(deferred), rejectCallback(deferred));
                return deferred.promise;
            },
            new: function(params) {
                var deferred = $q.defer();
                Restangular.all('projects').post(params).
                    then(resolveCallback(deferred), rejectCallback(deferred));
                return deferred.promise;
            },
            get: function(id) {
                return {
                    create_tag: function(tag) {
                        var deferred = $q.defer();
                        Restangular.one('projects', id).customPUT(null, tag).
                            then(resolveCallback(deferred), rejectCallback(deferred));
                        return deferred.promise;
                    },
                    raw: function(path) {
                        var deferred = $q.defer();
                        Restangular.one('projects/raw', id).getList(path).
                            then(resolveCallback(deferred), rejectCallback(deferred));
                        return deferred.promise;
                    },
                    update: function(path, params) {
                        var deferred = $q.defer();
                        Restangular.one('projects/raw', id).customPUT(params, path).
                            then(resolveCallback(deferred), rejectCallback(deferred));
                        return deferred.promise;
                    },
                    delete: function(path, params) {
                        var deferred = $q.defer();
                        Restangular.one('projects/raw', id).customDELETE(path, params).
                            then(resolveCallback(deferred), rejectCallback(deferred));
                        return deferred.promise;
                    },
                    tag: function(tag) {
                        return {
                            tree: function() {
                                var deferred = $q.defer();
                                Restangular.one('projects', id).getList(tag).
                                    then(resolveCallback(deferred), rejectCallback(deferred));
                                return deferred.promise;
                            },
                            get: function(path) {
                                var deferred = $q.defer();
                                Restangular.one('projects', id).getList(tag + '/' + path).
                                    then(resolveCallback(deferred), rejectCallback(deferred));
                                return deferred.promise;
                            },
                            search: function(params) {
                                var deferred = $q.defer();
                                Restangular.one('projects', id).
                                    getList(tag + '/_search', params).
                                    then(resolveCallback(deferred), rejectCallback(deferred));
                                return deferred.promise;
                            },
                            suggest: function(path) {
                                var deferred = $q.defer();
                                Restangular.one('projects/suggest', id).
                                    getList(tag + '/' + (path || '')).
                                    then(resolveCallback(deferred), rejectCallback(deferred));
                                return deferred.promise;
                            },
                            diff: function(another) {
                                var deferred = $q.defer();
                                Restangular.one('projects/diff', id).getList(another + '/' + tag).
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
