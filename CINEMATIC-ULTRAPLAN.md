# CINEMATIC ULTRAPLAN — The Coin, Hyper-Real, on a Diet

**Date:** 2026-07-13 · **Scope:** homepage (index.html) visual rewrite around the coin, produced with Google Flow / Google Labs tools. **The copy is frozen** — every headline, subhead, CTA, and label ships exactly as it reads today.
**Provenance:** 21-agent workflow — 6 live web-research agents (Flow/Veo state, Labs imaging stack, front-end delivery tech, shipped case studies, coin-pipeline costing, licensing/production) → research chief digest (16 hard constraints) → 5 competing concepts → 3-judge panel (brand guardian / awwwards CD / staff engineer) → 2 adversarial refuters per finalist (technical + brand/copy), every claim checked against this repo's actual files. **All 6 refuter verdicts survived; their 20 fatal flaws and 54 corrections are already folded into the concepts below** — this is the post-verification version. Key repo facts (25 pages load coin3d.js; CSP blocks blob workers; three.min.js is ~146KB on the wire) were independently re-verified before writing.
**Rule of precedence:** where anything here conflicts with the raw workflow output, §5 (shared doctrine) and the concept specs in §6–§8 govern.

---

## 0 · TL;DR

Today the coin is a *simulation*: 592KB of three.js (≈146KB gzipped, **preloaded in `<head>` where it competes with the fonts**), 16KB of coin3d.js, ~117KB of textures fetched early, a live WebGL context, ~500ms of idle canvas texture generation the code's own comments flag as "landing right on LCP," and a 2021-era realtime shading model that can never look like metal.

The rewrite makes the coin a *photograph*: one brand-exact, hyper-real struck-copper master built with **Nano Banana Pro** (Gemini 3 Pro Image) from the **owned hound-knot art**, turned into a deterministic Blender/Cycles frame set and a handful of graded **Veo 3.1** clips via **Flow** — delivered as 10-bit AVIF frames scrubbed on a canvas, screen-blended video where fire needs to live, and a static poster everywhere else. Critical path drops from ~300KB+ of early coin payload to **~40KB (poster + ~5KB JS)**; the GPU does nothing at rest; and the words — which never move for the coin — stay the brightest thing on every screen.

Three concepts survived the judges and the refuters, ranked:

1. **THE MINT (104 pts)** — the scroll journey *is* the making of the coin: raw molten stock → the cast lands at the exact scroll offset where **AUTOMATIC EXECUTION** reaches full opacity → the finished coin rests, still warm, behind the finale audit. The signature Site-of-the-Day moment; the most Veo generation risk.
2. **THE STRIKE (95 pts)** — the surgical swap: keep the beloved scroll engine byte-for-byte, replace only the renderer with the photoreal turntable + one living-fire finale loop. Biggest engineering certainty, biggest deletion, least new risk.
3. **LEDGER OF LIGHT (94 pts)** — one immutable coin examined under six lighting states as you scroll ("the light moves for the words"). The restraint concept: fewest assets, most photographic, mobile wins outright.

**Panel-recommended build:** ship THE STRIKE's chassis first (it is Phase 1 of all three concepts), then graft THE MINT's cast-moment onto it. LEDGER's relight stills are the sanctioned fallback if the Veo transitions miss their reference gate. §9 sequences it.

