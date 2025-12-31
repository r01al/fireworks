import { DEFAULT_CONFIG } from "./defaults.js";
import { ensureStyles } from "./styles.js";
import { randomFloat, randomInt } from "./utils/random.js";

class Fireworks {
  constructor(host, config = {}) {
    this.host = host;
    this.config = Fireworks.mergeConfig(config);
    this.burstTimer = null;
    this.sizeTimer = null;
    this.width = 0;
    this.height = 0;
    this.originalPosition = null;
    this.destroyed = false;

    ensureStyles();

    this.overlay = document.createElement("div");
    this.overlay.className = "fw-overlay";
    this.overlay.style.zIndex = String(this.config.zIndex);

    const computed = window.getComputedStyle(this.host);
    if (computed.position === "static") {
      this.originalPosition = this.host.style.position;
      this.host.style.position = "relative";
    }

    this.host.appendChild(this.overlay);
    this.updateSize();
    this.start();
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
  }

  destroy() {
    if (this.destroyed) return;
    this.stop();
    this.overlay.remove();
    if (this.originalPosition !== null) {
      this.host.style.position = this.originalPosition;
    }
    this.destroyed = true;
  }

  updateConfig(config) {
    this.config = Fireworks.mergeConfig(config);
    this.overlay.style.zIndex = String(this.config.zIndex);
  }

  updateSize() {
    if (!this.isHostAvailable()) {
      this.destroy();
      return;
    }
    const rect = this.host.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
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

    const count = randomInt(this.config.particleCount.min, this.config.particleCount.max);
    const baseDuration = randomInt(this.config.durationMs.min, this.config.durationMs.max);
    const baseSpeed = randomFloat(this.config.speedPxPerSecond.min, this.config.speedPxPerSecond.max);

    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement("span");
      particle.className = "fw-particle";

      const size = randomInt(this.config.particleSizePx.min, this.config.particleSizePx.max);
      const color = this.config.colors[i % this.config.colors.length];
      const angle = Math.random() * Math.PI * 2;
      const speedJitter = randomFloat(0.7, 1.15);
      const durationJitter = randomFloat(0.8, 1.2);
      const duration = Math.max(150, Math.round(baseDuration * durationJitter));
      const distance = (baseSpeed * speedJitter * duration) / 1000;
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;

      particle.style.left = `${originX}px`;
      particle.style.top = `${originY}px`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.background = color;
      particle.style.transitionDuration = `${duration}ms, ${duration}ms`;
      particle.style.transform = "translate(0px, 0px) scale(1)";
      particle.style.opacity = "1";

      const onEnd = (event) => {
        if (event.propertyName !== "opacity") return;
        particle.removeEventListener("transitionend", onEnd);
        particle.remove();
      };

      particle.addEventListener("transitionend", onEnd);
      this.overlay.appendChild(particle);

      requestAnimationFrame(() => {
        particle.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(0.2)`;
        particle.style.opacity = "0";
      });
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
    };
  }
}

export { Fireworks };
