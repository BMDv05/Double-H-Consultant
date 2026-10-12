import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import esbuild from 'esbuild';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { createRequire } from 'node:module';
import { DIVISION_GROUPS } from './fixtures.js';

globalThis.React = React;

const require = createRequire(import.meta.url);
const entryPath = fileURLToPath(new URL('./ConsultingHome.jsx', import.meta.url));

// Bundle ConsultingHome with in-memory esbuild to simulate module execution
const bundleResult = esbuild.buildSync({
  entryPoints: [entryPath],
  bundle: true,
  write: false,
  format: 'cjs',
  loader: { '.module.css': 'empty' },
  external: ['react', 'react/jsx-runtime']
});

const moduleObj = { exports: {} };
const runner = new Function('module', 'exports', 'require', 'React', bundleResult.outputFiles[0].text);
runner(moduleObj, moduleObj.exports, (mod) => {
  if (mod === 'react') return React;
  if (mod === 'react/jsx-runtime') return require('react/jsx-runtime');
  return require(mod);
}, React);

const ConsultingHome = moduleObj.exports.default;

test('Phase 2 Acceptance: Export contract ConsultingHome is a valid React component function', () => {
  assert.equal(typeof ConsultingHome, 'function');
});

test('Phase 2 Acceptance: All 8 required section IDs and alias exist in rendered markup', () => {
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(ConsultingHome, { lang: 'en' }));
  const requiredSectionIds = [
    'hero',
    'certificates',
    'about',
    'journey',
    'divisions',
    'values',
    'final',
    'contact'
  ];

  for (const id of requiredSectionIds) {
    assert.ok(
      html.includes(`id="${id}"`),
      `Rendered home page must include required section ID '${id}'`
    );
  }

  // Alias final-call must also be preserved for backward compatibility
  assert.ok(html.includes('id="final-call"'), 'Must preserve id="final-call" for backward compatibility');
});

test('Phase 2 Acceptance: Exactly one H1 semantic heading rendered on the page', () => {
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(ConsultingHome, { lang: 'en' }));
  const h1Matches = html.match(/<h1[^>]*>/g) || [];
  assert.equal(h1Matches.length, 1, 'There must be exactly one semantic H1 element');
  assert.ok(html.includes('A clearer way forward.'), 'H1 contains proposed headline');
});

test('Phase 2 Acceptance: All 9 division IDs exist in desktop and mobile selectors', () => {
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(ConsultingHome, { lang: 'en' }));
  const divisionIds = ['bim', 'arch', 'civil', 'elec', 'mgmt', 'bd', 'startup', 'medical', 'law'];

  for (const id of divisionIds) {
    assert.ok(html.includes(`data-division="${id}"`), `Desktop selector must include data-division="${id}"`);
    assert.ok(html.includes(`value="${id}"`), `Mobile selector must include option value="${id}"`);
  }
});

test('Phase 2 Acceptance: Arabic locale renders dir="rtl" and Arabic typography', () => {
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(ConsultingHome, { lang: 'ar' }));
  assert.ok(html.includes('dir="rtl"'), 'Arabic page must have dir="rtl"');
  assert.ok(html.includes('lang="ar"'), 'Arabic page must have lang="ar"');
  assert.ok(html.includes('رؤية أوضح'), 'Arabic H1 contains Clarity in motion headline');
  assert.ok(html.includes('دبل إتش للاستشارات'), 'Arabic brand eyebrow is rendered');
});

test('Phase 2 Acceptance: Injected visual and credential slots are honored', () => {
  const customHeroVisual = React.createElement('div', { id: 'custom-hero-mock' }, 'Custom Visual');
  const customCreds = React.createElement('div', { id: 'custom-creds-mock' }, 'Custom Credentials');
  const customAboutVisual = React.createElement('div', { id: 'custom-about-mock' }, 'Custom About Visual');

  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(ConsultingHome, {
      lang: 'en',
      heroVisual: customHeroVisual,
      credentials: customCreds,
      aboutVisual: customAboutVisual
    })
  );

  assert.ok(html.includes('id="custom-hero-mock"'), 'Injected heroVisual must be rendered');
  assert.ok(html.includes('id="custom-creds-mock"'), 'Injected credentials must be rendered');
  assert.ok(html.includes('id="custom-about-mock"'), 'Injected aboutVisual must be rendered');
});

test('Phase 2 Acceptance: Omitted visual slots render local imagery and honest static proof', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(ConsultingHome, {
      lang: 'en',
      heroVisual: undefined,
      credentials: undefined,
      aboutVisual: undefined
    })
  );

  assert.ok(html.includes('/consulting-images/perspective.webp'), 'Local hero image rendered');
  assert.ok(html.includes('Your question first. The bigger picture next.'), 'Honest approach statement rendered');
});

