// localStorage progress persistence for the v2 course.
const KEY = "ikg.course.v1";

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted or unavailable — start fresh */ }
  return { lastChapter: null, lastSlide: 0, chapters: {} };
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch { /* storage unavailable — progress just won't persist */ }
}

// Record that the learner is on `slide` of chapter `slug` (out of slideCount).
export function recordPosition(progress, slug, slide, slideCount) {
  const ch = progress.chapters[slug] || { furthestSlide: 0, done: false };
  const furthestSlide = Math.max(ch.furthestSlide, slide);
  const next = {
    ...progress,
    lastChapter: slug,
    lastSlide: slide,
    chapters: {
      ...progress.chapters,
      [slug]: { furthestSlide, done: ch.done || furthestSlide >= slideCount - 1 },
    },
  };
  saveProgress(next);
  return next;
}
