// Sidequest — How Networks Learn (v2, the pedagogy rebuild)
// The deep dive Chapter 4 points at, restructured per docs/SIDEQUEST-PEDAGOGY.md
// §B3: act-first hook, ONE persistent visual (the valley at night — the ball
// only ever lights the slope underfoot), fog-by-default with a LIFT THE FOG
// control, Predict Gates before every demo, and every formula demoted behind
// a MathDoor. All of v1's live math survives untouched underneath: the same
// one-knob softmax model on Chapter 4's bicycle joke, the same finite-
// difference nudge, the same breakable update rule, the same 2-D contour
// walk, the same GPT-3 scale arithmetic. Every number computed live.
import { useEffect, useRef, useState } from "react";
import {
  Slide, Kicker, Heading, Lead, Prose, Card, Button, GhostButton, Mono, HonestNote,
} from "../ui/shared.jsx";
import { PredictGate, CalledIt, GateLock, MathDoor, useFogMask } from "../ui/quest.jsx";
import { FONTS, COLORS, SPACE, MOTION } from "../styles/theme.js";

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

// The learner's knob position carries across slides. Slides remount on
// navigation, so continuity lives in a module variable (the Ch1 `lastStory`
// pattern) — the terrain is ONE place and the ball stays where you left it.
let carriedW = -2;

// ---- The persistent visual: the valley at night --------------------------------
const WMIN = -3, WMAX = 4, LMAX = 2.5;
const VB_W = 640, VB_H = 300, PAD_L = 20, PAD_R = 16, PAD_T = 14, PAD_B = 30;
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
const SILHOUETTE_PATH =
  CURVE_PATH + ` L${xOf(WMAX).toFixed(1)},${VB_H - PAD_B} L${xOf(WMIN).toFixed(1)},${VB_H - PAD_B} Z`;

// One terrain, every slide. The fog mask hides everything except a headlamp
// circle around the ball — the deepest truth of the quest drawn literally:
// the model never sees the map, only the slope underfoot. States morph
// (CSS transitions on the same SVG); nothing scene-cuts.
function Terrain({ accent, w, trail = [], fogLifted = false, onPick, showTangent = false, ghostW = null }) {
  const svgRef = useRef(null);
  const offChart = w < WMIN || w > WMAX;
  const wShown = Math.min(WMAX, Math.max(WMIN, w));
  const bx = xOf(wShown), by = yOf(lossW(wShown));
  const fog = useFogMask({ lifted: fogLifted, cx: bx, cy: by, r: 95, ambient: 0.06 });

  const pick = (e) => {
    if (!onPick || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const fx = ((e.clientX - rect.left) / rect.width) * VB_W;
    const wp = WMIN + ((fx - PAD_L) / (VB_W - PAD_L - PAD_R)) * (WMAX - WMIN);
    onPick(Math.min(WMAX, Math.max(WMIN, wp)));
  };

  // Tangent segment through (w, L(w)) with the true slope — the tilt underfoot.
  let tangent = null;
  if (showTangent && !offChart) {
    const s = slopeW(w);
    const dw = 0.55;
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
      <defs>
        {fog.defs}
        <radialGradient id="gd-ballglow">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* ground frame — always faintly visible; it's the night, not the map */}
      <line x1={PAD_L} y1={VB_H - PAD_B} x2={VB_W - PAD_R} y2={VB_H - PAD_B} stroke={COLORS.hairline} />
      <text x={VB_W - PAD_R} y={VB_H - 8} textAnchor="end" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.faint}>knob w →</text>
      {/* the terrain — only what the lamp (or a lifted fog) reveals */}
      <g mask={fog.maskUrl}>
        <path d={SILHOUETTE_PATH} fill={accent} opacity="0.08" />
        <path d={CURVE_PATH} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
        <line x1={xOf(W_STAR)} y1={yOf(L_MIN)} x2={xOf(W_STAR)} y2={VB_H - PAD_B} stroke={COLORS.text} strokeDasharray="3 4" opacity="0.35" />
      </g>
      {/* breadcrumbs — the walk's own memory, dim but unfogged */}
      {trail.map((tw, i) => (
        <circle
          key={i}
          cx={xOf(Math.min(WMAX, Math.max(WMIN, tw)))}
          cy={yOf(lossW(Math.min(WMAX, Math.max(WMIN, tw))))}
          r="3.5"
          fill="none"
          stroke={accent}
          strokeWidth="1.5"
          opacity={0.15 + 0.45 * (i / Math.max(1, trail.length - 1))}
        />
      ))}
      {/* the tilt underfoot */}
      {tangent && (
        <line {...tangent} stroke={COLORS.text} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.75"
          style={{ transition: `all ${MOTION.base} ${MOTION.ease}` }} />
      )}
      {/* a ghost of the nudged position (slide 4's measurement flash) */}
      {ghostW != null && (
        <circle className="reveal" cx={xOf(ghostW)} cy={yOf(lossW(ghostW))} r="5" fill="none" stroke={COLORS.text} strokeWidth="1.5" opacity="0.7" />
      )}
      {/* the ball + its headlamp glow — the quest's single light source */}
      <g style={{ transform: `translate(${bx}px, ${by}px)`, transition: `transform ${MOTION.base} ${MOTION.ease}` }}>
        <circle r="26" fill="url(#gd-ballglow)" />
        <circle r="7" fill={offChart ? "none" : accent} stroke={accent} strokeWidth="2" />
      </g>
      {offChart && (
        <text x={w > WMAX ? VB_W - PAD_R : PAD_L + 4} y={by - 14} textAnchor={w > WMAX ? "end" : "start"} fontFamily={FONTS.mono} fontSize="12" fill={COLORS.wrong}>
          off the chart → w = {fmt(w, 1)}
        </text>
      )}
    </svg>
  );
}

