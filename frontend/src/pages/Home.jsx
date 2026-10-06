import { useEffect, useState } from 'react';
import { useLang } from '../LangContext.jsx';
import { Counter, BookButton } from '../App.jsx';

const hideImg = (e) => {
  e.currentTarget.style.display = 'none';
};

const DIVISIONS = [
  { key: 'bim', img: '/div-bim.jpg' },
  { key: 'arch', img: '/div-arch.jpg' },
  { key: 'civil', img: '/div-civil.jpg' },
  { key: 'medical', img: '/div-medical.jpg' },
  { key: 'law', img: '/div-law.jpg' },
  { key: 'elec', img: '/div-elec.jpg' },
  { key: 'mgmt', img: '/div-mgmt.jpg' },
  { key: 'bd', img: '/div-bd.jpg' },
  { key: 'startup', img: '/div-startup.jpg' },
];

const ABOUT_PHOTOS = [
  '/pic-about-standards.jpg',
  '/pic-about-experts.jpg',
  '/pic-about-ontime.jpg',
  '/pic-about-people.jpg',
];
const VALUE_PHOTOS = [
  '/pic-value-integrity.jpg',
  '/pic-value-excellence.jpg',
  '/pic-value-fast.jpg',
  '/pic-value-longterm.jpg',
];
const CERT_PHOTOS = {
  pe: '/pic-cert-pe.jpg',
  iso: '/pic-cert-iso.jpg',
  leed: '/pic-cert-leed.jpg',
  osha: '/pic-cert-osha.jpg',
  pmp: '/pic-cert-pmp.jpg',
  autodesk: '/pic-cert-autodesk.jpg',
};

