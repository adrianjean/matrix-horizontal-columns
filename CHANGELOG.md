# Release Notes for Matrix Horizontal Columns

## 2.0.0 - Unreleased

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

## 1.0.15 - 2025-05-19
- Last 1.x release.
