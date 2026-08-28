window.Renderer = {
    renderHome(data) {
        const container = document.getElementById('app-container');
        const book1 = data.books.find(b => b.volume === 1);

        let html = '';

        // Hero Spotlight
        if (book1) {
            html += `
                <section class="hero-spotlight">
                    <div class="hero-content">
                        <h1>${book1.title}</h1>
                        <p class="hero-tagline">${book1.tagline}</p>
                        <p>${book1.blurb}</p>
                        <div class="action-pills">
                            <a href="#/book/${book1.slug}" class="btn btn-primary" style="background-color: #c0392b; color: white;">Buy Now</a>
                            <span style="color: white; margin: 0 10px; align-self: center;">or</span>
                            <a href="#/read/${book1.slug}" class="btn btn-secondary">Learn More</a>
                        </div>
                    </div>
                    <div class="hero-cover">
                        <img src="${book1.cover}" alt="${book1.title} Cover">
                    </div>
                </section>
            `;
        }

        // Series Lore
        html += `
            <section class="series-lore">
                <h2>The World of ${data.series.title}</h2>
                <p>${data.series.lore}</p>
            </section>
        `;

        // Books Grid
        html += `
            <h2>Series Reading Order</h2>
            <div class="grid-auto">
                ${data.books.sort((a, b) => a.volume - b.volume).map(book => `
                    <div class="book-card">
                        <div class="book-card-cover">
                            <img src="${book.cover}" alt="${book.title}">
                        </div>
                        <div class="book-card-content">
                            <h3 class="book-card-title">Vol ${book.volume}: ${book.title}</h3>
                            <span class="book-card-status">${book.status}</span>
                            <a href="#/book/${book.slug}" class="book-card-btn">View Details</a>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = html;
    },

    renderBook(book, series) {
        const container = document.getElementById('app-container');

        let retailerHtml = '';
        if (book.retailers && book.retailers.length > 0) {
            retailerHtml = `
                <div class="retailer-list">
                    ${book.retailers.map(r => `<a href="${r.url}" target="_blank" class="retailer-pill">${r.name}</a>`).join('')}
                </div>
            `;
        } else {
            retailerHtml = '<p>Coming Soon</p>';
        }

        let accordionHtml = '';
        if (book.excerpts && book.excerpts.length > 0) {
            accordionHtml = `
                <div style="margin-top: 1rem;">
                    <a href="#/read/${book.slug}" class="btn btn-primary">Read Sample Chapters</a>
                </div>
                <div class="accordion">
                    ${book.excerpts.map((excerpt, index) => `
                        <div class="accordion-item">
                            <button class="accordion-header" onclick="Renderer.toggleAccordion(this)">
                                ${excerpt.title} <span>+</span>
                            </button>
                            <div class="accordion-content">
                                <div class="excerpt-text">${excerpt.content}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        const html = `
            <div class="grid-2">
                <div>
                    <img src="${book.cover}" alt="${book.title}" style="border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                </div>
                <div>
                    <h1>${book.title}</h1>
                    <p style="color: var(--accent); margin-bottom: 1rem;">${series.title} - Volume ${book.volume}</p>

                    <div style="background: var(--card-bg); padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem; font-size: 0.9rem;">
                        <p><strong>Release Date:</strong> ${book.releaseDate}</p>
                        <p><strong>ISBN:</strong> ${book.isbn}</p>
                        <p><strong>Pages:</strong> ${book.pageCount}</p>
                    </div>

                    <p style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 1.5rem;">${book.blurb}</p>

                    <h3>Get It Now</h3>
                    ${retailerHtml}

                    <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                        ${book.goodreads ? `<a href="${book.goodreads}" target="_blank" class="btn btn-secondary">Goodreads</a>` : ''}
                        ${book.bookbub ? `<a href="${book.bookbub}" target="_blank" class="btn btn-secondary">BookBub</a>` : ''}
                    </div>

                    ${accordionHtml}
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    toggleAccordion(btn) {
        const content = btn.nextElementSibling;
        const icon = btn.querySelector('span');

        if (content.classList.contains('active')) {
            content.classList.remove('active');
            icon.textContent = '+';
        } else {
            // Close others
            document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.accordion-header span').forEach(s => s.textContent = '+');

            content.classList.add('active');
            icon.textContent = '-';
        }
    },

    renderReader(book) {
        const container = document.getElementById('app-container');

        let excerptsHtml = '';
        if (book.excerpts && book.excerpts.length > 0) {
            excerptsHtml = book.excerpts.map(excerpt => `
                <h2>${excerpt.title}</h2>
                <div class="excerpt-body">${excerpt.content}</div>
                <hr style="margin: 2rem 0; border: 0; border-top: 1px solid #555;">
            `).join('');
        } else {
            excerptsHtml = '<p>No samples available for this book.</p>';
        }

        const html = `
            <div id="reader-modal" class="reader-modal">
                <div class="reader-header">
                    <h2>Reading: ${book.title}</h2>
                    <div class="reader-controls">
                        <button onclick="Renderer.changeFontSize(-1)">A-</button>
                        <button onclick="Renderer.changeFontSize(1)">A+</button>
                        <button onclick="Renderer.toggleTheme()">🌓 Theme</button>
                        <a href="#/book/${book.slug}" class="btn btn-secondary" style="padding: 0.5rem 1rem;">Close</a>
                    </div>
                </div>
                <div class="reader-content" id="reader-content">
                    ${excerptsHtml}

                    <div class="reader-purchase-banner">
                        <h3>Enjoyed the sample?</h3>
                        <p>Get the full book now.</p>
                        <div class="action-pills" style="justify-content: center;">
                            ${book.retailers ? book.retailers.map(r => `<a href="${r.url}" target="_blank" class="retailer-pill">${r.name}</a>`).join('') : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // initialize default font size state
        this.currentFontSize = 1.2;
    },

    changeFontSize(delta) {
        this.currentFontSize += (delta * 0.1);
        if (this.currentFontSize < 0.8) this.currentFontSize = 0.8;
        if (this.currentFontSize > 2.5) this.currentFontSize = 2.5;

        const content = document.getElementById('reader-content');
        if (content) {
            content.style.fontSize = `${this.currentFontSize}rem`;
        }
    },

    toggleTheme() {
        const modal = document.getElementById('reader-modal');
        if (modal) {
            modal.classList.toggle('light-mode');
        }
    }
};