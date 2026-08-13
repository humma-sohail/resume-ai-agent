const upload = require("../middleware/upload.middleware");
const express = require("express");
const router = express.Router();

const {
  uploadResume,
} = require("../controllers/resume.controller");

router.post(
    "/upload",
    (req, res, next) => {
        upload.single("resume")(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || "File upload failed",
                });
            }
            next();
        });
    },
    uploadResume
);

module.exports = router;
