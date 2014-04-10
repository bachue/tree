define(['factories', 'jquery', 'underscore'], function(factories, $, _) {
    return factories.factory('CommentsPreHandler', function() {
        return {
            render: function(text) {
                var id_comment_pair = {};
                if(!text.match(/\n$/)) text += '\n';
                text = text.replace(/<([^<>]+)>:\s*((.|\n)*?)(?=\n\s*(\n|<|$))/mg, function(match, id, comment) {
                    id_comment_pair[id] = comment;
                    return '';
                }).replace(/\[([^\[\]]+)\]\s*<([^<>]+)>/g, function(matched, content, id) {
                    if (id_comment_pair[id])
                        //TODO: rewrite
                        return compile(content.trim(), id_comment_pair[id].trim());
                    else
                        return matched;
                }).replace(/\[([^\[\]]+)\]{([^{}]+)}/g, function(matched, content, comments) {
                    return compile(content.trim(), comments.trim());
                });

                return text;

                function compile(content, comments) {
                    comments = _(comments.split("\n")).reduce(function(list, comment) {
                      var matches = comment.match(/(\w+):(.*)$/);
                      if (matches)
                        list.push({author: matches[1].trim(), comments: [matches[2].trim()]});
                      else if (_(list).isEmpty())
                        list.push({comments: [comment.trim()]});
                      else
                        _(list).last().comments.push(comment.trim());

                      return list;
                    }, []);

                    comments = _(comments).map(function(comment) {
                        var root = $('<div />').addClass('panel panel-default panel-comments');
                        if (comment.author)
                            root.append($('<div />').text(comment.author).addClass('panel-heading'));
                        if (!_(comment.comments).isEmpty()) {
                            var body = $('<div />').addClass('panel-body');
                            _(comment.comments).each(function(text) {
                                body.append($('<div />').text(text));
                            });
                            root.append(body);
                        }
                        return $('<div />').append(root).html();
                    });

                    var span = $('<span />').text(content).
                                 addClass('annotated').
                                 attr('data-toggle',    'popover').
                                 attr('data-placement', 'right').
                                 attr('data-animation', 'true').
                                 attr('data-html',      'true').
                                 attr('data-trigger',   'manual').
                                 attr('data-content',   comments.join(''));

                    return $('<div />').append(span).html();
                }
            }
        };
    });
});
