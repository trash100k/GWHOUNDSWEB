/* POST /api/lead — the one lead sink for the whole site.
 *
 * Every lead button/form on the site POSTs JSON here; this delivers it into the
 * Gaelworx inbox by sending through the business Gmail over SMTP. forge@ is an
 * alias for zach@, so mail addressed to LEAD_TO lands in the same box.
 *
 * Same-origin only, so the site's strict CSP (connect-src 'self') already allows
 * the browser fetch — no CSP/vercel.json change needed. The SMTP send happens
 * server-side and is not subject to CSP.
 *
 * Required Vercel environment variables (Project → Settings → Environment Variables):
 *   GMAIL_USER          the sending Google account, e.g. zach@gaelworx.com
 *   GMAIL_APP_PASSWORD  a 16-char Google App Password for that account
 *                       (Google account → Security → 2-Step Verification → App passwords)
 * Optional:
 *   LEAD_TO             where leads are delivered (default: forge@gaelworx.com)
 */
const nodemailer = require('nodemailer');

const MAX = 4000; // hard cap on any single field, in chars
const clean = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v)).slice(0, MAX).trim();
const isEmail = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'POST only' });
  }

  // Vercel parses JSON bodies; be defensive if it arrives as a string.
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { body = {}; } }
  body = body || {};

  // Honeypot: real users never fill a hidden field. Silently accept + drop bots.
  if (clean(body.company_url)) return res.status(200).json({ ok: true });

  const name = clean(body.name);
  const email = clean(body.email);
  const phone = clean(body.phone);
  const business = clean(body.business);
  const service = clean(body.service);
  const message = clean(body.message);
  const source = clean(body.source) || 'website';
  const subject = clean(body.subject) || `New lead — ${name || business || 'website'}`;

  // A reply address is what makes a lead useful; require a valid one.
  if (!isEmail(email)) {
    return res.status(400).json({ ok: false, error: 'A valid email is required.' });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    // Fail loudly in logs, gently to the visitor.
    console.error('[lead] Missing GMAIL_USER / GMAIL_APP_PASSWORD env vars');
    return res.status(500).json({ ok: false, error: 'Mail not configured.' });
  }
  const to = process.env.LEAD_TO || 'forge@gaelworx.com';

  const lines = [
    `Source:   ${source}`,
    name ? `Name:     ${name}` : null,
    business ? `Business: ${business}` : null,
    `Email:    ${email}`,
    phone ? `Phone:    ${phone}` : null,
    service ? `Service:  ${service}` : null,
    '',
    message || '(no message)',
  ].filter((l) => l !== null);

  try {
    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });
    await transport.sendMail({
      from: `"Gaelworx Site" <${user}>`,
      to,
      replyTo: email,
      subject,
      text: lines.join('\n'),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[lead] send failed:', err && err.message);
    return res.status(502).json({ ok: false, error: 'Could not send right now.' });
  }
};
