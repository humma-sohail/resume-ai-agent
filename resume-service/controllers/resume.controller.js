const axios = require("axios");
const { extractTextFromPDF } = require("../services/pdf.service");
const { chunkText } = require("../services/chunk.service");

const uploadResume = async (req, res) => {

    try {

        console.log("FILE:", req.file);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No resume uploaded"
            });
        }

        const text = await extractTextFromPDF(req.file.path);

        if (!text || text.trim().length === 0) {
            console.log("No text extracted from PDF");
            return res.status(400).json({
                success: false,
                message: "No text could be extracted from the uploaded PDF. Please upload a valid PDF resume."
            });
        }

        const chunks = chunkText(text);
        const summary = text
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .slice(0, 4)
            .join(" ")
            .slice(0, 400);

        if (!chunks || chunks.length === 0) {
            console.log("No chunks generated from resume text");
            return res.status(500).json({
                success: false,
                message: "Failed to chunk resume text."
            });
        }

        const aiServiceUrl = process.env.AI_SERVICE_URL || "http://ai-service:5002/api/ai/store";
        console.log("Sending chunks to AI Service at:", aiServiceUrl);

        await axios.post(
            aiServiceUrl,
            { chunks },
            { timeout: 120000 }
        );

        // Prepare explicit parsed fields to return to the Gateway/Frontend
        const parsedText = text;
        const parsedSummary = summary;

        res.json({
            success: true,
            message: "Resume processed successfully",
            totalChunks: chunks.length,
            parsedText,
            parsedTextArray: chunks,
            parsedSummary,
            // Also include nested resumeData for backwards compatibility
            resumeData: {
                text: parsedText,
                chunks,
                summary: parsedSummary
            }
        });

    } catch (error) {

        console.log("Resume service error:", error.message);
        if (error.response) {
            console.log("AI service response status:", error.response.status);
            console.log("AI service response data:", error.response.data);
        }
        console.log("Stack:", error.stack);

        res.status(500).json({
            success: false,
            message: "Resume Processing Failed",
            details: error.response ? error.response.data : error.message
        });

    }

};

module.exports = {
    uploadResume
};
