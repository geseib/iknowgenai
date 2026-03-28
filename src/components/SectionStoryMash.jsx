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
  ArrowRight,
  ChatCircleDots,
  TextAa,
  PencilLine,
  ImageSquare,
  MusicNotes,
  QrCode,
  Keyboard,
  CheckCircle,
  WifiHigh,
} from "@phosphor-icons/react";
import { QRCodeSVG } from "qrcode.react";
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

/* ── Word-by-word demo: shows how AI builds a sentence one word at a time ── */
const DEMO_WORDS = [
  "Once", "upon", "a", "time,", "a", "talking", "pizza",
  "landed", "on", "the", "moon", "and", "everything",
  "turned", "to", "jello."
];

function WordByWordDemo({ color }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // Auto-start after a brief pause
    const startTimer = setTimeout(() => setStarted(true), 800);
    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!started || count >= DEMO_WORDS.length) return;
    const timer = setTimeout(() => setCount(c => c + 1), 350);
    return () => clearTimeout(timer);
  }, [count, started]);

  return (
    <div style={{ marginTop: 32 }}>
      {/* The sentence building area */}
      <div style={{
        background: "rgba(255,255,255,.05)",
        border: "1px solid rgba(255,255,255,.12)",
        borderRadius: 20,
        padding: "32px 36px",
        minHeight: 140,
        textAlign: "left",
        marginBottom: 24,
      }}>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px 10px",
          alignItems: "center",
        }}>
          {DEMO_WORDS.slice(0, count).map((word, i) => (
            <span
              key={i}
              style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 32,
                fontWeight: 600,
                color: i === count - 1 ? color : "white",
                padding: "6px 14px",
                borderRadius: 10,
                background: i === count - 1 ? `${color}20` : "transparent",
                border: i === count - 1 ? `2px solid ${color}50` : "2px solid transparent",
                animation: i === count - 1 ? "popIn .3s cubic-bezier(.34,1.56,.64,1) forwards" : "none",
                transition: "color .3s ease, background .3s ease",
              }}
            >
              {word}
            </span>
          ))}
          {count < DEMO_WORDS.length && (
            <span style={{
              display: "inline-block",
              width: 3,
              height: 36,
              background: color,
              borderRadius: 2,
              animation: "cursorBlink .6s step-end infinite",
              marginLeft: 2,
            }} />
          )}
        </div>
      </div>

      {/* Explanation underneath */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
      }}>
        <span style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 24,
          color: "rgba(255,255,255,.5)",
        }}>
          {count < DEMO_WORDS.length
            ? `Word ${count + 1} of ${DEMO_WORDS.length} — predicting the next one...`
            : "Done! Each word was a prediction based on all the words before it."
          }
        </span>
      </div>
    </div>
  );
}

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
      padding: "24px 26px",
      borderColor: revealed ? `${config.color}60` : "rgba(255,255,255,.09)",
      background: revealed ? `${config.color}10` : "rgba(255,255,255,.05)",
      transition: "all .4s ease",
      flex: 1,
      minWidth: 240,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <UserCircle size={32} weight="duotone" color={config.color} />
          <span style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 22,
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
            {hidden ? <EyeSlash size={24} /> : <Eye size={24} />}
          </button>
        )}
      </div>

      <div style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: 18,
        color: "rgba(255,255,255,.4)",
        marginBottom: 10,
      }}>
        Enter {config.prompt}:
      </div>

      {!locked ? (
        <input
          type="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
          data-form-type="other"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={config.placeholder}
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: 12,
            border: `2px solid ${config.color}40`,
            background: "rgba(0,0,0,.3)",
            color: hidden ? "transparent" : "white",
            caretColor: "white",
            textShadow: hidden ? `0 0 12px ${config.color}` : "none",
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 24,
            outline: "none",
            WebkitTextSecurity: hidden ? "disc" : "none",
          }}
        />
      ) : (
        <div style={{
          padding: "14px 18px",
          borderRadius: 12,
          background: revealed ? `${config.color}15` : "rgba(0,0,0,.3)",
          border: `2px solid ${revealed ? config.color + "60" : "rgba(255,255,255,.1)"}`,
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 26,
          fontWeight: 600,
          color: revealed ? config.color : "rgba(255,255,255,.2)",
          minHeight: 54,
          transition: "all .4s ease",
          animation: revealed ? "popIn .4s cubic-bezier(.34,1.56,.64,1) forwards" : "none",
        }}>
          {revealed ? value : "● ● ● ● ●"}
        </div>
      )}
    </Card>
  );
}

