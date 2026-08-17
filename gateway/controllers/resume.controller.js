const fs = require("fs");

const uploadResume = async (req, res) => {
    console.log("===== Local Resume Upload Processing =====");

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file received by server"
            });
        }

        console.log("File received successfully:", req.file.originalname);

        // File details ya processing yahan handle ho rahi hai
        const fileInfo = {
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path || null
        };

        // Frontend ke liye successful response
        return res.status(200).json({
            success: true,
            message: "Resume uploaded successfully!",
            file: fileInfo
        });

    } catch (error) {
        console.log("===== Resume Upload Error =====");
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);

        return res.status(500).json({
            success: false,
            message: "Failed to process resume upload",
            details: error.message
        });
    }
};

module.exports = {
    uploadResume
};