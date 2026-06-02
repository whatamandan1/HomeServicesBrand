import { test, expect } from "./fixtures";
import { expectBodyNotPositionFixed } from "./helpers/signup-mobile";

test.describe("Marketing mobile navigation", () => {
  test("menu opens without fixing body position", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await expect(header.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expectBodyNotPositionFixed(page);

    await header.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Site menu" });
    await expect(menu).toBeVisible();
    await expect(header.getByRole("button", { name: "Close menu" })).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/mobile-nav-open/);
    await expectBodyNotPositionFixed(page);

    await menu.getByRole("button", { name: "Close menu" }).click();
    await expect(menu).toBeHidden();
    await expect(page.locator("html")).not.toHaveClass(/mobile-nav-open/);
  });

  test("legacy pricing hash redirects to signup", async ({ page }) => {
    await page.goto("/#pricing", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/signup$/, { timeout: 15_000 });
  });
});
