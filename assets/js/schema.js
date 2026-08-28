const SchemaManager = {
    inject(schemaData) {
        let script = document.getElementById('schema-container');
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = 'schema-container';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(schemaData, null, 2);
    },

    clear() {
        const script = document.getElementById('schema-container');
        if (script) {
            script.textContent = '{}';
        }
    },

    buildSeries(data) {
        this.clear();
        const schema = {
            "@context": "https://schema.org",
            "@type": "BookSeries",
            "name": data.series.title,
            "description": data.series.description,
            "author": {
                "@type": "Person",
                "name": data.series.author,
                "url": data.series.authorWebsite
            },
            "numberOfVolumes": data.books.length,
            "hasPart": data.books.map(b => ({
                "@type": "Book",
                "name": b.title,
                "url": window.location.origin + window.location.pathname + "#/book/" + b.slug
            }))
        };
        this.inject(schema);
    },

    buildBook(book, series) {
        this.clear();
        const schema = {
            "@context": "https://schema.org",
            "@type": "Book",
            "name": book.title,
            "author": {
                "@type": "Person",
                "name": series.author,
                "url": series.authorWebsite
            },
            "url": window.location.origin + window.location.pathname + "#/book/" + book.slug,
            "image": book.cover,
            "inLanguage": "en",
            "isPartOf": {
                "@type": "BookSeries",
                "name": series.title
            }
        };

        if (book.isbn && book.isbn !== 'TBD') schema.isbn = book.isbn;
        if (book.pageCount) schema.numberOfPages = book.pageCount;
        if (book.releaseDate && book.releaseDate !== 'TBD') schema.datePublished = book.releaseDate;

        if (book.retailers && book.retailers.length > 0) {
            schema.offers = {
                "@type": "AggregateOffer",
                "offers": book.retailers.map(r => ({
                    "@type": "Offer",
                    "url": r.url,
                    "seller": {
                        "@type": "Organization",
                        "name": r.name
                    }
                }))
            };
        }

        this.inject(schema);
    }
};

window.SchemaManager = SchemaManager;