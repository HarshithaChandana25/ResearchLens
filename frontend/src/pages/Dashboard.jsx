import React from 'react'
import {
  BookOpen,
  Bookmark,
  Compass,
  Clock3,
  FileText,
  UploadCloud,
  Plus,
  ArrowUpRight,
  Sparkles,
  GitCompareArrows,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react'
import TopicDistributionChart from '../components/charts/TopicDistributionChart'
import PublicationYearChart from '../components/charts/PublicationYearChart'

export default function Dashboard({
  papers = [],
  savedIds = [],
  savedUploads = [],
  analysisHistory = [],
  recentActivities = [],
  onNavigate,
  onOpenPaper,
  onOpenUpload,
}) {
  const publishedPapers = papers.filter(p => p.venue !== 'Demo collection')
  const totalAnalyzed = analysisHistory.length + 4 // sample landmark pre-analyzed + user history
  const totalSaved = savedIds.length + savedUploads.length
  const uniqueTopics = new Set(papers.map(p => p.topic)).size
  const papersComparedCount = 3

  // Charts data calculation
  const topicCounts = papers.reduce((acc, p) => {
    acc[p.topic] = (acc[p.topic] || 0) + 1
    return acc
  }, {})
  const topicChartData = Object.entries(topicCounts).map(([name, count]) => ({ name, count }))

  const yearCounts = publishedPapers.reduce((acc, p) => {
    acc[p.year] = (acc[p.year] || 0) + 1
    return acc
  }, {})
  const yearChartData = Object.entries(yearCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => Number(a.name) - Number(b.name))

  const recentAnalyzed = [
    ...(analysisHistory.slice(0, 2).map(item => ({
      id: item.id,
      title: item.metadata?.title || item.filename,
      author: item.metadata?.author || 'Extracted manuscript',
      time: new Date(item.createdAt).toLocaleDateString(),
      isUpload: true,
      rawRecord: item,
    }))),
    {
      id: 1,
      title: 'Attention Is All You Need',
      author: 'Vaswani et al. · NeurIPS',
      time: 'Completed',
      isUpload: false,
    },
    {
      id: 2,
      title: 'BERT: Pre-training of Deep Bidirectional Transformers',
      author: 'Devlin et al. · NAACL',
      time: 'Completed',
      isUpload: false,
    },
  ].slice(0, 3)

  return (
    <div className="dashboard-page">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-copy">
          <div className="hero-chip">
            <Sparkles size={13} /> NEXT-GEN RESEARCH INTELLIGENCE
          </div>
          <h2>
            From Information Overload<br />
            to <span>Empirical Clarity.</span>
          </h2>
          <p>
            Extract full-text manuscripts, audit scientific reproducibility, evaluate cross-paper
            research gaps, and synthesize literature with verifiable evidence.
          </p>
          <div className="hero-actions">
            <button
              className="btn hero-btn"
              onClick={() => onNavigate('Upload Papers')}
            >
              <UploadCloud size={16} /> Upload & Extract PDF
            </button>
            <button
              className="btn secondary hero-btn-subtle"
              onClick={() => onNavigate('Discover Papers')}
            >
              <Compass size={16} /> Discover Corpus
            </button>
          </div>
        </div>

        <div className="hero-art">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="core">
            <Sparkles size={46} />
          </div>
          <div className="orbit-node node-a"><BookOpen size={16} /></div>
          <div className="orbit-node node-b"><Layers size={16} /></div>
          <div className="orbit-node node-c"><GitCompareArrows size={16} /></div>
          <div className="orbit-node node-d"><FileText size={16} /></div>
        </div>
        <div className="hero-glow" />
      </div>

      {/* Primary Metrics Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span>Papers Analyzed</span>
            <div className="stat-icon"><FileText size={17} /></div>
          </div>
          <div className="stat-value">{totalAnalyzed}</div>
          <small>Verified AI extractions</small>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Saved in Library</span>
            <div className="stat-icon"><Bookmark size={17} /></div>
          </div>
          <div className="stat-value">{totalSaved}</div>
          <small>Personal collections</small>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Research Topics</span>
            <div className="stat-icon"><Compass size={17} /></div>
          </div>
          <div className="stat-value">{uniqueTopics}</div>
          <small>Active thematic domains</small>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Cross-Paper Comparisons</span>
            <div className="stat-icon"><GitCompareArrows size={17} /></div>
          </div>
          <div className="stat-value">{papersComparedCount}</div>
          <small>Comparative matrices</small>
        </div>
      </div>

      {/* Distribution Charts Grid */}
      <div className="dashboard-grid">
        <div className="panel chart-panel">
          <div className="panel-title">
            <div>
              <h3>Research Topic Distribution</h3>
              <p>Frequency of papers categorized across scientific domains</p>
            </div>
            <span className="sample-tag">ACADEMIC CORPUS</span>
          </div>
          <TopicDistributionChart data={topicChartData} />
        </div>

        <div className="panel chart-panel">
          <div className="panel-title">
            <div>
              <h3>Publication Timeline</h3>
              <p>Landmark paper publication distribution by year</p>
            </div>
            <span className="sample-tag">HISTORICAL DATA</span>
          </div>
          <PublicationYearChart data={yearChartData} />
        </div>
      </div>

      {/* Two Column Section: Recently Analyzed + Activity Timeline */}
      <div className="dashboard-grid" style={{ marginTop: 14 }}>
        {/* Recently Analyzed Papers */}
        <section className="panel">
          <div className="panel-title">
            <div>
              <h3>Recently Analyzed Papers</h3>
              <p>Full-text extractions and reproducibility audits</p>
            </div>
            <button className="text-link" onClick={() => onNavigate('AI Paper Analysis')}>
              View workspace <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="recent-list">
            {recentAnalyzed.map(paper => (
              <div
                className="recent-item"
                key={paper.id}
                onClick={() => {
                  if (paper.isUpload) {
                    onOpenUpload(paper.rawRecord)
                  } else {
                    const match = papers.find(p => p.id === paper.id)
                    if (match) onOpenPaper(match)
                  }
                }}
              >
                <div className="recent-item-icon">
                  <FileText size={16} />
                </div>
                <div className="recent-item-info">
                  <b>{paper.title}</b>
                  <span>{paper.author}</span>
                </div>
                <span className="recent-item-badge">{paper.time}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Research Activity Timeline */}
        <section className="panel">
          <div className="panel-title">
            <div>
              <h3>Research Activity Timeline</h3>
              <p>Chronological actions logged during your session</p>
            </div>
            <span className="status-pill">Live Session</span>
          </div>

          <div className="activity-timeline">
            {recentActivities.slice(0, 4).map((act, index) => (
              <div className="activity-entry" key={act.id || index}>
                <div className="activity-marker">
                  <span className="activity-dot" />
                  {index < 3 && <span className="activity-line" />}
                </div>
                <div className="activity-details">
                  <b>{act.action}</b>
                  <p>{act.details} {act.paperTitle && <span className="activity-paper">• {act.paperTitle}</span>}</p>
                  <small>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="quick-actions-strip">
        <button
          className="quick-action-card"
          onClick={() => onNavigate('Upload Papers')}
        >
          <div className="quick-action-icon"><UploadCloud size={20} /></div>
          <div>
            <b>Upload New Paper</b>
            <span>Drag-and-drop PDF extraction with PyMuPDF</span>
          </div>
          <ArrowUpRight size={16} />
        </button>

        <button
          className="quick-action-card"
          onClick={() => onNavigate('Research Gap Finder')}
        >
          <div className="quick-action-icon"><Sparkles size={20} /></div>
          <div>
            <b>Explore Research Gaps</b>
            <span>Cross-literature saturation & missing experiments</span>
          </div>
          <ArrowUpRight size={16} />
        </button>

        <button
          className="quick-action-card"
          onClick={() => onNavigate('Compare Papers')}
        >
          <div className="quick-action-icon"><GitCompareArrows size={20} /></div>
          <div>
            <b>Compare 2–5 Papers</b>
            <span>Side-by-side matrices of algorithms & metrics</span>
          </div>
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  )
}
