import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Bookmark,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  BookOpen,
  HelpCircle,
  Cpu,
  Layers,
  Database,
  Sliders,
  BarChart2,
  Award,
  ShieldAlert,
  Compass,
  Tag,
  Target,
  ExternalLink,
  Printer,
  ChevronRight,
  LoaderCircle,
  FileCode,
} from 'lucide-react'
import {
  ANALYSIS_SECTIONS,
  requestPaperAnalysis,
  generateDemoAnalysis,
} from '../services/analysisService'
import { exportAnalysisToMarkdown, exportAnalysisToJson } from '../utils/exportUtils'
import { checkBackendHealth } from '../services/api'
import CitationModal from '../components/CitationModal'
import { ReproducibilityReport, ProcessingCoverage } from '../components/ResearchEvidence'

export default function PaperAnalysis({
  papers = [],
  savedIds = [],
  onToggleSave,
  activePaper = null,
  uploadedPaper = null,
  onSaveAnalysis,
  onToast,
  onNavigate,
}) {
  const [selectedPaper, setSelectedPaper] = useState(activePaper || papers[0])
  const [analysis, setAnalysis] = useState(activePaper?.analysis || papers[0]?.analysis)
  const [expandedSections, setExpandedSections] = useState(() => {
    const all = {}
    ANALYSIS_SECTIONS.forEach(s => { all[s.key] = true })
    return all
  })
  const [analyzing, setAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState('sections') // 'sections' | 'findings' | 'glossary' | 'evidence' | 'reproducibility'
  const [citationModalOpen, setCitationModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Sync when activePaper or uploadedPaper changes from props
  useEffect(() => {
    if (uploadedPaper) {
      const initialAnalysis = uploadedPaper.analysis?.analysis || uploadedPaper.analysis || generateDemoAnalysis(
        uploadedPaper.metadata?.title || uploadedPaper.filename,
        uploadedPaper.metadata?.author || 'Uploaded Author',
      )
      setSelectedPaper({
        id: uploadedPaper.paperId || uploadedPaper.id,
        title: uploadedPaper.metadata?.title || uploadedPaper.filename,
        authors: uploadedPaper.metadata?.author || 'Extracted manuscript',
        year: 2024,
        venue: 'PDF Upload',
        topic: uploadedPaper.metadata?.subject || 'Uploaded Document',
        isUpload: true,
        full_text: uploadedPaper.full_text,
        pages: uploadedPaper.pages,
        analysis: initialAnalysis,
      })
      setAnalysis(initialAnalysis)
    } else if (activePaper) {
      setSelectedPaper(activePaper)
      setAnalysis(activePaper.analysis || generateDemoAnalysis(activePaper.title, activePaper.authors))
    }
  }, [activePaper, uploadedPaper])

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleAll = (expand) => {
    const updated = {}
    ANALYSIS_SECTIONS.forEach(s => { updated[s.key] = expand })
    setExpandedSections(updated)
  }

  const handleRunGeminiAnalysis = async () => {
    if (analyzing) return
    setAnalyzing(true)

    try {
      const health = await checkBackendHealth()
      if (health.online && selectedPaper.full_text) {
        const result = await requestPaperAnalysis(selectedPaper.full_text, selectedPaper.pages || [])
        const rawAnalysis = result.analysis?.analysis || result.analysis
        setAnalysis(rawAnalysis)
        onSaveAnalysis?.({
          id: `hist-${Date.now()}`,
          paperId: selectedPaper.id,
          filename: selectedPaper.title,
          metadata: { title: selectedPaper.title, author: selectedPaper.authors },
          analysis: rawAnalysis,
          createdAt: new Date().toISOString(),
        })
        onToast?.('Gemini full-text analysis completed successfully via FastAPI.')
      } else {
        // Offline preview fallback
        await new Promise(r => setTimeout(r, 700))
        const demo = generateDemoAnalysis(selectedPaper.title, selectedPaper.authors)
        setAnalysis(demo)
        onToast?.('Loaded structured research analysis model (Demo Mode).')
      }
    } catch (err) {
      onToast?.(err.message || 'Analysis request failed.')
    } finally {
      setAnalyzing(false)
    }
  }

  const isSaved = selectedPaper && savedIds.includes(selectedPaper.id)

  const getSectionIcon = (iconName) => {
    switch (iconName) {
      case 'FileText': return <FileText size={16} />
      case 'AlertCircle': return <AlertCircle size={16} />
      case 'Target': return <Target size={16} />
      case 'HelpCircle': return <HelpCircle size={16} />
      case 'Cpu': return <Cpu size={16} />
      case 'Database': return <Database size={16} />
      case 'Layers': return <Layers size={16} />
      case 'Sliders': return <Sliders size={16} />
      case 'BarChart2': return <BarChart2 size={16} />
      case 'Award': return <Award size={16} />
      case 'ShieldAlert': return <ShieldAlert size={16} />
      case 'Compass': return <Compass size={16} />
      default: return <FileText size={16} />
    }
  }

  return (
    <div className="analysis-page">
      {/* Header & Paper Switcher */}
      <div className="analysis-hero-card">
        <div className="hero-top-row">
          <div className="paper-selector-wrap">
            <span className="selector-label">Active Research Paper:</span>
            <select
              className="paper-dropdown"
              value={selectedPaper?.id || 1}
              onChange={(e) => {
                const found = papers.find(p => String(p.id) === e.target.value)
                if (found) {
                  setSelectedPaper(found)
                  setAnalysis(found.analysis || generateDemoAnalysis(found.title, found.authors))
                }
              }}
            >
              {papers.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.year})
                </option>
              ))}
            </select>
          </div>

          <div className="hero-actions-row">
            <button
              className={`btn secondary ${isSaved ? 'active' : ''}`}
              onClick={() => onToggleSave?.(selectedPaper.id)}
            >
              <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
              {isSaved ? 'Saved in Library' : 'Save Paper'}
            </button>
            <button
              className="btn secondary"
              onClick={() => setCitationModalOpen(true)}
            >
              <BookOpen size={15} /> Cite
            </button>
            <button
              className="btn primary"
              disabled={analyzing}
              onClick={handleRunGeminiAnalysis}
            >
              {analyzing ? (
                <>
                  <LoaderCircle size={15} className="spin" /> Analyzing with Gemini...
                </>
              ) : (
                <>
                  <Sparkles size={15} /> Request Gemini Analysis
                </>
              )}
            </button>
          </div>
        </div>

        <div className="paper-meta-banner">
          <div className="paper-meta-main">
            <span className="topic-tag">{selectedPaper?.topic || 'Artificial Intelligence'}</span>
            <span className="meta-dot">•</span>
            <span className="venue-tag">{selectedPaper?.venue} {selectedPaper?.year}</span>
            {selectedPaper?.doi && (
              <>
                <span className="meta-dot">•</span>
                <span className="doi-tag">DOI: {selectedPaper.doi}</span>
              </>
            )}
            <h2>{selectedPaper?.title}</h2>
            <p className="authors-text">{selectedPaper?.authors}</p>
          </div>

          <div className="paper-quick-stats">
            <div className="quick-stat">
              <b>{selectedPaper?.citations?.toLocaleString() || '1,200+'}</b>
              <span>Citations</span>
            </div>
            <div className="quick-stat">
              <b>{analysis?.reporting_completeness?.percentage ? `${analysis.reporting_completeness.percentage}%` : '91%'}</b>
              <span>Documentation</span>
            </div>
            <div className="quick-stat">
              <b>12 / 12</b>
              <span>Sections Analyzed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="analysis-tabs-bar">
        <div className="tab-buttons">
          <button
            className={`analysis-tab-btn ${activeTab === 'sections' ? 'active' : ''}`}
            onClick={() => setActiveTab('sections')}
          >
            <Layers size={15} /> Comprehensive 12-Section Breakdown
          </button>
          <button
            className={`analysis-tab-btn ${activeTab === 'findings' ? 'active' : ''}`}
            onClick={() => setActiveTab('findings')}
          >
            <Award size={15} /> Key Findings ({analysis?.key_findings?.length || 4})
          </button>
          <button
            className={`analysis-tab-btn ${activeTab === 'glossary' ? 'active' : ''}`}
            onClick={() => setActiveTab('glossary')}
          >
            <Tag size={15} /> Key Terminology ({analysis?.glossary?.length || 3})
          </button>
          <button
            className={`analysis-tab-btn ${activeTab === 'evidence' ? 'active' : ''}`}
            onClick={() => setActiveTab('evidence')}
          >
            <BookOpen size={15} /> Evidence & Page Citations
          </button>
          <button
            className={`analysis-tab-btn ${activeTab === 'reproducibility' ? 'active' : ''}`}
            onClick={() => setActiveTab('reproducibility')}
          >
            <CheckCircle2 size={15} /> Reproducibility Report
          </button>
        </div>

        <div className="export-dropdown-wrap">
          <button
            className="btn secondary small-btn"
            onClick={() => exportAnalysisToMarkdown(analysis, selectedPaper?.title)}
            title="Export as Markdown"
          >
            <Download size={14} /> Export Markdown
          </button>
          <button
            className="btn secondary small-btn"
            onClick={() => exportAnalysisToJson(analysis, selectedPaper?.title)}
            title="Export as JSON"
          >
            <FileCode size={14} /> Export JSON
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'sections' && (
        <div className="sections-container">
          <div className="sections-controls">
            <span className="controls-label">
              Organized into 12 academic dimensions with evidence citations
            </span>
            <div className="controls-buttons">
              <button className="text-link-subtle" onClick={() => toggleAll(true)}>
                Expand All
              </button>
              <span>•</span>
              <button className="text-link-subtle" onClick={() => toggleAll(false)}>
                Collapse All
              </button>
            </div>
          </div>

          <div className="accordion-list">
            {ANALYSIS_SECTIONS.map((sec, idx) => {
              const isExpanded = expandedSections[sec.key]
              const content = analysis?.[sec.key] || 'Analysis in progress or not stated in paper.'

              return (
                <div
                  className={`accordion-item ${isExpanded ? 'open' : ''}`}
                  key={sec.key}
                >
                  <button
                    className="accordion-header"
                    onClick={() => toggleSection(sec.key)}
                  >
                    <div className="accordion-title-wrap">
                      <span className="section-index">{idx + 1}</span>
                      <div className="section-icon">{getSectionIcon(sec.icon)}</div>
                      <b>{sec.label}</b>
                    </div>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isExpanded && (
                    <div className="accordion-body">
                      <p className="section-content-text">{content}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'findings' && (
        <div className="findings-container">
          <div className="findings-grid">
            {(analysis?.key_findings || [
              'Demonstrates that recurrence is non-essential for state-of-the-art sequence modeling.',
              'Reduces training time by an order of magnitude due to complete token parallelization.',
              'Multi-head attention allows the model to jointly attend to information from different representation subspaces.',
              'Ablation studies reveal crucial dependency on first 4,000 warmup steps.',
            ]).map((finding, idx) => (
              <div className="finding-card" key={idx}>
                <div className="finding-num">0{idx + 1}</div>
                <div className="finding-content">
                  <h4>Key Takeaway</h4>
                  <p>{finding}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'glossary' && (
        <div className="glossary-container">
          <div className="glossary-grid">
            {(analysis?.glossary || [
              { term: 'Attention Mechanism', definition: 'A mechanism that allows models to dynamically weight the relevance of different input tokens.' },
              { term: 'Multi-Head Attention', definition: 'Linear projections of queries, keys, and values into multiple representation subspaces computed in parallel.' },
              { term: 'Positional Encoding', definition: 'Sinusoidal functions injected into input embeddings to provide token order information.' },
            ]).map((item, idx) => (
              <div className="glossary-card" key={idx}>
                <div className="term-badge"><Tag size={12} /> {item.term}</div>
                <p>{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'evidence' && (
        <div className="evidence-container">
          <div className="evidence-card-list">
            {(analysis?.evidence_references || [
              { section: 'Methodology', page: 3, quote: 'We introduce multi-head attention to allow the model to jointly attend to information from different representation subspaces.' },
              { section: 'Results', page: 7, quote: 'On the WMT 2014 English-to-German translation task, the big transformer model out-performs the best previously reported models by more than 2.0 BLEU.' },
              { section: 'Limitations', page: 6, quote: 'The computational complexity of self-attention per layer is O(n^2 · d), which can become a bottleneck for long sequences.' },
            ]).map((ref, idx) => (
              <div className="evidence-ref-card" key={idx}>
                <div className="evidence-ref-header">
                  <span className="evidence-section-pill">{ref.section}</span>
                  <span className="page-citation-pill">Page {ref.page}</span>
                </div>
                <blockquote className="evidence-quote">"{ref.quote}"</blockquote>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reproducibility' && (
        <div className="repro-tab-wrap">
          <ReproducibilityReport analysis={analysis} />
          <ProcessingCoverage analysis={analysis} />
        </div>
      )}

      {/* Citation Modal */}
      {citationModalOpen && (
        <CitationModal
          paper={selectedPaper}
          onClose={() => setCitationModalOpen(false)}
          onToast={onToast}
        />
      )}
    </div>
  )
}
