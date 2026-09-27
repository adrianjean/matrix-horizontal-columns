# Release Notes for Matrix Horizontal Columns

## 2.2.1 - 2026-09-27

### Changed
- Matrix Horizontal Columns now requires Craft 5.10.0 or later, which added the field picker used by the Column Width Field setting.

## 2.2.0 - 2026-09-27

### Added
- Columns can be resized by dragging a handle on their right edge, snapping to the grid and to the widths the width field allows. The handle can also be focused and adjusted with the arrow, Home and End keys.
- Grid guides show while a column is being resized or dragged.
- Lines that don't fill the whole row show their free space as a dashed outline labelled with how much of the row they use (e.g. `8 / 12`).

### Removed
- Radio Buttons fields can no longer be used as the width field. Use a Dropdown, Button Group or Number field instead (a Radio Buttons field can be converted to a Dropdown or Button Group without losing content).

## 2.1.0 - 2026-09-27

> [!WARNING]
> The row and column entry types no longer default to `cbRow` / `cbColumn`, and the width field no longer defaults to `cbSettingColumnWidthDesktop`. If you relied on those defaults, pick them in the plugin settings (or set them in `config/matrix-horizontal-columns.php`) after updating.

### Added
- The row entry type, column entry type and width field are now chosen with Craft's native pickers.
- Button Group fields can be used as the width field.
- Settings validation checks that the entry types exist, differ, and that the width field is a supported type in the column entry type's layout.

### Changed
- Settings are stored by UID in project config. Handles are still accepted in `config/matrix-horizontal-columns.php`.
- Entry types are matched by ID and the width field by its field-layout handle, so Matrix and field-layout handle overrides are respected.

## 2.0.0 - 2026-09-27

> [!IMPORTANT]
> Complete rewrite. Settings `rowBlockType` / `columnBlockType` are now `rowEntryType` / `columnEntryType` (the old names are still accepted).

### Added
- Columns are sized from a width field on the column entry type (e.g. 1–12) and resize live when it changes.
- Columns wrap onto new lines like a Bootstrap row, and stack when the row is narrower than 480px.
- Drag-and-drop sorting works in any direction across wrapped lines.
- `widthField` and `gridColumns` settings.

### Changed
- Uses Craft's own `Craft.MatrixInput` events and drag-sorter instead of overriding `Garnish.Drag` / `Garnish.DragSort` globally.
- Assets only load alongside Matrix inputs (including slideouts).
- Settings use Craft's native plugin settings page.
