import { Fireworks } from "./Fireworks.js";

const createFireworks = (host, config) => {
  return new Fireworks(host, config);
};

export { createFireworks, Fireworks };
