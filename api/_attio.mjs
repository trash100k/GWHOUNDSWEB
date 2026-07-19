// Attio CRM lead logging for the Gaelworx MCP server (underscore prefix = not a route).
// Best-effort and fire-and-forget: booking flow never fails because CRM logging did.
// Env: ATTIO_API_KEY (workspace API key with record + note write access).

const ATTIO = 'https://api.attio.com/v2';

export function attioConfigured() {
  return Boolean(process.env.ATTIO_API_KEY);
}

async function attioFetch(path, method, body) {
  const res = await fetch(`${ATTIO}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${process.env.ATTIO_API_KEY}`,
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Attio ${method} ${path} failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  return res.json();
}

// Upsert the person by email, then attach a note describing the lead event.
// Returns { logged: boolean } and never throws.
export async function logLeadToAttio({ name, email, business, event, details }) {
  if (!attioConfigured()) return { logged: false, reason: 'unconfigured' };
  try {
    const person = await attioFetch(
      '/objects/people/records?matching_attribute=email_addresses',
      'PUT',
      {
        data: {
          values: {
            email_addresses: [{ email_address: email }],
            ...(name ? { name: [{ full_name: name }] } : {}),
            ...(business ? { description: [{ value: `Business: ${business}` }] } : {}),
          },
        },
      }
    );
    const recordId = person && person.data && person.data.id && person.data.id.record_id;
    if (recordId) {
      await attioFetch('/notes', 'POST', {
        data: {
          parent_object: 'people',
          parent_record_id: recordId,
          title: event,
          format: 'plaintext',
          content: details,
        },
      });
    }
    return { logged: true };
  } catch (err) {
    console.error('attio logging skipped:', err && err.message);
    return { logged: false, reason: 'error' };
  }
}
