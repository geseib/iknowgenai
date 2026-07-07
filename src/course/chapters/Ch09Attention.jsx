// Chapter 9 — Attention
// The ambiguity problem ("bat"), a find-the-clues game with attention beams
// and a live-updating vector, context moving a word across the meaning map,
// the loaded final word, heads, and the Transformer.
import { useEffect, useRef, useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Button, Mono, HonestNote, Recap, BlockedNote, SidequestLink, Term } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";
import { predictNext } from "../lib/api.js";

// Both sentences put every clue BEFORE "bat" on purpose: under the causal
// rule (slide 5), a word can only look backward, so this is the only case
// where "bat" can actually resolve itself. Slides 5-6 explore what happens
// when the clues come later instead.
const SENTENCES = [
  {
    words: ["With", "the", "ball", "pitched", "he", "swung", "the", "bat"],
    focus: 7,
    clues: [2, 3, 5],
    meaning: "a baseball bat",
    pole: 1, // clues push the vector toward the "baseball" direction
    poleLabel: "baseball bat",
  },
  {
    words: ["In", "the", "cave", "at", "dusk", "something", "flew", "a", "bat"],
    focus: 8,
    clues: [2, 4, 6],
    meaning: "the flying animal",
    pole: -1, // clues push toward the "animal" direction
    poleLabel: "flying animal",
  },
];

// Deterministic pseudo-random values so the demo replays identically.
const hash01 = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const VEC_DIMS = 8;
// The starting embedding for "bat" — the SAME for both sentences, because
// it's the same lookup (Chapter 7). That identity is the whole problem.
const BAT_BASE = Array.from({ length: VEC_DIMS }, (_, k) => hash01(k + 3) * 1.6 - 0.8);
// Each clicked clue nudges every dimension; the sign pattern is per-dimension,
// the direction (pole) is per-sentence, so the two copies drift apart.
const DIM_SIGN = Array.from({ length: VEC_DIMS }, (_, k) => (hash01(k + 40) > 0.5 ? 1 : -1));

function batVector(pole, cluesFound) {
  return BAT_BASE.map((v, k) => v + pole * DIM_SIGN[k] * (0.22 + 0.1 * hash01(k + 7)) * cluesFound);
}

// The vector readout: bat's numbers, live. Changed values flash the accent.
function VectorStrip({ sentence, cluesFound, accent }) {
  const values = batVector(sentence.pole, cluesFound);
  const lean = Math.min(1, cluesFound / sentence.clues.length);
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontFamily: FONTS.mono, fontSize: 13, lineHeight: 2, whiteSpace: "nowrap", overflowX: "auto" }}>
        <span style={{ color: COLORS.faint }}>bat = [ </span>
        {values.map((v, k) => (
          <span
            key={k}
            style={{
              color: cluesFound > 0 ? accent : COLORS.muted,
              transition: "color 400ms",
              marginRight: 8,
            }}
          >
            {(v >= 0 ? "+" : "") + v.toFixed(2)}
          </span>
        ))}
        <span style={{ color: COLORS.faint }}>… ]</span>
        <span style={{ color: COLORS.faint, fontSize: 11 }}> (8 of 12,288 — Ch. 7's list)</span>
      </div>
      {/* meaning meter */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
        <Mono style={{ fontSize: 11, color: sentence.pole === 1 ? COLORS.faint : accent }}>flying animal</Mono>
        <div style={{ position: "relative", flex: 1, maxWidth: 260, height: 4, background: "rgba(255,255,255,.1)", borderRadius: 2 }}>
          <div style={{
            position: "absolute", top: -3, width: 10, height: 10, borderRadius: "50%",
            background: cluesFound > 0 ? accent : COLORS.muted,
            left: `calc(${50 + sentence.pole * lean * 44}% - 5px)`,
            transition: "left 500ms cubic-bezier(.2,.7,.3,1), background 400ms",
          }} />
        </div>
        <Mono style={{ fontSize: 11, color: sentence.pole === 1 ? accent : COLORS.faint }}>baseball bat</Mono>
      </div>
    </div>
  );
}

