import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../LangContext.jsx';
import { Counter, BookButton, useBook } from '../App.jsx';
import BimDigitalTwin from '../BimDigitalTwin.jsx';
import {
  IconArch,
  IconCivil,
  IconMedical,
  IconLaw,
  IconElec,
  IconMgmt,
  IconBD,
  IconBIM,
  IconStartups,
  IconCheck,
  IconShield,
  IconAward,
  IconClock,
  IconUsers,
  IconBadge,
  IconArrow,
  IconChevron,
  IconLayers,
  IconCheckBadge,
  CertSeal,
  ValueSchematic,
  JourneySchematic,
} from '../icons.jsx';

const hideImg = (e) => {
  e.currentTarget.style.display = 'none';
};

const JOURNEY_PHASES = [
  {
    phase: 1,
    timeKey: 'journey_phase1_badge',
    titleKey: 'journey_phase1_title',
    descKey: 'journey_phase1_desc',
    deliverableKey: 'journey_phase1_deliverable',
    leadKey: 'journey_phase1_lead',
  },
  {
    phase: 2,
    timeKey: 'journey_phase2_badge',
    titleKey: 'journey_phase2_title',
    descKey: 'journey_phase2_desc',
    deliverableKey: 'journey_phase2_deliverable',
    leadKey: 'journey_phase2_lead',
  },
  {
    phase: 3,
    timeKey: 'journey_phase3_badge',
    titleKey: 'journey_phase3_title',
    descKey: 'journey_phase3_desc',
    deliverableKey: 'journey_phase3_deliverable',
    leadKey: 'journey_phase3_lead',
  },
];

const HESITATION_ITEMS = [
  {
    key: '1',
    icon: IconShield,
    titleKey: 'hesitation_1_title',
    descKey: 'hesitation_1_desc',
    badgeKey: 'hesitation_1_badge',
  },
  {
    key: '2',
    icon: IconCheckBadge,
    titleKey: 'hesitation_2_title',
    descKey: 'hesitation_2_desc',
    badgeKey: 'hesitation_2_badge',
  },
  {
    key: '3',
    icon: IconUsers,
    titleKey: 'hesitation_3_title',
    descKey: 'hesitation_3_desc',
    badgeKey: 'hesitation_3_badge',
  },
  {
    key: '4',
    icon: IconClock,
    titleKey: 'hesitation_4_title',
    descKey: 'hesitation_4_desc',
    badgeKey: 'hesitation_4_badge',
  },
];

const DIVISIONS = [
  {
    key: 'bim',
    num: '01',
    img: '/div-bim.jpg',
    category: 'design',
    icon: IconBIM,
    tag: 'BIM / VDC LOD 400',
  },
  {
    key: 'arch',
    num: '02',
    img: '/div-arch.jpg',
    category: 'design',
    icon: IconArch,
    tag: 'AIA Standards',
  },
  {
    key: 'civil',
    num: '03',
    img: '/div-civil.jpg',
    category: 'design',
    icon: IconCivil,
    tag: 'Structural & Site',
  },
  {
    key: 'elec',
    num: '04',
    img: '/div-elec.jpg',
    category: 'design',
    icon: IconElec,
    tag: 'Power & Systems',
  },
  {
    key: 'mgmt',
    num: '05',
    img: '/div-mgmt.jpg',
    category: 'mgmt',
    icon: IconMgmt,
    tag: 'PMP Certified',
  },
  {
    key: 'bd',
    num: '06',
    img: '/div-bd.jpg',
    category: 'mgmt',
    icon: IconBD,
    tag: 'Feasibility & Strategy',
  },
  {
    key: 'startup',
    num: '07',
    img: '/div-startup.jpg',
    category: 'mgmt',
    icon: IconStartups,
    tag: 'Venture & Scale',
  },
  {
    key: 'medical',
    num: '08',
    img: '/div-medical.jpg',
    category: 'special',
    icon: IconMedical,
    tag: 'Healthcare Planning',
  },
  {
    key: 'law',
    num: '09',
    img: '/div-law.jpg',
    category: 'special',
    icon: IconLaw,
    tag: 'FIDIC & Contracts',
  },
];

