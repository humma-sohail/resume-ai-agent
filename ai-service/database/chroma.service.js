const { ChromaClient } = require("chromadb");
const { pipeline } = require("@xenova/transformers");

let extractor = null;

// Transformers pipeline initialize karna for embeddings
const getEmbeddingFunction = async () => {
    if (!extractor) {
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return {
        generate: async (texts) => {
            const embeddings = [];
            for (const text of texts) {
                const output = await extractor(text, { pooling: 'mean', normalize: true });
                embeddings.push(Array.from(output.data));
            }
            return embeddings;
        }
    };
};

const client = new ChromaClient({
    path: "http://chroma:8000"
});

const getCollection = async () => {
    try {
        const embedder = await getEmbeddingFunction();
        const collection = await client.getOrCreateCollection({
            name: "resume_embeddings",
            embeddingFunction: embedder
        });
        return collection;
    } catch (err) {
        console.error("Chroma Collection Error:", err.message);
        throw err;
    }
};

const queryVectors = async (queryText) => {
    try {
        const collection = await getCollection();
        const results = await collection.query({
            queryTexts: [queryText],
            nResults: 5
        });

        if (results && results.documents) {
            let docs = results.documents;
            if (Array.isArray(docs) && docs.length > 0) {
                const flattened = docs.flat().filter(Boolean);
                if (flattened.length > 0) {
                    return flattened.join("\n\n");
                }
            }
        }
        return "";
    } catch (err) {
        console.error("Chroma Query Error:", err.message);
        return "";
    }
};

module.exports = {
    getCollection,
    queryVectors
};