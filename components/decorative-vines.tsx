"use client"

export function DecorativeVines() {
  return (
    <div className="relative">
      {/* Left vine */}
      <div className="fixed left-0 top-0 bottom-0 w-32 pointer-events-none z-0 hidden lg:block overflow-hidden">
        <svg viewBox="0 0 120 1000" className="w-full h-full opacity-30" preserveAspectRatio="none">
          <defs>
            <linearGradient id="vineGradientLeft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className="[stop-color:hsl(var(--primary))]" stopOpacity="0.4" />
              <stop offset="100%" className="[stop-color:hsl(var(--primary))]" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Main vine stem with curves */}
          <path
            d="M 80 0 Q 50 80 60 160 Q 70 240 50 320 Q 30 400 55 480 Q 75 560 50 640 Q 25 720 60 800 Q 85 880 60 960 L 60 1000"
            fill="none"
            stroke="url(#vineGradientLeft)"
            strokeWidth="3"
            filter="url(#glow)"
            className="animate-[sway_8s_ease-in-out_infinite]"
          />

          {/* Secondary vine branches */}
          <path
            d="M 60 200 Q 40 220 30 240"
            fill="none"
            stroke="url(#vineGradientLeft)"
            strokeWidth="2"
            opacity="0.7"
          />
          <path
            d="M 50 400 Q 30 420 20 440"
            fill="none"
            stroke="url(#vineGradientLeft)"
            strokeWidth="2"
            opacity="0.7"
          />
          <path
            d="M 55 600 Q 35 620 25 640"
            fill="none"
            stroke="url(#vineGradientLeft)"
            strokeWidth="2"
            opacity="0.7"
          />

          {/* Leaves with organic shapes */}
          <g className="animate-[float_6s_ease-in-out_infinite]">
            <ellipse cx="40" cy="150" rx="12" ry="20" fill="url(#vineGradientLeft)" opacity="0.6" />
            <ellipse cx="35" cy="250" rx="10" ry="18" fill="url(#vineGradientLeft)" opacity="0.5" />
            <ellipse cx="25" cy="350" rx="14" ry="22" fill="url(#vineGradientLeft)" opacity="0.6" />
            <ellipse cx="20" cy="450" rx="11" ry="19" fill="url(#vineGradientLeft)" opacity="0.5" />
            <ellipse cx="30" cy="550" rx="13" ry="21" fill="url(#vineGradientLeft)" opacity="0.6" />
            <ellipse cx="25" cy="650" rx="12" ry="20" fill="url(#vineGradientLeft)" opacity="0.5" />
            <ellipse cx="35" cy="750" rx="10" ry="18" fill="url(#vineGradientLeft)" opacity="0.6" />
            <ellipse cx="40" cy="850" rx="14" ry="22" fill="url(#vineGradientLeft)" opacity="0.5" />
          </g>

          {/* Small decorative dots */}
          <circle cx="45" cy="180" r="3" fill="url(#vineGradientLeft)" opacity="0.4" />
          <circle cx="40" cy="380" r="2.5" fill="url(#vineGradientLeft)" opacity="0.4" />
          <circle cx="50" cy="580" r="3" fill="url(#vineGradientLeft)" opacity="0.4" />
          <circle cx="45" cy="780" r="2.5" fill="url(#vineGradientLeft)" opacity="0.4" />
        </svg>
      </div>

      {/* Right vine */}
      <div className="fixed right-0 top-0 bottom-0 w-32 pointer-events-none z-0 hidden lg:block overflow-hidden">
        <svg viewBox="0 0 120 1000" className="w-full h-full opacity-30" preserveAspectRatio="none">
          <defs>
            <linearGradient id="vineGradientRight" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" className="[stop-color:hsl(var(--primary))]" stopOpacity="0.4" />
              <stop offset="100%" className="[stop-color:hsl(var(--primary))]" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Main vine stem with curves (mirrored) */}
          <path
            d="M 40 0 Q 70 80 60 160 Q 50 240 70 320 Q 90 400 65 480 Q 45 560 70 640 Q 95 720 60 800 Q 35 880 60 960 L 60 1000"
            fill="none"
            stroke="url(#vineGradientRight)"
            strokeWidth="3"
            filter="url(#glow)"
            className="animate-[sway_8s_ease-in-out_infinite_reverse]"
          />

          {/* Secondary vine branches */}
          <path
            d="M 60 200 Q 80 220 90 240"
            fill="none"
            stroke="url(#vineGradientRight)"
            strokeWidth="2"
            opacity="0.7"
          />
          <path
            d="M 70 400 Q 90 420 100 440"
            fill="none"
            stroke="url(#vineGradientRight)"
            strokeWidth="2"
            opacity="0.7"
          />
          <path
            d="M 65 600 Q 85 620 95 640"
            fill="none"
            stroke="url(#vineGradientRight)"
            strokeWidth="2"
            opacity="0.7"
          />

          {/* Leaves with organic shapes (mirrored) */}
          <g className="animate-[float_6s_ease-in-out_infinite_0.5s]">
            <ellipse cx="80" cy="150" rx="12" ry="20" fill="url(#vineGradientRight)" opacity="0.6" />
            <ellipse cx="85" cy="250" rx="10" ry="18" fill="url(#vineGradientRight)" opacity="0.5" />
            <ellipse cx="95" cy="350" rx="14" ry="22" fill="url(#vineGradientRight)" opacity="0.6" />
            <ellipse cx="100" cy="450" rx="11" ry="19" fill="url(#vineGradientRight)" opacity="0.5" />
            <ellipse cx="90" cy="550" rx="13" ry="21" fill="url(#vineGradientRight)" opacity="0.6" />
            <ellipse cx="95" cy="650" rx="12" ry="20" fill="url(#vineGradientRight)" opacity="0.5" />
            <ellipse cx="85" cy="750" rx="10" ry="18" fill="url(#vineGradientRight)" opacity="0.6" />
            <ellipse cx="80" cy="850" rx="14" ry="22" fill="url(#vineGradientRight)" opacity="0.5" />
          </g>

          {/* Small decorative dots */}
          <circle cx="75" cy="180" r="3" fill="url(#vineGradientRight)" opacity="0.4" />
          <circle cx="80" cy="380" r="2.5" fill="url(#vineGradientRight)" opacity="0.4" />
          <circle cx="70" cy="580" r="3" fill="url(#vineGradientRight)" opacity="0.4" />
          <circle cx="75" cy="780" r="2.5" fill="url(#vineGradientRight)" opacity="0.4" />
        </svg>
      </div>
    </div>
  )
}
