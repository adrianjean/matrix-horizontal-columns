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
     * @var array<string> CSS selectors where horizontal columns should be enabled
     */
    public array $enabledSelectors = [];

    /**
     * @var int Scroll speed during drag operations (pixels per tick)
     */
    public int $scrollSpeed = 10;

    /**
     * @var int Distance from edge to trigger auto-scroll (pixels)
     */
    public int $scrollThreshold = 50;

    /**
     * @var int Minimum width for Matrix columns (pixels)
     */
    public int $minBlockWidth = 200;

    /**
     * @var int Maximum width for Matrix columns (pixels)
     */
    public int $maxBlockWidth = 800;

    /**
     * @var float Opacity of dragged columns
     */
    public float $dragOpacity = 0.8;

    /**
     * @var float Scale factor for dragged columns
     */
    public float $dragScale = 0.95;

    /**
     * @var int Magnetic strength for snapping
     */
    public int $magnetStrength = 20;

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
            [['scrollSpeed', 'scrollThreshold', 'minBlockWidth', 'maxBlockWidth', 'magnetStrength'], 'integer', 'min' => 0],
            [['dragOpacity'], 'number', 'min' => 0, 'max' => 1],
            [['dragScale'], 'number', 'min' => 0.5, 'max' => 2],
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
            'enabledSelectors' => \Craft::t('matrix-horizontal-columns', 'Enabled Selectors'),
            'scrollSpeed' => \Craft::t('matrix-horizontal-columns', 'Scroll Speed'),
            'scrollThreshold' => \Craft::t('matrix-horizontal-columns', 'Scroll Threshold'),
            'minBlockWidth' => \Craft::t('matrix-horizontal-columns', 'Minimum Column Width'),
            'maxBlockWidth' => \Craft::t('matrix-horizontal-columns', 'Maximum Column Width'),
            'dragOpacity' => \Craft::t('matrix-horizontal-columns', 'Drag Opacity'),
            'dragScale' => \Craft::t('matrix-horizontal-columns', 'Drag Scale'),
            'magnetStrength' => \Craft::t('matrix-horizontal-columns', 'Magnet Strength'),
            'showScrollIndicators' => \Craft::t('matrix-horizontal-columns', 'Show Scroll Indicators'),
        ];
    }
} 