class Router {
    constructor() {
        this.routes = {
            '/': this.renderHome.bind(this),
            '/book/:slug': this.renderBook.bind(this),
            '/read/:slug': this.renderRead.bind(this)
        };

        window.addEventListener('hashchange', this.handleRouteChange.bind(this));

        // Initial load
        this.loadData().then(() => {
            this.handleRouteChange();
            this.populateSeriesSelector();
            if (window.AudioPlayer) {
                window.AudioPlayer.init();
            }
        });
    }

    async loadData() {
        try {
            const response = await fetch('data/series.json');
            this.data = await response.json();

            // Set author website link
            const authorLink = document.getElementById('author-website');
            if (authorLink && this.data.series.authorWebsite) {
                authorLink.href = this.data.series.authorWebsite;
            }
        } catch (error) {
            console.error('Failed to load series data:', error);
            document.getElementById('app-container').innerHTML = '<p>Error loading content.</p>';
        }
    }

    populateSeriesSelector() {
        const select = document.getElementById('series-selector');
        this.data.books.forEach(book => {
            const option = document.createElement('option');
            option.value = `#/book/${book.slug}`;
            option.textContent = `Book ${book.volume}: ${book.title}`;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            if (e.target.value) {
                window.location.hash = e.target.value;
                e.target.value = ''; // Reset select
            }
        });
    }

    handleRouteChange() {
        const path = window.location.hash.slice(1) || '/';
        const appContainer = document.getElementById('app-container');
        appContainer.innerHTML = '<div class="loader">Loading...</div>';

        // Scroll to top
        window.scrollTo(0, 0);

        let matched = false;

        for (const [route, handler] of Object.entries(this.routes)) {
            const params = this.matchRoute(route, path);
            if (params) {
                handler(params);
                matched = true;
                break;
            }
        }

        if (!matched) {
            appContainer.innerHTML = '<h2>404 - Not Found</h2>';
        }
    }

    matchRoute(routeTemplate, currentPath) {
        if (routeTemplate === currentPath) return {};

        const templateParts = routeTemplate.split('/');
        const currentParts = currentPath.split('/');

        if (templateParts.length !== currentParts.length) return null;

        const params = {};
        for (let i = 0; i < templateParts.length; i++) {
            if (templateParts[i].startsWith(':')) {
                const paramName = templateParts[i].slice(1);
                params[paramName] = currentParts[i];
            } else if (templateParts[i] !== currentParts[i]) {
                return null;
            }
        }
        return params;
    }

    renderHome() {
        if (window.Renderer) {
            window.Renderer.renderHome(this.data);
            if (window.SchemaGenerator) {
                window.SchemaGenerator.generateSeriesSchema(this.data);
            }
        }
    }

    renderBook(params) {
        const book = this.data.books.find(b => b.slug === params.slug);
        if (book && window.Renderer) {
            window.Renderer.renderBook(book, this.data.series);
            if (window.SchemaGenerator) {
                window.SchemaGenerator.generateBookSchema(book, this.data.series);
            }
            if (window.AudioPlayer) {
                window.AudioPlayer.updateTrack(book.audio);
            }
        } else {
            document.getElementById('app-container').innerHTML = '<h2>Book Not Found</h2>';
        }
    }

    renderRead(params) {
        const book = this.data.books.find(b => b.slug === params.slug);
        if (book && window.Renderer) {
            window.Renderer.renderReader(book);
        } else {
            document.getElementById('app-container').innerHTML = '<h2>Book Not Found</h2>';
        }
    }
}

// Initialize router when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.appRouter = new Router();
});