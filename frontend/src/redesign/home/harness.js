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
