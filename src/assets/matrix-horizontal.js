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
        columnSelectors = ['[data-attribute="cbColumn"]'],
        rowSelectors = ['[data-attribute="cbRow"]'],
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

    // Helper function to check if element matches selectors
    const matchesSelectors = (element, selectors) => {
        return selectors.some(selector => $(element).is(selector) || $(element).closest(selector).length > 0);
    };

    // Helper function to get the container for an element
    const getContainer = ($element) => {
        // If element is a column, get its row container
        if (matchesSelectors($element, columnSelectors)) {
            return $element.closest('.blocks');
        }
        // If element is a row, get the matrix container
        if (matchesSelectors($element, rowSelectors)) {
            return $element.closest('.matrix-field');
        }
        return null;
    };

    // Helper function to handle automatic scrolling
    const handleAutoScroll = ($container) => {
        if (!$container || !$container.length) return;

        const containerRect = $container[0].getBoundingClientRect();

        // Calculate distances from edges
        const mouseDistanceFromLeft = Garnish.mouseX - containerRect.left;
        const mouseDistanceFromRight = containerRect.right - Garnish.mouseX;

        // Update scroll indicators if enabled
        if (showScrollIndicators) {
            $container.toggleClass('can-scroll-left', $container.scrollLeft() > 0);
            $container.toggleClass('can-scroll-right', 
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
        const $items = $(items);
        const isColumn = matchesSelectors($items, columnSelectors);
        const isRow = matchesSelectors($items, rowSelectors);

        // Check if this is a Matrix drag within enabled selectors
        if ($items.closest('.matrix-field').length && (isColumn || isRow)) {
            const $container = getContainer($items);
            
            // Force horizontal dragging for columns, vertical for rows
            settings = $.extend({}, settings, {
                axis: isColumn ? 'x' : 'y',
                magnetStrength: magnetStrength,
                helperLagBase: 1,
                removeDraggee: false,
                onDrag: function() {
                    if (isColumn) {
                        handleAutoScroll($container);
                    }
                }
            });

            // Apply visual settings to dragged items
            if (isColumn) {
                $items.css({
                    'min-width': minBlockWidth + 'px',
                    'max-width': maxBlockWidth + 'px'
                });
            }
        }
        
        // Call the original init with our modified settings
        originalDragInit.call(this, items, settings);
    };

    // Override DragSort initialization
    Garnish.DragSort.prototype.init = function(items, settings) {
        const $items = $(items);
        const isColumn = matchesSelectors($items, columnSelectors);
        const isRow = matchesSelectors($items, rowSelectors);

        // Check if this is a Matrix drag sort within enabled selectors
        if ($items.closest('.matrix-field').length && (isColumn || isRow)) {
            const $container = getContainer($items);
            
            // Force horizontal dragging and sorting for columns, vertical for rows
            settings = $.extend({}, settings, {
                axis: isColumn ? 'x' : 'y',
                magnetStrength: magnetStrength,
                helperLagBase: 1,
                removeDraggee: false,
                onDrag: function() {
                    if (isColumn) {
                        handleAutoScroll($container);
                    }
                },
                // Customize the insertion point calculation
                onInsertionPointChange: function($insertion, $item) {
                    if (!isColumn) {
                        return; // Let default behavior handle vertical sorting
                    }

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
            if (isColumn) {
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
        }
        
        // Call the original init with our modified settings
        originalDragSortInit.call(this, items, settings);
    };

    // Initialize scroll indicators if enabled
    if (showScrollIndicators) {
        // Add indicators for column containers
        columnSelectors.forEach(selector => {
            $(`${selector}`).closest('.blocks').each(function() {
                const $container = $(this);
                
                $container.on('scroll', function() {
                    $container.toggleClass('can-scroll-left', $container.scrollLeft() > 0);
                    $container.toggleClass('can-scroll-right', 
                        $container.scrollLeft() < $container[0].scrollWidth - $container[0].clientWidth);
                });
                
                // Trigger initial scroll check
                $container.trigger('scroll');
            });
        });
    }
});
