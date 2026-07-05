// Sidequest — Inside Attention
// The deep dive Chapter 9 points at: queries and keys, the score matrix,
// softmax taught in stages, the causal mask, values and the weighted sum,
// heads, and the parameter arithmetic. One tiny example (4 tokens × 4 dims),
// every number on screen computed live in the browser.
import { useEffect, useRef, useState } from "react";
import {
  Slide, Kicker, Heading, Lead, Prose, Card, Button, GhostButton, Mono, HonestNote,
} from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";

// ---- The running example -----------------------------------------------------
// Chapter 9's sentence, trimmed to its four load-bearing words. The q/k/v
// vectors are hand-picked to be readable (see the honest footnotes), but
// every dot product, exponential, and weighted sum below is computed live.
const TOKENS = ["The", "bat", "flew", "cave"];
const DK = 4; // vector length; real heads use 64–128
const SQRT_DK = Math.sqrt(DK); // = 2

const Q = [
  [0.2, 0.1, 0.0, 0.1], // The — barely looking for anything
  [0.1, 1.1, 0.2, 0.8], // bat — looking for "which bat am I?" clues
  [0.9, 0.3, 0.1, 0.2], // flew — looking for its subject
  [0.3, 0.8, 0.1, 0.7], // cave — looking for what arrived here
];
const K = [
  [0.1, 0.0, 0.1, 0.0], // The — offers almost nothing
  [0.8, 0.2, 0.1, 0.3], // bat — "I'm a noun, possibly an animal"
  [0.2, 1.2, 0.1, 0.9], // flew — "I'm animal-flavored motion"
  [0.1, 0.9, 0.2, 1.1], // cave — "I'm an animal habitat"
];
const V = [
  [0.0, 0.1, 0.0, 0.0],   // The — passes along nearly nothing
  [0.5, 0.1, 0.2, 0.1],   // bat — passes along "bat-ness"
  [-0.4, 0.9, 0.3, 0.2],  // flew — passes along "flying, animal"
  [-0.5, 0.7, 0.1, 0.4],  // cave — passes along "cave, habitat"
];

const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
// Scaled scores: S[i][j] = q_i · k_j / √d_k  (the real formula)
const SCORES = Q.map((q) => K.map((k) => dot(q, k) / SQRT_DK));

function softmax(row) {
  const exps = row.map((s) => Math.exp(s));
  const sum = exps.reduce((a, b) => a + b, 0);
  return { exps, sum, weights: exps.map((e) => e / sum) };
}

const fmtU = (v, d = 2) => v.toFixed(d);

function VecInline({ values, accent, d = 1 }) {
  return (
    <span style={{ fontFamily: FONTS.mono, fontSize: "0.95em", whiteSpace: "nowrap" }}>
      <span style={{ color: COLORS.faint }}>[ </span>
      {values.map((v, i) => (
        <span key={i} style={{ color: accent || COLORS.text, marginRight: i < values.length - 1 ? 8 : 0 }}>
          {v.toFixed(d)}
        </span>
      ))}
      <span style={{ color: COLORS.faint }}> ]</span>
    </span>
  );
}

function TokenChip({ word, accent, active, dim }) {
  return (
    <span
      className="token-chip"
      style={{
        borderColor: active ? accent : undefined,
        color: dim ? COLORS.faint : active ? accent : COLORS.text,
        background: active ? accent + "18" : undefined,
        transition: "color 280ms, border-color 280ms, background 280ms",
      }}
    >
      {word}
    </span>
  );
}

