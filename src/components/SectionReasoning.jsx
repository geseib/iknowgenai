import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowDown,
  Brain,
  CaretDown,
  CaretUp,
  Question,
  Lightbulb,
  Flask,
  Eye,
  CheckCircle,
  Lightning,
  Sparkle,
  BookOpen,
  PencilSimpleLine,
  ArrowRight,
} from "@phosphor-icons/react";
import { Card, Label, H1, Body, TriviaBox, TeacherNote, PresSlide, PresText } from "./shared";
import { useGrade } from "../data/GradeContext";

// ── Grade-differentiated content ──

const SCIENCE_STEPS = {
  "K-2": [
    { icon: Question, label: "Wonder", text: "Does talking to plants help them grow?", color: "#00bbf9" },
    { icon: Lightbulb, label: "Guess", text: "I think yes, because sound is like tiny shakes!", color: "#fee440" },
    { icon: Flask, label: "Try it", text: "Talk to one plant every day. Leave the other alone.", color: "#f15bb5" },
  ],
  "3-5": [
    { icon: Question, label: "Question", text: "Does talking to plants help them grow?", color: "#00bbf9" },
    { icon: Lightbulb, label: "Hypothesis", text: "I think the sound vibrations might help plants grow taller.", color: "#fee440" },
    { icon: Flask, label: "Experiment", text: "Get two identical plants. Talk to one for 10 minutes a day. Same water, same light.", color: "#f15bb5" },
    { icon: Eye, label: "Observe", text: "After 4 weeks, measure both plants carefully.", color: "#9b5de5" },
    { icon: CheckCircle, label: "Conclude", text: "Compare results. Was your hypothesis right?", color: "#06d6a0" },
  ],
  "7-8": [
    { icon: Question, label: "Question", text: "Does talking to plants help them grow?", color: "#00bbf9" },
    { icon: Lightbulb, label: "Hypothesis", text: "Sound vibrations may stimulate cell growth, leading to taller plants.", color: "#fee440" },
    { icon: Flask, label: "Experiment", text: "Two identical plants, same soil, water, and light. One gets 10 min of talking daily. Control gets silence.", color: "#f15bb5" },
    { icon: Eye, label: "Observe", text: "Measure height weekly for 4 weeks. Record any visible differences.", color: "#9b5de5" },
    { icon: CheckCircle, label: "Conclude", text: "Analyze data. Consider alternative explanations (CO2 from breathing, extra attention).", color: "#06d6a0" },
  ],
};

const THINKING_TEXT = {
  "K-2": [
    "Hmm, plants need sun and water to grow...",
    "Plants don't have ears, so they can't really hear...",
    "But sound makes tiny vibrations in the air!",
    "Maybe those vibrations help a tiny bit...",
    "Also, people who talk to plants probably water them more!",
  ],
  "3-5": [
    "Let me think through this step by step...",
    "First, what do plants need to grow? Water, sunlight, carbon dioxide, and nutrients from soil.",
    "Plants don't have ears or a nervous system, so they can't \"hear\" the way we do.",
    "But wait — sound is vibrations. Some research has shown that vibrations CAN affect plant cells.",
    "However, when people talk to plants, they also breathe on them. That extra CO2 might be the real helper!",
    "Simpler explanation: people who talk to their plants probably just take better care of them.",
    "So: vibrations might help a tiny bit, but mostly it's that attentive plant owners are better gardeners.",
  ],
  "7-8": [
    "Let me think through this carefully...",
    "Plants need water, sunlight, CO2, and soil nutrients. They don't have ears or a nervous system.",
    "But sound is mechanical vibrations. A 2018 study found plants exposed to certain frequencies grew slightly taller.",
    "Confounding variable: talking means exhaling CO2 onto leaves. The growth boost might be from CO2, not sound.",
    "Selection bias: people who talk to plants are probably more attentive gardeners overall.",
    "This is a classic correlation vs. causation problem. You'd need to control for CO2 and attention.",
    "Conclusion: weak evidence for sound vibrations, but \"talking\" is mostly a proxy for \"paying attention.\"",
  ],
};

