# GardensSorted - First Month Marketing Plan

Operational plan for the **first 4 weeks of paid acquisition** after go-live.

**Last updated:** 2026-06-01  
**Status:** Ready for spend - §13 decisions confirmed (Leeds, no headline £ in ads, GA4)  
**Parent doc:** [`marketing-plan.md`](marketing-plan.md) (strategy, benchmarks, channel playbooks)

---

## 1. Purpose

Run a **valid CAC test** in one pilot city: learn what it costs to acquire paying subscribers, whether the funnel converts, and whether unit economics work at our launch price - before scaling spend.

**This month is for learning, not scaling.** Success = clear data and a go/no-go for month 2, not hitting a vanity subscriber target.

Month 1 will be **loss-making on cash** - that is expected. See **§4** for unit economics (**10 visits/yr** Essential, **£18/visit** Courtyard band), expected burn **~£2.8k**, and ad payback **~2.5–3 months** on contribution.

---

## 2. Summary

| Item | Plan |
|------|------|
| **Total budget** | **£4,000** over 4 weeks |
| **Spend rhythm** | **£2,000** weeks 1–2 → review → **£2,000** weeks 3–4 |
| **Price in ads** | **No headline £** - no public price grid; quote in signup wizard; single **garden care** story |
| **Geography** | **One city first** (default: **Leeds** + tight radius) |
| **Primary channel** | Google Search (local service + brand) |
| **Secondary** | Meta retargeting; small Meta prospecting test |
| **Target outcome (base case)** | **~60 paying customers**, **~£3,700 MRR** (small-garden mix), blended **CAC ~£65** |
| **Fulfilment gate** | New signups receive first visit within **14 days** |

---

## 3. What success looks like

### 3.1 Primary goal (measurement)

Learn **directional** numbers for:

- Cost per signup lead (CPL) - by channel  
- Lead → paid conversion %  
- Blended CAC (paid customers only)  
- Activation: first visit completed within 21 days  

### 3.2 Revenue targets (garden-band pricing)

Planning range after **£4,000 spend** (assuming “happy” but realistic month-1 performance). **MRR assumes ~£60 ARPU** (mostly small gardens at **£59.99/mo**; medium/large mix raises this). See [`consumer-plans-and-pricing.md`](consumer-plans-and-pricing.md).

| Scenario | Blended CAC | New customers | End MRR | First-month gross* |
|----------|-------------|---------------|---------|-------------------|
| Conservative | £80 | ~50 | ~£3,000 | ~£3,000 |
| **Base (plan for this)** | **£65** | **~62** | **~£3,700** | **~£3,700** |
| Optimistic | £55 | ~73 | ~£4,400 | ~£4,400 |

\*Assumes each new subscriber pays one full month on signup; minimal churn in weeks 1–4.

**Fortnight split (base case):**

| Period | Spend | Expected CAC | New customers |
|--------|-------|--------------|---------------|
| Weeks 1–2 | £2,000 | ~£70 (learning) | ~29 |
| Weeks 3–4 | £2,000 | ~£60 (retargeting helps) | ~33 |
| **Total** | **£4,000** | **~£65** | **~62** |

### 3.3 KPI thresholds

| Metric | Weak | OK (continue) | Strong |
|--------|------|---------------|--------|
| Google CPL | > £35 | £12–£25 | < £12 |
| Lead → paid | < 5% | 8–12% | 15%+ |
| Blended CAC | > £120 | **£60–£90** | £40–£60 |
| First visit within 21 days | < 80% | 80–90% | 90%+ |

Month-1 CAC of **£60–£90 is normal** for paid-only, cold traffic. Do not expect £30 blended CAC yet.

Marketing KPIs in §3 measure **acquisition quality**. **§4** measures whether that acquisition is **economically worth scaling**.

---

## 4. Unit economics & month-1 cash

### 4.1 Important framing

A **good month-1 marketing result** (~60 customers, ~£65 CAC) is **not** a profitable month on cash. You are spending **£4,000** to buy subscribers and learn the funnel. At **~£59.99/mo small garden** (10 visits/year), contribution per customer is strong enough that **CAC payback is ~2 months** on a small-garden mix - inside a typical paid-scale target - but month 1 still shows a **cash loss** because ad spend lands upfront while provider costs and fees also go out in month 1.

