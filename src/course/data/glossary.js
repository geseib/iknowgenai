// The course glossary — one definition per term, used everywhere via the
// <Term> primitive in ui/shared.jsx: <Term t="softmax" accent={accent}>softmax</Term>.
//
// Rules of the road (see docs/COURSE-14PLUS.md → "Glossary tooltips"):
// - Definitions are 1–3 sentences, course voice: plain, confident, honest
//   about simplification. Chapter callbacks are welcome.
// - `link` is optional and rare — only a genuinely canonical, lay-readable
//   reference earns one (3Blue1Brown, the original paper, a great explainer).
// - Fact-check every claim before adding it. This file inherits the course's
//   honesty contract.

export const GLOSSARY = {
  sampling: {
    term: "sampling algorithm",
    definition:
      "The rule that turns the model's ranked probabilities into one actual pick — always take the favorite, or roll dice weighted by the odds. The model supplies the odds; the sampler makes the choice. Chapter 11 is entirely about how.",
  },
  "expert-systems": {
    term: "expert systems",
    definition:
      "1970s–80s AI built by interviewing human specialists and encoding their know-how as thousands of hand-written if-then rules. Genuinely useful in narrow niches — diagnosing blood infections, configuring computer orders — and hopeless the moment a problem wandered off-script.",
    link: { href: "https://en.wikipedia.org/wiki/Expert_system", label: "Read more" },
  },
  backprop: {
    term: "backpropagation",
    definition:
      "The bookkeeping that makes gradient descent affordable: run the network forward, then sweep backward through it applying calculus's chain rule, computing the exact nudge for every weight in a single pass — instead of testing billions of dials one by one.",
    link: { href: "https://www.youtube.com/watch?v=Ilg3gGewQ5U", label: "3Blue1Brown's video" },
  },
  gpu: {
    term: "GPU",
    definition:
      "Graphics processing unit — a chip built to run thousands of small multiplications at once. Designed for video-game graphics, which turned out to be the same math (multiplying big grids of numbers) that neural networks need. The AI boom runs on them.",
  },
  pretraining: {
    term: "pretraining",
    definition:
      "The first and by far the longest phase of training: the guess-the-next-word loop from Chapter 4, run over trillions of words. It's where the model's knowledge of language and the world comes from — and it produces a raw text-continuer, not an assistant.",
  },
  frontier: {
    term: "frontier model",
    definition:
      "Industry shorthand for the most capable models of the moment — the ones pushing the frontier of scale and ability. A moving label by definition: today's frontier model is next year's baseline.",
  },
  word2vec: {
    term: "word2vec",
    definition:
      "A 2013 method that learned an embedding for every word from raw text — tiny by today's standards, but it made the arithmetic of meaning (king − man + woman ≈ queen) famous, and it's when researchers started taking word-geometry seriously.",
  },
  interpretability: {
    term: "mechanistic interpretability",
    definition:
      "The research field trying to reverse-engineer trained networks — reading actual concepts and algorithms out of the raw weights, the way you'd reverse-engineer a compiled program. Young and hard, but moving: researchers have pulled individual features like “the Golden Gate Bridge” out of production models.",
    link: { href: "https://www.anthropic.com/news/mapping-mind-language-model", label: "Anthropic's plain-language tour" },
  },
  vector: {
    term: "vector",
    definition:
      "A list of numbers treated as one object — a point you can plot, an arrow you can follow. School geometry (distances, directions, angles) works on them in any number of dimensions, which is why “list of numbers” and “place on a map” are the same idea in this course.",
    link: { href: "https://www.youtube.com/watch?v=fNk_zzaMoSs", label: "3Blue1Brown's video" },
  },
  transformer: {
    term: "transformer",
    definition:
      "The neural-network architecture built around attention — the T in GPT, introduced in 2017, and the design under every modern LLM. This chapter names it properly on its final slides.",
    link: { href: "https://www.youtube.com/watch?v=wjZofJX0v4M", label: "3Blue1Brown's video" },
  },
  softmax: {
    term: "softmax",
    definition:
      "The standard last step for turning a list of raw scores into probabilities: exponentiate each score, then divide by the total, so everything ends up positive and sums to 100%. Bigger scores get disproportionately bigger shares — which is exactly what temperature (Chapter 11) exploits.",
  },
  "attention-paper": {
    term: "“Attention Is All You Need”",
    definition:
      "The 2017 paper by eight Google researchers that introduced the Transformer. The title was a claim: earlier systems bolted attention onto other machinery — this one showed attention (plus simple processing layers) could carry the whole load. Now one of the most-cited papers ever written.",
    link: { href: "https://arxiv.org/abs/1706.03762", label: "The paper on arXiv" },
  },
  logits: {
    term: "logits",
    definition:
      "The model's raw output scores — one per token in the vocabulary, before they become probabilities. Unbounded (negative is fine, huge is fine) until softmax squashes them into percentages. The name is inherited from statistics (log-odds).",
  },
  api: {
    term: "API",
    definition:
      "Application programming interface — the door a service opens for programs instead of people. For language models: send text plus settings (temperature, max tokens), get tokens back. Chat apps are friendly wrappers around this door; this course's demos knock on it directly.",
  },
  token: {
    term: "token",
    definition:
      "The unit models actually read and write: a word-piece from a fixed menu of roughly 100,000. Common words get one token; rare words assemble from several. Chapter 7 chops your own text live.",
  },
  context: {
    term: "context",
    definition:
      "Everything the model can see while predicting: the system instructions, the conversation so far, any pasted documents or tool results. It arrives fresh with every call — nothing carries over between calls — and it's finite (the “context window”).",
  },
  weights: {
    term: "weights",
    definition:
      "The billions of adjustable numbers inside the model — tuned by training, frozen afterward. Everything the model “knows” lives in their settings and nowhere else. Chapter 4 is where you nudge some yourself.",
  },
  nonlinearity: {
    term: "nonlinearity",
    definition:
      "A simple bend applied to each number between the matrix multiplications — the most common one just zeroes out negatives. It matters more than it looks: without the bends, a stack of 96 layers would collapse mathematically into a single layer, and depth would buy nothing.",
  },
  causal: {
    term: "causal",
    definition:
      "Reading in one direction only: each position can see everything before it and nothing after. The model writing your answer genuinely can't peek ahead at words it hasn't produced yet — they don't exist.",
  },
};
