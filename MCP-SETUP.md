# MCP-SETUP — turn on live auto-booking (one human session, ~20 minutes)

The MCP server v2 (`api/mcp.mjs`) ships in **degraded mode**: it works immediately, but
until the env vars below exist it proposes standard windows and returns confirmable
hand-offs instead of booking real calendar events. This guide is the click-by-click to
flip it **live**: real free/busy from `zach@gaelworx.com`, auto-created events with
Google Meet links, prospect invites, confirmation email from `forge@gaelworx.com`, and
Attio lead logging.

Everything here is a **human-only** task (credentials + Vercel env vars — RED-list
territory). No code changes are needed; the server detects the env vars and switches
modes on its own.

---

## 1. Google Cloud — one project, two APIs (~5 min)

1. Go to https://console.cloud.google.com/ signed in as **zach@gaelworx.com**.
2. Create a project (top bar → project picker → **New project**) named `gaelworx-mcp`.
3. **APIs & Services → Library**: enable **Google Calendar API** and **Gmail API**.

## 2. OAuth consent screen (~3 min)

1. **APIs & Services → OAuth consent screen** → User type **External** → Create.
2. App name `Gaelworx MCP`, support email `zach@gaelworx.com`, developer email the same.
   Skip logo/domains. Save through the steps (no scopes needed here; the Playground
   requests them later).
3. **Publishing status → Publish app** (to "In production").
   > Why: while an app sits in *Testing*, Google expires its refresh tokens after
   > **7 days**. Publishing keeps the token alive indefinitely. The app stays
   > unverified — that's fine for your own account; you'll just click through one
   > "unverified app" warning during the single authorization below.

## 3. OAuth client — Web application (~2 min)

1. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
2. Application type **Web application**, name `gaelworx-mcp-server`.
3. Under **Authorized redirect URIs** add exactly:
   `https://developers.google.com/oauthplayground`
4. Create → copy the **Client ID** and **Client secret**.

## 4. Mint the refresh token in the OAuth Playground (~5 min)

1. Open https://developers.google.com/oauthplayground
2. Click the **gear icon** (top right) → check **Use your own OAuth credentials** →
   paste the Client ID and Client secret from step 3.
3. In **Step 1** (left panel), paste these two scopes into the input box (one at a
   time, or space-separated) and click **Authorize APIs**:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/gmail.send`
4. Sign in as **zach@gaelworx.com**. At the "Google hasn't verified this app" screen:
   **Advanced → Go to Gaelworx MCP (unsafe)** → allow both permissions.
5. In **Step 2**, click **Exchange authorization code for tokens**.
6. Copy the **Refresh token** (starts with `1//`). That's the credential the server
   lives on — treat it like a password.

## 5. Confirm the forge@ alias sends (~1 min)

Gmail → ⚙ → **See all settings → Accounts and Import → Send mail as**: confirm
**forge@gaelworx.com** is listed. If it isn't, add it there first — otherwise Google
silently sends confirmations from `zach@` instead of `forge@`.

## 6. Attio API key (~2 min, optional but wired)

Attio → **Workspace settings → Developers → API keys** → create a key scoped to
**Record read-write** and **Note read-write**. Copy it. Skip this and the server simply
doesn't log leads to the CRM (bookings still work).

## 7. Vercel env vars (~3 min)

Vercel → project **gwhoundsweb** → **Settings → Environment Variables** → add to
**Production** (and Preview if you want preview deployments live too):

| Name | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | from step 3 |
| `GOOGLE_CLIENT_SECRET` | from step 3 |
| `GOOGLE_REFRESH_TOKEN` | from step 4 |
| `GOOGLE_CALENDAR_ID` | `zach@gaelworx.com` (also the default if omitted) |
| `MAIL_FROM` | `forge@gaelworx.com` (also the default if omitted) |
| `MAIL_FROM_NAME` | `Gaelworx` (optional) |
| `ATTIO_API_KEY` | from step 6 (optional) |
| `LEAD_WEBHOOK_URL` | any webhook that should also receive each lead (optional) |

Then **Deployments → ⋯ → Redeploy** the latest deployment so the functions pick the
vars up.

---

## 8. Acceptance tests (run in order)

**Mode check** — should now say `"live_calendar": true`:
```bash
curl -s https://gaelworx.com/api/mcp | python3 -m json.tool
```

**Protocol + live slots** — slots must reflect your real calendar (busy blocks vanish):
```bash
curl -s -X POST https://gaelworx.com/api/mcp -H 'content-type: application/json' -d '{
  "jsonrpc":"2.0","id":1,"method":"tools/call",
  "params":{"name":"get_available_slots","arguments":{"days_ahead":3}}}'
```
The `availability_note` should read "Live availability from the Gaelworx calendar…".

**End-to-end booking** — book a slot to your own email:
```bash
curl -s -X POST https://gaelworx.com/api/mcp -H 'content-type: application/json' -d '{
  "jsonrpc":"2.0","id":2,"method":"tools/call",
  "params":{"name":"book_intro_call","arguments":{
    "name":"Test Prospect","email":"isaacsonzach13@gmail.com",
    "business":"Acceptance Test","slot_start":"<a start from the previous call>"}}}'
```
Expect `status: "booked"`, a `meet_link`, and a `GW-` reference. Then confirm all four
side effects: **(1)** event on the zach@gaelworx.com calendar with a Meet link,
**(2)** calendar invite in the test inbox, **(3)** confirmation email **from
forge@gaelworx.com**, **(4)** person + note in Attio.

**Guardrails** — each returns a clean JSON-RPC error or non-booking status, never a crash:
- same booking again → `already_booked`, no duplicate event
- a `slot_start` on a weekend / at 3:07pm / 20 days out → `-32602` with a helpful message
- a busy slot → `slot_taken`
- 4th booking for one email in a day → limit message with phone/email fallback

**Cleanup:** delete the test event from Google Calendar (deleting it also frees the
slot again — no server state to reset).

## 9. Connect the assistants

1. **Claude:** Settings → Connectors → add `https://gaelworx.com/api/mcp`. Ask "Book me
   an intro call with Gaelworx" — the full flow should complete in chat.
2. **ChatGPT:** Settings → Apps & Connectors → developer mode → add the same URL. The
   slot list renders as a clickable card (Apps SDK template served by the server).
   Write-actions (the actual booking) require a Business/Enterprise/Edu plan while
   OpenAI's beta gate lasts — reads and `get_contact_info` work everywhere.
3. **Gemini:** add the server under Gemini's MCP/connector settings (surface varies by
   rollout). Browser agents on contact.html also get in-page tools via WebMCP.

## 10. Rollback

- **Pause agent bookings:** remove `GOOGLE_REFRESH_TOKEN` in Vercel and redeploy — the
  server drops to degraded mode (hand-offs only) instantly, nothing 500s.
- **Kill the credential:** https://myaccount.google.com/permissions (as zach@) → remove
  "Gaelworx MCP". The refresh token dies immediately.
- **Full stop:** blank the `tools` array in `api/mcp.mjs` or take down
  `.well-known/mcp/` — the site itself is unaffected.
