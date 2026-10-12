import { useEffect, useId, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DIVISION_GROUPS, UI_LABELS } from "./fixtures.js";
import { resolveContent } from "./content.js";
import styles from "./ConsultingHome.module.css";
import PerspectiveScene from "../scene/PerspectiveScene.jsx";
import CadBlueprintDrafting from "./CadBlueprintDrafting.jsx";
import ArchitecturalHud from "./ArchitecturalHud.jsx";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
  { val: "18+", target: 18, suffix: "+", lblEn: "Years of Excellence", lblAr: "عاماً من التميز الهندسي" },
  { val: "450+", target: 450, suffix: "+", lblEn: "Delivered Developments", lblAr: "مشروعاً عمرانياً منجزاً" },
  { val: "85%+", target: 85, suffix: "%+", lblEn: "Institutional Client Retention", lblAr: "نسبة استمرارية العملاء" },
  { val: "0", target: 0, suffix: "", lblEn: "Schedule Drift (CPM Rigor)", lblAr: "انحراف زمني (حوكمة CPM)" },
];

const DOUBLE_H_SUB_ENTITIES = [
  { key: "studio", en: "STUDIO", ar: "استوديو" },
  { key: "technology", en: "TECHNOLOGY", ar: "التكنولوجيا" },
  { key: "real_estate", en: "REAL ESTATE", ar: "العقارات" },
  { key: "academy", en: "ACADEMY", ar: "الأكاديمية" },
  { key: "bim", en: "BIM SERVICES", ar: "خدمات BIM" },
  { key: "chance", en: "CHANCE", ar: "فرصة" },
];

const ARCHITECTURAL_STUDY_TOURS_AND_AWARDS = [
  {
    kicker: "Jordan Architectural Tour",
    kickerAr: "جولات العمارة الأردنية",
    title: "Amman & Petra Architectural Vernacular Immersion",
    titleAr: "استكشاف التراث المعماري: عمان والبترا",
    desc: "Curated field study examining vernacular stone masonry, climatic courtyard physics, and Nabataean water conservation engineering.",
    descAr: "دراسة ميدانية متخصصة في العمارة الحجرية وفيزياء الأفنية وتطبيقات الحصاد المائي النبطي التراثية.",
    badge: "Field Exploration",
    badgeAr: "استكشاف ميداني",
  },
  {
    kicker: "Design Jury & Competitions",
    kickerAr: "مسابقات التصميم ولجان التحكيم",
    title: "Regional Architectural Design Panels & Competitive Leaderboard",
    titleAr: "تحكيم المسابقات المعمارية ولوحة المتصدرين التنافسية",
    desc: "Regular competitions overseen by advanced judging panels, professional thesis defenses, and competitive leaderboards across the Levant and GCC.",
    descAr: "مسابقات دورية بإشراف لجان تحكيم متقدمة، مناقشات مهنية لمشاريع التخرج، ولوحة شرف تنافسية في المشرق العربي والخليج.",
    badge: "Jury Panels",
    badgeAr: "لجان تحكيم",
  },
  {
    kicker: "Industry Link & Career Pipeline",
    kickerAr: "شراكات المكاتب والتوظيف المباشر",
    title: "Direct Engineering Firm Partnerships & Career Placement",
    titleAr: "شراكات مباشرة مع المكاتب الهندسية وفرص توظيف حقيقية",
    desc: "Direct employment and apprenticeship pipelines with premier local and international consultancies for outstanding talent in the program.",
    descAr: "مسارات تدريب وتوظيف حقيقية وشراكات مباشرة مع مكاتب هندسية محلية ودولية للمتميزين في البرامج المعتمدة.",
    badge: "Career Pipeline",
    badgeAr: "مسار مهني",
  },
  {
    kicker: "Excellence Awards & Prizes",
    kickerAr: "جوائز التفوق والأجهزة المتقدمة",
    title: "Technological Hardware Grants & Real In-Kind Awards",
    titleAr: "منح أجهزة حاسوبية متقدمة وجوائز مادية وعينية",
    desc: "Desktop workstations, high-spec laptops, cash prizes, and corporate sponsorships awarded to top-ranking architectural and engineering innovators.",
    descAr: "أجهزة حاسوب متطورة، محطات عمل هندسية، مكافآت مالية وعينية، ورعايات استراتيجية من الشركات الكبرى للفائزين.",
    badge: "Hardware & Awards",
    badgeAr: "جوائز وأجهزة",
  },
];

