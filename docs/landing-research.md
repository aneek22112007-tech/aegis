# Landing page research (v3)

What we studied, what we borrowed, and why it suits a payment-safety product for older adults.
Everything below was checked against the live sites and public teardowns in November 2026.
We copied techniques, never assets, copy or code.

## Sources

| Site | What we looked at |
| --- | --- |
| Stripe (stripe.com) | Hero type scale, single accent colour, animated payment flows, code beside UI |
| Linear (linear.app) | "The page is the demo": real product surfaces in the hero, bento feature grids, monospace labels |
| Wise (wise.com) | Plain-language money copy, fee transparency, large legible numbers |
| Mercury (mercury.com) | Calm banking tone, generous whitespace, product cards floating on neutral backgrounds |
| Ramp (ramp.com) | Proof next to every claim, real-looking transaction rows |
| Revolut, Monzo | Phone-first product shots, notification-style vignettes |
| Apple (apple.com) | Scroll-told narrative, one idea per viewport, restraint with motion |
| Vercel (vercel.com) | Tight grid, hairline borders, crisp section rhythm |
| Brex, Razorpay, PayPal | Trust and compliance sections, payment-rail diagrams |
| Awwwards, Godly, Land-book | Section patterns across hundreds of fintech pages |

Public write-ups used to cross-check: Plinth, "Stripe, Linear, Loom: 7 design principles";
uiscanner, "12 best-designed SaaS websites to study in 2026"; Brainy, "Bento grid design: the 2026 playbook".

## Techniques borrowed

1. **Product-led hero (Linear, Stripe).** The hero shows the real AEGIS screens, not an illustration.
   For a safety product, seeing the actual "Waiting for Priya" screen is the strongest proof.
2. **One idea per viewport (Apple).** The scroll story pins one phone and changes one thing at a
   time, so the cause and effect of a blocked payment is impossible to miss.
3. **Timestamped day narrative (Monzo/Revolut notifications).** "Margaret's day" is told as
   real-looking notifications with times, which reads as a record rather than marketing.
4. **Bento grid with one flagship cell (Linear).** One 2x2 cell for the rule engine, smaller cells
   for supporting features, one sentence each, re-ordered (not shrunk) on mobile.
5. **Proof beside every claim (Ramp, Stripe).** Security claims sit next to the exact API calls and
   webhook headers AEGIS uses.
6. **Hairline grid and quiet surfaces (Vercel, Mercury).** 1px borders, neutral greys, a single
   brand blue; colour is reserved for status (green, amber, red).
7. **Plain money language (Wise).** Amounts in full with separators, no jargon on Margaret's side.
8. **Honest numbers (Wise, PayPal).** Every statistic links to its primary source.

## What we deliberately did not borrow

- Mesh gradients, dark-mode heroes and glow effects: they read as generic and hurt contrast for
  older eyes.
- Logo walls and testimonial carousels: AEGIS has no customers to quote, so we do not invent any.
- Autoplaying video: heavy, and it ignores reduced-motion settings.

## Section map

| Section | Borrowed from | Why |
| --- | --- | --- |
| Hero and scroll story | Linear, Apple | Real UI, one change per step |
| Margaret's day | Monzo, Revolut | Notifications make a scam timeline concrete |
| Payment path | Stripe | Animated flow of one payment through each hop |
| Bento features | Linear, Vercel | Scannable, hierarchy by size |
| Priya's side | Mercury | Calm approval UI, one decision per card |
| Trust and security | Stripe, Brex | Real endpoints and headers as proof |
| Numbers | Wise | Sourced figures only |
| FAQ and footer | Stripe | Short answers, complete footer |

## Constraints we kept

Light theme, one brand blue (#1849a9), Inter, no gradient text, no emoji, no hype copy.
Motion respects `prefers-reduced-motion`, heavy chunks load lazily, and every section works at
390, 1280 and 1920 pixels wide.

## Result (v3, November 2026)

Shipped in PRs #45 to #49. Screenshots from the live site are in `docs/landing-v3-*-desktop.png`
(1280 px) and `docs/landing-v3-*-mobile.png` (390 px). Checked in Chromium at 390, 1280 and
1920 px: no horizontal overflow, no console errors, no failed requests.

Copy that describes the PayPal integration is tested against `server/src/paypal/liveClient.ts`
and the webhook handler, so the landing page cannot drift from the code.
