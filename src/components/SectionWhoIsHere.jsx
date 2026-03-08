import { useState } from "react";
import {
  SpeakerHigh,
  FilmSlate,
  GameController,
  Camera,
  ChatCircleDots,
  MusicNotes,
  MagnifyingGlass,
  SmileyWink,
  Lightbulb,
  Sparkle,
} from "@phosphor-icons/react";
import { Card, Label, H1, Body, TeacherNote, DiscussionGate } from "./shared";

const ICON_SIZE = 26;

const examples = [
  { Icon: SpeakerHigh,     label: "Siri or Alexa",       desc: "Voice assistants" },
  { Icon: FilmSlate,       label: "Netflix / YouTube",   desc: "Video suggestions" },
  { Icon: GameController,  label: "Video games",         desc: "Enemy AI & NPCs" },
  { Icon: Camera,          label: "Phone camera",        desc: "Face recognition" },
  { Icon: ChatCircleDots,  label: "ChatGPT / Claude",    desc: "Chatbots" },
  { Icon: MusicNotes,      label: "Spotify",             desc: "Music suggestions" },
  { Icon: MagnifyingGlass, label: "Google Search",       desc: "Search predictions" },
  { Icon: SmileyWink,      label: "Snapchat / TikTok",   desc: "Face filters & FYP" },
];

const notes = [
  "Start with a show of hands: 'Raise your hand if you've ever talked to Siri, Alexa, or Google.' Most hands should go up immediately.",
  "Then: 'Keep your hand up if YouTube or Netflix has ever suggested something you actually liked.' This almost always gets every hand up \u2014 great moment to say that's AI at work.",
  "Don't pressure kids to define AI yet. You're just warming up and surfacing their existing experience. Accept all answers.",
  "Common misconceptions at this stage: kids often think AI only means robots or sci-fi computers. Reassure them the boring helpful everyday stuff counts too.",
  "If nobody raises their hand at first, try: 'Has anyone ever been recommended a song, video, or game by an app?' That usually unlocks it.",
];

export default function SectionWhoIsHere({ color, mode }) {
  const [phase, setPhase] = useState(mode === "classroom" ? -1 : 0);
  const [sel, setSel] = useState(new Set());

  return (
    <div className="fade-up">
      <Label color={color} text="INTRODUCTION \u00b7 WARM UP" />
      <H1>Who's Already Used AI?</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {mode === "classroom" ? (
        <DiscussionGate
          question="Raise your hand if you've ever used AI \u2014 or think you might have!"
          hint="Give the class 30 seconds to think and discuss..."
          color={color}
          mode={mode}
        >
          <Body>Here's something surprising \u2014 look at everything that already uses AI:</Body>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {examples.map((e, i) => (
              <Card key={i} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, animation: `fadeUp .3s ${i * .05}s ease both` }}>
                <e.Icon size={ICON_SIZE} weight="duotone" color={color} />
                <div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 15, color: "white" }}>{e.label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>{e.desc}</div>
                </div>
              </Card>
            ))}
          </div>
          <div style={{ padding: "14px 16px", background: `${color}12`, border: `1px solid ${color}35`, borderRadius: 12, fontSize: 15, color: "rgba(255,255,255,.7)", lineHeight: 1.6, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Lightbulb size={22} weight="duotone" color={color} style={{ flexShrink: 0, marginTop: 2 }} />
            <span><strong style={{ color }}>AI is already everywhere.</strong> If you've ever gotten a suggestion from Netflix, YouTube, or Spotify \u2014 that was AI figuring out what you'd like!</span>
          </div>
        </DiscussionGate>
      ) : (
        <>
          {phase === 0 && (
            <div style={{ animation: "fadeUp .3s ease" }}>
              <Body>Tap everything you've used before:</Body>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {examples.map((e, i) => {
                  const s = sel.has(i);
                  return (
                    <div key={i}
                      onClick={() => setSel(p => { const n = new Set(p); s ? n.delete(i) : n.add(i); return n; })}
                      style={{
                        padding: "12px 14px", borderRadius: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "all .2s ease",
                        background: s ? `${color}20` : "rgba(255,255,255,.04)",
                        border: `1.5px solid ${s ? color : "rgba(255,255,255,.1)"}`,
                        transform: s ? "scale(1.02)" : "scale(1)",
                      }}
                    >
                      <e.Icon size={ICON_SIZE} weight="duotone" color={s ? color : "rgba(255,255,255,.5)"} />
                      <div>
                        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 14, color: "white" }}>{e.label}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{e.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {sel.size > 0 && (
                <div style={{ textAlign: "center", animation: "fadeUp .3s ease" }}>
                  <button onClick={() => setPhase(1)} className="cta-btn" style={{ background: color, color: "#000" }}>
                    See what these have in common &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
          {phase === 1 && (
            <div style={{ animation: "fadeUp .4s ease" }}>
              <Card style={{ textAlign: "center", padding: "28px 22px", marginBottom: 16 }}>
                <Sparkle size={48} weight="duotone" color={color} style={{ marginBottom: 12 }} />
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 26, color, marginBottom: 12 }}>All of those use AI!</div>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,.65)", lineHeight: 1.65 }}>
                  AI isn't just robots in movies. It's already all around you \u2014 in your phone, your TV, your games. And today you're going to find out <strong style={{ color }}>exactly how it works!</strong>
                </p>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