function MetricCounter({ val, target, suffix = "", lbl }) {
  const countRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !countRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const obj = { value: 0 };
    const el = countRef.current;

    const tween = gsap.to(obj, {
      value: target,
      duration: 1.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true,
      },
      onUpdate: () => {
        if (el) {
          el.textContent = `${Math.round(obj.value)}${suffix}`;
        }
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [target, suffix]);

  return (
    <div className={styles.metricItem}>
      <span
        ref={countRef}
        className={styles.metricVal}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {val}
      </span>
      <span className={styles.metricLbl}>{lbl}</span>
    </div>
  );
}

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
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState({
    engineering: "bim",
    strategy: "mgmt",
    specialist: "medical",
  });
  const [step, setStep] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEditorialMotion(root);

  useEffect(() => {
    if (typeof window === "undefined" || !root.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 760px)").matches) return;

    const ctx = gsap.context(() => {
      // 1. Pinned 3D Chapter Stacking Deck with Perspective Depth Scaling
      const chapters = root.current?.querySelectorAll("[data-chapter]");
      if (chapters && chapters.length >= 2) {
        chapters.forEach((chapter, i) => {
          if (i < chapters.length - 1) {
            ScrollTrigger.create({
              trigger: chapter,
              start: "top top+=104",
              endTrigger: chapters[i + 1],
              end: "top top+=104",
              scrub: true,
              onUpdate: (self) => {
                const scale = 1 - self.progress * 0.075;
                const rotX = self.progress * -3;
                const opacity = 1 - self.progress * 0.2;
                chapter.style.setProperty("--card-scale", `${scale}`);
                chapter.style.setProperty("--tilt-x", `${rotX}deg`);
                chapter.style.opacity = `${opacity}`;
              },
            });
          }
        });
      }

      // 2. Dual-Tone Canvas Inversion: Dark Petroleum (#134c4b) to Light Alabaster (#e6ecec)
      const journey = root.current?.querySelector("#journey");
      if (journey) {
        gsap.fromTo(
          journey,
          {
            backgroundColor: "#134c4b",
            color: "#e6ecec",
          },
          {
            backgroundColor: "#e6ecec",
            color: "#161919",
            ease: "none",
            scrollTrigger: {
              trigger: journey,
              start: "top 90%",
              end: "top 35%",
              scrub: true,
            },
          }
        );
      }

      // 3. Dual-Tone Canvas Inversion: Light Alabaster (#e6ecec) back to Deep Olive Canvas (#12393a)
      const values = root.current?.querySelector("#values");
      if (values) {
        gsap.fromTo(
          values,
          {
            backgroundColor: "#e6ecec",
            color: "#161919",
          },
          {
            backgroundColor: "#12393a",
            color: "#e6ecec",
            ease: "none",
            scrollTrigger: {
              trigger: values,
              start: "top 90%",
              end: "top 35%",
              scrub: true,
            },
          }
        );
      }

      // 4. Kinetic Line Reveal with Line-Masked Container Clipping
      const kineticLines = root.current?.querySelectorAll("[data-kinetic-line]");
      kineticLines?.forEach((line) => {
        gsap.fromTo(
          line,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: line,
              start: "top 88%",
              once: true,
            },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, [mounted]);

  function book(source, division) {
    onBook?.(division ? { source, division } : { source });
  }

  function handleCardPointerMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    e.currentTarget.style.setProperty("--tilt-x", `${y}deg`);
    e.currentTarget.style.setProperty("--tilt-y", `${x}deg`);
  }

  function handleCardPointerLeave(e) {
    e.currentTarget.style.setProperty("--tilt-x", "0deg");
    e.currentTarget.style.setProperty("--tilt-y", "0deg");
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
      {/* Architectural HUD & Magnetic Cursor Follower */}
      <ArchitecturalHud mounted={mounted} ar={ar} />

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
            <span className={styles.heroKineticLead} data-kinetic-line>
              {ar
                ? "هندسة وعمارة استثنائية لمشاريع طموحة"
                : "ARCHITECTURE & ENGINEERING FOR VISIONARY SCALE"}
            </span>
            <span className={styles.heroKineticMain} data-kinetic-line>{data.hero.title}</span>
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

        {/* CAD Blueprint drafting technical dimension lines */}
        <CadBlueprintDrafting mounted={mounted} ar={ar} />

        {/* Brand Sub-Entities Strip (Brand Manual Page 08) with signature parallel lines motif */}
        <div className={styles.subEntitiesStrip} aria-label={ar ? "الكيانات التابعة" : "Double H Sub-Entities"}>
          {DOUBLE_H_SUB_ENTITIES.map((sub) => (
            <span key={sub.key} className={styles.parallelMotif}>
              {ar ? sub.ar : sub.en}
            </span>
          ))}
        </div>

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
                  <div
                    key={acc.code}
                    className={styles.accreditationCard}
                    data-hud-inspect
                    data-hud-label={ar ? "معاينة الاعتماد" : "INSPECT STANDARD"}
                  >
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
                  <MetricCounter
                    key={idx}
                    val={m.val}
                    target={m.target}
                    suffix={m.suffix}
                    lbl={ar ? m.lblAr : m.lblEn}
                  />
                ))}
              </div>

              {/* Jordan Architectural Study Tours & Competitions (Brand Manual Pages 06-07) */}
              <div className={styles.studyToursSection}>
                <div className={styles.studyToursHeader}>
                  <span className={styles.parallelMotif}>
                    {ar ? "جولات العمارة والجوائز الإقليمية" : "ARCHITECTURAL STUDY TOURS & JURY AWARDS"}
                  </span>
                  <h3
                    id={`${id}-tours-title`}
                    className={styles.resultsHeadline}
                    style={{ fontSize: "clamp(24px, 3vw, 36px)", marginTop: "8px" }}
                  >
                    {ar ? "خبرات معمارية متجذرة وتكريم دولي" : "Rooted Vernacular Context & Regional Recognition"}
                  </h3>
                </div>
                <div className={styles.studyToursGrid}>
                  {ARCHITECTURAL_STUDY_TOURS_AND_AWARDS.map((tour, tIdx) => (
                    <div
                      key={tIdx}
                      className={styles.studyTourCard}
                      data-tour-card
                      data-hud-inspect
                      data-hud-label={ar ? "معاينة الجولة" : "INSPECT STUDY"}
                    >
                      <span className={styles.studyTourKicker}>
                        {ar ? tour.kickerAr : tour.kicker}
                      </span>
                      <strong className={styles.studyTourTitle}>
                        {ar ? tour.titleAr : tour.title}
                      </strong>
                      <p className={styles.studyTourDesc}>
                        {ar ? tour.descAr : tour.desc}
                      </p>
                      <span className={styles.studyTourBadge}>
                        {ar ? tour.badgeAr : tour.badge}
                      </span>
                    </div>
                  ))}
                </div>
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
            <span className={styles.capPill} data-hud-inspect data-hud-label={ar ? "فحص القدرات" : "VIEW CAPABILITY"}>LOD 400 BIM</span>
            <span className={styles.capPill} data-hud-inspect data-hud-label={ar ? "فحص القدرات" : "VIEW CAPABILITY"}>Structural FEA</span>
            <span className={styles.capPill} data-hud-inspect data-hud-label={ar ? "فحص القدرات" : "VIEW CAPABILITY"}>AIA Masterplanning</span>
            <span className={styles.capPill} data-hud-inspect data-hud-label={ar ? "فحص القدرات" : "VIEW CAPABILITY"}>FIDIC Contracts</span>
            <span className={styles.capPill} data-hud-inspect data-hud-label={ar ? "فحص القدرات" : "VIEW CAPABILITY"}>Critical Path CPM</span>
            <span className={styles.capPill} data-hud-inspect data-hud-label={ar ? "فحص القدرات" : "VIEW CAPABILITY"}>Healthcare Compliance</span>
            <span className={styles.capPill} data-hud-inspect data-hud-label={ar ? "فحص القدرات" : "VIEW CAPABILITY"}>Power Grid Systems</span>
            <span className={styles.capPill} data-hud-inspect data-hud-label={ar ? "فحص القدرات" : "VIEW CAPABILITY"}>Venture Due Diligence</span>
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
                data-hud-inspect
                data-hud-label={ar ? "استكشاف التخصص" : "EXPLORE PRACTICE"}
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
                  <div
                    className={styles.perspectiveSpecCard}
                    data-hud-inspect
                    data-hud-label={ar ? "المواصفات الفنية" : "TECHNICAL SPEC"}
                  >
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
            <span className={styles.finalKineticKicker} data-kinetic-line>
              {ar ? "طموح لا محدود" : "ENGINEERING HORIZONS"}
            </span>
            <h2 id={`${id}-final`} data-kinetic-line>{data.final.title}</h2>
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