**Two hard gates before any pixel ships (§5.9, §5.10):** all shipped video must come from **Ultra-tier Flow or the Vertex API** (Free/Plus/**Pro** tiers stamp an intermittent visible "made with Veo" mark that is hardest to see on exactly our dark footage), and every dark encode must pass the **10-bit + grain + OLED QA** anti-banding pipeline — 8-bit near-black gradients banding on OLED is this brand's #1 visual failure mode.

---

## 1 · Ground Truth — what the coin costs today (verified in this repo)

| Item | Disk | Wire (gzip) | When it loads |
|---|---|---|---|
| assets/three.min.js | 592KB (603,445B) | **~146KB** | `<link rel="preload">` at index.html:27 — head-of-line, competes with 3 font preloads |
| coin3d.js | 16KB (15,421B) | ~5.4KB | `defer`, injects three.min.js async |
| assets/knot-copper.webp | 117KB | 117KB | fetched early by coin3d.js (its comment documents a measured ~470ms head start) |
| knot-solid.webp / knot-etch.png / knot-copper-bg.webp | 17 + 30.5 + 52.8KB | same | CSS masks, fallback layers, flip chips — **all stay regardless of concept** |

Plus the non-byte costs: one persistent WebGL context; ~500ms idle-time canvas texture generation; parse/eval of 592KB of JS; a rAF render loop whenever the coin is visible (the engine *does* idle-gate itself ~1.6s after input and pauses hidden coins — the repo's perf religion is real, and this plan doesn't strawman it).

**Honest framing (refuter-corrected):** nothing in today's stack "blocks render" — coin3d.js is deferred and three.js loads async. The real wins available are: kill the ~146KB preload's bandwidth contention against the fonts, kill the early 117KB texture fetch, kill the parse/GPU/idle-generation costs, and raise photorealism past what r128 realtime shading can do. Every byte claim in this document is **wire bytes**, not disk bytes.

**Sitewide dependency (merge-blocker for every concept):** `coin3d.js` is loaded by **25 pages** (about, pricing, voice, work, contact, faq, install, software, web, automations, 404, thanks, gaelic-named-business, sales-teams, all 11 ai-receptionist-\*), and `knot-copper.webp` appears directly in the markup of sales-teams.html, ai-receptionist-roofing.html, and ai-receptionist-solar.html. **No file is deleted from the repo.** index.html simply stops referencing them; the replacement script ships a `[data-coin3d]` poster-mode auto-mount so the other 24 pages migrate in the same commit without a 404 or a silent downgrade. Reclaiming the bytes sitewide is a Phase-2 chore, not part of this plan's ledger.

**The coin's journey today** (all preserved as choreography slots): hero right side at min(62vw, 800px) with the live counter-rotating SVG "NON SINE PERICULO" ring → fades out over the first viewport of scroll → static knot in the story stack's Enemy-frame slot (170–240px desktop, 120–170px mobile) → tiny flip chips through Process/Arsenal/Work/Why → full-bleed coin behind the finale audit.

---

## 2 · Tool Reality — what Google's stack actually does (verified July 2026)

The research phase's most important finding: **the tool landscape moved under everyone's feet this spring.**

| Tool | Status / what we use it for |
|---|---|
| **Flow** (flow.google, relaunched Feb 25 2026) | The production studio. Absorbed Whisk + ImageFX. Ingredients-to-Video (multi-reference-image object consistency), Frames-to-Video (first+last frame → engineered loops), Extend (+7s/pass, 720p only), insert/remove, lasso region edits, camera presets, Scenebuilder, free Nano Banana image gen at 0 credits. No seed control in the UI (API only). |
| **Veo 3.1** (Lite/Fast/Quality) | Current flagship video model — there is no Veo 4. 4/6/8s clips @24fps, 720/1080p native (Quality = 8s only), free 1080p upscale on paid tiers, 4K upscale Ultra-only. Jan 13 2026 update explicitly improved object/texture reuse across scenes. **No alpha output exists anywhere** — Flow, Gemini API, or Vertex. Mangles fine engraved lettering. Loves to move a "locked" camera. |
| **Nano Banana Pro** (Gemini 3 Pro Image) | The still-master factory: native 1K/2K + 4K upscale, **16-bit color pipeline that measurably reduces dark-gradient banding**, best-in-class text rendering, relighting, blends up to 14 reference images. Weakness: pose drift between separate generations; curved rim micro-text is still the hardest text case. |
| **Nano Banana 2** (Gemini 3.1 Flash Image) | Flow's default image model at 0 credits; ~4× faster, ~half the price; grids/batches. "Consistency" = resemblance, **not pixel identity** — knot interlace topology drifts between generations. |
| **Whisk / ImageFX / Whisk Animate** | **Dead** (April 30 2026; undownloaded work permanently deleted). Every pipeline step below targets Flow + Gemini image models instead. |
| **Imagen 4 API** | Hard shutdown Aug 17 2026 — do not build on it. |
| **Gemini API / Vertex AI** | `veo-3.1-generate-001` is GA → covered by Google's two-way IP indemnity; uint32 seed for reproducibility; **no visible watermark**; $0.40/s (720/1080p), Fast ~$0.15/s. The Lite model is Preview = not indemnified. |
| **Flow TV** (labs.google/flow/tv) | Free showcase where every clip exposes its exact prompt — use as the prompt-technique library during production. |

**Flow credits (official):** Free 50/day · Pro ($19.99) 1,000/mo · Ultra $100 → 10,000 · Ultra $200 → 25,000. Veo Quality = 100 credits per 8s take; expect **5–25 takes per keeper** (Kalshi's documented pipeline: 300–400 generations → 15 usable clips). Pro's 1,000 credits = 10 Quality takes/month — *not* a production budget. **Watermark rule: Free/Plus/Pro video carries an intermittent visible "made with Veo" mark — hardest to see on dark footage, so a Pro-tier coin clip can look clean and not be. All shipped video comes from Ultra-in-Flow or Vertex. Invisible SynthID is on everything, every tier, unremovable — assets are permanently machine-identifiable as AI-generated (fine; see §5.11 disclosure note).**

### The 16 hard constraints every concept below respects

1. **No alpha video from Veo** — compositing strategy (generate-on-black + screen blend / stacked-alpha / dual-encode) is chosen *before* generating, because it dictates the prompted background.
2. **AI-rendered text is forbidden.** "NON SINE PERICULO" and all wordmarks stay live SVG/DOM; the coin is generated with a **blank worn rim**. A generated frame implying different wording violates the frozen-copy rule as surely as editing a headline.
3. Copy frozen; type stays HTML/SVG (also the SEO/accessibility answer).
4. Visible watermark on Free/Plus/Pro video → Ultra or Vertex only for shipped clips.
5. SynthID invisible watermark on everything (accepted; not fought).
6. Whisk/ImageFX dead, Imagen 4 dying → pipeline pinned to Flow + `gemini-3-pro-image` / `gemini-3.1-flash-image` + `veo-3.1-generate-001`.
7. 8-bit encodes band on #0B0A09 → the §5.9 anti-banding pipeline is mandatory, and the darkest gradients stay live CSS (never pass through a codec).
8. iOS Safari memory: ~384MB canvas budget; decoded RGBA = w×h×4/frame → sliding `createImageBitmap` window (10–30 frames) in a worker, mobile ≤36 frames ≤420px, desktop/mobile sets never co-resident.
9. `prefers-reduced-motion` collapses everything to the static hyper-real poster — designed *first*, because it is also the LCP, no-JS, Save-Data, Low-Power-Mode, and social-card asset.
10. LCP: preload the AVIF **poster** with `fetchpriority=high` (preloading video files does nothing in Chrome); never preload a frame sequence in `<head>`; reserve boxes with `aspect-ratio` (CLS = 0).
11. Veo 3.1 hard specs: 8s max Quality; extensions 720p-only; no UI seed; credits don't roll over.
12. AV1 has no alpha; animated-AVIF alpha is broken in Safari; HEVC-alpha needs macOS tooling. (Static AVIF alpha is fine — that's what the frames use.)
13. CSS scroll-driven animations: Firefox stable still flag-only → every `animation-timeline` use gets an `@supports` gate with the existing JS engine as fallback.
14. Every byte plan is judged against the honest §1 baseline, in wire bytes.
15. Raw AI output has no US copyright; Vertex indemnity excludes trademark claims → the protectable brand core stays human-authored (knot SVG, rim ring, type, grades, code); the owned knot art is the *ingredient* fed to every generation.
16. Never present AI imagery as real crews, job sites, or results (FTC §5) — the decorative coin is safe; fake "authentic" trade photos are not. (This is why no concept generates people.)

---

## 3 · Delivery Techniques — how hyper-real actually ships on a near-black page

Ranked by photorealism-per-byte for this palette (full digest archived with the workflow):

1. **Hyper-real still + CSS/SVG fakery** — 2 AVIF stills + mask ≈ 80–150KB, zero JS. CSS 3D flip, conic-gradient specular sweep masked to the coin, the existing ember/fire layers screen-blended in the bore, the live rim ring on top. *This is the mandatory floor of every concept — it IS the reduced-motion/no-JS/LCP/Low-Power state.*
2. **AVIF turntable frames, canvas-scrubbed** (the Apple AirPods / Adaline pattern; Zajno publicly migrated *to* this from video scrubbing) — 36–48 frames @640–960px ≈ 0.4–1.6MB desktop, 150–400KB mobile; 10-bit AVIF holds near-black without temporal shimmer; decode in a worker behind a sliding window. *The hero mechanism.*
3. **Generate-on-black + `mix-blend-mode: screen`** — fake alpha for fire/embers/glow at zero extra cost: additive light, black vanishes, and the page's own gradient never passes through a codec so it *cannot* band. Caveat: it's additive-only — dark coin bodies go ghostly (design for it or don't use it for solids). *The finale-fire mechanism.*
4. **Stacked-alpha video + ~1KB shader** (460KB AV1 + HEVC fallback benchmark) — only if a true cutout must float over non-black UI. None of the three concepts needs it at launch.
5. **Plain autoplay loop + poster-first LCP** — for the finale bleed; 10-bit encode, poster preloaded, `preload=none` + IntersectionObserver below the fold.
6. **`<video>.currentTime` scrubbing — the trap.** All-intra encodes are ~5× the bytes and still jank on iOS. Not used anywhere in this plan.
7. **Micro-WebGL (OGL, 8KB) + baked GLB** — only if live pointer-interactive 3D ever becomes a requirement; three.js and `<model-viewer>` stay dead either way.

---

## 4 · The Judged Field

Five concepts competed; three judges scored brand / wow / feasibility / copy-fit (max 120):

| Rank | Concept | Total | One-line verdict |
|---|---|---|---|
| **1** | **THE MINT** — origin film; scroll strikes the coin | **104** | "The only concept with a true SOTD signature: copy as hammer." (CD) |
| **2** | **THE STRIKE** — surgical renderer swap | **95** | "The staff-engineer plan; the only one that noticed the 25-page dependency." (Eng) |
| **3** | **LEDGER OF LIGHT** — one coin, six lights | **94** | "The connoisseur's concept; the most honest budget in the set." (Eng) |
| 4 | NON SINE PERICULO — homepage as title sequence | 91 | Strongest organizing frame, heaviest full-bleed byte risk; its film-burn crossfade was grafted into the winners. |
| 5 | COIN IN THE WORLD — documentary coin in the trades | 82 | Freshest idea, hardest collision with the no-fake-authenticity doctrine; its one great frame (the 2PM dashboard) was grafted as an optional exhibit still. |

The panel's cross-concept grafts became shared doctrine (§5). The refuters then attacked the top 3; all survived with corrections — **already applied** in §6–§8.

---

## 5 · Shared Doctrine — the chassis all three concepts ride on

Everything in this section ships regardless of which concept is chosen. It *is* Phase 1.

### 5.1 · The coin master pipeline (deterministic core, AI skin)

The knot must never drift — so **AI never draws the knot per-frame**:

1. **Master still:** Nano Banana Pro (`gemini-3-pro-image`, pinned, Vertex regen for the archive), fed the owned knot art as ingredient images. Prompt skeleton: *"Macro product photograph of a hand-struck copper coin. Deep-relief Celtic hound knot exactly matching the reference art. Worn BLANK rim band, no lettering, no text anywhere. Center bore with faint warm inner-edge glow. Ember-warm key light upper-left, soft rim light, deep charcoal background — not pure black. Subtle 35mm film grain. 4K."* Reject-against-reference until the knot topology matches. This is the material bible, not a shipped asset.
2. **Geometry:** a Blender lathe of the coin profile. The crossing relief comes from a **hand-authored height map built once from the owned SVG** — per-strand depth offsets at each over/under crossing (a few hours, done forever, fully human-authored IP). *Refuter-killed shortcuts, do not resurrect:* a flat silhouette displacement can't encode the interlace, and "photometric stereo from NB Pro relights" is built on NB's documented pose-drift failure mode. NB Pro output is used for **albedo/wear reference only**; delight/projection in Blender is an artist task (half-day to a day), which also strengthens the human-authorship IP position.
3. **Render:** Cycles, **face-on camera, coin rotating about the view axis** (in-plane, matching the brand's canonical `gwSpinRev` motion) under a locked HDRI + key light so the glint physically travels the knot. **Never a Y-axis turntable** — edge-on sliver frames would orbit the fixed SVG rim ring with empty space and break the composite for ~25% of the scrub. `film_transparent = True` → **alpha AVIF frames** (static AVIF alpha is universally supported; only *animated* AVIF alpha is broken) — an opaque charcoal plate on the hero's *radial* gradient would read as a rectangle, and worse during any flight. Contact shadow becomes a CSS drop-shadow layer.
4. **Encode:** render 1280px, supersample down; `avifenc -d 10` (10-bit). Encode a **5-frame test before committing budgets** — baked grain is anti-compression; if frames land above ~20KB, ship denoised frames and add grain as a live CSS overlay clipped to the coin instead.
5. **Reverse face:** same rig, one NB Pro still seeded from knot-etch.png lineage, same grade.

### 5.2 · Motion doctrine (the refuters' biggest kill)

Frame sequences **cannot** reproduce today's continuous 150s/rev idle spin — 48 frames at that pace is one visible 7.5° snap every 3.1s, a strobe sitting under a silky CSS-rotating rim ring. So:

- **At idle, the coin holds the struck 3/4 pose** — static frame + masked conic specular sweep + the live ember/fire CSS layers + the counter-rotating ring. A struck coin at rest is *better* mythology for FORGED ONCE than a perpetual spin.
- **Frames are spent on scroll**, where scrub motion masks stepping, mapped into the **first ~35–40% of `heroP`** while the coin is still ≥85% opaque (the engine fades it with the same variable — scrubbing a ghost is oversold).
- Any optional slow drift uses a **two-layer crossfade blit** (~500ms) between adjacent frames, and pauses under the engine's existing 1.6s idle gate.

### 5.3 · The words always win (LEDGER's law, adopted globally)

Hard QA gate on every beat: **parchment #EDE6D6 type carries more luminance than any generated pixel inside the text safe area.** Flashes are localized to the coin region, luminance-capped, ≤250ms (WCAG 2.3.1), and dead under reduced-motion. The finale's existing legibility scrim stays exactly where it is.

### 5.4 · Integration invariants (index.html)

- **Delete** the three.min.js preload (line 27) and the `<gw-coin-3d>` element (line 219); swap `coin3d.js` → the new `coinspin.js` (line 614). The hero scroll driver's `isLive`/`paused` bridge (~lines 943–949, 1040) rewires to `GWCoin.ready` / `GWCoin.pause()` — index.html never called `setFlip`.
- **The poster gets its own always-visible wrapper.** `[data-coin]` ships `opacity:0` and the reduced-motion path sets `display:none` — as-is, the poster would be LCP-ineligible and invisible without JS. The container's fade moves to the canvas/ring layers only; the reduced-motion branch keeps the poster and hides only motion layers. Then field-verify what actually wins LCP (today it's almost certainly the H1 — freeing ~146KB of preload bandwidth speeds the fonts that H1 depends on; the poster must be listed *after* grenze-gotisch.woff2 in preload order. The headline is the conversion surface; it paints first).
- **CSP:** vercel.json's `script-src 'self' 'unsafe-inline'` (no `worker-src`, no `blob:`) **blocks the inline-Blob worker pattern** — the decoder worker ships as a separate same-origin file (`coinspin-worker.js`).
- **Codec source order by capability, not superstition:** `<source type='video/mp4; codecs="av01..."'>` first, HEVC (`hvc1`) second — Safari without AV1 hardware skips via canPlayType, iPhone 15 Pro+/M3+ take AV1, everyone else falls to HEVC. (The digest's "HEVC first" rule is for dual-encode *alpha* video only, which nothing here ships.)
- **One global decoded-byte ceiling** (e.g. 64MB) asserted in `coinspin.js` across *all* frame sets — hero window evicts while story sets are active. The window sizes and the 384px mobile cap are code-commented invariants, not tuning knobs.
- **`[data-coin3d]` poster-mode auto-mount** preserved so all 25 pages migrate in the same commit (§1).
- **Fallback ladder** (every concept, every rung ends at the same poster): reduced-motion → poster only, zero motion bytes fetched · Save-Data → poster + CSS sweep · no-JS → poster `<picture>` + existing CSS coin layers + CSS-spinning rim ring · no-AVIF (Safari < 16.4, ~1–2%) → WebP poster via `<picture>`, an async 1px-AVIF decode probe gates the worker (no WebP frame set — not worth the bytes) · iOS Low Power Mode → poster is the designed final state · Firefox → the site's own JS engine drives everything identically.

### 5.5 · The film-burn splice (grafted from NON SINE PERICULO)

A 0-byte, ~400ms ember-colored CSS radial wipe hides every grade seam — Cycles-to-Veo handoffs, canvas-to-still dissolves, finale loop entry. The title-designer's trick, free, everywhere.

### 5.6 · The bore-fire finale (grafted from LEDGER into all three)

The staff engineer's favorite trade: instead of a full-bleed 1.6–2.2MB coin *video* (whose screen-blend would ghost the coin body anyway — additive blending can't render darker than the page), the finale ships a **1024px 10-bit AVIF blow-up still of the master (~80KB)** with an **8s Veo living-fire loop cropped to the bore (512×512, ~250KB AV1 / ~450KB HEVC)** screen-blended inside it. Identical living-fire payoff; the coin body (the drift/banding risk zone) stays a still; the loop seam hides inside the bore glow; iOS Low Power Mode rests on the existing CSS fire. THE MINT may optionally upgrade this to the full-bleed loop later — as an A/B, not a launch default.

### 5.7 · Veo prompt doctrine

Preservation clause **before** motion in every prompt (*"Preserve the exact coin geometry, copper color, Celtic hound-knot relief, center bore. Locked static camera, no camera movement."*), identical coin wording across all shots, `negativePrompt: "text, lettering, numbers, hands, camera motion, zoom"` via API, **deep charcoal backgrounds — never pure black** (Veo drifts more and H.264 crushes in pure black; true blacks are crushed later in the grade, one consistent doctrine for every clip). Both endpoint frames of any Frames-to-Video pass through an NB Pro regrade first so Veo never has to bridge CG-sheen → photo-grain mid-clip. Reject-against-reference on every take, style-match on the checklist.

### 5.8 · What is *not* in any concept (refuter-killed, stays dead)

- **Rising-embers hero atmosphere video** — the single most recognizable AI-video slop trope of 2025-26, duplicating atmosphere the page already renders live and band-free ([data-heat], gwPulseHero, CSS embers). Parked as a post-launch A/B at most.
- 12%-opacity multiply-blended process stills (mathematically invisible over #0B0A09 — bytes for pixels nobody can see).
- "Fingerprint smudge" prompts and other over-specified authenticity garnish (reads as a handling defect to people who judge work by surface finish, and flags the image as generated).
- Any deletion of knot-etch.png (10 references in index.html + the schema.org logo) or knot-copper.webp (3 other pages).

### 5.9 · The anti-banding pipeline (make-or-break gate)

Prompt lifted shadows → download highest-res master → **10-bit ProRes 422 HQ mezzanine immediately** (never re-edit the delivered MP4) → **one LUT across all clips and stills** (grade drift between adjacent clips is the #1 audience-visible tell), blacks matched numerically to the page's CSS values → 1–2% fine grain pre-encode → SVT-AV1 10-bit (film-grain-synthesis **masked/zeroed in the black surround** for screen-blended clips — decoder-side grain would lift the crushed blacks into a faint shimmering rectangle; verify surround decodes to exactly 0 with a histogram) + HEVC 10-bit fallback → **QA on an OLED phone, dark room, max brightness.** For stills: `avifenc -d 10`; 4K-generate-then-downsample supersamples banding away.

### 5.10 · Procurement, cost, archive

Iterate in **Flow on Ultra** ($100–250/mo), regenerate the ~10–30 winning finals on **Vertex `veo-3.1-generate-001`** (GA = indemnified, seeded, watermark-free) with logged parameters. Realistic total for any of the three concepts: **$550–1,300** and 2–4 working days of generation (5–25 takes/keeper; Quality = 100 credits/take). Every asset gets a JSON sidecar (model ID+version, prompt, negative, ref hashes, seed, tier, cost, date, takes) + untouched delivery + mezzanine, git-tracked; prompts exported from Flow same-day (the Whisk shutdown deleted everyone's undownloaded work — lesson learned on someone else's corpse). The mezzanine, not the prompt, is the canonical asset; a future refresh is a re-shoot, not a re-roll.

### 5.11 · Legal posture

Consumer-tier output: commercial use permitted, no indemnity. Vertex GA models: two-way IP indemnity (never covers trademark — clear the coin against existing coin/crypto marks once). No US copyright in raw generations → the protectable core stays the human layers (knot SVG, rim ring, type, grades, code), which every pipeline above deliberately routes through. Decorative brand fantasy carries no EU AI Act / FTC disclosure duty on the ordinary reading; still, one optional colophon line — *"Brand visuals forged with Google Veo + human grading"* — is free trust-building for an AI agency and on-message. No generated people, ever (§2, constraint 16).

---

## 6 · CONCEPT 1 — THE MINT *(judges: 104/120 — the signature)*

> **Logline:** The visitor's scroll wheel is the coining press: raw molten copper that has never borne the knot is cast into the finished coin at the exact instant the words **AUTOMATIC EXECUTION** land — and the coin rests, still warm, behind the finale audit.

**Why on-brand:** the site's whole mythology is FORGED ONCE. SHARPENED FOREVER. — but today the coin just spins; it has no origin. THE MINT makes the frozen copy literal: "The Enemy, Named" is the raw, unstruck state; "Four Branches · One Forge → AUTOMATIC EXECUTION" is the casting; "FROM BOTTLENECK TO CAST." becomes the caption of what the visitor just watched; the finale THE CAST is the coin at rest. Molten copper physically *is* the palette — no off-palette pixel can exist in a melt.

**The two brand rules that shape it (refuter-forced, now core to the concept):**
- **The hero coin is never destroyed.** The unmade state is an *anonymous raw copper blank / molten stock* that has never borne the hound knot. The knot exists only from the cast onward — the brand's permanence promise is never visually revoked, and reverse-scrolling can't "un-forge" the brand.
- **The cast one-way latches.** After the metal fills the die and the coin is revealed, scrolling back up never un-makes it. Forged once means once.
- **CAST, not strike.** The frozen header says *FROM BOTTLENECK TO CAST* — so the money shot is staged as **molten metal filling a die/mold that lifts to reveal the cast coin** (pour → cast → quench → hone ordering everywhere), satisfying both the forge language and the copy.

### Beat map (copy untouched everywhere)

| Beat | What the visitor sees |
|---|---|
| **Hero** | The finished coin (§5.1 master, struck 3/4 pose) at min(62vw,800px), live rim ring + CSS bore-fire on top; scroll turns it through the first 40% of the pin (§5.2). FORGED ONCE beside an object that looks actually forged. |
| **Story: The Enemy, Named** | The coin slot holds **M2**: raw molten stock, scrubbed by the frame's own crossfade progress — restless, formless copper under the 2PM-call copy. The enemy is the unmade state, not the coin. *(Optional graft: one regraded night-cab dashboard still as a second exhibit — §4, COIN-IN-THE-WORLD's one great frame.)* |
| **Story: AUTOMATIC EXECUTION** | **M3**: the die descends over the molten blank; at the exact scroll offset where the gradient headline reaches full opacity, the cast lands — a **spark bloom localized to the slot** (≤250ms, luminance-capped, dead under reduced-motion), the die lifts, the finished hound-knot coin sits in the slot with the live ring igniting around it. The words fire the die. **State latches.** |
| **Story: Clan / Crafts** | The cast coin rests in the slot (hero frames reused, 0 extra bytes), cooling ember→copper via a CSS filter keyed to scroll. |
| **Process** | Still section, deliberately — "FROM BOTTLENECK TO CAST." reads as the caption of what just happened. Existing knot chips unchanged. *(The 12%-multiply background stills were killed in verification — the chips carry the beat.)* |
| **Arsenal** | No coin, no media. Ghost numerals get the masked conic specular sweep (`@supports`-gated CSS, JS fallback). Its absence keeps the cast special. |
| **Work** | Untouched + a 2KB inline SVG hound-knot "mint mark" stamped after each platform name — shipped products are struck coins. |
| **Why** | The molten fill line now pays off the mythology (same gradient stops as the pour). Each oath seals with a 6-frame spark micro-flash (asset reuse from M3, slot-localized, screen-blended). |
| **Finale** | §5.6 bore-fire finale: the cast coin colossal behind the audit, living Veo fire breathing in its bore. THE CAST, at rest, still warm. |

### Asset manifest

| ID | Tool | Recipe | Delivery | Wire est. |
|---|---|---|---|---|
| M0 master | NB Pro → Vertex regen | §5.1 master (front + reverse) | archived, not shipped | 0 |
| M1 hero frames | Blender/Cycles + avifenc | §5.1/§5.3 in-plane set, 48f @960px desktop (the coin renders up to ~1600 device px on retina — 640px sources would ship the centerpiece soft; 16-frame window ≈ 59MB decoded, safe) / 32f @384px mobile | alpha AVIF, lazy post-LCP, worker-windowed | ~1.3MB desktop · ~200KB mobile |
| M2 melt | Flow F2V → Vertex finals | first frame = NB blank-stock still, last = molten pool; forward melt (*no ffmpeg reverse — that was a spec bug*); both endpoints NB-regraded (§5.7); a melting blank has no topology to violate | 24f @480px desktop / @340px mobile (slot clamps to 120–170px on phones) alpha AVIF | ~220KB / ~120KB |
| M3 cast | Flow F2V → Vertex finals | first = molten pool, last = Cycles frame 0 (NB-regraded); die-fills-and-lifts staging; 15–25 Quality takes — this is the money shot; film-burn wipe (§5.5) sanctioned to hide the reveal splice if frame-match misses | 16f @480px + 6-frame spark flipbook | ~150KB + ~35KB |
| M4 finale | §5.6 | finale still + bore-fire loop | AVIF still + AV1/HEVC loop, IO-loaded | ~80KB + ~250–450KB |
| M5 poster | avifenc from M1 frame 0 | §5.4 wrapper; + og-card composite | AVIF+WebP `<picture>`, preloaded | ~35KB |
| M6 coinspin.js + worker | hand-written | §5.4 invariants; latch logic; **honest budget 10–15KB source (~4–6KB gz)** — it orchestrates more than coin3d.js did | 2 files (CSP) | ~5KB gz |

### Honest ledger

Early-path coin payload: **~268KB wire removed** (146KB three.js gz preload + 5.4KB coin3d gz + 117KB early texture) → **~40KB added** (poster + JS). Fully-engaged desktop total: ~2.0MB of media, ~98% idle/lazy-loaded, cache-immutable, zero JS library, zero live GPU at rest; a visitor who never leaves the hero downloads ~1.3MB less than today. Mobile fully-engaged: ~700KB, decoded canvas memory ≤14MB. CWV: contention-free fonts (H1 LCP faster), INP wins from no persistent WebGL/rAF and worker-side decode, CLS 0 via reserved boxes.

### Risks (post-verification residue)

1. **M3's reveal frame** must match the Cycles knot — reject-against-reference + film-burn splice as the sanctioned concealer; budget 2,500+ credits for this shot alone.
2. Veo camera drift → 30–50% reject rate priced into §5.10.
3. The latch + dual-driver scrub is the most stateful JS of the three concepts — it is why THE MINT scored 6–7 on feasibility while winning everything else.
4. Screen-blend additivity on the finale still means the coin body must be graded above page-black in the LUT (decided in the grade, not discovered after 25 takes).

**Wow moment:** sparks frozen mid-burst around locked Grenze Gotisch type at the exact frame AUTOMATIC EXECUTION lands — the visitor's scroll minted the coin, and the headline was the hammer. That frame is the screenshot.

---

## 7 · CONCEPT 2 — THE STRIKE *(judges: 95/120 — the sure thing)*

> **Logline:** Melt down the 592KB engine that fakes a coin and mint the coin itself — a photoreal struck-copper object that answers the visitor's thumb frame-for-frame, lands in the story slot as the same physical object, and returns colossal at the finale with living fire in its bore — on a ~40KB critical path.

**Why on-brand:** today's coin contradicts the motto — a simulation re-rendering the coin on every visitor's GPU. THE STRIKE makes the coin what the brand says it is: **struck once** (48 immutable frames, minted offline — master + Blender die + one grade pass), **sharpened forever** (every runtime byte serves; nothing burns at rest). It is also the agency's own case study rendered in metal: replace grinding always-on work with a system built once that executes automatically. AUTOMATIC EXECUTION, demonstrated — *on itself*.

**Scope discipline:** the scroll engine, layout, and copy are never touched. This is a renderer swap plus exactly two cinematic accents (the slot flight, the finale fire) — the smallest diff, the biggest deletion, and the chassis the other two concepts assume.

### Beat map

| Beat | What the visitor sees |
|---|---|
| **Hero** | §5.1/§5.2 photoreal coin: poster paints instantly (own wrapper, §5.4), canvas takes over silently; scroll scrubs up to +120° mapped into the first ~40% of `heroP`; at rest the coin holds the struck pose with the specular sweep — every stop-point is a product photograph. Live ring + CSS bore-fire on top. *(The Veo ember-atmosphere loop was cut in verification — §5.8.)* |
| **Story: The Enemy, Named** | The coin doesn't fade — it **flies** (the existing `approach()` smoothing + the three dormant `[data-trail]` ember dots at index.html:182–184) and lands in the slot, scrubbing its angle along the flight so it arrives frame-matched. Flight completes inside the frame's 0.24 fade-in window (<600ms of motion), trails extinguish, then the coin holds **dead still** while the three paragraphs are read — motion never loops during the Enemy copy. Alpha frames make the flight seamless across both gradients. |
| **Story: AUTOMATIC EXECUTION** | The small flip chip upgrades to hyper-real front/reverse stills inside the existing `gwFlip` CSS animation, 90° edge hidden by a gold glow flash. |
| **Process / Arsenal / Work / Why** | Untouched. Zero new bytes. The restraint *is* the concept — it buys the finale. |
| **Finale** | §5.6 bore-fire finale behind the audit; existing scrim, wordmark, sign-off sovereign above it. |

### Asset manifest

| ID | Tool | Recipe | Delivery | Wire est. |
|---|---|---|---|---|
| S0 masters (F+R) | NB Pro → Vertex | §5.1 | archived | 0 |
| S1 frames | Blender/Cycles | §5.1 in-plane spin, 48f @960px desktop / 24f @384px mobile, alpha AVIF (5-frame encode test first) | lazy post-idle, worker-windowed | ~1.2–1.4MB / ~140KB |
| S2 poster | frame 0 | §5.4 wrapper, AVIF+WebP | preloaded `fetchpriority=high` after fonts | ~35KB |
| S3 reverse still | NB Pro | flip chip + og-card | AVIF | ~28KB |
| S4 finale | §5.6 | finale still + bore fire loop | AVIF + AV1/HEVC | ~80KB + ~250–450KB |
| S5 coinspin.js + worker | hand-written | §5.4 invariants + flight driver + `[data-coin3d]` shim | 2 files | ~5KB gz |

### Honest ledger

Same ~268KB → ~40KB early-path swap as THE MINT. Fully-engaged desktop total ≈ **1.6–1.8MB** (vs ~320KB wire today — heavier in total transfer, and this plan says so plainly: the trade is photorealism + zero runtime cost + 98% of bytes idle-loaded and immutable-cached). Mobile fully-engaged ≈ **~300KB — lighter than today outright** (the finale keeps the 55–80KB poster + existing CSS fire on phones; the fire loop is desktop-only). Battery: at rest the coin costs literally nothing (no rAF, no decode); the only persistent motion is the CSS ring/fire the page already runs today.

### Risks

1. The flight is the one new choreography — it reuses the engine's own smoothing/trails, but the frame-matched landing needs a real device pass.
2. Frame bytes are the honest unknown until the 5-frame encode test (§5.1.4); the degradation path (denoise + CSS grain, or 36f) is pre-committed.
3. Judged the least *cinematic* of the three — its wow is material realism, not narrative. (That is also why it can't miss.)

**Wow moment:** two slow pixels of scroll and a pause — the coin freezes mid-turn under the visitor's thumb, firelight glint held across the hound knot, live NON SINE PERICULO ring still turning — and every stop-point looks like a $10K macro product photograph that answers frame-for-frame when they scroll to prove it moves.

---

## 8 · CONCEPT 3 — LEDGER OF LIGHT *(judges: 94/120 — the connoisseur's cut)*

> **Logline:** One hyper-real minted coin is examined under six lights as you scroll — ember-lit at the forge, held under hard scrutiny while the copy names the enemy, relit by work light, finally read by banked-coal light at the audit. The coin never changes; only how it is examined. **The light moves for the words.**

**Why on-brand:** one immutable object under changing light is the photographic translation of FORGED ONCE. SHARPENED FOREVER. Macro copper with honest craft marks reads as *work*, not CGI — the exact trust signal for an audience that judges work by surface finish. And its governing law (§5.3: type always outshines the coin) is the most sophisticated answer any concept gave to the frozen-copy rule.

**Pitch honesty (refuter-forced):** the coin physically appears in **three** beats (Hero, Story slot, Finale); States 3–5 are light *behaving* — sweeps and glows with zero new bytes. Own it: *the coin appears three times; the light never stops.* Every sweep traces back to the coin: the existing knot-etch mark is each sweep's origin point.

**Palette/mythology corrections baked in:** the "interrogation" state is a **hard desaturated near-mono key at parchment temperature — zero hue shift** (steel-blue was a palette violation and pointed the indictment at the coin; the copy indicts the missed 2PM call — the coin is the exhibit that *holds* under scrutiny). "Candle light" is renamed and re-prompted as **banked-coal light** (coal, ember, and molten metal are the brand's only light sources). The fingerprint smudge is replaced by **numismatically honest craft marks** — a faint die crack, a planchet flaw, a raised rim burr, recess patina.

### Beat map

| Light state | Beat | What the visitor sees |
|---|---|---|
| 1 · Ember forge light | **Hero** | §5.1/§5.2 coin; the conic specular sweep tracks scroll so highlights physically travel the relief; type luminance law enforced. |
| 2 · Under scrutiny | **Story stack** | The slot crossfades four **NB Pro relights of the same master pixels** — hard mono scrutiny (Enemy) → white-hot forge key (AUTOMATIC EXECUTION) → warm workshop (Clan) → low raking banked-coal (Crafts). All four stills (~50KB) stack as layered `<img>`s preloaded when the pin approaches and crossfade on the section's existing timing — *never* a src swap (decode pop). Alignment QA: difference-blend each relight against the master, re-roll on drift; **zero-risk fallback: one still + four CSS-filter lighting treatments.** |
| 3 · Work light | **Process** | One CSS light sweep runs down the four steps on scroll (`@supports`-gated). No new bytes. |
| 4 · Stamped metal | **Arsenal** | Ghost numerals flare as each slide docks — masked specular gradient keyed to the rail progress the JS already computes; peaks between slides, never behind text. |
| 5 · The pour | **Why** | Oath cards pick up a faint copper rim-glow keyed to the existing molten fill line — the ladder is lit by the metal being poured. Zero bytes. |
| 6 · Banked-coal audit light | **Finale** | §5.6: the master blown up full-bleed at 1024px, living Veo fire in the bore behind the audit. The forge never goes out. |

### Asset manifest

| ID | Tool | Recipe | Delivery | Wire est. |
|---|---|---|---|---|
| L0 master | NB Pro | §5.1 + honest craft marks | 640/384/1024px AVIF stills | ~138KB total, 38KB critical |
| L1 frames | Blender/Cycles | §5.1; **pre-committed trim: 32f @q50** so desktop total lands *under* today's wire weight — the trim is the default, not a contingency | alpha AVIF, lazy | ~420–700KB desktop / ~165KB mobile |
| L2 reverse | NB Pro | flip/etch still | AVIF | ~35KB |
| L3 relights ×4 | NB Pro relighting | same-pixels relight + alignment QA + CSS-filter fallback | 240px (+480px 2×) AVIF | ~50KB |
| L4 finale | §5.6 | still + bore fire | AVIF + AV1/HEVC | ~80KB + ~250–450KB |
| L5 ledger.js + worker | hand-written | §5.4 invariants | 2 files | ~4–5KB gz |

### Honest ledger

The lightest concept. Critical path ~43KB. Fully-engaged desktop ≈ **0.9–1.2MB**; **mobile ≈ ~240KB fully engaged — the phone-in-truck visitor gets a poster + relight stills and nothing else, lighter than today in every accounting.** The judges' note stands: the most honest budget in the set.

### Risks

1. NB Pro relight pixel-stability is "better than fresh generations," not guaranteed — the alignment gate and CSS-filter fallback mean the beat can never fail, only degrade gracefully.
2. Lowest wow ceiling of the three — its screenshot is quality, not spectacle. Pairs beautifully as the de-risk layer under THE MINT (the judges grafted exactly that).

**Wow moment:** the first scroll — photograph-real metal turning under your thumb, a specular highlight traveling the hound-knot relief in sync with your hand, typography sharper than any video could hold. It reads as impossible, because the metal is baked light and the words never left the DOM.

---

## 9 · Recommendation & Sequencing

All three concepts share Phase 1. The panel's unanimous graft is the recommended destination:

- **Phase 1 — the chassis (= THE STRIKE, ~1 week build + §5.10 generation window):** master pipeline, hero poster/frames engine, sitewide `[data-coin3d]` shim, LCP wrapper fix, fallback ladder, bore-fire finale. Ship it; the site is already transformed and ~730KB of JS is off the page.
- **Phase 2 — the signature (= THE MINT's story beats, +1–2 weeks):** M2 melt + M3 cast + latch logic, the localized spark bloom synced to AUTOMATIC EXECUTION. The only new Veo risk in the whole program is M3, and LEDGER's relight stills are the pre-approved fallback if it misses its reference gate after 25 takes.
- **Phase 3 — optional polish:** LEDGER's Arsenal/Process/Why light states (zero-byte CSS), the dashboard exhibit still, the full-bleed finale A/B, sitewide byte reclamation.

**Production checklist (gates in order):** ① 5-frame AVIF encode test on real render output → lock frame budgets. ② Ultra subscription + Vertex project; pin model IDs; archive discipline live from day one. ③ Master approved against the knot reference. ④ Blender crossing height map authored. ⑤ Frames + poster + engine on a branch; LCP field-verified (poster after fonts). ⑥ Veo clips generated → mezzanine → one LUT → §5.9 OLED gate. ⑦ Luminance-law QA pass on every beat. ⑧ Reduced-motion/Save-Data/no-JS/Low-Power walkthrough on real devices. ⑨ 25-page regression sweep (the shim). ⑩ Trademark clearance note for the coin design; optional colophon line.

**Budget envelope:** $550–1,300 in generation spend (§5.10), 2–4 working days of generation wall-clock, and the build phases above. The mezzanine archive makes every future refresh a re-shoot, not a re-roll.

---

## 10 · Verification Record

Six adversarial refuters (technical + brand/copy per finalist) ran against the repo. **All three concepts survived.** 20 fatal flaws and 54 corrections were raised; the material ones and their dispositions:

| Finding | Disposition |
|---|---|
| Deleting coin3d.js/three.min.js/knot-copper.webp breaks 24 other pages + 3 direct image refs (verified) | §1 + §5.4: files stay; shim contract; sitewide reclamation deferred |
| Byte math compared disk bytes to wire bytes; "836KB blocking / 94–95% cut" claims inflated (three.min.js is ~146KB gz; nothing blocks render) | §1: honest baseline; all ledgers restated in wire bytes; per-concept totals state where they're *heavier* and why it's the right trade |
| Frame sequences can't fake a continuous idle spin (7.5° snaps every ~3s = strobe under a smooth CSS ring) | §5.2: static struck pose at idle + scroll-only frames + crossfade drift option |
| Y-axis turntable breaks the fixed rim-ring composite (edge-on slivers) | §5.1.3: in-plane rotation, face-on camera, locked HDRI |
| Opaque charcoal frames = visible rectangle on the radial gradient, catastrophic during the flight | §5.1.3: Cycles `film_transparent` → static alpha AVIF (Safari-safe), CSS contact shadow |
| Poster inside `opacity:0` `[data-coin]` is LCP-ineligible and invisible without JS; reduced-motion sets `display:none` | §5.4: dedicated visible wrapper; reduced-motion branch rewritten; LCP field-verified |
| CSP `script-src 'self'` blocks blob workers | §5.4: separate worker file |
| Blind HEVC-first source order penalizes AV1-capable browsers (rule was for alpha video) | §5.4: capability-ordered `codecs=` strings |
| Melting the hound-knot coin revokes FORGED ONCE; reverse scroll un-mints it; "strike" fights the CAST copy | §6: anonymous blank, one-way latch, cast staging |
| Full-viewport spark flash: WCAG 2.3.1 + washes the copy | §5.3/§6: slot-localized, ≤250ms, luminance-capped, dead under reduced-motion |
| 640px frames into an ~1600-device-px box undercuts the realism promise | §6/§7: 960px desktop frames, window resized, budgets restated |
| Steel-blue interrogation light off-palette; candle off-mythology; fingerprint garnish; 12%-multiply stills invisible; ember-loop = AI-slop trope | §8 corrections + §5.8 kill list |
| NB Pro "albedo/height from relights" builds on documented drift; silhouette displacement can't encode interlace | §5.1.2: hand-authored crossing height map; NB for albedo/wear only |
| Screen-blend can't render a solid dark coin (additive-only) | §5.6: bore-fire-in-still finale as default; full-bleed loop demoted to A/B |
| FGS grain lifts crushed blacks under screen blend (shimmering rectangle) | §5.9: masked/zeroed grain + histogram check |
| Pro-tier visible watermark is dark-scene-stealthy | §5.10: Ultra/Vertex only, frame-check at lifted gamma |

Contested claims to spot-check at implementation time (from the digest): whether Flow's free image tier serves NB Pro or NB 2 on the account's plan; Veo F2V input resolution handling; exact per-frame AVIF bytes for *this* knot art (the ① encode test); Safari 26.x screen-blend-on-video behavior (OLED QA list); Vertex seed exposure on the GA model; Ultra pricing at checkout.

Raw workflow output (6 research dossiers, full digest, all 5 concepts, 3 judge cards, 6 refuter reports) is archived in the session transcript; regenerate any layer by re-running the `cinematic-coin-ultraplan` workflow with cached resume.
