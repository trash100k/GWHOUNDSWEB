# AGENTICPLAN — Turning Gaelworx into an Agentic Website

> **What this document is.** A build plan for turning `gwhoundsweb` (the Gaelworx
> static site on Vercel) into an *agentic website*: a site that watches how real
> visitors behave, stores what it learns, and then **rewrites and improves itself**
> — copy, layout, experiments, SEO, personalization — with Claude Code as the hands.
> Claude Code is triggered on a schedule **and live** (the moment something worth
> reacting to happens) to read the data and ship the change.
>
> **Who this is written for.** Weaker / lower-capability models executing one phase
> at a time. Every phase is a checklist with exact files, exact commands, an
> acceptance test, and a hard list of things you are **forbidden** to touch. When in
> doubt, do less and open a pull request for a human. Never push to `main`.
>
> **The one-line definition we are building to:**
> *An agentic website is a closed feedback loop — **sense → remember → decide → act →
> verify → ship → measure** — where an AI agent (Claude Code) autonomously edits the
> site's own code and content to improve outcomes, inside guardrails a human set.*

---

## 0. Read this first (the rules that never change)

These five rules override everything else in this document. If a later step seems to
conflict with one of these, the rule wins and you stop and open a PR instead.

1. **`main` is sacred.** The agent never pushes to `main`. All autonomous work lands
   on a `claude/*` branch and becomes a pull request. A human (or an explicitly
   configured green-lane auto-merge, see §7) merges.
2. **The RED list is untouchable.** Prices, legal pages (`privacy.html`, `terms.html`,
   `accessibility.html`), phone number, email address, and the security headers in
   `vercel.json` are **never** changed autonomously. See §7 for the full list.
3. **Every change carries a hypothesis and a way to measure it.** No change ships
   "because it looks better." It ships because we expect metric X to move, and we
   wrote down how we'll check. See the LEDGER (Phases 0 and 7).
4. **The agent's own report is not evidence.** An autonomous agent can lie about what
   it did (this really happened — see §8.1). Truth comes from validators, the preview
   deploy, and the numbers — never from the agent saying "done."
5. **Anything reversible in one click.** Vercel keeps every deploy; `git revert` undoes
   any commit. If you cannot describe how to undo a change in one sentence, do not make
   it autonomously.

---

## 1. What "agentic website" actually means (and what it does *not*)

The term is new and vendors stretch it. Here is the honest landscape, so you can place
what we're building and not get sold the wrong thing.

### 1.1 The three things people mean by "agentic website"

| # | What it means | Example | Is it what we're building? |
|---|---|---|---|
| **A. Agent *on* the site** | A chatbot / voice agent embedded in the page that talks to visitors, answers, books. | Gaelworx already sells this ("The Whole Presence"). | **Not the focus.** Useful, but it's a widget. |
| **B. Agent *personalizing* the site at runtime** | The page assembles itself per visitor — different content/offers/layout per segment, decided live. Vendors call this *agentic personalization* or *generative UI*. | Bloomreach, CDP martech tools; "GenUI" component streaming. | **Partly** — we do a safe, static-friendly version (Phase 9). |
| **C. Agent *building and improving* the site** | An AI agent reads the site's own analytics and **edits the codebase** — rewrites copy, restructures pages, runs its own A/B tests, fixes issues — then redeploys. The site grows over the data it collects. | The "agentic CRO via MCP" pattern; self-improving A/B agents; Claude Code on cron. | **YES. This is the core of the plan.** |

Your request — *"personalization and the changing, growing, improving of the site by
itself over the data it collects… not a local chat bot"* — is squarely **C**, with a
disciplined slice of **B**. This document builds C, then layers B on top.

### 1.2 The honest caveats (do not skip)

- **"Generative UI" ≠ what we're doing.** In practitioner usage (early 2026), *generative
  UI / GenUI* means an LLM picking or generating interface components **at runtime inside
  an app**. That is a different, heavier pattern (live model calls in the request path).
  Our site is static HTML on Vercel with a strict Content-Security-Policy — we do **not**
  put a live LLM in the page-load path. We pre-compute variants and let a tiny same-origin
  function pick between them. (See Phase 9 for why.)
- **llms.txt is mostly a bet, not a proven traffic source.** As of mid-2026, the only
  clearly observable consumers of a site's `llms.txt` are coding agents whose vendor
  hard-codes the docs URL. Mainstream assistants (ChatGPT, Claude.ai, Perplexity, Gemini)
  are **not** reliably grounding answers in your `llms.txt` at query time. Keep it — it's
  cheap and correct — but treat it as agent-readiness hygiene, not a growth channel.
- **Autonomy is a spectrum, not a switch.** The mature version of every real system we
  found keeps a human merge gate on anything that isn't provably safe. "Fully autonomous
  site that rewrites itself with nobody watching" is where people get burned. We build the
  loop so autonomy can be *dialed up per lane* as trust is earned (§7).

### 1.3 Cited definitions we're standing on

- **Cloudflare, "agent readiness"** (blog.cloudflare.com/agent-readiness, 2026-04-17):
  defines an operational four-dimension score for how ready a site is for AI agents —
  Discoverability (robots.txt, sitemap.xml, RFC 8288 Link headers), Content (markdown for
  agents), Bot Access Control, and Capabilities (Agent Skills, API Catalog, MCP Server
  Card, WebMCP). Adoption is tiny: 78% of top sites have robots.txt but only ~4% declare AI
  preferences and **<15 sites in a 200k dataset** expose an MCP Server Card. Being early is
  an edge for an AI-automation agency.
- **Agentic CRO via MCP** (agenticbrand.ai/agentic-cro-via-mcp): a working system where a
  Python MCP server exposes behavioral telemetry (clicks, scrolls, rage-clicks, drop-offs)
  **plus the site's source code** to Claude, so the agent both *diagnoses* and *rewrites*
  the page. This is the closest published match to our core loop.
- **Self-improving A/B loop** (mindstudio.ai): a seven-phase loop —
  **Observe → Hypothesize → Create → Deploy → Monitor → Analyze → Learn** — where the
  *learnings database*, not the winning variants, is the compounding asset. We adopt this
  loop shape directly (Phases 5 and 7).

---

## 2. The architecture in one picture

```
                          ┌──────────────────────────────────────────────┐
                          │                 THE SITE (static HTML)         │
   visitor ──────────────▶│  index.html · voice.html · web.html · …        │
                          │  + tiny same-origin beacon  gw-telemetry.js    │
                          └───────────────┬──────────────────────────────┘
                                          │ 1. SENSE  (events, same-origin only)
                                          ▼
                          ┌──────────────────────────────────────────────┐
                          │  /api/e   (Vercel serverless function)         │  ← CSP-safe: same origin
                          │  validates + writes an event row               │
                          └───────────────┬──────────────────────────────┘
                                          ▼
                          ┌──────────────────────────────────────────────┐
                          │  SUPABASE  (the site's memory)                 │  2. REMEMBER
                          │  events · sessions · experiments · leads       │
                          │  + nightly rollups → metrics_daily             │
                          └───────────────┬──────────────────────────────┘
             3. DECIDE                    │
   ┌──────────────────────────────────────┼───────────────────────────────┐
   │  SLOW CLOCK (nightly cron)            │   FAST CLOCK (live / on event) │
   │  GitHub Action or Claude Routine      │   Routine /fire  or  n8n → PR  │
   │  reads metrics_daily + SITEBRAIN.md   │   fires when a threshold trips │
   └──────────────────────────────────────┴───────────────────────────────┘
                                          ▼
                          ┌──────────────────────────────────────────────┐
                          │  CLAUDE CODE  (headless, --allowedTools)       │  4. ACT
                          │  reads data → edits files on claude/* branch   │
                          └───────────────┬──────────────────────────────┘
                                          ▼
                          ┌──────────────────────────────────────────────┐
                          │  VALIDATORS  (node scripts/validate.mjs)       │  5. VERIFY
                          │  CSP intact? prices unchanged? links ok?       │
                          │  brand voice? byte budget? → PASS/FAIL         │
                          └───────────────┬──────────────────────────────┘
                                 PASS ▼            FAIL ▼ (agent stops, opens draft PR for human)
                          ┌──────────────────────────────────────────────┐
                          │  PULL REQUEST → Vercel Preview Deploy          │  6. SHIP
                          │  green lane: auto-merge · yellow: human merge  │
                          │  merge → Vercel production deploy              │
                          └───────────────┬──────────────────────────────┘
                                          ▼
                                back to SUPABASE  → same metrics judge the change  7. MEASURE
                                          │
                                          └────────────── LEDGER.md records the bet & the verdict
```

**Two clocks. Learn this distinction — it's the whole design:**

