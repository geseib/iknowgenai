// Chapter 8 — A Map of Meaning
// The embedding scatter (live API), meaning-as-direction, the dimension
// staircase, and the near-orthogonality demo: how 12,288 dimensions hold
// millions of concepts (superposition).
import { useMemo, useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Button, Mono, HonestNote, Recap, BlockedNote, CountUp, Term } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";
import { embed2d } from "../lib/api.js";

const DOT_COLORS = ["#6C9EF8", "#4FD6BE", "#E5B567", "#A78BFA", "#E58FB1", "#7BC97B", "#E06C75", "#98A2B8"];

const SCATTER_PRESETS = [
  { label: "Animals vs vehicles vs food", words: ["cat", "dog", "kitten", "puppy", "car", "truck", "bicycle", "pizza", "sushi", "cake"] },
  { label: "Royalty and family", words: ["king", "queen", "prince", "princess", "man", "woman", "boy", "girl"] },
  { label: "Feelings", words: ["happy", "joyful", "delighted", "sad", "gloomy", "angry", "furious", "calm"] },
];

function ScatterDemo({ accent }) {
  const [input, setInput] = useState(SCATTER_PRESETS[0].words.join(", "));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const run = async (text) => {
    const words = text.split(",").map((w) => w.trim()).filter(Boolean);
    if (words.length < 2) return;
    setLoading(true);
    setBlocked(false);
    setResult(null);
    try {
      const data = await embed2d(words);
      if (data.blocked) setBlocked(true);
      else setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <Slide wide>
      <Kicker accent={accent}>Live — real embeddings, plotted</Kicker>
      <Heading size="h2">The dictionary becomes geography.</Heading>
      <Prose muted>
        Each word is embedded by a real model, then projected onto this page.
        Similar meanings land close together — watch the clusters form.
      </Prose>
      <div style={{ display: "flex", gap: SPACE.xs, flexWrap: "wrap" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run(input)}
          placeholder="cat, dog, pizza, car…  (comma-separated)"
          style={{ flex: 1, minWidth: 260 }}
        />
        <Button accent={accent} onClick={() => run(input)} disabled={loading}>
          {loading ? "Embedding…" : "Map the words"}
        </Button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {SCATTER_PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => { setInput(p.words.join(", ")); run(p.words.join(", ")); }}
            style={{ fontSize: 13, color: COLORS.muted, padding: "4px 10px", border: `1px solid ${COLORS.hairline}`, borderRadius: 999 }}
          >
            {p.label}
          </button>
        ))}
      </div>
      {blocked && <BlockedNote />}
      {result?.error && <Prose muted>Couldn't reach the model: {result.error}</Prose>}
      {result?.words && (
        <Card style={{ padding: SPACE.sm }}>
          <svg viewBox="0 0 100 74" style={{ width: "100%", display: "block" }}>
            {result.words.map((w, i) => (
              <g key={w.word} className="reveal" style={{ animationDelay: `${i * 80}ms` }}>
                <circle cx={w.x} cy={w.y * 0.72 + 1} r="1.6" fill={DOT_COLORS[i % DOT_COLORS.length]} />
                <text x={w.x} y={w.y * 0.72 - 1.6} textAnchor="middle" fontSize="3" fill="#E7EAF2" fontFamily="Inter, sans-serif">
                  {w.word}
                </text>
              </g>
            ))}
          </svg>
          <Prose muted style={{ fontSize: 13 }}>
            Real distances in {result.dimensions?.toLocaleString()} dimensions,
            flattened to 2 so we can look at them. Nothing was labeled — the
            clusters are what the model learned.
          </Prose>
        </Card>
      )}
    </Slide>
  );
}

// ---- Counting problem lead-in + high-dimensional near-orthogonality demo --
// Seeded PRNG so the demo is stable across replays.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// N random unit vectors in d dims → all pairwise angles (degrees).
function pairwiseAngles(d, N = 30, seed = 7) {
  const rand = mulberry32(seed + d);
  // Gaussian via Box-Muller; random gaussian vectors are uniform on the sphere.
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
  const vecs = Array.from({ length: N }, () => {
    const v = Array.from({ length: d }, gauss);
    const len = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
    return v.map((x) => x / len);
  });
  const angles = [];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      let dot = 0;
      for (let k = 0; k < d; k++) dot += vecs[i][k] * vecs[j][k];
      angles.push((Math.acos(Math.max(-1, Math.min(1, dot))) * 180) / Math.PI);
    }
  }
  return angles;
}

