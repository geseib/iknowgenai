// Sidequest — What Is a Neural Network?
// The deep dive Chapter 10 points at: one neuron (weighted sum + bias), why
// stacked linear layers collapse, the ReLU bend and what it buys, a layer as
// a matrix–vector multiply, a real two-layer network classifying 2D points
// live, and where all of this sits inside a transformer (the MLP blocks).
// Every number on screen is computed live in the browser.
import { useEffect, useRef, useState } from "react";
import {
  Slide, Kicker, Heading, Lead, Prose, Card, Button, GhostButton, Mono, HonestNote,
} from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";

const fmt = (v, d = 2) => (Object.is(v, -0) ? 0 : v).toFixed(d);
const relu = (z) => Math.max(0, z);

// ---- Shared bits ---------------------------------------------------------------

function SliderRow({ label, value, min = -2, max = 2, step = 0.1, onChange, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Mono style={{ minWidth: 84, fontSize: 13, color: COLORS.muted }}>{label}</Mono>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1 }}
      />
      <Mono accent={accent} style={{ minWidth: 48, fontSize: 14, textAlign: "right" }}>
        {fmt(value, 1)}
      </Mono>
    </div>
  );
}

// ---- Slide 1: one neuron — the tiny opinion machine ------------------------------
const FEATURES = ["fur", "wings", "gears"];
const CREATURES = [
  { name: "bat", x: [1, 1, 0], animal: true },
  { name: "drone", x: [0, 1, 1], animal: false },
];

function NeuronSlide({ accent }) {
  const [w, setW] = useState([0.5, 0.5, 0.5]);
  const [b, setB] = useState(0);
  const z = CREATURES.map((c) => c.x.reduce((s, xi, i) => s + w[i] * xi, 0) + b);
  const solved = z[0] > 0 && z[1] < 0;

  return (
    <Slide wide>
      <Kicker accent={accent}>Start with one</Kicker>
      <Heading size="h2">A neuron is a tiny opinion machine.</Heading>
      <Prose muted>
        It takes a few input numbers, multiplies each by a <strong>weight</strong>{" "}
        (how much it trusts that evidence), adds a <strong>bias</strong> (its
        baseline mood), and outputs the total. Positive total: it{" "}
        <em>fires</em>. Negative: it stays quiet. Your job: set the three
        weights so this neuron fires for the bat and stays quiet for the drone.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 10 }}>
          THE KNOBS — drag them; every number below updates live
        </Mono>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: SPACE.sm }}>
          {FEATURES.map((f, i) => (
            <SliderRow key={f} label={`w(${f})`} value={w[i]} accent={accent}
              onChange={(v) => setW((prev) => prev.map((p, j) => (j === i ? v : p)))} />
          ))}
          <SliderRow label="bias" value={b} accent={accent} onChange={setB} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {CREATURES.map((c, ci) => (
            <div key={c.name} style={{ borderTop: `1px solid ${COLORS.hairline}`, paddingTop: 10 }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 13, lineHeight: 1.9, overflowX: "auto", whiteSpace: "nowrap" }}>
                <span style={{ color: COLORS.muted }}>
                  z({c.name}) {"["}fur {c.x[0]}, wings {c.x[1]}, gears {c.x[2]}{"]"} ={" "}
                </span>
                {c.x.map((xi, i) => (
                  <span key={i}>
                    <span style={{ color: COLORS.text }}>{fmt(w[i], 1)}×{xi}</span>
                    <span style={{ color: COLORS.faint }}> + </span>
                  </span>
                ))}
                <span style={{ color: COLORS.text }}>{fmt(b, 1)}</span>
                <span style={{ color: COLORS.faint }}> = </span>
                <span style={{ color: z[ci] > 0 ? accent : COLORS.muted, fontWeight: 600, fontSize: 15 }}>
                  {fmt(z[ci])}
                </span>
                <span style={{ color: z[ci] > 0 ? COLORS.correct : COLORS.faint, marginLeft: 10 }}>
                  {z[ci] > 0 ? "● fires" : "○ quiet"}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontFamily: FONTS.mono, fontSize: 13, color: solved ? COLORS.correct : COLORS.faint, transition: "color 280ms" }}>
          {solved
            ? "Solved — this neuron now tells animals from machines."
            : "Goal: bat fires (z > 0), drone stays quiet (z < 0)."}
        </div>
      </Card>
      <div>
        <GhostButton onClick={() => { setW([0.5, 0.5, 0.5]); setB(0); }}>Reset the knobs</GhostButton>
      </div>
      <Prose muted style={{ fontSize: 15 }}>
        Notice the trap: both have wings, so w(wings) can’t separate them no
        matter where you drag it. The useful knobs are the ones on evidence
        that <em>differs</em> — trust fur, distrust gears. That, in miniature,
        is what “learning weights” means.
      </Prose>
      <HonestNote>
        This weighted-sum-plus-bias is the real formula: z = w·x + b, exactly
        Chapter 4’s dials at their smallest. Two simplifications: real inputs
        aren’t tidy hand-made features like “fur” — they’re whatever numbers
        the previous layer produced — and nobody sets weights by hand; the
        training loop from Chapter 4 nudges them. “Fires above zero” is the
        classic intuition; the modern version of that threshold is the next
        two slides.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 2: stacked linear layers collapse -------------------------------------
