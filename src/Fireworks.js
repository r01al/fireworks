import { DEFAULT_CONFIG } from "./defaults.js";
import { ensureStyles } from "./styles.js";
import { randomFloat, randomInt } from "./utils/random.js";

class Fireworks {
  constructor(host, config = {}) {
    this.host = host;
    this.config = Fireworks.mergeConfig(config);
    this.burstTimer = null;
    this.sizeTimer = null;
    this.rafId = null;
    this.lastFrameTime = 0;
    this.width = 0;
    this.height = 0;
    this.originalPosition = null;
    this.originalZIndex = null;
    this.destroyed = false;
    this.overlay = null;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.useCanvas = false;

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

    this.useCanvas = this.config.useCanvas && Fireworks.isCanvasSupported();

    if (this.useCanvas) {
      this.canvas = document.createElement("canvas");
      this.canvas.className = "fw-canvas";
      this.canvas.style.zIndex = String(this.config.zIndex);
      this.ctx = this.canvas.getContext("2d");
      if (!this.ctx) {
        this.useCanvas = false;
        this.canvas = null;
      }
    }

    if (this.useCanvas) {
      this.attachLayer(this.canvas);
    } else {
      Fireworks.warnDomFallback();
      this.overlay = document.createElement("div");
      this.overlay.className = "fw-overlay";
      this.overlay.style.zIndex = String(this.config.zIndex);
      this.attachLayer(this.overlay);
    }

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

    if (this.useCanvas) {
      this.startRenderLoop();
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
  }

  destroy() {
    if (this.destroyed) return;
    this.stop();
    this.stopRenderLoop();
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
      this.ctx = null;
    }
    if (this.originalPosition !== null) {
      this.host.style.position = this.originalPosition;
    }
    if (this.originalZIndex !== null) {
      this.host.style.zIndex = this.originalZIndex;
    }
    this.destroyed = true;
  }

  startRenderLoop() {
    if (!this.useCanvas || this.rafId !== null) return;

    const tick = (time) => {
      if (this.destroyed) return;
      if (!this.useCanvas) return;
      if (!this.isHostAvailable()) {
        this.destroy();
        return;
      }

      const delta = Math.min(64, time - this.lastFrameTime);
      this.lastFrameTime = time;

      if (!document.hidden) {
        this.updateCanvas(delta);
      } else {
        this.lastFrameTime = time;
      }

      if (this.particles.length === 0 && this.burstTimer === null) {
        this.rafId = null;
        return;
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.lastFrameTime = performance.now();
    this.rafId = requestAnimationFrame(tick);
  }

  stopRenderLoop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  updateConfig(config) {
    this.config = Fireworks.mergeConfig(config);
    if (this.overlay) {
      this.overlay.style.zIndex = String(this.config.zIndex);
    }
    if (this.canvas) {
      this.canvas.style.zIndex = String(this.config.zIndex);
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

    if (this.useCanvas) {
      this.resizeCanvas();
    }
  }

  resizeCanvas() {
    if (!this.canvas || !this.ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(this.width * dpr));
    const height = Math.max(1, Math.floor(this.height * dpr));

    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

    if (this.useCanvas) {
      this.addCanvasParticles(originX, originY, count, baseDuration, baseSpeed);
      return;
    }

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

  addCanvasParticles(originX, originY, count, baseDuration, baseSpeed) {
    for (let i = 0; i < count; i += 1) {
      const size = randomInt(this.config.particleSizePx.min, this.config.particleSizePx.max);
      const color = this.config.colors[i % this.config.colors.length];
      const angle = Math.random() * Math.PI * 2;
      const speedJitter = randomFloat(0.7, 1.15);
      const durationJitter = randomFloat(0.8, 1.2);
      const duration = Math.max(150, Math.round(baseDuration * durationJitter));
      const speed = baseSpeed * speedJitter;

      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        color,
        age: 0,
        life: duration,
      });
    }
  }

  updateCanvas(deltaMs) {
    if (!this.ctx || this.width === 0 || this.height === 0) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    const nextParticles = [];
    const deltaSeconds = deltaMs / 1000;

    for (let i = 0; i < this.particles.length; i += 1) {
      const particle = this.particles[i];
      particle.age += deltaMs;

      if (particle.age >= particle.life) continue;

      const progress = particle.age / particle.life;
      const scale = 1 - 0.8 * progress;
      const radius = (particle.size / 2) * scale;

      particle.x += particle.vx * deltaSeconds;
      particle.y += particle.vy * deltaSeconds;

      this.ctx.globalAlpha = 1 - progress;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      nextParticles.push(particle);
    }

    this.ctx.globalAlpha = 1;
    this.particles = nextParticles;
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
