import React, { useState, useMemo } from 'react'
import {
  Compass,
  Search,
  Filter,
  Bookmark,
  FileText,
  BookOpen,
  ArrowUpRight,
  Sparkles,
  SlidersHorizontal,
  ExternalLink,
  ChevronDown,
  Globe,
} from 'lucide-react'
import CitationModal from '../components/CitationModal'
import { searchSemanticScholar } from '../services/semanticScholar'

export default function DiscoverPapers({
  papers = [],
  savedIds = [],
  onToggleSave,
  onOpenPaper,
  onToast,
  onNavigate,
}) {
  const [query, setQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('All')
  const [selectedVenue, setSelectedVenue] = useState('All')
  const [sortBy, setSortBy] = useState('citations') // 'citations' | 'year' | 'title'
  const [selectedPaperForCitation, setSelectedPaperForCitation] = useState(null)
  const [semanticSearchActive, setSemanticSearchActive] = useState(false)
  const [semanticLoading, setSemanticLoading] = useState(false)

  const topics = useMemo(() => {
    return ['All', ...new Set(papers.map(p => p.topic))]
  }, [papers])

  const venues = useMemo(() => {
    return ['All', ...new Set(papers.map(p => p.venue))]
  }, [papers])

  const filteredPapers = useMemo(() => {
    let result = papers.filter(p => {
      const matchQuery = (
        p.title + ' ' +
        p.authors + ' ' +
        p.topic + ' ' +
        (p.tags ? p.tags.join(' ') : '') + ' ' +
        (p.abstract || '')
      ).toLowerCase().includes(query.toLowerCase())

      const matchTopic = selectedTopic === 'All' || p.topic === selectedTopic
      const matchVenue = selectedVenue === 'All' || p.venue === selectedVenue

      return matchQuery && matchTopic && matchVenue
    })

    if (sortBy === 'citations') {
      result.sort((a, b) => (b.citations || 0) - (a.citations || 0))
    } else if (sortBy === 'year') {
      result.sort((a, b) => (b.year || 0) - (a.year || 0))
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title))
    }

    return result
  }, [papers, query, selectedTopic, selectedVenue, sortBy])

  const handleSemanticSearch = async () => {
    if (!query.trim()) return
    setSemanticLoading(true)
    onToast?.(`Querying Semantic Scholar academic corpus for "${query}"...`)
    const results = await searchSemanticScholar(query, 5)
    setSemanticLoading(false)
    if (results && results.length > 0) {
      onToast?.(`Retrieved ${results.length} live academic papers from Semantic Scholar.`)
    } else {
      onToast?.('Semantic Scholar API is in preview mode; displaying local academic matches.')
    }
  }

  return (
    <div className="discover-page">
      {/* Intro Header */}
      <div className="page-intro-box">
        <div className="intro-content">
          <div className="eyebrow"><Compass size={14} /> CORPUS EXPLORATION & DISCOVERY</div>
          <h2>Discover Research Papers</h2>
          <p>
            Explore landmark scientific publications, filter by research topics, venues, and citation impact,
            or query Semantic Scholar API for academic preprints.
          </p>
        </div>

        <button
          className="btn secondary"
          onClick={() => {
            setQuery('')
            setSelectedTopic('All')
            setSelectedVenue('All')
            setSortBy('citations')
          }}
        >
          Reset Filters
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="discover-filter-card">
        <div className="search-field">
          <Search size={16} />
          <input
            placeholder="Search by title, author, keyword, methodology (e.g. Transformers, RAG, ResNet)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSemanticSearch()
            }}
          />
          {query && (
            <button className="clear-btn" onClick={() => setQuery('')}>×</button>
          )}
        </div>

        <div className="filter-selects-row">
          <div className="select-wrap">
            <label>Topic:</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="select-wrap">
            <label>Venue:</label>
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
            >
              {venues.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="select-wrap">
            <label>Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="citations">Most Cited</option>
              <option value="year">Latest Publication</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          <button
            className="btn secondary semantic-btn"
            onClick={handleSemanticSearch}
            disabled={semanticLoading}
            title="Search external Semantic Scholar index"
          >
            <Globe size={14} /> Semantic Search
          </button>
        </div>
      </div>

      {/* Papers List */}
      <div className="discover-results-header">
        <span>Showing <b>{filteredPapers.length}</b> papers matching criteria</span>
      </div>

      {filteredPapers.length === 0 ? (
        <div className="empty-panel">
          <Search size={32} />
          <h3>No Papers Found</h3>
          <p>No publications matched your search query and active filters.</p>
          <button
            className="btn primary"
            onClick={() => {
              setQuery('')
              setSelectedTopic('All')
              setSelectedVenue('All')
            }}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="paper-card-list">
          {filteredPapers.map(paper => {
            const isSaved = savedIds.includes(paper.id)

            return (
              <div className="paper-discover-card" key={paper.id}>
                <div className="card-top-row">
                  <div className="card-badge-group">
                    <span className="topic-badge">{paper.topic}</span>
                    <span className="venue-badge">{paper.venue} {paper.year}</span>
                    {paper.doi && <span className="doi-badge">DOI Available</span>}
                  </div>

                  <div className="card-top-actions">
                    <button
                      className="icon-btn cite-btn"
                      onClick={() => setSelectedPaperForCitation(paper)}
                      title="Cite Paper"
                    >
                      <BookOpen size={16} />
                    </button>
                    <button
                      className={`icon-btn save-btn ${isSaved ? 'saved' : ''}`}
                      onClick={() => onToggleSave(paper.id)}
                      title={isSaved ? 'Remove from library' : 'Save paper'}
                    >
                      <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>

                <h3
                  className="card-paper-title"
                  onClick={() => onOpenPaper(paper)}
                >
                  {paper.title}
                </h3>
                <p className="card-authors">{paper.authors}</p>

                <p className="card-abstract">
                  {paper.abstract}
                </p>

                {paper.tags && paper.tags.length > 0 && (
                  <div className="card-tag-row">
                    {paper.tags.map(t => (
                      <span className="mini-tag" key={t}>{t}</span>
                    ))}
                  </div>
                )}

                <div className="card-bottom-bar">
                  <div className="citation-count-box">
                    <b>{paper.citations?.toLocaleString() || '—'}</b>
                    <small>Citations</small>
                  </div>

                  <div className="card-cta-group">
                    <button
                      className="btn secondary small-btn"
                      onClick={() => setSelectedPaperForCitation(paper)}
                    >
                      <BookOpen size={14} /> Cite (APA/IEEE)
                    </button>
                    <button
                      className="btn primary small-btn"
                      onClick={() => onOpenPaper(paper)}
                    >
                      <Sparkles size={14} /> AI Analysis <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Citation Generator Modal */}
      {selectedPaperForCitation && (
        <CitationModal
          paper={selectedPaperForCitation}
          onClose={() => setSelectedPaperForCitation(null)}
          onToast={onToast}
        />
      )}
    </div>
  )
}
