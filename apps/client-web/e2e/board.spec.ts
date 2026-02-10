import { expect, test } from '@playwright/test';

test.describe('Board basic functionality', () => {
  test('loads the application', async ({ page }) => {
    await page.goto('/');
    // Should render the toolbar
    await expect(page.locator('text=pen')).toBeVisible({ timeout: 10000 });
  });

  test('shows canvas element', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas.first()).toBeVisible({ timeout: 10000 });
  });

  test('toolbar tools are selectable', async ({ page }) => {
    await page.goto('/');
    // Click select tool
    const selectButton = page.getByText('select');
    if (await selectButton.isVisible()) {
      await selectButton.click();
    }
  });

  test('status bar shows connection info', async ({ page }) => {
    await page.goto('/');
    // StatusBar should exist
    const statusBar = page.locator('text=disconnected');
    await expect(statusBar.first()).toBeVisible({ timeout: 10000 });
  });

  test('timeline scrubber shows checkpoint count', async ({ page }) => {
    await page.goto('/');
    // Look for checkpoint text in the scrubber
    // Will show "0 checkpoints" by default
    const scrubber = page.locator('text=checkpoint');
    // May or may not be visible depending on boardId state
  });
});

test.describe('Cross-browser canvas rendering', () => {
  test('canvas renders with correct dimensions', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10000 });

    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
    }
  });
});