const VALUE_ITEMS = [
  { key: '1', icon: IconShield },
  { key: '2', icon: IconAward },
  { key: '3', icon: IconClock },
  { key: '4', icon: IconUsers },
];

const CERT_ITEMS = [
  {
    id: 'pe',
    name: 'Professional Engineer (PE)',
    issuer: 'State Boards of Professional Engineering — USA',
    badge: 'State Licensed',
    code: 'REG // 40 CFR & ASCE 7',
    jurisdiction: 'United States Jurisdictions',
  },
  {
    id: 'iso',
    name: 'ISO 9001: Quality Management',
    issuer: 'International & US Accredited Registrars',
    badge: 'Audited QA',
    code: 'ISO/IEC 17021:2015 AUDITED',
    jurisdiction: 'International Quality Assurance',
  },
  {
    id: 'leed',
    name: 'LEED Accredited Professional',
    issuer: 'U.S. Green Building Council (USGBC)',
    badge: 'Sustainable Design',
    code: 'USGBC LEED AP BD+C',
    jurisdiction: 'High-Performance Architecture',
  },
  {
    id: 'osha',
    name: 'OSHA Safety Standards Certification',
    issuer: 'Occupational Safety & Health Administration — USA',
    badge: 'Zero-Harm Site Safety',
    code: '29 CFR 1926 / 1910 STANDARD',
    jurisdiction: 'Federal Safety Governance',
  },
  {
    id: 'pmp',
    name: 'PMP — Project Management Professional',
    issuer: 'Project Management Institute (PMI) — USA',
    badge: 'Earned Value Governance',
    code: 'PMBOK 7TH ED / ANSI 99-001',
    jurisdiction: 'Critical Path & Cost Governance',
  },
  {
    id: 'autodesk',
    name: 'Autodesk Certified Professional',
    issuer: 'Autodesk USA — Revit & Civil 3D',
    badge: 'Computational BIM',
    code: 'LOD 400 REVIT & CIVIL 3D',
    jurisdiction: 'VDC & Digital Twin Protocol',
  },
];

