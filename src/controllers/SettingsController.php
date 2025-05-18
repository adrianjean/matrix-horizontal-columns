<?php
namespace adrianjean\matrixhorizontalcolumns\controllers;

use Craft;
use craft\web\Controller;
use yii\web\Response;
use adrianjean\matrixhorizontalcolumns\MatrixHorizontalColumns;

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
        $settings = MatrixHorizontalColumns::getInstance()->getSettings();

        return $this->renderTemplate('matrix-horizontal-columns/settings', [
            'settings' => $settings,
            'title' => Craft::t('matrix-horizontal-columns', 'Matrix Horizontal Columns Settings')
        ]);
    }

    /**
     * Saves the settings
     */
    public function actionSave(): Response
    {
        $this->requirePostRequest();
        $this->requireAdmin();

        $settings = MatrixHorizontalColumns::getInstance()->getSettings();
        $request = Craft::$app->getRequest();

        // Load the posted settings onto the model
        $settings->enabled = (bool)$request->getBodyParam('enabled', $settings->enabled);
        $settings->columnBlockType = trim($request->getBodyParam('columnBlockType', $settings->columnBlockType));
        $settings->rowBlockType = trim($request->getBodyParam('rowBlockType', $settings->rowBlockType));
        
        // Handle comma-separated values for custom selectors
        $customSelectors = $request->getBodyParam('customSelectors', '');
        $settings->customSelectors = array_filter(array_map('trim', explode(',', $customSelectors)));
        
        $settings->minBlockWidth = (int)$request->getBodyParam('minBlockWidth', $settings->minBlockWidth);
        $settings->maxBlockWidth = (int)$request->getBodyParam('maxBlockWidth', $settings->maxBlockWidth);
        $settings->showScrollIndicators = (bool)$request->getBodyParam('showScrollIndicators', $settings->showScrollIndicators);

        // Validate
        if (!$settings->validate()) {
            Craft::$app->getSession()->setError(Craft::t('matrix-horizontal-columns', 'Could not save settings.'));
            return $this->renderTemplate('matrix-horizontal-columns/settings', [
                'settings' => $settings,
                'title' => Craft::t('matrix-horizontal-columns', 'Matrix Horizontal Columns Settings')
            ]);
        }

        // Save plugin settings
        Craft::$app->getPlugins()->savePluginSettings(MatrixHorizontalColumns::getInstance(), $settings->toArray());

        Craft::$app->getSession()->setNotice(Craft::t('matrix-horizontal-columns', 'Settings saved.'));
        return $this->redirectToPostedUrl();
    }
} 