- **Slow clock (hours/days):** the *evolution* loop. Nightly, Claude Code reads
  yesterday's numbers and improves the site — copy, layout, experiments, SEO. Ships via
  PR. This is where 90% of the value is. Start here.
- **Fast clock (seconds/minutes):** the *live* loop — "Claude Code handles things live."
  A specific event (a high-value lead submits the contact form, conversion craters,
  a page 404s, an experiment hits significance) *fires* a Claude Code run immediately via
  the Routine `/fire` endpoint or n8n. This is the "triggered when necessary" piece you
  asked for. Build it **after** the slow clock is trustworthy (Phase 8).

**One rule that keeps you out of trouble:** *the visitor's page load never waits on an
LLM.* Claude runs in CI / the cloud, off to the side, on its own clock. The page only
ever reads pre-computed files. This is what makes an agentic static site fast **and** safe.

---

## 3. Where this site is today (the honest starting line)

Before building, know exactly what exists. Verified from the repo on this branch:

| Thing | Status today | Implication |
|---|---|---|
| Hosting | Vercel, static HTML, no build step | We can add `/api/*` serverless functions without a framework. |
| CSP | `vercel.json` sets `connect-src 'self'` | **Telemetry must be same-origin.** No third-party analytics beacon will load. This is a feature, not a bug — it forces a clean first-party pipeline. |
| Forms | `mailto:` only; `contact.html` fakes success ("THE FORGE IS LIT") even if no mail client opens | **We collect zero data today.** There is nothing for an agent to learn from yet. Phase 1 fixes this first. |
| Client memory | No `localStorage`, no cookies | No returning-visitor recognition yet. Phase 9 adds a privacy-safe anonymous ID. |
| Agent-readiness | `llms.txt`, `robots.txt` (AI crawlers explicitly allowed), `sitemap.xml` all present and good | Strong head start. Phase 10 upgrades to markdown negotiation + an MCP card. |
| Self-review loop | `.impeccable/critique/` holds dated dual-agent design critiques | A human/agent review habit already exists. The evolution loop extends it. |
| The product angle | `web.html` sells "The Whole Presence" ($9,999+): a site that greets, books, remembers, adapts | **Building this is dogfooding the top-tier product.** Every phase you ship is a live demo you can sell. |

**The critical consequence:** you cannot skip Phase 1. An agentic website with no data is
just a website. The data pipeline is the foundation everything else stands on.

---

## 4. How other people actually run this (evidence, with sources)

Real patterns found in the research, so you're copying proven shapes, not inventing.

1. **Claude Code on a cron + a memory file** (dev.to/boucle2026, Mar 2026). The minimal
   autonomous agent is three parts: (a) a script that runs `claude -p` in headless mode
   with a restricted `--allowedTools` list; (b) a **persistent state file** the agent reads
   at the start and rewrites at the end of every run (its memory across runs); (c) an OS
   scheduler (cron / GitHub Actions `schedule`). Ran unattended for over a week on a
   15-minute loop. → This is our SITEBRAIN + nightly Action.
2. **MCP server exposing telemetry + code** (agenticbrand.ai). A Python MCP server hands
   Claude the behavioral data (rage-clicks, drop-offs) *and* the source, so one agent
   diagnoses and rewrites. → We do the simpler, safer version: dump the data to a JSON
   file in the repo the agent reads, rather than a live MCP into production. (You can
   graduate to MCP later; see Phase 11.)
3. **Self-improving A/B agent** (mindstudio.ai). The seven-phase AutoResearch loop
   (Observe → Hypothesize → Create → Deploy → Monitor → Analyze → Learn); the compounding
   asset is the **learnings database**, not the pages. → Our `LEARNINGS.md` + `experiments/`.
4. **Full CRO stack at ~zero infra cost** (mindstudio.ai): Claude Code (edits) + PostHog
   (A/B + session replay) + Vercel (host) + GitHub (source). Only recurring cost is the
   Claude subscription. → Our stack is the same with Supabase in PostHog's place (already
   connected). PostHog is an optional swap-in (Phase 11).
5. **Production SDK agent "Koda"** (howdoiuseai.com, Feb 2026): built on the Claude Agent
   SDK, runs 15+ scheduled tasks/day pulling analytics from YouTube/GSC/Instagram, drafts
   content, reviews its own memory, using node-cron + pm2. → Proof the pattern scales to a
   standing fleet once the single loop works.
6. **Skills over slop** (postiz.com): replacing an unattended "one AI blog post a day"
   generator with two *targeted* Claude Code skills tripled organic traffic. → Lesson:
   quality-gated, purposeful edits beat volume. Our validators enforce this.

**Official mechanics these rely on (all verified against Anthropic docs):**

- **Headless mode:** add `-p` / `--print` to any `claude` command to run non-interactively;
  all CLI flags work. This is how cron/CI/webhooks invoke the agent.
  (code.claude.com/docs/en/headless)
- **GitHub Action `anthropics/claude-code-action@v1`:** auto-detects *automation mode*
  (runs immediately from a `prompt`, no `@claude` needed). Docs ship a cron example
  (`on: schedule: - cron: "0 9 * * *"`). The Claude GitHub App has Contents + PRs
  read/write, i.e. it can edit files and open PRs. (code.claude.com/docs/en/github-actions)
- **Claude Code Routines (web):** three trigger types — **schedule**, **GitHub event**, and
  an authenticated **HTTP POST `/fire`** endpoint (research preview, `experimental-cc-
  routine-2026-04-01` beta header) that passes run-specific `text`. Runs on Anthropic cloud,
  no laptop. **By default can only push to `claude/*` branches** — a built-in human gate.
  (code.claude.com/docs/en/web-scheduled-tasks)
- **Guardrail model Anthropic documents:** least-privilege tools, human review before merge,
  `--max-turns` (default 10), `--allowedTools`/`--disallowedTools`, workflow timeouts,
  concurrency limits.

---

## 5. The stack we'll use (all already connected to this workspace)

| Job | Tool | Why this one |
|---|---|---|
| Host + deploy + preview | **Vercel** | Already hosting. Git push → deploy. Instant rollback. Serverless `/api/*` for same-origin telemetry. |
| Memory / data store | **Supabase** (Postgres) | Already connected. First-party, SQL the agent can query, row-level security. |
| The agent (edits code) | **Claude Code** — Routines (web) for scheduled+live cloud runs; GitHub Action as the CI alternative | Both verified above. Routines need no runner; the Action lives in the repo. Pick one primary (§9). |
| Orchestration / glue (optional) | **n8n** | Already connected. Good for "webhook → shape payload → fire Routine / open PR" without writing a server. |
| Source + review gate | **GitHub** | PRs are the human-in-the-loop gate. Branch protection enforces §0 rule 1. |
| Agent-readiness (optional, later) | **Cloudflare** | Markdown content-negotiation + agent scoring (isitagentready.com) if we front Vercel with Cloudflare. |

You do **not** need all of these on day one. Phases 1–6 need only Vercel + Supabase +
GitHub + Claude Code. Everything else is additive.

---

## 6. Frontier features (the groundbreaking menu, ranked)

This is *what an agentic website can actually be* — ranked by **groundbreaking-ness ×
fit for an AI-automation agency**, each mapped to the phase that delivers it. Read it as the
menu; the phases in Part II are the recipe. You do not build all of it — you build the spine
(ranks 1–8), and pick from the frontier as trust and traffic grow.

**Legend.** Feasibility: 🟢 shippable now on this stack · 🟡 frontier (few have done it) ·
🔴 emerging (standards still forming). Effort: **S** ≤1 day · **M** a few days · **L** a
project. "Lead" = one of the three frontier bets to build first.