**Plan for a month-1 cash loss.** The question is whether measured CAC and retention justify continuing, not whether month 1 pays back.

### 4.2 Assumptions (base case — small garden £59.99/mo)

Adjust if garden size mix differs (medium/large raise ARPU and provider cost). **Do not use legacy £49.95** — live pricing is garden-band; see [`consumer-plans-and-pricing.md`](consumer-plans-and-pricing.md).

| Input | Value | Notes |
|-------|-------|-------|
| Customer price | **£59.99/mo** | Small garden band (planning default) |
| Visits per year | **10** | Garden care cadence (~every 5–6 weeks) |
| Provider pay | **~£16.67/mo** | 10 ÷ 12 × **£20**/visit (small band) |
| Ops per customer | **£5/mo** | Support, hosting, AI |
| Payment processing | **3%** | Stripe/card |
| Platform fixed cost | **£250/mo** | Tools, hosting base |
| Blended CAC (base) | **£65** | From §3.2 |
| New customers (base) | **~62** | From §3.2 |

**Contribution per customer per month** (pre-marketing, pre-fixed):

```
Contribution = price × (1 − payment fee) − provider pay − ops
             = £59.99 × 0.97 − £16.67 − £5
             ≈ £36.50/mo
```

### 4.3 Month-1 cash picture (base case)

Illustrative **first calendar month** after full £4,000 spend and **~62 new subscribers**:

| Line | £ |
|------|---|
| Subscription cash in (first payments) | **+3,700** |
| Ad spend | **−4,000** |
| Provider pay (62 × ~£16.67/mo) | **−1,030** |
| Ops (62 × £5) | **−310** |
| Payment fees (~3% of gross) | **−~110** |
| Platform fixed | **−250** |
| **Approx. month-1 net cash** | **−~£2,000** |

Corporation tax, VAT, and initial setup costs are excluded. This is **working-capital burn**, not a full P&L.

### 4.4 Recovering the £4,000 ad spend

Ad payback from **ongoing contribution** (ignoring churn for simplicity):

```
Months to recover ads = total ad spend ÷ (customers × contribution per month)
                        = £4,000 ÷ (62 × £36.50)
                        ≈ 1.8 months
```

Per customer at **£65 CAC**:

```
CAC payback = £65 ÷ £36.50 ≈ 1.8 months of contribution
```

Target for paid scale is typically **≤ 3 months** payback on contribution. At **£59.99 small garden** with **~£16.67/mo provider cost**, **£65 CAC is inside that band** (~1.8 months). Month 1 still loses cash on a P&L basis because **£4,000 ads** land in the same month as **provider fulfilment** for new subs. **£65 CAC is acceptable for a learning month** if month-2 CAC trends down and churn is low. Reconcile mix and months 2–12 in [`sorted_saas_forecast_garden_bands.xlsx`](../sorted_saas_forecast_garden_bands.xlsx).

### 4.5 Scenarios vs economics

| Scenario | Customers | MRR | Ad spend | Approx. month-1 cash gap* | Ad payback (contrib.) |
|----------|-----------|-----|----------|----------------------------|------------------------|
| Conservative | ~50 | ~£3,000 | £4,000 | **−~£2,400** | ~2.2 mo |
| **Base** | **~62** | **~£3,700** | **£4,000** | **−~£2,000** | **~1.8 mo** |
| Optimistic | ~73 | ~£4,400 | £4,000 | **−~£1,500** | ~1.5 mo |

\*Same assumptions as §4.3. Gap narrows with more customers but **ad spend is fixed at £4k** - more customers also increases provider/ops outflow.

### 4.6 What makes month 1 “economically acceptable”

Month 1 does not need to be cash-positive. Continue to month 2 if:

| Check | Acceptable |
|-------|------------|
| Blended CAC | **≤ £90** (OK band) and trending down week-on-week |
| CAC payback at measured CAC | **≤ 6 months** on contribution (stricter **≤ 4 months** to scale hard) |
| Lead → paid | **≥ 8%** |
| First visit within 21 days | **≥ 80%** |
| Willing burn | You can fund **~£2k–£2.5k net cash gap** in month 1 (small-garden mix) plus working capital for provider float |

