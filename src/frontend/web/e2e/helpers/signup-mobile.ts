import { expect, type Page } from "@playwright/test";

export function signupContent(page: Page) {
  return page.getByTestId("signup-mobile-scroll");
}

export function signupStickyFooter(page: Page) {
  return page.getByTestId("signup-mobile-footer");
}

/** Mobile signup: window scroll + fixed footer (no nested overflow). */
export async function expectMobileSignupShell(page: Page) {
  await expect(page.getByRole("heading", { name: /Get your quote|Your quote/i })).toBeVisible();
  await expect(page.locator("[data-signup-wizard]")).toBeVisible();
  await expect(signupContent(page)).toBeVisible();
  await expect(signupStickyFooter(page)).toBeVisible();
  await expect(page.locator("html")).not.toHaveClass(/signup-wizard-active/);
}

export async function expectBodyNotPositionFixed(page: Page) {
  const position = await page.evaluate(() => getComputedStyle(document.body).position);
  expect(position).not.toBe("fixed");
}

/** Scrolls the page when content overflows; no-op when the step fits on screen. */
export async function scrollSignupContentToBottom(page: Page) {
  const metrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: window.innerHeight,
  }));
  if (metrics.scrollHeight <= metrics.clientHeight + 8) return;

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBeGreaterThan(0);
}

export async function clickSignupPrimary(page: Page, label: RegExp) {
  const footer = signupStickyFooter(page);
  await footer.getByRole("button", { name: label }).click();
}

export async function advanceToStep(page: Page, targetStep: number) {
  if (targetStep >= 1) {
    await clickSignupPrimary(page, /^Continue$/);
    await expect(page.getByText(`Step 2 of 4`)).toBeVisible();
  }
  if (targetStep >= 2) {
    await clickSignupPrimary(page, /^Continue$/);
    await expect(page.getByText(`Step 3 of 4`)).toBeVisible();
  }
  if (targetStep >= 3) {
    await page.getByLabel("Email").fill("mobile-e2e@example.com");
    await clickSignupPrimary(page, /^See my quote$/);
    await expect(page.locator("[data-signup-quote]")).toBeVisible();
    await clickSignupPrimary(page, /^Continue$/);
    await expect(page.locator("[data-signup-finish]")).toBeVisible();
  }
}
