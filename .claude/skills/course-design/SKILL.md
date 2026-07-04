---
name: course-design
description: Design and flow conventions for the 14+ course ("How AI Actually Works") in src/course/. Use when creating or editing course chapters, slides, demos, or quiz questions — covers chapter anatomy, voice, honest footnotes, design tokens, interactive-demo patterns, API flags, and the verify/ship checklist.
---

# Course design — "How AI Actually Works" (src/course/)

The 14+ course is a 3Blue1Brown-style guided tour of how LLMs work. When
extending or editing it, follow these conventions exactly — they are what
makes 14 chapters read as one piece. Full course map: `docs/COURSE-14PLUS.md`.

## Chapter anatomy (the rhythm every chapter follows)

1. **Title slide** — `Kicker` = "Act N · Act Name — Chapter N", serif
   `Heading`, a `Lead` that plants an itch (a question or a wrong-feeling
   claim). Never starts with definitions.
2. **Hook/problem** — make the learner feel the problem before any mechanism.
3. **Explore** — interactive demo(s), learner drives. Real APIs or real
   in-browser math; never fake AI output (canned fallbacks must say so).
4. **Name it** — the concept gets its real technical term only AFTER it's
   been experienced, with an `HonestNote` flagging every simplification.
5. **So what** — connect back to the course's driving mystery ("everything
   is next-token prediction — how?").
6. **Recap** — the `Recap` component: 3-4 numbered takeaway lines, optional
   `footnote`, and a `next` teaser for the following chapter.

Slides per chapter: 6-11. Component signature: `({ accent, slide })` with a
`switch (slide)`. Slides remount on navigation (keyed) — persist cross-slide
state in module-level variables (see Ch1's `lastStory`).

## Voice

- Second person, present tense, confident, witty but never cute. No emoji.
- Lead with the surprising thing; explain after. Questions > announcements.
- Callbacks are load-bearing: new concepts must reference the chapter where
  their ingredients were taught ("the dials from Chapter 4").
- **Honest footnotes are non-negotiable.** Any simplification, illustrative
  number, or cartoon visual gets an `HonestNote` saying exactly what was
  simplified and what the truth is. This is the course's credibility
  contract. Fact-check every technical claim independently — never copy
  claims from the K-8 course, which simplifies more aggressively.
- Facts with sources: prefer publicly documented numbers (Llama 3's 15T
  tokens, GPT-3's 175B/96/12,288) and LABEL them as model-specific.

## Design system (import from `../styles/theme.js`, never hardcode)

- Fonts: `FONTS.display` (Newsreader serif) for headings/story text,
  `FONTS.body` (Inter), `FONTS.mono` (JetBrains Mono) for tokens, numbers,
  vectors, labels. Never Fredoka (that's the K-8 app).
- Color: near-black canvas; ONE accent per act (passed in as `accent` —
  always use the prop, never a literal). `COLORS.correct`/`COLORS.wrong`
  for verdicts. Chrome stays monochrome; the data gets the color.
- Motion: 200-500ms ease-out only, nothing bounces. Motion must explain
  (a bar re-normalizing, a token splitting), never decorate. Reveal with
  `className="reveal"` + `animationDelay` for staggered lists.
- Primitives in `../ui/shared.jsx`: `Slide` (wide for demos), `Kicker`,
  `Heading`, `Lead`, `Prose`, `Card`, `Button`/`GhostButton`, `Mono`,
  `HonestNote`, `Recap`, `CountUp`, `BlockedNote`. Extend these before
  inventing new ones.
- Small-caps mono labels (`fontSize` 11-13, `COLORS.faint`) caption every
  demo region: `THE PROMPT — …`, `MODEL`, `VERIFIER`, `ACT`, `OBSERVE`.

## Interactive demo patterns

- **Live API demo**: input + presets-as-pills + `Button` → result in a
  `Card`. Always handle `{blocked}` (render `BlockedNote`) and errors
  ("Couldn't reach the model: …"). Use wrappers in `../lib/api.js` — they
  send the course's flags (`style:"plain"`, `relaxed:true`,
  `mode:"completion"`) automatically. NEVER call fetch directly.
- **Scripted animation**: deterministic (seeded hashes, no Math.random for
  replayable visuals), phase state driven by timeouts with a cancellation
  ref (`runToken.current`), and a Replay button.
- **A/B teaching moment**: the strongest pattern in the course — same input,
  one variable flipped (tools on/off, temp 0.1/1.4, with/without context).
  Caption both outcomes; variance across runs is honest, frame it.
- **Real math beats claimed math**: compute in the browser when possible
  (pairwise angles, cross-entropy loss) and say "computed live, right now".
- Raw-token work (appending/assembling tokens) MUST use predict
  `mode:"completion"` — chat mode's token boundaries are ambiguous.

## Wiring a chapter (checklist)

1. `src/course/chapters/ChNN<Name>.jsx` — the component.
2. Register in `src/course/data/chapters.js`: import + `Component`,
   and keep `slideCount` EXACTLY equal to the number of slide cases
   (nav dots, progress, and deep links all derive from it). Update `minutes`.
3. If concepts changed, update: the Ch14 `QUIZ` (every option needs its own
   `why` explanation — shown for right AND wrong picks), affected `Recap`
   lines, and any cross-chapter callbacks/teasers.
4. Layer language: say "first/final layers", never "bottom/top".

## Verify & ship

1. `npx eslint src/course` and `npm run build` pass.
2. `npx playwright test e2e/tests/course.spec.ts` (5 smoke tests) passes.
3. Walk the new slides in a browser at
   `http://localhost:5173/iknowgenai/course#<slug>/<n>` (APIs 404 locally —
   check the graceful-degradation path renders).
4. Ship: commit → push branch → `gh pr create` → `gh pr merge` (never commit
   to main directly). Vercel deploys main to production automatically.
5. **After deploy, curl any new/changed prompts against production** —
   moderation false-positives only reproduce live. Pattern:
   `curl -s -X POST https://iknowgenai.seibtribe.us/api/generate -H "Content-Type: application/json" -d '{"prompt":"…","style":"plain","maxTokens":10}'`
   and check for `{"blocked":true}`. Grep the deployed bundle for a new
   string to confirm the frontend shipped.
