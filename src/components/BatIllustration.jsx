/* A funny bat that's BOTH things at once — a baseball bat with wings.
   Represents what an embedding looks like before Attention figures out context. */
export default function BatIllustration({ color, size = 200 }) {
  return (
    <svg viewBox="0 0 220 220" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle */}
      <circle cx="110" cy="110" r="90" fill={`${color}10`} />

      {/* ── Left wing ── */}
      <path
        d="M52 68 C32 48, 8 52, 12 72 C14 82, 28 80, 32 88 C24 84, 10 90, 16 102 C20 110, 34 104, 40 106 C34 108, 22 116, 30 124 C36 130, 48 118, 56 112"
        fill={`${color}30`}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Wing membrane lines */}
      <path d="M50 70 L36 90" stroke={color} strokeWidth="1" opacity="0.3" />
      <path d="M48 80 L34 104" stroke={color} strokeWidth="1" opacity="0.3" />
      <path d="M52 92 L38 116" stroke={color} strokeWidth="1" opacity="0.3" />

      {/* ── Right wing ── */}
      <path
        d="M168 68 C188 48, 212 52, 208 72 C206 82, 192 80, 188 88 C196 84, 210 90, 204 102 C200 110, 186 104, 180 106 C186 108, 198 116, 190 124 C184 130, 172 118, 164 112"
        fill={`${color}30`}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Wing membrane lines */}
      <path d="M170 70 L184 90" stroke={color} strokeWidth="1" opacity="0.3" />
      <path d="M172 80 L186 104" stroke={color} strokeWidth="1" opacity="0.3" />
      <path d="M168 92 L182 116" stroke={color} strokeWidth="1" opacity="0.3" />

      {/* ── Baseball bat handle ── */}
      <rect
        x="103" y="100" width="14" height="68" rx="5"
        fill={`${color}50`}
        stroke={color}
        strokeWidth="2"
        transform="rotate(-8 110 130)"
      />
      {/* Handle grip lines */}
      <line x1="106" y1="140" x2="114" y2="139" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <line x1="106" y1="146" x2="114" y2="145" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <line x1="106" y1="152" x2="114" y2="151" stroke={color} strokeWidth="1.5" opacity="0.4" />
      {/* Handle knob */}
      <ellipse cx="109" cy="170" rx="10" ry="6" fill={`${color}45`} stroke={color} strokeWidth="2" transform="rotate(-8 109 170)" />

      {/* ── Baseball bat barrel (the thick hitting end) ── */}
      <ellipse
        cx="112" cy="88" rx="22" ry="28"
        fill={`${color}40`}
        stroke={color}
        strokeWidth="2.5"
        transform="rotate(-8 112 88)"
      />

      {/* ── Cute face on the barrel ── */}
      {/* Eyes */}
      <ellipse cx="103" cy="78" rx="5" ry="6" fill="white" />
      <ellipse cx="121" cy="76" rx="5" ry="6" fill="white" />
      {/* Pupils */}
      <ellipse cx="104" cy="79" rx="3" ry="4" fill="#1a1a2e" />
      <ellipse cx="122" cy="77" rx="3" ry="4" fill="#1a1a2e" />
      {/* Eye shine */}
      <circle cx="106" cy="77" r="1.5" fill="white" />
      <circle cx="124" cy="75" r="1.5" fill="white" />

      {/* Little smile */}
      <path d="M107 90 Q112 96 118 89" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* ── Tiny bat ears on the barrel ── */}
      <path d="M96 62 L88 46 L100 58 Z" fill={`${color}55`} stroke={color} strokeWidth="1.5" />
      <path d="M126 58 L134 42 L124 56 Z" fill={`${color}55`} stroke={color} strokeWidth="1.5" />

      {/* ── Little fangs ── */}
      <line x1="109" y1="93" x2="108" y2="98" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="115" y1="93" x2="116" y2="98" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

      {/* Question marks floating around — confused identity! */}
      <text x="40" y="50" fill={color} opacity="0.5" fontSize="18" fontFamily="'Fredoka',sans-serif" fontWeight="700">?</text>
      <text x="176" y="46" fill={color} opacity="0.5" fontSize="18" fontFamily="'Fredoka',sans-serif" fontWeight="700">?</text>
      <text x="58" y="190" fill={color} opacity="0.35" fontSize="14" fontFamily="'Fredoka',sans-serif" fontWeight="700">?</text>
      <text x="158" y="194" fill={color} opacity="0.35" fontSize="14" fontFamily="'Fredoka',sans-serif" fontWeight="700">?</text>
    </svg>
  );
}
