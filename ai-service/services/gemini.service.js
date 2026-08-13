const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Yeh hain woh tamam models ki list jo code aik aik kar ke try karega
const ALL_MODELS_TO_TRY = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
];

const generateAnswer = async (prompt) => {
    let lastError = null;

    for (const modelName of ALL_MODELS_TO_TRY) {
        try {
            console.log(`Trying model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                // System instruction yahan add kar di gayi hai taake model koi bhi markdown lines ya heavy bolding use na kare
                systemInstruction: "You are a direct, concise assistant. NEVER use markdown horizontal lines (---), hashtags (#), or heavy bolding (**). Write in clean plain text."
            });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            if (text) {
                console.log(`Success! Working model found: ${modelName}`);
                return text;
            }
        } catch (error) {
            console.warn(`Model ${modelName} failed with error: ${error.message}`);
            lastError = error;
        }
    }

    // Agar list ka aik bhi model nahi chala, toh ye final detailed error throw karega
    throw new Error(`All Gemini models failed. Last captured error: ${lastError ? lastError.message : 'Unknown error'}`);
};

module.exports = { generateAnswer };