// Small, static illustration of the crowding problem in 2D — a compressed
// stand-in for what used to be its own interactive playground slide. Real
// trigonometry, just fixed at one crowded arrangement instead of a slider.
const MINI_CONCEPTS = ["cat", "finance", "jazz", "gravity", "sarcasm", "rain"];

function MiniInterference() {
  const n = MINI_CONCEPTS.length;
  const spacing = 180 / (n - 1);
  return (
    <Card style={{ padding: SPACE.sm, display: "flex", gap: SPACE.md, alignItems: "center", flexWrap: "wrap" }}>
      <svg viewBox="-105 -102 210 122" style={{ width: 220, flex: "0 0 auto", display: "block" }}>
        <circle cx="0" cy="0" r="100" fill="none" stroke="rgba(255,255,255,.08)" />
        {MINI_CONCEPTS.map((word, i) => {
          const rad = (i * spacing * Math.PI) / 180;
          const x = Math.cos(rad) * 100;
          const y = -Math.sin(rad) * 100;
          const color = DOT_COLORS[i % DOT_COLORS.length];
          return (
            <g key={word}>
              <line x1="0" y1="0" x2={x} y2={y} stroke={color} strokeWidth="1.6" />
              <text
                x={x * 1.12} y={y * 1.12 + 2}
                textAnchor={Math.abs(x) < 30 ? "middle" : x > 0 ? "start" : "end"}
                fontSize="8" fill={color} fontFamily="Inter, sans-serif"
              >
                {word}
              </text>
            </g>
          );
        })}
      </svg>
      <Prose muted style={{ flex: 1, minWidth: 200, fontSize: 15 }}>
        Six unrelated concepts, squeezed into 2 dimensions: only{" "}
        <strong>2</strong> directions here can be truly perpendicular, so the
        rest are forced to lean on each other — about {spacing.toFixed(0)}°
        apart at best. In 12,288 dimensions, only 12,288 directions can be
        exactly perpendicular too. A model needs millions.
      </Prose>
    </Card>
  );
}

const DIM_STEPS = [2, 3, 10, 100, 1000, 12288];

function CountingProblemDemo({ accent }) {
  const [step, setStep] = useState(0);
  const d = DIM_STEPS[step];
  const angles = useMemo(() => pairwiseAngles(d), [d]);
  const worst = angles.reduce((m, a) => Math.min(m, Math.abs(a)), 180);
  const maxDev = angles.reduce((m, a) => Math.max(m, Math.abs(a - 90)), 0);

  return (
    <Slide wide>
      <Kicker accent={accent}>The counting problem — solved live, in your browser</Kicker>
      <Heading size="h2">12,288 axes. Millions of ideas.</Heading>
      <Prose>
        A <Term t="frontier" accent={accent}>frontier model</Term> knows about
        cats, jazz, tax law, sarcasm, Python, the French Revolution, and
        roughly everything else humans have written down —{" "}
        <strong>millions of distinct concepts</strong>. If every concept
        needed its own private, perpendicular axis, the model would need
        millions of dimensions. It has twelve thousand.
      </Prose>
      <MiniInterference />
      <Prose muted>
        The map should be hopelessly overcrowded. Watch what actually happens
        to random directions as the space grows: 30 of them, 435 pairs of
        angles between them, genuinely computed as you move the slider.
      </Prose>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.sm, flexWrap: "wrap" }}>
          <Mono style={{ fontSize: 13, color: COLORS.muted }}>dimensions:</Mono>
          <input
            type="range" min="0" max={DIM_STEPS.length - 1} step="1" value={step}
            onChange={(e) => setStep(Number(e.target.value))}
            style={{ flex: 1, minWidth: 160 }}
          />
          <Mono accent={accent} style={{ fontSize: 22, minWidth: 90, textAlign: "right" }}>
            {d.toLocaleString()}
          </Mono>
        </div>
        {/* Angle strip: each pair is a dot on a 0–180° axis */}
        <div style={{ position: "relative", height: 90, borderBottom: `1px solid ${COLORS.hairline}` }}>
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: accent + "66" }} />
          {angles.map((a, i) => (
            <div
              key={`${d}-${i}`}
              style={{
                position: "absolute",
                left: `${(a / 180) * 100}%`,
                top: `${8 + ((i * 37) % 70)}px`,
                width: 4, height: 4, borderRadius: "50%",
                background: Math.abs(a - 90) < 8 ? accent : COLORS.muted,
                opacity: 0.75,
                transition: "left 500ms cubic-bezier(.2,.7,.3,1)",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONTS.mono, fontSize: 11, color: COLORS.faint, marginTop: 4 }}>
          <span>0° (same direction)</span>
          <span style={{ color: accent }}>90° (unrelated)</span>
          <span>180° (opposite)</span>
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 14, marginTop: SPACE.sm, color: COLORS.muted }}>
          furthest from 90°: <span style={{ color: maxDev < 10 ? COLORS.correct : maxDev < 35 ? "#E5B567" : COLORS.wrong }}>
            {maxDev.toFixed(1)}°
          </span>
          <span style={{ color: COLORS.faint }}> · closest pair: {worst.toFixed(1)}° apart</span>
        </div>
      </Card>
      <Prose>
        {d <= 3
          ? "In 2 or 3 dimensions, random directions collide constantly — some pairs nearly parallel, some nearly opposite. This is the overcrowding from above, playing out live."
          : d < 1000
            ? "The dots are pulling toward 90°. Random directions in higher dimensions are automatically more independent — no planning required."
            : <>At {d.toLocaleString()} dimensions, every pair is within a couple of degrees of perpendicular — <strong>by pure accident</strong>. Read that as capacity: you could add concept #31 <em>blindfolded</em>, as a random direction, and it would land almost perpendicular to all 30 existing ones. The map isn't crowded. It's practically empty.</>}
      </Prose>
      {d >= 12288 && (
        <Prose muted className="reveal" style={{ fontSize: 15 }}>
          How un-crowded, exactly? The next slide counts.
        </Prose>
      )}
    </Slide>
  );
}

