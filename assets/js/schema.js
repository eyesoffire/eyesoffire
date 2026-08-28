/*
 * Generic JSON-LD engine.
 * ALL structured data is stored in data/schema.json.
 * Edit that one file manually; no JSON-LD is hardcoded in JavaScript.
 */

const SCHEMA_SELECTOR = 'script[data-eyes-schema]';
let SCHEMA_DATA = null;

export function setSchemaData(data) { SCHEMA_DATA = data || {}; }

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function removeEmpty(value) {
  if (Array.isArray(value)) return value.map(removeEmpty).filter(v => v !== undefined && v !== null && v !== '');
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      const cleaned = removeEmpty(val);
      if (cleaned !== undefined && cleaned !== null && cleaned !== '') out[key] = cleaned;
    }
    return out;
  }
  return value;
}

function interpolate(value, context) {
  if (typeof value === 'string') {
    const exact = value.match(/^\{\{\s*([^}]+?)\s*\}\}$/);
    const resolve = path => path.split('.').reduce((current, part) => current?.[part], context);
    if (exact) return clone(resolve(exact[1]));
    return value.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, path) => {
      const current = resolve(path);
      return current == null ? '' : String(current);
    });
  }
  if (Array.isArray(value)) return value.map(v => interpolate(v, context));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, interpolate(v, context)]));
  return value;
}

function asList(value) { return !value ? [] : Array.isArray(value) ? value : [value]; }

export function getRouteSchema(route = {}) {
  if (!SCHEMA_DATA) return null;
  if (route.kind === 'home') return SCHEMA_DATA.routes?.home || null;
  if (route.kind === 'book') return SCHEMA_DATA.routes?.books?.[route.slug] || null;
  if (route.kind === 'page') return SCHEMA_DATA.routes?.pages?.[route.slug] || null;
  if (route.kind === 'read') return SCHEMA_DATA.routes?.books?.[route.slug] || null;
  return null;
}

export function updateSchema({ series, book, page, site, route }) {
  document.querySelectorAll(SCHEMA_SELECTOR).forEach(node => node.remove());
  const globalSchemas = asList(SCHEMA_DATA?.global);
  const routeSchemas = asList(getRouteSchema(route));
  const allSchemas = [...globalSchemas, ...routeSchemas];
  if (!allSchemas.length) return;
  const context = { site, series, book, page, route };
  const payloads = allSchemas.map(item => removeEmpty(interpolate(clone(item), context)));
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.dataset.eyesSchema = 'true';
  script.textContent = JSON.stringify(payloads.length === 1 ? payloads[0] : payloads, null, 2);
  document.head.appendChild(script);
}
