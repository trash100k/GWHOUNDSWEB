# COPY ULTRAPLAN — The Homepage as a Solutions-Selling Journey

**Date:** 2026-07-12 · **Scope:** index.html rewrite + copy relocation to about/work/voice/install/faq/contact/automations + polish passes on 8 sub-pages.
**Provenance:** 37-agent workflow — full-site copy inventory (14 homepage beats, 10 sub-pages, 4 strategy docs) → 3 competing journey strategies (direct-response / StoryBrand / scientific-CRO) → 3-judge panel → 2 independent homepage drafts merged by a copy chief → relocation drafts per destination page → 3 adversarial critics (conversion, brand voice, consistency/fabrication). All 30 critic findings are **already folded into the copy below** — this document is the post-verification version.
**Rule of precedence:** where anything in this doc conflicts with the strategy discussion, the copy blocks in §4–§5 govern.

---

## 0 · TL;DR

The current homepage is Gaelworx's saga — clan manifesto, certifications, 42 logo/academy names, deep product dossiers — with the visitor's problem arriving five screens deep and the first booking CTA at the very bottom of ~1,700vh of scroll. The rewrite flips it: **the owner is the hero, Gaelworx is the smith who arms them.** Enemy first (the missed 2pm call, the invoices at 11), desire second (a shop that runs without you), the smith third, then plan → weapons → receipts → oath → close. Every self-referential block moves to the page whose job it is (about, work, voice, install, faq, contact). One booking verb site-wide. A conversion exit at every scroll depth instead of only at the bottom.

**Two hard launch gates before any of this ships (§8):** the phone number (+1 369-212-1203 is flagged *"fake area code — do not ship until verified"* in SEO-IMPLEMENTATION-PLAN.md) and contact.html's `mailto:` form action. Until both are fixed, every CTA on the redesigned page routes to contact.html, and contact.html must actually submit.

---

## 1 · Diagnosis — why the current page leaks

From the 14-beat audit. The top findings, each traceable to specific copy:

1. **No audience, no offer above the fold.** Hero subhead is "Dashboards that decide. Pipelines that don't sleep." — SaaS jargon a plumber can't hear himself in. Nothing says *trades* until the Crafts frame, five screens deep.
2. **Credentials before the visitor's problem.** The Clan frame (130-word about-us), a 4-item cert list, then 30 tool logos and 12 academies — all mid-funnel, all inward-facing, before the visitor has been told what's in it for them.
3. **The conversion moment is withheld.** No booking CTA between hero and finale. The phone number first appears at the very bottom. The Bottleneck Audit — the low-friction second CTA — is never teased before the finale animation.
4. **"START THE FORGE" means three different things** (reframe scroll-cue, software-card CTA, call-now CTA) — the page never trains one action. A fourth, JS-generated meaning hides in the audit-verdict widget.
5. **Redundancy pads the scroll:** trust-ladder rung 04 repeats Process step 04 word-for-word; rung 05 restates steps 02+04; the "Certified architect · forward-deployed" blurb repeats the Clan frame nearly verbatim.
6. **Price-ladder whiplash in the Arsenal:** $15,000 software in slot 2, $1,499 web in slot 4.
7. **Work dossiers are developer proof, not owner proof** ("114 API ROUTES", "amounts verified server-side") — and deeper on the homepage than on work.html, which is backwards.
8. **The best line on the site is buried in the footer:** "You run the business. We build the systems that run it for you."
9. **The Crafts industries list (Gaming & 3D, Healthcare, Non-profit) dilutes the trades positioning** on the page that most needs it.
10. **~1,700vh of pinned scroll** (400 story + 300 arsenal + 300 ladder + 200 cast) puts the decision point physically far from a phone in a truck.

What already wins and must not be lost: the Arsenal's pain-first card copy ("Every missed call is a job booked by someone else."), the reframe frame ("Your business doesn't need artificial intelligence. It needs— AUTOMATIC EXECUTION"), the 4-step Process, the risk-reversal spine (fixed price, balance on execution, 2 builds/quarter), and the finale's audit widget.

---

## 2 · Strategy — the winning journey

Three strategies were designed independently and scored by three judges (1–10 on journey clarity, conversion logic, brand fit, feasibility):

| Strategy | Points |
|---|---|
| **B — StoryBrand: "The owner is the hero, Gaelworx is the smith who arms them"** | **94** |
| A — Direct-response solutions selling (PAS + one primary action) | 93 |
| C — Scientific CRO (5-second test, CTA at every depth, JTBD language) | 84 |

B won with A's best moves grafted on: **one primary CTA (book the call) repeated at every scroll depth, the audit as the low-friction fallback, and dollar-shaped pain named in the first two screens** using the only sanctioned stats (SEO-IMPLEMENTATION-PLAN §3.5: *SMBs miss ~6 of 10 calls; answering within 5 minutes ≈ 9× conversions*).

The new journey, mapped onto existing beats (no new engine beats; the story stack stays exactly 4 frames so the 400vh pin math survives):

| # | Section | Maps to | Job |
|---|---|---|---|
| 1 | HERO — the hero and the prize | #top | Pass the 5-second test: what, for whom, why believe, what next |
| 2 | THE ENEMY, NAMED | story frame (b), moved to 1st | The visitor's own problem, priced |
| 3 | AUTOMATIC EXECUTION | story frame (a), moved to 2nd | The desire, reframed — the page's best reveal lands after the pain |
| 4 | THE SMITH | story frame (c), compressed 130→~45 words | Guide: empathy then authority |
| 5 | THE CRAFTS | story frame (d), rewritten | Recognition: the visitor's trade named |
| 6 | THE PLAN | #process | 4 steps, risk visibly transferred, **first mid-page booking CTA** |
| 7 | THE ARSENAL | #arsenal | The owner picks the fight; ascending price ladder |
| 8 | FORGED HERE | #work, compressed | Receipts; depth moves to work.html |
| 9 | THE OATH | why-ladder, 5→3 rungs | Objection handling + **second at-depth booking CTA** |
| 10 | THE CAST | finale | Stakes + success + the ask (audit + call) |
| 11 | FOOTER | footer | Exits, tagline bookend, trade-link band |

---

## 3 · The CTA system — one verb, one destination

The single most important mechanical change. Until the verified phone number ships (§8), **every booking CTA is one label, one destination, translated at first occurrence:**

> **START THE FORGE · BOOK THE CALL →** → `contact.html` (tagged `data-gw-cta`)

When the real number lands, the finale/nav variants may re-split into a `tel:` version whose **only** difference is the suffix "· CALL NOW". Everything else in the verb table:

