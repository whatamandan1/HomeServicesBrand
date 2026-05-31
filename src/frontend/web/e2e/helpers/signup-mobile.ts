import { expect, type Locator, type Page } from "@playwright/test";

export function signupScrollRegion(page: Page): Locator {
  return page.getByTestId("signup-mobile-scroll");
}

export function signupStickyFooter(page: Page): Locator {
  return page.getByTestId("signup-mobile-footer");
}

/** Mobile wizard uses one inner scroll surface; footer stays outside it. */
export async function expectMobileSignupShell(page: Page) {
  await expect(page.getByRole("heading", { name: /Get your quote|Your quote/i })).toBeVisible();
  await expect(page.locator("[data-signup-wizard]")).toBeVisible();
  await expect(signupScrollRegion(page)).toBeVisible();
  await expect(signupStickyFooter(page)).toBeVisible();

  await expect(page.locator("html")).toHaveClass(/signup-wizard-active/);

  const overflowY = await signupScrollRegion(page).evaluate(
    (el) => getComputedStyle(el).overflowY
  );
  expect(overflowY).toBe("auto");
}

export async function expectBodyNotPositionFixed(page: Page) {
  const position = await page.evaluate(() => getComputedStyle(document.body).position);
  expect(position).not.toBe("fixed");
}

/** Scrolls when content overflows; no-op when the step fits on screen. */
export async function scrollSignupContentToBottom(page: Page) {
  const scroll = signupScrollRegion(page);
  const metrics = await scroll.evaluate((el) => ({
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
  }));
  if (metrics.scrollHeight <= metrics.clientHeight + 8) return;

  await scroll.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  const scrollTop = await scroll.evaluate((el) => el.scrollTop);
  expect(scrollTop).toBeGreaterThan(0);
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
