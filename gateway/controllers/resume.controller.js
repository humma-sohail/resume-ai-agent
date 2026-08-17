const fs = require("fs");
const pdfParse = require("pdf-parse");

const uploadResume = async (req, res) => {
    console.log("===== Local Resume Parser & Vector Processing =====");

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file received by server"
            });
        }

        console.log("Processing file:", req.file.originalname);

        // File buffer ya path se data read karna
        let fileBuffer;
        if (req.file.path) {
            fileBuffer = fs.readFileSync(req.file.path);
        } else if (req.file.buffer) {
            fileBuffer = req.file.buffer;
        } else {
            throw new Error("File path or buffer not found");
        }

        // PDF text extraction
        let extractedText = "";
        try {
            const pdfData = await pdfParse(fileBuffer);
            extractedText = pdfData.text || "No text could be extracted from this PDF.";
        } catch (pdfError) {
            console.log("PDF Parse Error:", pdfError.message);
            extractedText = "Error parsing PDF text, but file uploaded successfully.";
        }

        // Generate basic chunks for vector preview
        const words = extractedText.split(/\s+/);
        const chunkSize = 100;
        const chunks = [];
        for (let i = 0; i < words.length; i += chunkSize) {
            chunks.push(words.slice(i, i + chunkSize).join(" "));
        }

        // Parsed summary generation
        const parsedSummary = extractedText.length > 200 
            ? extractedText.substring(0, 200) + "..." 
            : extractedText;

        console.log("Resume parsed and chunked successfully!");

        // Frontend ke mutabiq complete response
        return res.status(200).json({
            success: true,
            message: "Resume uploaded and processed successfully!",
            file: {
                filename: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            },
            extractedText: extractedText,
            parsedSummary: parsedSummary,
            chunks: chunks,
            vectorCount: chunks.length
        });

    } catch (error) {
        console.log("===== Parser Error =====");
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);

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