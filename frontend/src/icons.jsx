import {
  Building2,
  DraftingCompass,
  Activity,
  Scale,
  Zap,
  Workflow,
  TrendingUp,
  Boxes,
  Cpu,
  CircleCheck,
  Sparkles,
  Clock3,
  UsersRound,
  BadgeCheck,
  Mail,
  Phone,
  PhoneCall,
  MapPin,
  RotateCw,
  LogOut,
  FileText,
  Eye,
  Trash2,
  X,
  LockKeyhole,
  Menu,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Calendar,
  ChevronRight,
  Layers,
  Briefcase,
  Compass,
  CheckCircle2,
} from 'lucide-react';

const icon = (Component) =>
  function Icon(props) {
    return (
      <Component
        size={22}
        strokeWidth={1.6}
        aria-hidden="true"
        focusable="false"
        {...props}
      />
    );
  };

export const IconArch = icon(Building2);
export const IconCivil = icon(DraftingCompass);
export const IconMedical = icon(Activity);
export const IconLaw = icon(Scale);
export const IconElec = icon(Zap);
export const IconMgmt = icon(Workflow);
export const IconBD = icon(TrendingUp);
export const IconBIM = icon(Boxes);
export const IconStartups = icon(Cpu);
export const IconCheck = icon(CircleCheck);
export const IconStar = icon(Sparkles);
export const IconClock = icon(Clock3);
export const IconUsers = icon(UsersRound);
export const IconBadge = icon(BadgeCheck);
export const IconMail = icon(Mail);
export const IconPhone = icon(Phone);
export const IconPhoneCall = icon(PhoneCall);
export const IconPin = icon(MapPin);
export const IconRefresh = icon(RotateCw);
export const IconLogout = icon(LogOut);
export const IconDoc = icon(FileText);
export const IconEye = icon(Eye);
export const IconTrash = icon(Trash2);
export const IconClose = icon(X);
export const IconLock = icon(LockKeyhole);
export const IconMenu = icon(Menu);
export const IconArrow = icon(ArrowUpRight);
export const IconShield = icon(ShieldCheck);
export const IconAward = icon(Award);
export const IconCalendar = icon(Calendar);
export const IconChevron = icon(ChevronRight);
export const IconLayers = icon(Layers);
export const IconBriefcase = icon(Briefcase);
export const IconCompass = icon(Compass);
export const IconCheckBadge = icon(CheckCircle2);

/* =========================================================================
   OFFICIAL INSTITUTIONAL ACCREDITATION SEALS (SVG)
   Zero stock people, pure regulatory engineering emblems (PE, ISO, LEED, etc.)
   ========================================================================= */
