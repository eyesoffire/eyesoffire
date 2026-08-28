import { setData, getData, renderHome, renderBook, renderPage, renderReader } from './render.js';
import { setSchemaData } from './schema.js';
import { initAudio } from './audio.js';

const DATA_URL = 'data/series.json';

async function boot() {
  const [dataResponse, schemaResponse] = await Promise.all([
    fetch(DATA_URL, { cache: 'no-cache' }),
    fetch('data/schema.json', { cache: 'no-cache' })
  ]);
  if (!dataResponse.ok) throw new Error(`Could not load ${DATA_URL} (${dataResponse.status})`);
  if (!schemaResponse.ok) throw new Error(`Could not load data/schema.json (${schemaResponse.status})`);
  const [data, schemaData] = await Promise.all([dataResponse.json(), schemaResponse.json()]);
  setData(data);
  setSchemaData(schemaData);
  initAudio();
  route();
  window.addEventListener('hashchange', route);
}

function parse() {
  const raw = location.hash.replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean);
  if (!parts.length) return { kind: 'home' };
  if (parts[0] === 'book' && parts[1]) return { kind: 'book', slug: parts[1] };
  if (parts[0] === 'read' && parts[1]) return { kind: 'read', slug: parts[1] };
  if (parts[0] === 'page' && parts[1]) return { kind: 'page', slug: parts[1] };
  return { kind: 'home' };
}

function route() {
  const routeInfo = parse();
  const data = getData();
  if (!data) return;

  const book = data.books.find(item => item.slug === routeInfo.slug);
  const page = (data.pages || []).find(item => item.slug === routeInfo.slug);

  if (routeInfo.kind === 'home') {
    renderHome();
  } else if (routeInfo.kind === 'book' && book) {
    renderBook(book);
  } else if (routeInfo.kind === 'read' && book && book.excerpt) {
    renderBook(book);
    renderReader(book);
  } else if (routeInfo.kind === 'page' && page) {
    renderPage(page);
  } else {
    location.hash = '#/';
    return;
  }

  document.querySelector('#app')?.focus({ preventScroll: true });
}

boot().catch(error => {
  document.querySelector('#app').innerHTML = `<div class="section"><h1>Eyes of Fire</h1><p>Unable to load the series manifest.</p><pre>${String(error.message || error)}</pre></div>`;
});
