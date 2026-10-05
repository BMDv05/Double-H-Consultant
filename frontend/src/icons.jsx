/* Double H — simple minimal line icons (single set, currentColor strokes) */

function Svg({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconArch = () => (
  <Svg>
    <rect x="4" y="3" width="16" height="18" rx="1.5" />
    <path d="M9 21v-4h6v4" />
    <path d="M8 7.5h2M14 7.5h2M8 11.5h2M14 11.5h2" />
  </Svg>
);

export const IconCivil = () => (
  <Svg>
    <path d="M2 18h20" />
    <path d="M4 18c0-5 3.5-8.5 8-8.5s8 3.5 8 8.5" />
    <path d="M8 18v-3.5M12 18v-5M16 18v-3.5" />
  </Svg>
);

export const IconMedical = () => (
  <Svg>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </Svg>
);

export const IconLaw = () => (
  <Svg>
    <path d="M12 4v16M8 20h8" />
    <path d="M4 7h16" />
    <path d="M7 7l-2.2 6a2.8 2.8 0 0 0 4.4 0L7 7z" />
    <path d="M17 7l-2.2 6a2.8 2.8 0 0 0 4.4 0L17 7z" />
  </Svg>
);

export const IconElec = () => (
  <Svg>
    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
  </Svg>
);

export const IconMgmt = () => (
  <Svg>
    <path d="M3 3v18h18" />
    <path d="M8 17v-5M13 17V8M18 17v-8" />
  </Svg>
);

export const IconBD = () => (
  <Svg>
    <circle cx="12" cy="12" r="9" />
    <path d="M15.5 8.5l-2 5-5 2 2-5z" />
  </Svg>
);

export const IconBIM = () => (
  <Svg>
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
    <path d="M12 12l8-4.5M12 12L4 7.5M12 12v9" />
  </Svg>
);

export const IconCheck = () => (
  <Svg>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.5 2.5 5-6" />
  </Svg>
);

export const IconStar = () => (
  <Svg>
    <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z" />
  </Svg>
);

export const IconClock = () => (
  <Svg>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </Svg>
);

export const IconUsers = () => (
  <Svg>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M16 14.5c2.8.4 5 2.6 5 5.5" />
  </Svg>
);

export const IconBadge = () => (
  <Svg>
    <circle cx="12" cy="9" r="5.5" />
    <path d="M9.7 9l1.7 1.7 3-3.2" />
    <path d="M9 13.8L7 21l5-2.6L17 21l-2-7.2" />
  </Svg>
);

export const IconMail = () => (
  <Svg>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 7l8.5 6 8.5-6" />
  </Svg>
);

export const IconPhone = () => (
  <Svg>
    <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </Svg>
);

export const IconPhoneCall = () => (
  <Svg>
    <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    <path d="M17.5 4.5a8 8 0 0 1 0 9" />
  </Svg>
);

export const IconPin = () => (
  <Svg>
    <path d="M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10z" />
    <circle cx="12" cy="11" r="2.3" />
  </Svg>
);

export const IconRefresh = () => (
  <Svg>
    <path d="M20 12a8 8 0 1 1-2.3-5.6" />
    <path d="M20 3v4.5h-4.5" />
  </Svg>
);

export const IconLogout = () => (
  <Svg>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </Svg>
);

export const IconDoc = () => (
  <Svg>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
    <path d="M8 13h8M8 17h5" />
  </Svg>
);

export const IconEye = () => (
  <Svg>
    <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const IconTrash = () => (
  <Svg>
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    <path d="M10 11v6M14 11v6" />
  </Svg>
);

export const IconClose = () => (
  <Svg>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const IconLock = () => (
  <Svg>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15.5" r="1.4" />
  </Svg>
);
