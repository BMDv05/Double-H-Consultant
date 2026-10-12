import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLang } from "../LangContext.jsx";
import SiteHeader from "./foundation/SiteHeader.jsx";
import StickyCall from "./foundation/StickyCall.jsx";
import ConsultationModal from "./booking/ConsultationModal.jsx";
import ConsultingHome from "./home/ConsultingHome.jsx";
import ConsultingContact from "./ConsultingContact.jsx";
import "./foundation/tokens.css";
import styles from "./ConsultingSite.module.css";
export default function ConsultingSite() {
  const { lang, setLang } = useLang();
  const { hash, pathname } = useLocation();
  const contactPage = pathname.replace(/\/+$/, "") === "/contact";
  const [request, setRequest] = useState({ source: "hero" });
  const [open, setOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const ar = lang === "ar";
  function book(nextRequest) {
    setRequest(nextRequest);
    setOpen(true);
  }
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
        window.scrollTo({ top: 0, behavior: "instant" });
        return;
      }
      const quiet =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        target?.closest('[data-reduced-motion="true"]');
      target?.scrollIntoView({ behavior: quiet ? "auto" : "smooth" });
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
      <SiteHeader lang={lang} onLanguageChange={setLang} onBook={book} />
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
