// The sidequest shell: a stripped-down ChapterView for optional deep dives.
// Sidequests open in their own tab, keep their own slide dots, and never
// read or write main-course progress — closing the tab is the exit.
import { useCallback, useEffect, useRef } from "react";
import { FONTS, COLORS, SPACE } from "./styles/theme.js";

export default function SidequestView({ sidequest, slide, navigateSidequest }) {
  const touchStart = useRef(null);
  const last = slide >= sidequest.slideCount - 1;

  useEffect(() => {
    document.title = `Sidequest — ${sidequest.title}`;
  }, [sidequest]);

  const next = useCallback(() => {
    if (!last) navigateSidequest(sidequest.slug, slide + 1);
  }, [last, sidequest, slide, navigateSidequest]);

  const prev = useCallback(() => {
    if (slide > 0) navigateSidequest(sidequest.slug, slide - 1);
  }, [sidequest, slide, navigateSidequest]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const onTouchStart = (e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next(); else prev();
    }
  };

  const Component = sidequest.Component;

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Header — the Sidequest badge replaces the course chrome. No syllabus
          link on purpose: this tab is a detour, and closing it is the way back. */}
      <div
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: `${SPACE.sm}px ${SPACE.md}px`,
          background: "linear-gradient(#0B0E14 55%, transparent)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontFamily: FONTS.mono, fontSize: 11, fontWeight: 600,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: sidequest.accent, border: `1px solid ${sidequest.accent}55`,
              borderRadius: 6, padding: "3px 8px",
            }}
          >
            Sidequest
          </span>
          <span style={{ fontSize: 14, color: COLORS.muted }}>{sidequest.title}</span>
        </div>
        <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.faint }}>
          {slide + 1}/{sidequest.slideCount}
        </span>
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, paddingTop: 56 }}>
        <Component key={`${sidequest.slug}-${slide}`} accent={sidequest.accent} slide={slide} />
      </div>

      {/* Footer nav — own dots, no effect on course progress */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: `${SPACE.sm}px ${SPACE.md}px`,
          background: "linear-gradient(transparent, #0B0E14 60%)",
        }}
      >
        <button
          onClick={prev}
          disabled={slide === 0}
          style={{ fontSize: 15, color: COLORS.muted, padding: "10px 14px", opacity: slide === 0 ? 0.3 : 1 }}
        >
          ← Back
        </button>
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: sidequest.slideCount }, (_, i) => (
            <button
              key={i}
              onClick={() => navigateSidequest(sidequest.slug, i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: 7, height: 7, borderRadius: "50%", padding: 0,
                background: i === slide ? sidequest.accent : "rgba(255,255,255,.15)",
                transition: "background 200ms",
              }}
            />
          ))}
        </div>
        <button
          onClick={last ? () => window.close() : next}
          style={{
            fontSize: 15, fontWeight: 600, color: last ? COLORS.muted : COLORS.text,
            padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
          }}
        >
          {last ? "Close this tab when ready" : "Next →"}
        </button>
      </div>
    </div>
  );
}
