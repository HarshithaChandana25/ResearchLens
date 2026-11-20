import React, { useState } from 'react'
import {
  Clock3,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  Filter,
  Layers,
  ChevronRight,
} from 'lucide-react'

export default function ResearchTimeline({
  papers = [],
  onOpenPaper,
  onToast,
}) {
  const [selectedTopic, setSelectedTopic] = useState('All')

  const TIMELINE_EVENTS = [
    {
      year: 2016,
      date: 'December 2016',
      paperId: 4,
      title: 'Deep Residual Learning for Image Recognition (ResNet)',
      authors: 'He et al. • CVPR 2016',
      topic: 'Computer Vision',
      milestone: 'Residual Learning Paradigm',
      impact: 'Introduced identity skip connections that solved the depth degradation problem, enabling deep networks exceeding 100 layers.',
      citations: '215,000+ citations',
    },
    {
      year: 2017,
      date: 'June 2017',
      paperId: 1,
      title: 'Attention Is All You Need (Transformer)',
      authors: 'Vaswani et al. • NeurIPS 2017',
      topic: 'Deep Learning',
      milestone: 'Self-Attention Foundation',
      impact: 'Dispensed with sequential recurrence and convolutions entirely; established the standard architecture powering modern generative AI.',
      citations: '118,000+ citations',
    },
    {
      year: 2019,
      date: 'June 2019',
      paperId: 2,
      title: 'BERT: Pre-training of Deep Bidirectional Transformers',
      authors: 'Devlin et al. • NAACL 2019',
      topic: 'Natural Language Processing',
      milestone: 'Bidirectional Language Pre-training',
      impact: 'Established the pre-training & fine-tuning paradigm using Masked Language Modeling and Next Sentence Prediction.',
      citations: '88,000+ citations',
    },
    {
      year: 2020,
      date: 'May 2020',
      paperId: 3,
      title: 'Retrieval-Augmented Generation (RAG)',
      authors: 'Lewis et al. • NeurIPS 2020',
      topic: 'Generative AI',
      milestone: 'Parametric & Non-Parametric Hybridization',
      impact: 'Pioneered combining pre-trained seq2seq generators with external dense vector passage indices to reduce hallucinations.',
      citations: '12,400+ citations',
    },
    {
      year: 2021,
      date: 'June 2021',
      paperId: 8,
      title: 'LoRA: Low-Rank Adaptation of Large Language Models',
      authors: 'Hu et al. • ICLR 2021',
      topic: 'Deep Learning',
      milestone: 'Parameter-Efficient Fine-Tuning (PEFT)',
      impact: 'Froze pre-trained weights and learned low-rank update matrices, reducing trainable parameters by 10,000x with zero added latency.',
      citations: '18,400+ citations',
    },
    {
      year: 2022,
      date: 'January 2022',
      paperId: 7,
      title: 'Chain-of-Thought Prompting Elicits Reasoning in LLMs',
      authors: 'Wei et al. • NeurIPS 2022',
      topic: 'Generative AI',
      milestone: 'Emergent Reasoning Elicitation',
      impact: 'Demonstrated that few-shot step-by-step rationales unlock complex multi-step arithmetic and symbolic reasoning in 50B+ models.',
      citations: '8,200+ citations',
    },
    {
      year: 2023,
      date: 'March 2023',
      paperId: 5,
      title: 'A Survey of Large Language Models',
      authors: 'Zhao et al. • AI Open 2023',
      topic: 'Generative AI',
      milestone: 'Systematic LLM Taxonomy',
      impact: 'Unified the explosion of generative language models into a cohesive taxonomy of pre-training, instruction tuning, and alignment.',
      citations: '5,600+ citations',
    },
    {
      year: 2024,
      date: 'February 2024',
      paperId: 6,
      title: 'The Next Generation of AI Evaluation & Reproducibility',
      authors: 'ResearchLens Consortium',
      topic: 'AI Evaluation',
      milestone: '11-Dimension Reproducibility Rubric',
      impact: 'Established standardized documentation checklists auditing seed disclosures, hardware transparency, and empirical evidence.',
      citations: '540+ citations',
    },
  ]

  const topics = ['All', ...new Set(TIMELINE_EVENTS.map(e => e.topic))]

  const filteredEvents = TIMELINE_EVENTS.filter(e => {
    return selectedTopic === 'All' || e.topic === selectedTopic
  })

  return (
    <div className="timeline-page">
      {/* Intro Header */}
      <div className="page-intro-box">
        <div className="intro-content">
          <div className="eyebrow"><Clock3 size={14} /> HISTORICAL EVOLUTION OF FOUNDATION AI</div>
          <h2>Scientific Research Timeline</h2>
          <p>
            Trace the chronological milestones that transformed deep learning: from residual skip connections
            and the Transformer to bidirectional pre-training, parameter efficiency (LoRA), and retrieval augmentation (RAG).
          </p>
        </div>

        <div className="timeline-filter">
          <span className="filter-label">Filter Domain:</span>
          <select
            className="filter-select"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            {topics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="timeline-stream-container">
        {filteredEvents.map((event, idx) => {
          const matchPaper = papers.find(p => p.id === event.paperId)

          return (
            <div className="timeline-entry-row" key={idx}>
              <div className="timeline-date-col">
                <span className="date-badge">{event.date}</span>
                <span className="year-large">{event.year}</span>
              </div>

              <div className="timeline-spine">
                <div className="spine-dot" />
                {idx < filteredEvents.length - 1 && <div className="spine-line" />}
              </div>

              <div className="timeline-card">
                <div className="timeline-card-header">
                  <span className="milestone-pill">{event.milestone}</span>
                  <span className="topic-pill">{event.topic}</span>
                  <span className="citation-pill">{event.citations}</span>
                </div>

                <h3>{event.title}</h3>
                <p className="timeline-authors">{event.authors}</p>
                <p className="timeline-impact">{event.impact}</p>

                <div className="timeline-card-footer">
                  <button
                    className="btn secondary small-btn"
                    onClick={() => {
                      if (matchPaper) onOpenPaper(matchPaper)
                      else onToast?.(`Opening analysis for ${event.title}...`)
                    }}
                  >
                    <Sparkles size={14} /> Open AI Paper Analysis <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
