import { updateSchema } from './schema.js';
import { setAudio } from './audio.js';

let DATA = null;

export function setData(data) {
  DATA = data;
  populateJump();
}

export function getData() { return DATA; }

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
}

function link(url, label, className = 'btn secondary') {
  if (!url) return '';
  return `<a class="${className}" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`;
}

function cover(book, cls = '') {
  if (!book?.cover) return `<div class="missing-cover">${esc(book?.number ? `Volume ${book.number}` : 'Cover')}<br>${esc(book?.status || '')}</div>`;
  return `<img class="${cls}" src="${esc(book.cover)}" data-fallback="${esc(book.coverRemote || '')}" alt="${esc(book.title)} book cover" onerror="if(this.dataset.fallback){this.src=this.dataset.fallback;this.dataset.fallback='';}else{this.remove()}">`;
}

function buttons(book) {
  return `<div class="cta-row">
    <a class="btn primary" href="#/book/${esc(book.slug)}">Explore Book</a>
    <button class="btn secondary" data-buy="${esc(book.slug)}">Buy Book</button>
    ${book.excerpt ? `<a class="btn secondary" href="#/read/${esc(book.slug)}">Read Excerpt</a>` : ''}
  </div>`;
}

function populateJump() {
  const select = document.querySelector('#jumpBook');
  if (!select || !DATA) return;
  select.innerHTML = DATA.books.map(book => `<option value="${esc(book.slug)}">Book ${esc(book.number)} — ${esc(book.title)}</option>`).join('');
  select.onchange = () => { if (select.value) location.hash = `#/book/${select.value}`; };
}


function applyHead(meta = {}, title = 'Eyes of Fire') {
  document.title = meta.title || title;
  const description = meta.description || DATA?.series?.description || '';
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) { tag = document.createElement('meta'); tag.name = 'description'; document.head.appendChild(tag); }
  tag.content = description;

  if (meta.ogTitle) document.querySelector('meta[property="og:title"]')?.setAttribute('content', meta.ogTitle);
  if (meta.ogDescription) document.querySelector('meta[property="og:description"]')?.setAttribute('content', meta.ogDescription);
  if (meta.ogImage) document.querySelector('meta[property="og:image"]')?.setAttribute('content', meta.ogImage);
}

function renderBlocks(blocks = []) {
  return blocks.map(block => {
    const type = block.type || 'text';
    if (type === 'hero') return `<section class="hero page-hero"><div class="hero-copy"><span class="eyebrow">${esc(block.eyebrow || '')}</span><h1>${esc(block.title || '')}</h1><p class="subtitle">${esc(block.subtitle || '')}</p><p class="hero-description">${esc(block.text || '')}</p>${renderActions(block.actions)}</div>${block.image ? `<div class="hero-panel"><div class="cover-stage"><div class="cover-frame"><img src="${esc(block.image)}" alt="${esc(block.imageAlt || block.title || '')}"></div></div></div>` : ''}</section>`;
    if (type === 'heading') return `<section class="section"><div class="section-heading"><div><span class="eyebrow">${esc(block.eyebrow || '')}</span><h2>${esc(block.title || '')}</h2></div>${block.text ? `<p>${esc(block.text)}</p>` : ''}</div></section>`;
    if (type === 'text') return `<section class="section"><div class="prose-card"><span class="eyebrow">${esc(block.eyebrow || '')}</span>${block.title ? `<h2>${esc(block.title)}</h2>` : ''}${paragraphs(block.text || block.content)}</div></section>`;
    if (type === 'quote') return `<section class="section"><blockquote class="feature-quote">${esc(block.text || '')}${block.credit ? `<cite>— ${esc(block.credit)}</cite>` : ''}</blockquote></section>`;
    if (type === 'cards') return `<section class="section"><div class="section-heading"><div><span class="eyebrow">${esc(block.eyebrow || '')}</span><h2>${esc(block.title || '')}</h2></div></div><div class="book-grid generic-cards">${(block.items || []).map(item => `<article class="book-card"><div class="book-card-body"><span class="status">${esc(item.label || '')}</span><h3>${esc(item.title || '')}</h3><p>${esc(item.text || '')}</p>${renderActions(item.actions)}</div></article>`).join('')}</div></section>`;
    if (type === 'image') return `<section class="section image-section"><img src="${esc(block.src || '')}" alt="${esc(block.alt || '')}">${block.caption ? `<p class="image-caption">${esc(block.caption)}</p>` : ''}</section>`;
    return `<section class="section"><div class="prose-card">${paragraphs(block.content || block.text || '')}</div></section>`;
  }).join('');
}

