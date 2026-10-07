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
} from '../icons.jsx';

const hideImg = (e) => {
  e.currentTarget.style.display = 'none';
};

const DIVISIONS = [
  {
    key: 'bim',
    img: '/div-bim.jpg',
    category: 'design',
    icon: IconBIM,
    tag: 'BIM / VDC',
  },
  {
    key: 'arch',
    img: '/div-arch.jpg',
    category: 'design',
    icon: IconArch,
    tag: 'AIA Standards',
  },
  {
    key: 'civil',
    img: '/div-civil.jpg',
    category: 'design',
    icon: IconCivil,
    tag: 'Structural & Site',
  },
  {
    key: 'elec',
    img: '/div-elec.jpg',
    category: 'design',
    icon: IconElec,
    tag: 'Power & Systems',
  },
  {
    key: 'mgmt',
    img: '/div-mgmt.jpg',
    category: 'mgmt',
    icon: IconMgmt,
    tag: 'PMP Certified',
  },
  {
    key: 'bd',
    img: '/div-bd.jpg',
    category: 'mgmt',
    icon: IconBD,
    tag: 'Feasibility & Strategy',
  },
  {
    key: 'startup',
    img: '/div-startup.jpg',
    category: 'mgmt',
    icon: IconStartups,
    tag: 'Venture & Scale',
  },
  {
    key: 'medical',
    img: '/div-medical.jpg',
    category: 'special',
    icon: IconMedical,
    tag: 'Healthcare Planning',
  },
  {
    key: 'law',
    img: '/div-law.jpg',
    category: 'special',
    icon: IconLaw,
    tag: 'FIDIC & Contracts',
  },
];

const VALUE_ITEMS = [
  { key: '1', img: '/pic-value-integrity.jpg', icon: IconShield },
  { key: '2', img: '/pic-value-excellence.jpg', icon: IconAward },
  { key: '3', img: '/pic-value-fast.jpg', icon: IconClock },
  { key: '4', img: '/pic-value-longterm.jpg', icon: IconUsers },
];

const CERT_ITEMS = [
  {
    id: 'pe',
    name: 'Professional Engineer (PE)',
    issuer: 'State Boards of Professional Engineering — USA',
    badge: 'State Licensed',
    photo: '/pic-cert-pe.jpg',
  },
  {
    id: 'iso',
    name: 'ISO 9001: Quality Management',
    issuer: 'International & US Accredited Registrars',
    badge: 'Audited QA',
    photo: '/pic-cert-iso.jpg',
  },
  {
    id: 'leed',
    name: 'LEED Accredited Professional',
    issuer: 'U.S. Green Building Council (USGBC)',
    badge: 'Sustainable Design',
    photo: '/pic-cert-leed.jpg',
  },
  {
    id: 'osha',
    name: 'OSHA Safety Standards Certification',
    issuer: 'Occupational Safety & Health Administration — USA',
    badge: 'Zero-Harm Site Safety',
    photo: '/pic-cert-osha.jpg',
  },
  {
    id: 'pmp',
    name: 'PMP — Project Management Professional',
    issuer: 'Project Management Institute (PMI) — USA',
    badge: 'Earned Value Governance',
    photo: '/pic-cert-pmp.jpg',
  },
  {
    id: 'autodesk',
    name: 'Autodesk Certified Professional',
    issuer: 'Autodesk USA — Revit & Civil 3D',
    badge: 'Computational BIM',
    photo: '/pic-cert-autodesk.jpg',
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
                  <div className="cert-badge-photo">
                    <img src={c.photo} alt={c.name} loading="lazy" onError={hideImg} />
                  </div>
                  <span className="cert-tag">{c.badge}</span>
                </div>
                <h3>{c.name}</h3>
                <p>{c.issuer}</p>
                <div className="cert-verified">
                  <IconCheckBadge size={14} />
                  <span>Verified Standard</span>
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
                alt="Double H Executive Consulting Partners"
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
                  <span className="division-tag">{d.tag}</span>
                </div>

                <div className="division-body">
                  <div className="division-title-row">
                    <div className="division-icon-badge">
                      <Icon size={20} />
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
                <div className="value-card-photo">
                  <img src={item.img} alt={t(`value_${item.key}`)} loading="lazy" onError={hideImg} />
                  <span className="value-card-index">0{item.key}</span>
                </div>
                <div className="value-card-body">
                  <div className="value-icon-circle">
                    <Icon size={20} />
                  </div>
                  <h3>{t(`value_${item.key}`)}</h3>
                  <p>{t(`value_${item.key}d`)}</p>
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