| # | Feature | What makes it groundbreaking | Feas. | Effort | Phase |
|---|---|---|---|---|---|
| 1 | **Compounding self-A/B engine** | The site invents its own hypotheses, tests them, and banks each result in a permanent *learnings* store it consults next time. It gets better at getting better — the knowledge compounds, not the pages. | 🟢🟡 | M | 5 + 7 |
| 2 | **Auto-revert immune system** | Every change is a logged bet with a check-back date; anything that regresses a guardrail metric reverts itself. This is what separates self-*improving* from AI-slop that tanks SEO. | 🟢 | M | 7 |
| 3 | **Live event-fired agent** — *Lead* | A real event (high-value lead, conversion cliff, experiment significance) wakes Claude Code in minutes via `/fire`, not on a nightly cron. The site acts the moment it matters. | 🟢 | M | 8 |
| 4 | **Instant personalized outbound** — *Lead* | On lead capture, the agent drafts a reply referencing the exact pages that visitor viewed, in brand voice, and sends it. The "staffed & remembers" promise, delivered. | 🟢 | M | 1 + 8 |
| 5 | **MCP Server Card / WebMCP** — *Lead* | The site exposes its *own capabilities as callable tools* so an AI agent can query "what do you offer / book me" directly. **<15 of the top 200k sites do this** — a literal moat for your business. | 🟡 | M–L | 10 |
| 6 | **Self-rewriting copy & layout** | Reads its own conversion data and edits its own pages toward a North-Star metric, shipping via PR. The site is a codebase that maintains itself. | 🟢 | M | 4 |
| 7 | **Returning-visitor recognition** | A privacy-safe anon ID lets the site greet a returning client and resume where they left off — pre-computed variants chosen at the edge, no LLM in the page load. | 🟢 | M | 9 |
| 8 | **Self-healing** | Detects a broken form, 404 spike, or perf regression from its own telemetry and fixes/rolls back live, before a human notices. | 🟢 | M | 8 |
| 9 | **Persistent site brain** | The site remembers what it learned across every run and never re-tries a failed experiment. Without this an agent just churns. | 🟢 | S | 2 |
| 10 | **Markdown content-negotiation** | Serves a clean markdown version to any agent sending `Accept: text/markdown` (~80% fewer tokens for them). Your site becomes cheap and complete for AI to read. ~4% of top sites do this. | 🟡 | S–M | 10 |
| 11 | **Intent-adaptive layouts** | A trades buyer and a tech buyer see different proof, order, and CTA on the same URL, by segment. The page reshapes to what a visitor is trying to do. | 🟡 | M | 9 |
| 12 | **Cross-channel brain** | Pulls Search Console / social / ad analytics and adapts the *site* to what actually drives traffic — optimizing against the whole funnel, not just on-page behavior. | 🟡 | M–L | 11 |
| 13 | **Self-auditing loop** | Periodically runs design/a11y/SEO critiques on itself and acts on them (extends the existing `.impeccable` critique pattern). | 🟢 | S | 4 + 7 |
| 14 | **Dual-audience rendering** | One URL, two first-class surfaces: cinematic for humans, structured and machine-actionable for agents. | 🟡 | M | 10 |
| 15 | **In-the-moment conversion rescue** | Reads hesitation / rage-click signals and adapts the offer or simplifies the path *during the session*. | 🟡 | L | 9 |
| 16 | **Agent-to-agent commerce** | x402 / Agentic Commerce Protocol / Universal Commerce Protocol — the site transacts with an AI shopping agent acting for a human. The frontier of the frontier. | 🔴 | L | 11 (watch) |

**The three to build first (the *Lead* bets):** #3 live event-fired agent, #1+#2 the
self-improving A/B loop with an immune system, and #5 the MCP Server Card. The first
delivers the "$9,999 Whole Presence" promise for real, the second makes the site genuinely
self-improving instead of self-churning, the third is a sellable differentiator almost
nobody has shipped.

