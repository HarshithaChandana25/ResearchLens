import React, { useState } from 'react'
import {
  Share2,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Info,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { CITATION_NETWORK_DATA } from '../data/citationNetworkData'

const customTooltipStyle = {
  background: '#141522',
  border: '1px solid #2d2e42',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: 12,
  padding: '8px 12px',
}

export default function CitationNetwork({ papers = [], onToast, onNavigate }) {
  const [selectedPaperId, setSelectedPaperId] = useState('p1')

  const activeFlow = CITATION_NETWORK_DATA.citationFlow[selectedPaperId] || CITATION_NETWORK_DATA.citationFlow['p1']
  const selectedPaper = CITATION_NETWORK_DATA.nodes.find(n => n.id === selectedPaperId)

  return (
    <div className="citation-network-page">
      {/* Intro Header */}
      <div className="page-intro-box">
        <div className="intro-content">
          <div className="eyebrow"><Share2 size={14} /> CITATION DYNAMICS & DIFFUSION</div>
          <h2>Citation Network Explorer</h2>
          <p>
            Analyze citation inflow (papers that cite this work) and outflow (foundational literature cited by this work),
            along with temporal citation velocity and diffusion across scientific venues.
          </p>
        </div>

        <div className="citation-paper-selector">
          <span className="selector-label">Root Publication:</span>
          <select
            className="citation-select"
            value={selectedPaperId}
            onChange={(e) => setSelectedPaperId(e.target.value)}
          >
            <option value="p1">Attention Is All You Need (Vaswani et al., 2017)</option>
            <option value="p2">BERT: Deep Bidirectional Transformers (Devlin et al., 2019)</option>
            <option value="p3">Retrieval-Augmented Generation (Lewis et al., 2020)</option>
          </select>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="stat-grid" style={{ marginBottom: 18 }}>
        <div className="stat-card">
          <div className="stat-top">
            <span>Inflow Citations</span>
            <div className="stat-icon"><ArrowDownLeft size={16} /></div>
          </div>
          <div className="stat-value">{activeFlow.inflowCount.toLocaleString()}</div>
          <small>Works citing this paper</small>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Outflow References</span>
            <div className="stat-icon"><ArrowUpRight size={16} /></div>
          </div>
          <div className="stat-value">{activeFlow.outflowCount}</div>
          <small>Foundational works cited</small>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Citation Velocity</span>
            <div className="stat-icon"><TrendingUp size={16} /></div>
          </div>
          <div className="stat-value">{selectedPaper?.velocity || 'High'}</div>
          <small>Annual growth trajectory</small>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Publication Venue</span>
            <div className="stat-icon"><Calendar size={16} /></div>
          </div>
          <div className="stat-value">{selectedPaper?.venue || 'NeurIPS'}</div>
          <small>Year {selectedPaper?.year || 2017}</small>
        </div>
      </div>

      {/* Temporal Citation Growth Area Chart */}
      <div className="panel chart-panel" style={{ marginBottom: 18 }}>
        <div className="panel-title">
          <div>
            <h3>Citation Growth Over Time (2017–2024)</h3>
            <p>Annual citation accumulation across landmark publications</p>
          </div>
          <span className="sample-tag">HISTORICAL CITATION CORPUS</span>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={CITATION_NETWORK_DATA.citationHistoryByYear}
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="attentionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="bertGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#222336" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: '#8b8ea3', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#727589', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 10 }} />
              <Area type="monotone" dataKey="attention" name="Attention Is All You Need" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#attentionGrad)" />
              <Area type="monotone" dataKey="bert" name="BERT" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#bertGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Inflow vs Outflow Table Grid */}
      <div className="dashboard-grid">
        {/* INFLOW */}
        <section className="panel">
          <div className="panel-title">
            <div className="flow-title-wrap">
              <div className="flow-badge inflow"><ArrowDownLeft size={14} /> Citations Inflow</div>
              <h3>Subsequent Influential Works</h3>
              <p>Top seminal publications citing this root paper</p>
            </div>
          </div>

          <div className="flow-paper-list">
            {activeFlow.inflowKeyPapers.map((paper, idx) => (
              <div className="flow-paper-card" key={idx}>
                <div className="flow-paper-icon"><BookOpen size={16} /></div>
                <div className="flow-paper-info">
                  <b>{paper.title}</b>
                  <span>Published {paper.year}</span>
                </div>
                <div className="flow-citations">
                  <b>{paper.citations.toLocaleString()}</b>
                  <small>Citations</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* OUTFLOW */}
        <section className="panel">
          <div className="panel-title">
            <div className="flow-title-wrap">
              <div className="flow-badge outflow"><ArrowUpRight size={14} /> Citations Outflow</div>
              <h3>Foundational References Cited</h3>
              <p>Key prior literature upon which this paper builds</p>
            </div>
          </div>

          <div className="flow-paper-list">
            {activeFlow.outflowKeyPapers.map((paper, idx) => (
              <div className="flow-paper-card" key={idx}>
                <div className="flow-paper-icon"><BookOpen size={16} /></div>
                <div className="flow-paper-info">
                  <b>{paper.title}</b>
                  <span>Published {paper.year}</span>
                </div>
                <div className="flow-citations">
                  <b>{paper.citations.toLocaleString()}</b>
                  <small>Citations</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
