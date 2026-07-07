# MCP-SPEC — Make Gaelworx bookable by any AI assistant

> **What this builds.** An endpoint that lets a prospect's AI assistant — **ChatGPT,
> Claude, or Gemini** — discover Gaelworx, read our services, check open times, and
> **book an intro call**, all from inside their chat, without ever loading our website.
>
> **Companion to `AGENTICPLAN.md`.** This is frontier-feature #5 (the MCP Server Card),
> specced for build. It obeys the same rules: never touch the RED list, never push to
> `main`, everything validated. Read `AGENTICPLAN.md` §0 and §7 before building.
>
> **Who this is for.** A lower-capability model building it phase by phase. Every section
> has exact files, schemas, and an acceptance test. When unsure, do less and open a PR.
>
> **The one thing to understand first:** you build **one backend, two doors.** One set of
> functions (`list_services`, `get_available_slots`, `book_intro_call`) sits behind two
> protocols. Every assistant arrives through one of them. Same code, two front doors.

---

## 0. The current reality (verified July 2026 — read so you build for what's real)

The standards moved fast in 2026. Here is the honest state, so you don't build for a demo:

- **Remote MCP servers are the door that pays off now.** ChatGPT (Apps SDK), Claude
  (connectors), and Gemini (official MCP support) all connect to a remote MCP server — an
  HTTPS endpoint speaking JSON-RPC. This is **Door A** and it works today.
