/* embers.js — a full-page ember field rising from the bottom of the viewport.
   Hyper-real molten-ember sprite atlas (assets/embers/ember-atlas.png: 6 cooling
   stages × 3 shapes), buoyant + turbulent physics, per-ember cooling by life,
   tumble, and a vertical fade so upper content stays clear. Additive glow.
   Auto-mounts on [data-embers]. DPR-aware, viewport-paused, reduced-motion static,
   no library, CSP-safe (self-hosted asset). */
(function () {
  'use strict';
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var SS = 64, COLS = 6, ROWS = 3;
  var atlas = new Image(), atlasReady = false, onReady = [];
  atlas.onload = function () { atlasReady = true; onReady.forEach(function (f) { f(); }); };
  atlas.src = 'assets/embers/ember-atlas.png';

  function mount(host) {
    if (host._em) return; host._em = 1;
    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:block';
    host.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, DPR = 1, dense = parseFloat(host.getAttribute('data-embers-density')) || 1;

    function resize() {
      var r = host.getBoundingClientRect();
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = (W * DPR) | 0; canvas.height = (H * DPR) | 0;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    function target() { return Math.round(Math.min(140, Math.max(28, W / 11)) * dense); }

    function spawn() {
      var fast = Math.random() < 0.14;                 // occasional quick 'pop' spark
      return {
        x: Math.random() * W,
        y: H + 4 + Math.random() * 20,                 // born at the base — fountain up
        vx: (Math.random() - 0.5) * 6,
        vy: -(46 + Math.random() * 54) * (fast ? 1.8 : 1),
        life: 0, max: (fast ? 3 : 5.5) + Math.random() * 6,
        size: (fast ? 5 : 8) + Math.random() * (fast ? 6 : 16), // px; a few big molten embers, mostly small sparks
        shape: (Math.random() * ROWS) | 0,
        rot: Math.random() * 6.2832, vrot: (Math.random() - 0.5) * 1.2, // tumble
        seed: Math.random() * 6.2832, flick: 0.6 + Math.random() * 0.5, sway: 0.6 + Math.random() * 1.6
      };
    }
    var parts = [];
    for (var i = 0; i < target(); i++) { var p0 = spawn(); p0.life = Math.random() * p0.max; parts.push(p0); }

    function flow(x, y, t) {
      return Math.sin(y * 0.011 + t * 0.6) * 11 + Math.sin(x * 0.02 - t * 0.9) * 7 + Math.sin(y * 0.05 + x * 0.011 + t * 1.6) * 4;
    }

    var raf = 0, last = 0, running = false, T = 0;
    function frame(now) {
      if (!running) return;
      var dt = (now - last) / 1000; last = now; if (!(dt > 0) || dt > 0.05) dt = 0.016; T = now / 1000;
      ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
      var tgt = target();
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i]; p.life += dt;
        if (p.life >= p.max || p.y < -60) { var n = spawn(); for (var k in n) p[k] = n[k]; continue; }
        p.vy += -34 * dt; p.vy *= (1 - 0.5 * dt);
        var f = flow(p.x, p.y, T) * p.sway; p.vx += (f - p.vx) * Math.min(1, dt * 2.3);
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vrot * dt;
        if (!atlasReady) continue;
        var lf = p.life / p.max, stage = Math.min(COLS - 1, (lf * COLS) | 0);
        var fade = lf < 0.1 ? lf / 0.1 : (lf > 0.72 ? (1 - lf) / 0.28 : 1);
        var flick = 0.74 + 0.26 * Math.sin(T * 8 * p.flick + p.seed);
        var yf = p.y / H, vfade = yf > 0.5 ? 1 : Math.max(0, (yf - 0.05) / 0.45); // fade higher up
        var a = fade * flick * (1 - lf * 0.4) * vfade;
        if (a <= 0.01) continue;
        var d = p.size * (1 - lf * 0.35);
        ctx.save();
        ctx.globalAlpha = a < 1 ? a : 1;
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.drawImage(atlas, stage * SS, p.shape * SS, SS, SS, -d / 2, -d / 2, d, d);
        ctx.restore();
      }
      while (parts.length < tgt) parts.push(spawn());
      if (parts.length > tgt) parts.length = tgt;
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }
    function start() { if (running || reduce.matches) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    function staticRender() {
      if (!atlasReady) { onReady.push(staticRender); return; }
      ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], lf = p.life / p.max, stage = Math.min(COLS - 1, (lf * COLS) | 0);
        var yf = p.y / H, vfade = yf > 0.5 ? 1 : Math.max(0, (yf - 0.05) / 0.45);
        var d = p.size * (1 - lf * 0.35); ctx.save();
        ctx.globalAlpha = 0.6 * (1 - lf * 0.4) * vfade;
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.drawImage(atlas, stage * SS, p.shape * SS, SS, SS, -d / 2, -d / 2, d, d);
        ctx.restore();
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (reduce.matches) { staticRender(); return; } e.isIntersecting ? start() : stop(); });
    }, { rootMargin: '80px' });
    io.observe(host);

    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { resize(); if (reduce.matches) staticRender(); }, 150); });
    if (reduce.addEventListener) reduce.addEventListener('change', function () { if (reduce.matches) { stop(); staticRender(); } else start(); });
    if (reduce.matches) staticRender();
  }

  function boot() { document.querySelectorAll('[data-embers]').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
