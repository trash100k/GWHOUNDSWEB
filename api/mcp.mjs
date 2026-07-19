// Gaelworx remote MCP server v2 — Door A of MCP-SPEC.md, built out per MCP-BOOKING-CONTACT-PLAN.md.
// Streamable-HTTP, stateless JSON-RPC 2.0. No external dependencies.
//
// Surface:
//   tools     — list_services, get_available_slots (live Google free/busy),
//               book_intro_call (auto-books a real Calendar event with a Meet link,
//               invites the prospect, emails a confirmation from the forge@ alias,
//               logs the lead to Attio), get_contact_info
//   resources — gaelworx://services, gaelworx://contact, gaelworx://company,
//               ui://widget/slots-card.html (ChatGPT Apps SDK slot-picker card)
//   prompts   — book_gaelworx_intro_call, find_my_gaelworx_service
//
// Degraded mode: with no GOOGLE_* env vars the server still works — slots become
// standard proposed windows and book_intro_call returns a confirmable hand-off.
// It never falsely claims a calendar hold.

import {
  googleConfigured, freeBusy, createBookingEvent, sendConfirmationEmail,
  zonedToUtc, zoneParts, isoInZone, CALENDAR_TZ,
} from './_google.mjs';
import { logLeadToAttio } from './_attio.mjs';

const SUPPORTED_PROTOCOLS = ['2025-06-18', '2025-03-26'];
const LATEST_PROTOCOL = '2025-06-18';
const SERVER_VERSION = '2.0.0';

const CONTACT = {
  phone: '+1-369-212-1203',
  phone_display: '+1 (369) 212-1203',
  email: 'hello@gaelworx.com',
  booking_url: 'https://gaelworx.com/contact.html',
  site: 'https://gaelworx.com/',
};

// ── Price-lock: the single source of truth for prices this server may state ──
const SERVICES = [
  {
    id: 'voice-agents',
    name: 'Managed AI Voice Agents',
    summary: 'A managed AI receptionist that answers every inbound call, qualifies leads, and books jobs straight to your calendar.',
    price: { from: 899, currency: 'USD', unit: 'month' },
    price_notes: 'From $899/mo per agent. Includes 3,000 minutes/mo (then $0.30/min). One-time $2,500 setup. $50 per booked appointment.',
    url: 'https://gaelworx.com/voice.html',
  },
  {
    id: 'automations',
    name: 'Workflow Automation Engines',
    summary: 'Quoting, follow-up, invoicing, and review-collection running on managed-agent rails.',
    price: { from: 2500, currency: 'USD', unit: 'project' },
    price_notes: 'From $2,500.',
    url: 'https://gaelworx.com/automations.html',
  },
  {
    id: 'software',
    name: 'Custom Business Software',
    summary: 'Internal tools and platforms delivered with full ownership — code, docs, and data are yours.',
    price: { from: 15000, currency: 'USD', unit: 'project' },
    price_notes: 'From $15,000. You own the deliverables outright on final payment.',
    url: 'https://gaelworx.com/software.html',
  },
  {
    id: 'web',
    name: 'Web Design',
    summary: 'Hand-built alive 2D sites, cinematic 3D sites, and full 3D agentic web presences.',
    price: { from: 1499, currency: 'USD', unit: 'project' },
    price_notes: 'Alive 2D from $1,499. Cinematic 3D from $3,500. Full 3D agentic presence + by-hand branding from $9,999. Care plans from $49/mo.',
    url: 'https://gaelworx.com/web.html',
  },
  {
    id: 'install',
    name: 'AI Installation',
    summary: 'We stand up your entire AI stack (Claude/ChatGPT/Gemini, managed agents, and the hardware to run them) and train your team.',
    price: { from: 2500, currency: 'USD', unit: 'project' },
    price_notes: 'From $2,500.',
    url: 'https://gaelworx.com/install.html',
  },
];

