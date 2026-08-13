const { generateAnswer } = require("../services/gemini.service");
const storeResumeChunks = require("../services/resume.vector.service").storeResumeChunks;
const { queryVectors } = require("../database/chroma.service"); // Chroma se query karne ke liye import kiya

/**
 * Health check for AI service.
 */
const healthCheck = (req, res) => {
  res.json({ success: true, message: "AI Service is healthy." });
};

/**
 * Ask Gemini AI a question and return the answer.
 */
const askAI = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: "Question is required." });
    }

    // Resume context fetch karne ki koshish (ChromaDB se relevant chunks nikal kar)
    let resumeContext = "";
    try {
      resumeContext = await queryVectors(question);
    } catch (e) {
      console.log("Context fetch warning:", e.message);
    }

    // Prompt mein resume context add karna taake AI ko aapka resume yaad rahe
    const prompt = resumeContext 
        ? `You are a direct, concise AI Resume Assistant. Answer the user's question using the resume context below. 

STRICT RULES:
1. Be short, direct, and point-to-point. Avoid long explanations.
2. NEVER use markdown symbols like horizontal lines (---), hashtags (#), or excessive bold asterisks (**).
3. If a list is needed, use simple numbers (1., 2., 3.) or hyphens (-). For summaries, use clean plain text paragraphs.

Resume Context:
${resumeContext}

User Question: ${question}`
        : `Please answer the following question concisely in plain text: ${question}`;


    const rawText = await generateAnswer(prompt);

    // Try to parse JSON in answer, else return raw text.
    let answer = rawText;
    try {
      const jsonRegex = /({[\s\S]*?})|(\[[\s\S]*?])/;
      const match = rawText.match(jsonRegex);
      if (match) {
        answer = JSON.parse(match[0]);
      }
    } catch (_) {
      // Fallback to raw text
    }

    res.json({ success: true, answer });
  } catch (err) {
    console.error("AI Error:", err.message);
    res.status(500).json({ success: false, message: "AI Error" });
  }
};

/**
 * Store and vectorize resume chunks.
 */
const storeResume = async (req, res) => {
  try {
    const { chunks, resumeText } = req.body;

    let chunksToStore = chunks;
    if (!chunksToStore && resumeText) {
      chunksToStore = Array.isArray(resumeText) ? resumeText : [resumeText];
    }

    if (!Array.isArray(chunksToStore) || chunksToStore.length === 0) {
      return res.status(400).json({
        success: false,
        message: "chunks array is required.",
      });
    }

    const result = await storeResumeChunks(chunksToStore);

    res.json({
      success: true,
      message: "Resume stored and vectorized.",
      totalChunks: chunksToStore.length,
      data: result,
    });
  } catch (err) {
    console.error("Store Resume Error:", err.message);
    res.status(500).json({ success: false, message: err.message || "Failed to store resume." });
  }
};

/**
 * Tailor resume using Gemini AI based on job description.
 */
const tailorResume = async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;

    const prompt = `Tailor this resume based on the following job description. Return the response in clean JSON format.\n\nResume: ${JSON.stringify(resumeData || req.body)}\n\nJob Description: ${jobDescription || "General optimization"}`;

    const rawText = await generateAnswer(prompt);

    let tailoredData = rawText;
    try {
      let cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const jsonRegex = /({[\s\S]*?})|(\[[\s\S]*?])/;
      const match = cleanText.match(jsonRegex);
      if (match) {
        tailoredData = JSON.parse(match[0]);
      } else {
        tailoredData = JSON.parse(cleanText);
      }
    } catch (_) {
      // Fallback to raw text
    }

    res.json({ success: true, tailoredData });
  } catch (err) {
    console.error("Tailor Resume Error:", err.message);
    res.status(500).json({ success: false, message: err.message || "Failed to tailor resume." });
  }
};

module.exports = {
  healthCheck,
  askAI,
  storeResume,
  tailorResume,
};