// Wrongness as light, not digits: a bar that shrinks and cools toward calm.
function WrongnessBar({ value }) {
  // value in [0, 1]
  const pct = Math.max(2, value * 100);
  const hot = value > 0.12;
  const color = hot ? COLORS.wrong : COLORS.correct;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Mono style={{ fontSize: 11, color: COLORS.faint, whiteSpace: "nowrap" }}>WRONGNESS</Mono>
      <div style={{ flex: 1, height: 16, background: "rgba(255,255,255,.05)", borderRadius: 5, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          opacity: 0.45 + 0.55 * value,
          boxShadow: `0 0 ${6 + 18 * value}px ${color}`,
          transition: `width 160ms ease-out, background ${MOTION.base}, box-shadow 160ms`,
        }} />
      </div>
    </div>
  );
}

// ---- Slide 0: the hook — do it by hand, no numbers ------------------------------
const HOOK_MAX = lossW(-2); // wrongness normalizer: bar full at the slider's left end
const wrongnessOf = (w) =>
  Math.max(0, Math.min(1, (lossW(w) - L_MIN) / (HOOK_MAX - L_MIN)));
// The model's bet, as two bars: probability visibly flows from one answer to
// the other as the dial turns. Bars, not digits — the number diet holds.
function BetBars({ accent, pPun }) {
  const row = (label, p, isPun) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Mono style={{ minWidth: 118, fontSize: 12, color: isPun ? accent : COLORS.text }}>
        {label}
      </Mono>
      <div style={{ flex: 1, height: 14, background: "rgba(255,255,255,.05)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${Math.max(1.5, p * 100)}%`,
          background: isPun ? accent : "rgba(255,255,255,.5)",
          opacity: 0.4 + 0.6 * p,
          boxShadow: p > 0.55 ? `0 0 ${p * 12}px ${isPun ? accent : "rgba(255,255,255,.4)"}` : "none",
          transition: "width 160ms ease-out, opacity 160ms, box-shadow 160ms",
        }} />
      </div>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {row("two-tired", pPun, true)}
      {row("knocked over", 1 - pPun, false)}
    </div>
  );
}

function HookSlide({ accent }) {
  const [w, setW] = useState(-2);
  const [everDone, setEverDone] = useState(false);
  const wrongness = wrongnessOf(w);
  const pPun = sigmoid(w);

  return (
    <Slide>
      <Kicker accent={accent}>Sidequest · optional deep dive</Kicker>
      <Heading>How Networks Learn</Heading>
      <Lead>Before anything else: this model has one dial. Make it less wrong.</Lead>
      <Prose muted style={{ fontSize: 15 }}>
        The model has one job tonight: finish{" "}
        <em>“the bicycle fell over because it was ___.”</em> It's torn between
        two answers — the pun (<Mono accent={accent}>two-tired</Mono>) and the
        boring truth (<Mono>knocked over</Mono>) — and{" "}
        <strong>the dial moves the model's bet between them</strong>.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 12 }}>
          THE ONLY CONTROL
        </Mono>
        <input
          type="range" min={-2} max={3} step={0.02} value={w}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setW(v);
            carriedW = v;
            if (wrongnessOf(v) < 0.01) setEverDone(true);
          }}
          style={{ width: "100%", marginBottom: 14 }}
          aria-label="the dial"
        />
        <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 8 }}>
          THE MODEL'S BET
        </Mono>
        <BetBars accent={accent} pPun={pPun} />
        <div style={{ borderTop: `1px solid ${COLORS.hairline}`, marginTop: 12, paddingTop: 12 }}>
          <WrongnessBar value={wrongness} />
        </div>
      </Card>
      {everDone ? (
        <Prose className="reveal">
          Done — the bar went quiet, with the bet leaning pun-ward but hedged.
          You just trained a model, by eye, with a full view of the one dial
          it has. Now the question this whole quest answers:{" "}
          <strong>how does a machine do what your hand just did, with 175
          billion dials and no eyes?</strong>
        </Prose>
      ) : (
        <Prose muted style={{ fontSize: 15 }}>
          Drag, and watch the bet flow between the two answers — then watch
          what that does to the wrongness bar. Stop when it goes green and
          quiet. No numbers yet; your eyes are doing all the work. That's the
          point.
        </Prose>
      )}
      <Prose muted style={{ fontSize: 15 }}>
        This opened in its own tab, so your place in the course is safe.
        About 12 minutes. When you're done, just close the tab.
      </Prose>
    </Slide>
  );
}