const INSTRUCTIONS =
  'Gaelworx is an AI-automation agency for trades and small businesses in the continental US. ' +
  'Never state a price without calling list_services first. To book a free ~20-minute intro call, ' +
  'call get_available_slots, then book_intro_call once you have the caller\'s name, email, and a ' +
  'slot returned by get_available_slots. Include the returned reference verbatim in your reply. ' +
  'If the user prefers to reach out directly, or a booking cannot be completed (missing details, ' +
  'no workable slot, or an error), call get_contact_info and offer Gaelworx\'s phone number and ' +
  'email in your reply instead — never leave the user without a way to reach us. ' +
  'All times are US Central (America/Chicago). Intro calls are free.';

// ── Booking rules (code, not prompt) ─────────────────────────────────
const SLOT_MINUTES = 20;
const GRID_MINUTES = 30;            // slots start on :00 / :30
const DAY_START_HOUR = 9;           // 9:00 CT
const DAY_LAST_START = { h: 16, mi: 30 }; // last start 4:30pm CT
const MIN_NOTICE_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_DAYS_OUT = 14;
const MAX_BOOKINGS_PER_EMAIL_PER_DAY = 3; // best-effort, per warm instance

const bookingLedger = new Map(); // email -> { day: 'YYYY-MM-DD', count, slots: Set }

