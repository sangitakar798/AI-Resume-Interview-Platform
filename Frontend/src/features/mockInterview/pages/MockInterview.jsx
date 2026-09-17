import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { startMockInterview, submitMockAnswer } from '../services/mockInterview.api';
import { getInterviewReportById } from '../../interview/services/interview.api';
import './mock-interview.scss';

export default function MockInterview() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null); const [session, setSession] = useState(null);
  const [mode, setMode] = useState('mixed'); const [timePerQuestion, setTimePerQuestion] = useState(120);
  const [index, setIndex] = useState(0); const [seconds, setSeconds] = useState(120);
  const [answer, setAnswer] = useState(''); const [result, setResult] = useState(null); const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false); const recognitionRef = useRef(null);

  useEffect(() => {
    let active = true;
    getInterviewReportById(interviewId)
      .then(r => { if (active) setReport(r.interviewReport); })
      .catch(() => { if (active) setReport(false); });
    return () => { active = false; };
  }, [interviewId]);

  const start = async () => {
    try {
      setBusy(true);

      const r = await startMockInterview({
        interviewReportId: interviewId,
        mode,
        timePerQuestion
      });

      setSession(r.mockInterview);
      setIndex(0);
      setSeconds(Number(timePerQuestion));
      setAnswer("");
      setResult(null);

    } catch (error) {
      console.error(
        "Start mock interview error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Failed to start mock interview."
      );

    } finally {
      setBusy(false);
    }
  };
  
  const handleSubmit = useCallback(async (timedOut = false) => {
    if (!session || busy) return;

    setBusy(true);

    try {
      const r = await submitMockAnswer(
        session._id,
        {
          questionIndex: index,
          answer
        }
      );

      setResult({
        ...r.result,
        timedOut
      });

    } catch (error) {
      console.error(
        "Submit mock answer error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Failed to score your answer."
      );

    } finally {
      setBusy(false);
    }
  }, [answer, busy, index, session]);
  useEffect(() => {
    if (!session || result) return undefined;
    const timer = setInterval(() => setSeconds(s => s <= 1 ? 0 : s - 1), 1000);
    return () => clearInterval(timer);
  }, [session, index, result]);

  useEffect(() => {
    if (session && seconds === 0 && !busy && !result) Promise.resolve().then(() => handleSubmit(true));
  }, [session, seconds, busy, result, handleSubmit]);

const next = () => {
    const isLastQuestion =
        index + 1 === session.questions.length;

    if (isLastQuestion) {
        // Finish mock interview
        navigate(`/interview/${session.interviewReport}`);
        return;
    }

    // Move to next question
    setIndex(index + 1);
    setAnswer("");
    setResult(null);
    setSeconds(session.timePerQuestion);
};
  const toggleRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition is not supported in this browser. You can type your answer instead.'); return; }
    if (recording) { recognitionRef.current?.stop(); setRecording(false); return; }
    const recognition = new SR(); recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-IN';
    recognition.onresult = e => { let text = ''; for (let i = e.resultIndex; i < e.results.length; i++) text += e.results[i][0].transcript + ' '; setAnswer(prev => `${prev} ${text}`.trim()); };
    recognition.onend = () => setRecording(false); recognition.start(); recognitionRef.current = recognition; setRecording(true);
  };

  if (!report) return <main className='feature-loading'>Loading mock interview...</main>;
  if (!session) return <main className='mock-page'><div className='mock-start'><button className='text-button' onClick={() => navigate(`/interview/${interviewId}`)}>← Report</button><h1>Interactive Mock Interview</h1><p>Practice one question at a time and get AI feedback after each answer.</p><label>Mode<select value={mode} onChange={e => setMode(e.target.value)}><option value='mixed'>Mixed</option><option value='technical'>Technical</option><option value='behavioral'>Behavioral</option></select></label><label>Time per question<select value={timePerQuestion} onChange={e => setTimePerQuestion(Number(e.target.value))}><option value='60'>60 seconds</option><option value='90'>90 seconds</option><option value='120'>2 minutes</option><option value='180'>3 minutes</option></select></label><button className='primary' onClick={start}>Start Mock Interview</button></div></main>;

  const q = session.questions[index];
  return <main className='mock-page'><div className='mock-card'><div className='mock-top'><span>Question {index + 1} / {session.questions.length}</span><strong className={seconds < 20 ? 'danger' : ''}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</strong></div><h1>{q.question}</h1><span className='question-type'>{q.type}</span>{!result ? <><textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder='Type your answer here...' /><div className='answer-actions'><button onClick={toggleRecording}>{recording ? 'Stop recording' : '🎙 Record answer'}</button><button className='primary' disabled={busy} onClick={() => handleSubmit(false)}>{busy ? 'Scoring...' : 'Submit answer'}</button></div></> : <div className='feedback'><h2>AI Feedback</h2><div className='score-grid'><Metric label='Clarity' value={result.clarity} /><Metric label='Relevance' value={result.relevance} /><Metric label='Technical depth' value={result.technicalDepth} /><Metric label='Overall' value={result.overallScore} /></div><p>{result.feedback}</p><div className='improved'><h3>Improved answer</h3><p>{result.improvedAnswer}</p></div><button
    className="primary"
    onClick={next}
>
    {index + 1 === session.questions.length
        ? "Finish"
        : "Next question"}
</button></div>}</div></main>;
}
const Metric = ({ label, value }) => <div className='metric'><strong>{value}</strong><span>{label}</span></div>;
