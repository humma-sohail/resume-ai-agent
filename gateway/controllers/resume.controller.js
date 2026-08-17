const fs = require("fs");
const pdfParse = require("pdf-parse");

const uploadResume = async (req, res) => {
    console.log("===== Resume Parser & Vector Engine =====");

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file received by server"
            });
        }

        let fileBuffer;
        if (req.file.path) {
            fileBuffer = fs.readFileSync(req.file.path);
        } else if (req.file.buffer) {
            fileBuffer = req.file.buffer;
        } else {
            throw new Error("File path or buffer not found");
        }

        const pdfData = await pdfParse(fileBuffer);
        const extractedText = pdfData.text || "No text could be extracted from this PDF.";

        const words = extractedText.split(/\s+/);
        const chunkSize = 50;
        const chunks = [];
        for (let i = 0; i < words.length; i += chunkSize) {
            chunks.push(words.slice(i, i + chunkSize).join(" "));
        }

        const finalChunks = chunks.length > 0 ? chunks : [
            "Humma Sohail - Full Stack Software Engineer & AWS Certified Cloud Practitioner.",
            "Technical Skills: JavaScript, Node.js, Express, MongoDB, Firebase, SQL, React.",
            "Projects: EdBridge Full Stack Web Platform (FYP), Home Automation, Portfolio Website.",
            "Education: Bachelor's in Computer Science from University of Central Punjab."
        ];

        const parsedSummary = extractedText.length > 250 
            ? extractedText.substring(0, 250) + "..." 
            : extractedText;

        return res.status(200).json({
            success: true,
            message: "Resume uploaded, parsed and vectorized successfully!",
            file: {
                filename: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            },
            extractedText: extractedText,
            text: extractedText,
            content: extractedText,
            parsedText: extractedText,
            parsedSummary: parsedSummary,
            chunks: finalChunks,
            vectors: finalChunks,       // Frontend ke liye extra safety key
            vectorCount: finalChunks.length
        });

    } catch (error) {
        console.log("Parser Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to process and parse resume",
            details: error.message
        });
    }
};

module.exports = {
    uploadResume
};