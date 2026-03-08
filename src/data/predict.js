export const P_POSITIONS = [
  { candidates: [["The", -0.12], ["A", -2.53], ["One", -3.51]] },
  { candidates: [["sleepy", -0.89], ["big", -1.20], ["tiny", -1.24]] },
  { candidates: [["cat", -0.33], ["dog", -1.66], ["bird", -2.41]] },
  { candidates: [["sat", -0.46], ["slept", -1.42], ["napped", -2.04]] },
  { candidates: [["on", -0.09], ["near", -2.81], ["beside", -3.51]] },
  { candidates: [["a", -0.19], ["the", -1.97], ["my", -3.51]] },
  { candidates: [["warm", -0.94], ["soft", -1.08], ["cozy", -1.32]] },
  { candidates: [["mat", -0.40], ["cushion", -1.56], ["rug", -2.04]] },
  { candidates: [[".", -0.15], ["!", -2.21], ["?", -2.81]] },
];

export function applyTemp(candidates, temp) {
  if (temp < .08) return candidates.map(([w], i) => ({ word: w, pct: i === 0 ? 100 : 0 }));
  const scaled = candidates.map(([w, l]) => ({ word: w, exp: Math.exp(l / temp) }));
  const sum = scaled.reduce((a, b) => a + b.exp, 0);
  return scaled.map(s => ({ word: s.word, pct: Math.round((s.exp / sum) * 100) }));
}

export function sampleWord(dist) {
  const r = Math.random() * 100;
  let acc = 0;
  for (const d of dist) {
    acc += d.pct;
    if (r < acc) return d.word;
  }
  return dist[dist.length - 1].word;
}

export function tempMeta(t) {
  if (t < .12) return { name: "Frozen",   bar: "#a0d8ef", desc: "Always picks the top word. Perfectly predictable — no surprises." };
  if (t < .45) return { name: "Cold",     bar: "#00f5d4", desc: "Sticks closely to likely words. Safe and sensible." };
  if (t < .85) return { name: "Balanced", bar: "#fee440", desc: "A nice mix — mostly sensible, occasionally creative." };
  if (t < 1.3) return { name: "Warm",     bar: "#fb5607", desc: "Getting adventurous! Surprising words start appearing." };
  return                { name: "Wild",     bar: "#f15bb5", desc: "Full chaos mode — literally anything could come next!" };
}
