<?php
namespace adrianjean\matrixhorizontalcolumns\models;

use craft\base\Model;
use craft\helpers\App;

/**
 * Matrix Horizontal Columns settings
 *
 * @author adrianjean
 * @since 1.0.0
 */
class Settings extends Model
{
    /**
     * @var bool Whether the plugin is enabled
     */
    public bool $enabled = true;

    /**
     * @var string Matrix block type that should be treated as a column
     */
    public string $columnBlockType = 'cbColumn';

    /**
     * @var string Matrix block type that should be treated as a row
     */
    public string $rowBlockType = 'cbRow';

    /**
     * @var int Minimum width for Matrix columns (pixels)
     */
    public int $minBlockWidth = 200;

    /**
     * @var int Maximum width for Matrix columns (pixels)
     */
    public int $maxBlockWidth = 800;

    /**
     * @var bool Whether to show scroll indicators
     */
    public bool $showScrollIndicators = true;

    /**
     * @inheritdoc
     */
    public function rules(): array
    {
        return [
            [['enabled', 'showScrollIndicators'], 'boolean'],
            [['minBlockWidth', 'maxBlockWidth'], 'integer', 'min' => 0],
            [['columnBlockType', 'rowBlockType'], 'string'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels(): array
    {
        return [
            'enabled' => \Craft::t('matrix-horizontal-columns', 'Enable Matrix Horizontal Columns'),
            'columnBlockType' => \Craft::t('matrix-horizontal-columns', 'Column Block Type'),
            'rowBlockType' => \Craft::t('matrix-horizontal-columns', 'Row Block Type'),
            'minBlockWidth' => \Craft::t('matrix-horizontal-columns', 'Minimum Column Width'),
            'maxBlockWidth' => \Craft::t('matrix-horizontal-columns', 'Maximum Column Width'),
            'showScrollIndicators' => \Craft::t('matrix-horizontal-columns', 'Show Scroll Indicators'),
        ];
    }
} 