Garnish.$doc.ready(() => {
    // Wait for Craft to be ready
    if (typeof Craft === 'undefined') {
        console.error('Craft not found');
        return;
    }

    console.log('Matrix Horizontal Columns: Plugin initialized');

    // Get settings with defaults
    const settings = window.matrixHorizontalColumnsSettings || {};
    const {
        enabled = true,
        columnBlockType = '',
        rowBlockType = '',
        minBlockWidth = 250,
        maxBlockWidth = 500,
        showScrollIndicators = true
    } = settings;

    console.log('Settings loaded:', {
        enabled,
        columnBlockType,
        rowBlockType,
        minBlockWidth,
        maxBlockWidth,
        showScrollIndicators
    });

    // Exit if disabled
    if (!enabled) {
        console.log('Plugin disabled, exiting');
        return;
    }

    // Store the original drag initialization
    const originalDragInit = Garnish.Drag.prototype.init;
    const originalDragSortInit = Garnish.DragSort.prototype.init;

    // Helper function to check if element matches block type
    const matchesBlockType = (element, blockType, isRow = false) => {
        if (!blockType) return false;
        const $element = $(element);
        const attribute = isRow ? 'data-type' : 'data-attribute';
        const matches = $element.find(`[${attribute}="${blockType}"]`).length > 0 || 
                       $element.closest(`[${attribute}="${blockType}"]`).length > 0;
        console.log(`Checking block type match:`, {
            blockType,
            isRow,
            attribute,
            matches,
            element: $element[0]
        });
        return matches;
    };

    // Helper function to get the container for an element
    const getContainer = ($element) => {
        // If element is a column block, get its row container
        if (matchesBlockType($element, columnBlockType)) {
            const container = $element.closest('.blocks');
            console.log('Found column container:', container[0]);
            return container;
        }
        // If element is a row block, get the matrix container
        if (matchesBlockType($element, rowBlockType, true)) {
            const container = $element.closest('.matrix-field');
            console.log('Found row container:', container[0]);
            return container;
        }
        console.log('No container found for element:', $element[0]);
        return null;
    };

    // Helper function to handle automatic scrolling
    const handleAutoScroll = ($container) => {
        if (!$container || !$container.length) return;

        // Update scroll indicators if enabled
        if (showScrollIndicators) {
            const canScrollLeft = $container.scrollLeft() > 0;
            const canScrollRight = $container.scrollLeft() < $container[0].scrollWidth - $container[0].clientWidth;
            console.log('Scroll state:', { canScrollLeft, canScrollRight });
            $container.toggleClass('can-scroll-left', canScrollLeft);
            $container.toggleClass('can-scroll-right', canScrollRight);
        }
    };

    // Override the drag initialization
    Garnish.Drag.prototype.init = function(items, settings = {}) {
        const $items = $(items);
        const isColumn = matchesBlockType($items, columnBlockType);
        const isRow = matchesBlockType($items, rowBlockType, true);

        console.log('Drag init:', {
            isColumn,
            isRow,
            items: $items[0],
            settings
        });

        // Check if this is a Matrix drag within enabled block types
        if ($items.closest('.matrix-field').length && (isColumn || isRow)) {
            const $container = getContainer($items);
            
            // Force horizontal dragging for columns, vertical for rows
            settings = $.extend({}, settings, {
                axis: isColumn ? 'x' : 'y',
                helperLagBase: 1,
                removeDraggee: false,
                handle: isColumn ? '.move' : null,
                onDrag: function() {
                    console.log('onDrag called', {
                        mouseX: Garnish.mouseX,
                        mouseY: Garnish.mouseY,
                        axis: this.settings ? this.settings.axis : 'none'
                    });
                    if (isColumn) {
                        handleAutoScroll($container);
                    }
                }
            });

            console.log('Modified drag settings:', settings);

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

        // Force horizontal movement for columns after initialization
        if (isColumn) {
            this.settings = this.settings || {};
            this.settings.axis = 'x';
            this.settings.handle = '.move';
            console.log('Post-init drag settings:', this.settings);
        }
    };

    // Override DragSort initialization
    Garnish.DragSort.prototype.init = function(items, settings = {}) {
        const $items = $(items);
        const isColumn = matchesBlockType($items, columnBlockType);
        const isRow = matchesBlockType($items, rowBlockType, true);

        console.log('DragSort init:', {
            isColumn,
            isRow,
            items: $items[0],
            settings
        });

        // Check if this is a Matrix drag sort within enabled block types
        if ($items.closest('.matrix-field').length && (isColumn || isRow)) {
            const $container = getContainer($items);
            
            // Force horizontal dragging and sorting for columns, vertical for rows
            settings = $.extend({}, settings, {
                axis: isColumn ? 'x' : 'y',
                helperLagBase: 1,
                removeDraggee: false,
                handle: isColumn ? '.move' : null,
                onDrag: function() {
                    console.log('onDragSort called', {
                        mouseX: Garnish.mouseX,
                        mouseY: Garnish.mouseY,
                        axis: this.settings ? this.settings.axis : 'none'
                    });
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
                    
                    console.log('Insertion point calculation:', {
                        containerLeft,
                        mouseX,
                        itemWidth
                    });

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

                    console.log('Insertion point updated:', {
                        insertBefore: insertBefore ? insertBefore : 'append'
                    });
                }
            });

            console.log('Modified dragSort settings:', settings);

            // Apply visual settings to helper
            if (isColumn) {
                settings.helper = function($item) {
                    return $item.clone()
                        .css({
                            'min-width': minBlockWidth + 'px',
                            'max-width': maxBlockWidth + 'px'
                        });
                };
            }
        }
        
        // Call the original init with our modified settings
        originalDragSortInit.call(this, items, settings);

        // Force horizontal movement for columns after initialization
        if (isColumn) {
            this.settings = this.settings || {};
            this.settings.axis = 'x';
            this.settings.handle = '.move';
            if (this.drag) {
                this.drag.settings = this.drag.settings || {};
                this.drag.settings.axis = 'x';
                this.drag.settings.handle = '.move';
            }
            console.log('Post-init dragSort settings:', {
                main: this.settings,
                drag: this.drag ? this.drag.settings : null
            });
        }
    };

    // Initialize scroll indicators if enabled
    if (showScrollIndicators && columnBlockType) {
        // Add indicators for column containers
        $(`.matrix-field [data-attribute="${columnBlockType}"]`).closest('.blocks').each(function() {
            const $container = $(this);
            console.log('Initializing scroll indicators for container:', $container[0]);
            
            $container.on('scroll', function() {
                $container.toggleClass('can-scroll-left', $container.scrollLeft() > 0);
                $container.toggleClass('can-scroll-right', 
                    $container.scrollLeft() < $container[0].scrollWidth - $container[0].clientWidth);
            });
            
            // Trigger initial scroll check
            $container.trigger('scroll');
        });
    }
});
