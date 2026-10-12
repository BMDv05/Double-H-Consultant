import { useEffect, useId, useRef, useState } from "react";
import { DIVISION_GROUPS, UI_LABELS } from "./fixtures.js";
import { resolveContent } from "./content.js";
import styles from "./ConsultingHome.module.css";
import PerspectiveScene from "../scene/PerspectiveScene.jsx";

const images = {
  hero: "/consulting-images/perspective.webp",
  strategy: "/consulting-images/conversation.webp",
  specialist: "/consulting-images/discretion.webp",
};

const divisionImages = {
  bim: "/div-bim.jpg",
  arch: "/div-arch.jpg",
  civil: "/div-civil.jpg",
  elec: "/div-elec.jpg",
  mgmt: "/div-mgmt.jpg",
  bd: "/div-bd.jpg",
  startup: "/div-startup.jpg",
  medical: "/div-medical.jpg",
  law: "/div-law.jpg",
};

const divisionSpecs = {
  bim: {
    badge: "LOD 400 BIM / VDC",
    badgeAr: "نمذجة LOD 400 وتوأمة رقمية",
    tags: ["Clash Matrix", "4D Simulation", "Digital Twin"],
    tagsAr: ["كشف التعارضات", "محاكاة 4D", "توأمة رقمية"],
  },
  arch: {
    badge: "AIA Licensure Standards",
    badgeAr: "معايير AIA المعمارية",
    tags: ["Masterplanning", "Permits", "Supervision"],
    tagsAr: ["مخططات عامة", "تراخيص معمارية", "إشراف تنفيذي"],
  },
  civil: {
    badge: "US PE Licensed Engineering",
    badgeAr: "هندسة إنشائية بترخيص PE",
    tags: ["FEA Analysis", "Seismic & Wind", "Geotech"],
    tagsAr: ["تحليل إنشائي FEA", "مقاومة الرياح والزلازل", "أساسات جيوتقنية"],
  },
  elec: {
    badge: "Power & Smart Infrastructure",
    badgeAr: "أنظمة القوى والتحكم الذكي",
    tags: ["Grid Systems", "Smart BMS", "NFPA Safety"],
    tagsAr: ["شبكات التوزيع", "أتمتة المباني BMS", "سلامة NFPA"],
  },
  mgmt: {
    badge: "PMP Certified Governance",
    badgeAr: "إدارة مشاريع معتمدة PMP",
    tags: ["Critical Path CPM", "Cost Control", "Turnkey Delivery"],
    tagsAr: ["مسار حرج CPM", "حوكمة التكاليف", "تسليم متكامل"],
  },
  bd: {
    badge: "Feasibility & Capital Strategy",
    badgeAr: "دراسات الجدوى والاستثمار",
    tags: ["Financial Models", "Asset Yield", "Joint Ventures"],
    tagsAr: ["نمذجة مالية", "تعظيم العائد", "تحالفات استراتيجية"],
  },
  startup: {
    badge: "Venture & Scale Advisory",
    badgeAr: "استشارات المشاريع الريادية",
    tags: ["Due Diligence", "MVP Scale", "Tech Roadmap"],
    tagsAr: ["فحص فني", "توسيع النماذج MVP", "خارطة تقنية"],
  },
  medical: {
    badge: "Healthcare & Biomedical Planning",
    badgeAr: "تخطيط المنشآت الطبية والصحية",
    tags: ["Clinical Flow", "Biomedical Codes", "JCI Accreditations"],
    tagsAr: ["مسارات سريرية", "معايير طبية", "اعتمادات صحية"],
  },
  law: {
    badge: "FIDIC & Contract Governance",
    badgeAr: "حوكمة العقود الهندسية وفيديك",
    tags: ["FIDIC Terms", "Claims Avoidance", "Arbitration"],
    tagsAr: ["عقود FIDIC", "تجنب النزاعات", "تحكيم هندسي"],
  },
};

