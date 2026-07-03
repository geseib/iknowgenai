// Chapter 4 — The Learning Loop
// Guess → check → adjust. The learner runs training steps by hand and watches
// a model's guess distribution sharpen while its "loss" falls.
import { useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Button, Mono, HonestNote, Recap, CountUp } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";

const TARGET = "two-tired";
const CANDIDATES = ["knocked over", "two-tired", "broken", "windy"];

// Deterministic pseudo-random dial angles per step (Math.random would be fine
// here, but determinism makes the visualization replayable).
function dialAngle(dial, step) {
  const x = Math.sin(dial * 127.1 + step * 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 270 - 135;
}

// Distribution over candidates after `step` training steps: starts near
// uniform, converges toward the target. Mirrors how a real softmax sharpens.
function distribution(step) {
  const targetWeight = 1 + step * step * 0.9;
  const weights = CANDIDATES.map((c) => (c === TARGET ? targetWeight : 1 / (1 + step * 0.35)));
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => w / sum);
}

function TrainingGame({ accent }) {
  const [step, setStep] = useState(0);
  const dist = distribution(step);
  const targetProb = dist[CANDIDATES.indexOf(TARGET)];
  const loss = -Math.log(targetProb); // real cross-entropy, no hand-waving
  const converged = targetProb > 0.9;

  return (
    <Slide wide>
      <Kicker accent={accent}>Train it yourself</Kicker>
      <Heading size="h2">Run the loop.</Heading>
      <Card>
        <div style={{ fontFamily: FONTS.display, fontSize: 21, fontStyle: "italic", marginBottom: SPACE.sm }}>
          “<span style={{ color: accent }}>Finish the joke:</span> Why did the
          bicycle fall over? Because it was <span style={{ background: accent + "33", borderRadius: 4, padding: "0 6px" }}>___</span>”
          <span style={{ fontSize: 15, fontStyle: "normal", color: COLORS.muted, marginLeft: 12 }}>
            correct answer: <Mono accent={accent}>{TARGET}</Mono>
          </span>
        </div>
        {/* Guess distribution */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CANDIDATES.map((c, i) => (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Mono style={{ minWidth: 100, fontSize: 14, color: c === TARGET ? accent : COLORS.text }}>{c}</Mono>
              <div style={{ flex: 1, height: 18, background: "rgba(255,255,255,.05)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${dist[i] * 100}%`,
                  background: c === TARGET ? accent : "rgba(255,255,255,.25)",
                  transition: "width 500ms cubic-bezier(.2,.7,.3,1)",
                }} />
              </div>
              <Mono style={{ minWidth: 48, fontSize: 13, color: COLORS.muted, textAlign: "right" }}>
                {(dist[i] * 100).toFixed(0)}%
              </Mono>
            </div>
          ))}
        </div>
        {/* Weights + loss */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: SPACE.md, flexWrap: "wrap", gap: SPACE.sm }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: COLORS.faint }}>weights</span>
            {[0, 1, 2, 3, 4, 5].map((d) => (
              <div key={d} style={{
                width: 26, height: 26, borderRadius: "50%",
                border: `1.5px solid ${COLORS.hairline}`, position: "relative",
              }}>
                <div style={{
                  position: "absolute", left: "50%", top: "50%", width: 1.5, height: 10,
                  background: accent, transformOrigin: "top center",
                  transform: `rotate(${dialAngle(d, step)}deg)`,
                  transition: "transform 500ms cubic-bezier(.2,.7,.3,1)",
                }} />
              </div>
            ))}
            <span style={{ fontSize: 12, color: COLORS.faint }}>×&nbsp;billions more</span>
          </div>
          <div style={{ fontSize: 14, color: COLORS.muted }}>
            loss <Mono accent={loss < 0.3 ? COLORS.correct : accent} style={{ fontSize: 16 }}>{loss.toFixed(2)}</Mono>
            <span style={{ color: COLORS.faint }}> · step {step}</span>
          </div>
        </div>
      </Card>
      <div style={{ display: "flex", gap: SPACE.sm, alignItems: "center", flexWrap: "wrap" }}>
        <Button accent={accent} onClick={() => setStep((s) => s + 1)} disabled={converged}>
          {step === 0 ? "Run a training step" : "Another step"}
        </Button>
        {step > 0 && <Button accent="transparent" style={{ border: `1px solid ${COLORS.hairline}`, color: COLORS.muted }} onClick={() => setStep(0)}>Reset</Button>}
      </div>
      {step === 0 && (
        <Prose muted style={{ fontSize: 15 }}>
          Untrained, the model spreads its bets — every answer looks equally
          plausible. Each training step: it guesses, gets shown the right answer,
          and every weight nudges slightly toward making that answer more likely.
        </Prose>
      )}
      {converged && (
        <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
          <Prose>
            The model now completes the joke. Nobody told it a rule about puns —
            the answer got <em>grown into the weights</em>, one nudge at a time.
            The falling number is called <strong>loss</strong>: how surprised the
            model was by the right answer.
          </Prose>
          <Prose muted style={{ fontSize: 15 }}>
            Notice the words <em>“finish the joke”</em> in the prompt — they're
            doing real work. If someone asked why an actual bicycle fell over,
            the right prediction would be the boring one: <Mono>knocked over</Mono>,
            or a kickstand problem. Same question, different context, different
            correct answer. The model has to learn <strong>both</strong> — and
            learn that the surrounding words tell it which world it's in.
          </Prose>
        </div>
      )}
    </Slide>
  );
}

