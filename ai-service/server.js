const express = require("express");
const cors = require("cors");
require("dotenv").config();

const aiRoutes = require("./routes/ai.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/ai", aiRoutes);

// ATS Analysis Logic (basic keyword matching for demo purposes)
function analyzeATS(resumeText, jobDescription) {
    if (!resumeText || !jobDescription) {
        return {
            score: 0,
            matchingKeywords: [],
            missingKeywords: [],
            suggestions: ["Provide both resume and job description text."]
        };
    }

    // Extract keywords from job description (very naively: top 10 frequent non-trivial words)
    const stopwords = new Set([
        "the","and","a","to","for","of","in","on","with","at","by","an","be","is","are","as","from","that","this",
        "it","or","you","your","we","our","will","can"
    ]);
    const wordFreq = {};
    jobDescription
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopwords.has(word))
        .forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });

    // Get top 10 keywords from job description
    const sortedKeywords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);

    // Find which of those keywords appear in the resume
    const resumeTextLC = resumeText.toLowerCase();
    const matchingKeywords = sortedKeywords.filter(kw => resumeTextLC.includes(kw));
    const missingKeywords = sortedKeywords.filter(kw => !resumeTextLC.includes(kw));

    let score = Math.round((matchingKeywords.length / sortedKeywords.length) * 100);

    let suggestions = [];
    if (missingKeywords.length > 0) {
        suggestions.push(
            `Try to address these missing concepts in your resume: ${missingKeywords.join(", ")}.`
        );
    } else {
        suggestions.push("Your resume seems well aligned with the job description keywords.");
    }

    return {
        score,
        matchingKeywords,
        missingKeywords,
        suggestions
    };
}

// POST /api/ai/analyze-ats and /analyze-ats endpoints
const analyzeAtsHandler = (req, res) => {
    const { resumeText, jobDescription } = req.body;
    const result = analyzeATS(resumeText, jobDescription);
    res.json(result);
};

app.post("/api/ai/analyze-ats", analyzeAtsHandler);
app.post("/analyze-ats", analyzeAtsHandler);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Service Running"
    });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log(`AI Service running on ${PORT}`);
});
