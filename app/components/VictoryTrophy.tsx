export default function VictoryTrophy({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Premium Bronze/Gold Gradient */}
        <linearGradient id="bronzeGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE4B5" />
          <stop offset="20%" stopColor="#DEB887" />
          <stop offset="50%" stopColor="#CD853F" />
          <stop offset="80%" stopColor="#8B4513" />
          <stop offset="100%" stopColor="#654321" />
        </linearGradient>

        {/* Dark Bronze for Shadows */}
        <linearGradient id="darkBronze" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B4513" />
          <stop offset="100%" stopColor="#3E2723" />
        </linearGradient>

        {/* Bright Highlight */}
        <radialGradient id="bronzeHighlight">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FFE4B5" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#CD853F" stopOpacity="0" />
        </radialGradient>

        {/* Metallic Shine */}
        <linearGradient id="metalShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Strong Glow */}
        <filter id="strongGlow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft Glow */}
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Shadow */}
        <filter id="dropShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Base Shadow */}
      <ellipse cx="100" cy="285" rx="50" ry="8" fill="#000000" opacity="0.3" />

      {/* Base Platform - Bottom */}
      <g filter="url(#dropShadow)">
        <ellipse cx="100" cy="275" rx="48" ry="12" fill="url(#darkBronze)" stroke="#654321" strokeWidth="2" />
        <ellipse cx="100" cy="273" rx="48" ry="10" fill="url(#bronzeGold)" />
        <ellipse cx="100" cy="273" rx="35" ry="6" fill="url(#bronzeHighlight)" opacity="0.5" />

        {/* Decorative Ring */}
        <ellipse cx="100" cy="273" rx="42" ry="8" fill="none" stroke="#8B4513" strokeWidth="1" opacity="0.6" />
      </g>

      {/* Text Plate - "美女PK冠軍" */}
      <g>
        <rect x="60" y="255" width="80" height="18" rx="2" fill="url(#bronzeGold)" stroke="#654321" strokeWidth="1.5" />
        <rect x="60" y="255" width="80" height="5" fill="url(#bronzeHighlight)" opacity="0.6" />
        <text x="100" y="267" fontSize="9" fontWeight="bold" fill="#3E2723" textAnchor="middle" fontFamily="serif">
          Queen of Beauty
        </text>
      </g>

      {/* Pedestal - Lower Tier */}
      <g filter="url(#softGlow)">
        <path d="M 65 255 L 70 235 L 130 235 L 135 255 Z" fill="url(#bronzeGold)" stroke="#654321" strokeWidth="2" />
        <path d="M 70 235 L 75 237 L 125 237 L 130 235 Z" fill="url(#bronzeHighlight)" opacity="0.6" />
      </g>

      {/* Pedestal - Middle Tier */}
      <g>
        <rect x="75" y="215" width="50" height="20" fill="url(#bronzeGold)" stroke="#654321" strokeWidth="2" />
        <rect x="75" y="215" width="50" height="6" fill="url(#bronzeHighlight)" opacity="0.7" />
        <rect x="78" y="218" width="44" height="14" fill="url(#darkBronze)" opacity="0.3" />

        {/* Decorative Lines */}
        <line x1="77" y1="220" x2="77" y2="232" stroke="#654321" strokeWidth="1" opacity="0.5" />
        <line x1="123" y1="220" x2="123" y2="232" stroke="#654321" strokeWidth="1" opacity="0.5" />
      </g>

      {/* Pedestal - Upper Tier */}
      <g filter="url(#softGlow)">
        <path d="M 70 215 L 75 195 L 125 195 L 130 215 Z" fill="url(#bronzeGold)" stroke="#654321" strokeWidth="2" />
        <path d="M 75 195 L 80 197 L 120 197 L 125 195 Z" fill="url(#bronzeHighlight)" opacity="0.6" />
      </g>

      {/* Cup Stem */}
      <g>
        <path d="M 85 195 L 88 175 L 112 175 L 115 195 Z" fill="url(#bronzeGold)" stroke="#654321" strokeWidth="2" />
        <path d="M 88 175 L 90 177 L 110 177 L 112 175 Z" fill="url(#bronzeHighlight)" opacity="0.7" />
      </g>

      {/* Main Cup Body */}
      <g filter="url(#strongGlow)">
        <path
          d="M 88 175 Q 60 155 63 105 Q 63 75 75 55 Q 85 40 100 40 Q 115 40 125 55 Q 137 75 137 105 Q 140 155 112 175 Z"
          fill="url(#bronzeGold)"
          stroke="#8B4513"
          strokeWidth="3"
        />

        {/* Inner Shadow */}
        <path
          d="M 90 170 Q 65 150 67 105 Q 67 80 77 62 Q 85 50 100 50 Q 115 50 123 62 Q 133 80 133 105 Q 135 150 110 170 Z"
          fill="url(#darkBronze)"
          opacity="0.4"
        />

        {/* Decorative Relief Pattern - PK Shield */}
        <g opacity="0.8">
          {/* Shield Background */}
          <path d="M 100 120 L 85 110 L 85 95 L 100 85 L 115 95 L 115 110 Z" fill="#654321" opacity="0.6" />

          {/* PK Text */}
          <text x="100" y="108" fontSize="14" fontWeight="bold" fill="#3E2723" textAnchor="middle" fontFamily="serif">PK</text>

          {/* Decorative Laurels */}
          <path d="M 75 115 Q 70 110 75 105" stroke="#654321" strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M 125 115 Q 130 110 125 105" stroke="#654321" strokeWidth="2" fill="none" opacity="0.5" />
        </g>
      </g>

      {/* Cup Rim */}
      <g>
        <ellipse cx="100" cy="40" rx="38" ry="12" fill="url(#bronzeGold)" stroke="#8B4513" strokeWidth="2.5" />
        <ellipse cx="100" cy="38" rx="38" ry="10" fill="url(#darkBronze)" opacity="0.5" />
        <ellipse cx="100" cy="40" rx="30" ry="7" fill="url(#bronzeHighlight)" opacity="0.8" />
      </g>

      {/* Victory Goddess Statue */}
      <g filter="url(#strongGlow)">
        {/* Body */}
        <path
          d="M 100 10 L 95 25 L 97 35 L 103 35 L 105 25 Z"
          fill="url(#bronzeGold)"
          stroke="#654321"
          strokeWidth="1.5"
        />

        {/* Head */}
        <circle cx="100" cy="8" r="4" fill="url(#bronzeGold)" stroke="#654321" strokeWidth="1" />

        {/* Raised Arm with Wreath */}
        <path d="M 100 15 L 105 8" stroke="url(#bronzeGold)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="107" cy="6" r="3" fill="none" stroke="url(#bronzeGold)" strokeWidth="1.5" />

        {/* Other Arm */}
        <path d="M 100 15 L 95 20" stroke="url(#bronzeGold)" strokeWidth="2" strokeLinecap="round" />

        {/* Flowing Dress */}
        <path d="M 97 25 Q 92 30 95 35" stroke="url(#bronzeGold)" strokeWidth="1.5" fill="none" />
        <path d="M 103 25 Q 108 30 105 35" stroke="url(#bronzeGold)" strokeWidth="1.5" fill="none" />
      </g>

      {/* Main Shine on Cup */}
      <ellipse
        cx="80"
        cy="100"
        rx="20"
        ry="50"
        fill="url(#metalShine)"
        opacity="0.6"
        transform="rotate(-20 80 100)"
      />

      {/* Top Rim Shine */}
      <ellipse cx="100" cy="40" rx="25" ry="6" fill="#FFFFFF" opacity="0.7" />

      {/* Decorative Band on Cup */}
      <ellipse cx="100" cy="140" rx="35" ry="5" fill="#654321" opacity="0.6" />
      <ellipse cx="100" cy="139" rx="35" ry="3" fill="#DEB887" opacity="0.8" />
    </svg>
  );
}
