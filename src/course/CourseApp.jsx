// Root of the 14+ course. Owns the hash "router" (/course#slug/slide),
// progress persistence, and the v2 stylesheet. Bare /course = syllabus landing.
import { useCallback, useEffect, useState } from "react";
import { COURSE_CSS } from "./styles/global.js";
import { COURSE_TITLE, BY_SLUG } from "./data/chapters.js";
import { loadProgress, recordPosition } from "./data/progress.js";
import Landing from "./Landing.jsx";
import ChapterView from "./ChapterView.jsx";

function parseHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return { chapter: null, slide: 0 };
  const [slug, slideStr] = hash.split("/");
  const ch = BY_SLUG[slug];
  if (!ch || !ch.Component) return { chapter: null, slide: 0 };
  const slide = Math.min(Math.max(parseInt(slideStr, 10) || 0, 0), ch.slideCount - 1);
  return { chapter: ch, slide };
}

export default function CourseApp() {
  const [route, setRoute] = useState(parseHash);
  const [progress, setProgress] = useState(loadProgress);

  useEffect(() => {
    document.title = COURSE_TITLE;
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // navigate(null) → landing. push=true adds a history entry (chapter jumps);
  // slide-to-slide movement replaces, so Back exits the chapter, not each slide.
  const navigate = useCallback((slug, slide = 0, { push = false } = {}) => {
    const hash = slug ? `#${slug}${slide > 0 ? `/${slide}` : ""}` : "";
    const url = window.location.pathname + window.location.search + hash;
    if (push) window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
    const ch = slug ? BY_SLUG[slug] : null;
    setRoute({ chapter: ch && ch.Component ? ch : null, slide: ch ? slide : 0 });
    if (ch && ch.Component) {
      setProgress((p) => recordPosition(p, slug, slide, ch.slideCount));
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="v2">
      <style>{COURSE_CSS}</style>
      {route.chapter ? (
        <ChapterView
          chapter={route.chapter}
          slide={route.slide}
          progress={progress}
          navigate={navigate}
        />
      ) : (
        <Landing progress={progress} navigate={navigate} />
      )}
    </div>
  );
}
