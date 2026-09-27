<?php

namespace adrianjean\matrixhorizontalcolumns\assets;

use craft\web\AssetBundle;
use craft\web\assets\matrix\MatrixAsset;

/**
 * Control panel JS/CSS for the column grid.
 */
class MatrixHorizontalColumnsAsset extends AssetBundle
{
    public function init(): void
    {
        $this->sourcePath = __DIR__ . '/dist';
        $this->depends = [
            MatrixAsset::class,
        ];
        $this->js = [
            'matrix-horizontal-columns.js',
        ];
        $this->css = [
            'matrix-horizontal-columns.css',
        ];

        parent::init();
    }
}
