/**
 * Pixel-art ornaments.
 *
 * Drawn as SVG rect grids on a fixed integer viewBox with
 * `shape-rendering="crispEdges"`, so every block stays hard-edged at any size —
 * the point of the style is that pixels look like pixels.
 */

type Props = { className?: string; size?: number; style?: React.CSSProperties };

/* ------------------------------------------------------------------ */
/* Cloud                                                               */
/* ------------------------------------------------------------------ */

/** Rows of [x, y, width] runs, 16x9 grid. */
const CLOUD_RUNS: [number, number, number][] = [
  [5, 1, 5],
  [3, 2, 9],
  [2, 3, 12],
  [1, 4, 14],
  [1, 5, 14],
  [2, 6, 13],
  [4, 7, 8],
];

export function PixelCloud({ className, size = 96, style }: Props) {
  return (
    <svg
      viewBox="0 0 16 9"
      width={size}
      height={(size * 9) / 16}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {CLOUD_RUNS.map(([x, y, w]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={1} fill="currentColor" />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Coin                                                                */
/* ------------------------------------------------------------------ */

const COIN_OUTLINE: [number, number, number][] = [
  [4, 0, 6], [2, 1, 2], [10, 1, 2], [1, 2, 1], [12, 2, 1],
  [0, 3, 1], [13, 3, 1], [0, 4, 1], [13, 4, 1], [0, 5, 1], [13, 5, 1],
  [0, 6, 1], [13, 6, 1], [0, 7, 1], [13, 7, 1], [0, 8, 1], [13, 8, 1],
  [1, 9, 1], [12, 9, 1], [2, 10, 2], [10, 10, 2], [4, 11, 6],
];

const COIN_FILL: [number, number, number][] = [
  [4, 1, 6], [2, 2, 10], [1, 3, 12], [1, 4, 12], [1, 5, 12],
  [1, 6, 12], [1, 7, 12], [1, 8, 12], [2, 9, 10], [4, 10, 6],
];

/** The "$" glyph punched out of the coin face. */
const COIN_MARK: [number, number, number][] = [
  [6, 2, 2], [4, 3, 6], [3, 4, 3], [4, 5, 5], [7, 6, 3],
  [3, 7, 6], [6, 8, 2],
];

export function PixelCoin({ className, size = 44, style }: Props) {
  return (
    <svg
      viewBox="0 0 14 12"
      width={size}
      height={(size * 12) / 14}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {COIN_FILL.map(([x, y, w]) => (
        <rect key={`f${x}-${y}`} x={x} y={y} width={w} height={1} fill="var(--gold)" />
      ))}
      {COIN_MARK.map(([x, y, w]) => (
        <rect key={`m${x}-${y}`} x={x} y={y} width={w} height={1} fill="var(--ink)" opacity={0.28} />
      ))}
      {COIN_OUTLINE.map(([x, y, w]) => (
        <rect key={`o${x}-${y}`} x={x} y={y} width={w} height={1} fill="var(--ink)" />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Sparkle                                                             */
/* ------------------------------------------------------------------ */

/** Four-point star, drawn as a smooth path rather than pixels. */
export function Sparkle({ className, size = 28, style }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M12 0c.6 6.4 5 10.8 12 12-7 1.2-11.4 5.6-12 12-.6-6.4-5-10.8-12-12C7 10.8 11.4 6.4 12 0Z"
        fill="var(--lemon)"
        stroke="var(--ink)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Arrow                                                               */
/* ------------------------------------------------------------------ */

/** Hand-drawn pointer used next to marginalia. */
export function HandArrow({ className, size = 60, style }: Props) {
  return (
    <svg
      viewBox="0 0 64 40"
      width={size}
      height={(size * 40) / 64}
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M3 33C10 14 26 4 46 8c6 1 10 4 12 8"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M49 3c4 3 8 7 9 13-5-1-9-1-13 1"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Mascot                                                              */
/* ------------------------------------------------------------------ */

/**
 * The house character: a smug bird in shades. Purely decorative, and it is our
 * own drawing rather than a trace of anyone else's.
 */
export function Mascot({ className, size = 190, style }: Props) {
  return (
    <svg
      viewBox="0 0 160 190"
      width={size}
      height={(size * 190) / 160}
      className={className}
      style={style}
      aria-hidden="true"
    >
      <g stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        {/* tuft */}
        <path d="M74 26c-3-10 2-18 6-22 1 8 5 12 10 14" fill="#fdfaf0" />
        {/* body */}
        <ellipse cx="80" cy="112" rx="50" ry="62" fill="#fdfaf0" />
        {/* head */}
        <ellipse cx="80" cy="66" rx="42" ry="42" fill="#fdfaf0" />
        {/* shades */}
        <path d="M44 58h72" />
        <rect x="45" y="54" width="30" height="24" rx="9" fill="#e9e9ef" />
        <rect x="85" y="54" width="30" height="24" rx="9" fill="#e9e9ef" />
        {/* eyes behind the lenses */}
        <circle cx="60" cy="66" r="7" fill="var(--ink)" stroke="none" />
        <circle cx="100" cy="66" r="7" fill="var(--ink)" stroke="none" />
        <circle cx="62.5" cy="63" r="2.2" fill="#fff" stroke="none" />
        <circle cx="102.5" cy="63" r="2.2" fill="#fff" stroke="none" />
        {/* beak, wide and grinning */}
        <path d="M34 96c14-10 34-14 52-12 16 2 26 8 30 14-10 10-30 16-48 15-16-1-28-7-34-17Z" fill="var(--orange)" />
        <path d="M46 98c16-3 38-3 56 2" />
        {/* teeth */}
        <path d="M58 99v8M70 100v9M82 101v9M94 102v8" strokeWidth="3" />
        {/* wing */}
        <path d="M32 116c-8 10-8 24 2 32 6 5 12 6 18 4" fill="#fdfaf0" />
        {/* feet */}
        <path d="M62 172v10M62 182l-8 6M62 182l8 6M98 172v10M98 182l-8 6M98 182l8 6" />
      </g>
    </svg>
  );
}
