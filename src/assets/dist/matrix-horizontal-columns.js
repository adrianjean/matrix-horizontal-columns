/**
 * Matrix Horizontal Columns
 *
 * Finds Matrix inputs that live inside a "row" entry and hold "column" entries,
 * lays their entries out on a CSS grid sized by each column's width field, and
 * frees Craft's own drag-sort to move in any direction.
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

  function setup(matrix) {
    if (matrix.$container.hasClass('mhc-grid') || !isColumnsInput(matrix)) {
      return;
    }

    matrix.$container.addClass('mhc-grid');
    matrix.$container[0].style.setProperty('--mhc-grid-columns', GRID);

    // Craft creates the sorter with axis: 'y'. Garnish.DragSort supports free
    // (2D) sorting natively, which is what a wrapping grid needs.
    if (matrix.entrySort) {
      matrix.entrySort.settings.axis = null;
    }

    matrix.$entriesContainer.children('.matrixblock').each((i, el) => {
      initColumn($(el));
    });

    matrix.on('entryAdded', (ev) => initColumn(ev.$entry));
  }

  function initColumn($entry) {
    if ($entry.data('mhcInit')) {
      return;
    }
    $entry.data('mhcInit', true);

    watchWidth($entry);
  }

  /**
   * Size the column from its width field, and keep it in sync as it changes.
   */
  function watchWidth($entry) {
    if (!settings.widthField) {
      applySpan($entry, null);
      return;
    }

    // Only this entry's own field, not one from a nested entry
    const $field = $entry
      .find(`[data-attribute="${settings.widthField}"]`)
      .filter((i, el) => $(el).closest('.matrixblock')[0] === $entry[0])
      .first();

    const read = () => applySpan($entry, readValue($field));

    read();
    // Button Group sets a hidden input without firing change, so also re-read after clicks
    $field.on('change input click keyup', () => Garnish.requestAnimationFrame(read));
  }

  /**
   * Current value of a Radio Buttons, Dropdown, Button Group or Number field.
   */
  function readValue($field) {
    const $radios = $field.find('input[type="radio"]');
    if ($radios.length) {
      return $radios.filter(':checked').val();
    }

    const $input = $field.find('select, input:not([type="hidden"])').first();
    if ($input.length) {
      return $input.val();
    }

    // Button Group
    return $field.find('input[type="hidden"][name]').last().val();
  }

  /**
   * Craft's option fields (Radio Buttons, Dropdown…) encode input values as
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

  function applySpan($entry, value) {
    const n = parseInt(decodeOptionValue(value), 10);
    // No width chosen = full width, like an unsized Bootstrap column
    const span = Number.isFinite(n) ? Math.min(Math.max(n, 1), GRID) : GRID;

    $entry[0].style.setProperty('--mhc-span', span);
    $entry.attr('data-mhc-span', span);
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
