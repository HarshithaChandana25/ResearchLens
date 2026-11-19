import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Bookmark, CheckCircle2, FileText, LoaderCircle, Sparkles, Trash2, Upload } from 'lucide-react'
import { ProcessingCoverage, RelatedPapers, ReproducibilityReport } from './components/ResearchEvidence.jsx'

const API_BASE_URL = 'http://127.0.0.1:8000'
const ANALYSIS_SECTION_LABELS = {
  research_title: 'Research title',
  authors: 'Authors',
  abstract: 'Abstract',
  research_problem: 'Research problem',
  research_objectives: 'Research objectives',
  methodology: 'Methodology',
  algorithms_models: 'Algorithms and models',
  dataset: 'Dataset',
  experimental_setup: 'Experimental setup',
  evaluation_metrics: 'Evaluation metrics',
  results_findings: 'Results and findings',
  limitations: 'Limitations',
  future_scope: 'Future scope',
  paper_summary: 'Paper summary',
}
const ANALYSIS_ASSESSMENT_FIELDS = new Set([
  'reproducibility_checklist',
  'reporting_completeness',
  'processing_coverage',
])
const PDF_UPLOAD_TIMEOUT_MS = 60_000
const ANALYSIS_TIMEOUT_MS = 300_000

async function requestJson(url, options, timeoutMs, timeoutMessage) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    const serviceLabel = url.includes('/api/analysis/')
      ? 'The Gemini analysis service'
      : 'The PDF extraction service'
    return await readJsonResponse(response, serviceLabel)
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error(timeoutMessage)
    if (error instanceof TypeError) {
      throw new Error(`Unable to reach the ResearchLens backend at ${API_BASE_URL}. Check that it is running and try again.`)
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}

async function readJsonResponse(response, serviceLabel) {
  const body = await response.text()
  let data

  try {
    data = JSON.parse(body)
  } catch {
    throw new Error(body || `The API returned an invalid JSON response (${response.status}).`)
  }

  if (!response.ok) {
    const detail = typeof data?.detail === 'string' ? data.detail : null
    if (response.status === 502 || response.status === 503) {
      throw new Error(`${serviceLabel} is temporarily unavailable.${detail ? ` ${detail}` : ' Please try again later.'}`)
    }
    throw new Error(detail || (typeof data === 'string' ? data : JSON.stringify(data)))
  }

  return data
}

function AnalysisValue({ value }) {
  if (Array.isArray(value)) {
    if (!value.length) return <p className="analysis-result-text">Not provided</p>
    return <ul className="analysis-result-list">{value.map((item, index) => <li key={index}><AnalysisValue value={item}/></li>)}</ul>
  }

  if (value !== null && typeof value === 'object') {
    return <div className="analysis-result-fields">{Object.entries(value)
      .filter(([key]) => !ANALYSIS_ASSESSMENT_FIELDS.has(key))
      .map(([key, item]) => (
      <section className="analysis-result-field" key={key}>
        <h4>{ANALYSIS_SECTION_LABELS[key] ?? key.replaceAll('_', ' ')}</h4>
        <AnalysisValue value={item}/>
      </section>
      ))}</div>
  }

  return <p className="analysis-result-text">{value === null ? 'Not provided' : String(value)}</p>
}

const createRecordId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value)

function getStoredAnalysis(record) {
  if (!isObject(record.analysis)) return null
  return isObject(record.analysis.analysis) ? record.analysis.analysis : record.analysis
}

