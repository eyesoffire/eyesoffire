window.SchemaGenerator = {
    inject(schemaObj) {
        const script = document.getElementById('schema-container');
        if (script) {
            script.textContent = JSON.stringify(schemaObj, null, 2);
        }
    },

    generateSeriesSchema(data) {
        const schema = {
            "@context": "https://schema.org",
            "@type": "BookSeries",
            "name": data.series.title,
            "description": data.series.description,
            "url": data.series.url,
            "author": {
                "@type": "Person",
                "name": data.series.author,
                "url": data.series.authorWebsite
            },
            "hasPart": data.books.map(book => ({
                "@type": "Book",
                "name": book.title,
                "bookEdition": book.volume.toString(),
                "url": `${data.series.url}#/book/${book.slug}`
            }))
        };
        this.inject(schema);
    },

    generateBookSchema(book, series) {
        const schema = {
            "@context": "https://schema.org",
            "@type": "Book",
            "name": book.title,
            "author": {
                "@type": "Person",
                "name": series.author,
                "url": series.authorWebsite
            },
            "url": `${series.url}#/book/${book.slug}`,
            "image": book.cover,
            "description": book.blurb,
            "isbn": book.isbn !== "TBD" ? book.isbn : undefined,
            "numberOfPages": book.pageCount > 0 ? book.pageCount : undefined,
            "datePublished": book.releaseDate !== "TBD" ? book.releaseDate : undefined,
            "bookEdition": book.volume.toString(),
            "isPartOf": {
                "@type": "BookSeries",
                "name": series.title,
                "url": series.url
            }
        };

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
