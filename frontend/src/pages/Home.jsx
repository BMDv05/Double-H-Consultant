import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../LangContext.jsx';
import { Counter, BookButton } from '../App.jsx';
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
} from '../icons.jsx';

const hideImg = (e) => {
  e.currentTarget.style.display = 'none';
};

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
  const [activeFilter, setActiveFilter] = useState('all');
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

  const stats = company?.stats || { years: 18, projects: 450, clients: 300, divisions: 9 };

  const filteredDivisions = useMemo(() => {
    if (activeFilter === 'all') return DIVISIONS;
    return DIVISIONS.filter((d) => d.category === activeFilter);
  }, [activeFilter]);

  const handleInquireDivision = (divisionKey) => {
    const divisionName = t(`div_${divisionKey}`);
    navigate(`/contact?division=${encodeURIComponent(divisionKey)}&subject=${encodeURIComponent(divisionName)}`);
  };

  return (
    <div className="home-page">
      {/* ================= HERO SECTION ================= */}
      <section className="hero">
        <div className="hero-wash" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-kicker">
              <span className="free-badge">
                <IconBadge size={16} />
                {t('hero_badge')}
              </span>
            </div>

            <h1 className="hero-headline">{t('hero_title')}</h1>
            <p className="hero-sub">{t('hero_subtitle')}</p>
            <p className="hero-desc">{t('hero_desc')}</p>

            <div className="hero-btns">
              <BookButton to="/contact" className="btn-primary">
                {t('cta_book_now')}
                <IconArrow size={18} />
              </BookButton>
              <a className="btn btn-secondary" href="#divisions">
                {t('cta_primary')}
              </a>
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

          {/* Hero Visual Showcase */}
          <div className="hero-visual-card reveal">
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

            {/* Floating Trust Pills */}
            <div className="hero-float-badge top-badge">
              <div className="float-icon-wrap">
                <IconShield size={18} />
              </div>
              <div>
                <strong>{t('hero_floating_badge')}</strong>
                <span>Rigorous US QA Protocols</span>
              </div>
            </div>

            <div className="hero-float-badge bottom-badge">
              <div className="float-icon-wrap accent">
                <IconLayers size={18} />
              </div>
              <div>
                <strong>{t('hero_floating_scope')}</strong>
                <span>Architecture • Civil • BIM • Law</span>
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
                    <span>Verified Standard</span>
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
              <img
                src="/about-consulting.jpg"
                alt="Double H Technical Drafting & BIM Coordination Studio"
                className="about-main-img"
                loading="lazy"
                onError={hideImg}
              />
              <div className="about-photo-badge">
                <IconCheckBadge size={20} />
                <span>{t('about_badge_text')}</span>
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
              <BookButton to="/contact" className="btn-primary">
                {t('cta_book_now')}
                <IconArrow size={18} />
              </BookButton>
            </div>
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
                <div className="division-media">
                  <img src={d.img} alt={t(`div_${d.key}`)} loading="lazy" onError={hideImg} />
                  <div className="division-media-overlay" />
                  <div className="division-media-top">
                    <span className="division-index-badge">{d.num}</span>
                    <span className="division-tag">{d.tag}</span>
                  </div>
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
                    <span className="value-metric-pill">
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
            <span className="advisory-badge">{t('free_badge')}</span>
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