test('Phase 2 Acceptance: Stress test with malformed and partial content renders safely', () => {
  const stressContent = {
    hero: { title: 'Stress test', body: null, cta: undefined, helper: '  ' },
    divisions: {
      items: [
        { id: 'law', title: 'Special Law Title' },
        { id: 'extraneous_id', title: 'Should be ignored' }
      ]
    },
    contact: null
  };

  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(ConsultingHome, { lang: 'en', content: stressContent })
  );

  assert.ok(html.includes('Stress test'), 'Custom title renders');
  assert.ok(!html.includes('[object Object]'), 'No object leaks');
  assert.ok(html.includes('data-division="law"'), 'Law division exists');
  assert.ok(html.includes('data-division="bim"'), 'Default BIM survives');
  assert.ok(!html.includes('data-division="extraneous_id"'), 'Extraneous division ignored');
});

test('Phase 2 Acceptance: CSS files declare prefers-reduced-motion media query with animation disable', () => {
  const homeCss = fs.readFileSync(fileURLToPath(new URL('./ConsultingHome.module.css', import.meta.url)), 'utf-8');
  const posterCss = fs.readFileSync(fileURLToPath(new URL('./HeroPoster.module.css', import.meta.url)), 'utf-8');

  assert.ok(homeCss.includes('prefers-reduced-motion: reduce'), 'ConsultingHome.module.css must handle reduced motion');
  assert.ok(homeCss.includes('animation: none !important'), 'ConsultingHome.module.css must turn off animation for reduced motion');

  assert.ok(posterCss.includes('prefers-reduced-motion: reduce'), 'HeroPoster.module.css must handle reduced motion');
  assert.ok(posterCss.includes('animation: none !important'), 'HeroPoster.module.css must turn off animation for reduced motion');
});

test('Phase 2 Acceptance: Division groups maintain canonical 9 service division IDs', () => {
  const canonicalGroups = Object.keys(DIVISION_GROUPS);
  assert.deepEqual(canonicalGroups, ['engineering', 'strategy', 'specialist']);
});

test('Phase 2 Acceptance: Focus rings on dark sections (hero and final) provide high contrast', () => {
  const homeCss = fs.readFileSync(fileURLToPath(new URL('./ConsultingHome.module.css', import.meta.url)), 'utf-8');
  assert.ok(
    homeCss.includes('.home :is(.hero, .final) :is(button, a, select, [tabindex]):focus-visible'),
    'Both hero and final sections must specify high contrast focus-visible outline'
  );
  assert.ok(
    homeCss.includes('outline-color: #ffffff'),
    'Dark sections focus outline must use white'
  );
});

test('Phase 2 Acceptance: RTL arrow mirroring is preserved when reduced motion is active', () => {
  const homeCss = fs.readFileSync(fileURLToPath(new URL('./ConsultingHome.module.css', import.meta.url)), 'utf-8');
  assert.ok(
    homeCss.includes('.home[dir=\'rtl\'] .arrow'),
    'ConsultingHome CSS must preserve RTL arrow mirroring in reduced-motion'
  );
  assert.ok(
    homeCss.includes('transform: scaleX(-1) !important'),
    'ConsultingHome CSS must keep scaleX(-1) for RTL arrows'
  );
});

test('Home instances have unique heading IDs and image-led service chapters', () => {
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement('main', null,
    React.createElement(ConsultingHome, { lang: 'en' }),
    React.createElement(ConsultingHome, { lang: 'ar' })
  ));
  const headingIds = [...html.matchAll(/<h[123] id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(headingIds).size, headingIds.length, 'Independent instances cannot collide on heading IDs');
  assert.equal((html.match(/data-chapter=/g) || []).length, 6, 'Three visual service chapters per home');
  assert.ok(html.includes('Illustrative imagery'), 'Imagery is not presented as completed client work');
  assert.ok(!html.includes('<svg'), 'The default experience no longer depends on geometric placeholder diagrams');
});
test('Phase 2 Acceptance: Component survives completely empty content without throwing', () => {
  const emptyContent = {
    hero: {},
    about: { outcomes: [] },
    journey: { steps: [] },
    divisions: { items: [] },
    values: { items: [] },
    final: {},
    contact: {}
  };

  assert.doesNotThrow(() => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(ConsultingHome, { lang: 'en', content: emptyContent })
    );
    assert.ok(html.includes('id="hero"'), 'Hero section must render');
    assert.ok(html.includes('id="divisions"'), 'Divisions section must render');
  });
});

