import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Trash2,
  Sparkles,
  Bookmark,
  Eye,
  ArrowRight,
  Database,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import {
  validatePdfFile,
  uploadPdfForExtraction,
  generateDemoExtraction,
  MAX_PDF_SIZE_BYTES,
} from '../services/pdfService'
import { checkBackendHealth } from '../services/api'

export default function UploadPapers({
  savedUploads = [],
  onUploadSuccess,
  onSaveUpload,
  onDeleteUpload,
  onOpenAnalysis,
  onToast,
}) {
  const fileInputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [successResult, setSuccessResult] = useState(null)
  const [previewTab, setPreviewTab] = useState('metadata') // 'metadata' | 'text'
  const [recentUploads, setRecentUploads] = useState(savedUploads)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0])
    }
  }

  const processSelectedFile = async (file) => {
    setErrorMessage('')
    setSuccessResult(null)

    const validation = await validatePdfFile(file)
    if (!validation.valid) {
      setErrorMessage(validation.error)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const handleUploadAndExtract = async () => {
    if (!selectedFile || uploadLoading) return

    setUploadLoading(true)
    setUploadProgress(20)
    setErrorMessage('')

    try {
      // Check if backend is alive
      const health = await checkBackendHealth()
      setUploadProgress(45)

      let result
      if (health.online) {
        setUploadProgress(65)
        result = await uploadPdfForExtraction(selectedFile)
        setUploadProgress(100)
      } else {
        // Backend offline -> provide demo extraction with transparent notice
        setUploadProgress(85)
        await new Promise(r => setTimeout(r, 600)) // smooth UI feel
        result = generateDemoExtraction(selectedFile)
        setUploadProgress(100)
      }

      setSuccessResult(result)
      const uploadRecord = {
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        paperId: `upload-${Date.now()}`,
        filename: result.filename,
        clientFilename: selectedFile.name,
        fileSize: selectedFile.size,
        total_pages: result.total_pages,
        metadata: result.metadata,
        full_text: result.full_text,
        pages: result.pages,
        isDemoExtraction: result.isDemoExtraction,
        createdAt: new Date().toISOString(),
      }

      onUploadSuccess?.(uploadRecord)
      setRecentUploads(prev => [uploadRecord, ...prev])
      onToast?.(`Extracted text from ${selectedFile.name} successfully.`)
    } catch (err) {
      setErrorMessage(err.message || 'PDF extraction failed. Please try again.')
    } finally {
      setUploadLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="upload-page">
      <div className="page-intro-box">
        <div className="intro-content">
          <div className="eyebrow"><ShieldCheck size={14} /> PYMUPDF PDF EXTRACTION PIPELINE</div>
          <h2>Upload Research Papers</h2>
          <p>
            Extract selectable text, structured page boundaries, and embedded author metadata from academic PDF manuscripts.
            Integrates directly with the FastAPI backend service.
          </p>
        </div>
        <div className="intro-badge">
          <span className="status-dot green" />
          <span>Max Size: 15 MB / PDF</span>
        </div>
      </div>

      <div className="upload-grid">
        {/* Left Column: Drag & Drop Zone */}
        <div className="upload-column-main">
          <div
            className={`dropzone-card ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileInput}
            />

            <div className="dropzone-icon-wrap">
              <UploadCloud size={38} />
            </div>

            <div className="dropzone-copy">
              <h3>{selectedFile ? selectedFile.name : 'Choose a PDF file or drag & drop it here'}</h3>
              <p>Supports scientific manuscripts, preprints, conference proceedings (up to 15 MB)</p>
            </div>

            <button
              type="button"
              className="btn secondary"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              Browse Files
            </button>
          </div>

          {/* Selected File Details & Actions */}
          {selectedFile && (
            <div className="selected-file-card">
              <div className="file-info-row">
                <div className="file-icon"><FileText size={20} /></div>
                <div className="file-meta">
                  <b>{selectedFile.name}</b>
                  <span>{formatFileSize(selectedFile.size)} • PDF Document</span>
                </div>
                <button
                  className="icon-btn"
                  onClick={() => {
                    setSelectedFile(null)
                    setSuccessResult(null)
                    setErrorMessage('')
                  }}
                  title="Remove file"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {uploadLoading && (
                <div className="upload-progress-wrap">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <div className="progress-label">
                    <span><LoaderCircle size={13} className="spin" /> Processing document and extracting text...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="status-banner error">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="upload-action-row">
                <button
                  className="btn primary"
                  disabled={uploadLoading}
                  onClick={handleUploadAndExtract}
                >
                  {uploadLoading ? (
                    <>
                      <LoaderCircle size={16} className="spin" /> Extracting Text...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Run PDF Extraction
                    </>
                  )}
                </button>
                <span className="upload-note">Validates %PDF- signature and parses text blocks</span>
              </div>
            </div>
          )}

          {/* Extracted Paper Preview */}
          {successResult && (
            <div className="extraction-result-card">
              <div className="result-header">
                <div className="result-header-left">
                  <CheckCircle2 size={18} className="success-icon" />
                  <div>
                    <h4>Extracted Manuscript Metadata</h4>
                    <p>
                      {successResult.total_pages} Pages • {successResult.full_text.length.toLocaleString()} Characters
                    </p>
                  </div>
                </div>
                {successResult.isDemoExtraction ? (
                  <span className="sample-tag">DEMO EXTRACTION (BACKEND OFFLINE)</span>
                ) : (
                  <span className="status-pill green">FastAPI / PyMuPDF Verified</span>
                )}
              </div>

              {successResult.isDemoExtraction && (
                <div className="notice-box">
                  <AlertCircle size={16} />
                  <span>
                    Note: The local FastAPI server on port 8000 was unreachable, so sample extraction was used for prototype preview.
                    Start the FastAPI backend with <code>python main.py</code> to run live PyMuPDF extraction.
                  </span>
                </div>
              )}

              <div className="tab-pills">
                <button
                  className={`tab-pill ${previewTab === 'metadata' ? 'active' : ''}`}
                  onClick={() => setPreviewTab('metadata')}
                >
                  Extracted Metadata
                </button>
                <button
                  className={`tab-pill ${previewTab === 'text' ? 'active' : ''}`}
                  onClick={() => setPreviewTab('text')}
                >
                  Text Preview (Page 1)
                </button>
              </div>

              {previewTab === 'metadata' ? (
                <div className="metadata-table">
                  <div className="meta-row">
                    <b>Document Title</b>
                    <span>{successResult.metadata?.title || successResult.filename}</span>
                  </div>
                  <div className="meta-row">
                    <b>Author(s)</b>
                    <span>{successResult.metadata?.author || 'Not declared in PDF metadata'}</span>
                  </div>
                  <div className="meta-row">
                    <b>Subject / Field</b>
                    <span>{successResult.metadata?.subject || 'Computer Science / AI'}</span>
                  </div>
                  <div className="meta-row">
                    <b>PDF Producer</b>
                    <span>{successResult.metadata?.creator || 'Academic Typesetting System'}</span>
                  </div>
                </div>
              ) : (
                <div className="text-preview-box">
                  <pre>
                    {successResult.pages && successResult.pages[0]
                      ? successResult.pages[0].text
                      : successResult.full_text.slice(0, 1000) + '...'}
                  </pre>
                </div>
              )}

              <div className="result-cta-strip">
                <button
                  className="btn primary"
                  onClick={() => onOpenAnalysis?.(successResult)}
                >
                  <Sparkles size={16} /> Proceed to AI Paper Analysis <ArrowRight size={15} />
                </button>
                <button
                  className="btn secondary"
                  onClick={() => onSaveUpload?.(successResult)}
                >
                  <Bookmark size={15} /> Save to My Library
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Upload History / Queue */}
        <div className="upload-column-side">
          <div className="panel side-history-panel">
            <div className="panel-title">
              <div>
                <h3>Uploaded Papers ({recentUploads.length})</h3>
                <p>Extracted manuscripts stored in browser</p>
              </div>
            </div>

            {recentUploads.length === 0 ? (
              <div className="empty-subtle">
                <FileText size={24} />
                <p>No papers uploaded yet.</p>
                <span>Upload a PDF to view its extracted text and run AI analysis.</span>
              </div>
            ) : (
              <div className="history-items">
                {recentUploads.map((item) => (
                  <div className="history-card" key={item.id}>
                    <div className="history-card-top">
                      <div className="history-icon"><FileText size={16} /></div>
                      <div className="history-title-wrap">
                        <b>{item.metadata?.title || item.clientFilename || item.filename}</b>
                        <span>
                          {item.total_pages ? `${item.total_pages} pages • ` : ''}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        className="icon-btn delete-btn"
                        onClick={() => onDeleteUpload?.(item.id)}
                        title="Delete record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="history-card-actions">
                      <button
                        className="btn secondary small-btn"
                        onClick={() => onOpenAnalysis?.(item)}
                      >
                        <Sparkles size={13} /> Analyze
                      </button>
                      <button
                        className="btn secondary small-btn"
                        onClick={() => {
                          setSuccessResult(item)
                          setSelectedFile({ name: item.filename, size: item.fileSize || 102400 })
                        }}
                      >
                        <Eye size={13} /> View Text
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
