# Sidequest Pedagogy — the 3Blue1Brown redesign blueprint

**Status:** design spec, no code changed. Written after a close study of the
written versions of five 3b1b lessons (`/lessons/neural-networks`,
`/lessons/gradient-descent`, `/lessons/backpropagation`, `/lessons/attention`,
`/lessons/mlp` — "How might LLMs store facts") and an audit of our three built
sidequests (`src/course/sidequests/Sq*.jsx`).

**The problem being fixed:** the built sidequests are *correct* and *dense* —
they read like beautifully annotated spreadsheets. The audience is adults who
are rusty with math or afraid of it. Our quests currently ask them to *verify
arithmetic*; 3b1b asks them to *want the next idea*. The difference is
structural, and this document specifies the structure.

---

## A. The template

### A0. What 3b1b actually does (the machinery, not the content)

Every one of the five lessons runs the same seven-part engine:

1. **A felt problem before any mechanism.** Neural-networks opens with a
   playable digit recognizer ("Give it a whirl if you haven't already!") and
   the tension "identifying digits is incredibly easy for your brain to do,
   but almost impossible to describe *how* to do." Attention opens with three
   "mole" sentences. MLP opens with one testable fact: "Michael Jordan plays
   the sport of ___." The learner is never told what the lesson is about;
   they are made to *need* it.
2. **ONE persistent visual metaphor that evolves.** Neuron = "a thing that
   holds a number." Gradient descent = a ball rolling downhill (1-D → 2-D →
   "13,002 dimensions," where the picture is retired *explicitly* and
   replaced with a non-spatial framing). Attention = nouns asking questions,
   adjectives answering. Backprop = "nudges" with the handwritten "2" as "the
   concrete anchor preventing abstraction death." The metaphor is never
   swapped; it grows one capability per section.
3. **Fixed arrival order: intuition → picture → words → symbols.** Notation
   is always last, and always framed as *compression of something already
   understood*: matrix multiplication is introduced in the NN lesson as
   "instead of computing a bunch of weighted sums like this one-by-one."
   The backprop lesson goes furthest: "let's begin with a complete disregard
   for notation" — and then never introduces any.
4. **Every symbol is earned by a problem.** Sigmoid appears only after "the
   result of the weighted sum can be any number, but we want values between
   0 and 1." Softmax appears only after "what we want is for the numbers in
   these columns to be between 0 and 1." A symbol whose problem hasn't been
   staged yet is a symbol the lesson doesn't show.
5. **Scary things are named, then defused — never hidden.** "Thinking about
   the gradient vector as a direction in a 13,002-dimensional space is, to
   put it lightly, beyond the scope of our imaginations." Then: "All that
   matters for you and me right now is that in principle, there exists a way
   to compute this vector." Fear is acknowledged *out loud* and the learner
   is told exactly how much they can skip.
6. **Explicit reassurance beats.** Direct quotes worth stealing the spirit
   of: "Again, this is a lot to think about, so don't worry at all if it
   takes some time to sink in." / "If you've understood everything so far
   and were to stop here, you would go with an understanding of the essence
   of what attention really is." / "You'll be okay even if you're not rock
   solid on the details."
7. **The ending names what you now own.** Not "you understand transformers"
   but structural literacy: after NN, "readers should now grasp *what the
   knobs are* even if they don't yet understand *how to turn them*." Each
   lesson closes with a promise kept and a promise deferred.

### A1. Our one advantage over video — and the rule it imposes

A video viewer can only nod along. Our learner can **act**. That advantage is
squandered unless every interaction forces a *commitment* first:

> **The Predict Gate rule: a slider is only pedagogy if the learner predicts
> before they drag.** Every interactive element in a sidequest must be
> preceded by a cheap, two-tap commitment — "Which token will score highest?"
> / "Higher or lower?" / "Will the shaded region grow or shrink?" — whose
> answer the demo then confirms or (better) surprises.

Concrete pattern (build once, reuse everywhere — call it `PredictGate`):
a small captioned row of 2–4 pill buttons above the demo. Until one is
tapped, the reveal control (Play / Step / slider) is visually present but
inert, with the caption `FIRST — CALL IT`. After the tap, the demo unlocks
and the outcome line explicitly says "you called it" or "surprise — here's
why." Being wrong must feel like the fun path (word the surprise copy so the
wrong guess gets the *more* interesting explanation).

