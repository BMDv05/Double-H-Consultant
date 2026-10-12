import { useEffect, useRef, useState } from "react";
import { perspectivePose } from "./perspectivePose.js";
import styles from "./PerspectiveScene.module.css";

export default function PerspectiveScene({ lang = "en" }) {
  const ar = lang === "ar";
  const root = useRef(null),
    host = useRef(null);
  const engine = useRef(null);
  const state = useRef({
    manualProgress: null,
    scrollProgress: 0,
    yaw: 0,
    pointerX: 0,
    pointerY: 0,
    paused: false,
    quiet: false,
    visible: false,
  });
  const wake = useRef(() => {});
  const [renderer, setRenderer] = useState("css");
  const [active, setActive] = useState(0);
  const [following, setFollowing] = useState(true);
  const [paused, setPaused] = useState(false);
  const drag = useRef(null);
  function syncFallback() {
    const s = state.current,
      p = s.manualProgress ?? s.scrollProgress;
    root.current?.style.setProperty("--turn", `${(s.yaw * 180) / Math.PI}deg`);
    root.current?.querySelectorAll("[data-plane]").forEach((plane, index) => {
      const pose = perspectivePose(p, index);
      plane.style.transform = `translate3d(${pose.position[0] * 60}px,${-pose.position[1] * 60}px,${pose.position[2] * 60}px) rotateX(${pose.rotation[0]}rad) rotateY(${pose.rotation[1]}rad) rotateZ(${pose.rotation[2]}rad)`;
    });
  }
  useEffect(() => {
    let disposed = false,
      loading = false,
      frame = 0,
      last = 0,
      intersectionVisible = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const element = root.current,
      publicRoot = element.closest(".dh-public");
    function draw(now) {
      frame = 0;
      const s = state.current;
      if (disposed || !engine.current || !s.visible || document.hidden) return;
      if (now - last >= 1000 / 30 || s.quiet || s.paused) {
        engine.current.render(s, now / 1000);
        last = now;
      }
      if (!s.quiet && !s.paused) frame = requestAnimationFrame(draw);
    }
    function resume() {
      cancelAnimationFrame(frame);
      frame = 0;
      const s = state.current;
      element.dataset.renderState = !s.visible
        ? "offscreen"
        : document.hidden
          ? "hidden"
          : s.quiet
            ? "reduced"
            : s.paused
              ? "paused"
              : "running";
      element.dataset.pose = String(s.manualProgress ?? s.scrollProgress);
      if (engine.current && s.visible && !document.hidden) {
        if (s.quiet || s.paused)
          engine.current.render(s, performance.now() / 1000);
        else frame = requestAnimationFrame(draw);
      }
      syncFallback();
    }
    wake.current = resume;
    function onScroll() {
      const s = state.current,
        hero = element.closest("#hero");
      const height = hero?.offsetHeight || window.innerHeight;
      if (!s.paused && !s.quiet) {
        s.scrollProgress = Math.max(
          0,
          Math.min(1, window.scrollY / (height * 0.72)),
        );
        if (s.manualProgress === null)
          setActive(Math.round(s.scrollProgress * 2));
      }
      s.visible =
        intersectionVisible && (!hero || window.scrollY < height * 0.95);
      resume();
      if (s.visible && !s.quiet && !loading && !engine.current) void load();
    }
    function preference() {
      state.current.quiet =
        reduced.matches || publicRoot?.dataset.reducedMotion === "true";
      element.dataset.quiet = String(state.current.quiet);
      onScroll();
      if (!state.current.quiet && intersectionVisible) void load();
    }
    async function load() {
      if (loading || disposed || state.current.quiet) return;
      const hero = element.closest("#hero");
      if (hero && window.scrollY >= hero.offsetHeight * 0.95) return;
      loading = true;
      try {
        const { createPerspectiveRenderer } = await import(
          "./createPerspectiveRenderer.js"
        );
        if (disposed) return;
        engine.current = createPerspectiveRenderer(host.current);
        engine.current.canvas.addEventListener("webglcontextlost", lost);
        setRenderer("webgl");
        resume();
      } catch (error) {
        if (!disposed) {
          setRenderer("css");
          element.dataset.renderer = "css";
          element.dataset.rendererError = String(
            error?.message || "3D initialization failed",
          ).slice(0, 180);
        }
      }
    }
    function lost(event) {
      event.preventDefault();
      cancelAnimationFrame(frame);
      engine.current?.canvas.removeEventListener("webglcontextlost", lost);
      engine.current?.dispose();
      engine.current = null;
      setRenderer("css");
      resume();
    }
    const visibility = new IntersectionObserver(
      (entries) => {
        intersectionVisible = entries[0].isIntersecting;
        onScroll();
      },
      { threshold: 0 },
    );
    visibility.observe(element);
    const lazy = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) void load();
      },
      { rootMargin: "250px" },
    );
    lazy.observe(element);
    const mutation = new MutationObserver(preference);
    if (publicRoot)
      mutation.observe(publicRoot, {
        attributes: true,
        attributeFilter: ["data-reduced-motion"],
      });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("visibilitychange", resume);
    reduced.addEventListener("change", preference);
    preference();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      visibility.disconnect();
      lazy.disconnect();
      mutation.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", resume);
      reduced.removeEventListener("change", preference);
      engine.current?.canvas.removeEventListener("webglcontextlost", lost);
      engine.current?.dispose();
      engine.current = null;
      wake.current = () => {};
    };
  }, []);
  function choose(index) {
    state.current.manualProgress = index / 2;
    setActive(index);
    setFollowing(false);
    wake.current();
  }
  function rotate(amount) {
    state.current.yaw += amount;
    wake.current();
  }
  function follow() {
    state.current.manualProgress = null;
    setFollowing(true);
    setActive(Math.round(state.current.scrollProgress * 2));
    wake.current();
  }
  const labels = ar
    ? ["استكشف", "اربط", "ركّز"]
    : ["Explore", "Connect", "Focus"];
  return (
    <figure
      ref={root}
      className={styles.scene}
      data-renderer={renderer}
      data-paused={paused}
      aria-label={
        ar ? "تجربة المنظور ثلاثية الأبعاد" : "Interactive 3D perspective"
      }
    >
      <figcaption>
        <span>{ar ? "منظور متحرك" : "Perspective in motion"}</span>
        <span className={styles.badge}>3D</span>
      </figcaption>
      <div
        className={styles.viewport}
        role="group"
        tabIndex={0}
        aria-label={
          ar
            ? "اسحب أفقياً أو استخدم الأسهم لتدوير المجسم"
            : "Drag horizontally or use arrow keys to rotate the sculpture"
        }
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            rotate(event.key === "ArrowLeft" ? -0.22 : 0.22);
          }
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            yaw: state.current.yaw,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          state.current.pointerX =
            (event.clientX - rect.left) / rect.width - 0.5;
          state.current.pointerY =
            (event.clientY - rect.top) / rect.height - 0.5;
          if (drag.current) {
            const dx = event.clientX - drag.current.x,
              dy = event.clientY - drag.current.y;
            if (event.pointerType !== "touch" || Math.abs(dx) > Math.abs(dy))
              state.current.yaw = drag.current.yaw + dx * 0.007;
          }
          wake.current();
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
        onPointerLeave={() => {
          state.current.pointerX = 0;
          state.current.pointerY = 0;
          if (!drag.current) wake.current();
        }}
      >
        <div ref={host} className={styles.canvas} aria-hidden="true" />
        <div className={styles.fallback} aria-hidden="true">
          <div className={styles.sculpture}>
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className={styles.plane} data-plane>
                <span />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        className={styles.stages}
        aria-label={
          ar ? "اختر ترتيب المنظورات" : "Choose a perspective arrangement"
        }
      >
        {labels.map((label, index) => (
          <button
            type="button"
            key={index}
            aria-pressed={active === index}
            onClick={() => choose(index)}
          >
            <span>0{index + 1}</span>
            {label}
          </button>
        ))}
      </div>
      <div className={styles.tools}>
        <button
          type="button"
          aria-label={ar ? "تدوير إلى اليسار" : "Rotate sculpture left"}
          onClick={() => rotate(-0.3)}
        >
          ←
        </button>
        <button
          type="button"
          aria-label={ar ? "تدوير إلى اليمين" : "Rotate sculpture right"}
          onClick={() => rotate(0.3)}
        >
          →
        </button>
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => {
            state.current.paused = !state.current.paused;
            setPaused(state.current.paused);
            wake.current();
          }}
        >
          {paused ? (ar ? "تشغيل" : "Play") : ar ? "إيقاف الحركة" : "Pause"}
        </button>
        <button type="button" aria-pressed={following} onClick={follow}>
          {ar ? "اتبع التمرير" : "Follow scroll"}
        </button>
        <button
          type="button"
          onClick={() => {
            state.current.yaw = 0;
            state.current.pointerX = 0;
            state.current.pointerY = 0;
            choose(0);
          }}
        >
          {ar ? "إعادة العرض" : "Reset view"}
        </button>
      </div>
      <p className={styles.hint}>
        {ar
          ? "اسحب للتدوير. مرّر لتوحيد المنظور."
          : "Drag to rotate. Scroll to bring perspectives together."}
      </p>
    </figure>
  );
}
