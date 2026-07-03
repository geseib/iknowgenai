import { test, expect } from "@playwright/test";

// Smoke tests for the v2 course at /course.
// Local vite dev serves the app under the /iknowgenai/ base (see vite.config.js);
// on Vercel the same page lives at /course.
const COURSE = "/iknowgenai/course";

test.describe("How AI Actually Works (v2 course)", () => {
  test("landing page renders the syllabus", async ({ page }) => {
    await page.goto(COURSE);
    await expect(page.getByRole("heading", { name: "How AI Actually Works" })).toBeVisible();
    await expect(page.getByText("The Mystery")).toBeVisible();
    await expect(page.getByText("Begin Chapter 1")).toBeVisible();
    // The full course is built — every chapter card is clickable
    await expect(page.getByRole("button", { name: /Confident Nonsense/ })).toBeEnabled();
    await expect(page.getByRole("button", { name: /You Know GenAI/ })).toBeEnabled();
    await expect(page.getByRole("button", { name: /Attention/ })).toBeEnabled();
  });

  test("keyboard navigation walks chapter 1 and updates the hash", async ({ page }) => {
    await page.goto(COURSE);
    await page.getByText("Begin Chapter 1").click();
    await expect(page).toHaveURL(/#impossible-machine$/);
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/#impossible-machine\/1$/);
    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/#impossible-machine$/);
  });

  test("deep link restores chapter and slide", async ({ page }) => {
    await page.goto(`${COURSE}#learning-loop/3`);
    await expect(page.getByText("Run the loop.")).toBeVisible();
    await expect(page.getByText("4/8")).toBeVisible();
  });

  test("progress persists across reload", async ({ page }) => {
    await page.goto(COURSE);
    await page.getByText("Begin Chapter 1").click();
    await page.keyboard.press("ArrowRight");
    await page.goto(COURSE);
    await expect(page.getByText("Continue where you left off")).toBeVisible();
  });

  test("root app is unaffected", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("How AI Thinks")).toBeVisible();
  });
});