// ---- Slide 2: queries and keys — click a token, watch the dot product --------
function QKSlide({ accent }) {
  const [target, setTarget] = useState(2); // start on "flew" — the best match
  const qBat = Q[1];
  const kT = K[target];
  const products = qBat.map((q, i) => q * kT[i]);
  const total = products.reduce((a, b) => a + b, 0);
  const scores = K.map((k) => dot(qBat, k));
  const best = scores.indexOf(Math.max(...scores));

  return (
    <Slide wide>
      <Kicker accent={accent}>Questions and name-tags</Kicker>
      <Heading size="h2">A query meets a key.</Heading>
      <Prose muted>
        Every token broadcasts two small vectors. Its <strong>query</strong>:
        “here's what I'm looking for.” Its <strong>key</strong>: “here's what
        I offer.” To score a pair, multiply them position by position and add
        it up — the <strong>dot product</strong>. Click a token below to score
        it against <Mono accent={accent}>bat</Mono>'s query.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 10 }}>
          BAT ASKS — q(bat) = “am I near animal clues?”
        </Mono>
        <div style={{ marginBottom: SPACE.sm }}>
          <Mono accent={accent}>q(bat)</Mono>{" "}
          <VecInline values={qBat} accent={accent} />
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: SPACE.sm }}>
          {TOKENS.map((w, i) => (
            <button key={w} onClick={() => setTarget(i)} style={{ padding: 0 }}>
              <TokenChip word={w} accent={accent} active={i === target} />
            </button>
          ))}
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 14, lineHeight: 2.1, overflowX: "auto" }}>
          <div>
            <span style={{ color: COLORS.muted }}>k({TOKENS[target]}) = </span>
            <VecInline values={kT} />
          </div>
          <div style={{ color: COLORS.muted }}>
            q·k ={" "}
            {products.map((_, i) => (
              <span key={i}>
                <span style={{ color: COLORS.text }}>
                  {qBat[i].toFixed(1)}×{kT[i].toFixed(1)}
                </span>
                {i < products.length - 1 && <span style={{ color: COLORS.faint }}> + </span>}
              </span>
            ))}
            <span style={{ color: COLORS.faint }}> = </span>
            {products.map((p, i) => (
              <span key={i}>
                <span style={{ color: COLORS.text }}>{fmtU(p)}</span>
                {i < products.length - 1 && <span style={{ color: COLORS.faint }}> + </span>}
              </span>
            ))}
            <span style={{ color: COLORS.faint }}> = </span>
            <span style={{ color: accent, fontWeight: 600, fontSize: 16 }}>{fmtU(total)}</span>
          </div>
        </div>
        <Prose muted style={{ fontSize: 14, marginTop: 8 }}>
          {target === best
            ? <>Highest score in the sentence. “flew” offers exactly what “bat” is asking about — the vectors point the same way, so the products stack up.</>
            : target === 0
              ? <>Almost zero. “The” offers nothing “bat” is looking for — the vectors barely overlap, so every product is tiny.</>
              : <>Compare this against the other tokens — the more the two vectors agree, position by position, the bigger the sum.</>}
        </Prose>
      </Card>
      <HonestNote>
        In a real model you don't get to hand-pick these: q = W<sub>Q</sub>·x
        and k = W<sub>K</sub>·x, where x is the token's embedding and
        W<sub>Q</sub>, W<sub>K</sub> are learned weight matrices — Chapter 4's
        dials. We wrote four readable numbers per vector so you can check the
        arithmetic; the multiplications and sums on screen are computed live.
        Real heads use 64–128 numbers per query, not 4.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 3: the score matrix, cell by cell ----------------------------------
