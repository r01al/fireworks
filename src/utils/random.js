const randomInt = (min, max) => {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
};

const randomFloat = (min, max) => {
  return Math.random() * (max - min) + min;
};

export { randomFloat, randomInt };