function LinearCollapseSlide({ accent }) {
  const [x, setX] = useState(1.5);
  const y = 2 * x + 1;
  const z = 3 * y - 2;
  const shortcut = 6 * x + 1;

  return (
    <Slide wide>
      <Kicker accent={accent}>A trap in the plan</Kicker>
      <Heading size="h2">Stacking linear layers buys you nothing.</Heading>
      <Prose muted>
        The obvious next move: feed one neuron’s output into another. Layer A
        computes <Mono accent={accent}>y = 2x + 1</Mono>, layer B computes{" "}
        <Mono accent={accent}>z = 3y − 2</Mono>. Two layers of machinery —
        drag x and watch what the stack actually does.
      </Prose>
      <Card>
        <SliderRow label="input x" value={x} min={-3} max={3} step={0.5} onChange={setX} accent={accent} />
        <div style={{ fontFamily: FONTS.mono, fontSize: 14, lineHeight: 2.2, marginTop: SPACE.sm, overflowX: "auto" }}>
          <div>
            <span style={{ color: COLORS.muted }}>layer A: y = 2×{fmt(x, 1)} + 1 = </span>
            <span style={{ color: COLORS.text }}>{fmt(y, 1)}</span>
          </div>
          <div>
            <span style={{ color: COLORS.muted }}>layer B: z = 3×{fmt(y, 1)} − 2 = </span>
            <span style={{ color: COLORS.text }}>{fmt(z, 1)}</span>
          </div>
          <div style={{ borderTop: `1px solid ${COLORS.hairline}`, paddingTop: 8, marginTop: 4 }}>
            <span style={{ color: COLORS.muted }}>one layer, no stack: 6×{fmt(x, 1)} + 1 = </span>
            <span style={{ color: accent, fontWeight: 600 }}>{fmt(shortcut, 1)}</span>
            <span style={{ color: z === shortcut ? COLORS.correct : COLORS.wrong, marginLeft: 12 }}>
              {z === shortcut ? "identical, every time" : "≠"}
            </span>
          </div>
        </div>
      </Card>
      <Prose muted style={{ fontSize: 15 }}>
        The algebra is unforgiving: 3(2x + 1) − 2 = 6x + 1. Any stack of
        weighted sums is just one weighted sum with different numbers — a
        thousand linear layers can still only draw a straight line through its
        inputs. Whatever a bat-vs-drone boundary looks like in the real world,
        it is not one straight line. Something has to break the straightness.
      </Prose>
      <HonestNote>
        This collapse is fully general, not a quirk of these numbers: for
        matrices, W₂(W₁x + b₁) + b₂ = (W₂W₁)x + (W₂b₁ + b₂) — one matrix, one
        bias. It’s a theorem, and it’s why every real network puts something
        deliberately non-linear between its layers.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 3: ReLU and what bends buy --------------------------------------------
// Approximate y = x² on [−2, 2] with N hinge (ReLU) pieces: the piecewise-linear
// interpolant through N+1 evenly spaced knots, written as a running sum of ReLUs.
function reluApprox(N) {
  const knots = Array.from({ length: N + 1 }, (_, k) => -2 + (4 * k) / N);
  // segment slope between knot k and k+1 for f(x)=x² is x_k + x_{k+1}
  const slopes = knots.slice(0, -1).map((xk, k) => xk + knots[k + 1]);
  // g(x) = 4 + Σ_k s_k · ReLU(x − x_k), s_0 = m_0, s_k = m_k − m_{k−1}
  const s = slopes.map((m, k) => (k === 0 ? m : m - slopes[k - 1]));
  const g = (x) => 4 + s.reduce((acc, sk, k) => acc + sk * relu(x - knots[k]), 0);
  let maxErr = 0;
  for (let i = 0; i <= 200; i++) {
    const x = -2 + (4 * i) / 200;
    maxErr = Math.max(maxErr, Math.abs(x * x - g(x)));
  }
  return { knots, g, maxErr };
}

function ReluSlide({ accent }) {
  const [N, setN] = useState(2);
  const { knots, g, maxErr } = reluApprox(N);

  // SVG mapping: x ∈ [−2.15, 2.15], y ∈ [−0.35, 4.5]
  const W = 640, H = 260;
  const px = (x) => ((x + 2.15) / 4.3) * W;
  const py = (y) => H - ((y + 0.35) / 4.85) * H;
  const truePts = Array.from({ length: 81 }, (_, i) => {
    const x = -2 + (4 * i) / 80;
    return `${px(x)},${py(x * x)}`;
  }).join(" ");
  const approxPts = knots.map((x) => `${px(x)},${py(g(x))}`).join(" ");

  return (
    <Slide wide>
      <Kicker accent={accent}>The bend</Kicker>
      <Heading size="h2">One kink breaks the curse.</Heading>
      <Prose muted>
        The fix is almost insultingly simple. After the weighted sum, apply{" "}
        <Mono accent={accent}>ReLU(z) = max(0, z)</Mono>: negative becomes
        zero, positive passes through. A straight line with one kink in it.
        But each kinked unit contributes one <em>bend</em>, and bends add up.
        Here’s a team of ReLU units trying to draw the curve{" "}
        <Mono accent={accent}>y = x²</Mono> — something no linear stack could
        ever do. Add units and watch.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 10 }}>
          TARGET: y = x² (curve) — TEAM OF {N} ReLU UNIT{N > 1 ? "S" : ""} (straight pieces) — computed live
        </Mono>
        <div style={{ overflowX: "auto" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 420, display: "block" }}>
            <line x1={px(-2.15)} y1={py(0)} x2={px(2.15)} y2={py(0)} stroke={COLORS.hairline} />
            <line x1={px(0)} y1={py(-0.35)} x2={px(0)} y2={py(4.5)} stroke={COLORS.hairline} />
            <polyline points={truePts} fill="none" stroke={COLORS.faint} strokeWidth="2.5" />
            <polyline points={approxPts} fill="none" stroke={accent} strokeWidth="2.5"
              style={{ transition: "all 280ms" }} />
            {knots.map((x, k) => (
              <circle key={k} cx={px(x)} cy={py(g(x))} r="4" fill={accent} />
            ))}
          </svg>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
          <Button accent={accent} onClick={() => setN((n) => Math.min(16, n * 2))} disabled={N >= 16}>
            Double the units
          </Button>
          <GhostButton onClick={() => setN(2)} disabled={N === 2}>Back to 2</GhostButton>
          <Mono style={{ fontSize: 13, color: COLORS.muted }}>
            worst miss anywhere: <span style={{ color: accent, fontWeight: 600 }}>{maxErr.toFixed(4)}</span>
          </Mono>
        </div>
      </Card>
      <Prose muted style={{ fontSize: 15 }}>
        Every doubling of units cuts the worst miss to a quarter — 2 units
        miss by 1.0, 4 by 0.25, 16 by under 0.016. The recipe generalizes: with
        enough bends in enough dimensions, you can trace out shockingly
        complicated shapes. The kink is where a network’s expressiveness
        comes from.
      </Prose>
      <HonestNote>
        The orange path really is a sum of {N} ReLU units — g(x) = 4 +
        Σ sₖ·ReLU(x − xₖ) — with bend positions and slopes computed live by a
        formula, so you can see the best case cleanly; a trained network would{" "}
        <em>learn</em> where to put its bends via Chapter 4’s loop. The
        quarter-per-doubling rate is exact for x² (the worst miss of a straight
        chord over a width-Δ piece of x² is Δ²/4). GPT-style transformers use
        GELU, a smoothed cousin of ReLU — same idea, no sharp corner.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 4: a layer is a matrix–vector multiply ---------------------------------
const LAYER_NEURONS = [
  { q: "furry animal?", w: [1.5, 0.2, -1.5], b: -0.2 },
  { q: "flying thing?", w: [0.0, 1.4, 0.3], b: -0.5 },
  { q: "machine?", w: [-1.2, 0.1, 1.6], b: -0.1 },
  { q: "alive?", w: [1.0, 0.4, -1.0], b: 0.0 },
];

function LayerSlide({ accent }) {
  const [creature, setCreature] = useState(0);
  const [sel, setSel] = useState(0);
  const x = CREATURES[creature].x;
  const zs = LAYER_NEURONS.map((n) => n.w.reduce((s, wi, i) => s + wi * x[i], 0) + n.b);
  const n = LAYER_NEURONS[sel];

  return (
    <Slide wide>
      <Kicker accent={accent}>From one to many</Kicker>
      <Heading size="h2">A layer: many opinions in parallel.</Heading>
      <Prose muted>
        One neuron asks one question. A <strong>layer</strong> is a bank of
        neurons asking different questions of the <em>same</em> inputs, all at
        once. Stack their weight rows and you get a matrix; running the whole
        layer is one matrix–vector multiply: <Mono accent={accent}>z = Wx + b</Mono>.
        Click a row to see its arithmetic.
      </Prose>
      <Card>
        <div style={{ display: "flex", gap: 10, marginBottom: SPACE.sm }}>
          {CREATURES.map((c, i) => (
            <button key={c.name} onClick={() => setCreature(i)} className="token-chip"
              style={{
                borderColor: i === creature ? accent : undefined,
                color: i === creature ? accent : COLORS.muted,
                background: i === creature ? accent + "18" : undefined,
              }}>
              x = {c.name} [{c.x.join(", ")}]
            </button>
          ))}
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "inline-flex", flexDirection: "column", gap: 6, minWidth: 460 }}>
            {LAYER_NEURONS.map((nn, i) => (
              <button key={i} onClick={() => setSel(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "8px 10px",
                  border: `1px solid ${i === sel ? accent : COLORS.hairline}`, borderRadius: 8,
                  background: i === sel ? accent + "10" : "transparent",
                  transition: "border-color 280ms, background 280ms", textAlign: "left",
                }}>
                <Mono style={{ fontSize: 12, color: COLORS.muted, minWidth: 106 }}>{nn.q}</Mono>
                <Mono style={{ fontSize: 13, color: i === sel ? COLORS.text : COLORS.muted }}>
                  [ {nn.w.map((v) => fmt(v, 1)).join("  ")} ]  b={fmt(nn.b, 1)}
                </Mono>
                <Mono style={{ fontSize: 14, marginLeft: "auto", color: zs[i] > 0 ? accent : COLORS.faint, fontWeight: 600 }}>
                  z = {fmt(zs[i], 1)}
                </Mono>
              </button>
            ))}
          </div>
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.muted, marginTop: 10, overflowX: "auto", whiteSpace: "nowrap" }}>
          {n.q}{"  "}
          {n.w.map((wi, i) => (
            <span key={i}>
              <span style={{ color: COLORS.text }}>{fmt(wi, 1)}×{x[i]}</span>
              <span style={{ color: COLORS.faint }}> + </span>
            </span>
          ))}
          <span style={{ color: COLORS.text }}>{fmt(n.b, 1)}</span>
          <span style={{ color: COLORS.faint }}> = </span>
          <span style={{ color: accent, fontWeight: 600 }}>{fmt(zs[sel], 1)}</span>
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 13, marginTop: 10, borderTop: `1px solid ${COLORS.hairline}`, paddingTop: 10 }}>
          <span style={{ color: COLORS.muted }}>layer output: z = </span>
          <span style={{ color: COLORS.faint }}>[ </span>
          {zs.map((z, i) => (
            <span key={i} style={{ color: z > 0 ? accent : COLORS.muted, marginRight: i < 3 ? 10 : 0 }}>{fmt(z, 1)}</span>
          ))}
          <span style={{ color: COLORS.faint }}> ]</span>
        </div>
      </Card>
      <Prose muted style={{ fontSize: 15 }}>
        Three numbers went in; four came out — <Mono accent={accent}>bat</Mono>{" "}
        becomes [1.5, 0.9, −1.2, 1.4]: <em>furry, flying, not a machine,
        alive</em>. The layer re-described its input in its own vocabulary.
        That output is a vector too, so another layer can re-describe it
        again. If the Inside Attention sidequest’s QKᵀ grid looked like this
        trick — it was: matrix multiplies are how networks do anything in bulk.
      </Prose>
      <HonestNote>
        We hand-wrote these rows with readable jobs (“furry animal?”) so the
        output is checkable; in a trained network the rows are learned and
        their “questions” are rarely this legible — that’s Chapter 10’s
        interpretability caveat. And a real layer would now apply the
        nonlinearity: ReLU would snap the −1.2 to 0 before passing the vector
        on.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 5: a two-layer network, live, with toggleable hidden units -------------
