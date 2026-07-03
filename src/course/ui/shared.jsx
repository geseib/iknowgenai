// UI primitives for v2 chapters. Every chapter builds from these so the
// course reads as one continuous piece of design.
import { useEffect, useRef, useState } from "react";
import { FONTS, COLORS, TYPE, SPACE } from "../styles/theme.js";

// Full-viewport slide. wide=true releases the reading column for demos.
export function Slide({ children, wide = false, style }) {
  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: `${SPACE.xl}px ${SPACE.md}px ${SPACE.xl + 40}px`,
      }}
    >
      <div
        className="reveal"
        style={{
          width: "100%",
          maxWidth: wide ? 980 : 680,
          display: "flex",
          flexDirection: "column",
          gap: SPACE.md,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Small-caps context label above a heading.
export function Kicker({ children, accent }) {
  return (
    <div
      style={{
        fontFamily: FONTS.body,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: accent || COLORS.muted,
      }}
    >
      {children}
    </div>
  );
}

export function Heading({ children, size = "h1", style }) {
  return (
    <h1 style={{ fontSize: TYPE[size] || TYPE.h1, color: COLORS.text, ...style }}>
      {children}
    </h1>
  );
}

export function Lead({ children, style }) {
  return (
    <p style={{ fontSize: TYPE.lead, lineHeight: 1.55, color: COLORS.text, fontWeight: 400, ...style }}>
      {children}
    </p>
  );
}

export function Prose({ children, muted = false, style, className }) {
  return (
    <p className={className} style={{ fontSize: TYPE.body, color: muted ? COLORS.muted : COLORS.text, ...style }}>
      {children}
    </p>
  );
}

// The course's credibility contract: every simplification gets flagged.
export function HonestNote({ children }) {
  return (
    <div
      style={{
        borderLeft: `2px solid ${COLORS.faint}`,
        paddingLeft: SPACE.sm,
        fontSize: TYPE.caption,
        lineHeight: 1.6,
        color: COLORS.muted,
        maxWidth: "60ch",
      }}
    >
      <span style={{ fontWeight: 600, color: COLORS.text }}>Honest footnote. </span>
      {children}
    </div>
  );
}

export function Card({ children, style, className }) {
  return (
    <div
      className={className}
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.hairline}`,
        borderRadius: 14,
        padding: SPACE.md,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Button({ children, onClick, accent = "#6C9EF8", disabled, style }) {
  return (
    <button
      className="btn"
      onClick={onClick}
      disabled={disabled}
      style={{ background: accent, color: "#0B0E14", ...style }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, disabled, style }) {
  return (
    <button className="btn btn-ghost" onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  );
}

export function Mono({ children, accent, style }) {
  return (
    <span style={{ fontFamily: FONTS.mono, fontSize: "0.92em", color: accent || "inherit", ...style }}>
      {children}
    </span>
  );
}

// Animated count-up number for scale moments. Eases out; respects reduced motion
// implicitly (CSS can't stop rAF, so keep durations modest).
export function CountUp({ to, duration = 1400, format, style }) {
  const [val, setVal] = useState(0);
  const startRef = useRef(null);
  useEffect(() => {
    let raf;
    const tick = (t) => {
      if (startRef.current == null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  const fmt = format || ((n) => n.toLocaleString());
  return (
    <span style={{ fontFamily: FONTS.mono, fontVariantNumeric: "tabular-nums", ...style }}>
      {fmt(val)}
    </span>
  );
}

// Standard end-of-chapter recap slide.
export function Recap({ accent, lines, next, footnote }) {
  return (
    <Slide>
      <Kicker accent={accent}>What you now know</Kicker>
      <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
        {lines.map((line, i) => (
          <div
            key={i}
            className="reveal"
            style={{
              display: "flex",
              gap: 14,
              alignItems: "baseline",
              animationDelay: `${i * 120}ms`,
            }}
          >
            <span style={{ color: accent, fontFamily: FONTS.mono, fontSize: 14 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <Prose>{line}</Prose>
          </div>
        ))}
      </div>
      {footnote && <HonestNote>{footnote}</HonestNote>}
      {next && (
        <Prose muted style={{ marginTop: SPACE.sm }}>
          Next: <span style={{ color: COLORS.text }}>{next}</span>
        </Prose>
      )}
    </Slide>
  );
}

// Quiet notice when moderation blocks an input.
export function BlockedNote() {
  return (
    <Prose muted style={{ fontSize: TYPE.caption }}>
      That input was blocked by the content filter — try something else.
    </Prose>
  );
}
