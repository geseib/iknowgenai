// Chapter 12 — Thinking Out Loud
// Fixed compute per token → chain of thought → reasoning models with hidden
// thinking (trained via RLVR) → the twist: thinking is also just prediction.
import { useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Button, Mono, HonestNote, Recap } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";
import { generateStream } from "../lib/api.js";

const PROBLEM = "What is 347 × 862?";
const CORRECT = 347 * 862; // 299,114 — computed here, not trusted to anyone

function ExperimentSlide({ accent }) {
  const [direct, setDirect] = useState(null);
  const [cot, setCot] = useState(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setDirect("");
    setCot("");
    try {
      const d = await generateStream(
        `${PROBLEM} Reply with only the number, nothing else.`,
        { temperature: 0.2, maxTokens: 12, onToken: (_, t) => setDirect(t) }
      );
      setDirect(d.blocked ? "(blocked)" : d.text);
      const c = await generateStream(
        `${PROBLEM} Work it out step by step, showing your arithmetic, then give the final answer.`,
        { temperature: 0.2, maxTokens: 250, onToken: (_, t) => setCot(t) }
      );
      setCot(c.blocked ? "(blocked)" : c.text);
    } catch (err) {
      if (!direct) setDirect(`Couldn't reach the model: ${err.message}`);
      else setCot(`Couldn't reach the model: ${err.message}`);
    }
    setRunning(false);
  };

  const verdict = (text) => {
    if (!text) return null;
    const cleaned = text.replace(/[,\s]/g, "");
    return cleaned.includes(String(CORRECT));
  };
  const dOk = verdict(direct);
  const cOk = verdict(cot);

  return (
    <Slide wide>
      <Kicker accent={accent}>A real experiment — results may vary</Kicker>
      <Heading size="h2">Same model, same question, one difference.</Heading>
      <Card>
        <div style={{ fontFamily: FONTS.display, fontSize: 22, fontStyle: "italic" }}>
          “{PROBLEM}”
          <span style={{ fontSize: 14, fontStyle: "normal", color: COLORS.faint, marginLeft: 14, fontFamily: FONTS.mono }}>
            (correct: {CORRECT.toLocaleString()})
          </span>
        </div>
      </Card>
      <div>
        <Button accent={accent} onClick={run} disabled={running}>
          {running ? "Running…" : direct !== null ? "Run it again" : "Run both"}
        </Button>
      </div>
      {direct !== null && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: SPACE.sm }}>
          <Card style={{ borderColor: dOk == null ? COLORS.hairline : dOk ? COLORS.correct + "66" : COLORS.wrong + "66" }}>
            <Mono style={{ fontSize: 11, color: COLORS.faint }}>“REPLY WITH ONLY THE NUMBER”</Mono>
            <div style={{ fontFamily: FONTS.mono, fontSize: 20, marginTop: 10, minHeight: 30 }}>
              {direct || <span style={{ animation: "v2Blink 1s infinite" }}>▌</span>}
            </div>
            {direct && !running && dOk != null && (
              <Mono style={{ fontSize: 13, color: dOk ? COLORS.correct : COLORS.wrong, display: "block", marginTop: 8 }}>
                {dOk ? "✓ correct" : "✗ wrong"}
              </Mono>
            )}
          </Card>
          <Card style={{ borderColor: cOk == null ? COLORS.hairline : cOk ? COLORS.correct + "66" : COLORS.wrong + "66" }}>
            <Mono style={{ fontSize: 11, color: COLORS.faint }}>“WORK IT OUT STEP BY STEP”</Mono>
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, marginTop: 10, minHeight: 30, lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 220, overflowY: "auto" }}>
              {cot || (running && direct ? <span style={{ animation: "v2Blink 1s infinite" }}>▌</span> : "")}
            </div>
            {cot && !running && cOk != null && (
              <Mono style={{ fontSize: 13, color: cOk ? COLORS.correct : COLORS.wrong, display: "block", marginTop: 8 }}>
                {cOk ? "✓ correct" : "✗ wrong"}
              </Mono>
            )}
          </Card>
        </div>
      )}
      {cot && !running && (
        <Prose muted style={{ fontSize: 15 }} className="reveal">
          Run it a few times and keep score. The words in between aren't
          decoration — every intermediate step becomes context that later
          predictions can lean on. The model is using its own output as
          scratch paper.
        </Prose>
      )}
    </Slide>
  );
}

