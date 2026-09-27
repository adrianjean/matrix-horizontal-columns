/**
 * Matrix Horizontal Columns
 *
 * Finds Matrix inputs that live inside a "row" entry and hold "column" entries,
 * and turns them into a grid:
 *
 * - entries are sized from their width field and wrap like a Bootstrap row
 * - Craft's own drag-sort is freed to move in any direction
 * - a handle on each column's right edge resizes it, snapping to the grid
 * - grid guides show while resizing or dragging
 * - partly-filled lines show how much of the row they use
 */
(function ($) {
  'use strict';

  if (typeof Craft === 'undefined' || !Craft.MatrixInput) {
    return;
  }

  const settings = Object.assign(
    {
      rowEntryTypeId: null,
      columnEntryTypeId: null,
      widthField: null,
      gridColumns: 12,
    },
    window.MatrixHorizontalColumnsSettings
  );

  if (!settings.rowEntryTypeId || !settings.columnEntryTypeId) {
    return;
  }

  const GRID = Math.max(1, parseInt(settings.gridColumns, 10) || 12);
  // Lines with less free space than this (px) don't get a fill indicator
  const MIN_GHOST_WIDTH = 24;

  // A Number field's text input (not the hidden locale input, nor unsupported radios/checkboxes)
  const NUMBER_INPUT = 'input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"])';

  const t = (message, params) =>
    Craft.t('matrix-horizontal-columns', message, params);

  // Width field values
  // ---------------------------------------------------------------------------

  /**
   * Craft's option fields (Dropdown, Button Group…) encode input values as
   * "base64:<value>" — see craft\fields\BaseOptionsField::encodeValue().
   */
  function decodeOptionValue(value) {
    if (typeof value !== 'string' || !value.startsWith('base64:')) {
      return value;
    }
    try {
      const bytes = Uint8Array.from(atob(value.slice(7)), (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch (e) {
      return null;
    }
  }

  /**
   * A raw input value as a span within the grid, or null.
   */
  function toSpan(value) {
    const n = parseInt(decodeOptionValue(value), 10);
    return Number.isFinite(n) && n >= 1 && n <= GRID ? n : null;
  }

  /**
   * Current value of a Dropdown, Button Group or Number field.
   *
   * (Selectize keeps the underlying <select>'s value in sync, so .val() works for Dropdowns.)
   */
  function readValue($field) {
    const $select = $field.find('select').first();
    if ($select.length) {
      return $select.val();
    }

    const $buttonGroup = $field.find('.btngroup-container');
    if ($buttonGroup.length) {
      return $buttonGroup.siblings('input[type="hidden"]').first().val();
    }

    return $field.find(NUMBER_INPUT).first().val();
  }

  /**
   * All option values of a Dropdown. Craft renders Dropdowns with Selectize,
   * which strips the unselected <option>s from the <select>.
   */
  function selectValues($select) {
    const selectize = $select[0].selectize;
    return selectize
      ? Object.keys(selectize.options)
      : [...$select[0].options].map((option) => option.value);
  }

  /**
   * Spans the field can hold, ascending.
   */
  function allowedSpans($field) {
    let values;

    const $select = $field.find('select').first();
    const $buttons = $field.find('.btngroup button');

    if ($select.length) {
      values = selectValues($select);
    } else if ($buttons.length) {
      values = $buttons.toArray().map((button) => $(button).attr('data-value'));
    } else if ($field.find(NUMBER_INPUT).length) {
      return Array.from({length: GRID}, (v, i) => i + 1);
    } else {
      return [];
    }

    return [...new Set(values.map(toSpan).filter(Boolean))].sort((a, b) => a - b);
  }

  /**
   * Set the field to a span, firing the events Craft listens for.
   * Returns whether the field could hold it.
   */
  function writeValue($field, span) {
    const $select = $field.find('select').first();
    if ($select.length) {
      const selectize = $select[0].selectize;
      const value = selectValues($select).find((v) => toSpan(v) === span);
      if (value === undefined) {
        return false;
      }
      if (selectize) {
        // Updates the visible dropdown and fires change on the <select>
        selectize.setValue(value);
      } else {
        $select.val(value).trigger('change');
      }
      return true;
    }

    const $group = $field.find('.btngroup');
    if ($group.length) {
      const $buttons = $group.find('button');
      const index = $buttons
        .toArray()
        .findIndex((button) => toSpan($(button).attr('data-value')) === span);
      const listbox = $group.data('listbox');
      if (index === -1 || !listbox) {
        return false;
      }
      listbox.select(index);
      $group.closest('.btngroup-container').siblings('input[type="hidden"]').first().trigger('change');
      return true;
    }

    const $input = $field.find(NUMBER_INPUT).first();
    if ($input.length) {
      $input.val(span).trigger('input').trigger('change');
      return true;
    }

    return false;
  }

  function nearest(values, target) {
    return values.reduce((best, value) =>
      Math.abs(value - target) < Math.abs(best - target) ? value : best
    );
  }

  // Grid
  // ---------------------------------------------------------------------------

  class Grid {
    constructor(matrix) {
      this.matrix = matrix;
      this.$container = matrix.$container.addClass('mhc-grid');
      this.$blocks = matrix.$entriesContainer;
      this.editable = !matrix.settings.static;
      this.guideReasons = new Set();
      this.frame = null;

      this.$container[0].style.setProperty('--mhc-grid-columns', GRID);
      this.$overlay = $('<div class="mhc-overlay" aria-hidden="true"></div>').appendTo(
        this.$container
      );

      // Craft creates the sorter with axis: 'y'. Garnish.DragSort supports free
      // (2D) sorting natively, which is what a wrapping grid needs.
      if (matrix.entrySort) {
        matrix.entrySort.settings.axis = null;
        matrix.entrySort.on('dragStart', () => this.toggleGuides('drag', true));
        matrix.entrySort.on('dragStop', () => {
          this.toggleGuides('drag', false);
          this.refresh();
        });
      }

      // Keep the fill indicators in sync with anything that moves the layout:
      // entries added/removed/reordered, collapsing, typing, window resizes…
      this.resizeObserver = new ResizeObserver(() => this.refresh());
      this.resizeObserver.observe(this.$blocks[0]);
      new MutationObserver(() => {
        this.initEntries();
        this.refresh();
      }).observe(this.$blocks[0], {childList: true});

      this.initEntries();
      this.refresh();
    }

    initEntries() {
      this.$blocks.children('.matrixblock').each((i, el) => this.initEntry($(el)));
    }

    initEntry($entry) {
      if ($entry.data('mhcInit')) {
        return;
      }
      $entry.data('mhcInit', true);
      this.resizeObserver.observe($entry[0]);

      const $field = this.widthField($entry);

      if (!$field.length) {
        this.setSpan($entry, null);
        return;
      }

      const read = () => {
        this.setSpan($entry, readValue($field));
        this.refresh();
      };
      read();
      // Button Group sets a hidden input without firing change, so also re-read after clicks
      $field.on('change input click keyup', () => Garnish.requestAnimationFrame(read));

      if (this.editable && allowedSpans($field).length) {
        this.addHandle($entry, $field);
      }
    }

    /**
     * This entry's own width field (not one from a nested entry).
     */
    widthField($entry) {
      if (!settings.widthField) {
        return $();
      }

      return $entry
        .find(`[data-attribute="${settings.widthField}"]`)
        .filter((i, el) => $(el).closest('.matrixblock')[0] === $entry[0])
        .first();
    }

    /**
     * Size an entry. Visual only — the width field is written separately.
     */
    setSpan($entry, value) {
      // No width = full width, like an unsized Bootstrap column
      const span = typeof value === 'number' ? value : toSpan(value) ?? GRID;

      $entry[0].style.setProperty('--mhc-span', span);
      $entry.attr('data-mhc-span', span);
      $entry
        .children('.mhc-resize')
        .attr('aria-valuenow', span)
        .attr('aria-valuetext', `${span} / ${GRID}`)
        .find('.mhc-resize-label')
        .text(`${span} / ${GRID}`);
    }

    getSpan($entry) {
      return parseInt($entry.attr('data-mhc-span'), 10) || GRID;
    }

    gap() {
      return parseFloat(getComputedStyle(this.$blocks[0]).columnGap) || 0;
    }

    /**
     * Width of one grid column plus its gap.
     */
    unitWidth() {
      return (this.$blocks[0].getBoundingClientRect().width + this.gap()) / GRID;
    }

    toggleGuides(reason, on) {
      this.guideReasons[on ? 'add' : 'delete'](reason);
      this.$container.toggleClass('mhc-guides', this.guideReasons.size > 0);
    }

    // Resizing
    // -------------------------------------------------------------------------

    addHandle($entry, $field) {
      const $handle = $('<div class="mhc-resize" tabindex="0" role="separator"></div>')
        .attr({
          'aria-orientation': 'vertical',
          'aria-label': t('Column width'),
          'aria-valuemin': 1,
          'aria-valuemax': GRID,
          title: t('Drag to resize'),
        })
        .append('<span class="mhc-resize-label"></span>')
        .appendTo($entry);

      this.setSpan($entry, this.getSpan($entry));

      $handle.on('pointerdown', (ev) => this.startResize(ev, $entry, $field));
      $handle.on('keydown', (ev) => this.onHandleKey(ev, $entry, $field));
      // Keep Garnish's selection/drag handlers out of it
      $handle.on('mousedown click', (ev) => ev.stopPropagation());
    }

    startResize(ev, $entry, $field) {
      if (ev.button !== 0) {
        return;
      }
      ev.preventDefault();
      ev.stopPropagation();

      const allowed = allowedSpans($field);
      if (!allowed.length) {
        return;
      }

      const handle = ev.currentTarget;
      const left = $entry[0].getBoundingClientRect().left;
      const unit = this.unitWidth();
      const gap = this.gap();
      const startSpan = this.getSpan($entry);
      let span = startSpan;

      handle.setPointerCapture(ev.pointerId);
      $entry.addClass('mhc-resizing');
      this.toggleGuides('resize', true);

      const onMove = (e) => {
        const target = Math.min(Math.max(Math.round((e.clientX - left + gap) / unit), 1), GRID);
        const next = nearest(allowed, target);
        if (next !== span) {
          span = next;
          this.setSpan($entry, span);
          this.refresh();
        }
      };

      const finish = (commit) => {
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onCancel);
        $entry.removeClass('mhc-resizing');
        this.toggleGuides('resize', false);

        if (commit && span !== startSpan) {
          this.commit($entry, $field, span);
        } else {
          this.setSpan($entry, startSpan);
          this.refresh();
        }
      };
      const onUp = () => finish(true);
      const onCancel = () => finish(false);

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onCancel);
    }

    onHandleKey(ev, $entry, $field) {
      const allowed = allowedSpans($field);
      if (!allowed.length) {
        return;
      }

      const current = this.getSpan($entry);
      let next = null;

      switch (ev.key) {
        case 'ArrowLeft':
          next = [...allowed].reverse().find((s) => s < current);
          break;
        case 'ArrowRight':
          next = allowed.find((s) => s > current);
          break;
        case 'Home':
          next = allowed[0];
          break;
        case 'End':
          next = allowed[allowed.length - 1];
          break;
        default:
          return;
      }

      ev.preventDefault();
      ev.stopPropagation();

      if (next !== undefined && next !== current) {
        this.commit($entry, $field, next);
      }
    }

    commit($entry, $field, span) {
      if (!writeValue($field, span)) {
        span = toSpan(readValue($field));
      }
      this.setSpan($entry, span);
      this.refresh();
    }

    // Row fill
    // -------------------------------------------------------------------------

    refresh() {
      if (this.frame) {
        return;
      }
      this.frame = requestAnimationFrame(() => {
        this.frame = null;
        this.renderFill();
      });
    }

    /**
     * Group the entries into the lines the browser actually wrapped them
     * into, and mark the free space at the end of partly-filled lines.
     */
    renderFill() {
      const containerRect = this.$container[0].getBoundingClientRect();
      const blocksRect = this.$blocks[0].getBoundingClientRect();
      const gap = this.gap();
      const lines = [];

      this.$blocks.children('.matrixblock').each((i, el) => {
        const rect = el.getBoundingClientRect();
        if (!rect.width) {
          return;
        }

        const line = lines[lines.length - 1];
        if (line && Math.abs(rect.top - line.top) < 2) {
          line.span += this.getSpan($(el));
          line.right = Math.max(line.right, rect.right);
          line.bottom = Math.max(line.bottom, rect.bottom);
        } else {
          lines.push({
            top: rect.top,
            bottom: rect.bottom,
            right: rect.right,
            span: this.getSpan($(el)),
          });
        }
      });

      const ghosts = lines
        .filter((line) => line.span < GRID)
        .map((line) => {
          const left = line.right + gap;
          const width = blocksRect.right - left;
          if (width < MIN_GHOST_WIDTH) {
            return null;
          }

          return $('<div class="mhc-fill"></div>')
            .css({
              left: left - containerRect.left,
              top: line.top - containerRect.top,
              width,
              height: line.bottom - line.top,
            })
            .attr('title', t('{free} of {grid} columns free on this line', {
              free: GRID - line.span,
              grid: GRID,
            }))
            .append($('<span class="mhc-fill-label"></span>').text(`${line.span} / ${GRID}`));
        })
        .filter(Boolean);

      this.$overlay.empty().append(ghosts);
    }
  }

  function setup(matrix) {
    if (matrix.$container.hasClass('mhc-grid') || !isColumnsInput(matrix)) {
      return;
    }

    new Grid(matrix);
  }

  /**
   * Is this Matrix input the column list of a row entry?
   *
   * Entry types are compared by ID, since a Matrix field can override their handles.
   */
  function isColumnsInput(matrix) {
    const $owner = matrix.$container.parent().closest('.matrixblock');

    return (
      $owner.attr('data-type-id') == settings.rowEntryTypeId &&
      (matrix.entryTypes || []).some((type) => type.id == settings.columnEntryTypeId)
    );
  }

  // Every Matrix input initialized from here on (page load, new rows, slideouts)
  Garnish.on(Craft.MatrixInput, 'afterInit', (ev) => setup(ev.target));

  // Any input that finished initializing before this script ran
  $(() => {
    $('.matrix-field').each((i, el) => {
      const matrix = $(el).data('matrix');
      if (matrix) {
        setup(matrix);
      }
    });
  });
})(jQuery);
