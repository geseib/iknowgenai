// Per-grade configuration.
//
// `slides` maps a section id → how many slides that section shows for this grade.
// A count of 0 means the section is SKIPPED for that grade. The keys are listed
// in canonical course order (see src/data/sections.js) so this file reads as the
// lesson plan it is — what you edit here is exactly what kids see, in order.
//
// Bands share one narrative arc; they differ in depth, pacing, and framing:
//   K-2  — playful wonder; tap-only; the machine internals are stripped back
//   3-5  — "how AI learns"; wonder-driven, hands-on, full arc
//   7-8  — "how AI works AND why it matters"; full depth + critical-thinking beats

export const GRADE_CONFIG = {
  "K-2": {
    label: "Ages 5-8",
    subtitle: "A fun introduction to AI for early learners",
    duration: "~20 minutes",
    presTextSizeMultiplier: 1.15,
    slides: {
      // Act 1 — AI Is All Around You
      "who-is-here": 2,        // simplified
      "story-mash": 6,         // early hands-on win
      "what-is-ai": 2,         // simplified
      "rules-vs-learning": 3,  // 1 pair only
      // Act 2 — How AI Learns
      "how-it-learns": 5,      // 1 robot round
      "three-steps": 0,        // SKIP (RLHF — too advanced for now)
      "brain-vs-ai": 4,        // emotions only
      // Act 3 — What's an LLM?
      "what-is-llm": 3,        // simplified
      "meet-models": 0,        // SKIP
      "the-bridge": 2,         // simplified pipeline
      // Act 4 — Inside the Machine
      "numbers-words": 3,      // simplified
      "tokens": 0,             // SKIP
      "embeddings": 4,         // clusters only
      "beyond-2d": 0,          // SKIP
      "attention": 4,          // simplified bat
      "mlp": 0,                // SKIP
      "layers": 0,             // SKIP
      // Act 5 — How AI Writes
      "predict": 3,            // simplified voting
      "reasoning": 3,          // simplified
      // Act 6 — Your Turn
      "try-it": 1,             // preset prompts only
      "beyond-knowledge": 0,   // SKIP
      "wrap-up": 2,            // closing + wonder
    },
  },
  "3-5": {
    label: "Ages 8-11",
    subtitle: "An interactive lesson for 3rd & 4th graders",
    duration: "~45 minutes",
    presTextSizeMultiplier: 1.0,
    slides: {
      // Act 1 — AI Is All Around You
      "who-is-here": 3,
      "story-mash": 6,
      "what-is-ai": 2,
      "rules-vs-learning": 6,
      // Act 2 — How AI Learns
      "how-it-learns": 8,
      "three-steps": 0,        // SKIP for now (simplified RLHF is a follow-on)
      "brain-vs-ai": 8,
      // Act 3 — What's an LLM?
      "what-is-llm": 5,
      "meet-models": 2,
      "the-bridge": 3,
      // Act 4 — Inside the Machine
      "numbers-words": 5,
      "tokens": 0,             // SKIP
      "embeddings": 8,
      "beyond-2d": 0,          // SKIP
      "attention": 7,
      "mlp": 4,
      "layers": 2,
      // Act 5 — How AI Writes
      "predict": 5,
      "reasoning": 5,
      // Act 6 — Your Turn
      "try-it": 2,
      "beyond-knowledge": 0,   // SKIP
      "wrap-up": 2,
    },
  },
  "7-8": {
    label: "Ages 12-14",
    subtitle: "How AI really works — from embeddings to transformers",
    duration: "~55 minutes",
    presTextSizeMultiplier: 0.95,
    slides: {
      // Act 1 — AI Is All Around You
      "who-is-here": 3,
      "story-mash": 6,
      "what-is-ai": 2,
      "rules-vs-learning": 6,
      // Act 2 — How AI Learns
      "how-it-learns": 8,
      "three-steps": 9,        // full RLHF
      "brain-vs-ai": 8,
      // Act 3 — What's an LLM?
      "what-is-llm": 5,
      "meet-models": 2,
      "the-bridge": 3,
      // Act 4 — Inside the Machine
      "numbers-words": 5,
      "tokens": 7,
      "embeddings": 8,
      "beyond-2d": 6,
      "attention": 7,
      "mlp": 4,
      "layers": 2,
      // Act 5 — How AI Writes
      "predict": 5,
      "reasoning": 6,          // full + deeper dive
      // Act 6 — Your Turn
      "try-it": 2,
      "beyond-knowledge": 7,   // bonus: RAG, tools, agents
      "wrap-up": 2,
    },
  },
};

// Slide count for a section in a grade (0 = skipped, default 1 if unspecified).
export function slidesFor(gradeKey, sectionId) {
  const g = GRADE_CONFIG[gradeKey] || GRADE_CONFIG["3-5"];
  const n = g.slides[sectionId];
  return n === undefined ? 1 : n;
}
