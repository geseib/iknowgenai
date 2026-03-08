import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Assert the footer shows the expected section title text.
 */
export async function expectSectionTitle(
  page: Page,
  title: string
): Promise<void> {
  // Footer nav contains the section title in a centered div
  const footer = page.locator('div[style*="position: fixed"][style*="bottom: 0"]');
  await expect(footer.getByText(title)).toBeVisible();
}

/**
 * Assert the progress percentage text in the header.
 * Matches "{pct}% complete" in the top-right corner.
 */
export async function expectProgressPct(
  page: Page,
  pct: number
): Promise<void> {
  await expect(page.getByText(`${pct}% complete`)).toBeVisible();
}

/**
 * Assert a button with the given text is enabled (not disabled).
 */
export async function expectButtonEnabled(
  page: Page,
  text: string | RegExp
): Promise<void> {
  const button = page.getByRole('button', { name: text });
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
}