// ── Tools ─────────────────────────────────────────────────────────────
const TOOLS = [
  {
    name: 'list_services',
    title: 'List Gaelworx services & prices',
    description: 'List Gaelworx services and their fixed starting prices. Call this before stating any price — never invent prices.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'get_available_slots',
    title: 'Get open intro-call slots',
    description: 'Get open, bookable ~20-minute intro-call slots (US Central business hours, up to 14 days out), checked against the live Gaelworx calendar. Call before book_intro_call. Intro calls are free.',
    inputSchema: {
      type: 'object',
      properties: {
        days_ahead: { type: 'integer', description: 'How many days ahead to search (1-14, default 5).', minimum: 1, maximum: 14 },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
    _meta: { 'openai/outputTemplate': 'ui://widget/slots-card.html' },
  },
  {
    name: 'book_intro_call',
    title: 'Book a free intro call',
    description: 'Book a free ~20-minute intro call at a slot returned by get_available_slots. Call ONLY after get_available_slots, and only once you have the caller\'s name and email. On success the call is confirmed: a calendar invite with a Google Meet link is emailed to the caller. Include the returned reference verbatim in your reply.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: "Caller's full name." },
        email: { type: 'string', description: "Caller's email address (receives the calendar invite)." },
        business: { type: 'string', description: "Caller's business name and trade (e.g. 'Oak & Iron HVAC')." },
        slot_start: { type: 'string', description: 'ISO-8601 start time, chosen from get_available_slots.' },
        note: { type: 'string', description: 'Optional: what they want to talk about.' },
      },
      required: ['name', 'email', 'slot_start'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'get_contact_info',
    title: 'Get Gaelworx contact details',
    description: 'Get Gaelworx\'s direct contact details — phone, email, hours, and the contact page. Call this when the user asks how to reach Gaelworx, prefers to call or email themselves, or when booking cannot be completed.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
];

// ── Resources ─────────────────────────────────────────────────────────
const COMPANY_MD = `# Gaelworx

AI automation agency for trades and small businesses in the continental US.
Motto: NON SINE PERICULO — the smith carries the risk, not the customer.

## How we work
- One free ~20-minute intro call scopes the build; you leave with a fixed number, not a process.
- A deposit starts the work; the balance is billed when the system executes as scoped.
- On final payment the client owns the deliverables outright: code, documentation, data.

## Services (fixed starting prices)
${SERVICES.map((s) => `- ${s.name} — ${s.price_notes} ${s.url}`).join('\n')}

## Contact
Phone ${CONTACT.phone_display} · Email ${CONTACT.email} · ${CONTACT.booking_url}
You'll hear back within one business day. A person, not a sequence.`;

// ChatGPT Apps SDK widget: renders get_available_slots output as a clickable card.
const SLOTS_WIDGET_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body{font-family:system-ui,-apple-system,sans-serif;margin:0;padding:12px;background:transparent;color:inherit}
  .gw-h{font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.7;margin:0 0 10px}
  .gw-grid{display:flex;flex-wrap:wrap;gap:8px}
  .gw-slot{border:1px solid rgba(181,98,58,.55);background:rgba(181,98,58,.10);color:inherit;
    padding:8px 12px;border-radius:8px;font-size:13px;cursor:pointer;transition:background .15s}
  .gw-slot:hover{background:rgba(181,98,58,.28)}
  .gw-note{font-size:12px;opacity:.65;margin-top:10px}
</style></head><body>
<p class="gw-h">Gaelworx — open intro-call slots (US Central)</p>
<div class="gw-grid" id="slots"></div>
<p class="gw-note">Free, ~20 minutes, on Google Meet. Pick a time to book it.</p>
<script>
  const out = (window.openai && window.openai.toolOutput) || {};
  const slots = (out.slots || []).slice(0, 18);
  const grid = document.getElementById('slots');
  for (const s of slots) {
    const b = document.createElement('button');
    b.className = 'gw-slot';
    b.textContent = s.label || s.start;
    b.addEventListener('click', () => {
      const msg = 'Book the Gaelworx intro call at ' + (s.label || s.start) + ' (slot_start: ' + s.start + ').';
      const oai = window.openai || {};
      if (oai.sendFollowUpMessage) oai.sendFollowUpMessage({ prompt: msg });
      else if (oai.sendFollowupMessage) oai.sendFollowupMessage({ prompt: msg });
    });
    grid.appendChild(b);
  }
  if (!slots.length) grid.textContent = 'No open slots in this window — ask for more days ahead, or call ' + '+1 (369) 212-1203.';
</script>
</body></html>`;

const RESOURCES = [
  {
    uri: 'gaelworx://services',
    name: 'Gaelworx services & price-lock',
    description: 'The authoritative service list with fixed starting prices (same source list_services reads).',
    mimeType: 'application/json',
    text: () => JSON.stringify({ currency: 'USD', services: SERVICES, ledger: 'https://gaelworx.com/pricing.html' }, null, 2),
  },
  {
    uri: 'gaelworx://contact',
    name: 'Gaelworx contact details',
    description: 'Phone, email, contact page, and response promise.',
    mimeType: 'application/json',
    text: () => JSON.stringify({ ...CONTACT, hours: 'Available 7 days, continental US, US Central business hours for calls.', response_promise: "You'll hear back within one business day. A person, not a sequence." }, null, 2),
  },
  {
    uri: 'gaelworx://company',
    name: 'About Gaelworx',
    description: 'Company overview: how we work, services, ownership terms, contact.',
    mimeType: 'text/markdown',
    text: () => COMPANY_MD,
  },
  {
    uri: 'ui://widget/slots-card.html',
    name: 'Slot picker card',
    description: 'ChatGPT Apps SDK widget that renders open slots as a clickable card.',
    mimeType: 'text/html+skybridge',
    text: () => SLOTS_WIDGET_HTML,
  },
];

// ── Prompts ───────────────────────────────────────────────────────────
const PROMPTS = [
  {
    name: 'book_gaelworx_intro_call',
    title: 'Book a Gaelworx intro call',
    description: 'Guide the user through booking a free ~20-minute Gaelworx intro call end-to-end.',
    arguments: [
      { name: 'topic', description: 'What the user wants to talk about (optional).', required: false },
    ],
    build: (args) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text:
            'Help me book a free intro call with Gaelworx' +
            (args && args.topic ? ` about: ${args.topic}.` : '.') +
            ' Use get_available_slots to show me open times (US Central), ask me to pick one, ' +
            'collect my name and email, then call book_intro_call and give me the reference and Meet link. ' +
            'If I would rather reach out myself, use get_contact_info and give me the phone and email.',
        },
      },
    ],
  },
  {
    name: 'find_my_gaelworx_service',
    title: 'Which Gaelworx service fits my business?',
    description: 'Match the user\'s trade and pain point to the right Gaelworx service with its fixed price.',
    arguments: [
      { name: 'trade', description: "The user's trade or business type (e.g. 'HVAC', 'tattoo studio').", required: true },
      { name: 'pain', description: 'The biggest operational pain (e.g. missed calls, slow quotes).', required: false },
    ],
    build: (args) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text:
            `I run a ${(args && args.trade) || 'small'} business` +
            (args && args.pain ? ` and my biggest problem is: ${args.pain}.` : '.') +
            ' Call list_services, recommend the single best-fit Gaelworx service with its exact fixed price, ' +
            'explain why in two sentences, then offer to book a free intro call.',
        },
      },
    ],
  },
];

// ── Slot engine ───────────────────────────────────────────────────────
function candidateSlots(daysAhead) {
  const now = Date.now();
  const earliest = now + MIN_NOTICE_MS;
  const out = [];
  for (let dayOffset = 0; dayOffset <= Math.min(daysAhead, MAX_DAYS_OUT); dayOffset++) {
    const probe = new Date(now + dayOffset * 24 * 60 * 60 * 1000);
    const p = zoneParts(probe, CALENDAR_TZ);
    if (p.weekday === 'Sat' || p.weekday === 'Sun') continue;
    for (let h = DAY_START_HOUR; h <= DAY_LAST_START.h; h++) {
      for (let mi = 0; mi < 60; mi += GRID_MINUTES) {
        if (h === DAY_LAST_START.h && mi > DAY_LAST_START.mi) continue;
        const start = zonedToUtc(p.y, p.mo, p.d, h, mi, CALENDAR_TZ);
        if (start.getTime() < earliest) continue;
        out.push(start);
      }
    }
  }
  return out;
}

function labelFor(start) {
  const p = zoneParts(start, CALENDAR_TZ);
  const pad = (n) => String(n).padStart(2, '0');
  const h12 = ((p.h + 11) % 12) + 1;
  const ampm = p.h >= 12 ? 'pm' : 'am';
  return `${p.weekday} ${p.y}-${pad(p.mo)}-${pad(p.d)} ${h12}:${pad(p.mi)}${ampm} CT`;
}

async function openSlots(daysAhead) {
  const candidates = candidateSlots(daysAhead);
  if (!candidates.length) return { slots: [], live: googleConfigured() };
  if (!googleConfigured()) {
    return {
      slots: candidates.slice(0, 24).map((s) => ({
        start: isoInZone(s), label: labelFor(s), duration_minutes: SLOT_MINUTES,
      })),
      live: false,
    };
  }
  const windowStart = new Date(candidates[0].getTime());
  const last = candidates[candidates.length - 1];
  const windowEnd = new Date(last.getTime() + SLOT_MINUTES * 60 * 1000);
  const busy = await freeBusy(windowStart.toISOString(), windowEnd.toISOString());
  const free = candidates.filter((s) => {
    const a = s.getTime();
    const b = a + SLOT_MINUTES * 60 * 1000;
    return !busy.some((x) => a < x.end && b > x.start);
  });
  return {
    slots: free.slice(0, 24).map((s) => ({
      start: isoInZone(s), label: labelFor(s), duration_minutes: SLOT_MINUTES,
    })),
    live: true,
  };
}

function validateSlotStart(slotStart) {
  const t = new Date(slotStart);
  if (isNaN(t.getTime())) throw { code: -32602, message: 'slot_start is not a valid ISO-8601 time.' };
  const now = Date.now();
  if (t.getTime() < now + MIN_NOTICE_MS) throw { code: -32602, message: 'That slot is too soon — pick a slot from get_available_slots (at least 2 hours out).' };
  if (t.getTime() > now + MAX_DAYS_OUT * 24 * 60 * 60 * 1000) throw { code: -32602, message: `Slots must be within ${MAX_DAYS_OUT} days. Call get_available_slots for current options.` };
  const p = zoneParts(t, CALENDAR_TZ);
  if (p.weekday === 'Sat' || p.weekday === 'Sun') throw { code: -32602, message: 'Intro calls are booked on weekdays (US Central). Call get_available_slots for current options.' };
  const onGrid = p.mi % GRID_MINUTES === 0;
  const inHours = p.h > DAY_START_HOUR - 1 && (p.h < DAY_LAST_START.h || (p.h === DAY_LAST_START.h && p.mi <= DAY_LAST_START.mi));
  if (!onGrid || !inHours) throw { code: -32602, message: 'That time is outside bookable windows. Use a slot exactly as returned by get_available_slots.' };
  return t;
}

// ── Tool implementations ──────────────────────────────────────────────
function toolListServices() {
  return {
    currency: 'USD',
    note: 'Fixed starting prices, named before work begins. Full ledger: https://gaelworx.com/pricing.html',
    services: SERVICES,
    contact: CONTACT,
  };
}

function toolGetContactInfo() {
  return {
    phone: CONTACT.phone,
    phone_display: CONTACT.phone_display,
    email: CONTACT.email,
    contact_page: CONTACT.booking_url,
    website: CONTACT.site,
    hours: 'Available 7 days, continental US. Intro calls book in US Central business hours.',
    response_promise: "You'll hear back within one business day. A person, not a sequence.",
    note: 'Intro calls are free (~20 min). To book one in-chat instead, use get_available_slots then book_intro_call.',
  };
}

async function toolGetAvailableSlots(args) {
  const daysAhead = Math.min(MAX_DAYS_OUT, Math.max(1, Number(args && args.days_ahead) || 5));
  const { slots, live } = await openSlots(daysAhead);
  return {
    slots,
    timezone: CALENDAR_TZ,
    availability_note: live
      ? 'Live availability from the Gaelworx calendar. Booking a slot confirms it instantly with a Google Meet invite.'
      : 'These are standard proposed windows. Final time is confirmed by email when you book — the intro call is free and about 20 minutes.',
  };
}

function ledgerCheck(email, slotISO) {
  const day = new Date().toISOString().slice(0, 10);
  let entry = bookingLedger.get(email);
  if (!entry || entry.day !== day) { entry = { day, count: 0, slots: new Set() }; bookingLedger.set(email, entry); }
  if (entry.slots.has(slotISO)) return 'duplicate';
  if (entry.count >= MAX_BOOKINGS_PER_EMAIL_PER_DAY) return 'over_limit';
  return 'ok';
}

function ledgerRecord(email, slotISO) {
  const entry = bookingLedger.get(email);
  if (entry) { entry.count++; entry.slots.add(slotISO); }
}

async function toolBookIntroCall(args) {
  const name = args && args.name && String(args.name).trim();
  const email = args && args.email && String(args.email).trim();
  const slotStart = args && args.slot_start && String(args.slot_start).trim();
  if (!name || !email || !slotStart) {
    throw { code: -32602, message: 'book_intro_call requires name, email, and slot_start (from get_available_slots).' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw { code: -32602, message: 'The email address does not look valid. Confirm it with the caller.' };
  }

  const seed = (name + email + slotStart).split('').reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 5381);
  const reference = 'GW-' + seed.toString(36).toUpperCase().slice(0, 6);

  const gate = ledgerCheck(email.toLowerCase(), slotStart);
  if (gate === 'duplicate') {
    return { reference, status: 'already_booked', message: `This slot was already requested for ${email} — reference ${reference}. No duplicate was created.` };
  }
  if (gate === 'over_limit') {
    throw { code: -32602, message: `Booking limit reached for ${email} today. To change a time, call ${CONTACT.phone_display} or email ${CONTACT.email}.` };
  }

  const lead = {
    reference, name, email,
    business: args.business ? String(args.business) : null,
    slot_start: slotStart,
    note: args.note ? String(args.note) : null,
    source: 'mcp:book_intro_call',
  };

  // Fire-and-forget side channels shared by both modes.
  const sideEffects = async (statusForLog) => {
    const details =
      `Reference: ${reference}\nStatus: ${statusForLog}\nName: ${name}\nEmail: ${email}\n` +
      `Business: ${lead.business || '—'}\nSlot: ${slotStart} (${CALENDAR_TZ})\nNote: ${lead.note || '—'}\nSource: MCP (assistant booking)`;
    await Promise.allSettled([
      logLeadToAttio({ name, email, business: lead.business, event: `Intro call ${statusForLog} — ${reference}`, details }),
      (async () => {
        const hook = process.env.LEAD_WEBHOOK_URL;
        if (hook) await fetch(hook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(lead) });
      })(),
    ]);
  };

  // Degraded mode — no Google creds: confirmable hand-off, never a fake hold.
  if (!googleConfigured()) {
    await sideEffects('requested (pending confirmation)');
    ledgerRecord(email.toLowerCase(), slotStart);
    return {
      reference,
      status: 'pending_confirmation',
      message: `Intro-call request ${reference} received for ${slotStart}. Gaelworx confirms the exact time by email at ${email} — or book instantly at ${CONTACT.booking_url} or call ${CONTACT.phone_display}. The call is free (~20 min).`,
      confirm_url: CONTACT.booking_url,
      confirm_email: CONTACT.email,
      confirm_phone: CONTACT.phone,
    };
  }

  // Live mode — validate, atomic re-check, create the real event.
  const startDate = validateSlotStart(slotStart);
  const endDate = new Date(startDate.getTime() + SLOT_MINUTES * 60 * 1000);
  const busy = await freeBusy(startDate.toISOString(), endDate.toISOString());
  const clash = busy.some((x) => startDate.getTime() < x.end && endDate.getTime() > x.start);
  if (clash) {
    return {
      reference,
      status: 'slot_taken',
      message: 'That slot was just taken. Call get_available_slots again and offer the caller a fresh time.',
    };
  }

  const startISO = isoInZone(startDate);
  const endISO = isoInZone(endDate);
  const event = await createBookingEvent({
    summary: `Gaelworx intro call — ${name}${lead.business ? ` (${lead.business})` : ''}`,
    description:
      `Free ~20-minute Gaelworx intro call.\nReference: ${reference}\n` +
      `Booked in-chat by the caller's AI assistant via MCP.\n` +
      (lead.note ? `Topic: ${lead.note}\n` : '') +
      `Gaelworx: ${CONTACT.phone_display} · ${CONTACT.email}`,
    startISO, endISO,
    attendeeEmail: email,
    attendeeName: name,
    reference,
  });

  ledgerRecord(email.toLowerCase(), slotStart);

  let emailSent = false;
  try {
    await sendConfirmationEmail({
      to: email,
      subject: `Confirmed: your Gaelworx intro call — ${reference}`,
      text:
        `${name.split(' ')[0]},\n\n` +
        `Your free intro call with Gaelworx is booked.\n\n` +
        `When: ${labelFor(startDate)} (~20 minutes)\n` +
        (event.meetLink ? `Where: ${event.meetLink}\n` : 'Where: Google Meet (link in the calendar invite)\n') +
        `Reference: ${reference}\n\n` +
        `A calendar invite is on its way to this address. Need to change the time?\n` +
        `Reply to this email or call ${CONTACT.phone_display}.\n\n` +
        `— Gaelworx · gaelworx.com · NON SINE PERICULO`,
    });
    emailSent = true;
  } catch (err) {
    console.error('confirmation email failed:', err && err.message);
  }

  await sideEffects('booked (confirmed)');

  return {
    reference,
    status: 'booked',
    start: startISO,
    end: endISO,
    timezone: CALENDAR_TZ,
    meet_link: event.meetLink,
    message:
      `Booked. ${labelFor(startDate)}, free, ~20 minutes, on Google Meet. ` +
      `A calendar invite${emailSent ? ' and a confirmation email are' : ' is'} on the way to ${email}. ` +
      `Reference: ${reference}.`,
  };
}

