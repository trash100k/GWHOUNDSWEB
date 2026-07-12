/* gw-coin-3d — the minted Gaelworx coin, real 3D (Three.js r128 UMD).
   Registers <gw-coin-3d>. Host drives flip via el.setFlip(deg); el.isLive
   reports whether WebGL is up. Falls back silently (element stays inert)
   if THREE or WebGL is unavailable, leaving the CSS coin visible. */
(function () {
  'use strict';
  if (customElements.get('gw-coin-3d')) return;

  // ponytail: THREE only upgrades the CSS coin (there's a silent fallback), so load
  // its ~150KB off the critical path when the browser is idle — not up front on every page.
  // Self-hosted (byte-identical to cdnjs r128): rides the warm same-origin connection
  // instead of paying DNS+TLS to a third party the partitioned cache can't share anyway.
  if (!window.THREE && !window.__gwThree) {
    window.__gwThree = 1;
    (window.requestIdleCallback || function (f) { setTimeout(f, 1); })(function () {
      var s = document.createElement('script');
      s.src = 'assets/vendor/three-r128.min.js';
      document.head.appendChild(s);
    }, { timeout: 1800 });
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
      const self = this;
      let tries = 0;
      (function wait() {
        if (window.THREE) { try { self._start(); } catch (e) { /* fallback stays */ } }
        else if (tries++ < 200) setTimeout(wait, 50);
      })();
    }

    setFlip(deg) { this._flip = deg || 0; }

    disconnectedCallback() {
      if (this._raf) cancelAnimationFrame(this._raf);
      if (this._ro) this._ro.disconnect();
      if (this._renderer) this._renderer.dispose();
    }

    _start() {
      const THREE = window.THREE;
      const self = this;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch (e) { return; }
      this._renderer = renderer;
      renderer.setClearColor(0x000000, 0);
      renderer.outputEncoding = THREE.sRGBEncoding;
      const canvas = renderer.domElement;
      canvas.style.position = 'absolute';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      this.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 30);
      camera.position.set(0, 0, 4.05);

      const flipG = new THREE.Group();
      const spinG = new THREE.Group();
      flipG.add(spinG);
      scene.add(flipG);

      scene.add(new THREE.AmbientLight(0x332314, 0.9));
      const key = new THREE.DirectionalLight(0xffd9a0, 0.55);
      key.position.set(-2.4, 2.2, 3);
      scene.add(key);
      const fireLight = new THREE.PointLight(0xe0973f, 2.4, 6, 2);
      fireLight.position.set(0, 0, -0.55);
      scene.add(fireLight);
      const fillLight = new THREE.PointLight(0xe0973f, 0.7, 5, 2);
      fillLight.position.set(0, 0, 0.9);
      scene.add(fillLight);

      const R = 1, T = 0.05, HR = 0.26;
      const paths = ['assets/knot-copper.webp', 'assets/knot-solid.webp', 'assets/knot-etch.png'];
      const imgs = [];
      let left = paths.length, dead = false;
      paths.forEach((p, i) => {
        const im = new Image();
        im.onload = () => { imgs[i] = im; if (--left === 0 && !dead) build(); };
        im.onerror = () => { dead = true; };
        im.src = p;
      });

      function whiteOf(img, S) {
        const c = document.createElement('canvas'); c.width = c.height = S;
        const x = c.getContext('2d');
        x.drawImage(img, 0, 0, S, S);
        x.globalCompositeOperation = 'source-in';
        x.fillStyle = '#fff'; x.fillRect(0, 0, S, S);
        return c;
      }

      function build() {
        const S = 1024, C = S / 2;

        // ── front die: copper metal + hound art, hole punched ──
        const fc = document.createElement('canvas'); fc.width = fc.height = S;
        const fx = fc.getContext('2d');
        fx.drawImage(imgs[0], 0, 0, S, S);
        let g = fx.createRadialGradient(C, C, S * 0.06, C, C, C);
        g.addColorStop(0, 'rgba(255,222,150,.5)');
        g.addColorStop(0.3, 'rgba(233,169,79,.22)');
        g.addColorStop(0.62, 'rgba(90,45,20,.22)');
        g.addColorStop(1, 'rgba(16,8,4,.5)');
        fx.globalCompositeOperation = 'source-atop';
        fx.fillStyle = g;
        fx.fillRect(0, 0, S, S);
        fx.globalCompositeOperation = 'source-over';
        const faceTex = new THREE.CanvasTexture(fc);
        faceTex.encoding = THREE.sRGBEncoding;
        faceTex.anisotropy = 8;

        // ── reverse die: dark bronze + etched lines that glow ──
        const kc = document.createElement('canvas'); kc.width = kc.height = S;
        const kx = kc.getContext('2d');
        kx.save(); kx.translate(S, 0); kx.scale(-1, 1); kx.drawImage(imgs[2], 0, 0, S, S); kx.restore();
        const backTex = new THREE.CanvasTexture(kc);
        backTex.encoding = THREE.sRGBEncoding;
        backTex.anisotropy = 8;

        // ── emboss bump from the solid silhouette ──
        const bc = document.createElement('canvas'); bc.width = bc.height = S;
        const bx = bc.getContext('2d');
        bx.fillStyle = '#000'; bx.fillRect(0, 0, S, S);
        const dg = bx.createRadialGradient(C, C, S * 0.1, C, C, C);
        dg.addColorStop(0, '#2e2e2e'); dg.addColorStop(0.82, '#161616'); dg.addColorStop(1, '#000');
        bx.fillStyle = dg; bx.beginPath(); bx.arc(C, C, C, 0, 7); bx.fill();
        try { bx.filter = 'blur(4px)'; } catch (e) {}
        bx.drawImage(whiteOf(imgs[1], S), 0, 0, S, S);
        bx.filter = 'none';
        const bumpTex = new THREE.CanvasTexture(bc);

        // emissive map for the reverse (etch lines glow)
        const em = document.createElement('canvas'); em.width = em.height = S;
        const ex = em.getContext('2d');
        ex.fillStyle = '#000'; ex.fillRect(0, 0, S, S);
        ex.save(); ex.translate(S, 0); ex.scale(-1, 1); ex.drawImage(whiteOf(imgs[2], S), 0, 0, S, S); ex.restore();
        const emisTex = new THREE.CanvasTexture(em);

        // (open-work coin: no rim — silhouette is the knot itself)

        const matFace = new THREE.MeshStandardMaterial({
          map: faceTex, bumpMap: bumpTex, bumpScale: 0.018,
          metalness: 0.82, roughness: 0.46,
          transparent: true, alphaTest: 0.35
        });
        const matBack = new THREE.MeshStandardMaterial({
          map: backTex,
          metalness: 0.75, roughness: 0.5,
          emissive: new THREE.Color(0xb5623a), emissiveMap: emisTex, emissiveIntensity: 0.55,
          transparent: true, alphaTest: 0.2
        });

        const front = new THREE.Mesh(new THREE.CircleGeometry(R, 96), matFace);
        front.position.z = T / 2;
        const back = new THREE.Mesh(new THREE.CircleGeometry(R, 96), matBack);
        back.rotation.y = Math.PI;
        back.position.z = -T / 2;
        spinG.add(front, back);

        // ── the fire core: emissive orb + additive glow + the point light above ──
        const fire = new THREE.Mesh(new THREE.SphereGeometry(HR * 0.8, 24, 24), new THREE.MeshBasicMaterial({ color: 0xefa044 }));
        fire.position.z = -0.55;
        scene.add(fire);
        const gc = document.createElement('canvas'); gc.width = gc.height = 256;
        const gx = gc.getContext('2d');
        const gg = gx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gg.addColorStop(0, 'rgba(242,183,88,.85)');
        gg.addColorStop(0.22, 'rgba(233,169,79,.5)');
        gg.addColorStop(0.55, 'rgba(226,98,43,.2)');
        gg.addColorStop(1, 'rgba(226,98,43,0)');
        gx.fillStyle = gg; gx.fillRect(0, 0, 256, 256);
        gx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 26; i++) {
          const a = (i / 26) * Math.PI * 2;
          const len = 128 * (0.55 + ((i * 37) % 11) / 22);
          const w = 0.055 + ((i * 53) % 7) / 160;
          const rg = gx.createRadialGradient(128, 128, 10, 128, 128, len);
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
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({
          map: new THREE.CanvasTexture(gc),
          blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.8
        }));
        glow.scale.set(1.9, 1.9, 1);
        glow.position.z = -0.55;
        scene.add(glow);

        self.isLive = true;
        let spin = 0, t = 0, last = performance.now();
        const tick = (now) => {
          self._raf = requestAnimationFrame(tick);
          const dt = Math.min(0.05, (now - last) / 1000); last = now;
          if (!self.isConnected || self.offsetParent === null) return;
          if (self.paused) return; // host hides the coin between beats; skip GPU work
          t += dt;
          spin -= dt * (Math.PI * 2 / 150);
          spinG.rotation.z = spin;
          flipG.rotation.y = -(self._flip || 0) * Math.PI / 180;
          const f = Math.sin(t * 1.4) * 0.28 + Math.sin(t * 0.53 + 1.7) * 0.12;
          fireLight.intensity = 2.4 + f;
          fillLight.intensity = 0.7 + f * 0.3;
          fire.scale.setScalar(1 + f * 0.09);
          glow.material.opacity = 0.74 + f * 0.16;
          glow.material.rotation -= dt * 0.06;
          renderer.render(scene, camera);
        };
        tick(last);
      }

      const resize = () => {
        const w = this.clientWidth || 300, h = this.clientHeight || 300;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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
     (the homepage mounts its own instance manually and is skipped). When the
     WebGL coin comes alive, flat layers marked [data-coin3d-hide] inside the
     container are hidden so the faces don't double-print. The coin pauses
     whenever its host scrolls out of view — no GPU work off-screen. */
  function autoMount() {
    document.querySelectorAll('[data-coin3d]').forEach(function (host) {
      if (host.querySelector('gw-coin-3d')) return;
      var el = document.createElement('gw-coin-3d');
      host.appendChild(el);
      var hid = false;
      var t = setInterval(function () {
        if (el.isLive && !hid) {
          hid = true;
          host.querySelectorAll('[data-coin3d-hide]').forEach(function (n) { n.style.visibility = 'hidden'; });
          clearInterval(t);
        }
      }, 250);
      setTimeout(function () { clearInterval(t); }, 12000);
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
