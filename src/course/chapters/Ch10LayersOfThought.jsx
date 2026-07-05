// Chapter 10 — Layers of Thought
// The MLP (expand → compress), stacking ~96 layers, what different depths
// learn, and the full-pipeline payoff slide that assembles the whole machine.
import { useEffect, useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Button, Mono, HonestNote, Recap, CountUp, Term, SidequestLink } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";

// The assembled machine: stages reveal one by one, then the loop arrow.
const PIPELINE = [
  { label: "TEXT", detail: "“The bat flew out of the”", color: "#98A2B8" },
  { label: "TOKENS", detail: "The · bat · flew · out · of · the   (Ch. 7)", color: "#A78BFA" },
  { label: "EMBEDDINGS", detail: "each token → thousands of numbers (Ch. 7–8)", color: "#A78BFA" },
  { label: "ATTENTION + MLP, ×96", detail: "gather context, then think — layer after layer (Ch. 9–10)", color: "#A78BFA" },
  { label: "PROBABILITIES", detail: "cave 61% · night 8% · window 5% · …  (Ch. 2)", color: "#6C9EF8" },
  { label: "SAMPLE ONE", detail: "→ “cave”  — append it, and go again", color: "#6C9EF8" },
];

function PipelineSlide({ accent }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= PIPELINE.length + 1) return;
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 400 : 850);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <Slide wide>
      <Kicker accent={accent}>The payoff</Kicker>
      <Heading size="h2">The whole machine, assembled.</Heading>
      <Prose muted>
        Every box below is a chapter you've already done. Read it top to bottom
        — this is the entire thing.
      </Prose>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PIPELINE.map((stage, i) => (
          <div key={stage.label} style={{ display: "flex", flexDirection: "column", gap: 8, opacity: shown > i ? 1 : 0.12, transition: "opacity 400ms" }}>
            <Card style={{ padding: `${SPACE.xs + 4}px ${SPACE.sm}px`, borderColor: shown === i + 1 ? stage.color + "88" : COLORS.hairline }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
                <Mono style={{ fontSize: 13, color: stage.color, minWidth: 190 }}>{stage.label}</Mono>
                <span style={{ fontSize: 15, color: COLORS.muted }}>{stage.detail}</span>
              </div>
            </Card>
            {i < PIPELINE.length - 1 && (
              <div style={{ textAlign: "center", color: COLORS.faint, fontSize: 13, lineHeight: 0.6 }}>↓</div>
            )}
          </div>
        ))}
      </div>
      <div style={{ opacity: shown > PIPELINE.length ? 1 : 0, transition: "opacity 500ms" }}>
        <Prose>
          <span style={{ color: accent, fontFamily: FONTS.mono, fontSize: 15 }}>↺ append & repeat</span>
          {" "}— one full pass of everything above produces <strong>one token</strong>.
          A paragraph of output means running this pipeline hundreds of times,
          start to finish, each time seeing one more word than the last.
        </Prose>
      </div>
      {shown > PIPELINE.length && (
        <div className="reveal">
          <Button accent={accent} onClick={() => setShown(0)}>Replay</Button>
        </div>
      )}
    </Slide>
  );
}

