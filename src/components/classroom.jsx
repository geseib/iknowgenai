// Classroom-response primitives for projector-only delivery.
//
// The room votes out loud (hands, shouts); the teacher enters what the room
// said. Every interactive beat in a section states an *input contract* (a
// vote, a pick) and these components satisfy it with zero student devices.
//
//   useTally(n) / useTallySet(k, n) — vote counts that survive slide changes
//                                     (in ./useTally.js; hoist into the section)
//   <Tally>                          — counters + live bars, hotkeys 1..9
//   <PredictGate>                    — the class commits BEFORE the reveal
//
// Design rules (see docs/SIDEQUEST-PEDAGOGY.md, "Predict Gate"): a reveal is
// only pedagogy if the room predicted first; being wrong gets the more
// interesting explanation; the correct option is visibly marked on resolve.

import { useState, useEffect, useCallback } from "react";
import { leaderOf } from "./useTally";
import { Plus, Minus, ArrowCounterClockwise, CheckCircle, Eye } from "@phosphor-icons/react";

const FONT = "'Fredoka',sans-serif";

const pct = (v, total) => (total ? Math.round((v / total) * 100) : 0);

/* ── Tally ───────────────────────────────────────────────────────────── */

/**
 * Props
 *   options   [{ id, label, color? }]
 *   tally     handle from useTally / useTallySet (controlled)
 *   color     section accent
 *   hotkeys   array of key strings, one per option (default "1".."9"); [] disables
 *   compare   [{ id, pct, label? }] — a second, dimmer bar per option (e.g. "AI says 42%")
 *   compareLabel  legend label for the compare bars (default "AI")
 *   correct   id | id[] — marked with ✓ once `resolved`
 *   resolved  boolean — show correct marks, freeze inputs
 *   compact   inline variant (pills) for use inside cards
 *   hint      teacher instruction line (default explains + and hotkeys)
 *   dense     tighter rows for slides that also carry a big visual
 */
