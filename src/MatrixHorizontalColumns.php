<?php

namespace adrianjean\matrixhorizontalcolumns;

use adrianjean\matrixhorizontalcolumns\assets\MatrixHorizontalColumnsAsset;
use adrianjean\matrixhorizontalcolumns\models\Settings;
use Craft;
use craft\base\Field;
use craft\base\Model;
use craft\base\Plugin;
use craft\events\DefineFieldHtmlEvent;
use craft\fields\Matrix;
use yii\base\Event;

/**
 * Matrix Horizontal Columns
 *
 * Lays out the column entries of a nested "row → columns" Matrix structure
 * side-by-side in the control panel, sized by each column's width field, and
 * lets them be drag-sorted in any direction.
 *
 * @method static MatrixHorizontalColumns getInstance()
 * @method Settings getSettings()
 * @author Adrian Jean
 * @license MIT
 */
class MatrixHorizontalColumns extends Plugin
{
    public string $schemaVersion = '1.0.0';
    public bool $hasCpSettings = true;

    public function init(): void
    {
        parent::init();

        if (!Craft::$app->getRequest()->getIsCpRequest() || !$this->getSettings()->enabled) {
            return;
        }

        // Only load our assets alongside a Matrix input, which also guarantees
        // Craft's MatrixInput JS is loaded first (including in slideouts).
        Event::on(
            Matrix::class,
            Field::EVENT_DEFINE_INPUT_HTML,
            function(DefineFieldHtmlEvent $event) {
                $this->registerAssets();
            }
        );
    }

    protected function createSettingsModel(): ?Model
    {
        return new Settings();
    }

    protected function settingsHtml(): ?string
    {
        return Craft::$app->getView()->renderTemplate('matrix-horizontal-columns/_settings', [
            'settings' => $this->getSettings(),
            'overrides' => Craft::$app->getConfig()->getConfigFromFile($this->handle),
        ]);
    }

    private function registerAssets(): void
    {
        $settings = $this->getSettings();
        $view = Craft::$app->getView();

        $view->registerAssetBundle(MatrixHorizontalColumnsAsset::class);
        $view->registerJsVar('MatrixHorizontalColumnsSettings', [
            'rowEntryType' => $settings->rowEntryType,
            'columnEntryType' => $settings->columnEntryType,
            'widthField' => $settings->widthField,
            'gridColumns' => $settings->gridColumns,
        ]);
    }
}
