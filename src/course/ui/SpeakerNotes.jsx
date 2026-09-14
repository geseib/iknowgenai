// Speaker-notes panel for presentation mode — the 14+ course's counterpart to
// the K-8 TeacherDrawer, rebuilt in the course design system. Slides in from
// the right with NO backdrop (the speaker still needs to see the slide) and a
// left-edge toggle tab. Content is driven by a note object (see speakerNotes.js);
// only the sections present get rendered.
import { FONTS, COLORS, SPACE } from "../styles/theme.js";

function Section({ label, accent, children }) {
  return (
    <div style={{ marginBottom: SPACE.md }}>
      <div style={{
        fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.12em",
        textTransform: "uppercase", color: accent, marginBottom: 8,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

export default function SpeakerNotes({ open, onToggle, notes, accent, chapterTitle, slideLabel }) {
  const has = notes && (notes.say || notes.points?.length || notes.demo || notes.ask?.length || notes.caveat);

  return (
    <div
      style={{
        position: "fixed", top: 0, bottom: 0, right: 0, zIndex: 145,
        width: 384, maxWidth: "calc(88vw + 34px)",
        transform: open ? "translateX(0)" : "translateX(350px)",
        transition: "transform .3s cubic-bezier(.4,0,.2,1)",
        display: "flex", pointerEvents: "none",
      }}
    >
      {/* Left-edge toggle tab */}
      <button
        onClick={onToggle}
        aria-label={open ? "Hide speaker notes" : "Show speaker notes"}
        style={{
          alignSelf: "center", width: 34, height: 52, flexShrink: 0,
          borderRadius: "10px 0 0 10px",
          border: `1px solid ${COLORS.hairline}`, borderRight: "none",
          background: open ? "rgba(255,255,255,.10)" : "rgba(255,255,255,.05)",
          color: COLORS.text, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)", pointerEvents: "auto",
          fontFamily: FONTS.mono, fontSize: 14, fontWeight: 600, lineHeight: 1,
        }}
      >
        {open ? "›" : "☰"}
      </button>

      {/* Panel */}
      <div style={{
        width: 350, flexShrink: 0, height: "100%",
        background: "rgba(11,14,20,.94)", backdropFilter: "blur(16px)",
        borderLeft: `1px solid ${COLORS.hairline}`,
        boxShadow: open ? "-4px 0 30px rgba(0,0,0,.5)" : "none",
        overflowY: "auto", overflowX: "hidden", pointerEvents: "auto",
      }}>
        {/* Header */}
        <div style={{ padding: "22px 20px 14px", borderBottom: `1px solid ${COLORS.hairline}` }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          }}>
            <span style={{
              fontFamily: FONTS.mono, fontSize: 12, letterSpacing: "0.12em",
              textTransform: "uppercase", color: COLORS.muted,
            }}>
              Speaker Notes
            </span>
            {notes?.time && (
              <span style={{
                fontFamily: FONTS.mono, fontSize: 11, color: accent,
                border: `1px solid ${accent}55`, borderRadius: 5, padding: "2px 7px",
              }}>
                {notes.time}
              </span>
            )}
          </div>
          <div style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.text, marginTop: 8 }}>
            {chapterTitle}
          </div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.faint, marginTop: 2 }}>
            {slideLabel}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 20px 24px" }}>
          {!has && (
            <div style={{ textAlign: "center", padding: "40px 16px", color: COLORS.faint, fontSize: 14, lineHeight: 1.6 }}>
              No speaker notes for this slide yet.
            </div>
          )}

          {notes?.say && (
            <Section label="Say this" accent={accent}>
              <div style={{
                fontSize: 14, lineHeight: 1.65, color: COLORS.text,
                padding: "12px 14px", background: "rgba(255,255,255,.03)",
                borderRadius: 10, borderLeft: `3px solid ${accent}`,
              }}>
                {notes.say}
              </div>
            </Section>
          )}

          {notes?.demo && (
            <Section label="On screen" accent={accent}>
              <div style={{
                fontSize: 13.5, lineHeight: 1.6, color: COLORS.muted,
                padding: "10px 12px", background: `${accent}0d`,
                borderRadius: 10, border: `1px solid ${accent}33`,
              }}>
                {notes.demo}
              </div>
            </Section>
          )}

          {notes?.points?.length > 0 && (
            <Section label="Key points" accent={accent}>
              {notes.points.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 7, fontSize: 13.5, lineHeight: 1.55, color: COLORS.muted }}>
                  <span style={{ color: accent, flexShrink: 0 }}>•</span>
                  <span>{p}</span>
                </div>
              ))}
            </Section>
          )}

          {notes?.ask?.length > 0 && (
            <Section label="Ask the room" accent={accent}>
              {notes.ask.map((q, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 7, fontSize: 13.5, lineHeight: 1.55, color: COLORS.muted, fontStyle: "italic" }}>
                  <span style={{ color: `${accent}aa`, flexShrink: 0 }}>{i + 1}.</span>
                  <span>“{q}”</span>
                </div>
              ))}
            </Section>
          )}

          {notes?.caveat && (
            <Section label="The honest bit" accent={COLORS.muted}>
              <div style={{
                fontSize: 13, lineHeight: 1.6, color: COLORS.muted,
                padding: "10px 12px", background: "rgba(255,255,255,.02)",
                borderRadius: 10, borderLeft: `3px solid ${COLORS.faint}`,
              }}>
                {notes.caveat}
              </div>
            </Section>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "10px 20px 16px", borderTop: `1px solid ${COLORS.hairline}`,
          fontSize: 11, color: COLORS.faint, textAlign: "center",
        }}>
          <kbd style={{ padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,.08)", fontSize: 10 }}>N</kbd> notes ·{" "}
          <kbd style={{ padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,.08)", fontSize: 10 }}>P</kbd> exit present
        </div>
      </div>
    </div>
  );
}
