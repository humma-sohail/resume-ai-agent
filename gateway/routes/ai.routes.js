const express = require('express');
const router = express.Router();
const { askAI, analyzeATS, tailorResume } = require('../controllers/ai.controller');

router.post('/ask', askAI);
router.post('/analyze-ats', analyzeATS);
router.post('/tailor-resume', tailorResume);

module.exports = router;