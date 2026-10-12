import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./ConsultingHome.module.css";

export default function ArchitecturalHud({ ar = false, mounted = false }) {
  const cursorRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mounted || !cursorRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const el = cursorRef.current;
    gsap.set(el, { xPercent: -50, yPercent: -130 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    let isVisible = false;

    function onPointerMove(e) {
      const targetCard = e.target.closest("[data-hud-inspect], [data-chapter], [data-tour-card]");
      if (targetCard) {
        if (!isVisible) {
          gsap.set(el, { x: e.clientX, y: e.clientY });
          isVisible = true;
        }
        xTo(e.clientX);
        yTo(e.clientY);
        el.style.opacity = "1";
        const label = targetCard.getAttribute("data-hud-label");
        if (label) {
          const textEl = el.querySelector("[data-badge-text]");
          if (textEl) textEl.textContent = label;
        }
      } else {
        if (isVisible) {
          el.style.opacity = "0";
          isVisible = false;
        }
      }
    }

    function onPointerLeave() {
      if (isVisible) {
        el.style.opacity = "0";
        isVisible = false;
      }
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
      xTo?.tween?.kill();
      yTo?.tween?.kill();
    };
  }, [mounted]);

  // Client-mounted guard ensures Node SSR markup is never polluted
  if (!mounted) return null;

  return (
    <>
      {/* Viewfinder crosshairs */}
      <div className={styles.viewfinderCrosshairs} aria-hidden="true">
        <span className={`${styles.crosshair} ${styles.crosshairTl}`} />
        <span className={`${styles.crosshair} ${styles.crosshairTr}`} />
        <span className={`${styles.crosshair} ${styles.crosshairBl}`} />
        <span className={`${styles.crosshair} ${styles.crosshairBr}`} />
      </div>

      {/* Magnetic Cursor Follower Badge with GSAP quickTo physics */}
      <div
        ref={cursorRef}
        className={styles.cursorBadge}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <span data-badge-text>{ar ? "معاينة المشروع" : "VIEW CASE"}</span>
        <span className={styles.cursorArrow}>↗</span>
      </div>
    </>
  );
}
