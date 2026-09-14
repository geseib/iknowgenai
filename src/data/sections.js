// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL SECTION REGISTRY — the single source of truth for course flow.
//
// This array IS the order kids experience. Edit order here and everything
// downstream (slide counts, teacher notes, sessions, cat cameos, nav, colors)
// follows automatically because they all key off the stable string `id` — never
// an array position. Reordering this list can never silently desync a config.
//
// Narrative arc (6 acts):
//   1. AI Is All Around You  — hook + an early hands-on win
//   2. How AI Learns         — the heart: AI learns from examples (moved up front)
//   3. What's an LLM?         — name the thing we're about to open up
//   4. Inside the Machine     — the underlying technology, step by step
//   5. How AI Writes          — generation payoff
//   6. Your Turn              — apply + reflect
// ─────────────────────────────────────────────────────────────────────────────

import SectionWhoIsHere from "../components/SectionWhoIsHere";
import SectionStoryMash from "../components/SectionStoryMash";
import SectionWhatIsAI from "../components/SectionWhatIsAI";
import SectionProgramsVsAI from "../components/SectionProgramsVsAI";
import SectionHowItLearns from "../components/SectionHowItLearns";
import SectionThreeSteps from "../components/SectionThreeSteps";
import SectionBrainVsAI from "../components/SectionBrainVsAI";
import SectionWhatIsLLM from "../components/SectionWhatIsLLM";
import SectionMeetModels from "../components/SectionMeetModels";
import SectionTheBridge from "../components/SectionTheBridge";
import SectionHook from "../components/SectionHook";
import SectionTokens from "../components/SectionTokens";
import SectionEmbeddings from "../components/SectionEmbeddings";
import SectionBeyond2D from "../components/SectionBeyond2D";
import SectionAttention from "../components/SectionAttention";
import SectionMLP from "../components/SectionMLP";
import SectionLayers from "../components/SectionLayers";
import SectionPredict from "../components/SectionPredict";
import SectionReasoning from "../components/SectionReasoning";
import SectionTryIt from "../components/SectionTryIt";
import SectionBeyondKnowledge from "../components/SectionBeyondKnowledge";
import SectionWrapUp from "../components/SectionWrapUp";

// Act labels (shown as group headers in the nav drawer).
export const ACTS = {
  AROUND: "AI Is All Around You",
  LEARNS: "How AI Learns",
  LLM: "What's an LLM?",
  INSIDE: "Inside the Machine",
  WRITES: "How AI Writes",
  YOURS: "Your Turn",
};

// id            — stable key everything else references (NEVER reuse/rename casually)
// Component     — the section component
// title         — display title (nav, teacher drawer)
// color         — accent color threaded through the slide
// group         — act label (consecutive same-group entries form one nav group)
export const SECTIONS = [
  // ── Act 1: AI Is All Around You ──
  { id: "who-is-here",     Component: SectionWhoIsHere,      title: "Who's Used AI?",            color: "#00f5d4", group: ACTS.AROUND },
  { id: "story-mash",      Component: SectionStoryMash,      title: "Story Mash-Up!",            color: "#fee440", group: ACTS.AROUND },
  { id: "what-is-ai",      Component: SectionWhatIsAI,       title: "What IS AI?",               color: "#00bbf9", group: ACTS.AROUND },
  { id: "rules-vs-learning", Component: SectionProgramsVsAI, title: "Rules vs Learning",         color: "#f15bb5", group: ACTS.AROUND },

  // ── Act 2: How AI Learns (the heart — moved up front) ──
  { id: "how-it-learns",   Component: SectionHowItLearns,    title: "How AI Learns",             color: "#9b5de5", group: ACTS.LEARNS },
  { id: "three-steps",     Component: SectionThreeSteps,     title: "Teaching AI to Be Helpful", color: "#fb5607", group: ACTS.LEARNS },
  { id: "brain-vs-ai",     Component: SectionBrainVsAI,      title: "Brain vs AI",               color: "#06d6a0", group: ACTS.LEARNS },

  // ── Act 3: What's an LLM? ──
  { id: "what-is-llm",     Component: SectionWhatIsLLM,      title: "What's an LLM?",            color: "#00bbf9", group: ACTS.LLM },
  { id: "meet-models",     Component: SectionMeetModels,     title: "Meet the Models",           color: "#f15bb5", group: ACTS.LLM },
  { id: "the-bridge",      Component: SectionTheBridge,      title: "The Big Question",          color: "#9b5de5", group: ACTS.LLM },

  // ── Act 4: Inside the Machine (the underlying technology) ──
  { id: "numbers-words",   Component: SectionHook,           title: "Numbers & Words",           color: "#fee440", group: ACTS.INSIDE },
  { id: "tokens",          Component: SectionTokens,         title: "Tokens — Not Quite Words",  color: "#fb5607", group: ACTS.INSIDE },
  { id: "embeddings",      Component: SectionEmbeddings,     title: "Words in Space",            color: "#06d6a0", group: ACTS.INSIDE },
  { id: "beyond-2d",       Component: SectionBeyond2D,       title: "Beyond 2D",                 color: "#00bbf9", group: ACTS.INSIDE },
  { id: "attention",       Component: SectionAttention,      title: "Attention!",                color: "#fb5607", group: ACTS.INSIDE },
  { id: "mlp",             Component: SectionMLP,            title: "The Thinking Layer",        color: "#06d6a0", group: ACTS.INSIDE },
  { id: "layers",          Component: SectionLayers,         title: "Rinse & Repeat",            color: "#fee440", group: ACTS.INSIDE },

  // ── Act 5: How AI Writes ──
  { id: "predict",         Component: SectionPredict,        title: "Predict!",                  color: "#f15bb5", group: ACTS.WRITES },
  { id: "reasoning",       Component: SectionReasoning,      title: "Think First!",              color: "#9b5de5", group: ACTS.WRITES },

  // ── Act 6: Your Turn ──
  { id: "try-it",          Component: SectionTryIt,          title: "Try It Yourself!",          color: "#00f5d4", group: ACTS.YOURS },
  { id: "beyond-knowledge", Component: SectionBeyondKnowledge, title: "Beyond What AI Knows",    color: "#00bbf9", group: ACTS.YOURS },
  { id: "wrap-up",         Component: SectionWrapUp,         title: "You Know GenAI!",           color: "#00f5d4", group: ACTS.YOURS },
];

// Fast lookups by id.
export const SECTION_BY_ID = Object.fromEntries(SECTIONS.map(s => [s.id, s]));
export const SECTION_INDEX = Object.fromEntries(SECTIONS.map((s, i) => [s.id, i]));

// Derive nav groups as contiguous runs of the same `group` label.
export function buildGroups(sections = SECTIONS) {
  const groups = [];
  sections.forEach((s, i) => {
    const last = groups[groups.length - 1];
    if (last && last.name === s.group) last.end = i;
    else groups.push({ name: s.group, start: i, end: i });
  });
  return groups;
}
