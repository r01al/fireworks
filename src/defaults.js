const DEFAULT_CONFIG = {
  burstIntervalMs: 400,
  sizeCheckIntervalMs: 400,
  particleCount: { min: 16, max: 40 },
  durationMs: { min: 600, max: 2400 },
  speedPxPerSecond: { min: 120, max: 200 },
  particleSizePx: { min: 2, max: 20 },
  colors: ["#ff3b3b", "#ff9f1c", "#ffd93d", "#6bffb8", "#46b3ff", "#b15eff"],
  zIndex: 1,
};

export { DEFAULT_CONFIG };