// ---- Exponential capacity: how many nearly-perpendicular directions fit? ----
// Standard random-packing lower bound: at least e^(d·ε²/4) unit vectors can
// pairwise stay within ε (radians) of perpendicular; demanding exactly 90°
// gives exactly d. The honest footnote flags the bound's looseness.
const CAP_DIMS = [100, 1000, 4096, 12288];
const CAP_TOLERANCES = [
  { deg: 0, label: "exactly 90°" },
  { deg: 5, label: "within ±5°" },
  { deg: 10, label: "within ±10°" },
  { deg: 15, label: "within ±15°" },
];

function capacityLog10(d, deg) {
  if (deg === 0) return Math.log10(d);
  const eps = Math.sin((deg * Math.PI) / 180);
  const ln = (d * eps * eps) / 4;
  return Math.max(Math.log10(d), ln / Math.LN10);
}

function fmtCapacity(log10N) {
  if (log10N < 6) return Math.round(Math.pow(10, log10N)).toLocaleString();
  return null; // rendered as 10^x
}

const ANCHORS = [
  { log: 6, label: "every English word", row: 0 },
  { log: 10, label: "people on Earth", row: 1 },
  { log: 19, label: "grains of sand on Earth", row: 0 },
  { log: 50, label: "10⁵⁰", row: 1 },
  { log: 80, label: "atoms in the universe", row: 0 },
];
const CAP_SCALE_MAX = 92;