function MatrixGrid({ accent, filled, current, masked, showWeights }) {
  // masked: strike upper triangle; showWeights: display softmax weights instead
  const CELL = 64;
  const rows = TOKENS.map((_, i) => (showWeights ? softmax(
    SCORES[i].map((s, j) => (masked && j > i ? -Infinity : s))
  ).weights : null));
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "inline-block" }}>
        <div style={{ display: "flex", marginLeft: CELL + 8 }}>
          {TOKENS.map((w, j) => (
            <div key={j} style={{ width: CELL, textAlign: "center", fontFamily: FONTS.mono, fontSize: 12, color: current && current[1] === j ? accent : COLORS.muted, paddingBottom: 4 }}>
              k·{w}
            </div>
          ))}
        </div>
        {TOKENS.map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: CELL + 8, fontFamily: FONTS.mono, fontSize: 12, color: current && current[0] === i ? accent : COLORS.muted, textAlign: "right", paddingRight: 10 }}>
              q·{w}
            </div>
            {TOKENS.map((_, j) => {
              const idx = i * 4 + j;
              const isFilled = filled > idx;
              const isCurrent = current && current[0] === i && current[1] === j;
              const dead = masked && j > i;
              const val = showWeights && rows[i] ? rows[i][j] : SCORES[i][j];
              const heat = Math.min(1, Math.max(0, (showWeights ? val : val / 1.1)));
              return (
                <div
                  key={j}
                  style={{
                    width: CELL, height: 44,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: `1px solid ${isCurrent ? accent : COLORS.hairline}`,
                    background: dead
                      ? "rgba(224,108,117,.08)"
                      : isFilled ? `rgba(167,139,250,${0.06 + heat * 0.3})` : "transparent",
                    fontFamily: FONTS.mono, fontSize: 13,
                    color: dead ? COLORS.wrong : isFilled ? COLORS.text : COLORS.faint,
                    textDecoration: dead && !showWeights ? "line-through" : "none",
                    transition: "background 280ms, color 280ms, border-color 280ms",
                  }}
                >
                  {dead && showWeights ? "0" : dead ? "−∞" : isFilled ? fmtU(val) : "·"}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreMatrixSlide({ accent }) {
  const [filled, setFilled] = useState(0);
  const [playing, setPlaying] = useState(false);
  const runToken = useRef(0);
  useEffect(() => () => { runToken.current++; }, []);

  const step = () => setFilled((f) => Math.min(16, f + 1));
  const play = async () => {
    const token = ++runToken.current;
    setPlaying(true);
    setFilled(0);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let i = 1; i <= 16; i++) {
      await sleep(i <= 4 ? 420 : 240); // slow start, then speed up
      if (runToken.current !== token) return;
      setFilled(i);
    }
    setPlaying(false);
  };

  const cur = filled < 16 ? [Math.floor(filled / 4), filled % 4] : null;
  const curDone = filled > 0 ? [Math.floor((filled - 1) / 4), (filled - 1) % 4] : null;

  return (
    <Slide wide>
      <Kicker accent={accent}>Every token scores every token</Kicker>
      <Heading size="h2">Sixteen questions, one grid.</Heading>
      <Prose muted>
        Four tokens, each with a query, each scoring all four keys: sixteen dot
        products. Stack the four query vectors into a matrix Q, the four keys
        into K, and all sixteen happen in one multiplication —{" "}
        <Mono accent={accent}>QKᵀ / √d</Mono>. Watch the rows and columns
        collapse into cells.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 10 }}>
          THE SCORE MATRIX — row = who's asking, column = who's answering
        </Mono>
        <MatrixGrid accent={accent} filled={filled} current={cur} />
        {curDone && (
          <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.muted, marginTop: 10 }}>
            q({TOKENS[curDone[0]]}) · k({TOKENS[curDone[1]]}) ={" "}
            <span style={{ color: COLORS.text }}>{fmtU(dot(Q[curDone[0]], K[curDone[1]]))}</span>
            <span style={{ color: COLORS.faint }}> ÷ √4 = </span>
            <span style={{ color: accent }}>{fmtU(SCORES[curDone[0]][curDone[1]])}</span>
          </div>
        )}
      </Card>
      <div style={{ display: "flex", gap: SPACE.sm }}>
        <Button accent={accent} onClick={play} disabled={playing}>
          {playing ? "Filling…" : filled >= 16 ? "Replay" : "Play"}
        </Button>
        <GhostButton onClick={step} disabled={playing || filled >= 16}>Step one cell</GhostButton>
      </div>
      <Prose muted style={{ fontSize: 15 }}>
        {filled >= 16
          ? <>Read the <Mono accent={accent}>bat</Mono> row: it scored “flew” (1.04) and “cave” (0.96) far above “The” (0.01). The grid already knows which words matter to which.</>
          : "Each cell is one query-key dot product, divided by √4 = 2."}
      </Prose>
      <HonestNote>
        The ÷√d is real and matters: dot products of longer vectors have more
        terms, so their raw scores grow with dimension. Dividing by √d (√64 = 8
        for a typical head) keeps scores in a workable range before the next
        step. Real matrices are thousands of tokens on a side, recomputed at
        every layer — this 4×4 is the same computation at toy scale.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 4: softmax in stages ----------------------------------------------
function SoftmaxSlide({ accent }) {
  const [stage, setStage] = useState(0); // 0 raw, 1 exp, 2 normalized
  const [gap, setGap] = useState(1);
  const raw = SCORES[1]; // the "bat" row
  const scaled = raw.map((s) => s * gap);
  const { exps, sum, weights } = softmax(scaled);
  const stageVals = stage === 0 ? scaled : stage === 1 ? exps : weights;
  const maxVal = Math.max(...stageVals);
  const stageLabel = ["THE RAW SCORES — arbitrary scale", "STEP 1 — RAISE e TO EACH SCORE", "STEP 2 — DIVIDE BY THE SUM"][stage];

  return (
    <Slide wide>
      <Kicker accent={accent}>From scores to a budget</Kicker>
      <Heading size="h2">Softmax: turning scores into shares.</Heading>
      <Prose muted>
        The <Mono accent={accent}>bat</Mono> row is a list of scores on no
        particular scale. What we need is a <strong>budget</strong>: how much
        of bat's attention goes to each token. A budget's shares must be
        positive and add up to exactly 1. Two steps get us there.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 10 }}>{stageLabel}</Mono>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TOKENS.map((w, j) => (
            <div key={w} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Mono style={{ minWidth: 52, fontSize: 13 }}>{w}</Mono>
              <div style={{ flex: 1, height: 16, background: "rgba(255,255,255,.05)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(stageVals[j] / maxVal) * 100}%`,
                  background: stage === 2 ? accent + "cc" : accent + "66",
                  borderRadius: 4,
                  transition: "width 400ms cubic-bezier(.2,.7,.3,1), background 400ms",
                }} />
              </div>
              <Mono style={{ minWidth: 120, fontSize: 13, color: COLORS.muted, textAlign: "right" }}>
                {stage === 0 && fmtU(stageVals[j])}
                {stage === 1 && <>e^{fmtU(scaled[j])} = {fmtU(stageVals[j], 3)}</>}
                {stage === 2 && <>{fmtU(exps[j], 3)}/{fmtU(sum, 3)} = <span style={{ color: accent }}>{fmtU(stageVals[j], 3)}</span></>}
              </Mono>
            </div>
          ))}
        </div>
        {stage === 2 && (
          <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.correct, marginTop: 10 }}>
            Σ = {fmtU(weights.reduce((a, b) => a + b, 0), 3)} — the whole budget, spent.
          </div>
        )}
      </Card>
      <div style={{ display: "flex", gap: SPACE.sm, alignItems: "center", flexWrap: "wrap" }}>
        <Button accent={accent} onClick={() => setStage((s) => (s + 1) % 3)}>
          {stage === 0 ? "Step 1: exponentiate" : stage === 1 ? "Step 2: normalize" : "Back to raw scores"}
        </Button>
        {stage === 2 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 240, flex: 1, maxWidth: 340 }}>
            <Mono style={{ fontSize: 11, color: COLORS.faint, whiteSpace: "nowrap" }}>SCORE GAP ×{gap.toFixed(1)}</Mono>
            <input type="range" min="0.5" max="4" step="0.1" value={gap}
              onChange={(e) => setGap(parseFloat(e.target.value))} />
          </div>
        )}
      </div>
      <Prose muted style={{ fontSize: 15 }}>
        {stage === 0 && "Why e^x? It keeps the order (bigger score → bigger result), makes every value positive, and stretches gaps — a lead of 1 becomes a factor of e ≈ 2.7."}
        {stage === 1 && "All positive now, order preserved, and the gap between “flew” and “The” has widened. One problem left: these don't sum to 1."}
        {stage === 2 && "Divide each by the total and you have shares of a budget. Drag the slider: widen the raw score gaps and softmax sharpens toward winner-take-all — that exponential stretch again."}
      </Prose>
      <HonestNote>
        This is the full formula — softmax(QKᵀ/√d) — nothing else hidden in
        this step. The gap slider is the same mathematics as Chapter 11's
        temperature dial (temperature divides scores; the slider multiplies
        them), just applied to attention scores instead of word probabilities.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 5: the causal mask --------------------------------------------------
