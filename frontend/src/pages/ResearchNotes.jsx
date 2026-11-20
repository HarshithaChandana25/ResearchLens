import React, { useState } from 'react'
import {
  StickyNote,
  Highlighter,
  Plus,
  Trash2,
  Edit3,
  Bookmark,
  Search,
  Tag,
  Download,
  Check,
  FileText,
  Calendar,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import { downloadFile } from '../utils/exportUtils'

export default function ResearchNotes({
  notes = [],
  highlights = [],
  papers = [],
  onSaveNote,
  onDeleteNote,
  onSaveHighlight,
  onDeleteHighlight,
  onToast,
  onOpenPaper,
}) {
  const [activeTab, setActiveTab] = useState('notes') // 'notes' | 'highlights'
  const [search, setSearch] = useState('')
  const [isCreatingNote, setIsCreatingNote] = useState(false)
  const [isCreatingHighlight, setIsCreatingHighlight] = useState(false)

  // New Note Form State
  const [noteTitle, setNoteTitle] = useState('')
  const [notePaperId, setNotePaperId] = useState(papers[0]?.id || 1)
  const [noteContent, setNoteContent] = useState('')
  const [noteTags, setNoteTags] = useState('Architecture, Scaling')

  // New Highlight Form State
  const [hlQuote, setHlQuote] = useState('')
  const [hlPaperId, setHlPaperId] = useState(papers[0]?.id || 1)
  const [hlPage, setHlPage] = useState(1)
  const [hlComment, setHlComment] = useState('')
  const [hlTag, setHlTag] = useState('Key Finding')

  const handleCreateNoteSubmit = (e) => {
    e.preventDefault()
    if (!noteTitle.trim() || !noteContent.trim()) return

    const matchedPaper = papers.find(p => p.id === Number(notePaperId))
    const newNote = {
      id: `note-${Date.now()}`,
      title: noteTitle.trim(),
      paperId: Number(notePaperId),
      paperTitle: matchedPaper ? matchedPaper.title : 'General Research Thought',
      content: noteContent.trim(),
      tags: noteTags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSaveNote?.(newNote)
    setNoteTitle('')
    setNoteContent('')
    setIsCreatingNote(false)
    onToast?.(`Note "${newNote.title}" saved.`)
  }

  const handleCreateHighlightSubmit = (e) => {
    e.preventDefault()
    if (!hlQuote.trim()) return

    const matchedPaper = papers.find(p => p.id === Number(hlPaperId))
    const newHl = {
      id: `hl-${Date.now()}`,
      paperId: Number(hlPaperId),
      paperTitle: matchedPaper ? matchedPaper.title : 'Research Paper',
      quote: hlQuote.trim(),
      page: Number(hlPage) || 1,
      comment: hlComment.trim(),
      tag: hlTag.trim() || 'Highlight',
      createdAt: new Date().toISOString(),
    }

    onSaveHighlight?.(newHl)
    setHlQuote('')
    setHlComment('')
    setIsCreatingHighlight(false)
    onToast?.('Smart highlight saved.')
  }

  const filteredNotes = notes.filter(n => {
    return (n.title + ' ' + n.content + ' ' + (n.paperTitle || '') + ' ' + (n.tags ? n.tags.join(' ') : '')).toLowerCase().includes(search.toLowerCase())
  })

  const filteredHighlights = highlights.filter(h => {
    return (h.quote + ' ' + h.comment + ' ' + (h.paperTitle || '') + ' ' + (h.tag || '')).toLowerCase().includes(search.toLowerCase())
  })

  const handleExportNotes = () => {
    let md = `# ResearchLens Persistent Research Notes\n\n`
    notes.forEach(n => {
      md += `## ${n.title}\n`
      md += `**Linked Paper:** ${n.paperTitle}\n`
      md += `**Tags:** ${(n.tags || []).join(', ')}\n`
      md += `**Date:** ${new Date(n.createdAt).toLocaleDateString()}\n\n`
      md += `${n.content}\n\n---\n\n`
    })
    downloadFile(md, `researchlens-notes-${Date.now()}.md`, 'text/markdown')
    onToast?.('Research notes exported as Markdown.')
  }

  return (
    <div className="notes-page">
      {/* Intro Header */}
      <div className="page-intro-box">
        <div className="intro-content">
          <div className="eyebrow"><StickyNote size={14} /> SCHOLARLY ANNOTATIONS & EXCERPTS</div>
          <h2>Research Notes & Smart Highlights</h2>
          <p>
            Capture observations, mathematical equations, and methodological critiques linked to specific publications.
            Preserve high-signal quotes with precise page numbers.
          </p>
        </div>

        <div className="notes-actions">
          <button className="btn secondary" onClick={handleExportNotes}>
            <Download size={15} /> Export Notes .md
          </button>
          {activeTab === 'notes' ? (
            <button className="btn primary" onClick={() => setIsCreatingNote(true)}>
              <Plus size={15} /> New Research Note
            </button>
          ) : (
            <button className="btn primary" onClick={() => setIsCreatingHighlight(true)}>
              <Plus size={15} /> Add Smart Highlight
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search Strip */}
      <div className="notes-nav-bar">
        <div className="tab-buttons">
          <button
            className={`analysis-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <StickyNote size={15} /> Research Notes ({notes.length})
          </button>
          <button
            className={`analysis-tab-btn ${activeTab === 'highlights' ? 'active' : ''}`}
            onClick={() => setActiveTab('highlights')}
          >
            <Highlighter size={15} /> Smart Highlights ({highlights.length})
          </button>
        </div>

        <div className="search-field-mini">
          <Search size={15} />
          <input
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* CREATE NEW NOTE MODAL / CARD */}
      {isCreatingNote && (
        <form className="create-note-card" onSubmit={handleCreateNoteSubmit}>
          <div className="card-form-header">
            <h4><StickyNote size={16} /> New Research Note</h4>
            <button
              type="button"
              className="icon-btn small"
              onClick={() => setIsCreatingNote(false)}
            >
              ×
            </button>
          </div>

          <div className="form-group">
            <label>Note Title:</label>
            <input
              placeholder="e.g. KV Cache Memory Scaling Bounds"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Linked Research Paper:</label>
              <select
                value={notePaperId}
                onChange={(e) => setNotePaperId(e.target.value)}
              >
                {papers.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tags (comma separated):</label>
              <input
                placeholder="Architecture, Scaling, Efficiency"
                value={noteTags}
                onChange={(e) => setNoteTags(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Content (Markdown supported):</label>
            <textarea
              rows={4}
              placeholder="Write your research observations, mathematical observations, and notes here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              required
            />
          </div>

          <div className="form-actions-right">
            <button
              type="button"
              className="btn secondary"
              onClick={() => setIsCreatingNote(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Save Research Note
            </button>
          </div>
        </form>
      )}

      {/* CREATE NEW HIGHLIGHT FORM */}
      {isCreatingHighlight && (
        <form className="create-note-card" onSubmit={handleCreateHighlightSubmit}>
          <div className="card-form-header">
            <h4><Highlighter size={16} /> Add Smart Highlight</h4>
            <button
              type="button"
              className="icon-btn small"
              onClick={() => setIsCreatingHighlight(false)}
            >
              ×
            </button>
          </div>

          <div className="form-group">
            <label>Passage / Quote:</label>
            <textarea
              rows={3}
              placeholder="Paste exact excerpt from paper manuscript..."
              value={hlQuote}
              onChange={(e) => setHlQuote(e.target.value)}
              required
            />
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label>Source Paper:</label>
              <select
                value={hlPaperId}
                onChange={(e) => setHlPaperId(e.target.value)}
              >
                {papers.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Page Number:</label>
              <input
                type="number"
                min={1}
                value={hlPage}
                onChange={(e) => setHlPage(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Highlight Tag:</label>
              <input
                placeholder="Efficiency / Architecture"
                value={hlTag}
                onChange={(e) => setHlTag(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Comment / Critique (Optional):</label>
            <input
              placeholder="Why this quote is significant..."
              value={hlComment}
              onChange={(e) => setHlComment(e.target.value)}
            />
          </div>

          <div className="form-actions-right">
            <button
              type="button"
              className="btn secondary"
              onClick={() => setIsCreatingHighlight(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Save Highlight
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT: RESEARCH NOTES */}
      {activeTab === 'notes' && (
        <div className="notes-list-grid">
          {filteredNotes.length === 0 ? (
            <div className="empty-panel">
              <StickyNote size={34} />
              <h3>No Research Notes Found</h3>
              <p>Add observations, insights, or hypotheses linked to publications.</p>
              <button className="btn primary" onClick={() => setIsCreatingNote(true)}>
                <Plus size={15} /> Create Note
              </button>
            </div>
          ) : (
            filteredNotes.map(note => {
              const match = papers.find(p => p.id === note.paperId)

              return (
                <div className="note-card" key={note.id}>
                  <div className="note-card-top">
                    <div className="note-meta-left">
                      <span className="linked-paper-pill">
                        <BookOpen size={12} /> {note.paperTitle}
                      </span>
                      <small className="note-date">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </small>
                    </div>

                    <button
                      className="icon-btn delete-btn"
                      onClick={() => onDeleteNote?.(note.id)}
                      title="Delete note"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <h4>{note.title}</h4>
                  <p className="note-content-body">{note.content}</p>

                  <div className="note-card-footer">
                    <div className="tag-row">
                      {(note.tags || []).map(t => (
                        <span className="mini-tag" key={t}>{t}</span>
                      ))}
                    </div>

                    {match && (
                      <button
                        className="text-link-subtle"
                        onClick={() => onOpenPaper(match)}
                      >
                        Inspect Paper <Sparkles size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* TAB CONTENT: SMART HIGHLIGHTS */}
      {activeTab === 'highlights' && (
        <div className="highlights-list-grid">
          {filteredHighlights.length === 0 ? (
            <div className="empty-panel">
              <Highlighter size={34} />
              <h3>No Smart Highlights Yet</h3>
              <p>Save verbatim quotes from papers with page numbers and tags.</p>
              <button className="btn primary" onClick={() => setIsCreatingHighlight(true)}>
                <Plus size={15} /> Add Highlight
              </button>
            </div>
          ) : (
            filteredHighlights.map(hl => (
              <div className="highlight-card" key={hl.id}>
                <div className="highlight-header">
                  <div className="hl-source-wrap">
                    <span className="hl-paper-badge">{hl.paperTitle}</span>
                    <span className="hl-page-badge">Page {hl.page}</span>
                    {hl.tag && <span className="hl-tag-badge">{hl.tag}</span>}
                  </div>
                  <button
                    className="icon-btn delete-btn"
                    onClick={() => onDeleteHighlight?.(hl.id)}
                    title="Delete highlight"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <blockquote className="highlight-quote">
                  "{hl.quote}"
                </blockquote>

                {hl.comment && (
                  <div className="highlight-comment">
                    <b>Scholarly Note:</b>
                    <p>{hl.comment}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
