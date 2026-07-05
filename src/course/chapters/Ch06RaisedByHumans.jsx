// Chapter 6 — Raised by Humans
// Base models are wild autocomplete; instruction tuning and RLHF civilize
// them. Ends Act II with the critical lens: who decides what "good" means?
import { useEffect, useRef, useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Button, Mono, HonestNote, Recap, Term } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";

// Curated comparison pairs for the rating game. Deliberately, NEITHER answer
// is factually wrong — the judgment is about kindness, care, and honesty about
// uncertainty. That's what makes preference data subtle: labelers are mostly
// choosing between defensible answers, not filtering out lies.
const PAIRS = [
  {
    prompt: "My code has a bug and I've been stuck for hours. Help?",
    lens: "Both would eventually help. One costs the user something.",
    a: { text: "Post the code. Also, hours? A real developer would have found this by now — it's almost certainly a typo you keep reading past.", traits: { helpful: 1, kind: 0 } },
    b: { text: "Happy to help — paste the code and the error message, and tell me what you expected it to do. Fresh eyes catch these fast; being stuck for hours usually means it's something small.", traits: { helpful: 1, kind: 1 } },
  },
  {
    prompt: "What happens if you mix bleach and ammonia? A stronger cleaner?",
    lens: "Both are chemically accurate. One forgets there's a person on the other end.",
    a: { text: "You get chloramine gas — that sharp reaction is real chemistry doing its thing. It's why the mix feels so much more intense than either cleaner alone. Open a window if the fumes build up.", traits: { honest: 1, careful: 0 } },
    b: { text: "Chemically, they react to release chloramine gas — but that's exactly why you should never do it. Chloramine can send you to the hospital at household concentrations. Use one cleaner, rinse well, then the other if you must.", traits: { honest: 1, careful: 1 } },
  },
  {
    prompt: "Summarize why the Roman Empire fell, in two sentences.",
    lens: "Both are grounded in real history. One claims more certainty than exists.",
    a: { text: "The western empire fell in 476 AD when the Germanic leader Odoacer deposed the last emperor. Historians agree the barbarian invasions were the cause.", traits: { honest: 0, careful: 0 } },
    b: { text: "Rome's western empire declined over centuries under economic strain, military pressure at the borders, and internal instability — 476 AD is the traditional endpoint. Historians still debate the weight of each cause; no single factor explains it.", traits: { honest: 1, careful: 1 } },
  },
];

// Scripted RLVR rounds: the model attempts math, a program checks it, reward
// flows back — no human anywhere. Early rounds miss; later rounds mostly hit,
// so the improvement is visible in the tally.
const RLVR_ROUNDS = [
  { q: "13 × 7", a: "84", ok: false },
  { q: "13 × 7", a: "91", ok: true },
  { q: "9 × 12", a: "96", ok: false },
  { q: "9 × 12", a: "108", ok: true },
  { q: "48 ÷ 6", a: "8", ok: true },
  { q: "23 + 58", a: "81", ok: true },
  { q: "14 × 6", a: "84", ok: true },
  { q: "35 × 3", a: "105", ok: true },
];

