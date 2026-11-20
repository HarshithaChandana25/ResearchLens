import React, { useState } from 'react'
import { X, Check, Copy, Download, BookOpen, Sparkles } from 'lucide-react'
import { generateCitations, downloadBibTeXFile } from '../utils/citationGenerator'

export default function CitationModal({ paper, onClose, onToast }) {
  const [copiedKey, setCopiedKey] = useState(null)
  const [activeTab, setActiveTab] = useState('APA')

  if (!paper) return null

  const citations = generateCitations(paper)

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    if (onToast) onToast(`Copied ${key} citation to clipboard!`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card citation-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon"><BookOpen size={18} /></div>
            <div>
              <h3>Generate Citation</h3>
              <p>{paper.title || paper.metadata?.title || paper.filename}</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
        </div>

        <div className="citation-tabs">
          {['APA', 'IEEE', 'MLA', 'Chicago', 'BibTeX'].map(tab => (
            <button
              key={tab}
              className={`citation-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="citation-content">
          <div className="citation-box">
            {activeTab === 'BibTeX' ? (
              <pre className="bibtex-code">{citations[activeTab]}</pre>
            ) : (
              <p className="citation-text">{citations[activeTab]}</p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn secondary"
            onClick={() => downloadBibTeXFile(paper)}
          >
            <Download size={15} /> Download .bib
          </button>
          <button
            className="btn primary"
            onClick={() => handleCopy(activeTab, citations[activeTab])}
          >
            {copiedKey === activeTab ? <Check size={15} /> : <Copy size={15} />}
            {copiedKey === activeTab ? 'Copied to Clipboard' : `Copy ${activeTab} Citation`}
          </button>
        </div>
      </div>
    </div>
  )
}