| Label | Destination | Where |
|---|---|---|
| START THE FORGE · BOOK THE CALL → | contact.html | hero, Plan, arsenal strip, Oath, finale, mobile bar |
| SEE THE PLAN → | #process | reframe frame |
| PUT IT ON THE PHONES → | voice.html | voice card |
| BOOK THE BUILD → | web.html | web card |
| FORGE A MACHINE → | automations.html | automations card |
| STAND IT UP → | install.html | install card |
| OWN THE CODE → | software.html | software card (replaces its old "START THE FORGE") |
| MEET THE CLAN → | about.html | Smith frame (sole mid-stack exit) |
| SEE THE FULL FORGE → | work.html | Forged Here |
| STRAIGHT ANSWERS (text link) | faq.html | under the Oath CTA |
| EMAIL ME THE KILL LIST | audit widget | unchanged |

**Audit-verdict widget (JS, index.html ~line 683):** the generated CTA currently reads `START THE FORGE · $price →` and links to the winning *service page* — a stray fourth meaning. Extend the verdict map to render the per-service imperative instead, keyed by service, with the price **interpolated from the price-lock source (`data/price-lock.json`), never hard-coded in the JS** — rendered output looks like `PUT IT ON THE PHONES · FROM $899/MO →`, `FORGE A MACHINE · FROM $2,500 →`, `BOOK THE BUILD · FROM $1,499 →`, `OWN THE CODE · FROM $15,000 →`. The reserved booking verb never points at a service page.

**Nav (all pages via the shared header; labels change, anchor ids never do):**
`PLAN → #process · SERVICES → #arsenal · WORK → work.html · PRICING → pricing.html · ANSWERS → faq.html · CONTACT → contact.html · CALL NOW (existing tel element, untouched)`
- Drop the numeric prefixes (01–06) outright — decorative digits go stale on every reorder.
- SERVICES gets a raw-HTML flyout: VOICE AGENTS · CINEMATIC WEB · AUTOMATIONS · AI INSTALLATION · CUSTOM SOFTWARE. The five service pages are currently header-orphaned; the links must be raw HTML in the initial document (AI crawlers read initial HTML only).
- WHY leaves the nav (the ladder compresses); ANSWERS → faq.html takes the slot.
- Do NOT add the Bottleneck Audit to the nav. The page trains two actions — call, audit — and a third entry point dilutes both.

---

## 4 · The new homepage, beat by beat — final copy

Conventions: `||` separates paragraphs/items. ALL-CAPS lines are display type. Everything here is ready to paste; every factual claim traces to existing site copy or the sanctioned stats. No new em-dashes anywhere (the existing "It needs—" is grandfathered furniture); colons and full stops are the connective tissue.

### 4.1 HERO (#top) — verdict: rewrite

```text
kicker     FOR HVAC · PLUMBING · LANDSCAPING · EVERY SHOP THAT LIVES BY THE PHONE
H1         FORGED ONCE. SHARPENED FOREVER.
subhead    You run the business. We build the systems that run it for you.
           You're on the job. They're on the phones.
microline  Claude Certified Architect · Google Cloud Professional
CTA        [ START THE FORGE · BOOK THE CALL → ]   → contact.html  (data-gw-cta)
cue line   Not ready? Scroll: the plan is four steps, and a 6-tap audit waits at the end. ↓
```

- H1 verbatim and singular (SEO lock); the duplicate animation layer stays `aria-hidden`.
- The old subhead ("Dashboards that decide…") dies. The new one promotes the footer tagline to the top of the page and adds a two-beat punch that does NOT pre-spend the AUTOMATIC EXECUTION reveal (the enumeration "books the jobs, answers every call, kills the busywork" is saved for frame 2, where it lands fresh).
- The kicker names the anchor trades and folds in barbers/tattoo/dispensaries/dealers via "every shop that lives by the phone" — five of the eight landing-page verticals aren't trades and must still pass "is this for me?" in 5 seconds.
- **One button.** "SEE THE PLAN ↓" and the audit tease merge into the single quiet cue line, which doubles as the scroll cue. "SEE THE FORGE →" and "BEGIN THE DESCENT ▼" retire.
- Keep the "GW · Built for the long campaign" chip as texture.
- The coin ticker's FIRST on-screen appearance gains the translation once: "NON SINE PERICULO · NOT WITHOUT DANGER ·". Every later appearance stays Latin-only.
- Cert microline placement is deliberately dual (hero + Smith frame): free authority at zero scroll cost, and the conversion critic confirmed it does real 5-second-test work here. Quotes only the two certs already on the site.

### 4.2 STORY FRAME 1 — THE ENEMY, NAMED (frame b, swapped to first) — verdict: rewrite

```text
kicker     The Enemy, Named
headline   THE ENEMY ISN'T TECHNOLOGY. IT'S THE 2PM CALL YOU MISSED
           AND THE INVOICES AT 11.
body       Small shops miss roughly six calls in ten. Somebody books those jobs.
           It isn't you.
           || Then the sun goes down and the second shift starts: quotes, follow-ups,

           invoices, the no-show nobody chased. Paperwork that keeps the doors open
           and never pays you a dime.
           || You built a business. It clocks you in at dawn and never clocks you out.

stinger    FOR OPERATORS WHO REFUSE TO LOSE TO THE STATUS QUO.
```

- No CTA — pinned crossfade frame; tension carries into frame 2.
- The villain is the visitor's own bottleneck now. "Most agencies bill for motion. We bill for execution." moves intact into Oath 3 (§4.10).
- The 6-of-10 stat is sanctioned (SEO-IMPLEMENTATION-PLAN §3.5); it is the only number in this frame.
- The stinger is the old Clan frame's H3, kept verbatim.

### 4.3 STORY FRAME 2 — AUTOMATIC EXECUTION (frame a, now second) — verdict: keep

```text
kicker     Four Branches · One Forge
lead-in    Your business doesn't need artificial intelligence. It needs—
headline   AUTOMATIC EXECUTION
body       One system that books the jobs, answers every call, and kills the busywork,
           running while you sleep. You command it. It never needs managing.
CTA        SEE THE PLAN →   → #process
```

- Best copy on the site — body verbatim. The lead-in em-dash is existing furniture and stays.
- Only change: the CTA retargets **from #finale to #process** (note: the current link points at #finale, not contact.html) so the reserved booking verb stops meaning multiple things. The hero now carries the direct-conversion CTA; this demotion costs nothing.
- The coin flight animation still lands on this frame; the position swap is a content/order change, not structural.

### 4.4 STORY FRAME 3 — THE SMITH (frame c "The Clan", compressed 130 → ~45 words) — verdict: compress

```text
kicker     The Clan
headline   WE'VE WORKED YOUR FLOOR. NOW WE FORGE FOR IT.
body       We've run the trucks, worked the phones, closed the month. Our own shops,
           YardWorx and SalesWorx, run on the exact rails we sell: built for us first,
           burned in, now yours. You talk to the people who write the code.
microcopy  Claude Certified Architect (CCA-F) · Google Cloud Professional ·
           Open-source first, platform-agnostic always.
CTA        MEET THE CLAN →   → about.html
```

