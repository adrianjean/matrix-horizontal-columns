<?php
namespace modules\matrixhorizontaldrag\controllers;

use Craft;
use craft\web\Controller;
use yii\web\Response;
use modules\matrixhorizontaldrag\MatrixHorizontalDrag;

class SettingsController extends Controller
{
    /**
     * @inheritdoc
     */
    public function init(): void
    {
        parent::init();
        $this->requireAdmin();
    }

    /**
     * Renders the settings page
     */
    public function actionIndex(): Response
    {
        $settings = MatrixHorizontalDrag::$instance->getSettings();

        return $this->renderTemplate('matrix-horizontal-drag/settings', [
            'settings' => $settings,
            'title' => Craft::t('matrix-horizontal-drag', 'Matrix Horizontal Drag Settings')
        ]);
    }

    /**
     * Saves the settings
     */
    public function actionSave(): Response
    {
        $this->requirePostRequest();
        $this->requireAdmin();

        $settings = MatrixHorizontalDrag::$instance->getSettings();
        $request = Craft::$app->getRequest();

        // Load the posted settings onto the model
        $settings->enabled = (bool)$request->getBodyParam('enabled', $settings->enabled);
        $settings->enabledSelectors = $request->getBodyParam('enabledSelectors', $settings->enabledSelectors);
        $settings->scrollSpeed = (int)$request->getBodyParam('scrollSpeed', $settings->scrollSpeed);
        $settings->scrollThreshold = (int)$request->getBodyParam('scrollThreshold', $settings->scrollThreshold);
        $settings->minBlockWidth = (int)$request->getBodyParam('minBlockWidth', $settings->minBlockWidth);
        $settings->maxBlockWidth = (int)$request->getBodyParam('maxBlockWidth', $settings->maxBlockWidth);
        $settings->dragOpacity = (float)$request->getBodyParam('dragOpacity', $settings->dragOpacity);
        $settings->dragScale = (float)$request->getBodyParam('dragScale', $settings->dragScale);
        $settings->magnetStrength = (int)$request->getBodyParam('magnetStrength', $settings->magnetStrength);
        $settings->showScrollIndicators = (bool)$request->getBodyParam('showScrollIndicators', $settings->showScrollIndicators);

        // Validate
        if (!$settings->validate()) {
            Craft::$app->getSession()->setError(Craft::t('matrix-horizontal-drag', 'Could not save settings.'));
            return $this->renderTemplate('matrix-horizontal-drag/settings', [
                'settings' => $settings,
                'title' => Craft::t('matrix-horizontal-drag', 'Matrix Horizontal Drag Settings')
            ]);
        }

        // Save to config file
        $configService = Craft::$app->getConfig();
        $configPath = $configService->getConfigFilePath('matrix-horizontal-drag');
        
        $config = [
            'enabled' => $settings->enabled,
            'enabledSelectors' => $settings->enabledSelectors,
            'scrollSpeed' => $settings->scrollSpeed,
            'scrollThreshold' => $settings->scrollThreshold,
            'minBlockWidth' => $settings->minBlockWidth,
            'maxBlockWidth' => $settings->maxBlockWidth,
            'dragOpacity' => $settings->dragOpacity,
            'dragScale' => $settings->dragScale,
            'magnetStrength' => $settings->magnetStrength,
            'showScrollIndicators' => $settings->showScrollIndicators,
        ];

        // Create config directory if it doesn't exist
        $configDir = dirname($configPath);
        if (!is_dir($configDir)) {
            mkdir($configDir, 0777, true);
        }

        // Write the config file
        file_put_contents($configPath, "<?php\nreturn " . var_export($config, true) . ";\n");

        Craft::$app->getSession()->setNotice(Craft::t('matrix-horizontal-drag', 'Settings saved.'));
        return $this->redirectToPostedUrl();
    }
} 