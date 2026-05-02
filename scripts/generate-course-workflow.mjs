// Generates the course-workflow CSV files in docs/course-workflow/
//
// Inputs:
//   - SECTIONS from course-workflow-content.mjs (curated slide-by-slide content)
//   - GRADE_CONFIG from src/data/gradeConfig.js (canonical slide counts per grade)
//   - SESSION_CONFIG from src/data/sessionConfig.js (Discover/Explore/Create split)
//
// Outputs:
//   - course-workflow-master.csv  : every slide once, with Y/N inclusion per grade
//   - course-walkthrough-K-2.csv  : K-2's actual click-through, cumulative steps
//   - course-walkthrough-3-5.csv  : 3-5's actual click-through
//   - course-walkthrough-7-8.csv  : 7-8's actual click-through
//
// Run: node scripts/generate-course-workflow.mjs

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SECTIONS } from "./course-workflow-content.mjs";
import { GRADE_CONFIG } from "../src/data/gradeConfig.js";
import { SESSION_CONFIG } from "../src/data/sessionConfig.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../docs/course-workflow");
mkdirSync(OUT_DIR, { recursive: true });

const GRADES = ["K-2", "3-5", "7-8"];

// V2 → V1 mapping (mirrors App.jsx). gradeConfig is V1-indexed; SECTIONS use V2.
const V2_TO_V1 = [0, 1, 2, 3, 4, 5, 6, 8, 9, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

/** How many slides this grade actually navigates through for v2 section index `v2idx`. */
function slidesShownForGrade(grade, v2idx) {
  const v1idx = V2_TO_V1[v2idx];
  return GRADE_CONFIG[grade].presentationSlides[v1idx] || 0;
}

/** Which v3 session (Discover/Explore/Create) does v2 section `v2idx` land in for `grade`? */
function sessionForGrade(grade, v2idx) {
  const sessions = SESSION_CONFIG[grade].sessions;
  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].sections.includes(v2idx)) return sessions[i].name;
  }
  return "—";
}

/** CSV-escape a value: wrap in quotes, double internal quotes. */
function csvCell(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(cells) {
  return cells.map(csvCell).join(",");
}

// ── Master CSV ────────────────────────────────────────────────────────────────
// One row per V2 slide. Grade columns mark Y/N inclusion. Session columns name
// the v3 session that grade puts this section in.

const masterHeader = [
  "step_v2",          // global step number across all V2 slides
  "group_id",
  "group_name",
  "section_v2",
  "section_title",
  "slide_id",
  "identifier",
  "step_title",
  "description",
  "element_group",
  "placement_group",
  "interactive",
  "K-2",
  "3-5",
  "7-8",
  "session_K-2",
  "session_3-5",
  "session_7-8",
  "simplification",
  "notes",
];

const masterRows = [];
let stepV2 = 0;
for (const sec of SECTIONS) {
  for (const sl of sec.slides) {
    stepV2++;
    const slideIdx = parseInt(sl.id.split(".s")[1], 10);
    const inK2 = slidesShownForGrade("K-2", sec.v2) > slideIdx ? "Y" : "N";
    const in35 = slidesShownForGrade("3-5", sec.v2) > slideIdx ? "Y" : "N";
    const in78 = slidesShownForGrade("7-8", sec.v2) > slideIdx ? "Y" : "N";
    masterRows.push([
      stepV2,
      sec.group.id,
      sec.group.name,
      sec.v2,
      sec.title,
      slideIdx,
      sl.id,
      sl.title,
      sl.description,
      sl.element_group,
      sl.placement_group,
      sl.interactive,
      inK2,
      in35,
      in78,
      inK2 === "Y" ? sessionForGrade("K-2", sec.v2) : "—",
      in35 === "Y" ? sessionForGrade("3-5", sec.v2) : "—",
      in78 === "Y" ? sessionForGrade("7-8", sec.v2) : "—",
      sl.simplification || "",
      sl.notes || "",
    ]);
  }
}

const masterCsv = [csvRow(masterHeader), ...masterRows.map(csvRow)].join("\n") + "\n";
writeFileSync(resolve(OUT_DIR, "course-workflow-master.csv"), masterCsv);
console.log(`wrote master: ${masterRows.length} rows`);

// ── Per-grade walkthrough CSVs ────────────────────────────────────────────────
// Only the slides that grade actually sees, with cumulative step counters
// across the whole course AND within each session.

const walkthroughHeader = [
  "step",                  // cumulative across the whole course for this grade
  "session",               // Discover / Explore / Create
  "session_step",          // cumulative within the session
  "group_id",
  "group_name",
  "section_v2",
  "section_title",
  "slide_id",
  "identifier",
  "step_title",
  "description",
  "element_group",
  "placement_group",
  "interactive",
  "simplification",
  "notes",
];

for (const grade of GRADES) {
  const rows = [];
  let step = 0;
  const sessionSteps = { Discover: 0, Explore: 0, Create: 0 };

  // Walk in V3 session order so the spreadsheet reads as the actual
  // student experience (Discover → Explore → Create), not raw V2 order.
  for (const sess of SESSION_CONFIG[grade].sessions) {
    for (const v2idx of sess.sections) {
      const sec = SECTIONS.find((s) => s.v2 === v2idx);
      if (!sec) continue;
      const count = slidesShownForGrade(grade, v2idx);
      for (let i = 0; i < count; i++) {
        const sl = sec.slides[i];
        if (!sl) continue; // grade asks for more slides than we have content for
        step++;
        sessionSteps[sess.name]++;
        rows.push([
          step,
          sess.name,
          sessionSteps[sess.name],
          sec.group.id,
          sec.group.name,
          sec.v2,
          sec.title,
          i,
          sl.id,
          sl.title,
          sl.description,
          sl.element_group,
          sl.placement_group,
          sl.interactive,
          sl.simplification || "",
          sl.notes || "",
        ]);
      }
    }
  }

  const csv = [csvRow(walkthroughHeader), ...rows.map(csvRow)].join("\n") + "\n";
  writeFileSync(resolve(OUT_DIR, `course-walkthrough-${grade}.csv`), csv);
  console.log(`wrote ${grade}: ${rows.length} rows`);
}

console.log(`\noutput dir: ${OUT_DIR}`);
