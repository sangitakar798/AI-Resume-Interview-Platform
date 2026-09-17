const { GoogleGenAI, Type } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

// Zod Schema Definition
const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question that can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question that can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
     preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    atsAnalysis: z.object({
        score: z.number().describe("ATS compatibility score between 0 and 100"),
        scoreBreakdown: z.object({
            keywordAlignment: z.number().describe("Score between 0 and 100 for job-description keyword coverage"),
            experienceAlignment: z.number().describe("Score between 0 and 100 for relevant experience evidence"),
            resumeStructure: z.number().describe("Score between 0 and 100 for ATS-readable formatting and structure")
        }),
        matchedKeywords: z.array(z.string()).describe("Important job-description keywords clearly supported by the candidate supplied information"),
        missingKeywords: z.array(z.string()).describe("Important job-description keywords not supported by the candidate supplied information"),
        suggestions: z.array(z.string()).describe("Specific, truthful improvements the candidate can make to their resume"),
        summary: z.string().describe("A concise explanation of the ATS assessment")
    }).describe("ATS keyword and resume-quality analysis"),
    title: z.string().describe("The title of the job for which the interview report is generated")
});

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate an interview report for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Also provide an ATS analysis. Compare only the supplied resume/self-description against the job description. Do not treat a keyword as matched unless the candidate supplied information supports it. Never suggest adding a skill, certification, metric, or experience the candidate cannot truthfully substantiate. Keep keyword lists focused (maximum 12 each) and suggestions actionable (maximum 5).`;

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash", 
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    matchScore: { type: Type.NUMBER, description: "A score between 0 and 100 indicating how well the candidate's profile matches the job description" },
                    technicalQuestions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                intention: { type: Type.STRING },
                                answer: { type: Type.STRING }
                            },
                            required: ["question", "intention", "answer"]
                        }
                    },
                    behavioralQuestions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                intention: { type: Type.STRING },
                                answer: { type: Type.STRING }
                            },
                            required: ["question", "intention", "answer"]
                        }
                    },
                    skillGaps: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                skill: { type: Type.STRING },
                                severity: { type: Type.STRING, enum: ["low", "medium", "high"] }
                            },
                            required: ["skill", "severity"]
                        }
                    },
                    preparationPlan: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                day: { type: Type.INTEGER },
                                focus: { type: Type.STRING },
                                tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                             required: ["day", "focus", "tasks"]
                        }
                    },
                    atsAnalysis: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.NUMBER, description: "ATS compatibility score from 0 to 100" },
                            scoreBreakdown: {
                                type: Type.OBJECT,
                                properties: {
                                    keywordAlignment: { type: Type.NUMBER },
                                    experienceAlignment: { type: Type.NUMBER },
                                    resumeStructure: { type: Type.NUMBER }
                                },
                                required: ["keywordAlignment", "experienceAlignment", "resumeStructure"]
                            },
                            matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                            summary: { type: Type.STRING }
                        },
                        required: ["score", "scoreBreakdown", "matchedKeywords", "missingKeywords", "suggestions", "summary"]
                    },
                    title: { type: Type.STRING }
                },
                required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan", "atsAnalysis", "title"]
            }
        }
    });

    return JSON.parse(response.text);
}

const COMPACT_RESUME_STYLES = `
    @page { size: A4; margin: 8mm 11mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
        color: #1f2937;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 9.5pt;
        line-height: 1.22;
    }
    h1 { margin: 0 0 2px; font-size: 19pt; line-height: 1.08; color: #111827; }
    h2 {
        margin: 8px 0 3px;
        padding-bottom: 1px;
        border-bottom: 1px solid #94a3b8;
        font-size: 10pt;
        line-height: 1.2;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: #1e3a5f;
        break-after: avoid;
    }
    h3 { margin: 5px 0 1px; font-size: 10pt; line-height: 1.2; color: #111827; break-after: avoid; }
    p { margin: 1px 0; }
    ul { margin: 2px 0 3px; padding-left: 15px; }
    li { margin: 0; }
    header, section, article, .experience, .education, .project { break-inside: auto; }
    a { color: inherit; text-decoration: none; }
`;

// function addCompactResumeStyles(htmlContent) {
//     const styleTag = `<style>${COMPACT_RESUME_STYLES}</style>`;
//     // Resume HTML is AI-generated. Remove its custom CSS so that inline margins,
//     // spacer rules, or page-break rules cannot introduce blank areas in the PDF.
//     const normalizedHtml = htmlContent
//         .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
//         .replace(/\sstyle=(['"])[\s\S]*?\1/gi, "")
//         .replace(/(<br\s*\/?>\s*){2,}/gi, "<br>")
//         .replace(/<(p|div)\b[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/\1>/gi, "");

//     if (/<\/head>/i.test(normalizedHtml)) {
//         return normalizedHtml.replace(/<\/head>/i, `${styleTag}</head>`);
//     }

//     return `<!doctype html><html><head>${styleTag}</head><body>${normalizedHtml}</body></html>`;
// }

const RESUME_TEMPLATE_STYLES = {
    professional: `
        body { color: #1f2937; }
        h1 { color: #111827; }
        h2 { color: #1e3a5f; border-color: #94a3b8; }
    `,
    minimal: `
        body { color: #262626; font-family: Georgia, 'Times New Roman', serif; }
        h1 { color: #171717; font-size: 20pt; }
        h2 { color: #171717; border-color: #d4d4d4; letter-spacing: .04em; }
        h3 { color: #262626; }
    `
};

function normalizeTemplate(template) {
    return template === "minimal" ? "minimal" : "professional";
}

function sanitizeResumeHtml(htmlContent) {
    const bodyMatch = htmlContent.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : htmlContent;

    return bodyContent
        .replace(/<(script|style|iframe|object|embed|link|meta|base)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
        .replace(/<(script|iframe|object|embed|link|meta|base)\b[^>]*\/?\s*>/gi, "")
        .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
        .replace(/\sstyle=(['"])[\s\S]*?\1/gi, "")
        .replace(/\s(?:href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\1/gi, "")
        .replace(/(<br\s*\/?>\s*){2,}/gi, "<br>")
        .replace(/<(p|div)\b[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/\1>/gi, "");
}

function addCompactResumeStyles(htmlContent, template) {
    const selectedTemplate = normalizeTemplate(template);
    const styleTag = `<style>${COMPACT_RESUME_STYLES}${RESUME_TEMPLATE_STYLES[selectedTemplate]}</style>`;

    const normalizedHtml = sanitizeResumeHtml(htmlContent);

    return `<!doctype html><html><head><meta charset="utf-8">${styleTag}</head><body>${normalizedHtml}</body></html>`;
}



async function generatePdfFromHtml(htmlContent, template) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(addCompactResumeStyles(htmlContent, template), { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4",
        preferCSSPageSize: true,
        printBackground: true,
        margin: { top: "8mm", bottom: "8mm", left: "11mm", right: "11mm" }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumeDraft({ resume, selfDescription, jobDescription }) {
    const resumePdfSchema = z.object({
        html: z.string().describe("Semantic HTML content of the resume")
    })

    const prompt = `Generate a tailored ATS-friendly resume for this candidate.
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Return JSON with one field html. Return semantic HTML only. Use h1 for the candidate name, h2 for section headings, h3 for roles/projects, p for details, and ul/li for achievements. Preserve every factual contact detail found in the supplied candidate information, including email, phone, portfolio, LinkedIn, GitHub, and other website URLs. Use an a element with a valid mailto: or https: href for email addresses and URLs. Do not invent skills, certifications, metrics, employers, dates, contact details, or experience. Fit on one A4 page where possible. Avoid tables, spacer elements, empty paragraphs, repeated br tags, large margins/padding, fixed heights, or page-break CSS.`

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: zodToJsonSchema(resumePdfSchema) }
    })
    return resumePdfSchema.parse(JSON.parse(response.text))
}

async function generateResumePdf({ resume, selfDescription, jobDescription, html, template = "professional" }) {
    const resumeHtml = html || (await generateResumeDraft({ resume, selfDescription, jobDescription })).html
    return generatePdfFromHtml(resumeHtml, template)
}

async function scoreMockAnswer({
    question,
    questionType,
    answer,
    jobDescription
}) {

    const prompt = `
Evaluate this mock interview answer.

Question type: ${questionType}

Question:
${question}

Candidate answer:
${answer}

Job description:
${jobDescription}

Return ONLY valid JSON.

You MUST return exactly these six fields:

{
  "clarity": number,
  "relevance": number,
  "technicalDepth": number,
  "overallScore": number,
  "feedback": "string",
  "improvedAnswer": "string"
}

Rules:

- clarity must be a number from 0 to 100
- relevance must be a number from 0 to 100
- technicalDepth must be a number from 0 to 100
- overallScore must be a number from 0 to 100
- feedback must be a concise explanation of what the candidate did well and what they should improve
- improvedAnswer must be a better version of the candidate's answer
- Do not invent experience, projects, technologies, metrics, certifications, or achievements
- For behavioral questions, technicalDepth should still be a number from 0 to 100, but judge it according to the technical substance actually required by the question
- Do not return markdown
- Do not return additional fields
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: prompt,

        config: {
            responseMimeType: "application/json",

            responseSchema: {
                type: Type.OBJECT,

                properties: {
                    clarity: {
                        type: Type.NUMBER,
                        description: "Clarity score from 0 to 100"
                    },

                    relevance: {
                        type: Type.NUMBER,
                        description: "Relevance score from 0 to 100"
                    },

                    technicalDepth: {
                        type: Type.NUMBER,
                        description: "Technical depth score from 0 to 100"
                    },

                    overallScore: {
                        type: Type.NUMBER,
                        description: "Overall answer score from 0 to 100"
                    },

                    feedback: {
                        type: Type.STRING,
                        description: "Actionable feedback for the candidate"
                    },

                    improvedAnswer: {
                        type: Type.STRING,
                        description: "Improved version of the candidate answer"
                    }
                },

                required: [
                    "clarity",
                    "relevance",
                    "technicalDepth",
                    "overallScore",
                    "feedback",
                    "improvedAnswer"
                ]
            }
        }
    });

    console.log("RAW MOCK AI RESPONSE:");
    console.log(response.text);

    const result = JSON.parse(response.text);

    return {
        clarity: Number(result.clarity),
        relevance: Number(result.relevance),
        technicalDepth: Number(result.technicalDepth),
        overallScore: Number(result.overallScore),
        feedback: String(result.feedback || ""),
        improvedAnswer: String(result.improvedAnswer || "")
    };
}

module.exports = { generateInterviewReport, generateResumeDraft, generateResumePdf, scoreMockAnswer }
