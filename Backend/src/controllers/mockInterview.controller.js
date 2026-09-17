const MockInterview = require('../models/mockInterview.model');
const InterviewReport = require('../models/interviewReport.model');
const { scoreMockAnswer } = require('../services/ai.service');

async function startMockInterview(req, res) {
    try {
        const {
            interviewReportId,
            mode = "mixed",
            timePerQuestion = 120
        } = req.body;

        console.log("START MOCK INTERVIEW");
        console.log("User:", req.user);
        console.log("Body:", req.body);

        if (!interviewReportId) {
            return res.status(400).json({
                message: "Interview report ID is required."
            });
        }

        const report = await InterviewReport.findOne({
            _id: interviewReportId,
            user: req.user.id
        });

        console.log("Report found:", !!report);

        if (!report) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        // let technical = report.technicalQuestions || [];
        // let behavioral = report.behavioralQuestions || [];

        // let questions;

        // if (mode === "technical") {
        //     questions = technical;
        // } else if (mode === "behavioral") {
        //     questions = behavioral;
        // } else {
        //     questions = [...technical, ...behavioral];
        // }

        // questions = questions
        //     .slice(0, 10)
        //     .map(q => ({
        //         question: q.question,
        //         type: technical.includes(q)
        //             ? "technical"
        //             : "behavioral"
        //     }));

        const technical = (report.technicalQuestions || []).map(q => ({
            question: q.question,
            type: "technical"
        }));

        const behavioral = (report.behavioralQuestions || []).map(q => ({
            question: q.question,
            type: "behavioral"
        }));

        let questions;

        if (mode === "technical") {
            questions = technical;
        } else if (mode === "behavioral") {
            questions = behavioral;
        } else {
            questions = [...technical, ...behavioral];
        }

        questions = questions.slice(0, 10);
//------------------------------------------------------------------------------------
        console.log("Questions:", questions);

        if (questions.length === 0) {
            return res.status(400).json({
                message: "No interview questions are available in this report."
            });
        }

        const mockInterview = await MockInterview.create({
            user: req.user.id,
            interviewReport: report._id,
            mode,
            timePerQuestion: Number(timePerQuestion),
            questions
        });

        console.log("Mock interview created:", mockInterview._id);

        return res.status(201).json({
            mockInterview
        });

    } catch (error) {
        console.error("START MOCK INTERVIEW ERROR:", error);

        return res.status(500).json({
            message: error.message || "Failed to start mock interview.",
            error: process.env.NODE_ENV === "development"
                ? error.stack
                : undefined
        });
    }
}

async function getMockInterview(req, res) {
  const mockInterview = await MockInterview.findOne({ _id: req.params.id, user: req.user.id });
  if (!mockInterview) return res.status(404).json({ message: 'Mock interview not found.' });
  res.json({ mockInterview });
}

async function submitMockAnswer(req, res) {
    try {
        const { answer = "", questionIndex } = req.body;

        const mockInterview = await MockInterview.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!mockInterview) {
            return res.status(404).json({
                message: "Mock interview not found."
            });
        }

        const index = Number(questionIndex);

        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= mockInterview.questions.length
        ) {
            return res.status(400).json({
                message: "Invalid question index."
            });
        }

        const currentQuestion = mockInterview.questions[index];

        if (!currentQuestion) {
            return res.status(400).json({
                message: "Question not found."
            });
        }

        const report = await InterviewReport.findOne({
            _id: mockInterview.interviewReport,
            user: req.user.id
        });

        if (!report) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        console.log("Scoring mock answer...");
        console.log("Question:", currentQuestion.question);
        console.log("Type:", currentQuestion.type);
        console.log("Answer:", answer);

        const result = await scoreMockAnswer({
            question: currentQuestion.question,
            questionType: currentQuestion.type,
            answer: answer.trim(),
            jobDescription: report.jobDescription || ""
        });

        console.log("AI result:", result);

        // Save answer + AI evaluation directly
        // inside the current question
        currentQuestion.answer = answer.trim();
        currentQuestion.clarity = result.clarity;
        currentQuestion.relevance = result.relevance;
        currentQuestion.technicalDepth = result.technicalDepth;
        currentQuestion.score = result.overallScore;
        currentQuestion.feedback = result.feedback;
        currentQuestion.improvedAnswer = result.improvedAnswer;

        await mockInterview.save();

        return res.status(200).json({
            result
        });

    } catch (error) {
        console.error("SUBMIT MOCK ANSWER ERROR:", error);

        return res.status(500).json({
            message: error.message || "Failed to score answer."
        });
    }
}
async function completeMockInterview(req, res) {
  const mockInterview = await MockInterview.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id }, { completedAt: new Date() }, { new: true }
  );
  if (!mockInterview) return res.status(404).json({ message: 'Mock interview not found.' });
  res.json({ mockInterview });
}

module.exports = { startMockInterview, getMockInterview, submitMockAnswer, completeMockInterview };
