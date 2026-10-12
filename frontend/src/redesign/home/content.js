import { FIXTURES } from './fixtures.js';

function text(value, fallback) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function entries(input, fallback) {
  return fallback.map((item, index) => ({
    title: text(input?.[index]?.title, item.title),
    body: text(input?.[index]?.body, item.body)
  }));
}

// IDs are the booking boundary; display copy can change independently.
export function resolveContent(content, lang) {
  const fallback = FIXTURES[lang === 'ar' ? 'ar' : 'en'];
  const incoming = Array.isArray(content?.divisions?.items) ? content.divisions.items : [];
  return {
    hero: Object.fromEntries(Object.entries(fallback.hero).map(([key, value]) => [key, text(content?.hero?.[key], value)])),
    about: {
      title: text(content?.about?.title, fallback.about.title),
      body: text(content?.about?.body, fallback.about.body),
      outcomes: entries(content?.about?.outcomes, fallback.about.outcomes)
    },
    journey: {
      title: text(content?.journey?.title, fallback.journey.title),
      steps: entries(content?.journey?.steps, fallback.journey.steps)
    },
    divisions: {
      title: text(content?.divisions?.title, fallback.divisions.title),
      items: fallback.divisions.items.map(item => {
        const supplied = incoming.find(candidate => candidate?.id === item.id);
        return {
          ...item,
          title: text(supplied?.title, item.title),
          body: text(supplied?.body, item.body)
        };
      })
    },
    values: {
      title: text(content?.values?.title, fallback.values.title),
      items: entries(content?.values?.items, fallback.values.items)
    },
    final: {
      title: text(content?.final?.title, fallback.final.title),
      body: text(content?.final?.body, fallback.final.body)
    },
    contact: {
      title: text(content?.contact?.title, fallback.contact.title),
      body: text(content?.contact?.body, fallback.contact.body),
      directBody: text(content?.contact?.directBody, fallback.contact.directBody),
      action: text(content?.contact?.action, fallback.contact.action),
      href: text(content?.contact?.href, fallback.contact.href),
      offices: text(content?.contact?.offices, fallback.contact.offices)
    }
  };
}
