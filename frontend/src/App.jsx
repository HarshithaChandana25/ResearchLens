import React, { useState, useEffect, useMemo } from 'react'
import './App.css'

// Layout
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'

// Pages
import Dashboard from './pages/Dashboard'
import DiscoverPapers from './pages/DiscoverPapers'
import UploadPapers from './pages/UploadPapers'
import MyLibrary from './pages/MyLibrary'
import SavedPapers from './pages/SavedPapers'
import PaperAnalysis from './pages/PaperAnalysis'
import ResearchAssistant from './pages/ResearchAssistant'
import GapFinder from './pages/GapFinder'
import ReproducibilityChecker from './pages/ReproducibilityChecker'
import ComparePapers from './pages/ComparePapers'
import KnowledgeGraph from './pages/KnowledgeGraph'
import CitationNetwork from './pages/CitationNetwork'
import LiteratureReview from './pages/LiteratureReview'
import ResearchTimeline from './pages/ResearchTimeline'
import ResearchNotes from './pages/ResearchNotes'
import Settings from './pages/Settings'

// Data & Services
import { SAMPLE_PAPERS } from './data/samplePapers'
import {
  getStoredSavedIds,
  saveStoredSavedIds,
  getStoredUploads,
  saveStoredUploads,
  getStoredAnalysisHistory,
  saveStoredAnalysisHistory,
  getStoredNotes,
  saveStoredNotes,
  getStoredCollections,
  saveStoredCollections,
  getStoredHighlights,
  saveStoredHighlights,
  logActivity,
  getRecentActivity,
} from './services/storageService'

import { CheckCircle2 } from 'lucide-react'

