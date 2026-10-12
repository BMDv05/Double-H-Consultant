import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveContent } from './content.js';

test('partial and foreign division data cannot change the frozen booking IDs or groups', () => {
  const supplied = Object.freeze({ divisions: Object.freeze({ items: Object.freeze([
    Object.freeze({ id: 'law', group: 'engineering', title: 'Custom legal title' }),
    Object.freeze({ id: 'unrecognised', group: 'strategy', title: 'Unknown' }),
  ]) }) });
  const result = resolveContent(supplied, 'en');
  assert.deepEqual(result.divisions.items.map(item => item.id), ['bim', 'arch', 'civil', 'elec', 'mgmt', 'bd', 'startup', 'medical', 'law']);
  assert.equal(result.divisions.items.at(-1).group, 'specialist');
  assert.equal(result.divisions.items.at(-1).title, 'Custom legal title');
});

test('missing content and incomplete lists keep the complete Arabic journey', () => {
  const result = resolveContent({ journey: { steps: [{ title: 'عنوان مخصص' }] }, about: { outcomes: [] }, values: { items: null } }, 'ar');
  assert.equal(result.journey.steps.length, 3);
  assert.equal(result.journey.steps[0].title, 'عنوان مخصص');
  assert.match(result.journey.steps[1].body, /[\u0600-\u06ff]/);
  assert.equal(result.about.outcomes.length, 3);
  assert.equal(result.values.items.length, 4);
  assert.equal(resolveContent(null, 'ar').divisions.items.length, 9);
});

test('malformed copy falls back to readable text without leaking object values', () => {
  const result = resolveContent({ hero: { title: {}, body: 42, helper: '  ' }, divisions: { items: {} } }, 'en');
  assert.equal(typeof result.hero.title, 'string');
  assert.equal(result.hero.title.includes('[object'), false);
  assert.ok(result.hero.body.length > 0);
  assert.ok(result.hero.helper.trim().length > 0);
  assert.equal(result.divisions.items.length, 9);
});

test('Clarity in motion headline fixtures resolve with valid strings in EN and AR', () => {
  const en = resolveContent(null, 'en');
  const ar = resolveContent(null, 'ar');
  assert.equal(en.hero.title, 'A clearer way forward.');
  assert.match(ar.hero.title, /رؤية أوضح/);
  assert.equal(en.divisions.items.length, 9);
  assert.equal(ar.divisions.items.length, 9);
  assert.deepEqual(en.divisions.items.map(d => d.id), ar.divisions.items.map(d => d.id));
});

test('contact section resolves with valid strings and handles null/partial inputs gracefully', () => {
  const defEn = resolveContent(null, 'en');
  assert.ok(defEn.contact);
  assert.ok(defEn.contact.title.length > 0);
  assert.ok(defEn.contact.body.length > 0);
  assert.ok(defEn.contact.directBody.length > 0);
  assert.equal(defEn.contact.href, '#/contact');

  const custom = resolveContent({ contact: { title: 'Custom contact', body: null, directBody: 'Custom direct', href: '/custom-contact' } }, 'ar');
  assert.equal(custom.contact.title, 'Custom contact');
  assert.match(custom.contact.body, /[\u0600-\u06ff]/);
  assert.equal(custom.contact.directBody, 'Custom direct');
  assert.equal(custom.contact.href, '/custom-contact');
});