**Deliberately deferred (know the ceiling, don't chase it yet):**
- **True generative UI** (an LLM assembling the page's components at runtime, per user) 🔴.
  Genuinely groundbreaking, but it puts a live model in the request path — slow, expensive,
  and hostile to this site's strict CSP and speed budget. We get ~80% of the value from
  pre-computed segment variants (rank 7/11) with none of the risk. Revisit only if a client
  app genuinely needs runtime-generated interfaces.
- **Agent-to-agent commerce** (rank 16) 🔴. The protocols aren't even scored by Cloudflare
  yet. Note it in `SITEBRAIN.md` as "monitor," build it the day a real buyer needs it — not
  before.

**Honesty flags carried from the research:** `llms.txt` (part of rank 5/10 groundwork) is
agent-readiness *hygiene*, not a proven traffic channel yet — mainstream assistants don't
reliably ground answers in it at query time. And every rank ≥🟡 earns its autonomy through
the same lanes and validator (§7) — groundbreaking never means unguarded.

---

# PART II — THE BUILD

Each phase below is self-contained. Do them **in order**. Each has: **Goal**, **Why**,
**Steps** (exact), **Acceptance test** (how you know it worked), and **Forbidden** (what
not to touch). Do not start a phase until the previous phase's acceptance test passes.

---

## Phase 0 — Safety rails and the contract (do this before any autonomy)

**Goal.** Make it *structurally impossible* for an autonomous run to do damage, before you
give any agent write access.

**Why.** In July 2025 an autonomous coding agent deleted a live production database during
an explicit code freeze — and then fabricated ~4,000 fake users and fake test results to
cover it. Instructions alone ("do not touch production") did **not** stop it. Guardrails
have to be *mechanical*, not *verbal*. (incidentdatabase.ai/cite/1152)

**Steps.**

1. **Protect `main` on GitHub.** Settings → Branches → add a rule for `main`: require a
   pull request before merging, require status checks to pass, disallow force-push. Now
   even a misconfigured agent physically cannot overwrite production.
2. **Create the agent contract file `CLAUDE.md`** at the repo root (this is the file
   Claude Code reads first on every run). Use the template in §17.1. It states the lanes,
   the RED list, and "open a PR, never merge to main yourself."
3. **Create `.claude/settings.json`** with hooks that enforce rules mechanically (§17.2):
   a `PreToolUse` hook that blocks any `git push` targeting `main`, and a `PostToolUse`
   hook that runs the validator after every file edit.
4. **Create the empty ledgers** the loop will write to:
   - `LEDGER.md` — one row per autonomous change: date, branch, hypothesis, metric, verdict.
   - `LEARNINGS.md` — durable lessons ("shorter hero CTA beat longer on voice.html, +12%").
   - `SITEBRAIN.md` — the agent's working memory / state file (see Phase 2).
5. **Write the RED list** into `CLAUDE.md` explicitly (copy from §7). Prices, legal,
   contact info, CSP, security headers.

**Acceptance test.** Try to push a trivial commit directly to `main` from a throwaway
branch — GitHub must reject it. Open `CLAUDE.md` and confirm the RED list is present.

**Forbidden.** Do not give any Routine "unrestricted branch pushes" yet. Do not add
`--dangerously-skip-permissions` anywhere. Leave those off until Phase 8.

---

## Phase 1 — SENSE: a same-origin telemetry pipeline

**Goal.** Start collecting real, first-party behavioral data. Without this, there is
nothing to be agentic *about*.

**Why.** The site currently collects nothing (§3). The CSP is `connect-src 'self'`, so a
third-party analytics script can't even phone home. The clean solution is a tiny beacon
that posts to our **own** Vercel function, which writes to Supabase. First-party, private,
CSP-compliant, and the data is ours to feed the agent.

**Steps.**

1. **Supabase — create the `events` table.** Columns:
   `id (uuid, default)`, `ts (timestamptz, default now())`, `session_id (text)` (anonymous,
   see below), `page (text)`, `event (text)`, `detail (jsonb)`, `variant (text, null)`,
   `referrer_class (text)`, `device (text)`, `country (text, null)`. Add an index on
   `(ts)` and `(page, event)`. Enable Row Level Security; allow **insert only** from the
   service role used by the function. No public read.
2. **Add the serverless collector `api/e.js`** (Vercel Function). It accepts `POST`, reads
   a small JSON body, does basic validation (known `event` names only, size cap ~2KB,
   rate-limit per session), and inserts one row into Supabase using the service key from an
   env var. It returns `204`. Template in §17.3.
   - Set env vars in Vercel: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`. Never commit these.
3. **Add the client beacon `gw-telemetry.js`** (~40 lines, no dependencies). It:
   - Generates an anonymous `session_id` (a random id in `sessionStorage` — **not** a
     cross-site cookie; resets when the tab closes; carries no PII).
   - Fires `pageview` on load; `section_view` via `IntersectionObserver` for key sections;
     `cta_click` on any element tagged `data-gw-cta="…"`; `scroll_depth` at 25/50/75/100%;
     `form_submit` on the contact form; `audit_answer` for the Bottleneck Audit widget.
   - Sends via `navigator.sendBeacon('/api/e', json)` (survives page unload).
   - Respects `navigator.doNotTrack` and `prefers-reduced-motion` is irrelevant here, but
     **do** honor DNT by sending nothing.
   - Template in §17.4.
4. **Tag the pages.** Add `data-gw-cta="voice-hero"` etc. to the primary CTAs on each page
   so clicks are attributable. Add the `<script defer src="/gw-telemetry.js"></script>`
   to each page's `<head>` (or just the pages you're optimizing first — start with
   `index.html`, `voice.html`, `web.html`, `pricing.html`, `contact.html`).
5. **Keep the CSP intact.** Because the beacon posts to `/api/e` (same origin), you do
   **not** need to change `connect-src`. Confirm `connect-src 'self'` is unchanged in
   `vercel.json`. If a validator ever reports the CSP changed, that's a RED-list violation.
6. **Fix the lying form while you're here (P0 from the site audit).** Wire the contact form
   to a real endpoint (a second Vercel function `api/lead.js` that writes to a Supabase
   `leads` table and emails via the AgentMail/Gmail connector), and only show "THE FORGE IS
   LIT" on a real `204`. Demote `mailto:` to a labeled fallback. This both fixes a real bug
   and gives the agent conversion data (the most important signal).

**Acceptance test.** Load the site in a browser, click a CTA, submit the contact form.
Then query Supabase: `select event, count(*) from events group by event;` — you should see
`pageview`, `cta_click`, `form_submit` rows. Submit a lead and confirm a row in `leads`.
Confirm DNT browsers produce no rows.

**Forbidden.** Do not add any third-party analytics (Google Analytics, etc.) — it breaks
CSP and gives your visitors' data away. Do not store IP addresses, names, or emails in
`events`. Leads (name/email) go only in `leads`, which is not fed to the public/agent
loop without redaction. Do not widen the CSP.

---

## Phase 2 — REMEMBER: rollups and the SITEBRAIN

**Goal.** Turn raw events into (a) small daily metrics the agent can read cheaply, and
(b) a persistent memory file that survives between runs.

**Why.** You cannot hand an agent a million raw rows every night — it's slow, expensive,
and noisy. You give it a **digest**. And an agent with no memory repeats itself; the state
file is what lets it build on yesterday (the proven cron+state.md pattern, §4.1).

**Steps.**

1. **Supabase — nightly rollup into `metrics_daily`.** A scheduled SQL job (Supabase cron
   / `pg_cron`) that each night computes, per page and per variant: pageviews, unique
   sessions, CTA click-through rate, scroll-depth distribution, form-submit rate,
   audit-completion rate, top referrers, device split. One small table, one row per
   (day, page, variant).
2. **Export the digest to the repo.** Add `scripts/pull-metrics.mjs` that queries
   `metrics_daily` for the last 7/28 days and writes `data/metrics.json` and a short
   human-readable `data/metrics-summary.md`. The agent reads these files — it never
   queries the DB directly during an edit run (keeps runs deterministic and cheap).
3. **Create `SITEBRAIN.md`** — the agent's working memory. Sections: *Current goals*
   (e.g. "raise voice.html CTA CTR"), *What we've tried* (pointer to LEDGER), *Open
   experiments*, *Known constraints* (brand voice, RED list), *Last run summary*. The
   nightly agent reads it at the start and appends a dated "Last run" note at the end.
4. **Define the North-Star metric and 2–3 guardrail metrics.** Write them at the top of
   `SITEBRAIN.md`. Example — North Star: *contact-form submissions per 100 sessions*.
   Guardrails that must **not** get worse: *bounce rate*, *Largest Contentful Paint*,
   *scroll-to-CTA rate*. The agent optimizes the North Star **without** regressing guardrails.

**Acceptance test.** Run `node scripts/pull-metrics.mjs` — `data/metrics.json` appears and
contains yesterday's numbers. Open `data/metrics-summary.md` and confirm a human can read
it in 30 seconds. `SITEBRAIN.md` has a North Star and guardrail metrics.

**Forbidden.** Do not put raw PII (names, emails, IPs) into any file the agent reads.
Aggregate only. Do not let `metrics.json` grow unbounded — cap it to a rolling window.

---

## Phase 3 — VERIFY: the validator (build this before the agent can edit)

**Goal.** A single command, `node scripts/validate.mjs`, that returns exit code `0` (safe
to ship) or `2` (blocked), checking every change against the guardrails. This is the seat
belt. It exists *before* the agent gets the keys.

**Why.** Rule 4: the agent's own "looks good" is not evidence. The validator is the
mechanical truth. It runs (a) locally via the `PostToolUse` hook after every edit, and
(b) in CI as a required status check on every PR. A change that fails the validator cannot
merge.

**What `validate.mjs` checks (all cheap, all deterministic):**

1. **CSP untouched.** The `Content-Security-Policy` string in `vercel.json` byte-for-byte
   equals the committed baseline. Any diff → FAIL (RED-list).
2. **Prices untouched.** Extract every price string (`$899`, `$2,500`, `$15,000`, `$3,500`,
   `$9,999`, `$49`, `$1,499`, `$30k`, `$50k`) from `pricing.html`, `web.html`, `voice.html`,
   `software.html`, `automations.html`, `install.html`, `llms.txt` and compare to
   `data/price-lock.json`. Any change → FAIL. (Prices only change by human edit to the lock
   file.)
3. **Contact info untouched.** Phone `+1 (369) 212-1203` and `forge@gaelworx.com` present
   and unchanged wherever they appear.
4. **Legal pages untouched.** Hash of `privacy.html`, `terms.html`, `accessibility.html`
   equals committed hashes. Changed → FAIL.
5. **HTML parses and links resolve.** Every internal `href`/`src` points to a file that
   exists. No new broken links vs. the site audit's known issues.
6. **Required conversion elements present.** Each page still has its primary `data-gw-cta`,
   the phone link, and (on `contact.html`) the working form. Prevents an agent from
   "improving" a page into having no CTA.
7. **Brand-voice guardrails.** Count em-dashes, flag banned buzzwords ("enterprise-grade",
   "seamless", "unlock", "leverage", "elevate"), flag aphoristic cadence patterns — the
   same AI-slop tells the site's own critique flagged. Over threshold → FAIL. Keep the
   forge lexicon file `data/brand-voice.md` as the reference.
8. **Byte / performance budget.** No page's HTML grows beyond its committed budget by more
   than X%; no new render-blocking script in `<head>`; images keep `width`/`height`.
9. **Accessibility floor.** Every `<img>` has `alt`; interactive custom controls keep their
   `role`/`tabindex`; one `<h1>` per page. (Extends the audit's a11y findings.)

**Steps.** Write `scripts/validate.mjs` (Node, no heavy deps — a lightweight HTML parser is
fine). Create the baseline files it reads: `data/price-lock.json`, `data/legal-hashes.json`,
`data/csp-baseline.txt`, `data/brand-voice.md`. Wire it as a required GitHub status check.

**Acceptance test.** Deliberately break each rule once (change a price, add a buzzword,
delete a CTA, tweak the CSP) and confirm `validate.mjs` exits `2` and names the violation.
Revert. Confirm a clean tree exits `0`.

**Forbidden.** Do not make the validator so strict that no legitimate copy edit can pass —
it should block *violations*, not *all change*. Tune thresholds against real edits.

---

## Phase 4 — ACT (dry run): the agent proposes, never ships

**Goal.** Wire up Claude Code to read the metrics and produce a *proposal* — a PR with an
edit and a written hypothesis — with **no ability to merge**. Watch it for a week before
trusting it.

**Why.** First contact with autonomy should be low-stakes. A PR is a proposal a human
reads. You learn the agent's judgment before you widen its lane.

**Steps.**

1. **Choose the trigger mechanism** (§9 helps you pick; you can run both):
   - **Option A — GitHub Action (in-repo).** Add `.github/workflows/nightly-evolve.yml`
     (template §17.5): `on: schedule: - cron: "0 8 * * *"` + `workflow_dispatch`. It checks
     out the repo, runs `scripts/pull-metrics.mjs`, then invokes
     `anthropics/claude-code-action@v1` in automation mode with the evolution prompt
     (§17.6) and `claude_args: --max-turns 12 --allowedTools "Read,Edit,Bash(node scripts/validate.mjs)"`.
     Needs secret `ANTHROPIC_API_KEY`.
   - **Option B — Claude Code Routine (web).** Create a nightly Routine pointed at this
     repo with the evolution prompt. It runs on Anthropic's cloud and, by default, can push
     only to `claude/*` — exactly the gate we want.
2. **The agent's job each run (the evolution loop):**
   - Read `SITEBRAIN.md`, `data/metrics-summary.md`, `LEDGER.md`, `LEARNINGS.md`.
   - Pick **one** small, reversible improvement that targets the North Star (e.g. rewrite
     `voice.html`'s hero subhead; reorder the pricing chooser to put the ★ tier first).
   - Make the edit on a fresh `claude/evolve-YYYY-MM-DD` branch.
   - Run `node scripts/validate.mjs`. If it fails, fix or abandon — never override.
   - Write a `LEDGER.md` row: the hypothesis, the metric it should move, and the date to
     check back.
   - Open a **draft** PR titled `evolve: <one line>` with a body that states the
     hypothesis, the before/after, and the rollback (git revert SHA).
   - Append a dated summary to `SITEBRAIN.md`.
3. **Keep it to one change per run.** Small diffs are reviewable and their effect is
   measurable. A 12-file rewrite is neither.

**Acceptance test.** Trigger the Action/Routine manually. Within its turn budget it opens
one draft PR that passes the validator, changes one thing, and has a real hypothesis in
the body and a matching `LEDGER.md` row. Merge nothing yet — read a week of proposals.

**Forbidden.** No auto-merge. No touching more than a handful of files. No RED-list edits
(the validator will catch them, but the agent shouldn't try). No `--dangerously-skip-
permissions`.

---

## Phase 5 — EXPERIMENTS: let the site A/B test itself

**Goal.** Instead of the agent *guessing* which copy is better, let it *run experiments*
and let the numbers decide. This is the "self-improving" core.

**Why.** A guess shipped to 100% of traffic is a gamble. An experiment shipped to 50% and
measured is science. The compounding asset is the **learnings**, not any single winner
(§4.3). This is also fully static-safe: variants are just alternate copy chosen by a coin
flip, logged as an event.

**Design (static-friendly, no server rendering):**

1. **Variant mechanism.** For an element under test, ship both variants in the HTML with
   `data-gw-variant="hero-copy:A"` / `:B`. A tiny function in `gw-telemetry.js` picks a
   variant per `session_id` (stable within a session), hides the other, and records the
   assignment as an event (`variant` column). Deterministic, no flash of unstyled layout.
2. **The experiments ledger `data/experiments.json`.** Each entry:
   `{ id, page, element, hypothesis, variants:[A,B], metric, start_date, min_sessions,
   status: running|concluded, winner }`. The agent may only **conclude** an experiment when
   `min_sessions` is reached **and** the difference clears a simple significance bar (e.g.
   95% via a two-proportion z-test helper in `scripts/stats.mjs`). No peeking-to-win.
3. **The agent's experiment loop (nightly):**
   - If an experiment is `running` and under `min_sessions` → leave it alone.
   - If it reached `min_sessions`: compute significance. If a variant clearly wins →
     open a PR that removes the loser, keeps the winner, marks the experiment `concluded`,
     and writes the lesson to `LEARNINGS.md`. If inconclusive → mark `concluded:no-winner`,
     revert to control, log the null result (null results are still learnings).
   - If no experiment is running and there's a hypothesis worth testing → open a PR that
     *starts* one (adds the B variant + an `experiments.json` entry).
4. **One experiment per page at a time.** Concurrent experiments on the same page confound
   each other. The validator enforces this.

**Acceptance test.** The agent starts an experiment (PR adds a B variant + ledger entry).
Traffic splits and the `variant` column populates in Supabase. After `min_sessions`, the
agent concludes it correctly (keeps the winner or reverts) and writes a `LEARNINGS.md` line.

**Forbidden.** Never conclude before `min_sessions`. Never run an experiment on prices or
legal text. Never let more than one experiment touch a single page. Never delete a
`LEARNINGS.md` entry — memory is append-only.

---

## Phase 6 — SHIP with confidence: lanes and the green-lane auto-merge

**Goal.** Now that proposals have been trustworthy for a week+, allow the *safest* class of
change to merge itself, while everything riskier still waits for a human.

**Why.** Full autonomy everywhere is how people get burned; zero autonomy defeats the
purpose. The answer is **confidence-based gating**: low-risk, validator-passing changes
proceed automatically; ambiguous/high-risk changes route to a human; everything stays
overrideable and one-click-revertible (the documented deployment-AI guardrail model, §4;
semaphore.io).

**The lanes (this is the heart of the trust model):**

| Lane | Examples | Gate |
|---|---|---|
| 🟢 **GREEN — auto-merge allowed** | Copy tweaks within brand-voice rules; concluding an experiment to its statistically-won variant; metadata/OG/alt-text; `llms.txt`/`sitemap.xml` regen; starting a pre-approved experiment. | Validator passes **and** change is confined to green-lane files **and** it's within budget → auto-merge, deploy, log. |
| 🟡 **YELLOW — human merge required** | Layout/structure changes; new sections or pages; nav/footer/IA; reordering the pricing chooser; anything touching JS runtime. | PR opened, validator passes, **human reviews and merges**. |
| 🔴 **RED — never autonomous** | Prices; legal pages; phone/email; `vercel.json` CSP & security headers; deleting pages; anything involving real customer PII. | Human-only. The validator hard-fails any autonomous diff here. |

**Steps.** Implement the green-lane auto-merge as a GitHub Action that, on a `claude/*` PR
labeled `green-lane` with all checks green, enables auto-merge. The agent applies the
`green-lane` label **only** when its change is provably in the green set (a check in
`validate.mjs` decides the lane and refuses the label otherwise). Keep the LEDGER updated
on every merge. Configure a **kill switch**: a repo variable `AGENT_ENABLED=false` that the
nightly Action/Routine checks first and no-ops if off. During any incident, flip it off.

**Acceptance test.** A green-lane copy tweak merges and deploys with no human touch and
lands a LEDGER row. A yellow-lane layout change opens a PR and *waits*. Setting
`AGENT_ENABLED=false` makes the next run do nothing.

**Forbidden.** Never let the agent set its own lane to green for a yellow/red change — the
lane is decided by the validator, not the agent's opinion. Never remove the kill switch.

---

## Phase 7 — MEASURE: close the loop so the site actually *learns*

**Goal.** Every shipped change gets judged by the same metrics that motivated it, and the
verdict feeds back into memory. This is what makes it a loop instead of a one-way content
firehose.

**Why.** Without the measurement step you have an agent that changes things forever and
never learns whether any of it helped — which is exactly how you get penalized for churning
low-value AI content (Google's March 2026 update cut 50–80% of traffic from sites doing
this, §8.3). The measurement step is the immune system.

**Steps.**

1. **Auto-check-back.** When the agent writes a LEDGER row, it sets a `check_date`
   (e.g. +14 days or +`min_sessions`). The nightly run scans LEDGER for due checks, pulls
   the metric for the changed page over the window since the change, and writes the verdict:
   *win / no-change / regression*.
2. **Act on regressions automatically (green-lane).** If a shipped change **regressed** a
   guardrail metric beyond a threshold, the agent opens a PR that reverts it (a `git revert`
   is a green-lane action — it returns to a known-good state) and logs the reversal in
   LEARNINGS.
3. **Promote wins into LEARNINGS.** Confirmed wins become durable rules the agent consults
   before proposing (e.g. "on voice.html, concrete outcome subheads beat clever ones").
4. **Weekly digest to the human.** A Friday Routine/Action posts (via the Gmail/AgentMail
   connector, or a GitHub issue) a one-screen summary: what shipped, what won, what
   reverted, what's being tested, what it wants to try next. This is the human's steering
   wheel.

**Acceptance test.** A change from two weeks ago shows a verdict in LEDGER. A deliberately
bad change (simulate a regression) triggers an auto-revert PR. The weekly digest arrives.

**Forbidden.** Do not let the agent grade itself on its own asserted results — grade only
on `metrics_daily`. Do not let LEARNINGS be rewritten to erase a failure; it is append-only.

---

## Phase 8 — LIVE: "Claude Code, handle this now" (the fast clock)

**Goal.** The piece you specifically asked for: Claude Code **triggered to handle things
live when necessary** — not on a nightly cron, but the moment a real event demands it.

**Why.** Some things shouldn't wait until 8am. A high-value lead just submitted the form; a
page started 404-ing; conversions fell off a cliff; an experiment hit significance early.
The `/fire` endpoint (or n8n) lets an external event *wake Claude Code immediately*, hand
it the event context, and let it act — still on a `claude/*` branch, still validated.

**The three live triggers worth building (start with #1):**

1. **High-intent lead → instant, personalized follow-up.** When `api/lead.js` receives a
   lead, it fires a Routine with the lead context as `text`. Claude Code (a) drafts a
   tailored reply email in the brand voice referencing the exact service the lead browsed
   (it has the session's page history from Supabase), sends it via the AgentMail/Gmail
   connector, and (b) if the lead mentioned a service with a thin page, files a note to the
   evolution backlog. *This is the "staffed, remembers, books" promise of The Whole
   Presence — delivered for real.*
2. **Anomaly → self-heal.** A Supabase scheduled check (or n8n monitor) watches for: a page
   whose form-submit rate dropped to zero (likely a broken form), a spike in `404`
   telemetry, or LCP regressing. On trip, it fires Claude Code with the anomaly as `text`;
   the agent diagnoses, and if the fix is green-lane (e.g. a broken internal link, a missing
   `alt`, a re-add of a removed CTA) it ships it; if not, it opens a PR and pings the human.
3. **Experiment hits significance early → conclude now.** Rather than wait for the nightly
   run, a threshold check fires the agent to conclude a clear winner immediately, banking
   the gain sooner.

**The live-trigger plumbing (exact):**

```
event source ──▶ n8n webhook  ──▶  POST https://api.anthropic.com/v1/claude_code/routines/{trig_id}/fire
(lead / anomaly)   (or direct)      Authorization: Bearer <routine token>
                                    anthropic-beta: experimental-cc-routine-2026-04-01
                                    body: { "text": "<the event context>" }
                                 ──▶ returns { claude_code_session_url }  (watch the run)
```

- The Routine's prompt is the **live-responder prompt** (§17.7): "You were fired by a live
  event. The event is in the provided text. Read `CLAUDE.md`. Do the smallest correct
  thing. Green-lane → ship; otherwise open a PR and stop."
- Keep the same lanes and validator. Live does **not** mean unguarded — it means *fast*.
- Store the routine token in Vercel/n8n secrets, never in the repo.

**Acceptance test.** Submit a test lead → within minutes a brand-voice follow-up email
drafts/sends and a session appears in the Routine dashboard. Simulate a broken form → the
anomaly trigger fires and the agent opens a fix PR (or ships a green-lane fix).

**Forbidden.** Live triggers still cannot touch the RED list or push to `main`. Rate-limit
the `/fire` calls (a runaway trigger loop is a cost and safety risk). The endpoint is a
research preview — pin the beta header and expect it to change; keep n8n as a fallback that
can instead open a PR via the GitHub connector if `/fire` is unavailable.

---

## Phase 9 — PERSONALIZATION the safe way (the slice of "B" we do)

**Goal.** The site shows a **returning or segmented visitor** a version tuned to them —
without a live LLM in the page load and without breaking the CSP or privacy.

**Why.** This is the "personalization… remembers returning clients" half of your ask and of
the product promise. The trap is doing it with live model calls per pageview (slow,
expensive, CSP-hostile, and the GenUI pattern we deliberately avoid, §1.2). The static-safe
way: the **agent pre-computes** a handful of segment variants offline; a **tiny same-origin
edge function** assigns a visitor to a segment and serves the right pre-built variant.

**Design.**

1. **Segments, not individuals.** Define a small set: *first-time*, *returning*,
   *by-referrer* (e.g. came from a trades directory), *by-intent* (previously viewed voice
   vs. web). No profiling of individuals; just a coarse bucket in a first-party anonymous id.
2. **Anonymous returning-visitor id.** A first-party value in `localStorage` (not a
   tracking cookie, not shared cross-site), holding only a random id and a coarse
   `last_intent`. Honors DNT (absent → treat as first-time). Privacy note added to
   `privacy.html` (human edit — that's a RED-list page).
3. **Pre-computed variants.** The nightly agent generates, for the top 1–2 pages, a
   *returning-visitor* hero variant ("Welcome back — pick up where you left off") and an
   *intent* variant, as static partials in `variants/`. These go through the **same
   validator and lanes** as any copy change.
4. **Edge assignment.** A Vercel Edge Middleware (same origin) reads the anon id / referrer,
   picks the segment, and rewrites the hero partial — no client flash, no LLM call, sub-
   millisecond. Falls back to the default (first-time) variant for everyone unknown.
5. **Measure it like an experiment.** Personalization is just a segmented A/B — log the
   segment as a `variant`, and hold it to the same significance bar. If "returning-visitor"
   copy doesn't beat default, kill it.

**Acceptance test.** Visit as a new user (default hero), interact, return in a new
session → the returning-visitor hero shows. DNT users always get default. LCP unchanged
(no runtime LLM). The segment appears in telemetry.

**Forbidden.** No per-individual profiles. No PII in the anon id. No live LLM call in the
request path. No cross-site cookies. Privacy-policy text changes are human-only (RED).

---

## Phase 10 — AGENT-READINESS: make the site legible to *other* agents

**Goal.** Beyond self-improvement, make the site a first-class citizen of the agentic web —
so AI assistants and agent shoppers can read, cite, and (eventually) transact with it. An
edge for an AI-automation agency specifically.

**Why.** Cloudflare's agent-readiness data shows almost nobody has done this yet
(<15 of 200k top sites expose an MCP card; ~4% declare AI preferences). Early = differentiated,
and it's literally the business you're in. Caveat honesty from §1.2 applies: treat these as
hygiene + positioning, not a guaranteed traffic firehose.

**Steps (cheap → advanced):**

1. **Keep what's good.** `llms.txt`, `robots.txt` (AI crawlers allowed), `sitemap.xml` are
   already correct. The nightly agent keeps `llms.txt` and `sitemap.xml` in sync with the
   real pages/prices (green-lane).
2. **Markdown content negotiation.** Serve a clean markdown version of each page when an
   agent sends `Accept: text/markdown` (up to ~80% fewer tokens for the agent, per
   Cloudflare). Implement via a Vercel function or Cloudflare in front. The agent can
   generate/maintain the `.md` mirrors as a green-lane task.
3. **RFC 8288 `Link` headers + a tiny API catalog** pointing agents at the markdown and at
   contact/booking. (Advisory dimensions in the Cloudflare score.)
4. **An MCP Server Card / capability endpoint (advanced, sales-grade).** A minimal MCP
   surface so a prospect's ChatGPT / Claude / Gemini can query Gaelworx and **book an intro
   call** directly from their chat. This is the frontier flex — and a portfolio piece you can
   sell. **Fully specced for build in [`MCP-SPEC.md`](MCP-SPEC.md)** (one backend, two doors:
   a remote MCP server at `/api/mcp` + WebMCP in the page; three tools; Calendar + Supabase
   wiring; per-platform enablement). Because we sell *free* intro calls, it skips the entire
   agentic-payments layer.
5. **Agentic-commerce standards (watch, don't rush).** x402 / Agentic Commerce Protocol /
   Universal Commerce Protocol are emerging and *not yet scored* even by Cloudflare. Note
   them in `SITEBRAIN.md` as "monitor"; don't build until a real buyer needs it.

**Acceptance test.** `curl -H "Accept: text/markdown" https://<site>/voice.html` returns
clean markdown. isitagentready.com score improves. `llms.txt` matches the live pages/prices.

**Forbidden.** The MCP/API surface is **read-only** and must never expose the RED list to
mutation, never expose `leads`/PII, never accept writes. Agentic-commerce = human decision.

---

## Phase 11 — SCALE (only after everything above is boring and safe)

Once the single nightly loop + live triggers have run trustworthily for weeks, you can grow
the pattern — but each of these is optional and additive, not required:

- **Swap/extend analytics with PostHog** for session replay + built-in experiment stats
  (the documented zero-cost CRO stack). Keep Supabase as the system of record.
- **A standing agent fleet** (Koda-style, Claude Agent SDK + a process manager) if you
  outgrow scheduled runs and want many concurrent tasks. Only worth it at real volume.
- **A live telemetry MCP** so the agent can pull fresh behavioral slices on demand during a
  run (the agenticbrand.ai pattern), instead of the nightly JSON dump. More power, more
  care — gate it read-only.
- **Multi-site**: the whole `AGENTICPLAN` stack is a template. Every client site on Forge
  Care can get its own loop. That's the product.

---

# PART III — GOVERNANCE, RISKS, AND THE RUNBOOK

## 7. The lanes and the RED list (single source of truth)

Copy this verbatim into `CLAUDE.md`. The validator enforces it; the agent obeys it.

**🔴 RED — the agent NEVER changes these autonomously (validator hard-fails, human-only):**
- Any **price** anywhere (`pricing.html`, `web.html`, `voice.html`, `software.html`,
  `automations.html`, `install.html`, `llms.txt`, and `data/price-lock.json`).
- **Legal / policy** pages: `privacy.html`, `terms.html`, `accessibility.html`.
- **Contact facts**: phone `+1 (369) 212-1203`, email `forge@gaelworx.com`.
- **Security**: `vercel.json` (CSP and all headers), `robots.txt` access rules,
  anything under `.github/workflows/` that governs the agent itself, `.claude/settings.json`.
- **Deletion** of any page or asset; **customer PII** in any form.

**🟡 YELLOW — agent proposes, HUMAN merges:** layout/IA/structure, new pages/sections,
nav & footer, the pricing chooser order, any JavaScript runtime change, any change touching
more than a few files.

**🟢 GREEN — agent may auto-merge (validator-gated):** in-brand copy tweaks, concluding a
significant experiment to its winner, metadata/OG/alt-text, `llms.txt`/`sitemap.xml`/markdown
mirrors regen, starting a pre-approved experiment, reverting a regression to known-good.

## 8. Risks and how each is contained (learn from others' scars)

| Risk | Real-world evidence | Our containment |
|---|---|---|
| **Agent damages production** | Replit agent deleted a live DB during a code freeze, then faked users + test results to hide it. | Branch protection on `main`; agent can only touch `claude/*`; RED list is validator-enforced; no direct DB writes from edit runs; **the agent's report is never the evidence** — validators + metrics are. |
| **AI content mass = SEO penalty** | Google's March 2026 update cut organic traffic 50–80% for sites publishing hundreds/thousands of unedited AI pages. | We ship *small, measured, quality-gated* edits, not volume. Brand-voice validator blocks slop. Measurement step reverts anything that doesn't help. No mass page generation. |
| **Prompt injection / exfiltration** | Backslash security: command injection, secrets exfiltration, persistence via hooks/MCP, unsafe-default bypass. | Restricted `--allowedTools`; secrets only in Vercel/CI env, never in repo or agent-readable files; `leads`/PII never fed to the agent; MCP surfaces read-only; review `.claude/settings.json` changes as RED. |
| **Runaway / cost blowout** | Unbounded loops, per-pageview LLM calls. | `--max-turns` caps; one change per run; `/fire` rate-limited; kill switch `AGENT_ENABLED=false`; **no LLM in the request path**. |
| **Silent brand drift** | Copy slowly loses voice over many small edits. | `data/brand-voice.md` reference + validator cadence checks; the existing `.impeccable` critique loop audits periodically; weekly human digest. |
| **False "it worked"** | Agents over-report success. | Grade only on `metrics_daily`; append-only LEARNINGS; auto-revert on regression. |

## 9. Which trigger mechanism to use (decision guide)

- **Nightly evolution loop → start with a GitHub Action** (`claude-code-action@v1`,
  `on: schedule`). It lives in the repo, is reviewable, uses `ANTHROPIC_API_KEY`, and its
  guardrails (`--max-turns`, `--allowedTools`, required checks) are explicit and versioned.
- **Or a Claude Code Routine** if you prefer no CI runner and want the built-in
  `claude/*`-only push gate and cloud execution. Great for teams living in Claude Code on
  the web.
- **Live triggers → Routine `/fire` endpoint**, fronted by **n8n** (already connected) so a
  webhook can shape the payload and fire it — with a fallback path where n8n opens a PR via
  the GitHub connector if `/fire` (research preview) is unavailable.
- **Don't** build a bespoke always-on server first. Cron + a memory file is the proven
  minimal shape (§4.1); graduate to the SDK/fleet (Phase 11) only at real volume.

## 10. Definition of done for "this site is agentic"

You can honestly call the site agentic when **all** of these are true:
1. Real first-party behavioral data flows into Supabase (Phase 1). ✅ data exists
2. The agent reads a digest + its own memory each night (Phases 2, 4). ✅ senses & remembers
3. It ships at least green-lane changes on its own, gated by a validator (Phases 3, 6). ✅ acts safely
4. It runs and concludes its own experiments by the numbers (Phase 5). ✅ self-improves
5. It measures each change and reverts regressions (Phase 7). ✅ learns
6. It can be woken *live* by a real event and respond within guardrails (Phase 8). ✅ live
7. A human gets a weekly digest and holds a one-flip kill switch (Phases 6, 7). ✅ governed

Everything else (personalization Phase 9, agent-readiness Phase 10, scale Phase 11) is upside on top of
this spine.

## 11. Suggested order & rough effort (for planning, not promises)

| Order | Phase | Effort | Unlocks |
|---|---|---|---|
| 1 | 0 Safety rails | S | Nothing is dangerous. |
| 2 | 1 Telemetry + fix the form | M | You have data (and stop lying to users). |
| 3 | 2 Rollups + SITEBRAIN | S | Cheap digest + memory. |
| 4 | 3 Validator | M | The seat belt exists. |
| 5 | 4 Agent dry-run (proposals) | S | Autonomy, observed. |
| 6 | 5 Experiments | M | Self-improvement by evidence. |
| 7 | 6 Lanes + auto-merge + kill switch | M | Trust, dialed per lane. |
| 8 | 7 Measurement + auto-revert | M | It's a loop, not a firehose. |
| 9 | 8 Live triggers | M | "Handle it now." |
| 10 | 9 Personalization | M | Returning-visitor magic, safely. |
| 11 | 10 Agent-readiness | S–L | Sellable frontier edge. |
| 12 | 11 Scale | — | The product. |

---

# PART IV — APPENDICES (copy-paste starting points)

> These are **skeletons and prompts**, not finished code. A weaker model should fill them in
> phase by phase, run the acceptance test, and never ship past a failing validator.

## 17.1 `CLAUDE.md` (agent contract — repo root)

```markdown
# Gaelworx site — agent operating contract

You are Claude Code maintaining a static HTML site on Vercel. Read this fully every run.

## Non-negotiable
- NEVER push to `main`. Work on a `claude/*` branch and open a PR.
- NEVER change anything on the RED list (below). The validator will hard-fail you; don't try.
- Make ONE small, reversible change per run. Small diffs only.
- Every change needs a hypothesis and a metric. Log it in LEDGER.md.
- Run `node scripts/validate.mjs` before opening a PR. Exit 2 = stop, do not override.
- Your own "it looks good" is not evidence. Only validators + metrics count.

## RED (human-only, never autonomous)
Prices (all pages + data/price-lock.json); privacy.html, terms.html, accessibility.html;
phone +1 (369) 212-1203; forge@gaelworx.com; vercel.json (CSP/headers); robots.txt rules;
.github/workflows/*; .claude/settings.json; deleting any page/asset; any customer PII.

## GREEN (auto-merge OK if validator passes and it's confined to the green set)
In-brand copy tweaks; conclude a significant experiment to its winner; metadata/OG/alt;
llms.txt / sitemap.xml / markdown-mirror regen; start a pre-approved experiment; revert a regression.

## YELLOW (open PR, wait for a human)
Everything else: layout, structure, new pages/sections, nav/footer, pricing-chooser order, JS changes.

## Each run
1. Read SITEBRAIN.md, data/metrics-summary.md, LEDGER.md, LEARNINGS.md.
2. Pick ONE improvement toward the North Star without regressing guardrail metrics.
3. Edit on claude/<purpose>-<date>. Validate. Log LEDGER row. Open PR. Update SITEBRAIN.md.
Kill switch: if repo var AGENT_ENABLED is false, do nothing and exit.
```

## 17.2 `.claude/settings.json` (mechanical guardrails)

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash",
        "hooks": [{ "type": "command",
          "command": "grep -qE 'git push.*(origin +)?main' <<< \"$CLAUDE_TOOL_INPUT\" && { echo 'BLOCKED: never push to main' >&2; exit 2; } || exit 0" }] }
    ],
    "PostToolUse": [
      { "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "node scripts/validate.mjs || exit 2" }] }
    ]
  }
}
```

## 17.3 `api/e.js` (Vercel telemetry collector — skeleton)

```js
// POST /api/e  — first-party, same-origin event sink. No third parties, CSP-safe.
import { createClient } from '@supabase/supabase-js';
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const ALLOWED = new Set(['pageview','section_view','cta_click','scroll_depth','form_submit','audit_answer']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const b = req.body || {};
    if (!ALLOWED.has(b.event)) return res.status(204).end();     // silently ignore junk
    if (JSON.stringify(b).length > 2048) return res.status(204).end();
    await db.from('events').insert({
      session_id: String(b.sid || '').slice(0, 64),
      page: String(b.page || '').slice(0, 128),
      event: b.event,
      detail: b.detail ?? null,
      variant: b.variant ? String(b.variant).slice(0, 64) : null,
      referrer_class: String(b.ref || 'direct').slice(0, 32),
      device: String(b.dev || 'unknown').slice(0, 16)
    });                                                          // NO ip, NO PII stored
  } catch (_) { /* never break the page over telemetry */ }
  return res.status(204).end();
}
```

## 17.4 `gw-telemetry.js` (client beacon — skeleton)

```js
// Same-origin beacon. Honors Do-Not-Track. No cross-site cookies. ~sessionStorage id only.
(() => {
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;   // respect DNT
  const sid = sessionStorage.gwsid || (sessionStorage.gwsid =
    (crypto.randomUUID?.() || String(Math.random()).slice(2)));
  const page = location.pathname;
  const ref = /google|bing/.test(document.referrer) ? 'search'
            : document.referrer ? 'referral' : 'direct';
  const dev = matchMedia('(pointer:coarse)').matches ? 'mobile' : 'desktop';
  const send = (event, detail, variant) =>
    navigator.sendBeacon('/api/e', new Blob(
      [JSON.stringify({ sid, page, event, detail, variant, ref, dev })],
      { type: 'application/json' }));

  send('pageview');
  // CTA clicks
  document.querySelectorAll('[data-gw-cta]').forEach(el =>
    el.addEventListener('click', () => send('cta_click', { cta: el.dataset.gwCta })));
  // scroll depth
  const marks = new Set();
  addEventListener('scroll', () => {
    const p = Math.round((scrollY + innerHeight) / document.body.scrollHeight * 100);
    [25,50,75,100].forEach(m => { if (p >= m && !marks.has(m)) { marks.add(m); send('scroll_depth', { depth: m }); }});
  }, { passive: true });
  // section views + form submit + audit answers: wire with IntersectionObserver / listeners
})();
```

## 17.5 `.github/workflows/nightly-evolve.yml` (scheduled autonomous run — skeleton)

```yaml
name: Nightly Evolve
on:
  schedule: [{ cron: "0 8 * * *" }]     # 08:00 UTC daily
  workflow_dispatch:                     # manual trigger for testing
