// Sidequest registry — optional deep dives launched from inline links in
// chapter prose. Sidequests open in a NEW TAB (the SidequestLink component
// does that), run in their own shell (SidequestView), and never touch
// main-course progress. Route namespace: #sidequest/<slug>/<slide>.
//
// To add a sidequest:
//   1. Create src/course/sidequests/Sq<Name>.jsx  ({ accent, slide } signature,
//      same slide conventions as chapters; last slide = "close this tab" outro).
//   2. Register it below (slideCount must EXACTLY match the slide cases).
//   3. Sprinkle <SidequestLink slug="…"> at the natural spots in chapter prose —
//      sparing, one or two per concept, never in the middle of a demo.
import { ACT_ACCENTS } from "../styles/theme.js";
import SqAttention from "../sidequests/SqAttention.jsx";
import SqNeuralNetwork from "../sidequests/SqNeuralNetwork.jsx";
import SqGradientDescent from "../sidequests/SqGradientDescent.jsx";

export const SIDEQUESTS = [
  {
    slug: "attention",
    title: "Inside Attention",
    blurb:
      "Queries, keys, values, softmax, and the mask — the actual arithmetic of attention, on a four-word sentence.",
    minutes: 12,
    accent: ACT_ACCENTS[3], // violet — it deepens Act III material
    slideCount: 9,
    Component: SqAttention,
  },
  {
    slug: "neural-network",
    title: "What Is a Neural Network?",
    blurb:
      "From one neuron (a weighted sum you can operate by hand) to ReLU bends, layers as matrix multiplies, and a live 17-parameter network — ending inside the transformer's MLP blocks.",
    minutes: 12,
    accent: ACT_ACCENTS[3], // violet — it deepens Act III material (Ch10's MLP)
    slideCount: 10,
    Component: SqNeuralNetwork,
  },
  {
    slug: "gradient-descent",
    title: "How Networks Learn",
    blurb:
      "Loss, slopes, and the two-line update rule — walk a tiny model downhill by hand, break the learning rate on purpose, and see why real training needs backpropagation.",
    minutes: 12,
    accent: ACT_ACCENTS[2], // teal — it deepens Act II material (Ch4's learning loop)
    slideCount: 10,
    Component: SqGradientDescent,
  },
  // Future: "mlp", "backpropagation"
];

export const SIDEQUEST_BY_SLUG = Object.fromEntries(
  SIDEQUESTS.map((s) => [s.slug, s])
);
