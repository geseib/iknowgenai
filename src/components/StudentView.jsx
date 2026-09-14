// What a joined phone (or the class tablet) sees at ?join=CODE.
//
// Phones only ever receive the questions that are open RIGHT NOW — never the deck —
// so nobody can vote ahead. Each phone gets one vote per question (re-tapping changes
// it). The paired tablet counts every tap, because each tap is a different kid.
// If Story Mash-Up is running, the classic ingredient-entry page shows instead.

import { createElement, useEffect, useState } from "react";
import { CheckCircle, HandWaving, Eye, DeviceTablet, PauseCircle, Sparkle } from "@phosphor-icons/react";
import { getStatus, deviceAction, useInterval, STATUS_POLL_MS } from "../data/room";
import JoinRoom from "./JoinRoom";

const FONT = "'Fredoka',sans-serif";
const BG = "#050512";

export default function StudentView({ code }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [picks, setPicks] = useState({});         // questionId → optionId (this device's vote)
  const [sending, setSending] = useState(null);   // questionId while a vote is in flight
  const [tabletFlash, setTabletFlash] = useState(null); // questionId → brief "got it" after a tablet tap
  const [pairing, setPairing] = useState(null);   // 2-digit code while waiting for the teacher

  // Register once, then poll the public status
  useEffect(() => {
    deviceAction(code, "join").catch(() => {});
  }, [code]);

  useInterval(async () => {
    try {
      const s = await getStatus(code, true);
      setStatus(s);
      setError(null);
      if (s.isTablet && pairing) setPairing(null);
    } catch {
      setError("Room not found. Check the code with your teacher.");
    }
  }, STATUS_POLL_MS, true);

  const vote = async (q, optionId) => {
    if (sending) return;
    setSending(q.id);
    try {
      await deviceAction(code, "vote", { questionId: q.id, optionId });
      if (status?.isTablet) {
        setTabletFlash(q.id);
        setTimeout(() => setTabletFlash(null), 1400);
      } else {
        setPicks(p => ({ ...p, [q.id]: optionId }));
      }
    } catch (err) {
      if (err.code === "question_closed") setStatus(s => s ? { ...s, questions: s.questions.filter(x => x.id !== q.id) } : s);
      else if (err.code === "frozen") setStatus(s => s ? { ...s, frozen: true } : s);
      else if (err.code === "tablet_only" || err.code === "projector_mode") setStatus(s => s ? { ...s, mode: err.code === "tablet_only" ? "tablet" : "projector" } : s);
    } finally {
      setSending(null);
    }
  };

  const requestTablet = async () => {
    try {
      const res = await deviceAction(code, "requestTablet");
      setPairing(res.pairing);
    } catch { /* ignore */ }
  };

  // Story Mash-Up takes over the whole page while it's running
  if (status?.storymash) return <JoinRoom code={code} />;

  const isTablet = Boolean(status?.isTablet);
  const big = isTablet;

  let body;
  if (error) body = <Notice icon={HandWaving} color="#ff6b6b" title="Hmm." text={error} />;
  else if (!status) body = <Notice icon={Sparkle} color="#00f5d4" title="Joining…" text={`Room ${code}`} />;
  else if (pairing && !isTablet) body = (
    <Notice icon={DeviceTablet} color="#fee440" title="Show this number to your teacher">
      <div style={{ fontFamily: FONT, fontSize: 96, fontWeight: 700, color: "#fee440", letterSpacing: 8, lineHeight: 1.1, margin: "8px 0" }}>{pairing}</div>
      <div style={{ color: "rgba(255,255,255,.45)", fontSize: 15 }}>They type it on the big screen. Then this becomes the class tablet.</div>
    </Notice>
  );
  else if (status.frozen) body = <Notice icon={PauseCircle} color="#fb5607" title="Paused" text="Look up at your teacher!" />;
  else if (status.mode === "projector") body = <Notice icon={Eye} color="#00bbf9" title="Look up!" text="Today we're answering out loud. Your teacher will tally the room." />;
  else if (status.mode === "tablet" && !isTablet) body = <Notice icon={DeviceTablet} color="#00bbf9" title="Look up!" text="This round runs on the class tablet. Wait for it to come to you." />;
  else if (!status.questions?.length) body = <Notice icon={Eye} color="#00f5d4" title={isTablet ? "Nothing to answer yet" : "Waiting for your teacher…"} text="A question will appear here when it's time to vote." />;
  else body = (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {status.questions.map(q => {
        const mine = picks[q.id];
        const flashed = tabletFlash === q.id;
        return (
          <div key={q.id} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: big ? "22px 20px" : "18px 16px" }}>
            {q.prompt && <div style={{ fontFamily: FONT, fontSize: big ? 30 : 22, color: "white", lineHeight: 1.25, marginBottom: 14, textAlign: "center" }}>{q.prompt}</div>}
            <div style={{ display: "grid", gridTemplateColumns: big && q.options.length > 2 ? "1fr 1fr" : "1fr", gap: 10 }}>
              {q.options.map(o => {
                const picked = mine === o.id;
                const c = o.color || "#00f5d4";
                return (
                  <button
                    key={o.id}
                    onClick={() => vote(q, o.id)}
                    disabled={Boolean(sending) || flashed}
                    style={{
                      fontFamily: FONT, fontSize: big ? 30 : 22, fontWeight: 600,
                      padding: big ? "26px 18px" : "16px 16px", borderRadius: 16, cursor: "pointer",
                      background: picked ? `${c}26` : "rgba(255,255,255,.06)",
                      border: `2px solid ${picked ? c : "rgba(255,255,255,.14)"}`,
                      color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      opacity: flashed ? .5 : 1, transition: "all .2s ease", minHeight: big ? 90 : 60,
                    }}
                  >
                    {picked && <CheckCircle size={24} weight="fill" color={c} />}
                    {o.label}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 12, textAlign: "center", fontSize: big ? 18 : 14, color: "rgba(255,255,255,.4)", minHeight: 20 }}>
              {isTablet
                ? (flashed ? <span style={{ color: "#00f5d4", fontWeight: 600 }}>Got it — pass the tablet!</span> : "Tap your answer, then pass it on.")
                : (mine ? "Sent. You can change your answer until the reveal." : "Tap one.")}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "white", fontFamily: "'Nunito',sans-serif", padding: "20px 16px 40px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: FONT, fontSize: 14, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,.35)" }}>
            Room <span style={{ color: "white", fontWeight: 700 }}>{code}</span>
          </div>
          {isTablet && (
            <div style={{ fontFamily: FONT, fontSize: 13, padding: "4px 10px", borderRadius: 999, background: "#fee44022", border: "1px solid #fee44066", color: "#fee440", display: "flex", alignItems: "center", gap: 6 }}>
              <DeviceTablet size={16} weight="duotone" /> Class tablet
            </div>
          )}
        </div>
        {body}
        {status && !isTablet && !pairing && status.mode === "tablet" && (
          <button onClick={requestTablet} style={{ marginTop: 28, background: "none", border: "1px dashed rgba(255,255,255,.2)", borderRadius: 12, color: "rgba(255,255,255,.45)", padding: "10px 16px", fontFamily: FONT, fontSize: 14, cursor: "pointer", width: "100%" }}>
            Teacher: make this device the class tablet
          </button>
        )}
      </div>
    </div>
  );
}

function Notice({ icon, color, title, text, children }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 12px" }}>
      {createElement(icon, { size: 56, weight: "duotone", color, style: { marginBottom: 12 } })}
      <div style={{ fontFamily: FONT, fontSize: 30, color: "white", marginBottom: 8, lineHeight: 1.2 }}>{title}</div>
      {text && <div style={{ color: "rgba(255,255,255,.5)", fontSize: 17, lineHeight: 1.5 }}>{text}</div>}
      {children}
    </div>
  );
}
