define(['factories', 'factories/common'], function(factories) {
    return factories.factory('Keys', function($q, Restangular, CommonFactory) {
        var resolveCallback = CommonFactory.resolveCallback,
            rejectCallback = CommonFactory.rejectCallback;
        return {
            // GET     /api/keys
            all: function() {
                var deferred = $q.defer();
                Restangular.all('keys').getList().
                    then(resolveCallback(deferred), rejectCallback(deferred));
                return deferred.promise;
            },
            // POST    /api/keys
            new: function(params) {
                var deferred = $q.defer();
                Restangular.all('keys').post(params).
                    then(resolveCallback(deferred), rejectCallback(deferred));
                return deferred.promise;
            },
            // DELETE  /api/keys/:id
            delete: function(id) {
                var deferred = $q.defer();
                Restangular.one('keys', id).remove().
                    then(resolveCallback(deferred), rejectCallback(deferred));
                return deferred.promise;
            },
        };
    });
});