**Do not scale spend** (month 2+) until measured CAC payback on contribution is **≤ 3 months** (stricter **≤ 2.5 months** to scale hard).

### 4.7 Link to financial model

Plug measured CAC, marketing, and garden-band mix into [`sorted_saas_forecast_garden_bands.xlsx`](../sorted_saas_forecast_garden_bands.xlsx) (Headlines + Garden mix tabs) to project months 2–12 cash and MRR. Forecast mix defaults to **~£59.99/mo** Essential ARPU and **~£25/mo** provider (UK housing mix alone is ~£52 - reference column on Garden mix). Older file: [`sorted_saas_forecast_simplified.xlsx`](../sorted_saas_forecast_simplified.xlsx).

---

## 5. Budget & channel allocation

### 5.1 Total: £4,000 over 4 weeks

**Fortnight 1 - £2,000**

| Channel | Spend | Daily ~ | Role |
|---------|-------|---------|------|
| Google Search (local + brand) | £1,300 | ~£93 | Primary acquisition |
| Meta retargeting | £400 | ~£29 | Warm traffic (once pixels firing) |
| Meta prospecting | £250 | ~£18 | One audience, one creative set |
| Reserve | £50 | - | Brand keyword gaps |

**Fortnight 2 - £2,000** (release only if §9 go/no-go passed)

| Channel | Spend | Adjustment vs F1 |
|---------|-------|------------------|
| Google Search | £1,350 | Scale winning ad groups; pause losers |
| Meta retargeting | £450 | Larger pool from fortnight 1 traffic |
| Meta prospecting | £150 | Reduce if CAC poor; keep if promising |
| Reserve | £50 | - |

### 5.2 Channel rules

**Google Search - do**

- Campaigns: **Brand**, **Local service** (`garden maintenance leeds`, `lawn mowing leeds`, `gardener near me`)  
- Landing: **`/areas/leeds`** for Leeds local keywords; **`/signup`** for high-intent; **`/`** for brand  
- Geo: Leeds + radius; exclude postcodes you cannot serve  
- Always-on brand terms (cheap; protect name)

**Google Search - don’t**

- Broad match national keywords  
- Multiple cities in fortnight 1  
- Send paid traffic to homepage without a clear CTA to **get your quote**  

**Meta - do**

- Retarget: site visitors, pricing viewers, signup abandoners (7–30 day window)  
- Prospecting: homeowners 35–65, 5–10 mile radius, one creative test  
- Creative: real gardens, **no headline £** (quote in signup), local trust (“Yorkshire”, vetted gardeners)

**Meta - don’t**

- Boost random posts  
- Run 5+ audiences at once  
- Spend heavily on cold prospecting before retargeting pool exists

**Defer entirely in month 1**

- Direct mail, display, TikTok, PR (for CAC learning)  
- Referral programme (launch after 50+ happy customers - see parent plan)

**Free (non-negotiable)**

- Google Business Profile live with photos and service areas  
- Review ask after every completed first visit  

---

## 6. Messaging & offer

### 6.1 Single offer story (no headline £ in ads)

All paid creative for month 1 leads with **one offer** — garden care, 10 visits/year, priced on site by garden size:

> **Regular garden maintenance in Leeds** — lawn, borders, and tidy on a schedule. Vetted local gardeners. See plans and get your quote online.

Do **not** put a single “from £X” in ad headlines. **Do not** show a public price grid on marketing pages — price is revealed in the signup quote after garden size and details. Do **not** advertise legacy tiers in parallel — blurs conversion data.

### 6.2 Ad copy (draft)

**Google Search (Leeds local)**

> Regular garden maintenance in Leeds. 10 visits per year, vetted gardeners, manage visits in your account. See plans and get your quote.

**Meta**

> Tired of chasing gardeners? GardensSorted keeps your Leeds garden maintained on a schedule — lawn, borders, tidy. See plans online.

### 6.3 Landing page priorities

1. **Get your quote** CTA above the fold — no public price grid; price in signup wizard  
2. Postcode / availability messaging at signup (before payment)  
3. Trust: Stripe, vetted gardeners, “built for Yorkshire”  
4. Mobile CTA to `/signup`  
5. 3-month minimum term visible (reduce disputes)

### 6.4 Landing URLs (live site)