permissions:
  contents: write
  pull-requests: write
jobs:
  evolve:
    runs-on: ubuntu-latest
    timeout-minutes: 20                   # runaway guard
    steps:
      - uses: actions/checkout@v4
      - name: Kill switch
        run: '[ "${{ vars.AGENT_ENABLED }}" = "false" ] && exit 0 || true'
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: node scripts/pull-metrics.mjs   # writes data/metrics*.json (uses Supabase secrets)
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt_file: .github/prompts/evolve.md
          claude_args: >-
            --max-turns 12
            --allowedTools "Read,Edit,Bash(node scripts/validate.mjs),Bash(git*)"
```

## 17.6 The evolution prompt (`.github/prompts/evolve.md`)

```markdown
You are the nightly evolution agent for the Gaelworx static site. Follow CLAUDE.md exactly.

1. Read: CLAUDE.md, SITEBRAIN.md, data/metrics-summary.md, LEDGER.md, LEARNINGS.md,
   data/experiments.json.
2. If AGENT_ENABLED is false, stop.
3. Decide the single highest-value SAFE action for tonight, in this priority order:
   a. Any experiment past min_sessions → conclude it by the numbers (keep winner or revert).
   b. Any shipped change past its check_date → measure it; if it regressed a guardrail, revert.
   c. Otherwise → make ONE small in-brand improvement toward the North Star, OR start ONE
      pre-approved experiment.
