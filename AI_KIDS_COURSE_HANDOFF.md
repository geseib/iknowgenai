# How AI Thinks — Claude Code Handoff Document

> **Built in:** Claude.ai (claude-sonnet-4-6)  
> **Stack:** React (single `.jsx` artifact, Tailwind-free, inline styles only)  
> **Target audience:** 3rd & 4th graders (ages 8–11)  
> **Delivery format:** Classroom presentation OR solo self-paced learning  
> **Total sections:** 13  
> **Estimated runtime:** ~45 minutes

---

## 1. Project Overview

This is a fully interactive educational presentation that teaches kids how Large Language Models (LLMs) work — from the very basics of what AI is, through embeddings, attention, MLP layers, and token prediction with temperature. It was designed collaboratively with a teacher/educator and iterated heavily on pedagogy: one thought at a time, deferred reveals, discussion pauses, and age-appropriate language throughout.

The file is a **single self-contained React JSX component** with no external dependencies beyond Google Fonts (Fredoka + Nunito loaded via `@import` in the CSS string). It runs as a Claude artifact.

---

## 2. Architecture

### 2.1 Entry Point

```jsx
export default function App()
```

- On first render, shows `<ModeSelect>` — a full-screen splash asking the user to choose **Classroom** or **Solo** mode.
- Mode is stored in `useState(null)` and passed as a `mode` prop to every section component.
- After mode selection, renders the main shell with header, content area, and footer nav.

### 2.2 Navigation Model

- `sec` (integer, 0–12) is the current section index, stored in root `App` state.
- `done` is a `Set` of completed section indices, used for visual progress tracking.
- `next()` / `prev()` advance or retreat one section.
- Each section is rendered by a direct `{sec===N && <SectionXxx color={color} mode={mode}/>}` conditional — no router.
- On section change, React unmounts and remounts the component (via `key={sec}` on the wrapper div), so all local state resets cleanly.

### 2.3 Color System

```js
const COLORS = ["#00f5d4","#00bbf9","#fee440","#f15bb5","#9b5de5","#fb5607","#06d6a0", ...]
const color = COLORS[sec % COLORS.length]
```

Each section gets its own accent color. The color is used for: section label text, glow effects, button backgrounds, trivia box borders, card highlights, and the ambient blob in the background. It's threaded through every component as a prop.

### 2.4 Section Groups

```js
const GROUPS = [
  { name:"Introduction",  emoji:"👋", start:0, end:2  },
  { name:"Meet the LLMs", emoji:"🤝", start:3, end:6  },
  { name:"How AI Thinks", emoji:"🧠", start:7, end:12 },
]
```

Used in the header to show the current group name.

---

## 3. Mode System

### 3.1 Classroom Mode (`mode === "classroom"`)

- The `<TeacherNote>` component appears at the top of every section — a collapsible panel with 4–5 full talking points for the teacher.
- The `<DiscussionGate>` component wraps interactive content — it shows a big question prompt and a **"Reveal →"** button. The teacher holds on this screen while the class discusses, then taps Reveal to show the answers/visuals.
- Sections that have a vote/quiz mechanic let the teacher tap the winning answer on behalf of the class.

### 3.2 Solo Mode (`mode === "solo"`)

- `<TeacherNote>` renders `null` — hidden entirely.
- `<DiscussionGate>` initialises with `revealed = true` (via `useState(mode === "solo")`), so the content is shown immediately with no gate.
- Interactive elements (tap-to-select, quizzes) are fully active.

### 3.3 TeacherNote Component

```jsx
function TeacherNote({ notes, color, mode })
// notes: string[]  — array of talking point strings
// Renders null if mode !== "classroom"
// Collapsible toggle button, expands to bullet list
```

### 3.4 DiscussionGate Component

```jsx
function DiscussionGate({ question, hint, color, mode, children })
// Shows question + Reveal button in classroom mode
// In solo mode, renders children directly (no gate)
```

---

## 4. Shared Components

