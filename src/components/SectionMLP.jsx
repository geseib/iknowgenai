import { useState, useEffect, useRef } from "react";
import {
  ArrowDown,
  Brain,
  Lightning,
  Key,
} from "@phosphor-icons/react";
import { Card, Label, H1, Body, TriviaBox, TeacherNote, PresSlide, PresText } from "./shared";

const notes = [
  "Analogy that works well: attention is reading the room and figuring out who's related to whom. MLP is flipping through your entire memory to decide what it all means.",
  "The 4× expansion in the hidden layer is worth pausing on. Ask: 'Why would you make it bigger in the middle?' Answer: more room to consider possibilities before narrowing back down.",
  "A good physical analogy: breathing in deeply before answering a hard question. The 'expand then compress' pattern gives the model room to think.",
  "After the animation: 'Every single layer of the model does Attention + MLP, then passes the result to the next layer. How many layers do you think there are?' (96)",
];

function Nodes({ count, lit, color, size: nodeSize }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{
          width: nodeSize || 20, height: nodeSize || 20, borderRadius: "50%",
          background: lit ? color : "rgba(255,255,255,.14)",
          border: `1.5px solid ${lit ? color : "rgba(255,255,255,.2)"}`,
          boxShadow: lit ? `0 0 8px ${color}` : "none",
          transition: "all .35s ease",
        }} />
      ))}
    </div>
  );
}

function Arrow({ lit, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{
        width: 28, height: 2,
        background: lit ? color : "rgba(255,255,255,.15)",
        transition: "background .35s ease",
        boxShadow: lit ? `0 0 6px ${color}` : "none",
      }} />
      <div style={{
        width: 0, height: 0,
        borderTop: "5px solid transparent",
        borderBottom: "5px solid transparent",
        borderLeft: `7px solid ${lit ? color : "rgba(255,255,255,.15)"}`,
        transition: "border-color .35s ease",
      }} />
    </div>
  );
}

