/* gw-coin-3d — the minted Gaelworx coin, real 3D (Three.js r128 UMD).
   Registers <gw-coin-3d>. Host drives flip via el.setFlip(deg); el.isLive
   reports whether WebGL is up. Falls back silently (element stays inert)
   if THREE or WebGL is unavailable, leaving the CSS coin visible.

   Performance: the coin's source textures (copper face, etched reverse, emboss
   bump, emissive map, fire-core glow) are generated ONCE per page and shared by
   every coin instance — the heavy 2D work never runs twice. And each coin defers
   its build until it is near the viewport, so a coin far down the page (e.g. the
   full-bleed finale coin) costs nothing during the initial load. Large background
   coins render at 1× device-pixel-ratio so a full-bleed canvas stays cheap. */
(function () {
  'use strict';
  if (customElements.get('gw-coin-3d')) return;

  // Load three.js right away, self-hosted from our own origin. A dynamically-
  // inserted script is async, so it downloads in parallel without blocking
  // parsing. Self-hosting (instead of a CDN) means it can't be blocked by a
  // network that filters cdnjs — on those networks three.js never loaded and
  // the coin was stuck on its flat CSS fallback. Same-origin, so no SRI /
  // crossorigin needed.
  // Waiters for THREE becoming available, notified by the script's own load
  // event (see _waitThree below) instead of polling — measured: polling for
  // window.THREE at a 50ms interval cost ~61ms of pure dead time versus
  // reacting to onload directly.
  var _threeWaiters = [];
  if (!window.THREE && !window.__gwThree) {
    window.__gwThree = 1;
    var s = document.createElement('script');
    s.src = 'assets/three.min.js';
    s.onload = function () {
      var w = _threeWaiters; _threeWaiters = [];
      w.forEach(function (f) { f(); });
    };
    document.head.appendChild(s);
  }

  var IMG_PATHS = ['assets/knot-copper.webp', 'assets/knot-solid.webp', 'assets/knot-etch.png'];

  // ── shared once per page: the loaded images and the generated source canvases.
  //    Every coin wraps these same canvases in its own (cheap) CanvasTextures. ──
  var _imgs = null, _imgWaiters = [], _imgLoading = false, _imgDead = false;
  var _canvases = null;

  function loadImages(cb) {
    if (_imgs) { cb(_imgs); return; }
    if (_imgDead) { return; }
    _imgWaiters.push(cb);
    if (_imgLoading) return;
    _imgLoading = true;
    var imgs = [], left = IMG_PATHS.length;
    IMG_PATHS.forEach(function (p, i) {
      var im = new Image();
      im.onload = function () {
        imgs[i] = im;
        if (--left === 0) { _imgs = imgs; var w = _imgWaiters; _imgWaiters = []; w.forEach(function (f) { f(imgs); }); }
      };
      im.onerror = function () { _imgDead = true; };
      im.src = p;
    });
  }

  // Start fetching the coin's own texture images now, in parallel with the
  // three.js download above — they don't depend on THREE being ready. Measured:
  // without this, knot-copper.webp (116KB, no other trigger on the page) didn't
  // start downloading until three.js finished PLUS the _waitThree poll/dispatch
  // overhead, ~470ms later on a warm connection. loadImages() is idempotent and
  // shared across every coin instance, so kicking it off here just moves the
  // same fetch earlier — it doesn't add a second one.
  loadImages(function () {});

  function whiteOf(img, S) {
    var c = document.createElement('canvas'); c.width = c.height = S;
    var x = c.getContext('2d');
    x.drawImage(img, 0, 0, S, S);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = '#fff'; x.fillRect(0, 0, S, S);
    return c;
  }

  // Generate the five source canvases once, then cache. Identical output to the
  // original per-instance build — just no longer repeated for each coin.
  function buildCanvases(imgs) {
    if (_canvases) return _canvases;
    var S = 1024, C = S / 2;

    // ── front die: copper metal + hound art, hole punched ──
    var fc = document.createElement('canvas'); fc.width = fc.height = S;
    var fx = fc.getContext('2d');
    fx.drawImage(imgs[0], 0, 0, S, S);
    var g = fx.createRadialGradient(C, C, S * 0.06, C, C, C);
    g.addColorStop(0, 'rgba(255,222,150,.5)');
    g.addColorStop(0.3, 'rgba(233,169,79,.22)');
    g.addColorStop(0.62, 'rgba(90,45,20,.22)');
    g.addColorStop(1, 'rgba(16,8,4,.5)');
    fx.globalCompositeOperation = 'source-atop';
    fx.fillStyle = g;
    fx.fillRect(0, 0, S, S);
    fx.globalCompositeOperation = 'source-over';

    // ── reverse die: dark bronze + etched lines that glow ──
    var kc = document.createElement('canvas'); kc.width = kc.height = S;
    var kx = kc.getContext('2d');
    kx.save(); kx.translate(S, 0); kx.scale(-1, 1); kx.drawImage(imgs[2], 0, 0, S, S); kx.restore();

    // ── emboss bump from the solid silhouette ──
    var bc = document.createElement('canvas'); bc.width = bc.height = S;
    var bx = bc.getContext('2d');
    bx.fillStyle = '#000'; bx.fillRect(0, 0, S, S);
    var dg = bx.createRadialGradient(C, C, S * 0.1, C, C, C);
    dg.addColorStop(0, '#2e2e2e'); dg.addColorStop(0.82, '#161616'); dg.addColorStop(1, '#000');
    bx.fillStyle = dg; bx.beginPath(); bx.arc(C, C, C, 0, 7); bx.fill();
    try { bx.filter = 'blur(4px)'; } catch (e) {}
    bx.drawImage(whiteOf(imgs[1], S), 0, 0, S, S);
    bx.filter = 'none';

    // emissive map for the reverse (etch lines glow)
    var em = document.createElement('canvas'); em.width = em.height = S;
    var ex = em.getContext('2d');
    ex.fillStyle = '#000'; ex.fillRect(0, 0, S, S);
    ex.save(); ex.translate(S, 0); ex.scale(-1, 1); ex.drawImage(whiteOf(imgs[2], S), 0, 0, S, S); ex.restore();

    // ── the fire-core glow sprite texture ──
    var gc = document.createElement('canvas'); gc.width = gc.height = 256;
    var gx = gc.getContext('2d');
    var gg = gx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gg.addColorStop(0, 'rgba(242,183,88,.85)');
    gg.addColorStop(0.22, 'rgba(233,169,79,.5)');
    gg.addColorStop(0.55, 'rgba(226,98,43,.2)');
    gg.addColorStop(1, 'rgba(226,98,43,0)');
    gx.fillStyle = gg; gx.fillRect(0, 0, 256, 256);
    gx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < 26; i++) {
      var a = (i / 26) * Math.PI * 2;
      var len = 128 * (0.55 + ((i * 37) % 11) / 22);
      var w = 0.055 + ((i * 53) % 7) / 160;
      var rg = gx.createRadialGradient(128, 128, 10, 128, 128, len);
      rg.addColorStop(0, 'rgba(236,166,70,.32)');
      rg.addColorStop(0.5, 'rgba(236,140,55,.16)');
      rg.addColorStop(1, 'rgba(226,98,43,0)');
      gx.fillStyle = rg;
      gx.beginPath();
      gx.moveTo(128, 128);
      gx.arc(128, 128, len, a - w, a + w);
      gx.closePath();
      gx.fill();
    }
    gx.globalCompositeOperation = 'source-over';

    _canvases = { face: fc, back: kc, bump: bc, emis: em, glow: gc };
    return _canvases;
  }

  class GwCoin3D extends HTMLElement {
    connectedCallback() {
      if (this._booted) return;
      this._booted = true;
      this.isLive = false;
      this._flip = 0;
      this.style.position = 'absolute';
      this.style.inset = '0';
      this.style.display = 'block';
      this.style.pointerEvents = 'none';
      var self = this;
      // Lazy: don't spin up WebGL or build until this coin is near the viewport.
      // The hero coin is in view at load and fires immediately; a coin far down
      // the page (the finale) waits until you scroll near it.
      if ('IntersectionObserver' in window) {
        this._startIO = new IntersectionObserver(function (es) {
          for (var i = 0; i < es.length; i++) {
            if (es[i].isIntersecting) {
              self._startIO.disconnect(); self._startIO = null;
              self._waitThree();
              break;
            }
          }
        }, { rootMargin: '250px' });
        this._startIO.observe(this);
      } else {
        this._waitThree();
      }
    }

    _waitThree() {
      var self = this;
      if (window.THREE) { try { self._start(); } catch (e) { /* fallback stays */ } return; }
      _threeWaiters.push(function () { try { self._start(); } catch (e) { /* fallback stays */ } });
    }

    setFlip(deg) { this._flip = deg || 0; }

    disconnectedCallback() {
      if (this._startIO) this._startIO.disconnect();
      if (this._raf) cancelAnimationFrame(this._raf);
      if (this._ro) this._ro.disconnect();
      if (this._renderer) this._renderer.dispose();
    }

    _start() {
      var THREE = window.THREE;
      var self = this;
      var renderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch (e) { return; }
      this._renderer = renderer;
      renderer.setClearColor(0x000000, 0);
      renderer.outputEncoding = THREE.sRGBEncoding;
      var canvas = renderer.domElement;
      canvas.style.position = 'absolute';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      this.appendChild(canvas);

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(28, 1, 0.1, 30);
      camera.position.set(0, 0, 4.05);

      var flipG = new THREE.Group();
      var spinG = new THREE.Group();
      flipG.add(spinG);
      scene.add(flipG);

      scene.add(new THREE.AmbientLight(0x332314, 0.9));
      var key = new THREE.DirectionalLight(0xffd9a0, 0.55);
      key.position.set(-2.4, 2.2, 3);
      scene.add(key);
      var fireLight = new THREE.PointLight(0xe0973f, 2.4, 6, 2);
      fireLight.position.set(0, 0, -0.55);
      scene.add(fireLight);
      var fillLight = new THREE.PointLight(0xe0973f, 0.7, 5, 2);
      fillLight.position.set(0, 0, 0.9);
      scene.add(fillLight);

      var R = 1, T = 0.05, HR = 0.26;

      loadImages(function (imgs) {
        if (!imgs || !self.isConnected) return;
        // Defer the heavy work — ~0.5s of 2D canvas generation plus the first-render
        // shader compile — to idle time so it doesn't block the page's initial paint
        // (it was landing right on LCP). The flat CSS coin covers the gap and is
        // hidden the moment the real coin goes live below, exactly as on a slow load.
        var build = function () {
        if (!self.isConnected) return;
        var canv = buildCanvases(imgs);

        var faceTex = new THREE.CanvasTexture(canv.face); faceTex.encoding = THREE.sRGBEncoding; faceTex.anisotropy = 8;
        var backTex = new THREE.CanvasTexture(canv.back); backTex.encoding = THREE.sRGBEncoding; backTex.anisotropy = 8;
        var bumpTex = new THREE.CanvasTexture(canv.bump);
        var emisTex = new THREE.CanvasTexture(canv.emis);

        var matFace = new THREE.MeshStandardMaterial({
          map: faceTex, bumpMap: bumpTex, bumpScale: 0.018,
          metalness: 0.82, roughness: 0.46,
          transparent: true, alphaTest: 0.35
        });
        var matBack = new THREE.MeshStandardMaterial({
          map: backTex,
          metalness: 0.75, roughness: 0.5,
          emissive: new THREE.Color(0xb5623a), emissiveMap: emisTex, emissiveIntensity: 0.55,
          transparent: true, alphaTest: 0.2
        });

        var front = new THREE.Mesh(new THREE.CircleGeometry(R, 96), matFace);
        front.position.z = T / 2;
        var back = new THREE.Mesh(new THREE.CircleGeometry(R, 96), matBack);
        back.rotation.y = Math.PI;
        back.position.z = -T / 2;
        spinG.add(front, back);

        // ── the fire core: emissive orb + additive glow + the point light above ──
        var fire = new THREE.Mesh(new THREE.SphereGeometry(HR * 0.8, 24, 24), new THREE.MeshBasicMaterial({ color: 0xefa044 }));
        fire.position.z = -0.55;
        scene.add(fire);
        var glow = new THREE.Sprite(new THREE.SpriteMaterial({
          map: new THREE.CanvasTexture(canv.glow),
          blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.8
        }));
        glow.scale.set(1.9, 1.9, 1);
        glow.position.z = -0.55;
        scene.add(glow);

        self.isLive = true;
        // Now that the real coin is up, hide the flat CSS fallback layers in the
        // host — the auto-mount coins' [data-coin3d-hide] layers and the hero's
        // [data-coin-css] layer. Doing it here (not in the host's scroll loop)
        // is what prevents a double coin: the hero loop idles out ~1.6s in, but
        // three.js can finish loading later, so the loop can't be trusted to hide
        // the fallback once WebGL finally comes alive.
        var host = self.parentElement;
        if (host) {
          var hides = host.querySelectorAll('[data-coin3d-hide], [data-coin-css]');
          for (var h = 0; h < hides.length; h++) hides[h].style.visibility = 'hidden';
        }

        var spin = 0, t = 0, last = performance.now();
        var tick = function (now) {
          self._raf = requestAnimationFrame(tick);
          var dt = Math.min(0.05, (now - last) / 1000); last = now;
          if (!self.isConnected || self.offsetParent === null) return;
          if (self.paused) return; // host hides the coin between beats; skip GPU work
          t += dt;
          spin -= dt * (Math.PI * 2 / 150);
          spinG.rotation.z = spin;
          flipG.rotation.y = -(self._flip || 0) * Math.PI / 180;
          var f = Math.sin(t * 1.4) * 0.28 + Math.sin(t * 0.53 + 1.7) * 0.12;
          fireLight.intensity = 2.4 + f;
          fillLight.intensity = 0.7 + f * 0.3;
          fire.scale.setScalar(1 + f * 0.09);
          glow.material.opacity = 0.74 + f * 0.16;
          glow.material.rotation -= dt * 0.06;
          renderer.render(scene, camera);
        };
        tick(last);
        };
        (window.requestIdleCallback || function (f) { setTimeout(f, 1); })(build, { timeout: 800 });
      });

      var resize = function () {
        var w = self.clientWidth || 300, h = self.clientHeight || 300;
        // A big background coin (the full-bleed finale) doesn't need 2× — cap it
        // so a huge framebuffer stays cheap; smaller coins keep full sharpness.
        var pr = Math.max(w, h) > 900 ? 1 : Math.min(window.devicePixelRatio || 1, 2);
        renderer.setPixelRatio(pr);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      this._ro = new ResizeObserver(resize);
      this._ro.observe(this);
    }
  }

  customElements.define('gw-coin-3d', GwCoin3D);

  /* Auto-mount: any [data-coin3d] container gets the live 3D coin overlay
     (the homepage hero mounts its own instance manually). The coin hides the
     container's flat [data-coin3d-hide] fallback layers itself once it goes
     live, and pauses its render loop whenever the host scrolls out of view. */
  function autoMount() {
    document.querySelectorAll('[data-coin3d]').forEach(function (host) {
      if (host.querySelector('gw-coin-3d')) return;
      var el = document.createElement('gw-coin-3d');
      host.appendChild(el);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (en) { el.paused = !en.isIntersecting; });
        }, { rootMargin: '120px' }).observe(host);
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoMount);
  else autoMount();
})();