### `<Card>` 
A styled container with semi-transparent background and border. Accepts `style` prop for overrides.

### `<Label color text>`
Section eyebrow label (e.g. "HOW AI THINKS · STEP 3"). Small caps, color-tinted.

### `<H1>`
Section title. Fredoka font, 40px, white.

### `<Body>`
Lead paragraph. Nunito, 16px, 62% white opacity.

### `<TriviaBox visible color number label fact>`
The "Wow Fact Unlocked! 🤯" panel that appears after the exercise completes. Uses `wowReveal` CSS animation (spring bounce). Renders `null` when `visible` is false — this is intentional. Every section defers its wow fact until **after** the kid has completed the interactive exercise.

**Unlock triggers per section:**
| Section | Unlocks when |
|---------|-------------|
| 0 – Who's Used AI | N/A (no trivia box) |
| 1 – What IS AI | N/A |
| 2 – Programs vs AI | All 6 scenarios revealed |
| 3 – Brain vs AI | All 7 rows revealed |
| 4 – What's an LLM | After step 3 (all letters revealed) |
| 5 – Meet the Models | All 4 model cards flipped |
| 6 – The Bridge | N/A |
| 7 – Numbers & Words | After tapping "tap to reveal" |
| 8 – Words in Space | After completing Part 2 (Dimension Explorer) |
| 9 – Attention | After reaching phase 4 (explore mode) |
| 10 – MLP | After the animation runs once |
| 11 – Rinse & Repeat | After opening ≥3 layer cards |
| 12 – Predict | After generating the first word |

---

## 5. Section-by-Section Reference

### Section 0 — Who's Used AI? (`SectionWhoIsHere`)
- **Classroom:** DiscussionGate with "raise your hand" prompt → reveals 8 icon cards (Siri, Netflix, etc.)
- **Solo:** Multiselect tap grid → after ≥1 tap, "See what they have in common" button → phase 1 reveal card

### Section 1 — What IS AI? (`SectionWhatIsAI`)
- 3-choice quiz: Robot 🤖 / Smart program 💻 / Digital brain 🧠
- Every answer leads to a tailored response + the same "rules vs learning" insight card
- **Classroom:** Teacher taps the class's winning vote to reveal that choice's response

### Section 2 — Rules vs Learning (`SectionProgramsVsAI`)
- 6 scenarios: tap either "Regular?" or "AI?" → reveals correct answer + explanation
- Works identically in both modes (no DiscussionGate needed — self-revealing)
- Wow fact unlocks when all 6 are revealed

### Section 3 — Brain vs AI (`SectionBrainVsAI`)
- 7 rows comparing brain vs AI on: learning, mistakes, emotions, tiredness, memory, meaning, creativity
- Tap a row to expand — shows side-by-side brain / AI columns
- 🤝 emoji = they match, 🔀 = they differ

### Section 4 — What's an LLM? (`SectionWhatIsLLM`)
- Sequential reveal of L → L → M (Large → Language → Model)
- Each letter unlocks a Card with the full explanation
- Step counter dots at top

### Section 5 — Meet the Models (`SectionMeetModels`)
- 2×2 flip card grid: ChatGPT (OpenAI), Claude (Anthropic), Llama (Meta), Gemini (Google)
- Front: emoji, name, org, tagline, "tap to learn more"
- Back: 3 bullet facts per model, in the model's color

### Section 6 — The Big Question / Bridge (`SectionTheBridge`)
- Phase 0: dramatic "billions of words" teaser card with "I want to know →"
- Phase 1: 5-step roadmap of what's coming (numbered, animated stagger)
- No DiscussionGate — teacher notes handle classroom pacing here

### Section 7 — Numbers & Words (`SectionHook`)
- "cat" → tap to reveal → 10 numbers stream in + "...+12,278 more"
- Wow fact: 12,288 numbers per word

### Section 8 — Words in Space (`SectionEmbeddings`)
Two-part section:

