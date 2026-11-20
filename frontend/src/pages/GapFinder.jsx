import React, { useState } from 'react'
import {
  Target,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  TrendingDown,
  Layers,
  HelpCircle,
  ArrowRight,
  Filter,
  BarChart2,
  Cpu,
  Bookmark,
  Share2,
} from 'lucide-react'
import { GAP_DATA } from '../data/gapAnalysisData'
import GapMatrixChart from '../components/charts/GapMatrixChart'

export default function GapFinder({ papers = [], onToast, onNavigate }) {
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('All')
  const [activeTab, setActiveTab] = useState('gaps') // 'gaps' | 'conflicts' | 'limitations' | 'matrix' | 'directions'

  return (
    <div className="gap-finder-page">
      {/* Intro Header */}
      <div className="page-intro-box">
        <div className="intro-content">
          <div className="eyebrow"><Target size={14} /> CROSS-LITERATURE META-ANALYSIS</div>
          <h2>Research Gap Finder</h2>
          <p>
            Synthesize patterns across multiple publications to discover underexplored scientific gaps,
            conflicting claims, common experimental bottlenecks, and high-impact future directions.
          </p>
        </div>
        <div className="gap-stats-strip">
          <div className="gap-stat-mini">
            <b>4 Unexplored Areas</b>
            <span>High priority</span>
          </div>
          <div className="gap-stat-mini">
            <b>2 Contradictions</b>
            <span>Literature conflicts</span>
          </div>
          <div className="gap-stat-mini">
            <b>{papers.length} Papers</b>
            <span>Cross-referenced</span>
          </div>
        </div>
      </div>

      {/* Navigation Pills Bar */}
      <div className="analysis-tabs-bar">
        <div className="tab-buttons">
          <button
            className={`analysis-tab-btn ${activeTab === 'gaps' ? 'active' : ''}`}
            onClick={() => setActiveTab('gaps')}
          >
            <Lightbulb size={15} /> Unexplored Gaps ({GAP_DATA.lessExploredAreas.length})
          </button>
          <button
            className={`analysis-tab-btn ${activeTab === 'conflicts' ? 'active' : ''}`}
            onClick={() => setActiveTab('conflicts')}
          >
            <AlertTriangle size={15} /> Conflicting Findings ({GAP_DATA.conflictingFindings.length})
          </button>
          <button
            className={`analysis-tab-btn ${activeTab === 'limitations' ? 'active' : ''}`}
            onClick={() => setActiveTab('limitations')}
          >
            <TrendingDown size={15} /> Common Limitations ({GAP_DATA.commonLimitations.length})
          </button>
          <button
            className={`analysis-tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
            onClick={() => setActiveTab('matrix')}
          >
            <BarChart2 size={15} /> Saturation Matrix Chart
          </button>
          <button
            className={`analysis-tab-btn ${activeTab === 'directions' ? 'active' : ''}`}
            onClick={() => setActiveTab('directions')}
          >
            <Sparkles size={15} /> AI-Generated Directions
          </button>
        </div>
      </div>

      {/* TAB 1: UNEXPLORED GAPS */}
      {activeTab === 'gaps' && (
        <div className="gap-cards-container">
          <div className="gap-cards-grid">
            {GAP_DATA.lessExploredAreas.map((gap) => (
              <div className="gap-card" key={gap.id}>
                <div className="gap-card-header">
                  <div className="gap-title-wrap">
                    <span className={`urgency-badge ${gap.urgency.toLowerCase()}`}>
                      {gap.urgency} Urgency
                    </span>
                    <h4>{gap.title}</h4>
                  </div>
                  <div className="gap-score-circle">
                    <b>{gap.gapScore}</b>
                    <small>Gap Index</small>
                  </div>
                </div>

                <div className="gap-card-section">
                  <div className="section-label">
                    <CheckCircle2 size={13} className="verified-icon" />
                    <b>Verified Finding in Analyzed Literature:</b>
                  </div>
                  <p className="verified-text">{gap.verifiedObservation}</p>
                </div>

                <div className="gap-card-section ai-box">
                  <div className="section-label ai-label">
                    <Sparkles size={13} />
                    <b>AI-Suggested Research Direction:</b>
                  </div>
                  <p className="ai-text">{gap.aiSuggestedDirection}</p>
                </div>

                <div className="suggested-questions">
                  <b>Actionable Research Questions (Hypotheses):</b>
                  <ul>
                    {gap.suggestedQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>

                <div className="gap-footer">
                  <small>Papers cross-referenced: {gap.papersAnalyzed.join(', ')}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CONFLICTING FINDINGS */}
      {activeTab === 'conflicts' && (
        <div className="conflicts-container">
          <div className="conflicts-list">
            {GAP_DATA.conflictingFindings.map((conflict) => (
              <div className="conflict-card" key={conflict.id}>
                <div className="conflict-header">
                  <div className="conflict-tag">
                    <AlertTriangle size={15} />
                    <span>Contradicting Claims in Literature</span>
                  </div>
                  <h3>{conflict.topic}</h3>
                </div>

                <div className="conflict-vs-grid">
                  <div className="finding-box finding-a">
                    <div className="finding-badge">Perspective A</div>
                    <p>{conflict.findingA}</p>
                  </div>

                  <div className="vs-divider">
                    <span>VS</span>
                  </div>

                  <div className="finding-box finding-b">
                    <div className="finding-badge">Perspective B</div>
                    <p>{conflict.findingB}</p>
                  </div>
                </div>

                <div className="conflict-synthesis">
                  <div className="synthesis-header">
                    <Sparkles size={15} />
                    <b>Scientific Reconciliation & Root Cause Analysis</b>
                  </div>
                  <p>{conflict.conflictAnalysis}</p>
                  <div className="reconciliation-box">
                    <b>Proposed Novel Investigation:</b>
                    <span>{conflict.reconciliationProposal}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COMMON LIMITATIONS */}
      {activeTab === 'limitations' && (
        <div className="limitations-container">
          <div className="limitations-grid">
            {GAP_DATA.commonLimitations.map((lim, idx) => (
              <div className="limitation-card" key={idx}>
                <div className="lim-header">
                  <TrendingDown size={18} className="lim-icon" />
                  <div>
                    <h4>{lim.limitation}</h4>
                    <span className="lim-freq">Reported across {lim.frequency}</span>
                  </div>
                </div>
                <p className="lim-impact"><b>Systemic Impact:</b> {lim.impact}</p>
                <div className="lim-models">
                  <b>Identified In:</b>
                  <div className="model-pills">
                    {lim.affectedModels.map(m => (
                      <span key={m} className="model-pill">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SATURATION MATRIX CHART */}
      {activeTab === 'matrix' && (
        <div className="matrix-container">
          <div className="panel chart-panel">
            <div className="panel-title">
              <div>
                <h3>Literature Saturation vs. Unexplored Gap Severity</h3>
                <p>
                  Higher gap percentage indicates fertile opportunities for novel empirical contributions.
                </p>
              </div>
              <span className="sample-tag">ACADEMIC MATRIX</span>
            </div>
            <GapMatrixChart data={GAP_DATA.topicMatrixChart} />
          </div>

          <div className="missing-exp-section" style={{ marginTop: 18 }}>
            <div className="panel-title">
              <div>
                <h3>Missing Experiments in Published Literature</h3>
                <p>Crucial empirical ablations omitted by landmark papers</p>
              </div>
            </div>
            <div className="missing-exp-grid">
              {GAP_DATA.missingExperiments.map((exp, idx) => (
                <div className="missing-exp-card" key={idx}>
                  <b>{exp.experiment}</b>
                  <p>{exp.whyNeeded}</p>
                  <small>Omitted in: {exp.papersLacking.join(', ')}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AI-GENERATED DIRECTIONS */}
      {activeTab === 'directions' && (
        <div className="directions-container">
          <div className="directions-grid">
            {GAP_DATA.lessExploredAreas.map((item, idx) => (
              <div className="direction-card" key={idx}>
                <div className="direction-top">
                  <div className="direction-icon"><Sparkles size={18} /></div>
                  <div>
                    <b>Research Opportunity #{idx + 1}</b>
                    <h4>{item.title}</h4>
                  </div>
                </div>
                <p className="direction-desc">{item.aiSuggestedDirection}</p>
                <div className="direction-subquestions">
                  <b>Suggested Dissertation or Paper Topics:</b>
                  {item.suggestedQuestions.map((q, qIdx) => (
                    <div className="direction-q-row" key={qIdx}>
                      <ArrowRight size={14} />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
                <div className="direction-footer">
                  <button
                    className="btn secondary small-btn"
                    onClick={() => {
                      onToast?.('Research topic drafted into personal notes.')
                      onNavigate?.('Research Notes')
                    }}
                  >
                    <Bookmark size={13} /> Add to Research Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
