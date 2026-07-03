// Chapter 8 — A Map of Meaning
// The embedding scatter (live API), meaning-as-direction, the dimension
// staircase, and the near-orthogonality playground: how 12,288 dimensions
// hold millions of concepts (superposition).
import { useMemo, useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Button, Mono, HonestNote, Recap, BlockedNote, CountUp } from "../ui/shared.jsx";
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

// ---- 2D interference playground -------------------------------------------
const CONCEPTS_2D = ["cat", "finance", "jazz", "gravity", "sarcasm", "pizza", "chess", "rain"];

function Interference2D({ accent }) {
  const [n, setN] = useState(2);
  const spacing = 180 / n; // vectors spread evenly across a half-plane
  const overlap = Math.cos((spacing * Math.PI) / 180);

  return (
    <Slide wide>
      <Kicker accent={accent}>The problem, in two dimensions</Kicker>
      <Heading size="h2">Unrelated should mean perpendicular.</Heading>
      <Prose muted>
        “Cat” and “finance” have nothing to do with each other — their
        directions should meet at 90°, so that moving along one doesn't move
        you along the other. Keep adding concepts and watch what 2D does.
      </Prose>
      <div style={{ display: "flex", gap: SPACE.md, flexWrap: "wrap", alignItems: "center" }}>
        <Card style={{ padding: SPACE.sm, flex: "0 0 auto" }}>
          <svg viewBox="-125 -122 250 145" style={{ width: 310, display: "block" }}>
            <circle cx="0" cy="0" r="100" fill="none" stroke="rgba(255,255,255,.08)" />
            {Array.from({ length: n }, (_, i) => {
              const deg = i * spacing;
              const rad = (deg * Math.PI) / 180;
              const x = Math.cos(rad) * 100;
              const y = -Math.sin(rad) * 100;
              const color = DOT_COLORS[i % DOT_COLORS.length];
              return (
                <g key={i} className="reveal">
                  <line x1="0" y1="0" x2={x} y2={y} stroke={color} strokeWidth="1.8" />
                  <text
                    x={x * 1.1} y={y * 1.1 + 2}
                    textAnchor={Math.abs(x) < 40 ? "middle" : x > 0 ? "start" : "end"}
                    fontSize="9" fill={color} fontFamily="Inter, sans-serif"
                  >
                    {CONCEPTS_2D[i]}
                  </text>
                </g>
              );
            })}
          </svg>
        </Card>
        <div style={{ flex: 1, minWidth: 240, display: "flex", flexDirection: "column", gap: SPACE.sm }}>
          <div style={{ display: "flex", gap: SPACE.xs }}>
            <Button accent={accent} onClick={() => setN((v) => Math.min(v + 1, CONCEPTS_2D.length))} disabled={n >= CONCEPTS_2D.length}>
              Add a concept
            </Button>
            <Button accent="transparent" style={{ border: `1px solid ${COLORS.hairline}`, color: COLORS.muted }} onClick={() => setN(2)}>
              Reset
            </Button>
          </div>
          <Card>
            <div style={{ fontFamily: FONTS.mono, fontSize: 14, lineHeight: 2 }}>
              <div>concepts: <span style={{ color: accent }}>{n}</span></div>
              <div>closest pair: <span style={{ color: spacing >= 89 ? COLORS.correct : spacing >= 45 ? "#E5B567" : COLORS.wrong }}>{spacing.toFixed(0)}°</span></div>
              <div>overlap: <span style={{ color: overlap <= 0.02 ? COLORS.correct : overlap <= 0.72 ? "#E5B567" : COLORS.wrong }}>{(overlap * 100).toFixed(0)}%</span></div>
            </div>
          </Card>
          <Prose muted style={{ fontSize: 15 }}>
            {n === 2
              ? "Two concepts fit perfectly — 90° apart, zero overlap."
              : `With ${n} concepts, the closest pair is only ${spacing.toFixed(0)}° apart. Nudge “${CONCEPTS_2D[0]}” and you smear ${(overlap * 100).toFixed(0)}% of that nudge onto “${CONCEPTS_2D[1]}”. The concepts are bleeding into each other.`}
          </Prose>
        </div>
      </div>
      <Prose>
        In 2D, only <strong>2</strong> directions can be mutually perpendicular.
        In 12,288 dimensions, only 12,288 can. And a model knows millions of
        things. So how does this possibly work?
      </Prose>
    </Slide>
  );
}

