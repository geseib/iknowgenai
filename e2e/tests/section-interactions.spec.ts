import { test, expect } from '@playwright/test';
import { navigateToApp, selectMode, navigateToSection } from '../helpers/navigation';

test.describe('Section Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test.describe('Section 0: Who\'s Used AI? (Solo Mode)', () => {
    test('tap items to reveal phase transition', async ({ page }) => {
      await selectMode(page, 'solo');

      // Should show "Tap everything you've used before"
      await expect(page.getByText('Tap everything you\'ve used before')).toBeVisible();

      // Tap a few items
      await page.getByText('Siri or Alexa').click();
      await page.getByText('Netflix / YouTube').click();
      await page.getByText('ChatGPT / Claude').click();

      // After selecting items, the CTA button should appear
      const ctaBtn = page.getByRole('button', { name: /See what these have in common/ });
      await expect(ctaBtn).toBeVisible();

      // Click to transition to phase 1
      await ctaBtn.click();

      // Phase 1 should show the reveal message
      await expect(page.getByText('All of those use AI!')).toBeVisible();
      await expect(page.getByText(/AI isn't just robots in movies/)).toBeVisible();
    });
  });

  test.describe('Section 2: Rules vs Learning', () => {
    test('reveal all scenarios and verify wow fact appears', async ({ page }) => {
      await selectMode(page, 'solo');
      await navigateToSection(page, 2);

      // Should show section title
      await expect(page.getByText('Rules vs Learning')).toBeVisible();

      // Each scenario has Regular? and AI? buttons. Click one for each.
      const scenarios = [
        'A calculator adds 2+2',
        'An app tells a cat from a dog',
        'Traffic lights change on a timer',
        'Spotify picks your next song',
        'Your phone screen turns off after 30s',
        'Your camera auto-focuses on a face',
      ];

      for (const scenario of scenarios) {
        // Find the scenario row and click a button to reveal
        const row = page.locator('div').filter({ hasText: scenario }).first();
        // Click any reveal button (Regular? or AI?) — both reveal the answer
        const revealBtn = row.getByRole('button').first();
        await revealBtn.click();
        await page.waitForTimeout(100);
      }

      // After all revealed, the "wow fact" insight should appear
      await expect(page.getByText(/The big difference:/)).toBeVisible();
      await expect(page.getByText(/A regular program needs someone to write every rule/)).toBeVisible();
    });
  });

  test.describe('Section 7: The Secret: Numbers', () => {
    test('tap to reveal numbers and verify trivia box', async ({ page }) => {
      await selectMode(page, 'solo');
      await navigateToSection(page, 7);

      // Should show the hook section
      await expect(page.getByText('The Secret: Numbers')).toBeVisible();
      await expect(page.getByText('"cat"')).toBeVisible();

      // Tap to reveal the number vector
      await page.getByText('tap to reveal').click();

      // Numbers should appear
      await expect(page.getByText('0.23')).toBeVisible();
      await expect(page.getByText('-0.81')).toBeVisible();
      await expect(page.getByText('...+12,278 more')).toBeVisible();

      // Vector explanation should appear
      await expect(page.getByText(/Every word becomes a list of numbers called a/)).toBeVisible();
      await expect(page.getByText('vector')).toBeVisible();

      // Trivia box should appear
      await expect(page.getByText('Wow Fact Unlocked!')).toBeVisible();
      await expect(page.getByText('12,288')).toBeVisible();
      await expect(page.getByText('numbers per word')).toBeVisible();
    });
  });

  test.describe('Section 12: Predict!', () => {
    test('temperature slider changes probabilities', async ({ page }) => {
      await selectMode(page, 'solo');
      await navigateToSection(page, 12);

      // Should show the predict section
      await expect(page.getByText('Predict!')).toBeVisible();
      await expect(page.getByText(/Temperature:/)).toBeVisible();

      // Default temperature is 0.80
      await expect(page.getByText('0.80')).toBeVisible();

      // The slider should be present
      const slider = page.locator('input[type="range"]');
      await expect(slider).toBeVisible();

      // Move slider to a low temperature (frozen)
      await slider.fill('0.10');
      await expect(page.getByText('0.10')).toBeVisible();
      await expect(page.getByText('Frozen')).toBeVisible();

      // Move slider to a high temperature (wild)
      await slider.fill('1.80');
      await expect(page.getByText('1.80')).toBeVisible();
      await expect(page.getByText('Wild')).toBeVisible();
    });

    test('word generation works', async ({ page }) => {
      await selectMode(page, 'solo');
      await navigateToSection(page, 12);

      // Should show placeholder underscores
      await expect(page.getByText('_ _ _ _ _ _ _ _ _')).toBeVisible();

      // Click "Generate first word"
      await page.getByRole('button', { name: /Generate first word/ }).click();

      // Placeholder should be gone, layer passes should appear
      await expect(page.getByText('_ _ _ _ _ _ _ _ _')).not.toBeVisible();
      await expect(page.getByText('96')).toBeVisible(); // 96 layer passes
      await expect(page.getByText('layer passes')).toBeVisible();

      // Click "Pick next word" a few times
      for (let i = 0; i < 3; i++) {
        await page.getByRole('button', { name: /Pick next word/ }).click();
        await page.waitForTimeout(100);
      }

      // Should show increasing layer count
      await expect(page.getByText('384')).toBeVisible(); // 4 words * 96

      // Wow fact / trivia box should be visible
      await expect(page.getByText('Wow Fact Unlocked!')).toBeVisible();
      await expect(page.getByText('layer passes so far')).toBeVisible();
    });
  });
});
