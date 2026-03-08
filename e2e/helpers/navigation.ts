import type { Page } from '@playwright/test';

/**
 * Navigate to the app and wait for the mode selection screen to load.
 */
export async function navigateToApp(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  // Mode selection screen should show the title
  await page.getByText('How AI Thinks').first().waitFor({ state: 'visible' });
}

/**
 * Select a mode (classroom or solo) by clicking the corresponding card.
 */
export async function selectMode(
  page: Page,
  mode: 'classroom' | 'solo'
): Promise<void> {
  const cardTitle = mode === 'classroom' ? 'Classroom Mode' : 'Solo Mode';
  await page.getByText(cardTitle).click();
  // Wait for section content to appear (header shows mode indicator)
  await page.getByText(/\d+ \/ 13/).waitFor({ state: 'visible' });
}

/**
 * Navigate forward to a specific section by clicking "Next" repeatedly.
 * Starts from current section position.
 */
export async function navigateToSection(
  page: Page,
  sectionIndex: number
): Promise<void> {
  const current = await getCurrentSection(page);
  const clicks = sectionIndex - current;
  for (let i = 0; i < clicks; i++) {
    await page.getByRole('button', { name: /Next/ }).click();
    // Brief wait for section transition
    await page.waitForTimeout(150);
  }
}

/**
 * Read the current section index (0-based) from the header counter.
 * The header displays "N / 13" where N is 1-based.
 */
export async function getCurrentSection(page: Page): Promise<number> {
  const counter = page.getByText(/\d+ \/ 13/);
  const text = await counter.textContent();
  const match = text?.match(/(\d+)\s*\/\s*13/);
  if (!match) throw new Error(`Could not parse section counter: "${text}"`);
  return parseInt(match[1], 10) - 1;
}
