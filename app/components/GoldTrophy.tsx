export default function GoldTrophy({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gold Gradient */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>

        {/* Shine Gradient */}
        <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Shadow */}
        <filter id="shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Base */}
      <ellipse cx="100" cy="220" rx="40" ry="8" fill="url(#goldGradient)" opacity="0.8" filter="url(#shadow)" />

      {/* Pedestal Bottom */}
      <path
        d="M 70 220 L 75 200 L 125 200 L 130 220 Z"
        fill="url(#goldGradient)"
        stroke="#B8860B"
        strokeWidth="1"
        filter="url(#glow)"
      />

      {/* Pedestal Middle */}
      <rect
        x="80"
        y="180"
        width="40"
        height="20"
        fill="url(#goldGradient)"
        stroke="#B8860B"
        strokeWidth="1"
      />

      {/* Pedestal Top */}
      <path
        d="M 75 180 L 80 160 L 120 160 L 125 180 Z"
        fill="url(#goldGradient)"
        stroke="#B8860B"
        strokeWidth="1"
      />

      {/* Cup Base */}
      <path
        d="M 85 160 L 90 140 L 110 140 L 115 160 Z"
        fill="url(#goldGradient)"
        stroke="#B8860B"
        strokeWidth="1"
      />

      {/* Cup Body */}
      <path
        d="M 90 140 Q 70 120 75 80 Q 75 60 85 50 L 115 50 Q 125 60 125 80 Q 130 120 110 140 Z"
        fill="url(#goldGradient)"
        stroke="#B8860B"
        strokeWidth="2"
        filter="url(#glow)"
      />

      {/* Left Handle */}
      <path
        d="M 75 90 Q 55 90 50 70 Q 55 50 75 60"
        fill="none"
        stroke="url(#goldGradient)"
        strokeWidth="8"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* Right Handle */}
      <path
        d="M 125 90 Q 145 90 150 70 Q 145 50 125 60"
        fill="none"
        stroke="url(#goldGradient)"
        strokeWidth="8"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* Cup Rim */}
      <ellipse
        cx="100"
        cy="50"
        rx="30"
        ry="8"
        fill="url(#goldGradient)"
        stroke="#FFD700"
        strokeWidth="2"
      />

      {/* Shine Effect on Cup */}
      <ellipse
        cx="95"
        cy="80"
        rx="15"
        ry="30"
        fill="url(#shineGradient)"
        opacity="0.4"
      />

      {/* Top Shine */}
      <ellipse
        cx="100"
        cy="50"
        rx="20"
        ry="4"
        fill="#FFFFFF"
        opacity="0.5"
      />
    </svg>
  );
}
