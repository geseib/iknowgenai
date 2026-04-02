import { useEffect, useMemo, useRef, useState } from 'react';

const SPRITE_URL = `${import.meta.env.BASE_URL}cat-sprite.png`;

const QUOTES = [
  'Meow.',
  'I love AI.',
  'Tiny cat. Big ideas.',
  'Purr-mpt engineering.',
  'I trained on 9 lives of data.',
  'Attention is all you need... and treats.',
  'My loss function is empty food bowl.',
];

// The cat always runs across the full screen, stops in a side margin,
// shows a bubble, then exits. Entry side, stop side, and exit side are
// each independently random.
export default function RoamingCat({ quotes = QUOTES }) {
  const COLS = 4;
  const ROWS = 3;
  const TOTAL_FRAMES = 12;
  const FRAME_WIDTH = 384;
  const FRAME_HEIGHT = 341;
  const SCALE = 0.3;
  const DISPLAY_W = Math.round(FRAME_WIDTH * SCALE);
  const DISPLAY_H = Math.round(FRAME_HEIGHT * SCALE);
  const SPEED = 320;
  const BUBBLE_SHOW_MS = 3000;
  const BUBBLE_FADE_MS = 600;
  // margin zone where the cat stops (away from centered content)
  const MARGIN = 80;

  const [frame, setFrame] = useState(0);
  const [phase, setPhase] = useState('waiting');
  const [x, setX] = useState(0);
  const [movingRight, setMovingRight] = useState(true);
  const [bubbleState, setBubbleState] = useState('hidden');
  const stopTarget = useRef(0);
  const exitRight = useRef(true);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const addTimer = (fn, ms) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const message = useMemo(
    () => quotes[Math.floor(Math.random() * quotes.length)],
    [phase],
  );

  // kick off the first run
  useEffect(() => {
    startNewRun();
    return clearTimers;
  }, []);

  function startNewRun() {
    const pageW = window.innerWidth;
    const enterFromLeft = Math.random() < 0.5;
    // stop in the left or right margin (away from centered content)
    // bubble extends ~280px right of cat, so right-side stops need extra room
    const stopOnLeft = Math.random() < 0.5;
    stopTarget.current = stopOnLeft
      ? MARGIN + Math.random() * 30
      : Math.max(MARGIN, pageW - MARGIN - DISPLAY_W - 280 - Math.random() * 30);

    setMovingRight(enterFromLeft);
    setX(enterFromLeft ? -DISPLAY_W : pageW + DISPLAY_W);
    setPhase('running');
  }

  // sprite animation
  useEffect(() => {
    if (phase !== 'running' && phase !== 'exiting') return;
    const id = setInterval(() => {
      setFrame(f => (f + 1) % TOTAL_FRAMES);
    }, 70);
    return () => clearInterval(id);
  }, [phase]);

  // pause sequence: show bubble → fade → pick exit direction → go
  useEffect(() => {
    if (phase !== 'paused') return;
    clearTimers();

    addTimer(() => setBubbleState('visible'), 200);
    addTimer(() => setBubbleState('fading'), 200 + BUBBLE_SHOW_MS);
    addTimer(() => {
      setBubbleState('hidden');
      const goRight = Math.random() < 0.5;
      exitRight.current = goRight;
      setMovingRight(goRight);
      setPhase('exiting');
    }, 200 + BUBBLE_SHOW_MS + BUBBLE_FADE_MS);

    return clearTimers;
  }, [phase]);

  // movement
  useEffect(() => {
    if (phase !== 'running' && phase !== 'exiting') return;

    let rafId;
    let lastTs = 0;

    const animate = (ts) => {
      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      setX(prev => {
        const pageW = window.innerWidth;

        if (phase === 'running') {
          const dir = movingRight ? 1 : -1;
          const next = prev + SPEED * dt * dir;
          const reached = movingRight
            ? next >= stopTarget.current
            : next <= stopTarget.current;

          if (reached) {
            setPhase('paused');
            setFrame(0);
            return Math.round(stopTarget.current);
          }
          return next;
        }

        if (phase === 'exiting') {
          const dir = exitRight.current ? 1 : -1;
          const next = prev + SPEED * dt * dir;
          const offscreen = dir === 1
            ? next > pageW + DISPLAY_W
            : next < -DISPLAY_W;

          if (offscreen) {
            setPhase('waiting');
            addTimer(() => startNewRun(), 4000 + Math.random() * 6000);
            return prev;
          }
          return next;
        }

        return prev;
      });

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [phase, movingRight]);

  // cleanup on unmount
  useEffect(() => clearTimers, []);

  const col = frame % COLS;
  const row = Math.floor(frame / COLS);

  if (phase === 'waiting') return null;

  // bubble goes above and to the right of the cat
  const bubbleLeft = DISPLAY_W * 0.5;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: DISPLAY_H + 90,
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        bottom: 8,
        left: 0,
        transform: `translateX(${x}px)`,
        willChange: 'transform',
      }}>
        {/* speech bubble */}
        {bubbleState !== 'hidden' && (
          <div style={{
            position: 'absolute',
            top: -68,
            left: bubbleLeft,
            pointerEvents: 'auto',
            animation: bubbleState === 'visible'
              ? 'popIn .35s cubic-bezier(.34,1.56,.64,1) forwards'
              : `catBubbleFade ${BUBBLE_FADE_MS}ms ease forwards`,
          }}>
            <div style={{
              position: 'relative',
              borderRadius: 16,
              background: 'rgba(30,41,59,.92)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1.5px solid rgba(255,255,255,.3)',
              padding: '12px 22px',
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 17,
              fontWeight: 600,
              color: 'white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.01em',
            }}>
              {message}
              <div style={{
                position: 'absolute',
                bottom: -6,
                left: 22,
                width: 12,
                height: 12,
                background: 'rgba(30,41,59,.92)',
                border: '1.5px solid rgba(255,255,255,.3)',
                borderTop: 'none',
                borderLeft: 'none',
                transform: 'rotate(45deg)',
              }} />
            </div>
          </div>
        )}

        {/* cat sprite — flip when moving left */}
        <div style={{
          width: DISPLAY_W,
          height: DISPLAY_H,
          backgroundImage: `url(${SPRITE_URL})`,
          backgroundPosition: `-${col * DISPLAY_W}px -${row * DISPLAY_H}px`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${COLS * DISPLAY_W}px ${ROWS * DISPLAY_H}px`,
          transform: movingRight ? undefined : 'scaleX(-1)',
        }} />
      </div>

      <style>{`
        @keyframes catBubbleFade {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(-8px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