| Campaign | Final URL |
|----------|-----------|
| Leeds local service | `https://gardenssorted.co.uk/areas/leeds` |
| Brand | `https://gardenssorted.co.uk/` |
| High-intent quote | `https://gardenssorted.co.uk/signup` |

Append UTMs (§11). Site has sitemap, JSON-LD, and GA4 conversion events (`generate_lead`, `begin_checkout`, `purchase`) after cookie consent.

---

## 7. Week-by-week plan

### Pre-launch (before day 1 spend)

- [ ] Confirm **Leeds** (or chosen city) postcode coverage map  
- [ ] Provider capacity: can fulfil new signups within **14 days**  
- [ ] Google Ads + Meta accounts live; billing set  
- [x] Local SEO pages live (`/areas/leeds`, york, wakefield)  
- [ ] Google Search Console verified; sitemap submitted  
- [ ] GA4 on production (`NEXT_PUBLIC_GA_MEASUREMENT_ID`); mark conversions in GA4  
- [ ] Conversion tracking: signup start, lead captured, Stripe purchase (GA4 events + admin/Stripe)  
- [ ] UTM convention on all links (see §10)  
- [ ] Google Business Profile claimed and complete  
- [ ] 2–3 ad creative sets ready (1:1 and 4:5 for Meta)  
- [ ] Signup → first visit scheduling path QA’d  

### Weeks 1–2 (£2,000)

| Day | Action |
|-----|--------|
| 1–3 | Launch Google Brand + Local Service; Meta pixel verified; start prospecting at low daily cap |
| 4–7 | Check CPL daily; confirm leads in admin; no major campaign restructures yet |
| 8–10 | First weekly review (§10); pause ad groups with 2× CPL and zero paid conversions |
| 11–14 | Enable / scale Meta retargeting once 100+ site visitors; tighten geo if waste visible |

**End of week 2:** Fortnight 1 review → **go/no-go** for releasing £2,000 (§9).

### Weeks 3–4 (£2,000)

| Day | Action |
|-----|--------|
| 15–17 | Shift budget to winning keywords/audiences; cut bottom 20% of spend by performance |
| 18–21 | A/B one landing headline or CTA if conversion weak |
| 22–25 | Collect first testimonials / photos (with permission) for creative refresh |
| 26–28 | Month-end review; document CAC by channel; draft month 2 plan |

**End of week 4:** Full month 1 report (§12 template).

---

## 8. Measurement

### 8.1 Funnel to track

```
Ad click
  → Site session (UTM)
  → Signup wizard start
  → Signup lead captured (admin)
  → Stripe checkout completed
  → First visit scheduled
  → First visit completed (within 21 days)
```

### 8.2 Weekly scorecard

Update every **Monday**:

| Metric | W1 | W2 | W3 | W4 |
|--------|----|----|----|-----|
| Spend (£) | | | | |
| Signup leads | | | | |
| Paid subscribers (new) | | | | |
| CPL (blended) | | | | |
| Lead → paid % | | | | |
| CAC (blended) | | | | |
| MRR added (actual ARPU × new) | | | | |
| First visits completed | | | | |

### 8.3 Tools

| Need | Source |
|------|--------|
| Ad spend & clicks | Google Ads, Meta Ads Manager |
| Signup leads | Admin signup leads list |
| Revenue | Stripe Dashboard |
| Site behaviour | **GA4** (consent-gated on site) |
| Reviews | Google Business Profile |

---

## 9. Fortnight 1 go / no-go (release £2,000 for weeks 3–4)

Review at **day 14** before committing second £2,000.

### Go (release spend) if **any** of:

- Blended CAC **≤ £100** and lead → paid **≥ 5%**  
- Google CPL **≤ £30** with at least **5 paid customers** from Google  
- Clear upward trend: week 2 CAC lower than week 1  

### Pause & fix (hold second £2,000) if:

- **£1,500+ spent** and **zero paid customers**  
- Blended CAC **> £150** with lead → paid **< 3%**  
- Fulfilment failing - first visit SLA missed repeatedly  

### Fix before re-spending

- Landing page / pricing clarity  
- Postcode availability messaging  
- Trust signals (reviews, GBP, copy)  
- Checkout friction (mobile, Stripe errors)  
- Provider capacity in target postcodes  

---

## 10. Weekly optimisation rules

