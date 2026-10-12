import { useId } from 'react';
import { UI_LABELS } from './fixtures.js';
import styles from './HeroPoster.module.css';

// Clarity in motion: Four separate planes start with different orientations
// and gently settle into alignment, revealing a connecting path forward.
// Abstract architectural geometry; no fabricated project imagery.
export default function HeroPoster({ lang = 'en' }) {
  const rawId = useId().replaceAll(':', '');
  const id = `dh-poster-${rawId}`;
  const isArabic = lang === 'ar';
  const label = UI_LABELS[isArabic ? 'ar' : 'en'].poster;

  return (
    <figure className={styles.poster} dir={isArabic ? 'rtl' : 'ltr'}>
      <svg
        viewBox="0 0 580 500"
        role="img"
        aria-label={label}
        className={styles.drawing}
      >
        <defs>
          {/* Ambient Lighting */}
          <radialGradient id={`${id}-ambient`} cx="60%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#255855" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#134c4b" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#12393a" stopOpacity="0" />
          </radialGradient>

          {/* Plane Surface Shading */}
          <linearGradient id={`${id}-plane1`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e6ecec" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#46766f" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id={`${id}-plane2`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#46766f" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#134c4b" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id={`${id}-plane3`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a1844a" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#46766f" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id={`${id}-plane4`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#e6ecec" stopOpacity="0.08" />
          </linearGradient>

          {/* Luminous Connecting Path Gradient */}
          <linearGradient id={`${id}-path`} x1="10%" y1="80%" x2="90%" y2="20%">
            <stop offset="0%" stopColor="#46766f" stopOpacity="0.5" />
            <stop offset="45%" stopColor="#e6ecec" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Ambient Backlight */}
        <circle cx="310" cy="245" r="215" fill={`url(#${id}-ambient)`} />

        {/* Four Geometric Planes (Different Perspectives) */}
        <g className={styles.planesStage}>
          {/* Plane 1: Top Left Perspective (Context & Question) */}
          <g className={styles.plane1}>
            <polygon
              points="100,165 210,110 265,185 155,240"
              fill={`url(#${id}-plane1)`}
              stroke="#e6ecec"
              strokeWidth="1.2"
              strokeOpacity="0.65"
            />
            {/* Fine coordinate lines */}
            <line x1="125" y1="180" x2="235" y2="125" stroke="#e6ecec" strokeWidth="0.8" strokeOpacity="0.25" />
            <line x1="150" y1="205" x2="260" y2="150" stroke="#e6ecec" strokeWidth="0.8" strokeOpacity="0.25" />
            <circle cx="185" cy="175" r="3.5" fill="#e6ecec" fillOpacity="0.8" />
          </g>

          {/* Plane 2: Bottom Left Perspective (Technical Basis) */}
          <g className={styles.plane2}>
            <polygon
              points="110,335 220,280 275,355 165,410"
              fill={`url(#${id}-plane2)`}
              stroke="#a9bdb2"
              strokeWidth="1.2"
              strokeOpacity="0.6"
            />
            <line x1="135" y1="350" x2="245" y2="295" stroke="#a9bdb2" strokeWidth="0.8" strokeOpacity="0.25" />
            <line x1="160" y1="375" x2="270" y2="320" stroke="#a9bdb2" strokeWidth="0.8" strokeOpacity="0.25" />
            <circle cx="190" cy="345" r="3.5" fill="#a9bdb2" fillOpacity="0.8" />
          </g>

          {/* Plane 3: Top Right Perspective (Strategic Evaluation) */}
          <g className={styles.plane3}>
            <polygon
              points="290,175 400,120 455,195 345,250"
              fill={`url(#${id}-plane3)`}
              stroke="#d7ddd8"
              strokeWidth="1.2"
              strokeOpacity="0.65"
            />
            <line x1="315" y1="190" x2="425" y2="135" stroke="#d7ddd8" strokeWidth="0.8" strokeOpacity="0.25" />
            <line x1="340" y1="215" x2="450" y2="160" stroke="#d7ddd8" strokeWidth="0.8" strokeOpacity="0.25" />
            <circle cx="370" cy="185" r="3.5" fill="#d7ddd8" fillOpacity="0.8" />
          </g>

          {/* Plane 4: Bottom Right Perspective (Forward Implementation) */}
          <g className={styles.plane4}>
            <polygon
              points="300,345 410,290 465,365 355,420"
              fill={`url(#${id}-plane4)`}
              stroke="#ffffff"
              strokeWidth="1.4"
              strokeOpacity="0.8"
            />
            <line x1="325" y1="360" x2="435" y2="305" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.3" />
            <line x1="350" y1="385" x2="460" y2="330" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.3" />
            <circle cx="380" cy="355" r="3.5" fill="#ffffff" fillOpacity="0.9" />
          </g>
        </g>

        {/* Connecting Path: Multiple perspectives brought into coherent direction */}
        <g className={styles.pathGroup} fill="none">
          {/* Subtle Path Glow */}
          <path
            d="M 185 175 C 160 260 160 310 190 345 C 235 390 320 220 370 185 C 415 150 345 320 380 355 C 420 395 465 220 495 125"
            stroke="#a1844a"
            strokeWidth="10"
            strokeLinecap="round"
            className={styles.pathUnderglow}
          />
          {/* Main Focused Trajectory */}
          <path
            d="M 185 175 C 160 260 160 310 190 345 C 235 390 320 220 370 185 C 415 150 345 320 380 355 C 420 395 465 220 495 125"
            stroke={`url(#${id}-path)`}
            strokeWidth="3.2"
            strokeLinecap="round"
            className={styles.pathMain}
          />
        </g>

        {/* Forward Horizon Destination Beacon */}
        <g className={styles.beaconGroup}>
          <circle cx="495" cy="125" r="20" fill="none" stroke="#a1844a" strokeWidth="1" strokeOpacity="0.4" />
          <circle cx="495" cy="125" r="11" fill="none" stroke="#e6ecec" strokeWidth="1.2" strokeOpacity="0.75" />
          <circle cx="495" cy="125" r="5" fill="#ffffff" />
          <circle cx="495" cy="125" r="2" fill="#12393a" />
        </g>
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  );
}