export default function Ch04LearningLoop({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Act II · Learning Without Rules — Chapter 4</Kicker>
          <Heading>The Learning Loop</Heading>
          <Lead>
            Nobody programs a language model. There is no programmer who knows
            why it picks the words it picks. Models are <em>grown</em> — by a
            loop simple enough to fit on one slide.
          </Lead>
        </Slide>
      );
    case 1:
      return (
        <Slide>
          <Kicker accent={accent}>Day zero</Kicker>
          <Heading size="h2">A newborn model speaks static.</Heading>
          <Prose>
            A model is a giant pile of numbers called <strong>weights</strong> —
            billions of adjustable dials that turn input text into a prediction.
            Before training, every dial is set randomly. Ask it to continue
            “Once upon a” and you get:
          </Prose>
          <Card>
            <Mono style={{ fontSize: 16, color: COLORS.muted, wordBreak: "break-all" }}>
              plth ,,gr9 ovv—qq zeeb ((lamp ykk
            </Mono>
          </Card>
          <Prose>
            Pure noise. Every model you've ever talked to started exactly here.
            The entire difference between this and a fluent assistant is the
            <em> settings of the dials</em>.
          </Prose>
        </Slide>
      );
    case 2:
      return (
        <Slide>
          <Kicker accent={accent}>The loop</Kicker>
          <Heading size="h2">Guess. Check. Adjust.</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            {[
              ["1 · GUESS", "Take real text. Hide the next word. Ask the model to predict it."],
              ["2 · CHECK", "Reveal the actual word. Measure how wrong the guess was."],
              ["3 · ADJUST", "Nudge every dial a tiny amount in the direction that would have made the right word more likely."],
            ].map(([label, text], i) => (
              <div key={label} className="reveal" style={{ animationDelay: `${i * 150}ms`, display: "flex", gap: 14, alignItems: "baseline" }}>
                <Mono accent={accent} style={{ fontSize: 13, minWidth: 84 }}>{label}</Mono>
                <Prose>{text}</Prose>
              </div>
            ))}
          </div>
          <Prose muted>
            Then move to the next word and do it again. That's it. That's the
            whole algorithm that produced every AI you've used. Try it on the
            next slide.
          </Prose>
        </Slide>
      );
    case 3:
      return <TrainingGame accent={accent} />;
    case 4:
      return (
        <Slide>
          <Kicker accent={accent}>Name it</Kicker>
          <Heading size="h2">You just did gradient descent.</Heading>
          <Prose>
            “Nudge every dial toward the right answer” has a precise form. The
            wrongness of a guess is the <strong>loss</strong>. Calculus can
            compute, for every one of the billions of dials at once, exactly
            which direction reduces the loss — that direction is the
            <strong> gradient</strong>, and following it downhill is
            <strong> gradient descent</strong>.
          </Prose>
          <HonestNote>
            The dials in our demo wiggled decoratively; real training computes
            exact nudges via an algorithm called backpropagation — it's
            calculus, not trial and error. And real training predicts every
            position across huge batches of text simultaneously, not one joke at
            a time.
          </HonestNote>
        </Slide>
      );
    case 5:
      return (
        <Slide>
          <Kicker accent={accent}>Now multiply</Kicker>
          <Heading size="h2">
            <CountUp to={1000000000000} duration={2000} format={(n) => n >= 1e12 ? "1,000,000,000,000" : n.toLocaleString()} style={{ color: accent, fontSize: 40 }} />
            <span style={{ display: "block", marginTop: 8 }}>nudges — and counting.</span>
          </Heading>
          <Prose>
            One training step taught our toy model one joke. Real training runs
            the loop across <strong>trillions of words</strong> — books, code,
            articles, conversations — for months. Each pass leaves the dials
            microscopically better at predicting human text.
          </Prose>
          <Prose muted>
            No single nudge understands anything. The pile of all of them speaks
            forty languages.
          </Prose>
        </Slide>
      );
    case 6:
      return (
        <Slide>
          <Kicker accent={accent}>The crucial distinction</Kicker>
          <Heading size="h2">It learns the pattern, not the answers.</Heading>
          <Prose>
            Here's the test that matters: train a model on a thousand jokes,
            then show it a joke it has <em>never seen</em>. It completes it. It
            can't be looking up the answer — there's no answer to look up.
          </Prose>
          <Prose>
            The dials didn't memorize a joke list. They absorbed the <em>shape</em>
            of jokes — setups, misdirection, puns — because that shape is what
            makes punchlines predictable.
          </Prose>
          <HonestNote>
            Mostly. Models do memorize some frequently-repeated training text
            verbatim (famous quotes, common code snippets), and researchers work
            to limit it. But memorization can't explain performance on genuinely
            novel text — generalization is the main event.
          </HonestNote>
        </Slide>
      );
    case 7:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "A model is billions of adjustable weights; untrained, it produces static.",
            "Training is one loop: guess the hidden word, check, nudge all weights toward the right answer (gradient descent).",
            "Run trillions of times, the loop grows a system that learned the patterns of language — not a list of memorized answers.",
          ]}
          next="What “Large” Means — just how big the data, the dials, and the compute really are."
        />
      );
  }
}
