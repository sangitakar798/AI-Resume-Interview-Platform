import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { getResumeDraft, getResumeVersions, saveResumeVersion, exportResumePdf } from '../services/resume.api';
import { getInterviewReportById } from '../../interview/services/interview.api';
import LoadingScreen from '../../../components/LoadingScreen';
import './resume-editor.scss';
import './resume-links.scss';
const linkPattern = /(https?:\/\/[^\s<]+|www\.[^\s<]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/gi;

const getLinkHref = value => value.includes('@') && !value.startsWith('http') ? `mailto:${value}` : value.startsWith('www.') ? `https://${value}` : value;

function makeResumeLinksVisible(sourceHtml) {
  const document = new DOMParser().parseFromString(sourceHtml || '', 'text/html');
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) if (!node.parentElement.closest('a, script, style')) textNodes.push(node);

  textNodes.forEach(textNode => {
    const value = textNode.nodeValue;
    linkPattern.lastIndex = 0;
    if (!linkPattern.test(value)) return;
    linkPattern.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    value.replace(linkPattern, (match, index) => {
      fragment.append(value.slice(lastIndex, index));
      const link = document.createElement('a');
      link.href = getLinkHref(match);
      link.textContent = match;
      link.target = '_blank';
      link.rel = 'noreferrer noopener';
      fragment.append(link);
      lastIndex = index + match.length;
      return match;
    });
    fragment.append(value.slice(lastIndex));
    textNode.replaceWith(fragment);
  });

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href')?.trim() || '';
    if (!/^(https?:|mailto:)/i.test(href)) link.removeAttribute('href');
    else { link.target = '_blank'; link.rel = 'noreferrer noopener'; }
  });
  return document.body.innerHTML;
}


export default function ResumeEditor() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [report, setReport] = useState(null);
  const [html, setHtml] = useState('');
  const [template, setTemplate] = useState('professional');
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) { setLoading(true); setError(''); }
    });
    (async () => {
      try {
        const [{ interviewReport }, versionData] = await Promise.all([
          getInterviewReportById(interviewId), getResumeVersions(interviewId)
        ]);
        if (!active) return;
        
        setReport(interviewReport);
        setVersions(versionData.resumeVersions || []);
        const latest = versionData.resumeVersions?.at(-1);
        if (latest) {
          // setHtml(makeResumeLinksVisible(latest.html)); setTemplate(latest.template); setSelectedVersion(latest._id);
          setHtml(makeResumeLinksVisible(latest.html)); setTemplate(latest.template); setSelectedVersion(latest._id);

        } else {
          const draft = await getResumeDraft(interviewId);
          if (!active) return;
          setHtml(makeResumeLinksVisible(draft.draft.html));
        }
        setIsDirty(false);
      }  catch (e) { if (active) setError(e.response?.data?.message || 'Unable to load resume editor.'); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [interviewId]);

  // Keep the editor unmanaged while typing so React does not reset its caret.
  useEffect(() => { if (editorRef.current && html && editorRef.current.innerHTML !== html) editorRef.current.innerHTML = html; }, [html]);

  const handleSave = async () => {
    const currentHtml = editorRef.current?.innerHTML || html;
    // if (!currentHtml.trim()) return setError('Add resume content before saving.');
    if (!currentHtml.trim()) return setError('Add resume content before saving.');

    setSaving(true); setError('');
    try {
      const { resumeVersion } = await saveResumeVersion(interviewId, { html: currentHtml, template });
      // setVersions(v => [...v, resumeVersion]); setSelectedVersion(resumeVersion._id); setIsDirty(false);
      setVersions(v => [...v, resumeVersion]); setSelectedVersion(resumeVersion._id); setIsDirty(false);
    } catch (e) { setError(e.response?.data?.message || 'Unable to save resume version.'); }
    finally { setSaving(false); }
  };

  const handleExport = async () => {
    const currentHtml = editorRef.current?.innerHTML || html;
    if (!currentHtml.trim()) return setError('Add resume content before exporting.');
    setExporting(true); setError('');
    try {
      const blob = await exportResumePdf(interviewId, { html: currentHtml, template });
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = `resume_${interviewId}.pdf`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);

    }catch (e) { setError(e.response?.data?.message || 'Unable to export PDF.'); }
    finally { setExporting(false); }
  };

  const loadVersion = id => {
    const version = versions.find(v => v._id === id); if (!version) return;
     if (isDirty && !window.confirm('Discard unsaved edits and load this version?')) return;
    setSelectedVersion(id); setHtml(makeResumeLinksVisible(version.html)); setTemplate(version.template); setIsDirty(false);
  };

  // if (loading) return <LoadingScreen label="Preparing your resume editor..." />;
  if (loading) return <LoadingScreen label="Preparing your resume editor..." />;

  return <main className='resume-editor-page'>
    <header className='feature-header'>
      <div><button className='text-button' onClick={() => navigate(`/interview/${interviewId}`)}>← Interview Report</button><h1>Resume Editor</h1><p>{report?.title || 'Tailored resume'}</p></div>
      {/* <div className='editor-actions'><select aria-label="Resume template" value={template} onChange={e => { setTemplate(e.target.value); setIsDirty(true); }}><option value='professional'>Professional</option><option value='minimal'>Minimal</option></select><button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Version'}</button><button onClick={handleExport} disabled={exporting}>{exporting ? 'Exporting...' : 'Export PDF'}</button></div> */}
      <div className='editor-actions'><select aria-label="Resume template" value={template} onChange={e => { setTemplate(e.target.value); setIsDirty(true); }}><option value='professional'>Professional</option><option value='minimal'>Minimal</option></select><button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Version'}</button><button onClick={handleExport} disabled={exporting}>{exporting ? 'Exporting...' : 'Export PDF'}</button></div>

    </header>
    {error && <p className='feature-error'>{error}</p>}
    <section className='editor-layout'>
      <aside className='version-panel'><h2>Saved Versions</h2>{versions.length === 0 && <p>No saved versions yet.</p>}{versions.map((v, i) => <button key={v._id} className={selectedVersion === v._id ? 'version active' : 'version'} onClick={() => loadVersion(v._id)}><strong>Version {i + 1}</strong><span>{v.template}</span><small>{new Date(v.createdAt).toLocaleString()}</small></button>)}</aside>
      <section className={`resume-canvas resume-canvas--${template}`}>
        {/* <div ref={editorRef} className='resume-document' contentEditable suppressContentEditableWarning onInput={() => setIsDirty(true)} onClick={event => {
          const link = event.target.closest('a[href]');
          if (link && (event.metaKey || event.ctrlKey)) window.open(link.href, '_blank', 'noopener,noreferrer');
        }} /> */}
         <div ref={editorRef} className='resume-document' contentEditable suppressContentEditableWarning onInput={() => setIsDirty(true)} onClick={event => {
          const link = event.target.closest('a[href]');
          if (link && (event.metaKey || event.ctrlKey)) window.open(link.href, '_blank', 'noopener,noreferrer');
        }} />
      </section>
    </section>
    {/* <p className='editor-tip'>{isDirty ? 'You have unsaved changes. ' : ''}Click text in the resume to edit it. Links are underlined; Ctrl/Cmd-click a link to open it while editing. Save Version creates a snapshot you can switch back to later.</p> */}
    <p className='editor-tip'>{isDirty ? 'You have unsaved changes. ' : ''}Click text in the resume to edit it. Links are underlined; Ctrl/Cmd-click a link to open it while editing. Save Version creates a snapshot you can switch back to later.</p>

  </main>;
}
