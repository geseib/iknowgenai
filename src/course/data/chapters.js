// Chapter registry for "How AI Actually Works" — the single source of truth
// for course structure. Chapters with Component: null render as "coming soon"
// on the syllabus and are not navigable.
import { ACT_ACCENTS } from "../styles/theme.js";
import Ch01 from "../chapters/Ch01ImpossibleMachine.jsx";
import Ch02 from "../chapters/Ch02OnlyPrediction.jsx";
import Ch03 from "../chapters/Ch03WhyRulesFail.jsx";
import Ch04 from "../chapters/Ch04LearningLoop.jsx";
import Ch05 from "../chapters/Ch05WhatLargeMeans.jsx";
import Ch06 from "../chapters/Ch06RaisedByHumans.jsx";
import Ch07 from "../chapters/Ch07WordsBecomeNumbers.jsx";
import Ch08 from "../chapters/Ch08MapOfMeaning.jsx";
import Ch09 from "../chapters/Ch09Attention.jsx";
import Ch10 from "../chapters/Ch10LayersOfThought.jsx";
import Ch11 from "../chapters/Ch11Temperature.jsx";
import Ch12 from "../chapters/Ch12ThinkingOutLoud.jsx";
import Ch13 from "../chapters/Ch13ConfidentNonsense.jsx";
import Ch14 from "../chapters/Ch14YouKnowGenAI.jsx";

export const COURSE_TITLE = "How AI Actually Works";
export const COURSE_TAGLINE =
  "A guided tour inside a large language model. No math degree required.";

export const ACTS = [
  { num: 1, title: "The Mystery", blurb: "It works — and it shouldn't." },
  { num: 2, title: "Learning Without Rules", blurb: "How a machine gets good at prediction." },
  { num: 3, title: "Inside the Machine", blurb: "The actual mechanism, layer by layer." },
  { num: 4, title: "The Roll of the Dice", blurb: "Generation, creativity, and “thinking.”" },
  { num: 5, title: "Powers and Limits", blurb: "What it can't do, and how we work around it." },
];

export const CHAPTERS = [
  {
    id: "impossible-machine", slug: "impossible-machine", num: 1, act: 1,
    title: "The Impossible Machine",
    blurb: "Watch a story get written one word at a time — by a machine that doesn't know how it ends.",
    minutes: 6, slideCount: 7, accent: ACT_ACCENTS[1], Component: Ch01,
  },
  {
    id: "only-prediction", slug: "only-prediction", num: 2, act: 1,
    title: "It's Only Prediction",
    blurb: "The central claim of this course: everything the AI does is guessing the next word. Test it live.",
    minutes: 7, slideCount: 7, accent: ACT_ACCENTS[1], Component: Ch02,
  },
  {
    id: "why-rules-fail", slug: "why-rules-fail", num: 3, act: 2,
    title: "Why Rules Fail",
    blurb: "Try writing the rules of English yourself. Watch every rule you write get destroyed.",
    minutes: 6, slideCount: 7, accent: ACT_ACCENTS[2], Component: Ch03,
  },
  {
    id: "learning-loop", slug: "learning-loop", num: 4, act: 2,
    title: "The Learning Loop",
    blurb: "Guess, check, adjust — the three-step loop, repeated trillions of times, that builds every model.",
    minutes: 8, slideCount: 8, accent: ACT_ACCENTS[2], Component: Ch04,
  },
  {
    id: "what-large-means", slug: "what-large-means", num: 5, act: 2,
    title: "What “Large” Means",
    blurb: "Trillions of words, billions of dials, months of compute. The scale that makes it work.",
    minutes: 6, slideCount: 7, accent: ACT_ACCENTS[2], Component: Ch05,
  },
  {
    id: "raised-by-humans", slug: "raised-by-humans", num: 6, act: 2,
    title: "Raised by Humans",
    blurb: "Pretraining gives you a wild autocomplete. Here's how humans teach it manners — and who decides.",
    minutes: 8, slideCount: 8, accent: ACT_ACCENTS[2], Component: Ch06,
  },
  {
    id: "words-become-numbers", slug: "words-become-numbers", num: 7, act: 3,
    title: "Words Become Numbers",
    blurb: "Tokens, embeddings, and why the machine never actually sees a single word.",
    minutes: 7, slideCount: 8, accent: ACT_ACCENTS[3], Component: Ch07,
  },
  {
    id: "map-of-meaning", slug: "map-of-meaning", num: 8, act: 3,
    title: "A Map of Meaning",
    blurb: "Every word is a point in a space with thousands of dimensions — and the space is roomier than it has any right to be.",
    minutes: 9, slideCount: 9, accent: ACT_ACCENTS[3], Component: Ch08,
  },
  {
    id: "attention", slug: "attention", num: 9, act: 3,
    title: "Attention",
    blurb: "How “bat” knows whether it's baseball or a cave — the trick that made modern AI possible.",
    minutes: 7, slideCount: 7, accent: ACT_ACCENTS[3], Component: Ch09,
  },
  {
    id: "layers-of-thought", slug: "layers-of-thought", num: 10, act: 3,
    title: "Layers of Thought",
    blurb: "Stack the trick ~100 layers deep: spelling at the bottom, reasoning at the top.",
    minutes: 7, slideCount: 7, accent: ACT_ACCENTS[3], Component: Ch10,
  },
  {
    id: "temperature", slug: "temperature", num: 11, act: 4,
    title: "Temperature",
    blurb: "Creativity is controlled randomness. Turn the dial from Frozen to Wild and watch what happens.",
    minutes: 7, slideCount: 7, accent: ACT_ACCENTS[4], Component: Ch11,
  },
  {
    id: "thinking-out-loud", slug: "thinking-out-loud", num: 12, act: 4,
    title: "Thinking Out Loud",
    blurb: "Reasoning models write pages of private thinking you never see before answering. The twist: the thinking is also just prediction.",
    minutes: 7, slideCount: 7, accent: ACT_ACCENTS[4], Component: Ch12,
  },
  {
    id: "confident-nonsense", slug: "confident-nonsense", num: 13, act: 5,
    title: "Confident Nonsense",
    blurb: "Hallucinations, bias, and knowledge cutoffs — why they happen, and the tools that fix them.",
    minutes: 8, slideCount: 8, accent: ACT_ACCENTS[5], Component: Ch13,
  },
  {
    id: "you-know-genai", slug: "you-know-genai", num: 14, act: 5,
    title: "You Know GenAI",
    blurb: "The story from Chapter 1 again — but this time, you can narrate every step of the machine. Then prove it.",
    minutes: 10, slideCount: 6, accent: ACT_ACCENTS[5], Component: Ch14,
  },
];

export const BY_SLUG = Object.fromEntries(CHAPTERS.map((c) => [c.slug, c]));
export const BUILT_CHAPTERS = CHAPTERS.filter((c) => c.Component);
export const TOTAL_MINUTES = CHAPTERS.reduce((a, c) => a + c.minutes, 0);
