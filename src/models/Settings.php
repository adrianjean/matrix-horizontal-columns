<?php

namespace adrianjean\matrixhorizontalcolumns\models;

use Craft;
use craft\base\FieldInterface;
use craft\base\Model;
use craft\fields\ButtonGroup;
use craft\fields\Dropdown;
use craft\fields\Number;
use craft\helpers\StringHelper;
use craft\models\EntryType;

/**
 * Matrix Horizontal Columns settings
 *
 * Entry types and the width field are stored by UID. In
 * config/matrix-horizontal-columns.php they may also be given as handles.
 */
class Settings extends Model
{
    /**
     * Field types that can hold a column width.
     */
    public const WIDTH_FIELD_TYPES = [
        Dropdown::class,
        ButtonGroup::class,
        Number::class,
    ];

    /**
     * @var bool Whether the column grid is applied in the control panel
     */
    public bool $enabled = true;

    /**
     * @var string|null UID (or handle) of the entry type that acts as a row
     */
    public ?string $rowEntryType = null;

    /**
     * @var string|null UID (or handle) of the entry type that acts as a column (nested inside a row)
     */
    public ?string $columnEntryType = null;

    /**
     * @var string|null UID (or handle) of the column field holding its width. Empty = all columns full width.
     */
    public ?string $widthField = null;

    /**
     * @var int Number of columns in the grid
     */
    public int $gridColumns = 12;

    /**
     * Accepts the 1.x setting names (rowBlockType / columnBlockType), and the
     * IDs posted by the settings page's pickers.
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

            foreach (['rowEntryType', 'columnEntryType', 'widthField'] as $attribute) {
                if (array_key_exists($attribute, $values)) {
                    $values[$attribute] = $this->normalizeReference($attribute, $values[$attribute]);
                }
            }
        }

        parent::setAttributes($values, $safeOnly);
    }

    public function getRowEntryType(): ?EntryType
    {
        return $this->resolveEntryType($this->rowEntryType);
    }

    public function getColumnEntryType(): ?EntryType
    {
        return $this->resolveEntryType($this->columnEntryType);
    }

    public function getWidthField(): ?FieldInterface
    {
        if (!$this->widthField) {
            return null;
        }

        $fields = Craft::$app->getFields();

        return StringHelper::isUUID($this->widthField)
            ? $fields->getFieldByUid($this->widthField)
            : $fields->getFieldByHandle($this->widthField);
    }

    /**
     * The width field's handle as used in the column entry type's layout,
     * which may override the field's own handle.
     */
    public function getWidthFieldLayoutHandle(): ?string
    {
        $field = $this->getWidthField();
        $layout = $this->getColumnEntryType()?->getFieldLayout();

        if (!$field || !$layout) {
            return null;
        }

        foreach ($layout->getCustomFields() as $layoutField) {
            if ($layoutField->uid === $field->uid) {
                return $layoutField->handle;
            }
        }

        return null;
    }

    /**
     * @return FieldInterface[] Fields that can be picked as the width field
     */
    public static function widthFieldOptions(): array
    {
        return array_values(array_filter(
            Craft::$app->getFields()->getAllFields(),
            fn(FieldInterface $field) => self::isWidthFieldType($field),
        ));
    }

    public function attributeLabels(): array
    {
        return [
            'enabled' => Craft::t('matrix-horizontal-columns', 'Enabled'),
            'rowEntryType' => Craft::t('matrix-horizontal-columns', 'Row Entry Type'),
            'columnEntryType' => Craft::t('matrix-horizontal-columns', 'Column Entry Type'),
            'widthField' => Craft::t('matrix-horizontal-columns', 'Column Width Field'),
            'gridColumns' => Craft::t('matrix-horizontal-columns', 'Grid Columns'),
        ];
    }

    protected function defineRules(): array
    {
        return [
            [['rowEntryType', 'columnEntryType', 'gridColumns'], 'required'],
            [['rowEntryType', 'columnEntryType'], 'validateEntryType'],
            ['widthField', 'validateWidthField'],
            ['gridColumns', 'integer', 'min' => 1, 'max' => 24],
            ['enabled', 'boolean'],
        ];
    }

    public function validateEntryType(string $attribute): void
    {
        $entryType = $this->resolveEntryType($this->$attribute);

        if (!$entryType) {
            $this->addError($attribute, Craft::t('matrix-horizontal-columns', '{attribute} doesn’t exist.', [
                'attribute' => $this->getAttributeLabel($attribute),
            ]));
        } elseif ($attribute === 'columnEntryType' && $entryType->id === $this->getRowEntryType()?->id) {
            $this->addError($attribute, Craft::t('matrix-horizontal-columns', 'The row and column entry types must be different.'));
        }
    }

    public function validateWidthField(string $attribute): void
    {
        $field = $this->getWidthField();

        if (!$field) {
            $this->addError($attribute, Craft::t('matrix-horizontal-columns', '{attribute} doesn’t exist.', [
                'attribute' => $this->getAttributeLabel($attribute),
            ]));
            return;
        }

        if (!self::isWidthFieldType($field)) {
            $this->addError($attribute, Craft::t('matrix-horizontal-columns', 'The width field must be a Dropdown, Button Group or Number field.'));
            return;
        }

        $columnType = $this->getColumnEntryType();
        if ($columnType && !$this->getWidthFieldLayoutHandle()) {
            $this->addError($attribute, Craft::t('matrix-horizontal-columns', '“{field}” isn’t in the “{entryType}” entry type’s field layout.', [
                'field' => $field->name,
                'entryType' => $columnType->name,
            ]));
        }
    }

    public static function isWidthFieldType(FieldInterface $field): bool
    {
        foreach (self::WIDTH_FIELD_TYPES as $class) {
            if ($field instanceof $class) {
                return true;
            }
        }

        return false;
    }

    private function resolveEntryType(?string $reference): ?EntryType
    {
        if (!$reference) {
            return null;
        }

        $entries = Craft::$app->getEntries();

        return StringHelper::isUUID($reference)
            ? $entries->getEntryTypeByUid($reference)
            : $entries->getEntryTypeByHandle($reference);
    }

    /**
     * Pickers post an ID (or an empty string); store the UID so the setting
     * survives across environments in project config.
     */
    private function normalizeReference(string $attribute, mixed $value): ?string
    {
        if (is_array($value)) {
            $value = reset($value) ?: null;
        }

        if ($value === null || $value === '') {
            return null;
        }

        if (is_int($value) || ctype_digit((string)$value)) {
            $component = $attribute === 'widthField'
                ? Craft::$app->getFields()->getFieldById((int)$value)
                : Craft::$app->getEntries()->getEntryTypeById((int)$value);

            return $component?->uid;
        }

        return (string)$value;
    }
}