export default function PaperAnalysisUpload({
  history = [],
  onAnalysisComplete,
  onDeleteAnalysis,
  savedPapers = [],
  onToggleSaved,
  openRecord,
}) {
  const uploadInFlight = useRef(false)
  const analysisInFlight = useRef(false)
  const [file, setFile] = useState(null)
  const [uploadedPdf, setUploadedPdf] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [analysisMessage, setAnalysisMessage] = useState('')
  const [uploadId, setUploadId] = useState('')
  const [analysisRecordId, setAnalysisRecordId] = useState('')
  const [hasAnalysis, setHasAnalysis] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [analysisError, setAnalysisError] = useState('')
  const [storedTextUnavailable, setStoredTextUnavailable] = useState(false)

  const isSaved = uploadedPdf && savedPapers.some(paper => paper.id === (uploadedPdf.paperId ?? uploadedPdf.id))
  const coverageStatus = typeof analysis?.processing_coverage?.status === 'string'
    ? analysis.processing_coverage.status.toLowerCase()
    : ''
  const isPartialAnalysis = coverageStatus === 'partial'

  const reopenRecord = record => {
    setFile(null)
    setUploadId(record.paperId ?? record.id)
    const hasStoredText = typeof record.full_text === 'string' && Boolean(record.full_text.trim())
    const pages = Array.isArray(record.pages) && record.pages.every(page =>
      Number.isInteger(page?.page_number) && page.page_number > 0 && typeof page.text === 'string',
    ) ? record.pages : []
    setUploadedPdf(hasStoredText ? {
      filename: record.filename ?? record.clientFilename ?? 'Saved paper',
      clientFilename: record.clientFilename ?? record.filename ?? 'Saved paper',
      total_pages: Number.isInteger(record.total_pages) ? record.total_pages : pages.length || undefined,
      metadata: isObject(record.metadata) ? record.metadata : {},
      full_text: record.full_text,
      pages,
      paperId: record.paperId ?? record.id,
    } : null)
    setStoredTextUnavailable(!hasStoredText)
    const storedAnalysis = getStoredAnalysis(record)
    setAnalysis(storedAnalysis)
    setAnalysisMessage(record.message ?? record.analysis?.message ?? '')
    setAnalysisRecordId(storedAnalysis ? record.id : '')
    setHasAnalysis(Boolean(storedAnalysis))
    setUploadError('')
    setAnalysisError('')
  }

  useEffect(() => {
    if (openRecord) reopenRecord(openRecord)
  }, [openRecord])

  const selectFile = event => {
    const nextFile = event.target.files?.[0] ?? null
    event.target.value = ''
    setFile(nextFile)
    setStoredTextUnavailable(false)
    setUploadedPdf(null)
    setAnalysis(null)
    setAnalysisMessage('')
    setUploadId('')
    setAnalysisRecordId('')
    setHasAnalysis(false)
    setUploadError('')
    setAnalysisError('')
  }

  const uploadPdf = async () => {
    if (!file || uploadInFlight.current || analysisInFlight.current) return

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Choose a file with a .pdf extension.')
      return
    }

    if (file.size === 0) {
      setUploadError('The selected PDF is empty. Choose a non-empty PDF file.')
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('PDF size must be 15 MB or less.')
      return
    }

    uploadInFlight.current = true
    setUploadLoading(true)
    try {
      const signature = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer())
      if (signature !== '%PDF-') {
        setUploadError('The selected file is not a valid PDF. Choose a readable PDF document.')
        uploadInFlight.current = false
        setUploadLoading(false)
        return
      }
    } catch {
      setUploadError('The selected file could not be read. Choose another PDF and try again.')
      uploadInFlight.current = false
      setUploadLoading(false)
      return
    }

    setUploadedPdf(null)
    setAnalysis(null)
    setAnalysisMessage('')
    setAnalysisRecordId('')
    setHasAnalysis(false)
    setUploadError('')
    setAnalysisError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await requestJson(`${API_BASE_URL}/api/pdf/upload`, {
        method: 'POST',
        body: formData,
      }, PDF_UPLOAD_TIMEOUT_MS, 'PDF upload or extraction took too long. Check the backend and try uploading again.')

      if (typeof result?.full_text !== 'string' || !Array.isArray(result.pages)) {
        throw new Error('The PDF upload response must include full_text and pages.')
      }
      if (!result.full_text.trim()) {
        throw new Error('No selectable text was extracted from this PDF. It may be scanned or unreadable.')
      }

      const pagesAreValid = result.pages.every(page =>
        Number.isInteger(page?.page_number) && page.page_number > 0 && typeof page.text === 'string',
      )
      if (!pagesAreValid) {
        throw new Error('The PDF upload response included an invalid pages entry.')
      }

      const id = createRecordId()
      setUploadId(id)
      setUploadedPdf({ ...result, clientFilename: file.name, paperId: id })
      setStoredTextUnavailable(false)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : String(error))
    } finally {
      uploadInFlight.current = false
      setUploadLoading(false)
    }
  }

  const runAnalysis = async () => {
    if (!uploadedPdf || analysisInFlight.current || uploadInFlight.current) return
    if (!uploadedPdf.full_text.trim()) {
      setAnalysisError('Extracted paper text is unavailable. Upload the PDF again before analyzing it.')
      return
    }

    analysisInFlight.current = true
    setAnalysisLoading(true)
    setAnalysisError('')

    try {
      const requestBody = { paper_text: uploadedPdf.full_text }
      requestBody.pages = (uploadedPdf.pages ?? []).map(({ page_number, text }) => ({ page_number, text }))

      const result = await requestJson(`${API_BASE_URL}/api/analysis/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }, ANALYSIS_TIMEOUT_MS, 'No analysis response arrived within five minutes. The backend may still be processing; confirm it is idle before retrying to avoid duplicate work.')
      if (!isObject(result?.analysis)) {
        throw new Error('The analysis response did not include the expected analysis object.')
      }

      const record = {
        id: createRecordId(),
        paperId: uploadedPdf.paperId ?? uploadId,
        filename: uploadedPdf.filename ?? file?.name ?? 'Uploaded paper',
        clientFilename: uploadedPdf.clientFilename ?? file?.name ?? 'Uploaded paper',
        total_pages: uploadedPdf.total_pages,
        metadata: uploadedPdf.metadata,
        full_text: uploadedPdf.full_text,
        pages: uploadedPdf.pages,
        message: result.message,
        analysis: result.analysis,
        createdAt: new Date().toISOString(),
      }
      setAnalysis(result.analysis)
      setAnalysisMessage(typeof result.message === 'string' ? result.message : '')
      setHasAnalysis(true)
      setAnalysisRecordId(record.id)
      onAnalysisComplete?.(record)
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : String(error))
    } finally {
      analysisInFlight.current = false
      setAnalysisLoading(false)
    }
  }

  return (
    <section className="panel pdf-analysis-panel" aria-labelledby="pdf-analysis-title">
      <div className="pdf-analysis-heading">
        <div>
          <h3 id="pdf-analysis-title"><FileText size={17}/> Analyze a PDF</h3>
          <p>Upload a paper to extract its text and request Gemini analysis.</p>
        </div>
        <span className="sample-tag">BACKEND ANALYSIS</span>
      </div>

      <div className="pdf-upload-controls">
        <label className={`pdf-file-picker ${uploadLoading || analysisLoading ? 'disabled' : ''}`}>
          <Upload size={16}/>
          <span>{file ? file.name : 'Choose a PDF file'}</span>
          <input type="file" accept=".pdf,application/pdf" onChange={selectFile} disabled={uploadLoading || analysisLoading}/>
        </label>
        <button className="btn primary" onClick={uploadPdf} disabled={!file || uploadLoading || analysisLoading}>
          {uploadLoading ? <LoaderCircle className="loading-icon" size={16}/> : <Upload size={16}/>}
          {uploadLoading ? 'Uploading…' : 'Upload PDF'}
        </button>
      </div>

      {uploadLoading && <p className="pdf-status" role="status"><LoaderCircle className="loading-icon" size={15}/> Uploading PDF and extracting text…</p>}
      {uploadError && <p className="pdf-status error" role="alert"><AlertCircle size={15}/>{uploadError}</p>}
      {uploadedPdf && (
        <div className="pdf-status success" role="status">
          <CheckCircle2 size={15}/>
          <span>
            PDF processed: {typeof uploadedPdf.filename === 'string' ? uploadedPdf.filename : file?.name}
            {typeof uploadedPdf.total_pages === 'number' ? ` · ${uploadedPdf.total_pages} pages` : ''}
            {' · '}{uploadedPdf.full_text.length.toLocaleString()} extracted characters
          </span>
        </div>
      )}
      {storedTextUnavailable && (
        <p className="pdf-status warning" role="status">This saved record has no extracted paper text. Review its stored analysis if available, or upload the PDF again to run a new analysis.</p>
      )}

      {uploadedPdf && (
        <div className="pdf-analysis-action">
          <button className="btn secondary" onClick={runAnalysis} disabled={analysisLoading || uploadLoading}>
            {analysisLoading ? <LoaderCircle className="loading-icon" size={16}/> : <Sparkles size={16}/>}
            {analysisLoading ? 'Analyzing…' : hasAnalysis ? 'Run analysis again' : 'Analyze paper'}
          </button>
          <button className="btn secondary" onClick={() => onToggleSaved?.({
            id: uploadedPdf.paperId ?? uploadId,
            filename: uploadedPdf.filename ?? file?.name ?? 'Uploaded paper',
            clientFilename: uploadedPdf.clientFilename ?? file?.name ?? 'Uploaded paper',
            total_pages: uploadedPdf.total_pages,
            metadata: uploadedPdf.metadata,
            full_text: uploadedPdf.full_text,
            pages: uploadedPdf.pages,
          })}>
            <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'}/>
            {isSaved ? 'Saved to library' : 'Save paper'}
          </button>
          {analysisLoading && <span className="pdf-inline-status" role="status">Gemini is analyzing the paper. Longer papers may take a few minutes; please wait before retrying.</span>}
        </div>
      )}

      {analysisLoading && hasAnalysis && <p className="pdf-inline-status" role="status">Your previous analysis remains available while the new request is processing.</p>}
      {analysisError && <p className="pdf-status error" role="alert"><AlertCircle size={15}/>{analysisError}</p>}
      {hasAnalysis && <ProcessingCoverage analysis={analysis}/>}
      {hasAnalysis && (
        <div className="backend-analysis-result">
          <div className="backend-analysis-title"><Sparkles size={17}/><h3>{isPartialAnalysis ? 'Partial Gemini research analysis' : 'Gemini research analysis'}</h3><span className="success-label">{coverageStatus === 'complete' ? analysisMessage || 'Full text processed' : isPartialAnalysis ? 'Partial coverage' : 'Coverage unverified'}</span></div>
          {isPartialAnalysis && (
            <p className="pdf-status warning" role="alert"><AlertCircle size={15}/>Only part of this paper was analyzed. The results below may omit information in the unprocessed text ranges.</p>
          )}
          {coverageStatus && coverageStatus !== 'complete' && !isPartialAnalysis && (
            <p className="pdf-status warning" role="status"><AlertCircle size={15}/>The backend did not confirm full-paper processing; review the coverage status before interpreting these results as complete.</p>
          )}
          {!analysis?.processing_coverage && (
            <p className="pdf-status warning" role="status"><AlertCircle size={15}/>Processing coverage was not included in this response, so full-paper coverage cannot be confirmed.</p>
          )}
          <AnalysisValue value={analysis}/>
        </div>
      )}
      {hasAnalysis && <ReproducibilityReport analysis={analysis}/>}
      {uploadedPdf && <RelatedPapers/>}

      <section className="panel analysis-history-panel">
        <div className="evidence-heading">
          <div><h3>Analysis history</h3><p>Saved in this browser only.</p></div>
        </div>
        {history.length ? (
          <div className="analysis-history-list">
            {history.map(record => (
              <article className="analysis-history-row" key={record.id}>
                <div>
                  <b>{record.metadata?.title || record.filename}</b>
                  <span>{record.metadata?.author || 'Author metadata unavailable'} · {new Date(record.createdAt).toLocaleString()}</span>
                </div>
                <button className="btn secondary" onClick={() => reopenRecord(record)}>Reopen</button>
                <button className="icon-btn" aria-label={`Delete analysis of ${record.metadata?.title || record.filename}`} title="Delete analysis" onClick={() => onDeleteAnalysis?.(record.id)}><Trash2 size={16}/></button>
              </article>
            ))}
          </div>
        ) : (
          <div className="evidence-empty compact">
            <FileText size={19}/>
            <span>No analyses saved yet. Upload and analyze a PDF to add it here.</span>
          </div>
        )}
      </section>

      {analysisRecordId && !history.some(record => record.id === analysisRecordId) && (
        <p className="pdf-inline-status" role="status">This open analysis is not in the saved history.</p>
      )}
    </section>
  )
}
