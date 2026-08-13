const express = require("express");
const router = express.Router();
const { healthCheck, askAI, storeResume, tailorResume } = require("../controllers/ai.controller");

router.get("/health", healthCheck);
router.post("/ask", askAI);
router.post("/store", storeResume);
router.post("/tailor-resume", tailorResume);

module.exports = router;