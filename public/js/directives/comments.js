define(['directives', 'jquery', 'underscore', 'bootstrap'], function(directives, $, _) {
    directives.directive('commentRender', function() {
        return function(scope, ele) {
            scope.$on('renderComments', function() {
                var showPopover = function () {
                    if(!this.force_to_show) {
                        $(this).popover('show');
                        relocatePopover(this);
                    }
                },  hidePopover = function () {
                    if(!this.force_to_show)
                        $(this).popover('hide');
                },  forceToShowPopover = function() {
                    if(this.force_to_show) {
                        delete this.force_to_show;
                        hidePopover();
                    } else {
                        showPopover();
                        this.force_to_show = true;
                    }
                },  relocatePopover = function(dom) {
                    _.defer(function() {
                        $('.popover:has(.panel-comments)').each(function(i, popover) {
                            if ($(popover).position().top < 0) {
                                $(popover).css('top', 0);
                                var top = $(dom).position().top;
                                $(popover).find('.arrow').css('top', top + 70 + $(dom).height()/2 + 'px');
                            }
                        });
                    });
                };
                $('[data-toggle=popover]', ele).popover().
                    click(forceToShowPopover).
                    hover(showPopover, hidePopover);
            });
        };
    });
});
