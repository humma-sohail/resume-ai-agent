const pdfParse = require("pdf-parse");
const fs = require("fs").promises;

const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text || "";
    } catch (error) {
        console.log("PDF parse error:", error.message);
        throw new Error(`PDF parse failed: ${error.message}`);
    }
};

module.exports = {
    extractTextFromPDF
};