function MaskSlide({ accent }) {
  const [maskOn, setMaskOn] = useState(false);
  const batMasked = softmax(SCORES[1].slice(0, 2)); // bat sees The, bat only
  const batFull = softmax(SCORES[1]);

  return (
    <Slide wide>
      <Kicker accent={accent}>A confession</Kicker>
      <Heading size="h2">No peeking at the future.</Heading>
      <Prose muted>
        We cheated. For three slides, “bat” has been scoring “flew” and
        “cave” — words that come <em>after</em> it. A GPT-style model is
        trained to predict the next word, so each position may only look
        backward — Chapter 1's blindfold, now enforced in the arithmetic.
        The fix: before softmax, overwrite every look-ahead score with −∞.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 10 }}>
          {maskOn ? "AFTER SOFTMAX — every struck cell became a hard 0" : "THE MASK — strike the upper triangle"}
        </Mono>
        <MatrixGrid accent={accent} filled={16} masked showWeights={maskOn} />
      </Card>
      <div>
        <Button accent={accent} onClick={() => setMaskOn((m) => !m)}>
          {maskOn ? "Show the −∞ scores" : "Run softmax over the masked rows"}
        </Button>
      </div>
      <Prose muted style={{ fontSize: 15 }}>
        {maskOn ? (
          <>
            Why −∞? Because e^(−∞) = 0: the struck tokens get exactly zero
            budget, and each row's remaining shares renormalize to sum to 1.
            “bat” now spends {fmtU(batMasked.weights[1], 2)} on itself and{" "}
            {fmtU(batMasked.weights[0], 2)} on “The” — instead of{" "}
            {fmtU(batFull.weights[2], 2)} on “flew.”
          </>
        ) : (
          <>
            Each row keeps its own past: “The” sees only itself, “bat” sees two
            tokens, and “cave” — the final position — still sees everything.
          </>
        )}
      </Prose>
      <Prose muted style={{ fontSize: 15 }}>
        So is “bat” doomed to ambiguity? At its own position, for now, yes.
        But look at the bottom row: by the time the model predicts what comes
        <em> after</em> “cave,” that final position has attended to “bat” and
        “flew” with no mask in the way. The story flows forward into the last
        word — which is exactly Chapter 9's loaded final word.
      </Prose>
      <Card style={{ borderColor: accent + "44" }}>
        <Mono style={{ fontSize: 11, color: accent, display: "block", marginBottom: 8 }}>
          NAME IT — AND COLLECT SOME JARGON
        </Mono>
        <Prose>
          This triangle of −∞ has a formal name: <strong>causal masking</strong>.
          That's it — “causal” is just the no-peeking rule you've been watching
          since Chapter 1's blindfolded storyteller, written into the
          arithmetic. And here's your reward for doing the math: GPT, Claude,
          Llama, Gemini, Mistral — every famous LLM is this exact
          architecture. The spec sheets call it{" "}
          <strong>decoder-only, causally masked</strong>: the generating half
          of the 2017 Transformer, running the mask you just applied by hand.
          Two pieces of jargon you now own outright.
        </Prose>
      </Card>
      <HonestNote>
        This mask is why the machine writing your answer genuinely cannot peek
        at its own future — the future's scores are −∞ by construction, at
        every layer, every head. (In practice code often uses a very large
        negative number rather than a true −∞; same effect after softmax.)
        “Decoder-only” names the half of the original encoder–decoder
        Transformer these models kept — that's the text engine; multimodal
        add-ons like vision encoders bolt on beside it. Bidirectional models
        like BERT skip the mask — but then they can't generate text left to
        right.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 6: values and the weighted sum --------------------------------------
