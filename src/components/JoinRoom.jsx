import { useState, useEffect } from "react";
import { Sparkle, PaperPlaneTilt, CheckCircle, Warning } from "@phosphor-icons/react";

const ROLES = [
  { key: "character", label: "A Character", prompt: "Enter a character", placeholder: "e.g. a talking pizza, a shy robot…", color: "#00f5d4" },
  { key: "place",     label: "A Place",     prompt: "Enter a place",     placeholder: "e.g. the moon, a giant shoe…",          color: "#00bbf9" },
  { key: "event",     label: "Something That Happens", prompt: "Enter an event", placeholder: "e.g. everything turns to jello…", color: "#f15bb5" },
];

export default function JoinRoom({ code }) {
  const [status, setStatus] = useState(null);    // room status from API
  const [error, setError] = useState(null);       // room not found, etc.
  const [role, setRole] = useState(null);         // selected role key
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState("loading");  // loading | pick-role | input | sending | sent | blocked
  const [blockMsg, setBlockMsg] = useState("");

  // Load room status
  useEffect(() => {
    fetch(`/api/room-status?code=${code}`)
      .then(r => {
        if (!r.ok) throw new Error("room_not_found");
        return r.json();
      })
      .then(data => {
        setStatus(data);
        setPhase("pick-role");
      })
      .catch(() => {
        setError("Room not found. Check the code and try again.");
        setPhase("error");
      });
  }, [code]);

  // Claim a role
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
          // Refresh status to show updated claims
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

  // Submit entry
  const submit = async () => {
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

  const roleInfo = role ? ROLES.find(r => r.key === role) : null;

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

      {/* Pick a role */}
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

      {/* Input */}
      {phase === "input" && roleInfo && (
        <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
          <div style={{
            fontSize: 18,
            color: roleInfo.color,
            marginBottom: 8,
            fontWeight: 600,
          }}>
            {roleInfo.prompt}
          </div>
          <div style={{
            fontSize: 14,
            color: "rgba(255,255,255,.3)",
            marginBottom: 20,
            fontStyle: "italic",
          }}>
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
            onKeyDown={e => e.key === "Enter" && submit()}
            style={{
              width: "100%",
              padding: "16px 20px",
              borderRadius: 14,
              border: `2px solid ${roleInfo.color}50`,
              background: "rgba(0,0,0,.4)",
              color: "white",
              fontFamily: "'Fredoka', sans-serif",
              fontSize: 22,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={submit}
            disabled={!value.trim()}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "16px",
              borderRadius: 14,
              border: "none",
              background: value.trim() ? roleInfo.color : "rgba(255,255,255,.1)",
              color: value.trim() ? "#000" : "rgba(255,255,255,.3)",
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "'Fredoka', sans-serif",
              cursor: value.trim() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <PaperPlaneTilt size={22} weight="bold" />
            Send It!
          </button>
        </div>
      )}

      {/* Sending */}
      {phase === "sending" && (
        <div style={{ textAlign: "center" }}>
          <Sparkle size={40} weight="duotone" color={roleInfo?.color || "#fee440"} className="spin" />
          <div style={{ fontSize: 20, color: "rgba(255,255,255,.5)", marginTop: 16 }}>
            Checking your answer…
          </div>
        </div>
      )}

      {/* Sent successfully */}
      {phase === "sent" && (
        <div style={{ textAlign: "center" }}>
          <CheckCircle size={64} weight="duotone" color="#06d6a0" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 28, color: "#06d6a0", fontWeight: 700, marginBottom: 8 }}>
            Sent!
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
            onClick={() => { setValue(""); setPhase("input"); }}
            style={{
              padding: "12px 28px",
              borderRadius: 12,
              border: "none",
              background: "rgba(255,255,255,.1)",
              color: "white",
              fontSize: 18,
              fontFamily: "'Fredoka', sans-serif",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
