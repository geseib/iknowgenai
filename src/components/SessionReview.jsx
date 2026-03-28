import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Lightning,
  UserCircle,
  MapPin,
  CalendarBlank,
} from "@phosphor-icons/react";
import { PresSlide, PresText, Card } from "./shared";

/* ─── Small decorative animation components ─── */

function NumberTicker() {
  const [nums, setNums] = useState(() =>
    Array.from({ length: 8 }, () => Math.floor(Math.random() * 10000))
  );
  useEffect(() => {
    const id = setInterval(() => {
      setNums(prev =>
        prev.map(() => Math.floor(Math.random() * 10000))
      );
    }, 120);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      display: "flex",
      gap: 8,
      justifyContent: "center",
      marginTop: 16,
      animation: "fadeUp .4s ease",
    }}>
      {nums.map((n, i) => (
        <div key={i} style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 18,
          fontWeight: 600,
          color: `rgba(255,255,255,${0.3 + (i % 3) * 0.15})`,
          background: "rgba(255,255,255,.06)",
          borderRadius: 8,
          padding: "6px 10px",
          minWidth: 48,
          textAlign: "center",
          transition: "all .1s ease",
        }}>
          {n}
        </div>
      ))}
    </div>
  );
}

function WordByWord() {
  const words = ["Once...", "upon...", "a...", "time..."];
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    if (visible < words.length) {
      const id = setTimeout(() => setVisible(v => v + 1), 500);
      return () => clearTimeout(id);
    }
  }, [visible]);
  return (
    <div style={{
      display: "flex",
      gap: 10,
      justifyContent: "center",
      marginTop: 16,
      fontFamily: "'Fredoka',sans-serif",
      fontSize: 22,
      color: "rgba(255,255,255,.55)",
    }}>
      {words.map((w, i) => (
        <span key={i} style={{
          opacity: i < visible ? 1 : 0,
          transform: i < visible ? "translateY(0)" : "translateY(12px)",
          transition: "all .35s ease",
        }}>
          {w}
        </span>
      ))}
      <span style={{
        display: "inline-block",
        width: 2,
        height: 24,
        background: "rgba(255,255,255,.4)",
        animation: "cursorBlink 1s step-end infinite",
        marginLeft: 2,
        alignSelf: "center",
      }} />
    </div>
  );
}

function StoryMash() {
  const items = [
    { Icon: UserCircle, label: "Character", color: "#fee440" },
    { Icon: MapPin, label: "Place", color: "#00bbf9" },
    { Icon: CalendarBlank, label: "Event", color: "#f15bb5" },
  ];
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      marginTop: 16,
      animation: "fadeUp .4s ease",
    }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `${item.color}18`,
            border: `1px solid ${item.color}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: `popIn .4s ease ${i * 0.15}s both`,
          }}>
            <item.Icon size={24} weight="duotone" color={item.color} />
          </div>
          {i < items.length - 1 && (
            <Lightning size={18} weight="fill" color="rgba(255,255,255,.25)" />
          )}
        </div>
      ))}
    </div>
  );
}

function ScatterDots() {
  const dots = [
    { x: 30, y: 25, color: "#00f5d4", label: "cat" },
    { x: 38, y: 20, color: "#00f5d4", label: "kitten" },
    { x: 34, y: 30, color: "#00f5d4", label: "pet" },
    { x: 70, y: 65, color: "#fb5607", label: "car" },
    { x: 76, y: 70, color: "#fb5607", label: "truck" },
  ];
  return (
    <div style={{
      position: "relative",
      width: 200,
      height: 100,
      margin: "16px auto 0",
      animation: "fadeUp .4s ease",
    }}>
      {dots.map((d, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${d.x}%`,
          top: `${d.y}%`,
          transform: "translate(-50%, -50%)",
          animation: `popIn .4s ease ${i * 0.1}s both`,
        }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: d.color,
            boxShadow: `0 0 8px ${d.color}60`,
          }} />
          <div style={{
            fontSize: 10,
            color: "rgba(255,255,255,.4)",
            fontFamily: "'Fredoka',sans-serif",
            textAlign: "center",
            marginTop: 2,
          }}>
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
}

const ANIMATION_MAP = {
  numberTicker: NumberTicker,
  wordByWord: WordByWord,
  storyMash: StoryMash,
  scatter: ScatterDots,
  reveal: null,
};

