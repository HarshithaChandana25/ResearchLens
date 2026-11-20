import React, { useState } from 'react'
import {
  BookOpenCheck,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Sparkles,
  FileText,
  Printer,
  Layers,
  ListPlus,
  RefreshCw,
  FolderPlus,
} from 'lucide-react'
import { downloadFile, printFormattedReport } from '../utils/exportUtils'

export default function LiteratureReview({ papers = [], onToast }) {
  const [selectedPaperIds, setSelectedPaperIds] = useState([1, 2, 3, 8]) // Transformer, BERT, RAG, LoRA
  const [generating, setGenerating] = useState(false)
  const [reviewDraft, setReviewDraft] = useState(null)
  const [copied, setCopied] = useState(false)

  const toggleSelect = (id) => {
    setSelectedPaperIds(curr => {
      if (curr.includes(id)) {
        if (curr.length <= 1) {
          onToast?.('Select at least 2 papers to generate a comparative literature review.')
          return curr
        }
        return curr.filter(x => x !== id)
      }
      return [...curr, id]
    })
  }

  const selectedPapers = papers.filter(p => selectedPaperIds.includes(p.id))

  const handleGenerateDraft = () => {
    setGenerating(true)
    setTimeout(() => {
      const draft = generateStructuredReview(selectedPapers)
      setReviewDraft(draft)
      setGenerating(false)
      onToast?.('Synthesized structured literature review draft.')
    }, 600)
  }

  const generateStructuredReview = (papersList) => {
    const titles = papersList.map(p => `[${p.shortAuthors || p.authors}, ${p.year}]`).join(', ')

    return {
      title: 'A Thematic Synthesis of Deep Attention Architectures and Pre-Trained Language Models',
      generatedAt: new Date().toLocaleDateString(),
      selectedCount: papersList.length,
      sections: [
        {
          heading: '1. Introduction & Background',
          content: `Over the past decade, natural language processing and computer vision have transitioned from task-specific recurrent and convolutional architectures toward unified, attention-driven foundation models. This literature review synthesizes insights from ${papersList.length} landmark publications (${titles}). Beginning with the elimination of recurrence in sequence transduction, recent literature exhibits two dominant evolutionary pressures: expanding representational capacity through self-supervised pre-training, and constraining downstream parameter footprint via parameter-efficient adaptations and retrieval augmentation.`,
        },
        {
          heading: '2. Methodological Paradigms & Taxonomic Grouping',
          content: `The selected works can be taxonomized into three core methodological clusters:
1. Core Attention Foundations: Vaswani et al. (2017) formulated scaled dot-product attention, replacing sequential recurrence with token-parallel projections.
2. Self-Supervised Bidirectional Pre-Training: Devlin et al. (2019) introduced masked language modeling and next sentence prediction, establishing the pre-train and fine-tune paradigm.
3. Efficient Scaling & Grounding: Hu et al. (2021) introduced rank-decomposition adapter matrices (LoRA), while Lewis et al. (2020) coupled generative sequence-to-sequence transformers with non-parametric neural retrieval (RAG).`,
        },
        {
          heading: '3. Comparative Synthesis of Results & Trade-Offs',
          content: `Across empirical benchmarks, each paradigm introduces distinct Pareto trade-offs. While dense pre-training (BERT-Large, GPT-3) delivers highest zero-shot and few-shot classification accuracy, it introduces severe memory bottlenecks during fine-tuning. LoRA mitigates this by freezing base model parameters and training only low-rank matrices (r=4 to 8), achieving parity with full fine-tuning while reducing VRAM by 3x. Concurrently, RAG demonstrates that coupling smaller generative models with external dense passage indices out-performs significantly larger closed-book models on knowledge-intensive question answering benchmarks while enabling verifiable audit trails.`,
        },
        {
          heading: '4. Critical Gaps & Open Scientific Challenges',
          content: `Despite substantial accuracy leaps, cross-literature meta-analysis uncovers several recurring limitations:
• Quadratic Complexity: Standard multi-head self-attention retains O(n^2) scaling, impeding long-context reasoning beyond 8,192 tokens.
• Empirical Reproducibility: A significant portion of evaluated literature omits random seed variations and hardware energy consumption metrics.
• Retrieval Contamination: RAG systems remain vulnerable to contradictory or noisy retrieval passages, which can trigger generative hallucinations.`,
        },
        {
          heading: '5. Synthesis & Concluding Remarks',
          content: `The trajectory of deep representation learning reveals that architectural scaling alone is insufficient. Future advancements will necessitate the convergence of parameter-efficient fine-tuning (PEFT), dynamic retrieval indexing, and standardized reproducibility audits. Researchers are encouraged to report multi-seed confidence intervals and quantify compute budgets to ensure scientific transparency.`,
        },
      ],
      references: papersList.map(p => ({
        citation: `[${p.shortAuthors || p.authors}, ${p.year}]`,
        full: `${p.authors} (${p.year}). "${p.title}." ${p.venue}.`,
      })),
    }
  }

  const handleCopyReview = () => {
    if (!reviewDraft) return
    let text = `# ${reviewDraft.title}\n\n`
    reviewDraft.sections.forEach(s => {
      text += `## ${s.heading}\n\n${s.content}\n\n`
    })
    text += `## References\n\n`
    reviewDraft.references.forEach(r => {
      text += `- ${r.citation} ${r.full}\n`
    })
    navigator.clipboard.writeText(text)
    setCopied(true)
    onToast?.('Literature review draft copied as Markdown.')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportMarkdown = () => {
    if (!reviewDraft) return
    let text = `# ${reviewDraft.title}\n\n`
    reviewDraft.sections.forEach(s => {
      text += `## ${s.heading}\n\n${s.content}\n\n`
    })
    text += `## References\n\n`
    reviewDraft.references.forEach(r => {
      text += `- ${r.citation} ${r.full}\n`
    })
    downloadFile(text, 'literature-review-draft.md', 'text/markdown')
  }

  return (
    <div className="lit-review-page">
      {/* Intro Header */}
      <div className="page-intro-box">
        <div className="intro-content">
          <div className="eyebrow"><BookOpenCheck size={14} /> MULTI-PAPER SYNTHESIS DRAFTING</div>
          <h2>Literature Review Builder</h2>
          <p>
            Select publications from your library, group them into thematic clusters, extract cross-cutting findings,
            and automatically generate a structured academic literature review draft formatted with inline citations.
          </p>
        </div>

        <button
          className="btn primary"
          disabled={generating}
          onClick={handleGenerateDraft}
        >
          {generating ? <RefreshCw size={15} className="spin" /> : <Sparkles size={15} />}
          {generating ? 'Synthesizing Literature...' : 'Generate Review Draft'}
        </button>
      </div>

      {/* Paper Selection Strip */}
      <div className="lit-selection-card">
        <div className="selection-header">
          <b>Select Papers for Synthesis ({selectedPaperIds.length} selected):</b>
          <span>Choose at least 2 papers to synthesize similarities and differences</span>
        </div>

        <div className="lit-paper-grid">
          {papers.map(p => {
            const isSelected = selectedPaperIds.includes(p.id)
            return (
              <div
                key={p.id}
                className={`lit-paper-check-card ${isSelected ? 'active' : ''}`}
                onClick={() => toggleSelect(p.id)}
              >
                <span className="check-box">{isSelected ? <CheckCircle2 size={16} /> : null}</span>
                <div className="lit-paper-info">
                  <b>{p.title}</b>
                  <span>{p.authors} • {p.venue} {p.year}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review Draft Area */}
      {reviewDraft ? (
        <div className="review-draft-container">
          <div className="draft-actions-bar">
            <div>
              <h3>{reviewDraft.title}</h3>
              <p>Synthesized across {reviewDraft.selectedCount} publications • Generated on {reviewDraft.generatedAt}</p>
            </div>
            <div className="draft-btns">
              <button className="btn secondary small-btn" onClick={handleCopyReview}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Markdown'}
              </button>
              <button className="btn secondary small-btn" onClick={handleExportMarkdown}>
                <Download size={14} /> Export .md
              </button>
              <button className="btn secondary small-btn" onClick={() => printFormattedReport()}>
                <Printer size={14} /> Print / PDF
              </button>
            </div>
          </div>

          <div className="draft-body">
            {reviewDraft.sections.map((sec, idx) => (
              <div className="draft-section" key={idx}>
                <h4>{sec.heading}</h4>
                <p>{sec.content}</p>
              </div>
            ))}

            <div className="draft-references">
              <h4>References</h4>
              <div className="ref-list">
                {reviewDraft.references.map((ref, idx) => (
                  <div className="ref-item" key={idx}>
                    <b className="ref-citation">{ref.citation}</b>
                    <span className="ref-text">{ref.full}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="draft-placeholder">
          <BookOpenCheck size={36} />
          <h3>Ready to Draft Literature Review</h3>
          <p>
            Select your papers above and click <strong>"Generate Review Draft"</strong> to assemble an integrated
            synthesis covering introduction, taxonomic groupings, comparative results, critical gaps, and references.
          </p>
          <button className="btn primary" onClick={handleGenerateDraft}>
            <Sparkles size={16} /> Generate Review Draft
          </button>
        </div>
      )}
    </div>
  )
}
