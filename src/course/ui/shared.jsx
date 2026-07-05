// UI primitives for v2 chapters. Every chapter builds from these so the
// course reads as one continuous piece of design.
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { FONTS, COLORS, TYPE, SPACE } from "../styles/theme.js";
import { GLOSSARY } from "../data/glossary.js";

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

// Standard end-of-chapter recap slide. `aside` is an optional muted line
// between the takeaways and the next-chapter teaser (e.g. a sidequest link).
export function Recap({ accent, lines, next, footnote, aside }) {
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
      {aside && (
        <Prose muted style={{ fontSize: 15 }}>
          {aside}
        </Prose>
      )}
      {next && (
        <Prose muted style={{ marginTop: SPACE.sm }}>
          Next: <span style={{ color: COLORS.text }}>{next}</span>
        </Prose>
      )}
    </Slide>
  );
}

// Inline launcher for an optional sidequest deep dive. Renders the term as a
// quiet dotted-underline link plus a small "sidequest" tag, and opens the
// sidequest in a NEW TAB (target=_blank on a hash href keeps this tab's
// place in the course untouched). Use sparingly — one per concept, in prose,
// never inside a demo.
export function SidequestLink({ slug, accent, children }) {
  return (
    <a
      href={`#sidequest/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "inherit",
        textDecoration: "underline",
        textDecorationStyle: "dotted",
        textDecorationColor: accent || COLORS.faint,
        textUnderlineOffset: 4,
        whiteSpace: "nowrap",
      }}
    >
      {children}
      <span
        style={{
          fontFamily: FONTS.mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: accent || COLORS.muted,
          border: `1px solid ${(accent || COLORS.faint)}55`,
          borderRadius: 5,
          padding: "1px 5px",
          marginLeft: 6,
          verticalAlign: "0.15em",
        }}
      >
        sidequest ↗
      </span>
    </a>
  );
}

// Inline glossary term — SidequestLink's lighter-weight sibling. Renders the
// word with a quiet DASHED underline (dotted + chip means sidequest; dashed,
// no chip means "hover for a definition") and shows a small card on hover,
// keyboard focus, or tap (mobile has no hover — tap toggles, tapping elsewhere
// or Escape closes). Definitions live in ONE place: data/glossary.js.
// Usage: <Term t="softmax" accent={accent}>softmax</Term>.
// Sparing, like sidequest links: first meaningful occurrence in a chapter at
// most; never in headings, buttons, or inside interactive demo regions; never
// on the slide that's teaching the term.
export function Term({ t, accent, children }) {
  const entry = GLOSSARY[t];
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null); // offsets relative to the trigger
  const wrapRef = useRef(null);
  const tipRef = useRef(null);
  const hideTimer = useRef(null);
  const tipId = useId();

  // Set when a pointerdown on the trigger closes the card, so the synthetic
  // mouseenter/focus/click that follow the same tap can't instantly reopen it.
  const suppress = useRef(false);

  const show = () => {
    if (suppress.current) return;
    clearTimeout(hideTimer.current);
    setOpen(true);
  };
  // Small delay so the pointer can travel from the word into the card.
  const scheduleHide = () => {
    suppress.current = false;
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setOpen(false), 160);
  };
  // Touch taps toggle. The toggle lives on pointerdown — which fires BEFORE
  // the synthetic mouseenter and click a tap generates — because with a plain
  // onClick toggle, a tap would open the card (mouseenter) and instantly
  // toggle it closed again (click), so it would never appear on touch
  // screens. Mouse users keep pure hover semantics: their pointerdown is
  // ignored and click simply pins the card open.
  const onTriggerPointerDown = (e) => {
    if (e.pointerType === "mouse") return;
    if (open) {
      suppress.current = true;
      setOpen(false);
    } else {
      // A fresh tap on a closed term always gets to open it (touch devices
      // never fire the mouseleave that would otherwise clear the flag).
      suppress.current = false;
    }
  };

  // Position after the card renders: centered on the word, clamped to the
  // viewport, above by default and flipped below when there's no headroom.
  useLayoutEffect(() => {
    if (!open || !wrapRef.current || !tipRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const tw = tipRef.current.offsetWidth;
    const th = tipRef.current.offsetHeight;
    let viewportLeft = r.left + r.width / 2 - tw / 2;
    viewportLeft = Math.max(12, Math.min(viewportLeft, window.innerWidth - tw - 12));
    const fitsAbove = r.top - th - 10 >= 8;
    setPos({ left: viewportLeft - r.left, top: fitsAbove ? -(th + 8) : r.height + 8 });
  }, [open]);

  // Escape closes; a tap/click anywhere outside closes (the mobile path).
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    const onPointerDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  if (!entry) return children; // unknown slug: fail quiet, render plain text

  const a = accent || COLORS.muted;
  return (
    <span
      ref={wrapRef}
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget)) {
          suppress.current = false;
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        onFocus={show}
        onPointerDown={onTriggerPointerDown}
        onClick={show}
        style={{
          font: "inherit",
          color: "inherit",
          background: "none",
          border: "none",
          padding: 0,
          margin: 0,
          cursor: "help",
          textDecorationLine: "underline",
          textDecorationStyle: "dashed",
          textDecorationColor: open ? a : COLORS.faint,
          textDecorationThickness: 1,
          textUnderlineOffset: 4,
          transition: "text-decoration-color 200ms",
        }}
      >
        {children}
      </button>
      {open && (
        <span
          ref={tipRef}
          role="tooltip"
          id={tipId}
          style={{
            position: "absolute",
            left: pos ? pos.left : 0,
            top: pos ? pos.top : "100%",
            visibility: pos ? "visible" : "hidden",
            zIndex: 90,
            display: "block",
            width: "min(300px, calc(100vw - 24px))",
            background: COLORS.surfaceRaised,
            border: `1px solid ${COLORS.hairline}`,
            borderRadius: 10,
            padding: "12px 14px",
            boxShadow: "0 12px 32px rgba(0,0,0,.45)",
            textAlign: "left",
            fontFamily: FONTS.body,
            fontStyle: "normal",
            fontWeight: 400,
            fontSize: 14,
            lineHeight: 1.6,
            color: COLORS.text,
            whiteSpace: "normal",
          }}
        >
          <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 600, color: a }}>
              {entry.term}
            </span>
            <span
              style={{
                fontFamily: FONTS.mono, fontSize: 9, fontWeight: 600,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: COLORS.faint,
              }}
            >
              glossary
            </span>
          </span>
          {entry.definition}
          {entry.link && (
            <a
              href={entry.link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block", marginTop: 8,
                fontFamily: FONTS.mono, fontSize: 12, color: a,
                textDecoration: "underline", textDecorationStyle: "dotted",
                textUnderlineOffset: 3,
              }}
            >
              {entry.link.label || "Read more"} ↗
            </a>
          )}
        </span>
      )}
    </span>
  );
}

// Quiet notice when moderation blocks an input.
export function BlockedNote() {
  return (
    <Prose muted style={{ fontSize: TYPE.caption }}>
      The content filter blocked that one. It errs on the side of caution —
      try again, or reword the input.
    </Prose>
  );
}
