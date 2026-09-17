const express = require("express");
const cookieParser = require("cookie-parser")
const app = express();
const cors = require('cors')
app.use(cookieParser())
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))




app.get("/", (req, res) => {
    res.status(200).json({
        message: "Server is working"
    });
});
const interviewRouter = require("./routes/interview.routes")
const authRouter = require("./routes/auth.routes");
const applicationRouter = require("./routes/application.routes");
const mockInterviewRouter = require("./routes/mockInterview.routes");

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/mock-interviews", mockInterviewRouter);

app.use((error, req, res, next) => {
    if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
            message: "Resume files must be 3 MB or smaller."
        })
    }

    return res.status(error.statusCode || 500).json({
        message: error.statusCode ? error.message : "Something went wrong. Please try again."
    })
})

module.exports = app;
