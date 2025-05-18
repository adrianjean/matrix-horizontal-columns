<?php
namespace adrianjean\matrixhorizontalcolumns;

use Craft;
use craft\base\Plugin;
use craft\events\RegisterComponentTypesEvent;
use craft\events\RegisterUrlRulesEvent;
use craft\services\Fields;
use craft\web\View;
use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;
use craft\fields\Matrix;
use adrianjean\matrixhorizontalcolumns\models\Settings;
use craft\web\UrlManager;
use craft\helpers\UrlHelper;
use yii\base\Event;

/**
 * Matrix Horizontal Columns plugin for Craft CMS
 *
 * @property-read Settings $settings
 * @property-read null|string $settingsHtml
 * @method Settings getSettings()
 *
 * @author adrianjean
 * @copyright 2024 adrianjean
 * @license MIT
 */
class MatrixHorizontalColumns extends Plugin
{
    public const TRANSLATION_CATEGORY = 'matrix-horizontal-columns';
    
    public bool $hasCpSettings = true;

    public function init(): void
    {
        parent::init();

        // Set the alias for the plugin's root directory
        Craft::setAlias('@matrix-horizontal-columns', $this->getBasePath());

        // Register CP URL rules
        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_CP_URL_RULES,
            function(RegisterUrlRulesEvent $event): void {
                $event->rules['settings/matrix-horizontal-columns'] = 'matrix-horizontal-columns/settings/index';
            }
        );

        // Only register assets for CP requests if plugin is enabled
        if (Craft::$app->getRequest()->getIsCpRequest() && $this->getSettings()->enabled) {
            Event::on(
                View::class,
                View::EVENT_BEFORE_RENDER_TEMPLATE,
                function(): void {
                    try {
                        $view = Craft::$app->getView();
                        if ($view->getTemplateMode() === View::TEMPLATE_MODE_CP) {
                            $view->registerAssetBundle(MatrixHorizontalColumnsAsset::class);

                            // Generate selectors from block types and custom selectors
                            $settings = $this->getSettings();
                            $columnSelectors = array_map(
                                fn($type) => "[data-attribute=\"$type\"]",
                                $settings->columnBlockTypes
                            );
                            $rowSelectors = array_map(
                                fn($type) => "[data-attribute=\"$type\"]",
                                $settings->rowBlockTypes
                            );

                            // Pass settings to JavaScript
                            $view->registerJs(
                                'window.matrixHorizontalColumnsSettings = ' . json_encode([
                                    'enabled' => $settings->enabled,
                                    'columnSelectors' => array_merge($columnSelectors, $settings->customSelectors),
                                    'rowSelectors' => $rowSelectors,
                                    'scrollSpeed' => $settings->scrollSpeed,
                                    'scrollThreshold' => $settings->scrollThreshold,
                                    'minBlockWidth' => $settings->minBlockWidth,
                                    'maxBlockWidth' => $settings->maxBlockWidth,
                                    'dragOpacity' => $settings->dragOpacity,
                                    'dragScale' => $settings->dragScale,
                                    'magnetStrength' => $settings->magnetStrength,
                                    'showScrollIndicators' => $settings->showScrollIndicators,
                                ], JSON_THROW_ON_ERROR) . ';',
                                View::POS_BEGIN
                            );

                            Craft::info(
                                'MatrixHorizontalColumnsAsset registered successfully',
                                __METHOD__
                            );
                        }
                    } catch (\Throwable $e) {
                        Craft::error(
                            'Failed to register MatrixHorizontalColumnsAsset: ' . $e->getMessage(),
                            __METHOD__
                        );
                    }
                }
            );
        }
    }

    protected function createSettingsModel(): ?Settings
    {
        return Craft::createObject(Settings::class);
    }

    protected function settingsHtml(): ?string
    {
        return Craft::$app->getView()->renderTemplate(
            'matrix-horizontal-columns/settings',
            [
                'plugin' => $this,
                'settings' => $this->getSettings(),
            ]
        );
    }
}

/**
 * Asset bundle for the Matrix Horizontal Columns plugin
 */
class MatrixHorizontalColumnsAsset extends AssetBundle
{
    public function init(): void
    {
        // Set the source path
        $this->sourcePath = '@matrix-horizontal-columns/assets';

        // Define the dependencies
        $this->depends = [
            CpAsset::class,
        ];

        // Register the assets with specific versioning
        $this->js = [
            'matrix-horizontal.js',
        ];
        $this->css = [
            'matrix-horizontal.css',
        ];

        parent::init();

        // Add version strings to prevent caching
        if ($this->sourcePath !== null) {
            foreach ($this->js as &$js) {
                $js = $js . '?v=' . filemtime($this->sourcePath . DIRECTORY_SEPARATOR . $js);
            }
            foreach ($this->css as &$css) {
                $css = $css . '?v=' . filemtime($this->sourcePath . DIRECTORY_SEPARATOR . $css);
            }
        }

        Craft::info(
            'MatrixHorizontalColumnsAsset initialized with source path: ' . $this->sourcePath,
            __METHOD__
        );
    }
} 