/* ─── Session Title Slide (slide 0 for sessions 2 & 3) ─── */

function SessionTitleSlide({ sessionName, subtitle, sessionIndex, color }) {
  return (
    <PresSlide>
      <div style={{ animation: "fadeUp .5s ease" }}>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 18,
          color: "rgba(255,255,255,.4)",
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 12,
        }}>
          Session {sessionIndex + 1} of 3
        </div>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 64,
          fontWeight: 700,
          color: "white",
          lineHeight: 1.1,
          marginBottom: 10,
        }}>
          {sessionName}
        </div>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 28,
          color: `${color}cc`,
          marginBottom: 24,
        }}>
          {subtitle}
        </div>
        <div style={{
          fontFamily: "'Nunito',sans-serif",
          fontSize: 18,
          color: "rgba(255,255,255,.45)",
          animation: "fadeUp .5s ease .2s both",
        }}>
          Welcome back! Let&apos;s pick up where we left off.
        </div>
      </div>
    </PresSlide>
  );
}

/* ─── Review Question Slide ─── */

function ReviewQuestionSlide({ review }) {
  const [revealed, setRevealed] = useState(false);
  const AnimComp = ANIMATION_MAP[review.animationType];

  return (
    <PresSlide>
      <div style={{ maxWidth: 720, width: "100%" }}>
        <PresText size={40} color="rgba(255,255,255,.85)">
          {review.question}
        </PresText>

        {!revealed && (
          <div style={{ marginTop: 32, animation: "fadeUp .3s ease" }}>
            <button
              className="cta-btn"
              onClick={() => setRevealed(true)}
              style={{
                background: review.color,
                color: "#000",
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 20,
                fontWeight: 600,
                padding: "14px 36px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
              }}
            >
              Reveal
            </button>
          </div>
        )}

        {revealed && (
          <div style={{ marginTop: 28, animation: "popIn .4s ease" }}>
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 36,
              fontWeight: 700,
              color: review.color,
              lineHeight: 1.3,
              marginBottom: 8,
            }}>
              {review.answer}
            </div>
            {AnimComp && <AnimComp />}
          </div>
        )}
      </div>
    </PresSlide>
  );
}

/* ─── Main SessionReview component ─── */

/**
 * Renders review slides at the start of sessions 2 and 3.
 *
 * Props:
 *  - reviews: array of { question, answer, animationType, color }
 *  - slide: current slide index within the review block
 *  - sessionName: e.g. "Explore"
 *  - subtitle: e.g. "How AI thinks"
 *  - sessionIndex: 1 or 2
 *  - color: session theme color
 *
 * Slide 0 = session title, slides 1..N = review questions
 */
export default function SessionReview({
  reviews = [],
  slide,
  sessionName,
  subtitle,
  sessionIndex,
  color,
}) {
  if (slide === 0) {
    return (
      <SessionTitleSlide
        sessionName={sessionName}
        subtitle={subtitle}
        sessionIndex={sessionIndex}
        color={color}
      />
    );
  }

  const reviewIndex = slide - 1;
  if (reviewIndex >= 0 && reviewIndex < reviews.length) {
    return <ReviewQuestionSlide review={reviews[reviewIndex]} />;
  }

  return null;
}

/* ─── Session Teaser component (end of sessions 1 & 2) ─── */

export function SessionTeaser({ teaser, nextSessionName, color }) {
  return (
    <PresSlide>
      <div style={{ animation: "fadeUp .5s ease", textAlign: "center" }}>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 20,
          color: "rgba(255,255,255,.35)",
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 16,
        }}>
          Coming Up
        </div>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 48,
          fontWeight: 700,
          color: "white",
          marginBottom: 20,
          lineHeight: 1.2,
        }}>
          Next Time...
        </div>
        <div style={{
          fontFamily: "'Nunito',sans-serif",
          fontSize: 24,
          color: "rgba(255,255,255,.6)",
          lineHeight: 1.5,
          maxWidth: 560,
          margin: "0 auto 28px",
        }}>
          {teaser}
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          animation: "fadeUp .5s ease .3s both",
        }}>
          <ArrowRight size={24} weight="bold" color={color} />
          <span style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 28,
            fontWeight: 600,
            color: color,
          }}>
            {nextSessionName}
          </span>
        </div>
      </div>
    </PresSlide>
  );
}