- **ChatGPT** connects to **remote MCP servers only** (no local/stdio). Full write/action
  tools are rolling out in beta to Business/Enterprise/Edu plans. ([OpenAI Apps SDK](https://developers.openai.com/apps-sdk/build/mcp-server))
- **Claude** is the easiest path today: paste your MCP URL as a connector and it can call
  your tools immediately.
- **Gemini** has official MCP support (Google Cloud Next 2026) and Gemini-in-Chrome can
  book appointments; the flagship consumer "book me a slot" product (**Gemini Spark**) is
  still **US Alpha**.
- **WebMCP** (`navigator.modelContext`, declared *in the page*) is **Door B**, for
  browser-driving agents. Shipped as a Chrome origin trial at Google I/O 2026 (Chrome 149).
  **Honest caveat:** as of now the big assistants **do not yet call WebMCP tools natively**
  — the working bridge is a browser extension (MCP-B). So build Door B for *positioning*
  and cheap wins; expect Door A to carry the real traffic until late 2026. ([WebMCP reality check](https://zenvanriel.com/ai-engineer-blog/webmcp-guide-ai-engineers-web-agents/))
- **No universal directory.** Agents "must visit a site directly to know if it has callable
  tools" — so **SEO is still the front door**; MCP is what happens after the agent arrives.
- **Discovery spec is real:** `/.well-known/mcp/server-card.json` (SEP-1649, ratified
  2025-11-25; superseded by SEP-2127). A static JSON manifest agents check first. ([SEP-1649](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1649))

**The Gaelworx shortcut:** we sell **free intro calls**, not paid checkout. That means we
**skip the entire agentic-payments layer** — no AP2 mandates, no Universal Commerce
Protocol, no crypto wallets (none of which are production-ready anyway). Booking a free call
is just: **check availability → hold the slot → confirm by email.** This spec deliberately
has no payment surface.

---

## 1. Architecture — one backend, two doors

```
   A prospect's assistant (ChatGPT / Claude / Gemini)
                 │
      ┌──────────┴───────────────────────────────┐
      │                                            │
  DOOR A (now)                               DOOR B (positioning)
  Remote MCP server                          WebMCP in the page
  POST /api/mcp  (JSON-RPC, Streamable HTTP) navigator.modelContext on
  discovered via                              contact/booking page,
  /.well-known/mcp/server-card.json           declared with 2 HTML attrs
      │                                            │
      └──────────────┬─────────────────────────────┘
                     ▼
        ONE SERVICE LAYER  (scripts/booking/*.mjs)
        ┌──────────────────────────────────────────┐
        │ list_services()      → reads price-lock    │  (never invents prices)
        │ get_available_slots()→ Google Calendar     │  (free/busy only)
        │ book_intro_call()    → hold + lead + email │  (the only write)
        └──────────────────────────────────────────┘
             │              │                │
       price-lock.json  Google Calendar   Supabase `leads`  +  confirmation email
       (RED-listed)     (connector)       (Phase 1 table)      (AgentMail/Gmail)
```

**Build Door A first.** It's what ChatGPT/Claude/Gemini actually use today. Door B is two
HTML attributes bolted onto the booking form later — cheap, and it also fixes the
"mailto-lie" form problem from the site audit.

---

## 2. The three tools (the whole product surface)

Keep it to three. More tools = more attack surface and more ways to hallucinate. All three
read from systems that are the source of truth, so the assistant can never make up an answer.

### 2.1 `list_services` — read-only

- **Purpose:** return Gaelworx's services, fixed prices, and one-line descriptions.
- **Input:** none (or optional `{ category?: "voice"|"automation"|"software"|"web"|"install" }`).
- **Output:** array of `{ id, name, price, summary, url }`.
- **Source of truth:** reads `data/price-lock.json` (the same file the validator guards) so
  prices **can never drift or be invented**.
- **Annotations:** `readOnlyHint: true, openWorldHint: false`.

### 2.2 `get_available_slots` — read-only

- **Purpose:** return open 30-minute intro-call slots.
- **Input:** `{ from: ISODate, to: ISODate, service?: string }` — `to` must be ≤ 30 days out.
- **Output:** array of `{ start: ISO8601, end: ISO8601, tz: "America/New_York" }`.
- **Source of truth:** Google Calendar **free/busy** for the booking calendar. Returns only
  slots inside business hours that are actually free. **Never exposes event details** — only
  free/busy.
- **Annotations:** `readOnlyHint: true, openWorldHint: true` (queries a live calendar).

### 2.3 `book_intro_call` — the only write

- **Purpose:** book a specific open slot.
- **Input:** `{ name, email, service, slot_start: ISO8601, notes? }`.
- **Output:** `{ status: "booked"|"slot_taken"|"invalid", reference?, start?, message }`.
- **Behavior (in this exact order):**
  1. Validate `slot_start` was actually offered by `get_available_slots` and is still free
     (atomic re-check — no double-booking).
  2. Create a **tentative hold** on Google Calendar (not a confirmed meeting yet).
  3. Write a row to Supabase `leads` (name, email, service, slot, source=`mcp`, the
     assistant's `origin` if provided).
  4. Send a **confirmation email** with a one-click confirm/cancel link (AgentMail/Gmail
     connector). Booking is tentative until the human confirms — this stops spam bookings
     from becoming real calendar noise.
  5. Return a `reference` the assistant repeats to the user.
- **Annotations:** `readOnlyHint: false, destructiveHint: false, idempotentHint: false,
  openWorldHint: true`.
- **Hard caps in code, never in prompt:** max N bookings per email/day; reject slots not in
  the current free set; reject `slot_start` > 30 days out; dedupe identical (email, slot).
  *A prompt can be tricked; a code comparison cannot.*

**Server-level `instructions` (sequencing guidance, sent at `initialize`):**
> "To book, call `get_available_slots` first, then `book_intro_call` only after you have the
> user's name, email, and a slot returned by `get_available_slots`. Never state a price
> without calling `list_services`. Include the returned `reference` verbatim in your reply."

The description *is* the guardrail — the assistant reads these at connect time.

---

## 3. Door A — the remote MCP server (`/api/mcp`)

A single Vercel serverless function speaking Streamable HTTP in **stateless** mode. No
always-on server; scales to zero. Uses the official `@modelcontextprotocol/sdk`.

**File: `api/mcp.js`** (skeleton — fill in the handlers from §2):

```js
// POST /api/mcp — remote MCP server (Streamable HTTP, stateless).
// Speaks the same protocol ChatGPT, Claude, and Gemini connect to.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { listServices, getAvailableSlots, bookIntroCall } from "../scripts/booking/index.mjs";

function buildServer() {
  const server = new McpServer(
    { name: "Gaelworx — Intro Call Booking", version: "1.0.0" },
    { instructions:
        "To book, call get_available_slots first, then book_intro_call only after you have " +
        "the user's name, email, and a slot returned by get_available_slots. Never state a " +
        "price without calling list_services. Include the returned reference verbatim." }
  );

  server.registerTool("list_services", {
    title: "List Gaelworx services & prices",
    description: "Return Gaelworx services with fixed public prices and one-line summaries. " +
                 "Call this before quoting any price — never invent prices.",
    inputSchema: { category: z.enum(["voice","automation","software","web","install"]).optional() },
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async ({ category }) => {
    const out = await listServices(category);
    return { content: [{ type: "text", text: JSON.stringify(out) }], structuredContent: { services: out } };
  });

  server.registerTool("get_available_slots", {
    title: "Get open intro-call slots",
    description: "Return open 30-minute intro-call slots between `from` and `to` (max 30 days out). " +
                 "Reads live calendar free/busy. Call before book_intro_call.",
    inputSchema: {
      from: z.string().describe("ISO date, earliest"),
      to:   z.string().describe("ISO date, latest (≤30 days from today)"),
      service: z.string().optional(),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, async (args) => {
    const slots = await getAvailableSlots(args);
    return { content: [{ type: "text", text: JSON.stringify(slots) }], structuredContent: { slots } };
  });

  server.registerTool("book_intro_call", {
    title: "Book an intro call",
    description: "Book a specific open slot. Call ONLY after get_available_slots returned slots, " +
                 "the user picked one, and you have their name and email. Returns a booking reference — " +
                 "include it verbatim in your reply.",
    inputSchema: {
      name:  z.string().min(1),
      email: z.string().email(),
      service: z.string(),
      slot_start: z.string().describe("ISO8601 start, must be a slot from get_available_slots"),
      notes: z.string().max(500).optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  }, async (args) => {
    const result = await bookIntroCall(args);   // does the atomic re-check + hold + lead + email
    return { content: [{ type: "text", text: JSON.stringify(result) }], structuredContent: result };
  });

  return server;
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,   // stateless — one request, one transport
    enableJsonResponse: true,        // plain JSON, no SSE needed for our tools
  });
  res.on("close", () => transport.close());
  const server = buildServer();
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
```

**Notes for the builder:**
- The endpoint must respond to `initialize`, `tools/list`, and `tools/call` — the SDK
  transport handles all three; you only write the tool handlers.
- Return real JSON-RPC errors, **not** 500s with HTML bodies (assistants choke on HTML).
- Vercel offers an official adapter (`mcp-handler`) that wraps this even more tightly — use
  it if the plain SDK function is awkward under Vercel's runtime; the tool logic is identical.
- Secrets (`SUPABASE_SERVICE_KEY`, Google Calendar creds) live in Vercel env vars, never in
  the repo, never exposed by a tool.

---

## 4. Discovery — the `.well-known` server card

A **static JSON file** an assistant fetches to learn we're bookable (this is the "no process"
discovery layer — it's just a file). Point it at `/api/mcp`.

**File: `.well-known/mcp/server-card.json`:**

```json
{
  "$schema": "https://modelcontextprotocol.io/schemas/server-card/v1.0",
  "protocolVersion": "2025-06-18",
  "serverInfo": { "name": "Gaelworx — Intro Call Booking", "version": "1.0.0",
                  "homepage": "https://gwhoundsweb.vercel.app" },
  "description": "Book a free intro call with Gaelworx, an AI-automation agency for trades and small business.",
  "transport": { "type": "streamable-http", "url": "https://gwhoundsweb.vercel.app/api/mcp" },
  "capabilities": { "tools": true },
  "tools": [
    { "name": "list_services", "description": "List services and fixed prices." },
    { "name": "get_available_slots", "description": "Get open intro-call slots." },
    { "name": "book_intro_call", "description": "Book a specific open slot." }
  ]
}
```

**Critical CORS rule:** the `.well-known` file (and `/api/mcp`) must send
`Access-Control-Allow-Origin: *`. Browser-based AI clients read these without credentials
and a normal same-origin CORS policy will block them. Add a header rule in `vercel.json`
**scoped to these paths only** — do **not** weaken the site-wide CSP (that's RED-list).

```json
{ "source": "/.well-known/mcp/(.*)", "headers": [
    { "key": "Access-Control-Allow-Origin", "value": "*" },
    { "key": "Content-Type", "value": "application/json" } ] }
```

> **RED-list note:** editing `vercel.json` is human-only. An autonomous agent proposes this
> header block as a **PR** and a human merges it. The validator confirms the page CSP string
> is unchanged.

---

## 5. Door B — WebMCP in the booking page (cheap, later, positioning)

For browser-driving agents (Gemini-in-Chrome, and Claude/ChatGPT once they support it). Two
ways; do the declarative one first — it's nearly free and doubles as the real-form fix.

**Declarative (zero JS):** add two attributes to the real booking form (the one that
replaces the mailto lie), and the browser exposes it as a tool automatically:

```html
<form action="/api/lead" method="post"
      toolname="book_intro_call"
      tooldescription="Book a free intro call with Gaelworx. Needs name, email, service, and preferred time.">
  <!-- existing fields, now posting to a REAL endpoint, not mailto -->
</form>
```

**Imperative (dynamic, optional):** on the booking page, register the live tools so an
in-page agent gets typed calls instead of DOM-scraping:

```js
if (navigator.modelContext) {
  navigator.modelContext.registerTool({
    name: "get_available_slots",
    description: "Get open intro-call slots for Gaelworx.",
    inputSchema: { type:"object", properties:{ from:{type:"string"}, to:{type:"string"} }, required:["from","to"] },
    async execute(args) { return await (await fetch("/api/slots?"+new URLSearchParams(args))).json(); }
  });
  // register book_intro_call similarly → posts to /api/lead
}
```

WebMCP defaults to same-origin permissions, so this is safe by default. It needs a visible
tab and is not consumed by the big assistants natively yet — ship it, but measure Door A.

---

## 6. The service layer (`scripts/booking/`) — the shared backend

Both doors call these. Write them once.

- **`services.mjs`** → `listServices(category?)`: read `data/price-lock.json`, return the
  service list. Pure, no I/O beyond the file.
- **`slots.mjs`** → `getAvailableSlots({from,to,service})`: query Google Calendar free/busy
  (via the connector / a service account), subtract busy from business hours, return open
  30-min slots. Clamp `to` to ≤30 days. Cache briefly.
- **`book.mjs`** → `bookIntroCall({name,email,service,slot_start,notes})`: the 5-step
  behavior from §2.3 — atomic free-check, tentative hold, Supabase `leads` insert,
  confirmation email, return reference. All hard caps enforced here.
- **`index.mjs`** re-exports the three. `api/mcp.js`, `api/lead.js`, and `api/slots.js` all
  import from here so there is exactly one implementation.

---

## 7. Guardrails (same philosophy as AGENTICPLAN §7/§8)

| Layer | Guardrail |
|---|---|
| **Schema** | Zod validates every input; `book_intro_call` requires a valid email and a real slot. Tool descriptions encode the call sequence. |
| **Code** | Atomic no-double-book; rate-limit per email/IP; reject slots not offered or >30 days out; bookings are **tentative** until the human confirms by email. |
| **Data** | Tools never expose calendar event details (free/busy only), never read Supabase `leads`, never return PII. No `cancel`/`reschedule` tool exists → an agent literally cannot cancel someone's booking. |
| **RED-list** | The `vercel.json` CORS/header edit is human-merged. Prices come from the guarded `price-lock.json`. No payment surface at all. |
| **Secrets** | Calendar + Supabase creds in Vercel env only; no tool returns them; the server-card exposes only tool *names*, not internals. |
| **Rollback** | Take the server-card down (or return `tools: []`) to instantly stop new agent bookings; the site is unaffected. |

---

## 8. Per-platform enablement (do these in order of payoff)

1. **Claude (today, zero approval):** deploy `/api/mcp`, then add
   `https://gwhoundsweb.vercel.app/api/mcp` as a connector in Claude. Ask "What are
   Gaelworx's open intro-call slots?" → it should list slots and offer to book. **This is
   your first working demo.**
2. **ChatGPT (Apps SDK):** register the same server as a ChatGPT App (developer mode →
   connect the MCP server). Write-actions require a Business/Enterprise/Edu plan in beta.
   Optionally add a `_meta.openai/outputTemplate` later to render slots as a nice inline card
   — not required to function. ([OpenAI developer mode](https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt))
3. **Gemini:** connect the MCP server via Gemini's MCP support; the consumer "book me"
   surface (Spark) is US-Alpha, so treat Gemini as "works for enabled users, mass flow
   soon."
4. **Publish the server-card** so any future agent can auto-discover — and note the domain in
   `llms.txt` so the readable and actionable layers agree.

---

## 9. Acceptance tests

- **Protocol:** `curl -X POST https://.../api/mcp` with a JSON-RPC `initialize` then
  `tools/list` returns the three tools with full schemas; `tools/call` on `list_services`
  returns the price-locked list. Errors come back as JSON-RPC errors, not HTML.
- **Discovery:** `curl https://.../.well-known/mcp/server-card.json` returns the card with
  `Access-Control-Allow-Origin: *`.
- **End-to-end (Claude):** add the connector, ask to book a call → a tentative hold appears
  on the calendar, a row lands in Supabase `leads` (source=`mcp`), and a confirmation email
  arrives. Confirm the link flips it to confirmed.
- **Guardrail:** try to book a slot that wasn't offered / >30 days out / a taken slot → each
  returns a clean `invalid`/`slot_taken`, no double-book, no crash.
- **Isolation:** confirm no tool returns calendar event details or any `leads` data, and the
  site-wide CSP in `vercel.json` is byte-for-byte unchanged.

---

## 10. Rollout (crawl → walk → run)

- **Crawl (shippable now):** `data/price-lock.json` + the real `/api/lead` endpoint (kills
  the mailto lie) + `/api/mcp` with `list_services` + `get_available_slots` (read-only) +
  the server-card. Connect Claude. You are agent-**readable and queryable** with zero write
  risk.
- **Walk:** add `book_intro_call` with tentative holds + email confirm. Now you're agent-
  **bookable.** Register the ChatGPT App.
- **Run:** add WebMCP to the booking page; add the `_meta` UI card for ChatGPT; monitor how
  many bookings arrive `source=mcp` and fold that into the AGENTICPLAN metrics loop.

Ship crawl and walk; treat run as positioning for late-2026 when native WebMCP and Gemini
Spark reach general availability.

---

## 11. Sources (verified July 2026)

- OpenAI Apps SDK — build an MCP server — https://developers.openai.com/apps-sdk/build/mcp-server
- OpenAI developer mode + MCP apps — https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt
- MCP Streamable HTTP transport (spec) — https://modelcontextprotocol.io/specification/draft/basic/transports/streamable-http
- MCP TypeScript SDK — server guide — https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md
- Anthropic remote Streamable-HTTP MCP scaffold — https://github.com/anthropics/claude-plugins-official
- SEP-1649 — MCP Server Cards / `.well-known` discovery — https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1649
- Google official MCP support — https://cloud.google.com/blog/products/ai-machine-learning/announcing-official-mcp-support-for-google-services
- WebMCP standard + reality check — https://spaceandstory.co/blog/webmcp-the-standard-you-need · https://zenvanriel.com/ai-engineer-blog/webmcp-guide-ai-engineers-web-agents/
- Bookable-by-any-AI reference build (two-surfaces, free-tier vs AP2) — https://blogs.tanmaybohra.com/posts/mcp-ap2-bookable-by-ai/
- MCP server on serverless (Lambda) — stateless pattern — https://hidekazu-konishi.com/entry/mcp_server_aws_lambda_complete_guide.html

> **Reality flag carried forward:** the big assistants don't consume WebMCP natively yet,
> Gemini Spark is US-Alpha, and there's no universal agent directory — SEO still gets you
> found. Door A (remote MCP) is what works today; everything else is you being early on
> purpose. That early position is the sellable asset.