async function callTool(name, args) {
  let payload;
  if (name === 'list_services') payload = toolListServices();
  else if (name === 'get_available_slots') payload = await toolGetAvailableSlots(args || {});
  else if (name === 'book_intro_call') payload = await toolBookIntroCall(args || {});
  else if (name === 'get_contact_info') payload = toolGetContactInfo();
  else throw { code: -32602, message: `Unknown tool: ${name}` };
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

// ── JSON-RPC dispatch ─────────────────────────────────────────────────
async function dispatch(msg) {
  const { id, method, params } = msg;
  if (id === undefined || id === null) return null; // notification
  try {
    if (method === 'initialize') {
      const asked = params && params.protocolVersion;
      return {
        jsonrpc: '2.0', id,
        result: {
          protocolVersion: SUPPORTED_PROTOCOLS.includes(asked) ? asked : LATEST_PROTOCOL,
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false },
          },
          serverInfo: { name: 'gaelworx-booking', title: 'Gaelworx', version: SERVER_VERSION },
          instructions: INSTRUCTIONS,
        },
      };
    }
    if (method === 'ping') return { jsonrpc: '2.0', id, result: {} };
    if (method === 'tools/list') return { jsonrpc: '2.0', id, result: { tools: TOOLS } };
    if (method === 'tools/call') {
      const result = await callTool(params && params.name, params && params.arguments);
      return { jsonrpc: '2.0', id, result };
    }
    if (method === 'resources/list') {
      return {
        jsonrpc: '2.0', id,
        result: { resources: RESOURCES.map(({ uri, name, description, mimeType }) => ({ uri, name, description, mimeType })) },
      };
    }
    if (method === 'resources/read') {
      const uri = params && params.uri;
      const r = RESOURCES.find((x) => x.uri === uri);
      if (!r) return { jsonrpc: '2.0', id, error: { code: -32002, message: `Unknown resource: ${uri}` } };
      return { jsonrpc: '2.0', id, result: { contents: [{ uri: r.uri, mimeType: r.mimeType, text: r.text() }] } };
    }
    if (method === 'resources/templates/list') {
      return { jsonrpc: '2.0', id, result: { resourceTemplates: [] } };
    }
    if (method === 'prompts/list') {
      return {
        jsonrpc: '2.0', id,
        result: { prompts: PROMPTS.map(({ name, title, description, arguments: a }) => ({ name, title, description, arguments: a })) },
      };
    }
    if (method === 'prompts/get') {
      const p = PROMPTS.find((x) => x.name === (params && params.name));
      if (!p) return { jsonrpc: '2.0', id, error: { code: -32602, message: `Unknown prompt: ${params && params.name}` } };
      return { jsonrpc: '2.0', id, result: { description: p.description, messages: p.build((params && params.arguments) || {}) } };
    }
    return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } };
  } catch (err) {
    const code = (err && err.code) || -32603;
    const message = (err && err.message) || 'Internal error';
    return { jsonrpc: '2.0', id, error: { code, message } };
  }
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Mcp-Session-Id, MCP-Protocol-Version, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null && req.body !== '') {
    if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return null; } }
    return req.body;
  }
  return await new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : null); } catch { resolve(null); } });
    req.on('error', () => resolve(null));
  });
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      name: 'gaelworx-booking',
      description: 'Gaelworx remote MCP server. POST JSON-RPC 2.0 (Streamable HTTP) to this URL.',
      protocolVersion: LATEST_PROTOCOL,
      version: SERVER_VERSION,
      transport: 'streamable-http',
      live_calendar: googleConfigured(),
      tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
      resources: RESOURCES.map((r) => r.uri),
      prompts: PROMPTS.map((p) => p.name),
      docs: 'https://gaelworx.com/.well-known/mcp/server-card.json',
    });
    return;
  }

  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const body = await readBody(req);
  if (body === null) {
    res.status(400).json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  if (Array.isArray(body)) {
    const out = [];
    for (const m of body) { const r = await dispatch(m); if (r) out.push(r); }
    res.status(200).json(out.length ? out : null);
    return;
  }

  const response = await dispatch(body);
  if (response === null) { res.status(202).end(); return; } // notification
  res.status(200).json(response);
}
