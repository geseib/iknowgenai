// Sidequest — How Networks Learn
// The deep dive Chapter 4 points at: loss as a single wrongness number, the
// loss landscape, slope-by-nudging, the update rule (with a breakable
// learning rate), two knobs and a contour map, and the honest bridge to
// backpropagation. One tiny model (one knob, four snippets), every number
// computed live in the browser.
import { useEffect, useRef, useState } from "react";
import {
  Slide, Kicker, Heading, Lead, Prose, Card, Button, GhostButton, Mono, HonestNote,
} from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";

// ---- The running example -----------------------------------------------------
// Chapter 4's bicycle joke, turned into the smallest trainable model that is
// still real: one knob w = the model's preference for the pun answer.
//   score(two-tired) = w, score(knocked over) = 0
//   p(two-tired)     = e^w / (e^w + e^0)          (a two-option softmax)
// Training data: four snippets — three joke contexts where "two-tired" was
// the right next words, one literal context where "knocked over" was.
// Loss = average of −ln p(right answer). All of it computed live below.
const SNIPPETS = [
  { ctx: "Finish the joke: why did the bicycle fall over? Because it was ___", target: "two-tired", pun: true },
  { ctx: "Here's a pun for you: the bike fell over because it was ___", target: "two-tired", pun: true },
  { ctx: "Bike joke of the day — it fell over because it was ___", target: "two-tired", pun: true },
  { ctx: "The child's bicycle fell over because it was ___", target: "knocked over", pun: false },
];

const softplus = (x) => (x > 30 ? x : Math.log(1 + Math.exp(x)));
const sigmoid = (x) => 1 / (1 + Math.exp(-x));
// loss(w) = (1/4)[ 3·(−ln p_pun) + 1·(−ln p_literal) ]
//         = 0.75·ln(1+e^−w) + 0.25·ln(1+e^w)
const lossW = (w) => 0.75 * softplus(-w) + 0.25 * softplus(w);
// exact slope: dL/dw = p(two-tired) − 0.75
const slopeW = (w) => sigmoid(w) - 0.75;
const W_STAR = Math.log(3); // ≈ 1.0986 — where p(two-tired) = 3/4
const L_MIN = lossW(W_STAR); // ≈ 0.5623

const fmt = (v, d = 3) => (Number.isFinite(v) ? v.toFixed(d) : "∞");

// ---- Shared 1-D loss curve -----------------------------------------------------
const WMIN = -3, WMAX = 4, LMAX = 2.5;
const VB_W = 640, VB_H = 300, PAD_L = 46, PAD_R = 16, PAD_T = 14, PAD_B = 34;
const xOf = (w) => PAD_L + ((w - WMIN) / (WMAX - WMIN)) * (VB_W - PAD_L - PAD_R);
const yOf = (L) => VB_H - PAD_B - (Math.min(L, LMAX) / LMAX) * (VB_H - PAD_T - PAD_B);

const CURVE_PATH = (() => {
  const pts = [];
  for (let i = 0; i <= 140; i++) {
    const w = WMIN + (i / 140) * (WMAX - WMIN);
    pts.push(`${i === 0 ? "M" : "L"}${xOf(w).toFixed(1)},${yOf(lossW(w)).toFixed(1)}`);
  }
  return pts.join(" ");
})();