// ---- Slide 1: sharpen — the four snippets behind the bar -------------------------
function SharpenSlide({ accent }) {
  return (
    <Slide>
      <Kicker accent={accent}>Why the bar moved</Kicker>
      <Heading size="h2">One knob, four snippets.</Heading>
      <Prose>
        That wrongness bar wasn't vibes — and neither was the bet you settled
        on. Behind both sit four training snippets — Chapter 4's bicycle joke,
        shrunk to the smallest model that is still real. Here is the{" "}
        <em>entire</em> training set:
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
        Your dial has a name now: <Mono accent={accent}>w</Mono>, the model's
        preference for the pun. Crank it up and the model loves “two-tired”;
        negative and it goes literal. Three snippets reward pun-love, one
        punishes it — which is why dragging right helped, and why it stopped
        helping. Finding the balance point <em>automatically</em> is the whole
        game.
      </Prose>
      <MathDoor accent={accent} reassure>
        <div style={{ fontFamily: FONTS.mono, fontSize: 13, lineHeight: 2, color: COLORS.muted }}>
          <div>score(two-tired) = w &nbsp;&nbsp; score(knocked over) = 0</div>
          <div>exponentiate, then share the total:</div>
          <div style={{ color: COLORS.text }}>p(two-tired) = e^w / (e^w + e⁰)</div>
          <div style={{ marginTop: 6 }}>at w = 0 → a 50/50 split</div>
          <div>at w = ln 3 ≈ 1.10 → a 75/25 split</div>
        </div>
        <Prose muted style={{ fontSize: 14 }}>
          This exponentiate-and-share move is a two-option <strong>softmax</strong> —
          the same probability machine every LLM runs over its whole
          vocabulary, and the same one Chapter 11's temperature dial reaches
          into.
        </Prose>
      </MathDoor>
      <HonestNote>
        Real training data is trillions of tokens and the choices span a
        ~100,000-word vocabulary, not two answers. But this miniature is a
        genuine softmax model with a genuine loss — the same species as the
        real thing, bred small enough to audit. Everything you'll see is
        computed live in your browser.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 2: loss — penalty bars, gated on the tug-of-war -----------------------
function LossSlide({ accent }) {
  const [guess, setGuess] = useState(null);
  const [w, setW] = useState(() => Math.min(1.6, Math.max(-1.6, carriedW)));
  const [maxSeen, setMaxSeen] = useState(w);
  const pPun = sigmoid(w);
  const loss = lossW(w);
  const atBottom = loss - L_MIN < 0.004;
  const pastMin = !atBottom && w > W_STAR + 0.05; // past the minimum: loss is visibly rising again
  const crankedFully = maxSeen > 2.6;

  const move = (v) => { setW(v); carriedW = v; setMaxSeen((m) => Math.max(m, v)); };

  return (
    <Slide wide>
      <Kicker accent={accent}>Scoring wrongness</Kicker>
      <Heading size="h2">Loss: one number for “how wrong.”</Heading>
      <Prose muted>
        Each snippet charges the model a penalty: nearly free if the model
        gave the right answer high probability, a fortune if it was
        confidently wrong. Average the four charges and you get{" "}
        <strong>the loss</strong> — the number your wrongness bar was hiding.
      </Prose>
      <PredictGate
        accent={accent}
        question="One of the four snippets wants the literal answer. As you push the knob further and further pun-ward, what does total wrongness do?"
        options={[
          { id: "falls", label: "keeps dropping, all the way" },
          { id: "up", label: "starts rising again past a point" },
        ]}
        guess={guess}
        onCommit={setGuess}
        correct="up"
        resolved={crankedFully}
      >
        {crankedFully ? (
          <CalledIt hit={guess === "up"}>
            past a point, total wrongness starts rising again — you can see
            the loss number turn warm the moment you cross it. Here's why:
            three of the four snippets love the pun, but the fourth is
            literal, and going all-in on the joke makes the model{" "}
            <em>maximally</em> wrong on that one — its glowing charge grows
            faster than the three joke charges shrink. The best dial setting
            has to balance all four snippets at once. That tug-of-war is the
            reason a lowest point exists at all — and finding it is the whole
            game.
          </CalledIt>
        ) : (
          <Prose muted style={{ fontSize: 15 }}>
            Locked in. Now crank the knob all the way right and watch the four
            charges — and the total.
          </Prose>
        )}
      </PredictGate>
      <GateLock locked={guess == null}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: SPACE.sm }}>
            <Mono style={{ fontSize: 11, color: COLORS.faint, whiteSpace: "nowrap" }}>THE KNOB</Mono>
            <input
              type="range" min={-2} max={3} step={0.02} value={w}
              onChange={(e) => move(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SNIPPETS.map((s, i) => {
              const p = s.pun ? pPun : 1 - pPun;
              const cost = -Math.log(p);
              const heat = Math.min(1, cost / 3);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Mono style={{ minWidth: 118, fontSize: 12, color: s.pun ? accent : COLORS.text }}>
                    → {s.target}
                  </Mono>
                  <div style={{ flex: 1, height: 14, background: "rgba(255,255,255,.05)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.max(1.5, heat * 100)}%`,
                      background: s.pun ? accent : "rgba(255,255,255,.55)",
                      opacity: 0.35 + 0.65 * heat,
                      boxShadow: heat > 0.5 ? `0 0 ${heat * 14}px ${s.pun ? accent : "rgba(255,255,255,.5)"}` : "none",
                      transition: "width 160ms ease-out, opacity 160ms, box-shadow 160ms",
                    }} />
                  </div>
                </div>
              );
            })}
            <div style={{ borderTop: `1px solid ${COLORS.hairline}`, paddingTop: 8, display: "flex", justifyContent: "flex-end", gap: 10, alignItems: "baseline" }}>
              {pastMin && (
                <Mono style={{ fontSize: 12, color: COLORS.wrong }}>▲ rising again</Mono>
              )}
              <Mono style={{ fontSize: 12, color: COLORS.faint }}>average of the four =</Mono>
              <Mono
                accent={atBottom ? COLORS.correct : pastMin ? COLORS.wrong : accent}
                style={{ fontSize: 20, fontWeight: 600, transition: `color ${MOTION.fast}` }}
              >
                loss {fmt(loss, 2)}
              </Mono>
            </div>
          </div>
        </Card>
      </GateLock>
      {atBottom && (
        <Prose className="reveal" muted style={{ fontSize: 15 }}>
          And there's the balance point: the pun gets three-quarters of the
          probability — exactly its share of the snippets. The data pulled the
          knob to the honest answer.
        </Prose>
      )}
      <MathDoor accent={accent}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 13, lineHeight: 2, color: COLORS.muted, overflowX: "auto" }}>
          <div>penalty per snippet = <span style={{ color: COLORS.text }}>−ln( p(right answer) )</span></div>
          <div style={{ marginTop: 6 }}>right now, at w = {fmt(w, 2)}: p(two-tired) = {fmt(pPun)} p(knocked over) = {fmt(1 - pPun)}</div>
          {SNIPPETS.map((s, i) => {
            const p = s.pun ? pPun : 1 - pPun;
            return <div key={i}>→ {s.target}: −ln {fmt(p)} = {fmt(-Math.log(p))}</div>;
          })}
          <div style={{ color: COLORS.text }}>average = loss = {fmt(loss, 4)}</div>
        </div>
        <HonestNote>
          −ln(p) is <strong>cross-entropy</strong> — the actual loss LLMs
          train on, and the falling number in Chapter 4's demo. Confidently
          right costs almost nothing; confidently wrong costs a fortune (−ln
          of a tiny probability is huge). Every number above is computed live.
        </HonestNote>
      </MathDoor>
    </Slide>
  );
}