**Part 1 — The Map:**
- Relative-position SVG-style word map using absolute-positioned divs
- 16 words across 5 clusters (animals, royalty, food, tech, action)
- Tap any word → dashed SVG lines connect it to cluster-mates + colored label brightens
- After first tap: "Part 2: Inside the Dimensions →" button appears

**Part 2 — Dimension Explorer (`DimensionExplorer`):**
- 9 sequential steps, each showing one thought
- Animals row + Vehicles row with emoji+name+score-bar chips
- Each step: optional `dimLabel` badge, `scores` object (0=dark, 1=partial, 2=lit), `focusGroup` (dims non-focus words)
- Step progression dots at top
- Wow fact unlocks after "Got it! 🎉" on final step

### Section 9 — Attention (`SectionAttention`)
5-phase quiz walkthrough:

| Phase | Content |
|-------|---------|
| 0 | Giant "bat" word, two choice buttons (🏏 / 🦇) |
| 1 | "You're right AND wrong" reveal, both emojis shown |
| 2 | Sentence 1 word-by-word typewriter reveal → baseball answer card |
| 3 | Sentence 2 word-by-word reveal → flying bat answer card |
| 4 | Free explore mode — both sentences with tappable attention words |

**`AttentionSentence` sub-component:**
- Renders a sentence as word-chip buttons
- Tapping a word in `attnMap` sets it as active → shows attention weight bars
- Hint row at bottom shows which words can be tapped (with "explored" tracking)

**Data:**
```js
const BAT_S1 = ["I","swung","the","bat","and","hit","the","ball","!"]
const BAT_S2 = ["The","bat","flew","out","of","the","cave","at","dusk","."]
const BAT_A1 = { 1:[...], 3:[...], 5:[...], 7:[...] }  // clickable word indices → weight arrays
const BAT_A2 = { 1:[...], 2:[...], 6:[...], 8:[...] }
```

### Section 10 — MLP (`SectionMLP`)
- 3-node-layer diagram: Input (5) → Hidden (8) → Output (5) with arrow connectors
- "Fire it up!" button runs a 4-phase animation (each node row lights up in sequence)
- Analogy card below
- Wow fact: 49,152 neurons in hidden layer

### Section 11 — Rinse & Repeat (`SectionLayers`)
- 6 accordion cards for layer groups (1–16, 17–32, ... 81–96)
- Each card shows emoji + label + range; expands to show description
- Wow fact unlocks after 3+ cards opened

### Section 12 — Predict & Temperature (`SectionPredict`)
- **Temperature slider:** 0.05–2.0, gradient track (frozen→wild), resets sentence on change
- **Live probability bars:** `applyTemp()` recalculates on every slider move
- **Word-by-word generation:** `sampleWord()` does weighted random sample from distribution
- **Layer counter:** increments by 96 per word generated
- Wow fact shows layer count after first word generated

---

## 6. Key Data Structures

### Dimension Steps (`P2_STEPS`)
```js
{
  title: string,
  body: string,
  dimLabel: string | null,       // badge shown when a dimension is active
  scores: { [word]: 0|1|2 } | null,  // 0=dark, 1=partial glow, 2=full glow
  focusGroup: "cd"|"bp"|"veh"|null,  // dims out non-focus words
  dimColor: string | null,       // overrides default accent color
}
```

### Predict Positions (`P_POSITIONS`)
```js
{ candidates: [ [word: string, logit: number], ... ] }
// logits are log-probabilities (negative numbers)
// applyTemp() divides by temperature then softmaxes
```

### Attention Maps (`BAT_A1`, `BAT_A2`)
```js
{ [wordIndex: number]: number[] }
// number[] is a weight per word in the sentence (0.0–1.0)
// only clickable/highlighted words appear as keys
// weights > 0.3 show attention bars
```

---

## 7. CSS System

All CSS lives in a single template literal `ALL_CSS` injected via `<style>{ALL_CSS}</style>` in the root render. No Tailwind, no CSS modules.

