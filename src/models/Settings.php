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
     * @var array<string> Matrix block types that should be treated as columns
     */
    public array $columnBlockTypes = ['cbColumn'];

    /**
     * @var array<string> Matrix block types that should be treated as rows
     */
    public array $rowBlockTypes = ['cbRow'];

    /**
     * @var array<string> Additional CSS selectors where horizontal columns should be enabled
     */
    public array $customSelectors = [];

    /**
     * @var array<string> CSS selectors where horizontal columns should be enabled
     */
    public array $enabledSelectors = [];

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
            ['columnBlockTypes', 'each', 'rule' => ['string']],
            ['rowBlockTypes', 'each', 'rule' => ['string']],
            ['customSelectors', 'each', 'rule' => ['string']],
            ['enabledSelectors', 'each', 'rule' => ['string']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels(): array
    {
        return [
            'enabled' => \Craft::t('matrix-horizontal-columns', 'Enable Matrix Horizontal Columns'),
            'columnBlockTypes' => \Craft::t('matrix-horizontal-columns', 'Column Block Types'),
            'rowBlockTypes' => \Craft::t('matrix-horizontal-columns', 'Row Block Types'),
            'customSelectors' => \Craft::t('matrix-horizontal-columns', 'Additional CSS Selectors'),
            'enabledSelectors' => \Craft::t('matrix-horizontal-columns', 'Enabled Selectors'),
            'minBlockWidth' => \Craft::t('matrix-horizontal-columns', 'Minimum Column Width'),
            'maxBlockWidth' => \Craft::t('matrix-horizontal-columns', 'Maximum Column Width'),
            'showScrollIndicators' => \Craft::t('matrix-horizontal-columns', 'Show Scroll Indicators'),
        ];
    }
} 