function LossCurve({ accent, w, trail = [], onPick, showTangent = false }) {
  const svgRef = useRef(null);
  const offChart = w < WMIN || w > WMAX;
  const wShown = Math.min(WMAX, Math.max(WMIN, w));
  const bx = xOf(wShown), by = yOf(lossW(wShown));

  const pick = (e) => {
    if (!onPick || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const fx = ((e.clientX - rect.left) / rect.width) * VB_W;
    const wp = WMIN + ((fx - PAD_L) / (VB_W - PAD_L - PAD_R)) * (WMAX - WMIN);
    onPick(Math.min(WMAX, Math.max(WMIN, wp)));
  };

  // Tangent segment through (w, L(w)) with the true slope, in screen coords.
  let tangent = null;
  if (showTangent && !offChart) {
    const s = slopeW(w);
    const dw = 0.7;
    tangent = {
      x1: xOf(w - dw), y1: yOf(lossW(w) - s * dw),
      x2: xOf(w + dw), y2: yOf(lossW(w) + s * dw),
    };
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      style={{ width: "100%", height: "auto", display: "block", cursor: onPick ? "crosshair" : "default", touchAction: onPick ? "none" : "auto" }}
      onPointerDown={pick}
    >
      {/* axes */}
      <line x1={PAD_L} y1={VB_H - PAD_B} x2={VB_W - PAD_R} y2={VB_H - PAD_B} stroke={COLORS.hairline} />
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={VB_H - PAD_B} stroke={COLORS.hairline} />
      {[-2, 0, 2, 4].map((t) => (
        <g key={t}>
          <line x1={xOf(t)} y1={VB_H - PAD_B} x2={xOf(t)} y2={VB_H - PAD_B + 5} stroke={COLORS.faint} />
          <text x={xOf(t)} y={VB_H - PAD_B + 20} textAnchor="middle" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.faint}>{t}</text>
        </g>
      ))}
      {[0, 1, 2].map((t) => (
        <text key={t} x={PAD_L - 8} y={yOf(t) + 4} textAnchor="end" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.faint}>{t.toFixed(1)}</text>
      ))}
      <text x={VB_W - PAD_R} y={VB_H - 6} textAnchor="end" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.faint}>knob w →</text>
      <text x={PAD_L + 8} y={PAD_T + 8} fontFamily={FONTS.mono} fontSize="11" fill={COLORS.faint}>loss</text>
      {/* the valley floor marker */}
      <line x1={xOf(W_STAR)} y1={yOf(L_MIN)} x2={xOf(W_STAR)} y2={VB_H - PAD_B} stroke={COLORS.hairline} strokeDasharray="3 4" />
      {/* the curve */}
      <path d={CURVE_PATH} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      {/* trail */}
      {trail.map((tw, i) => (
        <circle
          key={i}
          cx={xOf(Math.min(WMAX, Math.max(WMIN, tw)))}
          cy={yOf(lossW(Math.min(WMAX, Math.max(WMIN, tw))))}
          r="4"
          fill="none"
          stroke={accent}
          strokeWidth="1.5"
          opacity={0.25 + 0.5 * (i / Math.max(1, trail.length - 1))}
        />
      ))}
      {tangent && <line {...tangent} stroke={COLORS.text} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.7" />}
      {/* the ball */}
      <g style={{ transform: `translate(${bx}px, ${by}px)`, transition: "transform 300ms cubic-bezier(.2,.7,.3,1)" }}>
        <circle r="7" fill={offChart ? "none" : accent} stroke={accent} strokeWidth="2" />
      </g>
      {offChart && (
        <text x={w > WMAX ? VB_W - PAD_R : PAD_L + 4} y={by - 12} textAnchor={w > WMAX ? "end" : "start"} fontFamily={FONTS.mono} fontSize="12" fill={COLORS.wrong}>
          off the chart → w = {fmt(w, 1)}
        </text>
      )}
    </svg>
  );
}

// ---- Slide 2: build the loss with a slider -------------------------------------
function LossSliderSlide({ accent }) {
  const [w, setW] = useState(-1);
  const pPun = sigmoid(w);
  const loss = lossW(w);
  const atBottom = loss - L_MIN < 0.004;

  return (
    <Slide wide>
      <Kicker accent={accent}>Scoring wrongness</Kicker>
      <Heading size="h2">Loss: one number for “how wrong.”</Heading>
      <Prose muted>
        Chapter 4's rule: on each snippet, the model's penalty is{" "}
        <Mono accent={accent}>−ln(probability it gave the right answer)</Mono>.
        Confidently right costs almost nothing; confidently wrong costs a
        fortune. Average the four penalties and you get <strong>the loss</strong> —
        one number for the whole model. Drag the knob. Make it small.
      </Prose>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: SPACE.sm }}>
          <Mono style={{ fontSize: 11, color: COLORS.faint, whiteSpace: "nowrap" }}>THE KNOB</Mono>
          <input
            type="range" min={-2} max={3} step={0.02} value={w}
            onChange={(e) => setW(parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
          <Mono accent={accent} style={{ fontSize: 15, minWidth: 76, textAlign: "right" }}>w = {fmt(w, 2)}</Mono>
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.muted, marginBottom: SPACE.sm }}>
          p(two-tired) = e^{fmt(w, 2)} / (e^{fmt(w, 2)} + e⁰) ={" "}
          <span style={{ color: COLORS.text }}>{fmt(pPun)}</span>
          <span style={{ color: COLORS.faint }}>   p(knocked over) = {fmt(1 - pPun)}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SNIPPETS.map((s, i) => {
            const p = s.pun ? pPun : 1 - pPun;
            const cost = -Math.log(p);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Mono style={{ minWidth: 118, fontSize: 12, color: s.pun ? accent : COLORS.text }}>
                  → {s.target}
                </Mono>
                <div style={{ flex: 1, height: 14, background: "rgba(255,255,255,.05)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.min(100, (cost / 3) * 100)}%`,
                    background: s.pun ? accent + "88" : "rgba(255,255,255,.3)",
                    transition: "width 200ms",
                  }} />
                </div>
                <Mono style={{ minWidth: 170, fontSize: 12, color: COLORS.muted, textAlign: "right" }}>
                  −ln {fmt(p)} = {fmt(cost)}
                </Mono>
              </div>
            );
          })}
          <div style={{ borderTop: `1px solid ${COLORS.hairline}`, paddingTop: 8, display: "flex", justifyContent: "flex-end", gap: 10, alignItems: "baseline" }}>
            <Mono style={{ fontSize: 12, color: COLORS.faint }}>average of the four =</Mono>
            <Mono accent={atBottom ? COLORS.correct : accent} style={{ fontSize: 20, fontWeight: 600 }}>
              loss {fmt(loss)}
            </Mono>
          </div>
        </div>
      </Card>
      <Prose muted style={{ fontSize: 15 }}>
        {atBottom ? (
          <>
            That's about as low as it goes: w ≈ {fmt(W_STAR, 2)}, loss ≈ {fmt(L_MIN)}.
            Push further right and the literal snippet's penalty grows faster
            than the three joke penalties shrink. The balance point puts
            p(two-tired) at exactly 0.75 — the fraction of snippets where the
            pun was correct. The data pulled the knob to the honest answer.
          </>
        ) : (
          <>
            Three snippets pull the knob right (they want the pun likely); one
            pulls left. Somewhere in the middle the tug-of-war balances — keep
            hunting for the smallest loss.
          </>
        )}
      </Prose>
      <HonestNote>
        −ln(p) is <strong>cross-entropy</strong> — the actual loss LLMs train
        on, and the falling number in Chapter 4's demo. The tiny model is real
        too: score w for one answer, 0 for the other, exponentiate-and-normalize
        into probabilities (a two-option softmax). What's shrunk is the scale:
        one knob and four snippets instead of billions and trillions. Every
        number above is computed live.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 3: the landscape -----------------------------------------------------
