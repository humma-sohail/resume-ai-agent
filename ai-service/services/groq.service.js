const Groq = require("groq-sdk");
const { getVectors } = require("../database/vector.store");
const { createEmbedding } = require("../embeddings/embed.service");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

function cosineSimilarity(a, b) {

    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }

    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

const generateAnswer = async (question) => {

    const questionEmbedding = await createEmbedding(question);

    const vectors = getVectors();

    if (vectors.length === 0) {
        return "No resume has been uploaded yet.";
    }

    const ranked = vectors
        .map(item => ({
            ...item,
            score: cosineSimilarity(questionEmbedding, item.embedding)
        }))
        .sort((a, b) => b.score - a.score);

    const context = ranked
        .slice(0, 3)
        .map(item => item.text)
        .join("\n\n");

    const prompt = `
You are an AI Resume Assistant.

Answer ONLY from the resume context below.

If the answer is not available, say:
"I couldn't find that information in the resume."

Resume:
${context}

Question:
${question}
`;

    const completion = await groq.chat.completions.create({

        model: "llama-3.1-8b-instant",

        messages: [
            {
                role: "user",
                content: prompt
            }
        ]

    });

    return completion.choices[0].message.content;

};

module.exports = {
    generateAnswer
};