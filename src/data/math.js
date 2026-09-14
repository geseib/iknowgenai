// Math moments — small, grade-ladder math beats that ride along on slides that
// already show numbers. Chosen on the landing page ("Math": off / light / full).
//
//   light  one moment per act (6): counting → fractions/percent → chance → big
//          numbers → coordinates → averages
//   full   light + a numbers strip on every other quantitative slide
//
// Each moment: { tier, section, topic, grades: { "K-2"|"3-5"|"7-8": (data) => { big, note } } }.
// A grade with no entry shows nothing (some ideas are simply too early).
// `big` is the one line kids read aloud; `note` is the teacher's follow-up question.
// Arithmetic here is checked by hand — keep it that way when editing.

export const MATH_LEVEL_RANK = { off: 0, light: 1, full: 2 };

const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);
const fmt = (n) => n.toLocaleString("en-US");

export const MATH_MOMENTS = {
  /* ── Act 1 · counting the room ─────────────────────────────────────── */
  "class-fraction": {
    tier: "light", section: "rules-vs-learning",
    topic: { "K-2": "counting", "3-5": "fractions → percent", "7-8": "percent" },
    grades: {
      "K-2": ({ counts, labels }) => {
        const [a, b] = counts; if (a + b === 0) return null;
        const more = a === b ? "It's a tie!" : `More hands for ${a > b ? labels[0] : labels[1]}.`;
        return { big: `${a} hands for ${labels[0]}, ${b} for ${labels[1]}.`, note: `${more} Which pile is bigger? Count them again together.` };
      },
      "3-5": ({ counts, labels }) => {
        const [a, b] = counts; const t = a + b; if (!t) return null;
        return { big: `${a} out of ${t} said ${labels[0]} → ${a}⁄${t} → about ${pct(a, t)}%`, note: `A fraction of the room and a percent are the same idea: "out of 100." What fraction said ${labels[1]}?` };
      },
      "7-8": ({ counts, labels }) => {
        const [a, b] = counts; const t = a + b; if (!t) return null;
        return { big: `${a}⁄${t} = ${(a / t).toFixed(2)} = ${pct(a, t)}% said ${labels[0]}`, note: "Divide, then move the decimal two places: that's all a percent is. The AI's probabilities later are percents too, so we can compare the room to the model." };
      },
    },
  },

  /* ── Act 2 · chance vs learning ────────────────────────────────────── */
  "robot-chance": {
    tier: "light", section: "how-it-learns",
    topic: { "K-2": "one out of three", "3-5": "chance", "7-8": "probability" },
    grades: {
      "K-2": () => ({ big: "3 robots. 1 got it right. That's 1 out of 3.", note: "If they just guessed every time, how often would they be right? Not very!" }),
      "3-5": () => ({ big: "A blind guess among 3 answers: 1 in 3 → 1⁄3 → about 33%", note: "So a robot that's right more often than 1 out of 3 must have learned something. That's what training does." }),
      "7-8": () => ({ big: "Luck alone: ⅓ × ⅓ × ⅓ = 1⁄27 ≈ 4% to get all three rounds", note: "Independent chances multiply. Getting all three by guessing is rare — so three right answers in a row is evidence of learning, not luck." }),
    },
  },

  /* ── Act 3 · big numbers ───────────────────────────────────────────── */
  "wikipedias": {
    tier: "light", section: "what-is-llm",
    topic: { "K-2": "big numbers", "3-5": "dividing big numbers", "7-8": "powers of ten" },
    grades: {
      "K-2": () => ({ big: "A thousand has 3 zeros. A million has 6. A billion has 9. A trillion has 12!", note: "Count the zeros with me: 1,000,000,000,000. That's how many words these models read." }),
      "3-5": () => ({ big: "1 trillion words ÷ 4 billion words in Wikipedia = 250 Wikipedias", note: "All of English Wikipedia is about 4 billion words. Every trillion words of training is like reading Wikipedia 250 times over." }),
      "7-8": () => ({ big: "10¹² ÷ (4 × 10⁹) = 10³ ÷ 4 = 250", note: "Powers of ten turn a scary division into subtraction: 12 − 9 = 3. Then 1,000 ÷ 4 = 250 Wikipedias per trillion words." }),
    },
  },

  /* ── Act 4 · coordinates ───────────────────────────────────────────── */
  "coordinates": {
    tier: "light", section: "embeddings",
    topic: { "K-2": "across and up", "3-5": "coordinates", "7-8": "dimensions" },
    grades: {
      "K-2": ({ word, across, up }) => ({ big: `"${word}" is ${across} across and ${up} up.`, note: "Two numbers tell you exactly where a word lives on the map. Which word is furthest up?" }),
      "3-5": ({ word, across, up }) => ({ big: `"${word}" = (${across}, ${up})`, note: "Every word gets an address: (across, up). Two numbers = two dimensions. Words with similar meanings have nearby addresses." }),
      "7-8": ({ word, across, up }) => ({ big: `"${word}" = (${across}, ${up}) — two coordinates of 12,288`, note: "These are x and y. The real model gives every word 12,288 coordinates, and some are negative: 'Has Wings' scores −0.81 for cat. Same idea, more axes." }),
    },
  },

  /* ── Act 5 · percent and probability ───────────────────────────────── */
  "next-word-percent": {
    tier: "light", section: "predict",
    topic: { "K-2": "comparing", "3-5": "percent means out of 100", "7-8": "probability adds to 1" },
    grades: {
      "K-2": ({ top, classLeader }) => ({ big: `The AI's tallest bar is "${top.word}".${classLeader ? ` Ours was "${classLeader}".` : ""}`, note: classLeader === top.word ? "We matched the computer! Why do you think we picked the same word?" : "Different picks! Both are fine words. Why might the computer choose differently?" }),
      "3-5": ({ top, counts, total, classLeader, shown }) => {
        const ours = total ? `Us: ${Math.max(...counts)} of ${total} = ${pct(Math.max(...counts), total)}% for "${classLeader}". ` : "";
        return { big: `AI: ${top.pct} out of 100 for "${top.word}". ${ours}`, note: `Percent means "out of 100," so we can compare the room to the model. The AI's list adds up to ${shown}%. Where's the other ${100 - shown}%? Spread over thousands of other words.` };
      },
      "7-8": ({ top, shown }) => ({ big: `${top.pct}% + the rest = 100%. The list shows ${shown}%; the missing ${100 - shown}% is thousands of tiny slices.`, note: "Probabilities of every possible next word add to exactly 1. Temperature reshapes the slices, but the total never changes." }),
    },
  },

  /* ── Act 6 · averages ──────────────────────────────────────────────── */
  "chars-per-token": {
    tier: "light", section: "try-it",
    topic: { "K-2": "sharing out", "3-5": "average", "7-8": "mean" },
    grades: {
      "K-2": ({ chars, tokens }) => ({ big: `${chars} letters, cut into ${tokens} pieces.`, note: "Are the pieces all the same size? Look — some are long and some are tiny." }),
      "3-5": ({ chars, tokens }) => ({ big: `${chars} characters ÷ ${tokens} tokens = ${(chars / tokens).toFixed(1)} characters per token, on average`, note: "An average shares the total out evenly, even though the real pieces aren't. Try a sentence with long words — does the average go up?" }),
      "7-8": ({ chars, tokens }) => ({ big: `mean = total ÷ count = ${chars} ÷ ${tokens} = ${(chars / tokens).toFixed(1)}`, note: "About 4 characters per token is typical English. Rare or long words push it up; emoji and other languages push it down. Test that." }),
    },
  },

  /* ── Full tier · numbers strips ────────────────────────────────────── */
  "pages-of-numbers": {
    tier: "full", section: "numbers-words",
    topic: { "3-5": "division", "7-8": "estimation" },
    grades: {
      "3-5": () => ({ big: "12,288 numbers ÷ about 500 per page ≈ 25 pages", note: "If a page of a book held 500 numbers, one word's list would fill 25 pages. How many pages for a whole sentence of 10 words?" }),
      "7-8": () => ({ big: "12,288 ÷ 500 ≈ 24.6 → about 25 pages", note: "Round to estimate: 12,000 ÷ 500 = 24. Close enough to picture it, and picturing it is the point." }),
    },
  },
  "mlp-times-four": {
    tier: "full", section: "mlp",
    topic: { "3-5": "multiplying by 4", "7-8": "multiplication" },
    grades: {
      "3-5": () => ({ big: "12,288 × 4 = 49,152 — double it, then double again: 24,576 → 49,152", note: "Multiplying by 4 is doubling twice. Check the last digit: 8 × 4 = 32, so the answer must end in 2." }),
      "7-8": () => ({ big: "12,288 × 4 = 49,152 questions per word, per layer", note: "The thinking layer is four times wider than the word's list of numbers, then squeezes back down to 12,288. Expand, ask, compress." }),
    },
  },
  "layer-passes": {
    tier: "full", section: "layers",
    topic: { "3-5": "multiplication", "7-8": "unit conversion" },
    grades: {
      "3-5": () => ({ big: "96 layers × 60 words = 5,760 layer passes for one paragraph", note: "Every word goes through all 96 layers. Multiply to see how much work a short paragraph is." }),
      "7-8": () => ({ big: "400 billion calculations ÷ 31,536,000 seconds in a year ≈ 12,700 years", note: "60 × 60 × 24 × 365 = 31,536,000 seconds per year. A person doing one calculation per second would need about 12,700 years to predict one word." }),
    },
  },
  "tokens-per-word": {
    tier: "full", section: "tokens",
    topic: { "7-8": "ratio" },
    grades: {
      "7-8": () => ({ big: "11 tokens ÷ 3 words ≈ 3.7 tokens per word — with letters as tokens", note: "With a ~100,000-piece menu, English averages about 1.3 tokens per word. A ratio tells you how efficient the menu is." }),
    },
  },
  "attention-share": {
    tier: "full", section: "attention",
    topic: { "K-2": "sharing one whole", "3-5": "fractions of a whole", "7-8": "decimals sum to 1" },
    grades: {
      "K-2": () => ({ big: "\"bat\" has ONE flashlight. It shines half on \"swung\", a quarter on \"hit\", a quarter on \"ball\".", note: "Half + a quarter + a quarter = the whole flashlight. It can't shine more than one flashlight's worth. (Example shares.)" }),
      "3-5": () => ({ big: "\"bat\" splits its attention: swung ½ + hit ¼ + ball ¼ = 1 whole", note: "In \"I swung the bat and hit the ball\", the word bat has exactly one whole of attention to share among its clues. A bigger slice for one word means smaller slices for the others. (Example shares.)" }),
      "7-8": () => ({ big: "For \"bat\": swung 0.50 + hit 0.30 + ball 0.20 = 1.00", note: "Attention weights are a budget that always totals 1. Turning one up forces the others down. That's why a strong clue like \"swung\" crowds out the animal meaning. (Example weights.)" }),
    },
  },
  "thinking-pages": {
    tier: "full", section: "reasoning",
    topic: { "7-8": "estimation" },
    grades: {
      "7-8": () => ({ big: "100,000 thinking tokens ÷ 300 words per page ≈ 330 pages", note: "A novel's worth of hidden scratch work for one hard problem. Estimate first: 100,000 ÷ 300 is a bit more than 100,000 ÷ 333 = 300." }),
    },
  },
};

/** Moments available for a grade at a math level (used for the landing-page count). */
export function mathMomentsFor(grade, level, slidesFor) {
  const rank = MATH_LEVEL_RANK[level] ?? 0;
  return Object.entries(MATH_MOMENTS).filter(([, m]) =>
    MATH_LEVEL_RANK[m.tier] <= rank && m.grades[grade] && (!slidesFor || slidesFor(m.section) > 0));
}

/** Resolve a moment to { topic, big, note } or null. */
export function resolveMathMoment(id, grade, level, data = {}) {
  const m = MATH_MOMENTS[id];
  if (!m) return null;
  if (MATH_LEVEL_RANK[m.tier] > (MATH_LEVEL_RANK[level] ?? 0)) return null;
  const fn = m.grades[grade];
  if (!fn) return null;
  const out = fn(data);
  if (!out) return null;
  return { topic: m.topic[grade] || "", ...out };
}

export { fmt };
