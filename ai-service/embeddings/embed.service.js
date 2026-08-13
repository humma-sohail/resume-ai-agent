const { pipeline } = require("@xenova/transformers");

let extractor;


const createEmbedding = async (text) => {

    if (!extractor) {
        extractor = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );
    }


    const output = await extractor(text, {
        pooling: "mean",
        normalize: true
    });


    return Array.from(output.data);

};


module.exports = {
    createEmbedding
};