**Key animations:**
| Name | Usage |
|------|-------|
| `twinkle` | Starfield background dots |
| `fadeUp` | Default entrance for most content |
| `slideIn` | Number tokens in Section 7 |
| `blobPulse` | Ambient background blob |
| `probIn` | Probability bars (width: 0 → target) |
| `wowReveal` | Spring-bounce entrance for TriviaBox |
| `popIn` | Unused (reserved for future use) |

**Key classes:**
- `.fade-up` — standard content entrance
- `.wow-reveal` — TriviaBox entrance  
- `.word-chip` — attention sentence word buttons
- `.word-chip.active` — selected state (black text on color bg)
- `.word-chip.lit` — dimly highlighted neighbour
- `.layer-row` / `.layer-row.open` — accordion rows in Section 11
- `.cta-btn` — primary action button
- `.ghost-btn` — secondary/back button
- `.temp-slider` — temperature range input with custom thumb

---

## 8. Known Limitations & Areas for Improvement

### 8.1 Content
- **No wrap-up / reflection section** — the lesson ends abruptly after temperature. A Section 13 "What did we learn?" summary with a recap of each concept would round it off well.
- **No quiz/assessment mode** — there's no way for a teacher to test retention. A lightweight end-of-lesson quiz (5–8 questions covering all concepts) would be valuable.
- **The word map (Section 8 Part 1)** uses hardcoded `x`/`y` percentages — it's not a true 2D vector projection. For a more accurate version, these positions could be replaced with real t-SNE coordinates from actual word embeddings.
- **Attention weights are approximated** — the `BAT_A1`/`BAT_A2` values are manually authored to be illustrative, not computed from a real transformer.

### 8.2 UX
- **No "Jump to Section" navigation** — a teacher might want to skip ahead or revisit a section without clicking through. A section menu/drawer would help.
- **No full-screen mode trigger** — useful for classroom projection. A button to enter browser fullscreen via the Fullscreen API would be a quick win.
- **Mobile layout** — the design works on tablet but hasn't been optimised for small phones. Some cards overflow on 375px screens.
- **Back button resets section state** — navigating back and then forward remounts the component and resets all internal progress (e.g. attention phase resets to 0). This is intentional for simplicity but could be surprising.
- **Section 8 (Embeddings) is the longest** — it has two parts with 9 sub-steps in Part 2. Consider splitting into two separate sections (Section 8 = Map, Section 9 = Dimensions) and renumbering, pushing the total to 14.

### 8.3 Technical
- **No persistent state** — if the page refreshes, all progress is lost. For solo use this might matter. Could use the artifact's `window.storage` API to persist `sec`, `mode`, and `done`.
- **Single file** — at ~1,100 lines the file is at the upper limit of what's manageable in a single artifact. If adding significantly more sections, consider whether the environment supports splitting.
- **No i18n** — all content is English only.

---

## 9. Suggested Next Features (Priority Order)

### High Priority
1. **Wrap-up / reflection section** — recap of all 6 "How AI Thinks" steps, with a memorable summary card per concept. Ask kids: "Now that you know how it works, what question do you still have?"
2. **Section jump menu** — slide-out drawer in classroom mode, lists all 13 sections by title, lets teacher jump directly to any one.
3. **Fullscreen button** — single icon in the header, calls `document.documentElement.requestFullscreen()`.

### Medium Priority
4. **End-of-lesson quiz** — 8 multiple-choice questions, one per core concept. Works in both modes. Shows score at end with "ask your teacher about the ones you missed."
5. **Section 8 split** — separate the word map from the dimension explorer into two sections for breathing room.
6. **Persistent progress** — use `window.storage.set('progress', {sec, mode, done})` on every navigation, restore on load.
7. **Print/export teacher guide** — a button that opens a printer-friendly version of all teacher notes in one scrollable page.

### Lower Priority
8. **Class poll visualization** — in classroom mode, for the "What is AI?" vote, let the teacher enter a tally (e.g. 12 / 8 / 4) and show a live bar chart of class results.
9. **Embed real word vectors** — replace the hardcoded `WORD_MAP` positions with actual 2D projections of real GloVe or Word2Vec embeddings for 20–30 words.
10. **Accessibility pass** — add `aria-label` attributes to interactive buttons, ensure focus ring visibility, check color contrast ratios.
11. **Spanish translation** — given the target demographic, a language toggle would dramatically expand reach.

