import React, { useState, useMemo } from 'react'
import {
  Network,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  BookOpen,
  User,
  Tag,
  ArrowRight,
  Info,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { CITATION_NETWORK_DATA } from '../data/citationNetworkData'

export default function KnowledgeGraph({
  papers = [],
  savedUploads = [],
  onNavigate,
  onToast,
}) {
  const [selectedNode, setSelectedNode] = useState(null)
  const [filterType, setFilterType] = useState('all') // 'all' | 'paper' | 'author' | 'topic'
  const [searchQuery, setSearchQuery] = useState('')
  const [zoomLevel, setZoomLevel] = useState(1)

  // Combined nodes from data
  const allNodes = useMemo(() => {
    return CITATION_NETWORK_DATA.nodes.filter(n => {
      if (filterType !== 'all' && n.type !== filterType) return false
      if (searchQuery.trim()) {
        return n.label.toLowerCase().includes(searchQuery.toLowerCase())
      }
      return true
    })
  }, [filterType, searchQuery])

  // Fixed coordinates for clean, deterministic rendering of the bipartite/tripartite academic graph
  const nodePositions = useMemo(() => {
    const papersList = CITATION_NETWORK_DATA.nodes.filter(n => n.type === 'paper')
    const authorsList = CITATION_NETWORK_DATA.nodes.filter(n => n.type === 'author')
    const topicsList = CITATION_NETWORK_DATA.nodes.filter(n => n.type === 'topic')

    const coords = {}
    papersList.forEach((n, i) => {
      coords[n.id] = { x: 440, y: 70 + i * 75 }
    })
    authorsList.forEach((n, i) => {
      coords[n.id] = { x: 140, y: 90 + i * 85 }
    })
    topicsList.forEach((n, i) => {
      coords[n.id] = { x: 760, y: 80 + i * 80 }
    })
    return coords
  }, [])

  const edges = useMemo(() => {
    return CITATION_NETWORK_DATA.edges.filter(e => {
      const srcVisible = allNodes.some(n => n.id === e.source)
      const tgtVisible = allNodes.some(n => n.id === e.target)
      return srcVisible && tgtVisible
    })
  }, [allNodes])

  const getNodeColor = (type) => {
    switch (type) {
      case 'paper': return '#a78bfa'
      case 'author': return '#38bdf8'
      case 'topic': return '#34d399'
      default: return '#818cf8'
    }
  }

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(Math.max(0.6, prev + delta), 1.8))
  }

  return (
    <div className="knowledge-graph-page">
      {/* Intro Header */}
      <div className="page-intro-box">
        <div className="intro-content">
          <div className="eyebrow"><Network size={14} /> MULTI-RELATIONAL KNOWLEDGE GRAPH</div>
          <h2>Scientific Knowledge Graph</h2>
          <p>
            Interactive topological mapping linking research papers, primary authors, and foundational topics.
            Inspect interconnected research lineages, co-authorship relationships, and conceptual dependencies.
          </p>
        </div>

        <div className="graph-legend-strip">
          <span className="legend-item"><i className="legend-dot paper" /> Paper Nodes</span>
          <span className="legend-item"><i className="legend-dot author" /> Author Nodes</span>
          <span className="legend-item"><i className="legend-dot topic" /> Topic Nodes</span>
          <span className="legend-item"><i className="legend-line" /> Direct Connection</span>
        </div>
      </div>

      {/* Toolbar: Search, Filter, Zoom */}
      <div className="graph-toolbar">
        <div className="search-field-mini">
          <Search size={15} />
          <input
            placeholder="Search nodes in graph..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group-mini">
          <span className="toolbar-label">Node Filter:</span>
          {['all', 'paper', 'author', 'topic'].map(type => (
            <button
              key={type}
              className={`pill-btn ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="zoom-controls">
          <button className="icon-btn" onClick={() => handleZoom(0.15)} title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <span className="zoom-label">{Math.round(zoomLevel * 100)}%</span>
          <button className="icon-btn" onClick={() => handleZoom(-0.15)} title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <button className="icon-btn" onClick={() => setZoomLevel(1)} title="Reset Zoom">
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="graph-layout">
        <div className="graph-canvas-wrap">
          <svg
            viewBox="0 0 940 620"
            className="interactive-svg-canvas"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
          >
            {/* Edges */}
            {edges.map((e, idx) => {
              const src = nodePositions[e.source]
              const tgt = nodePositions[e.target]
              if (!src || !tgt) return null

              const isHighlighted = selectedNode && (selectedNode.id === e.source || selectedNode.id === e.target)

              return (
                <line
                  key={idx}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={isHighlighted ? '#c4b5fd' : '#33354f'}
                  strokeWidth={isHighlighted ? 2.5 : 1.2}
                  strokeDasharray={e.type === 'cites' ? '4 3' : 'none'}
                >
                  <title>{e.label || `${e.source} -> ${e.target}`}</title>
                </line>
              )
            })}

            {/* Nodes */}
            {allNodes.map((n) => {
              const pos = nodePositions[n.id]
              if (!pos) return null
              const isSelected = selectedNode?.id === n.id

              return (
                <g
                  key={n.id}
                  className={`graph-node ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedNode(n)}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 14 : 11}
                    fill={getNodeColor(n.type)}
                    stroke={isSelected ? '#ffffff' : '#1e1b2e'}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  <text
                    x={pos.x + 16}
                    y={pos.y + 4}
                    fill={isSelected ? '#ffffff' : '#cbd5e1'}
                    fontSize={11}
                    fontWeight={isSelected ? 700 : 500}
                  >
                    {n.label.length > 34 ? `${n.label.slice(0, 31)}...` : n.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Node Details Panel */}
        <aside className="graph-details-aside">
          {selectedNode ? (
            <div className="node-inspector-card">
              <div className="inspector-header">
                <span className={`node-type-tag ${selectedNode.type}`}>
                  {selectedNode.type.toUpperCase()} NODE
                </span>
                <button
                  className="icon-btn small"
                  onClick={() => setSelectedNode(null)}
                >
                  ×
                </button>
              </div>

              <h3>{selectedNode.label}</h3>

              {selectedNode.type === 'paper' && (
                <div className="inspector-fields">
                  <div className="inspector-row">
                    <b>Publication Year:</b>
                    <span>{selectedNode.year}</span>
                  </div>
                  <div className="inspector-row">
                    <b>Venue:</b>
                    <span>{selectedNode.venue}</span>
                  </div>
                  <div className="inspector-row">
                    <b>Citation Count:</b>
                    <span>{selectedNode.citations?.toLocaleString()} citations</span>
                  </div>
                  <div className="inspector-row">
                    <b>Citation Velocity:</b>
                    <span>{selectedNode.velocity}</span>
                  </div>
                  <div className="inspector-actions">
                    <button
                      className="btn primary small-btn"
                      onClick={() => onNavigate?.('AI Paper Analysis')}
                    >
                      <Sparkles size={14} /> Open Full Analysis
                    </button>
                    <button
                      className="btn secondary small-btn"
                      onClick={() => onNavigate?.('Citation Network')}
                    >
                      <Network size={14} /> View Citations
                    </button>
                  </div>
                </div>
              )}

              {selectedNode.type === 'author' && (
                <div className="inspector-fields">
                  <div className="inspector-row">
                    <b>Affiliation:</b>
                    <span>{selectedNode.institution || 'Academic Institute'}</span>
                  </div>
                  <div className="inspector-row">
                    <b>h-index:</b>
                    <span>{selectedNode.hIndex || 35}</span>
                  </div>
                  <div className="inspector-papers-list">
                    <b>Key Publications in Corpus:</b>
                    <div className="linked-paper-tag">Attention Is All You Need (2017)</div>
                  </div>
                </div>
              )}

              {selectedNode.type === 'topic' && (
                <div className="inspector-fields">
                  <div className="inspector-row">
                    <b>Classification:</b>
                    <span>Foundational AI Domain</span>
                  </div>
                  <p className="topic-summary">
                    Central research paradigm encompassing self-attention, masked language modeling,
                    and transformer optimization mechanisms.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="inspector-empty">
              <Network size={28} />
              <b>Node Details Inspector</b>
              <p>Click on any paper, author, or topic node to inspect relations and publication metrics.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
