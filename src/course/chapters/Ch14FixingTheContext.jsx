// Chapter 14 — Fixing the Context
// The fixes half: none of them change the model, they change what it's given.
// Context stuffing (live "paste the truth" demo), RAG / tools / agents, a live
// agent-loop demo, and the buzzword decoder (MCP, skills, agents). The through
// line: every fix — and every buzzword — answers one question, "what should go
// in the context?"
import { useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Button, Mono, Recap, Term, SidequestLink } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";
import { generateStream, runAgent } from "../lib/api.js";

// The invented book from Chapter 13, restated here so the fix demo can hand the
// model the truth about it. No such book, no such author.
const FAKE_BOOK = "“The Cartographer's Breakfast” by Miriam Vale";
const TRAP_PROMPT = `What year did the children's book ${FAKE_BOOK.replace(/[“”]/g, '"')} win the Caldecott Medal, and what is the story about?`;
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
        The same trap question from last chapter — but this time the prompt
        <em> starts</em> with the facts. The most likely continuation of
        text-that-contains-the-answer is the answer.
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

export default function Ch14FixingTheContext({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Act V · Powers and Limits — Chapter 14</Kicker>
          <Heading>Fixing the Context</Heading>
          <Lead>
            Last chapter's failures all trace to the model itself — and here's
            the twist: none of the fixes touch the model. Every one of them
            changes only <em>what it's given</em>. Same frozen machine, a better
            prompt.
          </Lead>
        </Slide>
      );
    case 1:
      return <ContextFixDemo accent={accent} />;
    case 2:
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
                your company's files. Where those documents land in the prompt
                turns out to matter as much as which ones you pick — the{" "}
                <SidequestLink slug="position-bias" accent={accent}>Where You Put It Matters</SidequestLink>{" "}
                sidequest shows why.
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
            They change <strong>what's in the{" "}
            <Term t="context" accent={accent}>context</Term></strong> — because the one
            thing you can always trust the machine to do is continue the text
            it was given. Next slide: run the agent loop for real.
          </Prose>
        </Slide>
      );
    case 3:
      return <AgentDemo accent={accent} />;
    case 4:
      return <BuzzwordSlide accent={accent} />;
    case 5:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "Every fix in this chapter leaves the frozen weights untouched — it changes only what goes into the context the model reads.",
            "Context stuffing hands it the facts; RAG automates that by retrieving documents; tools let it delegate what prediction can't do, like arithmetic.",
            "An agent is just that loop — think → act → observe → repeat — wrapped around the same prediction machine from Chapter 1.",
            "The buzzwords (MCP, skills, agents) all decode to one question: what should go in the context?",
          ]}
          footnote="These fixes reduce the failures from Chapter 13; they don't erase them. A retrieved document can still be wrong or misread, and the model can still hallucinate around a gap in what it was handed."
          next="You Know GenAI — the whole pipeline, replayed on Chapter 1's story, then you prove it."
        />
      );
  }
}