export default function Home() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const book = useBook();
  const [activeFilter, setActiveFilter] = useState('all');
  const [activePhase, setActivePhase] = useState(1);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/company')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setCompany(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const [heroMediaTab, setHeroMediaTab] = useState('3d');

  const stats = company?.stats || { years: 18, projects: 450, clients: 300, divisions: 9 };

  const filteredDivisions = useMemo(() => {
    if (activeFilter === 'all') return DIVISIONS;
    return DIVISIONS.filter((d) => d.category === activeFilter);
  }, [activeFilter]);

  const handleInquireDivision = (divisionKey) => {
    book({ division: divisionKey });
  };

  return (
    <div className="home-page">
      {/* ================= HERO SECTION ================= */}
      <section className="hero">
        <div className="hero-wash" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-kicker">
              <div className="status-live-badge">
                <span className="status-pulse-dot" />
                <span>{t('status_principal_open')}</span>
              </div>
              <span className="eyebrow">{t('hero_badge')}</span>
            </div>

            <h1 className="hero-headline">{t('hero_title')}</h1>
            <p className="hero-sub">{t('hero_subtitle')}</p>
            <p className="hero-desc">{t('hero_desc')}</p>

            <div className="hero-btns">
              <BookButton className="btn-primary">
                {t('cta_book_now')}
                <IconArrow size={18} />
              </BookButton>
              <a className="btn btn-secondary" href="#divisions">
                {t('cta_primary')}
              </a>
            </div>

            {/* Institutional Fiduciary Guarantees for 15-Minute Consultation */}
            <div className="hero-guarantee-strip">
              <div className="guarantee-pill">
                <IconShield size={14} />
                <span>{t('hero_guarantee_nda')}</span>
              </div>
              <div className="guarantee-pill">
                <IconCheckBadge size={14} />
                <span>{t('hero_guarantee_pe')}</span>
              </div>
              <div className="guarantee-pill">
                <IconClock size={14} />
                <span>{t('hero_guarantee_sla')}</span>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="hero-stats">
              <div className="stat-box">
                <Counter to={stats.years} suffix="+" />
                <small>{t('stat_years')}</small>
              </div>
              <div className="stat-box">
                <Counter to={stats.projects} suffix="+" />
                <small>{t('stat_projects')}</small>
              </div>
              <div className="stat-box">
                <Counter to={stats.clients} suffix="+" />
                <small>{t('stat_clients')}</small>
              </div>
              <div className="stat-box">
                <Counter to={stats.divisions} />
                <small>{t('stat_divisions')}</small>
              </div>
            </div>
          </div>

          {/* Hero Visual Showcase — 3D BIM Digital Twin & Portfolio */}
          <div className="hero-visual-card reveal">
            {/* Viewport Mode Switcher */}
            <div className="hero-viewport-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={heroMediaTab === '3d'}
                className={`hero-viewport-tab-btn ${heroMediaTab === '3d' ? 'active' : ''}`}
                onClick={() => setHeroMediaTab('3d')}
              >
                <IconBIM size={14} />
                <span>{t('bim_tab_3d')}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={heroMediaTab === 'photo'}
                className={`hero-viewport-tab-btn ${heroMediaTab === 'photo' ? 'active' : ''}`}
                onClick={() => setHeroMediaTab('photo')}
              >
                <IconArch size={14} />
                <span>{t('bim_tab_photo')}</span>
              </button>
            </div>

            {heroMediaTab === '3d' ? (
              <BimDigitalTwin />
            ) : (
              <div className="hero-image-wrap">
                <img
                  src="/hero-showcase.jpg"
                  alt="Double H Architectural & Engineering Headquarters"
                  className="hero-main-img"
                  fetchpriority="high"
                  onError={hideImg}
                />
                <div className="hero-img-overlay" />
              </div>
            )}

            {/* Architectural Specification Bar */}
            <div className="hero-arch-spec-bar">
              <div className="arch-spec-item">
                <span className="spec-label">{t('hero_spec_lbl_licensure')}</span>
                <span className="spec-val">{t('hero_spec_licensure')}</span>
              </div>
              <div className="arch-spec-divider" />
              <div className="arch-spec-item">
                <span className="spec-label">{t('hero_spec_lbl_governance')}</span>
                <span className="spec-val">{t('hero_spec_governance')}</span>
              </div>
              <div className="arch-spec-divider" />
              <div className="arch-spec-item">
                <span className="spec-label">{t('hero_spec_lbl_standard')}</span>
                <span className="spec-val">{t('hero_spec_standard')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ACCREDITATIONS & STANDARDS BAR ================= */}
      <section className="accreditations-strip" id="certificates">
        <div className="section-container">
          <div className="section-header-compact">
            <div className="eyebrow">{t('certs_eyebrow')}</div>
            <h2>{t('certs_title')}</h2>
            <p className="section-lead">{t('certs_desc')}</p>
          </div>

          <div className="cert-cards-grid">
            {CERT_ITEMS.map((c, i) => (
              <div className="cert-card reveal" key={c.id} style={{ '--d': `${i * 60}ms` }}>
                <div className="cert-card-header">
                  <div className="cert-seal-wrap">
                    <CertSeal id={c.id} size={54} />
                  </div>
                  <div className="cert-badges-col">
                    <span className="cert-code-tag">{c.code}</span>
                    <span className="cert-tag">{c.badge}</span>
                  </div>
                </div>
                <h3>{c.name}</h3>
                <p className="cert-issuer">{c.issuer}</p>
                <div className="cert-footer">
                  <span className="cert-jurisdiction">{c.jurisdiction}</span>
                  <div className="cert-verified">
                    <IconCheckBadge size={14} />
                    <span>{t('cert_verified_tag')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ABOUT / STRATEGIC DELIVERY ================= */}
      <section className="section about-showcase" id="about">
        <div className="about-split-grid">
          {/* Visual Side */}
          <div className="about-visual reveal">
            <div className="about-photo-wrap">
              <div className="about-img-frame">
                <img
                  src="/about-consulting.jpg"
                  alt="Double H Technical Drafting & BIM Coordination Studio"
                  className="about-main-img"
                  loading="lazy"
                  onError={hideImg}
                />
              </div>
              <div className="about-arch-spec-bar">
                <div className="about-spec-badge">
                  <IconCheckBadge size={16} />
                  <span>{t('about_badge_text')}</span>
                </div>
                <span className="about-spec-meta">PE // ISO 9001 GOVERNANCE</span>
              </div>
            </div>
          </div>

          {/* Strategic Narrative Side */}
          <div className="about-content-wrap reveal">
            <div className="eyebrow">{t('about_eyebrow')}</div>
            <h2>{t('about_title')}</h2>
            <p className="about-lead-text">{t('about_lead')}</p>

            <div className="about-pillars">
              <div className="pillar-item">
                <div className="pillar-icon">
                  <IconLayers size={22} />
                </div>
                <div>
                  <h3>{t('pillar_1')}</h3>
                  <p>{t('pillar_1d')}</p>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon">
                  <IconShield size={22} />
                </div>
                <div>
                  <h3>{t('pillar_2')}</h3>
                  <p>{t('pillar_2d')}</p>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon">
                  <IconClock size={22} />
                </div>
                <div>
                  <h3>{t('pillar_3')}</h3>
                  <p>{t('pillar_3d')}</p>
                </div>
              </div>
            </div>

            <div className="about-cta-row">
              <BookButton className="btn-primary">
                {t('cta_book_now')}
                <IconArrow size={18} />
              </BookButton>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DIAGNOSTIC ADVISORY JOURNEY ================= */}
      <section className="section journey-section" id="journey">
        <div className="journey-blueprint-grid" aria-hidden="true" />
        <div className="section-header-centered">
          <div className="eyebrow">{t('journey_eyebrow')}</div>
          <h2>{t('journey_title')}</h2>
          <p className="section-lead">{t('journey_lead')}</p>

          {/* Interactive Phase Switcher Tabs */}
          <div className="journey-phase-tabs" role="tablist" aria-label="Consultation Phases">
            {JOURNEY_PHASES.map((p) => (
              <button
                key={p.phase}
                type="button"
                role="tab"
                aria-selected={activePhase === p.phase}
                className={`journey-tab-btn ${activePhase === p.phase ? 'active' : ''}`}
                onClick={() => setActivePhase(p.phase)}
              >
                <span className="journey-tab-index">0{p.phase}</span>
                <span className="journey-tab-text">{t(`journey_tab_phase${p.phase}`)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3-Phase Interactive Technical Progression Grid */}
        <div className="journey-cards-grid">
          {JOURNEY_PHASES.map((p, idx) => {
            const isActive = activePhase === p.phase;
            return (
              <div
                key={p.phase}
                className={`journey-phase-card reveal ${isActive ? 'active-phase' : ''}`}
                style={{ '--d': `${idx * 80}ms` }}
                onClick={() => setActivePhase(p.phase)}
              >
                <div className="journey-card-topbar">
                  <span className="journey-phase-num">0{p.phase} // DIAGNOSTIC</span>
                  <span className="journey-phase-timing">{t(p.timeKey)}</span>
                </div>

                <div className="journey-schematic-container">
                  <JourneySchematic phase={p.phase} />
                </div>

                <div className="journey-card-body">
                  <h3>{t(p.titleKey)}</h3>
                  <p className="journey-phase-desc">{t(p.descKey)}</p>

                  <div className="journey-deliverable-box">
                    <div className="deliverable-label">
                      <IconCheckBadge size={14} />
                      <span>{t(p.deliverableKey)}</span>
                    </div>
                  </div>

                  <div className="journey-card-footer">
                    <span className="journey-lead-badge">{t(p.leadKey)}</span>
                    <BookButton
                      className="btn-phase-book"
                      phase={p.phase === 1 ? 'schematic' : p.phase === 2 ? 'bim' : 'feasibility'}
                      subject={t(p.titleKey)}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <span>{t('journey_cta_btn')}</span>
                      <IconArrow size={14} />
                    </BookButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= 15-MINUTE DIAGNOSTIC AGENDA BREAKDOWN ================= */}
        <div className="agenda-breakdown-card reveal" id="diagnostic-agenda">
          <div className="agenda-header">
            <div className="eyebrow">{t('agenda_kicker')}</div>
            <h3>{t('agenda_title')}</h3>
            <p className="agenda-subtitle">{t('agenda_subtitle')}</p>
          </div>

          <div className="agenda-timeline-grid">
            <div className="agenda-step-card">
              <div className="agenda-step-badge">
                <IconShield size={16} />
                <span>{t('agenda_step1_time')}</span>
              </div>
              <h4>{t('agenda_step1_title')}</h4>
              <p>{t('agenda_step1_desc')}</p>
              <div className="agenda-metric-tag">
                <IconCheckBadge size={13} />
                <span>ASCE 7 & IBC 2024 Audit</span>
              </div>
            </div>

            <div className="agenda-step-card">
              <div className="agenda-step-badge">
                <IconBIM size={16} />
                <span>{t('agenda_step2_time')}</span>
              </div>
              <h4>{t('agenda_step2_title')}</h4>
              <p>{t('agenda_step2_desc')}</p>
              <div className="agenda-metric-tag">
                <IconCheckBadge size={13} />
                <span>Clash & Material Savings</span>
              </div>
            </div>

            <div className="agenda-step-card">
              <div className="agenda-step-badge">
                <IconClock size={16} />
                <span>{t('agenda_step3_time')}</span>
              </div>
              <h4>{t('agenda_step3_title')}</h4>
              <p>{t('agenda_step3_desc')}</p>
              <div className="agenda-metric-tag">
                <IconCheckBadge size={13} />
                <span>24-Hour Formal PDF Brief</span>
              </div>
            </div>
          </div>

          <div className="agenda-action-row">
            <BookButton className="btn-primary agenda-cta-btn" subject="15-Minute Complimentary Diagnostic Session">
              <span>{t('agenda_cta')}</span>
              <IconArrow size={18} />
            </BookButton>
          </div>
        </div>

        {/* Client Hesitations Answered (4 Institutional Guarantees) */}
        <div className="hesitation-section reveal">
          <div className="hesitation-header">
            <div className="eyebrow">{t('hesitation_eyebrow')}</div>
            <h3>{t('hesitation_title')}</h3>
            <p className="hesitation-lead">{t('hesitation_desc')}</p>
          </div>

          <div className="hesitation-cards-grid">
            {HESITATION_ITEMS.map((h, i) => {
              const Icon = h.icon;
              return (
                <div className="hesitation-card reveal" key={h.key} style={{ '--d': `${i * 60}ms` }}>
                  <div className="hesitation-card-top">
                    <div className="hesitation-icon-box">
                      <Icon size={20} />
                    </div>
                    <span className="hesitation-badge">{t(h.badgeKey)}</span>
                  </div>
                  <h4>{t(h.titleKey)}</h4>
                  <p>{t(h.descKey)}</p>
                </div>
              );
            })}
          </div>

          {/* Quick Consultation Intake Anchor */}
          <div className="journey-cta-anchor">
            <div className="journey-cta-status">
              <span className="status-pulse-dot" />
              <span>{t('status_principal_open')}</span>
            </div>
            <BookButton className="btn-primary journey-main-btn">
              <span>{t('cta_book_now')}</span>
              <IconArrow size={18} />
            </BookButton>
          </div>
        </div>
      </section>

      {/* ================= DIVISIONS PORTFOLIO GRID ================= */}
      <section className="section divisions-section" id="divisions">
        <div className="section-header-centered">
          <div className="eyebrow">{t('div_eyebrow')}</div>
          <h2>{t('div_title')}</h2>
          <p className="section-lead">{t('div_desc')}</p>

          {/* Filter Tabs */}
          <div className="division-filters" role="tablist">
            <button
              type="button"
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              {t('div_filter_all')}
            </button>
            <button
              type="button"
              className={`filter-btn ${activeFilter === 'design' ? 'active' : ''}`}
              onClick={() => setActiveFilter('design')}
            >
              {t('div_filter_design')}
            </button>
            <button
              type="button"
              className={`filter-btn ${activeFilter === 'mgmt' ? 'active' : ''}`}
              onClick={() => setActiveFilter('mgmt')}
            >
              {t('div_filter_mgmt')}
            </button>
            <button
              type="button"
              className={`filter-btn ${activeFilter === 'special' ? 'active' : ''}`}
              onClick={() => setActiveFilter('special')}
            >
              {t('div_filter_special')}
            </button>
          </div>
        </div>

        {/* Divisions Photographic Grid */}
        <div className="divisions-grid">
          {filteredDivisions.map((d, i) => {
            const Icon = d.icon;
            return (
              <div className="division-card reveal" key={d.key} style={{ '--d': `${i * 50}ms` }}>
                <div className="division-spec-bar">
                  <span className="division-spec-num">{d.num} // SPEC</span>
                  <span className="division-spec-tag">{d.tag}</span>
                </div>
                <div className="division-media">
                  <img src={d.img} alt={t(`div_${d.key}`)} loading="lazy" onError={hideImg} />
                  <div className="division-media-overlay" />
                </div>

                <div className="division-body">
                  <div className="division-title-row">
                    <div className="division-icon-badge">
                      <Icon size={18} />
                    </div>
                    <h3>{t(`div_${d.key}`)}</h3>
                  </div>
                  <p className="division-desc">{t(`div_${d.key}d`)}</p>

                  <button
                    type="button"
                    className="division-inquire-btn"
                    onClick={() => handleInquireDivision(d.key)}
                  >
                    <span>{t('div_explore_cta')}</span>
                    <IconArrow size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= CORE VALUES & PRINCIPLES ================= */}
      <section className="section values-showcase">
        <div className="section-header-compact">
          <div className="eyebrow">{t('values_eyebrow')}</div>
          <h2>{t('values_title')}</h2>
          <p className="section-lead">{t('values_desc')}</p>
        </div>

        <div className="values-cards-grid">
          {VALUE_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div className="value-card reveal" key={item.key} style={{ '--d': `${i * 70}ms` }}>
                <div className="value-schematic-wrap">
                  <div className="value-card-header-bar">
                    <span className="value-spec-code">{t(`value_${item.key}_spec`)}</span>
                    <span className="value-card-index">0{item.key}</span>
                  </div>
                  <ValueSchematic id={item.key} />
                </div>
                <div className="value-card-body">
                  <div className="value-title-row">
                    <div className="value-icon-circle">
                      <Icon size={18} />
                    </div>
                    <h3>{t(`value_${item.key}`)}</h3>
                  </div>
                  <p className="value-card-desc">{t(`value_${item.key}d`)}</p>
                  <div className="value-card-footer">
                    <span className="value-metric-tag">
                      <IconCheckBadge size={13} />
                      {t(`value_${item.key}_metric`)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= EXECUTIVE CONSULTATION CTA ================= */}
      <section className="section advisory-cta-section" id="free-call">
        <div className="advisory-card reveal">
          <div className="advisory-glow" aria-hidden="true" />
          <div className="advisory-inner">
            <span className="advisory-kicker">{t('free_badge')}</span>
            <h2>{t('cta_title')}</h2>
            <p className="advisory-desc">{t('cta_desc')}</p>

            <div className="advisory-actions">
              <BookButton to="/contact" className="btn-light">
                {t('cta_btn')}
                <IconArrow size={18} />
              </BookButton>
            </div>

            <div className="advisory-guarantee">
              <IconCheckBadge size={16} />
              <span>{t('advisory_guarantee')}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
