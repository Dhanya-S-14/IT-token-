export default function LogoIcon({ className = 'w-6 h-6' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Primary gradient: Deep Indigo -> Electric Cobalt -> Cyber Cyan */}
        <linearGradient id="opPulseHex" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="45%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Pulse wave neon gradient */}
        <linearGradient id="opPulseWave" x1="10" y1="32" x2="54" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>

        {/* Inner core soft gradient */}
        <linearGradient id="opPulseCore" x1="20" y1="18" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.05" />
        </linearGradient>

        {/* Ambient neon glow */}
        <filter id="opPulseGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Core node intense glow */}
        <filter id="opPulseDotGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="dotBlur" />
          <feMerge>
            <feMergeNode in="dotBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer Hexagonal Shield Backplate */}
      <path
        d="M32 4L54 16.5V41.5L32 54L10 41.5V16.5L32 4Z"
        fill="url(#opPulseCore)"
        stroke="url(#opPulseHex)"
        strokeWidth="2.75"
        strokeLinejoin="round"
      />

      {/* Subtle Inner Concentric Hex Accent */}
      <path
        d="M32 10.5L48.5 20V38L32 47.5L15.5 38V20L32 10.5Z"
        stroke="url(#opPulseHex)"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeDasharray="2 2"
        fill="none"
      />

      {/* Top and Bottom IT Telemetry Anchor Nodes */}
      <circle cx="32" cy="11" r="1.75" fill="#38BDF8" opacity="0.8" />
      <circle cx="32" cy="47" r="1.75" fill="#818CF8" opacity="0.8" />
      <circle cx="16" cy="20" r="1.5" fill="#06B6D4" opacity="0.6" />
      <circle cx="48" cy="20" r="1.5" fill="#06B6D4" opacity="0.6" />
      <circle cx="16" cy="38" r="1.5" fill="#6366F1" opacity="0.6" />
      <circle cx="48" cy="38" r="1.5" fill="#6366F1" opacity="0.6" />

      {/* Baseline Telemetry Grid Track */}
      <line
        x1="12"
        y1="32"
        x2="52"
        y2="32"
        stroke="#38BDF8"
        strokeWidth="0.8"
        strokeOpacity="0.25"
        strokeDasharray="1.5 2"
      />

      {/* The Signature Dynamic OpsPulse Heartbeat Wave */}
      <path
        d="M12 32H20L23.5 27L27 36.5L31.5 18L35.5 43L39 29L42.5 33.5H52"
        stroke="url(#opPulseWave)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#opPulseGlow)"
      />

      {/* Apex Vital Node (Highest pulse spike at 31.5, 18) */}
      <circle
        cx="31.5"
        cy="18"
        r="3"
        fill="#22D3EE"
        filter="url(#opPulseDotGlow)"
      />
      <circle
        cx="31.5"
        cy="18"
        r="1.25"
        fill="#FFFFFF"
      />

      {/* Terminal Node (Right end of pulse) */}
      <circle
        cx="52"
        cy="33.5"
        r="1.5"
        fill="#A855F7"
        opacity="0.9"
      />
    </svg>
  );
}