function ContinueButton({ onClick, color, label }) {
  return (
    <div style={{ textAlign: "center", marginTop: 28, marginBottom: 16 }}>
      <button
        onClick={onClick}
        className="cta-btn"
        style={{
          background: color,
          color: "#000",
          fontSize: 20,
          padding: "14px 32px",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {label} <ArrowDown size={20} weight="bold" />
      </button>
    </div>
  );
}

export default function SectionMLP({ color, mode, slide }) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const step1Ref = useRef(null);
  const running = phase > 0 && phase < 4;

  const run = () => {
    setPhase(1); setHasRun(true);
    setTimeout(() => setPhase(2), 700);
    setTimeout(() => setPhase(3), 1400);
    setTimeout(() => setPhase(4), 2200);
  };

  const advance = () => {
    if (step < 1) setStep(s => s + 1);
  };

  // Keyboard: down arrow advances steps or triggers animation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (step === 0 && !hasRun) {
          run();
        } else if (step === 0 && hasRun) {
          advance();
        } else if (step >= 1) {
          window.dispatchEvent(new Event("sectionFullyRevealed"));
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, hasRun]);

  // Auto-scroll to newly revealed step
  useEffect(() => {
    const target = step === 1 ? step1Ref.current : null;
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [step]);

  const layers = [
    { label: "Input",  nodes: 5, lit: phase >= 1, desc: "Context from Attention" },
    { label: "Hidden", nodes: 8, lit: phase >= 2, desc: "4× bigger! Room to think" },
    { label: "Output", nodes: 5, lit: phase >= 3, desc: "Richer, smarter signal" },
  ];

  const presLayers = [
    { label: "Input",  nodes: 5, lit: true, desc: "Context from Attention" },
    { label: "Hidden", nodes: 8, lit: true, desc: "4× bigger! Room to think" },
    { label: "Output", nodes: 5, lit: true, desc: "Richer, smarter signal" },
  ];

  if (mode === "presentation") {
    if (slide === 0) {
      return (
        <PresSlide>
          <PresText color="white" size={48}>The Thinking Layer</PresText>
          <PresText size={28} color="rgba(255,255,255,.55)">
            Attention <span style={{ fontSize: 20, opacity: 0.6 }}>(words look at each other)</span> figured out which words relate.
          </PresText>
          <PresText size={28}>
            Now the MLP <span style={{ fontSize: 20, opacity: 0.6 }}>(asks questions about each word)</span> does the heavy thinking — connecting what it's reading to{" "}
            <span style={{ color }}>everything it ever learned</span>.
          </PresText>
        </PresSlide>
      );
    }
    /* Slide 1: Expand — the brainstorm phase */
    if (slide === 1) {
      const questions = [
        { q: "Is it alive?", lit: false },
        { q: "Is it a sport thing?", lit: true },
        { q: "Does it fly?", lit: false },
        { q: "Is it wooden?", lit: true },
        { q: "Can you hold it?", lit: true },
        { q: "Is it food?", lit: false },
        { q: "Does it have wings?", lit: false },
        { q: "Is it found outdoors?", lit: true },
        { q: "Is it dangerous?", lit: false },
      ];
      return (
        <PresSlide>
          <PresText size={36} color="white">
            Ever play <strong style={{ color }}>21 Questions</strong>? Fun, right?
          </PresText>
          <PresText size={36} color="white">
            What about <strong style={{ color }}>49,152</strong> questions.
            <br />Would <em>that</em> be fun?
          </PresText>

          {/* Question bubbles grid */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center",
            maxWidth: 760, width: "100%",
          }}>
            {questions.map((item, i) => (
              <div key={i} style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: 20,
                padding: "10px 20px", borderRadius: 28,
                background: item.lit ? `${color}18` : "rgba(255,255,255,.04)",
                border: `2px solid ${item.lit ? `${color}60` : "rgba(255,255,255,.1)"}`,
                color: item.lit ? color : "rgba(255,255,255,.3)",
                animation: `fadeUp .4s ${i * 0.06}s ease both`,
              }}>
                {item.q}
              </div>
            ))}
          </div>

          <PresText size={22} color="rgba(255,255,255,.35)">
            The MLP checks all 49,152 at once — most won't apply!
          </PresText>
        </PresSlide>
      );
    }

    /* Slide 2: Compress — keep only what matters */
    if (slide === 2) {
      const kept = [
        { q: "Is it a sport thing?", icon: "⚾" },
        { q: "Is it wooden?", icon: "🪵" },
        { q: "Can you hold it?", icon: "✋" },
        { q: "Is it found outdoors?", icon: "🏟️" },
      ];
      return (
        <PresSlide>
          <PresText size={36} color="white">
            Then it <strong style={{ color }}>compresses</strong> back down
          </PresText>
          <PresText size={26} color="rgba(255,255,255,.45)">
            Keep the useful answers. Throw away the rest.
          </PresText>

          <div style={{
            display: "flex", flexDirection: "column", gap: 14,
            maxWidth: 500, width: "100%",
          }}>
            {kept.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                fontFamily: "'Fredoka',sans-serif", fontSize: 24,
                padding: "12px 22px", borderRadius: 16,
                background: `${color}15`, border: `2px solid ${color}50`,
                color: "white",
                animation: `fadeUp .4s ${i * 0.1}s ease both`,
              }}>
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                {item.q}
              </div>
            ))}
          </div>

          <PresText size={24} color="rgba(255,255,255,.4)">
            The word "bat" now <strong style={{ color }}>knows more</strong> about itself.
          </PresText>
        </PresSlide>
      );
    }

    /* Slide 3: Analogy summary */
    if (slide === 3) {
      return (
        <PresSlide>
          <PresText size={30}>
            <strong style={{ color }}>ATTENTION</strong> <span style={{ fontSize: 20, color: "rgba(255,255,255,.4)" }}>(words look at each other)</span>
            <br />= figuring out which words are related
          </PresText>
          <PresText size={30}>
            <strong style={{ color }}>MLP</strong> <span style={{ fontSize: 20, color: "rgba(255,255,255,.4)" }}>(asks questions about each word)</span>
            <br />= brainstorming everything you know, then keeping what fits
          </PresText>
          <PresText size={24} color="rgba(255,255,255,.45)">
            Every layer does both. Attention + MLP. Then passes the result to the next layer.
          </PresText>
        </PresSlide>
      );
    }
  }

  return (
    <div className="fade-up">
      <Label color={color} mode={mode} text="HOW AI THINKS · STEP 4" />
      <H1>The Thinking Layer</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {/* ── Step 0: Intro + MLP Diagram + Animation ── */}
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{
          fontSize: 22,
          color: "rgba(255,255,255,.75)",
          lineHeight: 1.6,
          textAlign: "center",
          maxWidth: 640,
          margin: "0 auto 32px",
        }}>
          Attention figured out <em>which words relate</em>. Now the MLP does the heavy thinking — connecting what it's reading to{" "}
          <strong style={{ color }}>everything it ever learned</strong>.
        </div>

        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            {layers.map((l, i, arr) => (
              <div key={l.label} style={{ display: "contents" }}>
                <div style={{ textAlign: "center", minWidth: 70 }}>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18, color: l.lit ? color : "rgba(255,255,255,.35)", marginBottom: 8, transition: "color .3s" }}>{l.label}</div>
                  <Nodes count={l.nodes} lit={l.lit} color={color} />
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,.3)", marginTop: 8, maxWidth: 80, lineHeight: 1.35 }}>{l.desc}</div>
                </div>
                {i < arr.length - 1 && <Arrow lit={phase >= i + 2} color={color} />}
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <button onClick={phase === 0 || phase === 4 ? run : undefined} disabled={running} className="cta-btn" style={{ background: color, color: "#000", fontSize: 20, margin: "0 auto", display: "inline-flex", alignItems: "center", gap: 6 }}>
              {running
                ? <><Lightning size={18} weight="duotone" /> Processing...</>
                : phase === 4 ? "▶ Run Again" : "▶ Fire it up!"}
            </button>
          </div>
        </Card>

        {step === 0 && hasRun && (
          <ContinueButton onClick={advance} color={color} label="What's the analogy?" />
        )}
      </div>

      {/* ── Step 1: Analogy Card + Trivia ── */}
      {step >= 1 && (
        <div
          ref={step1Ref}
          style={{
            animation: "fadeUp .5s ease",
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 24,
          }}
        >
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: "'Fredoka',sans-serif", color: "white", fontSize: 20, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Key size={22} weight="duotone" color={color} /> Analogy
            </div>
            <p style={{ color: "rgba(255,255,255,.7)", fontSize: 20, lineHeight: 1.7 }}>
              <strong style={{ color }}>Attention</strong> is reading the room — figuring out who's talking to whom.<br />
              <strong style={{ color }}>MLP</strong> is flipping through your entire memory to decide what it all means.
            </p>
          </Card>

          <TriviaBox mode={mode} visible={true} color={color} number="49,152" label="neurons in the hidden layer"
            fact="The MLP hidden layer is 4× the size of the input — giving the model enormous room to think before passing signals on to the next layer." />
        </div>
      )}
    </div>
  );
}