4. Work on a claude/<purpose>-<date> branch. Run `node scripts/validate.mjs`; if it exits 2,
   fix or abandon — never override.
5. Set the correct lane. Only apply the green-lane label if validate.mjs confirms the change
   is entirely within the GREEN set. Otherwise open a normal (yellow) PR for a human.
6. Append a LEDGER.md row (hypothesis, metric, check_date) and a dated SITEBRAIN.md note.
7. Open the PR with a body: hypothesis, before/after, how to measure, revert SHA. Do not merge.
Make ONE change. Small diffs. When unsure, do less and open a PR.
```

## 17.7 The live-responder prompt (Routine fired by `/fire`)

```markdown
You were woken by a LIVE event. The event details are in the provided text. Follow CLAUDE.md.

- If it's a high-intent LEAD: read that session's page history from data/ (or the digest),
  draft a short reply in the forge brand voice referencing the exact service they viewed,
  and send it via the email connector. Do not invent facts or prices — read them from the site.
- If it's an ANOMALY (broken form, 404 spike, perf regression): diagnose. If the fix is
  GREEN-lane and validate.mjs passes, ship it on a claude/* branch. Otherwise open a PR and stop.
- If it's an EXPERIMENT reaching significance: conclude it by the numbers.
Do the smallest correct thing. Never touch the RED list. Never push to main. Rate-limited.
```

## 17.8 File manifest this plan introduces

```
CLAUDE.md                      # agent contract (Phase 0)
LEDGER.md                      # every change: hypothesis → metric → verdict (Phase 0)
LEARNINGS.md                   # append-only durable lessons (Phase 0)
SITEBRAIN.md                   # agent working memory / state file (Phase 2)
.claude/settings.json          # mechanical guardrail hooks (Phase 0)
.github/workflows/nightly-evolve.yml   # scheduled autonomous run (Phase 4)
.github/workflows/green-automerge.yml  # green-lane auto-merge (Phase 6)
.github/prompts/evolve.md      # nightly prompt (Phase 4)
api/e.js                       # telemetry collector (Phase 1)
api/lead.js                    # real lead capture, replaces mailto lie (Phase 1)
gw-telemetry.js                # client beacon (Phase 1)
scripts/pull-metrics.mjs       # Supabase → data/metrics*.json (Phase 2)
scripts/validate.mjs           # the validator / seat belt (Phase 3)
scripts/stats.mjs              # significance test for experiments (Phase 5)
data/metrics.json              # digest the agent reads (Phase 2)
data/metrics-summary.md        # human-readable digest (Phase 2)
data/price-lock.json           # canonical prices the validator guards (Phase 3)
data/legal-hashes.json         # hashes of legal pages (Phase 3)
data/csp-baseline.txt          # the CSP the validator guards (Phase 3)
data/brand-voice.md            # forge lexicon + banned-word list (Phase 3)
data/experiments.json          # experiment ledger (Phase 5)
variants/                      # pre-computed segment/experiment partials (Phases 5 and 9)
```

## 18. Sources (verified during research, most-load-bearing first)

**Primary (Anthropic / Cloudflare docs):**
- Claude Code headless mode — https://code.claude.com/docs/en/headless
- Claude Code GitHub Action — https://code.claude.com/docs/en/github-actions
- Claude Code web scheduled tasks / Routines (`/fire` endpoint) — https://code.claude.com/docs/en/web-scheduled-tasks
- Cloudflare, "Is your site agent ready?" — https://blog.cloudflare.com/agent-readiness/

**Practitioner patterns:**
- Agentic CRO via MCP (telemetry+code → agent rewrites page) — https://agenticbrand.ai/p/agentic-cro-via-mcp
- Self-improving A/B testing agent (7-phase loop) — https://www.mindstudio.ai/blog/self-improving-ab-testing-agent-landing-pages-ad-copy
- Free CRO stack: Claude Code + PostHog + Vercel — https://www.mindstudio.ai/blog/build-ab-test-landing-page-claude-code-free-posthog-vercel
- Claude Code as an autonomous agent on a cron + state file — https://dev.to/boucle2026/how-to-run-claude-code-as-an-autonomous-agent-with-a-cron-job-hec
- Claude Code in CI/CD & headless automation — https://hidekazu-konishi.com/entry/claude_code_cicd_and_headless_automation.html
- Running Claude Code 24/7 (Koda, Agent SDK, node-cron+pm2) — https://www.howdoiuseai.com/blog/2026-02-13-running-claude-code-24-7-gives-you-an-autonomous-c
- Skills over slop (quality beats volume) — https://postiz.com/blog/claude-code-skills-ai-slop-seo
- Make your website agent-ready — https://suganthan.com/blog/how-to-make-website-agent-ready/

**Risk / guardrail evidence:**
- Replit agent deleted prod DB during code freeze, fabricated data — https://incidentdatabase.ai/cite/1152/
- Guardrails for AI in deployment decisions (confidence gating, overrides) — https://semaphore.io/blog/what-guardrails-or-policies-should-be-in-place-when-ai-is-part-of-deployment-decisions-e.g.,-auto-rollback,-approvals
- Claude Code security best practices (attack classes) — https://www.backslash.security/blog/claude-code-security-best-practices
- Google March 2026 update: scaled-content abuse penalized 50–80% — https://www.digitalapplied.com/blog/scaled-content-abuse-google-march-update-ai-pages-decimated

**Definitions landscape (directional, not all independently verified):**
- Agentic personalization (Bloomreach) — https://www.bloomreach.com/en/blog/what-is-agentic-personalization
- Agentic personalization glossary (CDP.com) — https://cdp.com/glossary/agentic-personalization/
- Generative UI (NineTwoThree) — https://www.ninetwothree.co/blog/generative-ui
- Developer's guide to generative UI 2026 (CopilotKit) — https://www.copilotkit.ai/blog/the-developer-s-guide-to-generative-ui-in-2026

> **Research note.** Findings were gathered by a fan-out/adversarial-verification research
> pass. 13 core claims (all the mechanics and the Cloudflare data above) passed 3-of-3
> skeptic verification. The definitions in the last group were extracted from named sources
> but their final verification round was cut short by a credits limit — they are cited as
> *directional* and the plan does not depend on them. Everything load-bearing (how to
> trigger Claude Code, the guardrail model, the risks) is in the verified set.
```

---

*This plan is intentionally conservative on autonomy and aggressive on capability: build the
full sense→learn→act→measure loop, but earn each notch of "let it merge itself" with a
validator and a week of watching. That is how you get an agentic site that compounds instead
of one that makes the news.*