export function CertSeal({ id, size = 58, className = '' }) {
  switch (id) {
    case 'pe':
      return (
        <svg
          className={`cert-seal-svg ${className}`}
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="47" stroke="#12393a" strokeWidth="2.5" fill="#e6ecec" />
          <circle cx="50" cy="50" r="42" stroke="#c59b27" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="38" stroke="#12393a" strokeWidth="1" />
          {/* Gear teeth accents */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
            <rect
              key={ang}
              x="48.5"
              y="2"
              width="3"
              height="4"
              fill="#12393a"
              transform={`rotate(${ang} 50 50)`}
            />
          ))}
          {/* Compass & Triangle Center */}
          <path d="M50 22 L66 68 L50 60 L34 68 Z" fill="none" stroke="#12393a" strokeWidth="2.2" strokeLinejoin="round" />
          <line x1="38" y1="56" x2="62" y2="56" stroke="#c59b27" strokeWidth="2" />
          <circle cx="50" cy="22" r="3.5" fill="#c59b27" />
          {/* Text labels */}
          <text x="50" y="78" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#12393a" letterSpacing="1.2">
            P.E. LICENSED
          </text>
          <text x="50" y="86" textAnchor="middle" fontSize="5" fontWeight="700" fill="#46766f" letterSpacing="0.8">
            STATE BOARDS • USA
          </text>
        </svg>
      );

    case 'iso':
      return (
        <svg
          className={`cert-seal-svg ${className}`}
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="47" stroke="#12393a" strokeWidth="2.5" fill="#e6ecec" />
          <circle cx="50" cy="50" r="42" stroke="#134c4b" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="38" stroke="#c59b27" strokeWidth="1" strokeDasharray="3 2" />
          {/* ISO Emblem */}
          <rect x="22" y="28" width="56" height="22" rx="4" fill="#12393a" />
          <text x="50" y="44" textAnchor="middle" fontSize="13" fontWeight="900" fill="#ffffff" letterSpacing="2">
            ISO
          </text>
          <text x="50" y="62" textAnchor="middle" fontSize="9" fontWeight="900" fill="#12393a" letterSpacing="0.8">
            9001:2015
          </text>
          <path d="M30 72 L42 80 L70 66" stroke="#c59b27" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="50" y="89" textAnchor="middle" fontSize="5" fontWeight="700" fill="#46766f" letterSpacing="0.8">
            QUALITY ASSURED
          </text>
        </svg>
      );

    case 'leed':
      return (
        <svg
          className={`cert-seal-svg ${className}`}
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="47" stroke="#134c4b" strokeWidth="2.5" fill="#e6ecec" />
          <polygon points="50,6 94,50 50,94 6,50" stroke="#c59b27" strokeWidth="1.2" fill="none" />
          <circle cx="50" cy="50" r="34" stroke="#12393a" strokeWidth="1" />
          {/* Architectural Leaf Motif */}
          <path
            d="M50 24 C62 34 64 54 50 66 C36 54 38 34 50 24 Z"
            fill="none"
            stroke="#134c4b"
            strokeWidth="2.4"
          />
          <path d="M50 24 L50 66" stroke="#c59b27" strokeWidth="1.5" />
          <line x1="50" y1="38" x2="57" y2="34" stroke="#c59b27" strokeWidth="1.2" />
          <line x1="50" y1="46" x2="43" y2="42" stroke="#c59b27" strokeWidth="1.2" />
          <line x1="50" y1="54" x2="57" y2="50" stroke="#c59b27" strokeWidth="1.2" />
          <text x="50" y="77" textAnchor="middle" fontSize="7" fontWeight="900" fill="#12393a" letterSpacing="1">
            LEED AP
          </text>
          <text x="50" y="86" textAnchor="middle" fontSize="4.8" fontWeight="800" fill="#46766f" letterSpacing="0.8">
            USGBC • BD+C
          </text>
        </svg>
      );

    case 'osha':
      return (
        <svg
          className={`cert-seal-svg ${className}`}
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Shield Outline */}
          <path
            d="M50 6 L88 20 C88 56 68 84 50 94 C32 84 12 56 12 20 Z"
            fill="#e6ecec"
            stroke="#12393a"
            strokeWidth="2.5"
          />
          <path
            d="M50 12 L82 24 C82 54 64 78 50 88 C36 78 18 54 18 24 Z"
            fill="none"
            stroke="#c59b27"
            strokeWidth="1.2"
          />
          {/* Central Cross / Shield Mark */}
          <rect x="44" y="26" width="12" height="30" rx="2" fill="#12393a" />
          <rect x="35" y="35" width="30" height="12" rx="2" fill="#12393a" />
          <text x="50" y="68" textAnchor="middle" fontSize="9" fontWeight="900" fill="#12393a" letterSpacing="1.5">
            OSHA
          </text>
          <text x="50" y="78" textAnchor="middle" fontSize="5" fontWeight="800" fill="#46766f" letterSpacing="0.8">
            29 CFR 1926/1910
          </text>
        </svg>
      );

    case 'pmp':
      return (
        <svg
          className={`cert-seal-svg ${className}`}
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <polygon points="50,4 96,50 50,96 4,50" fill="#e6ecec" stroke="#12393a" strokeWidth="2.5" />
          <polygon points="50,11 89,50 50,89 11,50" fill="none" stroke="#c59b27" strokeWidth="1.5" strokeDasharray="2 2" />
          {/* CPM Network Diagram Grid */}
          <circle cx="50" cy="30" r="4.5" fill="#12393a" />
          <circle cx="34" cy="48" r="4.5" fill="#46766f" />
          <circle cx="66" cy="48" r="4.5" fill="#46766f" />
          <circle cx="50" cy="64" r="4.5" fill="#c59b27" />
          <line x1="50" y1="30" x2="34" y2="48" stroke="#12393a" strokeWidth="1.8" />
          <line x1="50" y1="30" x2="66" y2="48" stroke="#12393a" strokeWidth="1.8" />
          <line x1="34" y1="48" x2="50" y2="64" stroke="#12393a" strokeWidth="1.8" />
          <line x1="66" y1="48" x2="50" y2="64" stroke="#c59b27" strokeWidth="2" />
          <text x="50" y="78" textAnchor="middle" fontSize="8" fontWeight="900" fill="#12393a" letterSpacing="1.2">
            PMP
          </text>
          <text x="50" y="86" textAnchor="middle" fontSize="5" fontWeight="800" fill="#46766f" letterSpacing="0.8">
            PMI • USA
          </text>
        </svg>
      );

    case 'autodesk':
      return (
        <svg
          className={`cert-seal-svg ${className}`}
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="47" stroke="#12393a" strokeWidth="2.5" fill="#e6ecec" />
          <circle cx="50" cy="50" r="42" stroke="#46766f" strokeWidth="1.2" />
          {/* Isometric 3D Wireframe Cube */}
          <polygon points="50,20 74,34 50,48 26,34" fill="none" stroke="#12393a" strokeWidth="2" />
          <polygon points="26,34 50,48 50,72 26,58" fill="none" stroke="#134c4b" strokeWidth="2" />
          <polygon points="74,34 50,48 50,72 74,58" fill="none" stroke="#c59b27" strokeWidth="2" />
          <circle cx="50" cy="48" r="2.5" fill="#c59b27" />
          <text x="50" y="81" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#12393a" letterSpacing="1">
            AUTODESK
          </text>
          <text x="50" y="89" textAnchor="middle" fontSize="4.8" fontWeight="800" fill="#46766f" letterSpacing="0.8">
            REVIT &amp; CIVIL 3D
          </text>
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================================================
   ARCHITECTURAL BLUEPRINT TECHNICAL SCHEMATICS (SVG)
   Zero stock people, pure engineering structural schematics for Core Values
   ========================================================================= */
export function ValueSchematic({ id, className = '' }) {
  switch (id) {
    case '1':
      // Structural Equilibrium & Cantilever Load Transfer Diagram
      return (
        <svg
          className={`value-schematic-svg ${className}`}
          viewBox="0 0 320 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Background drafting coordinate grid */}
          <defs>
            <pattern id="grid-1" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(70, 118, 111, 0.12)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="320" height="160" fill="url(#grid-1)" />

          {/* Cantilever Structural Beam */}
          <rect x="40" y="66" width="240" height="14" fill="#12393a" rx="2" />
          {/* Anchor Column / Wall */}
          <rect x="40" y="40" width="30" height="90" fill="#134c4b" rx="2" />
          <line x1="40" y1="40" x2="40" y2="130" stroke="#c59b27" strokeWidth="2" />
          {/* Force Vectors & Equilibrium */}
          <line x1="260" y1="30" x2="260" y2="60" stroke="#c59b27" strokeWidth="2.2" markerEnd="url(#arrow)" />
          <polygon points="260,64 256,54 264,54" fill="#c59b27" />
          <text x="260" y="24" textAnchor="middle" fontSize="9" fontWeight="800" fill="#12393a" letterSpacing="1">
            P_LIMIT
          </text>

          {/* Moment Arc */}
          <path d="M 78 52 A 22 22 0 0 1 106 72" stroke="#c59b27" strokeWidth="2" strokeDasharray="3 2" fill="none" />
          <text x="96" y="46" fontSize="8" fontWeight="800" fill="#c59b27">
            ΣM = 0
          </text>

          {/* Dimension Line */}
          <line x1="70" y1="94" x2="280" y2="94" stroke="#46766f" strokeWidth="1" strokeDasharray="4 2" />
          <line x1="70" y1="90" x2="70" y2="98" stroke="#46766f" strokeWidth="1" />
          <line x1="280" y1="90" x2="280" y2="98" stroke="#46766f" strokeWidth="1" />
          <text x="175" y="108" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#46766f" letterSpacing="0.8">
            SPAN L // NO SHORTCUTS
          </text>

          {/* Spec coordinate tag */}
          <text x="44" y="146" fontSize="7.5" fontWeight="800" fill="#46766f" letterSpacing="1.2">
            AIA ETHICS CODE • STRUCTURAL FIDUCIARY
          </text>
        </svg>
      );

    case '2':
      // Computational Coordinate Reticle & Micron Tolerance Node
      return (
        <svg
          className={`value-schematic-svg ${className}`}
          viewBox="0 0 320 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="grid-2" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(70, 118, 111, 0.12)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="320" height="160" fill="url(#grid-2)" />

          {/* Concentric Precision Reticles */}
          <circle cx="160" cy="74" r="52" stroke="#12393a" strokeWidth="1.2" strokeDasharray="4 3" />
          <circle cx="160" cy="74" r="36" stroke="#46766f" strokeWidth="1.5" />
          <circle cx="160" cy="74" r="16" stroke="#c59b27" strokeWidth="2" />
          <circle cx="160" cy="74" r="3" fill="#12393a" />

          {/* Precision Cross-Hair Axes */}
          <line x1="60" y1="74" x2="260" y2="74" stroke="#12393a" strokeWidth="1.4" />
          <line x1="160" y1="12" x2="160" y2="136" stroke="#12393a" strokeWidth="1.4" />

          {/* 45-degree tolerance rays */}
          <line x1="120" y1="34" x2="200" y2="114" stroke="#c59b27" strokeWidth="0.8" strokeDasharray="2 2" />
          <line x1="200" y1="34" x2="120" y2="114" stroke="#c59b27" strokeWidth="0.8" strokeDasharray="2 2" />

          {/* Micron tolerance annotations */}
          <text x="218" y="44" fontSize="8" fontWeight="800" fill="#12393a" letterSpacing="0.8">
            Δx ≤ 0.001 mm
          </text>
          <text x="218" y="58" fontSize="7.5" fontWeight="700" fill="#46766f">
            LOD 400 QA
          </text>
          <text x="70" y="44" fontSize="8" fontWeight="800" fill="#12393a" letterSpacing="0.8">
            DUAL-STAGE REVIEW
          </text>

          <text x="160" y="148" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#46766f" letterSpacing="1.2">
            COMPUTATIONAL VERIFICATION • PE AUDIT
          </text>
        </svg>
      );

    case '3':
      // Critical Path Method (CPM) Milestone Velocity Pipeline
      return (
        <svg
          className={`value-schematic-svg ${className}`}
          viewBox="0 0 320 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="grid-3" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(70, 118, 111, 0.12)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="320" height="160" fill="url(#grid-3)" />

          {/* Critical Path Backbone */}
          <line x1="45" y1="74" x2="275" y2="74" stroke="#12393a" strokeWidth="3" />

          {/* CPM Nodes */}
          {[
            { cx: 55, label: 'T0', sub: 'ALIGN' },
            { cx: 125, label: 'M1', sub: 'MODEL' },
            { cx: 195, label: 'M2', sub: 'VERIFY' },
            { cx: 265, label: 'M3', sub: 'DELIVER' },
          ].map((n, idx) => (
            <g key={n.label}>
              <circle cx={n.cx} cy="74" r="14" fill="#e6ecec" stroke={idx === 3 ? '#c59b27' : '#12393a'} strokeWidth="2.4" />
              <text x={n.cx} y="77" textAnchor="middle" fontSize="8" fontWeight="900" fill="#12393a">
                {n.label}
              </text>
              <text x={n.cx} y="104" textAnchor="middle" fontSize="7" fontWeight="800" fill="#46766f" letterSpacing="0.8">
                {n.sub}
              </text>
            </g>
          ))}

          {/* Velocity Vector Arrow */}
          <path d="M 60 42 L 255 42" stroke="#c59b27" strokeWidth="2" strokeDasharray="6 3" />
          <polygon points="262,42 252,38 252,46" fill="#c59b27" />
          <text x="160" y="34" textAnchor="middle" fontSize="8" fontWeight="800" fill="#c59b27" letterSpacing="1">
            CRITICAL PATH CPM // ZERO FLOAT DRIFT
          </text>

          <text x="160" y="148" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#46766f" letterSpacing="1.2">
            EARNED VALUE MANAGEMENT • 24H VELOCITY
          </text>
        </svg>
      );

    case '4':
      // Monolithic Foundation Load Grid & Interlocking Structural Anchor
      return (
        <svg
          className={`value-schematic-svg ${className}`}
          viewBox="0 0 320 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="grid-4" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(70, 118, 111, 0.12)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="320" height="160" fill="url(#grid-4)" />

          {/* Foundation Slab */}
          <rect x="40" y="68" width="240" height="22" fill="#12393a" rx="3" />
          <line x1="40" y1="74" x2="280" y2="74" stroke="#c59b27" strokeWidth="1" strokeDasharray="3 3" />

          {/* Deep Piling Columns */}
          {[65, 115, 160, 205, 255].map((x) => (
            <g key={x}>
              <rect x={x - 6} y="90" width="12" height="42" fill="#134c4b" rx="1" />
              <line x1={x} y1="90" x2={x} y2="132" stroke="#46766f" strokeWidth="1" />
              <line x1={x - 6} y1="132" x2={x + 6} y2="132" stroke="#c59b27" strokeWidth="2" />
            </g>
          ))}

          {/* Institutional Load Superstructure */}
          <rect x="120" y="24" width="80" height="44" fill="none" stroke="#12393a" strokeWidth="2" strokeDasharray="4 2" />
          <line x1="160" y1="12" x2="160" y2="44" stroke="#c59b27" strokeWidth="2.2" />
          <polygon points="160,48 156,38 164,38" fill="#c59b27" />
          <text x="160" y="20" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#12393a" letterSpacing="0.8">
            LIFECYCLE LOAD
          </text>

          <text x="50" y="52" fontSize="8" fontWeight="800" fill="#46766f">
            85%+ RETENTION
          </text>
          <text x="210" y="52" fontSize="8" fontWeight="800" fill="#46766f">
            18+ YEARS
          </text>

          <text x="160" y="148" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#46766f" letterSpacing="1.2">
            INSTITUTIONAL STEWARDSHIP • ENDURING CAPITAL
          </text>
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================================================
   DIAGNOSTIC ADVISORY JOURNEY SCHEMATICS (SVG)
   Interactive technical diagrams illustrating the 3 consultation phases
   ========================================================================= */
export function JourneySchematic({ phase, className = '' }) {
  switch (Number(phase)) {
    case 1:
      // Phase 01: Scope & Code Diagnostic (Structural Envelope & Zoning Grid)
      return (
        <svg
          className={`journey-schematic-svg ${className}`}
          viewBox="0 0 340 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="j-grid-1" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(70, 118, 111, 0.15)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="340" height="180" fill="url(#j-grid-1)" />

          {/* Building Mass Envelope & Zoning Setback Boundary */}
          <polygon points="50,140 50,70 120,40 220,40 220,140" fill="rgba(18, 57, 58, 0.08)" stroke="#12393a" strokeWidth="2" />
          <polygon points="35,145 35,60 115,25 235,25 235,145" fill="none" stroke="#c59b27" strokeWidth="1.2" strokeDasharray="4 3" />
          <text x="238" y="32" fontSize="7.5" fontWeight="800" fill="#c59b27">
            ZONING SETBACK ENVELOPE
          </text>

          {/* Internal Structural Grid Lines */}
          <line x1="50" y1="105" x2="220" y2="105" stroke="#46766f" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="120" y1="40" x2="120" y2="140" stroke="#46766f" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="170" y1="40" x2="170" y2="140" stroke="#46766f" strokeWidth="1" strokeDasharray="3 2" />

          {/* Load Vectors */}
          <line x1="85" y1="20" x2="85" y2="52" stroke="#12393a" strokeWidth="2" />
          <polygon points="85,58 81,48 89,48" fill="#12393a" />
          <line x1="170" y1="14" x2="170" y2="36" stroke="#12393a" strokeWidth="2" />
          <polygon points="170,42 166,32 174,32" fill="#12393a" />

          {/* Code Diagnostic Checkpoint Badge */}
          <rect x="230" y="75" width="95" height="52" rx="3" fill="#ffffff" stroke="#12393a" strokeWidth="1.4" />
          <rect x="230" y="75" width="95" height="15" fill="#12393a" />
          <text x="277" y="86" textAnchor="middle" fontSize="7" fontWeight="900" fill="#ffffff" letterSpacing="0.8">
            CODE VERIFICATION
          </text>
          <text x="240" y="103" fontSize="7.5" fontWeight="800" fill="#12393a">
            ✓ ASCE 7-22 // IBC
          </text>
          <text x="240" y="117" fontSize="7.5" fontWeight="800" fill="#46766f">
            ✓ FAR &amp; HEIGHT LIMIT
          </text>

          {/* Datum Elevation Markers */}
          <line x1="30" y1="140" x2="240" y2="140" stroke="#12393a" strokeWidth="2" />
          <text x="35" y="155" fontSize="7" fontWeight="800" fill="#46766f" letterSpacing="1">
            GRADE LEVEL // EL +0.000m
          </text>
          <text x="220" y="168" textAnchor="end" fontSize="7.5" fontWeight="800" fill="#12393a" letterSpacing="0.8">
            PHASE 01: SCOPE DIAGNOSTIC • PE SIGN-OFF
          </text>
        </svg>
      );

    case 2:
      // Phase 02: Risk & Milestone Mapping (Clash Matrix & Trade Coordination)
      return (
        <svg
          className={`journey-schematic-svg ${className}`}
          viewBox="0 0 340 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="j-grid-2" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(70, 118, 111, 0.15)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="340" height="180" fill="url(#j-grid-2)" />

          {/* Trade Systems: Structural vs MEP Conduit vs Architectural Slab */}
          <rect x="40" y="45" width="260" height="14" fill="#12393a" rx="2" />
          <text x="46" y="55" fontSize="6.5" fontWeight="900" fill="#e6ecec" letterSpacing="0.8">
            STRUCTURAL BEAM // W24x68
          </text>

          {/* MEP Duct Crossing Line */}
          <path d="M 90 20 L 90 130" stroke="#c59b27" strokeWidth="8" strokeLinecap="round" strokeOpacity="0.85" />
          <text x="96" y="32" fontSize="6.5" fontWeight="900" fill="#c59b27">
            MEP MAIN
          </text>

          {/* Cable Tray Route */}
          <path d="M 190 20 L 190 130" stroke="#46766f" strokeWidth="6" strokeDasharray="6 3" />
          <text x="196" y="32" fontSize="6.5" fontWeight="900" fill="#46766f">
            HV CABLE
          </text>

          {/* Coordination Intersection Node */}
          <circle cx="90" cy="52" r="16" fill="rgba(197, 155, 39, 0.2)" stroke="#c59b27" strokeWidth="2" strokeDasharray="3 2" />
          <circle cx="90" cy="52" r="4" fill="#c59b27" />

          {/* Risk Mitigation Callout Card */}
          <rect x="140" y="80" width="160" height="56" rx="3" fill="#ffffff" stroke="#134c4b" strokeWidth="1.4" />
          <rect x="140" y="80" width="160" height="15" fill="#134c4b" />
          <text x="220" y="91" textAnchor="middle" fontSize="7" fontWeight="900" fill="#ffffff" letterSpacing="0.8">
            BIM LOD 400 CLASH RESOLUTION
          </text>
          <text x="150" y="108" fontSize="7.5" fontWeight="800" fill="#12393a">
            ✓ PREVENT PENETRATION RE-WORK
          </text>
          <text x="150" y="122" fontSize="7.5" fontWeight="800" fill="#46766f">
            ✓ CAPITAL RISK MITIGATION: $0 SURPRISE
          </text>

          {/* Arrow pointing to intersection */}
          <path d="M 140 100 L 112 70" stroke="#c59b27" strokeWidth="1.6" strokeDasharray="3 2" />
          <polygon points="110,68 118,74 114,80" fill="#c59b27" />

          <text x="170" y="164" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#12393a" letterSpacing="1">
            PHASE 02: MILESTONE &amp; PROCUREMENT RISK MAPPING
          </text>
        </svg>
      );

    case 3:
      // Phase 03: Actionable Technical Roadmap (CPM Sequencing & Velocity Timeline)
      return (
        <svg
          className={`journey-schematic-svg ${className}`}
          viewBox="0 0 340 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="j-grid-3" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(70, 118, 111, 0.15)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="340" height="180" fill="url(#j-grid-3)" />

          {/* Timeline Axis Track */}
          <line x1="40" y1="90" x2="300" y2="90" stroke="#12393a" strokeWidth="2.5" />

          {/* Milestone 1: Diagnostic & Permitting */}
          <circle cx="70" cy="90" r="14" fill="#ffffff" stroke="#12393a" strokeWidth="2.5" />
          <text x="70" y="94" textAnchor="middle" fontSize="9" fontWeight="900" fill="#12393a">
            01
          </text>
          <rect x="35" y="32" width="70" height="38" rx="2" fill="#ffffff" stroke="#12393a" strokeWidth="1.2" />
          <text x="70" y="46" textAnchor="middle" fontSize="7" fontWeight="900" fill="#12393a">
            WEEKS 1–2
          </text>
          <text x="70" y="58" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#46766f">
            Scope &amp; Code
          </text>
          <line x1="70" y1="70" x2="70" y2="76" stroke="#12393a" strokeWidth="1.5" />

          {/* Milestone 2: Multi-Trade BIM & Engineering */}
          <circle cx="170" cy="90" r="14" fill="#ffffff" stroke="#134c4b" strokeWidth="2.5" />
          <text x="170" y="94" textAnchor="middle" fontSize="9" fontWeight="900" fill="#134c4b">
            02
          </text>
          <rect x="135" y="112" width="70" height="38" rx="2" fill="#ffffff" stroke="#134c4b" strokeWidth="1.2" />
          <text x="170" y="126" textAnchor="middle" fontSize="7" fontWeight="900" fill="#134c4b">
            WEEKS 3–6
          </text>
          <text x="170" y="138" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#46766f">
            BIM LOD 400
          </text>
          <line x1="170" y1="104" x2="170" y2="112" stroke="#134c4b" strokeWidth="1.5" />

          {/* Milestone 3: Execution Sign-Off & Construction Velocity */}
          <circle cx="270" cy="90" r="14" fill="#c59b27" stroke="#12393a" strokeWidth="2.5" />
          <text x="270" y="94" textAnchor="middle" fontSize="9" fontWeight="900" fill="#ffffff">
            03
          </text>
          <rect x="235" y="32" width="70" height="38" rx="2" fill="#ffffff" stroke="#c59b27" strokeWidth="1.2" />
          <text x="270" y="46" textAnchor="middle" fontSize="7" fontWeight="900" fill="#c59b27">
            WEEKS 7+
          </text>
          <text x="270" y="58" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#12393a">
            Execution Velocity
          </text>
          <line x1="270" y1="70" x2="270" y2="76" stroke="#c59b27" strokeWidth="1.5" />

          {/* Connecting Progress Arrow */}
          <path d="M 84 90 L 156 90" stroke="#134c4b" strokeWidth="2.5" />
          <polygon points="156,90 148,86 148,94" fill="#134c4b" />
          <path d="M 184 90 L 256 90" stroke="#c59b27" strokeWidth="2.5" />
          <polygon points="256,90 248,86 248,94" fill="#c59b27" />

          <text x="170" y="168" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#12393a" letterSpacing="1">
            PHASE 03: CONCRETE ROADMAP &amp; MULTIDISCIPLINARY SEQUENCING
          </text>
        </svg>
      );

    default:
      return null;
  }
}