function paragraphs(text = '') {
  return String(text).split(/\n\n+/).filter(Boolean).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
}

function renderActions(actions = []) {
  if (!Array.isArray(actions)) return '';
  return `<div class="cta-row">${actions.map(action => {
    if (action.route) return `<a class="btn ${esc(action.style || 'secondary')}" href="${esc(action.route)}">${esc(action.label)}</a>`;
    return link(action.url, action.label, action.style || 'secondary');
  }).join('')}</div>`;
}

export function renderHome() {
  const { series, books } = DATA;
  const book = books[0];
  document.querySelector('#app').innerHTML = `
<section class="hero"><div class="hero-copy"><span class="eyebrow">${esc(series.title)} · Book ${esc(book.number)}</span><h1>${esc(book.title)}</h1><p class="subtitle">${esc(book.subtitle)}</p><p class="tagline">${esc(book.tagline)}</p><p class="hero-description">${esc(book.synopsis)}</p>${buttons(book)}</div><div class="hero-panel"><div class="cover-stage"><div class="cover-frame">${cover(book)}</div></div></div></section>
<section class="section"><div class="section-heading"><div><span class="eyebrow">Browse the series</span><h2>Choose your way in.</h2></div><p>Follow the story in order, open a book directly, or step into a sample without leaving the site.</p></div><div class="browse"><span class="pill active">Series</span>${(series.genres || []).map(g => `<span class="pill">${esc(g)}</span>`).join('')}</div></section>
<section class="section"><div class="section-heading"><div><span class="eyebrow">Reading order</span><h2>The series</h2></div></div><div class="book-grid">${books.map(bookCard).join('')}</div></section>
<section class="section"><div class="section-heading"><div><span class="eyebrow">The world</span><h2>A legend split by time.</h2></div></div><div class="lore-grid"><article class="lore-card"><h3>THE FRACTURE</h3><p>${esc(series.lore || '')}</p></article><article class="lore-card"><h3>THE WOMAN WITH THE EYES OF FIRE</h3><p>${esc(series.world || '')}</p></article></div></section>`;
  wireBuy();
  applyHead(series.seo, series.title);
  updateSchema({ series, book, site: DATA.site, route: { kind: 'home', path: '#/' } });
  setAudio(book);
}

function bookCard(book) {
  return `<article class="book-card"><div class="book-card-cover">${cover(book)}</div><div class="book-card-body"><span class="status ${book.status !== 'Available Now' ? 'future' : ''}">${esc(book.status)}</span><h3>Book ${esc(book.number)}: ${esc(book.title)}</h3><p>${esc(book.tagline || '')}</p><a class="btn secondary" href="#/book/${esc(book.slug)}">View book</a></div></article>`;
}

