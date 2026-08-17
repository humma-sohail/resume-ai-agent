const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const uploadResume = async (req, res) => {
    console.log("===== Gateway Forwarding Request =====");

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file received by Gateway"
            });
        }

        const formData = new FormData();

        if (req.file.path) {
            formData.append("resume", fs.createReadStream(req.file.path), {
                filename: req.file.originalname,
                contentType: req.file.mimetype || "application/pdf",
            });
        } else if (req.file.buffer) {
            formData.append("resume", req.file.buffer, {
                filename: req.file.originalname,
                contentType: req.file.mimetype || "application/pdf",
            });
        }

        // Forward to resume-service container on the internal Docker network.
        // Resume service is exposed on port 5001 inside Docker Compose.
       const RESUME_SERVICE_URL = process.env.RESUME_SERVICE_URL || "http://localhost:8080/api/resume/upload";

        // Build headers and try to include Content-Length when possible (helps some servers).
        const headers = formData.getHeaders();
        try {
            const getLength = () => new Promise((resolve) => {
                formData.getLength((err, length) => resolve(err ? null : length));
            });
            const length = await getLength();
            if (length) headers['Content-Length'] = length;
        } catch (e) {
            // ignore and proceed without content-length
        }

        console.log("Forwarding to Resume Service:", RESUME_SERVICE_URL);
        console.log("Forwarding headers:", Object.keys(headers));

        const response = await axios.post(
            RESUME_SERVICE_URL,
            formData,
            {
                headers,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 120000,
            }
        );

        console.log("Resume Service Response Received Successfully!");
        return res.json(response.data);

    } catch (error) {
        console.log("===== Gateway Forward Error =====");
        console.log("Error message:", error.message);
        if (error.response) {
            console.log("Error status:", error.response.status);
            console.log("Error response data:", error.response.data);
            console.log("Error response headers:", error.response.headers);
        }
        console.log("Error config:", error.config);
        console.log("Error stack:", error.stack);

        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || "Gateway Error",
            details: error.response ? error.response.data : error.message
        });
    }
};

module.exports = {
    uploadResume
};