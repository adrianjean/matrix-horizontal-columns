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
     * @inheritdoc
     */
    public function rules(): array
    {
        return [
            ['enabled', 'boolean'],
            [['columnBlockType', 'rowBlockType'], 'string', 'min' => 1],
            [['columnBlockType', 'rowBlockType'], 'required'],
            ['columnBlockType', 'compare', 'compareAttribute' => 'rowBlockType', 'operator' => '!=', 
             'message' => 'Column and Row block types must be different'],
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
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeHints(): array
    {
        return [
            'columnBlockType' => \Craft::t('matrix-horizontal-columns', 'The Matrix block type handle that should be treated as a horizontal column'),
            'rowBlockType' => \Craft::t('matrix-horizontal-columns', 'The Matrix block type handle that should be treated as a vertical row'),
        ];
    }
} 