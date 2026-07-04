// Chapter 13 — Confident Nonsense
// Hallucination (live trap-question demo), why it's built in, cutoff and
// arithmetic limits, bias, the memory illusion, and the fixes: context, RAG,
// tools/agents (live agent-loop demo), plus the buzzword decoder (MCP, skills).
import { useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Button, Mono, HonestNote, Recap } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";
import { generateStream, runAgent } from "../lib/api.js";

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

// ---- The memory illusion ----------------------------------------------------
// A scripted 3-step chat that reveals what the model ACTUALLY receives each
// turn: the full transcript resent every time, then (in a new chat) an
// app-injected memory note. Token counts are illustrative but proportional.
const MEMORY_STEPS = [
  {
    label: "Turn 1",
    you: "Hi! I live in Portland and I'm starting a garden.",
    reply: "Lovely! What are you hoping to grow?",
    payload: [
      { kind: "new", text: "You: Hi! I live in Portland and I'm starting a garden." },
    ],
    tokens: 14,
    note: "Turn one is simple: your message goes in, a reply comes out. Then the model forgets everything. Not 'moves on' — forgets. Nothing persists inside it between calls.",
  },
  {
    label: "Turn 2",
    you: "Mostly tomatoes, I think.",
    reply: "Great choice — tomatoes love a long warm season.",
    payload: [
      { kind: "resent", text: "You: Hi! I live in Portland and I'm starting a garden." },
      { kind: "resent", text: "AI: Lovely! What are you hoping to grow?" },
      { kind: "new", text: "You: Mostly tomatoes, I think." },
    ],
    tokens: 38,
    note: "To 'remember' turn one, the app resends the ENTIRE conversation — every turn, every time. The model re-reads it all from scratch and each round gets longer and more expensive. (Advanced providers cache the attention-and-layers work already done on the earlier tokens — a KV cache — so only the new part costs full effort. Without it, everything reruns token by token.)",
  },
  {
    label: "A week later — brand new chat",
    you: "What should I plant this month?",
    reply: "In Portland's climate, this month is good for starting tomatoes indoors…",
    payload: [
      { kind: "memory", text: "MEMORY (injected by the app): User lives in Portland. User is growing tomatoes." },
      { kind: "new", text: "You: What should I plant this month?" },
    ],
    tokens: 27,
    note: "A new chat has no transcript — so how does it know Portland? The app kept its own notes in a database and quietly pasted them into the prompt. You never asked it to send that. The 'relationship' lives in a text file the app maintains, not in the model.",
  },
];

function MemoryDemo({ accent }) {
  const [step, setStep] = useState(-1);
  const s = step >= 0 ? MEMORY_STEPS[step] : null;

  return (
    <Slide wide>
      <Kicker accent={accent}>The memory illusion</Kicker>
      <Heading size="h2">It doesn't remember you. At all.</Heading>
      <Prose muted>
        The weights froze when training ended — nothing you say changes the
        model, and nothing persists inside it between messages. So how does a
        chatbot remember your name? Step through a chat and watch what's
        <em> actually sent</em>.
      </Prose>
      <div style={{ display: "flex", gap: SPACE.xs, flexWrap: "wrap" }}>
        {MEMORY_STEPS.map((m, i) => (
          <Button
            key={m.label}
            accent={i === step ? accent : "transparent"}
            style={i === step ? {} : { border: `1px solid ${COLORS.hairline}`, color: COLORS.muted }}
            onClick={() => setStep(i)}
          >
            {m.label}
          </Button>
        ))}
      </div>
      {s && (
        <div key={step} className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: SPACE.sm }}>
          <Card>
            <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 10 }}>WHAT YOU SEE</Mono>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 15, lineHeight: 1.6 }}>
              <div style={{ alignSelf: "flex-end", background: accent + "22", borderRadius: "12px 12px 2px 12px", padding: "8px 12px", maxWidth: "90%" }}>
                {s.you}
              </div>
              <div style={{ alignSelf: "flex-start", background: "rgba(255,255,255,.06)", borderRadius: "12px 12px 12px 2px", padding: "8px 12px", maxWidth: "90%" }}>
                {s.reply}
              </div>
            </div>
          </Card>
          <Card style={{ borderColor: accent + "44" }}>
            <Mono style={{ fontSize: 11, color: accent, display: "block", marginBottom: 10 }}>
              WHAT THE MODEL RECEIVES · ~{s.tokens} tokens
            </Mono>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {s.payload.map((p, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: FONTS.mono, fontSize: 12.5, lineHeight: 1.7,
                    padding: "6px 10px", borderRadius: 8,
                    background: p.kind === "memory" ? accent + "18" : "rgba(255,255,255,.03)",
                    border: `1px solid ${p.kind === "new" ? "rgba(255,255,255,.2)" : p.kind === "memory" ? accent + "55" : "transparent"}`,
                    color: p.kind === "resent" ? COLORS.faint : p.kind === "memory" ? accent : COLORS.text,
                  }}
                >
                  {p.kind === "resent" && "↻ "}{p.text}
                </div>
              ))}
            </div>
            {step === 1 && (
              <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginTop: 8 }}>
                ↻ = resent from earlier turns
              </Mono>
            )}
          </Card>
        </div>
      )}
      {s && <Prose muted style={{ fontSize: 15 }}>{s.note}</Prose>}
      {!s && (
        <Prose muted style={{ fontSize: 15 }}>
          Click “Turn 1” to start the chat.
        </Prose>
      )}
    </Slide>
  );
}

