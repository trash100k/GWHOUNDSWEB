/* gwnav — the forge menu. A MENU control lives in the pinned top bar at EVERY
   width (desktop's inline links are quick paths; this is the site directory —
   the only place all nine pages are always reachable). Opens a full-screen
   forge overlay: page links (current marked), homepage section anchors when on
   index, tel CTA. Proper dialog: focus trap, focus return, Esc, aria-current. */
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
    ['faq.html', 'STRAIGHT ANSWERS'],
    ['contact.html', 'CONTACT']
  ];
  var ANCHORS = [ // shown only on the homepage — its scroll beats
    ['#process', '01 · THE PROCESS'],
    ['#arsenal', '02 · THE ARSENAL'],
    ['#work', '03 · THE WORK'],
    ['#why', '04 · WHY GAELWORX'],
    ['#finale', '05 · THE POUR']
  ];
  var here = (location.pathname.split('/').pop() || 'index.html');

  function boot() {
    var nav = document.querySelector('nav');
    if (!nav || document.querySelector('[data-gwnav-btn]')) return;

    var css = document.createElement('style');
    css.textContent =
      '[data-gwnav-btn]{display:inline-flex;flex:none;align-items:center;gap:8px;padding:13px 17px;border:1px solid rgba(237,230,214,.28);background:none;color:#EDE6D6;font-family:\'Space Mono\',monospace;font-size:11px;letter-spacing:.2em;cursor:pointer;transition:border-color .2s,color .2s;min-height:44px}' +
      '[data-gwnav-btn]:hover{border-color:#B5623A;color:#E9A94F}' +
      '[data-gwnav-overlay]{position:fixed;inset:0;z-index:80;background:radial-gradient(120% 80% at 50% 110%,#1c0f07 0%,#0A0908 55%);display:none;flex-direction:column;padding:calc(18px + env(safe-area-inset-top)) clamp(24px,6vw,72px) calc(26px + env(safe-area-inset-bottom));overflow-y:auto}' +
      '[data-gwnav-overlay].open{display:flex}' +
      '[data-gwnav-overlay] a{-webkit-tap-highlight-color:transparent}' +
      '.gwnav-link{display:block;padding:12px 4px;border-bottom:1px solid rgba(237,230,214,.10);font-family:\'Grenze Gotisch\',serif;font-weight:700;font-size:clamp(25px,4.5vw,38px);line-height:1;color:#DCD3C1;text-decoration:none;transition:color .2s}' +
      '.gwnav-link:hover{color:#E9A94F}' +
      '.gwnav-link[aria-current="page"]{color:#E9A94F}' +
      '.gwnav-link[aria-current="page"]::after{content:" ●";font-size:.4em;vertical-align:middle}' +
      '.gwnav-anchor{display:block;padding:10px 4px;font-family:\'Space Mono\',monospace;font-size:11.5px;letter-spacing:.22em;color:#9A9286;text-decoration:none;border-bottom:1px solid rgba(237,230,214,.06);transition:color .2s}' +
      '.gwnav-anchor:hover{color:#E9A94F}' +
      '.gwnav-x{background:none;border:1px solid rgba(237,230,214,.28);color:#EDE6D6;font-family:\'Space Mono\',monospace;font-size:14px;padding:12px 16px;min-width:44px;min-height:44px;cursor:pointer;transition:border-color .2s}' +
      '.gwnav-x:hover{border-color:#B5623A}' +
      '@media (prefers-reduced-motion:no-preference){[data-gwnav-overlay].open .gwnav-link,[data-gwnav-overlay].open .gwnav-anchor{animation:gwnavIn .45s cubic-bezier(.16,1,.3,1) both}}' +
      '@keyframes gwnavIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}' +
      // Narrow phones (<=400px): the nav row (logo + CALL NOW + MENU) overflowed its
      // overflow-x:auto strip and clipped MENU to a sliver. Tighten so both fit at 320px.
      '@media (max-width:400px){nav>a:first-child{font-size:20px!important}nav>div{gap:8px!important}nav a[href^="tel"]{padding:10px 12px!important;font-size:10.5px!important;letter-spacing:.06em!important}[data-gwnav-btn]{padding:10px 11px!important;font-size:10px!important;letter-spacing:.1em!important}}';
    document.head.appendChild(css);

    var btn = document.createElement('button');
    btn.setAttribute('data-gwnav-btn', '');
    btn.setAttribute('aria-label', 'Open site menu');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = 'MENU';
    var row = nav.querySelector('div');
    (row || nav).appendChild(btn);

    var ov = document.createElement('div');
    ov.setAttribute('data-gwnav-overlay', '');
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Site menu');
    var head = document.createElement('div');
    head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;max-width:680px;width:100%;margin-left:auto;margin-right:auto';
    head.innerHTML = '<span style="font-family:\'Grenze Gotisch\',serif;font-weight:800;font-size:22px;color:#EDE6D6">GAELWORX</span>';
    var x = document.createElement('button');
    x.className = 'gwnav-x';
    x.setAttribute('aria-label', 'Close menu');
    x.textContent = '✕';
    head.appendChild(x);
    ov.appendChild(head);

    var col = document.createElement('div');
    col.style.cssText = 'max-width:680px;width:100%;margin:0 auto';
    var delay = 0;
    if (here === 'index.html' || here === '') {
      ANCHORS.forEach(function (s) {
        var a = document.createElement('a');
        a.className = 'gwnav-anchor';
        a.href = s[0];
        a.textContent = s[1];
        a.style.animationDelay = (delay++ * 0.025) + 's';
        a.addEventListener('click', function () { setOpen(false); });
        col.appendChild(a);
      });
      var gap = document.createElement('div');
      gap.style.height = '18px';
      col.appendChild(gap);
    }
    PAGES.forEach(function (p) {
      var a = document.createElement('a');
      a.className = 'gwnav-link';
      a.href = p[0];
      a.textContent = p[1];
      if (p[0] === here) { a.setAttribute('aria-current', 'page'); a.addEventListener('click', function (e) { e.preventDefault(); setOpen(false); }); }
      a.style.animationDelay = (delay++ * 0.025) + 's';
      col.appendChild(a);
    });
    var call = document.createElement('a');
    call.href = 'tel:+13692121203';
    call.style.cssText = 'margin-top:22px;display:flex;justify-content:center;padding:17px;background:#B5623A;color:#000;font-family:\'Space Mono\',monospace;font-weight:700;font-size:13px;letter-spacing:.18em;text-decoration:none';
    call.textContent = 'START THE FORGE · CALL NOW';
    col.appendChild(call);
    ov.appendChild(col);
    document.body.appendChild(ov);

    function focusables() {
      return ov.querySelectorAll('a[href], button');
    }
    function setOpen(open) {
      ov.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      document.documentElement.style.overflow = open ? 'hidden' : '';
      if (open) x.focus();
      else btn.focus(); // focus returns to the trigger — dialog contract
    }
    btn.addEventListener('click', function () { setOpen(true); });
    x.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (!ov.classList.contains('open')) return;
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab') return;
      // trap Tab inside the dialog
      var f = focusables();
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
