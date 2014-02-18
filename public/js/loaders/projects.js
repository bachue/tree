define(['jquery'], function($) {
    var deferred = new $.Deferred();

    $.getJSON('api/projects').then(function(projects) {
        if (projects['error']) deferred.reject(projects);
        else deferred.resolve(projects);
    }, function(error) {
        deferred.reject(error);
    });

    return deferred.promise();
});