Where a full gate is too heavy (free-play sliders), use the lighter form:
the intro prose ends with a one-line prediction prompt ("Before you drag:
which knob do you think is useless here?") and the outcome copy resolves it.

### A2. The math on-ramp (payoff → picture → words → symbols)

For every mathematical idea in a sidequest, this exact ladder, in order:

1. **Payoff** — one sentence on what this idea buys, in plot terms ("this is
   the step that moves 'bat' toward the cave"), *before* the idea appears.
2. **Picture** — the idea happens on the persistent visual with no digits:
   arrows aligning, bars filling, a region shading. Motion explains.
3. **Words** — the operation described in kitchen English: "multiply match
   by message, add them up."
4. **Symbols — optional and skippable.** A collapsed disclosure, styled
   consistently across all quests: a ghost-button row labeled
   `SHOW ME THE ACTUAL MATH ·  optional`. Inside: the real notation, the real
   arithmetic with our toy numbers, and the HonestNote. The main flow must
   read complete *without ever opening one*. This is the interactive
   equivalent of 3b1b's "the next lesson goes through the same ideas in
   terms of the underlying calculus" — the rigor track exists, but it is a
   door, not a hallway.

Corollary: **notation never appears in intro prose for a slide whose demo
hasn't run yet.** (Current violation everywhere: `QKᵀ/√d` appears in the
score-matrix slide's intro, before a single cell is filled.)

### A3. The number diet

Our audience reads a wall of decimals as a threat. Rules:

- **Max ~6 distinct meaningful numbers visible at once** in the main flow.
  A 4×4 grid of decimals (16 numbers) is over budget; a 4×4 grid of
  *dot sizes or heat*, with one tapped cell showing its number, is fine.
- **Vectors are arrows or bars first, digit-lists only inside the optional
  math disclosure.** 3b1b never shows `[0.1, 1.1, 0.2, 0.8]` as a primary
  representation; it shows a direction. Neither should we.
- **Two decimal places max on screen; prefer one; prefer zero** ("about
  two-thirds"). Full precision lives in disclosures and HonestNotes.
- **One quantitative wow-stat per quest**, at the zoom-out slide (the
  "multiply by 96" move). Wow-stats are theater, not math — round hard.

### A4. Reassurance beats (three per quest, placed, not sprinkled)

1. **At the first symbol** (usually the first math disclosure): a standing
   line, verbatim-reusable across quests: *"Everything below this point is
   optional. If you skip every one of these panels, you still get the whole
   idea — they exist for the day you're curious."*
2. **At the scariest slide** (each spec below names it): acknowledge the
   fear in the 3b1b register — name the impossibility, then shrink the
   requirement. Model: "beyond the scope of our imaginations… all that
   matters is that a way exists."
3. **At the close**: the payoff slide states what the learner can now *say*,
   and explicitly blesses stopping: the 3b1b move "if you were to stop here,
   you would go with an understanding of the essence."

Tone guard: reassurance in this course is dry, adult, and specific — never
"don't worry, it's easy!" (it isn't, and they know it). We reassure by
*scoping* ("you need exactly one thing from this slide"), not by cheerleading.

### A5. The slide skeleton (8–12 slides)

| # | Beat | What happens |
|---|------|--------------|
| 0 | **Hook** | The felt problem, concrete, ideally *playable this slide*. Never "this sidequest covers…". Logistics line ("own tab, ~12 min") stays but moves below the hook. |
| 1 | **Sharpen** | The problem restated as one question the learner now owns. Introduce the persistent visual in its simplest state. |
| 2–3 | **First mechanism** | One idea, on the visual, behind a Predict Gate. Zero symbols. |
| 4–6 | **Build** | One new capability of the same visual per slide. Each slide: payoff line → predict → act → words → optional symbols. |
| 7 | **Name it** | Real jargon awarded *after* the experience (house convention already), plus the "you own this word" framing (SqAttention's mask slide does this well — keep that register). |
| 8 | **Zoom out** | The toy → the real model. One wow-stat. Retire the visual explicitly if scale outgrows it (the 3b1b "I'm still showing the 2-D picture because 13,002 dimensions are a little hard to wrap your mind around" move). |
| 9 | **Payoff** | "You can now say, in your own words:" + the 2–4 learning-goal sentences + what we deliberately did not cover + blessing to stop. |

House invariants unchanged: `({ accent, slide })` signature, `slideCount`
exact, HonestNotes non-negotiable, real in-browser math, no fake AI output,
design tokens from `theme.js` (see `.claude/skills/course-design/SKILL.md`).
The HonestNote's *placement* changes: it moves inside or directly after the
optional math disclosure when its content is about the math; it stays in the
main flow when its content is about the simplification of the *story*.

---

## B. Per-sidequest redesign specs

Accent, slugs, registry mechanics per `src/course/data/sidequests.js` and
`docs/COURSE-14PLUS.md`. Each spec: goals → opening question → visual →
minimal math (and refused math) → predict moments → slide outline → salvage.

---

### B1. Inside Attention (`attention`, linked from Ch9) — RESTRUCTURE

**(1) Learner can afterward say:**
"Every word carries a question (its query), a name-tag (its key), and a
message (its value). Words whose name-tags match my question get a bigger
share of my attention — and the shares are a budget that always sums to 1.
My word's new meaning is everyone's messages blended by that budget, which is
how 'bat' near 'cave' becomes a different bat. The model can't cheat by
looking ahead, because future words' scores are deleted before the budget is
split."

**(2) Opening question:** Show Ch9's sentence on a small 2-D *meaning map*:
"bat" sits exactly between a ⚾ corner and a 🦇 corner. Press Play: the dot
slides toward the animal corner. **"You just watched 'bat' change its mind.
What, mechanically, pushed it?"** (This is 3b1b's "mole" opening plus our
act-first advantage — the payoff is shown *before* the mechanism, so the
whole quest is an explanation of something already witnessed.)

**(3) Persistent visual — the meaning map + arrows.** One 2-D map,
axes unlabeled ("two of thousands of directions"). Evolution:
- Slide 1: "bat" as an ambiguous dot on the map.
- Slides 2–3: queries and keys as **arrows on a shared compass** — score is
  visibly "how aligned are these two arrows" (angle → dot size). No digits.
- Slide 4: all pairs at once — the score grid rendered as **dot sizes**
  (3b1b: "a grid of dots, where bigger dots correspond to larger dot
  products"), not decimals.
- Slide 5: softmax turns one row of dots into **budget bars** summing to 1.
- Slide 6: the mask greys out the future half of the grid.
- Slide 7: values as small **arrows added to "bat"** — the dot on the meaning
  map physically moves, closing the loop with slide 0.
- Slide 8: the map is retired explicitly: "real models do this in thousands
  of directions at once, in 96 rooms at a time — the map can't follow, but
  the arithmetic doesn't change."

**(4) Only the math that makes it real:**
- **Dot product as alignment** — indispensable: it *is* the scoring
  mechanism, and it's the one operation reused by every other quest. Taught
  as arrows first; the multiply-and-add arithmetic lives in the disclosure.
- **Softmax as exponentiate-then-share** — indispensable: it's why attention
  is a budget and it's Ch11's temperature dial again. The two-stage bar demo
  we built is the right teaching object; keep it.
- **Weighted sum of values** — indispensable: it's the payoff (the dot
  moves). Shown as arrow-addition; digits in disclosure.
- **The −∞ mask** — indispensable: it's the causal promise of the whole
  course made mechanical, and e^(−∞)=0 is one line.
- **REFUSED in the main flow:** the ÷√d scaling (disclosure/HonestNote only
  — it's an engineering detail, not an idea); W_Q/W_K/W_V as matrices (name
  them once in the "name it" slide's disclosure: "the question-writer, the
  name-tag-writer, the message-writer — three learned tables"); raw 4-dim
  vector literals as primary display; multi-head arithmetic beyond "×96";
  W_O, residual streams, layernorm (HonestNote, as today); positional
  encodings entirely.

**(5) Predict-first moments:**
- Slide 2 gate: "bat is asking 'am I near animal clues?' Which word's
  name-tag will match best — The, flew, or cave?" *Then* the arrows swing.
- Slide 4 gate: before the grid fills, "which ROW will be the most bored
  (spread thin, no strong match)?" (Answer: "The" — a genuine insight about
  function words.)
- Slide 5 (light): "before you drag the gap slider: if the scores move
  further apart, does the budget get more equal or more winner-take-all?"
- Slide 6 gate: "when we delete bat's view of 'flew' and 'cave', where does
  its budget go — vanish, or get re-split?" (Re-split; sums still 1.)

**(6) Revised slide outline (10 slides):**
0. Hook: the meaning map, "bat" slides on Play. "What pushed it?"
1. Sharpen: a vector "has no eyes" — the three needs (ask / answer / share).
   *Keep this slide nearly as-is; it's the best slide in the built version.*
2. Queries & keys as arrows; Predict Gate on best match; alignment = score.
   Optional math: the multiply-and-add, with today's toy numbers.
3. Deliberate small beat: score is a *number per pair* — tap any pair of
   arrows, see one dot grow/shrink. (Splits current slide 2's overload.)
4. The whole grid at once, as dot sizes; Predict Gate on the boring row;
   tap-a-cell shows its one number. Optional math: "all sixteen in one
   multiplication" + ÷√d footnote.
5. Softmax: dots → budget bars in two stages (keep the built staging), with
   the light predict prompt on the gap slider. Optional math: e^x table.
6. The mask ("a confession" — keep the register); Predict Gate on where the
   budget goes; the "you now own 'causal' and 'decoder-only'" card stays.
7. Values: budget × messages; arrows fold into "bat"; **the map dot moves —
   same animation as slide 0, now legible.** Reassurance beat #2 here (this
   is the densest slide): "if you stop at 'a budget-weighted blend of
   messages,' you have the essence."
8. Zoom out: ×96 heads ×96 layers; retire the map; ONE wow-stat ("roughly a
   third of everything GPT-3 knows how to do is this move" — the 4d²/12d²
   arithmetic moves into the disclosure).
9. Payoff: the four own-words sentences; refused topics named ("we skipped
   how the question-writers are learned — that's the How Networks Learn
   quest"); blessing to stop.

**(7) Worth keeping from the built version:** slide 1 (the three needs)
almost verbatim; the softmax two-stage bar demo and gap slider; the mask
"confession" slide's structure, jargon-award card, and HonestNote; the values
blend animation (re-skinned to arrows/map); all the computed-live machinery
and toy Q/K/V numbers (they migrate into the disclosures); every HonestNote's
*content*. What goes: decimals as the primary surface, notation in intro
prose, the cell-by-cell decimal fill, vectors as bracketed digit lists.

---

### B2. What Is a Neural Network? (`neural-network`, linked from Ch10) — REWRITE (salvaging two demos)

**(1) Learner can afterward say:**
"A neuron is just a weighted vote: multiply each piece of evidence by how
much you trust it, add it up. Votes stacked on votes collapse into one vote —
so networks put a kink (ReLU: negatives become zero) after each neuron, and
kinks are what let straight lines build curves and corners. A team of kinked
votes can fence off basically any shape, and 'training' means finding the
trust-numbers that place the fences. The whole network is one big adjustable
function — there's no rulebook inside, just knobs."

**(2) Opening question:** A 2-D map with dots: bats (accent) and drones
(grey), the bats clustered in a blob. **"Here's the whole job: write
arithmetic that draws a line around the bats. Try it — drag this one
straight line."** The learner drags/rotates a single line and discovers it
can't be done: the blob needs a *pen*, not a line. That failure is the itch
the entire quest scratches. (This is 3b1b's "easy for your brain, almost
impossible to describe how" tension, made playable.)

**(3) Persistent visual — the map and the fences.** The bats-vs-drones map
appears on *every* mechanism slide (the built version invents it only at
slide 5 — its best asset, arriving last; the rewrite makes it the spine):
- Slide 1: one straight line fails.
- Slide 2: a neuron = one fence; weights rotate it, bias slides it (the
  built knob game, re-skinned onto the map).
- Slide 3: two fences feeding a third neuron… still one straight fence
  (the linear-collapse theorem *seen*, not algebra'd).
- Slide 4: ReLU: the fence bends. One kink, visible on the map.
- Slide 5: four bent fences make the pen (the built canvas demo, kept).
- Slide 6: retire the map: "real inputs have thousands of dimensions; the
  fences become folds you can't draw — but it's this, wider."

**(4) Only the math that makes it real:**
- **Weighted sum + bias** — indispensable: it's the atom, and it's Ch4's
  dials at their smallest. Taught by dragging (built slide 1 is right);
  the `z = w·x + b` line goes in the disclosure.
- **Linear stacking collapses** — indispensable: it's the *reason ReLU
  exists*; without it the kink is arbitrary trivia. But taught visually
  (two fences → still one straight fence), with `3(2x+1)−2 = 6x+1` and the
  matrix generalization in the disclosure.
- **ReLU** — indispensable and mercifully tiny: `negatives → 0`. One line,
  main flow (it's the least scary formula in the course).
- **"Bends add up" — qualitative only.** The claim that more units trace
  finer shapes, shown by toggling pen fences on/off.
- **REFUSED:** the x² approximation demo *as a primary teaching object*
  (mathematician's motivation — the learner has no stake in x²; its
  error-rate arithmetic, "worst miss 0.0156," is peak number-overload). The
  universal approximation theorem gets ONE reassuring sentence + HonestNote
  in the zoom-out ("a wide-enough single layer can in principle match any
  reasonable shape — but the theorem hands you no way to find the weights"),
  not its own slide. Also refused: sigmoid and its history, matrix–vector
  notation before the "name it" slide, softmax outputs, any decimals over
  2 places.

**(5) Predict-first moments:**
- Slide 0 *is* a predict moment (try the line, fail — commitment by doing).
- Slide 2 gate: "both creatures have wings. Before you touch anything:
  which knob is useless?" (The built version explains this *after*; move
  it to a gate — it's the quest's best aha.)
- Slide 3 gate: "two fences feed a third neuron. Will the result be a bent
  fence or a straight one?" (Everyone guesses bent; the collapse lands as
  a genuine surprise instead of an algebra lecture.)
- Slide 5 gate: "if we switch off the NE fence, which dots go wrong?" —
  *then* toggle.

**(6) Revised slide outline (10 slides):**
0. Hook: the map; drag one line; it can't pen the bats. "~12 min" line below.
1. Sharpen: "so we need arithmetic that bends. Let's earn it from one
   neuron up." Introduce the creature features (fur/wings/gears) as the
   map's coordinates.
2. One neuron = one fence: the knob game on the map, Predict Gate on the
   useless knob. Optional math: `z = w·x + b` with the toy numbers.
3. Stack two → Predict Gate → still straight. The collapse. Optional math:
   the algebra + matrix form + "it's a theorem."
4. The kink: ReLU bends the fence. Main-flow formula (the one allowed).
   Reassurance beat #1 (first disclosure appeared last slide).
5. Four bent fences make a pen — the built canvas demo, with the toggle
   Predict Gate and the "the shape only exists in the team" payoff line
   (keep that copy; it's excellent).
6. Name it: neuron, layer, parameter, and the count — "your pen is 17
   knobs." (Built slide 6's content, tightened.) Optional math: the layer
   as one matrix–vector multiply (built slide 4's LayerSlide content
   compresses into this disclosure).
7. Zoom out A: "it's just a function" — no rulebook, no bat diagram inside,
   only knob settings. Universal-approximation gets its one sentence +
   HonestNote here. Scary-slide reassurance: "thousands of dimensions —
   you can't draw it, nobody can; the mechanism is exactly your pen."
8. Zoom out B: the transformer connection — "you've already met one: the
   MLP block, two-thirds of every layer" (built slide 7, with the 8d²
   arithmetic moved to a disclosure; keep the 2/3 wow-stat).
9. Payoff: own-words sentences; "we refused: how the knobs get found —
   that's How Networks Learn"; blessing to stop.

**(7) Worth keeping:** the slide-1 knob game (mechanics intact, gains a
gate and the map skin); the slide-5 pen canvas *unchanged* (it already obeys
every rule in this doc — it just needs to arrive as the destination of a
spine instead of a surprise); the "knowledge is in the weights, spread out,
nowhere in particular" copy; slide 6/7's knob-count framing; all HonestNote
content. What goes: LinearCollapseSlide's algebra-first presentation
(concept survives, presentation dies), the x²/ReLU-approximation slide, the
standalone universal-approximation slide, LayerSlide as a main-flow slide.

---

### B3. How Networks Learn (`gradient-descent`, linked from Ch4) — RESTRUCTURE (light)

This is the closest of the three to the bar: it has a running example
(Ch4's bicycle pun), question-ordered slides, an evolving landscape
(1 knob → 2 knobs → "billions"), a break-it-yourself moment, and an honest
bridge to backprop. Its failures are local: notation lands too early, the
loss slide is a decimal wall, and only one interaction asks for a prediction.

**(1) Learner can afterward say:**
"Learning is nothing mystical: turn the knobs to shrink one number — the
loss — that measures how wrong the model is on its training snippets. The
model never sees the whole loss landscape; it only feels the slope under its
feet, and the entire algorithm is 'take a small step downhill, repeat.'
Too big a step overshoots the valley and blows up; too small crawls. With
billions of knobs it's the same two lines of arithmetic, run wider."

**(2) Opening question:** Keep the bicycle. But open by *doing*: slide 0
shows the four snippets and a single knob the learner drags, with only a
red/green "wrongness" bar (no numbers): **"This model has one dial. Make it
less wrong. …Now: how would a machine do what your hand just did — with
175 billion dials and no eyes?"** The quest is then the answer to something
they already did.

**(3) Persistent visual — the foggy valley.** Already present; sharpen it:
- The 1-D loss curve is *hidden by fog* by default from the landscape slide
  onward — the learner sees only the ball and the ground's tilt under it.
  A `LIFT THE FOG` ghost toggle reveals the full curve (and the toggle
  itself teaches the key point: *training never gets this view*; the built
  version says this in prose — make it a control).
- Evolution: slider-sampled wrongness → the curve (fogged) → tilt under
  your feet → the stepping ball with trail → the 2-D contour map (fogged
  likewise) → "billions of knobs: the fog is total, the rule identical."

**(4) Only the math that makes it real:**
- **Loss as one wrongness number** — indispensable: it's the objective.
  Main flow: bars ("confidently wrong costs a fortune") and the *shape* of
  the penalty. The `−ln(p)` formula and the `e^w/(e^w+e⁰)` softmax move
  ENTIRELY into disclosures — currently they appear in slide 1–2 intro
  prose, which is our single worst notation-before-intuition violation.
  (3b1b's gradient-descent lesson uses an unexplained sum-of-squares and
  never derives it; the *existence* of a wrongness score is the idea.)
- **Slope by nudging** — indispensable: it's the eyes-free trick, and the
  built NudgeSlide teaches it honestly. Keep; gate it.
- **The update rule `new w = old w − step × slope`** — indispensable: it is
  the entire algorithm and it's already framed that way ("the two-line
  algorithm"). Main flow, as-is.
- **Gradient = the list of slopes, one per knob** — indispensable for the
  2-D slide and the backprop bridge. Words + the contour map; components
  in the disclosure.
- **REFUSED:** cross-entropy derivation or naming in main flow (name in
  HonestNote as today); derivative-as-limit formalism (the "finite
  difference" HonestNote survives, in the disclosure); the analytic
  `slope = p − 0.75` (disclosure); Adam/momentum/schedules (HonestNote
  one-liner, as today); the stable-softmax internals of the 2-D demo.

**(5) Predict-first moments:**
- Slide 2 gate (loss): "one snippet wants the literal answer. If you crank
  the knob all the way pun-ward, what happens to total wrongness — keeps
  falling, or comes back up?" *Then* the drag confirms the tug-of-war.
- Slide 4 gate (nudge): "you're standing here in the fog. Call it: is
  downhill to the left or the right?" — then the nudge measurement answers.
  (Currently the demo answers a question the learner was never asked.)
- Slide 5 (step size) — already the course's best break-it-yourself moment;
  add the light prompt: "before you crank it past 9: what do you think a
  too-big step does — settles slower, or never settles?"
- Slide 6 gate (2-D): "the arrow shows straight-downhill. Will the path run
  along the contour bands or cut across them?"

**(6) Revised slide outline (10 slides):**
0. Hook: drag the dial, shrink the wrongness bar, no numbers. The question.
1. Sharpen: the four snippets revealed as the *reason* for the wrongness
   bar (three pull pun-ward, one literal). The knob named `w`. Optional
   math: how scores become probabilities (the softmax disclosure) —
   reassurance beat #1 attached here.
2. Loss properly: per-snippet penalty bars + the average; Predict Gate on
   the tug-of-war; the balance lands at "the data pulled the knob to the
   honest answer" (keep that payoff copy). Optional math: −ln(p), the
   cross-entropy HonestNote.
3. The landscape, fog ON by default; `LIFT THE FOG` toggle; "how do you
   find the bottom of a valley you can't see?" (keep — it's already the
   right question).
4. The nudge, gated ("call it: left or right?"). Scary-slide reassurance
   here: "calculus has a word for this ratio; you don't need the word —
   you just computed the thing itself."
5. The update rule + step size, with the break-it prompt. Keep everything.
6. Two knobs, the contour map (fog + toggle), gated on the path-vs-contours
   prediction. Gradient = "one slope per knob, stapled into a list."
7. Zoom out: sixteen quadrillion nudges (keep — perfect wow-stat slide,
   already one number in a card).
8. The bridge: 520,000 years of nudging vs one backward pass — "the trick
   is the Backpropagation sidequest." (Keep; it now has a real target.)
9. Payoff: own-words sentences (the built recap is already close); refused
   topics; blessing to stop.

**(7) Worth keeping:** the arc itself (it's correct); the bicycle model and
all its live math; LossCurve/trail/tangent machinery; the step-size
break-it demo verbatim; the 2-D contour demo (plus fog); ScaleSlide and
BridgeSlide near-verbatim; every HonestNote. The changes are: an act-first
hook, fog-by-default, four gates, and pushing every formula that currently
sits in intro prose (`e^w/(e^w+e⁰)`, `−ln`) down into disclosures.

---

### B4. The MLP — where the facts live (`mlp`, to be linked from Ch10) — NEW BUILD

Modeled on 3b1b's "How might LLMs store facts" (`/lessons/mlp`), which is a
masterclass in earning matrix multiplication: "a nice way to think about
matrix multiplication is to imagine each row of that matrix as being its own
vector" (rows = questions), then "here the columns have the same dimension as
the embedding space, so we can think of the columns as directions" (columns =
stamps). Prereq note in the launch link: best after the attention sidequest
(reuses the arrow/alignment tool) — mirror 3b1b's own dependency.

**(1) Learner can afterward say:**
"Two-thirds of a transformer is stacks of little two-layer networks that
work on each word's vector separately. The first layer asks the vector a
huge batch of yes/no questions at once — each question is 'do you point
this way?' The kink throws away all the no's, and the second layer adds a
prepared fact back into the vector for every yes. That's the field's best
guess for where facts like 'bats sleep upside down' live — smeared across
many questions and stamps, not filed in any single neuron."

**(2) Opening question:** Live API moment (real, per house rules — Ch-style
generate call): the model completes **"Bats sleep upside ___" → "down."**
Then: **"That fact is not in the attention you've seen — attention only
moves information *between* words. Somewhere in the machine, 'bat-facts'
are stored. Where do you keep a fact in a pile of numbers?"** (Direct
adaptation of "Michael Jordan plays the sport of ___"; we swap in the
course's running bat, and an HonestNote credits the MJ example and flags
that our detector story is illustrative — 3b1b's own caveat: "we're showing
one behavior that the relevant matrix operations could plausibly implement.")

**(3) Persistent visual — the corridor of detectors and stamps.** The
word's vector is a traveler (an arrow — same arrow language as the attention
quest) walking through a corridor:
- Wall of **detectors** (first layer): each detector is itself an arrow;
  it lights up if the traveler points its way (alignment again — the third
  quest to reuse the dot product, by design).
- A **gate** (ReLU): dim detectors are switched fully off.
- Wall of **stamps** (second layer): every lit detector presses its stamp —
  a small arrow added onto the traveler.
- Evolution: one detector → the AND behavior (needs "bat" AND "sleeping" to
  light) → gate → stamp → thousands of detector/stamp pairs blurring past →
  the corridor repeated 96 times.

**(4) Only the math that makes it real:**
- **Row = a question (dot product with the traveler)** — indispensable:
  this *is* matrix multiplication made humane, and it's the lesson's core
  reframe. Arrows in main flow; the row-of-numbers view in a disclosure.
- **ReLU as a yes/no gate** — indispensable: it's why the detector is an
  AND gate and not a smear ("what we really want is a simple yes/no" —
  quote the need, then the one-line rule, already earned in the NN quest).
- **Column = a stamp (a direction added on)** — indispensable: it's where
  the fact physically is.
- **The expand→gate→compress shape (d → 4d → d)** — indispensable: it's
  Ch10's "expand, ask everything, compress" made literal, and the 2/3-of-
  the-model wow-stat depends on it. Qualitative in main flow; 8d² in the
  disclosure.
- **REFUSED:** superposition mathematics (the near-perpendicular-vectors
  count appears ONLY as the closing wonder-stat — "a space this size can
  hold tens of billions of almost-independent directions" — with an
  HonestNote, no Johnson–Lindenstrauss); bias terms; GELU-vs-ReLU beyond an
  HonestNote; any claim that a specific real neuron holds a specific fact
  (HonestNote: "individual neurons very rarely represent a single clean
  feature" — carry 3b1b's honesty about its own idealization); training of
  these weights (points back to How Networks Learn).

**(5) Predict-first moments:**
- Slide 2 gate: a detector tuned to "bat-the-animal." Three travelers
  approach: baseball-bat, animal-bat, drone. "Which light it up?"
- Slide 3 gate: "this detector fires a *little* for 'Michael Phelps' when
  it's looking for 'Michael Jordan'-style overlap. What do we wish it did?"
  — options: fire less / fire zero / fire negative → ReLU revealed as the
  wish granted.
- Slide 4 gate: "the 'upside-down' stamp got pressed. Where does the
  traveler's arrow end up — closer to 'sleep-facts' corner or unchanged?"
- Slide 6 (light): "attention moved info between words. The corridor
  touches each word alone. So which of the two can know that 'the mole on
  line one' and 'the mole on line nine' are different? Call it before the
  reveal."

**(6) Slide outline (10 slides):**
0. Hook: live completion "Bats sleep upside ___"; the question "where do
   you keep a fact in a pile of numbers?"
1. Sharpen: what attention *can't* do (it only shuttles between words);
   facts must live in the per-word machinery. Introduce the corridor,
   empty.
2. One detector: alignment lights it (arrow reuse, Predict Gate). Optional
   math: the row · vector arithmetic; reassurance beat #1.
3. The gate: the Phelps problem → ReLU as "keep only real yeses." Gate as
   above.
4. The stamp: lit detector adds its direction; the traveler's arrow
   visibly moves toward "sleeps-upside-down." Optional math: column view.
5. Now all at once: expand (thousands of questions) → gate → compress
   (stamps summed). The corridor animates a full pass. Scary-slide
   reassurance: "nobody, including the people who built it, can read most
   real detectors — the clean bat-detector is a story about what the
   arithmetic *can* do" (3b1b's exact caveat, carried honestly).
6. Attention vs MLP: who does what (light gate). "Attention moves it;
   the MLP knows things about it."
7. Name it: MLP / feed-forward block; d→4d→d; "you own 'feed-forward'."
   Optional math: 8d² and the 2/3 arithmetic.
8. Zoom out: 2/3 of GPT-3's weights are corridors; closing wonder-stat on
   how many directions fit (superposition teased in one sentence +
   HonestNote: "why models seem to scale so well").
9. Payoff: own-words sentences; refused topics ("how the detectors get
   tuned = How Networks Learn; how researchers try to read them =
   interpretability, Ch10's caveat"); blessing to stop.

**(7) From existing code worth reusing:** the arrow/alignment component
built for the attention redesign (build it shared); SqNeuralNetwork's ReLU
one-liner framing and its slide-7 MLP parameter arithmetic (moves here into
slide 7's disclosure — and then *out* of the NN quest's main flow, ending
the current duplication of the 8d²/12d² count in two quests); the live-API
demo pattern from chapters (`../lib/api.js` wrappers, `BlockedNote`).

---

### B5. Backpropagation (`backprop`, to be linked from Ch4's sidequest bridge and/or the gradient-descent quest's slide 8) — NEW BUILD

Modeled on 3b1b's "What is backpropagation really doing?", whose defining
move we adopt wholesale: **"let's begin with a complete disregard for
notation"** — and, unlike 3b1b, we never pay the notation back (their
calculus sequel is refused; our HonestNote points rigor-hungry learners to
it by name). Launch prereq: the gradient-descent quest (its slide 8 mints
the debt this quest repays).

**(1) Learner can afterward say:**
"Training needs a slope for every one of billions of knobs, and measuring
them one at a time would take geologic time. Backprop gets all of them,
exactly, for about the cost of one extra backward sweep: the output writes
a wish list ('this should have been higher, those lower'), and each layer
translates the wishes into blame for its own knobs and passes the rest of
the blame upstream. The biggest nudges land on weights between neurons that
were active and neurons we wished were more active. Every training example
files its own wish list; the average of all the wish lists is the step."

**(2) Opening question:** Reprise the gradient quest's cliffhanger as a
live counter: "Nudging GPT-3's knobs one at a time: ≈520,000 years. Real
training does it in roughly one extra pass. **The slopes are exact, all 175
billion of them, and nothing is nudged. What's the trick?**"

**(3) Persistent visual — the wish list flowing backward.** One tiny
network drawn large — 2 inputs → 2 hidden → 1 output — trained on ONE
example the learner has met: the bicycle-pun snippet (continuity with the
gradient quest; the "2" of our course). Evolution:
- Slide 2: the output neuron is wrong; it writes its wish ("I should have
  been higher") as an upward arrow on itself.
- Slide 3: the wish splits three ways — the output can get its wish by
  (a) turning up weights from *active* hidden neurons, (b) turning up its
  bias, (c) wishing the hidden neurons themselves were different. Weights
  drawn as pipes that thicken/thin.
- Slide 4: the (c) wishes *are* new wish lists, one per hidden neuron —
  the wave rolls back one layer. Competing wishes on one neuron visibly
  sum (green up-arrows and red down-arrows piling on one node).
- Slide 5: a second training example (the literal snippet) files an
  *opposing* wish list; the two lists average.
- Slide 6: the wave shown as ONE sweep back through a deeper stack —
  work shared, nothing repeated.

**(4) Only the math that makes it real:**
- **Sensitivity — "some knobs matter 30× more than others"** —
  indispensable: it's what a gradient *is*, taught as bang-for-your-buck
  ratios (3b1b's 3.2-vs-0.1 move), no derivative notation.
- **The three ways to move a neuron** (its input weights, its bias, its
  upstream activations) — indispensable: this IS the recursion, in words.
- **"Fire together, wire together"** — indispensable: it's the one memorable
  law of which weights change most, and it's honestly derivable from the
  picture (weight nudge ∝ how active the source was).
- **Averaging wish lists over examples** — indispensable: without it,
  "the network would be incentivized to classify everything as a 2" —
  our version: "to answer every prompt with the pun."
- **Mini-batches / stochastic** — one slide, as a speed hack with 3b1b's
  drunk-walk image ("a drunk man stumbling quickly downhill beats a
  careful man calculating each step").
- **REFUSED, absolutely:** the chain rule *by name or by symbol* (the
  HonestNote may say "calculus's chain rule, run backward, is the formal
  name for the wish-translation — 3Blue1Brown's backpropagation-calculus
  lesson is the door if you want it"); ∂C/∂w and all index chasing; the
  four backprop equations; computational graphs; why the backward pass
  costs ~2 forward passes (asserted in HonestNote, not derived).
- All of this quest's arithmetic can still be computed live (the tiny
  network is real; wishes are real gradient components) — the *display* is
  arrows and pipe-widths, with the numbers in disclosures. Honest and
  gentle are not in tension here.

**(5) Predict-first moments:**
- Slide 2 gate: "the output should have been higher. Two incoming pipes:
  one from a neuron that was firing hard, one from a neuron that was
  nearly silent. Which pipe is worth more to widen?" (This gate *teaches*
  fire-together-wire-together before naming it.)
- Slide 4 gate: "hidden neuron H gets a 'be higher' wish from the pun
  output and a 'be lower' wish from another path. What happens — pick one
  wish, alternate, or add them up?"
- Slide 5 gate: "the literal snippet files the opposite wish list. If we
  only ever listened to pun snippets, what monster do we train?" (multiple
  choice; the "answers everything with the pun" option pays off Ch4.)
- Slide 6 (light): "one backward sweep or one sweep per knob? Call it,
  then watch the sweep."

**(6) Slide outline (10 slides):**
0. Hook: the 520,000-years counter; "what's the trick?"
1. Sharpen: what we're owed — a slope per knob, exact, cheap. Meet the
   tiny network and the one snippet. Reassurance beat #1, front-loaded and
   explicit (this is the quest math-phobes fear most): "there is calculus
   underneath this; you will not see any of it, and you won't be missing
   the idea — the inventors themselves reason in the pictures you're about
   to use."
2. Sensitivity: wiggle two knobs (gated as above), see loss respond 30× vs
   1×. "The gradient is just this ranking, written down for every knob."
3. The wish list: three ways to grant the output's wish; pipes thicken.
   Fire-together-wire-together *named* here, after the gate taught it.
4. The wave rolls back: hidden neurons' wishes; competing wishes add
   (gated). Scary-slide reassurance: "this is the whole recursion — there
   is no other step. Deeper networks just repeat it."
5. Many examples: opposing wish lists average (gated). The averaged list
   IS the gradient the gradient-descent quest stepped along — the two
   quests click together on this slide, explicitly.
6. One sweep: the backward wave animation over a deeper stack; the cost
   claim ("about one extra pass" — HonestNote for the ~2× figure).
7. The speed hack: mini-batches, the drunk-walk framing, "stochastic"
   awarded as jargon.
8. Zoom out: the full loop assembled — forward pass, wish lists backward,
   average, step, repeat 93,750 times (numbers reused from the gradient
   quest's ScaleSlide — one wow-stat, already earned there).
9. Payoff: own-words sentences; the refusal stated proudly ("we refused
   the chain rule on purpose; here's the named door if you ever want it");
   blessing to stop.

**(7) From existing code worth reusing:** SqGradientDescent's BridgeSlide
copy (slide 0 is its continuation — keep the 175,000,000,001-runs table);
its ScaleSlide numbers for slide 8; the pipe/arrow visual components to be
shared with the NN quest's fence map where feasible; `runToken` scripted-
animation pattern for the backward wave.

---

## C. Migration notes

| Quest | Verdict | Why | Rough scope |
|---|---|---|---|
| **How Networks Learn** (`SqGradientDescent.jsx`) | **Restructure — light** | The arc already matches 3b1b's (felt problem → landscape → blind → nudge → rule → scale → honest bridge). Fixes are local: act-first hook slide, fog-by-default + LIFT THE FOG toggle, 4 Predict Gates, and demoting `e^w/(e^w+e⁰)` and `−ln(p)` from intro prose into optional disclosures. No demo is discarded. | ~1 day incl. building the shared `PredictGate` + disclosure primitives here first (this quest is the cheapest proving ground). Slide count 10 (was 10). |
| **Inside Attention** (`SqAttention.jsx`) | **Restructure — medium** | The skeleton is right (three-needs slide, softmax staging, mask confession, values payoff, heads zoom-out) but the *surface* is the violation: vectors as digit lists, 16-decimal grids, notation in intro prose, no persistent picture, zero predictions. Needs the meaning-map + arrow layer over the existing live math, one new hook slide, one slide split (current slide 2), and 4 gates. All toy numbers, softmax demo, and HonestNotes survive underneath. | ~2 days. New shared arrow/alignment component (also needed by MLP quest — build it here). Slide count 10 (was 9). |
| **What Is a Neural Network?** (`SqNeuralNetwork.jsx`) | **Rewrite** (salvaging two demos) | The failure is *ordering*, and ordering is the file's spine: it runs component-order (neuron → collapse → ReLU → layer → network) instead of question-order, its best visual (the pen) arrives last instead of driving from slide 0, the x² slide motivates ReLU with a curve the learner has no stake in, and two late slides (layer-as-matrix, universal approximation) are reference material, not story. Reordering + reskinning every slide onto the map is more work than rebuilding around the map. Salvage intact: the neuron knob game (re-skinned), the pen canvas demo (near-verbatim), the "name it"/parameter-count copy, all HonestNote content. Cut: x² approximation slide, standalone UAT slide, LayerSlide (compresses into a disclosure). | ~2–3 days. Slide count 10 (was 10). Also remove the 8d²/12d² MLP arithmetic from its main flow once the MLP quest exists (single source of truth). |

**Build order recommendation:** gradient-descent (primitives) → attention
(arrow component) → neural-network (rewrite, reuses both) → MLP (new,
reuses arrows + NN concepts) → backprop (new, closes the gradient quest's
open loop). After each: update `slideCount` in `data/sidequests.js`, the
Ch14 quiz if concepts shift, and `docs/COURSE-14PLUS.md`'s shipped list —
per the course-design skill checklist.

**Shared primitives to add to `src/course/ui/` (once, in step 1):**
- `PredictGate` — pill-row commitment that unlocks a demo and threads the
  learner's guess into the outcome copy (`FIRST — CALL IT` caption).
- `MathDoor` (the optional-symbols disclosure) — ghost-button
  `SHOW ME THE ACTUAL MATH · optional`, collapsed by default, houses real
  notation + live arithmetic + math-flavored HonestNotes; carries the
  standing reassurance line on first use per quest.
- `ArrowPair` / alignment visual — two labeled arrows on a shared origin
  with a live alignment readout (dot size), the reusable geometric face of
  the dot product for attention and MLP quests.
