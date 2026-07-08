# Research Notes — GEO/AEO/AI-Visibility, 2026

Raw research briefs behind `GROWTH-OPS-PLAYBOOK.md` and the Phase 2 implementation.
Four passes, run directly (web search + fetch), each scoped to a different
question. Kept verbatim as source material — the playbook is the distilled,
actionable version; this is the evidence underneath it.

---

## 1. GEO / AI-citation mechanics — what gets a page cited by name

**The reframe:** ranking ≠ being cited. By March 2026 only **38%** of AI-Overview
citations came from top-10 organic results (76% eight months earlier) — a single
well-structured passage can get cited even off a page that doesn't "rank."
([subscribepr.com](https://subscribepr.com/blog/how-to-rank-in-google-ai-mode/))

**Top tactics, ranked:**
1. **Third-party listicle inclusion is the single highest-leverage move.** In
   professional services, **~81% of AI citations go to third-party sources**
   (19% self-promo); commercial "best X" queries cite listicles ~40% of the
   time. AI Overviews cite self-serving listicles but then **recommend
   competitors 69% of the time** — so building your own "we're #1" page
   backfires. ([wix.com/studio/ai-search-lab](https://www.wix.com/studio/ai-search-lab/research/content-types-most-cited-by-llms), [searchengineland.com](https://searchengineland.com/google-ai-overviews-cite-self-serving-listicles-recommend-competitors-480573))
2. **Reddit is the #1 cited domain across every engine** — Perplexity draws
   ~46.7% of its top-10 citations from Reddit; Gemini barely touches it (0.1%).
   9:1 value-to-promo rule; ~60–90 days of genuine participation before any
   mention. ([searchengineland.com](https://searchengineland.com/ai-search-engines-cite-reddit-youtube-and-linkedin-most-study-473138), [tryprofound.com](https://www.tryprofound.com/blog/ai-platform-citation-patterns))
3. **Original statistics + proprietary data** lift AI visibility up to **40%**
   (Princeton/GaTech/AI2/IIT-Delhi, 10k queries, KDD'24 — the "Statistics
   Addition / Cite Sources / Quotation Addition" levers).
   ([arxiv.org/abs/2311.09735](https://arxiv.org/abs/2311.09735))
4. **Structure for query fan-out**: AI Mode decomposes one query into many —
   AirOps found **89.6%** of prompts triggered 2+ sub-queries and **95%** of
   ChatGPT's fan-out queries had zero traditional search volume. Self-contained
   passages answering sub-questions competitors ignore get cited even with no
   keyword volume. Being retrieved ≠ cited — 85% of retrieved pages were never
   cited. ([airops.com](https://www.airops.com/report/influence-of-retrieval-fanout-and-google-serps-in-chatgpt), [searchengineland.com](https://searchengineland.com/chatgpt-retrieved-vs-citations-study-471606))
5. **Bing is ChatGPT's retrieval layer** — ChatGPT search shares ~73% overlap
   with Bing; OAI-SearchBot only reads the initial HTML response (no JS
   rendering) — a real edge for this static-HTML site over JS-framework
   competitors. ([tryrankly.com](https://www.tryrankly.com/blogs/how-chatgpt-search-works), [yoast.com](https://yoast.com/chatgpt-search/))
6. **YouTube** is a top-5 cited domain via transcripts/descriptions (AIO top-10:
   ~18.8%). Write transcripts by hand — don't trust auto-captions.
7. **G2/Capterra** surface in recommendation queries (ChatGPT top-10 ~6.7%,
   Perplexity ~4.0%).
8. **Entity building** — Google's own new LLM patent frames the goal as
   "teaching AI who you are." Wikipedia is ChatGPT's #1 source overall, but
   article notability is out of reach for a small agency — **Wikidata is the
   achievable proxy.** ([searchengineland.com](https://searchengineland.com/google-llm-patent-seo-teaching-ai-480625))

**Myths / overrated (debunked with evidence):**
- **`llms.txt` does ~nothing.** Ahrefs, 137K domains: **97% of files got zero
  AI requests** in May 2026. Google's Gary Illyes (Jul 2025): doesn't support
  it, isn't planning to. John Mueller compared it to the discredited meta
  keywords tag. ([ahrefs.com/blog/llmstxt-study](https://ahrefs.com/blog/llmstxt-study/))
- **FAQPage rich results are dead** (Google removed the SERP feature May 7,
  2026) — the schema still helps AI *understand* content, just no visual
  feature. HowTo schema has been deprecated since Sept 2023.
- **Precise "magic number" passage-length claims** (134–167 words, specific
  cosine-similarity thresholds) trace only to low-authority SEO blogs with no
  primary source — treat as hype; the *principle* (short self-contained
  passages) is sound, the exact numbers are not.
- **"AI Share of Voice" as a headline KPI is increasingly seen as a vanity
  metric** — track cited URLs + referral conversion instead.
- Keyword stuffing / fluency-only rewriting: Princeton found these did **not**
  improve (and can hurt) AI visibility.

**Retrieval map:** ChatGPT search → Bing index + OAI-SearchBot (HTML-only,
~73% Bing overlap). Google AI Overviews/AI Mode/Gemini → Google's index (AI
Mode runs Gemini 2.5 query fan-out, 8–12+ sub-queries). Perplexity → its own
crawler + heavy Reddit licensing. Claude (with search) → its own
Claude-SearchBot + partner search. **Practical implication: win in both Bing
and Google, not just Google.**

**Measurement:**
- **Bing Webmaster Tools → AI Performance report** (expanded June 2026) shows
  exact cited URLs + grounding queries — richer than GSC's equivalent.
- **GSC → Search Generative AI performance report** (launched June 2026,
  impressions-only in v1).
- **Server log analysis** for GPTBot/OAI-SearchBot/PerplexityBot/ClaudeBot —
  verify via reverse-DNS (Cloudflare caught Perplexity crawling behind a
  generic Chrome UA after its declared bot was blocked).
- **GA4 referrals**: ChatGPT referral traffic converts at **7.1%**, second only
  to paid search (7.8%). ([similarweb.com](https://www.similarweb.com/blog/marketing/geo/gen-ai-stats/))

---

## 2. The agent-readable web — MCP, discovery, and agentic booking

**Ground truth that reframes the whole area:** No consumer AI engine
auto-discovers a random business's MCP server. ChatGPT requires a user to
manually add a connector (Settings → Connectors → Developer Mode) or an
approved app; Claude requires a custom-connector paste or Connectors Directory
listing. **Building `/api/mcp` earns nothing until a human adds it or a
directory approves it** — it is not a discovery magnet, it's a transaction
layer for users who already chose you.
([workos.com](https://workos.com/blog/everything-your-team-needs-to-know-about-mcp-in-2026))

`/.well-known/mcp/server-card.json` is a live proposal (SEP-1649/SEP-2127,
active MCP "Server Card" Working Group) — **no major client consumes it in
production yet.** Ship it anyway (near-zero cost, future-proofs discovery).
([modelcontextprotocol.io/community/working-groups/server-card](https://modelcontextprotocol.io/community/working-groups/server-card))

**Ship now (real support today):**
- Allow retrieval/search/user AI bots in robots.txt — Rutgers/Wharton (Dec
  2025): blocking them cost publishers **23.1% total traffic decline** with no
  reliable citation reduction.
- Server-rendered JSON-LD `@graph` in raw HTML (not JS-injected) — agents
  read the initial HTML response only.
- `FAQPage` + visible Q&A mirroring the schema.
- Deterministic, machine-readable pricing in both visible text and
  `Offer`/`PriceSpecification` schema.
- **A frictionless, agent-navigable booking URL is the actual 2026 booking
  mechanism** — agentic browsers (ChatGPT Operator/Atlas, Perplexity Comet,
  Gemini) fill a clean scheduler form on the user's behalf. No new standard
  required. This is the money path, ahead of any protocol.
- List the server in the **official MCP Registry** (`server.json` + DNS
  verification) — the canonical metadata repo backed by Anthropic, GitHub,
  PulseMCP, Microsoft; feeds downstream catalogs (PulseMCP, mcp.so, Smithery).

**Emerging / pilot only:**
- Remote MCP server + submission to **Claude Connectors Directory** and
  **ChatGPT Apps (Apps SDK)** — real value only after approval; until then it's
  a credible demo (and, for Gaelworx specifically, sellable collateral for the
  AI-installation offering).
- Microsoft NLWeb (`/ask` + `/mcp` over Schema.org data) — real spec, thin
  consumer-agent consumption so far; low priority for pure discovery.
- WebMCP (`navigator.modelContext`) — W3C Draft Community Group Report
  (explicitly *not* a standard as of Feb 2026); Edge/Chrome only so far;
  irrelevant to a static marketing site.
- OpenAI's restaurant-reservation conversion spec (`GET /v1/businesses` +
  a `restaurant_reservation` tool) shows where agentic booking is headed —
  restaurant-scoped and beta/partner-only today, but worth mirroring the shape.

**Vaporware — don't invest:**
- `agents.json` (Wildcard AI) — stalled, v0.1.0, 3 contributors, last push
  Aug 2025.
- `ai-plugin.json` / ChatGPT plugins — dead, superseded by Apps SDK/MCP.
- OpenAI Instant Checkout — physical goods only (Etsy/Shopify), and by March
  2026 OpenAI itself moved it toward Apps. Not applicable to a free intro call.
- Agentic *payment* protocols (Stripe ACP, Google AP2, Visa/Mastercard agent
  tokens) — irrelevant to booking a free call; only matters if a fixed-price
  product becomes agent-purchasable later.

**Robots/bot-access recommendation:** allow essentially everything — search
bots (OAI-SearchBot, ChatGPT-User, Claude-SearchBot/-User, PerplexityBot),
Googlebot (never block — feeds AI Overviews *and* AI Mode), and training bots
(GPTBot, ClaudeBot, Google-Extended) since the goal is maximum model
awareness, not IP protection. Don't gate booking/pricing behind JS-only
rendering or aggressive bot-fight rules.

---

## 3. Entity SEO + digital PR — becoming a recognized brand

**Entity-build path (2–4 months to a Knowledge Panel with consistent work):**
1. **Wikidata item** — far more achievable than Wikipedia and feeds the
   Knowledge Graph directly (which Gemini is trained on). Do **not** attempt a
   Wikipedia article for a young small agency — it will fail notability and
   get deleted.
2. **Consistent `sameAs` profiles** — LinkedIn Company Page, Crunchbase, plus
   existing socials — identical name/description everywhere. Consistency
   beats volume.
3. **Founder-as-entity** — real LinkedIn profile linked to the company; E-E-A-T
   for a services brand runs on a real, findable person.
4. **KPEB framework** cited by practitioners: Known (named consistently across
   trusted sources), Proven (independent references), Exact (unambiguous),
   Bridged (site ↔ structured data ↔ external profiles explicitly linked).

**Branded-demand:** branded search volume is cited as the single strongest
correlate of LLM brand visibility (0.334 correlation in one 2025 report) —
higher than any on-page factor. Legitimate ways to build it: consistent
naming everywhere, PR placements that use the exact brand name, founder
visibility.

**Digital PR / link-earning (founder-executable, no agency):**
- **Featured** (featured.com, formerly Terkel) — fast turnaround journalist
  queries.
- **Source of Sources** — free HARO-successor.
- **Qwoted** — 25,000+ journalists, premium coverage.
Each placement is a backlink *and* a brand mention in trusted content — the
two signals AI weighs — from one action; no other tactic produces both.

**Safe programmatic content — the guardrail actually used in this repo:**
Google's **March 2026 core update explicitly targeted scaled content abuse**;
sites publishing hundreds/thousands of templated AI pages without editorial
oversight saw **50–90% traffic/ranking drops**. The enforced distinction is
unique value vs. volume — a large set of pages with genuinely original
data/testing can rank; a small set of near-duplicates triggers spam signals
regardless of count. **This is why the 8 new trade pages here are a small,
hand-written set (unique narrative/integrations/calculator/FAQ per page), not
a templated trade×geo matrix.**
([digitalapplied.com](https://www.digitalapplied.com/blog/programmatic-seo-after-march-2026-surviving-scaled-content-ban))

---

## 4. Local/trades tactics + the old-tricks → new-tricks teardown

**Local/GBP verdict for a national B2B agency:** still worth creating as a
service-area business (hide street address, define service areas) — it's an
entity anchor + review surface even without a storefront. **Review velocity
beats review count**: 2–3 fresh reviews/week outperforms 500 stale ones;
responding to reviews correlates with meaningfully more profile clicks.

**Old trick → 2026 white-hat equivalent (the direct answer to "keywords
behind photos"):**

| Old trick | Works in 2026? | What catches it | White-hat equivalent |
|---|---|---|---|
| Hidden text / white-on-white / keywords behind images / zero-size font | **No — deindex risk** | SpamBrain (AI system, sharpens every update cycle); March 2026 spam update enforced harder than ever | Honest, descriptive alt text; visible FAQ content; entity-rich body copy; structured data |
| Keyword stuffing / exact-match density | No | Same (SpamBrain + Helpful Content signals) | Semantic/topical coverage, real entity mentions, natural language matching search intent |
| Cloaking / doorway pages | No — explicit spam policy | Google spam policies (developers.google.com/search/docs/essentials/spam-policies) | Real landing pages with unique value (see trade pages above) |
| Meta keywords tag | Dead signal, ignored | N/A | Title/description/schema carry that role now |
| Link buying / PBNs / link exchanges | No | Link spam update / manual actions | Digital PR (Featured/Source of Sources/Qwoted), earned unlinked mentions |
| Exact-match domains / spammy anchors | No, minimal-to-negative value | Anchor-text spam detection | Natural anchor text, brand-name anchors |
| Mass AI-generated thin pages | No — the 2026 version of old-school spam | **Scaled Content Abuse policy**, March 2026 core update (50–90% drops observed) | A small set of genuinely unique, hand-written pages (this repo's approach) |

**Underused legitimate edges worth stealing:** strategic internal linking
between related content (done here via the `gw-xlinks` cross-link chips on
every trade page), topical-authority clusters, schema features most
competitors skip (`FAQPage`, `BreadcrumbList`, now `ReserveAction`), original
first-party data as content, being first on new SERP/AI-answer formats.

**Hard don'ts (bright-line, current enforcement):** hidden text, keyword
stuffing, cloaking, doorway pages, bought links/PBNs, fake or incentivized
reviews, mass AI-generated thin pages, paid brand mentions to game LLM
answers.

---

*Distilled into action items in `GROWTH-OPS-PLAYBOOK.md`. On-site/technical
items from this research are implemented in the codebase (see git log); the
rest are the human-only off-site levers.*