const ANSWER_TEXT = {
  "K-2": "Talking to plants might help a tiny bit because of the vibrations, but mostly people who talk to their plants just take better care of them!",
  "3-5": "Great question! While plants can't hear you, the vibrations from your voice might slightly help their cells, and your breath gives them extra carbon dioxide. But the biggest reason \"talking to plants\" seems to work is probably that people who talk to their plants pay more attention to them and take better care of them!",
  "7-8": "The evidence suggests a small positive effect from sound vibrations on plant cell growth, but the dominant factor is likely caregiver attention bias. People who talk to their plants tend to be more attentive gardeners. The \"talking helps\" claim is a classic case of correlation mistaken for causation.",
};

const COMPARE_STEPS = {
  "K-2": [
    { human: "Wonder about something", ai: "Ask what it knows", icon: Question },
    { human: "Make a guess", ai: "Consider possibilities", icon: Lightbulb },
    { human: "Try it and see", ai: "Weigh the evidence", icon: CheckCircle },
  ],
  "3-5": [
    { human: "Ask a question", ai: "Identify what it knows", icon: Question },
    { human: "Form a hypothesis", ai: "Consider multiple possibilities", icon: Lightbulb },
    { human: "Run an experiment", ai: "Weigh evidence for and against", icon: Flask },
    { human: "Observe results", ai: "Notice complications", icon: Eye },
    { human: "Draw a conclusion", ai: "Give a balanced answer", icon: CheckCircle },
  ],
  "7-8": [
    { human: "Ask a question", ai: "Identify what it knows", icon: Question },
    { human: "Form a hypothesis", ai: "Consider multiple possibilities", icon: Lightbulb },
    { human: "Design a controlled experiment", ai: "Weigh evidence for and against", icon: Flask },
    { human: "Observe and record data", ai: "Notice confounding variables", icon: Eye },
    { human: "Analyze and conclude", ai: "Synthesize a nuanced answer", icon: CheckCircle },
  ],
};

const notes = [
  "Start by asking who has noticed AI 'thinking' before answering. Kids who use ChatGPT or Claude may have seen the thinking indicator. This is NOT just loading time.",
  "The plant question is deliberately fun and debatable. Let kids argue about it before showing the scientific method steps.",
  "KEY ANALOGY: The AI is still just predicting the next word, like always. It's been trained to write a 'rough draft chapter' before the 'final answer chapter' — like writing an essay where you brainstorm first. Same engine, different instructions.",
  "When the thinking block streams in, point out: every single word here was predicted one at a time, just like the story in Story Mash-Up. The AI didn't plan this thinking in advance — it wrote it word by word.",
  "The essay/chapters analogy is the 'aha' moment. The AI hasn't learned to 'think' — it's learned to write a PLANNING section before the answer section. Like a student who writes an outline before an essay.",
];

// ── CSS for animations ──
const sectionCSS = `
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .6; transform: scale(1.15); }
}
@keyframes thinkingGlow {
  0%, 100% { box-shadow: 0 0 8px var(--glow-color, #00bbf9)22, inset 0 0 4px var(--glow-color, #00bbf9)08; }
  50% { box-shadow: 0 0 20px var(--glow-color, #00bbf9)44, inset 0 0 10px var(--glow-color, #00bbf9)15; }
}
@keyframes typeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes chapterSlide {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes beamFlow {
  from { stroke-dashoffset: 60; }
  to { stroke-dashoffset: 0; }
}
`;

// ── Internal components ──

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

