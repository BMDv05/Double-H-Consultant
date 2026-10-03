import { useEffect, useState } from 'react';
import { useLang } from '../LangContext.jsx';
import { Counter } from '../App.jsx';
import Icon from '../Icon.jsx';

const DIVISIONS = [
  { key: 'arch', icon: 'building' },
  { key: 'bim', icon: 'cube' },
  { key: 'civil', icon: 'bridge' },
  { key: 'medical', icon: 'med' },
  { key: 'law', icon: 'scale' },
  { key: 'elec', icon: 'bolt' },
  { key: 'mgmt', icon: 'chart' },
  { key: 'bd', icon: 'ruler' },
];

export default function Home({ onBook }) {
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

  const stats = company?.stats || { years: 18, projects: 450, clients: 300, divisions: 8 };

  return (
    <>
      {/* ================= HERO (clean — no blobs, no grid) ================= */}
      <div className="hero">
        <div className="hero-inner" id="heroInner">
          <div>
            <span className="free-badge">
              {t('hero_badge')}
            </span>
            <h1>{t('hero_title')}</h1>
            <p className="hero-sub">{t('hero_subtitle')}</p>
            <p style={{ opacity: 0.85 }}>{t('hero_desc')}</p>
            <div className="hero-btns">
              <button className="btn btn-primary" onClick={onBook}>
                {t('cta_primary')}
              </button>
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
        </div>
      </div>

      {/* ================= MARQUEE ================= */}
      <div className="marquee">
        <span>
          Double H ARCHITECTURE — Double H CIVIL ENGINEERING — Double H MEDICAL — Double H LAW — Double H ELECTRICITY —
          Double H MANAGEMENT — Double H BD —&nbsp;
        </span>
        <span>
          Double H ARCHITECTURE — Double H CIVIL ENGINEERING — Double H MEDICAL — Double H LAW — Double H ELECTRICITY —
          Double H MANAGEMENT — Double H BD —&nbsp;
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
              ['check', 'about_point_1', 'about_point_1d'],
              ['users', 'about_point_2', 'about_point_2d'],
              ['clock', 'about_point_3', 'about_point_3d'],
              ['heart', 'about_point_4', 'about_point_4d'],
            ].map(([icon, tk, dk], i) => (
              <div className="point reveal" key={tk} style={{ '--d': `${i * 80}ms` }}>
                <div className="icon-line">
                  <Icon name={icon} size={22} />
                </div>
                <div>
                  <h3>{t(tk)}</h3>
                  <p>{t(dk)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= AMERICAN CERTIFICATES ================= */}
      <section className="section certs-section" id="certificates">
        <div className="eyebrow">Double H</div>
        <h2>{t('certs_title')}</h2>
        <p className="section-lead">{t('certs_desc')}</p>
        <div className="cards">
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
            <div className="card reveal" key={c.id} style={{ '--d': `${i * 70}ms` }}>
              <div className="icon-line">
                <Icon name="award" size={24} />
              </div>
              <h3>{c.name}</h3>
              <p>{c.issuer}</p>
              <div className="pill">USA</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= POSITIVE VALUES ================= */}
      <section className="section values-section">
        <div className="eyebrow">Double H</div>
        <h2>{t('values_title')}</h2>
        <p className="section-lead">{t('values_desc')}</p>
        <div className="cards">
          {[
            ['gem', 'value_1', 'value_1d'],
            ['trophy', 'value_2', 'value_2d'],
            ['target', 'value_3', 'value_3d'],
            ['sprout', 'value_4', 'value_4d'],
          ].map(([icon, tk, dk], i) => (
            <div className="card reveal" key={tk} style={{ '--d': `${i * 80}ms` }}>
              <div className="icon-line">
                <Icon name={icon} size={24} />
              </div>
              <h3>{t(tk)}</h3>
              <p>{t(dk)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= DIVISIONS ================= */}
      <section className="section">
        <div className="eyebrow">Double H</div>
        <h2>{t('div_title')}</h2>
        <p className="section-lead">{t('div_desc')}</p>
        <div className="cards">
          {DIVISIONS.map((d, i) => (
            <div className="card reveal" key={d.key} style={{ '--d': `${i * 60}ms` }}>
              <div className="icon-line">
                <Icon name={d.icon} size={24} />
              </div>
              <h3>{t(`div_${d.key}`)}</h3>
              <p>{t(`div_${d.key}d`)}</p>
              <div className="pill">Double H</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="section">
        <div className="cta-band reveal">
          <span className="free-badge small">
            {t('consult_free_badge')}
          </span>
          <h2>{t('cta_title')}</h2>
          <p>{t('cta_desc')}</p>
          <div className="cta-actions">
            <button className="btn btn-primary" onClick={onBook}>
              {t('cta_primary')}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
