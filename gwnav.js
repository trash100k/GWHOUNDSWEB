/* gwnav — the mobile forge menu. On narrow viewports the inline nav links are
   hidden (they're unusable at 10.5px); this injects a MENU button + a
   full-screen overlay so every page stays reachable. Shared across all pages;
   marks the current page molten. Desktop is untouched (button hidden >760px). */
(function () {
  'use strict';
  var PAGES = [
    ['index.html', 'HOME'],
    ['work.html', 'THE WORK'],
    ['pricing.html', 'PRICING'],
    ['voice.html', 'VOICE AGENTS'],
    ['automations.html', 'AUTOMATIONS'],
    ['software.html', 'SOFTWARE'],
    ['web.html', 'CINEMATIC WEB'],
    ['about.html', 'ABOUT'],
    ['contact.html', 'CONTACT']
  ];
  var here = (location.pathname.split('/').pop() || 'index.html');

  function boot() {
    var nav = document.querySelector('nav');
    if (!nav || document.querySelector('[data-gwnav-btn]')) return;

    var css = document.createElement('style');
    css.textContent =
      '[data-gwnav-btn]{display:none;flex:none;align-items:center;gap:8px;padding:12px 16px;border:1px solid rgba(237,230,214,.28);background:none;color:#EDE6D6;font-family:\'Space Mono\',monospace;font-size:11px;letter-spacing:.2em;cursor:pointer}' +
      '@media (max-width:760px){[data-gwnav-btn]{display:inline-flex!important}}' +
      '[data-gwnav-overlay]{position:fixed;inset:0;z-index:80;background:radial-gradient(120% 80% at 50% 110%,#1c0f07 0%,#0A0908 55%);display:none;flex-direction:column;padding:calc(20px + env(safe-area-inset-top)) 24px calc(28px + env(safe-area-inset-bottom));overflow-y:auto}' +
      '[data-gwnav-overlay].open{display:flex}' +
      '[data-gwnav-overlay] a{-webkit-tap-highlight-color:transparent}' +
      '.gwnav-link{display:block;padding:13px 4px;border-bottom:1px solid rgba(237,230,214,.10);font-family:\'Grenze Gotisch\',serif;font-weight:700;font-size:clamp(26px,7vw,34px);line-height:1;color:#DCD3C1;text-decoration:none}' +
      '.gwnav-link.here{color:#E9A94F}' +
      '@media (prefers-reduced-motion:no-preference){[data-gwnav-overlay].open .gwnav-link{animation:gwnavIn .45s cubic-bezier(.16,1,.3,1) both}}' +
      '@keyframes gwnavIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}';
    document.head.appendChild(css);

    var btn = document.createElement('button');
    btn.setAttribute('data-gwnav-btn', '');
    btn.setAttribute('aria-label', 'Open menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = 'MENU';
    var row = nav.querySelector('div');
    (row || nav).appendChild(btn);

    var ov = document.createElement('div');
    ov.setAttribute('data-gwnav-overlay', '');
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Site menu');
    var head = document.createElement('div');
    head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:18px';
    head.innerHTML = '<span style="font-family:\'Grenze Gotisch\',serif;font-weight:800;font-size:22px;color:#EDE6D6">GAELWORX</span>';
    var x = document.createElement('button');
    x.setAttribute('aria-label', 'Close menu');
    x.style.cssText = 'background:none;border:1px solid rgba(237,230,214,.28);color:#EDE6D6;font-family:\'Space Mono\',monospace;font-size:13px;padding:10px 14px;cursor:pointer';
    x.textContent = '✕';
    head.appendChild(x);
    ov.appendChild(head);
    PAGES.forEach(function (p, i) {
      var a = document.createElement('a');
      a.className = 'gwnav-link' + (p[0] === here ? ' here' : '');
      a.href = p[0];
      a.textContent = p[1];
      a.style.animationDelay = (i * 0.03) + 's';
      ov.appendChild(a);
    });
    var call = document.createElement('a');
    call.href = 'tel:+13692121203';
    call.style.cssText = 'margin-top:22px;display:flex;justify-content:center;padding:17px;background:#B5623A;color:#000;font-family:\'Space Mono\',monospace;font-weight:700;font-size:13px;letter-spacing:.18em;text-decoration:none';
    call.textContent = 'START THE FORGE · CALL NOW';
    ov.appendChild(call);
    document.body.appendChild(ov);

    function setOpen(open) {
      ov.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      document.documentElement.style.overflow = open ? 'hidden' : '';
      if (open) x.focus();
    }
    btn.addEventListener('click', function () { setOpen(true); });
    x.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
