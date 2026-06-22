export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const liveRng = buildHelpers(Math.random);

export function createRng(seed = 1) {
  return buildHelpers(mulberry32(seed));
}

function buildHelpers(rand) {
  return {
    next: rand,
    int: (min, max) => Math.floor(rand() * (max - min + 1)) + min,
    pick: (arr) => arr[Math.floor(rand() * arr.length)],
    chance: (p) => rand() < p,
    /**
     * @param {Record<string, number>} weights
     */
    weighted: (weights) => {
      const entries = Object.entries(weights);
      const total = entries.reduce((sum, [, w]) => sum + w, 0);
      let roll = rand() * total;
      for (const [key, weight] of entries) {
        roll -= weight;
        if (roll <= 0) return key;
      }
      return entries[entries.length - 1][0];
    },
  };
}
