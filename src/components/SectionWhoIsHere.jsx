import { useState, useEffect, useRef } from "react";
import {
  SpeakerHigh,
  FilmSlate,
  GameController,
  Camera,
  ChatCircleDots,
  MusicNotes,
  MagnifyingGlass,
  SmileyWink,
  Sparkle,
  ArrowDown,
} from "@phosphor-icons/react";
import { Card, Label, H1, TeacherNote, PresSlide, PresText } from "./shared";

/* ── Movie-credits "A.I." cycling text ── */
/* Pick a TAKE: 1 = typewriter reveal, 2 = slow crossfade, 3 = glitch/flicker */
const ACTIVE_TAKE = 1; // ← change to 1, 2, or 3 to preview

const AI_LINES = [
  "A . I .",
  "Artificial Intelligence",
  "Synthetic Smarts",
  "Machine Thinking",
  "Digital Brainpower",
  "Computer Reasoning",
  "Artificial Intelligence",
];

const CREDIT_COLORS = ["#00f5d4", "#00bbf9", "#fee440", "#f15bb5", "#9b5de5", "#fb5607", "#06d6a0"];

/* ── Typewriter sound FX via Web Audio API (no files needed) ── */
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

function playTypeClick() {
  try {
    const ctx = getAudioCtx();
    // Short percussive click — like a mechanical key strike
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = "square";
    osc.frequency.setValueAtTime(1800 + Math.random() * 600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.03);
    filter.type = "highpass";
    filter.frequency.value = 800;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch (_) { /* audio not available */ }
}

function playEraseClick() {
  try {
    const ctx = getAudioCtx();
    // Softer, lower tick for backspace
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.02);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  } catch (_) { /* audio not available */ }
}

