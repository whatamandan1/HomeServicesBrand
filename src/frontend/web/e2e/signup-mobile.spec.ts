import { test, expect } from "./fixtures";
import {
  advanceToStep,
  clickSignupPrimary,
  expectBodyNotPositionFixed,
  expectMobileSignupShell,
  fillSignupAddress,
  scrollSignupContentToBottom,
} from "./helpers/signup-mobile";

test.describe("Signup wizard mobile layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
    await expectMobileSignupShell(page);
    await expectBodyNotPositionFixed(page);
  });

  test("step 1 garden size scrolls when content overflows", async ({ page }) => {
    await expect(page.getByText("Step 1 of 4")).toBeVisible();
    const canScroll = await page.evaluate(
      () => document.documentElement.scrollHeight > window.innerHeight + 8
    );
    if (canScroll) {
      await scrollSignupContentToBottom(page);
    }
    await expect(page.getByRole("button", { name: /^Continue$/ }).first()).toBeVisible();
  });

  test("step 2 add-ons scroll reaches bottom above sticky footer", async ({ page }) => {
    await advanceToStep(page, 1);
    await scrollSignupContentToBottom(page);
    await clickSignupPrimary(page, /^Continue$/);
    await expect(page.getByText("Step 3 of 4")).toBeVisible();
  });

  test("step 3 quote and step 4 finish form stay scrollable", async ({ page }) => {
    await advanceToStep(page, 2);
    await scrollSignupContentToBottom(page);

    await page.getByLabel("Email").fill("mobile-e2e@example.com");
    await clickSignupPrimary(page, /^See my quote$/);
    await expect(page.locator("[data-signup-quote]")).toBeVisible();
    await scrollSignupContentToBottom(page);

    await clickSignupPrimary(page, /^Continue$/);
    await expect(page.locator("[data-signup-finish]")).toBeVisible();
    await scrollSignupContentToBottom(page);

    await page.getByLabel("First name").fill("Test");
    await page.getByLabel("Last name").fill("User");
    await fillSignupAddress(page, {
      line1: "1 Test Street",
      city: "Leeds",
      postcode: "LS1 4AP",
    });
    await page.getByRole("button", { name: "Weekday mornings" }).click();
    await page.getByLabel("Create a password").fill("test-password-12");

    await scrollSignupContentToBottom(page);
    await expect(page.getByRole("button", { name: /^Continue$/ })).toBeVisible();
    await expectBodyNotPositionFixed(page);
  });
});
