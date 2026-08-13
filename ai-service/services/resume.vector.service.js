const { getCollection } = require("../database/chroma.service");

const storeResumeChunks = async (chunks) => {
    try {
        const collection = await getCollection();
        
        // Har chunk ke liye unique ID generate karein
        const ids = chunks.map((_, index) => `chunk_${Date.now()}_${index}`);
        
        // ChromaDB khud automatic embeddings bana lega agar humne embeddingFunction set ki hui hai
        await collection.add({
            ids: ids,
            documents: chunks
        });

        return true;
    } catch (err) {
        console.error("Store Resume Chunks Error:", err.message);
        throw err;
    }
};

module.exports = {
    storeResumeChunks
};