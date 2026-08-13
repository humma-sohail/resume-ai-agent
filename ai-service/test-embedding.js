require("dotenv").config();

const { createEmbedding } = require("./embeddings/embed.service");


async function test(){

    const vector = await createEmbedding(
        "Humma is a full stack developer"
    );


    console.log("Vector length:", vector.length);

}

test();
