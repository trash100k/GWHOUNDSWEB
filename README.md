# Gaelworx — Forge Journey

The Gaelworx landing page: a scroll-driven, forge-themed site recreated from the
Claude Design handoff (`Gaelworx Forge Journey.dc.html`) as a dependency-free
static page.

## Files

- `index.html` — the full page: markup, inline CSS, and the animation runtime.
- `coin3d.js` — `<gw-coin-3d>` web component that renders the minted Gaelworx
  coin in real 3D via Three.js (r128, loaded from CDN). Falls back silently to
  the CSS coin if WebGL or Three.js is unavailable.
- `assets/` — the knotwork coin art (`knot-copper`, `knot-solid`, `knot-etch`).

## Running

It's a static site — serve the folder over HTTP and open `index.html`:

```
python3 -m http.server 8000
# then visit http://localhost:8000
```

Serve over HTTP (not `file://`) so the 3D coin's canvas textures aren't blocked
by the browser's cross-origin canvas rules.

## Notes

- The prototype's proprietary design framework (`x-dc`, `{{ }}` interpolation,
  `sc-for`/`sc-if`, `style-hover`, `x-import`) was removed. `style-hover` is
  reproduced as real CSS `:hover`; the Bottleneck Audit widget and the
  scroll-driven forge animations are plain vanilla JS.
- `prefers-reduced-motion` is honored: pinned/scrolljacked sections flatten into
  a static, readable layout and all animation is disabled.
- Nav and audit-verdict links point at sibling pages (`Gaelworx Voice.dc.html`,
  `Gaelworx Pricing.dc.html`, etc.) from the design set. Only the Forge Journey
  page is implemented here; wire those up as the rest of the site is built.
