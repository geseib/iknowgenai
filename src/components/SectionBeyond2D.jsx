import { useState, useEffect, useRef, useCallback } from "react";
import { PresSlide, PresText, Card } from "./shared";

const CUBE_WORDS = [
  { word: "cat", x: -35, y: -40, z: 30, color: "#fee440" },
  { word: "dog", x: -25, y: -30, z: 40, color: "#fee440" },
  { word: "pizza", x: 40, y: 35, z: -25, color: "#fb5607" },
  { word: "king", x: 30, y: -35, z: -35, color: "#9b5de5" },
  { word: "queen", x: 40, y: -25, z: -30, color: "#9b5de5" },
  { word: "run", x: -40, y: 40, z: -20, color: "#00f5d4" },
];

/* ── Main Section ────────────────────────────────────────────────────── */
export default function SectionBeyond2D({ color, mode, slide }) {
  const [rotateX, setRotateX] = useState(-15);
  const [rotateY, setRotateY] = useState(25);
  const [dragging, setDragging] = useState(false);
  const [dimCount, setDimCount] = useState(4);
  const lastPos = useRef({ x: 0, y: 0 });
  const cubeRef = useRef(null);
  const animRef = useRef(null);

  // Auto-rotate when not dragging (slide 3)
  useEffect(() => {
    if (slide !== 3 || dragging) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    let frame;
    const animate = () => {
      setRotateY(prev => prev + 0.3);
      frame = requestAnimationFrame(animate);
      animRef.current = frame;
    };
    frame = requestAnimationFrame(animate);
    animRef.current = frame;
    return () => cancelAnimationFrame(frame);
  }, [slide, dragging]);

  // Mouse/touch drag handlers
  const onStart = useCallback((clientX, clientY) => {
    setDragging(true);
    lastPos.current = { x: clientX, y: clientY };
  }, []);

  const onMove = useCallback((clientX, clientY) => {
    if (!dragging) return;
    const dx = clientX - lastPos.current.x;
    const dy = clientY - lastPos.current.y;
    setRotateY(prev => prev + dx * 0.5);
    setRotateX(prev => Math.max(-60, Math.min(60, prev - dy * 0.5)));
    lastPos.current = { x: clientX, y: clientY };
  }, [dragging]);

  const onEnd = useCallback(() => setDragging(false), []);

  // Accelerating counter (slide 4)
  useEffect(() => {
    if (slide !== 4) { setDimCount(4); return; }
    setDimCount(4);
    let count = 4;
    let speed = 200;
    let timer;
    const tick = () => {
      if (count >= 12288) return;
      if (count < 10) count++;
      else if (count < 100) count += Math.ceil(count * 0.15);
      else if (count < 1000) count += Math.ceil(count * 0.12);
      else count += Math.ceil(count * 0.1);
      if (count > 12288) count = 12288;
      setDimCount(count);
      speed = Math.max(30, speed * 0.92);
      timer = setTimeout(tick, speed);
    };
    timer = setTimeout(tick, 800);
    return () => clearTimeout(timer);
  }, [slide]);

  if (mode !== "presentation") return null;

  // Slide 0: Callback to embeddings
  if (slide === 0) return (
    <PresSlide>
      <PresText size={32} color="rgba(255,255,255,.5)">
        We saw words plotted as 2D dots...
      </PresText>
      {/* Mini scatter preview */}
      <Card style={{ padding: 20, maxWidth: 400, width: "100%" }}>
        <div style={{
          position: "relative", width: "100%", paddingTop: "70%",
          background: "rgba(255,255,255,.03)", borderRadius: 12,
        }}>
          {[
            { w: "cat", x: 20, y: 30 }, { w: "dog", x: 28, y: 35 },
            { w: "pizza", x: 70, y: 65 }, { w: "king", x: 65, y: 20 },
            { w: "queen", x: 72, y: 25 },
          ].map((pt, i) => (
            <div key={i} style={{
              position: "absolute", left: `${pt.x}%`, top: `${pt.y}%`,
              transform: "translate(-50%,-50%)",
              fontFamily: "'Fredoka',sans-serif", fontSize: 16, fontWeight: 600,
              color: "rgba(255,255,255,.5)", animation: `fadeUp .4s ${i * 0.1}s ease both`,
            }}>
              {pt.w}
            </div>
          ))}
        </div>
      </Card>
      <PresText size={36} color={color}>
        What if we added more dimensions?
      </PresText>
    </PresSlide>
  );

  // Slide 1: 1D Number line
  if (slide === 1) return (
    <PresSlide>
      <PresText size={36} color={color}>1 Dimension</PresText>
      <PresText size={24} color="rgba(255,255,255,.45)">
        Just a number line — words are close or far
      </PresText>
      <div style={{
        maxWidth: 700, width: "100%", position: "relative",
        padding: "60px 40px 40px",
      }}>
        {/* The line */}
        <div style={{
          height: 4, background: "rgba(255,255,255,.15)", borderRadius: 2,
          width: "100%", position: "relative",
        }}>
          {[
            { word: "Cat", pos: 20, c: "#fee440" },
            { word: "Dog", pos: 28, c: "#fee440" },
            { word: "Pizza", pos: 75, c: "#fb5607" },
          ].map((item, i) => (
            <div key={i} style={{
              position: "absolute", left: `${item.pos}%`, top: -45,
              transform: "translateX(-50%)", textAlign: "center",
              animation: `popIn .4s ${i * 0.2}s ease both`,
            }}>
              <div style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: 24, fontWeight: 700,
                color: item.c,
              }}>
                {item.word}
              </div>
              <div style={{
                width: 3, height: 20, background: item.c,
                margin: "4px auto 0", borderRadius: 2,
              }} />
              <div style={{
                width: 12, height: 12, borderRadius: "50%",
                background: item.c, margin: "-2px auto 0",
                boxShadow: `0 0 8px ${item.c}80`,
              }} />
            </div>
          ))}
        </div>
      </div>
      <PresText size={20} color="rgba(255,255,255,.3)">
        Cat and Dog are close. Pizza is far. But there's not much room for detail...
      </PresText>
    </PresSlide>
  );

  // Slide 2: 2D — Y axis grows
  if (slide === 2) return (
    <PresSlide>
      <PresText size={36} color={color}>2 Dimensions</PresText>
      <PresText size={24} color="rgba(255,255,255,.45)">
        Now words can spread out in TWO directions
      </PresText>
      <Card style={{ padding: 20, maxWidth: 500, width: "100%" }}>
        <div style={{
          position: "relative", width: "100%", paddingTop: "80%",
          background: "rgba(255,255,255,.03)", borderRadius: 12,
        }}>
          {/* X axis */}
          <div style={{
            position: "absolute", bottom: "10%", left: "10%", right: "10%",
            height: 2, background: "rgba(255,255,255,.15)",
            animation: "slideIn .5s ease both",
          }} />
          {/* Y axis */}
          <div style={{
            position: "absolute", bottom: "10%", left: "10%",
            width: 2, top: "10%",
            background: "rgba(255,255,255,.15)",
            animation: "fadeUp .5s .2s ease both",
          }} />
          {/* Words */}
          {[
            { w: "cat", x: 25, y: 30 }, { w: "dog", x: 33, y: 35 },
            { w: "pizza", x: 70, y: 70 }, { w: "king", x: 65, y: 22 },
            { w: "queen", x: 73, y: 18 }, { w: "run", x: 45, y: 55 },
          ].map((pt, i) => (
            <div key={i} style={{
              position: "absolute", left: `${pt.x}%`, top: `${pt.y}%`,
              transform: "translate(-50%,-50%)",
              fontFamily: "'Fredoka',sans-serif", fontSize: 20, fontWeight: 700,
              color: CUBE_WORDS.find(c => c.word === pt.w)?.color || "white",
              animation: `popIn .4s ${0.4 + i * 0.1}s ease both`,
            }}>
              {pt.w}
            </div>
          ))}
          {/* Axis labels */}
          <div style={{
            position: "absolute", bottom: "3%", right: "10%",
            fontSize: 14, color: "rgba(255,255,255,.25)",
          }}>Dimension 1</div>
          <div style={{
            position: "absolute", top: "10%", left: "2%",
            fontSize: 14, color: "rgba(255,255,255,.25)",
            transform: "rotate(-90deg)", transformOrigin: "bottom left",
          }}>Dimension 2</div>
        </div>
      </Card>
      <PresText size={20} color="rgba(255,255,255,.3)">
        Better! King and Queen cluster together. But can we do even better?
      </PresText>
    </PresSlide>
  );

  // Slide 3: 3D Cube — drag to rotate
  if (slide === 3) return (
    <PresSlide>
      <PresText size={36} color={color}>3 Dimensions</PresText>
      <PresText size={22} color="rgba(255,255,255,.4)">
        Drag to rotate the cube!
      </PresText>
      <div
        ref={cubeRef}
        onMouseDown={e => onStart(e.clientX, e.clientY)}
        onMouseMove={e => onMove(e.clientX, e.clientY)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={e => { e.preventDefault(); onStart(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchMove={e => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchEnd={onEnd}
        style={{
          width: 320, height: 320,
          perspective: 800,
          cursor: dragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
      >
        <div style={{
          width: "100%", height: "100%",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          position: "relative",
        }}>
          {/* Cube edges */}
          {[
            // Bottom face edges
            { x1: -80, y1: 80, z1: -80, x2: 80, y2: 80, z2: -80 },
            { x1: 80, y1: 80, z1: -80, x2: 80, y2: 80, z2: 80 },
            { x1: 80, y1: 80, z1: 80, x2: -80, y2: 80, z2: 80 },
            { x1: -80, y1: 80, z1: 80, x2: -80, y2: 80, z2: -80 },
            // Top face edges
            { x1: -80, y1: -80, z1: -80, x2: 80, y2: -80, z2: -80 },
            { x1: 80, y1: -80, z1: -80, x2: 80, y2: -80, z2: 80 },
            { x1: 80, y1: -80, z1: 80, x2: -80, y2: -80, z2: 80 },
            { x1: -80, y1: -80, z1: 80, x2: -80, y2: -80, z2: -80 },
            // Vertical edges
            { x1: -80, y1: -80, z1: -80, x2: -80, y2: 80, z2: -80 },
            { x1: 80, y1: -80, z1: -80, x2: 80, y2: 80, z2: -80 },
            { x1: 80, y1: -80, z1: 80, x2: 80, y2: 80, z2: 80 },
            { x1: -80, y1: -80, z1: 80, x2: -80, y2: 80, z2: 80 },
          ].map((edge, i) => {
            const mx = (edge.x1 + edge.x2) / 2;
            const my = (edge.y1 + edge.y2) / 2;
            const mz = (edge.z1 + edge.z2) / 2;
            const dx = edge.x2 - edge.x1;
            const dy = edge.y2 - edge.y1;
            const dz = edge.z2 - edge.z1;
            const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
            // Rotation to align with edge direction
            const ry = Math.atan2(dx, dz) * (180 / Math.PI);
            const rx = -Math.asin(dy / len) * (180 / Math.PI);
            return (
              <div key={i} style={{
                position: "absolute",
                left: "50%", top: "50%",
                width: 2, height: len,
                background: "rgba(255,255,255,.12)",
                transformStyle: "preserve-3d",
                transform: `translate3d(${mx - 1}px, ${my - len/2}px, ${mz}px) rotateY(${ry}deg) rotateX(${rx}deg)`,
              }} />
            );
          })}

          {/* Words positioned in 3D */}
          {CUBE_WORDS.map((w, i) => (
            <div key={i} style={{
              position: "absolute",
              left: "50%", top: "50%",
              transform: `translate3d(${w.x}px, ${w.y}px, ${w.z}px) translate(-50%, -50%)`,
              transformStyle: "preserve-3d",
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 18, fontWeight: 700,
              color: w.color,
              textShadow: `0 0 8px ${w.color}80`,
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}>
              {w.word}
            </div>
          ))}
        </div>
      </div>
      <PresText size={20} color="rgba(255,255,255,.3)">
        Three dimensions are richer... but AI uses way more than three!
      </PresText>
    </PresSlide>
  );

  // Slide 4: Mind-blown — counter accelerates to 12,288
  if (slide === 4) return (
    <PresSlide>
      <PresText size={28} color="rgba(255,255,255,.45)">
        What if we kept adding dimensions?
      </PresText>
      <div style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: dimCount >= 12288 ? 80 : 64,
        fontWeight: 700,
        color: dimCount >= 12288 ? color : "white",
        transition: "all .3s ease",
        letterSpacing: -1,
      }}>
        {dimCount.toLocaleString()}
      </div>
      <PresText size={24} color="rgba(255,255,255,.4)">
        dimensions
      </PresText>
      {dimCount >= 12288 && (
        <div className="wow-reveal">
          <PresText size={32} color={color}>
            That's how many numbers represent ONE word!
          </PresText>
          <PresText size={22} color="rgba(255,255,255,.4)">
            You can't picture 12,288 dimensions — but the math works perfectly.
          </PresText>
        </div>
      )}
    </PresSlide>
  );

  // Slide 5: Cosine similarity
  if (slide === 5) {
    const pairs = [
      { w1: "King", w2: "Queen", score: "0.92", similar: true },
      { w1: "Cat", w2: "Dog", score: "0.85", similar: true },
      { w1: "Cat", w2: "Pizza", score: "0.12", similar: false },
    ];
    return (
      <PresSlide>
        <PresText size={36} color={color}>Cosine Similarity</PresText>
        <PresText size={24} color="rgba(255,255,255,.45)">
          AI measures how similar two words are by comparing their arrows
        </PresText>
        <div style={{
          display: "flex", flexDirection: "column", gap: 20,
          maxWidth: 600, width: "100%",
        }}>
          {pairs.map((p, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "16px 24px", borderRadius: 16,
              background: "rgba(255,255,255,.04)",
              border: `1px solid rgba(255,255,255,.1)`,
              animation: `fadeUp .4s ${i * 0.15}s ease both`,
            }}>
              {/* Arrow pair SVG */}
              <svg width="60" height="60" viewBox="0 0 60 60">
                <line x1="30" y1="55" x2="15" y2="10"
                  stroke={p.similar ? color : "rgba(255,255,255,.3)"}
                  strokeWidth="2" strokeLinecap="round" />
                <circle cx="15" cy="10" r="3"
                  fill={p.similar ? color : "rgba(255,255,255,.3)"} />
                <line x1="30" y1="55"
                  x2={p.similar ? 20 : 50} y2={p.similar ? 12 : 15}
                  stroke={p.similar ? color : "#ff6b6b"}
                  strokeWidth="2" strokeLinecap="round" />
                <circle cx={p.similar ? 20 : 50} cy={p.similar ? 12 : 15} r="3"
                  fill={p.similar ? color : "#ff6b6b"} />
              </svg>
              {/* Words */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: 24, fontWeight: 600,
                  color: "white",
                }}>
                  {p.w1} ↔ {p.w2}
                </div>
              </div>
              {/* Score */}
              <div style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: 28, fontWeight: 700,
                color: p.similar ? color : "#ff6b6b",
                animation: `popIn .4s ${0.3 + i * 0.15}s ease both`,
              }}>
                {p.score}
              </div>
            </div>
          ))}
        </div>
        <PresText size={20} color="rgba(255,255,255,.3)">
          1.0 = identical meaning &nbsp;&nbsp;|&nbsp;&nbsp; 0.0 = completely unrelated
        </PresText>
      </PresSlide>
    );
  }

  return null;
}
