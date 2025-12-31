# Fireworks 🎆

Lightweight, framework‑agnostic fireworks effect that attaches to any HTML element — no external CSS files. Uses a canvas underlay when supported and falls back to DOM particles.

## Features ✨

- Works on any element (background underlay)
- Framework‑agnostic (drop into any stack)
- No external CSS files
- Uses a renderer (canvas underlay by default, DOM fallback)
- Configurable burst interval, particle count, duration, speed, size, and colors
- ES module + UMD builds
- Tiny API (start/stop/destroy)

## Install 📦

```bash
npm install @r01al/fireworks
```

## Quick start 🚀

### ESM

```js
import { Fireworks } from "@r01al/fireworks";

const host = document.getElementById("hero");
const fx = new Fireworks(host, {
  burstIntervalMs: 400,
  particleCount: { min: 12, max: 28 },
  durationMs: { min: 700, max: 1500 },
  speedPxPerSecond: { min: 140, max: 420 },
  colors: ["#ff3b3b", "#46b3ff", "#6bffb8", "#ffd93d"],
});
```

### UMD

```html
<div id="hero"></div>
<script src="https://unpkg.com/@r01al/fireworks@latest/dist/fireworks.min.js"></script>
<script>
  const host = document.getElementById("hero");
  const { Fireworks, createFireworks } = window.Fireworks;
  const fx = new Fireworks(host);
  // or: const fx = createFireworks(host);
</script>
```

## UMD usage 🌍

Use UMD when you want a simple `<script>` tag and a global API.

```html
<!-- UMD build exposes window.Fireworks -->
<script src="https://unpkg.com/@r01al/fireworks/dist/fireworks.umd.js"></script>
<script>
  const { Fireworks } = window.Fireworks;
  const host = document.querySelector("#hero");
  const fx = new Fireworks(host, {
    burstIntervalMs: 400,
    particleCount: { min: 12, max: 28 },
  });
</script>
```

If you want a non‑minified UMD bundle:

```html
<script src="https://unpkg.com/@r01al/fireworks@latest/dist/fireworks.umd.js"></script>
```

## API 🧩

```js
  const fx = new Fireworks(element, config);
fx.start();
fx.stop();
fx.updateConfig({ colors: ["#fff"] });
fx.destroy();
```

## Focus behavior 👀

When the tab is not focused, the library pauses **creating new particles**. This avoids a burst backlog when you return to the tab.

## Renderers 🧵

Fireworks uses a **renderer**. By default it uses a canvas underlay when supported and falls back to DOM particles if canvas isn’t available. If you want to force DOM mode, set `useCanvas: false`. If the effect appears above your content, set `zIndex` to `-1` or a lower value.

When DOM particles are used, a one‑time console warning is logged because DOM particles can be less performant on heavy pages.

### DOM renderer warning ⚠️

DOM particles are **heavier** than canvas. On complex UIs or low‑end devices, this can cause jank. Use canvas when possible, or reduce `particleCount`, increase `burstIntervalMs`, and keep `particleSizePx` small.

## Z‑index note ⚠️

Default `zIndex` is `-1`, which keeps the effect **behind** your content. If you want the fireworks on top of everything, set a higher value (e.g. `zIndex: 10`). The effect won’t block clicks because it uses `pointer-events: none`, but it can visually cover UI elements when on top.

## Config 🎛️

All options are optional.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `burstIntervalMs` | number | `400` | Time between bursts |
| `sizeCheckIntervalMs` | number | `60000` | Re-check container size interval |
| `particleCount` | `{ min, max }` | `{16, 32}` | Particles per burst |
| `durationMs` | `{ min, max }` | `{600, 1400}` | Particle travel duration |
| `speedPxPerSecond` | `{ min, max }` | `{120, 360}` | Particle travel speed |
| `particleSizePx` | `{ min, max }` | `{2, 4}` | Particle size |
| `colors` | `string[]` | See source | Particle colors |
| `zIndex` | number | `-1` | Underlay z-index |
| `useCanvas` | boolean | `true` | Use canvas when supported |

## Build 🛠️

```bash
npm run build
```

Outputs:
- `dist/fireworks.cjs`
- `dist/fireworks.esm.js`
- `dist/fireworks.esm.min.js`
- `dist/fireworks.umd.js`
- `dist/fireworks.min.js`

## Local demo 🧪

Open `tests/index.html` (ESM) or `tests/umd.html` (UMD) using a local server.

## License 📄

MIT
