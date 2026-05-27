import { useState } from "react";
import {
  Flag,
  ArrowLeft,
  Shuffle,
  DeviceMobile,
  ChalkboardTeacher,
  Eye,
  SplitVertical,
  Cat,
} from "@phosphor-icons/react";

const FLAGS = [
  {
    key: "flowVersion",
    label: "Proposed Flow (v2)",
    desc: "Reorganized section order with 5 groups: What Is AI?, Meet the LLMs, Inside the Machine, How AI Writes, Try It!",
    Icon: Shuffle,
    color: "#9b5de5",
    type: "toggle",
    defaultValue: true,
  },
  {
    key: "teacherDrawerPush",
    label: "Teacher Drawer Pushes Content",
    desc: "When the teacher notes drawer opens, slide content shifts left so both are visible side-by-side.",
    Icon: ChalkboardTeacher,
    color: "#00bbf9",
    type: "toggle",
    defaultValue: true,
  },
  {
    key: "mobileOptimized",
    label: "Mobile-Optimized Layout",
    desc: "Scale text and layout for phone-sized screens. Disable if you prefer the desktop layout on tablets.",
    Icon: DeviceMobile,
    color: "#06d6a0",
    type: "toggle",
    defaultValue: true,
  },
  {
    key: "showSlidePreview",
    label: "Slide Preview in Nav",
    desc: "Show a mini preview of each section's first slide in the navigation drawer.",
    Icon: Eye,
    color: "#fee440",
    type: "toggle",
    defaultValue: false,
  },
  {
    key: "multiSession",
    label: "Multi-Session Mode (v3)",
    desc: "Split the lesson into 3 bite-sized sessions: Discover, Explore, Create. Each starts with an animated review of what was learned before.",
    Icon: SplitVertical,
    color: "#fb5607",
    type: "toggle",
    defaultValue: true,
  },
  {
    key: "roamingCat",
    label: "AI Cat",
    desc: "A friendly cat roams the page and shares fun AI-related quips. Appears on select slides throughout the lesson.",
    Icon: Cat,
    color: "#7ec8e3",
    type: "toggle",
    defaultValue: true,
  },
];

const STORAGE_KEY = "iknowgenai_flags";

export function loadFlags() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const flags = {};
    for (const flag of FLAGS) {
      flags[flag.key] = stored[flag.key] !== undefined ? stored[flag.key] : flag.defaultValue;
    }
    return flags;
  } catch {
    const flags = {};
    for (const flag of FLAGS) {
      flags[flag.key] = flag.defaultValue;
    }
    return flags;
  }
}

export function saveFlags(flags) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
}

export default function FeatureFlags({ onBack, allCss }) {
  const [flags, setFlags] = useState(loadFlags);

  const toggle = (key) => {
    setFlags(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveFlags(next);
      return next;
    });
  };

  const stars = Array.from({ length: 40 }, (_, i) => ({
    x: ((i * 137.508) % 100).toFixed(1),
    y: ((i * 73.214) % 100).toFixed(1),
    s: (0.5 + (i % 5) * .35).toFixed(1),
    d: (1.2 + (i % 5) * .6).toFixed(1),
    dl: ((i % 30) * .1).toFixed(1),
  }));

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050512",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "48px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {allCss && <style>{allCss}</style>}
      {stars.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.s}px`, height: `${s.s}px`, borderRadius: "50%",
          background: "white",
          animation: `twinkle ${s.d}s ${s.dl}s infinite alternate`,
          pointerEvents: "none",
        }} />
      ))}

      <div style={{ position: "relative", zIndex: 10, maxWidth: 520, width: "100%" }}>
        {/* Header */}
        <button
          onClick={onBack}
          className="ghost-btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            padding: "8px 14px",
            marginBottom: 28,
          }}
        >
          <ArrowLeft size={16} weight="bold" /> Back
        </button>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}>
          <Flag size={32} weight="duotone" color="#fb5607" />
          <h1 style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 32,
            fontWeight: 700,
            color: "white",
          }}>
            Feature Flags
          </h1>
        </div>
        <p style={{
          color: "rgba(255,255,255,.35)",
          fontSize: 14,
          marginBottom: 32,
          lineHeight: 1.5,
        }}>
          Toggle experimental features. Settings are saved to your browser.
        </p>

        {/* Flag cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {FLAGS.map(flag => {
            const active = flags[flag.key];
            return (
              <div
                key={flag.key}
                onClick={() => toggle(flag.key)}
                style={{
                  padding: "20px 22px",
                  borderRadius: 16,
                  background: active ? `${flag.color}10` : "rgba(255,255,255,.03)",
                  border: `2px solid ${active ? flag.color + "40" : "rgba(255,255,255,.08)"}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  transition: "all .2s ease",
                }}
              >
                <flag.Icon
                  size={28}
                  weight="duotone"
                  color={active ? flag.color : "rgba(255,255,255,.25)"}
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 18,
                    fontWeight: 600,
                    color: active ? "white" : "rgba(255,255,255,.6)",
                    marginBottom: 4,
                  }}>
                    {flag.label}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,.35)",
                    lineHeight: 1.5,
                  }}>
                    {flag.desc}
                  </div>
                </div>

                {/* Toggle switch */}
                <div style={{
                  width: 48,
                  height: 28,
                  borderRadius: 14,
                  background: active ? flag.color : "rgba(255,255,255,.12)",
                  flexShrink: 0,
                  position: "relative",
                  transition: "background .2s ease",
                  marginTop: 2,
                }}>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: 3,
                    left: active ? 23 : 3,
                    transition: "left .2s ease",
                    boxShadow: "0 1px 4px rgba(0,0,0,.3)",
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Reset */}
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <button
            onClick={() => {
              const defaults = {};
              for (const flag of FLAGS) defaults[flag.key] = flag.defaultValue;
              saveFlags(defaults);
              setFlags(defaults);
            }}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,.25)",
              fontSize: 13,
              fontFamily: "'Fredoka',sans-serif",
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: 4,
            }}
          >
            Reset all to defaults
          </button>
        </div>
      </div>
    </div>
  );
}
