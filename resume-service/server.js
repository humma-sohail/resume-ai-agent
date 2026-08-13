const resumeRoutes = require("./routes/resume.routes");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/resume", resumeRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Resume Service Running"
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Resume Service running on ${PORT}`);
});