// ---- Slide 3: the landscape, at night ---------------------------------------------
function LandscapeSlide({ accent }) {
  const [w, setW] = useState(() => Math.min(WMAX, Math.max(WMIN, carriedW)));
  const [lifted, setLifted] = useState(false);
  return (
    <Slide wide>
      <Kicker accent={accent}>The terrain picture</Kicker>
      <Heading size="h2">Loss is a landscape. You're in it, at night.</Heading>
      <Prose muted>
        Plot the loss for <em>every</em> knob setting at once and you'd get a
        valley — but notice what that would hand you: the whole map. Training
        never gets the map. Here's the honest view: a headlamp. The ball only
        ever lights the slope under its own feet. Click anywhere to walk
        there.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 6 }}>
          THE VALLEY, AT NIGHT — click to move · the lamp shows everything the model ever sees
        </Mono>
        <Terrain accent={accent} w={w} fogLifted={lifted} onPick={(v) => { setW(v); carriedW = v; }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
          <Mono style={{ fontSize: 13, color: COLORS.muted }}>
            loss underfoot: <span style={{ color: accent }}>{fmt(lossW(w), 2)}</span>
          </Mono>
          <GhostButton onClick={() => setLifted((v) => !v)}>
            {lifted ? "DROP THE FOG" : "LIFT THE FOG"}
          </GhostButton>
        </div>
        {lifted && (
          <Prose className="reveal" muted style={{ fontSize: 14, marginTop: 8 }}>
            This aerial view is a cheat — drawable only because there's one
            knob and we did the plotting for you. Training never, ever gets
            this view. Enjoy it, then drop the fog: the rest of the quest
            plays fair.
          </Prose>
        )}
      </Card>
      <Prose muted style={{ fontSize: 15 }}>
        So the real problem, stated honestly: <strong>how do you find the
        bottom of a valley you can't see?</strong>
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

// ---- Slide 4: the nudge, gated ------------------------------------------------
const NUDGE = 0.001;
const NUDGE_START = -1.5; // fixed fresh hillside so the blind call is a true coin flip
function NudgeSlide({ accent }) {
  const [guess, setGuess] = useState(null);
  const [w, setW] = useState(NUDGE_START);
  const [nudged, setNudged] = useState(false);
  const [flash, setFlash] = useState(false);
  const [lifted, setLifted] = useState(false);
  const flashTimer = useRef(null);
  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const L0 = lossW(w);
  const L1 = lossW(w + NUDGE);
  const slope = (L1 - L0) / NUDGE;
  const flat = Math.abs(slope) < 0.01;
  const downhillRight = slope < 0;

  const doNudge = () => {
    setFlash(true);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(false), 900);
    setNudged(true);
  };

  return (
    <Slide wide>
      <Kicker accent={accent}>Which way is downhill?</Kicker>
      <Heading size="h2">No eyes. But you have feet.</Heading>
      <Prose muted>
        New night, fresh hillside. The fog is total; the lamp shows a patch of
        ground and nothing else. You could guess which way is down — or you
        could <em>measure</em>: shift your weight a hair to the right and feel
        whether the ground drops.
      </Prose>
      <PredictGate
        accent={accent}
        question="You're standing here in the fog. Call it: is downhill to the left, or to the right?"
        options={[
          { id: "left", label: "downhill is LEFT" },
          { id: "right", label: "downhill is RIGHT" },
        ]}
        guess={guess}
        onCommit={setGuess}
      >
        {!nudged ? (
          <Prose muted style={{ fontSize: 15 }}>Locked in. Now press NUDGE and let the ground answer.</Prose>
        ) : (
          <CalledIt hit={(guess === "right") === downhillRight}>
            {(guess === "right") === downhillRight ? (
              <>
                the nudge agrees — downhill is to the{" "}
                {downhillRight ? "right" : "left"}. But be honest: that call
                was luck. From inside the fog, eyes had nothing to go on. The
                nudge <em>knew</em>.
              </>
            ) : (
              <>
                the ground says downhill is to the{" "}
                {downhillRight ? "right" : "left"}. No shame — from inside the
                fog it was a coin flip, and that's the whole point: guessing
                doesn't scale. Measuring does.
              </>
            )}
          </CalledIt>
        )}
      </PredictGate>
      <GateLock locked={guess == null}>
        <Card>
          <Terrain
            accent={accent}
            w={w}
            fogLifted={lifted}
            showTangent={nudged}
            ghostW={flash ? w + 0.35 : null /* exaggerated for visibility; the real nudge is 0.001 */}
          />
          <div style={{ display: "flex", gap: SPACE.sm, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
            <Button accent={accent} onClick={doNudge}>{nudged ? "Nudge again" : "NUDGE"}</Button>
            {nudged && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 220, flex: 1, maxWidth: 360 }}>
                  <Mono style={{ fontSize: 11, color: COLORS.faint, whiteSpace: "nowrap" }}>WALK SOMEWHERE ELSE</Mono>
                  <input type="range" min={-2.8} max={3.8} step={0.05} value={w}
                    onChange={(e) => setW(parseFloat(e.target.value))} style={{ flex: 1 }} />
                </div>
                <GhostButton onClick={() => setLifted((v) => !v)}>{lifted ? "DROP THE FOG" : "LIFT THE FOG"}</GhostButton>
              </>
            )}
          </div>
          {nudged && (
            <div className="reveal" style={{ fontFamily: FONTS.mono, fontSize: 13, color: flat ? COLORS.correct : COLORS.text, marginTop: 10 }}>
              {flat
                ? "the ground barely answered — it's flat here. You're at the bottom."
                : downhillRight
                  ? "nudged right → the loss FELL. Downhill is to the right; the tilt line shows how steeply."
                  : "nudged right → the loss ROSE. Downhill is to the left; the tilt line shows how steeply."}
            </div>
          )}
        </Card>
      </GateLock>
      {nudged && (
        <Prose className="reveal" muted style={{ fontSize: 15 }}>
          That measured ratio — how fast the loss changes per hair of knob —
          is the <strong>slope</strong> under your feet: its sign says which
          way is downhill, its size says how steep. Calculus has a word for
          this ratio (the <strong>derivative</strong>), and you don't need
          the word — you just computed the thing itself, with two
          measurements and a division.
        </Prose>
      )}
      <MathDoor accent={accent}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 13, lineHeight: 2, color: COLORS.muted, overflowX: "auto" }}>
          <div>loss({fmt(w, 3)})&nbsp;&nbsp;&nbsp;= <span style={{ color: COLORS.text }}>{fmt(L0, 6)}</span></div>
          <div>loss({fmt(w + NUDGE, 3)}) = <span style={{ color: COLORS.text }}>{fmt(L1, 6)}</span> <span style={{ color: COLORS.faint }}>← nudged by +0.001</span></div>
          <div>change ÷ nudge = {fmt(L1 - L0, 6)} ÷ 0.001 = <span style={{ color: accent, fontWeight: 600 }}>{fmt(slope, 3)}</span></div>
        </div>
        <HonestNote>
          A two-measurement estimate like this is called a{" "}
          <strong>finite difference</strong>. The true slope is what the
          ratio approaches as the nudge shrinks to zero — real training
          computes that exact value with calculus rather than by nudging
          (why nudging is hopeless at scale is this quest's closing story).
          Here the estimate and the exact slope agree to 3 decimals — check:
          exact slope at w = {fmt(w, 2)} is {fmt(slopeW(w), 4)}.
        </HonestNote>
      </MathDoor>
    </Slide>
  );
}