const ACCREDITATIONS = [
  { code: "US PE", name: "Professional Engineer (PE)", desc: "State Boards of Professional Engineering — USA", badge: "State Licensed" },
  { code: "ISO 9001", name: "ISO 9001:2015 Quality Protocols", desc: "Audited QA Architecture & Engineering", badge: "Audited QA" },
  { code: "LEED AP", name: "LEED Accredited Professional", desc: "U.S. Green Building Council (USGBC)", badge: "Sustainable" },
  { code: "OSHA", name: "Safety & Site Compliance", desc: "Occupational Safety and Health Administration — USA", badge: "Active Standards" },
  { code: "PMP", name: "Project Management Professional", desc: "Project Management Institute (PMI) — USA", badge: "PMP Certified" },
  { code: "Autodesk", name: "Certified Professional BIM", desc: "High-LOD 3D Modeling & Coordination", badge: "LOD 400 VDC" },
];

const PROVEN_METRICS = [
  { val: "18+", lblEn: "Years of Excellence", lblAr: "عاماً من التميز الهندسي" },
  { val: "450+", lblEn: "Delivered Developments", lblAr: "مشروعاً عمرانياً منجزاً" },
  { val: "85%+", lblEn: "Institutional Client Retention", lblAr: "نسبة استمرارية العملاء" },
  { val: "0", lblEn: "Schedule Drift (CPM Rigor)", lblAr: "انحراف زمني (حوكمة CPM)" },
];

function EditorialImage({ src, className, eager = false, sizes = "100vw" }) {
  return (
    <img
      className={className}
      src={src}
      srcSet={`${src.replace(".webp", "-small.webp")} 800w, ${src} 1672w`}
      sizes={sizes}
      width="1672"
      height="941"
      alt=""
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      onError={(event) => {
        event.currentTarget.hidden = true;
      }}
    />
  );
}

function scrollToSection(event, section) {
  event.preventDefault();
  const target = document.getElementById(section);
  const quiet =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    target?.closest('[data-reduced-motion="true"]');
  target?.scrollIntoView({ behavior: quiet ? "auto" : "smooth" });
}

function Arrow() {
  return (
    <span className={styles.arrow} aria-hidden="true">
      ↗
    </span>
  );
}

function CallAction({ children, onClick, light = false, primary = false }) {
  return (
    <button
      type="button"
      data-primary-call={primary || undefined}
      className={`${styles.call} ${light ? styles.lightCall : ""}`}
      onClick={onClick}
    >
      {children}
      <Arrow />
    </button>
  );
}

function useEditorialMotion(root) {
  useEffect(() => {
    const element = root.current;
    if (!element) return void 0;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 760px)");
    let frame = 0;
    const animations = new Set();
    const quietMotion = () =>
      preference.matches || element.closest('[data-reduced-motion="true"]');
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal.unobserve(entry.target);
          if (quietMotion() || typeof entry.target.animate !== "function")
            return;
          const image = entry.target.hasAttribute("data-image-reveal");
          const animation = entry.target.animate(
            image
              ? [
                  {
                    opacity: 0.6,
                    clipPath: "inset(12% 4% 12% 4%)",
                    transform: "translateY(28px)",
                  },
                  {
                    opacity: 1,
                    clipPath: "inset(0% 0% 0% 0%)",
                    transform: "translateY(0)",
                  },
                ]
              : [
                  { opacity: 0.3, transform: "translateY(42px)" },
                  { opacity: 1, transform: "translateY(0)" },
                ],
            {
              duration: image ? 1050 : 700,
              easing: "cubic-bezier(.2,.75,.2,1)",
            },
          );
          animations.add(animation);
          animation.onfinish = animation.oncancel = () =>
            animations.delete(animation);
        });
      },
      { threshold: 0.12 },
    );
    element
      .querySelectorAll(
        "section:not(#hero) h2, section:not(#hero) h3, [data-image-reveal], [data-reveal]",
      )
      .forEach((node) => reveal.observe(node));
    const clamp = (value) => Math.max(0, Math.min(1, value));
    function update() {
      frame = 0;
      const hero = element.querySelector("#hero");
      if (hero)
        hero.dataset.keyboardLayer = String(
          window.scrollY < hero.offsetHeight * 0.72,
        );
      const quiet =
        preference.matches || element.closest('[data-reduced-motion="true"]');
      element.querySelectorAll("[data-drift]").forEach((panel) => {
        const rect = panel.getBoundingClientRect();
        const progress = quiet
          ? 0
          : clamp(
              (window.innerHeight - rect.top) /
                (window.innerHeight + rect.height),
            );
        panel.style.setProperty(
          "--drift",
          `${(progress - 0.5) * (quiet ? 0 : mobile.matches ? 28 : 126)}px`,
        );
      });
      const cards = [...element.querySelectorAll("[data-chapter]")];
      cards.forEach((card, index) => {
        const next = cards[index + 1];
        const progress =
          quiet || mobile.matches || !next
            ? 0
            : clamp(
                (window.innerHeight - next.getBoundingClientRect().top) /
                  window.innerHeight,
              );
        card.style.setProperty("--card-scale", `${1 - progress * 0.085}`);
      });
    }
    function schedule() {
      if (quietMotion()) animations.forEach((animation) => animation.cancel());
      if (!frame) frame = requestAnimationFrame(update);
    }
    const observer = new MutationObserver(schedule);
    const motionTarget = element.closest(".dh-public") ?? element.parentElement;
    if (motionTarget) {
      observer.observe(motionTarget, {
        attributes: true,
        attributeFilter: ["data-reduced-motion"],
      });
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", schedule);
    mobile.addEventListener("change", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      reveal.disconnect();
      animations.forEach((animation) => animation.cancel());
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", schedule);
      mobile.removeEventListener("change", schedule);
    };
  }, [root]);
}

