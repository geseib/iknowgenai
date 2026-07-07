// The chapter shell: renders the current slide, top progress bar, chapter
// drawer, keyboard/touch navigation, and end-of-chapter interstitials.
import { useCallback, useEffect, useRef, useState } from "react";
import { FONTS, COLORS, TYPE, SPACE, MOBILE_BREAK } from "./styles/theme.js";
import { CHAPTERS, BUILT_CHAPTERS } from "./data/chapters.js";
import SpeakerNotes from "./ui/SpeakerNotes.jsx";
import { getSpeakerNotes } from "./data/speakerNotes.js";

export default function ChapterView({ chapter, slide, progress, navigate }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [interstitial, setInterstitial] = useState(false);
  const touchStart = useRef(null);

  // Presentation mode: a speaker drives, slides shed their secondary prose, and
  // a notes panel rides along. The choice persists across slides and reloads.
  const [present, setPresent] = useState(() => {
    try { return localStorage.getItem("ikg.course.present") === "1"; } catch { return false; }
  });
  const [notesOpen, setNotesOpen] = useState(true);
  const togglePresent = useCallback(() => {
    setPresent((p) => {
      const nv = !p;
      try { localStorage.setItem("ikg.course.present", nv ? "1" : "0"); } catch { /* ignore */ }
      return nv;
    });
  }, []);

  const builtIndex = BUILT_CHAPTERS.findIndex((c) => c.slug === chapter.slug);
  const nextChapter = BUILT_CHAPTERS[builtIndex + 1] || null;
  const prevChapter = BUILT_CHAPTERS[builtIndex - 1] || null;

  // Course-wide progress, weighted by slides across built chapters.
  const totalSlides = BUILT_CHAPTERS.reduce((a, c) => a + c.slideCount, 0);
  const slidesBefore = BUILT_CHAPTERS.slice(0, builtIndex).reduce((a, c) => a + c.slideCount, 0);
  const progressPct = ((slidesBefore + slide + 1) / totalSlides) * 100;

  const next = useCallback(() => {
    if (interstitial) {
      setInterstitial(false);
      if (nextChapter) navigate(nextChapter.slug, 0, { push: true });
      return;
    }
    if (slide < chapter.slideCount - 1) {
      navigate(chapter.slug, slide + 1);
    } else if (nextChapter) {
      setInterstitial(true);
    } else {
      navigate(null, 0, { push: true }); // end of built content → syllabus
    }
  }, [interstitial, slide, chapter, nextChapter, navigate]);

  const prev = useCallback(() => {
    if (interstitial) { setInterstitial(false); return; }
    if (slide > 0) {
      navigate(chapter.slug, slide - 1);
    } else if (prevChapter) {
      navigate(prevChapter.slug, prevChapter.slideCount - 1, { push: true });
    }
  }, [interstitial, slide, chapter, prevChapter, navigate]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "Escape") { setDrawerOpen(false); return; }
      if (drawerOpen) return;
      if (e.key === "p" || e.key === "P") { togglePresent(); return; }
      if (e.key === "n" || e.key === "N") { setNotesOpen((o) => !o); return; }
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, drawerOpen, togglePresent]);

  // Horizontal swipe on touch devices.
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

  const Component = chapter.Component;

  return (
    <div
      className={present ? "presenting" : undefined}
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Progress bar — hidden while presenting for a cleaner screen */}
      {!present && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,.06)", zIndex: 60 }}>
          <div
            style={{
              height: "100%", width: `${progressPct}%`, background: chapter.accent,
              transition: "width 280ms cubic-bezier(.2,.7,.3,1)",
            }}
          />
        </div>
      )}

      {/* Header */}
      <div
        style={{
          position: "fixed", top: 3, left: 0, right: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: `${SPACE.sm}px ${SPACE.md}px`,
          background: present ? "transparent" : "linear-gradient(#0B0E14 55%, transparent)",
        }}
      >
        {present ? (
          <>
            <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: chapter.accent, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: chapter.accent, display: "inline-block" }} />
              PRESENTING
            </span>
            <button
              onClick={togglePresent}
              style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.faint, padding: "6px 0" }}
            >
              Exit present (P)
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate(null, 0, { push: true })}
              style={{ fontSize: 14, fontWeight: 600, color: COLORS.muted, padding: "6px 0" }}
            >
              ← Syllabus
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <button
                onClick={togglePresent}
                title="Presentation mode (P)"
                style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.faint, display: "flex", alignItems: "center", gap: 6, padding: "6px 0" }}
              >
                ▶ Present
              </button>
              <button
                onClick={() => setDrawerOpen(true)}
                style={{ fontSize: 14, color: COLORS.muted, display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: chapter.accent }}>
                  {String(chapter.num).padStart(2, "0")}
                </span>
                <span style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {chapter.title}
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.faint }}>
                  {slide + 1}/{chapter.slideCount}
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Slide content — pad right so the open notes panel never covers a demo */}
      <div
        className="present-stage"
        style={{
          flex: 1, paddingTop: 56,
          paddingRight: present && notesOpen ? 372 : 0,
          transition: "padding-right .3s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {interstitial && nextChapter ? (
          <Interstitial chapter={chapter} nextChapter={nextChapter} onContinue={next} navigate={navigate} />
        ) : (
          <Component key={`${chapter.slug}-${slide}`} accent={chapter.accent} slide={slide} />
        )}
      </div>

      {/* Speaker notes — only in presentation mode */}
      {present && (
        <SpeakerNotes
          open={notesOpen}
          onToggle={() => setNotesOpen((o) => !o)}
          notes={getSpeakerNotes(chapter.slug, slide)}
          accent={chapter.accent}
          chapterTitle={`${String(chapter.num).padStart(2, "0")} · ${chapter.title}`}
          slideLabel={interstitial ? "Chapter complete" : `Slide ${slide + 1} / ${chapter.slideCount}`}
        />
      )}

      {/* Footer nav */}
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
          disabled={slide === 0 && !prevChapter && !interstitial}
          style={{ fontSize: 15, color: COLORS.muted, padding: "10px 14px", opacity: slide === 0 && !prevChapter ? 0.3 : 1 }}
        >
          ← Back
        </button>
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: chapter.slideCount }, (_, i) => (
            <button
              key={i}
              onClick={() => { setInterstitial(false); navigate(chapter.slug, i); }}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: 7, height: 7, borderRadius: "50%", padding: 0,
                background: i === slide && !interstitial ? chapter.accent : "rgba(255,255,255,.15)",
                transition: "background 200ms",
              }}
            />
          ))}
        </div>
        <button
          onClick={next}
          style={{
            fontSize: 15, fontWeight: 600, color: COLORS.text, padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          {interstitial || slide < chapter.slideCount - 1 ? "Next" : nextChapter ? "Finish chapter" : "Finish"} →
        </button>
      </div>

      {/* Chapter drawer */}
      {drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 70, animation: "v2FadeIn 200ms both" }}
          />
          <Drawer
            current={chapter}
            progress={progress}
            onPick={(slug) => { setDrawerOpen(false); setInterstitial(false); navigate(slug, 0, { push: true }); }}
          />
        </>
      )}
    </div>
  );
}

