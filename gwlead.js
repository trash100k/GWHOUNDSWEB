/* gwlead.js — wires any <form data-lead-form> on the page to POST /api/lead
   and show honest states, so every lead button routes to the forge inbox.

   Markup contract (the form and its state notes share one parent):
     <form data-lead-form data-subject="…" data-source="…" [data-lead-note="<selector>"]>
       <input type="email" name="email" required>
       <!-- any other name=value inputs are included in the message -->
       <input type="text" name="company_url" tabindex="-1" aria-hidden="true" …offscreen…>  (honeypot)
       <button type="submit">…</button>
     </form>
     <div data-lead-sent  style="display:none">…</div>   shown on success
     <div data-lead-error style="display:none">…</div>   shown on failure
   data-lead-note points at a live element (e.g. a calculator's headline figure);
   its text is appended to the message so the lead carries the number they saw. */
(function () {
  'use strict';
  var forms = document.querySelectorAll('form[data-lead-form]');
  Array.prototype.forEach.call(forms, function (form) {
    var parent = form.parentNode;
    var sent = parent ? parent.querySelector('[data-lead-sent]') : null;
    var err = parent ? parent.querySelector('[data-lead-error]') : null;
    var btn = form.querySelector('button[type="submit"], [type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      if (('' + (fd.get('company_url') || '')).trim()) return; // honeypot → drop bot
      var email = ('' + (fd.get('email') || '')).trim();
      if (!email) return;

      var parts = [];
      fd.forEach(function (v, k) {
        if (k === 'email' || k === 'company_url') return;
        if (('' + v).trim()) parts.push(k + ': ' + v);
      });
      var noteSel = form.getAttribute('data-lead-note');
      if (noteSel) { var n = document.querySelector(noteSel); if (n) parts.push('Figure shown: ' + (n.textContent || '').trim()); }

      var payload = {
        email: email,
        subject: form.getAttribute('data-subject') || 'Website lead',
        source: form.getAttribute('data-source') || 'website',
        message: parts.join('\n') || 'Requested a follow-up.'
      };

      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'SENDING…'; }
      if (err) err.style.display = 'none';

      fetch('/api/lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
        .then(function (r) { if (!r.ok) throw new Error('bad'); return r.json(); })
        .then(function () { form.style.display = 'none'; if (sent) sent.style.display = ''; })
        .catch(function () { if (btn) { btn.disabled = false; btn.textContent = label; } if (err) err.style.display = ''; });
    });
  });
})();
