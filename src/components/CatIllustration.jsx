export default function CatIllustration({ color, size = 180 }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle */}
      <circle cx="100" cy="108" r="82" fill={`${color}12`} />

      {/* Ears */}
      <path d="M58 65 L45 28 L78 55 Z" fill={`${color}55`} stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M142 65 L155 28 L122 55 Z" fill={`${color}55`} stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Inner ears */}
      <path d="M60 62 L52 38 L74 56 Z" fill={`${color}88`} />
      <path d="M140 62 L148 38 L126 56 Z" fill={`${color}88`} />

      {/* Head */}
      <ellipse cx="100" cy="95" rx="52" ry="46" fill={`${color}40`} stroke={color} strokeWidth="2.5" />

      {/* Body */}
      <ellipse cx="100" cy="152" rx="42" ry="32" fill={`${color}35`} stroke={color} strokeWidth="2.5" />

      {/* Eyes */}
      <ellipse cx="80" cy="88" rx="10" ry="11" fill="white" />
      <ellipse cx="120" cy="88" rx="10" ry="11" fill="white" />
      {/* Pupils */}
      <ellipse cx="82" cy="89" rx="5.5" ry="7" fill="#1a1a2e" />
      <ellipse cx="122" cy="89" rx="5.5" ry="7" fill="#1a1a2e" />
      {/* Eye shine */}
      <circle cx="84" cy="86" r="2.5" fill="white" />
      <circle cx="124" cy="86" r="2.5" fill="white" />

      {/* Nose */}
      <path d="M97 100 L100 96 L103 100 Z" fill={color} />

      {/* Mouth */}
      <path d="M100 100 Q92 110 86 104" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M100 100 Q108 110 114 104" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Whiskers */}
      <line x1="50" y1="94" x2="76" y2="98" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="48" y1="102" x2="75" y2="102" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="50" y1="110" x2="76" y2="106" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="150" y1="94" x2="124" y2="98" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="152" y1="102" x2="125" y2="102" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="150" y1="110" x2="124" y2="106" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

      {/* Front paws */}
      <ellipse cx="82" cy="178" rx="12" ry="8" fill={`${color}35`} stroke={color} strokeWidth="2" />
      <ellipse cx="118" cy="178" rx="12" ry="8" fill={`${color}35`} stroke={color} strokeWidth="2" />

      {/* Tail */}
      <path d="M142 150 Q168 140 162 115 Q158 100 150 108" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}