// Hidden units h_i = ReLU(w_i·p − 1) with w = the four diagonal directions;
// score s(p) = 1 − 3·Σ h_i. Inside the diamond |x|+|y| ≲ 4/3, s > 0.
const HIDDEN = [
  { w: [1, 1], label: "NE fence" },
  { w: [1, -1], label: "SE fence" },
  { w: [-1, 1], label: "NW fence" },
  { w: [-1, -1], label: "SW fence" },
];
const POINTS = [
  { p: [0, 0], bat: true }, { p: [0.6, 0.3], bat: true },
  { p: [-0.5, 0.4], bat: true }, { p: [0.2, -0.6], bat: true },
  { p: [1.4, 0.6], bat: false }, { p: [-1.3, -0.9], bat: false },
  { p: [0.3, -1.7], bat: false }, { p: [-1.6, 0.4], bat: false },
];
const netScore = (p, active) =>
  1 - 3 * HIDDEN.reduce((s, h, i) => s + (active[i] ? relu(h.w[0] * p[0] + h.w[1] * p[1] - 1) : 0), 0);

function NetworkSlide({ accent }) {
  const [active, setActive] = useState([true, true, true, true]);
  const canvasRef = useRef(null);
  const SIZE = 320;

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, SIZE, SIZE);
    const cell = 4;
    for (let i = 0; i < SIZE / cell; i++) {
      for (let j = 0; j < SIZE / cell; j++) {
        const x = ((i + 0.5) * cell / SIZE) * 4 - 2;
        const y = 2 - ((j + 0.5) * cell / SIZE) * 4;
        const s = netScore([x, y], active);
        ctx.fillStyle = s > 0 ? "rgba(167,139,250,0.28)" : "rgba(255,255,255,0.02)";
        ctx.fillRect(i * cell, j * cell, cell, cell);
      }
    }
  }, [active]);

  const verdicts = POINTS.map((pt) => (netScore(pt.p, active) > 0) === pt.bat);
  const right = verdicts.filter(Boolean).length;

  return (
    <Slide wide>
      <Kicker accent={accent}>Now stack, for real</Kicker>
      <Heading size="h2">Four bent fences make a pen.</Heading>
      <Prose muted>
        A real network, small enough to hold in your head: 2 inputs (a point’s
        x, y) → 4 hidden ReLU neurons → 1 output score. Points scoring above
        zero are called <em>bat territory</em> (shaded). Each hidden neuron
        contributes one straight fence with a ReLU bend at it; the second
        layer adds the fences up into a pen. Switch neurons off and watch
        their side of the pen vanish.
      </Prose>
      <Card>
        <div style={{ display: "flex", gap: SPACE.md, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ position: "relative", width: SIZE, maxWidth: "100%" }}>
            <canvas ref={canvasRef} width={SIZE} height={SIZE}
              style={{ width: "100%", border: `1px solid ${COLORS.hairline}`, borderRadius: 8, display: "block" }} />
            {POINTS.map((pt, i) => (
              <div key={i} style={{
                position: "absolute",
                left: `${((pt.p[0] + 2) / 4) * 100}%`, top: `${((2 - pt.p[1]) / 4) * 100}%`,
                transform: "translate(-50%, -50%)",
                width: 14, height: 14, borderRadius: "50%",
                background: pt.bat ? accent : COLORS.faint,
                border: `2px solid ${verdicts[i] ? COLORS.correct : COLORS.wrong}`,
                transition: "border-color 280ms",
              }} title={`(${pt.p[0]}, ${pt.p[1]})`} />
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 220 }}>
            <Mono style={{ fontSize: 11, color: COLORS.faint }}>
              HIDDEN LAYER — hᵢ = ReLU(wᵢ·p − 1)
            </Mono>
            {HIDDEN.map((h, i) => (
              <button key={i}
                onClick={() => setActive((a) => a.map((v, j) => (j === i ? !v : v)))}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                  border: `1px solid ${active[i] ? accent + "88" : COLORS.hairline}`,
                  borderRadius: 8, textAlign: "left",
                  opacity: active[i] ? 1 : 0.45, transition: "opacity 280ms, border-color 280ms",
                }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: active[i] ? accent : COLORS.faint }} />
                <Mono style={{ fontSize: 12 }}>{h.label}</Mono>
                <Mono style={{ fontSize: 12, color: COLORS.muted, marginLeft: "auto" }}>
                  w = [{h.w.join(", ")}]
                </Mono>
              </button>
            ))}
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: right === 8 ? COLORS.correct : COLORS.wrong, transition: "color 280ms" }}>
              {right}/8 points classified right
            </div>
            <Mono style={{ fontSize: 12, color: COLORS.muted }}>
              output: s = 1 − 3(h₁+h₂+h₃+h₄)
            </Mono>
          </div>
        </div>
      </Card>
      <Prose muted style={{ fontSize: 15 }}>
        The dot borders are the check: green means the network’s verdict
        matches the true label. With all four neurons on, it’s 8/8. Kill one
        and the pen tears open on that side — outsiders flood in and their
        borders go red. No single neuron “knows” the shape; the shape only
        exists in the team. That’s the actual sense in which knowledge is
        <em> in the weights</em>, spread out, nowhere in particular.
      </Prose>
      <HonestNote>
        Every shaded pixel is the real network evaluated live at that point —
        two layers, seventeen parameters, no tricks. We hand-picked the weights
        so the pen is a clean diamond; training would learn some equivalent
        set. Real classifiers usually squash the score through a sigmoid or
        softmax to get a probability, and real inputs have thousands of
        dimensions, not two — the fences become high-dimensional folds you
        can’t draw, but the mechanism is exactly this.
      </HonestNote>
    </Slide>
  );
}