- Empathy first (concrete: trucks, phones, month-close), dogfood proof second, credential line third, zero framework name-soup.
- "Not case studies we read" is deliberately NOT here — it lands once, in the Work intro, next to the receipts.
- The full manifesto, forward-deployed explainer, OpenClaw/Hermes/CrewAI/LangChain/n8n roster, and 4-item cert list MOVE to about.html (§5.1). **Ship destination-first:** about.html absorbs before this frame compresses. It is a move, not a copy.
- This is the **sole** off-page exit inside the story stack (about.html is a trust page; an acceptable detour).

### 4.5 STORY FRAME 4 — THE CRAFTS (frame d) — verdict: rewrite

```text
kicker     We build what we know
headline   OUR LIVES WENT INTO THESE CRAFTS.
subhead    Decades running tight ships in the trades we serve, so we arrive with the
           pain points already mapped and the fix already honed.
body       HVAC · Plumbing · Landscaping · Barbershops · Tattoo Studios ·
           Dispensaries · Cannabis Accessories · Classic Car Dealers
microcopy  Yours isn't listed? The bottlenecks rhyme. Call anyway.
```

- Recognition beat: the visitor's trade appears on screen. Subhead is the existing sentence verbatim with the "brutalist speed" self-praise clause cut.
- **Launch tight: render the eight trades as plain text, not links.** Nine pre-Plan off-page exits was the money page's biggest new leak; the footer FORGED FOR band (§4.13) carries the raw-HTML SEO links the cluster needs regardless. Promote these to links later only if trade-page assist data justifies it.
- The list uses the EIGHT trade pages verified in the repo (electrical/roofing pages don't exist yet — linking them would 404).
- Gaming/3D, Healthcare, Non-profit, Food & Hospitality: **already present verbatim on about.html** ("These are the floors we've worked") — no move needed; the homepage simply narrows to the eight trades while about.html keeps the broad list.

### 4.6 TICKERS (stack + coursework marquees) — verdict: MOVE to about.html (the one whole-section removal)

Surviving homepage artifacts, already placed upstream: "Open-source first, platform-agnostic always." lives in the Smith microline; "Claude Certified Architect · Google Cloud Professional" lives in the hero + Smith microlines. Everything else — both marquees and the "Certified architect · forward-deployed" blurb — lands on about.html (§5.1); the blurb itself is cut as a near-verbatim duplicate of Clan claims.

- The section has **no id and no JS binding** — structurally the safest cut on the page.
- It shortens total scroll: recheck every downstream anchor offset, the pw≈0.22 / pc≈0.88 landing constants, and the mobile Descent Gauge tick map (§7).
- Move, not copy: the March-2026 scaled-content update punishes near-duplicate blocks across pages. Ship about.html first.

### 4.7 THE PLAN (#process) — verdict: keep + add the first mid-page conversion exit

```text
kicker     THE PLAN
headline   FROM BOTTLENECK TO CAST.
subhead    Four steps. One call to start. The risk stays on the smith.
body       01 · NAME THE BOTTLENECK. One call, no discovery-call theater. Name the
           thing eating your week. You leave with a number, not a process.
           || 02 · FIXED SCOPE. FIXED PRICE. Agreed before any work begins. We don't

           get paid to experiment on your business.
           || 03 · THE FORGE RUNS. It ships in stages you can see. No year of silence,

           no pilot that rots in phase two. Milestones you watch land.
           || 04 · IT SHIPS. THEN IT EARNS. We don't bill the balance until it

           executes, counted in jobs booked, calls answered, hours handed back.
CTA        [ START THE FORGE · BOOK THE CALL → ]   → contact.html  (data-gw-cta)
microcopy  or run the 6-tap Bottleneck Audit ↓   → #audit
```

- The four step bodies are verbatim from the current page; step 01 gains the plain-English closer ("a number, not a process" lives here and only here in full form).
- This CTA block is the first hard conversion exit between hero and finale — the gap the audit flagged hardest.
- Keep the #process anchor id — other pages link to it.

### 4.8 THE ARSENAL (#arsenal) — verdict: keep, reorder into the commitment ladder

**Section frame:**

```text
kicker     SERVICES · THE ARSENAL
headline   NAME THE THING EATING YOUR WEEK.
subhead    Five weapons. Every one priced before we lift a hammer.
           Start where it bleeds worst.
chrome     SCROLL TO RIDE →  (unchanged)
```

Slide order becomes ascending price: **VOICE $899/mo (starred entry point) → WEB $1,499 → AUTOMATIONS $2,500 → AI INSTALLATION $2,500 → SOFTWARE $15,000 (capstone)**. Swap display ORDER only — still 5 slides, scrolljack math untouched. GW-ids travel with their slides (no renumbering). Price chips render from the price-lock source (`data/price-lock.json` is the only place prices change).

**Slide 1 — VOICE (GW-01, stays slot 1, starred):**

```text
kicker     GW–01 · VOICE ★ WHERE MOST SHOPS START
headline   EVERY MISSED CALL IS A JOB BOOKED BY SOMEONE ELSE.
subhead    VOICE AGENTS
body       A managed voice agent works the phones for you: answers every inbound call,
           runs your outbound list, qualifies the lead, books the job, chases the
           no-show. A natural voice that sounds human, not robotic.
           || Answer a lead inside five minutes and you book the job at roughly nine

           times the rate. The agent answers on the first ring. Every time.
           || Built on the same rails as everything else we forge.

CTA        PUT IT ON THE PHONES →   → voice.html
chip       FROM $899/MO · MANAGED
```

(The 5-minute/9× stat is the only stat on any card — sanctioned, phrased in the buyer's verb: "book the job", not "convert".)

**Slide 2 — WEB (GW-04, moves 4→2):**

```text
kicker     GW–04 · WEB
headline   YOUR SITE LOOKS GOOD. IT BOOKS NOTHING.
subhead    CINEMATIC WEB
body       A cinematic site that routes every lead straight to your phone and books
           the truck. Built to the standard of the page you're reading.
           || Care plans from $49/mo keep the edge on it.

CTA        BOOK THE BUILD →   → web.html
chip       FROM $1,499
```

**Slide 3 — AUTOMATIONS (GW-03, stays slot 3):**

```text
kicker     GW–03 · AUTOMATIONS
headline   THE LITTLE HEADACHES STACK UP UNTIL THEY RUN YOUR DAY.
subhead    WORKFLOW ENGINES
body       Reply bots, data bots, design helpers. Quoting, follow-up, invoicing,
           reviews: running on their own, your data handed back to you to own.
           || Built once. They don't call in sick.

CTA        FORGE A MACHINE →   → automations.html
chip       FROM $2,500
```

(The "procedural generation, in business and in art" clause leaves this card but is **preserved on automations.html** — see §5.7; cutting it here without a destination would silently kill a site-wide capability claim.)

**Slide 4 — AI INSTALLATION (GW-05, moves 5→4):**

```text
kicker     GW–05 · AI INSTALLATION
headline   EVERYONE SOLD YOU AI. NOBODY INSTALLED IT.
subhead    AI INSTALLATION
body       We stand the whole stack up FOR you: models configured, agents deployed,
           hardware racked, your team trained on all of it. Local models where the
           data can't leave the building.
           || Installed, tuned, and taught, not a license and a logout.

CTA        STAND IT UP →   → install.html
chip       FROM $2,500
```

(The closer stays index-native. "A login and a shrug" was rejected — it is install.html's own H2 verbatim, and duplicating a destination page's headline is the exact cross-page near-dupe the March-2026 update punishes. The servers/clusters/team-machine-builds detail moves into install.html KIT-03 **first** — §5.6 — then this card trims.)

**Slide 5 — SOFTWARE (GW-02, moves 2→5, capstone):**

```text
kicker     GW–02 · SOFTWARE · THE CAPSTONE
headline   YOU DON'T OWN YOUR STACK. SOMEONE ELSE'S ROADMAP RUNS YOUR BUSINESS.
subhead    CUSTOM SOFTWARE
body       Internal tools and proprietary platforms, custom-built, documented, and
           handed over whole. You own the code outright: no license, no lock-in,
           no monthly toll.
           || The same system that runs YardWorx.

CTA        OWN THE CODE →   → software.html
chip       FROM $15,000
```

("No black box" is deliberately absent from this card — it's Oath 2's title downstream; saying it twice dulls both. The relabel from "START THE FORGE" ships simultaneously with the same-verb cleanup on pricing.html and contact.html — a partial migration is worse than today's three meanings.)

**Arsenal conversion strip (NEW static raw-HTML element, in normal flow after the carousel unpins — no scrolljack change):**

```text
kicker     Scope It Live
headline   NOT SURE WHICH ONE?
body       One call. We scope it live. You leave with a number.
CTA        [ START THE FORGE · BOOK THE CALL → ]   → contact.html  (data-gw-cta)
microcopy  Fixed scope. Fixed price. Named up front.
```

A booking path at the moment of highest offer-awareness, where today every exit is an outbound service-page link.

### 4.9 FORGED HERE (#work) — verdict: compress to teaser cards; depth moves to work.html

```text
kicker     The Work · Receipts
headline   FORGED HERE.
subhead    We build what we run. Two platforms forged for our own shops, worked daily.
           Not case studies we read: operations we live in. This is the standard your
           build gets held to.
body       C–01 · THE LANDSCAPER OS · YARDWORX
           || The cockpit that runs our own landscaping company end to end, every day.

           The job books and the invoice is already written; a photo of the yard comes
           back a proposal priced to the penny. 33 modules, lead to paid. Owned outright.
           || C–02 · THE SPARRING PIT · SALESWORX

           || A flight simulator for salespeople. Reps take live calls against hostile

           AI buyers, get graded like a film session, and climb a ranked ladder, so the
           first "no" of the day isn't their warm-up.
           || Both run on the same managed-agent rails we sell. When we say we build

           what we run, these are the receipts.
CTA        SEE THE FULL FORGE →   → work.html
```

- With zero testimonials on the site these cards are the heavy proof — the concrete stats (33 modules, priced to the penny) survive the compression deliberately.
- The teaser wording is **differentiated from work.html on purpose** (the YardWorx teaser paraphrases; "graded like a film session" lives ONLY here) so the compression doesn't manufacture cross-page verbatim duplicates. work.html keeps its own "graded 0–100 across ten competencies" phrasing.
- The five-module blocks, 114-API-routes chips, and Email Roaster / Ranked Ladder / Gauntlet detail move to work.html **first** (§5.2) — they're currently thinner there than here, which is backwards — then this ships.
- Keep the #work id; nav WORK repoints to work.html.

### 4.10 THE OATH (why-ladder, 5 rungs → 3) — verdict: compress + add the second at-depth booking CTA

```text
kicker     The Oath
headline   THREE OATHS. EVERY OBJECTION BREAKS ON ONE.
body       01 · BUILT ON BEDROCK. Proven processes and managed agents on the same
           battle-tested rails that move bank transactions and logistics fleets.
           We don't bet your operation on last quarter's frontier model and a
           crossed-fingers prompt.
           || 02 · NO BLACK BOX. AI does the rote work. You keep the call. No machine

           making decisions you can't see or override: it shows its reasoning and hands
           the call back to you. Built to make you sharper, not dependent.
           || 03 · WE CARRY THE RISK. Most agencies bill for motion. We bill for

           execution. Fixed scope. Fixed price. The balance waits until the system
           runs. The risk is ours. That's the point.
CTA        [ START THE FORGE · BOOK THE CALL → ]   → contact.html  (data-gw-cta)
text link  Every other question, answered the way we'd say it on the phone
           → STRAIGHT ANSWERS   → faq.html
```

- Rung 01 CUT (carried by the Smith frame + Work intro). Rung 04 CUT (word-for-word duplicate of Plan step 04). Oath 3 absorbs "bill for motion / bill for execution" from the old Enemy frame; "the balance waits until the system runs" replaces the triple-"bill" restatement (phrase traceable to about.html).
- "BREAKS" replaces "DIES" — objections died on ladder *rungs*; the ladder furniture is gone, oaths are sworn at an anvil.
- **The oaths just transferred the risk — collect on it.** The booking CTA lands here (peak conviction), with the FAQ exit demoted to a text link beneath it.
- Engine: the 300vh pin and Descent Gauge tick mapping retune for 3 rungs; keep `id="why"` (see §7).
- Destination-first moves before this ships: full bedrock copy → voice.html (§5.3); long-form no-black-box → new faq.html entry (§5.4); rung-05 sentence → contact.html microcopy (§5.5).

### 4.11 THE CAST (finale) — verdict: rewrite framing; widget mechanics unchanged

```text
kicker     The Pour · Metal Meets the Mold
headline   EVERY WEEK THE BOTTLENECK STAYS, IT BOOKS JOBS FOR SOMEONE ELSE.
subhead    On the other side of the pour: jobs booked. Calls answered.
           Hours handed back.
widget     ⚒ THE BOTTLENECK AUDIT · 6 TAPS
           Six taps. It names what's bleeding you and emails you the kill list.
           (Widget strings unchanged: THE VERDICT · YOUR BOTTLENECK: ·
            EMAIL ME THE KILL LIST · RUN IT AGAIN ↺ — verdict CTA re-mapped per §3)
fallback   Or skip the taps: one call, we name it live. →   → contact.html
CTA        [ START THE FORGE · BOOK THE CALL → ]   → contact.html  (data-gw-cta)
           (re-split into the "· CALL NOW" tel: variant only when the verified
            number ships; the tel: link meanwhile demoted to the availability row,
            rendering from its single source)
closer     SCOPE IT LIVE. One call; we'll name the bottleneck together.
           AVAILABLE · CONTINENTAL US · 7 DAYS
           We take 2 builds a quarter. That's not a line: it's how we hold the standard.
```

- Stakes/success pair sits above the pour in the recency slot: headline = cost of failure, subhead = the win.
- Pour animation and letter molds keep (signature brand), but the pour runway trims from 200vh toward ~100vh — the one cheap height compression (end-of-page pin, no downstream anchors).
- **Add `id="audit"` to the widget container** — the hero cue line, Plan microcopy, and mobile bar all anchor to it. QA that the anchor resolves after all pinned sections at final scroll heights, on mobile (§7).
- The widget's context header stays the first visible element on arrival for cold traffic teleported from the hero; the fallback line catches arrivals who won't tap.
- Scarcity and availability lines verbatim; digits render only from the single tel: source. Keep `id="finale"` (§7).
- The existing closer's "no forms" clause is **dropped for now**: while booking runs call-second, every CTA lands on contact.html's form, and "one call, no forms" would contradict the page the visitor actually reaches. Restore the clause verbatim when the verified number ships and the primary CTA becomes tel: again.

### 4.12 STICKY MOBILE BAR (NEW, mobile-only, raw HTML/CSS) 

```text
[ START THE FORGE · BOOK THE CALL ]  (filled, primary)   → contact.html  (data-gw-cta)
[ WHAT'S BLEEDING? 6 TAPS ]  (ghost/outline, secondary)   → #audit
```

- Trade owners browse from the truck; this puts the page's two trained actions under the thumb at every depth. Nothing else goes in the bar.
- Weighted, not 50/50: booking filled, audit ghost. The ghost label explains itself to someone who hasn't met the tease.
- The booking button carries the full canonical label. If it won't fit at 320px, the visible text may shorten to START THE FORGE, but the button keeps `aria-label="START THE FORGE · BOOK THE CALL"` and the same destination — a shortened visible form must never reintroduce a second meaning for the verb.
- **Hide the bar when the finale is in view** so it never occludes the audit widget's own submit or the finale CTA — one IntersectionObserver on `#audit` (a justified three-line exception to "no new script"), or a CSS scroll-driven animation to keep it zero-JS.

### 4.13 FOOTER — verdict: keep + two changes

```text
headline   YOU RUN THE BUSINESS. WE BUILD THE SYSTEMS THAT RUN IT FOR YOU.
body       Serving the Continental US
           © 2026 Gaelworx
band       FORGED FOR: HVAC · Plumbing · Landscaping · Barbershops · Tattoo Studios ·
           Dispensaries · Cannabis Accessories · Classic Car Dealers
           (each a raw-HTML plain link to its ai-receptionist-*.html page)
nav        unchanged (HOME · THE WORK · PRICING · VOICE AGENTS · AUTOMATIONS · SOFTWARE ·
           CINEMATIC WEB · AI INSTALLATION · ABOUT · CONTACT · STRAIGHT ANSWERS ·
           PRIVACY · TERMS · ACCESSIBILITY)
contact    hello@gaelworx.com · phone link renders from the existing single tel: source
```

- The tagline appears exactly **twice** on the page — hero subhead and footer headline. Bookend, not burial, and no back-to-back stutter (the old run-on into "Serving the Continental US" gets a hard break).
- The FORGED FOR band feeds the SEO cluster from the highest-authority page without adding mid-funnel exits (it also backstops the de-linked Crafts frame).

---

## 5 · Relocation copy — what the homepage donates, and where it lands

Ship order is **destination-first**: every block below goes live on its destination page *before* the corresponding homepage cut ships, so moved copy never exists on zero pages. These are adaptations, not pastes.

### 5.1 about.html — absorbs the Clan manifesto, cert list, both tickers

**Insert A — new "who we are" section** between the Ethos section and the Five Pillars:

```text
kicker     The Clan
heading    FORWARD-DEPLOYED, NOT PHONED IN.
body       GAELWORX runs this exact system on our own shops. We built it for us.
           It worked. Now it's yours.
           || We're forward-deployed engineers and orchestration architects.

           Forward-deployed means what it says: we don't diagnose from across town.
           We embed in your operation, name what's eating the week, and build the fix
           inside it: your phones, tools, and data wired into one system that holds
           at scale. Proven, certified hands from day one, not a learning curve on
           your invoice.
           || Fluent across the whole managed-agent stack: the same rails scrolling

           above. If you can stand a managed agent up on it, we build on it.
           || We don't bill for motion. We bill for execution. And when you call,

           you talk to the people who write the code.
```

**Insert B — the stack marquee**, inside the Ethos second reading, beneath the no-black-box paragraph (replacing its bare inline five-name roster):

```text
kicker     The stack we build on
heading    OPEN-SOURCE FIRST. PLATFORM-AGNOSTIC ALWAYS.
body       We specialize in open-source software, but we build on every platform you
           already run: nothing exotic, nothing you can't interrogate. Here is what
           we plug into.
           || Claude · ChatGPT · Gemini · OpenClaw · Hermes · CrewAI · LangChain ·

           Langflow · n8n · Zapier · Cloudflare · Vercel · GitHub · Slack · Notion ·
           Linear · Discord · HubSpot · GoHighLevel · Stripe · Twilio · Airtable ·
           Supabase · Firebase · MongoDB · Google Cloud · AWS · Google Workspace ·
           Microsoft · Obsidian
```

(Raw HTML, never JS-injected — the CrewAI/LangChain/n8n/Stripe/Twilio entity mentions must stay crawlable so the Organization `knowsAbout` schema keeps matching visible text. Duplicate the row once `aria-hidden` for the marquee loop, exactly as on the homepage today.)

**Insert C — the cert list**, after Pillar 05, before the availability outro:

```text
kicker     The paper to back it
heading    RECEIPTS, NOT PROMISES.
body       An oath is easy to swear. This one is countersigned.
           || Claude Certified Architect · CCA-F

           || Anthropic Academy · 16 courses

           || OpenAI Academy

           || Google AI Professional
```

**Insert D — the coursework marquee**, directly beneath the cert list:

```text
kicker     Where the paper was earned
heading    TRAINED ON EVERY TOOL WE TOUCH.
body       We don't practice on your business. Every rail we build on, we trained on
           first. These are the classrooms.
           || Anthropic Academy · OpenAI Academy · Google AI Essentials · Google Cloud

           Skills Boost · Google Cloud Professional · Microsoft Learn: AI · AWS Skill
           Builder · HubSpot Academy · crewAI: Multi-Agent Systems · LangChain Academy ·
           n8n Academy · Zapier Learn
```

**Edits to existing about.html copy:**
- Ethos second reading, black-box sentence: remove the inline five-name roster → "…so every system we forge shows its work and hands the final call back to you. Every rail we run is named below." (the new ticker carries the roster; schema loses nothing).
- The availability line + JOIN THE CLAN CTA stay the final elements of the section, below the new inserts.
- Pillar 03 keeps naming YardWorx/SalesWorx — which is why Insert A says "our own shops" without re-naming them (avoids a four-fold repeat on one page).
- about.html keeps its broad six-industry list ("These are the floors we've worked") — already present, no move needed; homepage narrows to the eight linked trades.

### 5.2 work.html — absorbs the full dossiers (must ship BEFORE the homepage compression)

**Insert A — YardWorx spec sheet**, after the C-01 card, before the SalesWorx tour:

```text
kicker     C–01 · THE SPEC SHEET
heading    FIVE SYSTEMS. ONE COCKPIT.
body       CRM & PIPELINE — Every lead scored, briefed, and tracked; customers invited
           to their own portal with one link.
           || SCHEDULE & DISPATCH — Book the job and the invoice writes itself; crews

           clock in, customers get an "on my way" text.
           || INVOICE & GET PAID — Card and ACH through Stripe, recurring and seasonal

           billing, branded PDFs; amounts verified server-side, never trusted from a form.
           || AI DESIGN STUDIO — Photograph the yard, get a photoreal before/after and

           a Good-Better-Best proposal. The picture is AI; the pricing is deterministic
           to the penny.
           || CLIENT PORTAL — No login, no password: a signed link where clients see

           history, approve designs, message the crew, and pay.
           || Every screen in the tour above is one of these five, running on our own

           yard today.
```

**Insert B — SalesWorx fight card**, after the C-02 card, before the waitlist:

```text
kicker     C–02 · THE FIGHT CARD
heading    FIVE ROUNDS IN THE PIT.
body       THE CALL ARENA — Live roleplay against AI buyers with a temper: a gatekeeper,
           a procurement shark, a skeptic. The prospect's patience is a live meter on screen.
           || THE ROAST MASTER — Every call graded 0–100 across ten competencies against

           six named methodologies, with the two moments that won or lost the call quoted
           back at you.
           || THE GAUNTLET — Endless waves of escalating buyers with roguelike power-ups.

           Survive as long as you can hold the frame.
           || EMAIL ROASTER — Paste the cold email, get the score and the sharper rewrite.

           || RANKED LADDER — ELO from your first call, six tiers from Bronze to Apex,

           badges earned against the nightmare bosses.
           || You already met Greg in the tour above. That's the Arena. The Sage's

           critique is the Roast Master. Wave 4 is the Gauntlet. All live.
```

**Insert C — buyer-intent exits (conversion-critical).** Directly under EACH of the two blocks above, before the waitlist:

```text
WANT ONE FORGED FOR YOUR SHOP?  [ START THE FORGE · BOOK THE CALL → ]  → contact.html (data-gw-cta)
```

And reframe the waitlist kicker so it self-selects product-curious visitors only: **"Want the platform itself? The gates aren't open yet."** — homepage-referred *service* buyers must not get recruited into a SaaS waitlist; buyer intent routes to booking, product intent routes to the list.

**Edits to existing work.html copy:**
- C-01 intro: cut the middle sentence (stack + Design Studio) — both now live in the chip row and spec sheet → "The landscaper OS we run ourselves: lead to schedule to crew to invoice to paid, in one owned cockpit. The first system we built for ourselves, now the proof we build what we run."
- C-01 chips → two lines: `33 MODULES · 114 API ROUTES · 5 CREW ROLES · OWNED OUTRIGHT` / `STRIPE · TWILIO · QUICKBOOKS · GEMINI`.
- C-02 intro: trim the enumeration but **keep this page's own grading phrase** → "A flight simulator for salespeople: live calls against hostile AI buyers, graded 0–100 across ten competencies. We spar in it ourselves, so the first 'no' of the day is never the warm-up." ("Graded like a film session" lives only on the homepage teaser — deliberate cross-page differentiation.)
- C-02 chips → `10 SCORED COMPETENCIES · 6 RANK TIERS` / `SANDLER · MEDDIC · SPIN · CHALLENGER · GAP · BANT`.
- Forged Here intro, final sentence gains: "The full spec sheet rides under each."

### 5.3 voice.html — absorbs the Bedrock rung

**Insert — new section** after the GW-01 ledger rows, before the Missed-Call Bleed calculator (suggested `data-screen-label="Voice — Built on Bedrock"`):

```text
kicker     The engineering half · Why it holds
heading    BUILT ON BEDROCK.
body       The sales floor is one half of the build. This is the other.
           || The agent runs on proven processes and managed agents: the same

           battle-tested rails that move bank transactions and logistics fleets.
           A rail trusted with money and freight can be trusted with your front door.
           We don't bet your operation on last quarter's frontier model and a
           crossed-fingers prompt.
           || Bedrock is why it holds on the first ring and on the thousandth dial.
```

**Edits:** hero paragraph's "and built on proven tech, not this quarter's experimental model" → "and built on bedrock" (the section now proves the claim; the negation lives exactly once). Keep "You get both halves in one build…" verbatim — it's now the deliberate bridge into this section.

### 5.4 faq.html — absorbs the long-form No Black Box (was missing from the original package; required for destination-first)

**Insert — new Q&A:**

```text
Q   Will it make decisions without me?
A   No. AI does the rote work; you keep the call. No machine makes decisions you
    can't see or override: every system shows its reasoning and hands the call back
    to you. Built to make you sharper, not dependent.
```

**Edit:** reconcile with the existing "we answer for the machine: every system shows its reasoning, and you can overrule it" sentence in the "What if it breaks?" answer so the page doesn't say it twice — the new Q&A owns the full form; trim the older sentence to "we answer for the machine."

### 5.5 contact.html — absorbs the risk-reversal Oath (the decision point)

**Insert A — the Oath, short form**, in the copy column after "A person, not a sequence." and before the form fields:

```text
kicker     THE OATH · SHORT FORM
heading    WE CARRY THE RISK.
body       Fixed scope. Fixed price. Named before any work begins. The balance isn't
           billed until the system executes. We don't get paid to experiment on your
           business.
           || Most agencies bill for motion. We bill for execution. The difference is

           whether it ships.
           || The risk is ours. That's the point.
```

**Insert B — microcopy** directly beneath the OR CALL NOW row, last words before the footer:

```text
You risk one call: fixed price named up front, the balance billed only when the
system executes.
```

**Edits:** intro paragraph stays verbatim but gains no price/billing language (the Oath owns the terms); availability line keeps "A person, not a sequence." as the hand-off into the Oath; the phone/email pair stays above the terms.

### 5.6 install.html — absorbs the hardware detail trimmed from the GW-05 card (was missing from the original package)

**Insert — extend KIT-03 "The hardware, stood up":**

```text
The servers set up to run it: from single boxes to clusters to the machines your
team works on, including on-prem, local models where the data can't leave your
walls. Cloud when that's right, in-house when it isn't.
```

(All phrases trace to the current homepage GW-05 card and existing KIT-03; without this insert the clusters/team-machine-builds claim would vanish from the site.)

### 5.7 automations.html — preserves the procedural-generation claim leaving the homepage card

**Edit — THE LAW block** gains: "…reply bots, data bots, quoting helpers, follow-up chasers — and design helpers and procedural generation, in business and in art." (Verbatim from the current homepage card. Alternative: fold into about.html's Gaming & 3D line. Either way it must land somewhere; the homepage cut alone is a silent kill.)

---

## 6 · Sub-page polish — "make the copy better in general"

Top fixes per page (current → better). Apply independently of the homepage work.
**Two site-wide amendments to these recs:** (1) any button reading "— GET STARTED" becomes "· BOOK THE CALL" per the verb system, and any polish suggestion containing "CALL NOW" or printed phone digits is gated on the verified number (§8) — until then, "BOOK THE CALL" and no new digit strings; (2) keep each page's existing button-separator character — the em-dash budget applies to prose.

### voice.html

| Where | Current | Better |
|---|---|---|
| Hero H1 | THE FIRST RING. | **OWN THE FIRST RING.** |
| Hero CTA | DEPLOY THE AGENT — GET STARTED | **DEPLOY THE AGENT — BOOK THE CALL** |
| VOX-04 body | "A natural voice that sounds human, not robotic — and it runs our own front desk." | **"No robot reading a card. Call our line: this same agent picks up. It runs our own front desk."** |
| VOX-03 body | "…CRM and dialer wired in across OpenClaw, Hermes…" | **"…wired into the CRM and dialer you already run: OpenClaw, Hermes, CrewAI, LangChain, n8n."** |
| FAQ hours | "The front desk never steps away: it picks up…" | **"All of them. The front desk never steps away: first ring at 7am, first ring at 11pm, no lunch, no voicemail. Hold music nobody ever hears."** |
| FAQ human | restates hero twice | **"Yes, and it doesn't hide that it's an agent. Ten years on a sales floor tuned it: where to pause, when to push, how to handle an objection. It answers our own front desk. Proof is one dial away."** (link the existing tel source; print no new digits) |

### automations.html

| Where | Current | Better |
|---|---|---|
| Hero H1 | THE INVISIBLE CREW. | **FIRE YOUR SECOND JOB.** |
| CTA | FORGE THE CREW — GET STARTED | **FORGE THE CREW — BOOK THE CALL** |
| THE LAW block | tool stack leads | **"Software workers we host and run for you: quote writers, follow-up chasers, invoice senders, review bankers, forged on open rails: OpenClaw, CrewAI, LangChain, n8n. No lock-in to anyone, including us."** |
| Hero subhead | one long clause | **"Quoting at the kitchen table. Invoicing on Sunday. That's the second job: unpaid, worked after dark."** |
| FAQ 2 | jargon leads | **"No. The crew is forged around what already works for you. Your data comes back unified and yours to own: no black box, no hostage tool. Under the hood: open rails — OpenClaw, CrewAI, LangChain, n8n."** |
| FAQ 1 | re-pastes hero | **"Quoting, follow-up, invoicing, reviews — the four engines above — plus the scheduling and data entry on the tally. If you still do it by hand after the trucks are parked, it's crew work."** |

### software.html

| Where | Current | Better |
|---|---|---|
| Build step 02 | "stages you can see: milestones you watch land" | **"It ships in stages you watch land, not a year of silence. The balance bills only when the system executes."** |
| PROOF OF CAST | "…Now it's yours." (misreads as getting YardWorx) | **"…We built it for our own landscaping shop first. It runs every day. So will yours."** |
| CTA | START THE FORGE → | **ONE CALL STARTS THE FORGE →** |
| Calculator badge | ⚒ FORGE INSTRUMENT · FREE | **⚒ THE RENT TALLY · TWO DIALS** |
| Closing CTA | RUN THE HANDOVER — START A PROJECT | **STOP PAYING RENT — BOOK THE CALL** |
| FAQ tiers | "an accessible custom build: a real platform" | **"Foundation at $15,000 forges one system around the bottleneck you name — owned outright."** |

### web.html

| Where | Current | Better |
|---|---|---|
| Hero H1 | THE STOREFRONT AT MIDNIGHT. | **YOUR SITE SLEEPS. YOUR LEADS DON'T.** |
| Hero CTA | BOOK THE BUILD — GET STARTED | **BOOK THE BUILD — LIVE IN 7 DAYS** |
| Standard intro | repeats H2 + hero verbatim | **"Slow to load, invisible to search, silent when the 2am call comes: that's how the lead walks next door. We build the site that answers, and keep it awake with Forge Care from $49/mo: hosting, SSL, security, monitoring, monthly edits."** |
| FAQ template | third verbatim repeat of hero line | **"A template is the same counter a thousand shops rent: your logo swapped onto someone else's page. We forge yours from scratch: cinematic moments nobody in your market has, every one of them aimed at booking the job."** |
| FAQ books jobs | copies STD-02 | **"Yes, that's the standard. Every lead routes straight to your phone; at the top tier, a live agent qualifies the visitor and books the job on the spot, no contact form. Not sure where yours stands? Run the free Autopsy above."** |
| Autopsy button | SEND FOR FULL AUTOPSY → | **GET MY FULL AUTOPSY →** |

### install.html

| Where | Current | Better |
|---|---|---|
| Hero H1 | WIRED AND RUNNING. | **YOUR AI, FINALLY RUNNING.** |
| CTAs ×2 | STAND IT UP — GET STARTED | **STAND IT UP — BOOK THE CALL** |
| KIT-02 body | "deployed on OpenClaw, CrewAI, LangChain, and n8n rails" | **"deployed on open-source rails, so no vendor can ever hold your stack hostage."** (FAQ still lists the rails) |
| Pre-CTA line | "It's stood up and it works before we leave." | **"One system, doing the work you bought it for."** |
| Hero close | restates previous sentence | **"You don't get a login and a shrug. You get a stack your crew is running the day we walk out."** |
| Commissioning close | fourth "wired and running" | **"You tell us what your business does; we wire the machines to do it."** |

### pricing.html

| Where | Current | Better |
|---|---|---|
| H1 | PREMIUM WORK. HONEST PRICES. | **THE PRICE BEFORE THE PITCH.** |
| Software CTA | START THE FORGE → | **START THE FORGE · BOOK THE CALL →** (verb system) |
| Deposit line (×2, also in FAQ) | "the line between buyers who build and browsers who don't" | **"A 25% deposit locks your scope and your price. The forge lights the day it lands; the balance waits until it executes."** |
| Foundation tier | "An accessible custom build" | **"The entry build: a real platform, and the code is yours outright."** |
| Chooser subline | EVERY NUMBER BELOW IS THE REAL ONE | **PICK YOUR BOTTLENECK. EVERY NUMBER IS THE REAL ONE.** |
| Engines close | muddled "second move" sentence | **"Start with one project, or add Forge Care and let it keep earning. Engines are the easy second move after Voice or Web."** |

### about.html

| Where | Current | Better |
|---|---|---|
| Crest intro | about the site's coins | **"An old smith's truth, struck into the rim of every coin on this site: nothing worth forging is safe to forge. Danger is the price of anything worth owning. We read the words two ways — one says move fast, one says the burn is ours to carry. Both are promises to you, not decoration on a coin."** |
| Pillars CTA | JOIN THE CLAN — GET IN TOUCH | **JOIN THE CLAN — BOOK THE FIRST CALL** |
| Closing line | ends on "us" | **"You've been scrolling past the words this whole time. Now you know who carries the burn. Two builds a quarter. One of them can be yours."** |
| Second-reading black-box clause | five framework names | **"so every system we forge is built on open tools you're never locked into, shows its work, and hands the final call back to you."** (superseded by §5.1 Insert B edit if that ships first — one rule, the ticker carries the roster) |
| Pillars H2 | WHAT THE WORDS COST US. | **WHAT THE WORDS COST US. WHAT THEY BUY YOU.** |
| Second reading, last clause | restates Pillar 03 | **"and anything unproven takes its first burns in our shop, not yours."** |

### faq.html

| Where | Current | Better |
|---|---|---|
| "What if it breaks?" | dodges | **"Then we fix it. The smith keeps the burn, never the customer. You watched it work before you owed the balance; every system shows its reasoning, and you can overrule it."** |
| "Whose AI is this?" | jargon leads | **"Whichever fits the job — that's the point. Claude, ChatGPT, or Gemini does the thinking, on open rails — n8n, CrewAI, LangChain — so no vendor can ever hold your shop hostage."** |
| "I already have a…" | "the audit" vague | **"We forge around what works. The Bottleneck Audit — six taps, kill list emailed to you — names what to keep and what to kill before a dollar moves."** |
| "Why only two builds?" | ends on us | **"So we cap the docket at two, and your build gets the whole fire — not a slot in someone's queue."** |
| Closing subline | repeats first answer | **"You've seen the ledger. The only number missing is yours: one call puts it in your hand."** |
| Hero subhead | flat | **"The questions operators actually ask — answered the way we'd say it on the phone. Short. Blunt. No hedging."** |

---

## 7 · Engine + mechanics — what the implementer must not break

Verified against the live index.html source:

- **Story stack (index.html:275–331, 400vh):** the engine enumerates `$$('[data-frame]')` and divides scroll by `frames.length` — swap frame CONTENT and ORDER only, never the count. Stays exactly 4 frames.
- **Tickers (334–349):** no id, no JS binding — safe removal. But it shortens total scroll: recheck all downstream anchor offsets afterward.
- **Arsenal (388–449, 300vh):** reorder slide DOM nodes; scrolljack math is per-slide and untouched. GW-ids travel with slides.
- **Why/Oath (502–528, 300vh):** retune the pin for 3 rungs. **Keep `id="why"`** — it's a positioned marker at `top:44vh` (line 503) targeted by about.html's "YOUR SIDE OF THE OATH →" link, special-cased in the direct-load hash JS (~line 902), and listed in the Descent Gauge BEATS array (line 875). Retune its offset; relabel its BEATS entry "The Oath".
- **Finale (531–578, 200vh → ~100vh):** **keep `id="finale"`** (line 532; linked from faq.html and hash-special-cased) and retune its `top:88vh` offset for the shorter pour. Add **`id="audit"`** on the widget container; optionally repoint faq.html's audit link to #audit.
- **Descent Gauge BEATS (line 875):** `#top, #reframe, #process, #arsenal, #work, #why, #finale` — all seven anchors must survive; update labels, retune tick positions after every height change.
- **Audit-verdict JS (~line 683):** CTA rename map per §3; prices interpolate from the price-lock source, never as literals in the JS.
- **Raw HTML everywhere:** nav flyout, trade band, marquees, all moved copy — never JS-injected (AI crawlers read initial HTML only; strict CSP stays).
- **`data-gw-cta` tags:** the validator requires each page's primary CTA and phone link to survive any rewrite — consolidating the verb must rename labels, never delete tagged elements.
- **One H1** ("FORGED ONCE. SHARPENED FOREVER.") with the duplicate animation layer aria-hidden.
- **Prices** render from the price-lock source only (`data/price-lock.json`); RED-list items (prices, legal, phone, email) never change by copy edit.
- **Meta description + OG tags:** update index.html's description to match the new positioning (≤155 chars, benefit-led), e.g. *"AI systems for trades and small shops: voice agents that answer every call, automations that kill the busywork. Fixed price. Billed when it executes."*

---

## 8 · Launch gates, ship order, measurement

**Gate 0 — blockers (before ANY homepage stage ships):**
1. **The phone number.** +1 (369) 212-1203 has an invalid area code and is flagged *"do not ship until verified"* (SEO-IMPLEMENTATION-PLAN §1.1). The redesigned page trains calling as the primary action — it must not pour intent into a dead number. Until verified: ship **call-second** (every booking CTA → contact.html; tel: link demoted to the availability row, still rendering from its single source). Restore tel: primacy the day the real number lands.
2. **contact.html's form.** It currently submits via `mailto:` — silent failure for webmail users. Replace the action with a real endpoint (the repo has an `/api` dir; Formspree/worker/API all work). The one working conversion path must actually submit. Acceptance criteria before this gate closes: server-side validation and safe handling of submitted contact data, spam protection / rate limiting, explicit success and failure states shown to the visitor, and a same-origin endpoint (the site ships CSP `connect-src 'self'`).

**Ship order (AGENTICPLAN discipline: one measured change per page, hypothesis + metric):**
1. **Stage 1 — destinations absorb** (§5): about.html, work.html, voice.html, install.html, faq.html, contact.html, automations.html. Moved copy exists before homepage cuts. Low risk, independently valuable.
2. **Stage 2 — homepage frame:** nav relabel + SERVICES flyout, hero rewrite, CTA verb consolidation across index/pricing/contact simultaneously (a partial verb migration is worse than today's three meanings).
3. **Stage 3 — story stack swap + tickers removal:** frame reorder/rewrites, tickers out, gauge/anchor retune.
4. **Stage 4 — depth compressions:** arsenal reorder + conversion strip, Forged Here teasers, Oath 5→3, finale rewrite + `id="audit"`, sticky mobile bar, footer band.
5. **Sub-page polish (§6)** can ship any time, one page per experiment.

**Measurement:** north-star = contact-form submissions per 100 sessions. Guardrails that must not regress: bounce rate, LCP, scroll-to-CTA rate (recalibrate the denominator wherever pinned heights change). Post-launch watch: if scroll-to-CTA regresses after Stage 3, the Crafts trade *links* stay demoted to plain text (they already are at launch) and the MEET THE CLAN exit is the next suspect.

**Open items only a human can settle:**
- The real phone number (Gate 0).
- Contact form endpoint choice (Gate 0).
- Founder name + photo for the about page E-E-A-T anchor (the strategy docs call for it; no Person schema until real).
- Cal.com/Calendly (or MCP `book_intro_call`) as a visible scheduler on contact.html — the docs call a frictionless scheduler "the actual 2026 booking mechanism"; this plan routes everything to contact.html, so that page's conversion power is now the ceiling on the whole site.
