# Course Workflow Spreadsheets

Click-by-click map of the AI Kids course, intended as a planning artifact for
re-grouping sections and tuning the depth/order of each beat.

## Files

| file | purpose |
|---|---|
| `course-workflow-master.csv` | Every slide once (105 rows, V2 ordering). Columns mark which grades include each slide and which v3 session it lands in. Use this to compare across age groups. |
| `course-walkthrough-K-2.csv` | K-2's actual click-through (36 rows), in v3 session order (Discover → Explore → Create), with cumulative step counts. |
| `course-walkthrough-3-5.csv` | 3-5's walkthrough (76 rows). |
| `course-walkthrough-7-8.csv` | 7-8's walkthrough (105 rows — superset). |

The CSVs are generated. To edit content, edit `scripts/course-workflow-content.mjs`
and re-run `node scripts/generate-course-workflow.mjs`.

## Sources of truth

- **Slide counts per grade** come from `src/data/gradeConfig.js` (`presentationSlides`, V1-indexed).
- **Section ordering and grouping** come from `SECTIONS_V2`, `TITLES_V2`, `GROUPS_V2` in `src/App.jsx`.
- **Session split (Discover/Explore/Create)** comes from `src/data/sessionConfig.js`.
- **Slide descriptions** are curated in `scripts/course-workflow-content.mjs`, distilled from `src/data/teacherNotes.js` plus a read-through of each `Section*.jsx` component.

If you change `gradeConfig.js`, `App.jsx`, or `sessionConfig.js`, re-run the
generator to update the CSVs.

## Column legend

### Master CSV

| column | meaning |
|---|---|
| `step_v2` | Global slide number across all 20 V2 sections (1–105). |
| `group_id` / `group_name` | The V2 group: 1=What Is AI?, 2=Meet the LLMs, 3=Inside the Machine, 4=How AI Writes, 5=Try It!, 6=Bonus. |
| `section_v2` | V2 section index (0–19). |
| `section_title` | Display title (matches `TITLES_V2`). |
| `slide_id` | Slide index within the section (0-based). |
| `identifier` | Stable slug for the slide (e.g. `attention.s4`). Use this when discussing specific beats. |
| `step_title` | Short label (≤6 words) you can scan. |
| `description` | What reveals on this click / what the user does. |
| `element_group` | Slides that together build ONE concept beat. Sequence beats — e.g. `attn-example-1` covers the baseball-context sentence + its attention-beam reveal. Use this to spot beats that span multiple clicks. |
| `placement_group` | Slides that share a single visual canvas / are layered onto one composite (overlay beats — same backdrop, content stacks on). Different from `element_group`: a single canvas can host two element groups (e.g. the bat sentence canvas hosts both the baseball example and the nature example). |
| `interactive` | One of: `STATIC` (read/listen only), `AUTO-ANIM` (animation auto-plays — kids watch), `INPUT` (text/typing), `DRAG` (drag-to-rotate or similar), `SLIDER` (continuous control), `SELECT` (click choice — vote, A/B, tap-a-word), `LIVE-AI` (calls real LLM/embedding API). |
| `K-2` / `3-5` / `7-8` | `Y` if that grade's `presentationSlides` count includes this slide; otherwise `N`. |
| `session_K-2` / `session_3-5` / `session_7-8` | Which v3 session (Discover / Explore / Create) the section lands in for that grade. `—` if the grade skips it. |
| `simplification` | Where we simplify for kids — what we say vs. what's really happening. Useful to spot which beats need a teacher-side caveat. |
| `notes` | Anything else: branching logic (e.g. remote vs manual story entry), behind-the-scenes panels, replay opportunities. |

### Per-grade walkthrough CSVs

Same columns minus the grade-inclusion / session columns (since the file is
already grade-specific) plus:

| column | meaning |
|---|---|
| `step` | Cumulative click number across the whole grade-level course. |
| `session` | Discover / Explore / Create. |
| `session_step` | Cumulative click number within the session (resets at each session boundary). |

## How to use this for planning

- **Re-grouping sections:** Sort the master CSV by `group_id`, then look at
  `element_group` and `placement_group` clusters — if two sections share an
  `element_group` family (e.g. attention beams + MLP thinking layer both build
  toward "what each layer does"), they may want to be adjacent.

- **Depth tuning per grade:** Filter master to a single section. Compare the
  `Y/N` columns — anywhere K-2 says `N` while 3-5 says `Y`, that's a slide
  K-2 skips. Check whether the skipped slides leave a coherent beat.

- **Interactive density:** Filter `interactive ≠ STATIC` and count by section.
  K-2 currently has light interactivity (Story Mash input + Predict slider +
  Try It playground); you may want to add more `SELECT` voting beats early.

- **Session balance:** In a per-grade CSV, group by `session` to see slide
  counts per session. Currently:
  - K-2: Discover 13, Explore 11, Create 12 — balanced.
  - 3-5: Discover 25, Explore 31, Create 20 — Explore is heavy.
  - 7-8: Discover 30, Explore 48, Create 27 — Explore is *very* heavy
    (Three Steps + Tokens + Beyond 2D all land here).

- **Single-element vs multi-click beats:** `placement_group` shared across
  multiple rows = one visual canvas with progressive reveals. If a beat sits
  on its own canvas (e.g. `frame`), it's a single-element beat. Use this to
  decide whether two adjacent beats can share screen real estate or need
  separate canvases.

## Known limitations

- Section component files have more internal `slide >= N` gates than the
  grade configs use — components render conditionally on grade. Slide
  descriptions reflect what 7-8 graders see; K-2 may see a simplified version
  of the same slide index. The `simplification` column flags major
  divergences.
- Slide counts use `gradeConfig.presentationSlides` as canonical. If a
  component supports more slides than the grade asks for, those extra slides
  are simply not navigated to.
- `element_group` and `placement_group` slugs are author-defined (in
  `course-workflow-content.mjs`) — adjust them as you re-think structure.
