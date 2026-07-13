# ICP Strategy — The Focused Five, Their Pages, and How to Market to Them

**Date:** 2026-07-12 · **Companion to:** COPY-ULTRAPLAN.md (homepage journey) and GROWTH-OPS-PLAYBOOK.md (off-site channels).
**Provenance:** 16-agent workflow — template anatomy + page-architecture research (web-sourced, cited) → per-ICP web research → per-ICP page copy → hub draft → 3 adversarial critics (fabrication/consistency, brand voice, ICP-fit + compliance). All 36 critic findings folded into the shipped pages.
**The five ICPs:** solar installers · roofing companies · tattoo studios · cannabis (dispensaries + accessories retail) · sales organizations.

**⚠️ Stat discipline:** every number in this document is **plan-only context with a source**. Page copy carries exactly two sanctioned stats ("small shops miss roughly 6 of 10 calls"; "answer a lead inside five minutes ≈ 9× booking rate") and nothing else. Do not promote plan numbers into copy.

---

## 1 · Single page or multipage? Hub-and-spoke. Decisively.

The research question was whether industry solutions belong on one page or many. The verdict is **hub-and-spoke**: one `industries.html` pillar + dedicated per-ICP spoke pages, bidirectionally linked.

The evidence:

1. **Message match drives conversion.** Generic-destination traffic converts roughly 4–5× worse than dedicated, message-matched landing pages; per-audience page count correlates strongly with conversion lift, strongest in B2B. *(seosherpa.com landing-page statistics; foundrycro.com 2026 benchmarks — plan-only.)*
2. **The whole market already converged on this shape.** Smith.ai (`/industries/roofers-answering-service`), Dialzara, ElevenLabs, AgentZap, and Upfirst all run industries-hub + vertical-page architectures. "AI receptionist for roofers" is a real, contested commercial SERP only a dedicated page can win.
3. **AI engines cite passages, not pages.** Specific self-contained pages beat broad pages for citations even at lower domain authority; ~95% of ChatGPT query fan-out sub-queries have zero traditional search volume, so per-trade pages with answer-first passages are the only way to be present when "AI receptionist for solar installers" gets decomposed. *(authoritytech.io; digitalapplied.com; airops.com fan-out studies — plan-only; corroborated by RESEARCH-NOTES.md §1.)*
4. **Topic-cluster practice rewards the hub.** Pillar within two clicks of the homepage, spokes linked bidirectionally; clustered content draws more organic traffic and holds rankings longer. *(seo-kreativ.de; memorable.design; HubSpot State of AEO — plan-only.)*
5. **The cap on spokes is real.** Google's March + June 2026 scaled-content enforcement and Bing's near-duplicate clustering punish templated page sets. The mitigation is the repo's existing discipline: a small, genuinely unique, hand-written set. Hence only two new receptionist spokes (solar, roofing) + one standalone sales page — not a page per synonym.
6. **Internal constraint.** `gwnav.js` PAGES is the site directory and holds ~11 entries; ten trade spokes can't go in the menu, one hub entry can. The landscaping page already demonstrates the orphaning failure mode (no xlinks row, footer-only reachability).

**A single mega-page loses on all axes:** it can't message-match five buyers, can't win five SERPs, can't be cited for five fan-out families, and would throw away eight already-indexed hand-written spokes.

## 2 · The page set (shipped in this deploy)