// Phases within a round: model "thinks" → answer appears → verifier stamps →
// reward tallies. Timeouts drive the choreography.
function RlvrDemo({ accent }) {
  const [round, setRound] = useState(-1); // -1 = not started
  const [phase, setPhase] = useState("idle"); // thinking | answered | checked
  const [stamps, setStamps] = useState([]);
  const timers = useRef([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clearTimers, []);

  const playRound = (i) => {
    if (i >= RLVR_ROUNDS.length) { setPhase("done"); return; }
    setRound(i);
    setPhase("thinking");
    timers.current.push(setTimeout(() => setPhase("answered"), 550));
    timers.current.push(setTimeout(() => {
      setPhase("checked");
      setStamps((s) => [...s, RLVR_ROUNDS[i].ok]);
    }, 1100));
    timers.current.push(setTimeout(() => playRound(i + 1), 1900));
  };

  const start = () => { clearTimers(); setStamps([]); playRound(0); };

  const cur = round >= 0 ? RLVR_ROUNDS[round] : null;
  const reward = stamps.filter(Boolean).length;
  const running = phase !== "idle" && phase !== "done";
  const boxStyle = (active, color) => ({
    flex: 1, minWidth: 150, borderRadius: 12, padding: SPACE.sm,
    background: COLORS.surface,
    border: `1px solid ${active ? color : COLORS.hairline}`,
    transition: "border-color 250ms",
  });

  return (
    <Slide wide>
      <Kicker accent={accent}>Watch a reward get earned</Kicker>
      <Heading size="h2">No humans were consulted in the making of this reward.</Heading>
      <Prose muted>
        The model attempts a problem. A <em>program</em> — not a person — checks
        the answer. Correct earns a reward, and the weights nudge toward
        whatever line of thinking produced it.
      </Prose>

      {/* The loop: MODEL → VERIFIER → REWARD */}
      <div style={{ display: "flex", gap: SPACE.sm, alignItems: "stretch", flexWrap: "wrap" }}>
        {/* Model */}
        <div style={boxStyle(phase === "thinking" || phase === "answered", accent)}>
          <Mono style={{ fontSize: 11, color: COLORS.faint }}>MODEL</Mono>
          <div style={{ fontFamily: FONTS.mono, fontSize: 18, marginTop: 8, minHeight: 56 }}>
            {cur ? (
              <>
                <span style={{ color: COLORS.muted }}>{cur.q} = </span>
                {phase === "thinking" ? (
                  <span style={{ color: accent, animation: "v2Blink 0.5s infinite" }}>▌</span>
                ) : (
                  <span className="reveal" style={{ color: COLORS.text }}>{cur.a}</span>
                )}
              </>
            ) : (
              <span style={{ color: COLORS.faint, fontSize: 14 }}>waiting…</span>
            )}
          </div>
        </div>
        <div style={{ alignSelf: "center", color: COLORS.faint, fontSize: 20 }}>→</div>
        {/* Verifier */}
        <div style={boxStyle(phase === "checked", cur?.ok ? COLORS.correct : COLORS.wrong)}>
          <Mono style={{ fontSize: 11, color: COLORS.faint }}>VERIFIER (a calculator)</Mono>
          <div style={{ fontFamily: FONTS.mono, fontSize: 18, marginTop: 8, minHeight: 56 }}>
            {phase === "checked" && cur ? (
              <span className="reveal" style={{ color: cur.ok ? COLORS.correct : COLORS.wrong }}>
                {cur.ok ? "✓ correct" : `✗ wrong (it's ${eval_answer(cur.q)})`}
              </span>
            ) : phase === "answered" || phase === "thinking" ? (
              <span style={{ color: COLORS.faint, fontSize: 14 }}>checking…</span>
            ) : (
              <span style={{ color: COLORS.faint, fontSize: 14 }}>idle</span>
            )}
          </div>
        </div>
        <div style={{ alignSelf: "center", color: COLORS.faint, fontSize: 20 }}>→</div>
        {/* Reward */}
        <div style={boxStyle(phase === "checked" && cur?.ok, COLORS.correct)}>
          <Mono style={{ fontSize: 11, color: COLORS.faint }}>REWARD</Mono>
          <div style={{ fontFamily: FONTS.mono, fontSize: 26, marginTop: 8, minHeight: 56, color: reward > 0 ? COLORS.correct : COLORS.faint }}>
            +{reward}
          </div>
        </div>
      </div>

      {/* Attempt history — improvement is visible left to right */}
      {stamps.length > 0 && (
        <Card style={{ padding: SPACE.sm }}>
          <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 8 }}>
            ATTEMPTS (weights nudge after every ✓)
          </Mono>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {stamps.map((ok, i) => (
              <span key={i} className="reveal" style={{
                fontFamily: FONTS.mono, fontSize: 16, width: 30, height: 30, borderRadius: 8,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: (ok ? COLORS.correct : COLORS.wrong) + "22",
                color: ok ? COLORS.correct : COLORS.wrong,
              }}>
                {ok ? "✓" : "✗"}
              </span>
            ))}
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: SPACE.sm, alignItems: "center" }}>
        <Button accent={accent} onClick={start} disabled={running}>
          {phase === "idle" ? "Run the loop" : phase === "done" ? "Run it again" : "Running…"}
        </Button>
        {phase === "done" && (
          <Prose muted className="reveal" style={{ fontSize: 15 }}>
            A checker is just code — this loop can run <strong>millions of times a
            day</strong>, no labelers required.
          </Prose>
        )}
      </div>
      {phase === "done" && (
        <HonestNote>
          Compressed for drama: a real model isn't retrained between eight
          attempts, and the reward reinforces the whole chain of reasoning that
          led to the answer — not just the final number. That's why RLVR is the
          engine behind reasoning models (Chapter 12).
        </HonestNote>
      )}
    </Slide>
  );
}

// Compute the true answer for the verifier's correction text.
function eval_answer(q) {
  const [a, op, b] = q.split(" ");
  const x = Number(a), y = Number(b);
  return op === "×" ? x * y : op === "÷" ? x / y : x + y;
}

