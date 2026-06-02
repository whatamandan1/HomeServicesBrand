import { test as base, expect } from "@playwright/test";

/** Matches lib/cookie-consent.ts so the banner never blocks e2e interactions. */
const E2E_COOKIE_CONSENT = {
  version: 1,
  choice: "essential" as const,
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addInitScript((consent) => {
      localStorage.setItem("sorted_cookie_consent", JSON.stringify(consent));
    }, E2E_COOKIE_CONSENT);
    await use(context);
  },
});

export { expect };
