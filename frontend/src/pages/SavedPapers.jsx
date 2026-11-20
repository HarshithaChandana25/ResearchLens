import React, { useState } from 'react'
import {
  Bookmark,
  FileText,
  BookOpen,
  Sparkles,
  Trash2,
  Download,
  Search,
  ArrowUpRight,
} from 'lucide-react'
import CitationModal from '../components/CitationModal'
import { downloadFile } from '../utils/exportUtils'

export default function SavedPapers({
  papers = [],
  savedIds = [],
  savedUploads = [],
  onToggleSave,
  onToggleUploadedSave,
  onOpenPaper,
  onOpenUpload,
  onToast,
  onNavigate,
}) {
  const [search, setSearch] = useState('')
  const [selectedCitationPaper, setSelectedCitationPaper] = useState(null)

  const savedCanonical = papers.filter(p => savedIds.includes(p.id))
  const filteredCanonical = savedCanonical.filter(p =>
    (p.title + ' ' + p.authors + ' ' + p.topic).toLowerCase().includes(search.toLowerCase()),
  )
  const filteredUploads = savedUploads.filter(u =>
    (u.metadata?.title || u.filename).toLowerCase().includes(search.toLowerCase()),
  )

  const totalSaved = filteredCanonical.length + filteredUploads.length

  const handleExportCSV = () => {
    const rows = [
      ['Title', 'Authors', 'Year', 'Venue', 'Topic', 'Citations'],
      ...savedCanonical.map(p => [p.title, p.authors, p.year, p.venue, p.topic, p.citations]),
      ...savedUploads.map(u => [u.metadata?.title || u.filename, u.metadata?.author || 'N/A', 2024, 'PDF Upload', u.metadata?.subject || 'N/A', 0]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    downloadFile(csv, `saved-papers-${Date.now()}.csv`, 'text/csv')
    onToast?.('Saved papers list exported as CSV.')
  }

  return (
    <div className="saved-papers-page">
      {/* Intro Header */}
      <div className="page-intro-box">
        <div className="intro-content">
          <div className="eyebrow"><Bookmark size={14} /> BOOKMARKED LITERATURE</div>
          <h2>Saved Papers</h2>
          <p>
            Quick access to your curated research papers. Review key metadata, generate APA/IEEE citations,
            and jump into in-depth AI analysis.
          </p>
        </div>

        <button className="btn secondary" onClick={handleExportCSV}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Search Bar */}
      <div className="library-search-strip">
        <div className="search-field-mini">
          <Search size={15} />
          <input
            placeholder="Search saved papers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="library-count-text">
          {totalSaved} bookmarked publications
        </span>
      </div>

      {totalSaved === 0 ? (
        <div className="empty-panel">
          <Bookmark size={36} />
          <h3>No Saved Papers Found</h3>
          <p>You haven't bookmarked any papers matching this search query.</p>
          <button className="btn primary" onClick={() => onNavigate('Discover Papers')}>
            Discover Papers
          </button>
        </div>
      ) : (
        <div className="library-items-list">
          {filteredCanonical.map(paper => (
            <div className="library-paper-row" key={paper.id}>
              <div className="paper-symbol">
                <FileText size={18} />
              </div>

              <div className="paper-info">
                <button
                  className="paper-name"
                  onClick={() => onOpenPaper(paper)}
                >
                  {paper.title}
                </button>
                <div className="paper-meta">
                  {paper.authors} <span>•</span> {paper.year} <span>•</span> {paper.venue} <span>•</span> {paper.topic}
                </div>
                {paper.tags && (
                  <div className="tag-row">
                    {paper.tags.map(t => (
                      <span className="tag" key={t}>{t}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="paper-row-actions">
                <button
                  className="icon-btn cite-btn"
                  onClick={() => setSelectedCitationPaper(paper)}
                  title="Generate Citation"
                >
                  <BookOpen size={16} />
                </button>
                <button
                  className="icon-btn delete-btn"
                  onClick={() => onToggleSave(paper.id)}
                  title="Remove bookmark"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  className="btn primary small-btn"
                  onClick={() => onOpenPaper(paper)}
                >
                  <Sparkles size={13} /> AI Analysis <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          ))}

          {filteredUploads.map(upload => (
            <div className="library-paper-row uploaded" key={upload.id}>
              <div className="paper-symbol upload-symbol">
                <FileText size={18} />
              </div>

              <div className="paper-info">
                <button
                  className="paper-name"
                  onClick={() => onOpenUpload(upload)}
                >
                  {upload.metadata?.title || upload.filename}
                </button>
                <div className="paper-meta">
                  {upload.metadata?.author || 'Extracted manuscript'} <span>•</span> {upload.total_pages ? `${upload.total_pages} pages` : 'PDF'}
                </div>
                <div className="tag-row">
                  <span className="tag uploaded-tag">Uploaded PDF</span>
                </div>
              </div>

              <div className="paper-row-actions">
                <button
                  className="icon-btn delete-btn"
                  onClick={() => onToggleUploadedSave(upload)}
                  title="Remove upload"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  className="btn primary small-btn"
                  onClick={() => onOpenUpload(upload)}
                >
                  <Sparkles size={13} /> View Analysis
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCitationPaper && (
        <CitationModal
          paper={selectedCitationPaper}
          onClose={() => setSelectedCitationPaper(null)}
          onToast={onToast}
        />
      )}
    </div>
  )
}
