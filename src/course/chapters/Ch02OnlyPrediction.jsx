// Chapter 2 — It's Only Prediction
// The central claim made rigorous: live ranked predictions, a human-vs-model
// game, generation as prediction-in-a-loop, and the depth argument.
import { useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Button, Mono, Recap, BlockedNote } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";
import { predictNext } from "../lib/api.js";

function ProbBars({ candidates, accent, highlight, onPick }) {
  const max = Math.max(...candidates.map((c) => c.pct), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {candidates.map((c, i) => {
        const isHighlight = highlight && c.token.toLowerCase() === highlight.toLowerCase();
        return (
          <button
            key={`${c.token}-${i}`}
            onClick={onPick ? () => onPick(c.token) : undefined}
            disabled={!onPick}
            style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%",
              padding: 0, cursor: onPick ? "pointer" : "default", textAlign: "left",
            }}
          >
            <Mono style={{ minWidth: 110, fontSize: 15, color: isHighlight ? accent : COLORS.text, fontWeight: isHighlight ? 600 : 400 }}>
              {c.token}
            </Mono>
            <div style={{ flex: 1, height: 22, background: "rgba(255,255,255,.05)", borderRadius: 5, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${(c.pct / max) * 100}%`,
                  background: isHighlight ? accent : accent + "55",
                  borderRadius: 5,
                  transformOrigin: "left",
                  animation: `v2GrowBar 500ms cubic-bezier(.2,.7,.3,1) both`,
                  animationDelay: `${i * 60}ms`,
                }}
              />
            </div>
            <Mono style={{ minWidth: 52, fontSize: 13, color: COLORS.muted, textAlign: "right" }}>
              {c.pct}%
            </Mono>
          </button>
        );
      })}
    </div>
  );
}

const PRESETS = [
  "The doctor looked at the X-ray and frowned. The news was",
  "She opened the ancient book, and dust rose from its",
  "To be or not to be, that is the",
];

function LiveDemo({ accent }) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const run = async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    setBlocked(false);
    setResult(null);
    try {
      const data = await predictNext(text);
      if (data.blocked) setBlocked(true);
      else setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <Slide wide>
      <Kicker accent={accent}>Live — a real model, right now</Kicker>
      <Heading size="h2">Ask it what comes next.</Heading>
      <Prose muted>
        Type the start of any sentence. The model returns its top candidates for
        the next word, with how confident it is in each.
      </Prose>
      <div style={{ display: "flex", gap: SPACE.xs, flexWrap: "wrap" }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run(prompt)}
          placeholder={PRESETS[0]}
          style={{ flex: 1, minWidth: 260 }}
        />
        <Button accent={accent} onClick={() => run(prompt)} disabled={loading}>
          {loading ? "Asking…" : "Predict"}
        </Button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => { setPrompt(p); run(p); }}
            style={{ fontSize: 13, color: COLORS.muted, padding: "4px 10px", border: `1px solid ${COLORS.hairline}`, borderRadius: 999 }}
          >
            “{p.slice(0, 42)}…”
          </button>
        ))}
      </div>
      {blocked && <BlockedNote />}
      {result?.error && <Prose muted>Couldn't reach the model: {result.error}</Prose>}
      {result?.candidates && (
        <Card>
          <ProbBars candidates={result.candidates} accent={accent} />
          <Prose muted style={{ fontSize: 13, marginTop: 12 }}>
            Percentages are renormalized among the top candidates shown — the
            model actually scores its entire vocabulary, on the order of a
            hundred thousand options, all at once.
          </Prose>
        </Card>
      )}
    </Slide>
  );
}

const GAME_SENTENCE = "The waiter brought the soup, but he forgot the";

function GameSlide({ accent }) {
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState("");

  const play = async () => {
    if (!guess.trim()) return;
    setLoading(true);
    setSubmitted(guess.trim());
    try {
      const data = await predictNext(GAME_SENTENCE);
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  const matched = result?.candidates?.some(
    (c) => c.token.toLowerCase() === submitted.toLowerCase()
  );

  return (
    <Slide wide>
      <Kicker accent={accent}>You versus the model</Kicker>
      <Heading size="h2">Now you play.</Heading>
      <Card>
        <div style={{ fontFamily: FONTS.display, fontSize: 24, fontStyle: "italic", lineHeight: 1.6 }}>
          “{GAME_SENTENCE} <span style={{ background: accent + "33", borderRadius: 4, padding: "0 8px" }}>___</span>”
        </div>
      </Card>
      {!result && (
        <div style={{ display: "flex", gap: SPACE.xs, flexWrap: "wrap" }}>
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && play()}
            placeholder="Your one-word guess"
            style={{ flex: 1, minWidth: 200 }}
          />
          <Button accent={accent} onClick={play} disabled={loading || !guess.trim()}>
            {loading ? "Comparing…" : "Lock it in"}
          </Button>
        </div>
      )}
      {result?.candidates && (
        <>
          <Prose>
            {matched
              ? <>Your guess <Mono accent={accent}>{submitted}</Mono> is in the model's top picks. You and a trillion-word reading habit agree.</>
              : <>Your guess: <Mono accent={accent}>{submitted}</Mono>. Here's what the model expected —</>}
          </Prose>
          <Card>
            <ProbBars candidates={result.candidates} accent={accent} highlight={submitted} />
          </Card>
          <Prose muted style={{ fontSize: 15 }}>
            You just did next-word prediction — the same task the model does. The
            interesting question is how you both got so good at it.
          </Prose>
        </>
      )}
    </Slide>
  );
}

// Generation = prediction in a loop: pick a candidate, it appends & re-predicts.
function LoopSlide({ accent }) {
  const [text, setText] = useState("The old lighthouse had one");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState(0);

  const run = async (t) => {
    setLoading(true);
    try {
      const data = await predictNext(t);
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  const pick = (token) => {
    const nextText = text + " " + token;
    setText(nextText);
    setSteps((s) => s + 1);
    run(nextText);
  };

  return (
    <Slide wide>
      <Kicker accent={accent}>The loop, in your hands</Kicker>
      <Heading size="h2">Generation is prediction on repeat.</Heading>
      <Prose muted>
        Pick any candidate. It gets appended, and the model predicts again.
        Congratulations — you are now the sampling algorithm.
      </Prose>
      <Card>
        <div style={{ fontFamily: FONTS.display, fontSize: 22, fontStyle: "italic", lineHeight: 1.7 }}>
          {text} <span style={{ animation: "v2Blink 1s infinite", color: accent }}>▌</span>
        </div>
      </Card>
      {!result && (
        <div>
          <Button accent={accent} onClick={() => run(text)} disabled={loading}>
            {loading ? "Predicting…" : "Show the candidates"}
          </Button>
        </div>
      )}
      {result?.candidates && (
        <Card>
          <ProbBars candidates={result.candidates} accent={accent} onPick={loading ? undefined : pick} />
          <Prose muted style={{ fontSize: 13, marginTop: 12 }}>
            {loading ? "Predicting…" : `Click a word to extend the sentence · ${steps} words added so far`}
          </Prose>
        </Card>
      )}
    </Slide>
  );
}

export default function Ch02OnlyPrediction({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Act I · The Mystery — Chapter 2</Kicker>
          <Heading>It's Only Prediction</Heading>
          <Lead>
            Last chapter made a big claim: the machine only ever guesses the next
            word. Big claims need evidence. This chapter, you gather it yourself.
          </Lead>
        </Slide>
      );
    case 1:
      return (
        <Slide>
          <Kicker accent={accent}>First, a confession</Kicker>
          <Heading size="h2">You're a prediction machine too.</Heading>
          <Prose>Finish this sentence — don't think, just let it happen:</Prose>
          <Card>
            <div style={{ fontFamily: FONTS.display, fontSize: 24, fontStyle: "italic" }}>
              “Better late than <span style={{ background: accent + "33", borderRadius: 4, padding: "0 8px" }}>___</span>”
            </div>
          </Card>
          <Prose>
            The word arrived before you asked for it. Your brain constantly
            predicts what comes next — the next word in a sentence, the next note
            in a melody. It's why typos jump out and why a joke's punchline can
            surprise you: <em>surprise is a failed prediction.</em>
          </Prose>
          <Prose muted>
            So "it just predicts words" is less dismissive than it sounds. The
            question is how good the predictions are — and what it takes to make
            them that good.
          </Prose>
        </Slide>
      );
    case 2:
      return <LiveDemo accent={accent} />;
    case 3:
      return <GameSlide accent={accent} />;
    case 4:
      return <LoopSlide accent={accent} />;
    case 5:
      return (
        <Slide>
          <Kicker accent={accent}>The depth argument</Kicker>
          <Heading size="h2">Good prediction is not shallow.</Heading>
          <Prose>
            Imagine predicting the very last word of a mystery novel:
          </Prose>
          <Card>
            <div style={{ fontFamily: FONTS.display, fontSize: 21, fontStyle: "italic", lineHeight: 1.7 }}>
              “The detective turned to face the room. The murderer, she announced,
              is <span style={{ background: accent + "33", borderRadius: 4, padding: "0 8px" }}>___</span>”
            </div>
          </Card>
          <Prose>
            To predict that word well, you'd need to have followed the entire
            plot — the alibis, the motives, the clue planted in chapter three.
            <strong> Predicting the next word, done well enough, forces you to
            model everything that makes the word likely.</strong>
          </Prose>
          <Prose muted>
            That's the resolution of the paradox from Chapter 1. "Just
            predicting" isn't a cheap trick that mimics understanding — at
            sufficient quality, prediction <em>demands</em> it.
          </Prose>
        </Slide>
      );
    case 6:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "A language model scores every possible next word and gives each a probability — you saw the real numbers.",
            "Generation is that prediction run in a loop: guess, append, repeat. You ran the loop by hand.",
            "Prediction done well enough requires understanding — to guess the mystery novel's last word, you must know the plot.",
          ]}
          footnote="We keep saying “word.” The real unit is slightly smaller — a word-piece called a token. It changes nothing about the logic so far, and it gets a proper explanation in Chapter 7."
          next="Why Rules Fail — before machines learned language, people tried to program it. It went badly."
        />
      );
  }
}
