import { useState, useEffect, useRef } from "react";
import {
  Lightning,
  SpeakerHigh,
  ArrowClockwise,
  UserCircle,
  Eye,
  EyeSlash,
  Sparkle,
  MagicWand,
} from "@phosphor-icons/react";
import { Card, Label, H1, TeacherNote, PresSlide, PresText } from "./shared";

/* ── Prompts by slot ── */
const SLOT_CONFIG = [
  {
    label: "Player 1",
    prompt: "a character",
    placeholder: "e.g. a talking pizza, a shy robot, grandma…",
    color: "#00f5d4",
  },
  {
    label: "Player 2",
    prompt: "a place",
    placeholder: "e.g. the moon, a giant shoe, underwater…",
    color: "#00bbf9",
  },
  {
    label: "Player 3",
    prompt: "something that happens",
    placeholder: "e.g. everything turns to jello, it rains cats…",
    color: "#f15bb5",
  },
];

const notes = [
  "This is a pure engagement hook — no teaching yet, just wonder. Let the kids experience what AI can do before explaining how.",
  "Pick 3 volunteers. Have each type their answer on the projector keyboard (or whisper it to you to type). The key is the other kids DON'T see what each person entered until the reveal.",
  "If kids are shy, offer funny suggestions: 'a dancing taco', 'on the surface of the sun', 'gravity reverses'. The sillier the better.",
  "After the story is read aloud, ask: 'How did the computer know how to make a story from those random things?' Don't answer — just let the question hang. You'll come back to it.",
  "You can run this 2-3 times if the class is loving it. Each round takes about 90 seconds.",
];

/* ── Lightning bolt SVG that strikes from inputs to story ── */
function LightningBolt({ firing, color }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      height: firing ? 80 : 40,
      transition: "height .3s ease",
      overflow: "visible",
      position: "relative",
    }}>
      {firing && (
        <svg width="60" height="80" viewBox="0 0 60 80" style={{ animation: "boltStrike .5s ease forwards" }}>
          <path
            d="M30 0 L20 30 L35 30 L15 80 L25 45 L10 45 L30 0"
            fill={color}
            opacity="0.95"
            filter="url(#glow)"
          />
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>
      )}
      {!firing && (
        <div style={{
          width: 2, height: 40,
          background: "rgba(255,255,255,.1)",
          borderRadius: 2,
        }} />
      )}
    </div>
  );
}

/* ── Input slot with secret mode ── */
function SecretInput({ config, value, onChange, locked, revealed, onReveal }) {
  const [hidden, setHidden] = useState(true);

  return (
    <Card style={{
      padding: "16px 18px",
      borderColor: revealed ? `${config.color}60` : "rgba(255,255,255,.09)",
      background: revealed ? `${config.color}10` : "rgba(255,255,255,.05)",
      transition: "all .4s ease",
      flex: 1,
      minWidth: 200,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <UserCircle size={22} weight="duotone" color={config.color} />
          <span style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: config.color,
          }}>
            {config.label}
          </span>
        </div>
        {!locked && value && (
          <button
            onClick={() => setHidden(h => !h)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center",
            }}
          >
            {hidden ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      <div style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: 12,
        color: "rgba(255,255,255,.4)",
        marginBottom: 8,
      }}>
        Enter {config.prompt}:
      </div>

      {!locked ? (
        <input
          type={hidden ? "password" : "text"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={config.placeholder}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: `1px solid ${config.color}40`,
            background: "rgba(0,0,0,.3)",
            color: "white",
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 16,
            outline: "none",
          }}
        />
      ) : (
        <div style={{
          padding: "10px 14px",
          borderRadius: 10,
          background: revealed ? `${config.color}15` : "rgba(0,0,0,.3)",
          border: `1px solid ${revealed ? config.color + "60" : "rgba(255,255,255,.1)"}`,
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 18,
          fontWeight: 600,
          color: revealed ? config.color : "rgba(255,255,255,.2)",
          minHeight: 42,
          transition: "all .4s ease",
          animation: revealed ? "popIn .4s cubic-bezier(.34,1.56,.64,1) forwards" : "none",
        }}>
          {revealed ? value : "● ● ● ● ●"}
        </div>
      )}
    </Card>
  );
}

