import { useState } from "react";
import {
  Sparkle,
  ChalkboardTeacher,
  ChatTeardropDots,
  CaretUp,
  CaretDown,
  Info,
} from "@phosphor-icons/react";

export function Card({ children, style }) {
  return (
    <div style={{
      background: "rgba(255,255,255,.05)",
      border: "1px solid rgba(255,255,255,.09)",
      borderRadius: 16,
      padding: "20px 22px",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function Label({ color, text, mode }) {
  if (mode === "minimal") return null;
  return (
    <div style={{
      fontFamily: "'Fredoka',sans-serif",
      fontSize: 12,
      color: `${color}99`,
      letterSpacing: 2.5,
      textTransform: "uppercase",
      marginBottom: 12,
    }}>
      {text}
    </div>
  );
}

export function H1({ children }) {
  return (
    <h1 style={{
      fontFamily: "'Fredoka',sans-serif",
      fontSize: 40,
      fontWeight: 700,
      color: "white",
      lineHeight: 1.15,
      marginBottom: 10,
    }}>
      {children}
    </h1>
  );
}

export function Body({ children }) {
  return (
    <p style={{
      color: "rgba(255,255,255,.62)",
      fontSize: 18,
      lineHeight: 1.65,
      marginBottom: 20,
      maxWidth: 660,
    }}>
      {children}
    </p>
  );
}

export function TriviaBox({ color, number, label, fact, visible, mode }) {
  if (!visible || mode === "minimal") return null;
  return (
    <div className="wow-reveal" style={{
      background: `${color}10`,
      border: `1px solid ${color}40`,
      borderRadius: 14,
      padding: "16px 18px",
      marginTop: 18,
    }}>
      <div style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: 11,
        color: `${color}bb`,
        letterSpacing: 2.5,
        textTransform: "uppercase",
        marginBottom: 6,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        <Sparkle size={16} weight="duotone" color={color} />
        Wow Fact Unlocked!
      </div>
      {number && (
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 44,
          fontWeight: 700,
          color,
          lineHeight: 1,
          marginBottom: 2,
        }}>
          {number}
        </div>
      )}
      {label && (
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 14,
          color: `${color}cc`,
          marginBottom: 6,
        }}>
          {label}
        </div>
      )}
      <div style={{ fontSize: 14, color: "rgba(255,255,255,.62)", lineHeight: 1.55 }}>
        {fact}
      </div>
    </div>
  );
}

export function TeacherNote({ notes, color, mode }) {
  const [open, setOpen] = useState(false);
  if (mode !== "classroom") return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 14px",
          borderRadius: 8,
          background: "rgba(255,255,255,.04)",
          border: "1px dashed rgba(255,255,255,.18)",
          color: "rgba(255,255,255,.5)",
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        <ChalkboardTeacher size={18} weight="duotone" />
        Talking points {open ? <CaretUp size={12} /> : <CaretDown size={12} />}
      </button>
      {open && (
        <div style={{
          marginTop: 8,
          padding: "14px 16px",
          background: `${color}08`,
          border: `1px solid ${color}28`,
          borderRadius: 10,
          animation: "fadeUp .25s ease",
        }}>
          {notes.map((n, i) => (
            <div key={i} style={{
              display: "flex",
              gap: 10,
              marginBottom: i < notes.length - 1 ? 10 : 0,
              fontSize: 13.5,
              color: "rgba(255,255,255,.68)",
              lineHeight: 1.6,
            }}>
              <span style={{ color, marginTop: 2, flexShrink: 0 }}>&bull;</span>
              <span>{n}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DiscussionGate({ question, hint, color, mode, children }) {
  const [revealed, setRevealed] = useState(mode === "solo" || mode === "minimal");
  if (revealed) return <div style={{ animation: "fadeUp .4s ease" }}>{children}</div>;
  return (
    <Card style={{ textAlign: "center", padding: "32px 24px", marginBottom: 16 }}>
      <ChatTeardropDots size={40} weight="duotone" color="rgba(255,255,255,.5)" style={{ marginBottom: 14 }} />
      <div style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: 22,
        color: "white",
        lineHeight: 1.35,
        marginBottom: hint ? 10 : 22,
      }}>
        {question}
      </div>
      {hint && (
        <div style={{
          fontSize: 14,
          color: "rgba(255,255,255,.38)",
          marginBottom: 22,
          fontStyle: "italic",
        }}>
          {hint}
        </div>
      )}
      <button
        onClick={() => setRevealed(true)}
        className="cta-btn"
        style={{ background: color, color: "#000", margin: "0 auto" }}
      >
        Reveal &rarr;
      </button>
    </Card>
  );
}

export function ModelNote({ color, children, mode }) {
  if (mode === "minimal") return null;
  return (
    <div style={{
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
      padding: "10px 14px",
      borderRadius: 10,
      background: "rgba(255,255,255,.03)",
      border: "1px solid rgba(255,255,255,.08)",
      marginTop: 12,
      marginBottom: 6,
    }}>
      <Info size={18} weight="duotone" color="rgba(255,255,255,.35)" style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 13, color: "rgba(255,255,255,.38)", lineHeight: 1.55 }}>
        {children}
      </div>
    </div>
  );
}
