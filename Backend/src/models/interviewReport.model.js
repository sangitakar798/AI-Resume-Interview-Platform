const mongoose = require('mongoose');


const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Technical question is required" ]
    },
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    },
    answer: {
        type: String,
        required: [ true, "Answer is required" ]
    }
}, {
    _id: false
})

const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Technical question is required" ]
    },
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    },
    answer: {
        type: String,
        required: [ true, "Answer is required" ]
    }
}, {
    _id: false
})

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [ true, "Skill is required" ]
    },
    severity: {
        type: String,
        enum: [ "low", "medium", "high" ],
        required: [ true, "Severity is required" ]
    }
}, {
    _id: false
})

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [ true, "Day is required" ]
    },
    focus: {
        type: String,
        required: [ true, "Focus is required" ]
    },
    tasks: [ {
        type: String,
        required: [ true, "Task is required" ]
     } ]
})

const atsAnalysisSchema = new mongoose.Schema({
    score: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    scoreBreakdown: {
        keywordAlignment: { type: Number, min: 0, max: 100, required: true },
        experienceAlignment: { type: Number, min: 0, max: 100, required: true },
        resumeStructure: { type: Number, min: 0, max: 100, required: true }
    },
    matchedKeywords: [ { type: String } ],
    missingKeywords: [ { type: String } ],
    suggestions: [ { type: String } ],
    summary: {
        type: String,
        required: true
    }
}, {
    _id: false
})

const resumeVersionSchema = new mongoose.Schema({
    html: {
        type: String,
        required: true
    },
    template: {
        type: String,
        enum: [ "professional", "minimal" ],
        default: "professional"
    }
}, {
    timestamps: true
})

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [ true, "Job description is required" ]
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    technicalQuestions: [ technicalQuestionSchema ],
    behavioralQuestions: [ behavioralQuestionSchema ],
     skillGaps: [ skillGapSchema ],
    preparationPlan: [ preparationPlanSchema ],
    atsAnalysis: atsAnalysisSchema,
    resumeVersions: [ resumeVersionSchema ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    title: {
        type: String,
        required: [ true, "Job title is required" ]
    }
}, {
    timestamps: true
})


const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);

module.exports = interviewReportModel;  
