# Gaelworx type + container system — the canonical spec

This is the standard every page must conform to. Derived from `index.html` (the
reference implementation) and the dominant patterns across the site. Your job:
make the assigned page's **typography and containers** match this system and
"play nice" — especially at mobile widths (test your reasoning at 360–390px).

Scope is TYPE + CONTAINERS ONLY. Do not restructure sections, rewrite copy,
change colors/gradients (except to fix a genuine contrast failure), touch shared
JS (`coin3d.js`, `gwnav.js`), or alter brand decisions. Preserve reduced-motion
behavior, the `<noscript>` reveal override, and any scroll/coin engine hooks.

## Design tokens (already in every page's `:root`)
`--gw-void:#0A0908` `--gw-ink:#EDE6D6` `--gw-muted:#9A9286` `--gw-muted-2:#8A8272`
`--gw-accent:#E9A94F` `--gw-accent-2:#F2C14E` `--gw-accent-3:#F8D97A`
`--gw-rust:#B5623A` `--gw-rust-2:#C97147` `--gw-ember:#E2622B`
`--gw-cream:#E7CFAE` `--gw-silver:#C9C1B2`
`--gw-umber:#7A3D1F` `--gw-charcoal:#2A211A` `--gw-black:#191410`
Any remaining raw hex that equals one of these MUST become the `var(--…)`. Leave
one-off hexes (backgrounds, rgba glows, gradient stops not in the token set) alone.

## Fonts (roles are fixed)
- **Grenze Gotisch** (serif/blackletter) — display headings + wordmarks ONLY.
- **Space Grotesk** (sans) — body copy, subheads, UI text.
- **Space Mono** (mono) — eyebrows, labels, meta, price tags, counters.

## Type scale (canonical clamps — match, don't invent new ones)
- Hero H1 (page-top only): up to `clamp(50px,9vw,132px)` on the homepage hero;
  on subpage heroes keep the max ≤ ~96px unless it's the single page-defining hero.
- Section H2: `clamp(34px,4.2vw,52px)` … up to `clamp(46px,7.4vw,106px)` for a
  hero-adjacent statement. Prefer the smaller end for ordinary section heads.
- Sub-head H3: `clamp(28px,3.8vw,48px)` down to `clamp(24px,3vw,42px)`.
- Body: `clamp(15px,1.5vw,18px)` (lead) / `14.5px` (dense). `line-height:1.6–1.65`.
- Body color `var(--gw-muted)`; lift toward `var(--gw-ink)`/`--gw-cream` if the
  measured contrast on that background is under 4.5:1 (this is the #1 legibility bug).
- **Display letter-spacing floor: ≥ -0.04em.** Never tighter.

## Eyebrows / mono labels — THE mobile-overflow bug class
Space Mono eyebrows use wide tracking (`.24em`–`.32em`). Long strings
("SERVICES · THE ARSENAL", "GW–01 · AI INSTALLATION", trade names) at that
tracking **overflow or wrap-collide inside narrow columns on mobile.** For each
such label, verify: does `chars × fontSize × (1 + tracking/1em)` fit the column
it lives in at 360px? If not, the fix (mobile breakpoint only, don't disturb
desktop) is: reduce `letter-spacing` to ~`.12em–.16em` AND/OR drop `font-size`
1–2px AND/OR allow a clean wrap. Reference fix already shipped in `index.html`
Arsenal: `[data-arsenal-eyebrow]{font-size:10px!important;letter-spacing:.14em!important}`
inside `@media (max-width:760px)`. Apply the same discipline here.

## Containers
- **Standard content max-width: `1080px` (text-dense/legal) or `1160px` (default
  content).** These two are the system. `1120px`, `1180px`, `1240px` are DRIFT —
  consolidate to the nearest standard (`1120→1160`, `1180→1160`, `1240→1160`)
  UNLESS the section is deliberately full-bleed/wide and narrowing it visibly
  hurts (if so, leave it and note why).
- **Section horizontal gutter: `clamp(16px,4vw,44px)`** is the standard. Legal/
  narrow pages may use `clamp(16px,3vw,28px)`. Don't leave a page with three
  different gutter values doing the same job.
- Center content containers with `margin:0 auto`. No container should allow
  horizontal scroll at any width — check long unbroken strings (URLs, emails,
  code) get `overflow-wrap:anywhere` or `word-break`.
- Body text column ≤ ~65ch for readability; the site uses `max-width:52ch` on
  paragraphs. Headings can be wider; use `text-wrap:balance` on h1–h3 and
  `text-wrap:pretty` on long prose.

## Mobile discipline (≤760px)
- Inline styles carry the desktop layout, so mobile overrides need `!important`
  inside `@media (max-width:760px)` — follow the existing pattern in the page.
- No text smaller than ~14px for body on mobile; labels may go to ~10px.
- Touch targets ≥ 44px. No element may overflow the viewport horizontally.
- Multi-column grids collapse to 1–2 columns, never crushed.

## What "playing nice" means, concretely
Same conceptual element = same size/weight/tracking across the page and vs.
sibling pages. Eyebrows all track the same. H2s all sit in the same clamp band.
Containers share a max-width. Nothing overflows, nothing wrap-collides, nothing
crowds its neighbor at any width. Rhythm (vertical spacing) reads as deliberate,
not random 13px gaps.
