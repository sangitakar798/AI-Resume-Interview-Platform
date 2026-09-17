import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useCallback, useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

     const { loading, setLoading, report, setReport, reports, setReports, error, setError } = context

    const getErrorMessage = useCallback((requestError) =>
        requestError.response?.data?.message || "Unable to complete the request. Please try again."
    , [])

    const generateReport = useCallback(async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        setError(null)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
        } catch (requestError) {
            setError(getErrorMessage(requestError))
        } finally {
            setLoading(false)
        }

        return response?.interviewReport ?? null
    }, [getErrorMessage, setError, setLoading, setReport])

     const getReportById = useCallback(async (interviewId) => {
        setLoading(true)
        setError(null)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (requestError) {
            setError(getErrorMessage(requestError))
        } finally {
            setLoading(false)
        }
        return response?.interviewReport ?? null
    }, [getErrorMessage, setError, setLoading, setReport])

    const getReports = useCallback(async () => {
        setLoading(true)
        setError(null)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
       } catch (requestError) {
            setError(getErrorMessage(requestError))
        } finally {
            setLoading(false)
        }

        return response?.interviewReports ?? null
    }, [getErrorMessage, setError, setLoading, setReports])

    // const getResumePdf = async (interviewReportId) => {
    //     setLoading(true)
    //     setError(null)
        const getResumePdf = useCallback(async (interviewReportId) => {
        setLoading(true)
        setError(null)
        try {
            const pdfData = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ pdfData ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        }
        catch (requestError) {
            setError(getErrorMessage(requestError))
        } finally {
            setLoading(false)
        }
    }, [getErrorMessage, setError, setLoading])

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [interviewId, getReportById, getReports])

    return { loading, report, reports, error, setError, generateReport, getReportById, getReports, getResumePdf }
    

}
