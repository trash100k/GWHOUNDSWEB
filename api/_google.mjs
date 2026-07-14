// Google integration for the Gaelworx MCP server (underscore prefix = not a route).
// Auth: OAuth refresh token (env), acting as the calendar owner.
//   Required env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
//   Optional env: GOOGLE_CALENDAR_ID (default zach@gaelworx.com),
//                 MAIL_FROM (default forge@gaelworx.com), MAIL_FROM_NAME (default Gaelworx)
// Scopes needed when minting the refresh token:
//   https://www.googleapis.com/auth/calendar  https://www.googleapis.com/auth/gmail.send

export const CALENDAR_TZ = 'America/Chicago';

export function googleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  );
}

export function calendarId() {
  return process.env.GOOGLE_CALENDAR_ID || 'zach@gaelworx.com';
}

export function mailFrom() {
  return process.env.MAIL_FROM || 'forge@gaelworx.com';
}

// ── Access token (cached per warm instance) ──────────────────────────
let tokenCache = { token: null, exp: 0 };

export async function getAccessToken() {
  if (tokenCache.token && Date.now() < tokenCache.exp - 60_000) return tokenCache.token;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Google token refresh failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  const data = await res.json();
  tokenCache = { token: data.access_token, exp: Date.now() + (data.expires_in || 3600) * 1000 };
  return tokenCache.token;
}

// ── Timezone math (America/Chicago, DST-correct, no dependencies) ────
// Offset like "-05:00" for a given instant in a zone.
export function zoneOffset(date, timeZone = CALENDAR_TZ) {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' });
  const part = fmt.formatToParts(date).find((p) => p.type === 'timeZoneName');
  const m = /GMT([+-])(\d{2}):?(\d{2})?/.exec(part ? part.value : '');
  if (!m) return '+00:00';
  return `${m[1]}${m[2]}:${m[3] || '00'}`;
}

function offsetMinutes(date, timeZone) {
  const o = zoneOffset(date, timeZone);
  const sign = o.startsWith('-') ? -1 : 1;
  return sign * (Number(o.slice(1, 3)) * 60 + Number(o.slice(4, 6)));
}

// Convert a wall-clock time in `timeZone` to a real Date (two-pass for DST edges).
export function zonedToUtc(y, mo, d, h, mi, timeZone = CALENDAR_TZ) {
  let guess = new Date(Date.UTC(y, mo - 1, d, h, mi));
  guess = new Date(guess.getTime() - offsetMinutes(guess, timeZone) * 60_000);
  return new Date(Date.UTC(y, mo - 1, d, h, mi) - offsetMinutes(guess, timeZone) * 60_000);
}

// Wall-clock parts of an instant, in a zone.
export function zoneParts(date, timeZone = CALENDAR_TZ) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short',
  });
  const parts = {};
  for (const p of fmt.formatToParts(date)) parts[p.type] = p.value;
  return {
    y: Number(parts.year), mo: Number(parts.month), d: Number(parts.day),
    h: Number(parts.hour === '24' ? '0' : parts.hour), mi: Number(parts.minute),
    weekday: parts.weekday, // 'Mon'..'Sun'
  };
}

export function isoInZone(date, timeZone = CALENDAR_TZ) {
  const p = zoneParts(date, timeZone);
  const pad = (n) => String(n).padStart(2, '0');
  return `${p.y}-${pad(p.mo)}-${pad(p.d)}T${pad(p.h)}:${pad(p.mi)}:00${zoneOffset(date, timeZone)}`;
}

// ── Calendar: free/busy ──────────────────────────────────────────────
export async function freeBusy(timeMin, timeMax) {
  const token = await getAccessToken();
  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      timeMin, timeMax, timeZone: CALENDAR_TZ,
      items: [{ id: calendarId() }],
    }),
  });
  if (!res.ok) throw new Error(`freeBusy failed (${res.status})`);
  const data = await res.json();
  const cal = data.calendars && data.calendars[calendarId()];
  return (cal && cal.busy ? cal.busy : []).map((b) => ({
    start: new Date(b.start).getTime(),
    end: new Date(b.end).getTime(),
  }));
}

// ── Calendar: create the confirmed event with a Meet link ────────────
export async function createBookingEvent({ summary, description, startISO, endISO, attendeeEmail, attendeeName, reference }) {
  const token = await getAccessToken();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId())}/events` +
              `?conferenceDataVersion=1&sendUpdates=all`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      summary,
      description,
      start: { dateTime: startISO, timeZone: CALENDAR_TZ },
      end: { dateTime: endISO, timeZone: CALENDAR_TZ },
      attendees: [{ email: attendeeEmail, displayName: attendeeName || undefined }],
      conferenceData: {
        createRequest: { requestId: reference, conferenceSolutionKey: { type: 'hangoutsMeet' } },
      },
      reminders: { useDefault: true },
      source: { title: 'Gaelworx MCP booking', url: 'https://gaelworx.com/' },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`event insert failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  const ev = await res.json();
  return { eventId: ev.id, meetLink: ev.hangoutLink || null, htmlLink: ev.htmlLink || null };
}

// ── Gmail: plain-text confirmation from the forge@ alias ─────────────
function b64url(str) {
  return Buffer.from(str, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendConfirmationEmail({ to, subject, text }) {
  const token = await getAccessToken();
  const fromName = process.env.MAIL_FROM_NAME || 'Gaelworx';
  const mime = [
    `From: "${fromName}" <${mailFrom()}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    text,
  ].join('\r\n');
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ raw: b64url(mime) }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`gmail send failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  return true;
}
