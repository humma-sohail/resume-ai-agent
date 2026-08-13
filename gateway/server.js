const express = require("express");
const cors = require("cors");
require("dotenv").config();

const resumeRoutes = require("./routes/resume.routes");

// PRINT/INSPECT: Print out the value and keys of aiRoutes to ensure it's an Express Router
const aiRoutes = require("./routes/ai.routes");
if (typeof aiRoutes === "function" && aiRoutes.stack) {
    console.log("[DEBUG] aiRoutes loaded with route count:", aiRoutes.stack.length);
    aiRoutes.stack.forEach(layer => {
        if (layer.route) {
            console.log("[DEBUG]   route:", Object.keys(layer.route.methods).join(','), layer.route.path);
        }
    });
} else {
    console.error("[ERROR] aiRoutes is not a valid Express Router:", aiRoutes);
}

const app = express();

// Middleware: Detailed request logging (first)
app.use((req, res, next) => {
    console.log(`[GATEWAY INCOMING] ${req.method} ${req.url}`);
    next();
});

// Middleware: CORS and JSON body parser
app.use(cors());
app.use(express.json());

// ROUTES: Mount API routers BEFORE any wildcard/404/error middleware
app.use("/api/resume", resumeRoutes);

// ENSURE: aiRoutes is mounted correctly using the proper relative path, no collisions before
app.use("/api/ai", aiRoutes);

// Health check root endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "API Gateway is running..."
    });
});

// After all /api/ai routes, return 404 for unknown subpaths under /api/ai
app.use("/api/ai", (req, res) => {
    res.status(404).json({ success: false, message: "AI endpoint not found." });
});

// General catch-all for unhandled/404 requests
app.use((req, res) => {
    console.log(`[GATEWAY 404] Unhandled: ${req.method} ${req.url}`);
    res.status(404).send('Cannot ' + req.method + ' ' + req.url);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);
});