---

## 10. File Layout (Logical Order)

```
ALL_CSS                          — full CSS string (animations, classes)
COLORS                           — 13 accent colors, one per section
TITLES                           — 13 section title strings
GROUPS                           — 3 navigation groups with start/end indices
WORD_MAP                         — 16 words with x/y/group for the map
GC                               — group colors for the word map
P2_EMOJIS / P2_ANIMALS / P2_VEHICLES  — dimension explorer data
P2_STEPS                         — 9-step dimension explorer script
BAT_S1 / BAT_S2                  — attention lesson sentences
BAT_A1 / BAT_A2                  — attention weight maps
P_POSITIONS                      — predict section logits
applyTemp()                      — softmax with temperature
sampleWord()                     — weighted random sampler
tempMeta()                       — temperature label/color/description

── Shared Components ──
Card, Label, H1, Body            — layout primitives
TriviaBox                        — deferred wow fact panel
TeacherNote                      — classroom-only collapsible talking points
DiscussionGate                   — classroom hold + reveal / solo passthrough

── Intro Sections (0–6) ──
SectionWhoIsHere
SectionWhatIsAI
SectionProgramsVsAI
SectionBrainVsAI
SectionWhatIsLLM
SectionMeetModels
SectionTheBridge

── Core Sections (7–12) ──
SectionHook                      — words → numbers
DimensionExplorer                — sub-component for Section 8 Part 2
SectionEmbeddings                — words in space + dimensions
AttentionSentence                — sub-component for Section 9
SectionAttention                 — bat quiz walkthrough
SectionMLP                       — thinking layer animation
SectionLayers                    — 96 layer accordion
SectionPredict                   — temperature slider + generation

── Root ──
ModeSelect                       — full-screen mode selection splash
App                              — root component, nav shell, header, footer
```

---

## 11. Design Principles (Do Not Break)

These are the core pedagogical and design decisions made deliberately with the educator. Any new sections or features should respect these:

1. **One thought at a time.** Never show the answer before the question. Never show more than one concept per screen. Always give the kid something to do before revealing the insight.

2. **Deferred wow facts.** The `TriviaBox` must only appear after the exercise. Never pre-load it. The number/statistic is the *reward* for engaging, not the hook.

3. **Discussion before reveal (classroom mode).** Every section that has a `DiscussionGate` should stay gated in classroom mode. The teacher drives the pace — the screen should never rush ahead.

4. **Age-appropriate language.** Vocabulary ceiling: 3rd/4th grade (ages 8–11). No jargon without a same-sentence explanation. Analogies should reference things kids know: baseball, caves, Netflix, pizza.

5. **Interactive = required, not optional.** Every section must have at least one tap/click/drag before it's "done." Passive reading is not enough.

6. **Color signals progress.** Each section has its own color. The color threads through every visual element on that screen. Changing section = changing color = clear psychological beat.

7. **Consistent motion language.** Entrances = `fadeUp`. Reveals = `wowReveal`. Do not add jarring or distracting animations that fight for attention with the content.

8. **Solo mode must work without a teacher.** Every concept that relies on a TeacherNote for explanation in classroom mode must have an equivalent explanation built into the section content itself for solo mode.

---

## 12. Environment Notes

- Built and tested as a **React artifact** in Claude.ai
- Font imports via Google Fonts CDN — requires network access to render correctly
- No `localStorage` or `sessionStorage` used (not supported in Claude artifacts)
- The `window.storage` artifact persistence API is available but not yet wired up
- All images are emoji — no external image dependencies
- Tested at viewport widths: 390px (iPhone), 768px (iPad), 1280px (laptop projection)

---

*Handoff document generated from a collaborative Claude.ai conversation. Last updated: March 2026.*
