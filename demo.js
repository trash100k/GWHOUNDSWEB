/* demo.js — auto-playing, clickable product-tour controller.
   Each [data-demo] holds [data-demo-step] frames (with a data-cap caption),
   a [data-demo-dots] row, a [data-demo-cap] label, and a [data-demo-bar] fill.
   Advances every ~4.4s and loops; pauses on hover/focus and when off-screen;
   dots jump; reduced-motion shows the first step static with no autoplay. */
(function () {
  'use strict';
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var HOLD = 4400;

  document.querySelectorAll('[data-demo]').forEach(function (root) {
    var steps = [].slice.call(root.querySelectorAll('[data-demo-step]'));
    if (!steps.length) return;
    var caps = steps.map(function (s) { return s.getAttribute('data-cap') || ''; });
    var dotsWrap = root.querySelector('[data-demo-dots]');
    var capEl = root.querySelector('[data-demo-cap]');
    var barEl = root.querySelector('[data-demo-bar]');
    var idx = 0, timer = 0, paused = false, inView = false, dots = [];

    if (dotsWrap) steps.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'gw-demo-dot'; b.setAttribute('aria-label', 'Step ' + (i + 1));
      b.addEventListener('click', function () { paused = true; go(i); restart(); });
      dotsWrap.appendChild(b); dots.push(b);
    });

    function go(i) {
      idx = (i % steps.length + steps.length) % steps.length;
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === idx); });
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === idx); d.setAttribute('aria-current', k === idx ? 'step' : 'false'); });
      if (capEl) capEl.textContent = caps[idx];
      if (barEl) { barEl.style.transition = 'none'; barEl.style.width = '0%'; void barEl.offsetWidth;
        if (!reduce.matches && !paused && inView) { barEl.style.transition = 'width ' + HOLD + 'ms linear'; barEl.style.width = '100%'; } }
    }
    function tick() { if (!paused && inView) go(idx + 1); schedule(); }
    function schedule() { clearTimeout(timer); if (!reduce.matches) timer = setTimeout(tick, HOLD); }
    function restart() { schedule(); if (barEl && !reduce.matches) { barEl.style.transition = 'none'; barEl.style.width = '0%'; } }

    go(0);
    if (!reduce.matches) {
      root.addEventListener('mouseenter', function () { paused = true; clearTimeout(timer); });
      root.addEventListener('mouseleave', function () { paused = false; go(idx); schedule(); });
      root.addEventListener('focusin', function () { paused = true; clearTimeout(timer); });
      root.addEventListener('focusout', function () { paused = false; schedule(); });
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { inView = e.isIntersecting; if (inView) { go(idx); schedule(); } else clearTimeout(timer); });
      }, { threshold: 0.35 }).observe(root);
    }
  });

  // ── Waitlist: POST /api/lead with honest joining / joined / error states ──
  var wl = document.querySelector('[data-waitlist]');
  if (wl) wl.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = wl.querySelector('input[type="email"]');
    var email = ((input && input.value) || '').trim();
    if (!email) return;
    var btn = wl.querySelector('button[type="submit"]');
    var formEl = wl.querySelector('[data-waitlist-form]');
    var done = wl.querySelector('[data-waitlist-done]');
    var errEl = wl.querySelector('[data-waitlist-error]');
    var label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'JOINING…'; }
    if (errEl) errEl.style.display = 'none';
    fetch('/api/lead', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email, subject: 'Waitlist — YardWorx + SalesWorx',
        message: 'Add me to the waitlist for YardWorx and SalesWorx.', source: 'waitlist'
      })
    })
      .then(function (r) { if (!r.ok) throw new Error('bad'); return r.json(); })
      .then(function () { if (formEl) formEl.style.display = 'none'; if (done) done.style.display = 'block'; })
      .catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = label; }
        if (errEl) errEl.style.display = 'block';
      });
  });
})();
