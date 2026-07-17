# Performance Plan — Gaelworx

Goal: improve the speed and performance of the site **without sacrificing any quality** —
zero visual change, zero behavioral change, zero content change. The hand-authored HTML
stays readable and no build step is introduced.

Site shape: 26 static HTML pages served by Vercel (auto gzip/brotli), self-hosted fonts,
two shared scripts (`coin3d.js`, `gwnav.js`), Three.js r128 pulled from cdnjs at idle time
for the 3D coin, image assets in `/assets` and `/projects`.

---

## Audit — what actually costs time today

Every finding below was verified against the files in this repo.

### A. Critical rendering path (every page)

1. **`assets/fonts/fonts.css` is a render-blocking external stylesheet on all 26 pages.**
   It is 562 bytes — four `@font-face` rules — yet it costs a full network round trip
   before any text can be laid out. The two font *preloads* in each head fire in parallel,
   but the browser can't *use* the fonts (or resolve `font-display:swap`) until this file
   arrives.

2. **Space Mono is used in the first viewport but never preloaded.**
   Every page preloads `grenze-gotisch.woff2` (42 KB) and `space-grotesk.woff2` (22 KB),
   but `space-mono-400.woff2` (16.5 KB) — used by the nav CALL NOW pill, the MENU button,
   and the mono labels/chips in every hero — is only discovered after CSS parses, so it
   swaps in late (visible font flash on slow connections).

3. **End-of-body scripts load without `defer`.**
   `gwnav.js` is a synchronous `<script src>` on all 25 pages that include it, and
   `index.html:608` loads `coin3d.js` synchronously too (the other pages already defer it).
   Both scripts do all their work on `DOMContentLoaded` (verified: `gwnav.js:115`,
   `coin3d.js:273`, and the index inline runtime at `index.html:1163`), so `defer` is
   drop-in safe — deferred scripts execute in order *before* `DOMContentLoaded` fires.
   Today the synchronous fetch+execute blocks the tail of parsing and delays
   `DOMContentLoaded`, which is exactly the event the whole site boots on.

### B. Images

4. **`assets/knot-copper.webp` (1440×1440, 160 KB) — audited for a resize, kept at full size.**
   The Three.js coin texture draws onto a 1024×1024 canvas (`coin3d.js:106`), but the
   flat crest layers render far larger than a first pass suggests: up to **780 CSS px**
   on `web.html` (1560 device px at 2× DPR), 600 px on `contact.html`, 540 px on
   `software.html`/`install.html`. A 1024 source would be *upscaled* there — a real
   quality loss — and a measured re-encode at safe quality (libwebp q90, method 6,
   alpha-premultiplied PSNR 41 dB) saved only ~16 KB. Decision: **left untouched**
   (see "Explicitly rejected").

5. **`assets/knot-etch.png` (180×180) weighs 52 KB — and it's the favicon on every page.**
   180×180 RGBA should be nowhere near 52 KB; it is simply under-compressed. Two fixes:
   losslessly recompress the existing file (no pixel changes), and add a dedicated
   ~48×48 favicon derivative (~2–4 KB) so first-time visitors don't pull 52 KB for a
   16–32 px tab icon. The 180px original stays as `apple-touch-icon` (that's the correct
   size for it) and as the coin's etched-face texture.

6. **`assets/og-card.png` is 228 KB.** Only social crawlers fetch it — no page-load impact —
   but it compresses losslessly for free. Low priority.

7. **Already right: don't touch.** Ticker logos are 64×64 with `loading="lazy"` +
   width/height; `projects/*.jpg` are lazy + `decoding="async"` with `aspect-ratio`
   reserved (no CLS). Footer knot images (34 px, always below the fold) are the one gap —
   they should get `loading="lazy" decoding="async"`.

### C. Third party

8. **Three.js r128 (~150 KB gzip) comes from `cdnjs.cloudflare.com`.**
   `coin3d.js:11–20` idle-loads it on the ~20 pages with a coin. Idle-loading is already
   right, but the third-party origin costs DNS + TLS + a cold HTTP/2 connection, the
   browser cache is partitioned per-site anyway (no cross-site cache benefit), and it's
   an availability dependency. Self-hosting the identical file gets it onto the existing
   warm connection and under our cache policy. Zero behavior change — same bytes,
   version-pinned filename.

### D. Caching (`vercel.json`)

9. **Root-level JS has no cache rule.** `coin3d.js`, `gwnav.js`, `demo.js` fall through to
   Vercel's default `public, max-age=0, must-revalidate` — every repeat view pays a
   revalidation round trip per script.

10. **Fonts are cached for only 30 days.** They live under the `/(assets|projects)/(.*)`
    rule (30 days + SWR). Font files never change in place — they can be
    `max-age=31536000, immutable`.

---

## Work plan

### Phase 1 — Head & script hygiene (all 26 pages, HTML-only edits)

| # | Change | Where | Risk |
|---|--------|-------|------|
| 1.1 | Inline the four `@font-face` rules into the head `<style>` (URLs adjusted to `assets/fonts/…`); remove the `fonts.css` `<link>` | all 26 pages | none — same rules, one less blocking request |
| 1.2 | Add `<link rel="preload" href="assets/fonts/space-mono-400.woff2" as="font" type="font/woff2" crossorigin>` | all pages that render mono text in the first viewport (all of them — nav) | none — 16.5 KB, already always downloaded |
| 1.3 | Add `defer` to every `<script src="gwnav.js">` and to `index.html`'s `coin3d.js` | 25 pages + index | none — all entry points wait on `DOMContentLoaded`; deferred scripts run before it, in order |
| 1.4 | Point `rel="icon"` at the 48 px favicon derivative from 2.2 — Phases 1 and 2 land in the same commit, so the reference is never dangling; keep `apple-touch-icon` on the 180px file | all 26 pages | none |
| 1.5 | Add `loading="lazy" decoding="async"` to the 34 px footer knot `<img>`s | all pages with the footer knot | none — always below the fold |