export default function ConsultingHome({
  lang = "en",
  onBook,
  content,
  heroVisual,
  credentials,
  aboutVisual,
}) {
  const locale = lang === "ar" ? "ar" : "en";
  const ar = locale === "ar";
  const data = resolveContent(content, locale);
  const labels = UI_LABELS[locale];
  const id = useId();
  const root = useRef(null);
  const [selected, setSelected] = useState({
    engineering: "bim",
    strategy: "mgmt",
    specialist: "medical",
  });
  const [step, setStep] = useState(0);
  const cursorRef = useRef(null);

  useEditorialMotion(root);

  function book(source, division) {
    onBook?.(division ? { source, division } : { source });
  }

  function handleCardPointerMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    e.currentTarget.style.setProperty("--tilt-x", `${y}deg`);
    e.currentTarget.style.setProperty("--tilt-y", `${x}deg`);
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -130%)`;
      cursorRef.current.style.opacity = "1";
    }
  }

  function handleCardPointerLeave(e) {
    e.currentTarget.style.setProperty("--tilt-x", "0deg");
    e.currentTarget.style.setProperty("--tilt-y", "0deg");
    if (cursorRef.current) {
      cursorRef.current.style.opacity = "0";
    }
  }

  const chapterCopy = ar
    ? [
        ["من الفكرة إلى التنفيذ.", "قرارات متناسقة. ومشروع أوضح."],
        ["مساحة للنمو.", "منظور جديد لما يمكن أن يصبح عليه عملك."],
        ["التفاصيل تستحق العناية.", "ابدأ بسؤالك. وابحث عن الدعم المناسب."],
      ]
    : [
        [
          "Bring the vision into focus.",
          "Connected thinking for the spaces and systems you build.",
        ],
        [
          "Make room for what’s next.",
          "A fresh perspective on where your business could go.",
        ],
        [
          "Give the details the care they deserve.",
          "Start with your question. Explore the right support.",
        ],
      ];

  return (
    <div
      ref={root}
      className={styles.home}
      dir={ar ? "rtl" : "ltr"}
      lang={locale}
    >
      {/* Magnetic Cursor Follower Badge (from the video experience) */}
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
        <span>{ar ? "معاينة المشروع" : "VIEW CASE"}</span>
        <span className={styles.cursorArrow}>↗</span>
      </div>

      {/* 1. HERO SECTION */}
      <section
        id="hero"
        className={styles.hero}
        data-drift
        aria-labelledby={`${id}-hero`}
      >
        <div className={styles.heroMedia} aria-hidden="true">
          {heroVisual ?? <EditorialImage src={images.hero} eager />}
        </div>
        <div className={styles.heroShade} />
        <div className={styles.heroTop}>
          <span className={styles.heroBrandText}>{ar ? "دبل إتش للاستشارات" : "Double H Consulting"}</span>
          <span className={styles.heroTagline}>
            {ar
              ? "معايير أمريكية • طموح عالمي"
              : "American Standards • Global Ambition"}
          </span>
        </div>

        {/* Floating pill badges from the video experience */}
        <div className={styles.heroBadgesRow}>
          <span className={styles.heroBadgePill}>
            {ar ? "18+ عاماً من الخبرة" : "18+ YEARS OF EXCELLENCE"}
          </span>
          <span className={styles.heroBadgePill}>
            {ar ? "450+ مشروعاً منجزاً" : "450+ DELIVERED PROJECTS"}
          </span>
          <span className={styles.heroBadgePill}>
            {ar ? "اعتمادات PE و ISO 9001" : "US PE & ISO 9001 CERTIFIED"}
          </span>
          <span className={styles.heroBadgePill}>
            {ar ? "9 تخصصات هندسية وإدارية" : "9 PRACTICE DISCIPLINES"}
          </span>
        </div>

        <div className={styles.heroContent}>
          <h1 id={`${id}-hero`} className={styles.heroKineticTitle}>
            <span className={styles.heroKineticLead}>
              {ar
                ? "هندسة وعمارة استثنائية لمشاريع طموحة"
                : "ARCHITECTURE & ENGINEERING FOR VISIONARY SCALE"}
            </span>
            <span className={styles.heroKineticMain}>{data.hero.title}</span>
          </h1>

          <div className={styles.heroBottom}>
            <div>
              <p className={styles.heroDescription}>{data.hero.body}</p>
              <div className={styles.heroActionsRow}>
                <CallAction light primary onClick={() => book("hero")}>
                  {data.hero.cta}
                </CallAction>
              </div>
              <small className={styles.heroGuarantee}>
                {ar
                  ? "مراجعة مباشرة من مهندسي PE المعتمدين • اتفاقية سرية تامة • الرد خلال 24 ساعة"
                  : "Direct partner review • Mutual NDA • Guaranteed brief in 24h"}
              </small>
            </div>
            <a
              className={styles.scrollLink}
              href="#divisions"
              onClick={(event) => scrollToSection(event, "divisions")}
            >
              <span>{labels.discovery}</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        {/* Live 3D Procedural Three.js WebGL Sculpture */}
        {heroVisual == null && (
          <div className={styles.heroScene}>
            <PerspectiveScene lang={locale} />
          </div>
        )}
        <span className={styles.imageNote}>
          {ar ? "صورة تصورية" : "Illustrative imagery"}
        </span>
      </section>

      {/* 2. ACCREDITATIONS & RESULTS SPEAK (Video Frame 5) */}
      <section
        id="certificates"
        className={styles.proof}
        aria-label={labels.quality}
      >
        {credentials ?? (
          <div className={styles.proofContainer}>
            <div className={styles.proofHeaderRow}>
              <span className={styles.eyebrow}>
                {ar ? "نهجنا" : "Our approach"}
              </span>
              <p className={styles.proofMainLine}>
                {ar
                  ? "سؤالك أولاً. ثم الصورة الكاملة."
                  : "Your question first. The bigger picture next."}
              </p>
              <span className={styles.proofEnd}>
                {ar
                  ? "الهندسة · الأعمال · الاستشارات التخصصية"
                  : "Engineering · Business · Specialist advice"}
              </span>
            </div>

            <div className={styles.resultsSpeakBlock}>
              <div className={styles.resultsHeadlineWrapper}>
                <span className={styles.resultsKicker}>
                  {ar ? "[ اعتمادات موثقة ]" : "[ VERIFIED STANDARDS ]"}
                </span>
                <h2 className={styles.resultsHeadline}>
                  {ar ? "النتائج تتحدث." : "RESULTS SPEAK."}
                </h2>
              </div>

              {/* Verified Accreditations Strip */}
              <div className={styles.accreditationGrid}>
                {ACCREDITATIONS.map((acc) => (
                  <div key={acc.code} className={styles.accreditationCard}>
                    <div className={styles.accBadgeRow}>
                      <span className={styles.accCode}>{acc.code}</span>
                      <span className={styles.accStatusTag}>{acc.badge}</span>
                    </div>
                    <strong className={styles.accName}>{acc.name}</strong>
                    <span className={styles.accDesc}>{acc.desc}</span>
                  </div>
                ))}
              </div>

              {/* Proven Metric Indicators */}
              <div className={styles.provenMetricsRow}>
                {PROVEN_METRICS.map((m, idx) => (
                  <div key={idx} className={styles.metricItem}>
                    <span className={styles.metricVal}>{m.val}</span>
                    <span className={styles.metricLbl}>
                      {ar ? m.lblAr : m.lblEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. ABOUT & STRATEGIC METHODOLOGY (Video Frames 8, 9, 10) */}
      <section
        id="about"
        className={styles.about}
        aria-labelledby={`${id}-about`}
      >
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>{labels.about}</span>
          <span className={styles.number}>01 /</span>
        </div>
        <div className={styles.aboutGrid}>
          <h2 id={`${id}-about`}>{data.about.title}</h2>
          <div className={styles.aboutCopy}>
            <p>{data.about.body}</p>
            <a
              className={styles.textLink}
              href="#journey"
              onClick={(event) => scrollToSection(event, "journey")}
            >
              {ar ? "كيف نبدأ؟" : "Where do we begin?"}
              <Arrow />
            </a>
          </div>
        </div>

        {/* Video Frame 8/10 Statement Banner */}
        <div className={styles.editorialStatement}>
          <p>
            {ar
              ? "رؤيتنا واضحة: الجمع بين الانضباط الهندسي المعتمد والإبداع المعماري الرفيع لتتحقق للمشاريع أعلى مستويات الأداء والجمال."
              : "Our focus is clear: pairing American engineering rigor with architectural vision so projects perform as brilliantly as they look."}
          </p>
        </div>

        <div className={styles.aboutVisual} data-drift data-image-reveal>
          {aboutVisual ?? (
            <>
              <EditorialImage src={images.strategy} />
              <span className={styles.visualCaption}>
                {ar
                  ? "كل خطوة تبدأ بمحادثة."
                  : "Every next step begins with a conversation."}
              </span>
            </>
          )}
        </div>

        <ol className={styles.outcomes}>
          {data.about.outcomes.map((item, index) => (
            <li key={index}>
              <span className={styles.number}>0{index + 1}</span>
              <h3>{item.title}</h3>
            </li>
          ))}
        </ol>

        {/* Practice Capabilities Pill Matrix (Video Frame 10) */}
        <div className={styles.capabilitiesMatrix}>
          <span className={styles.capabilitiesTitle}>
            {ar ? "[ مجالات التميز الهندسي والاستشاري ]" : "[ WHAT WE EXCEL AT ]"}
          </span>
          <div className={styles.capabilitiesPills}>
            <span className={styles.capPill}>LOD 400 BIM</span>
            <span className={styles.capPill}>Structural FEA</span>
            <span className={styles.capPill}>AIA Masterplanning</span>
            <span className={styles.capPill}>FIDIC Contracts</span>
            <span className={styles.capPill}>Critical Path CPM</span>
            <span className={styles.capPill}>Healthcare Compliance</span>
            <span className={styles.capPill}>Power Grid Systems</span>
            <span className={styles.capPill}>Venture Due Diligence</span>
          </div>
        </div>
      </section>

      {/* 4. 3D INTERACTIVE PROJECT SHOWCASE & DIVISIONS (Video Frames 3, 4, 6) */}
      <section
        id="divisions"
        className={styles.divisions}
        aria-labelledby={`${id}-divisions`}
      >
        <div className={styles.serviceHeading}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>{labels.services}</span>
            <span className={styles.number}>02 /</span>
          </div>
          <h2 id={`${id}-divisions`}>{data.divisions.title}</h2>
          <p>
            {ar
              ? "تسعة تخصصات استشارية. اختر مسار مشروعك وابدأ الآن."
              : "Nine specialized practice divisions. Explore our capabilities and delivered models."}
          </p>
        </div>

        <div className={styles.chapters}>
          {Object.entries(DIVISION_GROUPS).map(([group, info], index) => {
            const items = data.divisions.items.filter(
              (item) => item.group === group,
            );
            const current =
              items.find((item) => item.id === selected[group]) ??
              items[0] ?? { id: "", title: "", body: "" };
            const currentImg =
              (current.id && divisionImages[current.id]) ||
              images[group === "engineering" ? "hero" : group];
            const specs = (current.id && divisionSpecs[current.id]) || {};

            return (
              <article
                key={group}
                className={`${styles.chapter} ${styles[group]}`}
                data-chapter
                data-drift
                aria-labelledby={`${id}-${group}`}
                onPointerMove={handleCardPointerMove}
                onPointerLeave={handleCardPointerLeave}
              >
                {/* 3D Perspective card background image */}
                <img
                  className={styles.chapterImage}
                  src={currentImg}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = images[group === "engineering" ? "hero" : group];
                  }}
                />
                <div className={styles.chapterShade} />
                <div className={styles.chapterTop}>
                  <span className={styles.chapterCategoryBadge}>{info.title[locale]}</span>
                  <span className={styles.number}>0{index + 1} / 03</span>
                </div>

                <div className={styles.chapterBody}>
                  <h3 id={`${id}-${group}`}>{chapterCopy[index][0]}</h3>
                  <p className={styles.chapterIntro}>{chapterCopy[index][1]}</p>

                  {/* 3D Perspective Showcase Spec Card */}
                  <div className={styles.perspectiveSpecCard}>
                    <div className={styles.specHeaderRow}>
                      <span className={styles.specBadgeTag}>
                        {ar ? (specs.badgeAr || specs.badge) : specs.badge}
                      </span>
                      <span className={styles.specModelRef}>
                        {current.id.toUpperCase()} // ACTIVE SPEC
                      </span>
                    </div>
                    <div className={styles.specTagsRow}>
                      {(ar ? (specs.tagsAr || specs.tags) : specs.tags)?.map((t, tidx) => (
                        <span key={tidx} className={styles.specTagPill}>{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* Canonical 9 Division Desktop Selectors */}
                  <div
                    className={styles.serviceChoices}
                    aria-label={info.title[locale]}
                  >
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        data-division={item.id}
                        aria-pressed={current.id === item.id}
                        onClick={() =>
                          setSelected((previous) => ({
                            ...previous,
                            [group]: item.id,
                          }))
                        }
                      >
                        {item.title}
                        <span aria-hidden="true">
                          {current.id === item.id ? "−" : "+"}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Canonical 9 Division Mobile Selectors */}
                  <label className={styles.mobileServices}>
                    {info.title[locale]}
                    <select
                      value={current.id}
                      onChange={(event) =>
                        setSelected((previous) => ({
                          ...previous,
                          [group]: event.target.value,
                        }))
                      }
                    >
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className={styles.serviceDetail} aria-live="polite">
                    <p>{current.body}</p>
                  </div>

                  <CallAction
                    light
                    onClick={() => book("division", current.id)}
                  >
                    {data.hero.cta}
                  </CallAction>
                </div>

                <span className={styles.imageNote}>
                  {ar ? "صورة تصورية" : "Illustrative imagery"}
                </span>
              </article>
            );
          })}
        </div>
      </section>

      {/* 5. 15-MINUTE DIAGNOSTIC CONSULTATION JOURNEY */}
      <section
        id="journey"
        className={styles.journey}
        aria-labelledby={`${id}-journey`}
      >
        <div className={styles.journeyIntro}>
          <span className={styles.eyebrow}>{labels.journey}</span>
          <h2 id={`${id}-journey`}>{data.journey.title}</h2>
          <CallAction onClick={() => book("journey")}>
            {data.hero.cta}
          </CallAction>
          <small>{data.hero.helper}</small>
        </div>
        <div className={styles.journeyExperience}>
          <div className={styles.journeyPhoto} data-drift>
            <EditorialImage
              src={
                step === 0
                  ? images.specialist
                  : step === 1
                    ? images.strategy
                    : images.hero
              }
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <span className={styles.minute}>
              <b>15</b>
              <span>{ar ? "دقيقة لتشخيص مشروعك" : "minutes to diagnose your project"}</span>
            </span>
          </div>
          <div className={styles.steps}>
            {data.journey.steps.map((item, index) => (
              <button
                className={styles.step}
                key={index}
                type="button"
                aria-pressed={step === index}
                onClick={() => setStep(index)}
              >
                <span className={styles.number}>0{index + 1}</span>
                <span>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </span>
                <span className={styles.stepMark} aria-hidden="true">
                  {step === index ? "−" : "+"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Fiduciary Commitment Strip */}
        <div className={styles.fiduciaryCommitment}>
          <div className={styles.fidItem}>
            <strong>{ar ? "سرية كاملة (NDA)" : "Mutual NDA Protected"}</strong>
            <span>{ar ? "حماية مطلقة لبيانات ومخططات المشروع" : "Strict confidential disclosure"}</span>
          </div>
          <div className={styles.fidItem}>
            <strong>{ar ? "شركاء هندسيون معتمدون" : "Credentialed Principals"}</strong>
            <span>{ar ? "استشارة مباشرة مع كبار مهندسي PE و AIA" : "Direct with veteran licensed PEs"}</span>
          </div>
          <div className={styles.fidItem}>
            <strong>{ar ? "بدون أي التزام مالي" : "Zero Obligation"}</strong>
            <span>{ar ? "جلسة تشخيصية موضوعية ومستقلة تماماً" : "Pure diagnostic assessment"}</span>
          </div>
          <div className={styles.fidItem}>
            <strong>{ar ? "التزام زمني 24 ساعة" : "24-Hour Calendar SLA"}</strong>
            <span>{ar ? "تأكيد الموعد وملخص تنفيذي خلال يوم عمل" : "Guaranteed calendar slot within 1 day"}</span>
          </div>
        </div>
      </section>

      {/* 6. VALUES SECTION */}
      <section
        id="values"
        className={styles.values}
        aria-labelledby={`${id}-values`}
      >
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>{labels.values}</span>
          <span className={styles.number}>03 /</span>
        </div>
        <div className={styles.valuesGrid}>
          <h2 id={`${id}-values`}>{data.values.title}</h2>
          <ol>
            {data.values.items.map((item, index) => (
              <li key={index}>
                <span className={styles.number}>0{index + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
                <Arrow />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7. FINAL INVITATION & WALL (Video Frame 11) */}
      <section
        id="final"
        className={styles.final}
        data-drift
        aria-labelledby={`${id}-final`}
      >
        <span id="final-call" />
        <EditorialImage className={styles.finalImage} src={images.hero} />
        <div className={styles.finalShade} />
        <div className={styles.finalContent}>
          <span className={styles.eyebrow}>{labels.final}</span>
          <div className={styles.finalKineticBlock}>
            <span className={styles.finalKineticKicker}>
              {ar ? "طموح لا محدود" : "ENGINEERING HORIZONS"}
            </span>
            <h2 id={`${id}-final`}>{data.final.title}</h2>
          </div>
          <p>{data.final.body}</p>
          <CallAction light onClick={() => book("final")}>
            {data.hero.cta}
          </CallAction>
          <small>{data.hero.helper}</small>
        </div>
      </section>

      {/* 8. CONTACT INITIATION */}
      <section
        id="contact"
        className={styles.contact}
        aria-labelledby={`${id}-contact`}
      >
        <div>
          <span className={styles.eyebrow}>{labels.contact}</span>
          <h2 id={`${id}-contact`}>
            {ar ? "لديك سؤال آخر؟" : "Something else on your mind?"}
          </h2>
        </div>
        <button
          type="button"
          className={styles.textLink}
          onClick={() => book("contact")}
        >
          {ar ? "ابدأ محادثة" : "Start a conversation"}
          <Arrow />
        </button>
      </section>
    </div>
  );
}
