const axios = require("axios");

/**
 * Forwards a request to a target POST URL and returns the response.
 * Used for proxying gateway endpoints to ai-service endpoints.
 */
const proxyPost = (targetUrl) => async (req, res) => {
  try {
    const response = await axios.post(targetUrl, req.body);
    // Always return the response from ai-service to the client
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(500).json({ success: false, message: `Failed to contact AI service for ${targetUrl}` });
  }
};

const askAI = async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ success: false, message: "Question is required" });
  }
  try {
    const response = await axios.post("http://ai-service:5002/api/ai/ask", { question });
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(500).json({ success: false, message: "Failed to contact AI service." });
  }
};

// Modified proxy handler for analyzeATS to always respond to client
const analyzeATS = async (req, res) => {
  try {
    const response = await axios.post("http://ai-service:5002/api/ai/analyze-ats", req.body);
    // Always return the response from ai-service to the client
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(500).json({ success: false, message: "Failed to contact AI service for analyze-ats" });
  }
};

// Modified proxy handler for tailorResume to always respond to client
const tailorResume = async (req, res) => {
  try {
    const response = await axios.post("http://ai-service:5002/api/ai/tailor-resume", req.body);
    // Always return the response from ai-service to the client
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(500).json({ success: false, message: "Failed to contact AI service for tailor-resume" });
  }
};

module.exports = {
  askAI,
  analyzeATS,
  tailorResume,
};