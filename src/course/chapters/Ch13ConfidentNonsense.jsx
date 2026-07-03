// Chapter 13 — Confident Nonsense
// Hallucination (live trap-question demo), why it's built in, cutoff and
// arithmetic limits, bias, and the fixes: context, RAG, tools/agents.
import { useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Button, Mono, HonestNote, Recap } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";
import { generateStream } from "../lib/api.js";

const FAKE_BOOK = "“The Cartographer's Breakfast” by Miriam Vale";
const TRAP_PROMPT = `What year did the children's book ${FAKE_BOOK.replace(/[“”]/g, '"')} win the Caldecott Medal, and what is the story about?`;

function TrapDemo({ accent }) {
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setOutput("");
    try {
      const r = await generateStream(TRAP_PROMPT, {
        temperature: 0.8, maxTokens: 120, onToken: (_, t) => setOutput(t),
      });
      setOutput(r.blocked ? "(blocked — try again)" : r.text);
    } catch (err) {
      setOutput(`Couldn't reach the model: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <Slide wide>
      <Kicker accent={accent}>A trap, set live</Kicker>
      <Heading size="h2">This book does not exist.</Heading>
      <Prose>
        We invented {FAKE_BOOK} for this course. No such book, no such author.
        Now watch what happens when we ask about it <em>as if it were real</em>:
      </Prose>
      <Card>
        <div style={{ fontFamily: FONTS.display, fontSize: 18, fontStyle: "italic" }}>“{TRAP_PROMPT}”</div>
      </Card>
      <div>
        <Button accent={accent} onClick={run} disabled={loading}>
          {loading ? "Asking…" : output !== null ? "Ask again" : "Spring the trap"}
        </Button>
      </div>
      {output !== null && (
        <Card style={{ borderColor: accent + "44" }}>
          <Mono style={{ fontSize: 11, color: COLORS.faint }}>MODEL</Mono>
          <div style={{ fontSize: 16, marginTop: 6, lineHeight: 1.7 }}>
            {output}{loading && <span style={{ animation: "v2Blink 1s infinite" }}>▌</span>}
          </div>
        </Card>
      )}
      {output && !loading && (
        <Prose muted style={{ fontSize: 15 }} className="reveal">
          Two things can happen here, and both teach. If it invented a year and
          a plot — fluent, confident, and entirely fabricated — that's a
          <strong> hallucination</strong>. If it said it doesn't know the book:
          notice that's a <em>trained</em> reflex (Chapter 6's raising), it took
          years to instill, and subtler traps still get through daily. Run it a
          few times.
        </Prose>
      )}
    </Slide>
  );
}

const CONTEXT_FACTS = `Here are the facts: "The Cartographer's Breakfast" is a fictional book invented for an AI course. It has no author, no publication year, and has won no awards.`;

function ContextFixDemo({ accent }) {
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setOutput("");
    try {
      const r = await generateStream(`${CONTEXT_FACTS}\n\nQuestion: ${TRAP_PROMPT}`, {
        temperature: 0.5, maxTokens: 90, onToken: (_, t) => setOutput(t),
      });
      setOutput(r.blocked ? "(blocked — try again)" : r.text);
    } catch (err) {
      setOutput(`Couldn't reach the model: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <Slide wide>
      <Kicker accent={accent}>Fix one — live</Kicker>
      <Heading size="h2">Hand it the truth.</Heading>
      <Prose>
        Same trap question — but this time the prompt <em>starts</em> with the
        facts. The most likely continuation of text-that-contains-the-answer is
        the answer.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 12, color: accent }}>ADDED TO THE PROMPT</Mono>
        <div style={{ fontSize: 15, color: COLORS.muted, marginTop: 4, fontStyle: "italic" }}>{CONTEXT_FACTS}</div>
      </Card>
      <div>
        <Button accent={accent} onClick={run} disabled={loading}>
          {loading ? "Asking…" : output !== null ? "Ask again" : "Ask with the facts included"}
        </Button>
      </div>
      {output !== null && (
        <Card style={{ borderColor: accent + "44" }}>
          <Mono style={{ fontSize: 11, color: COLORS.faint }}>MODEL</Mono>
          <div style={{ fontSize: 16, marginTop: 6, lineHeight: 1.7 }}>
            {output}{loading && <span style={{ animation: "v2Blink 1s infinite" }}>▌</span>}
          </div>
        </Card>
      )}
      {output && !loading && (
        <Prose muted style={{ fontSize: 15 }} className="reveal">
          Grounded. This is <strong>context stuffing</strong> — the simplest
          fix, and the reason “paste in the document you're asking about” works
          so well. Its limit is obvious: someone has to know which facts to
          paste.
        </Prose>
      )}
    </Slide>
  );
}