/** Animated thinking block that streams words in one by one */
function ThinkingBlock({ color, lines, autoStream = false, defaultOpen = false, onStreamDone }) {
  const [open, setOpen] = useState(defaultOpen);
  const [streamedLines, setStreamedLines] = useState(autoStream ? 0 : lines.length);
  const [streamedWords, setStreamedWords] = useState(autoStream ? 0 : 999);
  const [done, setDone] = useState(!autoStream && defaultOpen);
  const streamRef = useRef(null);

  // Stream words in when opened (or auto-stream on mount)
  useEffect(() => {
    if (!open && !autoStream) return;
    if (done) return;

    const allWords = lines.flatMap((line, li) =>
      line.split(" ").map((word, wi) => ({ li, wi, word }))
    );

    let wordIdx = 0;
    const tick = () => {
      if (wordIdx >= allWords.length) {
        setDone(true);
        if (onStreamDone) onStreamDone();
        return;
      }
      const { li, wi } = allWords[wordIdx];
      setStreamedLines(li + 1);
      setStreamedWords(wordIdx + 1);
      wordIdx++;
      // Vary speed: slower for first words of a line, faster in middle
      const delay = wi === 0 ? 120 : 45 + Math.random() * 30;
      streamRef.current = setTimeout(tick, delay);
    };

    // Small initial delay
    streamRef.current = setTimeout(tick, 300);
    return () => clearTimeout(streamRef.current);
  }, [open, autoStream, done]);

  // Count total words up to each line to know which words are visible
  const lineWordCounts = [];
  let cumulative = 0;
  for (const line of lines) {
    lineWordCounts.push(cumulative);
    cumulative += line.split(" ").length;
  }

  const handleToggle = () => {
    if (!open) {
      // Reset streaming when opening
      setStreamedLines(0);
      setStreamedWords(0);
      setDone(false);
    }
    setOpen(o => !o);
  };

  return (
    <div style={{
      background: "rgba(255,255,255,.03)",
      border: `1.5px dashed ${color}40`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 14,
      padding: "16px 18px",
      marginBottom: 16,
      "--glow-color": color,
      animation: !open ? `thinkingGlow 2.5s ease-in-out infinite` : "none",
      transition: "box-shadow .4s ease",
    }}>
      <button
        onClick={handleToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          width: "100%",
        }}
      >
        <Brain
          size={24}
          weight="duotone"
          color={color}
          style={{ animation: open ? "none" : "pulse 2s ease-in-out infinite" }}
        />
        <span style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 16,
          color: open ? "rgba(255,255,255,.6)" : color,
          transition: "color .3s ease",
        }}>
          {open ? "AI's thinking" : "AI's thinking… (tap to peek inside)"}
        </span>
        <span style={{ marginLeft: "auto", color: "rgba(255,255,255,.35)" }}>
          {open ? <CaretUp size={16} /> : <CaretDown size={16} />}
        </span>
      </button>
      {open && (
        <div style={{ marginTop: 14 }}>
          {lines.map((line, li) => {
            if (li >= streamedLines) return null;
            const words = line.split(" ");
            const lineStart = lineWordCounts[li];
            return (
              <div key={li} style={{
                fontSize: 14,
                color: "rgba(255,255,255,.45)",
                lineHeight: 1.7,
                paddingLeft: 12,
                marginBottom: li < lines.length - 1 ? 10 : 0,
                borderLeft: `2px solid ${color}20`,
                fontFamily: "'Courier New', Courier, monospace",
              }}>
                {words.map((word, wi) => {
                  const globalIdx = lineStart + wi;
                  const visible = globalIdx < streamedWords;
                  return (
                    <span key={wi} style={{
                      opacity: visible ? 1 : 0,
                      transition: "opacity .15s ease",
                      display: "inline",
                    }}>
                      {wi > 0 ? " " : ""}{word}
                    </span>
                  );
                })}
                {/* Blinking cursor at the end of the last visible line */}
                {li === streamedLines - 1 && streamedWords < cumulative && (
                  <span style={{
                    display: "inline-block",
                    width: 8,
                    height: 16,
                    background: color,
                    marginLeft: 2,
                    verticalAlign: "text-bottom",
                    animation: "cursorBlink .6s step-end infinite",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Science step that animates in on a timed delay */
function ScienceStepCard({ step, index, revealed }) {
  const Icon = step.icon;
  if (!revealed) return null;
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
      padding: "14px 18px",
      background: `${step.color}10`,
      border: `1.5px solid ${step.color}35`,
      borderRadius: 14,
      animation: "popIn .4s cubic-bezier(.34,1.56,.64,1) forwards",
      boxShadow: `0 0 12px ${step.color}15`,
    }}>
      <Icon size={24} weight="duotone" color={step.color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 14,
          color: step.color,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 4,
        }}>
          {step.label}
        </div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,.7)", lineHeight: 1.5 }}>
          {step.text}
        </div>
      </div>
    </div>
  );
}

/** Animated essay visualization showing Chapter 1 (thinking) → Chapter 2 (answer) */
function EssayDiagram({ color, phase }) {
  // phase 0: empty, 1: ch1 appears, 2: ch2 appears, 3: both glow
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      margin: "20px auto",
      maxWidth: 520,
    }}>
      {/* Chapter 1: Thinking */}
      <div style={{
        flex: 1,
        padding: "16px 14px",
        borderRadius: 12,
        background: phase >= 1 ? `${color}12` : "rgba(255,255,255,.03)",
        border: `2px ${phase >= 1 ? "solid" : "dashed"} ${phase >= 1 ? `${color}50` : "rgba(255,255,255,.1)"}`,
        opacity: phase >= 1 ? 1 : 0.3,
        transition: "all .5s ease",
        animation: phase === 1 ? "chapterSlide .5s ease" : "none",
        boxShadow: phase >= 3 ? `0 0 16px ${color}30` : "none",
        textAlign: "center",
      }}>
        <Brain size={22} weight="duotone" color={phase >= 1 ? color : "rgba(255,255,255,.2)"} style={{ marginBottom: 6 }} />
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 13,
          color: phase >= 1 ? color : "rgba(255,255,255,.25)",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 4,
        }}>
          Chapter 1
        </div>
        <div style={{
          fontSize: 14,
          color: phase >= 1 ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.2)",
          transition: "color .4s ease",
        }}>
          Outline & notes
        </div>
        {phase >= 1 && (
          <div style={{ marginTop: 8 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 3,
                borderRadius: 2,
                background: `${color}${i === 3 ? "20" : "30"}`,
                marginBottom: 4,
                width: `${70 + i * 10}%`,
                animation: `fadeUp .3s ${i * 0.1}s ease both`,
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Arrow */}
      <div style={{
        opacity: phase >= 2 ? 1 : 0.15,
        transition: "opacity .4s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}>
        <ArrowRight size={20} weight="bold" color={phase >= 2 ? color : "rgba(255,255,255,.2)"} />
        {phase >= 2 && (
          <div style={{
            fontSize: 10,
            color: "rgba(255,255,255,.3)",
            fontFamily: "'Fredoka',sans-serif",
          }}>
            then
          </div>
        )}
      </div>

      {/* Chapter 2: Answer */}
      <div style={{
        flex: 1,
        padding: "16px 14px",
        borderRadius: 12,
        background: phase >= 2 ? "rgba(6,214,160,.08)" : "rgba(255,255,255,.03)",
        border: `2px ${phase >= 2 ? "solid" : "dashed"} ${phase >= 2 ? "rgba(6,214,160,.4)" : "rgba(255,255,255,.1)"}`,
        opacity: phase >= 2 ? 1 : 0.3,
        transition: "all .5s ease",
        animation: phase === 2 ? "chapterSlide .5s ease" : "none",
        boxShadow: phase >= 3 ? "0 0 16px rgba(6,214,160,.25)" : "none",
        textAlign: "center",
      }}>
        <Lightning size={22} weight="duotone" color={phase >= 2 ? "#06d6a0" : "rgba(255,255,255,.2)"} style={{ marginBottom: 6 }} />
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 13,
          color: phase >= 2 ? "#06d6a0" : "rgba(255,255,255,.25)",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 4,
        }}>
          Chapter 2
        </div>
        <div style={{
          fontSize: 14,
          color: phase >= 2 ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.2)",
          transition: "color .4s ease",
        }}>
          The story
        </div>
        {phase >= 2 && (
          <div style={{ marginTop: 8 }}>
            {[1, 2].map(i => (
              <div key={i} style={{
                height: 3,
                borderRadius: 2,
                background: `rgba(6,214,160,${i === 2 ? ".15" : ".25"})`,
                marginBottom: 4,
                width: `${80 + i * 8}%`,
                animation: `fadeUp .3s ${i * 0.1 + 0.2}s ease both`,
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main section component ──

export default function SectionReasoning({ color, mode, slide }) {
  const grade = useGrade();
  const [step, setStep] = useState(0);
  const [scienceRevealed, setScienceRevealed] = useState(0);
  const [diagramPhase, setDiagramPhase] = useState(0);
  const [thinkingDone, setThinkingDone] = useState(false);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);

  const scienceSteps = SCIENCE_STEPS[grade] || SCIENCE_STEPS["3-5"];
  const thinkingLines = THINKING_TEXT[grade] || THINKING_TEXT["3-5"];
  const answerText = ANSWER_TEXT[grade] || ANSWER_TEXT["3-5"];
  const compareSteps = COMPARE_STEPS[grade] || COMPARE_STEPS["3-5"];
  const maxStep = 4;

  const advance = useCallback(() => {
    if (step < maxStep) setStep(s => s + 1);
  }, [step, maxStep]);

  // Staggered reveal of science steps: first at 30s, rest at 5s each (ArrowDown skips)
  useEffect(() => {
    if (step !== 1) return;
    setScienceRevealed(0);
    const delays = scienceSteps.map((_, i) => i === 0 ? 30000 : 30000 + i * 5000);
    const timers = delays.map((d, i) =>
      setTimeout(() => setScienceRevealed(i + 1), d)
    );
    return () => timers.forEach(clearTimeout);
  }, [step, scienceSteps.length]);

  // Animate essay diagram when step 3 appears
  useEffect(() => {
    if (step !== 3) return;
    setDiagramPhase(0);
    const t1 = setTimeout(() => setDiagramPhase(1), 400);
    const t2 = setTimeout(() => setDiagramPhase(2), 1200);
    const t3 = setTimeout(() => setDiagramPhase(3), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [step]);

  // Keyboard: ArrowDown — if science steps are still revealing, show the next one;
  // otherwise advance to the next step (or signal fully revealed).
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        // If we're on step 1 and science steps are still revealing, show next one
        if (step === 1 && scienceRevealed < scienceSteps.length) {
          setScienceRevealed(s => s + 1);
          return;
        }
        if (step < maxStep) {
          advance();
        } else {
          window.dispatchEvent(new Event("sectionFullyRevealed"));
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, advance, scienceRevealed, scienceSteps.length]);

  // Auto-scroll to newly revealed steps
  useEffect(() => {
    const refs = [null, step1Ref, step2Ref, step3Ref, step4Ref];
    const target = refs[step]?.current;
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [step]);

  // ── Presentation mode ──
  if (mode === "presentation") {
    // Slide 0: Hook
    if (slide === 0) {
      return (
        <PresSlide>
          <style>{sectionCSS}</style>
          <Brain size={64} weight="duotone" color={color} style={{ animation: "pulse 2s ease-in-out infinite" }} />
          <PresText color="white" size={42}>
            Have you noticed some AI seems to{" "}
            <strong style={{ color }}>think</strong> before it answers?
          </PresText>
          <PresText size={24} color="rgba(255,255,255,.45)">
            Not just loading... actually writing a plan first.
          </PresText>
        </PresSlide>
      );
    }

    // Slide 1: Scientific method steps
    if (slide === 1) {
      return (
        <PresSlide>
          <style>{sectionCSS}</style>
          <PresText color="white" size={36}>
            How would <strong style={{ color }}>you</strong> figure this out?
          </PresText>
          <PresText size={28} color={color}>
            "Does talking to plants help them grow?"
          </PresText>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640, width: "100%" }}>
            {scienceSteps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  fontFamily: "'Fredoka',sans-serif", fontSize: 22,
                  padding: "12px 20px", borderRadius: 14,
                  background: `${s.color}15`, border: `2px solid ${s.color}40`,
                  color: "white",
                  animation: `popIn .4s ${i * 0.2}s cubic-bezier(.34,1.56,.64,1) both`,
                  boxShadow: `0 0 12px ${s.color}20`,
                }}>
                  <Icon size={26} weight="duotone" color={s.color} />
                  <span style={{ color: s.color, minWidth: 100 }}>{s.label}</span>
                  <span style={{ fontSize: 20, color: "rgba(255,255,255,.6)" }}>{s.text}</span>
                </div>
              );
            })}
          </div>
        </PresSlide>
      );
    }

    // Slide 2: AI thinking block (auto-streamed)
    if (slide === 2) {
      return (
        <PresSlide>
          <style>{sectionCSS}</style>
          <PresText color="white" size={36}>
            Now let's ask <strong style={{ color }}>AI</strong> the same question
          </PresText>
          <div style={{ maxWidth: 700, width: "100%", textAlign: "left" }}>
            <ThinkingBlock color={color} lines={thinkingLines} defaultOpen={true} autoStream={true} />
            <Card style={{ marginTop: 12 }}>
              <div style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: 14,
                color: `${color}bb`, letterSpacing: 2, textTransform: "uppercase",
                marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
              }}>
                <Lightning size={16} weight="duotone" color={color} /> Final answer
              </div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,.72)", lineHeight: 1.65 }}>
                {answerText}
              </div>
            </Card>
          </div>
        </PresSlide>
      );
    }

    // Slide 3: The essay analogy
    if (slide === 3) {
      return (
        <PresSlide>
          <style>{sectionCSS}</style>
          <PresText color="white" size={36}>
            But wait — it's still just <strong style={{ color }}>predicting the next word!</strong>
          </PresText>
          <EssayDiagram color={color} phase={3} />
          <PresText size={24} color="rgba(255,255,255,.5)">
            Same engine. It's just been trained to{" "}
            <strong style={{ color }}>write an outline, brainstorm ideas, and pick the best one</strong> — then{" "}
            <strong style={{ color: "#06d6a0" }}>write the story</strong>.
          </PresText>
          <PresText size={20} color="rgba(255,255,255,.3)">
            Like writing an outline, jotting notes on ideas, picking the best option, then writing the story.
          </PresText>
        </PresSlide>
      );
    }

    // Slide 4: Takeaway
    if (slide === 4) {
      return (
        <PresSlide>
          <style>{sectionCSS}</style>
          <PresText size={36} color="white">
            Reasoning models <strong style={{ color }}>plan before they answer</strong>
          </PresText>
          <PresText size={26} color="rgba(255,255,255,.5)">
            Not a new kind of intelligence — just a new kind of <strong style={{ color }}>instruction</strong>.
          </PresText>
          <PresText size={26}>
            <span style={{ color }}>"Write your thinking first, then your answer."</span>
          </PresText>
        </PresSlide>
      );
    }

    // Slide 5: Deeper dive (7-8 only)
    if (slide === 5) {
      return (
        <PresSlide>
          <style>{sectionCSS}</style>
          <PresText size={32} color="white">
            The <strong style={{ color }}>thinking chapter</strong> has a cost
          </PresText>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640, width: "100%" }}>
            {[
              { label: "Thinking tokens", desc: "The outline & notes chapter generates hundreds of hidden words — real computation you don't see", icon: Brain },
              { label: "Extra time & cost", desc: "More tokens = more time, more money, more electricity", icon: Lightning },
              { label: "Trained with rewards", desc: "These models got 'rewards' during training for producing good reasoning chains", icon: Sparkle },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "14px 20px", borderRadius: 14,
                  background: `${color}10`, border: `1.5px solid ${color}30`,
                  animation: `popIn .4s ${i * 0.15}s cubic-bezier(.34,1.56,.64,1) both`,
                  boxShadow: `0 0 10px ${color}15`,
                }}>
                  <Icon size={24} weight="duotone" color={color} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18, color: "white", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 16, color: "rgba(255,255,255,.55)", lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <PresText size={20} color="rgba(255,255,255,.35)">
            Models like <strong>o1</strong>, <strong>o3</strong> and <strong>Claude</strong> with extended thinking use this approach
          </PresText>
        </PresSlide>
      );
    }
  }

  // ── Interactive mode (student / classroom) ──
  return (
    <div className="fade-up">
      <style>{sectionCSS}</style>
      <Label color={color} mode={mode} text="HOW AI WRITES · REASONING" />
      <H1>Think First!</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {/* ── Step 0: Hook ── */}
      <div style={{
        minHeight: "55vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Brain size={52} weight="duotone" color={color} style={{
            marginBottom: 16,
            animation: "pulse 2s ease-in-out infinite",
            filter: `drop-shadow(0 0 12px ${color}44)`,
          }} />
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 28,
            color: "white",
            lineHeight: 1.35,
            maxWidth: 580,
            margin: "0 auto 16px",
          }}>
            Have you noticed some AI seems to{" "}
            <span style={{ color, textShadow: `0 0 20px ${color}44` }}>think</span> before it answers?
          </div>
          <Body>
            {grade === "K-2"
              ? "Some AI doesn't answer right away. It pauses first — like when you think really hard before answering a tough question!"
              : "Newer AI models don't just start typing immediately. They pause, work through the problem, and THEN give you an answer. Let's figure out what's actually happening."}
          </Body>
        </div>
        <ContinueButton onClick={advance} color={color} label="Let's investigate" />
      </div>

      {/* ── Step 1: Human Science (timed reveal) ── */}
      {step >= 1 && (
        <div
          ref={step1Ref}
          style={{
            animation: "fadeUp .5s ease",
            minHeight: "55vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 24,
          }}
        >
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 22,
            color: "white",
            textAlign: "center",
            marginBottom: 8,
          }}>
            How would <span style={{ color }}>you</span> figure this out?
          </div>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 18,
            color,
            textAlign: "center",
            marginBottom: 24,
            textShadow: `0 0 16px ${color}33`,
          }}>
            "Does talking to plants help them grow?"
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 560, margin: "0 auto", width: "100%" }}>
            {scienceSteps.map((s, i) => (
              <ScienceStepCard key={i} step={s} index={i} revealed={i < scienceRevealed} />
            ))}
          </div>

          {scienceRevealed >= scienceSteps.length && (
            <div style={{ animation: "fadeUp .4s ease" }}>
              <ContinueButton onClick={advance} color={color} label="Now ask AI the same question" />
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: AI Thinking Block (streaming) ── */}
      {step >= 2 && (
        <div
          ref={step2Ref}
          style={{
            animation: "fadeUp .5s ease",
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 24,
          }}
        >
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 22,
            color: "white",
            textAlign: "center",
            marginBottom: 20,
          }}>
            We asked AI: <span style={{ color }}>"Does talking to plants help them grow?"</span>
          </div>

          <div style={{ maxWidth: 600, margin: "0 auto", width: "100%" }}>
            <ThinkingBlock color={color} lines={thinkingLines} onStreamDone={() => setThinkingDone(true)} />

            {thinkingDone && (
              <Card style={{ boxShadow: "0 0 12px rgba(6,214,160,.12)", animation: "fadeUp .5s ease" }}>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: 12,
                  color: "#06d6a0bb", letterSpacing: 2, textTransform: "uppercase",
                  marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
                }}>
                  <Lightning size={16} weight="duotone" color="#06d6a0" /> Final answer
                </div>
                <div style={{ fontSize: 17, color: "rgba(255,255,255,.72)", lineHeight: 1.65 }}>
                  {answerText}
                </div>
              </Card>
            )}
          </div>

          {thinkingDone && (
            <div style={{ animation: "fadeUp .4s ease" }}>
              <ContinueButton onClick={advance} color={color} label="So what's really happening?" />
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: The Essay Analogy (animated diagram) ── */}
      {step >= 3 && (
        <div
          ref={step3Ref}
          style={{
            animation: "fadeUp .5s ease",
            minHeight: "55vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 24,
          }}
        >
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 22,
            color: "white",
            textAlign: "center",
            marginBottom: 8,
          }}>
            Here's the secret:
          </div>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 20,
            color: "rgba(255,255,255,.6)",
            textAlign: "center",
            marginBottom: 8,
            lineHeight: 1.5,
            maxWidth: 520,
            margin: "0 auto 8px",
          }}>
            {grade === "K-2"
              ? "The AI is still guessing the next word, just like always!"
              : "It's still just predicting the next word — the exact same thing we learned about in Predict!"}
          </div>

          <EssayDiagram color={color} phase={diagramPhase} />

          {diagramPhase >= 2 && (
            <div style={{ animation: "fadeUp .5s ease", textAlign: "center", maxWidth: 540, margin: "0 auto" }}>
              <Card style={{ padding: "20px 22px", borderColor: `${color}25` }}>
                <BookOpen size={28} weight="duotone" color={color} style={{ marginBottom: 8 }} />
                <div style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 18,
                  color: "white",
                  lineHeight: 1.5,
                  marginBottom: 8,
                }}>
                  {grade === "K-2"
                    ? <>It writes <span style={{ color }}>notes and ideas</span> first, then a <span style={{ color: "#06d6a0" }}>clean answer</span>.</>
                    : <>Think of it like writing a story. The AI has been trained to{" "}
                      <span style={{ color }}>write an outline, jot down ideas, and pick the best option</span> — then{" "}
                      <span style={{ color: "#06d6a0" }}>write the actual story</span>.</>
                  }
                </div>
                <div style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,.45)",
                  lineHeight: 1.5,
                }}>
                  {grade === "7-8"
                    ? "Same sentence-completion engine. Same next-word prediction. The model has just been trained — using reinforcement learning — to produce a planning section before the answer section."
                    : "Same word-by-word prediction. The model has just learned to plan first, then answer."}
                </div>
              </Card>
            </div>
          )}

          {diagramPhase >= 3 && (
            <div style={{ animation: "fadeUp .4s .3s ease both" }}>
              <ContinueButton onClick={advance} color={color} label="The big picture" />
            </div>
          )}
        </div>
      )}

      {/* ── Step 4: Takeaway ── */}
      {step >= 4 && (
        <div
          ref={step4Ref}
          style={{
            animation: "fadeUp .5s ease",
            minHeight: "45vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 24,
          }}
        >
          <Card style={{
            textAlign: "center",
            padding: "28px 24px",
            marginBottom: 16,
            borderColor: `${color}20`,
            boxShadow: `0 0 24px ${color}12`,
          }}>
            <PencilSimpleLine size={32} weight="duotone" color={color} style={{ marginBottom: 12 }} />
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 24,
              color: "white",
              lineHeight: 1.4,
              marginBottom: 12,
            }}>
              Reasoning models <span style={{ color }}>plan before they answer</span>
            </div>
            <div style={{
              fontSize: 17,
              color: "rgba(255,255,255,.5)",
              lineHeight: 1.6,
              maxWidth: 460,
              margin: "0 auto",
            }}>
              Not a new kind of intelligence. Same next-word prediction. Just a new instruction:{" "}
              <em style={{ color }}>"Write your thinking first, then your answer."</em>
            </div>
          </Card>

          {/* Quick side-by-side */}
          <div style={{
            display: "flex",
            gap: 12,
            maxWidth: 540,
            margin: "0 auto 16px",
            width: "100%",
            flexWrap: "wrap",
          }}>
            <Card style={{
              flex: "1 1 240px",
              textAlign: "center",
              padding: "14px",
              animation: "popIn .4s cubic-bezier(.34,1.56,.64,1) both",
            }}>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1.5 }}>Regular AI</div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,.6)" }}>Question <ArrowRight size={14} style={{ verticalAlign: "middle", margin: "0 4px" }} /> Answer</div>
            </Card>
            <Card style={{
              flex: "1 1 240px",
              textAlign: "center",
              padding: "14px",
              borderColor: `${color}25`,
              animation: "popIn .4s .15s cubic-bezier(.34,1.56,.64,1) both",
            }}>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 13, color, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1.5 }}>Reasoning AI</div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,.6)" }}>
                Question <ArrowRight size={14} style={{ verticalAlign: "middle", margin: "0 4px" }} />{" "}
                <span style={{ color }}>Think</span> <ArrowRight size={14} style={{ verticalAlign: "middle", margin: "0 4px" }} /> Answer
              </div>
            </Card>
          </div>

          <TriviaBox
            mode={mode}
            visible={true}
            color={color}
            number="100,000+"
            label="thinking tokens on hard problems"
            fact={grade === "K-2"
              ? "On a really hard question, the AI might write a whole book of thinking before giving you one short answer!"
              : "On a tough math or coding problem, a reasoning model might generate over 100,000 hidden tokens of thinking — that's a short novel — before producing a few sentences of final answer. Same word-by-word process, just a much longer rough draft."}
          />
        </div>
      )}
    </div>
  );
}