### Phase 2 — Asset work (no HTML semantics change)

| # | Change | Detail | Quality guard |
|---|--------|--------|---------------|
| 2.1 | ~~Resize `knot-copper.webp` 1440→1024~~ **Measured and rejected** | `web.html` renders the crest at up to 780 CSS px (1560 device px at 2×); a 1024 source would upscale there, and a q90 re-encode saved only ~16 KB | keeping the original *is* the quality guard |
| 2.2 | Create `assets/knot-etch-48.png` (favicon derivative) | 4.0 KB (oxipng-optimized) | favicons render at 16–32 px; 48 px source is above need |
| 2.3 | Losslessly recompress `knot-etch.png` (49→30 KB) and `og-card.png` (226→187 KB) via oxipng | decoded RGBA verified identical before/after | lossless by definition |
| 2.4 | **Do not** recompress `projects/*.jpg` | 1600×1000 is right-sized for the 2× grid and they're lazy-loaded | explicit quality decision |

### Phase 3 — Self-host Three.js + cache policy

| # | Change | Detail |
|---|--------|--------|
| 3.1 | Vendor `three.min.js` r128 at `assets/vendor/three-r128.min.js` (byte-identical to the cdnjs file; verify against the existing SRI hash) | update `coin3d.js:15` to the local path; drop `integrity`/`crossOrigin` (same-origin) |
| 3.2 | `vercel.json`: fonts + vendor → `public, max-age=31536000, immutable` | version-pinned / never-edited-in-place files |
| 3.3 | `vercel.json`: root JS (`coin3d.js`, `gwnav.js`, `demo.js`) → `public, max-age=3600, stale-while-revalidate=86400` | repeat views within the one-hour freshness window skip revalidation entirely (and SWR hides the revalidation after it); updates still propagate within an hour |
| 3.4 | Optionally drop `https://cdnjs.cloudflare.com` from the CSP `script-src` once 3.1 ships | tightens security as a side effect |

### Phase 4 — Measure, then optional extras

- Verify headers in production with a negotiated GET that discards the body —
  `curl -s -o /dev/null -D - -H 'Accept-Encoding: br, gzip' <url>` — and assert both the
  cache rules and `Content-Encoding` + `Vary: Accept-Encoding` (a bare `curl -I` doesn't
  exercise compression negotiation).
- Lighthouse / WebPageTest before-after on `index.html`, one trade landing page, and `pricing.html`.
- Optional, only if measurement says the hero crest is the LCP element on coin subpages:
  add `<link rel="preload" as="image" href="assets/knot-copper.webp">` there.

## Expected impact

- **Every page, first visit:** one render-blocking request removed from the critical path;
  favicon drops from 52 KB to 4 KB; mono font swaps in with the other two instead of late.
- **Every page, repeat visit:** scripts skip revalidation round trips within their
  one-hour freshness window (SWR hides the refresh after it); fonts served from cache
  for a year.
- **Coin pages (~20 of 26):** third-party origin (DNS + TLS + cold connection) eliminated —
  Three.js rides the warm same-origin HTTP/2 connection instead.
- **Social shares:** og-card is 39 KB lighter, pixel-identical.
- **`DOMContentLoaded`** — the event the entire site boots on — no longer gated behind
  synchronous script fetches.

## Explicitly rejected (quality guard)

- **Resizing/re-encoding `knot-copper.webp`** — measured, then rejected. The crest
  renders at up to 780 CSS px (`web.html`), i.e. 1560 device px at 2× DPR, so 1440 px is
  *not* oversized; and a safe re-encode (libwebp q90, method 6) achieved only ~16 KB —
  alpha-premultiplied PSNR 41 dB is good, but not "no quality sacrifice" for 16 KB.
- **HTML minification** — the hand-authored, commented HTML is the working source of this
  repo, and brotli already compresses it ~4–5×. Not worth the readability loss.
- **Lossy recompression of project JPGs / og-card** — visible-quality risk for marginal,
  lazy-loaded bytes.
- **Removing or simplifying animations** — they are the product. All motion already
  honors `prefers-reduced-motion` and pauses off-screen (`coin3d.js:266–270`).
- **`font-display: optional` or async font tricks** — invisible-then-flash text is a
  quality regression; `swap` + preloads is the right trade.

## Verification checklist (run after each phase)

1. `grep` audit: no `fonts.css` links remain; every `script src` has `defer`; preloads present on all 26 pages.
2. Serve locally (`python3 -m http.server`) and eyeball: homepage coin toss, subpage hero crests, nav overlay, ticker — identical.
3. Decoded-pixel diff for the lossless recompressions.
4. After deploy: `curl -s -o /dev/null -D - -H 'Accept-Encoding: br, gzip'` against the font, JS, and vendor URLs — confirm cache headers plus `Content-Encoding` and `Vary: Accept-Encoding`; confirm cdnjs no longer appears in any waterfall.
