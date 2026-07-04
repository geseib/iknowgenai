// Chapter 11 — Temperature
// Prediction gives probabilities; generation requires choosing. Greedy
// decoding's failure, the temperature dial (live), the math, same-prompt-twice,
// and top-p.
import { useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Button, Mono, HonestNote, Recap, BlockedNote } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";
import { predictNext, generateStream } from "../lib/api.js";

const TEMP_MARKS = [
  { max: 0.25, name: "Frozen", desc: "always the top pick — robotic, repetitive" },
  { max: 0.6, name: "Cold", desc: "very safe choices" },
  { max: 1.15, name: "Balanced", desc: "natural, human-feeling variety" },
  { max: 1.6, name: "Warm", desc: "adventurous word choices" },
  { max: 2.01, name: "Wild", desc: "chaos — coherence not guaranteed" },
];
const tempMark = (t) => TEMP_MARKS.find((m) => t <= m.max);

function TempBars({ candidates, accent }) {
  const max = Math.max(...candidates.map((c) => c.pct), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {candidates.map((c, i) => (
        <div key={`${c.token}-${i}`} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Mono style={{ minWidth: 100, fontSize: 15 }}>{c.token}</Mono>
          <div style={{ flex: 1, height: 20, background: "rgba(255,255,255,.05)", borderRadius: 5, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${(c.pct / max) * 100}%`,
              background: i === 0 ? accent : accent + "55", borderRadius: 5,
              transition: "width 500ms cubic-bezier(.2,.7,.3,1)",
            }} />
          </div>
          <Mono style={{ minWidth: 52, fontSize: 13, color: COLORS.muted, textAlign: "right" }}>{c.pct}%</Mono>
        </div>
      ))}
    </div>
  );
}

const TEMP_PROMPT = "The old house at the end of the street was";

function TempDemo({ accent }) {
  const [temp, setTemp] = useState(1.0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const mark = tempMark(temp);

  const run = async (t) => {
    setLoading(true);
    setBlocked(false);
    try {
      const data = await predictNext(TEMP_PROMPT, { temperature: t });
      if (data.blocked) setBlocked(true);
      else setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <Slide wide>
      <Kicker accent={accent}>Live — the real dial</Kicker>
      <Heading size="h2">Turn it and watch the odds move.</Heading>
      <Card>
        <div style={{ fontFamily: FONTS.display, fontSize: 20, fontStyle: "italic", marginBottom: SPACE.sm }}>
          “{TEMP_PROMPT} <span style={{ background: accent + "33", borderRadius: 4, padding: "0 6px" }}>___</span>”
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.sm, flexWrap: "wrap" }}>
          <Mono style={{ fontSize: 13, color: COLORS.muted }}>temperature</Mono>
          <input
            type="range" min="0.1" max="2" step="0.05" value={temp}
            onChange={(e) => setTemp(Number(e.target.value))}
            onMouseUp={() => run(temp)}
            onTouchEnd={() => run(temp)}
            onKeyUp={(e) => ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key) && run(temp)}
            style={{ flex: 1, minWidth: 160 }}
          />
          <Mono accent={accent} style={{ fontSize: 20, minWidth: 52, textAlign: "right" }}>{temp.toFixed(2)}</Mono>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <Mono style={{ fontSize: 12, color: COLORS.faint }}>0.1 Frozen</Mono>
          <Mono style={{ fontSize: 13, color: accent }}>{mark.name} — {mark.desc}</Mono>
          <Mono style={{ fontSize: 12, color: COLORS.faint }}>2.0 Wild</Mono>
        </div>
      </Card>
      {!result && !loading && (
        <div><Button accent={accent} onClick={() => run(temp)}>Get the odds</Button></div>
      )}
      {loading && <Prose muted style={{ fontSize: 14 }}>Asking the model…</Prose>}
      {blocked && <BlockedNote />}
      {result?.error && <Prose muted>Couldn't reach the model: {result.error}</Prose>}
      {result?.candidates && (
        <Card>
          <TempBars candidates={result.candidates} accent={accent} />
          <Prose muted style={{ fontSize: 13, marginTop: 12 }}>
            Same sentence, same model, same knowledge — only the dial moved.
            Low temperature exaggerates the leader's advantage; high temperature
            flattens the race so long-shots get real chances.
          </Prose>
        </Card>
      )}
    </Slide>
  );
}

const TWICE_PROMPT = "Describe a sunset over the ocean in one sentence.";

function TwiceDemo({ accent }) {
  const [mode, setMode] = useState(null); // "low" | "high"
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(false);

  const run = async (m) => {
    setMode(m);
    setLoading(true);
    setOutputs([]);
    const t = m === "low" ? 0.1 : 1.4;
    try {
      const results = [];
      for (let i = 0; i < 2; i++) {
        const r = await generateStream(TWICE_PROMPT, { temperature: t, maxTokens: 60 });
        results.push(r.blocked ? "(blocked)" : r.text);
        setOutputs([...results]);
      }
    } catch (err) {
      setOutputs([`Couldn't reach the model: ${err.message}`]);
    }
    setLoading(false);
  };

  return (
    <Slide wide>
      <Kicker accent={accent}>The experiment</Kicker>
      <Heading size="h2">Same prompt. Twice. You pick the dial.</Heading>
      <Card>
        <div style={{ fontFamily: FONTS.display, fontSize: 19, fontStyle: "italic" }}>“{TWICE_PROMPT}”</div>
      </Card>
      <div style={{ display: "flex", gap: SPACE.xs, flexWrap: "wrap" }}>
        <Button accent={accent} onClick={() => run("low")} disabled={loading}>
          Run twice at 0.1 (Frozen)
        </Button>
        <Button accent={accent} onClick={() => run("high")} disabled={loading}>
          Run twice at 1.4 (Warm)
        </Button>
      </div>
      {outputs.map((o, i) => (
        <Card key={i} className="reveal">
          <Mono style={{ fontSize: 11, color: COLORS.faint }}>RUN {i + 1} · temp {mode === "low" ? "0.1" : "1.4"}</Mono>
          <div style={{ fontFamily: FONTS.display, fontSize: 18, fontStyle: "italic", marginTop: 6, lineHeight: 1.6 }}>
            {o}{loading && i === outputs.length - 1 && <span style={{ animation: "v2Blink 1s infinite" }}>▌</span>}
          </div>
        </Card>
      ))}
      {outputs.length === 2 && !loading && (
        <Prose muted style={{ fontSize: 15 }} className="reveal">
          {mode === "low"
            ? "Nearly identical, weren't they? At low temperature the dice are loaded so heavily that the same path wins almost every time."
            : "Two different sunsets from identical inputs. That difference is not knowledge or mood — it's the dice. This is why asking an AI the same question twice gives different answers."}
        </Prose>
      )}
    </Slide>
  );
}

export default function Ch11Temperature({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Act IV · The Roll of the Dice — Chapter 11</Kicker>
          <Heading>Temperature</Heading>
          <Lead>
            Act III ended with a list of probabilities: <em>cave 61%, night 8%,
            window 5%…</em> But a story can't print a probability list. Someone
            has to pick one word. It turns out <em>how</em> you pick is where
            creativity lives.
          </Lead>
        </Slide>
      );
    case 1:
      return (
        <Slide>
          <Kicker accent={accent}>The obvious plan fails</Kicker>
          <Heading size="h2">Always take the favorite? Try reading it.</Heading>
          <Prose>
            The obvious rule — always pick the highest-probability word — is
            called <strong>greedy decoding</strong>. It produces text like this:
          </Prose>
          <Card>
            <div style={{ fontFamily: FONTS.display, fontSize: 18, fontStyle: "italic", color: COLORS.muted, lineHeight: 1.7 }}>
              “I like my coffee in the morning. I like my coffee in the morning
              because I like my coffee in the morning. I like…”
            </div>
          </Card>
          <Prose>
            Safe choice after safe choice collapses into loops and clichés —
            each word is individually the “best,” and the paragraph is dead on
            arrival. Human writing keeps surprising you a little, word by word.
            To sound alive, the model has to <strong>take chances</strong> —
            roll dice weighted by the probabilities instead of always taking
            the favorite.
          </Prose>
          <Prose muted>
            And once dice are involved, you want a dial that controls how daring
            the rolls are.
          </Prose>
        </Slide>
      );
    case 2:
      return <TempDemo accent={accent} />;
    case 3:
      return (
        <Slide>
          <Kicker accent={accent}>Name it</Kicker>
          <Heading size="h2">Temperature reshapes the dice.</Heading>
          <Prose>
            Before the probabilities are finalized, every candidate's score gets
            <strong> divided by the temperature</strong>.
          </Prose>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            {[
              ["low (÷0.1)", "differences between scores get magnified — the leader towers over everyone. The dice are loaded; the favorite nearly always wins."],
              ["1.0 (÷1)", "the model's honest, learned probabilities — used as-is."],
              ["high (÷2)", "differences shrink — underdogs get real odds. More surprise, more risk of nonsense."],
            ].map(([label, text], i) => (
              <div key={label} className="reveal" style={{ animationDelay: `${i * 140}ms`, display: "flex", gap: 14, alignItems: "baseline" }}>
                <Mono accent={accent} style={{ fontSize: 13, minWidth: 90 }}>{label}</Mono>
                <Prose muted style={{ fontSize: 16 }}>{text}</Prose>
              </div>
            ))}
          </div>
          <HonestNote>
            Precisely: the raw scores (logits) are divided by T before the
            softmax step that turns them into probabilities. The name comes from
            physics — in thermodynamics, higher temperature means particles
            explore less-likely states, and the equation is literally the same
            (a Boltzmann distribution).
          </HonestNote>
        </Slide>
      );
    case 4:
      return <TwiceDemo accent={accent} />;
    case 5:
      return (
        <Slide>
          <Kicker accent={accent}>The dial has a bodyguard</Kicker>
          <Heading size="h2">Top-p: cut off the lunatic fringe.</Heading>
          <Prose>
            High temperature has an ugly failure mode: it gives real odds to
            the <em>terrible</em> candidates — the 0.01% tokens that derail a
            sentence into gibberish. So samplers add a second rule,
            <strong> top-p</strong>: keep only the smallest set of top
            candidates whose probabilities add up to p (say, 90%), throw the
            rest away, and roll the dice among the survivors.
          </Prose>
          <Card>
            <div style={{ fontFamily: FONTS.mono, fontSize: 14, lineHeight: 2 }}>
              <span style={{ color: COLORS.text }}>cave 61% · night 8% · window 5% · sea 4% … </span>
              <span style={{ color: accent }}>| ← p=0.9 cutoff</span>
              <span style={{ color: COLORS.faint, textDecoration: "line-through" }}> · spatula 0.01% · yodeling 0.003%</span>
            </div>
          </Card>
          <Prose muted>
            Temperature decides how daring the dice are; top-p decides who's
            allowed in the casino. Together they're why “creative but not
            insane” is a settable behavior.
          </Prose>
          <Prose>
            One more thing worth knowing: <strong>you've been playing with dials
            most people never see.</strong> Chat apps like ChatGPT and Claude
            don't expose temperature or top-p — the product picks sensible
            values behind the scenes, and every “regenerate” click is simply
            another roll of the same dice. The dials are there for developers,
            through the APIs — which is exactly how this course reached them.
          </Prose>
        </Slide>
      );
    case 6:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "Generation needs a choice, and always picking the favorite produces dead, looping text — so models roll weighted dice.",
            "Temperature reshapes the dice: low exaggerates the leader, high flattens the race. You watched the real odds move.",
            "Top-p trims the absurd tail. Creativity in AI is literally controlled randomness — which is why the same prompt gives different answers.",
            "Chat apps like ChatGPT and Claude preset these dials and hide them — “regenerate” is another roll of the same dice; developers reach the dials through APIs.",
          ]}
          footnote="At temperature 0 the same prompt gives essentially the same answer every time — “essentially” because parallel hardware introduces tiny arithmetic variations even then."
          next="Thinking Out Loud — some questions can't be answered in one roll. What if the model showed its work?"
        />
      );
  }
}
