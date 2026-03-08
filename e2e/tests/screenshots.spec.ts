import { test } from '@playwright/test';
import { navigateToApp, selectMode, navigateToSection } from '../helpers/navigation';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/screenshots');

test.describe('README Screenshots', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('capture key app states for documentation', async ({ page }) => {
    await navigateToApp(page);

    // 1. Mode selection screen
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mode-select.png'),
      fullPage: false,
    });

    // Enter solo mode for all remaining screenshots
    await selectMode(page, 'solo');

    // 2. Section 0: Who's Used AI?
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'section-00-who-used-ai.png'),
      fullPage: false,
    });

    // 3. Section 2: Rules vs Learning
    await navigateToSection(page, 2);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'section-02-rules-vs-learning.png'),
      fullPage: false,
    });

    // 4. Section 6: The Big Question (Bridge)
    await navigateToSection(page, 6);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'section-06-bridge.png'),
      fullPage: false,
    });

    // 5. Section 7: Numbers & Words (Hook)
    await navigateToSection(page, 7);
    // Reveal the numbers for a more interesting screenshot
    const revealBtn = page.getByText('tap to reveal');
    if (await revealBtn.isVisible()) {
      await revealBtn.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'section-07-numbers.png'),
      fullPage: false,
    });

    // 6. Section 8: Words in Space (Embeddings)
    await navigateToSection(page, 8);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'section-08-embeddings.png'),
      fullPage: false,
    });

    // 7. Section 9: Attention!
    await navigateToSection(page, 9);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'section-09-attention.png'),
      fullPage: false,
    });

    // 8. Section 12: Predict!
    await navigateToSection(page, 12);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'section-12-predict.png'),
      fullPage: false,
    });
  });
});
