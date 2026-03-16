import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simple PCA: reduce high-dimensional vectors to 2D
function pca2d(vectors) {
  const n = vectors.length;
  const dim = vectors[0].length;

  // Compute mean
  const mean = new Array(dim).fill(0);
  for (const v of vectors) for (let j = 0; j < dim; j++) mean[j] += v[j] / n;

  // Center the data
  const centered = vectors.map(v => v.map((val, j) => val - mean[j]));

  // Compute covariance matrix (only need top 2 eigenvectors)
  // Use power iteration for the top 2 principal components
  function dot(a, b) { return a.reduce((s, v, i) => s + v * b[i], 0); }
  function normalize(v) { const len = Math.sqrt(dot(v, v)); return v.map(x => x / (len || 1)); }

  function matVecMul(data, vec) {
    // (X^T X) v — covariance times vector, computed without forming full matrix
    const xv = data.map(row => dot(row, vec));
    const result = new Array(dim).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < dim; j++) {
        result[j] += data[i][j] * xv[i];
      }
    }
    return result;
  }

  // Power iteration for first principal component
  let pc1 = normalize(Array.from({ length: dim }, () => Math.random() - 0.5));
  for (let iter = 0; iter < 50; iter++) {
    pc1 = normalize(matVecMul(centered, pc1));
  }

  // Deflate and find second component
  const proj1 = centered.map(row => dot(row, pc1));
  const deflated = centered.map((row, i) => row.map((v, j) => v - proj1[i] * pc1[j]));

  let pc2 = normalize(Array.from({ length: dim }, () => Math.random() - 0.5));
  for (let iter = 0; iter < 50; iter++) {
    const mv = new Array(dim).fill(0);
    const xv = deflated.map(row => dot(row, pc2));
    for (let i = 0; i < n; i++) for (let j = 0; j < dim; j++) mv[j] += deflated[i][j] * xv[i];
    pc2 = normalize(mv);
  }

  // Project onto 2D
  return vectors.map(v => {
    const c = v.map((val, j) => val - mean[j]);
    return { x: dot(c, pc1), y: dot(c, pc2) };
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { words } = req.body;
  if (!words || !Array.isArray(words) || words.length < 2) {
    return res.status(400).json({ error: "words array required (min 2)" });
  }

  // Limit to 30 words to control costs
  const wordList = words.slice(0, 30);

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: wordList,
    });

    const vectors = response.data.map(d => d.embedding);
    const points2d = pca2d(vectors);

    // Normalize to 0-100 range for easy plotting
    const xs = points2d.map(p => p.x);
    const ys = points2d.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    const result = wordList.map((word, i) => ({
      word,
      x: Math.round(((points2d[i].x - minX) / rangeX) * 80 + 10),
      y: Math.round(((points2d[i].y - minY) / rangeY) * 80 + 10),
      dimensions: vectors[i].length,
    }));

    res.status(200).json({ words: result, dimensions: vectors[0].length });
  } catch (err) {
    console.error("embed error:", err);
    res.status(500).json({ error: err.message });
  }
}