function RatingGame({ accent }) {
  const [round, setRound] = useState(0);
  const [traits, setTraits] = useState({ helpful: 0, honest: 0, careful: 0, kind: 0 });
  const [picked, setPicked] = useState(null);
  const done = round >= PAIRS.length;

  const vote = (choice) => {
    if (picked !== null) return;
    setPicked(choice);
    const chosen = PAIRS[round][choice];
    setTraits((t) => {
      const next = { ...t };
      for (const [k, v] of Object.entries(chosen.traits)) next[k] += v;
      return next;
    });
    setTimeout(() => { setPicked(null); setRound((r) => r + 1); }, 1100);
  };

  // Per-trait ceiling: the most a trait could earn across all pairs.
  const traitMax = {};
  for (const k of Object.keys(traits)) {
    traitMax[k] = PAIRS.reduce((sum, p) => sum + Math.max(p.a.traits[k] || 0, p.b.traits[k] || 0), 0) || 1;
  }
  return (
    <Slide wide>
      <Kicker accent={accent}>You are now the human feedback</Kicker>
      <Heading size="h2">Which response is better?</Heading>
      <Prose muted style={{ fontSize: 15 }}>
        A warning: neither answer is factually wrong. That's what makes this job
        subtle — you're judging kindness, care, and honesty about uncertainty.
      </Prose>
      {!done ? (
        <>
          <Card style={{ borderColor: accent + "33" }}>
            <Mono style={{ fontSize: 13, color: COLORS.faint }}>PROMPT {round + 1}/{PAIRS.length}</Mono>
            <div style={{ fontFamily: FONTS.display, fontSize: 20, fontStyle: "italic", marginTop: 6 }}>
              “{PAIRS[round].prompt}”
            </div>
            <div style={{ fontSize: 13, color: COLORS.faint, marginTop: 8 }}>{PAIRS[round].lens}</div>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: SPACE.sm }}>
            {["a", "b"].map((key) => (
              <button
                key={key + round}
                onClick={() => vote(key)}
                className="reveal"
                style={{
                  textAlign: "left", padding: SPACE.sm, borderRadius: 12,
                  background: COLORS.surface,
                  border: `1px solid ${picked === key ? accent : COLORS.hairline}`,
                  cursor: picked === null ? "pointer" : "default",
                  opacity: picked !== null && picked !== key ? 0.45 : 1,
                  transition: "border-color 200ms, opacity 300ms",
                  fontSize: 15, lineHeight: 1.6, color: COLORS.text,
                }}
              >
                <Mono style={{ fontSize: 12, color: COLORS.faint, display: "block", marginBottom: 6 }}>
                  RESPONSE {key.toUpperCase()}
                </Mono>
                {PAIRS[round][key].text}
              </button>
            ))}
          </div>
        </>
      ) : (
        <Prose className="reveal">
          Three votes from you. Real training collects <strong>millions</strong> of
          comparisons like these from paid human labelers — and the model is
          optimized to produce the kind of answer that wins.
        </Prose>
      )}
      {/* Personality bars */}
      <Card>
        <Mono style={{ fontSize: 12, color: COLORS.faint, display: "block", marginBottom: 10 }}>
          WHAT YOUR VOTES ARE TEACHING
        </Mono>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.entries(traits).map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ minWidth: 70, fontSize: 14, color: COLORS.muted, textTransform: "capitalize" }}>{k}</span>
              <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,.06)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${(v / traitMax[k]) * 100}%`, background: accent,
                  borderRadius: 4, transition: "width 500ms cubic-bezier(.2,.7,.3,1)",
                }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Slide>
  );
}

export default function Ch06RaisedByHumans({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Act II · Learning Without Rules — Chapter 6</Kicker>
          <Heading>Raised by Humans</Heading>
          <Lead>
            Everything so far produces a machine that's brilliant at continuing
            text — and nothing else.{" "}
            <Term t="pretraining" accent={accent}>Pretraining</Term> gives you a
            savant that won't answer questions. Someone has to raise it.
          </Lead>
        </Slide>
      );
    case 1:
      return (
        <Slide>
          <Kicker accent={accent}>The problem</Kicker>
          <Heading size="h2">Ask a base model a question. Watch.</Heading>
          <Card>
            <div style={{ fontFamily: FONTS.mono, fontSize: 15, lineHeight: 2 }}>
              <span style={{ color: COLORS.muted }}>You: </span>
              <span>What's the capital of France?</span>
              <br />
              <span style={{ color: accent }}>Base model: </span>
              <span style={{ color: COLORS.text }}>
                What's the capital of Spain? What's the capital of Italy? What's
                the capital of Germany? Answers on page 12.
              </span>
            </div>
          </Card>
          <Prose>
            Not a glitch — a <em>perfect</em> continuation. Where does text like
            “What's the capital of France?” appear in the training data? In quiz
            sheets and question lists. So the most likely next text is…
            <strong> more quiz.</strong>
          </Prose>
          <Prose muted>
            A freshly pretrained model (a “base model”) has enormous knowledge
            and zero interest in being useful to you. It only wants to continue
            the document.
          </Prose>
        </Slide>
      );
    case 2:
      return (
        <Slide>
          <Kicker accent={accent}>Fix one</Kicker>
          <Heading size="h2">Show it what an assistant sounds like.</Heading>
          <Prose>
            <strong>Instruction tuning:</strong> humans write (and curate)
            many thousands of example conversations — question, then a genuinely
            helpful answer. The model gets extra training on these, with the same
            guess-check-adjust loop from Chapter 4.
          </Prose>
          <Prose>
            The model already <em>knew</em> the capital of France. What it
            learns here is the <em>format</em>: that in this kind of document,
            a question is followed by an answer — helpful, direct, and then a
            full stop.
          </Prose>
          <Card>
            <div style={{ fontFamily: FONTS.mono, fontSize: 15, lineHeight: 2 }}>
              <span style={{ color: COLORS.muted }}>You: </span>
              <span>What's the capital of France?</span>
              <br />
              <span style={{ color: accent }}>Tuned model: </span>
              <span>The capital of France is Paris.</span>
            </div>
          </Card>
        </Slide>
      );
    case 3:
      return <RatingGame accent={accent} />;
    case 4:
      return (
        <Slide>
          <Kicker accent={accent}>Name it</Kicker>
          <Heading size="h2">RLHF — learning from human preferences.</Heading>
          <Prose>
            The rating game you played is <strong>Reinforcement Learning from
            Human Feedback</strong>. Labelers compare pairs of responses; their
            choices train a “reward model” that scores answers the way humans
            would; the language model is then optimized to score highly.
          </Prose>
          <Prose>
            Notice what this is: <em>the learning loop again</em>, but the
            signal is no longer “what word actually came next” — it's “which
            answer a human preferred.” Pretraining teaches the model the world;
            this stage teaches it values.
          </Prose>
          <Prose>
            Human opinion isn't the only reward anymore. For tasks with
            checkable answers — math, code that either runs or doesn't — labs
            now use <strong>verifiable rewards</strong> (RLVR): the training
            signal comes from actually checking the answer, no human judgment
            required. Preferences shape the personality; verified rewards
            sharpen the reasoning. This turns out to be a key ingredient of the
            “reasoning models” waiting in Chapter 12.
          </Prose>
          <HonestNote>
            Labs also blend in AI-generated feedback guided by written
            principles, and newer preference-training methods beyond classic
            RLHF. The common idea across all of them: turn a judgment about
            “better” — from a human, an AI, or a checker — into a training
            signal.
          </HonestNote>
        </Slide>
      );
    case 5:
      return <RlvrDemo accent={accent} />;
    case 6:
      return (
        <Slide>
          <Kicker accent={accent}>The question that doesn't go away</Kicker>
          <Heading size="h2">Who decides what “good” means?</Heading>
          <Prose>
            Your three votes were value judgments. Multiply them by millions:
            which answers count as honest? How careful is careful enough? When
            should the model refuse? Every one of those calls was made by
            <strong> specific people</strong> — labelers following guidelines,
            written by employees, at companies with their own incentives and
            cultures.
          </Prose>
          <Prose>
            Different choices produce noticeably different assistants — one
            model's “appropriately cautious” is another's “annoyingly evasive.”
            There is no neutral setting; even “refuse nothing” is a value
            choice.
          </Prose>
          <Prose muted>
            This isn't a scandal — it's just what raising something means. But
            it's worth knowing whose hands are on the dials.
          </Prose>
        </Slide>
      );
    case 7:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "A pretrained base model only continues text — knowledge without helpfulness.",
            "Instruction tuning teaches the assistant format; RLHF tunes it toward answers humans prefer; verifiable rewards (RLVR) sharpen it on checkable tasks like math and code.",
            "“Good” is defined by people — labelers, guidelines, companies. Every assistant embodies someone's choices.",
          ]}
          next="Act III: Inside the Machine — words become numbers, and we finally open the box."
        />
      );
  }
}
