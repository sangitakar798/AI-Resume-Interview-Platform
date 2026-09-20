// const pdfParse = require("pdf-parse")
// const generateInterviewReport = require("../services/ai.service")
// const interviewReportModel = require("../models/interviewReport.model")
const pdfParse = require("pdf-parse")
const {generateInterviewReport,generateResumeDraft,generateResumePdf} = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")



/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
// async function generateInterViewReportController(req, res) {
//     const { selfDescription, jobDescription } = req.body
//     const trimmedJobDescription = jobDescription?.trim()
//     const trimmedSelfDescription = selfDescription?.trim()

//     if (!trimmedJobDescription) {
//         return res.status(400).json({
//             message: "A job description is required."
//         })
//     }

//     if (!req.file && !trimmedSelfDescription) {
//         return res.status(400).json({
//             message: "Upload a resume or provide a self-description."
//         })
//     }

//     const resumeContent = req.file
//     ? await new pdfParse.PDFParse(Uint8Array.from(req.file.buffer)).getText()
//     : { text: "" }

//     const interViewReportByAi = await generateInterviewReport({
//         resume: resumeContent.text,
//         selfDescription: trimmedSelfDescription || "",
//         jobDescription: trimmedJobDescription
//     })

//     const interviewReport = await interviewReportModel.create({
//         user: req.user.id,
//         resume: resumeContent.text,
//         selfDescription: trimmedSelfDescription || "",
//         jobDescription: trimmedJobDescription,
//         ...interViewReportByAi
//     })

//     res.status(201).json({
//         message: "Interview report generated successfully.",
//         interviewReport
//     })

// }
async function generateInterViewReportController(req, res) {
    try {
        console.log("=================================");
        console.log("Generate Interview Report API");
        console.log("User:", req.user?.id);
        console.log("File:", req.file?.originalname || "No resume");
        console.log("=================================");

        const { selfDescription, jobDescription } = req.body;

        const trimmedJobDescription = jobDescription?.trim();
        const trimmedSelfDescription = selfDescription?.trim();

        // Job description is required
        if (!trimmedJobDescription) {
            return res.status(400).json({
                message: "A job description is required."
            });
        }

        // Resume OR self description is required
        if (!req.file && !trimmedSelfDescription) {
            return res.status(400).json({
                message: "Upload a resume or provide a self-description."
            });
        }

        let resumeText = "";

        // Extract text from uploaded PDF
        if (req.file) {
            console.log("Reading resume PDF...");

            const pdf = new pdfParse.PDFParse(
                Uint8Array.from(req.file.buffer)
            );

            const resumeContent = await pdf.getText();

            resumeText = resumeContent.text || "";

            console.log(
                "Resume text length:",
                resumeText.length
            );
        }

        console.log("Calling Gemini AI...");

        const interViewReportByAi =
            await generateInterviewReport({
                resume: resumeText,
                selfDescription: trimmedSelfDescription || "",
                jobDescription: trimmedJobDescription
            });

        console.log("Gemini response received.");

        // Save report to MongoDB
        const interviewReport =
            await interviewReportModel.create({
                user: req.user.id,
                resume: resumeText,
                selfDescription: trimmedSelfDescription || "",
                jobDescription: trimmedJobDescription,
                ...interViewReportByAi
            });

        console.log(
            "Interview report saved:",
            interviewReport._id
        );

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });

    } catch (error) {

        console.error("=================================");
        console.error("GENERATE INTERVIEW REPORT ERROR");
        console.error("=================================");
        console.error(error);
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);

        return res.status(500).json({
            message: "Failed to generate interview report.",
            error: error.message
        });
    }
}
/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    // //const interviewReport = await interviewReportModel.findOne({
    //     _id: interviewReportId,
    //     user: req.user.id
    // })//
    const interviewReport = await interviewReportModel.findOne({
        _id: interviewReportId,
        user: req.user.id
    })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

async function generateResumeDraftController(req, res) {
    const report = await interviewReportModel.findOne({ _id: req.params.interviewReportId, user: req.user.id })
    if (!report) return res.status(404).json({ message: "Interview report not found." })
    const draft = await generateResumeDraft({ resume: report.resume, selfDescription: report.selfDescription, jobDescription: report.jobDescription })
    res.json({ draft })
}

async function saveResumeVersionController(req, res) {
    const { html, template = "professional" } = req.body
    if (!html?.trim()) return res.status(400).json({ message: "Resume HTML is required." })
    const report = await interviewReportModel.findOne({ _id: req.params.interviewReportId, user: req.user.id })
    if (!report) return res.status(404).json({ message: "Interview report not found." })
    report.resumeVersions.push({ html, template })
    await report.save()
    res.status(201).json({ resumeVersion: report.resumeVersions[report.resumeVersions.length - 1] })
}

async function getResumeVersionsController(req, res) {
    const report = await interviewReportModel.findOne({ _id: req.params.interviewReportId, user: req.user.id }).select("resumeVersions")
    if (!report) return res.status(404).json({ message: "Interview report not found." })
    res.json({ resumeVersions: report.resumeVersions })
}

async function exportEditedResumePdfController(req, res) {
    const { html, template = "professional" } = req.body
    if (!html?.trim()) return res.status(400).json({ message: "Resume HTML is required." })
    const report = await interviewReportModel.findOne({ _id: req.params.interviewReportId, user: req.user.id })
    if (!report) return res.status(404).json({ message: "Interview report not found." })
    const pdfBuffer = await generateResumePdf({ resume: report.resume, selfDescription: report.selfDescription, jobDescription: report.jobDescription, html, template })
    res.set({ "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename=resume_${req.params.interviewReportId}.pdf` })
    res.send(pdfBuffer)
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController, generateResumeDraftController, saveResumeVersionController, getResumeVersionsController, exportEditedResumePdfController }
