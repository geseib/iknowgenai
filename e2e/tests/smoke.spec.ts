import { test, expect } from '@playwright/test';
import { navigateToApp, selectMode, navigateToSection, getCurrentSection } from '../helpers/navigation';
import { expectSectionTitle, expectProgressPct, expectButtonEnabled } from '../helpers/assertions';

test.describe('Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);
  });

  test('app loads and shows mode selection screen', async ({ page }) => {
    await expect(page.getByText('How AI Thinks')).toBeVisible();
    await expect(page.getByText('Classroom Mode')).toBeVisible();
    await expect(page.getByText('Solo Mode')).toBeVisible();
    await expect(page.getByText('13 sections')).toBeVisible();
  });

  test('can select classroom mode', async ({ page }) => {
    await selectMode(page, 'classroom');
    await expect(page.getByText('Classroom')).toBeVisible();
    await expect(page.getByText('1 / 13')).toBeVisible();
    await expectSectionTitle(page, "Who's Used AI?");
  });

  test('can select solo mode', async ({ page }) => {
    await selectMode(page, 'solo');
    await expect(page.getByText('Solo')).toBeVisible();
    await expect(page.getByText('1 / 13')).toBeVisible();
    await expectSectionTitle(page, "Who's Used AI?");
  });

  test('navigation works with next and back buttons', async ({ page }) => {
    await selectMode(page, 'solo');

    // Start at section 0
    await expect(page.getByText('1 / 13')).toBeVisible();
    await expectButtonEnabled(page, /Next/);

    // Back should be disabled at section 0
    const backBtn = page.getByRole('button', { name: /Back/ });
    await expect(backBtn).toBeDisabled();

    // Click Next to go to section 1
    await page.getByRole('button', { name: /Next/ }).click();
    await expect(page.getByText('2 / 13')).toBeVisible();
    await expectSectionTitle(page, 'What IS AI?');

    // Back should now be enabled
    await expect(backBtn).toBeEnabled();

    // Click Back to return to section 0
    await backBtn.click();
    await expect(page.getByText('1 / 13')).toBeVisible();
    await expectSectionTitle(page, "Who's Used AI?");
  });

  test('progress bar updates as sections advance', async ({ page }) => {
    await selectMode(page, 'solo');

    // Section 0: 1/13 = ~8%
    await expectProgressPct(page, 8);

    // Navigate to section 6: 7/13 = ~54%
    await navigateToSection(page, 6);
    await expectProgressPct(page, 54);

    // Navigate to section 12: 13/13 = 100%
    await navigateToSection(page, 12);
    await expectProgressPct(page, 100);
  });

  test('all 13 sections are reachable', async ({ page }) => {
    await selectMode(page, 'solo');

    const titles = [
      "Who's Used AI?",
      'What IS AI?',
      'Rules vs Learning',
      'Brain vs AI',
      "What's an LLM?",
      'Meet the Models',
      'The Big Question',
      'Numbers & Words',
      'Words in Space',
      'Attention!',
      'The Thinking Layer',
      'Rinse & Repeat',
      'Predict!',
    ];

    for (let i = 0; i < titles.length; i++) {
      const section = await getCurrentSection(page);
      expect(section).toBe(i);
      await expectSectionTitle(page, titles[i]);

      if (i < titles.length - 1) {
        await page.getByRole('button', { name: /Next/ }).click();
        await page.waitForTimeout(100);
      }
    }

    // At last section, Next should be replaced with Restart
    await expectButtonEnabled(page, /Restart/);
  });
});