function ValuesSlide({ accent }) {
  const [blended, setBlended] = useState(0); // how many value vectors folded in
  const [playing, setPlaying] = useState(false);
  const runToken = useRef(0);
  useEffect(() => () => { runToken.current++; }, []);

  // The "cave" row — the final position, mask-legal view of the whole sentence.
  const { weights } = softmax(SCORES[3]);
  const partial = [0, 0, 0, 0].map((_, d) =>
    V.slice(0, blended).reduce((s, v, j) => s + weights[j] * v[d], 0)
  );

  const play = async () => {
    const token = ++runToken.current;
    setPlaying(true);
    setBlended(0);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let j = 1; j <= 4; j++) {
      await sleep(900);
      if (runToken.current !== token) return;
      setBlended(j);
    }
    setPlaying(false);
  };

  return (
    <Slide wide>
      <Kicker accent={accent}>The payoff</Kicker>
      <Heading size="h2">Spend the budget: a weighted blend.</Heading>
      <Prose muted>
        One vector left. Along with its query and key, every token offers a{" "}
        <strong>value</strong>: “if you attend to me, <em>this</em> is what
        I'll pass along.” A token's output is everyone's values, each scaled by
        its attention share, added up. Here is the final position —{" "}
        <Mono accent={accent}>cave</Mono>, the one the mask lets see
        everything — collecting its blend.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 10 }}>
          OUTPUT(cave) = Σ weight × value — computed live below
        </Mono>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TOKENS.map((w, j) => {
            const on = blended > j;
            return (
              <div key={w} style={{ display: "flex", alignItems: "center", gap: 12, opacity: on ? 1 : 0.35, transition: "opacity 400ms" }}>
                <Mono style={{ minWidth: 96, fontSize: 13, color: on ? accent : COLORS.muted }}>
                  {fmtU(weights[j], 3)} × v({w})
                </Mono>
                <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: on ? COLORS.text : COLORS.faint }}>
                  = <VecInline values={V[j].map((v) => weights[j] * v)} d={2} accent={on ? undefined : COLORS.faint} />
                </div>
              </div>
            );
          })}
          <div style={{ borderTop: `1px solid ${COLORS.hairline}`, paddingTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
            <Mono style={{ minWidth: 96, fontSize: 13, color: COLORS.muted }}>output(cave)</Mono>
            <div style={{ fontFamily: FONTS.mono, fontSize: 14 }}>
              = <VecInline values={partial} d={2} accent={blended === 4 ? accent : undefined} />
            </div>
          </div>
        </div>
      </Card>
      <div>
        <Button accent={accent} onClick={play} disabled={playing}>
          {playing ? "Blending…" : blended === 4 ? "Replay the blend" : "Blend the values"}
        </Button>
      </div>
      <Prose muted style={{ fontSize: 15 }}>
        {blended === 4
          ? <>That output vector is “cave” <em>after</em> attention: about two-thirds of it is “flew” and “bat” material. The word's representation has absorbed its context — this is the mechanism that pushed Chapter 9's two “bat”s apart.</>
          : "Watch each value vector get scaled by its share of the budget, then folded into the running total."}
      </Prose>
      <HonestNote>
        Like q and k, the value is learned: v = W<sub>V</sub>·x. And one more
        step we're skipping: the blended outputs of all heads pass through a
        final learned matrix W<sub>O</sub> before rejoining the token's vector.
        Real models also wrap this in residual connections and layer
        normalization — attention <em>adjusts</em> the token's vector rather
        than replacing it outright.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 7: heads and the parameter arithmetic --------------------------------
function HeadsSlide({ accent }) {
  return (
    <Slide wide>
      <Kicker accent={accent}>Zoom back out</Kicker>
      <Heading size="h2">Now multiply by 96.</Heading>
      <Prose muted>
        Everything you just computed is <strong>one head</strong>. A real layer
        runs dozens in parallel — each with its own W<sub>Q</sub>,
        W<sub>K</sub>, W<sub>V</sub>, so each learns its own kind of question:
        grammar, reference, copying, disambiguation (Chapter 9's list). GPT-3:
        96 heads per layer, 96 layers.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 10 }}>
          HOW MUCH OF THE MODEL IS ATTENTION? — count the dials (GPT-3-style layer, width d)
        </Mono>
        <div style={{ fontFamily: FONTS.mono, fontSize: 14, lineHeight: 2.2, overflowX: "auto" }}>
          <div>
            <span style={{ color: accent }}>attention</span>
            <span style={{ color: COLORS.muted }}>: W_Q + W_K + W_V + W_O = </span>
            <span style={{ color: COLORS.text }}>4·d²</span>
            <span style={{ color: COLORS.faint }}>  (all heads together)</span>
          </div>
          <div>
            <span style={{ color: COLORS.muted }}>MLP</span>
            <span style={{ color: COLORS.muted }}>: d→4d→d = </span>
            <span style={{ color: COLORS.text }}>8·d²</span>
            <span style={{ color: COLORS.faint }}>  (next chapter's layer-mate)</span>
          </div>
          <div>
            <span style={{ color: COLORS.muted }}>attention share: 4d² / 12d² = </span>
            <span style={{ color: accent, fontWeight: 600 }}>1/3 of every layer</span>
          </div>
        </div>
      </Card>
      <Prose muted style={{ fontSize: 15 }}>
        Sanity-check it against GPT-3's published numbers: d = 12,288, so
        attention is 4 × 12,288² ≈ 0.6 billion dials per layer and the MLP is
        ≈ 1.2 billion. Times 96 layers: ≈ 174 billion — add the embedding
        table and you land on the famous 175B. The mechanism you just did by
        hand, on four words, is a third of the entire machine.
      </Prose>
      <HonestNote>
        That 1/3 holds for the classic GPT-2/GPT-3 recipe (an MLP that expands
        4×, attention output dimension equal to d) and counts only the
        repeating layers — embeddings and the tiny layernorm parameters sit
        outside it. Many newer models bend the ratio: grouped-query attention
        shrinks W_K and W_V, and gated MLPs change the 8d². The honest version:
        attention is <em>roughly a third</em> of a classic transformer's
        weights, and the exact fraction is an architecture choice.
      </HonestNote>
    </Slide>
  );
}

// ---- The component --------------------------------------------------------------
export default function SqAttention({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Sidequest · optional deep dive</Kicker>
          <Heading>Inside Attention</Heading>
          <Lead>
            Chapter 9 showed you <em>what</em> attention does: context rewrites
            a word's numbers. This sidequest opens the box and does the actual
            arithmetic — on a sentence small enough to check by hand.
          </Lead>
          <Prose muted>
            This opened in its own tab, so your place in the course is safe.
            About 12 minutes. When you're done, just close the tab.
          </Prose>
        </Slide>
      );
    case 1:
      return (
        <Slide>
          <Kicker accent={accent}>The problem, precisely</Kicker>
          <Heading size="h2">How does a vector ask for help?</Heading>
          <Prose>
            Chapter 9 left you with a mechanism-shaped hole. Both “bat”s start
            with identical numbers, and somehow “each word pulls in a weighted
            mix of the words before it.” But a word's vector is just a list of
            numbers. It has no eyes. For “bat” to borrow meaning from “flew,”
            three things need to exist:
          </Prose>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.xs }}>
            {[
              ["a way to ask", "“bat” must broadcast what it's confused about"],
              ["a way to answer", "every other word must advertise what it knows"],
              ["a way to share", "the relevant words must hand something over"],
            ].map(([name, q], i) => (
              <div key={name} className="reveal" style={{ animationDelay: `${i * 120}ms`, display: "flex", gap: 12, alignItems: "baseline" }}>
                <Mono accent={accent} style={{ fontSize: 13, minWidth: 150 }}>{name}</Mono>
                <Prose muted style={{ fontSize: 15 }}>{q}</Prose>
              </div>
            ))}
          </div>
          <Prose>
            Attention is those three things, built from nothing but the linear
            algebra you've already met: dot products and weighted sums. The
            three roles have names — <strong>query</strong>,{" "}
            <strong>key</strong>, <strong>value</strong> — and we'll earn each
            one on the same four words:{" "}
            <Mono accent={accent}>The bat flew … cave</Mono>.
          </Prose>
        </Slide>
      );
    case 2:
      return <QKSlide accent={accent} />;
    case 3:
      return <ScoreMatrixSlide accent={accent} />;
    case 4:
      return <SoftmaxSlide accent={accent} />;
    case 5:
      return <MaskSlide accent={accent} />;
    case 6:
      return <ValuesSlide accent={accent} />;
    case 7:
      return <HeadsSlide accent={accent} />;
    case 8:
    default:
      return (
        <Slide>
          <Kicker accent={accent}>Sidequest complete</Kicker>
          <Heading size="h2">You did attention by hand.</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            {[
              "Every token emits a query (what am I looking for?), a key (what do I offer?), and a value (what I'll pass along).",
              "Scores are dot products, all pairs at once: QKᵀ/√d. Softmax — exponentiate, then normalize — turns each row into a budget that sums to 1.",
              "The causal mask sets look-ahead scores to −∞, so they get exactly zero budget: no peeking at the future.",
              "A token's output is the values, weighted by the budget, summed — context, absorbed. That's one head; a layer runs dozens, and attention is roughly a third of a classic transformer's weights.",
            ].map((line, i) => (
              <div key={i} className="reveal" style={{ display: "flex", gap: 14, alignItems: "baseline", animationDelay: `${i * 120}ms` }}>
                <span style={{ color: accent, fontFamily: FONTS.mono, fontSize: 14 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Prose>{line}</Prose>
              </div>
            ))}
          </div>
          <Prose muted style={{ marginTop: SPACE.sm }}>
            That's the whole detour. Close this tab and pick the course back up
            exactly where you left it — Chapter 9's “weighted mix” should now
            feel less like a metaphor and more like a recipe.
          </Prose>
        </Slide>
      );
  }
}