/* ── Build join URL from current window location ── */
function buildJoinUrl(code) {
  const origin = window.location.origin;
  const path = window.location.pathname;
  return `${origin}${path}?join=${code}`;
}

/* ── Main component ── */
export default function SectionStoryMash({ color, mode, slide }) {
  const [inputs, setInputs] = useState(["", "", ""]);
  const [phase, setPhase] = useState("entry-select"); // entry-select | remote-waiting | input | locked | revealing | generating | done
  const [entryMode, setEntryMode] = useState(null); // null | "remote" | "manual"
  const [roomCode, setRoomCode] = useState(null);
  const [roomStatus, setRoomStatus] = useState(null); // { character, place, event, *_claimed }
  const [revealIdx, setRevealIdx] = useState(-1);
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const storyRef = useRef(null);
  const pollRef = useRef(null);

  const allFilled = inputs.every(v => v.trim().length > 0);

  const setInput = (idx, val) => {
    setInputs(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  /* ── Create room for remote entry ── */
  const startRemote = async () => {
    try {
      const res = await fetch("/api/room-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.code) {
        setRoomCode(data.code);
        setEntryMode("remote");
        setPhase("remote-waiting");
        setRoomStatus({ character: "", place: "", event: "", character_claimed: false, place_claimed: false, event_claimed: false });
      }
    } catch (err) {
      // If remote fails, fall back to manual
      setEntryMode("manual");
      setPhase("input");
    }
  };

  /* ── Poll for remote entries ── */
  useEffect(() => {
    if (phase !== "remote-waiting" || !roomCode) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/room-status?code=${roomCode}`);
        if (!res.ok) return;
        const data = await res.json();
        setRoomStatus(data);

        // Check if all 3 entries are filled
        if (data.character && data.place && data.event) {
          setInputs([data.character, data.place, data.event]);
          setPhase("locked");
          // Auto-start reveal
          setTimeout(() => { setRevealIdx(0); setPhase("revealing"); }, 600);
        }
      } catch (_) {}
    };

    poll(); // immediate first check
    pollRef.current = setInterval(poll, 2500);
    return () => clearInterval(pollRef.current);
  }, [phase, roomCode]);

  /* ── Start manual entry ── */
  const startManual = () => {
    setEntryMode("manual");
    setPhase("input");
  };

  /* ── Switch from remote to manual ── */
  const switchToManual = () => {
    clearInterval(pollRef.current);
    // Carry over any entries that already came in via remote
    if (roomStatus) {
      setInputs([
        roomStatus.character || "",
        roomStatus.place || "",
        roomStatus.event || "",
      ]);
    }
    setEntryMode("manual");
    setPhase("input");
  };

  /* ── Reveal sequence ── */
  const startReveal = () => {
    setPhase("locked");
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
    clearInterval(pollRef.current);
    setInputs(["", "", ""]);
    setPhase("entry-select");
    setEntryMode(null);
    setRoomCode(null);
    setRoomStatus(null);
    setRevealIdx(-1);
    setStory("");
    setLoading(false);
    setSpeaking(false);
  };

  /* ── Presentation mode ── */
  if (mode === "presentation") {
    /* ── Slide 0: GenAI intro splash ── */
    if (slide === 0) {
      const genaiExamples = [
        { Icon: PencilLine, label: "Write stories", delay: 0.6 },
        { Icon: ImageSquare, label: "Draw pictures", delay: 0.75 },
        { Icon: MusicNotes, label: "Compose music", delay: 0.9 },
      ];
      return (
        <PresSlide>
          <div className="fade-up" style={{ textAlign: "center" }}>
            {/* Subtitle lead-in */}
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 30,
              color: "rgba(255,255,255,.45)",
              marginBottom: 20,
              animation: "fadeUp .5s .1s ease both",
            }}>
              But recently, AI learned something new…
            </div>

            {/* Big GenAI splash */}
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 120,
              fontWeight: 700,
              lineHeight: 1,
              marginBottom: 8,
              animation: "popIn .7s .3s cubic-bezier(.34,1.56,.64,1) both",
            }}>
              <span style={{ color: "white" }}>Gen</span>
              <span style={{
                color,
                textShadow: `0 0 40px ${color}55, 0 0 80px ${color}30`,
              }}>AI</span>
            </div>

            {/* Glow line under the title */}
            <div style={{
              width: 200,
              height: 4,
              borderRadius: 2,
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              margin: "0 auto 28px",
              animation: "fadeUp .5s .5s ease both",
            }} />

            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 36,
              color: "white",
              fontWeight: 600,
              marginBottom: 28,
              animation: "fadeUp .5s .5s ease both",
            }}>
              AI that can <span style={{ color }}>create</span>
            </div>

            {/* Example badges */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 20,
              marginBottom: 32,
            }}>
              {genaiExamples.map((ex, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 24px",
                  borderRadius: 14,
                  background: `${color}12`,
                  border: `2px solid ${color}35`,
                  animation: `fadeUp .4s ${ex.delay}s ease both`,
                }}>
                  <ex.Icon size={28} weight="duotone" color={color} />
                  <span style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 24,
                    color: "rgba(255,255,255,.8)",
                  }}>
                    {ex.label}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 26,
              color: "rgba(255,255,255,.35)",
              fontStyle: "italic",
              maxWidth: 650,
              margin: "0 auto",
              lineHeight: 1.5,
              animation: "fadeUp .5s 1.1s ease both",
            }}>
              Let's see it in action…
            </div>
          </div>
        </PresSlide>
      );
    }

    if (slide === 1) {
      return (
        <PresSlide>
          <div className="fade-up" style={{ textAlign: "center" }}>
            {/* Big cinematic title */}
            <div style={{
              position: "relative",
              display: "inline-block",
              marginBottom: 20,
            }}>
              <MagicWand size={72} weight="duotone" color={color} style={{
                marginBottom: 12,
                filter: `drop-shadow(0 0 20px ${color}66)`,
              }} />
            </div>
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 80,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.1,
              marginBottom: 8,
              animation: "popIn .6s cubic-bezier(.34,1.56,.64,1) forwards",
            }}>
              Story{" "}
              <span style={{
                color,
                textShadow: `0 0 30px ${color}44`,
              }}>
                Mash-Up!
              </span>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 24,
              marginTop: 20,
              marginBottom: 16,
            }}>
              {SLOT_CONFIG.map((s, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: 12,
                  background: `${s.color}15`,
                  border: `2px solid ${s.color}40`,
                  animation: `fadeUp .4s ${0.3 + i * 0.15}s ease both`,
                }}>
                  <UserCircle size={28} weight="duotone" color={s.color} />
                  <span style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 22,
                    color: s.color,
                    fontWeight: 600,
                  }}>
                    {s.prompt}
                  </span>
                </div>
              ))}
            </div>
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 32,
              color: "rgba(255,255,255,.4)",
              marginTop: 16,
              animation: "fadeUp .5s .8s ease both",
            }}>
              3 kids &middot; 3 secret ingredients &middot; 1 AI story
            </div>
            <Lightning size={48} weight="fill" color={color} style={{
              marginTop: 20,
              opacity: 0.5,
              animation: "fadeUp .5s 1s ease both",
            }} />
          </div>
        </PresSlide>
      );
    }
    // slide 2: the interactive app (falls through to the return below)

    /* ── Slide 3: What just happened? ── */
    if (slide === 3) {
      return (
        <PresSlide>
          <div className="fade-up" style={{ textAlign: "center", maxWidth: 850 }}>
            <ChatCircleDots size={56} weight="duotone" color={color} style={{ marginBottom: 16 }} />
            <PresText size={44} color="white">
              Wait — what just happened?
            </PresText>
            <div style={{
              marginTop: 36,
              display: "flex",
              flexDirection: "column",
              gap: 20,
              textAlign: "left",
            }}>
              {/* Step 1: We gave it a prompt */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "20px 28px",
                borderRadius: 16,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.12)",
                animation: "fadeUp .4s .2s ease both",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: `${color}25`, border: `2px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 24, fontWeight: 700, color }}>1</span>
                </div>
                <div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 28, color: "white", fontWeight: 600 }}>
                    You gave AI a <span style={{ color }}>prompt</span>
                  </div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: "rgba(255,255,255,.45)", marginTop: 4 }}>
                    The 3 secret ingredients were combined into instructions for the AI
                  </div>
                </div>
              </div>

              {/* Step 2: AI read the words */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "20px 28px",
                borderRadius: 16,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.12)",
                animation: "fadeUp .4s .4s ease both",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: `${color}25`, border: `2px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 24, fontWeight: 700, color }}>2</span>
                </div>
                <div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 28, color: "white", fontWeight: 600 }}>
                    AI read your words and <span style={{ color }}>started writing</span>
                  </div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: "rgba(255,255,255,.45)", marginTop: 4 }}>
                    It didn't plan the whole story — it predicted one word at a time
                  </div>
                </div>
              </div>

              {/* Step 3: Word by word */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "20px 28px",
                borderRadius: 16,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.12)",
                animation: "fadeUp .4s .6s ease both",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: `${color}25`, border: `2px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 24, fontWeight: 700, color }}>3</span>
                </div>
                <div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 28, color: "white", fontWeight: 600 }}>
                    Each word led to the <span style={{ color }}>next word</span>
                  </div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: "rgba(255,255,255,.45)", marginTop: 4 }}>
                    Like finishing someone's sentence — but doing it hundreds of times in a row
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PresSlide>
      );
    }

    /* ── Slide 4: Word-by-word visual ── */
    if (slide === 4) {
      return (
        <PresSlide>
          <div className="fade-up" style={{ textAlign: "center", maxWidth: 900 }}>
            <PresText size={36} color="white">
              The AI wrote your story like this:
            </PresText>
            <WordByWordDemo color={color} />
          </div>
        </PresSlide>
      );
    }

    /* ── Slide 5: The big question ── */
    if (slide === 5) {
      return (
        <PresSlide>
          <div className="fade-up" style={{ textAlign: "center" }}>
            <Sparkle size={56} weight="duotone" color={color} style={{ marginBottom: 16 }} />
            <PresText size={44} color="white">
              But <span style={{ color }}>how</span> does it know which word comes next?
            </PresText>
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 28,
              color: "rgba(255,255,255,.4)",
              marginTop: 24,
              lineHeight: 1.5,
              maxWidth: 700,
              fontStyle: "italic",
            }}>
              That's exactly what we're going to find out today.
            </div>
            <ArrowRight size={40} weight="bold" color={color} style={{
              marginTop: 28,
              opacity: 0.5,
              animation: "fadeUp .5s .5s ease both",
            }} />
          </div>
        </PresSlide>
      );
    }
  }

  /* ── Focus / Classroom / Presentation slide 2 ── */
  const ROLE_KEYS = ["character", "place", "event"];

  return (
    <div className="fade-up">
      {mode !== "presentation" ? (
        <>
          <Label color={color} mode={mode} text="ICE BREAKER · AI IN ACTION" />
          <H1>Story Mash-Up!</H1>
          <TeacherNote notes={notes} color={color} mode={mode} />
        </>
      ) : (
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 52,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.1,
          }}>
            Story{" "}
            <span style={{ color, textShadow: `0 0 24px ${color}44` }}>Mash-Up!</span>
          </div>
        </div>
      )}

      <div style={{
        marginTop: mode === "presentation" ? 0 : 24,
        maxWidth: 900,
        margin: "0 auto",
      }}>
        {/* ── Entry mode selection ── */}
        {phase === "entry-select" && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 24,
              color: "rgba(255,255,255,.45)",
              marginBottom: 28,
            }}>
              How should players enter their secret ingredients?
            </div>
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 20,
              flexWrap: "wrap",
            }}>
              <button
                onClick={startRemote}
                className="cta-btn"
                style={{
                  background: `${color}15`,
                  border: `2px solid ${color}50`,
                  color: "white",
                  fontSize: 22,
                  padding: "28px 36px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  minWidth: 220,
                  borderRadius: 20,
                }}
              >
                <QrCode size={48} weight="duotone" color={color} />
                <span style={{ fontWeight: 700 }}>Remote Entry</span>
                <span style={{ fontSize: 16, color: "rgba(255,255,255,.35)", fontWeight: 400 }}>
                  Kids scan a QR code on their phones
                </span>
              </button>
              <button
                onClick={startManual}
                className="cta-btn"
                style={{
                  background: "rgba(255,255,255,.05)",
                  border: "2px solid rgba(255,255,255,.15)",
                  color: "white",
                  fontSize: 22,
                  padding: "28px 36px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  minWidth: 220,
                  borderRadius: 20,
                }}
              >
                <Keyboard size={48} weight="duotone" color="rgba(255,255,255,.5)" />
                <span style={{ fontWeight: 700 }}>Type Here</span>
                <span style={{ fontSize: 16, color: "rgba(255,255,255,.35)", fontWeight: 400 }}>
                  Enter ingredients on this computer
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ── Remote entry: QR code + waiting ── */}
        {phase === "remote-waiting" && roomCode && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 40,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 32,
            }}>
              {/* QR code */}
              <div>
                <div style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 20,
                  display: "inline-block",
                  marginBottom: 16,
                }}>
                  <QRCodeSVG
                    value={buildJoinUrl(roomCode)}
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 16,
                  color: "rgba(255,255,255,.3)",
                }}>
                  Scan to join
                </div>
              </div>

              {/* Room code */}
              <div>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 18,
                  color: "rgba(255,255,255,.35)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}>
                  Room Code
                </div>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 72,
                  fontWeight: 700,
                  color,
                  letterSpacing: 12,
                  textShadow: `0 0 30px ${color}44`,
                }}>
                  {roomCode}
                </div>
              </div>
            </div>

            {/* Status indicators */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              marginBottom: 28,
              flexWrap: "wrap",
            }}>
              {SLOT_CONFIG.map((cfg, i) => {
                const roleKey = ROLE_KEYS[i];
                const claimed = roomStatus?.[`${roleKey}_claimed`];
                const filled = roomStatus?.[roleKey] && roomStatus[roleKey].length > 0;
                return (
                  <Card key={i} style={{
                    padding: "18px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    minWidth: 200,
                    borderColor: filled ? `${cfg.color}60` : claimed ? `${cfg.color}30` : "rgba(255,255,255,.09)",
                    background: filled ? `${cfg.color}12` : "rgba(255,255,255,.03)",
                    transition: "all .4s ease",
                  }}>
                    <UserCircle size={28} weight="duotone" color={cfg.color} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: "'Fredoka',sans-serif",
                        fontSize: 18,
                        fontWeight: 600,
                        color: cfg.color,
                      }}>
                        {cfg.label}: {cfg.prompt}
                      </div>
                      <div style={{
                        fontFamily: "'Fredoka',sans-serif",
                        fontSize: 14,
                        color: "rgba(255,255,255,.35)",
                        marginTop: 2,
                      }}>
                        {filled ? "Ready!" : claimed ? "Typing…" : "Waiting for player…"}
                      </div>
                    </div>
                    {filled ? (
                      <CheckCircle size={28} weight="fill" color={cfg.color} />
                    ) : claimed ? (
                      <WifiHigh size={22} weight="duotone" color={cfg.color} style={{ animation: "cursorBlink 1s step-end infinite" }} />
                    ) : (
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,.15)",
                      }} />
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Waiting indicator + fallback */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 16,
            }}>
              <Sparkle size={22} weight="duotone" color={color} className="spin" />
              <span style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 20,
                color: "rgba(255,255,255,.35)",
              }}>
                Waiting for all 3 entries…
              </span>
            </div>
            <button
              onClick={switchToManual}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,.3)",
                fontSize: 16,
                fontFamily: "'Fredoka',sans-serif",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: 4,
              }}
            >
              Switch to typing on this computer instead
            </button>
          </div>
        )}

        {/* ── Manual input (simplified — no hiding) ── */}
        {phase === "input" && (
          <>
            <div style={{
              display: "flex",
              gap: 14,
              marginBottom: 0,
              flexWrap: "wrap",
              justifyContent: "center",
            }}>
              {SLOT_CONFIG.map((cfg, i) => (
                <Card key={i} style={{
                  padding: "24px 26px",
                  flex: 1,
                  minWidth: 240,
                  borderColor: inputs[i] ? `${cfg.color}40` : "rgba(255,255,255,.09)",
                  background: inputs[i] ? `${cfg.color}08` : "rgba(255,255,255,.05)",
                  transition: "all .3s ease",
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 14,
                  }}>
                    <UserCircle size={32} weight="duotone" color={cfg.color} />
                    <span style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 22,
                      fontWeight: 600,
                      color: cfg.color,
                    }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 18,
                    color: "rgba(255,255,255,.4)",
                    marginBottom: 10,
                  }}>
                    Enter {cfg.prompt}:
                  </div>
                  <input
                    type="text"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    data-1p-ignore
                    data-lpignore="true"
                    data-form-type="other"
                    value={inputs[i]}
                    onChange={e => setInput(i, e.target.value)}
                    placeholder={cfg.placeholder}
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      borderRadius: 12,
                      border: `2px solid ${cfg.color}40`,
                      background: "rgba(0,0,0,.3)",
                      color: "white",
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 24,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </Card>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button
                onClick={startReveal}
                disabled={!allFilled}
                className="cta-btn"
                style={{
                  background: allFilled ? color : "rgba(255,255,255,.1)",
                  color: allFilled ? "#000" : "rgba(255,255,255,.3)",
                  fontSize: 24,
                  padding: "16px 44px",
                  cursor: allFilled ? "pointer" : "not-allowed",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <MagicWand size={26} weight="bold" />
                Lock it in &amp; Mash!
              </button>
            </div>
          </>
        )}

        {/* ── Lightning bolt connector ── */}
        {!["entry-select", "remote-waiting", "input"].includes(phase) && (
          <LightningBolt
            firing={phase === "generating" || phase === "done"}
            color={color}
          />
        )}

        {/* ── Reveal / generate / story ── */}
        {!["entry-select", "remote-waiting", "input"].includes(phase) && (
          <>
            {/* Show the 3 entries during reveal */}
            {(phase === "locked" || phase === "revealing") && (
              <div style={{
                display: "flex",
                gap: 14,
                marginBottom: 16,
                flexWrap: "wrap",
                justifyContent: "center",
              }}>
                {SLOT_CONFIG.map((cfg, i) => (
                  <Card key={i} style={{
                    padding: "16px 22px",
                    flex: 1,
                    minWidth: 200,
                    borderColor: revealIdx >= i ? `${cfg.color}60` : "rgba(255,255,255,.09)",
                    background: revealIdx >= i ? `${cfg.color}10` : "rgba(255,255,255,.05)",
                    transition: "all .4s ease",
                    textAlign: "center",
                  }}>
                    <div style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 16,
                      color: cfg.color,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}>
                      {cfg.label}
                    </div>
                    <div style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 24,
                      fontWeight: 600,
                      color: revealIdx >= i ? cfg.color : "rgba(255,255,255,.15)",
                      animation: revealIdx === i ? "popIn .4s cubic-bezier(.34,1.56,.64,1) forwards" : "none",
                    }}>
                      {revealIdx >= i ? inputs[i] : "● ● ●"}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Card style={{
              padding: "32px 36px",
              borderColor: phase === "done" ? `${color}50` : "rgba(255,255,255,.09)",
              background: phase === "done" ? `${color}08` : "rgba(255,255,255,.05)",
              transition: "all .5s ease",
              animation: (phase === "generating" || phase === "done") ? "fadeUp .5s ease" : "none",
              textAlign: "center",
              minHeight: 160,
            }}>
              {(phase === "locked" || phase === "revealing") && (
                <div style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 28,
                  color: "rgba(255,255,255,.3)",
                  padding: "30px 0",
                }}>
                  {phase === "locked" ? "Locking in secrets…" : `Revealing ingredient ${revealIdx + 1} of 3…`}
                </div>
              )}

              {phase === "generating" && !story && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                  padding: "30px 0",
                }}>
                  <Sparkle size={32} weight="duotone" color={color} className="spin" />
                  <span style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 26,
                    color: "rgba(255,255,255,.5)",
                  }}>
                    AI is writing your story…
                  </span>
                </div>
              )}

              {story && (
                <div ref={storyRef} style={{
                  fontFamily: "'Nunito',sans-serif",
                  fontSize: 26,
                  color: "rgba(255,255,255,.85)",
                  lineHeight: 1.75,
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
                  gap: 14,
                  marginTop: 24,
                }}>
                  <button
                    onClick={readAloud}
                    className="cta-btn"
                    style={{
                      background: speaking ? `${color}cc` : color,
                      color: "#000",
                      fontSize: 22,
                      padding: "14px 32px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      boxShadow: speaking ? `0 0 20px ${color}44` : "none",
                    }}
                  >
                    <SpeakerHigh size={24} weight="bold" />
                    {speaking ? "Reading…" : "Read it Out Loud!"}
                  </button>
                  <button
                    onClick={reset}
                    className="cta-btn"
                    style={{
                      background: "rgba(255,255,255,.1)",
                      color: "rgba(255,255,255,.7)",
                      fontSize: 22,
                      padding: "14px 32px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <ArrowClockwise size={24} weight="bold" />
                    Play Again
                  </button>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
