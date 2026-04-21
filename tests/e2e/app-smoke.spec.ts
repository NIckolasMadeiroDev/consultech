import { test, expect } from "@playwright/test";

test("a página inicial carrega", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.ok()).toBeTruthy();
  await expect(page.locator("body")).toBeVisible();
});
