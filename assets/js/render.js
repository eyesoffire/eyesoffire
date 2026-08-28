const Renderer = {
    root: document.getElementById('app-root'),
    modal: document.getElementById('retailer-modal'),
    retailerLinksContainer: document.getElementById('retailer-links'),

    init() {
        const closeBtn = document.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }

        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
    },

    showModal(retailers) {
        if (!this.modal || !this.retailerLinksContainer) return;

        this.retailerLinksContainer.innerHTML = '';

        if (retailers && retailers.length > 0) {
            retailers.forEach(r => {
                const a = document.createElement('a');
                a.href = r.url;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                a.className = "retailer-btn";
                a.textContent = r.name;
                this.retailerLinksContainer.appendChild(a);
            });
        } else {
            this.retailerLinksContainer.innerHTML = '<p>Not currently available for purchase.</p>';
        }

        this.modal.classList.remove('hidden');
    },

    hideModal() {
        if (this.modal) this.modal.classList.add('hidden');
    },

    renderHome(data) {
        const book1 = data.books[0];

        let html = `
            <div class="hero-spotlight grid-2-col">
                <div>
                    <h2 class="hero-tagline">${book1.tagline}</h2>
                    <h1>${book1.title}</h1>
                    <p>${book1.blurb.substring(0, 150)}...</p>
                    <div style="margin-top: 20px;">
                        <button class="btn" onclick="window.Renderer.showModal(${JSON.stringify(book1.retailers).replace(/"/g, '&quot;')})">Buy Book</button>
                        <a href="#/read/${book1.slug}" class="btn btn-secondary" style="margin-left: 10px;">Read Excerpt</a>
                    </div>
                    <div style="margin-top: 20px;">
                        ${book1.bookbub ? `<a href="${book1.bookbub}" target="_blank" class="pill-link">Add to BookBub</a>` : ''}
                        ${book1.goodreads ? `<a href="${book1.goodreads}" target="_blank" class="pill-link">Add to Goodreads</a>` : ''}
                    </div>
                </div>
                <div>
                    <a href="#/book/${book1.slug}">
                        <img src="${book1.cover}" alt="${book1.title} Cover" class="book-cover">
                    </a>
                </div>
            </div>

            <section class="card glassmorphism" style="margin-bottom: 40px;">
                <h2>Series Lore</h2>
                <p style="font-size: 1.1rem; font-style: italic;">${data.series.lore}</p>
            </section>

            <h2>Reading Order</h2>
            <div class="grid-2-col" style="margin-top: 20px;">
        `;

        data.books.forEach(b => {
            html += `
                <div class="card glassmorphism">
                    <h3>${b.title}</h3>
                    <p class="hero-tagline" style="font-size: 0.9rem;">${b.status}</p>
                    <a href="#/book/${b.slug}" class="btn btn-secondary" style="margin-top: 15px; display: inline-block;">View Details</a>
                </div>
            `;
        });

        html += `</div>`;
        this.root.innerHTML = html;
        window.scrollTo(0,0);
    },

    renderBook(book, seriesData) {
        let retailersHtml = '';
        if (book.retailers && book.retailers.length > 0) {
            book.retailers.forEach(r => {
                retailersHtml += `<a href="${r.url}" target="_blank" class="retailer-btn">${r.name}</a>`;
            });
        } else {
            retailersHtml = '<p>Pre-order coming soon.</p>';
        }

        let html = `
            <div class="grid-2-col" style="margin-bottom: 40px;">
                <div>
                    <img src="${book.cover}" alt="${book.title} Cover" class="book-cover">
                </div>
                <div class="card glassmorphism">
                    <h2 class="hero-tagline">${book.chronology}</h2>
                    <h1>${book.title}</h1>
                    <ul style="list-style: none; margin: 20px 0; color: var(--text-secondary);">
                        <li><strong>Status:</strong> ${book.status}</li>
                        <li><strong>Format:</strong> ${book.format || 'TBD'}</li>
                        <li><strong>Pages:</strong> ${book.pageCount || 'TBD'}</li>
                        <li><strong>ISBN:</strong> ${book.isbn || 'TBD'}</li>
                        <li><strong>Release:</strong> ${book.releaseDate || 'TBD'}</li>
                    </ul>
                    <h3>Get the Book</h3>
                    <div class="retailer-grid" style="margin-bottom: 20px;">
                        ${retailersHtml}
                    </div>
                    ${book.excerpts && book.excerpts.length > 0 ? `<a href="#/read/${book.slug}" class="btn">Read Excerpt</a>` : ''}
                </div>
            </div>

            <div class="card glassmorphism">
                <h2>Synopsis</h2>
                <div style="margin-top: 20px; font-size: 1.1rem; line-height: 1.8;">
                    ${book.blurb}
                </div>
            </div>
        `;
        this.root.innerHTML = html;
        window.scrollTo(0,0);
    },

    renderRead(book) {
        if (!book.excerpts || book.excerpts.length === 0) {
            this.root.innerHTML = `<div class="card glassmorphism"><h2>No excerpts available for this book.</h2><a href="#/book/${book.slug}" class="btn">Back to Book</a></div>`;
            return;
        }

        let excerptsHtml = '';
        book.excerpts.forEach(ex => {
            excerptsHtml += `
                <h3 style="margin-top: 30px; margin-bottom: 15px;">${ex.title}</h3>
                <div>${ex.content}</div>
            `;
        });

        const html = `
            <div class="reader-container" id="reader-box">
                <div class="reader-controls">
                    <button onclick="document.getElementById('reader-box').style.fontSize='1rem'">A-</button>
                    <button onclick="document.getElementById('reader-box').style.fontSize='1.5rem'">A+</button>
                    <button onclick="document.getElementById('reader-box').classList.toggle('dark-mode')">🌓</button>
                    <a href="#/book/${book.slug}" style="margin-left: 15px; color: inherit; text-decoration: underline;">Exit</a>
                </div>
                <div class="reader-header">
                    <h2>${book.title}</h2>
                    <p style="font-style: italic;">Excerpt</p>
                </div>
                ${excerptsHtml}

                <div class="sticky-buy-bar glassmorphism">
                    <h3>End of Excerpt</h3>
                    <p style="margin-bottom: 15px;">Enjoyed the sample? Get the full copy today.</p>
                    <button class="btn" onclick="window.Renderer.showModal(${JSON.stringify(book.retailers).replace(/"/g, '&quot;')})">Buy Now</button>
                </div>
            </div>
        `;
        this.root.innerHTML = html;
        window.scrollTo(0,0);
    }
};

window.Renderer = Renderer;