export default function Ch10LayersOfThought({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Act III · Inside the Machine — Chapter 10</Kicker>
          <Heading>Layers of Thought</Heading>
          <Lead>
            Attention gathers the context. But gathering isn't thinking —
            something still has to <em>do</em> something with what was
            gathered. Meet the other half of every layer, and then let's stack.
          </Lead>
        </Slide>
      );
    case 1:
      return (
        <Slide>
          <Kicker accent={accent}>The other half</Kicker>
          <Heading size="h2">Expand, ask everything, compress.</Heading>
          <Prose>
            After attention, each word's vector runs through an
            <strong> MLP</strong> — a block that expands it to about four times
            its width, applies its learned weights, and compresses it back:
          </Prose>
          <Card>
            <div style={{ fontFamily: FONTS.mono, fontSize: 16, textAlign: "center", lineHeight: 2 }}>
              <span style={{ color: COLORS.muted }}>12,288</span>
              <span style={{ color: COLORS.faint }}> → </span>
              <span style={{ color: accent, fontSize: 22 }}>49,152</span>
              <span style={{ color: COLORS.faint }}> → </span>
              <span style={{ color: COLORS.muted }}>12,288</span>
            </div>
          </Card>
          <Prose>
            A useful cartoon: the expansion is the model asking tens of
            thousands of learned yes-ish/no-ish questions at once — <em>is this
            an animal? is this sentence formal? is a joke underway?</em> — and
            the compression keeps only the answers that matter. This is also
            where much of the model's factual knowledge appears to live.
          </Prose>
          <HonestNote>
            The “questions” are really two big matrix multiplications with a{" "}
            <Term t="nonlinearity" accent={accent}>nonlinearity</Term> between
            them, and the numbers above are GPT-3's. The
            expand-then-compress shape, though, is exactly real.
          </HonestNote>
          <Prose muted style={{ fontSize: 15 }}>
            An MLP is a small neural network — and if that phrase has always
            been a black box, the{" "}
            <SidequestLink slug="neural-network" accent={accent}>What Is a Neural Network?</SidequestLink>{" "}
            deep dive builds one from a single neuron up, every number
            computed live. It’s optional, opens in a new tab, and your place
            here stays put.
          </Prose>
        </Slide>
      );
    case 2:
      return (
        <Slide>
          <Kicker accent={accent}>Now stack</Kicker>
          <Heading size="h2">
            Attention + MLP = one layer. GPT-3 has{" "}
            <CountUp to={96} duration={1400} style={{ color: accent }} />.
          </Heading>
          <Prose>
            One layer: every word gathers context (attention), then processes
            it (MLP). The output is a slightly sharper set of vectors — which
            becomes the <em>input to the next layer</em>, where the whole thing
            happens again, with different learned weights.
          </Prose>
          <Prose>
            Refinement compounds. By the final layer, the vector sitting at the
            last position isn't really “the” anymore — it has absorbed the
            entire sentence and become something closer to
            <em> “the-next-word-here, given everything so far.”</em>
          </Prose>
          <Prose muted>
            That final vector is what gets converted into the probabilities you
            met in Chapter 2. The circle is about to close.
          </Prose>
        </Slide>
      );
    case 3:
      return (
        <Slide>
          <Kicker accent={accent}>What each stage learns</Kicker>
          <Heading size="h2">Spelling in the first layers, meaning in the final ones.</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            {[
              ["layers ~1–10", "surface patterns — spelling, word endings, basic grammar", 0.25],
              ["layers ~30–60", "structure and facts — who did what to whom, entities, relationships", 0.55],
              ["layers ~80–96", "meaning — tone, intent, reasoning, what the passage is really about", 1.0],
            ].map(([label, text, strength], i) => (
              <div key={label} className="reveal" style={{ animationDelay: `${i * 160}ms` }}>
                <Card style={{ borderColor: accent + Math.round(strength * 90).toString(16).padStart(2, "0") }}>
                  <Mono accent={accent} style={{ fontSize: 13 }}>{label}</Mono>
                  <Prose muted style={{ fontSize: 15, marginTop: 4 }}>{text}</Prose>
                </Card>
              </div>
            ))}
          </div>
          <HonestNote>
            Nobody assigned these jobs — the division of labor emerges from
            training, and researchers discovered it afterward by probing models
            layer by layer. The progression is gradual, not neatly staged, and
            mapping it precisely is ongoing{" "}
            <Term t="interpretability" accent={accent}>interpretability research</Term>.
          </HonestNote>
        </Slide>
      );
    case 4:
      return <PipelineSlide accent={accent} />;
    case 5:
      return (
        <Slide>
          <Kicker accent={accent}>The mystery, revisited</Kicker>
          <Heading size="h2">Chapter 1 asked how this is possible.</Heading>
          <Prose>
            <em>How can a machine that only guesses the next word write, reason,
            and joke?</em> You can now give the real answer: because each
            “guess” is not a reflex. It's a full pass through a map of meaning,
            dozens of attention heads reading the entire context, and ~100
            layers of accumulated refinement — trained on trillions of words
            until the guesses became this good.
          </Prose>
          <Prose muted>
            “It's only predicting the next word” and “it's doing something
            remarkably deep” were never in conflict. The prediction <em>is</em>
            the deep thing.
          </Prose>
        </Slide>
      );
    case 6:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "Each layer is attention (gather context) plus an MLP (expand, apply learned knowledge, compress).",
            "Stack ~100 layers and refinement compounds: spelling in the first layers, facts in the middle, meaning in the final ones.",
            "One full pass of the pipeline produces one token. Everything an LLM does is this pipeline, on repeat.",
          ]}
          next="Act IV: Temperature — the probabilities are computed. Now someone has to roll the dice."
          aside={
            <>
              Still fuzzy on what a “neural network” actually is, under all the
              course’s dials-and-layers talk? The optional{" "}
              <SidequestLink slug="neural-network" accent={accent}>What Is a Neural Network?</SidequestLink>{" "}
              sidequest builds one by hand — one neuron, the ReLU bend, a live
              17-parameter classifier — in a separate tab, without losing your
              spot.
            </>
          }
        />
      );
  }
}