export function Tally({ options, tally, color, hotkeys, compare, compareLabel = "AI", correct, resolved = false, compact = false, hint, dense = false }) {
  const keys = hotkeys ?? options.map((_, i) => String(i + 1));
  const correctIds = correct == null ? [] : Array.isArray(correct) ? correct : [correct];
  const { counts, total, inc, dec, reset } = tally;

  useEffect(() => {
    if (!keys.length || resolved) return;
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const i = keys.indexOf(e.key);
      if (i >= 0) { e.preventDefault(); e.shiftKey ? dec(i) : inc(i); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keys.join(","), resolved, inc, dec]);

  const leader = leaderOf(counts);
  const hintText = hint ?? (compact
    ? null
    : `Teacher: tap + once per hand${keys.length ? ` (or press ${keys.slice(0, options.length).join(" ")} — Shift to undo)` : ""}.`);

  if (compact) {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {options.map((o, i) => {
          const isCorrect = resolved && correctIds.includes(o.id);
          const isLeader = leader === i;
          return (
            <div key={o.id} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 8px 6px 14px", borderRadius: 999,
              background: isCorrect ? `${o.color || color}22` : isLeader ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.04)",
              border: `2px solid ${isCorrect ? (o.color || color) : isLeader ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.12)"}`,
              fontFamily: FONT, fontSize: 18, color: "white",
              transition: "all .25s ease",
            }}>
              {isCorrect && <CheckCircle size={20} weight="fill" color={o.color || color} />}
              <span>{o.label}</span>
              <span style={{ fontWeight: 700, minWidth: 22, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{counts[i]}</span>
              {!resolved && (
                <>
                  <RoundBtn onClick={() => inc(i)} color={o.color || color} title={keys[i] ? `+1 (key ${keys[i]})` : "+1"} small><Plus size={16} weight="bold" /></RoundBtn>
                  <RoundBtn onClick={() => dec(i)} dim title="−1" small><Minus size={14} weight="bold" /></RoundBtn>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const maxShare = Math.max(...counts.map(v => pct(v, total)), ...(compare?.map(c => c.pct) ?? [0]), 1);

  return (
    <div style={{ width: "100%", maxWidth: 640, textAlign: "left" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: dense ? 4 : 10 }}>
        {options.map((o, i) => {
          const share = pct(counts[i], total);
          const cmp = compare?.find(c => c.id === o.id);
          const isCorrect = resolved && correctIds.includes(o.id);
          const isLeader = leader === i;
          const barColor = o.color || color;
          return (
            <div key={o.id} style={{
              display: "grid", gridTemplateColumns: "minmax(120px, 210px) 1fr 96px auto",
              gap: 12, alignItems: "center",
              padding: dense ? "4px 10px" : "8px 12px", borderRadius: 14,
              background: isCorrect ? `${barColor}14` : "transparent",
              border: `2px solid ${isCorrect ? `${barColor}66` : "transparent"}`,
              transition: "all .3s ease",
            }}>
              <div style={{ fontFamily: FONT, fontSize: dense ? 20 : 24, fontWeight: isLeader || isCorrect ? 700 : 500, color: "white", display: "flex", alignItems: "center", gap: 8, lineHeight: 1.15 }}>
                {isCorrect && <CheckCircle size={dense ? 20 : 24} weight="fill" color={barColor} style={{ flexShrink: 0 }} />}
                <span style={{ overflowWrap: "anywhere" }}>{o.label}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ height: cmp ? 14 : dense ? 16 : 22, background: "rgba(255,255,255,.07)", borderRadius: 11, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(share / maxShare) * 100}%`, background: barColor, borderRadius: 11, transition: "width .35s ease", boxShadow: isLeader ? `0 0 14px ${barColor}55` : "none" }} />
                </div>
                {cmp && (
                  <div style={{ height: 10, background: "rgba(255,255,255,.05)", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(cmp.pct / maxShare) * 100}%`, background: "rgba(255,255,255,.35)", borderRadius: 5 }} />
                  </div>
                )}
              </div>
              <div style={{ fontFamily: FONT, fontVariantNumeric: "tabular-nums", textAlign: "right", lineHeight: 1.15 }}>
                <div style={{ fontSize: dense ? 19 : 22, fontWeight: 700, color: "white" }}>
                  {counts[i]}<span style={{ fontSize: 15, color: "rgba(255,255,255,.45)", fontWeight: 500 }}> · {share}%</span>
                </div>
                {cmp && <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>{compareLabel} {cmp.pct}%</div>}
              </div>
              <div style={{ display: "flex", gap: 6, visibility: resolved ? "hidden" : "visible" }}>
                <RoundBtn onClick={() => inc(i)} color={barColor} title={keys[i] ? `+1 (key ${keys[i]})` : "+1"} small={dense}><Plus size={dense ? 16 : 20} weight="bold" /></RoundBtn>
                <RoundBtn onClick={() => dec(i)} dim title="−1 (Shift+key)" small={dense}><Minus size={dense ? 14 : 18} weight="bold" /></RoundBtn>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: dense ? 6 : 12, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontFamily: FONT, fontSize: 15, color: "rgba(255,255,255,.4)" }}>
          {total > 0
            ? <>{total} vote{total === 1 ? "" : "s"}{leader != null && <> · most said <strong style={{ color: "white" }}>{options[leader].label}</strong></>}</>
            : hintText}
        </div>
        {!resolved && total > 0 && (
          <button onClick={reset} title="Reset votes" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.35)", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: FONT, fontSize: 14 }}>
            <ArrowCounterClockwise size={16} weight="bold" /> reset
          </button>
        )}
      </div>
      {compare && total > 0 && (
        <div style={{ display: "flex", gap: 16, marginTop: 6, fontFamily: FONT, fontSize: 13, color: "rgba(255,255,255,.4)" }}>
          <span><i style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: color, marginRight: 6, verticalAlign: "middle" }} />Our class</span>
          <span><i style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "rgba(255,255,255,.35)", marginRight: 6, verticalAlign: "middle" }} />{compareLabel}</span>
        </div>
      )}
    </div>
  );
}

