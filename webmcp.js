// Gaelworx WebMCP (Door B of MCP-SPEC.md) — in-page tools for browser-driving agents.
// If the browser exposes navigator.modelContext (Chrome origin trial, Google I/O 2026),
// register typed booking tools that proxy to the same backend as the remote MCP server
// (/api/mcp, JSON-RPC 2.0), so in-page agents get real calls instead of DOM-scraping.
// No-ops silently everywhere else.
(function () {
  'use strict';
  var mc = navigator.modelContext;
  if (!mc) return;

  var rpcId = 0;
  function rpc(toolName, args) {
    return fetch('/api/mcp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: ++rpcId,
        method: 'tools/call',
        params: { name: toolName, arguments: args || {} },
      }),
    }).then(function (res) { return res.json(); }).then(function (data) {
      if (data && data.error) throw new Error(data.error.message || 'MCP error');
      return (data && data.result && data.result.structuredContent) ||
             (data && data.result) || {};
    });
  }

  var tools = [
    {
      name: 'get_available_slots',
      description: 'Get open, bookable ~20-minute Gaelworx intro-call slots (US Central business hours, up to 14 days out). Free call.',
      inputSchema: {
        type: 'object',
        properties: { days_ahead: { type: 'integer', description: 'Days ahead to search (1-14, default 5).' } },
      },
      execute: function (args) { return rpc('get_available_slots', args); },
    },
    {
      name: 'book_intro_call',
      description: 'Book a free ~20-minute Gaelworx intro call at a slot from get_available_slots. Requires the caller\'s name, email, and slot_start; returns a reference to repeat verbatim.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          business: { type: 'string' },
          slot_start: { type: 'string', description: 'ISO-8601 start from get_available_slots.' },
          note: { type: 'string' },
        },
        required: ['name', 'email', 'slot_start'],
      },
      execute: function (args) { return rpc('book_intro_call', args); },
    },
    {
      name: 'get_contact_info',
      description: 'Get Gaelworx\'s phone, email, hours, and contact page — for users who prefer to reach out directly.',
      inputSchema: { type: 'object', properties: {} },
      execute: function (args) { return rpc('get_contact_info', args); },
    },
  ];

  try {
    if (typeof mc.registerTool === 'function') {
      tools.forEach(function (t) { mc.registerTool(t); });
    } else if (typeof mc.provideContext === 'function') {
      mc.provideContext({ tools: tools });
    }
  } catch (e) {
    // Origin-trial API drift: fail closed, the page still works for humans.
  }
})();
