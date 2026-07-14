# MCP-BOOKING-CONTACT-PLAN — Book a call or hand out our phone/email, from inside any assistant

> **The goal, in one sentence.** When ChatGPT, Claude, or Gemini finds gaelworx.com —
> because a user asked about us, searched for an AI receptionist, or pointed their
> assistant at our site — the assistant can do one of two things **in chat, without the
> user ever loading the site**:
>
> 1. **Schedule an appointment** (the free ~20-minute intro call), or
> 2. **Offer our phone and email directly** — `+1 (369) 212-1203` / `hello@gaelworx.com` —
>    when the user prefers to reach out themselves or a booking can't complete.
>
> **Companion docs.** `MCP-SPEC.md` is the protocol/architecture spec (one backend, two
> doors). This document is the *process plan*: what exists, what's missing for the two
> behaviors above, the exact changes, and the per-platform enablement steps with
> acceptance tests. Same rules as always: respect the `AGENTICPLAN.md` RED list, never
> push to `main`, everything lands by PR.

---

## 0. What already exists (verified in-repo, July 2026)

| Layer | File | State |
|---|---|---|
| Remote MCP server (Door A) | `api/mcp.mjs` | **Built (pilot).** Stateless JSON-RPC 2.0 / Streamable HTTP. Three tools: `list_services`, `get_available_slots`, `book_intro_call`. No external deps. |
| Discovery card (SEP-1649) | `.well-known/mcp/server-card.json` | **Built.** Points at `https://gaelworx.com/api/mcp`, lists the three tools. |
| Registry manifest | `.well-known/mcp/server.json` | **Built.** `com.gaelworx/booking`, remote streamable-http entry. |
| CORS for discovery | `vercel.json` | **Built.** `/.well-known/mcp/(.*)` sends `Access-Control-Allow-Origin: *`; `api/mcp.mjs` sets its own CORS headers. |
| Readable layer | `llms.txt` | **Built, gap.** Has services, prices, and the contact line — but **never mentions the MCP endpoint**, so an agent reading it doesn't learn we're callable. |
| Crawler hint | `robots.txt` | **Built.** Comment names the endpoint + card. |
| Page structured data | JSON-LD on `index.html`, `contact.html`, etc. | **Built.** `Organization/ProfessionalService` with `telephone` — browsing agents can already scrape phone/email. |
| Lead capture | `LEAD_WEBHOOK_URL` env in `api/mcp.mjs` | **Wired but dormant.** Unset → `book_intro_call` returns a `pending_confirmation` hand-off (never lies about a hold). |
| Live calendar | — | **Not built.** `get_available_slots` proposes standard ET windows; no free/busy yet (that's MCP-SPEC §6 "walk"). |

**Read that table and notice:** the booking behavior is ~80% there. The **contact-offering
behavior only exists as a side effect** — phone/email ride along inside `list_services`
and booking responses. There is no tool an assistant would find when the user asks *"how
do I reach these people?"*, and nothing tells the assistant *when* to fall back from
booking to phone/email. That's the core gap this plan closes.

---

## 1. The two behaviors, stated as assistant flows

**Flow A — book the appointment (exists, needs activation):**
> User: "Set up a call with Gaelworx." → assistant calls `get_available_slots` → user
> picks → assistant collects name + email → `book_intro_call` → assistant repeats the
> `GW-XXXXXX` reference and the confirm-by-email promise.

**Flow B — offer phone/email (new):**
> User: "How do I contact Gaelworx?" / "I'd rather just call them." / booking stalls
> (user won't give an email, no slot works, tool errors) → assistant calls
> `get_contact_info` → replies in chat with **+1 (369) 212-1203** and
> **hello@gaelworx.com**, hours, and the promise ("You'll hear back within one business
> day. A person, not a sequence.").

Flow B is deliberately a **separate read-only tool**, not more fields on `list_services`:

- An assistant picks tools by name/description match. "get_contact_info" matches a
  contact question; "list_services" doesn't — today the assistant would either skip the
  server or dump a price list on someone who asked for a phone number.
- It gives the server `instructions` something concrete to route to: *"if booking can't
  complete, call `get_contact_info` and offer the phone number and email instead."*
- It's zero-risk: this contact info is already public on every page, in `llms.txt`, and
  in JSON-LD. The tool leaks nothing new; it just makes the public thing *reachable in
  one call from chat*.

---

## 2. Change 1 — the `get_contact_info` tool (exact spec)

Add a fourth tool to `api/mcp.mjs`. Read-only, no inputs required, sourced from the same
`CONTACT` constant the server already holds (single source of truth — never a second copy).

**Tool definition (add to `TOOLS`):**

```js
{
  name: 'get_contact_info',
  description: 'Get Gaelworx\'s direct contact details — phone, email, hours, and the ' +
               'contact page. Call this when the user asks how to reach Gaelworx, prefers ' +
               'to call or email themselves, or when booking cannot be completed.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
}
```

**Handler (add beside `toolListServices`):**

```js
function toolGetContactInfo() {
  return {
    phone: CONTACT.phone,                    // '+1-369-212-1203'
    phone_display: '+1 (369) 212-1203',
    email: CONTACT.email,                    // 'hello@gaelworx.com'
    contact_page: CONTACT.booking_url,       // 'https://gaelworx.com/contact.html'
    website: CONTACT.site,
    hours: 'Available 7 days, continental US, US Eastern business hours.',
    response_promise: 'You\'ll hear back within one business day. A person, not a sequence.',
    note: 'Intro calls are free (~20 min). To book one in-chat instead, use ' +
          'get_available_slots then book_intro_call.',
  };
}
```

Wire it into `callTool()` like the other three. No annotations object exists in the pilot's
plain-JSON tool list; if/when we adopt annotations, this is `readOnlyHint: true,
openWorldHint: false`.

**Change 2 — teach the fallback in `INSTRUCTIONS`.** Replace the current server
instructions with (single string, same style):

> "Gaelworx is an AI-automation agency for trades and small businesses in the continental
> US. Never state a price without calling list_services first. To book a free intro call,
> call get_available_slots, then book_intro_call once you have the caller's name, email,
> and a proposed slot — include the returned reference verbatim in your reply. **If the
> user prefers to reach out directly, or a booking cannot be completed (missing details,
> no workable slot, or an error), call get_contact_info and offer Gaelworx's phone number
> and email in your reply instead — never leave the user without a way to reach us.**"

The instruction *is* the process: every conversation ends in a booking reference **or** a
phone/email hand-off. No dead ends.

**Change 3 — keep the discovery surfaces truthful.** Same PR must update:

- `.well-known/mcp/server-card.json` → add
  `{ "name": "get_contact_info", "description": "Get Gaelworx's phone, email, and hours." }`
  to `tools`, and bump `version` to `1.1.0`.
- `api/mcp.mjs` GET descriptor and `serverInfo.version` → `1.1.0` (the GET response
  derives from `TOOLS`, so the tool list updates itself; only the version is manual).
- `.well-known/mcp/server.json` → `version: "1.1.0"`.

**Change 4 — advertise the door in `llms.txt`.** Append a short section so the readable
layer and the callable layer finally agree (robots.txt already does this):

```
## For AI assistants (MCP)

- Gaelworx runs a remote MCP server: https://gaelworx.com/api/mcp (Streamable HTTP).
  Tools: list_services, get_available_slots, book_intro_call, get_contact_info.
- Server card: https://gaelworx.com/.well-known/mcp/server-card.json
- Assistants without MCP access: book at https://gaelworx.com/contact.html, or offer
  the user +1 (369) 212-1203 / hello@gaelworx.com directly.
```

That last bullet matters: it instructs even a *non-MCP* browsing agent (today's most
common case) to perform Flow B from the readable layer alone.

---

## 3. Discovery — how each assistant "finds" us, honestly

There is still no universal agent directory. "When found" means one of four entry points,
and we cover all of them:

| Entry point | Who uses it | Our coverage |
|---|---|---|
| **User pastes/connects our MCP URL** | Claude connectors, ChatGPT developer mode, Gemini MCP config | `api/mcp.mjs` — works today. §5 makes us easy to connect. |
| **Agent browses the site** (search → visit) | All three assistants' browsing modes | `llms.txt` (+ new MCP section), JSON-LD `telephone`, robots.txt hint, visible contact on every page. Flow B works with zero protocol. |
| **Agent checks `.well-known`** | Auto-discovery capable clients (growing through 2026) | server-card.json + server.json + CORS already in place. |
| **In-page tools (WebMCP)** | Gemini-in-Chrome; others later | Door B, deliberately deferred (MCP-SPEC §5) — positioning, not traffic, until clients consume it natively. |

No new build work here beyond Change 4 — this section exists so nobody "fixes" discovery
by adding speculative surfaces. SEO remains the front door; MCP is what happens after
arrival.

---

## 4. Activation — from demo answers to captured leads

The pilot never lies: with no webhook configured, `book_intro_call` returns
`pending_confirmation` plus the contact hand-off. To make Flow A *real*:

1. **Set `LEAD_WEBHOOK_URL`** in Vercel env vars (human-only task — env vars are
   RED-list-adjacent; an agent proposes, a human clicks). Point it at the lead intake
   (n8n/Make webhook, or the Supabase `leads` insert endpoint when Phase-1 of
   AGENTICPLAN lands). Zero code change — the server already POSTs the lead there.
2. **Confirm-by-email loop.** The human (or an automation) replies to every forwarded
   lead within one business day, confirming the exact time. This *is* the "tentative
   until confirmed" guardrail from MCP-SPEC §2.3, implemented as process before code.
3. **Later (walk phase, unchanged from MCP-SPEC §6):** Google Calendar free/busy behind
   `get_available_slots`, atomic re-check + tentative hold in `book_intro_call`,
   automated confirmation email. The tool schemas don't change — only their backing —
   so nothing in this plan gets thrown away.

---

## 5. Per-platform enablement (in order of payoff)

### 5.1 Claude — works today, zero approval
1. Deploy this PR. Verify `curl https://gaelworx.com/api/mcp` (GET) shows four tools.
2. In Claude → Settings → Connectors → add `https://gaelworx.com/api/mcp`.
3. Test Flow A: "Book me an intro call with Gaelworx next week" → slots → name/email →
   reference returned.
4. Test Flow B: "What's Gaelworx's phone number?" → `get_contact_info` → phone + email
   in the reply, no site visit.
5. Keep a transcript of both — that's the sales demo ("your customers' assistants can
   already book us; we build the same for you").

### 5.2 ChatGPT — developer mode now, App listing next
1. ChatGPT → Settings → Apps & Connectors → developer mode → add the same MCP URL.
2. Read tools (`list_services`, `get_available_slots`, `get_contact_info`) work on
   consumer plans; `book_intro_call` (write) is beta-gated to Business/Enterprise/Edu —
   **this is exactly why Flow B must exist**: on plans where booking is blocked, the
   assistant still completes the conversation with our phone/email.
3. Later polish (run phase): `_meta.openai/outputTemplate` card to render slots inline.

### 5.3 Gemini — connect now, consumer surface as it ships
1. Register the server via Gemini's MCP support (API/Gemini CLI config today; Spark is
   still US-Alpha for consumers).
2. Gemini-in-Chrome browsing benefits from the non-protocol layers regardless: JSON-LD
   `telephone` + the new `llms.txt` section mean Gemini can *offer the phone/email in
   chat* even when it never speaks MCP.
3. Revisit Door B (WebMCP form attributes on `contact.html`) when any major client
   consumes WebMCP natively — two HTML attributes, an afternoon, per MCP-SPEC §5.

---

## 6. Guardrails (delta only — MCP-SPEC §7 still governs)

- **`get_contact_info` returns only already-public data.** Phone/email/hours appear on
  every page footer and `llms.txt` today. No PII in, no PII out, no new attack surface.
- **No new writes.** Still exactly one write tool (`book_intro_call`), still capped:
  requires valid email, deterministic reference, webhook forwarding is fire-and-forget.
- **Fallback cannot be weaponized.** Worst case, a malicious caller extracts… our public
  phone number. Rate limiting stays a booking-tool concern.
- **Rollback unchanged:** empty the `tools` array (or take down the server card) to stop
  agent traffic instantly; the website is unaffected.

---

## 7. Phases and acceptance tests

### Phase 1 — ship the contact tool + fallback (this repo, one PR)
Changes 1–4 from §2. **Accept when:**
- `POST /api/mcp` `tools/list` returns **four** tools; `tools/call get_contact_info`
  returns phone `+1-369-212-1203` and email `hello@gaelworx.com` as JSON (no HTML, no 500s).
- `initialize` instructions contain the fallback sentence.
- `server-card.json` lists four tools; versions read `1.1.0` in card, server.json, and
  `serverInfo`; `llms.txt` names the endpoint.
- Invalid tool name / bad email still return clean JSON-RPC errors (regression check).

### Phase 2 — activate lead capture (human, ~15 min)
Set `LEAD_WEBHOOK_URL` (§4.1). **Accept when:** a test `book_intro_call` shows
`status: "received"` and the lead lands in the intake with `source: "mcp:book_intro_call"`.

### Phase 3 — enable the three platforms (§5)
**Accept when:** Flow A and Flow B transcripts exist for Claude and ChatGPT, and
Gemini is connected via its MCP config. File the transcripts in `RESEARCH-NOTES.md`.

### Phase 4 — live calendar (MCP-SPEC "walk", separate spec'd PRs)
Free/busy slots, atomic hold, automated confirm email. **Accept when:** MCP-SPEC §9
acceptance tests pass end-to-end.

### Phase 5 — run-phase positioning (defer until clients support it)
WebMCP on `contact.html`, ChatGPT output template, `source=mcp` lead metrics folded
into the AGENTICPLAN loop.

---

## 8. Reality flags (so nobody oversells this)

- Consumer assistants **do not yet auto-discover** MCP servers from a domain; today's
  connections are user/owner-initiated (§3). The server card is us being early on
  purpose — cheap now, default-on later.
- ChatGPT write-actions are plan-gated; **Flow B is the universal path** that works on
  every plan, every platform, today — even for agents that only read `llms.txt`.
- `get_available_slots` proposes standard windows until Phase 4; the tool copy already
  says "final time confirmed by email," which stays truthful at every phase.