export default function Ch13ConfidentNonsense({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Act V · Powers and Limits — Chapter 13</Kicker>
          <Heading>Confident Nonsense</Heading>
          <Lead>
            You now know how the machine works. This chapter is about how it
            fails — and the uncomfortable part is that every failure follows
            directly from things you've already learned.
          </Lead>
        </Slide>
      );
    case 1:
      return <TrapDemo accent={accent} />;
    case 2:
      return (
        <Slide>
          <Kicker accent={accent}>Why it's built in</Kicker>
          <Heading size="h2">It was never trained to be true.</Heading>
          <Prose>
            Walk it back through the course. The model was trained to predict
            <em> plausible text</em> (Chapter 4) — and for a question about a
            children's book, a plausible continuation names a year and
            describes a plot. Truth and plausibility usually agree, because
            true text dominated the training data. When they disagree,
            <strong> the machine sides with plausible.</strong>
          </Prose>
          <Prose>
            And the confidence? Also style. The training data is full of
            confident prose and nearly empty of “I'm not sure” — so confident
            prose is what gets predicted. The tone of certainty carries
            <em> zero evidence</em> about whether the content is right.
          </Prose>
          <HonestNote>
            Post-training (Chapter 6) pushes hard against this — rewarding
            models for declining, hedging, and citing. It genuinely helps,
            which is why the trap sometimes fails. But it's a patch on top of
            a plausibility machine, not a change to the machine.
          </HonestNote>
        </Slide>
      );
    case 3:
      return (
        <Slide>
          <Kicker accent={accent}>Two more built-in walls</Kicker>
          <Heading size="h2">Frozen in time, and bad at arithmetic.</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            <Card>
              <Mono accent={accent} style={{ fontSize: 13 }}>THE KNOWLEDGE CUTOFF</Mono>
              <Prose muted style={{ fontSize: 15, marginTop: 6 }}>
                Training ended on a date. Everything after it simply isn't in
                the weights — the model doesn't know today's news, the current
                date, or anything about you. Worse, it doesn't reliably know
                what it doesn't know: ask about last week and you may get a
                plausible guess in a confident voice.
              </Prose>
            </Card>
            <Card>
              <Mono accent={accent} style={{ fontSize: 13 }}>THE ARITHMETIC PROBLEM</Mono>
              <Prose muted style={{ fontSize: 15, marginTop: 6 }}>
                You saw this coming in Chapter 7: numbers get chopped into
                arbitrary tokens (“299,114” might be “299” + “,” + “114”), and
                prediction is not calculation. Chapter 12's step-by-step helps;
                it doesn't make the machine a calculator.
              </Prose>
            </Card>
          </div>
          <Prose muted>
            Neither of these is a bug to be patched out of the model. Both are
            consequences of what a language model <em>is</em>. The fixes, it
            turns out, live outside the model — two slides from now.
          </Prose>
        </Slide>
      );
    case 4:
      return (
        <Slide>
          <Kicker accent={accent}>Chapter 3's warning, come due</Kicker>
          <Heading size="h2">The bias was in the examples.</Heading>
          <Prose>
            Back in Chapter 3 we flagged the price of learning from examples: a
            model inherits <em>everything</em> in its examples. Trillions of
            words of human writing carry human skew — which professions get
            described with which pronouns, which names appear in which kinds of
            stories, which dialects get called “correct,” whose perspectives got
            written down at all.
          </Prose>
          <Prose>
            The model absorbs those statistics exactly as faithfully as it
            absorbs grammar. It can't tell which patterns are knowledge and
            which are prejudice — <strong>to a prediction machine, they're the
            same kind of thing.</strong>
          </Prose>
          <HonestNote>
            Labs counter with data curation, post-training (Chapter 6), and
            evaluations designed to surface skew — and models have measurably
            improved. But “less biased than the raw internet” is a floor, not a
            finish line, and the choices about what to correct are themselves
            value judgments made by people (Chapter 6's question, again).
          </HonestNote>
        </Slide>
      );
    case 5:
      return <ContextFixDemo accent={accent} />;
    case 6:
      return (
        <Slide>
          <Kicker accent={accent}>Fixes two and three</Kicker>
          <Heading size="h2">Let it look things up. Let it act.</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            <Card>
              <Mono accent={accent} style={{ fontSize: 13 }}>RAG — RETRIEVAL-AUGMENTED GENERATION</Mono>
              <Prose muted style={{ fontSize: 15, marginTop: 6 }}>
                Context stuffing, automated. Before the model answers, a search
                system finds relevant documents (often using embeddings — your
                Chapter 8 map, used as a search index!) and pastes them into the
                prompt. This is how AI answers questions about today's news or
                your company's files.
              </Prose>
            </Card>
            <Card>
              <Mono accent={accent} style={{ fontSize: 13 }}>TOOLS</Mono>
              <Prose muted style={{ fontSize: 15, marginTop: 6 }}>
                The model writes a structured request — <Mono>calculator(347 × 862)</Mono> —
                a real program runs it, and the result goes back into the
                context. Prediction machine for the language, actual calculator
                for the math. Each side does what it's good at.
              </Prose>
            </Card>
            <Card>
              <Mono accent={accent} style={{ fontSize: 13 }}>AGENTS</Mono>
              <Prose muted style={{ fontSize: 15, marginTop: 6 }}>
                Put it in a loop: <em>think → act → observe → repeat</em>. The
                model plans, calls a tool, reads the result, and decides what to
                do next — reasoning (Chapter 12) plus tools, on repeat. That
                loop is what people mean by “AI agents.”
              </Prose>
            </Card>
          </div>
          <Prose muted style={{ fontSize: 15 }}>
            Notice the shape of all three fixes: none of them change the model.
            They change <strong>what's in the context</strong> — because the one
            thing you can always trust the machine to do is continue the text
            it was given.
          </Prose>
        </Slide>
      );
    case 7:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "Hallucination isn't a glitch — a plausibility machine sides with plausible when truth and plausibility disagree, and its confident tone is style, not evidence.",
            "The cutoff, the arithmetic weakness, and inherited bias all follow directly from how the machine is built and trained.",
            "The fixes — context, RAG, tools, agents — all work the same way: don't change the model, change what's in its context.",
          ]}
          next="You Know GenAI — the story from Chapter 1 returns, and this time you can narrate every step. Then: prove it."
        />
      );
  }
}