function CapacityDemo({ accent }) {
  const [dim, setDim] = useState(12288);
  const [tol, setTol] = useState(5);
  const log10N = capacityLog10(dim, tol);
  const exact = fmtCapacity(log10N);
  const exp = Math.round(log10N);
  const beyondAtoms = log10N > 80;

  const caption =
    tol === 0
      ? "Demand perfect 90° separation and the ceiling is just the dimension count — geometry allows exactly d mutually perpendicular directions, no more."
      : dim === 100
        ? "At 100 dimensions, the tolerance buys you essentially nothing — the exponent is too small to matter. Low dimensions have no loophole."
        : dim === 1000 && tol <= 10
          ? "The exponential is waking up — but at 1,000 dimensions it takes a generous tolerance to beat the plain dimension count."
          : dim === 4096 && !beyondAtoms
            ? "4,096 is a real embedding width (mid-size open models use it) — and here the exponent ignites. Capacity grows like e^(k·d), so doubling the dimensions SQUARES the capacity. Step up to 12,288 and watch."
            : beyondAtoms
              ? "More directions than there are atoms in the observable universe — from twelve thousand dimensions and a tolerance smaller than your eye could see on a protractor."
              : "Now the exponent is doing the work: capacity grows exponentially in dimensions — doubling d squares the count. This is why the loophole belongs to high dimensions alone.";

  return (
    <Slide wide>
      <Kicker accent={accent}>Count the room</Kicker>
      <Heading size="h2">The exponential payoff.</Heading>
      <Prose muted>
        How many nearly-independent directions fit? Pick a space, pick your
        standard for “independent enough,” and count.
      </Prose>
      <div style={{ display: "flex", gap: SPACE.md, flexWrap: "wrap" }}>
        <div>
          <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 6 }}>DIMENSIONS</Mono>
          <div style={{ display: "flex", gap: 8 }}>
            {CAP_DIMS.map((d) => (
              <button
                key={d}
                onClick={() => setDim(d)}
                className="btn"
                style={{
                  padding: "8px 14px", fontSize: 14,
                  background: dim === d ? accent : "transparent",
                  color: dim === d ? "#0B0E14" : COLORS.muted,
                  border: `1px solid ${dim === d ? accent : COLORS.hairline}`,
                }}
              >
                {d.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 6 }}>“UNRELATED” MEANS…</Mono>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CAP_TOLERANCES.map((t) => (
              <button
                key={t.deg}
                onClick={() => setTol(t.deg)}
                className="btn"
                style={{
                  padding: "8px 14px", fontSize: 14,
                  background: tol === t.deg ? accent : "transparent",
                  color: tol === t.deg ? "#0B0E14" : COLORS.muted,
                  border: `1px solid ${tol === t.deg ? accent : COLORS.hairline}`,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Card style={{ borderColor: accent + "44" }}>
        <Mono style={{ fontSize: 12, color: COLORS.muted }}>room for at least…</Mono>
        <div style={{ fontFamily: FONTS.mono, fontSize: exact ? 44 : 40, color: accent, lineHeight: 1.3, fontVariantNumeric: "tabular-nums" }}>
          {exact ? exact : <>~10<sup style={{ fontSize: 24 }}>{exp}</sup></>}
          <span style={{ fontSize: 15, color: COLORS.muted }}> nearly-independent directions</span>
        </div>
        {/* Log-scale bar with real-world anchors (staggered rows to avoid overlap) */}
        <div style={{ position: "relative", height: 84, marginTop: SPACE.sm }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 38, height: 4, background: "rgba(255,255,255,.08)", borderRadius: 2 }} />
          <div style={{
            position: "absolute", left: 0, top: 38, height: 4, borderRadius: 2,
            width: `${Math.min(100, (log10N / CAP_SCALE_MAX) * 100)}%`,
            background: accent, transition: "width 600ms cubic-bezier(.2,.7,.3,1)",
          }} />
          {ANCHORS.map((a) => (
            <div key={a.log} style={{ position: "absolute", left: `${(a.log / CAP_SCALE_MAX) * 100}%`, top: 0, bottom: 0 }}>
              <div style={{
                position: "absolute", top: a.row === 0 ? 18 : 42, width: 1,
                height: a.row === 0 ? 20 : 20, background: COLORS.faint,
              }} />
              <div style={{
                position: "absolute", top: a.row === 0 ? 2 : 64,
                fontFamily: FONTS.mono, fontSize: 10, color: log10N >= a.log ? COLORS.text : COLORS.faint,
                transform: "translateX(-50%)", whiteSpace: "nowrap", transition: "color 400ms",
              }}>
                {a.label}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Prose muted style={{ fontSize: 15 }}>{caption}</Prose>
      <Prose>
        Almost perpendicular is good enough: demand perfection and you get
        thousands of concepts; accept <em>almost</em> and you get more than
        there are atoms. And the tiny overlaps “almost” leaves behind aren't
        even a bug — “cat” overlapping slightly with “dog,” a little with
        “pet” — that residue of interference <em>is</em> similarity. The map
        stores relatedness in exactly the imperfection it couldn't avoid.
      </Prose>
      <HonestNote>
        “At least” is doing real work above: these come from a standard
        random-packing bound (about e^(d·ε²⁄4) directions fit with pairwise
        angles within ε of 90°) — the true maximum is even larger, and at
        exactly 90° the answer is exactly d. The point survives any choice of
        constants: capacity is <em>exponential in dimensions</em>. Researchers
        call concepts sharing dimensions like this{" "}
        <strong>superposition</strong>, and reading these tangled directions
        back out of real models is an active field (
        <Term t="interpretability" accent={accent}>mechanistic interpretability</Term>
        ) — the packing math is solid; how models exploit it is still being
        mapped.
      </HonestNote>
    </Slide>
  );
}

// ---- Chapter ----------------------------------------------------------------
export default function Ch08MapOfMeaning({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Act III · Inside the Machine — Chapter 8</Kicker>
          <Heading>A Map of Meaning</Heading>
          <Lead>
            Last chapter, every word became a list of thousands of numbers. A
            list of numbers is a <em>location</em>. Which means every word in
            the language now has a place — and we can go look at the map.
          </Lead>
        </Slide>
      );
    case 1:
      return <ScatterDemo accent={accent} />;
    case 2:
      return (
        <Slide>
          <Kicker accent={accent}>Not just places — directions</Kicker>
          <Heading size="h2">king − man + woman ≈ queen</Heading>
          <Prose>
            Here's the famous party trick. Take the location of “king.”
            Subtract the direction of “man.” Add the direction of “woman.” The
            place you land is almost exactly… “queen.”
          </Prose>
          <Card>
            <div style={{ fontFamily: FONTS.mono, fontSize: 18, lineHeight: 2, textAlign: "center" }}>
              <span style={{ color: DOT_COLORS[0] }}>king</span>
              <span style={{ color: COLORS.faint }}> − </span>
              <span style={{ color: DOT_COLORS[2] }}>man</span>
              <span style={{ color: COLORS.faint }}> + </span>
              <span style={{ color: DOT_COLORS[4] }}>woman</span>
              <span style={{ color: COLORS.faint }}> ≈ </span>
              <span style={{ color: accent }}>queen</span>
            </div>
          </Card>
          <Prose>
            That only works if the map's <em>directions</em> carry meaning:
            somewhere in those thousands of dimensions there is a consistent
            “royalty” direction, and a consistent “male→female” direction, and
            they combine like arrows. Meaning isn't just <em>where</em> you are
            — it's <em>which way</em> things point.
          </Prose>
          <HonestNote>
            This result is from{" "}
            <Term t="word2vec" accent={accent}>word2vec</Term> (2013), an
            earlier, simpler kind of embedding, and it holds approximately,
            not perfectly. Modern LLM
            embeddings are contextual — a word's vector shifts with its
            sentence — but the meaning-as-direction picture carries over, and
            it's about to matter enormously.
          </HonestNote>
        </Slide>
      );
    case 3:
      return (
        <Slide>
          <Kicker accent={accent}>How big is this map?</Kicker>
          <Heading size="h2">
            1D → 2D → 3D → <CountUp to={12288} duration={2200} style={{ color: accent }} />D
          </Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            {[
              ["1 dimension", "A line. Words can only be left or right of each other. One kind of similarity — that's all you get."],
              ["2 dimensions", "A plane — your scatter plot. Clusters appear, but unrelated categories keep getting shoved together."],
              ["3 dimensions", "A volume. More room, same problem. And it's the last one your brain can picture."],
              ["12,288 dimensions", "GPT-3's embedding space. Impossible to visualize. The math doesn't care — distances and directions work identically."],
            ].map(([label, text], i) => (
              <div key={label} className="reveal" style={{ animationDelay: `${i * 150}ms`, display: "flex", gap: 14, alignItems: "baseline" }}>
                <Mono accent={i === 3 ? accent : undefined} style={{ fontSize: 13, minWidth: 130, color: i === 3 ? accent : COLORS.muted }}>{label}</Mono>
                <Prose muted={i !== 3}>{text}</Prose>
              </div>
            ))}
          </div>
          <Prose muted>
            Every extra dimension is one more independent way for words to
            differ: alive-ness, formality, size, tense, temperature… But that
            raises a counting problem — next slide.
          </Prose>
        </Slide>
      );
    case 4:
      return <CountingProblemDemo accent={accent} />;
    case 5:
      return <CapacityDemo accent={accent} />;
    case 6:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "Embeddings put every word on a map: distance is similarity, and directions carry meaning (king − man + woman ≈ queen).",
            "The map has thousands of dimensions — unpicturable, but the geometry works the same as 2D.",
            "Millions of concepts fit in 12,288 dimensions because in high-D, almost all directions are almost perpendicular — and the leftover overlap is similarity itself.",
          ]}
          next="Attention — the map gives every word a place, but “bat” needs two. Context to the rescue."
        />
      );
  }
}
