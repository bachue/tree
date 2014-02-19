define(['jquery'], function($) {
    var deferred = new $.Deferred();

    $.getJSON('api/projects').then(function(projects) {
        if (!projects || projects['error']) {
            // TODO: Error handling
            throw projects['error'];
        }
        else deferred.resolve(projects);
    }, function(error) {
        // TODO: Error handling
        throw error;
    });

    return deferred.promise();
});