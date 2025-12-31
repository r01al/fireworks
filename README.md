# Fireworks 🎆

Lightweight, framework‑agnostic fireworks effect that attaches to any HTML element — no canvas, no external CSS files. Styles are injected via JS and particles animate with simple transitions.

## Features ✨

- Works on any element (background overlay)
- Framework‑agnostic (drop into any stack)
- No canvas, no external CSS files
- Configurable burst interval, particle count, duration, speed, size, and colors
- ES module + UMD builds
- Tiny API (start/stop/destroy)

## Install 📦

```bash
npm install fireworks
```

## Quick start 🚀

### ESM

```js
import { Fireworks } from "fireworks";

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
<script src="https://unpkg.com/fireworks/dist/fireworks.min.js"></script>
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
<script src="https://unpkg.com/fireworks/dist/fireworks.min.js"></script>
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
<script src="https://unpkg.com/fireworks/dist/fireworks.umd.js"></script>
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

## Config 🎛️

All options are optional.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `burstIntervalMs` | number | `400` | Time between bursts |
| `sizeCheckIntervalMs` | number | `400` | Re-check container size interval |
| `particleCount` | `{ min, max }` | `{16, 32}` | Particles per burst |
| `durationMs` | `{ min, max }` | `{600, 1400}` | Particle travel duration |
| `speedPxPerSecond` | `{ min, max }` | `{120, 360}` | Particle travel speed |
| `particleSizePx` | `{ min, max }` | `{2, 4}` | Particle size |
| `colors` | `string[]` | See source | Particle colors |
| `zIndex` | number | `1` | Overlay z-index |

## Build 🛠️

```bash
npm run build
```

Outputs:
- `dist/fireworks.cjs.js`
- `dist/fireworks.esm.js`
- `dist/fireworks.esm.min.js`
- `dist/fireworks.umd.js`
- `dist/fireworks.min.js`

## Local demo 🧪

Open `tests/index.html` (ESM) or `tests/umd.html` (UMD) using a local server.

## License 📄

MIT
