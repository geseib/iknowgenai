import { Sparkle, HashStraight, MapTrifold, Flashlight, Stack, MagicWand, Heart } from "@phosphor-icons/react";
import { Label, H1, TeacherNote, PresSlide, PresText } from "./shared";

// The journey, retold in one breath — mirrors the Act 4/5 deep dive.
const JOURNEY = [
  { icon: HashStraight, label: "Words became numbers" },
  { icon: MapTrifold,   label: "Numbers found their meaning" },
  { icon: Flashlight,   label: "Attention figured out context" },
  { icon: Stack,        label: "96 layers thought it through" },
  { icon: MagicWand,    label: "...and predicted the next word" },
];

const notes = [
  "This is the landing. Slow down — let the class feel that they made it through the whole machine.",
  "Callback to the very first section: the AI they already use every day (Siri, YouTube, games) runs on exactly the pipeline they just watched. The mystery is gone; the wonder stays.",
  "Reflection prompt: 'Now that you know what's happening inside, does it change how you'll use AI?' There's no wrong answer — you're inviting metacognition.",
  "Optional exit ticket: send students to the quiz (Knowledge Check) or back to Try It to apply what they learned.",
];

export default function SectionWrapUp({ color, mode, slide }) {
  /* ── Presentation mode — 2 slides ── */
  if (mode === "presentation") {
    // Slide 0: the journey recap
    if (slide === 0) {
      return (
        <PresSlide>
          <PresText color="white" size={44}>
            You made it all the way <span style={{ color }}>through the machine</span>.
          </PresText>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12, width: "100%", maxWidth: 560 }}>
            {JOURNEY.map((row, i) => {
              const Icon = row.icon;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "12px 20px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(255,255,255,.1)",
                    animation: `fadeUp .45s ${i * 0.14}s ease both`,
                  }}
                >
                  <Icon size={30} weight="duotone" color={color} style={{ flexShrink: 0 }} />
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: "white" }}>
                    {row.label}
                  </div>
                </div>
              );
            })}
          </div>
        </PresSlide>
      );
    }

    // Slide 1: the callback + reflection
    return (
      <PresSlide>
        <Sparkle size={52} weight="duotone" color={color} style={{ marginBottom: 4 }} />
        <PresText color="white" size={40}>
          Remember all the AI you <span style={{ color }}>already use</span>?
        </PresText>
        <PresText size={26} color="rgba(255,255,255,.6)">
          Chatbots, story-writers, homework helpers — every one of them runs on
          the pipeline you just watched. (Siri, YouTube and games use other kinds
          of AI — but they all learned from examples, too.)
        </PresText>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 8,
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 28,
          fontWeight: 700,
          color,
        }}>
          <Heart size={28} weight="fill" color={color} />
          You know GenAI.
        </div>
        <PresText size={20} color="rgba(255,255,255,.45)">
          One last thing to think about: now that you know how it works,
          does it change how you'll use it?
        </PresText>
      </PresSlide>
    );
  }

  /* ── Non-presentation fallback ── */
  return (
    <div className="fade-up">
      <Label color={color} mode={mode} text="YOUR TURN · WRAP-UP" />
      <H1>You Know GenAI!</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />
      <div style={{ marginTop: 18 }}>
        {JOURNEY.map((row, i) => {
          const Icon = row.icon;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <Icon size={26} weight="duotone" color={color} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 18, color: "rgba(255,255,255,.8)" }}>{row.label}</span>
            </div>
          );
        })}
      </div>
      <p style={{ color: "rgba(255,255,255,.62)", fontSize: 18, lineHeight: 1.65, marginTop: 16, maxWidth: 660 }}>
        Every AI you already use — Siri, YouTube, games, chatbots — runs on the
        pipeline you just explored. Now that you know how it works, does it change
        how you'll use it?
      </p>
    </div>
  );
}