// Curated reasoning-model trace: hidden thinking vs. the visible answer.
function TraceSlide({ accent }) {
  const [open, setOpen] = useState(false);
  return (
    <Slide wide>
      <Kicker accent={accent}>What you see vs. what happened</Kicker>
      <Heading size="h2">The thinking is usually hidden.</Heading>
      <Prose muted>
        Ask a reasoning model a hard question and this is what the exchange
        looks like. One part of it, you normally never see.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 12, color: COLORS.faint }}>YOU</Mono>
        <div style={{ fontSize: 16, marginTop: 4 }}>
          A farmer has 17 sheep. All but 9 run away. How many are left?
        </div>
      </Card>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          textAlign: "left", borderRadius: 12, padding: SPACE.sm,
          background: COLORS.surface, border: `1px dashed ${accent}66`, width: "100%",
        }}
      >
        <Mono style={{ fontSize: 12, color: accent }}>
          {open ? "▾" : "▸"} THINKING — 214 hidden tokens {open ? "" : "(click to reveal)"}
        </Mono>
        {open && (
          <div className="reveal" style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.muted, lineHeight: 1.9, marginTop: 10 }}>
            The phrasing suggests subtraction: 17 − 9 = 8. But wait — “all but
            9 run away” means 9 did NOT run away. So 9 remain.{"\n"}
            This is a classic trick question; the trap answer is 8.{"\n"}
            Double-check: “all but 9” = every sheep except 9. The ones that
            didn't run away are still there. Answer: 9.
          </div>
        )}
      </button>
      <Card style={{ borderColor: accent + "44" }}>
        <Mono style={{ fontSize: 12, color: COLORS.faint }}>MODEL (what you see)</Mono>
        <div style={{ fontSize: 16, marginTop: 4 }}>9 sheep are left — “all but 9” means 9 stayed.</div>
      </Card>
      <Prose muted style={{ fontSize: 15 }}>
        The hidden part is where the trap got noticed and avoided. Products
        usually show you a summary of the thinking, or nothing at all — but you
        wait for those tokens, and on paid APIs, you pay for them.
      </Prose>
    </Slide>
  );
}

export default function Ch12ThinkingOutLoud({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Act IV · The Roll of the Dice — Chapter 12</Kicker>
          <Heading>Thinking Out Loud</Heading>
          <Lead>
            Every token the model produces costs exactly one pass through the
            machine — the same amount of computation whether the question is
            “what's 2+2” or “what caused World War I.” That's a problem, and
            the fix looks almost too simple.
          </Lead>
        </Slide>
      );
    case 1:
      return (
        <Slide>
          <Kicker accent={accent}>The problem</Kicker>
          <Heading size="h2">No scratch paper.</Heading>
          <Prose>
            Ask the model <Mono accent={accent}>347 × 862 = ?</Mono> and demand
            an instant answer, and the <em>first digit</em> has to come out of
            a single pass through the layers — no carrying, no intermediate
            steps, nowhere to put them. It's like being forced to multiply
            three-digit numbers and start speaking the answer immediately.
          </Prose>
          <Prose>
            You'd fail that too. When you multiply big numbers, you write down
            partial products — you <strong>think on paper</strong>. The model
            has exactly one place it could do that: <em>its own output.</em>
          </Prose>
        </Slide>
      );
    case 2:
      return <ExperimentSlide accent={accent} />;
    case 3:
      return (
        <Slide>
          <Kicker accent={accent}>From trick to training target</Kicker>
          <Heading size="h2">Reasoning models: trained to think first.</Heading>
          <Prose>
            “Work it out step by step” started as a prompt trick users
            discovered. The labs' next move: <strong>build the habit in</strong>.
            Models like OpenAI's o-series, DeepSeek-R1, and Claude with
            extended thinking are trained to write out long private reasoning
            <em> before</em> the answer — exploring, checking, backtracking —
            every time.
          </Prose>
          <Prose>
            How do you train that? You know this one already: <strong>verifiable
            rewards</strong> (Chapter 6). Give the model math and code problems,
            check the answers automatically, and reward whatever reasoning led
            to correct ones. Reasoning that works gets reinforced; rambling that
            doesn't, fades.
          </Prose>
        </Slide>
      );
    case 4:
      return <TraceSlide accent={accent} />;
    case 5:
      return (
        <Slide>
          <Kicker accent={accent}>The twist</Kicker>
          <Heading size="h2">The thinking is also just prediction.</Heading>
          <Prose>
            Nothing new was added to the machine. Those hidden thoughts are
            ordinary tokens from the same pipeline you know — embeddings,
            attention, layers, dice. The model was simply trained so that
            <em> predicting reasoning-shaped text first</em> makes the final
            answer more likely to be right.
          </Prose>
          <Prose>
            What changed is <strong>where the effort goes</strong>. For years,
            making AI smarter meant bigger training runs. Reasoning models
            added a second dial: spend more compute <em>while answering</em> —
            more thinking tokens for harder questions. A hard problem might get
            thousands of hidden tokens; “what's 2+2” gets nearly none.
          </Prose>
          <HonestNote>
            So — is that thinking? It plans, checks itself, and abandons bad
            ideas, which looks a lot like thinking. It's also “just” next-token
            prediction, which sounds like it shouldn't count. This course gave
            you the mechanism; the verdict is genuinely contested, and yours to
            make.
          </HonestNote>
        </Slide>
      );
    case 6:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "Each token gets a fixed amount of computation — hard problems need scratch space, and the only scratch paper is the output itself.",
            "Chain of thought writes the work out; reasoning models are trained (with verifiable rewards) to do it automatically and privately.",
            "The hidden thinking is ordinary next-token prediction — the breakthrough was spending compute at answer time, scaled to the difficulty.",
          ]}
          next="Act V: Confident Nonsense — the machine's failures, and why they're built into everything you've learned."
        />
      );
  }
}