export default function Home() {
  const { t } = useLang();
  const [certs, setCerts] = useState([]);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/certificates')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => alive && setCerts(Array.isArray(d) ? d : []))
      .catch(() => {});
    fetch('/api/company')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setCompany(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const stats = company?.stats || { years: 18, projects: 450, clients: 300, divisions: 9 };

  return (
    <>
      {/* ================= HERO ================= */}
      <div className="hero">
        <div className="hero-wash" aria-hidden="true" />
        <div className="hero-inner" id="heroInner">
          <div>
            <div className="hero-kicker">
              <span className="free-badge">{t('hero_badge')}</span>
            </div>
            <h1>{t('hero_title')}</h1>
            <p className="hero-sub">{t('hero_subtitle')}</p>
            <p className="hero-desc">{t('hero_desc')}</p>
            <div className="hero-btns">
              <BookButton to="/contact" className="btn-primary">
                {t('free_btn')}
              </BookButton>
              <a className="btn btn-ghost" href="#free-call">
                {t('cta_primary')}
              </a>
            </div>
            <div className="hero-stats">
              <div>
                <Counter to={stats.years} suffix="+" />
                <br />
                <small>{t('stat_years')}</small>
              </div>
              <div>
                <Counter to={stats.projects} suffix="+" />
                <br />
                <small>{t('stat_projects')}</small>
              </div>
              <div>
                <Counter to={stats.clients} suffix="+" />
                <br />
                <small>{t('stat_clients')}</small>
              </div>
              <div>
                <Counter to={stats.divisions} />
                <br />
                <small>{t('stat_divisions')}</small>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <div className="row">
              <span>Double H BIM</span>
            </div>
            <div className="row">
              <span>Double H ARCHITECTURE</span>
            </div>
            <div className="row">
              <span>Double H CIVIL ENGINEERING</span>
            </div>
            <div className="row">
              <span>Double H MEDICAL · LAW</span>
            </div>
            <div className="row">
              <span>Double H ELECTRICITY · MANAGEMENT</span>
            </div>
            <div className="row">
              <span>Double H BD</span>
            </div>
            <div className="row">
              <span>Double H STARTUPS</span>
            </div>
            <p
              className="notice"
              style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.3)', color: '#fff' }}
            >
              {t('free_note')}
            </p>
          </div>
        </div>
      </div>

      {/* ================= FIRST FREE CALL — ticket offer ================= */}
      <section className="section" id="free-call">
        <div className="free-call reveal">
          <div className="free-call-inner">
            <span className="free-pill">{t('free_badge')}</span>
            <h2>{t('free_title')}</h2>
            <p>{t('free_desc')}</p>
            <BookButton to="/contact" className="btn-light">
              {t('free_btn')}
            </BookButton>
            <div className="free-note">{t('free_note')}</div>
          </div>
        </div>
      </section>

      {/* ================= MARQUEE ================= */}
      <div className="marquee">
        <span>
          Double H BIM — Double H ARCHITECTURE — Double H CIVIL ENGINEERING — Double H MEDICAL — Double H LAW — Double H
          ELECTRICITY — Double H MANAGEMENT — Double H BD — Double H STARTUPS —&nbsp;
        </span>
        <span>
          Double H BIM — Double H ARCHITECTURE — Double H CIVIL ENGINEERING — Double H MEDICAL — Double H LAW — Double H
          ELECTRICITY — Double H MANAGEMENT — Double H BD — Double H STARTUPS —&nbsp;
        </span>
      </div>

      {/* ================= ABOUT ================= */}
      <section className="section" id="about">
        <div className="eyebrow">Double H</div>
        <h2>{t('about_title')}</h2>
        <div className="about-grid">
          <div className="about-text reveal">
            <p>{t('about_p1')}</p>
            <p>{t('about_p2')}</p>
          </div>
          <div className="about-points">
            {[
              ['about_point_1', 'about_point_1d'],
              ['about_point_2', 'about_point_2d'],
              ['about_point_3', 'about_point_3d'],
              ['about_point_4', 'about_point_4d'],
            ].map(([tk, dk], i) => {
              return (
                <div className="point reveal tilt" key={tk} style={{ '--d': `${i * 80}ms` }}>
                  <div className="point-photo">
                    <img src={ABOUT_PHOTOS[i]} alt="" loading="lazy" onError={hideImg} />
                  </div>
                  <div>
                    <h3>{t(tk)}</h3>
                    <p>{t(dk)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= AMERICAN CERTIFICATES ================= */}
      <section className="section certs-section" id="certificates">
        <div className="eyebrow">Double H</div>
        <h2>{t('certs_title')}</h2>
        <p className="section-lead">{t('certs_desc')}</p>
        <div className="cert-list">
          {(certs.length
            ? certs
            : [
                { id: 'pe', name: 'Professional Engineer (PE)', issuer: 'State Boards of Professional Engineering — USA' },
                { id: 'iso', name: 'ISO 9001 — Quality Management', issuer: 'International / US-accredited registrars' },
                { id: 'leed', name: 'LEED Accredited Professional', issuer: 'GBCI — USA' },
                { id: 'osha', name: 'OSHA Safety Certification', issuer: 'Occupational Safety and Health Administration — USA' },
                { id: 'pmp', name: 'PMP — Project Management Professional', issuer: 'Project Management Institute — USA' },
                { id: 'autodesk', name: 'Autodesk Certified Professional', issuer: 'Autodesk — USA' },
              ]
          ).map((c, i) => (
            <div className="cert-row reveal" key={c.id} style={{ '--d': `${i * 70}ms` }}>
              <div className="cert-photo">
                <img src={CERT_PHOTOS[c.id]} alt="" loading="lazy" onError={hideImg} />
              </div>
              <div className="cert-text">
                <h3>{c.name}</h3>
                <p>{c.issuer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= POSITIVE VALUES ================= */}
      <section className="section values-section">
        <div className="eyebrow">Double H</div>
        <h2>{t('values_title')}</h2>
        <p className="section-lead">{t('values_desc')}</p>
        <div className="value-grid">
          {[
            ['value_1', 'value_1d'],
            ['value_2', 'value_2d'],
            ['value_3', 'value_3d'],
            ['value_4', 'value_4d'],
          ].map(([tk, dk], i) => {
            return (
              <div className="value-item reveal" key={tk} style={{ '--d': `${i * 80}ms` }}>
                <span className="value-index">{String(i + 1).padStart(2, '0')}</span>
                <div className="value-photo">
                  <img src={VALUE_PHOTOS[i]} alt="" loading="lazy" onError={hideImg} />
                </div>
                <h3>{t(tk)}</h3>
                <p>{t(dk)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= DIVISIONS ================= */}
      <section className="section">
        <div className="eyebrow">Double H</div>
        <h2>{t('div_title')}</h2>
        <p className="section-lead">{t('div_desc')}</p>
        <div className="div-list">
          {DIVISIONS.map((d, i) => {
            return (
              <div className="div-row reveal" key={d.key} style={{ '--d': `${i * 60}ms` }}>
                <span className="div-index">{String(i + 1).padStart(2, '0')}</span>
                <div className="div-icon">
                  <img
                    src={d.img}
                    alt={t(`div_${d.key}`)}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="div-text">
                  <h3>{t(`div_${d.key}`)}</h3>
                  <p>{t(`div_${d.key}d`)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="section">
        <div className="cta-band reveal">
          <span className="free-pill">{t('free_badge')}</span>
          <h2>{t('cta_title')}</h2>
          <p>{t('cta_desc')}</p>
          <BookButton to="/contact" className="btn-primary">
            {t('cta_btn')}
          </BookButton>
          <div className="free-note">{t('free_note')}</div>
        </div>
      </section>
    </>
  );
}
