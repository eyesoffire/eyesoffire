class Router {
    constructor() {
        this.routes = {
            '/': this.routeHome.bind(this),
            '/book/:slug': this.routeBook.bind(this),
            '/read/:slug': this.routeRead.bind(this)
        };

        window.addEventListener('hashchange', this.handleRoute.bind(this));
    }

    async init() {
        try {
            const response = await fetch('data/series.json');
            this.data = await response.json();

            this.populateNav();

            if (window.AudioController) window.AudioController.init();
            if (window.Renderer) window.Renderer.init();

            this.handleRoute();
        } catch (e) {
            console.error("Failed to initialize:", e);
            document.getElementById('app-root').innerHTML = '<h2 style="text-align:center;">Failed to load content.</h2>';
        }
    }

    populateNav() {
        const select = document.getElementById('jump-to-book');
        const authorLink = document.getElementById('author-link');

        if (authorLink && this.data.series.authorWebsite) {
            authorLink.href = this.data.series.authorWebsite;
        }

        if (select) {
            this.data.books.forEach(b => {
                const opt = document.createElement('option');
                opt.value = `#/book/${b.slug}`;
                opt.textContent = `${b.volume}. ${b.title}`;
                select.appendChild(opt);
            });

            select.addEventListener('change', (e) => {
                if(e.target.value) {
                    window.location.hash = e.target.value;
                    e.target.value = '';
                }
            });
        }
    }

    handleRoute() {
        const path = window.location.hash.slice(1) || '/';
        let matched = false;

        for (const [routePattern, handler] of Object.entries(this.routes)) {
            const params = this.matchPattern(routePattern, path);
            if (params) {
                handler(params);
                matched = true;
                break;
            }
        }

        if (!matched) {
            document.getElementById('app-root').innerHTML = '<h2 style="text-align:center">404 - Not Found</h2>';
        }
    }

    matchPattern(pattern, path) {
        if (pattern === path) return {};

        const patternParts = pattern.split('/');
        const pathParts = path.split('/');

        if (patternParts.length !== pathParts.length) return null;

        const params = {};
        for(let i=0; i<patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].substring(1)] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }
        return params;
    }

    routeHome() {
        if (window.Renderer) window.Renderer.renderHome(this.data);
        if (window.SchemaManager) window.SchemaManager.buildSeries(this.data);

        // Load default audio (first book)
        if (window.AudioController && this.data.books.length > 0) {
             window.AudioController.loadTrack(this.data.books[0].audio);
        }
    }

    routeBook(params) {
        const book = this.data.books.find(b => b.slug === params.slug);
        if (book) {
            if (window.Renderer) window.Renderer.renderBook(book, this.data.series);
            if (window.SchemaManager) window.SchemaManager.buildBook(book, this.data.series);
            if (window.AudioController) window.AudioController.loadTrack(book.audio);
        } else {
            document.getElementById('app-root').innerHTML = '<h2>Book Not Found</h2>';
        }
    }

    routeRead(params) {
        const book = this.data.books.find(b => b.slug === params.slug);
        if (book) {
            if (window.Renderer) window.Renderer.renderRead(book);
            // Schema is handled by book route normally, can leave as series or book depending on preference
            if (window.AudioController) window.AudioController.loadTrack(book.audio);
        } else {
             document.getElementById('app-root').innerHTML = '<h2>Book Not Found</h2>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.appRouter = new Router();
    window.appRouter.init();
});