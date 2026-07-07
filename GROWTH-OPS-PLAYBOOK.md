# Gaelworx Growth-Ops Playbook (2026)

The on-site + technical work is shipped (see the diff: robots opened to AI bots,
`ReserveAction` + FAQ/Service schema, self-hosted fonts, IndexNow, MCP pilot at
`/api/mcp`, trade landing pages). **This file is the off-site work that only a
human can do** — accounts, listings, pitches, and profiles. Ordered by
leverage-to-effort. Every claim here traces to the 2026 research pass.

> **North star:** In 2026, being *recommended by AI* tracks branded search
> demand + third-party mentions more than any on-page tweak. So the highest-
> leverage work below is off your own site.

---

## Tier 0 — Do this week (cheap, high leverage)

1. **Bing Webmaster Tools** — verify `gaelworx.com`, submit `sitemap.xml`,
   confirm IndexNow is firing. *Why:* ChatGPT search is ~73% Bing; a page Bing
   hasn't indexed can't be cited by ChatGPT. Then use Bing's **AI Performance
   report** — it shows the exact URLs cited in Copilot/Bing AI (richer than
   Google's). This is your ChatGPT-visibility dashboard.
2. **Google Search Console** — verify, submit `sitemap.xml`, watch the
   **Search Generative AI performance report** (AI Overview / AI Mode
   impressions).
3. **Google Business Profile** — create as a *service-area business* (hide the
   street address, set service areas). It's an entity anchor + a review surface.
   Then start **review velocity**: aim for 2–3 fresh reviews/week and *respond
   to every one* (responders get ~68% more profile clicks). Review recency beats
   review count.

## Tier 1 — Become an entity Google/AI recognizes (2–4 months to a Knowledge Panel)

4. **Wikidata item** for "Gaelworx" — this feeds Google's Knowledge Graph
   (which Gemini is trained on) and is *far* more achievable than Wikipedia.
   Include: instance-of (business/organization), industry, founder, location,
   official website, and the `sameAs` links below. **Do NOT attempt a Wikipedia
   article** — a young agency won't clear notability and it'll be deleted.
5. **Consistent profiles with identical name/description** (the `sameAs` set):
   LinkedIn Company Page, Crunchbase, plus the socials already in your schema.
   Same name, same one-line description everywhere — consistency > volume.
6. **Founder as an entity** — a real LinkedIn profile + bylined author bio;
   link founder ↔ company. E-E-A-T for a services brand runs on a real person.

## Tier 2 — Get cited where AI actually pulls from

7. **⭐ Third-party "best AI receptionist / answering service" listicles — the
   single highest-ROI move.** In professional services **~81% of AI citations go
   to third-party sources**, and your *own* "we're #1" listicle backfires (AI
   Overviews recommend competitors 69% of the time on self-serving lists). So:
   pitch the reviewers who already publish these roundups (search
   `best AI receptionist for [trade] 2026`), offer a free trial + a real
   call-sample, and get Gaelworx added. Repeat per trade.
8. **Digital PR — founder-run, no agency.** Answer journalist queries 2–3×/week
   on **Featured** (featured.com), **Source of Sources** (free), and **Qwoted**.
   Each published answer = a backlink *and* a brand mention in trusted content —
   the two signals AI weighs, from one action.
9. **Reddit presence** (the #1 cited domain across every AI engine). Real
   account, **9:1 value-to-promo rule**, ~60–90 days of genuine help before any
   mention. Live in r/smallbusiness, r/HVAC, r/Plumbing, r/lawncare, r/barber,
   r/tattoo, r/cannabis-business subs — answer "how do I stop missing calls / is
   an AI answering service worth it" honestly. Spam = bans + dead threads.
10. **YouTube** — one short (2–4 min) demo/week: the voice agent answering a
    real trade call. Write the transcript yourself (don't trust auto-captions);
    keyword-clear titles. LLMs cite YouTube transcripts heavily.
11. **B2B review platforms** — create listings on **G2, Capterra, Clutch,
    Trustpilot** and gather a handful of *real* client reviews. These surface in
    "best X" recommendation answers. Never buy or incentivize fake reviews
    (detectable + penalized).

## Tier 3 — Agent-readable frontier (the MCP pilot is already in the repo)

12. **Give the booking path a real scheduler** — wire a non-JS Cal.com/Calendly
    into `contact.html` (agentic browsers like ChatGPT Operator fill it on the
    user's behalf — the actual 2026 booking mechanism). Then set `LEAD_WEBHOOK_URL`
    in Vercel env so the MCP `book_intro_call` tool forwards leads live.
13. **Submit the MCP server** (`/api/mcp`, already deployed):
    - **Claude Connectors Directory** — submit for review (privacy policy, 3
      working examples, docs, test creds, domain signing).
    - **ChatGPT Apps (Apps SDK)** — build the App wrapper when self-serve
      submission opens.
    - **MCP Registry** — publish `.well-known/mcp/server.json` via the
      `mcp-publisher` CLI with DNS TXT verification for `com.gaelworx`. This is
      the real catalog path (feeds PulseMCP, mcp.so, Smithery).
14. **Wire live availability** — when ready, connect Google Calendar free/busy
    to `get_available_slots` and a datastore to `book_intro_call` (the calendar
    tool currently proposes standard windows; see `MCP-SPEC.md`).

## Measurement stack (track cited URLs + conversions, NOT "share of voice")

- **Bing Webmaster Tools → AI Performance** (exact cited URLs — best signal).
- **GSC → Search Generative AI** (AI Overview/AI Mode impressions).
- **Vercel logs** — watch AI bots: GPTBot, OAI-SearchBot, PerplexityBot,
  ClaudeBot, Google-Extended.
- **GA4 referrals** from chatgpt.com / perplexity.ai / gemini — these visitors
  convert ~7% (near paid-search levels).
- Optional low-cost tracker: **Peec AI**.

## Hard DON'Ts (bright-line penalty triggers — SpamBrain / Helpful Content / Scaled Content Abuse)

- Hidden text / white-on-white / keywords behind images / stuffed alt text → **deindex risk**.
- Keyword stuffing, cloaking, doorway pages.
- Bought links / PBNs / link exchanges; paid brand mentions to game LLMs.
- Fake or incentivized reviews.
- Mass AI-generated thin pages (**this is why the trade pages are a small,
  genuinely-unique set — not hundreds of templated near-duplicates**).
- `llms.txt` is kept but does ~nothing for citations (97% of files get zero AI
  requests) — don't invest more in it, and don't sell it to clients as an
  AI-visibility feature.

---
*Everything above the "off-site" line is already live in the codebase. This
list is the human loop that compounds it.*
