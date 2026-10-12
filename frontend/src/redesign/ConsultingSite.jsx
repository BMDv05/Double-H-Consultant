import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "../LangContext.jsx";
import SiteHeader from "./foundation/SiteHeader.jsx";
import StickyCall from "./foundation/StickyCall.jsx";
import ConsultationModal from "./booking/ConsultationModal.jsx";
import ConsultingHome from "./home/ConsultingHome.jsx";
import ConsultingContact from "./ConsultingContact.jsx";
import "./foundation/tokens.css";
import styles from "./ConsultingSite.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ConsultingSite() {
  const { lang, setLang } = useLang();
  const { hash, pathname } = useLocation();
  const contactPage = pathname.replace(/\/+$/, "") === "/contact";
  const [request, setRequest] = useState({ source: "hero" });
  const [open, setOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const ar = lang === "ar";

  function book(nextRequest) {
    setRequest(nextRequest);
    setOpen(true);
  }

  // Dynamic prefers-reduced-motion & DOM data-reduced-motion listener
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const checkMotion = () => {
      const domReduced = Boolean(document.querySelector('[data-reduced-motion="true"]'));
      setReduceMotion(media.matches || domReduced);
    };
    checkMotion();
    media.addEventListener("change", checkMotion);

    const observer = new MutationObserver(checkMotion);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-reduced-motion"],
      subtree: true,
    });

    return () => {
      media.removeEventListener("change", checkMotion);
      observer.disconnect();
    };
  }, []);

  // Momentum Inertia Scrolling: Lenis synchronized with GSAP's RAF ticker
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || prefersReduced) {
      if (window.__lenis) {
        window.__lenis.destroy();
        delete window.__lenis;
      }
      ScrollTrigger.refresh();
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCb = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    window.__lenis = lenis;
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      delete window.__lenis;
    };
  }, [reduceMotion]);

  // Complete teardown / pause of Lenis when modal opens
  useEffect(() => {
    if (typeof window === "undefined" || !window.__lenis) return;
    if (open) {
      window.__lenis.stop();
    } else {
      window.__lenis.start();
    }
  }, [open]);

  // Section observer for active indicator in Header and Floating Action Dock
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const sections = ["hero", "certificates", "about", "divisions", "journey", "values", "final", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [contactPage]);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const final = document.getElementById("final");
    if (!hero || !final) {
      setShowSticky(false);
      return undefined;
    }
    let frame = 0;
    function update() {
      frame = 0;
      const closing = final.getBoundingClientRect();
      const closingAction =
        final.querySelector("button")?.getBoundingClientRect() || closing;
      const primary = hero
        .querySelector("[data-primary-call]")
        ?.getBoundingClientRect();
      const proof = document
        .getElementById("certificates")
        ?.getBoundingClientRect();
      const clearance =
        parseFloat(
          getComputedStyle(hero.closest(".dh-public")).getPropertyValue(
            "--dh-header-height",
          ),
        ) || 88;
      const primaryVisible =
        primary &&
        primary.top >= clearance &&
        primary.bottom <= window.innerHeight &&
        (!proof || proof.top >= primary.bottom);
      const finalVisible =
        closingAction.top >= clearance &&
        closingAction.bottom <= window.innerHeight - 16;
      setShowSticky(window.scrollY > 24 && !primaryVisible && !finalVisible);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [contactPage]);

  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    const frame = requestAnimationFrame(() => {
      if (!hash) {
        if (window.__lenis) {
          window.__lenis.scrollTo(0, { immediate: true });
        } else {
          window.scrollTo({ top: 0, behavior: "instant" });
        }
        return;
      }
      const quiet =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        target?.closest('[data-reduced-motion="true"]');
      if (window.__lenis && !quiet) {
        window.__lenis.scrollTo(target, { offset: -88 });
      } else {
        target?.scrollIntoView({ behavior: quiet ? "auto" : "smooth" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, pathname]);
  return (
    <div
      className={`dh-public ${styles.site}`}
      data-reduced-motion={reduceMotion}
      lang={lang}
      dir={ar ? "rtl" : "ltr"}
    >
      <a
        className={styles.skip}
        href="#consulting-main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("consulting-main")?.focus();
        }}
      >
        {ar ? "انتقل إلى المحتوى" : "Skip to content"}
      </a>
      <SiteHeader lang={lang} onLanguageChange={setLang} onBook={book} activeSection={activeSection} />
      <main id="consulting-main" tabIndex={-1}>
        {contactPage ? (
          <ConsultingContact lang={lang} onBook={book} />
        ) : (
          <ConsultingHome lang={lang} onBook={book} />
        )}
      </main>
      <footer className={styles.footer}>
        <Link to="/" aria-label="Double H Consulting">
          <img src="/logo-dark.png" width="900" height="184" alt="Double H" />
          <span>{ar ? "للاستشارات" : "Consulting"}</span>
        </Link>
        <nav aria-label={ar ? "روابط أسفل الصفحة" : "Footer navigation"}>
          <Link to={{ pathname: "/", hash: "#about" }}>
            {ar ? "عنّا" : "About"}
          </Link>
          <Link to={{ pathname: "/", hash: "#divisions" }}>
            {ar ? "التخصصات" : "Services"}
          </Link>
          <Link to="/contact">{ar ? "تواصل معنا" : "Contact"}</Link>
        </nav>
        <button
          type="button"
          className={styles.motionControl}
          aria-pressed={reduceMotion}
          onClick={() => setReduceMotion((previous) => !previous)}
        >
          {ar ? "تقليل الحركة" : "Reduce motion"}
        </button>
        <small>
          © {/* @__PURE__ */ new Date().getFullYear()} Double H Consulting
        </small>
      </footer>
      <StickyCall
        lang={lang}
        onBook={book}
        visible={!contactPage && showSticky}
        disabled={open}
        activeSection={activeSection}
      />
      <ConsultationModal
        open={open}
        onClose={() => setOpen(false)}
        lang={lang}
        request={request}
      />
    </div>
  );
}
