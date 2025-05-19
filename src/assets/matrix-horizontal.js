Garnish.$doc.ready(() => {
    // Wait for Craft to be ready
    if (typeof Craft === 'undefined') {
        console.error('Craft not found');
        return;
    }

    // Get settings with defaults
    const settings = window.matrixHorizontalColumnsSettings || {};
    const {
        enabled = true,
        columnBlockType = '',
        rowBlockType = '',
    } = settings;

    // Exit if disabled
    if (!enabled) {
        return;
    }

    // Apply row class to row blocks
    if (rowBlockType) {
        $(`[data-type="${rowBlockType}"]`).addClass('matrix-horizontal-row');
    }

    // Store the original drag initialization
    const originalDragInit = Garnish.Drag.prototype.init;
    const originalDragSortInit = Garnish.DragSort.prototype.init;

    // Helper function to check if element is a column block
    const isColumnBlock = (element) => {
        return columnBlockType && $(element).closest(`[data-type="${columnBlockType}"]`).length > 0;
    };

    // Helper function to handle automatic scrolling
    const handleAutoScroll = ($container) => {
        const containerRect = $container[0].getBoundingClientRect();
        const scrollThreshold = 100; // Fixed value for reliable scrolling
        const scrollSpeed = 10; // Fixed value for consistent behavior

        // Calculate distances from edges
        const mouseDistanceFromLeft = Garnish.mouseX - containerRect.left;
        const mouseDistanceFromRight = containerRect.right - Garnish.mouseX;

        // Auto-scroll based on mouse position
        if (mouseDistanceFromLeft < scrollThreshold) {
            $container.scrollLeft($container.scrollLeft() - scrollSpeed);
        } else if (mouseDistanceFromRight < scrollThreshold) {
            $container.scrollLeft($container.scrollLeft() + scrollSpeed);
        }
    };

    // Override the drag initialization
    Garnish.Drag.prototype.init = function(items, settings) {
        // Check if this is a Matrix drag within a column block
        if ($(items).closest('.matrix-field').length && isColumnBlock(items)) {
            const $container = $(items).closest('.blocks');
            
            // Force horizontal dragging for Matrix
            settings = $.extend({}, settings, {
                axis: 'x',
                magnetStrength: 4, // Fixed value for consistent behavior
                helperLagBase: 1,
                removeDraggee: false,
                onDrag: function() {
                    handleAutoScroll($container);
                }
            });
        }
        
        // Call the original init with our modified settings
        originalDragInit.call(this, items, settings);
    };

    // Override DragSort initialization
    Garnish.DragSort.prototype.init = function(items, settings) {
        // Check if this is a Matrix drag sort within a column block
        if ($(items).closest('.matrix-field').length && isColumnBlock(items)) {
            const $container = $(items).closest('.blocks');
            
            // Force horizontal dragging and sorting for Matrix
            settings = $.extend({}, settings, {
                axis: 'x',
                magnetStrength: 4, // Fixed value for consistent behavior
                helperLagBase: 1,
                removeDraggee: false,
                onDrag: function() {
                    handleAutoScroll($container);
                },
                // Customize the insertion point calculation for horizontal layout
                onInsertionPointChange: function($insertion, $item) {
                    const containerLeft = $container.offset().left;
                    const mouseX = Garnish.mouseX;
                    
                    // Find the closest insertion point based on mouse position
                    let insertBefore = null;
                    $container.children(':visible').each(function() {
                        const $this = $(this);
                        const thisLeft = $this.offset().left;
                        if (mouseX < thisLeft + ($this.outerWidth() / 2)) {
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
                        'opacity': 0.85, // Fixed value for consistent behavior
                        'transform': 'scale(1.02)', // Fixed value for consistent behavior
                    });
            };
        }
        
        // Call the original init with our modified settings
        originalDragSortInit.call(this, items, settings);
    };
});