// ---- Live agent loop ---------------------------------------------------------
const AGENT_TOOLS = [
  { id: "calculator", label: "calculator" },
  { id: "get_date", label: "today's date" },
  { id: "search_docs", label: "doc search" },
];
const AGENT_PRESETS = [
  "What is 847 × 293?",
  "What day is it today?",
  "How far away is the Moon?",
];

function AgentDemo({ accent }) {
  const [enabled, setEnabled] = useState(new Set(AGENT_TOOLS.map((t) => t.id)));
  const [prompt, setPrompt] = useState("");
  const [steps, setSteps] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastHadTools, setLastHadTools] = useState(true);

  const toggle = (id) =>
    setEnabled((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const run = async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    setSteps(null);
    setLastHadTools(enabled.size > 0);
    try {
      const data = await runAgent(text, [...enabled]);
      setSteps(data.steps || []);
    } catch (err) {
      setSteps([{ type: "response", content: `Couldn't reach the agent: ${err.message}` }]);
    }
    setLoading(false);
  };

  const usedTools = steps?.some((s) => s.type === "tool_call");

  return (
    <Slide wide>
      <Kicker accent={accent}>Live — a real agent loop</Kicker>
      <Heading size="h2">Give it hands. Then take them away.</Heading>
      <Prose muted>
        A real model, a real loop, three real tools. Ask a question and watch
        the think → act → observe cycle — then switch the tools off and ask
        the same question again.
      </Prose>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Mono style={{ fontSize: 11, color: COLORS.faint }}>TOOLS:</Mono>
        {AGENT_TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => toggle(t.id)}
            style={{
              fontSize: 13, padding: "6px 14px", borderRadius: 999,
              fontFamily: FONTS.mono,
              border: `1px solid ${enabled.has(t.id) ? accent : COLORS.hairline}`,
              background: enabled.has(t.id) ? accent + "22" : "transparent",
              color: enabled.has(t.id) ? accent : COLORS.faint,
              transition: "all 200ms",
            }}
          >
            {enabled.has(t.id) ? "● " : "○ "}{t.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: SPACE.xs, flexWrap: "wrap" }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run(prompt)}
          placeholder={AGENT_PRESETS[0]}
          style={{ flex: 1, minWidth: 240 }}
        />
        <Button accent={accent} onClick={() => run(prompt)} disabled={loading}>
          {loading ? "Running…" : "Ask"}
        </Button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {AGENT_PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => { setPrompt(p); run(p); }}
            style={{ fontSize: 13, color: COLORS.muted, padding: "4px 10px", border: `1px solid ${COLORS.hairline}`, borderRadius: 999 }}
          >
            {p}
          </button>
        ))}
      </div>
      {loading && <Prose muted style={{ fontSize: 14 }}>think → act → observe…</Prose>}
      {steps && (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {steps.map((s, i) => {
              if (s.type === "tool_call") {
                return (
                  <div key={i} className="reveal" style={{ animationDelay: `${i * 150}ms`, fontFamily: FONTS.mono, fontSize: 13.5 }}>
                    <span style={{ color: COLORS.faint }}>ACT&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <span style={{ color: accent }}>→ {s.tool}({s.input})</span>
                  </div>
                );
              }
              if (s.type === "tool_result") {
                return (
                  <div key={i} className="reveal" style={{ animationDelay: `${i * 150}ms`, fontFamily: FONTS.mono, fontSize: 13.5 }}>
                    <span style={{ color: COLORS.faint }}>OBSERVE&nbsp;</span>
                    <span style={{ color: COLORS.correct }}>← {String(s.output).slice(0, 120)}{String(s.output).length > 120 ? "…" : ""}</span>
                  </div>
                );
              }
              return (
                <div key={i} className="reveal" style={{ animationDelay: `${i * 150}ms`, fontSize: 15.5, lineHeight: 1.65, paddingTop: 4 }}>
                  <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 4 }}>ANSWER</Mono>
                  {s.content}
                </div>
              );
            })}
          </div>
        </Card>
      )}
      {steps && !loading && (
        <Prose muted style={{ fontSize: 15 }} className="reveal">
          {usedTools
            ? "Every → line is the model writing a structured request; every ← line is a real program's result going back into the context. The model never calculated anything — it delegated, then continued the text."
            : lastHadTools
              ? "No tools were needed for that one — try the multiplication, or switch tools off and watch it cope alone."
              : "No hands. Now it can only predict — watch it guess at math, not know today's date, and improvise around missing facts. Switch the tools back on and ask again."}
        </Prose>
      )}
    </Slide>
  );
}

