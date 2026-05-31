# Mobile UI automated testing

## What runs in CI

Playwright end-to-end tests in `src/frontend/web/e2e/` run on every push/PR to `main` (see `.github/workflows/ci.yml`).

| Project | Engine | Device profile | Approximates |
|---------|--------|----------------|--------------|
| `mobile-chrome` | Chromium | Pixel 5 viewport | Android Chrome |
| `mobile-safari` | WebKit | iPhone 13 viewport | iOS Safari |

Tests cover:

- Signup wizard: window scroll on mobile (no nested overflow), fixed footer, scroll on steps 1–4
- Marketing header: mobile menu without `body { position: fixed }`
- Legacy `/#pricing` → `/signup` redirect

### Run locally

```bash
cd src/frontend/web
npm install
npx playwright install chromium webkit
npm run test:e2e
```

First run starts the Next app (`npm run dev` locally, `npm run start` in CI after `npm run build`).

## What automation does *not* replace

Emulated mobile browsers catch most **layout and scroll-container** regressions. They do **not** fully reproduce:

- Real iOS Safari (`100dvh`, rubber-banding, keyboard covering inputs)
- Samsung Internet or in-app WebViews (Facebook, Instagram)
- Touch latency or GPU compositing quirks

For those, keep a short **manual smoke** before major releases: iPhone Safari + one Android Chrome device on `/`, `/signup` (all four steps), and open/close the mobile menu.

## Optional: real devices in CI

[BrowserStack](https://www.browserstack.com/) or [Sauce Labs](https://saucelabs.com/) can run the same Playwright tests on physical iOS/Android browsers. That is paid and slower; add when emulators miss too many bugs.

## Adding tests for new UI

1. Prefer stable `data-testid` on scroll surfaces and sticky chrome (see signup wizard).
2. Assert **structure** (overflow, classes, scrollTop) not pixel-perfect screenshots unless you adopt visual regression separately.
3. Add a spec under `e2e/` and run both mobile projects before merging.
