Garnish.$doc.ready(() => {
    // Wait for Craft to be ready
    if (typeof Craft === 'undefined') {
        console.error('Craft not found');
        return;
    }

    // Get settings with defaults
    const settings = window.matrixHorizontalDragSettings || {};
    const {
        enabled = true,
        enabledSelectors = ['[data-attribute="cbColumn"]'],
        scrollSpeed = 10,
        scrollThreshold = 100,
        minBlockWidth = 250,
        maxBlockWidth = 500,
        dragOpacity = 0.85,
        dragScale = 1.02,
        magnetStrength = 4,
        showScrollIndicators = true
    } = settings;

    // Exit if disabled
    if (!enabled) {
        return;
    }

    // Store the original drag initialization
    const originalDragInit = Garnish.Drag.prototype.init;
    const originalDragSortInit = Garnish.DragSort.prototype.init;

    // Helper function to check if element is within enabled selectors
    const isWithinEnabledSelector = (element) => {
        return enabledSelectors.some(selector => $(element).closest(selector).length > 0);
    };

    // Helper function to handle automatic scrolling
    const handleAutoScroll = ($container) => {
        const containerRect = $container[0].getBoundingClientRect();

        // Calculate distances from edges
        const mouseDistanceFromLeft = Garnish.mouseX - containerRect.left;
        const mouseDistanceFromRight = containerRect.right - Garnish.mouseX;

        // Update scroll indicators if enabled
        if (showScrollIndicators) {
            $container.parent().toggleClass('can-scroll-left', $container.scrollLeft() > 0);
            $container.parent().toggleClass('can-scroll-right', 
                $container.scrollLeft() < $container[0].scrollWidth - $container[0].clientWidth);
        }

        // Auto-scroll based on mouse position
        if (mouseDistanceFromLeft < scrollThreshold) {
            $container.scrollLeft($container.scrollLeft() - scrollSpeed);
        } else if (mouseDistanceFromRight < scrollThreshold) {
            $container.scrollLeft($container.scrollLeft() + scrollSpeed);
        }
    };

    // Override the drag initialization
    Garnish.Drag.prototype.init = function(items, settings) {
        // Check if this is a Matrix drag within enabled selectors
        if ($(items).closest('.matrix-field').length && isWithinEnabledSelector(items)) {
            const $container = $(items).closest('.blocks');
            
            // Force horizontal dragging for Matrix
            settings = $.extend({}, settings, {
                axis: 'x',
                magnetStrength: magnetStrength,
                helperLagBase: 1,
                removeDraggee: false,
                onDrag: function() {
                    handleAutoScroll($container);
                }
            });

            // Apply visual settings to dragged items
            $(items).css({
                'min-width': minBlockWidth + 'px',
                'max-width': maxBlockWidth + 'px'
            });
        }
        
        // Call the original init with our modified settings
        originalDragInit.call(this, items, settings);
    };

    // Override DragSort initialization
    Garnish.DragSort.prototype.init = function(items, settings) {
        // Check if this is a Matrix drag sort within enabled selectors
        if ($(items).closest('.matrix-field').length && isWithinEnabledSelector(items)) {
            const $container = $(items).closest('.blocks');
            
            // Force horizontal dragging and sorting for Matrix
            settings = $.extend({}, settings, {
                axis: 'x',
                magnetStrength: magnetStrength,
                helperLagBase: 1,
                removeDraggee: false,
                onDrag: function() {
                    handleAutoScroll($container);
                },
                // Customize the insertion point calculation for horizontal layout
                onInsertionPointChange: function($insertion, $item) {
                    const containerLeft = $container.offset().left;
                    const mouseX = Garnish.mouseX;
                    const itemWidth = $item.outerWidth();
                    
                    // Find the closest insertion point based on mouse position
                    let insertBefore = null;
                    $container.children(':visible').each(function() {
                        const $this = $(this);
                        const thisLeft = $this.offset().left;
                        if (mouseX < thisLeft + (itemWidth / 2)) {
                            insertBefore = this;
                            return false;
                        }
                    });
                    
                    // Update insertion point
                    if (insertBefore) {
                        $insertion.insertBefore(insertBefore);
                    } else {
                        $insertion.appendTo($container);
                    }
                }
            });

            // Apply visual settings to helper
            settings.helper = function($item) {
                return $item.clone()
                    .css({
                        'opacity': dragOpacity,
                        'transform': `scale(${dragScale})`,
                        'min-width': minBlockWidth + 'px',
                        'max-width': maxBlockWidth + 'px'
                    });
            };
        }
        
        // Call the original init with our modified settings
        originalDragSortInit.call(this, items, settings);
    };

    // Initialize scroll indicators if enabled
    if (showScrollIndicators) {
        enabledSelectors.forEach(selector => {
            $(`${selector} .matrix-field`).each(function() {
                const $field = $(this);
                const $blocks = $field.find('.blocks');
                
                $blocks.on('scroll', function() {
                    $field.toggleClass('can-scroll-left', $blocks.scrollLeft() > 0);
                    $field.toggleClass('can-scroll-right', 
                        $blocks.scrollLeft() < $blocks[0].scrollWidth - $blocks[0].clientWidth);
                });
                
                // Trigger initial scroll check
                $blocks.trigger('scroll');
            });
        });
    }
});
