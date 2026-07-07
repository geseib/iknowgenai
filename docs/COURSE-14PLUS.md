# How AI Actually Works — the 14+ course

*A guided tour inside a large language model. No math degree required.*

Live at **[/course](https://iknowgenai.seibtribe.us/course)** · code in `src/course/` · editing conventions in the `course-design` skill (`.claude/skills/course-design/`)

A single-track course for teens and adults (14+) that teaches how LLMs work
**under the hood** — not just how to use them. It shares this repo's API
backend with the K-8 course but has its own design system, navigation shell,
and voice. The bar is 3Blue1Brown / Veritasium: intellectually honest,
visually restrained, driven by "wait, how is that possible?"

## Teaching philosophy

- **One driving mystery.** Minute one plants the claim: *everything ChatGPT
  does is predicting the next word.* Every chapter peels back one layer of
  "but HOW can prediction alone do that?" The course ends where it began —
  Chapter 1's story regenerates with every pipeline stage annotated.
- **Experience before explanation.** Every concept is felt in an interactive
  demo before it's named. Real APIs, never simulations.
- **Honest simplification.** Every simplification is flagged in an
  **Honest footnote** — the credibility contract with the audience.
- **Playful but grown-up.** Wit stays; kid-styling goes.

## The syllabus — 5 acts, 14 chapters (~105 min)

| # | Chapter | The beat | Signature demo |
|---|---------|----------|----------------|
| **Act I — The Mystery** ||||
| 1 | The Impossible Machine | A story appears one word at a time, blind to its ending | Live story generation; influence-glow replay ("it keeps glancing back"); behind-the-curtain system prompt |
| 2 | It's Only Prediction | The central claim, made rigorous | Live ranked candidates; you-vs-model whole-word game; pick-a-token generation loop |
| **Act II — Learning Without Rules** ||||
| 3 | Why Rules Fail | Hand-written rules collapse; learning from examples wins (bias seed planted) | Rule-vs-edge-case game |
| 4 | The Learning Loop | Guess → check → adjust = gradient descent | Training game with real cross-entropy loss; "finish the joke" context lesson |
| 5 | What "Large" Means | Data, weights, compute; the name LLM; model families | Scale count-ups (11T words, 175B weights) |
| 6 | Raised by Humans | Base models, instruction tuning, RLHF, RLVR; who decides "good"? | Response-rating game; automated RLVR verifier loop |
| **Act III — Inside the Machine** ||||
| 7 | Words Become Numbers | Tokens, then embeddings | Live tiktoken tokenizer; the 12,288-number stream |
| 8 | A Map of Meaning | Embedding space; near-orthogonality; superposition | Live embedding scatter; 2D interference playground; high-D angle collapse (computed live); exponential-capacity counter (10⁸⁹ > atoms) |
| 9 | Attention | Context rewrites the vector; the loaded final word; position | Clue game with live-diverging bat vectors; "the murderer was the ___" → the model answers *butler* from one loaded vector |
| 10 | Layers of Thought | MLP; ~96 stacked layers; first layers = spelling, final = meaning | Full-pipeline assembly animation |
| **Act IV — The Roll of the Dice** ||||
| 11 | Temperature | Greedy decoding fails; dice; top-p; apps hide the dials | Live temperature dial; same-prompt-twice experiment |
| 12 | Thinking Out Loud | Chain of thought; reasoning models; hidden thinking tokens; RLVR ties back | Live direct-vs-step-by-step arithmetic; hidden-trace reveal |
| **Act V — Powers and Limits** ||||
| 13 | Confident Nonsense | Hallucination, cutoff, arithmetic, bias, no memory; fixes: context, RAG, tools, agents, MCP, skills | Live hallucination trap; memory-illusion chat replay; live agent loop with toggleable tools; buzzword decoder |
| 14 | You Know GenAI | The payoff + proof | Annotated pipeline replay of Ch1's story; 13-question quiz with per-option explanations |

## Architecture

```
src/course/
  CourseApp.jsx        # hash router (/course#slug/slide), progress, v2 CSS injection
  Landing.jsx          # syllabus page with per-chapter progress + Continue CTA
  ChapterView.jsx      # slide shell: progress bar, drawer, keyboard/touch nav, interstitials
  chapters/Ch01…Ch14   # one file per chapter; component signature {accent, slide}
  data/chapters.js     # THE registry: slugs, slideCounts, act accents, components
  data/progress.js     # localStorage persistence ("ikg.course.v1")
  ui/shared.jsx        # Slide, Kicker, Heading, Prose, Card, Button, Mono,
                       #   HonestNote, Recap, CountUp, BlockedNote
  lib/api.js           # predictNext / tokenize / embed2d / generateStream /
                       #   annotateStory / runAgent — all send course flags
  styles/theme.js      # design tokens (fonts, palette, act accents, spacing)
  styles/global.js     # COURSE_CSS (never co-mounts with K-8 ALL_CSS)
```

Routing: `src/main.jsx` branches on pathname (`/course` → CourseApp, else K-8
App). `vercel.json` has the SPA rewrite. Deep links: `/course#chapter-slug/3`.

## Sidequests — optional deep dives

Sidequests are self-contained deep dives (e.g. **Inside Attention**) launched
from inline term-links in chapter prose. They open **in a new tab**, run in
their own shell, and never touch main-course progress, numbering, or the quiz
— skipping them costs nothing. Route namespace: `/course#sidequest/<slug>/<n>`.

```
src/course/
  data/sidequests.js        # sidequest registry (slug, accent, slideCount, Component)
  SidequestView.jsx         # shell: Sidequest badge, own slide dots, no progress writes
  sidequests/Sq<Name>.jsx   # one file per sidequest, same {accent, slide} signature
  ui/shared.jsx             # SidequestLink — the inline launcher (target=_blank)
```

To add a sidequest:

1. **Create** `src/course/sidequests/Sq<Name>.jsx`. Same conventions as a
   chapter (switch on `slide`, HonestNotes, in-browser real math or real
   APIs). Slide 0 should say "this opened in its own tab; your place is
   safe"; the last slide is a recap that ends with "close this tab and pick
   the course back up."
2. **Register** it in `src/course/data/sidequests.js` — `slideCount` must
   exactly match the slide cases (the dots derive from it). Use the accent of
   the act whose material it deepens.
3. **Link** it from chapter prose with
   `<SidequestLink slug="…" accent={accent}>term</SidequestLink>`.
   Sparingly: one or two spots per concept (where the term is named, and/or
   the chapter recap's `aside`), never inside a demo, and only from chapters
   whose concepts the sidequest builds on (don't link math-heavy dives from
   Act I).

Shipped sidequests: **Inside Attention** (`attention`, linked from Ch9);
**What Is a Neural Network?** (`neural-network`, linked from Ch10 — one
neuron → ReLU → layers-as-matrices → a live 2-layer classifier → the
transformer's MLP blocks);
**How Networks Learn** (`gradient-descent`, linked from Ch4 — loss on a
one-knob softmax model → the loss landscape → slope by nudging → the
update rule with a breakable learning rate → a two-knob contour map →
the honest bridge to backpropagation);
**Where You Put It Matters** (`position-bias`, linked from Ch9 and Ch13 —
Lost in the Middle's U-curve → the causal/primacy/recency cause →
prompt-order sensitivity (CQO vs QOC, few-shot order) → the 1M-token
reality → needle-vs-associative retrieval; grounds every number in cited
sources with honest footnotes on the still-emerging theory).

Planned future sidequests: the MLP, backpropagation.

## Glossary tooltips — inline definitions for jargon

The lighter-weight sibling of sidequests. A term wrapped in `<Term>` gets a
quiet **dashed** underline (dotted + chip = sidequest, dashed = glossary) and
shows a small definition card on hover, keyboard focus, or tap (tap elsewhere
or Escape closes; the card flips/clamps to stay on screen). Cards can carry an
optional "Read more ↗" link that opens a canonical reference in a new tab.

- **Definitions live in ONE file**: `src/course/data/glossary.js` —
  `{ slug: { term, definition, link? } }`. Define once, use anywhere.
- **Mark a term** in chapter prose:
  `<Term t="softmax" accent={accent}>softmax</Term>`.
  The primitive is in `src/course/ui/shared.jsx`.
- **Sparing use, same spirit as sidequest links**: at most the first
  meaningful occurrence per chapter; never inside headings, buttons, or
  interactive demo regions; never nested in a `SidequestLink`; and never on
  the slide that's *teaching* the term (the prose there already defines it) —
  tooltip it where it's used in passing, before or after its teaching moment.
- **Where a sidequest exists** (attention), link the sidequest — tooltips are
  for lighter-weight terms.
- **Definitions follow the course's honesty contract**: 1–3 sentences, plain
  and confident, fact-checked, honest about simplification. Links are rare
  and only for genuinely canonical, lay-readable references (3Blue1Brown,
  the original paper, a first-rate explainer).

## API endpoints (shared with K-8; course behavior is opt-in)

| Endpoint | Course flag | What the course uses it for |
|---|---|---|
| `POST /api/generate` | `style:"plain"` | Stories, experiments, hallucination trap (SSE stream) |
| `POST /api/predict` | `mode:"completion"` | True next-token prediction with raw leading-space tokens, whole-word assembly (gpt-3.5-turbo-instruct) |
| `POST /api/tokenize` | `relaxed:true` | Real tiktoken splits |
| `POST /api/embed` | `relaxed:true` | PCA-reduced 2D embedding scatter |
| `POST /api/annotate` | (course-only) | Ch1 replay influence map (LLM-estimated) |
| `POST /api/agent` | `style:"plain"` | Ch13 think→act→observe loop with real tools |

`style:"plain"` = neutral system prompt (no K-12 deflection phrases) +
relaxed moderation. **Relaxed moderation still screens every input** through
OpenAI's moderation API using per-category score thresholds
(`api/_moderate.js`) — it skips only the K-12 keyword blocklist and
classifier, which reject ordinary story words (fight, war, haunted…).

## Known constraints

- The chat completions API hides token leading-spaces → anything appending
  raw tokens must use predict's `mode:"completion"`.
- The final quiz lives in Ch14 (`QUIZ` array) — every option carries its own
  explanation, shown for right *and* wrong picks.
- The K-8 home screen links here via a serif "Ages 14+" card in
  `ModeSelect.jsx`.