function LandscapeSlide({ accent }) {
  const [w, setW] = useState(-2.2);
  return (
    <Slide wide>
      <Kicker accent={accent}>The terrain picture</Kicker>
      <Heading size="h2">Loss is a landscape. The knob is where you stand.</Heading>
      <Prose muted>
        You just sampled the loss one knob-setting at a time. Plot it for{" "}
        <em>every</em> setting at once and you get a valley — the loss curve of
        our little model. Click anywhere to stand there.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 6 }}>
          THE LOSS LANDSCAPE — click to move the ball
        </Mono>
        <LossCurve accent={accent} w={w} onPick={setW} />
        <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.muted, marginTop: 6 }}>
          you are at w = <span style={{ color: COLORS.text }}>{fmt(w, 2)}</span>
          <span style={{ color: COLORS.faint }}> · </span>
          loss = <span style={{ color: accent }}>{fmt(lossW(w))}</span>
        </div>
      </Card>
      <Prose muted style={{ fontSize: 15 }}>
        Now the catch. You can see this whole curve only because there's one
        knob and we drew it for you. Training never gets this picture. The
        model stands at one point in the fog, blindfolded, knowing exactly one
        thing: the loss under its feet. How do you find the bottom of a valley
        you can't see?
      </Prose>
      <HonestNote>
        With billions of knobs, this “curve” is a surface in a
        billions-dimensional space — and real loss landscapes aren't one tidy
        valley: they're riddled with dents, ridges, and saddle points. The
        single smooth valley is the honest one-knob shadow of the real thing
        (our tiny model genuinely has this shape; big networks don't).
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 4: which way is downhill — the nudge ----------------------------------
const NUDGE = 0.001;
function NudgeSlide({ accent }) {
  const [w, setW] = useState(-1.5);
  const L0 = lossW(w);
  const L1 = lossW(w + NUDGE);
  const dL = L1 - L0;
  const slope = dL / NUDGE;
  const flat = Math.abs(slope) < 0.01;

  return (
    <Slide wide>
      <Kicker accent={accent}>Which way is downhill?</Kicker>
      <Heading size="h2">Nudge the knob. Watch the loss.</Heading>
      <Prose muted>
        Blindfolded, you still have feet: nudge the knob a tiny amount, measure
        the loss again, compare. If the loss went down, that direction is
        downhill. Pick a spot and read the two measurements — this is the whole
        trick.
      </Prose>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: SPACE.sm }}>
          <Mono style={{ fontSize: 11, color: COLORS.faint, whiteSpace: "nowrap" }}>STAND AT</Mono>
          <input
            type="range" min={-2.8} max={3.8} step={0.05} value={w}
            onChange={(e) => setW(parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
          <Mono accent={accent} style={{ fontSize: 15, minWidth: 84, textAlign: "right" }}>w = {fmt(w, 2)}</Mono>
        </div>
        <LossCurve accent={accent} w={w} showTangent />
        <div style={{ fontFamily: FONTS.mono, fontSize: 13, lineHeight: 2, color: COLORS.muted, overflowX: "auto", marginTop: 6 }}>
          <div>loss({fmt(w, 3)})&nbsp;&nbsp;&nbsp;= <span style={{ color: COLORS.text }}>{fmt(L0, 6)}</span></div>
          <div>loss({fmt(w + NUDGE, 3)}) = <span style={{ color: COLORS.text }}>{fmt(L1, 6)}</span>
            <span style={{ color: COLORS.faint }}>   ← nudged by +0.001</span>
          </div>
          <div>
            change ÷ nudge = {fmt(dL, 6)} ÷ 0.001 ={" "}
            <span style={{ color: accent, fontWeight: 600, fontSize: 15 }}>{fmt(slope, 3)}</span>
          </div>
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: flat ? COLORS.correct : COLORS.text, marginTop: 4 }}>
          {flat
            ? "slope ≈ 0 — the ground is flat. You're at the bottom."
            : slope < 0
              ? "slope is negative — nudging right made loss FALL. Downhill is to the right."
              : "slope is positive — nudging right made loss RISE. Downhill is to the left."}
        </div>
      </Card>
      <Prose muted style={{ fontSize: 15 }}>
        That ratio — change in loss per unit of nudge — is the{" "}
        <strong>slope</strong> of the landscape where you stand (calculus calls
        it the <strong>derivative</strong>; the dashed line shows it as the
        tilt of the ground). With many knobs you'd nudge each one and collect a
        whole list of slopes. That list has a name: the{" "}
        <strong>gradient</strong>. Notice what it buys you: the slope's{" "}
        <em>sign</em> says which way is downhill, and its <em>size</em> says
        how steep the hill is.
      </Prose>
      <HonestNote>
        A two-measurement estimate like this is called a{" "}
        <strong>finite difference</strong>. The true slope is what this ratio
        approaches as the nudge shrinks to zero — and real training computes
        that exact value with calculus rather than by nudging. Why nudging is
        hopeless at scale, and what replaces it, is the last slide's story.
        (Here the estimate and the exact slope agree to 3 decimals — check:
        exact slope at w = {fmt(w, 2)} is {fmt(slopeW(w), 4)}.)
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 5: the update rule + learning rate -----------------------------------
const W0 = -2.5;
function DescentSlide({ accent }) {
  const [w, setW] = useState(W0);
  const [eta, setEta] = useState(2);
  const [log, setLog] = useState([]); // {step, w, slope, next}
  const trail = log.map((r) => r.w);

  const slope = slopeW(w);
  const converged = Math.abs(slope) < 0.001;
  const wild = eta >= 9;

  const step = () => {
    const s = slopeW(w);
    const next = w - eta * s;
    setLog((l) => [...l.slice(-5), { step: (l[l.length - 1]?.step || 0) + 1, w, slope: s, next }]);
    setW(next);
  };
  const reset = () => { setW(W0); setLog([]); };

  return (
    <Slide wide>
      <Kicker accent={accent}>The two-line algorithm</Kicker>
      <Heading size="h2">new w = old w − step size × slope.</Heading>
      <Prose muted>
        The slope points uphill, so walk the other way — a distance set by the
        steepness times a number you choose, the <strong>step size</strong>.
        That subtraction is the entire algorithm. Walk it:
      </Prose>
      <Card>
        <LossCurve accent={accent} w={w} trail={trail} />
        <div style={{ fontFamily: FONTS.mono, fontSize: 12.5, lineHeight: 1.9, color: COLORS.muted, overflowX: "auto", marginTop: 6 }}>
          {log.length === 0 && <div style={{ color: COLORS.faint }}>starting at w = {fmt(W0, 2)}, loss {fmt(lossW(W0))} — press Step</div>}
          {log.map((r) => (
            <div key={r.step} style={{ whiteSpace: "nowrap" }}>
              <span style={{ color: COLORS.faint }}>step {r.step}</span>
              {"  w = "}{fmt(r.w, 3)}
              {"  slope "}{fmt(r.slope, 3)}
              {"  →  "}{fmt(r.w, 3)} − {fmt(eta, 1)}×({fmt(r.slope, 3)}) ={" "}
              <span style={{ color: COLORS.text }}>{fmt(r.next, 3)}</span>
              <span style={{ color: COLORS.faint }}>  loss {fmt(lossW(r.next))}</span>
            </div>
          ))}
        </div>
      </Card>
      <div style={{ display: "flex", gap: SPACE.sm, alignItems: "center", flexWrap: "wrap" }}>
        <Button accent={accent} onClick={step}>Step</Button>
        <GhostButton onClick={reset}>Reset</GhostButton>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 240, flex: 1, maxWidth: 380 }}>
          <Mono style={{ fontSize: 11, color: wild ? COLORS.wrong : COLORS.faint, whiteSpace: "nowrap" }}>
            STEP SIZE {fmt(eta, 1)}
          </Mono>
          <input type="range" min={0.2} max={16} step={0.2} value={eta}
            onChange={(e) => setEta(parseFloat(e.target.value))} style={{ flex: 1 }} />
        </div>
      </div>
      <Prose muted style={{ fontSize: 15 }}>
        {converged
          ? <>Settled: w ≈ {fmt(w, 2)}, loss ≈ {fmt(lossW(w))} — the same bottom you found by hand on the slider, found blind. Notice the walk slowed by itself: gentler ground means smaller slope means smaller steps.</>
          : wild
            ? <>Step size {fmt(eta, 1)} is reckless — each stride overshoots the valley floor and lands on the far wall, sometimes higher than it started. It never settles. Real training diverges exactly like this when the learning rate is too high.</>
            : eta <= 0.6
              ? <>Step size {fmt(eta, 1)} is safe but timid — it'll get there, eventually. Real training can't afford “eventually.” Try cranking the slider past 9 and stepping: break it on purpose.</>
              : <>Keep stepping and watch the numbers: big slope, big stride; near the floor, baby steps. Then try the extremes — 0.2 crawls, 12 explodes.</>}
      </Prose>
      <HonestNote>
        “Step size” is the real term <strong>learning rate</strong>, usually
        written η. It's tiny in practice — GPT-3's published peak learning rate
        was 6×10⁻⁵, warmed up and then decayed on a schedule — because real
        landscapes are treacherous and real gradients are noisy. But the
        failure you just produced is real: too high and the loss blows up,
        too low and training crawls.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 6: two knobs, a contour map -------------------------------------------
// Add a third candidate ("broken") with its own knob w2 and a fifth snippet.
// scores: two-tired = w1, broken = w2, knocked over = 0; counts 3/1/1 of 5.
// loss(w1,w2) = (1/5)[3(−ln p1) + (−ln p2) + (−ln p3)]
// gradient   = (p1 − 3/5, p2 − 1/5)  → minimum at (ln3, 0), loss ≈ 0.9503
function loss2(w1, w2) {
  const m = Math.max(w1, w2, 0); // stable softmax
  const e1 = Math.exp(w1 - m), e2 = Math.exp(w2 - m), e3 = Math.exp(-m);
  const Z = e1 + e2 + e3;
  return (1 / 5) * (3 * -Math.log(e1 / Z) - Math.log(e2 / Z) - Math.log(e3 / Z));
}
function grad2(w1, w2) {
  const m = Math.max(w1, w2, 0);
  const e1 = Math.exp(w1 - m), e2 = Math.exp(w2 - m), e3 = Math.exp(-m);
  const Z = e1 + e2 + e3;
  return [e1 / Z - 0.6, e2 / Z - 0.2];
}
const L2_MIN = loss2(Math.log(3), 0);

const M_W1 = [-2.5, 4.5], M_W2 = [-3.5, 3.5], M_COLS = 56, M_ROWS = 44, M_CELL = 10;
const MAP_W = M_COLS * M_CELL, MAP_H = M_ROWS * M_CELL;
const mapX = (w1) => ((w1 - M_W1[0]) / (M_W1[1] - M_W1[0])) * MAP_W;
const mapY = (w2) => MAP_H - ((w2 - M_W2[0]) / (M_W2[1] - M_W2[0])) * MAP_H;

// Precomputed heat cells, quantized into bands so contour lines emerge.
const MAP_CELLS = (() => {
  const cells = [];
  for (let r = 0; r < M_ROWS; r++) {
    for (let c = 0; c < M_COLS; c++) {
      const w1 = M_W1[0] + ((c + 0.5) / M_COLS) * (M_W1[1] - M_W1[0]);
      const w2 = M_W2[0] + ((r + 0.5) / M_ROWS) * (M_W2[1] - M_W2[0]);
      const t = Math.min(1, (loss2(w1, w2) - L2_MIN) / 1.6);
      cells.push({ c, r: M_ROWS - 1 - r, band: Math.floor(Math.sqrt(t) * 9) / 9 });
    }
  }
  return cells;
})();

const ETA_2D = 2.5;
function TwoKnobSlide({ accent }) {
  const [pos, setPos] = useState([-2, 2.8]);
  const [path, setPath] = useState([[-2, 2.8]]);
  const [running, setRunning] = useState(false);
  const runToken = useRef(0);
  const svgRef = useRef(null);
  useEffect(() => () => { runToken.current++; }, []);

  const [g1, g2] = grad2(pos[0], pos[1]);
  const L = loss2(pos[0], pos[1]);
  const atMin = L - L2_MIN < 0.0005;

  const stepFrom = ([a, b]) => {
    const [d1, d2] = grad2(a, b);
    return [a - ETA_2D * d1, b - ETA_2D * d2];
  };
  const step = () => {
    const next = stepFrom(pos);
    setPos(next);
    setPath((p) => [...p, next]);
  };
  const run = async () => {
    const token = ++runToken.current;
    setRunning(true);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    let cur = pos;
    for (let i = 0; i < 22; i++) {
      await sleep(160);
      if (runToken.current !== token) return;
      cur = stepFrom(cur);
      setPos(cur);
      setPath((p) => [...p, cur]);
      if (loss2(cur[0], cur[1]) - L2_MIN < 0.0005) break;
    }
    setRunning(false);
  };
  const pick = (e) => {
    if (running || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const w1 = M_W1[0] + ((e.clientX - rect.left) / rect.width) * (M_W1[1] - M_W1[0]);
    const w2 = M_W2[0] + (1 - (e.clientY - rect.top) / rect.height) * (M_W2[1] - M_W2[0]);
    setPos([w1, w2]);
    setPath([[w1, w2]]);
  };

  // −gradient arrow, scaled up to be visible
  const ax = mapX(pos[0]), ay = mapY(pos[1]);
  const ax2 = mapX(pos[0] - 4 * g1), ay2 = mapY(pos[1] - 4 * g2);

  return (
    <Slide wide>
      <Kicker accent={accent}>One more knob</Kicker>
      <Heading size="h2">Two knobs make a map.</Heading>
      <Prose muted>
        Give the model a second knob — a score for a third candidate,{" "}
        <Mono accent={accent}>broken</Mono> — and a fifth snippet where
        “broken” was the right answer. Loss now depends on two knobs, so the
        landscape is a real map: your position is (w₁, w₂), loss is altitude,
        and the shading bands are contour lines. The gradient is now{" "}
        <em>two</em> slopes — one per knob — which together point straight
        uphill. Same rule: step the other way. Click to drop the ball.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 8 }}>
          THE LOSS MAP — darker = lower · w₁ across, w₂ up · arrow = −gradient
        </Mono>
        <div style={{ overflowX: "auto" }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            style={{ width: "100%", maxWidth: 620, display: "block", cursor: running ? "default" : "crosshair", touchAction: "none" }}
            onPointerDown={pick}
          >
            {MAP_CELLS.map((cell, i) => (
              <rect
                key={i}
                x={cell.c * M_CELL} y={cell.r * M_CELL}
                width={M_CELL} height={M_CELL}
                fill={accent}
                opacity={0.05 + cell.band * 0.38}
              />
            ))}
            <circle cx={mapX(Math.log(3))} cy={mapY(0)} r="3" fill="none" stroke={COLORS.text} strokeWidth="1" opacity="0.7" />
            <polyline
              points={path.map(([a, b]) => `${mapX(a)},${mapY(b)}`).join(" ")}
              fill="none" stroke={COLORS.text} strokeWidth="1.5" opacity="0.8"
            />
            {path.map(([a, b], i) => (
              <circle key={i} cx={mapX(a)} cy={mapY(b)} r="2.5" fill={COLORS.text} opacity="0.6" />
            ))}
            {!atMin && <line x1={ax} y1={ay} x2={ax2} y2={ay2} stroke={COLORS.correct} strokeWidth="2" />}
            <circle cx={ax} cy={ay} r="6" fill={accent} stroke="#0B0E14" strokeWidth="1.5"
              style={{ transition: "cx 150ms linear, cy 150ms linear" }} />
          </svg>
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.muted, marginTop: 8, overflowX: "auto", whiteSpace: "nowrap" }}>
          (w₁, w₂) = (<span style={{ color: COLORS.text }}>{fmt(pos[0], 2)}</span>, <span style={{ color: COLORS.text }}>{fmt(pos[1], 2)}</span>)
          <span style={{ color: COLORS.faint }}> · </span>
          gradient = ({fmt(g1, 3)}, {fmt(g2, 3)})
          <span style={{ color: COLORS.faint }}> · </span>
          loss = <span style={{ color: atMin ? COLORS.correct : accent }}>{fmt(L, 4)}</span>
          {atMin && <span style={{ color: COLORS.correct }}> — bottom: (1.10, 0.00)</span>}
        </div>
      </Card>
      <div style={{ display: "flex", gap: SPACE.sm }}>
        <Button accent={accent} onClick={step} disabled={running}>Step</Button>
        <GhostButton onClick={run} disabled={running}>{running ? "Walking…" : "Run 22 steps"}</GhostButton>
      </div>
      <Prose muted style={{ fontSize: 15 }}>
        Watch the path: it crosses the contour bands head-on — steepest descent
        runs perpendicular to the lines of equal loss, like water. Now the jump
        that matters: a real model has <strong>billions</strong> of knobs. The
        landscape becomes a surface in billions of dimensions that nobody can
        draw or picture. The rule does not care. It's still one list of slopes
        and one subtraction per knob — the same two lines of arithmetic you
        just watched, run wider.
      </Prose>
      <HonestNote>
        The map is computed live on a {M_COLS}×{M_ROWS} grid of real loss
        values; the minimum sits at (ln 3, 0) ≈ (1.10, 0), where the
        probabilities hit (0.6, 0.2, 0.2) — the counts 3/1/1 in the five
        snippets. “Perpendicular to the contours” is exact for infinitesimal
        steps; our finite steps (η = 2.5) only approximate it, which you can
        see in the path's slight zig.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 7: the scale of real training ------------------------------------------
function ScaleSlide({ accent }) {
  return (
    <Slide>
      <Kicker accent={accent}>Now multiply</Kicker>
      <Heading size="h2">Sixteen quadrillion nudges.</Heading>
      <Prose>
        You just trained a two-knob model in about twenty steps. The published
        GPT-3 recipe runs the identical rule at this scale:
      </Prose>
      <Card>
        <div style={{ fontFamily: FONTS.mono, fontSize: 14, lineHeight: 2.2, overflowX: "auto" }}>
          <div><span style={{ color: COLORS.muted }}>training text: </span><span style={{ color: COLORS.text }}>300 billion tokens</span></div>
          <div><span style={{ color: COLORS.muted }}>chewed in batches of: </span><span style={{ color: COLORS.text }}>3.2 million tokens</span></div>
          <div><span style={{ color: COLORS.muted }}>→ update steps: 300B ÷ 3.2M ≈ </span><span style={{ color: COLORS.text }}>93,750</span></div>
          <div><span style={{ color: COLORS.muted }}>knobs nudged per step: </span><span style={{ color: COLORS.text }}>175 billion — all of them</span></div>
          <div>
            <span style={{ color: COLORS.muted }}>total nudges: 175×10⁹ × 93,750 ≈ </span>
            <span style={{ color: accent, fontWeight: 600 }}>1.6 × 10¹⁶</span>
          </div>
        </div>
      </Card>
      <Prose>
        Sixteen quadrillion tiny subtractions, and out comes a system that
        writes. The mystery of training was never that the rule is clever —
        you've now run the whole rule yourself. The mystery is that this dumb
        rule, at this scale, works.
      </Prose>
      <HonestNote>
        Those are GPT-3's published 2020 numbers (175B parameters, 300B
        tokens, 3.2M-token batches); newer models train on far more — Llama 3
        saw ~15 trillion tokens — and mostly don't publish the rest. Also
        glossed: each update uses one <em>batch</em>, not the whole dataset,
        so every gradient is a noisy estimate (that's the “stochastic” in
        stochastic gradient descent), and modern optimizers like Adam adapt
        the step size per knob. Refinements — the core rule is the one you
        ran.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 8: the bridge to backpropagation ---------------------------------------
function BridgeSlide({ accent }) {
  return (
    <Slide>
      <Kicker accent={accent}>The question we dodged</Kicker>
      <Heading size="h2">Where do 175 billion slopes come from?</Heading>
      <Prose>
        On the nudge slide you measured one slope with two loss measurements.
        Fine for one knob. But the gradient needs a slope for{" "}
        <em>every</em> knob, every step. Try nudging GPT-3's knobs one at a
        time:
      </Prose>
      <Card>
        <div style={{ fontFamily: FONTS.mono, fontSize: 14, lineHeight: 2.2, overflowX: "auto" }}>
          <div><span style={{ color: COLORS.muted }}>full model runs per update: </span><span style={{ color: COLORS.text }}>175,000,000,001</span><span style={{ color: COLORS.faint }}> (one per knob, +1 baseline)</span></div>
          <div><span style={{ color: COLORS.muted }}>at a generous 1 ms per run: </span><span style={{ color: COLORS.text }}>≈ 5.5 years per single update</span></div>
          <div><span style={{ color: COLORS.muted }}>× 93,750 updates: </span><span style={{ color: COLORS.wrong }}>≈ 520,000 years</span></div>
        </div>
      </Card>
      <Prose>
        Yet real training gets the <em>exact</em> slope of every knob for
        roughly the cost of one extra pass through the network — all 175
        billion at once, no nudging. The trick is calculus's chain rule run
        backward through the layers, sharing work as it goes, and its name is{" "}
        <strong>backpropagation</strong>. How it pulls that off is a story of
        its own — a future sidequest. For now, keep the honest headline:
        gradient descent decides <em>where to step</em>; backprop is how the
        slopes get computed <em>fast</em>.
      </Prose>
      <HonestNote>
        Our nudge-and-remeasure (finite differences) was for intuition only —
        real training computes gradients analytically, so they're exact, and a
        full backward pass costs about the same as two forward passes
        regardless of how many knobs there are. The “1 ms per run” is absurdly
        generous: a 175B-parameter forward pass over a 3.2M-token batch takes
        vastly longer without a datacenter doing many things in parallel. The
        conclusion survives any honest number you plug in.
      </HonestNote>
    </Slide>
  );
}

// ---- The component --------------------------------------------------------------
export default function SqGradientDescent({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Sidequest · optional deep dive</Kicker>
          <Heading>How Networks Learn</Heading>
          <Lead>
            Chapter 4 named the mystery step: “nudge every dial in the
            direction that reduces the loss.” This sidequest does that step
            for real — you'll find the direction yourself, on numbers small
            enough to check by hand.
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
          <Kicker accent={accent}>What “learning” even means</Kicker>
          <Heading size="h2">One knob, four snippets.</Heading>
          <Prose>
            A newborn model's dials are random and its predictions are static.
            “Learning” is nothing more mystical than: adjust the dials so the
            predictions get less wrong. Billions of dials is too many to
            watch, so let's shrink the problem until every number fits on
            screen — <strong>one</strong> dial, and Chapter 4's bicycle:
          </Prose>
          <Card>
            <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 10 }}>
              THE ENTIRE TRAINING SET — four snippets, right answers revealed
            </Mono>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SNIPPETS.map((s, i) => (
                <div key={i} className="reveal" style={{ animationDelay: `${i * 120}ms`, display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: FONTS.display, fontStyle: "italic", fontSize: 16, color: COLORS.muted }}>
                    “{s.ctx}”
                  </span>
                  <Mono accent={s.pun ? accent : COLORS.text} style={{ fontSize: 13 }}>→ {s.target}</Mono>
                </div>
              ))}
            </div>
          </Card>
          <Prose>
            The one dial, <Mono accent={accent}>w</Mono>, is the model's
            preference for the pun: the answer “two-tired” gets score w,
            “knocked over” gets score 0, and scores become probabilities the
            usual way — exponentiate, then divide by the total:{" "}
            <Mono accent={accent}>p(two-tired) = e^w / (e^w + e⁰)</Mono>.
            Crank w up and the model loves the pun; negative w and it goes
            literal. Somewhere is the setting that fits all four snippets
            best. Finding it — automatically — is the whole game.
          </Prose>
          <HonestNote>
            Real training data is trillions of tokens and the choices span a
            ~100,000-word vocabulary, not two answers. But this miniature is a
            genuine softmax model with a genuine cross-entropy loss — the same
            species as the real thing, bred small enough to audit. Everything
            you'll see is computed live in your browser.
          </HonestNote>
        </Slide>
      );
    case 2:
      return <LossSliderSlide accent={accent} />;
    case 3:
      return <LandscapeSlide accent={accent} />;
    case 4:
      return <NudgeSlide accent={accent} />;
    case 5:
      return <DescentSlide accent={accent} />;
    case 6:
      return <TwoKnobSlide accent={accent} />;
    case 7:
      return <ScaleSlide accent={accent} />;
    case 8:
      return <BridgeSlide accent={accent} />;
    case 9:
    default:
      return (
        <Slide>
          <Kicker accent={accent}>Sidequest complete</Kicker>
          <Heading size="h2">You walked a model downhill.</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            {[
              "Learning = turning knobs to shrink one number: the loss, the average of −ln p(right answer) over the training data.",
              "Loss over all knob settings is a landscape. Training never sees the whole picture — only the loss where it stands, and the tilt of the ground.",
              "The tilt comes from a nudge: slope = change in loss ÷ change in knob. One slope per knob, and the full list is the gradient.",
              "The update is one subtraction: w ← w − step size × slope. Too small a step crawls; too big overshoots and never settles — you broke it yourself.",
              "Real training is the same rule with billions of knobs — but it gets all its slopes at once from backpropagation, not from nudging. That trick is the next sidequest.",
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
            That's the detour. Close this tab and pick the course back up where
            you left it — Chapter 4's “nudge every dial toward the right
            answer” should now feel less like a slogan and more like a recipe
            you've run.
          </Prose>
        </Slide>
      );
  }
}