// ---- The buzzword decoder ------------------------------------------------------
const BUZZWORDS = [
  {
    term: "Function calling / tool use",
    def: "The model writes a structured request; the app runs it and puts the result in the context. You just watched it happen.",
  },
  {
    term: "MCP — Model Context Protocol",
    def: "A standard plug for the above. Instead of every app hand-wiring every tool, MCP defines one common way to offer models tools and data — like USB: build a tool once, and any AI app can connect it. The name says it plainly: a protocol for getting things into the model's context.",
  },
  {
    term: "Skills",
    def: "Packaged know-how — instructions, examples, sometimes scripts — that an agent loads into its context when the task calls for it. A skill doesn't change the model; it's pre-written expertise stuffed into the prompt at the right moment.",
  },
  {
    term: "Agents",
    def: "The loop that uses all of the above: think → act → observe → repeat, with a menu of tools and a shelf of skills. The intelligence is the model; the agent is the harness around it.",
  },
];

function BuzzwordSlide({ accent }) {
  return (
    <Slide wide>
      <Kicker accent={accent}>The buzzword decoder</Kicker>
      <Heading size="h2">MCP, skills, agents — you already understand them.</Heading>
      <Prose muted>
        The AI world mints jargon fast. Here's the secret: every term on this
        list is a different answer to the one question this chapter is about —
        <em> what should go in the context?</em>
      </Prose>
      <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
        {BUZZWORDS.map((b, i) => (
          <div key={b.term} className="reveal" style={{ animationDelay: `${i * 130}ms` }}>
            <Card>
              <Mono accent={accent} style={{ fontSize: 13 }}>{b.term.toUpperCase()}</Mono>
              <Prose muted style={{ fontSize: 15, marginTop: 6 }}>{b.def}</Prose>
            </Card>
          </div>
        ))}
      </div>
      <Prose muted style={{ fontSize: 15 }}>
        So when a product page says an agent “uses MCP tools and custom
        skills,” you can translate fluently: a prediction loop, a standard way
        to hand it tools, and pre-written context loaded on demand. The model
        underneath is the same machine you've known since Chapter 1.
      </Prose>
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
            turns out, all live outside the model — coming up shortly.
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
      return <MemoryDemo accent={accent} />;
    case 6:
      return <ContextFixDemo accent={accent} />;
    case 7:
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
            it was given. Next slide: run the agent loop for real.
          </Prose>
        </Slide>
      );
    case 8:
      return <AgentDemo accent={accent} />;
    case 9:
      return <BuzzwordSlide accent={accent} />;
    case 10:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "Hallucination isn't a glitch — a plausibility machine sides with plausible when truth and plausibility disagree, and its confident tone is style, not evidence.",
            "The cutoff, the arithmetic weakness, and inherited bias all follow directly from how the machine is built and trained.",
            "The model remembers nothing between messages: chat apps resend the whole transcript every turn (caching the repeated work) and inject saved notes to fake long-term memory.",
            "The fixes — context, memory notes, RAG, tools, agents — and the buzzwords around them (MCP, skills) all answer one question: what should go in the context?",
          ]}
          next="You Know GenAI — the story from Chapter 1 returns, and this time you can narrate every step. Then: prove it."
        />
      );
  }
}