export default function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard')
  const [papers] = useState(SAMPLE_PAPERS)
  const [savedIds, setSavedIds] = useState(() => getStoredSavedIds())
  const [savedUploads, setSavedUploads] = useState(() => getStoredUploads())
  const [analysisHistory, setAnalysisHistory] = useState(() => getStoredAnalysisHistory())
  const [notes, setNotes] = useState(() => getStoredNotes())
  const [collections, setCollections] = useState(() => getStoredCollections())
  const [highlights, setHighlights] = useState(() => getStoredHighlights())
  const [recentActivities, setRecentActivities] = useState(() => getRecentActivity())

  const [activePaper, setActivePaper] = useState(SAMPLE_PAPERS[0])
  const [activeUpload, setActiveUpload] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Sync to storage on state change
  useEffect(() => {
    saveStoredSavedIds(savedIds)
  }, [savedIds])

  useEffect(() => {
    saveStoredUploads(savedUploads)
  }, [savedUploads])

  useEffect(() => {
    saveStoredAnalysisHistory(analysisHistory)
  }, [analysisHistory])

  useEffect(() => {
    saveStoredNotes(notes)
  }, [notes])

  useEffect(() => {
    saveStoredCollections(collections)
  }, [collections])

  useEffect(() => {
    saveStoredHighlights(highlights)
  }, [highlights])

  // Close mobile drawer on Escape & Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCurrentPage('Discover Papers')
        const input = document.querySelector('.global-search input')
        if (input) input.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Toast notification helper
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2600)
  }

  // Toggle saving canonical papers
  const handleToggleSave = (paperId) => {
    setSavedIds(current => {
      const isSaved = current.includes(paperId)
      const updated = isSaved ? current.filter(id => id !== paperId) : [...current, paperId]
      const paperObj = papers.find(p => p.id === paperId)
      showToast(isSaved ? 'Removed paper from library.' : 'Saved paper to library.')
      logActivity(
        isSaved ? 'Removed bookmark' : 'Saved paper to library',
        isSaved ? 'Removed from saved repository' : 'Added to personal library',
        paperObj ? paperObj.title : `Paper #${paperId}`,
      )
      setRecentActivities(getRecentActivity())
      return updated
    })
  }

  // Toggle saving uploaded papers
  const handleToggleUploadedSave = (uploadRecord) => {
    setSavedUploads(current => {
      const exists = current.some(item => item.id === uploadRecord.id)
      const updated = exists
        ? current.filter(item => item.id !== uploadRecord.id)
        : [uploadRecord, ...current]
      showToast(exists ? 'Removed uploaded manuscript.' : 'Saved upload to library.')
      logActivity(
        exists ? 'Deleted upload' : 'Saved PDF upload',
        uploadRecord.filename,
        uploadRecord.metadata?.title || uploadRecord.filename,
      )
      setRecentActivities(getRecentActivity())
      return updated
    })
  }

  // Analysis completion save
  const handleSaveAnalysis = (record) => {
    setAnalysisHistory(current => [record, ...current.filter(item => item.id !== record.id)])
    logActivity('Analyzed paper', 'Gemini structured analysis completed', record.metadata?.title || record.filename)
    setRecentActivities(getRecentActivity())
  }

  const handleDeleteAnalysis = (recordId) => {
    setAnalysisHistory(current => current.filter(item => item.id !== recordId))
    showToast('Analysis removed from history.')
  }

  // Open paper directly in AI analysis
  const handleOpenPaper = (paper) => {
    setActivePaper(paper)
    setActiveUpload(null)
    setCurrentPage('AI Paper Analysis')
  }

  // Open upload in AI analysis
  const handleOpenUpload = (upload) => {
    setActiveUpload(upload)
    setActivePaper(null)
    setCurrentPage('AI Paper Analysis')
  }

  // Notes actions
  const handleSaveNote = (note) => {
    setNotes(prev => [note, ...prev.filter(n => n.id !== note.id)])
    logActivity('Created research note', note.title, note.paperTitle)
    setRecentActivities(getRecentActivity())
  }

  const handleDeleteNote = (noteId) => {
    setNotes(prev => prev.filter(n => n.id !== noteId))
    showToast('Research note deleted.')
  }

  // Highlights actions
  const handleSaveHighlight = (hl) => {
    setHighlights(prev => [hl, ...prev.filter(h => h.id !== hl.id)])
    logActivity('Added smart highlight', `Page ${hl.page}`, hl.paperTitle)
    setRecentActivities(getRecentActivity())
  }

  const handleDeleteHighlight = (hlId) => {
    setHighlights(prev => prev.filter(h => h.id !== hlId))
    showToast('Highlight deleted.')
  }

  // Collection creation
  const handleCreateCollection = (col) => {
    setCollections(prev => [...prev, col])
  }

  // Counts for sidebar badges
  const badgeCounts = useMemo(() => ({
    libraryCount: savedIds.length + savedUploads.length,
    savedCount: savedIds.length,
    notesCount: notes.length,
  }), [savedIds, savedUploads, notes])

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        counts={badgeCounts}
        onToast={showToast}
      />

      <main className="main-area">
        <Topbar
          currentPage={currentPage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenMobile={() => setMobileMenuOpen(true)}
          onToast={showToast}
          onNavigate={setCurrentPage}
        />

        <div className="content">
          {currentPage === 'Dashboard' && (
            <Dashboard
              papers={papers}
              savedIds={savedIds}
              savedUploads={savedUploads}
              analysisHistory={analysisHistory}
              recentActivities={recentActivities}
              onNavigate={setCurrentPage}
              onOpenPaper={handleOpenPaper}
              onOpenUpload={handleOpenUpload}
            />
          )}

          {currentPage === 'Discover Papers' && (
            <DiscoverPapers
              papers={papers}
              savedIds={savedIds}
              onToggleSave={handleToggleSave}
              onOpenPaper={handleOpenPaper}
              onToast={showToast}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'Upload Papers' && (
            <UploadPapers
              savedUploads={savedUploads}
              onUploadSuccess={handleToggleUploadedSave}
              onSaveUpload={handleToggleUploadedSave}
              onDeleteUpload={(id) => {
                setSavedUploads(prev => prev.filter(item => item.id !== id))
                showToast('Deleted uploaded manuscript.')
              }}
              onOpenAnalysis={handleOpenUpload}
              onToast={showToast}
            />
          )}

          {currentPage === 'My Library' && (
            <MyLibrary
              papers={papers}
              savedIds={savedIds}
              savedUploads={savedUploads}
              collections={collections}
              onToggleSave={handleToggleSave}
              onToggleUploadedSave={handleToggleUploadedSave}
              onOpenPaper={handleOpenPaper}
              onOpenUpload={handleOpenUpload}
              onCreateCollection={handleCreateCollection}
              onToast={showToast}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'Saved Papers' && (
            <SavedPapers
              papers={papers}
              savedIds={savedIds}
              savedUploads={savedUploads}
              onToggleSave={handleToggleSave}
              onToggleUploadedSave={handleToggleUploadedSave}
              onOpenPaper={handleOpenPaper}
              onOpenUpload={handleOpenUpload}
              onToast={showToast}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'AI Paper Analysis' && (
            <PaperAnalysis
              papers={papers}
              savedIds={savedIds}
              onToggleSave={handleToggleSave}
              activePaper={activePaper}
              uploadedPaper={activeUpload}
              onSaveAnalysis={handleSaveAnalysis}
              onToast={showToast}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'Research Assistant' && (
            <ResearchAssistant
              papers={papers}
              savedUploads={savedUploads}
              activePaper={activePaper}
              onToast={showToast}
            />
          )}

          {currentPage === 'Research Gap Finder' && (
            <GapFinder
              papers={papers}
              onToast={showToast}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'Reproducibility Checker' && (
            <ReproducibilityChecker
              papers={papers}
              activePaper={activePaper}
              onToast={showToast}
            />
          )}

          {currentPage === 'Compare Papers' && (
            <ComparePapers
              papers={papers}
              onToast={showToast}
            />
          )}

          {currentPage === 'Knowledge Graph' && (
            <KnowledgeGraph
              papers={papers}
              savedUploads={savedUploads}
              onNavigate={setCurrentPage}
              onToast={showToast}
            />
          )}

          {currentPage === 'Citation Network' && (
            <CitationNetwork
              papers={papers}
              onToast={showToast}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'Literature Review' && (
            <LiteratureReview
              papers={papers}
              onToast={showToast}
            />
          )}

          {currentPage === 'Research Timeline' && (
            <ResearchTimeline
              papers={papers}
              onOpenPaper={handleOpenPaper}
              onToast={showToast}
            />
          )}

          {currentPage === 'Research Notes' && (
            <ResearchNotes
              notes={notes}
              highlights={highlights}
              papers={papers}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              onSaveHighlight={handleSaveHighlight}
              onDeleteHighlight={handleDeleteHighlight}
              onToast={showToast}
              onOpenPaper={handleOpenPaper}
            />
          )}

          {currentPage === 'Settings' && (
            <Settings onToast={showToast} />
          )}

          <footer className="footer">
            <span>© 2025 ResearchLens • Academic Intelligence Platform</span>
            <span>Empirical Rigor & Scientific Reproducibility <span className="footer-heart">✦</span></span>
            <span>FastAPI & Gemini Ready</span>
          </footer>
        </div>
      </main>

      {toastMessage && (
        <div className="toast" role="status" aria-live="polite">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
