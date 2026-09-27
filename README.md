# Matrix Horizontal Columns for Craft CMS

Turns a nested **row → columns** Matrix setup into a real grid in the control panel. Column entries sit side-by-side at the width they'll have on the front end, wrap like a Bootstrap row, and can be dragged into place in any direction.

## Requirements

- Craft CMS 5.0.0 or later
- PHP 8.2 or later

## How it works

The plugin looks for this structure:

```
Matrix field (e.g. "Content Builder")
└── Row entry type (e.g. cbRow)
    └── Matrix field
        └── Column entry type (e.g. cbColumn)
            └── Width field (e.g. Radio Buttons with values 1–12)
```

Inside every row, column entries:

- are laid out left-to-right and wrap onto new lines when their widths add up to more than a full row;
- take `width / gridColumns` of the row (full width when no width is set), updating as soon as the width field changes;
- stack full width when the row is narrower than 480px;
- can be drag-sorted in any direction.

Nothing changes on the front end or in how content is saved. The plugin only affects the control panel.

## Installation

From the Plugin Store, or with Composer:

```bash
composer require adrianjean/matrix-horizontal-columns
php craft plugin/install matrix-horizontal-columns
```

## Configuration

Go to **Settings → Plugins → Matrix Horizontal Columns** and pick:

- **Row Entry Type** – the entry type that contains the columns
- **Column Entry Type** – the entry type laid out side-by-side within a row
- **Column Width Field** – a Radio Buttons, Dropdown, Button Group or Number field in the column entry type's layout, holding its width in grid columns. Leave empty to make every column full width.
- **Grid Columns** – how many columns make up a full row (default 12)

Entry types are matched by ID and the width field by its handle in the column's field layout, so handle overrides on Matrix fields and field layouts are respected. Settings are stored by UID in project config.

The plugin does nothing until the row and column entry types are set.

### Config file

Settings can also be set in `config/matrix-horizontal-columns.php`, which overrides and locks them in the control panel. Entry types and the width field can be given as UIDs or handles:

```php
<?php

return [
    'enabled' => true,
    'rowEntryType' => 'cbRow',
    'columnEntryType' => 'cbColumn',
    'widthField' => 'cbSettingColumnWidthDesktop',
    'gridColumns' => 12,
];
```

## Styling

The grid gap is a CSS custom property you can override in your own control panel CSS:

```css
.mhc-grid { --mhc-gap: 16px; }
```

Each column also gets a `data-mhc-span` attribute with its current width.

## Support

Free and MIT licensed. Bug reports and pull requests are welcome in [GitHub issues](https://github.com/adrianjean/matrix-horizontal-columns/issues).
