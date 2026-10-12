import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ConsultingHome.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CadBlueprintDrafting({ mounted, ar = false }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mounted || !svgRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const paths = svgRef.current.querySelectorAll("path, line");
      paths.forEach((p) => {
        let length = 400;
        if (typeof p.getTotalLength === "function") {
          try {
            length = p.getTotalLength() || 400;
          } catch (_) {
            length = 400;
          }
        }
        if (length === 400 && p.tagName && p.tagName.toLowerCase() === "line") {
          const x1 = parseFloat(p.getAttribute("x1") || 0);
          const y1 = parseFloat(p.getAttribute("y1") || 0);
          const x2 = parseFloat(p.getAttribute("x2") || 0);
          const y2 = parseFloat(p.getAttribute("y2") || 0);
          length = Math.hypot(x2 - x1, y2 - y1) || 400;
        }
        p.style.strokeDasharray = `${length}`;
        p.style.strokeDashoffset = `${length}`;
      });

      gsap.to(paths, {
        strokeDashoffset: 0,
        duration: 1.8,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: svgRef.current,
          start: "top 85%",
          once: true,
        },
      });
    }, svgRef);

    return () => ctx.revert();
  }, [mounted]);

  // Client-mounted guard ensures Node SSR markup never contains <svg>
  if (!mounted) return null;

  return (
    <div className={styles.cadDraftingOverlay} aria-hidden="true">
      <svg
        ref={svgRef}
        className={styles.cadSvg}
        viewBox="0 0 1200 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Technical dimension lines in #46766f */}
        <line x1="40" y1="50" x2="1160" y2="50" stroke="#46766f" strokeWidth="1.2" strokeDasharray="8 4" />
        <line x1="40" y1="36" x2="40" y2="64" stroke="#46766f" strokeWidth="1.6" />
        <line x1="1160" y1="36" x2="1160" y2="64" stroke="#46766f" strokeWidth="1.6" />
        <line x1="600" y1="40" x2="600" y2="60" stroke="#46766f" strokeWidth="1.4" />

        {/* Dimension ticks */}
        <path d="M 40 50 L 52 44 M 40 50 L 52 56" stroke="#46766f" strokeWidth="1.5" />
        <path d="M 1160 50 L 1148 44 M 1160 50 L 1148 56" stroke="#46766f" strokeWidth="1.5" />

        {/* Technical text annotations */}
        <text x="600" y="38" fill="#46766f" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="600" letterSpacing="0.1em">
          {ar ? "المسار الهندسي المعتمد // تفاوت ±0.002 // كود LOD 400" : "AXIS A-1 // SPAN: 48.00m // BIM LOD 400 // TOLERANCE ±0.002"}
        </text>

        {/* Viewfinder crosshairs */}
        <path d="M 90 120 L 130 120 M 110 100 L 110 140" stroke="#46766f" strokeWidth="1" />
        <circle cx="110" cy="120" r="12" stroke="#46766f" strokeWidth="1" strokeDasharray="3 3" />
        <text x="110" y="152" fill="#46766f" fontSize="8" textAnchor="middle" fontFamily="monospace">
          GRID A-01
        </text>

        <path d="M 1070 120 L 1110 120 M 1090 100 L 1090 140" stroke="#46766f" strokeWidth="1" />
        <circle cx="1090" cy="120" r="12" stroke="#46766f" strokeWidth="1" strokeDasharray="3 3" />
        <text x="1090" y="152" fill="#46766f" fontSize="8" textAnchor="middle" fontFamily="monospace">
          ELEV +14.25
        </text>
      </svg>
    </div>
  );
}
