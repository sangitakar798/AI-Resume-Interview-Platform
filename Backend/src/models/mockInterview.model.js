// const mongoose = require('mongoose');

// const answerSchema = new mongoose.Schema({
//   question: { type: String, required: true },
//   answer: { type: String, default: '' },
//   clarity: { type: Number, min: 0, max: 100 },
//   relevance: { type: Number, min: 0, max: 100 },
//   technicalDepth: { type: Number, min: 0, max: 100 },
//   overallScore: { type: Number, min: 0, max: 100 },
//   feedback: { type: String },
//   improvedAnswer: { type: String }
// }, { timestamps: true });

// const mockInterviewSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user', index: true },
//   interviewReport: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewReport', required: true },
//   mode: { type: String, enum: ['technical', 'behavioral', 'mixed'], default: 'mixed' },
//   timePerQuestion: { type: Number, enum: [60, 90, 120, 180], default: 120 },
//   questions: [{ question: String, type: String }],
//   answers: [answerSchema],
//   completedAt: { type: Date }
// }, { timestamps: true });

// module.exports = mongoose.model('MockInterview', mockInterviewSchema);
const mongoose = require("mongoose");

const mockQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ["technical", "behavioral"],
        required: true
    },

    answer: {
        type: String,
        default: ""
    },

    score: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },

    clarity: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },

    relevance: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },

    technicalDepth: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },

    feedback: {
        type: String,
        default: ""
    },

    improvedAnswer: {
        type: String,
        default: ""
    }

}, {
    _id: false
});

const mockInterviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    interviewReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewReport",
        required: true
    },

    mode: {
        type: String,
        enum: ["technical", "behavioral", "mixed"],
        default: "mixed"
    },

    timePerQuestion: {
        type: Number,
        default: 120
    },

    questions: {
        type: [mockQuestionSchema],
        required: true
    },

    currentQuestion: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: ["not_started", "in_progress", "completed"],
        default: "in_progress"
    },

    startedAt: {
        type: Date,
        default: Date.now
    },

    completedAt: {
        type: Date,
        default: null
    },

    overallScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("MockInterview", mockInterviewSchema);