function playLineComplete() {
  try {
    const ctx = getAudioCtx();
    // Subtle "ding" when a line finishes typing
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch (_) { /* audio not available */ }
}

/* ────────────────────────────────────────────────
   TAKE 1 — Typewriter
   Letters punch in one-by-one like an old film title card,
   then the whole line wipes away before the next.
   ──────────────────────────────────────────────── */
function Take1Typewriter({ color }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [phase, setPhase] = useState("typing"); // typing | hold | erasing
  const line = AI_LINES[lineIdx];
  const settled = lineIdx === AI_LINES.length - 1 && phase === "hold";
  const creditColor = CREDIT_COLORS[lineIdx % CREDIT_COLORS.length];
  const prevCharCount = useRef(0);

  // Play sounds when charCount changes
  useEffect(() => {
    if (charCount > prevCharCount.current && phase === "typing") {
      // Skip sound for spaces — feels more natural
      if (line[charCount - 1] !== " ") playTypeClick();
    } else if (charCount < prevCharCount.current && phase === "erasing") {
      playEraseClick();
    }
    prevCharCount.current = charCount;
  }, [charCount, phase, line]);

  useEffect(() => {
    if (settled) return;
    let timer;
    if (phase === "typing") {
      if (charCount < line.length) {
        timer = setTimeout(() => setCharCount(c => c + 1), 45);
      } else {
        playLineComplete();
        timer = setTimeout(() => setPhase("hold"), 100);
      }
    } else if (phase === "hold") {
      timer = setTimeout(() => setPhase("erasing"), lineIdx === 0 ? 1200 : 800);
    } else if (phase === "erasing") {
      if (charCount > 0) {
        timer = setTimeout(() => setCharCount(c => c - 1), 25);
      } else {
        timer = setTimeout(() => {
          setLineIdx(i => i + 1);
          setPhase("typing");
        }, 300);
      }
    }
    return () => clearTimeout(timer);
  }, [phase, charCount, lineIdx, line.length, settled]);

  const displayed = line.slice(0, charCount);
  const cursorVisible = !settled;

  return (
    <div style={{
      textAlign: "center", marginBottom: 24, minHeight: 80,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: lineIdx === 0 ? 68 : 48,
        fontWeight: 700,
        color: settled ? color : creditColor,
        letterSpacing: lineIdx === 0 ? 14 : 3,
        whiteSpace: "nowrap",
      }}>
        {displayed}
        {cursorVisible && (
          <span style={{
            display: "inline-block", width: 3, height: "0.85em",
            background: creditColor, marginLeft: 4, verticalAlign: "middle",
            animation: "cursorBlink .6s step-end infinite",
          }} />
        )}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────
   TAKE 2 — Slow cinematic crossfade
   One line dissolves into the next with a smooth,
   almost dreamy opacity blend — like opening titles
   on a Fincher or Nolan film.
   ──────────────────────────────────────────────── */
function Take2Crossfade({ color }) {
  const [index, setIndex] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [fading, setFading] = useState("in"); // in | hold | out
  const settled = index === AI_LINES.length - 1 && fading === "hold";
  const creditColor = CREDIT_COLORS[index % CREDIT_COLORS.length];

  useEffect(() => {
    if (settled) return;
    let raf;
    const start = performance.now();
    const duration = fading === "in" ? 900 : fading === "out" ? 700 : 0;

    if (fading === "hold") {
      const timer = setTimeout(() => setFading("out"), index === 0 ? 1400 : 1000);
      return () => clearTimeout(timer);
    }

    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
      setOpacity(fading === "in" ? eased : 1 - eased);
      if (t < 1) {
        raf = requestAnimationFrame(animate);
      } else if (fading === "in") {
        setOpacity(1);
        setFading("hold");
      } else {
        setOpacity(0);
        setIndex(i => i + 1);
        setFading("in");
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [fading, index, settled]);

  const line = AI_LINES[index];

  return (
    <div style={{
      textAlign: "center", marginBottom: 24, minHeight: 80,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: index === 0 ? 68 : 48,
        fontWeight: 700,
        color: settled ? color : creditColor,
        letterSpacing: index === 0 ? 14 : 3,
        opacity,
        whiteSpace: "nowrap",
        filter: `blur(${(1 - opacity) * 4}px)`,
        transform: `scale(${0.96 + opacity * 0.04})`,
      }}>
        {line}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────
   TAKE 3 — Glitch / digital flicker
   Text glitches in with a VHS-style scramble effect,
   holds steady, then glitches out. Edgy, cyberpunk vibe.
   ──────────────────────────────────────────────── */
const GLITCH_CHARS = "█▓▒░╔╗╚╝━┃◆◇■□▲△●○☆★";

function Take3Glitch({ color }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [phase, setPhase] = useState("glitchIn"); // glitchIn | hold | glitchOut
  const [display, setDisplay] = useState("");
  const frameRef = useRef(null);
  const line = AI_LINES[lineIdx];
  const settled = lineIdx === AI_LINES.length - 1 && phase === "hold";
  const creditColor = CREDIT_COLORS[lineIdx % CREDIT_COLORS.length];

  useEffect(() => {
    if (settled) { setDisplay(line); return; }
    let raf;
    const start = performance.now();
    const glitchDuration = 600;

    if (phase === "hold") {
      setDisplay(line);
      const timer = setTimeout(() => setPhase("glitchOut"), lineIdx === 0 ? 1200 : 800);
      return () => clearTimeout(timer);
    }

    const animate = (now) => {
      const t = Math.min((now - start) / glitchDuration, 1);
      const progress = phase === "glitchIn" ? t : 1 - t;
      const resolved = Math.floor(progress * line.length);
      let result = "";
      for (let i = 0; i < line.length; i++) {
        if (i < resolved) {
          result += line[i];
        } else if (line[i] === " ") {
          result += " ";
        } else {
          result += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
      }
      setDisplay(result);

      if (t < 1) {
        raf = requestAnimationFrame(animate);
      } else if (phase === "glitchIn") {
        setDisplay(line);
        setPhase("hold");
      } else {
        setLineIdx(i => i + 1);
        setPhase("glitchIn");
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [phase, lineIdx, line, settled]);

  const jitter = phase !== "hold" && !settled;

  return (
    <div style={{
      textAlign: "center", marginBottom: 24, minHeight: 80,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: lineIdx === 0 ? 68 : 48,
        fontWeight: 700,
        color: settled ? color : creditColor,
        letterSpacing: lineIdx === 0 ? 14 : 3,
        whiteSpace: "nowrap",
        textShadow: jitter
          ? `${Math.random() * 4 - 2}px 0 ${creditColor}, ${Math.random() * -4 + 2}px 0 #f15bb5`
          : "none",
      }}>
        {display}
      </span>
    </div>
  );
}

/* ── Switcher: set ACTIVE_TAKE at the top to preview ── */
function AICreditsCycler({ color }) {
  if (ACTIVE_TAKE === 1) return <Take1Typewriter color={color} />;
  if (ACTIVE_TAKE === 2) return <Take2Crossfade color={color} />;
  if (ACTIVE_TAKE === 3) return <Take3Glitch color={color} />;
  return <Take1Typewriter color={color} />;
}

/* ── Claude talks on the surprise slide ── */
const CLAUDE_LINE = "Surprise! You already use AI every single day. Let me show you.";

function ClaudeSpeaks({ color }) {
  const [charIdx, setCharIdx] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const spokenRef = useRef(false);

  // Speak aloud via SpeechSynthesis
  useEffect(() => {
    if (spokenRef.current) return;
    spokenRef.current = true;
    const synth = window.speechSynthesis;
    if (!synth) return;
    // Small delay so the slide transition lands first
    const timer = setTimeout(() => {
      const utter = new SpeechSynthesisUtterance(CLAUDE_LINE);
      utter.rate = 0.95;
      utter.pitch = 1.05;
      // Try to pick a good voice
      const voices = synth.getVoices();
      const preferred = voices.find(v =>
        /samantha|karen|daniel|google.*us|english.*female/i.test(v.name)
      );
      if (preferred) utter.voice = preferred;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      synth.speak(utter);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Typewriter the text in sync
  useEffect(() => {
    if (charIdx >= CLAUDE_LINE.length) return;
    const timer = setTimeout(() => setCharIdx(c => c + 1), 35);
    return () => clearTimeout(timer);
  }, [charIdx]);

  const displayed = CLAUDE_LINE.slice(0, charIdx);

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 16,
      marginBottom: 28,
      animation: "fadeUp .4s ease both",
    }}>
      {/* Claude avatar */}
      <div style={{
        width: 52, height: 52, borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}, #9b5de5)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: speaking ? `0 0 18px ${color}66` : "none",
        transition: "box-shadow .3s ease",
      }}>
        <span style={{ fontSize: 24, lineHeight: 1 }}>✦</span>
      </div>
      {/* Speech bubble */}
      <div style={{
        background: "rgba(255,255,255,.08)",
        border: "1px solid rgba(255,255,255,.15)",
        borderRadius: "4px 18px 18px 18px",
        padding: "16px 22px",
        flex: 1,
        position: "relative",
      }}>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 11,
          fontWeight: 600,
          color: color,
          textTransform: "uppercase",
          letterSpacing: 2,
          marginBottom: 6,
        }}>
          Claude
          {speaking && (
            <span style={{
              display: "inline-block",
              width: 8, height: 8,
              borderRadius: "50%",
              background: color,
              marginLeft: 8,
              verticalAlign: "middle",
              animation: "cursorBlink .5s step-end infinite",
            }} />
          )}
        </div>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 28,
          color: "white",
          lineHeight: 1.4,
          minHeight: 40,
        }}>
          {displayed}
          {charIdx < CLAUDE_LINE.length && (
            <span style={{
              display: "inline-block", width: 2, height: "0.8em",
              background: "white", marginLeft: 2, verticalAlign: "middle",
              animation: "cursorBlink .5s step-end infinite",
            }} />
          )}
        </div>
      </div>
    </div>
  );
}

const examples = [
  { Icon: SpeakerHigh,     label: "Siri or Alexa",       desc: "Voice assistants" },
  { Icon: FilmSlate,       label: "Netflix / YouTube",   desc: "Video suggestions" },
  { Icon: GameController,  label: "Video games",         desc: "Opponent AI & NPCs" },
  { Icon: Camera,          label: "Phone camera",        desc: "Face recognition" },
  { Icon: ChatCircleDots,  label: "ChatGPT / Claude",    desc: "Chatbots" },
  { Icon: MusicNotes,      label: "Spotify",             desc: "Music suggestions" },
  { Icon: MagnifyingGlass, label: "Google Search",       desc: "Search predictions" },
  { Icon: SmileyWink,      label: "Snapchat / TikTok",   desc: "Face filters & FYP" },
];

const notes = [
  "Start with a show of hands: 'Raise your hand if you've ever talked to Siri, Alexa, or Google.' Most hands should go up immediately.",
  "Then: 'Keep your hand up if YouTube or Netflix has ever suggested something you actually liked.' This almost always gets every hand up — great moment to say that's AI at work.",
  "Don't pressure kids to define AI yet. You're just warming up and surfacing their existing experience. Accept all answers.",
  "Common misconceptions at this stage: kids often think AI only means robots or sci-fi computers. Reassure them the boring helpful everyday stuff counts too.",
  "If nobody raises their hand at first, try: 'Has anyone ever been recommended a song, video, or game by an app?' That usually unlocks it.",
];

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

export default function SectionWhoIsHere({ color, mode, slide }) {
  /* ── Presentation mode ── */
  if (mode === "presentation") {
    if (slide === 0) {
      return (
        <PresSlide>
          <div className="fade-up">
            <AICreditsCycler color={color} />
            <PresText size={52}>
              Have <span style={{ color }}>YOU</span> ever used AI?
            </PresText>
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 30,
              color: "rgba(255,255,255,.4)",
              fontStyle: "italic",
              textAlign: "center",
              lineHeight: 1.5,
              marginTop: 16,
            }}>
              Raise your hand if you've ever used AI — or think you might have!
            </div>
          </div>
        </PresSlide>
      );
    }
    if (slide === 1) {
      return (
        <PresSlide>
          <div className="fade-up" style={{ width: "100%", maxWidth: 800 }}>
            <ClaudeSpeaks color={color} />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 16,
                width: "100%",
              }}
            >
              {examples.map((e, i) => (
                <Card
                  key={i}
                  style={{
                    padding: "20px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    textAlign: "center",
                    animation: `fadeUp .4s ${(i * 0.08) + 0.6}s ease both`,
                  }}
                >
                  <e.Icon size={44} weight="duotone" color={color} />
                  <div style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "white",
                  }}>
                    {e.label}
                  </div>
                  <div style={{
                    fontSize: 20,
                    color: "rgba(255,255,255,.4)",
                  }}>
                    {e.desc}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </PresSlide>
      );
    }
    if (slide === 2) {
      return (
        <PresSlide>
          <div className="fade-up" style={{ textAlign: "center" }}>
            <Sparkle size={52} weight="duotone" color={color} style={{ marginBottom: 16 }} />
            <PresText size={48} color={color}>
              AI is already everywhere!
            </PresText>
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 28,
              color: "rgba(255,255,255,.4)",
              lineHeight: 1.6,
              marginTop: 16,
              maxWidth: 700,
            }}>
              In your phone, your TV, your games. And today you're going to find out{" "}
              <strong style={{ color }}>exactly how it works!</strong>
            </div>
          </div>
        </PresSlide>
      );
    }
    return null;
  }

  const [step, setStep] = useState(0);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);

  const advance = () => {
    if (step < 2) setStep(s => s + 1);
  };

  // Keyboard: down arrow advances steps
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (step < 2) {
          advance();
        } else {
          window.dispatchEvent(new Event("sectionFullyRevealed"));
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step]);

  // Auto-scroll to newly revealed step
  useEffect(() => {
    const target = step === 1 ? step1Ref.current : step === 2 ? step2Ref.current : null;
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [step]);

  return (
    <div className="fade-up">
      <Label color={color} mode={mode} text="INTRODUCTION · WARM UP" />
      <H1>Who's Already Used AI?</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {/* ── Step 0: Big question ── */}
      <div style={{ minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <AICreditsCycler color={color} />
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 30,
          color: "white",
          textAlign: "center",
          lineHeight: 1.4,
          marginBottom: 16,
        }}>
          Have <strong style={{ color }}>YOU</strong> ever used AI?
        </div>

        <div style={{
          fontSize: 20,
          color: "rgba(255,255,255,.4)",
          textAlign: "center",
          fontStyle: "italic",
        }}>
          Raise your hand if you've ever used AI — or think you might have!
        </div>

        {step === 0 && (
          <ContinueButton onClick={advance} color={color} label="Let's find out" />
        )}
      </div>

      {/* ── Step 1: Grid of AI examples ── */}
      {step >= 1 && (
        <div
          ref={step1Ref}
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
            fontSize: 26,
            color: "white",
            textAlign: "center",
            marginBottom: 20,
          }}>
            Here's something surprising — look at everything that already uses AI:
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 24,
          }}>
            {examples.map((e, i) => (
              <Card
                key={i}
                style={{
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  animation: `fadeUp .3s ${i * 0.05}s ease both`,
                }}
              >
                <e.Icon size={36} weight="duotone" color={color} />
                <div>
                  <div style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 18,
                    color: "white",
                  }}>
                    {e.label}
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,.4)" }}>
                    {e.desc}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {step === 1 && (
            <ContinueButton onClick={advance} color={color} label="What do these have in common?" />
          )}
        </div>
      )}

      {/* ── Step 2: AI is everywhere insight ── */}
      {step >= 2 && (
        <div
          ref={step2Ref}
          style={{
            animation: "fadeUp .5s ease",
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 24,
          }}
        >
          <Sparkle size={52} weight="duotone" color={color} style={{ marginBottom: 16 }} />

          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 30,
            color,
            textAlign: "center",
            marginBottom: 16,
          }}>
            AI is already everywhere!
          </div>

          <p style={{
            fontSize: 22,
            color: "rgba(255,255,255,.65)",
            lineHeight: 1.65,
            textAlign: "center",
            maxWidth: 600,
          }}>
            AI isn't just robots in movies. It's already all around you — in your phone, your TV, your games. And today you're going to find out{" "}
            <strong style={{ color }}>exactly how it works!</strong>
          </p>
        </div>
      )}
    </div>
  );
}
