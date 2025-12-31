import { randomFloat, randomInt } from "../utils/random.js";

class DomRenderer {
  constructor(config) {
    this.config = config;
    this.overlay = document.createElement("div");
    this.overlay.className = "fw-overlay";
    this.overlay.style.zIndex = String(config.zIndex);
  }

  getElement() {
    return this.overlay;
  }

  updateConfig(config) {
    this.config = config;
    this.overlay.style.zIndex = String(config.zIndex);
  }

  resize() {}

  start() {}

  stop() {}

  destroy() {
    this.overlay.remove();
  }

  burst(originX, originY, config) {
    const count = randomInt(config.particleCount.min, config.particleCount.max);
    const baseDuration = randomInt(config.durationMs.min, config.durationMs.max);
    const baseSpeed = randomFloat(config.speedPxPerSecond.min, config.speedPxPerSecond.max);

    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement("span");
      particle.className = "fw-particle";

      const size = randomInt(config.particleSizePx.min, config.particleSizePx.max);
      const color = config.colors[i % config.colors.length];
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

      this.overlay.appendChild(particle);

      setTimeout(() => {
        particle.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(0.2)`;
        particle.style.opacity = "0";
      }, 0);

      setTimeout(() => {
        particle.remove();
      }, duration + 20);
    }
  }
}

export { DomRenderer };