// Lay the sentence out in one SVG so beams can be drawn between words.
function BeamSentence({ sentence, accent, picked, onPick }) {
  const { words, focus, clues } = sentence;
  const CHAR_W = 7.4, GAP = 14, H = 150, BASE = 118;
  const pos = words.reduce((acc, w) => {
    const x = acc.length ? acc[acc.length - 1].x + acc[acc.length - 1].width + GAP : 10;
    const width = w.length * CHAR_W;
    acc.push({ x, cx: x + width / 2, width });
    return acc;
  }, []);
  const last = pos[pos.length - 1];
  const total = last.x + last.width + GAP + 4;
  const found = clues.filter((c) => picked.includes(c)).length;

  return (
    <div>
      <svg viewBox={`0 0 ${total} ${H}`} style={{ width: "100%", maxWidth: total * 1.6, display: "block" }}>
        {/* beams from the focus word to picked words */}
        {picked.map((i) => {
          const isClue = clues.includes(i);
          const from = pos[sentence.focus].cx;
          const to = pos[i].cx;
          const mid = (from + to) / 2;
          const lift = Math.min(90, Math.abs(to - from) * 0.55);
          return (
            <path
              key={i}
              d={`M ${from} ${BASE - 22} Q ${mid} ${BASE - 22 - lift} ${to} ${BASE - 22}`}
              fill="none"
              stroke={isClue ? accent : COLORS.faint}
              strokeWidth={isClue ? 2 : 1}
              strokeDasharray={isClue ? "none" : "3 4"}
              opacity={isClue ? 0.9 : 0.35}
              style={{ strokeDashoffset: 0 }}
            />
          );
        })}
        {/* words */}
        {words.map((w, i) => {
          const isFocus = i === focus;
          const isPicked = picked.includes(i);
          const isClue = clues.includes(i);
          return (
            <g key={i} onClick={() => !isFocus && onPick(i)} style={{ cursor: isFocus ? "default" : "pointer" }}>
              <rect
                x={pos[i].x - 4} y={BASE - 18} width={pos[i].width + 8} height={26} rx={6}
                fill={isFocus ? accent + "33" : isPicked && isClue ? accent + "22" : "transparent"}
                stroke={isFocus ? accent : isPicked ? (isClue ? accent : COLORS.faint) : "rgba(255,255,255,.12)"}
                strokeWidth={isFocus ? 1.5 : 1}
              />
              <text
                x={pos[i].cx} y={BASE}
                textAnchor="middle" fontSize="13" fontFamily="'JetBrains Mono', monospace"
                fill={isFocus ? "#E7EAF2" : isPicked ? (isClue ? accent : COLORS.faint) : "#98A2B8"}
              >
                {w}
              </text>
            </g>
          );
        })}
      </svg>
      <Prose muted style={{ fontSize: 14 }}>
        {found === clues.length
          ? <>All clues found — this “bat” is <span style={{ color: accent }}>{sentence.meaning}</span>.</>
          : `Click the words that reveal which “bat” this is. ${found}/${clues.length} clues found.`}
      </Prose>
    </div>
  );
}