// ---- High-dimensional near-orthogonality demo ------------------------------
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

const DIM_STEPS = [2, 3, 10, 100, 1000, 12288];

function HighDimDemo({ accent }) {
  const [step, setStep] = useState(0);
  const d = DIM_STEPS[step];
  const angles = useMemo(() => pairwiseAngles(d), [d]);
  const worst = angles.reduce((m, a) => Math.min(m, Math.abs(a)), 180);
  const maxDev = angles.reduce((m, a) => Math.max(m, Math.abs(a - 90)), 0);

  return (
    <Slide wide>
      <Kicker accent={accent}>Computed live, right now, in your browser</Kicker>
      <Heading size="h2">The high-dimensional loophole.</Heading>
      <Prose muted>
        30 <em>random</em> directions — 435 pairs of angles between them,
        genuinely computed as you move the slider. Watch what happens to the
        angles as the space grows.
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
          ? "In 2 or 3 dimensions, random directions collide constantly — some pairs nearly parallel, some nearly opposite. Chaos."
          : d < 1000
            ? "The dots are pulling toward 90°. Random directions in higher dimensions are automatically more independent."
            : <>At {d.toLocaleString()} dimensions, all 435 pairs are within a few degrees of perpendicular — <strong>by pure accident</strong>. In high dimensions, almost every direction is almost perpendicular to almost every other.</>}
      </Prose>
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
            This result is from word2vec (2013), an earlier, simpler kind of
            embedding, and it holds approximately, not perfectly. Modern LLM
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
      return (
        <Slide>
          <Kicker accent={accent}>The counting problem</Kicker>
          <Heading size="h2">12,288 axes. Millions of ideas.</Heading>
          <Prose>
            A frontier model knows about cats, jazz, tax law, sarcasm, Python,
            the French Revolution, and roughly everything else humans have
            written down — <strong>millions of distinct concepts</strong>.
          </Prose>
          <Prose>
            If every concept needed its own private, perpendicular axis, the
            model would need millions of dimensions. It has twelve thousand.
            The map should be hopelessly overcrowded — concepts trampling each
            other everywhere.
          </Prose>
          <Lead style={{ color: accent }}>
            It isn't. The escape hatch is one of the most beautiful facts in
            this course — and you can watch it happen.
          </Lead>
        </Slide>
      );
    case 5:
      return <Interference2D accent={accent} />;
    case 6:
      return <HighDimDemo accent={accent} />;
    case 7:
      return (
        <Slide>
          <Kicker accent={accent}>So what</Kicker>
          <Heading size="h2">Almost perpendicular is good enough.</Heading>
          <Prose>
            That's the loophole. If you accept <em>89.9°</em> instead of
            demanding exactly 90°, the number of directions you can pack grows
            <strong> exponentially</strong> with dimensions. In 12,288
            dimensions there's room for not millions but effectively unlimited
            almost-independent directions. The map was never overcrowded — high
            dimensions are unimaginably roomier than our 3D intuition suggests.
          </Prose>
          <Prose>
            And the tiny overlaps that remain? They're not even a bug. “Cat”
            overlapping slightly with “dog,” a little with “pet,” barely with
            “jazz” — that residue of interference <em>is</em> similarity. The
            map stores relatedness in exactly the imperfection it couldn't
            avoid.
          </Prose>
          <HonestNote>
            Researchers call concepts-sharing-dimensions <strong>superposition</strong>,
            and reading these tangled directions back out of real models is an
            active field (mechanistic interpretability). The exponential-packing
            fact is solid math; how models exploit it is still being mapped.
          </HonestNote>
        </Slide>
      );
    case 8:
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
