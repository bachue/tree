define(['factories', 'jquery', 'marked', 'textile'], function(factories, $, marked, textile) {
    return factories.factory('PreviewFactory', function($sce) {
        marked.setOptions({
            highlight: function(code, type) {
                var value;
                if (type) {
                    try {
                        value = hljs.highlight(type, code).value;
                    } catch(err) {
                        value = hljs.highlightAuto(code).value;
                    }
                }
                else
                    value = hljs.highlightAuto(code).value;
                return value;
            }
        });

        return {
            renderer: function(type, callbacks) {
                switch (type) {
                case 'markdown':
                    return function(editor) {
                        var markdown = editor.getValue();
                        if (callbacks.before) markdown = callbacks.before(markdown, type);
                        var rendered = marked(markdown);
                        var dom = $(rendered);
                        if(callbacks.after) dom = callbacks.after(dom, type);
                        return $sce.trustAsHtml($('<div />').append(dom).html());
                    };
                case 'textile':
                    return function(editor) {
                        var content = editor.getValue();
                        if (callbacks.before) content = callbacks.before(content, type);
                        var rendered = textile(content);
                        var dom = $(rendered);
                        if(callbacks.after) dom = callbacks.after(dom, type);
                        return $sce.trustAsHtml($('<div />').append(dom).html());
                    };
                case 'html':
                    return function(editor) {
                        var html = editor.getValue();
                        if (callbacks.before) html = callbacks.before(html, type);
                        var dom = $(html);
                        if(callbacks.after) dom = callbacks.after(dom, type);
                        return $sce.trustAsHtml($('<div />').append(dom).html());
                    };
                }
            }
        };
    });
});
