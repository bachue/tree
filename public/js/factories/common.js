define(['factories', 'bootbox', 'essage'], function(factories, bootbox, essage) {
    return factories.factory('CommonFactory', function(Restangular) {
        return {
            resolveCallback: function(deferred) {
                return function(result) {
                    if (result && !result['error']) deferred.resolve(result);
                    else deferred.reject((result || {error: 'Unknown Error'}));
                };
            },
            rejectCallback: function(deferred) {
                return function(error) {
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
                };
            }
        };
    });
});