1. **No major restructures before day 7** - let Google exit initial learning.  
2. **Pause rule:** any ad group with **2× target CPL and zero paid conversions** after **~£150–£200** spend.  
3. **Scale rule:** increase daily budget **≤ 20%** on ad groups with CAC below **£70** and ≥ 3 conversions.  
4. **Do not** add York/Wakefield until Leeds CAC and fulfilment are proven.  
5. **Do not** add headline pricing to ads mid-fortnight unless conversion is broken.

---

## 11. UTM convention

```
utm_source=google|meta
utm_medium=cpc|social
utm_campaign=month1-leeds-f1|month1-leeds-f2
utm_content={ad-variant}
```

Examples:

- `utm_source=google&utm_medium=cpc&utm_campaign=month1-leeds-f1&utm_content=local-garden-maintenance`  
- `utm_source=meta&utm_medium=social&utm_campaign=month1-leeds-f2&utm_content=retarget-pricing`

---

## 12. Month 1 report template

Complete at end of week 4.

### Results

| Metric | Target (base) | Actual |
|--------|---------------|--------|
| Total spend | £4,000 | |
| New paying customers | ~62 | |
| Blended CAC | ~£65 | |
| End MRR (~£60 ARPU) | ~£3,700 | |
| Google CPL | £12–£25 | |
| Lead → paid % | 8–12% | |
| First visit within 21 days | 80%+ | |

### Economics (§4)

| Metric | Planned | Actual |
|--------|---------|--------|
| Approx. month-1 net cash | ~−£2,000 | |
| Contribution per customer/mo | ~£36.50 | |
| Ad payback (months, on contribution) | ~1.8 | |
| Fundable cash gap? | Y/N | |

### By channel

| Channel | Spend | Leads | Paid | CAC |
|---------|-------|-------|------|-----|
| Google Search | | | | |
| Meta retargeting | | | | |
| Meta prospecting | | | | |

### Decisions for month 2

- [ ] Scale Leeds - increase to £X/month  
- [ ] Add second city - which: York / Wakefield  
- [ ] Shift channel mix - Google vs Meta split  
- [ ] Change ad offer story - stay no-headline-£ or test creative  
- [ ] Referral programme - ready? Y/N  

---

## 13. Decisions (confirmed)

| # | Decision | Choice | Status |
|---|----------|--------|--------|
| 1 | Pilot city | **Leeds** | Confirmed |
| 2 | Price in ads | **No headline £** — quote in signup only (no marketing price section) | Confirmed |
| 3 | Fortnight 1 budget | £2,000 | Open |
| 4 | Fortnight 2 budget | £2,000 (conditional) | Open |
| 5 | Analytics stack | **GA4** | Confirmed |
| 6 | Launch promotion | None (recommended) | Open |

---

## 14. Risks

| Risk | Mitigation |
|------|------------|
| Spend before provider supply | Postcode gating; pause ads if SLA missed |
| CAC looks “high” at £80 | Normal for month 1 marketing - see §4 for cash gap and payback; compare to §3.3 OK band |
| Low lead → paid | Fix landing page before scaling; check postcode messaging |
| Second £2k wasted | Fortnight 1 go/no-go (§9) |
| Mixed plan messaging | Single garden-care story; no headline £ in ads |

---

## 15. Related documents

| Doc | Use |
|-----|-----|
| [`marketing-plan.md`](marketing-plan.md) | Full strategy, CAC benchmarks, channels |
| [`consumer-plans-and-pricing.md`](consumer-plans-and-pricing.md) | Plan features - keep copy accurate |
| [`development-roadmap.md`](development-roadmap.md) | Go-live gates |
| [`signup-needs-map.md`](signup-needs-map.md) | Funnel steps |
| [`sorted_saas_forecast_garden_bands.xlsx`](../sorted_saas_forecast_garden_bands.xlsx) | Month 2+ cash and MRR (4 garden bands, UK mix) |
| [`sorted_saas_forecast_simplified.xlsx`](../sorted_saas_forecast_simplified.xlsx) | Legacy single-price forecast |

---

*Execute weeks 1–2 with Leeds landing URLs (§6.4). Do not release fortnight 2 budget until §9 go/no-go is complete. Budget for **~£2k** month-1 cash gap on small-garden mix (§4).*
