// The teacher's room controls during a lesson: a small corner badge (code, mode,
// joined count) that opens a panel with the join QR (phones mode), the pairing
// box (tablet mode), the Interaction switch, a freeze toggle, and End room.
// Rendered only while a room exists; projector mode has no room.

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { DeviceMobile, DeviceTablet, PauseCircle, PlayCircle, X, Users, Power, Warning } from "@phosphor-icons/react";
import { useRoom, buildJoinUrl } from "../data/room";
import { INTERACTION_MODES } from "../data/lesson";
import LessonMenu from "./LessonMenu";

const FONT = "'Fredoka',sans-serif";

export default function PresenterBar({ lesson, onLessonChange }) {
  const { room, mode, tally, error, setMode, end, freeze, pair, unpair, clearError } = useRoom();
  const [open, setOpen] = useState(false);
  const [pairCode, setPairCode] = useState("");
  const [pairMsg, setPairMsg] = useState(null);

  if (!room) return null;

  const frozen = Boolean(tally?.frozen);
  const joined = tally?.joined ?? 0;
  const paired = Boolean(tally?.tabletPaired);
  const openQ = tally?.questions ? Object.values(tally.questions).filter(q => q.open).length : 0;
  const modeMeta = INTERACTION_MODES.find(m => m.id === mode);
  const accent = frozen ? "#fb5607" : mode === "tablet" ? "#fee440" : "#00bbf9";

  const changeMode = async (next) => {
    await setMode(next);
    onLessonChange?.({ ...lesson, interaction: next });
  };

  const submitPair = async () => {
    setPairMsg(null);
    const res = await pair(pairCode.trim());
    if (res?.ok) { setPairMsg({ ok: true, text: "Tablet paired." }); setPairCode(""); }
    else setPairMsg({ ok: false, text: "That code didn't match. Check the tablet's screen and try again." });
  };

  return (
    <>
      {/* Badge */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Room controls"
        style={{
          position: "fixed", top: 14, right: 14, zIndex: 160,
          display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 999,
          background: "rgba(5,5,18,.85)", border: `1.5px solid ${accent}66`, color: "white",
          fontFamily: FONT, fontSize: 14, cursor: "pointer", backdropFilter: "blur(6px)",
        }}
      >
        {mode === "tablet" ? <DeviceTablet size={18} weight="duotone" color={accent} /> : <DeviceMobile size={18} weight="duotone" color={accent} />}
        <span style={{ letterSpacing: 2, fontWeight: 700 }}>{room.code}</span>
        <span style={{ color: "rgba(255,255,255,.5)" }}>{modeMeta?.short}</span>
        {mode === "phones" && <span style={{ color: "rgba(255,255,255,.5)", display: "inline-flex", alignItems: "center", gap: 4 }}><Users size={15} weight="duotone" /> {joined}</span>}
        {mode === "tablet" && <span style={{ color: paired ? "#00f5d4" : "#fb5607" }}>{paired ? "paired" : "not paired"}</span>}
        {frozen && <span style={{ color: accent, fontWeight: 700 }}>PAUSED</span>}
        {openQ > 0 && !frozen && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00f5d4", boxShadow: "0 0 8px #00f5d4" }} title="voting open" />}
      </button>

      {/* Panel */}
      {open && (
        <div style={{ position: "fixed", top: 60, right: 14, zIndex: 160, width: 360, maxWidth: "calc(100vw - 28px)", background: "#0b0f1e", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: 18, boxShadow: "0 24px 60px -20px rgba(0,0,0,.8)", color: "white", fontFamily: "'Nunito',sans-serif" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: FONT, fontSize: 18 }}>Room <span style={{ letterSpacing: 3, fontWeight: 700 }}>{room.code}</span></div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer" }} aria-label="Close"><X size={20} weight="bold" /></button>
          </div>

          {mode === "phones" && (
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
              <div style={{ background: "white", borderRadius: 12, padding: 8, flexShrink: 0 }}>
                <QRCodeSVG value={buildJoinUrl(room.code)} size={104} level="M" />
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.55)", lineHeight: 1.5 }}>
                Kids scan this, or open the site and add <span style={{ fontFamily: FONT, color: "white" }}>?join={room.code}</span>.<br />
                <span style={{ color: "white", fontFamily: FONT, fontSize: 15 }}>{joined} joined</span>
              </div>
            </div>
          )}

          {mode === "tablet" && (
            <div style={{ marginBottom: 14, padding: 12, borderRadius: 12, background: "rgba(254,228,64,.06)", border: "1px solid rgba(254,228,64,.25)" }}>
              {paired ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
                  <span style={{ color: "#fee440", fontFamily: FONT }}>Class tablet paired</span>
                  <button onClick={unpair} style={{ background: "none", border: "1px solid rgba(255,255,255,.2)", color: "rgba(255,255,255,.6)", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Unpair</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.5, marginBottom: 8 }}>
                    On the tablet: open the site, add <span style={{ fontFamily: FONT, color: "white" }}>?join={room.code}</span>, tap <em>make this device the class tablet</em>, then type its two-digit number here.
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      id="tablet-pairing-code"
                      value={pairCode}
                      onChange={e => setPairCode(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      onKeyDown={e => { if (e.key === "Enter") submitPair(); e.stopPropagation(); }}
                      placeholder="42"
                      inputMode="numeric"
                      style={{ width: 80, fontFamily: FONT, fontSize: 24, letterSpacing: 4, textAlign: "center", padding: "6px 8px", borderRadius: 10, border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.06)", color: "white" }}
                    />
                    <button onClick={submitPair} disabled={pairCode.length !== 2} className="cta-btn" style={{ background: "#fee440", color: "#000", fontFamily: FONT, fontSize: 15, padding: "8px 16px", border: "none", borderRadius: 10, cursor: "pointer", opacity: pairCode.length === 2 ? 1 : .4 }}>Pair</button>
                  </div>
                  {pairMsg && <div style={{ marginTop: 8, fontSize: 13, color: pairMsg.ok ? "#00f5d4" : "#ff6b6b" }}>{pairMsg.text}</div>}
                </>
              )}
            </div>
          )}

          <LessonMenu lesson={{ ...lesson, interaction: mode }} onChange={l => changeMode(l.interaction)} compact />

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={() => freeze(!frozen)} style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 10px", borderRadius: 10, border: `1px solid ${frozen ? "#fb5607" : "rgba(255,255,255,.18)"}`, background: frozen ? "#fb560722" : "transparent", color: "white", fontFamily: FONT, fontSize: 14, cursor: "pointer" }}>
              {frozen ? <><PlayCircle size={18} weight="duotone" /> Resume devices</> : <><PauseCircle size={18} weight="duotone" /> Freeze devices</>}
            </button>
            <button onClick={() => { if (window.confirm("End the room? Kids' screens will show 'room not found'.")) end(); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(255,107,107,.4)", background: "transparent", color: "#ff6b6b", fontFamily: FONT, fontSize: 14, cursor: "pointer" }}>
              <Power size={18} weight="duotone" /> End
            </button>
          </div>

          {error && (
            <div onClick={clearError} style={{ marginTop: 10, fontSize: 12, color: "#ffb4a2", display: "flex", gap: 6, alignItems: "flex-start", cursor: "pointer" }}>
              <Warning size={16} weight="duotone" style={{ flexShrink: 0, marginTop: 1 }} /> {error}
            </div>
          )}
        </div>
      )}
    </>
  );
}
