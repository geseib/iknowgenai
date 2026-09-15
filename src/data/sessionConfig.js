/**
 * Multi-Session (v3) configuration — an OPT-IN way to split the lesson into
 * three bite-sized sessions (Discover, Explore, Create). Off by default.
 *
 * Each session lists the sections it contains by their stable `id`
 * (see src/data/sections.js). Sections render in the order listed here.
 */

export const SESSION_CONFIG = {
  "K-2": {
    sessions: [
      {
        name: "Discover",
        subtitle: "What is AI?",
        sections: ["who-is-here", "story-mash", "rules-vs-learning"],
        teaser: "Next time: how does AI actually DO all that?",
      },
      {
        name: "Explore",
        subtitle: "How AI thinks",
        sections: ["what-is-llm", "how-it-learns", "numbers-words"],
        review: [
          {
            question: "What did we build with AI last time?",
            answer: "A story from 3 random ingredients!",
            animationType: "storyMash",
            color: "#fee440",
          },
          {
            question: "How does AI create things?",
            answer: "It predicts one word at a time",
            animationType: "wordByWord",
            color: "#00bbf9",
          },
          {
            question: "Is AI a robot, a program, or a brain?",
            answer: "Software that LEARNS from examples",
            animationType: "reveal",
            color: "#f15bb5",
          },
        ],
        teaser: "Next time: how does AI pick the right word?",
      },
      {
        name: "Create",
        subtitle: "AI in action",
        sections: ["embeddings", "attention", "predict", "reasoning", "try-it", "confidently-wrong", "where-learned"],
        review: [
          {
            question: "How does AI see words?",
            answer: "Numbers!",
            animationType: "numberTicker",
            color: "#fee440",
          },
          {
            question: "How did AI learn?",
            answer: "Guess, check, adjust — like practice!",
            animationType: "reveal",
            color: "#9b5de5",
          },
        ],
      },
    ],
  },
  "3-5": {
    sessions: [
      {
        name: "Discover",
        subtitle: "What is AI?",
        sections: ["who-is-here", "story-mash", "rules-vs-learning", "brain-vs-ai"],
        teaser: "Next time: we open the hood and look inside",
      },
      {
        name: "Explore",
        subtitle: "Inside the machine",
        sections: ["what-is-llm", "how-it-learns", "the-bridge", "numbers-words", "embeddings"],
        review: [
          {
            question: "What did we build with AI last time?",
            answer: "A story from 3 random ingredients!",
            animationType: "storyMash",
            color: "#fee440",
          },
          {
            question: "How does AI create things?",
            answer: "It predicts one word at a time",
            animationType: "wordByWord",
            color: "#00bbf9",
          },
          {
            question: "Is AI a robot, a program, or a brain?",
            answer: "Software that LEARNS from examples",
            animationType: "reveal",
            color: "#f15bb5",
          },
        ],
        teaser: "Next time: the final pieces — attention and prediction",
      },
      {
        name: "Create",
        subtitle: "AI in action",
        sections: ["attention", "mlp", "layers", "predict", "reasoning", "try-it", "confidently-wrong", "where-learned"],
        review: [
          {
            question: "How does AI see the word 'cat'?",
            answer: "12,288 numbers!",
            animationType: "numberTicker",
            color: "#fee440",
          },
          {
            question: "Words with similar meaning are...",
            answer: "Close together in meaning space!",
            animationType: "scatter",
            color: "#00f5d4",
          },
          {
            question: "How did AI learn to be helpful?",
            answer: "Humans rated its answers!",
            animationType: "reveal",
            color: "#9b5de5",
          },
        ],
      },
    ],
  },
  "7-8": {
    sessions: [
      {
        name: "Discover",
        subtitle: "What is AI?",
        sections: ["who-is-here", "story-mash", "rules-vs-learning", "brain-vs-ai", "what-is-llm"],
        teaser: "Next time: we look inside the machine",
      },
      {
        name: "Explore",
        subtitle: "Inside the machine",
        sections: ["how-it-learns", "three-steps", "the-bridge", "tokens", "numbers-words", "embeddings"],
        review: [
          {
            question: "What did we build with AI last time?",
            answer: "A story from 3 random ingredients!",
            animationType: "storyMash",
            color: "#fee440",
          },
          {
            question: "How does AI create things?",
            answer: "It predicts one word at a time",
            animationType: "wordByWord",
            color: "#00bbf9",
          },
          {
            question: "Is AI a robot, a program, or a brain?",
            answer: "Software that LEARNS from examples",
            animationType: "reveal",
            color: "#f15bb5",
          },
        ],
        teaser: "Next time: attention, layers, and the full pipeline",
      },
      {
        name: "Create",
        subtitle: "The full pipeline",
        sections: ["attention", "mlp", "layers", "predict", "reasoning", "try-it", "confidently-wrong", "where-learned", "beyond-knowledge"],
        review: [
          {
            question: "How does AI see the word 'cat'?",
            answer: "12,288 numbers called a vector!",
            animationType: "numberTicker",
            color: "#fee440",
          },
          {
            question: "Words with similar meaning are...",
            answer: "Close together in 12,288-dimensional space!",
            animationType: "scatter",
            color: "#00f5d4",
          },
          {
            question: "What's a token?",
            answer: "Not whole words — subword pieces like un + believ + able",
            animationType: "reveal",
            color: "#9b5de5",
          },
        ],
      },
    ],
  },
};

/** Session theme colors used in the session selector UI */
export const SESSION_COLORS = ["#fee440", "#00bbf9", "#f15bb5"];

/** Session icon names (mapped to Phosphor icons in the UI) */
export const SESSION_ICONS = ["MagnifyingGlass", "Compass", "PaintBrush"];
