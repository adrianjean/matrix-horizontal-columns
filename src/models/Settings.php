<?php

namespace adrianjean\matrixhorizontalcolumns\models;

use Craft;
use craft\base\Model;
use craft\validators\HandleValidator;

/**
 * Matrix Horizontal Columns settings
 *
 * Can be overridden with config/matrix-horizontal-columns.php.
 */
class Settings extends Model
{
    /**
     * @var bool Whether the column grid is applied in the control panel
     */
    public bool $enabled = true;

    /**
     * @var string Handle of the entry type that acts as a row
     */
    public string $rowEntryType = 'cbRow';

    /**
     * @var string Handle of the entry type that acts as a column (nested inside a row)
     */
    public string $columnEntryType = 'cbColumn';

    /**
     * @var string Handle of the column field holding its width (1 – gridColumns). Empty = all columns full width.
     */
    public string $widthField = 'cbSettingColumnWidthDesktop';

    /**
     * @var int Number of columns in the grid
     */
    public int $gridColumns = 12;

    /**
     * Accepts the 1.x setting names (rowBlockType / columnBlockType).
     */
    public function setAttributes($values, $safeOnly = true): void
    {
        if (is_array($values)) {
            foreach (['rowBlockType' => 'rowEntryType', 'columnBlockType' => 'columnEntryType'] as $old => $new) {
                if (isset($values[$old])) {
                    $values[$new] ??= $values[$old];
                    unset($values[$old]);
                }
            }
        }

        parent::setAttributes($values, $safeOnly);
    }

    public function attributeLabels(): array
    {
        return [
            'enabled' => Craft::t('matrix-horizontal-columns', 'Enabled'),
            'rowEntryType' => Craft::t('matrix-horizontal-columns', 'Row Entry Type Handle'),
            'columnEntryType' => Craft::t('matrix-horizontal-columns', 'Column Entry Type Handle'),
            'widthField' => Craft::t('matrix-horizontal-columns', 'Column Width Field Handle'),
            'gridColumns' => Craft::t('matrix-horizontal-columns', 'Grid Columns'),
        ];
    }

    protected function defineRules(): array
    {
        return [
            [['rowEntryType', 'columnEntryType', 'gridColumns'], 'required'],
            [['rowEntryType', 'columnEntryType', 'widthField'], 'trim'],
            [['rowEntryType', 'columnEntryType', 'widthField'], HandleValidator::class],
            ['columnEntryType', 'compare', 'compareAttribute' => 'rowEntryType', 'operator' => '!=',
                'message' => Craft::t('matrix-horizontal-columns', 'The row and column entry types must be different.')],
            ['gridColumns', 'integer', 'min' => 1, 'max' => 24],
            ['enabled', 'boolean'],
        ];
    }
}
