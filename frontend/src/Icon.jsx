/* Simple line icons — thin single-stroke SVG, brand-colored.
   Replaces all emoji icons with a clean, hand-drawn portfolio look. */

const PATHS = {
  check: 'M4 12.5l5 5L20 6.5',
  grad: 'M2 8l10-4 10 4-10 4L2 8zm4 2.5V16c0 1.5 3.5 3 6 3s6-1.5 6-3v-5.5',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0-14v5l3.5 2',
  handshake:
    'M3 12l3-3 4 2 3-1 4 3m-11-1l3 3m5-5l3 3m-9 2l-3 3m3-3l3 3m0 0l2 2 4-4',
  award:
    'M12 15a5.5 5.5 0 100-11 5.5 5.5 0 000 11zM8.5 14L7 22l5-2.5L17 22l-1.5-8',
  gem: 'M6 3h12l4 6-10 12L2 9l4-6zM2 9h20M8 3l-2 6 6 12 6-12-2-6',
  trophy:
    'M7 4h10v5a5 5 0 01-10 0V4zM7 6H4a3 3 0 003 5m10-5h3a3 3 0 01-3 5M12 14v4m-4 3h8',
  rocket:
    'M12 3c3 2 5 5.5 5 9l-3 3h-4l-3-3c0-3.5 2-7 5-9zM12 11a1.8 1.8 0 100-3.6A1.8 1.8 0 0012 11zM9 17l-2 4m8-4l2 4',
  sprout: 'M12 21v-7m0 0C12 10 9 8 5 8c0 4 3 6 7 6zm0 0c0-4 3-7 7-7 0 4-3 7-7 7z',
  building: 'M4 21V5a1 1 0 011-1h9a1 1 0 011 1v16M15 10h4a1 1 0 011 1v10M4 21h17M8 8h3m-3 4h3m-3 4h3',
  bridge: 'M2 16h20M4 16V9m16 7V9M2 9c5-4 15-4 20 0M8 16v-3.5m8 3.5v-3.5M12 16v-4.5',
  med: 'M12 6v12M6 12h12M12 21a9 9 0 100-18 9 9 0 000 18z',
  scale:
    'M12 4v16M8 20h8M12 7L5 9m7-2l7 2M5 9l-2.5 5a3 3 0 005 0L5 9zm14 0l-2.5 5a3 3 0 005 0L19 9z',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  chart: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  ruler: 'M3 15L15 3l6 6L9 21l-6-6zm7-7l2 2m1 1l2 2m1 1l2 2',
  cube: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12L4 7.5M12 12v9',
  mail: 'M3 6h18v12H3V6zm0 0l9 7 9-7',
  phone: 'M5 4h4l2 5-2.5 1.5a12 12 0 006 6L16 14l5 2v4a1 1 0 01-1 1A17 17 0 014 5a1 1 0 011-1z',
  globe:
    'M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5-2.5 3.5-6 3.5-9S14.5 5.5 12 3c-2.5 2.5-3.5 6-3.5 9s1 6.5 3.5 9zM3.5 9h17m-17 6h17',
  shield: 'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zm-3 9l2.5 2.5L16 10',
  star: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z',
  target:
    'M12 21a9 9 0 100-18 9 9 0 000 18zm0-4.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm0-3a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z',
  users: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm-6 9c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5m2-8.5a3 3 0 100-6m1 14c0-2.5-1-4.3-2.5-5.3',
  send: 'M21 3L3 10.5l7 3 3 7L21 3zm-11 10.5L21 3',
};

export default function Icon({ name, size = 22, className = '' }) {
  const d = PATHS[name] || PATHS.check;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