// ---- The component ----------------------------------------------------------------
export default function SqNeuralNetwork({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Sidequest · optional deep dive</Kicker>
          <Heading>What Is a Neural Network?</Heading>
          <Lead>
            The course keeps gesturing at it: Chapter 4’s billions of dials,
            Chapter 10’s MLP that “expands, asks everything, compresses.”
            This sidequest builds the thing itself — starting from a single
            neuron you can operate by hand, ending inside GPT-3’s layers.
          </Lead>
          <Prose muted>
            This opened in its own tab, so your place in the course is safe.
            About 12 minutes, and the only math is multiply-and-add. When
            you’re done, just close the tab.
          </Prose>
        </Slide>
      );
    case 1:
      return <NeuronSlide accent={accent} />;
    case 2:
      return <LinearCollapseSlide accent={accent} />;
    case 3:
      return <ReluSlide accent={accent} />;
    case 4:
      return <LayerSlide accent={accent} />;
    case 5:
      return <NetworkSlide accent={accent} />;
    case 6:
      return (
        <Slide>
          <Kicker accent={accent}>Step back</Kicker>
          <Heading size="h2">It’s just a function. Count its knobs.</Heading>
          <Prose>
            The pen-builder on the last slide, in full:
          </Prose>
          <Card>
            <div style={{ fontFamily: FONTS.mono, fontSize: 14, lineHeight: 2.2, overflowX: "auto" }}>
              <div>
                <span style={{ color: COLORS.muted }}>hidden layer: 4 neurons × 2 weights + 4 biases = </span>
                <span style={{ color: COLORS.text }}>12 knobs</span>
              </div>
              <div>
                <span style={{ color: COLORS.muted }}>output layer: 4 weights + 1 bias = </span>
                <span style={{ color: COLORS.text }}>5 knobs</span>
              </div>
              <div>
                <span style={{ color: COLORS.muted }}>total: </span>
                <span style={{ color: accent, fontWeight: 600 }}>17 parameters</span>
              </div>
            </div>
          </Card>
          <Prose>
            <strong>Parameter</strong> is the technical word for every knob —
            each weight and each bias. And that’s the entire definition you’ve
            been building toward: a neural network is <em>one big function</em>.
            Numbers in, numbers out, with millions or billions of parameters
            deciding what it computes. There is no rulebook inside, no lookup
            table, no little diagram of a bat — just knob settings that make
            useful outputs come out.
          </Prose>
          <Prose muted>
            When Chapter 5 said GPT-3 has 175 billion weights, it meant
            exactly this kind of knob — the same w’s and b’s you dragged on
            slide two, ten billion times over. Training (Chapter 4) is the
            loop that finds the settings; the network is what holds them.
          </Prose>
          <HonestNote>
            “Neural” is a historical courtesy: the 1943 McCulloch–Pitts model
            was inspired by brain neurons, but real neurons spike, adapt, and
            wire chemically — a weighted sum with a bend is at best a loose
            cartoon of one. The field kept the name, not the biology.
          </HonestNote>
        </Slide>
      );
    case 7:
      return (
        <Slide wide>
          <Kicker accent={accent}>Back to the transformer</Kicker>
          <Heading size="h2">You’ve already met one. It’s the MLP.</Heading>
          <Prose muted>
            Chapter 10’s “expand, ask everything, compress” block is precisely
            a two-layer neural network — the kind you just built — applied to
            each token’s vector, one token at a time, with the same weights
            for every token. GPT-3’s version: 12,288 numbers in, 49,152 hidden
            neurons (the 4× expansion), 12,288 back out, with the nonlinearity
            at the bend.
          </Prose>
          <Card>
            <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 10 }}>
              COUNT THE KNOBS — one transformer layer, width d (classic GPT recipe)
            </Mono>
            <div style={{ fontFamily: FONTS.mono, fontSize: 14, lineHeight: 2.2, overflowX: "auto" }}>
              <div>
                <span style={{ color: accent }}>MLP</span>
                <span style={{ color: COLORS.muted }}>: expand d→4d is 4·d², compress 4d→d is 4·d² = </span>
                <span style={{ color: COLORS.text }}>8·d²</span>
              </div>
              <div>
                <span style={{ color: COLORS.muted }}>attention: W_Q + W_K + W_V + W_O = </span>
                <span style={{ color: COLORS.text }}>4·d²</span>
                <span style={{ color: COLORS.faint }}>  (the Inside Attention sidequest’s count)</span>
              </div>
              <div>
                <span style={{ color: COLORS.muted }}>MLP share: 8d² / 12d² = </span>
                <span style={{ color: accent, fontWeight: 600 }}>2/3 of every layer</span>
              </div>
            </div>
          </Card>
          <Prose muted style={{ fontSize: 15 }}>
            Run the numbers for GPT-3: d = 12,288, so one layer’s MLP is
            8 × 12,288² ≈ 1.2 billion parameters. Times 96 layers ≈ 116
            billion — two-thirds of the whole model is these little two-layer
            networks. Attention decides which tokens talk to each other; the
            MLPs do the per-token “thinking” in between, and they’re where
            much of the stored knowledge appears to live.
          </Prose>
          <HonestNote>
            The 2/3 holds for the classic GPT-2/GPT-3 recipe (4× expansion)
            and skips biases and layernorm, which are comparatively tiny.
            GPT-3’s nonlinearity is GELU, ReLU’s smooth cousin. Many newer
            models (Llama-family) use gated MLPs — three matrices instead of
            two, usually with a narrower expansion — so the exact fraction is
            an architecture choice; “MLPs hold most of the weights” is the
            durable part.
          </HonestNote>
        </Slide>
      );
    case 8:
      return (
        <Slide>
          <Kicker accent={accent}>One famous theorem, handled with care</Kicker>
          <Heading size="h2">In principle, one layer is enough.</Heading>
          <Prose>
            Remember the parabola on slide four — every doubling of ReLU units
            cutting the worst miss to a quarter? That wasn’t a lucky example.
            The <strong>universal approximation theorem</strong> (Cybenko
            1989; Hornik and colleagues 1991) makes it general: a network with
            a single hidden layer and a nonlinearity can, if made wide enough,
            match <em>any</em> continuous function on a bounded region as
            closely as you like.
          </Prose>
          <Prose>But read the fine print — it’s most of the story:</Prose>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.xs }}>
            {[
              ["it’s an existence claim", "the right weights exist — the theorem hands you no way to find them"],
              ["“wide enough” can be absurd", "matching a hard function may take astronomically many hidden neurons"],
              ["training may never get there", "Chapter 4’s loop can fail to find settings the theorem promises exist"],
            ].map(([name, q], i) => (
              <div key={name} className="reveal" style={{ animationDelay: `${i * 120}ms`, display: "flex", gap: 12, alignItems: "baseline" }}>
                <Mono accent={accent} style={{ fontSize: 13, minWidth: 210 }}>{name}</Mono>
                <Prose muted style={{ fontSize: 15 }}>{q}</Prose>
              </div>
            ))}
          </div>
          <Prose muted>
            Which is why real models go <em>deep</em> instead of merely wide:
            in practice, stacking layers reuses earlier bends to build later
            ones, and gets far more shape per parameter. GPT-3 isn’t one
            heroic 175-billion-neuron layer; it’s 96 modest ones, each
            re-describing the last one’s output — Chapter 10’s stack.
          </Prose>
          <HonestNote>
            Stated precisely, the theorem covers continuous functions on
            compact (bounded, closed) domains, approximated to any chosen
            tolerance — not “a network can compute anything.” Depth’s
            advantage is an honest mix of theory (some functions provably need
            exponentially wider shallow nets) and hard-won practice; the full
            picture is still active research.
          </HonestNote>
        </Slide>
      );
    case 9:
    default:
      return (
        <Slide>
          <Kicker accent={accent}>Sidequest complete</Kicker>
          <Heading size="h2">You built a neural network by hand.</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            {[
              "A neuron is a weighted sum plus a bias — z = w·x + b — a tiny opinion machine whose weights say which evidence it trusts.",
              "Stacked linear layers collapse into one, so networks put a bend between layers: ReLU(z) = max(0, z). Bends stack into curves — that’s where expressiveness comes from.",
              "A layer is many neurons on the same inputs — one matrix–vector multiply. Layers re-describe their input, and stacked layers fold space until the classes separate (your 17-parameter pen did it live).",
              "The whole thing is one function full of knobs called parameters — 17 in the toy, 175 billion in GPT-3 — and inside a transformer these networks are the MLP blocks: roughly 2/3 of every layer’s weights.",
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
            That’s the whole detour. Close this tab and pick the course back
            up exactly where you left it — Chapter 10’s “expand, ask
            everything, compress” should now read as arithmetic you’ve done,
            not a metaphor you’ve been handed.
          </Prose>
        </Slide>
      );
  }
}
