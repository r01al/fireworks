import { DEFAULT_CONFIG } from "./defaults.js";
import { ensureStyles } from "./styles.js";
import { CanvasRenderer } from "./renderers/canvas.js";
import { DomRenderer } from "./renderers/dom.js";

class Fireworks {
  constructor(host, config = {}) {
    this.host = host;
    this.config = Fireworks.mergeConfig(config);
    this.burstTimer = null;
    this.sizeTimer = null;
    this.width = 0;
    this.height = 0;
    this.originalPosition = null;
    this.originalZIndex = null;
    this.destroyed = false;
    this.renderer = null;

    ensureStyles();

    const computed = window.getComputedStyle(this.host);
    if (computed.position === "static") {
      this.originalPosition = this.host.style.position;
      this.host.style.position = "relative";
    }
    if (computed.zIndex === "auto") {
      this.originalZIndex = this.host.style.zIndex;
      this.host.style.zIndex = "0";
    }

    const shouldUseCanvas = this.config.useCanvas && Fireworks.isCanvasSupported();
    if (shouldUseCanvas) {
      this.renderer = new CanvasRenderer(this.config);
      if (!this.renderer.ctx) {
        this.renderer = null;
      }
    }

    if (!this.renderer) {
      Fireworks.warnDomFallback();
      this.renderer = new DomRenderer(this.config);
    }

    this.attachLayer(this.renderer.getElement());
    this.updateSize();
    this.start();
  }

  attachLayer(element) {
    if (!element) return;
    if (this.host.firstChild) {
      this.host.insertBefore(element, this.host.firstChild);
      return;
    }
    this.host.appendChild(element);
  }

  start() {
    if (this.destroyed) return;
    if (this.burstTimer !== null || this.sizeTimer !== null) return;
    if (!this.isHostAvailable()) {
      this.destroy();
      return;
    }

    this.sizeTimer = window.setInterval(() => {
      this.updateSize();
    }, this.config.sizeCheckIntervalMs);

    this.burstTimer = window.setInterval(() => {
      this.burst();
    }, this.config.burstIntervalMs);

    if (this.renderer && this.renderer.start) {
      this.renderer.start();
    }
  }

  stop() {
    if (this.burstTimer !== null) {
      window.clearInterval(this.burstTimer);
      this.burstTimer = null;
    }
    if (this.sizeTimer !== null) {
      window.clearInterval(this.sizeTimer);
      this.sizeTimer = null;
    }
    if (this.renderer && this.renderer.stop) {
      this.renderer.stop();
    }
  }

  destroy() {
    if (this.destroyed) return;
    this.stop();
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }
    if (this.originalPosition !== null) {
      this.host.style.position = this.originalPosition;
    }
    if (this.originalZIndex !== null) {
      this.host.style.zIndex = this.originalZIndex;
    }
    this.destroyed = true;
  }

  updateConfig(config) {
    this.config = Fireworks.mergeConfig(config);
    if (this.renderer) {
      this.renderer.updateConfig(this.config);
    }
  }

  updateSize() {
    if (!this.isHostAvailable()) {
      this.destroy();
      return;
    }
    const rect = this.host.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    if (this.renderer) {
      this.renderer.resize(this.width, this.height);
    }
  }

  isHostAvailable() {
    return this.host && this.host.isConnected;
  }

  burst() {
    if (this.destroyed || this.width === 0 || this.height === 0) return;
    if (!this.isHostAvailable()) {
      this.destroy();
      return;
    }
    if (document.hidden) return;

    const originX = Math.random() * this.width;
    const originY = Math.random() * this.height;

    if (this.renderer) {
      this.renderer.burst(originX, originY, this.config);
    }
  }

  static mergeConfig(config) {
    return {
      burstIntervalMs: config.burstIntervalMs ?? DEFAULT_CONFIG.burstIntervalMs,
      sizeCheckIntervalMs: config.sizeCheckIntervalMs ?? DEFAULT_CONFIG.sizeCheckIntervalMs,
      particleCount: {
        min: config.particleCount?.min ?? DEFAULT_CONFIG.particleCount.min,
        max: config.particleCount?.max ?? DEFAULT_CONFIG.particleCount.max,
      },
      durationMs: {
        min: config.durationMs?.min ?? DEFAULT_CONFIG.durationMs.min,
        max: config.durationMs?.max ?? DEFAULT_CONFIG.durationMs.max,
      },
      speedPxPerSecond: {
        min: config.speedPxPerSecond?.min ?? DEFAULT_CONFIG.speedPxPerSecond.min,
        max: config.speedPxPerSecond?.max ?? DEFAULT_CONFIG.speedPxPerSecond.max,
      },
      particleSizePx: {
        min: config.particleSizePx?.min ?? DEFAULT_CONFIG.particleSizePx.min,
        max: config.particleSizePx?.max ?? DEFAULT_CONFIG.particleSizePx.max,
      },
      colors: config.colors && config.colors.length > 0 ? config.colors : DEFAULT_CONFIG.colors,
      zIndex: config.zIndex ?? DEFAULT_CONFIG.zIndex,
      useCanvas: config.useCanvas ?? DEFAULT_CONFIG.useCanvas,
    };
  }

  static isCanvasSupported() {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext && canvas.getContext("2d"));
  }

  static warnDomFallback() {
    if (Fireworks.didWarnDomFallback) return;
    Fireworks.didWarnDomFallback = true;
    console.warn(
      "[Fireworks] Canvas not available or disabled. Using DOM particles which may impact performance on heavy pages."
    );
  }
}

Fireworks.didWarnDomFallback = false;

export { Fireworks };
