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
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 36,
              color: "white",
              textAlign: "center",
              marginBottom: 28,
            }}>
              Surprise — look at everything that already uses AI:
            </div>
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
                    animation: `fadeUp .4s ${i * 0.08}s ease both`,
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
