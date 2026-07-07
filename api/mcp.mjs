// Gaelworx remote MCP server — Door A of MCP-SPEC.md
// Streamable-HTTP, stateless JSON-RPC 2.0. No external dependencies.
//
// Tools:
//   list_services       — read-only, reads the price-lock below (never invents prices)
//   get_available_slots — read-only, proposes standard intro-call slots
//   book_intro_call     — hands the lead off to the human booking path; if a
//                         LEAD_WEBHOOK_URL env var is set, it also POSTs the lead there.
//
// This is the pilot from MCP-SPEC.md. Live calendar free/busy + a durable
// booking write require wiring Google Calendar + a datastore (that team's next
// step); until then get_available_slots proposes standard windows and
// book_intro_call returns a confirmable hand-off with a reference — it never
// falsely claims a calendar hold.

const PROTOCOL_VERSION = '2025-06-18';

const CONTACT = {
  phone: '+1-369-212-1203',
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
  'Never state a price without calling list_services first. To book an intro call, call ' +
  'get_available_slots, then book_intro_call once you have the caller\'s name, email, and a ' +
  'proposed slot. Include the returned reference verbatim in your reply. Intro calls are free.';

const TOOLS = [
  {
    name: 'list_services',
    description: 'List Gaelworx services and their fixed starting prices. Call this before stating any price.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_available_slots',
    description: 'Get proposed open intro-call slots (US Eastern business hours). Call before book_intro_call. Intro calls are free.',
    inputSchema: {
      type: 'object',
      properties: {
        days_ahead: { type: 'integer', description: 'How many days ahead to propose (1-14, default 5).', minimum: 1, maximum: 14 },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'book_intro_call',
    description: 'Request a free intro call at a proposed slot. Call ONLY after get_available_slots, and only once you have the caller\'s name and email. Returns a reference and the confirmation hand-off.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: "Caller's full name." },
        email: { type: 'string', description: "Caller's email address." },
        business: { type: 'string', description: "Caller's business name and trade (e.g. 'Oak & Iron HVAC')." },
        slot_start: { type: 'string', description: 'ISO-8601 start time, chosen from get_available_slots.' },
        note: { type: 'string', description: 'Optional: what they want to talk about.' },
      },
      required: ['name', 'email'],
      additionalProperties: false,
    },
  },
];

// ── Tool implementations ──────────────────────────────────────────────
function toolListServices() {
  return {
    currency: 'USD',
    note: 'Fixed starting prices, named before work begins. Full ledger: https://gaelworx.com/pricing.html',
    services: SERVICES,
    contact: CONTACT,
  };
}

function pad(n) { return String(n).padStart(2, '0'); }

function toolGetAvailableSlots(args) {
  const daysAhead = Math.min(14, Math.max(1, Number(args && args.days_ahead) || 5));
  const slots = [];
  const now = new Date();
  const hoursET = [10, 13, 15]; // 10am, 1pm, 3pm — approximate US Eastern windows
  let d = new Date(now.getTime());
  let scanned = 0;
  while (slots.length < daysAhead * hoursET.length && scanned < 30) {
    d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    scanned++;
    const dow = d.getUTCDay();
    if (dow === 0 || dow === 6) continue; // skip weekends
    for (const h of hoursET) {
      // Represent as ET (UTC-4/-5); label as ET, encode UTC offset -04:00 as a reasonable default.
      const iso = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(h)}:00:00-04:00`;
      slots.push({ start: iso, label: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(h)}:00 ET`, duration_minutes: 20 });
    }
    if (slots.length >= daysAhead * hoursET.length) break;
  }
  return {
    slots,
    availability_note: 'These are standard proposed windows. Final time is confirmed by email when you book — the intro call is free and about 20 minutes.',
    timezone: 'America/New_York',
  };
}

async function toolBookIntroCall(args) {
  const name = args && args.name;
  const email = args && args.email;
  if (!name || !email) {
    throw { code: -32602, message: 'book_intro_call requires at least name and email.' };
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
  if (!emailOk) {
    throw { code: -32602, message: 'The email address does not look valid. Confirm it with the caller.' };
  }
  // Deterministic-ish reference from the inputs (no randomness needed).
  const seed = (String(name) + String(email) + String(args.slot_start || '')).split('').reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 5381);
  const reference = 'GW-' + seed.toString(36).toUpperCase().slice(0, 6);

  const lead = {
    reference,
    name: String(name),
    email: String(email),
    business: args.business ? String(args.business) : null,
    slot_start: args.slot_start ? String(args.slot_start) : null,
    note: args.note ? String(args.note) : null,
    source: 'mcp:book_intro_call',
  };

  // If a webhook is configured, forward the lead (activates live capture with zero code change).
  let forwarded = false;
  const hook = process.env.LEAD_WEBHOOK_URL;
  if (hook) {
    try {
      await fetch(hook, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(lead),
      });
      forwarded = true;
    } catch (_) { forwarded = false; }
  }

  const mailto =
    'mailto:hello@gaelworx.com?subject=' +
    encodeURIComponent(`Intro call request ${reference}`) +
    '&body=' +
    encodeURIComponent(
      `Name: ${lead.name}\nEmail: ${lead.email}\nBusiness: ${lead.business || ''}\n` +
      `Proposed time: ${lead.slot_start || '(no preference)'}\nNote: ${lead.note || ''}\nReference: ${reference}\n`
    );

  return {
    reference,
    status: forwarded ? 'received' : 'pending_confirmation',
    message: forwarded
      ? `Intro-call request ${reference} received. Gaelworx will confirm the exact time by email at ${lead.email}. The call is free (~20 min).`
      : `Intro-call request ${reference} prepared. To lock it in, Gaelworx confirms by email at ${lead.email} — or book instantly at ${CONTACT.booking_url} or call ${CONTACT.phone}. The call is free (~20 min).`,
    confirm_url: CONTACT.booking_url,
    confirm_email: CONTACT.email,
    confirm_phone: CONTACT.phone,
    mailto,
  };
}

async function callTool(name, args) {
  let payload;
  if (name === 'list_services') payload = toolListServices();
  else if (name === 'get_available_slots') payload = toolGetAvailableSlots(args || {});
  else if (name === 'book_intro_call') payload = await toolBookIntroCall(args || {});
  else throw { code: -32602, message: `Unknown tool: ${name}` };
  return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] };
}

// ── JSON-RPC dispatch ─────────────────────────────────────────────────
async function dispatch(msg) {
  const { id, method, params } = msg;
  // Notifications (no id) get no response.
  if (id === undefined || id === null) {
    return null;
  }
  try {
    if (method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: 'gaelworx-booking', title: 'Gaelworx', version: '1.0.0' },
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
      protocolVersion: PROTOCOL_VERSION,
      transport: 'streamable-http',
      tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
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

  // Support JSON-RPC batches.
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