export function renderBook(book) {
  const { series } = DATA;
  document.querySelector('#app').innerHTML = `<section class="section"><a class="eyebrow" href="#/">← Back to series</a><div class="detail-grid" style="margin-top:24px"><div class="cover-stage"><div class="cover-frame">${cover(book)}</div></div><div class="detail-copy"><span class="status ${book.status !== 'Available Now' ? 'future' : ''}">${esc(book.status)}</span><h1>${esc(book.title)}</h1><h2>${esc(book.subtitle || '')}</h2><p>${esc(book.synopsis || '')}</p><div class="spec-grid"><div class="spec"><small>Format</small><strong>${esc(book.format || 'TBA')}</strong></div><div class="spec"><small>ISBN</small><strong>${esc(book.isbn || 'TBA')}</strong></div><div class="spec"><small>Pages</small><strong>${esc(book.pages || 'TBA')}</strong></div><div class="spec"><small>Series</small><strong>Book ${esc(book.number)} of ${esc(DATA.books.length)}</strong></div></div>${buttons(book)}</div></div></section>
<section class="section"><div class="section-heading"><div><span class="eyebrow">Purchase</span><h2>Choose a retailer.</h2></div></div><div class="retailer-grid">${(book.retailers || []).map(r => `<a class="retailer" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.name)}</a>`).join('') || '<p>No retailer links yet.</p>'}</div></section>
${book.excerpt ? `<section class="section"><div class="section-heading"><div><span class="eyebrow">Sample</span><h2>${esc(book.excerptTitle || 'Excerpt')}</h2></div></div><div class="reader-card">${paragraphs(book.excerpt.split('\n\n').slice(0,4).join('\n\n'))}<div class="cta-row"><a class="btn primary" href="#/read/${esc(book.slug)}">Open full sample reader</a></div></div></section>` : ''}`;
  wireBuy();
  applyHead(book.seo, `${book.title} — ${series.title}`);
  updateSchema({ series, book, site: DATA.site, route: { kind: 'book', slug: book.slug, path: `#/book/${book.slug}` } });
  setAudio(book);
}

export function renderPage(page) {
  const { series } = DATA;
  document.querySelector('#app').innerHTML = `<div class="page-wrap">${renderBlocks(page.blocks || [])}</div>`;
  applyHead(page.seo, `${page.title} — ${series.title}`);
  updateSchema({ series, page, site: DATA.site, route: { kind: 'page', slug: page.slug, path: `#/page/${page.slug}` } });
  setAudio(null);
}

export function renderReader(book) {
  const { series } = DATA;
  document.querySelector('#app').innerHTML = `<section class="section"><a class="eyebrow" href="#/book/${esc(book.slug)}">← Back to book</a><div class="detail-grid" style="margin-top:24px"><div class="cover-stage"><div class="cover-frame">${cover(book)}</div></div><div class="detail-copy"><span class="status">Excerpt</span><h1>${esc(book.title)}</h1><h2>${esc(book.excerptTitle || 'Excerpt')}</h2></div></div></section>
<section class="section"><div class="reader-card" style="margin-top:24px;">${paragraphs(book.excerpt)}<div class="cta-row"><button class="btn secondary" data-buy="${esc(book.slug)}">Buy Book</button></div></div></section>`;
  wireBuy();
  applyHead(book.seo, `Read Excerpt: ${book.title} — ${series.title}`);
  updateSchema({ series, book, site: DATA.site, route: { kind: 'read', slug: book.slug, path: `#/read/${book.slug}` } });
  setAudio(book);
}


function wireBuy() {
  document.querySelectorAll('[data-buy]').forEach(button => {
    button.onclick = () => openBuy(DATA.books.find(book => book.slug === button.dataset.buy));
  });
}

function openBuy(book) {
  if (!book) return;
  const root = document.querySelector('#modalRoot');
  root.innerHTML = `<div class="buy-modal"><div class="buy-modal-card"><div class="buy-modal-head"><div><span class="eyebrow">Buy Book ${esc(book.number)}</span><h2>${esc(book.title)}</h2><p>Choose a direct retailer.</p></div><button class="close" id="closeBuy">×</button></div><div class="modal-retailers">${(book.retailers || []).map(r => `<a href="${esc(r.url)}" target="_blank" rel="noopener"><strong>${esc(r.name)}</strong><small>Open retailer</small></a>`).join('') || '<p>No retailer links yet.</p>'}</div></div></div>`;
  document.querySelector('#closeBuy').onclick = () => root.innerHTML = '';
}

export function updatePageTitle(kind, item) {
  document.title = kind === 'home' ? (DATA.series.seo?.title || DATA.series.title) : `${item.title} — ${DATA.series.title}`;
}
