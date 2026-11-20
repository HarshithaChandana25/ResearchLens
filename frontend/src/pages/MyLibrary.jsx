import React, { useState } from 'react'
import {
  Library,
  Bookmark,
  FolderPlus,
  Download,
  Trash2,
  FileText,
  BookOpen,
  Plus,
  Sparkles,
  ArrowUpRight,
  Search,
  Tag,
  Check,
} from 'lucide-react'
import CitationModal from '../components/CitationModal'
import { downloadFile } from '../utils/exportUtils'

export default function MyLibrary({
  papers = [],
  savedIds = [],
  savedUploads = [],
  collections = [],
  onToggleSave,
  onToggleUploadedSave,
  onOpenPaper,
  onOpenUpload,
  onCreateCollection,
  onToast,
  onNavigate,
}) {
  const [activeCollectionId, setActiveCollectionId] = useState('all')
  const [newCollectionName, setNewCollectionName] = useState('')
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [selectedCitationPaper, setSelectedCitationPaper] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')

  // Canonical saved papers
  const savedCanonical = papers.filter(p => savedIds.includes(p.id))

  // Filter based on active collection
  const displayedCanonical = savedCanonical.filter(p => {
    if (activeCollectionId === 'all') return true
    const activeCol = collections.find(c => c.id === activeCollectionId)
    return activeCol ? activeCol.paperIds.includes(p.id) : true
  }).filter(p => {
    if (!searchFilter) return true
    return (p.title + ' ' + p.authors).toLowerCase().includes(searchFilter.toLowerCase())
  })

  const displayedUploads = (activeCollectionId === 'all' ? savedUploads : []).filter(u => {
    if (!searchFilter) return true
    return (u.metadata?.title || u.filename).toLowerCase().includes(searchFilter.toLowerCase())
  })

  const totalCount = displayedCanonical.length + displayedUploads.length

  const handleExportCSV = () => {
    const rows = [
      ['Title', 'Authors', 'Year', 'Venue', 'Topic', 'Citations', 'Type'],
      ...savedCanonical.map(p => [p.title, p.authors, p.year, p.venue, p.topic, p.citations, 'Landmark Publication']),
      ...savedUploads.map(u => [u.metadata?.title || u.filename, u.metadata?.author || 'N/A', 2024, 'PDF Upload', u.metadata?.subject || 'N/A', 0, 'User PDF Upload']),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    downloadFile(csv, `researchlens-library-${Date.now()}.csv`, 'text/csv')
    onToast?.('Exported personal library CSV successfully.')
  }

  const handleCreateCollection = (e) => {
    e.preventDefault()
    if (!newCollectionName.trim()) return
    const newCol = {
      id: `col-${Date.now()}`,
      name: newCollectionName.trim(),
      color: '#8b5cf6',
      description: 'Custom research collection',
      paperIds: [],
    }
    onCreateCollection?.(newCol)
    setNewCollectionName('')
    setIsCreatingCollection(false)
    onToast?.(`Created collection "${newCol.name}".`)
  }

  return (
    <div className="library-page">
      {/* Intro Header */}
      <div className="page-intro-box">
        <div className="intro-content">
          <div className="eyebrow"><Library size={14} /> PERSISTENT RESEARCH REPOSITORY</div>
          <h2>My Research Library</h2>
          <p>
            Organize bookmarked literature and uploaded manuscripts into thematic collections,
            generate consolidated citations, and export library records to CSV.
          </p>
        </div>

        <div className="library-actions">
          <button className="btn secondary" onClick={handleExportCSV}>
            <Download size={15} /> Export Library CSV
          </button>
          <button
            className="btn primary"
            onClick={() => setIsCreatingCollection(true)}
          >
            <FolderPlus size={15} /> New Collection
          </button>
        </div>
      </div>

      {/* Collections Tabs Bar */}
      <div className="collections-bar">
        <button
          className={`collection-tab ${activeCollectionId === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCollectionId('all')}
        >
          All Papers ({savedIds.length + savedUploads.length})
        </button>

        {collections.map(col => (
          <button
            key={col.id}
            className={`collection-tab ${activeCollectionId === col.id ? 'active' : ''}`}
            onClick={() => setActiveCollectionId(col.id)}
          >
            <span className="col-dot" style={{ background: col.color || '#8b5cf6' }} />
            {col.name} ({col.paperIds?.length || 0})
          </button>
        ))}
      </div>

      {/* Create Collection Dialog */}
      {isCreatingCollection && (
        <form className="new-collection-card" onSubmit={handleCreateCollection}>
          <div className="collection-input-row">
            <input
              placeholder="Collection name (e.g. 'Thesis Chapter 2', 'LLM Hallucinations')..."
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn primary small-btn">Create</button>
            <button
              type="button"
              className="btn secondary small-btn"
              onClick={() => setIsCreatingCollection(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search within library */}
      <div className="library-search-strip">
        <div className="search-field-mini">
          <Search size={15} />
          <input
            placeholder="Search within saved library..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
        <span className="library-count-text">
          {totalCount} saved publications displayed
        </span>
      </div>

      {/* Content List */}
      {totalCount === 0 ? (
        <div className="empty-panel">
          <Bookmark size={36} />
          <h3>Your Library is Empty</h3>
          <p>You haven't saved any papers to this collection yet.</p>
          <button className="btn primary" onClick={() => onNavigate('Discover Papers')}>
            Discover Papers to Save
          </button>
        </div>
      ) : (
        <div className="library-items-list">
          {/* Canonical Papers */}
          {displayedCanonical.map(paper => (
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
                  title="Remove from library"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  className="btn secondary small-btn"
                  onClick={() => onOpenPaper(paper)}
                >
                  <Sparkles size={13} /> Analyze
                </button>
              </div>
            </div>
          ))}

          {/* Uploaded Papers */}
          {displayedUploads.map(upload => (
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
                  {upload.metadata?.author || 'Extracted manuscript'} <span>•</span> {upload.total_pages ? `${upload.total_pages} pages` : 'PDF'} <span>•</span> Uploaded {new Date(upload.createdAt).toLocaleDateString()}
                </div>
                <div className="tag-row">
                  <span className="tag uploaded-tag">Uploaded PDF</span>
                </div>
              </div>

              <div className="paper-row-actions">
                <button
                  className="icon-btn cite-btn"
                  onClick={() => setSelectedCitationPaper({
                    title: upload.metadata?.title || upload.filename,
                    authors: upload.metadata?.author || 'Author',
                    year: 2024,
                    venue: 'Extracted PDF',
                  })}
                  title="Cite Upload"
                >
                  <BookOpen size={16} />
                </button>
                <button
                  className="icon-btn delete-btn"
                  onClick={() => onToggleUploadedSave(upload)}
                  title="Remove upload"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  className="btn secondary small-btn"
                  onClick={() => onOpenUpload(upload)}
                >
                  <Sparkles size={13} /> View Analysis
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Citation Modal */}
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
