# CLAUDE.md

This repo hosts **two courses in one app**:

1. **K-8 classroom course** ("How AI Thinks") — at the root URL. Grade bands
   K-2/3-5/7-8, teacher notes, playful neon design, cat mascot. Lives in
   `src/App.jsx` + `src/components/Section*.jsx` + `src/data/`.
2. **14+ course** ("How AI Actually Works") — at `/course`. Single track,
   14 chapters, refined design, final quiz. Lives entirely in `src/course/`.
   Full documentation: `docs/COURSE-14PLUS.md`. Design/flow conventions for
   editing it: the `course-design` skill in `.claude/skills/`.

## Hard rules

- **The two courses stay isolated.** `src/course/` must not import from
  `src/components/`, `src/data/`, `GradeContext`, or the K-8 `ALL_CSS`.
  The only shared code is `api/` (both courses call the same endpoints).
- **Don't regress the K-8 app.** Server changes must keep K-8 defaults
  unchanged — course-specific behavior is opt-in via request flags
  (`style: "plain"`, `relaxed: true`, `mode: "completion"`).
- **Factual accuracy over vibes, in both courses.** Every simplification in
  the 14+ course gets an "Honest footnote". Verify technical claims
  independently — don't propagate copy from one course to the other.
- **Real APIs, no simulations** is a stated promise of the 14+ course.
  Pure-math in-browser demos are fine; fake "AI responses" are not
  (canned fallbacks must be labeled as canned).

## Build / test / deploy

- `npm run dev` — local dev at `http://localhost:5173/iknowgenai/`
  (note the base path; the 14+ course is at `/iknowgenai/course` locally).
  API endpoints 404 locally unless you run `vercel dev` with `OPENAI_API_KEY`.
- `npx eslint src/course` must pass (the K-8 code has pre-existing lint noise;
  `api/` files false-positive on `process` — don't chase those).
- `npm run build` must pass. Smoke tests: `npx playwright test e2e/tests/course.spec.ts`.
- Deploys via Vercel on push. Ship to production by merging to `main`
  (use `gh pr create` + `gh pr merge`; don't commit directly to main).
  Production: https://iknowgenai.seibtribe.us (courses at `/` and `/course`).
- After deploying anything that touches prompts or moderation, **verify the
  live endpoints with curl** — the moderation stack has bitten us with
  false positives that only reproduce in production.

## Gotchas learned the hard way

- The moderation stack (`api/_moderate.js`) is 3 layers tuned for K-8 kids;
  the OpenAI moderation API's blanket `flagged` boolean false-positives on
  harmless fiction. The 14+ course uses `relaxed: true` (score thresholds).
- The chat completions API trims/obscures token leading-spaces; the predict
  endpoint's `mode: "completion"` (gpt-3.5-turbo-instruct) exists because
  chat-mode token boundaries are ambiguous. Use it for anything that
  assembles or appends raw tokens.
- The K-12 system prompt tells the model to deflect ("Let's try a different
  topic!") — it contaminates demos unless `style: "plain"` is sent.
- Preview-deployment share links (`_vercel_share`) are minted per-deployment
  and die on every push; production domains need no auth.
