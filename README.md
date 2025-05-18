# Matrix Horizontal Columns Plugin for CraftCMS

This plugin enables horizontal column layout functionality for Matrix fields in Craft CMS, making it easier to organize and manage content in a column-based structure. It allows you to designate specific block types as columns that can be dragged horizontally, and others as rows that maintain vertical ordering.

## Features

- Horizontal drag-and-drop ordering for column blocks
- Vertical drag-and-drop ordering for row blocks
- Customizable minimum and maximum column widths
- Visual scroll indicators for better navigation
- Simple configuration through the control panel

## Requirements

- Craft CMS 5.0.0 or later
- PHP 8.2.0 or later

## Installation

You can install this plugin from the Craft Plugin Store or with Composer:

```bash
composer require adrianjean/matrix-horizontal-columns
```

Then, go to Settings → Plugins and click the "Install" button for Matrix Horizontal Columns.

## Configuration

Configure the plugin through the Craft CP under Settings → Matrix Horizontal Columns. The settings are straightforward:

### Basic Settings
- **Enable/Disable**: Toggle the plugin functionality on/off
- **Show Scroll Indicators**: Enable visual indicators when columns can be scrolled left/right

### Block Type Settings
- **Column Block Type**: Enter the handle of the Matrix block type that should behave as a horizontal column
- **Row Block Type**: Enter the handle of the Matrix block type that should maintain vertical ordering

### Column Width Settings
- **Minimum Block Width**: Set the minimum width (in pixels) for column blocks
- **Maximum Block Width**: Set the maximum width (in pixels) for column blocks

### Example Configuration

1. Create your Matrix field with at least two block types:
   ```
   Matrix Field: "pageLayout"
   ├── Block Type: "column" (handle: column)
   └── Block Type: "section" (handle: section)
   ```

2. In the plugin settings:
   - Set "Column Block Type" to `column`
   - Set "Row Block Type" to `section`
   - Set desired min/max widths (e.g., 250px and 500px)
   - Enable scroll indicators if desired

Now blocks of type "column" will be draggable horizontally within their container, while "section" blocks will maintain vertical ordering.

## Configuration using matrix-horizontal-columns.php

1. Create a config file in /config/matrix-horizontal-columns.php
2. Add the following default config:

```php
<?php
/**
 * Matrix Horizontal Columns config.php
 */

return [
    'enabled' => true,
    'columnBlockType' => 'cbColumn',
    'rowBlockType' => 'cbRow',
    'minBlockWidth' => 250,
    'maxBlockWidth' => 500,
    'showScrollIndicators' => true,
];
```

## Usage

1. Add a Matrix field to your entry type
2. Create blocks of your designated column and row types
3. Drag column blocks horizontally to arrange them in rows
4. Drag row blocks vertically to arrange them in the desired order
5. The scroll indicators will show when there are more columns than can fit in the viewport

## Support

If you encounter any issues or have questions, please create an issue on the [GitHub repository](https://github.com/adrianjean/matrix-horizontal-columns/issues).

## License

This plugin is licensed under the MIT License. 