| Page | Status | Role | Primary query |
|---|---|---|---|
| `industries.html` | **NEW** | Hub/pillar: five recognition cards, one per ICP; quiet-equity strip for legacy spokes; the cluster's single nav entry | AI receptionist by industry |
| `ai-receptionist-solar.html` | **NEW** (serial GW–01K) | Solar spoke: shared-lead footrace, site-survey setting, confirmations, consent-based revival | AI receptionist for solar companies |
| `ai-receptionist-roofing.html` | **NEW** (GW–01L) | Roofing spoke: storm-surge overflow, insurance-claim intake, inspection booking | AI receptionist for roofers |
| `sales-teams.html` | **NEW** (GW–01M) | Sales-org spoke, deliberately OUTSIDE the receptionist cluster: voice agents for the floor (buyable now, DEPLOY → contact) + SalesWorx routed to the waitlist (work.html#salesworx) | AI voice agents for sales teams |
| `ai-receptionist-tattoo.html` | refreshed | Desk-not-design credo, no-price-quoting stance, deposit/no-show machinery | AI receptionist for tattoo shops |
| `ai-receptionist-dispensary.html` | refreshed | Deplatformed-channel positioning, compliance guardrails, Dutchie/Jane lock-in counter | dispensary answering service |
| `ai-receptionist-cannabis-accessories.html` | refreshed | Accessories/smoke-shop half of the cannabis ICP; wholesale intake | AI phone agent for smoke shops |

Deliberate exclusions: no `ai-sales-training.html` yet — the "AI sales training simulator" query is **deferred until SalesWorx exits waitlist**, at which point a dedicated product page can ship without a DEPLOY imperative. Legacy spokes (HVAC, plumbing, landscaping, barbershop, classic cars) **stay live** — indexed, unique, converting — listed on the hub's quiet-equity strip but no longer featured in ICP-facing surfaces.

**Visibility wiring (same deploy, so nothing ships orphaned):** `gwnav.js` gains one INDUSTRIES entry (hub only — never the ten spokes); index.html footer gains a FORGED FOR band (solar · roofing · tattoo · dispensaries · sales teams · all industries); voice.html's trade row becomes hub + five ICP entries; every spoke carries an "◦ All industries" xlink chip; work.html gains `id="salesworx"` + a reciprocal link; pricing.html gains a raw-HTML `id="voice"` anchor; sitemap.xml + llms.txt updated. **Human follow-ups:** resubmit sitemap in GSC + Bing Webmaster Tools, fire IndexNow; retrofit an xlinks row onto ai-receptionist-landscaping.html (pre-existing gap).

---

## 3 · Solar installers

**Who:** owner / sales manager / ops lead, 5–50 seats, surviving the post-25D contraction: the 30% residential tax credit ended Dec 31 2025; the residential market is contracting ~21% in 2026; CAC is projected up ~40% to $0.84/W; roughly 100 solar companies have folded since 2023, including a top-two national installer in April 2026. *(SEIA/Wood Mackenzie Q2-2026; energysage.com; HBS BiGS; solarequitysolutions.com — all plan-only.)*

**The enemy:** the unanswered ring. Shared leads run $20–100 sold to 3–5 shops simultaneously (exclusive: $100–300), and they convert in a race to the phone. *(pipe.solar — plan-only.)* A missed call is ad spend in the fire.

**What the page sells:** speed-to-lead (agent answers on the first ring, evenings included — best leads call after work), site-survey setting with confirmation cadence so sits actually sit, and consent-based revival of the dead 2024–25 quote database.

**Compliance posture (marketing must never outrun it):** FCC's Feb 2024 ruling puts AI voices under TCPA — outbound requires prior express consent; TCPA exposure is $500–1,500 per call, uncapped, and solar is among the most-sued verticals with active DOJ/FTC enforcement. The page answers "is it legal?" with posture, never a verdict: consent on record, agent names itself as AI, opt-outs honored and logged, no purchased lists, no robocalls.

**Channels (playbook-tier mapping):**
- **SEO/GEO (Tier 0/2):** own "solar answering service," "AI voice agent for solar companies" — the SERP is currently thin vendor listicles; pitch those listicle publishers per playbook Tier 2 #7.
- **Solarpreneur ecosystem:** podcast + community — the densest congregation of setters/closers/owners talking lead-gen and follow-up.
- **LinkedIn:** owners/VPs are processing contraction news in public; missed-call math commentary lands.
- **r/solar (250k+):** listening post for vocabulary and scam-fatigue; 9:1 rule.
- **Trade press:** Solar Power World, pv magazine USA, Solar Builder — contributed pieces on compliant speed-to-lead.
- **RE+ events:** attend regionals cheap; highest decision-maker density.
- **YouTube (Tier 2 #10):** demo short — the agent qualifying a solar inquiry (bill size, roof age, utility).

## 4 · Roofing companies

**Who:** owner-operators in hail-belt/hurricane states (TX, CO, MN, OK, MO, FL, Carolinas), 1–15 crews, storm/insurance-restoration heavy, owner still climbs roofs and runs adjuster meetings. A meaningful slice also sells solar — the spokes cross-link.

**The enemy:** voicemail during the surge. The year is made in the 48–72 hours after a hail event — a window producing ~80% of viable storm leads, with call volume spiking to 80–120 calls/day against a normal 8–15, 30–40% arriving after hours, ~80–85% of voicemail-hitters never leaving a message, and homeowners signing with whoever answers first (~68% by one analysis). Each missed claim call ≈ $12–30k. *(talkroute.com; calljolt.com; coreibytes.com — all plan-only.)*

**What the page sells:** surge coverage (the agent answers every ring at 9pm during the storm), insurance-claim intake (address, adjuster, damage type before the owner drives out), inspection booking, and beating the out-of-state door-knockers to the signature.

**Compliance:** FL SB 76/SB 2-D prohibited-advertisement rules and TX deductible-waiver law (HB 2102) shape what a roofing agent may say about claims — the page keeps claim-talk to intake, never inducement; TCPA posture as above.

**Channels:**
- **SEO/GEO:** "answering service for roofing company," storm-surge queries — vendor listicles (Signpost, Smith.ai et al.) already rank; pitch into them (Tier 2 #7).
- **r/Roofing (80k+) + Facebook groups** (Roofing Masters Network, regional groups): roofers live on Facebook, not LinkedIn; groups are where vendor recs get asked after a bad storm week.
- **RoofersCoffeeShop:** the industry watering hole — directory listing + industry-partner content; "Week in Roofing" newsletter.
- **Win The Storm (Dallas, Oct 2026):** THE storm-restoration event; exactly this ICP in one room. IRE for the broader market.
- **Podcasts/YouTube:** The Roof Strategist, The Roofer Show — owners consume business advice by audio; storm-surge phone-coverage episodes write themselves.
- **Seasonal campaign calendar:** content and outreach timed to hail season by region; the agent demo short is the storm-night call.

## 5 · Tattoo studios

**Who:** owner-operator of a 2–6 chair custom studio, still tattooing 30+ hrs/week, bookings via Instagram DMs + Booksy/Square/Vagaro, no front desk or one they struggle to keep ($15–20/hr, $30–40k/yr — plan-only, ZipRecruiter). Deeply suspicious of AI because of the AI-art fight — the page's credo is **desk, not design**: the agent never draws, never designs, never weighs in on the art.

**The enemy:** the flake. No-show rates run 20–30% without deposits and drop under 5% with them; undeposited studios lose an estimated $15–40k/yr to empty chairs. *(appinstitute.com; tattoogenda.co; useapprentice.com — all plan-only.)* Second enemy: the DM pile — "how much for a half sleeve" can't be answered honestly without a consult, which is why the page never promises price-quoting; it screens the idea into a paid consult.

**What the page sells:** the desk — consult screening (idea, size, placement, reference, budget), deposit policy held firm on every call, confirmation cadence that kills flakes, aftercare answers held strictly to the shop's own written instructions, and the phone answered mid-session when gloves are on.

**Compliance:** state bot-disclosure laws (CA et al.) — the agent identifies as AI up front (which doubles as respect for a craft-proud audience); two-party recording consent states; aftercare stays inside the shop's written instructions (tattooing is state/county regulated).

**Channels:**
- **Instagram first:** Reels demos (the agent booking a consult mid-session) — discovery and proof in one artifact; DMs are the booking inbox this ICP drowns in.
- **Booking-platform ecosystems:** "does it work with Booksy" content — Booksy is the de facto standard; integration-named passages catch high-intent searches.
- **Podcasts:** The Business of Tattooing (Electrum Supply) and peers — owners talking business, not flash.
- **Conventions:** Villain Arts circuit (30+ events/yr) — the one place owners expect to be sold tools.
- **r/TattooArtists:** listen-and-help only; overtly hostile to AI selling — the desk-not-design credo is the only viable opener.

## 6 · Cannabis — dispensaries + accessories retail

**Who:** (a) licensed dispensary owners/GMs, 1–5 stores, Dutchie/Jane/Flowhub menus, counter three-deep; (b) smoke shop / head shop / accessories retailers and brands, brick-and-mortar + Shopify, wholesale-curious. Margin-squeezed (gross margins fell from 52.6% → 42.7% 2021–25; under 25% of operators profitable after 280E — plan-only, nstarfinance.com) and structurally locked out of paid acquisition.

**The enemy:** the voicemail box on the one channel still allowed to ring. Google and Meta ban cannabis ads; carrier SHAFT/10DLC policies filter even transactional "order ready" texts, with first-offense fines of $1–2k per message. *(cannabisregulations.ai; ottertext.com — plan-only.)* The phone carries the rest — and it rings out during the rush.

**Competitive alert (plan-only, PRNewswire June 15 2026):** **Dutchie launched "Consumer AI" including Voice AI** — an AI phone receptionist inside the dominant dispensary POS. The refreshed dispensary page counters on ownership and portability: *"Switch platforms and the agent moves with you: the desk is yours, not a feature rented off somebody's till."* This is now the vertical's central objection ("my POS has voice AI now") and the page meets it head-on while keeping the high-intent integration question ("Does it connect to Dutchie or Jane, and what happens when we switch?") alive for search.

**What the pages sell:** the three calls that eat the day (hours / stock / order status) answered on the first ring; order-ahead status handled without clogging the line; strict compliance guardrails — no medical or legal advice, age checks stay with licensed humans, transcripts kept; for accessories: product/order questions plus wholesale-lead intake.

**Channels:**
- **Organic/GEO is the whole game** — the ICP's own acquisition is organic-first because paid is banned; they find vendors the same way. This makes Gaelworx's playbook disproportionately valuable here: sell the pick in the gold rush where shovels are banned.
- **LinkedIn:** the one major platform where B2B services *to* cannabis operators are workable.
- **Directories' orbit:** Weedmaps (~1.8M visits/mo) and Leafly (~3.8–5.1M) dominate discovery under the ad ban — content in their ecosystem, not ads.
- **Trade press + events:** MJBizDaily, Cannabis Business Times, Ganjapreneur; MJBizCon (Dec 2026, 20k+ attendees) and regionals; CHAMPS for the accessories/smoke-shop half.
- **Communities:** r/cannabusiness, r/budtenders, r/Dispensary; Cannabis Marketing Association / NCIA — CMA members just watched their SMS programs die.

## 7 · Sales organizations

**Who:** founder-led and SMB/mid-market B2B teams, 3–50 reps, run by a VP Sales / sales manager / founder-who-sells. **Not a receptionist sale** — two buyer modes the page routes separately: service buyers (voice agents + automations, buyable now → DEPLOY THE AGENT → contact.html) and product-curious (SalesWorx → waitlist at work.html#salesworx).

**The enemy:** warming up on live pipeline — the first real "no" of the day was a paying prospect, the rep was still shaking off rust, and nobody heard the call. The plan-only numbers behind it: ramp rose to ~5.7 months (2025); managers review under 1% of calls and 73% spend under 5% of time coaching; speed-to-lead reality is ~47-hour average B2B response against a 5-minute window; SDR turnover runs 35–45% against ~14–16-month tenure; quota attainment fell to ~42–46%. *(salesso.com; kixie.com; disprz.ai; chilipiper.com; quotapath.com — all plan-only.)*

**What the page sells:** inbound speed-to-lead (the agent dials the floor in before the lead cools), consent-based outbound list-working (agent identifies itself; opt-outs honored and logged; "anyone promising blast-dialing from rotating numbers is selling you the lawsuit along with the software"), CRM automation — and SalesWorx behind its own clearly marked door.

**Channels:**
- **The Email Roaster is the wedge:** cold-email teardowns are a proven viral format in sales communities (Lavender built a brand on them; 30MPC runs before/afters). Roast clips = LinkedIn + r/sales top-of-funnel for both buyer modes.
- **LinkedIn founder-led content:** ramp, call-review, and warm-up-problem posts in the blacksmith voice.
- **r/sales (~500–600k):** strict anti-promo norms; value posts and roast threads only.
- **SEO on methodology terms:** Sandler / MEDDIC / SPIN / Challenger roleplay + training-cost queries carry commercial intent — content that grades real calls against named methodologies is citation bait.
- **Podcasts/communities:** 30 Minutes to President's Club, GTMnow; RevGenius, Modern Sales Pros, Bravado War Room (listening), Pavilion (relationship-driven).
- **Deferred:** the dedicated "AI sales training simulator" page ships when SalesWorx exits waitlist.

## 8 · Cross-ICP machine + guardrails

- **One thesis, five enemies.** Every ICP page is the missed-call/speed-to-lead thesis wearing that vertical's world: the footrace (solar), the storm (roofing), the gloves (tattoo), the banned channels (cannabis), the warm-up (sales). The two sanctioned stats appear once per page, verbatim.
- **Per-ICP listicle pitching (Tier 2 #7):** "best AI receptionist/answering service for [solar companies / roofers / tattoo shops / dispensaries] 2026" — offer a trial + real call sample. This is still the single highest-ROI off-site move (~81% of AI citations in professional services go to third-party sources).
- **YouTube demo per ICP (Tier 2 #10):** storm-night call, solar lead qualification, mid-session consult booking, dispensary stock question, SalesWorx roast clip.
- **Reddit rotation update (Tier 2 #9):** active effort → r/solar, r/Roofing, r/TattooArtists, r/cannabusiness + r/budtenders, r/sales. Passive → r/HVAC, r/Plumbing, r/lawncare.
- **Review velocity + GBP (Tier 0)** unchanged; reviews now solicited from the five ICPs first.
- **Legal red lines in ALL marketing:** never answer "is it legal / is it compliant" with a verdict; posture only (consent on record, AI self-identification, opt-outs logged, no purchased lists). Never imply the agent gives medical advice, touches age checks, or induces insurance claims (FL/TX roofing rules). The honesty house-style is a competitive asset in all five verticals — say so.
- **Near-duplication watch:** the top structural risk. New spokes were written to share zero sentences with shipped pages (verified by critics); any future spoke must clear the same bar, and the hub's cards stay at recognition depth (40–80 words) so the hub never competes with its own spokes.
- **Measurement:** per-spoke form-submits + assisted conversions; Bing Webmaster AI Performance for cited URLs; watch scroll-to-CTA on the hub. North star stays contact-form submissions per 100 sessions.
