export const GRADE_CONFIG = {
  "K-2": {
    label: "Ages 5-8",
    subtitle: "A fun introduction to AI for early learners",
    duration: "~20 minutes",
    presTextSizeMultiplier: 1.15,
    presentationSlides: [
      2,  // 0: Who's Used AI? — simplified
      2,  // 1: What IS AI? — simplified
      3,  // 2: Rules vs Learning — 1 pair only
      4,  // 3: Brain vs AI — emotions only
      3,  // 4: What's an LLM? — simplified
      0,  // 5: Meet the Models — SKIP
      2,  // 6: The Big Question — simplified pipeline
      5,  // 7: How AI Learns — 1 robot round
      3,  // 8: Numbers & Words — simplified
      4,  // 9: Words in Space — clusters only
      4,  // 10: Attention — simplified bat
      0,  // 11: The Thinking Layer — SKIP
      0,  // 12: Rinse & Repeat — SKIP
      3,  // 13: Predict! — simplified voting
      1,  // 14: Try It! — preset prompts only
    ],
  },
  "3-5": {
    label: "Ages 8-11",
    subtitle: "An interactive lesson for 3rd & 4th graders",
    duration: "~45 minutes",
    presTextSizeMultiplier: 1.0,
    presentationSlides: [
      3,  // 0: Who's Used AI?
      2,  // 1: What IS AI?
      6,  // 2: Rules vs Learning
      8,  // 3: Brain vs AI
      5,  // 4: What's an LLM?
      4,  // 5: Meet the Models
      3,  // 6: The Big Question
      11, // 7: How AI Learns
      5,  // 8: Numbers & Words
      8,  // 9: Words in Space
      7,  // 10: Attention
      4,  // 11: The Thinking Layer
      2,  // 12: Rinse & Repeat
      5,  // 13: Predict!
      2,  // 14: Try It!
    ],
  },
  "7-8": {
    label: "Ages 12-14",
    subtitle: "How AI really works — from embeddings to transformers",
    duration: "~55 minutes",
    presTextSizeMultiplier: 0.95,
    presentationSlides: [
      3,  // 0: Who's Used AI?
      3,  // 1: What IS AI? + ML types
      6,  // 2: Rules vs Learning
      8,  // 3: Brain vs AI
      6,  // 4: What's an LLM? + parameters
      4,  // 5: Meet the Models
      4,  // 6: The Big Question + training vs inference
      11, // 7: How AI Learns
      6,  // 8: Numbers & Words + tokens
      9,  // 9: Words in Space + cosine similarity
      9,  // 10: Attention + Q/K/V
      5,  // 11: The Thinking Layer + knowledge neurons
      3,  // 12: Rinse & Repeat + residual connections
      7,  // 13: Predict! + sampling methods
      2,  // 14: Try It!
    ],
  },
};