function Interstitial({ chapter, nextChapter, onContinue, navigate }) {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 56px)", display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center", padding: SPACE.md, textAlign: "center",
      }}
      className="reveal-slow"
    >
      <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: chapter.accent, marginBottom: SPACE.sm }}>
        ✓ Chapter {chapter.num} complete
      </div>
      <div style={{ fontSize: 15, color: COLORS.muted, marginBottom: 8 }}>Next up</div>
      <h2 style={{ fontSize: TYPE.h1, fontWeight: 500, maxWidth: 560 }}>{nextChapter.title}</h2>
      <p style={{ fontSize: TYPE.body, color: COLORS.muted, maxWidth: "46ch", marginTop: SPACE.sm, lineHeight: 1.7 }}>
        {nextChapter.blurb}
      </p>
      <div style={{ display: "flex", gap: SPACE.sm, marginTop: SPACE.lg }}>
        <button className="btn" style={{ background: nextChapter.accent, color: "#0B0E14" }} onClick={onContinue}>
          Continue
        </button>
        <button className="btn btn-ghost" onClick={() => navigate(null, 0, { push: true })}>
          Take a break
        </button>
      </div>
    </div>
  );
}

function Drawer({ current, progress, onPick }) {
  const mobile = window.innerWidth <= MOBILE_BREAK;
  return (
    <div
      style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 80,
        width: mobile ? "100%" : 380,
        background: COLORS.surface,
        borderLeft: `1px solid ${COLORS.hairline}`,
        overflowY: "auto",
        padding: SPACE.md,
        animation: "v2FadeUp 240ms cubic-bezier(.2,.7,.3,1) both",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.faint, marginBottom: SPACE.sm }}>
        Chapters
      </div>
      {CHAPTERS.map((ch) => {
        const built = Boolean(ch.Component);
        const done = progress.chapters[ch.slug]?.done;
        const active = ch.slug === current.slug;
        return (
          <button
            key={ch.id}
            onClick={built ? () => onPick(ch.slug) : undefined}
            disabled={!built}
            style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%",
              padding: "12px 10px", borderRadius: 10, textAlign: "left",
              background: active ? "rgba(255,255,255,.06)" : "transparent",
              opacity: built ? 1 : 0.4, cursor: built ? "pointer" : "default",
            }}
          >
            <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: done ? ch.accent : COLORS.faint, minWidth: 22 }}>
              {done ? "✓" : String(ch.num).padStart(2, "0")}
            </span>
            <span style={{ flex: 1, fontSize: 15, color: active ? COLORS.text : COLORS.muted }}>
              {ch.title}
            </span>
            {!built && <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.faint }}>soon</span>}
          </button>
        );
      })}
    </div>
  );
}