/* ── Main component ── */
export default function SectionStoryMash({ color, mode, slide }) {
  const [inputs, setInputs] = useState(["", "", ""]);
  const [phase, setPhase] = useState("input"); // input | locked | revealing | generating | done
  const [revealIdx, setRevealIdx] = useState(-1);
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const storyRef = useRef(null);

  const allFilled = inputs.every(v => v.trim().length > 0);

  const setInput = (idx, val) => {
    setInputs(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  /* ── Reveal sequence ── */
  const startReveal = () => {
    setPhase("locked");
    // Reveal each input one at a time
    setTimeout(() => { setRevealIdx(0); setPhase("revealing"); }, 600);
  };

  useEffect(() => {
    if (phase !== "revealing") return;
    if (revealIdx < 0 || revealIdx >= 3) return;
    if (revealIdx < 2) {
      const timer = setTimeout(() => setRevealIdx(i => i + 1), 1200);
      return () => clearTimeout(timer);
    }
    // All revealed — start generating after a beat
    const timer = setTimeout(() => generateStory(), 1500);
    return () => clearTimeout(timer);
  }, [revealIdx, phase]);

  /* ── Generate story via API ── */
  const generateStory = async () => {
    setPhase("generating");
    setLoading(true);
    setStory("");

    const systemPrompt = `You are a fun, imaginative storyteller for kids ages 5-14. Write a short, entertaining story (4-6 sentences) that creatively combines these three random ingredients the students gave you. Be silly, surprising, and age-appropriate. Don't mention that you were given ingredients — just tell the story naturally.`;
    const userPrompt = `Write a fun short story that includes all three of these:\n1. Character: ${inputs[0]}\n2. Place: ${inputs[1]}\n3. What happens: ${inputs[2]}`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          systemPrompt,
          temperature: 0.9,
          maxTokens: 250,
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                setStory(prev => prev + data.token);
              }
            } catch (_) {}
          }
        }
      }

      setPhase("done");
    } catch (err) {
      setStory("Oops! The AI storyteller needs a moment. Try again!");
      setPhase("done");
    } finally {
      setLoading(false);
    }
  };

  /* ── Read aloud ── */
  const readAloud = () => {
    const synth = window.speechSynthesis;
    if (!synth || !story) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(story);
    utter.rate = 0.92;
    utter.pitch = 1.05;
    const voices = synth.getVoices();
    const preferred = voices.find(v =>
      /samantha|karen|daniel|google.*us|english.*female/i.test(v.name)
    );
    if (preferred) utter.voice = preferred;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    synth.speak(utter);
  };

  /* ── Reset ── */
  const reset = () => {
    window.speechSynthesis?.cancel();
    setInputs(["", "", ""]);
    setPhase("input");
    setRevealIdx(-1);
    setStory("");
    setLoading(false);
    setSpeaking(false);
  };

  /* ── Presentation mode ── */
  if (mode === "presentation") {
    if (slide === 0) {
      return (
        <PresSlide>
          <div className="fade-up" style={{ textAlign: "center" }}>
            <MagicWand size={56} weight="duotone" color={color} style={{ marginBottom: 16 }} />
            <PresText size={48} color={color}>
              Story Mash-Up!
            </PresText>
            <PresText size={28}>
              3 kids. 3 secret ingredients. 1 AI story.
            </PresText>
          </div>
        </PresSlide>
      );
    }
    // slide 1: the interactive app (same as focus mode but full-screen)
  }

  /* ── Focus / Classroom / Presentation slide 1 ── */
  return (
    <div className="fade-up">
      {mode !== "presentation" && (
        <>
          <Label color={color} mode={mode} text="ICE BREAKER · AI IN ACTION" />
          <H1>Story Mash-Up!</H1>
          <TeacherNote notes={notes} color={color} mode={mode} />
        </>
      )}

      <div style={{
        marginTop: mode === "presentation" ? 0 : 24,
        maxWidth: 800,
        margin: "0 auto",
      }}>
        {/* ── Top: 3 secret input boxes ── */}
        <div style={{
          display: "flex",
          gap: 14,
          marginBottom: 0,
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          {SLOT_CONFIG.map((cfg, i) => (
            <SecretInput
              key={i}
              config={cfg}
              value={inputs[i]}
              onChange={v => setInput(i, v)}
              locked={phase !== "input"}
              revealed={revealIdx >= i}
            />
          ))}
        </div>

        {/* ── Lock button ── */}
        {phase === "input" && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button
              onClick={startReveal}
              disabled={!allFilled}
              className="cta-btn"
              style={{
                background: allFilled ? color : "rgba(255,255,255,.1)",
                color: allFilled ? "#000" : "rgba(255,255,255,.3)",
                fontSize: 18,
                padding: "14px 36px",
                cursor: allFilled ? "pointer" : "not-allowed",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <MagicWand size={20} weight="bold" />
              Lock it in &amp; Mash!
            </button>
          </div>
        )}

        {/* ── Lightning bolt connector ── */}
        {phase !== "input" && (
          <LightningBolt
            firing={phase === "generating" || phase === "done"}
            color={color}
          />
        )}

        {/* ── Story output box ── */}
        {phase !== "input" && (
          <Card style={{
            padding: "24px 28px",
            borderColor: phase === "done" ? `${color}50` : "rgba(255,255,255,.09)",
            background: phase === "done" ? `${color}08` : "rgba(255,255,255,.05)",
            transition: "all .5s ease",
            animation: (phase === "generating" || phase === "done") ? "fadeUp .5s ease" : "none",
            textAlign: "center",
            minHeight: 120,
          }}>
            {(phase === "locked" || phase === "revealing") && (
              <div style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 22,
                color: "rgba(255,255,255,.3)",
                padding: "20px 0",
              }}>
                {phase === "locked" ? "Locking in secrets…" : `Revealing ingredient ${revealIdx + 1} of 3…`}
              </div>
            )}

            {phase === "generating" && !story && (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "20px 0",
              }}>
                <Sparkle size={24} weight="duotone" color={color} className="spin" />
                <span style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 20,
                  color: "rgba(255,255,255,.5)",
                }}>
                  AI is writing your story…
                </span>
              </div>
            )}

            {story && (
              <div ref={storyRef} style={{
                fontFamily: "'Nunito',sans-serif",
                fontSize: 20,
                color: "rgba(255,255,255,.85)",
                lineHeight: 1.7,
                textAlign: "left",
              }}>
                {story}
              </div>
            )}

            {/* ── Action buttons ── */}
            {phase === "done" && story && (
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                marginTop: 20,
              }}>
                <button
                  onClick={readAloud}
                  className="cta-btn"
                  style={{
                    background: speaking ? `${color}cc` : color,
                    color: "#000",
                    fontSize: 16,
                    padding: "12px 28px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: speaking ? `0 0 20px ${color}44` : "none",
                  }}
                >
                  <SpeakerHigh size={20} weight="bold" />
                  {speaking ? "Reading…" : "Read it Out Loud!"}
                </button>
                <button
                  onClick={reset}
                  className="cta-btn"
                  style={{
                    background: "rgba(255,255,255,.1)",
                    color: "rgba(255,255,255,.7)",
                    fontSize: 16,
                    padding: "12px 28px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <ArrowClockwise size={20} weight="bold" />
                  Play Again
                </button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
