export default function GoldTrophy({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Premium Gold Gradient - Main */}
        <linearGradient id="goldMain" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF4D6" />
          <stop offset="15%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#DAA520" />
          <stop offset="85%" stopColor="#B8860B" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>

        {/* Dark Gold for Depth */}
        <linearGradient id="goldDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#6B5416" />
        </linearGradient>

        {/* Bright Highlight */}
        <radialGradient id="highlight">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FFE87C" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </radialGradient>

        {/* Metallic Shine */}
        <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Strong Glow */}
        <filter id="strongGlow">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Shadow */}
        <filter id="shadow">
          <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Base Shadow */}
      <ellipse cx="100" cy="245" rx="45" ry="6" fill="#000000" opacity="0.2" />

      {/* Base Platform */}
      <g filter="url(#shadow)">
        <ellipse cx="100" cy="235" rx="42" ry="10" fill="url(#goldDark)" stroke="#8B6914" strokeWidth="1.5" />
        <ellipse cx="100" cy="233" rx="42" ry="8" fill="url(#goldMain)" />
        <ellipse cx="100" cy="233" rx="30" ry="5" fill="url(#highlight)" opacity="0.4" />
      </g>

      {/* Pedestal - Bottom Tier */}
      <g filter="url(#glow)">
        <path
          d="M 65 235 L 70 215 L 130 215 L 135 235 Z"
          fill="url(#goldMain)"
          stroke="#8B6914"
          strokeWidth="1.5"
        />
        <path
          d="M 70 215 L 75 217 L 125 217 L 130 215 Z"
          fill="url(#highlight)"
          opacity="0.5"
        />
      </g>

      {/* Pedestal - Middle Tier */}
      <g>
        <rect
          x="75"
          y="195"
          width="50"
          height="20"
          fill="url(#goldMain)"
          stroke="#8B6914"
          strokeWidth="1.5"
        />
        <rect
          x="75"
          y="195"
          width="50"
          height="5"
          fill="url(#highlight)"
          opacity="0.6"
        />
        <rect
          x="78"
          y="198"
          width="44"
          height="14"
          fill="url(#goldDark)"
          opacity="0.3"
        />
      </g>

      {/* Pedestal - Top Tier */}
      <g filter="url(#glow)">
        <path
          d="M 70 195 L 75 175 L 125 175 L 130 195 Z"
          fill="url(#goldMain)"
          stroke="#8B6914"
          strokeWidth="1.5"
        />
        <path
          d="M 75 175 L 80 177 L 120 177 L 125 175 Z"
          fill="url(#highlight)"
          opacity="0.5"
        />
      </g>

      {/* Cup Stem */}
      <g>
        <path
          d="M 85 175 L 88 155 L 112 155 L 115 175 Z"
          fill="url(#goldMain)"
          stroke="#8B6914"
          strokeWidth="1.5"
        />
        <path
          d="M 88 155 L 90 157 L 110 157 L 112 155 Z"
          fill="url(#highlight)"
          opacity="0.6"
        />
      </g>

      {/* Main Cup Body */}
      <g filter="url(#strongGlow)">
        <path
          d="M 88 155 Q 65 135 68 90 Q 68 65 78 50 Q 85 40 100 40 Q 115 40 122 50 Q 132 65 132 90 Q 135 135 112 155 Z"
          fill="url(#goldMain)"
          stroke="#DAA520"
          strokeWidth="2.5"
        />

        {/* Cup Inner Shadow */}
        <path
          d="M 90 150 Q 70 130 72 90 Q 72 70 80 55 Q 85 48 100 48 Q 115 48 120 55 Q 128 70 128 90 Q 130 130 110 150 Z"
          fill="url(#goldDark)"
          opacity="0.3"
        />
      </g>

      {/* Left Handle */}
      <g filter="url(#glow)">
        <path
          d="M 68 100 Q 45 100 38 75 Q 42 50 68 65"
          fill="none"
          stroke="url(#goldMain)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 68 100 Q 48 100 42 78 Q 45 58 68 68"
          fill="none"
          stroke="url(#highlight)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>

      {/* Right Handle */}
      <g filter="url(#glow)">
        <path
          d="M 132 100 Q 155 100 162 75 Q 158 50 132 65"
          fill="none"
          stroke="url(#goldMain)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 132 100 Q 152 100 158 78 Q 155 58 132 68"
          fill="none"
          stroke="url(#highlight)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>

      {/* Cup Rim */}
      <g>
        <ellipse
          cx="100"
          cy="40"
          rx="35"
          ry="10"
          fill="url(#goldMain)"
          stroke="#DAA520"
          strokeWidth="2"
        />
        <ellipse
          cx="100"
          cy="38"
          rx="35"
          ry="8"
          fill="url(#goldDark)"
          opacity="0.4"
        />
        <ellipse
          cx="100"
          cy="40"
          rx="28"
          ry="6"
          fill="url(#highlight)"
          opacity="0.7"
        />
      </g>

      {/* Main Shine on Cup */}
      <ellipse
        cx="85"
        cy="80"
        rx="18"
        ry="45"
        fill="url(#shine)"
        opacity="0.5"
        transform="rotate(-15 85 80)"
      />

      {/* Top Rim Shine */}
      <ellipse
        cx="100"
        cy="40"
        rx="22"
        ry="5"
        fill="#FFFFFF"
        opacity="0.6"
      />

      {/* Decorative Band */}
      <ellipse
        cx="100"
        cy="120"
        rx="32"
        ry="4"
        fill="#8B6914"
        opacity="0.5"
      />
      <ellipse
        cx="100"
        cy="119"
        rx="32"
        ry="2"
        fill="#FFD700"
        opacity="0.8"
      />
    </svg>
  );
}