function ClueGame({ accent }) {
  const [picked0, setPicked0] = useState([]);
  const [picked1, setPicked1] = useState([]);
  const pick = (setter) => (i) => setter((p) => (p.includes(i) ? p : [...p, i]));
  const found0 = SENTENCES[0].clues.filter((c) => picked0.includes(c)).length;
  const found1 = SENTENCES[1].clues.filter((c) => picked1.includes(c)).length;

  return (
    <Slide wide>
      <Kicker accent={accent}>You already do this</Kicker>
      <Heading size="h2">Find the clues — and watch the numbers move.</Heading>
      <Prose muted>
        Same word, two sentences — and notice: both “bat”s start with the
        <em> identical</em> list of numbers, because the lookup from Chapter 7
        can't see the sentence. Click the clue words and watch each copy's
        numbers get pushed apart. Every clue sits <em>before</em> “bat” on
        purpose — you'll see why in two slides.
      </Prose>
      <Card>
        <BeamSentence sentence={SENTENCES[0]} accent={accent} picked={picked0} onPick={pick(setPicked0)} />
        <VectorStrip sentence={SENTENCES[0]} cluesFound={found0} accent={accent} />
      </Card>
      <Card>
        <BeamSentence sentence={SENTENCES[1]} accent={accent} picked={picked1} onPick={pick(setPicked1)} />
        <VectorStrip sentence={SENTENCES[1]} cluesFound={found1} accent={accent} />
      </Card>
      <Prose muted style={{ fontSize: 15 }}>
        {found0 + found1 === 0
          ? "The two number lists above are identical right now. Your clicks will change that."
          : "That's attention doing its one job: mixing a weighted dose of each clue's vector into “bat”, so the same starting numbers become two different meanings."}
      </Prose>
      <HonestNote>
        The eight numbers and the two labeled directions are illustrative —
        real dimensions are unlabeled (Chapter 8's superposition) and the real
        update happens across all 12,288 at once. What's faithful: both copies
        genuinely start identical, and context genuinely rewrites the numbers.
      </HonestNote>
    </Slide>
  );
}

// ---- The loaded final word ---------------------------------------------------
const MYSTERY_STORY =
  "The butler had polished the silver knife all evening. At midnight the candles went out and a scream echoed through the manor. When the lights returned, the detective pointed across the room: the murderer was the";
// Content words whose "cargo" visibly gets packed into the final vector.
const CARGO = [
  { word: "butler", color: "#6C9EF8" },
  { word: "knife", color: "#E5B567" },
  { word: "midnight", color: "#4FD6BE" },
  { word: "scream", color: "#E58FB1" },
  { word: "detective", color: "#7BC97B" },
];

function LoadedWordSlide({ accent }) {
  const [packed, setPacked] = useState(0); // how many cargo items loaded
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const runToken = useRef(0);

  const pack = async () => {
    const token = ++runToken.current;
    setRunning(true);
    setPacked(0);
    setResult(null);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let i = 1; i <= CARGO.length; i++) {
      await sleep(650);
      if (runToken.current !== token) return;
      setPacked(i);
    }
    setRunning(false);
    // Now ask the real model — the candidates it returns are computed from
    // exactly this kind of loaded final vector.
    setLoading(true);
    try {
      const data = await predictNext(MYSTERY_STORY, { mode: "completion", temperature: 0.4 });
      if (runToken.current === token) setResult(data);
    } catch (err) {
      if (runToken.current === token) setResult({ error: err.message });
    }
    setLoading(false);
  };

  const storyParts = MYSTERY_STORY.split(/(\s+)/);
  const lastWordIdx = storyParts.length - 1; // the final "the" — the loaded word
  const activeCargo = new Set(CARGO.slice(0, packed).map((c) => c.word));

  return (
    <Slide wide>
      <Kicker accent={accent}>Attention's other mode</Kicker>
      <Heading size="h2">Some words have nothing to pick — so one gets built.</Heading>
      <Prose muted>
        “Bat” already held two meanings; attention just <em>selected</em> one.
        But the little word <em>the</em> has no meaning of its own — it's pure
        grammar. Here attention does the opposite job: it <em>builds</em> an
        identity out of the clues before it. Remember Chapter 2's mystery
        novel? Here's the mechanism — the next-word prediction is computed from
        <strong> one vector</strong>, the final word's, and attention is how the
        whole story gets packed into it.
      </Prose>
      <Card>
        <div style={{ fontFamily: FONTS.display, fontSize: 18, fontStyle: "italic", lineHeight: 1.8 }}>
          {storyParts.map((part, i) => {
            const w = part.replace(/[^a-zA-Z]/g, "").toLowerCase();
            const cargo = CARGO.find((c) => c.word === w);
            const lit = cargo && activeCargo.has(cargo.word) && i !== lastWordIdx;
            const isFinal = i === lastWordIdx;
            return (
              <span
                key={i}
                style={{
                  background: lit ? cargo.color + "33" : isFinal ? accent + "44" : "transparent",
                  borderRadius: 4, padding: lit || isFinal ? "0 3px" : 0,
                  transition: "background 400ms",
                  fontWeight: isFinal ? 600 : 400,
                }}
              >
                {part}
              </span>
            );
          })}
          <span style={{ background: accent + "22", borderRadius: 4, padding: "0 8px", marginLeft: 6 }}>___</span>
        </div>
        {/* The cargo bar: what's packed into "was" */}
        <div style={{ marginTop: SPACE.sm }}>
          <Mono style={{ fontSize: 11, color: COLORS.faint }}>
            THE VECTOR AT THE FINAL “the” — {packed === 0 ? "the most forgettable word in English, so far" : "absorbing the story"}
          </Mono>
          <div style={{ display: "flex", height: 18, borderRadius: 5, overflow: "hidden", background: "rgba(255,255,255,.05)", marginTop: 6 }}>
            <div style={{ width: "10%", background: "rgba(255,255,255,.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 9, fontFamily: FONTS.mono, color: COLORS.muted }}>“the”</span>
            </div>
            {CARGO.map((c, i) => (
              <div
                key={c.word}
                style={{
                  width: packed > i ? "18%" : "0%",
                  background: c.color + "88",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "width 500ms cubic-bezier(.2,.7,.3,1)",
                  overflow: "hidden",
                }}
              >
                <span style={{ fontSize: 9, fontFamily: FONTS.mono, color: "#0B0E14", whiteSpace: "nowrap" }}>{c.word}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <div>
        <Button accent={accent} onClick={pack} disabled={running || loading}>
          {running ? "Packing…" : loading ? "Asking the model…" : result ? "Run it again" : "Load the final word"}
        </Button>
      </div>
      {result?.blocked && <BlockedNote />}
      {result?.error && <Prose muted>Couldn't reach the model: {result.error}</Prose>}
      {result?.word && (
        <Card style={{ borderColor: accent + "44" }} className="reveal">
          <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block" }}>
            THE REAL MODEL'S PREDICTION — computed from that one loaded vector
          </Mono>
          <div style={{ fontFamily: FONTS.display, fontSize: 30, marginTop: 6 }}>
            …the murderer was the <span style={{ color: accent }}>{result.word}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: SPACE.sm }}>
            {result.candidates.slice(0, 4).map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Mono style={{ minWidth: 90, fontSize: 14 }}>{c.token}</Mono>
                <div style={{ flex: 1, height: 14, background: "rgba(255,255,255,.05)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${c.pct}%`, background: accent + "88", borderRadius: 4 }} />
                </div>
                <Mono style={{ minWidth: 48, fontSize: 13, color: COLORS.muted, textAlign: "right" }}>{c.pct}%</Mono>
              </div>
            ))}
          </div>
          <Prose muted style={{ fontSize: 14, marginTop: 12 }}>
            It solved the mystery. And look at what the prediction was computed
            from: the vector at “the” — the most forgettable word in English —
            which attention had loaded with the butler, the knife, and the
            scream. <em>That</em> is why prediction done well requires
            understanding.
          </Prose>
        </Card>
      )}
      <HonestNote>
        The cargo bar is a cartoon, but the architecture is real: in a{" "}
        <Term t="transformer" accent={accent}>transformer</Term>, the
        next-word probabilities are read off the final
        position's vector after its last layer. Every earlier word contributes
        only by having been attended to — layer after layer — by that final
        position.
      </HonestNote>
    </Slide>
  );
}

// Context slides "bat" across the meaning map.
function MapSlide({ accent }) {
  const [context, setContext] = useState(null); // null | "sport" | "animal"
  const batPos = context === "sport" ? { x: 30, y: 34 } : context === "animal" ? { x: 74, y: 30 } : { x: 52, y: 52 };

  return (
    <Slide wide>
      <Kicker accent={accent}>What attention does to the map</Kicker>
      <Heading size="h2">Context moves the word.</Heading>
      <Prose muted>
        After the embedding lookup, both “bat”s start at the same point — the
        ambiguous middle. Attention mixes in the neighbors, and the vector
        <em> moves</em>.
      </Prose>
      <Card style={{ padding: SPACE.sm }}>
        <svg viewBox="0 0 100 62" style={{ width: "100%", display: "block" }}>
          {/* sports cluster */}
          {[["ball", 22, 26], ["swing", 34, 22], ["glove", 26, 40]].map(([w, x, y]) => (
            <g key={w}>
              <circle cx={x} cy={y} r="1.3" fill={DOTC(0)} opacity=".8" />
              <text x={x} y={y - 2.4} textAnchor="middle" fontSize="3" fill="#98A2B8" fontFamily="Inter">{w}</text>
            </g>
          ))}
          {/* animal cluster */}
          {[["owl", 70, 22], ["moth", 82, 28], ["cave", 76, 40]].map(([w, x, y]) => (
            <g key={w}>
              <circle cx={x} cy={y} r="1.3" fill={DOTC(1)} opacity=".8" />
              <text x={x} y={y - 2.4} textAnchor="middle" fontSize="3" fill="#98A2B8" fontFamily="Inter">{w}</text>
            </g>
          ))}
          {/* bat */}
          <g style={{ transition: "transform 700ms cubic-bezier(.2,.7,.3,1)", transform: `translate(${batPos.x}px, ${batPos.y}px)` }}>
            <circle r="1.9" fill={accent} />
            <text y="-3" textAnchor="middle" fontSize="3.6" fill="#E7EAF2" fontFamily="Inter" fontWeight="600">bat</text>
          </g>
        </svg>
      </Card>
      <div style={{ display: "flex", gap: SPACE.xs, flexWrap: "wrap" }}>
        <Button accent={accent} onClick={() => setContext("sport")}>“with the ball pitched, he swung the bat”</Button>
        <Button accent={accent} onClick={() => setContext("animal")}>“deep in the cave, something flew — a bat”</Button>
        <Button accent="transparent" style={{ border: `1px solid ${COLORS.hairline}`, color: COLORS.muted }} onClick={() => setContext(null)}>
          No context
        </Button>
      </div>
      <Prose muted style={{ fontSize: 15 }}>
        {context
          ? "Attention added a weighted mix of the neighbors' vectors into “bat” — and it slid toward the right cluster. Same starting token, different final meaning."
          : "Without context, “bat” sits between its meanings. Give it a sentence."}
      </Prose>
    </Slide>
  );
}

function DOTC(i) {
  return ["#6C9EF8", "#4FD6BE", "#E5B567", "#A78BFA"][i % 4];
}

// ---- The one rule: a word can only look backward ----------------------------
// Lay a sentence out in one SVG row (analytic x positions, like BeamSentence)
// so the mask arcs land exactly on the words without DOM measurement.
function rowLayout(words, { charW = 8.4, gap = 16, start = 12 } = {}) {
  const pos = words.reduce((acc, w) => {
    const prev = acc[acc.length - 1];
    const x = prev ? prev.x + prev.width + gap : start;
    const width = Math.max(w.length * charW, 22);
    acc.push({ x, cx: x + width / 2, width });
    return acc;
  }, []);
  const last = pos[pos.length - 1];
  return { pos, total: last.x + last.width + start };
}

const CAUSAL_WORDS = ["A", "bat", "flew", "into", "the", "cave"];

function CausalSlide({ accent }) {
  const [sel, setSel] = useState(CAUSAL_WORDS.length - 1); // default: "cave" sees all
  const { pos, total } = rowLayout(CAUSAL_WORDS);
  const H = 104, BASE = 68;

  return (
    <Slide wide>
      <Kicker accent={accent}>The rule that changes everything</Kicker>
      <Heading size="h2">A word can only look backward.</Heading>
      <Prose muted>
        When the model processes a word, it can see that word and everything
        <em> before</em> it — never what comes after. Tap any word to see
        exactly what it's allowed to pull from.
      </Prose>
      <Card style={{ padding: SPACE.md }}>
        <svg viewBox={`0 0 ${total} ${H}`} style={{ width: "100%", maxWidth: total * 1.7, display: "block", margin: "0 auto" }}>
          {/* backward arcs from the selected word to each earlier word */}
          {pos.map((p, i) => {
            if (i >= sel) return null;
            const from = pos[sel].cx, to = p.cx;
            const lift = Math.min(48, Math.abs(from - to) * 0.5 + 12);
            return (
              <path
                key={i}
                d={`M ${from} ${BASE - 16} Q ${(from + to) / 2} ${BASE - 16 - lift} ${to} ${BASE - 16}`}
                fill="none" stroke={accent} strokeWidth="1.6" opacity="0.85"
              />
            );
          })}
          {CAUSAL_WORDS.map((w, i) => {
            const isSel = i === sel;
            const reachable = i < sel;
            const blocked = i > sel;
            return (
              <g key={i} onClick={() => setSel(i)} style={{ cursor: "pointer", opacity: blocked ? 0.32 : 1, transition: "opacity 280ms" }}>
                <rect
                  x={pos[i].x - 5} y={BASE - 20} width={pos[i].width + 10} height={28} rx={7}
                  fill={isSel ? accent + "33" : "transparent"}
                  stroke={isSel || reachable ? accent : "rgba(255,255,255,.14)"}
                  strokeWidth={isSel ? 1.6 : 1}
                  strokeDasharray={blocked ? "3 3" : "none"}
                  style={{ transition: "all 280ms" }}
                />
                <text
                  x={pos[i].cx} y={BASE} textAnchor="middle" fontSize="14"
                  fontFamily="'JetBrains Mono', monospace"
                  fill={isSel ? COLORS.text : reachable ? accent : COLORS.faint}
                  style={{ transition: "fill 280ms" }}
                >
                  {w}
                </text>
              </g>
            );
          })}
        </svg>
      </Card>
      <Prose muted style={{ fontSize: 15, minHeight: "3em" }}>
        {sel === 0 ? (
          <><Mono accent={accent}>“A”</Mono> is the first word — nothing sits behind it to look at yet.</>
        ) : (
          <>
            <Mono accent={accent}>“{CAUSAL_WORDS[sel]}”</Mono> can look at the {sel} word{sel > 1 ? "s" : ""} before it. The
            dimmed ones haven't been read yet, so they're off-limits — no peeking ahead.
          </>
        )}
      </Prose>
      <HonestNote>
        This one-directional constraint has a name: <strong>causal masking</strong>.
        In a GPT-style model, every score a word would give a <em>later</em> word
        is forced to zero before it can matter. Encoder models (like BERT) drop
        the mask and read both ways — but then they can't generate text one word
        at a time. Want to watch the mask zero out real numbers? The{" "}
        <SidequestLink slug="attention" accent={accent}>Inside Attention</SidequestLink>{" "}
        sidequest does it by hand.
      </HonestNote>
      <Prose muted style={{ fontSize: 15 }}>
        The quiet consequence: because each word absorbs only what came before
        it, the <em>later</em> a word sits, the more it has seen — which is
        exactly why the model reads its next-word guess off the very last
        position. It also means <em>where</em> you place a fact in the prompt
        changes what can see it — a real, measurable effect the{" "}
        <SidequestLink slug="position-bias" accent={accent}>Where You Put It Matters</SidequestLink>{" "}
        sidequest explores.
      </Prose>
    </Slide>
  );
}

// ---- You rewind. A model can't. (forward-packing) ---------------------------
const VS_WORDS = ["A", "bat", "flew", "into", "the", "cave"];

function VsRow({ states, arcs, accent }) {
  const { pos, total } = rowLayout(VS_WORDS, { charW: 8.2, gap: 12, start: 10 });
  const H = 78, BASE = 46;
  return (
    <svg viewBox={`0 0 ${total} ${H}`} style={{ width: "100%", display: "block" }}>
      {arcs.map((a, i) => {
        const from = pos[a.from].cx, to = pos[a.to].cx;
        return (
          <path
            key={i}
            d={`M ${from} ${BASE - 15} Q ${(from + to) / 2} ${BASE - 15 - a.lift} ${to} ${BASE - 15}`}
            fill="none" stroke={accent} strokeWidth="2"
            strokeDasharray={a.dashed ? "5 4" : "none"} opacity="0.9"
          />
        );
      })}
      {VS_WORDS.map((w, i) => {
        const s = states[i] || {};
        let stroke = "rgba(255,255,255,.14)", fill = "transparent", tf = COLORS.muted, dash = "none";
        if (s.reading) { stroke = COLORS.text; tf = COLORS.text; }
        if (s.locked) { stroke = COLORS.faint; tf = COLORS.faint; dash = "3 3"; }
        if (s.fixed || s.filled) { stroke = accent; fill = accent + "2e"; tf = accent; }
        return (
          <g key={i}>
            <rect
              x={pos[i].x - 5} y={BASE - 18} width={pos[i].width + 10} height={26} rx={7}
              fill={fill} stroke={stroke} strokeWidth="1.3" strokeDasharray={dash}
              style={{ transition: "all 320ms" }}
            />
            <text
              x={pos[i].cx} y={BASE} textAnchor="middle" fontSize="13.5"
              fontFamily="'JetBrains Mono', monospace" fill={tf}
              style={{ transition: "fill 320ms" }}
            >
              {w}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const VS_HUMAN_CAP = [
  "Reads left to right, holding a fuzzy sense of “bat.”",
  "Hits “bat” — could be animal or object. Holds it loosely.",
  "Reaches “cave” — now it's obvious: the flying animal.",
  "Goes back and rewrites “bat” itself. The past is edited.",
];
const VS_AI_CAP = [
  "Reads left to right too — but under the backward-only rule.",
  "At “bat”: nothing ahead to look at yet. It stays fuzzy.",
  "At “cave”: now it can look back — at “bat” and “flew.”",
  "“bat” stays locked. The whole picture piles into “cave” instead.",
];

function ForwardPackSlide({ accent }) {
  const [hp, setHp] = useState(0);
  const [ap, setAp] = useState(0);
  const [tag, setTag] = useState(false);
  const [status, setStatus] = useState("same sentence, same clues, two different strategies");
  const runToken = useRef(0);
  const timers = useRef([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clearTimers, []);

  const play = () => {
    const token = ++runToken.current;
    clearTimers();
    setHp(0); setAp(0); setTag(false);
    setStatus("reading …");
    const T = (fn, ms) => timers.current.push(setTimeout(() => { if (runToken.current === token) fn(); }, ms));
    T(() => setHp(1), 300);
    T(() => setHp(2), 2000);
    T(() => setHp(3), 3000);
    T(() => setAp(1), 600);
    T(() => setAp(2), 2300);
    T(() => setAp(3), 3200);
    T(() => { setTag(true); setStatus("done — one edits the past, the other builds forward"); }, 4200);
  };

  // Human: reads bat → reads cave → goes back and rewrites bat in place.
  const humanStates = [];
  if (hp === 1) humanStates[1] = { reading: true };
  if (hp === 2) humanStates[5] = { reading: true };
  if (hp >= 3) humanStates[1] = { fixed: true };
  const humanArcs = hp >= 3 ? [{ from: 5, to: 1, lift: 34, dashed: true }] : [];

  // AI: reads bat (then locked) → reads cave → cave attends back to bat + flew.
  const aiStates = [];
  if (ap === 1) aiStates[1] = { reading: true };
  if (ap >= 2) aiStates[1] = { locked: true };
  if (ap === 2) aiStates[5] = { reading: true };
  if (ap >= 3) aiStates[5] = { filled: true };
  const aiArcs = ap >= 3 ? [{ from: 5, to: 1, lift: 40 }, { from: 5, to: 2, lift: 24 }] : [];

  const panel = { flex: "1 1 320px", background: COLORS.surface, border: `1px solid ${COLORS.hairline}`, borderRadius: 14, padding: SPACE.md };
  const label = { fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: COLORS.faint, display: "block", marginBottom: 10 };
  const cap = { fontFamily: FONTS.mono, fontSize: 12.5, lineHeight: 1.5, color: COLORS.muted, minHeight: "3em", marginTop: 8 };

  return (
    <Slide wide>
      <Kicker accent={accent}>The counterintuitive part</Kicker>
      <Heading size="h2">You rewind. A model can't.</Heading>
      <Prose muted>
        Read this: <em>“A bat flew into the cave.”</em> The word “bat” comes
        first — before any clue that it's an animal. Watch a person and a model
        handle that same problem in completely different ways.
      </Prose>
      <div style={{ display: "flex", flexWrap: "wrap", gap: SPACE.sm }}>
        <div style={panel}>
          <span style={label}>A person reading</span>
          <VsRow states={humanStates} arcs={humanArcs} accent={accent} />
          <div style={cap}>{VS_HUMAN_CAP[hp]}</div>
        </div>
        <div style={panel}>
          <span style={label}>A model reading</span>
          <VsRow states={aiStates} arcs={aiArcs} accent={accent} />
          <div style={cap}>{VS_AI_CAP[ap]}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.sm, flexWrap: "wrap" }}>
        <Button accent={accent} onClick={play}>{hp === 0 && ap === 0 ? "Play both →" : "Replay"}</Button>
        <Mono style={{ fontSize: 12, color: COLORS.faint }}>{status}</Mono>
      </div>
      <Prose style={{ fontSize: 16, textAlign: "center", opacity: tag ? 1 : 0.25, transition: "opacity 500ms" }}>
        A person rewrites the past. A model can't — so it packs the meaning
        <em> forward</em> instead.
      </Prose>
      <HonestNote>
        Where does “bat's” meaning go, then? Since the model can never reach
        back and update “bat,” the resolved picture — the cave that a real,
        animal bat just flew into — collects in <strong>“cave,”</strong> a later
        word that <em>was</em> allowed to look back. The meaning isn't lost; it
        lives downstream. (Real models stack ~100 layers, so information does
        creep around over many passes — but no single position ever attends
        forward. That's Chapter 1's blindfold, made mechanical.)
      </HonestNote>
    </Slide>
  );
}

export default function Ch09Attention({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Act III · Inside the Machine — Chapter 9</Kicker>
          <Heading>Attention</Heading>
          <Lead>
            The map from last chapter has a flaw: “bat” gets <em>one</em> point
            on it. But a bat in a dugout and a bat in a cave are different
            things. The fix is a 2017 idea that created the modern AI era.
          </Lead>
        </Slide>
      );
    case 1:
      return (
        <Slide>
          <Kicker accent={accent}>The flaw</Kicker>
          <Heading size="h2">The lookup table can't see the sentence.</Heading>
          <Card>
            <div style={{ fontFamily: FONTS.mono, fontSize: 15, lineHeight: 2.1 }}>
              <div><span style={{ color: COLORS.muted }}>“I swung the </span><span style={{ color: accent }}>bat</span><span style={{ color: COLORS.muted }}>…”</span> → embedding <span style={{ color: accent }}>#42871</span></div>
              <div><span style={{ color: COLORS.muted }}>“The </span><span style={{ color: accent }}>bat</span><span style={{ color: COLORS.muted }}> flew…”</span> → embedding <span style={{ color: accent }}>#42871</span></div>
            </div>
          </Card>
          <Prose>
            Same token, same lookup, <strong>identical numbers</strong>. Step
            two of Chapter 7 hands the model a{" "}
            <Term t="vector" accent={accent}>vector</Term> that means “bat, some
            kind of.” If the meaning is going to sharpen, information has to
            flow in from the <em>other words in the sentence</em>.
          </Prose>
          <Prose muted>
            You resolve this so fast you can't feel yourself doing it. Next
            slide: do it slowly.
          </Prose>
        </Slide>
      );
    case 2:
      return <ClueGame accent={accent} />;
    case 3:
      return <MapSlide accent={accent} />;
    case 4:
      return <LoadedWordSlide accent={accent} />;
    case 5:
      return <CausalSlide accent={accent} />;
    case 6:
      return <ForwardPackSlide accent={accent} />;
    case 7:
      return (
        <Slide>
          <Kicker accent={accent}>Not one spotlight — dozens</Kicker>
          <Heading size="h2">Attention heads work in parallel.</Heading>
          <Prose>
            One pass of attention isn't a single beam — it's many independent
            <strong> heads</strong>, each free to learn its own kind of
            relationship. In practice, researchers have found heads that track
            things like:
          </Prose>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.xs }}>
            {[
              ["a grammar head", "which noun does this verb belong to?"],
              ["a reference head", "who does “she” refer to?"],
              ["a copying head", "has this exact phrase appeared earlier?"],
              ["a disambiguation head", "which meaning of “bat” fits here?"],
            ].map(([name, q], i) => (
              <div key={name} className="reveal" style={{ animationDelay: `${i * 120}ms`, display: "flex", gap: 12, alignItems: "baseline" }}>
                <Mono accent={accent} style={{ fontSize: 13, minWidth: 170 }}>{name}</Mono>
                <Prose muted style={{ fontSize: 15 }}><em>{q}</em></Prose>
              </div>
            ))}
          </div>
          <Prose muted>
            GPT-3 runs 96 heads per layer. Every word consults every head's
            findings at once — and this all happens in parallel, which is why
            these models train so well on modern chips.
          </Prose>
        </Slide>
      );
    case 8:
      return (
        <Slide>
          <Kicker accent={accent}>Name it</Kicker>
          <Heading size="h2">The T in GPT.</Heading>
          <Prose>
            This mechanism is <strong>attention</strong>, and the architecture
            built around it is the <strong>Transformer</strong> — the T in GPT
            (Generative Pre-trained Transformer). It arrived in a 2017 paper
            with a title that turned out to be a prophecy:
            <em> “<Term t="attention-paper" accent={accent}>Attention Is All You Need</Term>.”</em>
            The backward-only rule you just watched has a formal name too —
            <strong> causal masking</strong> — and it's what makes this the
            <em> generating</em> half of that architecture.
          </Prose>
          <Prose>
            And one ingredient we've been quietly hiding: <strong>order</strong>.
            To attention alone, a sentence is just a bag of vectors — “dog
            bites man” and “man bites dog” would be indistinguishable. So each
            token's <em>position</em> gets woven in too — not stored in one
            dedicated slot, but spread across the whole vector: older models
            add a full position-pattern to all 12,288 numbers before layer 1;
            newer ones (RoPE) rotate pairs of numbers inside attention by an
            angle that depends on position, so relative distance shows up in
            the scores directly.
          </Prose>
          <HonestNote>
            Our beams are the honest cartoon. In the real computation, every
            word emits a query (“what am I looking for?”), a key (“what am I?”),
            and a value (“what do I offer?”) — all learned — and attention
            scores every query against every key simultaneously. Weighted sums
            of values do the mixing. Same idea, industrial form.
          </HonestNote>
          <Prose muted style={{ fontSize: 15 }}>
            Want to see that industrial form with real numbers? The{" "}
            <SidequestLink slug="attention" accent={accent}>Inside Attention</SidequestLink>{" "}
            deep dive walks the full arithmetic on a four-word sentence. It's
            optional, opens in a new tab, and your place here stays put.
          </Prose>
        </Slide>
      );
    case 9:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "The embedding lookup gives “bat” identical numbers in every sentence — you watched context push the two copies apart.",
            "Attention lets each word pull in a weighted mix of earlier words: it can select a meaning (“bat”) or build one from scratch (“the”).",
            "But a word can only look backward — so it can't revise itself from clues that come later. When they do, the meaning packs forward into a downstream word.",
            "The final word's vector absorbs the whole story — and the next-word prediction is read from that one vector alone.",
            "Many heads run in parallel, each tracking its own relationship. This is the Transformer — the T in GPT.",
          ]}
          next="Layers of Thought — attention runs once per layer, and there are ~100 layers. Time to stack."
          aside={
            <>
              Curious how the “weighted mix” is actually computed? The optional{" "}
              <SidequestLink slug="attention" accent={accent}>Inside Attention</SidequestLink>{" "}
              sidequest does the math by hand — queries, keys,{" "}
              <Term t="softmax" accent={accent}>softmax</Term>, the
              mask — in a separate tab, without losing your spot.
            </>
          }
        />
      );
  }
}
