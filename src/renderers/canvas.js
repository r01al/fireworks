import { randomFloat, randomInt } from "../utils/random.js";

class CanvasRenderer {
  constructor(config) {
    this.config = config;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "fw-canvas";
    this.canvas.style.zIndex = String(config.zIndex);
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.rafId = null;
    this.lastFrameTime = 0;
    this.width = 0;
    this.height = 0;
  }

  getElement() {
    return this.canvas;
  }

  updateConfig(config) {
    this.config = config;
    this.canvas.style.zIndex = String(config.zIndex);
  }

  resize(width, height) {
    if (!this.ctx) return;
    this.width = width;
    this.height = height;

    const dpr = window.devicePixelRatio || 1;
    const nextWidth = Math.max(1, Math.floor(width * dpr));
    const nextHeight = Math.max(1, Math.floor(height * dpr));

    this.canvas.width = nextWidth;
    this.canvas.height = nextHeight;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  start() {
    if (this.rafId !== null) return;

    const tick = (time) => {
      const delta = Math.min(64, time - this.lastFrameTime);
      this.lastFrameTime = time;

      if (!document.hidden) {
        this.updateCanvas(delta);
      } else {
        this.lastFrameTime = time;
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.lastFrameTime = performance.now();
    this.rafId = requestAnimationFrame(tick);
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  destroy() {
    this.stop();
    this.particles = [];
    this.canvas.remove();
    this.ctx = null;
  }

  burst(originX, originY, config) {
    const count = randomInt(config.particleCount.min, config.particleCount.max);
    const baseDuration = randomInt(config.durationMs.min, config.durationMs.max);
    const baseSpeed = randomFloat(config.speedPxPerSecond.min, config.speedPxPerSecond.max);

    for (let i = 0; i < count; i += 1) {
      const size = randomInt(config.particleSizePx.min, config.particleSizePx.max);
      const color = config.colors[i % config.colors.length];
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
}

export { CanvasRenderer };