// ---- Slide 5: the update rule + breakable step size --------------------------------
const W0 = -2.5;
function DescentSlide({ accent }) {
  const [w, setW] = useState(W0);
  const [eta, setEta] = useState(2);
  const [trail, setTrail] = useState([]);
  const [lastStep, setLastStep] = useState(null); // {w, s, next}
  const [lifted, setLifted] = useState(false);

  const slope = slopeW(w);
  const converged = Math.abs(slope) < 0.001;
  const wild = eta >= 9;

  const step = () => {
    const s = slopeW(w);
    const next = w - eta * s;
    setTrail((t) => [...t.slice(-7), w]);
    setLastStep({ w, s, next });
    setW(next);
  };
  const reset = () => { setW(W0); setTrail([]); setLastStep(null); };

  return (
    <Slide wide>
      <Kicker accent={accent}>The two-line algorithm</Kicker>
      <Heading size="h2">new w = old w − step size × slope.</Heading>
      <Prose muted>
        The slope points uphill, so walk the other way — a stride set by the
        steepness times a number you choose, the <strong>step size</strong>.
        That subtraction is the entire algorithm. Walk it — and before you
        crank the step size past 9, call it silently: does a too-big stride
        settle <em>slower</em>, or <em>never settle at all</em>?
      </Prose>
      <Card>
        <Terrain accent={accent} w={w} trail={trail} fogLifted={lifted} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
          <Mono style={{ fontSize: 13, color: COLORS.muted }}>
            loss underfoot:{" "}
            <span style={{ color: converged ? COLORS.correct : accent }}>{fmt(lossW(w), 2)}</span>
          </Mono>
          <GhostButton onClick={() => setLifted((v) => !v)}>{lifted ? "DROP THE FOG" : "LIFT THE FOG"}</GhostButton>
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
          ? <>Settled — the same valley floor you found by eye on slide one, found <em>blind</em>. And notice the walk slowed by itself: gentler ground means smaller slope means smaller strides. Nobody told it to brake.</>
          : wild
            ? <>There's your answer: it <strong>never settles</strong>. Each stride overshoots the floor and lands on the far wall, sometimes higher than it started — a ricochet, not a walk. Real training diverges exactly like this when the learning rate is too high.</>
            : eta <= 0.6
              ? <>Step size {fmt(eta, 1)} is safe but timid — it'll get there, eventually. Real training can't afford “eventually.” Now crank the slider past 9 and step: break it on purpose.</>
              : <>Keep stepping and watch the strides: big slope, big stride; near the floor, baby steps. Then try the extremes — 0.2 crawls, 12 ricochets.</>}
      </Prose>
      <MathDoor accent={accent}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 13, lineHeight: 2, color: COLORS.muted, overflowX: "auto" }}>
          <div>the rule in symbols: <span style={{ color: COLORS.text }}>w ← w − η · (dL/dw)</span> <span style={{ color: COLORS.faint }}>(η = the step size)</span></div>
          {lastStep ? (
            <div>your last step: {fmt(lastStep.w, 3)} − {fmt(eta, 1)} × ({fmt(lastStep.s, 3)}) = <span style={{ color: COLORS.text }}>{fmt(lastStep.next, 3)}</span></div>
          ) : (
            <div style={{ color: COLORS.faint }}>take a step and its arithmetic will appear here</div>
          )}
        </div>
      </MathDoor>
      <HonestNote>
        “Step size” is the real term <strong>learning rate</strong>, usually
        written η. It's tiny in practice — GPT-3's published peak learning
        rate was 6×10⁻⁵, warmed up and then decayed on a schedule — because
        real landscapes are treacherous and real gradients are noisy. But the
        failure you just produced is real: too high and the loss blows up,
        too low and training crawls.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 6: two knobs, a fogged contour map ---------------------------------------
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
  const [guess, setGuess] = useState(null);
  const [pos, setPos] = useState([-2, 2.8]);
  const [path, setPath] = useState([[-2, 2.8]]);
  const [running, setRunning] = useState(false);
  const [lifted, setLifted] = useState(false);
  const runToken = useRef(0);
  const svgRef = useRef(null);
  useEffect(() => () => { runToken.current++; }, []);

  const [g1, g2] = grad2(pos[0], pos[1]);
  const L = loss2(pos[0], pos[1]);
  const atMin = L - L2_MIN < 0.0005;
  const walked = path.length > 5;

  const bx = mapX(pos[0]), by = mapY(pos[1]);
  const fog = useFogMask({ lifted, cx: bx, cy: by, r: 75, ambient: 0.05 });

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
  const ax2 = mapX(pos[0] - 4 * g1), ay2 = mapY(pos[1] - 4 * g2);

  return (
    <Slide wide>
      <Kicker accent={accent}>One more knob</Kicker>
      <Heading size="h2">Two knobs make a map.</Heading>
      <Prose muted>
        Give the model a second knob — a score for a third candidate,{" "}
        <Mono accent={accent}>broken</Mono> — and a fifth snippet where
        “broken” was right. Your position is now two numbers, and the valley
        is real terrain, banded by lines of equal loss. The slope becomes one
        slope <em>per knob</em>, stapled into a list — that list is the{" "}
        <strong>gradient</strong>, and it points straight uphill. Same rule:
        step the other way.
      </Prose>
      <PredictGate
        accent={accent}
        question="The green arrow is the downhill direction the gradient gives. When the ball walks: will its path run along the bands of equal loss, or cut straight across them?"
        options={[
          { id: "along", label: "along the bands" },
          { id: "across", label: "straight across them" },
        ]}
        guess={guess}
        onCommit={setGuess}
      >
        {walked && lifted ? (
          <CalledIt hit={guess === "across"}>
            straight across, every time — steepest descent crosses contour
            lines head-on, the way water runs off a hill. A path{" "}
            <em>along</em> a band would keep the loss constant, which is
            exactly what a downhill walk refuses to do.
          </CalledIt>
        ) : (
          <Prose muted style={{ fontSize: 15 }}>
            {walked
              ? "Now LIFT THE FOG to check your call against the trail."
              : "Locked in. Drop the ball anywhere, walk it, then lift the fog to check."}
          </Prose>
        )}
      </PredictGate>
      <GateLock locked={guess == null}>
        <Card>
          <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 8 }}>
            THE LOSS MAP, AT NIGHT — click to drop the ball · darker = lower · arrow = −gradient
          </Mono>
          <div style={{ overflowX: "auto" }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${MAP_W} ${MAP_H}`}
              style={{ width: "100%", maxWidth: 620, display: "block", cursor: running ? "default" : "crosshair", touchAction: "none" }}
              onPointerDown={pick}
            >
              <defs>{fog.defs}</defs>
              <g mask={fog.maskUrl}>
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
              </g>
              <polyline
                points={path.map(([a, b]) => `${mapX(a)},${mapY(b)}`).join(" ")}
                fill="none" stroke={COLORS.text} strokeWidth="1.5" opacity="0.55"
              />
              {path.map(([a, b], i) => (
                <circle key={i} cx={mapX(a)} cy={mapY(b)} r="2.5" fill={COLORS.text} opacity="0.45" />
              ))}
              {!atMin && <line x1={bx} y1={by} x2={ax2} y2={ay2} stroke={COLORS.correct} strokeWidth="2" />}
              <g style={{ transform: `translate(${bx}px, ${by}px)`, transition: "transform 150ms linear" }}>
                <circle r="18" fill={accent} opacity="0.18" />
                <circle r="6" fill={accent} stroke="#0B0E14" strokeWidth="1.5" />
              </g>
            </svg>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
            <Mono style={{ fontSize: 13, color: COLORS.muted }}>
              loss underfoot: <span style={{ color: atMin ? COLORS.correct : accent }}>{fmt(L, 2)}</span>
              {atMin && <span style={{ color: COLORS.correct }}> — bottom found</span>}
            </Mono>
            <GhostButton onClick={() => setLifted((v) => !v)}>{lifted ? "DROP THE FOG" : "LIFT THE FOG"}</GhostButton>
          </div>
        </Card>
      </GateLock>
      <div style={{ display: "flex", gap: SPACE.sm }}>
        <Button accent={accent} onClick={step} disabled={running || guess == null}>Step</Button>
        <GhostButton onClick={run} disabled={running || guess == null}>{running ? "Walking…" : "Run 22 steps"}</GhostButton>
      </div>
      <Prose muted style={{ fontSize: 15 }}>
        Now the jump that matters: a real model has <strong>billions</strong>{" "}
        of knobs, so the landscape is a surface in billions of dimensions that
        nobody can draw, picture, or lift the fog on — the fog is total, for
        everyone, forever. The rule does not care. It's still one list of
        slopes and one subtraction per knob — the same two lines of
        arithmetic, run wider.
      </Prose>
      <MathDoor accent={accent}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 13, lineHeight: 2, color: COLORS.muted, overflowX: "auto" }}>
          <div>(w₁, w₂) = ({fmt(pos[0], 2)}, {fmt(pos[1], 2)})</div>
          <div>gradient = (slope per knob) = (<span style={{ color: COLORS.text }}>{fmt(g1, 3)}</span>, <span style={{ color: COLORS.text }}>{fmt(g2, 3)}</span>)</div>
          <div>loss = {fmt(L, 4)} · minimum at (ln 3, 0) ≈ (1.10, 0.00), loss {fmt(L2_MIN, 4)}</div>
          <div style={{ color: COLORS.faint }}>at the minimum the probabilities hit (0.6, 0.2, 0.2) — the counts 3/1/1 in the five snippets</div>
        </div>
        <HonestNote>
          The map is computed live on a {M_COLS}×{M_ROWS} grid of real loss
          values. “Perpendicular to the contours” is exact for infinitesimal
          steps; our finite steps (η = 2.5) only approximate it, which you
          can see in the path's slight zig.
        </HonestNote>
      </MathDoor>
    </Slide>
  );
}

// ---- Slide 7: the scale of real training (the quest's wow-stat) ---------------------
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

// ---- Slide 8: the bridge back into the course ----------------------------------------
function CourseBridgeSlide({ accent }) {
  return (
    <Slide>
      <Kicker accent={accent}>Cash it out</Kicker>
      <Heading size="h2">This walk is what “training” means.</Heading>
      <Prose>
        The course has been spending one word on credit since Chapter 4:{" "}
        <em>training</em>. You've now run it. Line the loop up against what
        your hands just did:
      </Prose>
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
          {[
            ["1 · GUESS", "The model predicts the hidden word — your four snippets, at scale."],
            ["2 · CHECK", "The loss: the wrongness bar you shrank on slide one, one number for how wrong."],
            ["3 · ADJUST", "The step: new knob = old knob − step size × slope. Once per knob, all at once."],
          ].map(([label, text], i) => (
            <div key={label} className="reveal" style={{ animationDelay: `${i * 150}ms`, display: "flex", gap: 14, alignItems: "baseline" }}>
              <Mono accent={accent} style={{ fontSize: 13, minWidth: 92 }}>{label}</Mono>
              <Prose>{text}</Prose>
            </div>
          ))}
        </div>
      </Card>
      <Prose>
        Run that loop over every one of 175 billion knobs, across trillions
        of next-word predictions, for months of datacenter time — and the
        ball finally stops rolling. Where it stops, the frozen dial settings,
        is the model you talk to. When Chapter 5 says “175 billion dials,”
        it's naming the dimensions of this valley. When Chapter 4 says “the
        loop,” it's this downhill walk. Re-read them after this tab — they
        should have stopped being slogans.
      </Prose>
      <HonestNote>
        This is the <em>pretraining</em> walk. Chapter 6's second act —
        instruction tuning and RLHF — reuses the same engine on different
        data: new loss, same downhill rule. There is one learning algorithm
        in this story, and you've now run it.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 9: the bridge to backpropagation -------------------------------------------
function BackpropBridgeSlide({ accent }) {
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
        backward through the layers, sharing work as it goes, and its name
        is <strong>backpropagation</strong>. How it pulls that off is a story
        of its own — a future sidequest. For now, keep the honest headline:
        gradient descent decides <em>where to step</em>; backprop is how the
        slopes get computed <em>fast</em>.
      </Prose>
      <HonestNote>
        Our nudge-and-remeasure (finite differences) was for intuition only —
        real training computes gradients analytically, so they're exact, and
        a full backward pass costs about the same as two forward passes
        regardless of how many knobs there are. The “1 ms per run” is
        absurdly generous: a 175B-parameter forward pass over a 3.2M-token
        batch takes vastly longer without a datacenter doing many things in
        parallel. The conclusion survives any honest number you plug in.
      </HonestNote>
    </Slide>
  );
}

// ---- The component --------------------------------------------------------------
export default function SqGradientDescent({ accent, slide }) {
  switch (slide) {
    case 0: return <HookSlide accent={accent} />;
    case 1: return <SharpenSlide accent={accent} />;
    case 2: return <LossSlide accent={accent} />;
    case 3: return <LandscapeSlide accent={accent} />;
    case 4: return <NudgeSlide accent={accent} />;
    case 5: return <DescentSlide accent={accent} />;
    case 6: return <TwoKnobSlide accent={accent} />;
    case 7: return <ScaleSlide accent={accent} />;
    case 8: return <CourseBridgeSlide accent={accent} />;
    case 9: return <BackpropBridgeSlide accent={accent} />;
    case 10:
    default:
      return (
        <Slide>
          <Kicker accent={accent}>Sidequest complete</Kicker>
          <Heading size="h2">You can now say, in your own words:</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            {[
              "Learning is nothing mystical: turn the knobs to shrink one number — the loss — that scores how wrong the model is on its training snippets.",
              "The model never sees the landscape. It stands in the fog, feels the slope under its feet by measuring, and the entire algorithm is: small step downhill, repeat.",
              "Too big a step ricochets out of the valley and never settles; too small crawls. You broke both ends yourself.",
              "LLM training is this exact walk run over billions of knobs at once, for months — and the frozen place the ball stops is the model you talk to. The slopes come from backpropagation, not nudging: that trick is the next sidequest.",
            ].map((line, i) => (
              <div key={i} className="reveal" style={{ display: "flex", gap: 14, alignItems: "baseline", animationDelay: `${i * 120}ms` }}>
                <span style={{ color: accent, fontFamily: FONTS.mono, fontSize: 14 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Prose>{line}</Prose>
              </div>
            ))}
          </div>
          <Prose muted style={{ fontSize: 15 }}>
            What we deliberately did not cover: how the slopes get computed
            fast (backpropagation), and the industrial dressing — batches,
            Adam, learning-rate schedules — footnoted only. If you stopped
            here for good, you'd still own the essence of how machines learn.
          </Prose>
          <Prose muted style={{ marginTop: SPACE.sm }}>
            That's the detour. Close this tab and pick the course back up —
            and when Chapter 4 says “nudge every dial toward the right
            answer,” you'll hear a recipe you've run, not a slogan.
          </Prose>
        </Slide>
      );
  }
}
