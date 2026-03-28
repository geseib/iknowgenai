import {
  ChalkboardTeacher,
  CaretRight,
  Lightbulb,
  BookOpen,
  ChatCircleDots,
  ListBullets,
  Warning,
  Link,
  Code,
} from "@phosphor-icons/react";

export default function TeacherDrawer({ open, onToggle, notes, sectionTitle, slideLabel, color, isTeacherMode, connections }) {
  const hasContent = notes && (
    notes.keyPoints?.length > 0 ||
    notes.narrative ||
    notes.definitions?.length > 0 ||
    notes.discussion?.length > 0 ||
    notes.simplification ||
    notes.behindTheScenes
  ) || connections?.length > 0;

  return (
    <>
      {/* No backdrop — teacher needs to see the slide content */}

      {/* Sliding container: tab + panel move together */}
      <div style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        right: 0,
        zIndex: 145,
        width: 352,
        maxWidth: "calc(85vw + 32px)",
        transform: open ? "translateX(0)" : "translateX(320px)",
        transition: "transform .3s cubic-bezier(.4,0,.2,1)",
        display: "flex",
        pointerEvents: "none",
      }}>
        {/* Toggle tab — left edge of container */}
        <button
          onClick={onToggle}
          style={{
            alignSelf: "center",
            width: 32,
            height: 48,
            flexShrink: 0,
            borderRadius: "10px 0 0 10px",
            border: "1px solid rgba(255,255,255,.12)",
            borderRight: "none",
            background: open ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.06)",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
            transition: "background .2s ease",
            animation: !open && isTeacherMode ? "navPulse 3s ease-in-out infinite" : "none",
            pointerEvents: "auto",
          }}
        >
          {open
            ? <CaretRight size={16} weight="bold" />
            : <ChalkboardTeacher size={16} weight="bold" />}
        </button>

        {/* Drawer panel */}
        <div style={{
          width: 320,
          flexShrink: 0,
          height: "100%",
          background: "rgba(10,10,28,.95)",
          backdropFilter: "blur(16px)",
          borderLeft: "1px solid rgba(255,255,255,.08)",
          boxShadow: open ? "-4px 0 24px rgba(0,0,0,.4)" : "none",
          overflowY: "auto",
          overflowX: "hidden",
          fontFamily: "'Fredoka',sans-serif",
          pointerEvents: "auto",
        }}>
          {/* Header */}
          <div style={{
            padding: "22px 18px 14px",
            borderBottom: "1px solid rgba(255,255,255,.06)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}>
              <ChalkboardTeacher size={20} weight="duotone" color={color} />
              <span style={{ fontSize: 18, color: "rgba(255,255,255,.6)", fontWeight: 600 }}>
                Teacher Notes
              </span>
            </div>
            <div style={{ fontSize: 14, color, fontWeight: 600 }}>
              {sectionTitle}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 2 }}>
              {slideLabel}
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: "14px 18px 20px" }}>
            {!hasContent && (
              <div style={{
                textAlign: "center",
                padding: "32px 16px",
                color: "rgba(255,255,255,.25)",
                fontSize: 14,
              }}>
                No notes for this slide.
              </div>
            )}

            {/* Key Points */}
            {notes?.keyPoints?.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                  color: `${color}99`, marginBottom: 8,
                }}>
                  <Lightbulb size={14} weight="duotone" color={color} />
                  Key Points
                </div>
                {notes.keyPoints.map((pt, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 8, marginBottom: 6,
                    fontSize: 13, color: "rgba(255,255,255,.7)", lineHeight: 1.5,
                  }}>
                    <span style={{ color, flexShrink: 0, marginTop: 1 }}>&bull;</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Narrative */}
            {notes?.narrative && (
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                  color: `${color}99`, marginBottom: 8,
                }}>
                  <BookOpen size={14} weight="duotone" color={color} />
                  Narrative
                </div>
                <div style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,.55)",
                  lineHeight: 1.65,
                  padding: "10px 12px",
                  background: "rgba(255,255,255,.03)",
                  borderRadius: 10,
                  borderLeft: `3px solid ${color}40`,
                }}>
                  {notes.narrative}
                </div>
              </div>
            )}

            {/* Behind the Scenes — prompt breakdown */}
            {notes?.behindTheScenes && (
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                  color: "#fee44099", marginBottom: 8,
                }}>
                  <Code size={14} weight="duotone" color="#fee440" />
                  Behind the Scenes
                </div>
                <div style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,.5)",
                  lineHeight: 1.5,
                  marginBottom: 10,
                }}>
                  {notes.behindTheScenes.intro}
                </div>
                {notes.behindTheScenes.messages.map((msg, i) => {
                  const roleColors = { system: "#9b5de5", user: "#00bbf9", assistant: "#06d6a0" };
                  const rc = roleColors[msg.role] || "#fee440";
                  return (
                    <div key={i} style={{
                      marginBottom: 10,
                      padding: "10px 12px",
                      background: `${rc}08`,
                      borderRadius: 10,
                      borderLeft: `3px solid ${rc}50`,
                    }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        marginBottom: 4,
                      }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: rc,
                          textTransform: "uppercase",
                          letterSpacing: 1.5,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: `${rc}18`,
                        }}>
                          {msg.role}
                        </span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 600 }}>
                          {msg.label}
                        </span>
                      </div>
                      {msg.desc && (
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginBottom: 6, fontStyle: "italic" }}>
                          {msg.desc}
                        </div>
                      )}
                      <div style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,.6)",
                        lineHeight: 1.55,
                        fontFamily: "'Nunito', monospace",
                        whiteSpace: "pre-wrap",
                        padding: "6px 8px",
                        background: "rgba(0,0,0,.2)",
                        borderRadius: 6,
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                {notes.behindTheScenes.note && (
                  <div style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,.35)",
                    lineHeight: 1.5,
                    fontStyle: "italic",
                    marginTop: 6,
                  }}>
                    {notes.behindTheScenes.note}
                  </div>
                )}
              </div>
            )}

            {/* Definitions */}
            {notes?.definitions?.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                  color: `${color}99`, marginBottom: 8,
                }}>
                  <ListBullets size={14} weight="duotone" color={color} />
                  Definitions
                </div>
                {notes.definitions.map((d, i) => (
                  <div key={i} style={{
                    marginBottom: 8,
                    padding: "8px 10px",
                    background: `${color}08`,
                    borderRadius: 8,
                    border: `1px solid ${color}20`,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color }}>{d.term}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginLeft: 6 }}>— {d.def}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Discussion Prompts */}
            {notes?.discussion?.length > 0 && (
              <div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                  color: `${color}99`, marginBottom: 8,
                }}>
                  <ChatCircleDots size={14} weight="duotone" color={color} />
                  Discussion Prompts
                </div>
                {notes.discussion.map((q, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 8, marginBottom: 6,
                    fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.5,
                    fontStyle: "italic",
                  }}>
                    <span style={{ color: `${color}88`, flexShrink: 0 }}>{i + 1}.</span>
                    <span>"{q}"</span>
                  </div>
                ))}
              </div>
            )}

            {/* Sample Questions by Tool */}
            {notes?.sampleQuestions?.length > 0 && (
              <div style={{ marginTop: 18, marginBottom: 18 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                  color: "#00bbf999", marginBottom: 8,
                }}>
                  <Lightbulb size={14} weight="duotone" color="#00bbf9" />
                  Try These Questions
                </div>
                {notes.sampleQuestions.map((group, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: "#00bbf9",
                      fontFamily: "'Fredoka',sans-serif", marginBottom: 4,
                    }}>
                      {group.tool}
                    </div>
                    {group.questions.map((q, j) => (
                      <div key={j} style={{
                        fontSize: 12, color: "rgba(255,255,255,.5)",
                        lineHeight: 1.5, paddingLeft: 10,
                      }}>
                        • {q}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Connections to School Subjects */}
            {connections?.length > 0 && (
              <div style={{ marginTop: 18, marginBottom: 18 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                  color: "#06d6a099", marginBottom: 8,
                }}>
                  <Link size={14} weight="duotone" color="#06d6a0" />
                  Connections
                </div>
                {connections.map((c, i) => (
                  <div key={i} style={{
                    marginBottom: 8,
                    padding: "8px 10px",
                    background: "rgba(6,214,160,.06)",
                    borderRadius: 8,
                    border: "1px solid rgba(6,214,160,.15)",
                  }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#06d6a0",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}>
                      {c.subject}
                    </span>
                    <div style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,.5)",
                      marginTop: 3,
                      lineHeight: 1.5,
                    }}>
                      {c.note}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Simplification Notice */}
            {notes?.simplification && (
              <div style={{ marginTop: 18 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                  color: "#fb560799", marginBottom: 8,
                }}>
                  <Warning size={14} weight="duotone" color="#fb5607" />
                  Simplification Note
                </div>
                <div style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,.5)",
                  lineHeight: 1.6,
                  padding: "10px 12px",
                  background: "rgba(251,86,7,.06)",
                  borderRadius: 10,
                  borderLeft: "3px solid rgba(251,86,7,.35)",
                }}>
                  {notes.simplification}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: "10px 18px 14px",
            borderTop: "1px solid rgba(255,255,255,.06)",
            fontSize: 11,
            color: "rgba(255,255,255,.2)",
            textAlign: "center",
          }}>
            Press <kbd style={{
              padding: "2px 6px",
              borderRadius: 4,
              background: "rgba(255,255,255,.08)",
              fontSize: 10,
            }}>T</kbd> to toggle
          </div>
        </div>
      </div>
    </>
  );
}
