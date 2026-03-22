import { useState, useEffect, useRef } from "react";
import { Sparkle, PaperPlaneTilt, CheckCircle, Warning, CaretLeft, CaretRight, UserCircle, Users } from "@phosphor-icons/react";

const ROLES = [
  { key: "character", label: "A Character", prompt: "Enter a character", placeholder: "e.g. a talking pizza, a shy robot…", color: "#00f5d4" },
  { key: "place",     label: "A Place",     prompt: "Enter a place",     placeholder: "e.g. the moon, a giant shoe…",          color: "#00bbf9" },
  { key: "event",     label: "Something That Happens", prompt: "Enter an event", placeholder: "e.g. everything turns to jello…", color: "#f15bb5" },
];

export default function JoinRoom({ code }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [entryMode, setEntryMode] = useState(null); // null | "single" | "all"
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState(0);     // for "all" mode: 0/1/2
  const [values, setValues] = useState(["", "", ""]); // for "all" mode
  const [value, setValue] = useState("");              // for "single" mode
  const [phase, setPhase] = useState("loading");
  const [blockMsg, setBlockMsg] = useState("");
  const [sentRoles, setSentRoles] = useState(new Set());
  const touchStartX = useRef(null);

  // Load room status
  useEffect(() => {
    fetch(`/api/room-status?code=${code}`)
      .then(r => {
        if (!r.ok) throw new Error("room_not_found");
        return r.json();
      })
      .then(data => {
        setStatus(data);
        setPhase("choose-mode");
      })
      .catch(() => {
        setError("Room not found. Check the code and try again.");
        setPhase("error");
      });
  }, [code]);

  // ── Single-role flow ──
  const pickRole = async (roleKey) => {
    try {
      const res = await fetch("/api/room-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, role: roleKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "role_taken") {
          const statusRes = await fetch(`/api/room-status?code=${code}`);
          if (statusRes.ok) setStatus(await statusRes.json());
          return;
        }
        throw new Error(data.error);
      }
      setRole(roleKey);
      setPhase("input");
    } catch (err) {
      setError(err.message);
    }
  };

  const submitSingle = async () => {
    if (!value.trim()) return;
    setPhase("sending");
    try {
      const res = await fetch("/api/room-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, role, value: value.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "blocked") {
          setBlockMsg(data.message);
          setPhase("blocked");
          return;
        }
        throw new Error(data.error);
      }
      setPhase("sent");
    } catch (err) {
      setError(err.message);
      setPhase("input");
    }
  };

  // ── All-roles flow ──
  const startAllMode = async () => {
    // Claim all unclaimed roles
    for (const r of ROLES) {
      try {
        await fetch("/api/room-join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, role: r.key }),
        });
      } catch (_) {}
    }
    setEntryMode("all");
    setPhase("input-all");
  };

  const submitRole = async (idx) => {
    const r = ROLES[idx];
    const val = values[idx]?.trim();
    if (!val) return;
    setPhase("sending");
    try {
      const res = await fetch("/api/room-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, role: r.key, value: val }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "blocked") {
          setBlockMsg(data.message);
          setPhase("blocked");
          return;
        }
        throw new Error(data.error);
      }
      setSentRoles(prev => new Set([...prev, r.key]));
      // Auto-advance to next unsent role, or show done
      const nextUnsent = ROLES.findIndex((ro, i) => i > idx && !sentRoles.has(ro.key) && ro.key !== r.key);
      if (nextUnsent >= 0) {
        setActiveTab(nextUnsent);
      } else {
        const anyUnsent = ROLES.findIndex((ro) => !sentRoles.has(ro.key) && ro.key !== r.key);
        if (anyUnsent >= 0) {
          setActiveTab(anyUnsent);
        }
      }
      setPhase("input-all");
      // Check if all sent
      const newSent = new Set([...sentRoles, r.key]);
      if (newSent.size === 3) {
        setPhase("sent");
      }
    } catch (err) {
      setError(err.message);
      setPhase("input-all");
    }
  };

  // Swipe handling for all-roles mode
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff < 0 && activeTab < 2) setActiveTab(t => t + 1);
      if (diff > 0 && activeTab > 0) setActiveTab(t => t - 1);
    }
    touchStartX.current = null;
  };

  const roleInfo = role ? ROLES.find(r => r.key === role) : null;
  const allRoleInfo = ROLES[activeTab];

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#0a0a0f",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
      fontFamily: "'Fredoka', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        fontSize: 16,
        color: "rgba(255,255,255,.35)",
        letterSpacing: 2,
        textTransform: "uppercase",
        marginBottom: 8,
      }}>
        Story Mash-Up
      </div>
      <div style={{
        fontSize: 14,
        color: "rgba(255,255,255,.25)",
        marginBottom: 32,
        letterSpacing: 3,
      }}>
        Room: {code}
      </div>

      {/* Loading */}
      {phase === "loading" && (
        <Sparkle size={40} weight="duotone" color="#fee440" className="spin" />
      )}

      {/* Error */}
      {phase === "error" && (
        <div style={{ textAlign: "center" }}>
          <Warning size={48} weight="duotone" color="#fb5607" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 20, color: "#fb5607" }}>{error}</div>
        </div>
      )}

      {/* Choose entry mode: one role or all roles */}
      {phase === "choose-mode" && status && (
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{
            fontSize: 22,
            color: "white",
            textAlign: "center",
            marginBottom: 24,
          }}>
            How are you entering?
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <button
              onClick={() => { setEntryMode("single"); setPhase("pick-role"); }}
              style={{
                padding: "22px 24px",
                borderRadius: 16,
                border: "2px solid rgba(255,255,255,.15)",
                background: "rgba(255,255,255,.05)",
                color: "white",
                fontSize: 20,
                fontWeight: 600,
                fontFamily: "'Fredoka', sans-serif",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 14,
                textAlign: "left",
              }}
            >
              <UserCircle size={36} weight="duotone" color="#fee440" />
              <div>
                <div>I'm one player</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)", fontWeight: 400, marginTop: 2 }}>
                  Pick one role and enter your secret
                </div>
              </div>
            </button>
            <button
              onClick={startAllMode}
              style={{
                padding: "22px 24px",
                borderRadius: 16,
                border: "2px solid rgba(255,255,255,.15)",
                background: "rgba(255,255,255,.05)",
                color: "white",
                fontSize: 20,
                fontWeight: 600,
                fontFamily: "'Fredoka', sans-serif",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 14,
                textAlign: "left",
              }}
            >
              <Users size={36} weight="duotone" color="#9b5de5" />
              <div>
                <div>Enter all three</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)", fontWeight: 400, marginTop: 2 }}>
                  Swipe to fill all roles from this device
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Pick a role (single mode) */}
      {phase === "pick-role" && status && (
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{
            fontSize: 24,
            color: "white",
            textAlign: "center",
            marginBottom: 24,
          }}>
            Pick your secret role:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {ROLES.map(r => {
              const claimed = status[`${r.key}_claimed`];
              const filled = status[r.key] && status[r.key].length > 0;
              const taken = claimed || filled;
              return (
                <button
                  key={r.key}
                  onClick={() => !taken && pickRole(r.key)}
                  disabled={taken}
                  style={{
                    padding: "20px 24px",
                    borderRadius: 16,
                    border: `2px solid ${taken ? "rgba(255,255,255,.1)" : r.color + "60"}`,
                    background: taken ? "rgba(255,255,255,.03)" : `${r.color}12`,
                    color: taken ? "rgba(255,255,255,.25)" : r.color,
                    fontSize: 22,
                    fontWeight: 600,
                    fontFamily: "'Fredoka', sans-serif",
                    cursor: taken ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {r.label}
                  {taken && <CheckCircle size={24} weight="fill" color="rgba(255,255,255,.15)" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Single-role input */}
      {phase === "input" && roleInfo && (
        <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
          <div style={{ fontSize: 18, color: roleInfo.color, marginBottom: 8, fontWeight: 600 }}>
            {roleInfo.prompt}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,.3)", marginBottom: 20, fontStyle: "italic" }}>
            Keep it secret from the class!
          </div>
          <input
            type="text"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
            data-form-type="other"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={roleInfo.placeholder}
            maxLength={100}
            onKeyDown={e => e.key === "Enter" && submitSingle()}
            style={{
              width: "100%", padding: "16px 20px", borderRadius: 14,
              border: `2px solid ${roleInfo.color}50`, background: "rgba(0,0,0,.4)",
              color: "white", fontFamily: "'Fredoka', sans-serif", fontSize: 22,
              outline: "none", boxSizing: "border-box",
            }}
          />
          <button
            onClick={submitSingle}
            disabled={!value.trim()}
            style={{
              marginTop: 20, width: "100%", padding: "16px", borderRadius: 14,
              border: "none",
              background: value.trim() ? roleInfo.color : "rgba(255,255,255,.1)",
              color: value.trim() ? "#000" : "rgba(255,255,255,.3)",
              fontSize: 22, fontWeight: 700, fontFamily: "'Fredoka', sans-serif",
              cursor: value.trim() ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}
          >
            <PaperPlaneTilt size={22} weight="bold" />
            Send It!
          </button>
        </div>
      )}

      {/* All-roles input with swipe/tabs */}
      {phase === "input-all" && (
        <div
          style={{ width: "100%", maxWidth: 360, textAlign: "center" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Tab dots */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 20,
          }}>
            {ROLES.map((r, i) => {
              const sent = sentRoles.has(r.key);
              const active = i === activeTab;
              return (
                <button
                  key={r.key}
                  onClick={() => setActiveTab(i)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: `2px solid ${active ? r.color + "60" : "rgba(255,255,255,.1)"}`,
                    background: active ? `${r.color}18` : "rgba(255,255,255,.03)",
                    color: sent ? "#06d6a0" : (active ? r.color : "rgba(255,255,255,.3)"),
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "'Fredoka', sans-serif",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all .2s ease",
                  }}
                >
                  {sent && <CheckCircle size={14} weight="fill" color="#06d6a0" />}
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Navigation arrows */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            justifyContent: "center",
            marginBottom: 16,
          }}>
            <button
              onClick={() => activeTab > 0 && setActiveTab(t => t - 1)}
              disabled={activeTab === 0}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(255,255,255,.05)",
                color: activeTab > 0 ? "white" : "rgba(255,255,255,.15)",
                cursor: activeTab > 0 ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <CaretLeft size={20} weight="bold" />
            </button>

            <div style={{
              fontSize: 20,
              color: allRoleInfo.color,
              fontWeight: 600,
              flex: 1,
            }}>
              {allRoleInfo.prompt}
            </div>

            <button
              onClick={() => activeTab < 2 && setActiveTab(t => t + 1)}
              disabled={activeTab === 2}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(255,255,255,.05)",
                color: activeTab < 2 ? "white" : "rgba(255,255,255,.15)",
                cursor: activeTab < 2 ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <CaretRight size={20} weight="bold" />
            </button>
          </div>

          {/* Swipe hint */}
          <div style={{
            fontSize: 12,
            color: "rgba(255,255,255,.2)",
            marginBottom: 16,
            fontStyle: "italic",
          }}>
            Swipe or tap arrows to switch roles
          </div>

          {sentRoles.has(allRoleInfo.key) ? (
            <div style={{
              padding: "32px 20px",
              borderRadius: 14,
              background: `${allRoleInfo.color}10`,
              border: `2px solid ${allRoleInfo.color}30`,
            }}>
              <CheckCircle size={40} weight="duotone" color="#06d6a0" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 18, color: "#06d6a0", fontWeight: 600 }}>Sent!</div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,.35)", marginTop: 4 }}>
                "{values[activeTab]}"
              </div>
            </div>
          ) : (
            <>
              <input
                type="text"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
                value={values[activeTab]}
                onChange={e => {
                  const next = [...values];
                  next[activeTab] = e.target.value;
                  setValues(next);
                }}
                placeholder={allRoleInfo.placeholder}
                maxLength={100}
                onKeyDown={e => e.key === "Enter" && submitRole(activeTab)}
                style={{
                  width: "100%", padding: "16px 20px", borderRadius: 14,
                  border: `2px solid ${allRoleInfo.color}50`, background: "rgba(0,0,0,.4)",
                  color: "white", fontFamily: "'Fredoka', sans-serif", fontSize: 22,
                  outline: "none", boxSizing: "border-box",
                }}
              />
              <button
                onClick={() => submitRole(activeTab)}
                disabled={!values[activeTab]?.trim()}
                style={{
                  marginTop: 16, width: "100%", padding: "16px", borderRadius: 14,
                  border: "none",
                  background: values[activeTab]?.trim() ? allRoleInfo.color : "rgba(255,255,255,.1)",
                  color: values[activeTab]?.trim() ? "#000" : "rgba(255,255,255,.3)",
                  fontSize: 22, fontWeight: 700, fontFamily: "'Fredoka', sans-serif",
                  cursor: values[activeTab]?.trim() ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}
              >
                <PaperPlaneTilt size={22} weight="bold" />
                Send &amp; {activeTab < 2 ? "Next" : "Done"}
              </button>
            </>
          )}

          {/* Progress indicator */}
          <div style={{
            marginTop: 20,
            fontSize: 14,
            color: "rgba(255,255,255,.25)",
          }}>
            {sentRoles.size} of 3 sent
          </div>
        </div>
      )}

      {/* Sending */}
      {phase === "sending" && (
        <div style={{ textAlign: "center" }}>
          <Sparkle size={40} weight="duotone" color={
            entryMode === "all" ? allRoleInfo?.color : (roleInfo?.color || "#fee440")
          } className="spin" />
          <div style={{ fontSize: 20, color: "rgba(255,255,255,.5)", marginTop: 16 }}>
            Checking your answer…
          </div>
        </div>
      )}

      {/* Sent successfully (all done) */}
      {phase === "sent" && (
        <div style={{ textAlign: "center" }}>
          <CheckCircle size={64} weight="duotone" color="#06d6a0" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 28, color: "#06d6a0", fontWeight: 700, marginBottom: 8 }}>
            {entryMode === "all" ? "All 3 Sent!" : "Sent!"}
          </div>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,.4)" }}>
            Watch the big screen for your story…
          </div>
        </div>
      )}

      {/* Blocked by moderation */}
      {phase === "blocked" && (
        <div style={{ textAlign: "center", maxWidth: 340 }}>
          <Warning size={48} weight="duotone" color="#fb5607" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 20, color: "#fb5607", marginBottom: 12 }}>
            {blockMsg}
          </div>
          <button
            onClick={() => {
              if (entryMode === "all") {
                const next = [...values];
                next[activeTab] = "";
                setValues(next);
                setPhase("input-all");
              } else {
                setValue("");
                setPhase("input");
              }
            }}
            style={{
              padding: "12px 28px", borderRadius: 12, border: "none",
              background: "rgba(255,255,255,.1)", color: "white",
              fontSize: 18, fontFamily: "'Fredoka', sans-serif", cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