function RoundBtn({ onClick, color, dim, title, small, children }) {
  const size = small ? 30 : 38;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={title}
      aria-label={title}
      style={{
        width: size, height: size, borderRadius: 10, border: "none", cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: dim ? "rgba(255,255,255,.08)" : `${color}cc`,
        color: dim ? "rgba(255,255,255,.6)" : "#08101c",
        transition: "transform .1s ease",
      }}
      onMouseDown={e => { e.currentTarget.style.transform = "scale(.92)"; }}
      onMouseUp={e => { e.currentTarget.style.transform = "none"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
    >
      {children}
    </button>
  );
}

/* ── PredictGate ─────────────────────────────────────────────────────── */

/**
 * The class commits, then the teacher reveals. Until reveal, `children` are
 * hidden (or, when `children` is a function, called with `revealed=false`).
 *
 * Props
 *   prompt       the question the room answers ("Which word wins?")
 *   options      [{ id, label, color? }]
 *   tally        handle from useTally (hoist it so votes survive slide changes)
 *   color        section accent
 *   correct      id | id[] — marked on reveal; drives the "you called it" line
 *   compare      passed through to Tally (e.g. the model's percentages)
 *   compareLabel passed through to Tally
 *   hotkeys      passed through to Tally
 *   revealLabel  button text (default "Reveal")
 *   revealKey    keyboard shortcut (default "Enter")
 *   resolution   optional (leaderId, correctIds) => string, replaces the default outcome line
 *   onReveal     callback
 *   revealed     optional controlled flag (with onReveal) — otherwise internal
 *   dense        tighter layout for slides that also carry a big visual
 *   children     node | (revealed: boolean) => node
 */
export function PredictGate({ prompt, options, tally, color, correct, compare, compareLabel, hotkeys, revealLabel = "Reveal", revealKey = "Enter", resolution, onReveal, revealed: revealedProp, dense = false, children }) {
  const [revealedState, setRevealedState] = useState(false);
  const revealed = revealedProp ?? revealedState;
  const reveal = useCallback(() => {
    if (revealed) return;
    setRevealedState(true);
    onReveal?.();
  }, [revealed, onReveal]);

  useEffect(() => {
    if (revealed || !revealKey) return;
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === revealKey) { e.preventDefault(); reveal(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, revealKey, reveal]);

  const correctIds = correct == null ? [] : Array.isArray(correct) ? correct : [correct];
  const leaderId = tally.leader != null ? options[tally.leader].id : null;
  const calledIt = leaderId != null && correctIds.includes(leaderId);

  let outcome = null;
  if (revealed) {
    if (resolution) outcome = resolution(leaderId, correctIds);
    else if (correctIds.length && leaderId == null) outcome = tally.total ? "It was a tie — so half of you called it." : "No votes were entered — next time, predict first!";
    else if (correctIds.length && calledIt) outcome = `You called it — most of the class said ${options[tally.leader].label}.`;
    else if (correctIds.length) outcome = `Surprise! Most of the class said ${options[tally.leader].label}. Here's why it's different →`;
  }

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: dense ? 12 : 18 }}>
      <div style={{ width: "100%", maxWidth: 680, padding: dense ? "12px 18px" : "18px 22px", borderRadius: 20, background: "rgba(255,255,255,.035)", border: `2px solid ${revealed ? "rgba(255,255,255,.08)" : `${color}55`}`, display: "flex", flexDirection: "column", alignItems: "center", gap: dense ? 8 : 14, transition: "border-color .3s ease" }}>
        <div style={{ fontFamily: FONT, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: revealed ? "rgba(255,255,255,.3)" : color, fontWeight: 700 }}>
          {revealed ? "The class said" : "First — call it"}
        </div>
        <div style={{ fontFamily: FONT, fontSize: dense ? 24 : 30, color: "white", textAlign: "center", lineHeight: 1.25 }}>{prompt}</div>
        <Tally options={options} tally={tally} color={color} correct={correct} resolved={revealed} compare={revealed ? compare : undefined} compareLabel={compareLabel} hotkeys={hotkeys} dense={dense} />
        {!revealed && (
          <button onClick={reveal} className="cta-btn" style={{ background: color, color: "#08101c", fontSize: dense ? 18 : 22, padding: dense ? "9px 22px" : "12px 30px", display: "inline-flex", alignItems: "center", gap: 10, fontFamily: FONT, fontWeight: 700, border: "none", borderRadius: 999, cursor: "pointer" }}>
            <Eye size={22} weight="bold" /> {revealLabel}{revealKey === "Enter" && <span style={{ fontSize: 14, fontWeight: 500, opacity: .7 }}> · Enter</span>}
          </button>
        )}
        {outcome && (
          <div style={{ fontFamily: FONT, fontSize: 20, color: calledIt ? color : "rgba(255,255,255,.75)", textAlign: "center", animation: "fadeUp .4s ease" }}>{outcome}</div>
        )}
      </div>
      {typeof children === "function"
        ? children(revealed)
        : revealed && <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 28, animation: "fadeUp .45s ease" }}>{children}</div>}
    </div>
  );
}
