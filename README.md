# Matrix Horizontal Columns Plugin for CraftCMS

This plugin enables horizontal column layout functionality for Matrix fields setup as "Content Builders" in Craft CMS.

## Features

- Horizontal drag-and-drop ordering for column blocks
- Vertical drag-and-drop ordering for row blocks
- Simple configuration through the control panel

## Requirements

- Craft CMS 5.0.0 or later
- PHP 8.2.0 or later
- **Important:** A "Content Builder" matrix feild setup with rows and columns (Note the handles are customizable in the plugin settings):

```
"Content Builder" Matrix Field
   └── "Row" Entry Type (Example Handle: cbRow)
      └── Column Matrix Field (Example Handle: cbColumn)
         └── Column Entry Type (Example Handle: cbColumn)
```
Blocks of type "cbColumn" will be draggable horizontally within their "cbRow" container.


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

## Configuration using matrix-horizontal-columns.php

You can also set configuration settings in a version controlled config file:

1. Create a config file in /config/matrix-horizontal-columns.php
2. Add the following default config:

```php
<?php
/**
 * Matrix Horizontal Columns config.php
 */

return [
    'enabled' => true,
    'rowBlockType' => 'cbRow',
    'columnBlockType' => 'cbColumn',
];
```

## Support

This software is provided "As-is". 

It's free, as in, if you have suggestions for improvement, I welcome the code! If you need support using or setting up the plugin, you are welcome to post a question on this repo, but it may be a while before I can answer you.

If you find a bug, please report it, and if you have a solution, please share that as well! Contributors welcome!

I use this plugin myself, so I will keep it updated for as long as I use it, and likely only for the most recent version of CraftCMS.

Issues: PLease create an [issue](https://github.com/adrianjean/matrix-horizontal-columns/issues).

## License

This plugin is licensed under the MIT License. 