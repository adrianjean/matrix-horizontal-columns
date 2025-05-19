# Matrix Horizontal Columns Plugin for CraftCMS

This plugin enables horizontal column layout functionality for Matrix fields in Craft CMS, making it easier to organize and manage content in a column-based structure. It allows you to designate specific block types as columns that can be dragged horizontally, and others as rows that maintain vertical ordering.

## Features

- Horizontal drag-and-drop ordering for column blocks
- Vertical drag-and-drop ordering for row blocks
- Simple configuration through the control panel
- Automatic horizontal scrolling during drag operations

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

Configure the plugin through the Craft CP under Settings → Matrix Horizontal Columns.

### Basic Settings
- **Enable/Disable**: Toggle the plugin functionality on/off

### Block Type Settings
- **Row Entry Type Handle**: Enter the handle of the Matrix block type that should behave as a row container (Default: `cbRow`)
- **Column Entry Type Handle**: Enter the handle of the Matrix block type that should behave as a horizontal column (Default: `cbColumn`)

### Example Matrix Field Structure

1. Create your Matrix field with at least two block types:
   ```
   Matrix Field: "pageLayout"
   ├── Block Type: "cbRow" (handle: cbRow)
   └── Block Type: "cbColumn" (handle: cbColumn)
   ```

2. In the plugin settings:
   - Set "Row Entry Type Handle" to `cbRow`
   - Set "Column Entry Type Handle" to `cbColumn`

Now blocks of type "cbColumn" will be draggable horizontally within their "cbRow" container.

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
];
```

## Usage

1. Add a Matrix field to your entry type
2. Create blocks of your designated column and row types
3. Drag column blocks horizontally to arrange them in rows
4. Drag row blocks vertically to arrange them in the desired order

## Support

If you encounter any issues or have questions, please create an issue on the [GitHub repository](https://github.com/adrianjean/matrix-horizontal-columns/issues).

## License

This plugin is licensed under the MIT License. 