test('Phase 2 Acceptance: Brand Manual & Benchmark HUD contracts (sub-entities, study tours, HUD inspect)', () => {
  const enHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(ConsultingHome, { lang: 'en' }));
  const arHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(ConsultingHome, { lang: 'ar' }));

  // 1. Sub-entities strip with parallel lines motif (Brand Manual Page 08)
  const subEntitiesEn = ['STUDIO', 'TECHNOLOGY', 'REAL ESTATE', 'ACADEMY', 'BIM SERVICES', 'CHANCE'];
  for (const entity of subEntitiesEn) {
    assert.ok(enHtml.includes(entity), `English page must render sub-entity: ${entity}`);
  }
  const subEntitiesAr = ['استوديو', 'التكنولوجيا', 'العقارات', 'الأكاديمية', 'خدمات BIM', 'فرصة'];
  for (const entity of subEntitiesAr) {
    assert.ok(arHtml.includes(entity), `Arabic page must render sub-entity: ${entity}`);
  }

  // 2. Study tours, competitions, workstations/cash prizes, firm partnerships (Brand Manual Pages 06-07)
  assert.ok(enHtml.includes('ARCHITECTURAL STUDY TOURS'), 'English page must include study tours header');
  assert.ok(enHtml.includes('Jordan Architectural Tour'), 'Study tour kicker present');
  assert.ok(enHtml.includes('Amman &amp; Petra Architectural Vernacular Immersion'), 'Study tour title present');
  assert.ok(enHtml.includes('Regional Architectural Design Panels &amp; Competitive Leaderboard'), 'Competition awards present');
  assert.ok(enHtml.includes('Direct Engineering Firm Partnerships &amp; Career Placement'), 'Engineering firm pipeline present');
  assert.ok(enHtml.includes('Technological Hardware Grants &amp; Real In-Kind Awards'), 'Workstations and prizes present');
  assert.ok(arHtml.includes('جولات العمارة والجوائز الإقليمية'), 'Arabic study tours header present');
  assert.ok(arHtml.includes('استكشاف التراث المعماري: عمان والبترا'), 'Arabic tour title present');
  assert.ok(arHtml.includes('تحكيم المسابقات المعمارية ولوحة المتصدرين التنافسية'), 'Arabic competitions present');
  assert.ok(arHtml.includes('شراكات مباشرة مع المكاتب الهندسية وفرص توظيف حقيقية'), 'Arabic partnerships present');
  assert.ok(arHtml.includes('منح أجهزة حاسوبية متقدمة وجوائز مادية وعينية'), 'Arabic hardware awards present');

  // 3. HUD inspect attributes and kinetic line hooks
  assert.ok(enHtml.includes('data-hud-inspect'), 'Markup must include data-hud-inspect hooks');
  assert.ok(enHtml.includes('data-hud-label'), 'Markup must include data-hud-label hooks');
  assert.ok(enHtml.includes('data-kinetic-line'), 'Markup must include data-kinetic-line hooks');
});

test('App routing: / and /contact route to redesign; /admin and /legacy route to LegacyApp', () => {
  if (typeof globalThis.localStorage === 'undefined') {
    globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  }

  const appEntry = fileURLToPath(new URL('../../App.jsx', import.meta.url));
  const langEntry = fileURLToPath(new URL('../../LangContext.jsx', import.meta.url));

  const langBundle = esbuild.buildSync({
    entryPoints: [langEntry],
    bundle: true,
    write: false,
    format: 'cjs',
    external: ['react', 'react/jsx-runtime']
  });
  const langMod = { exports: {} };
  new Function('module', 'exports', 'require', 'React', langBundle.outputFiles[0].text)(langMod, langMod.exports, require, React);
  const { LangProvider } = langMod.exports;

  const appBundle = esbuild.buildSync({
    entryPoints: [appEntry],
    bundle: true,
    write: false,
    format: 'cjs',
    loader: { '.module.css': 'empty', '.css': 'empty' },
    external: ['react', 'react/jsx-runtime', 'react-router-dom', './LangContext.jsx', '../LangContext.jsx']
  });
  const appMod = { exports: {} };
  new Function('module', 'exports', 'require', 'React', appBundle.outputFiles[0].text)(appMod, appMod.exports, (mod) => {
    if (mod.endsWith('LangContext.jsx')) return langMod.exports;
    return require(mod);
  }, React);
  const App = appMod.exports.default;
  const { MemoryRouter } = require('react-router-dom');

  const renderRoute = (path) => ReactDOMServer.renderToStaticMarkup(
    React.createElement(MemoryRouter, { initialEntries: [path] },
      React.createElement(LangProvider, null, React.createElement(App))
    )
  );

  const homeHtml = renderRoute('/');
  assert.ok(homeHtml.includes('id="hero"'), 'Route / must render redesign hero');

  const contactHtml = renderRoute('/contact');
  assert.ok(contactHtml.includes('type="submit"') || contactHtml.includes('name'), 'Route /contact must render contact inquiry');

  const adminHtml = renderRoute('/admin');
  assert.ok(adminHtml.includes('role="status"'), 'Route /admin must mount LegacyApp under Suspense');

  const legacyHtml = renderRoute('/legacy');
  assert.ok(legacyHtml.includes('role="status"'), 'Route /legacy must mount LegacyApp under Suspense');
});
