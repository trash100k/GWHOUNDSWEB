/* embers.js — a real ember particle field on <canvas>. Buoyant rise, turbulent
   flow-noise drift, per-ember cooling color (white-hot → amber → ash-red),
   flicker, size decay, additive-glow bloom. Auto-mounts on [data-embers].
   DPR-aware, viewport-paused, reduced-motion static, no library, CSP-safe. */
(function () {
  'use strict';
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  // Cooling ramp: hot core at birth cools as the ember rises and dies.
  var COOL = ['#FFF3C8', '#FCE39A', '#F2C14E', '#E9A94F', '#E2622B', '#B23A1A'];
  var SPRITE_PX = 64;
  function hexRGB(h) { h = h.replace('#', ''); return parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16); }
  // One soft radial-glow sprite per cooling stage, pre-rendered once, drawn cheaply per particle.
  var sprites = COOL.map(function (color) {
    var c = document.createElement('canvas'); c.width = c.height = SPRITE_PX;
    var g = c.getContext('2d'); var r = SPRITE_PX / 2;
    var grd = g.createRadialGradient(r, r, 0, r, r, r);
    grd.addColorStop(0, color);
    grd.addColorStop(0.32, 'rgba(' + hexRGB(color) + ',0.85)');
    grd.addColorStop(1, 'rgba(' + hexRGB(color) + ',0)');
    g.fillStyle = grd; g.beginPath(); g.arc(r, r, r, 0, 6.2832); g.fill();
    return c;
  });

  function mount(host) {
    if (host._embersMounted) return; host._embersMounted = true;
    if (getComputedStyle(host).position === 'static') host.style.position = 'absolute';
    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:block';
    host.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, DPR = 1;
    var dense = parseFloat(host.getAttribute('data-embers-density')) || 1;

    function resize() {
      var r = host.getBoundingClientRect();
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    function target() { return Math.round(Math.min(120, Math.max(22, W / 14)) * dense); }

    function spawn() {
      var fast = Math.random() < 0.12;                 // occasional quick 'pop' spark
      return {
        x: Math.random() * W,
        y: H + 6 + Math.random() * 26,                 // born just below the base
        vx: (Math.random() - 0.5) * 14,
        vy: -(50 + Math.random() * 50) * (fast ? 1.8 : 1),
        life: 0,
        max: (fast ? 2.4 : 4.5) + Math.random() * 4.5, // seconds alive
        size: (fast ? 1.4 : 2.2) + Math.random() * 3.6,
        seed: Math.random() * 6.2832,
        flick: 0.6 + Math.random() * 0.5,
        sway: 0.6 + Math.random() * 1.5
      };
    }
    var parts = [];
    for (var i = 0; i < target(); i++) { var p0 = spawn(); p0.life = Math.random() * p0.max; parts.push(p0); }

    // Cheap flow-noise: layered sines by position + time → turbulent horizontal air.
    function flow(x, y, t) {
      return Math.sin(y * 0.012 + t * 0.7) * 11
        + Math.sin(x * 0.02 - t * 0.9) * 7
        + Math.sin(y * 0.05 + x * 0.011 + t * 1.7) * 4;
    }

    function step(p, dt, t) {
      p.life += dt;
      if (p.life >= p.max || p.y < -50) { var n = spawn(); for (var k in n) p[k] = n[k]; return; }
      p.vy += -40 * dt;              // buoyancy
      p.vy *= (1 - 0.55 * dt);       // drag → terminal rise speed
      var f = flow(p.x, p.y, t) * p.sway;
      p.vx += (f - p.vx) * Math.min(1, dt * 2.5);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    function draw(p) {
      var lf = p.life / p.max;
      var stage = Math.min(sprites.length - 1, (lf * sprites.length) | 0);
      var fade = lf < 0.12 ? lf / 0.12 : (lf > 0.72 ? (1 - lf) / 0.28 : 1);
      var flick = 0.72 + 0.28 * Math.sin(this_t * 9 * p.flick + p.seed);
      var a = fade * flick * (1 - lf * 0.35);
      if (a <= 0) return;
      var r = p.size * (1 - lf * 0.5) * 2.3;
      ctx.globalAlpha = a * 0.9;
      ctx.drawImage(sprites[stage], p.x - r, p.y - r, r * 2, r * 2);
    }

    var raf = 0, last = 0, running = false, this_t = 0;
    function frame(now) {
      if (!running) return;
      var dt = (now - last) / 1000; last = now;
      if (!(dt > 0) || dt > 0.05) dt = 0.016;
      this_t = now / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      var tgt = target();
      for (var i = 0; i < parts.length; i++) { step(parts[i], dt, this_t); draw(parts[i]); }
      while (parts.length < tgt) parts.push(spawn());
      if (parts.length > tgt) parts.length = tgt;
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }

    function start() { if (running || reduce.matches) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    function staticRender() {
      ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], lf = p.life / p.max;
        var stage = Math.min(sprites.length - 1, (lf * sprites.length) | 0);
        var r = p.size * 2.2; ctx.globalAlpha = 0.5 * (1 - lf * 0.5);
        ctx.drawImage(sprites[stage], p.x - r, p.y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (reduce.matches) { staticRender(); return; } e.isIntersecting ? start() : stop(); });
    }, { rootMargin: '140px' });
    io.observe(host);

    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { resize(); if (reduce.matches) staticRender(); }, 150); });
    if (reduce.addEventListener) reduce.addEventListener('change', function () { if (reduce.matches) { stop(); staticRender(); } else start(); });
    if (reduce.matches) staticRender();
  }

  function boot() { document.querySelectorAll('[data-embers]').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
