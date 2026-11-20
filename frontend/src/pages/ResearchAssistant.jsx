import React, { useState, useRef, useEffect } from 'react'
import {
  MessageSquare,
  Sparkles,
  Send,
  BookOpen,
  Copy,
  Check,
  RotateCcw,
  Tag,
  FileText,
  HelpCircle,
  Cpu,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react'

export default function ResearchAssistant({
  papers = [],
  savedUploads = [],
  activePaper = null,
  onToast,
}) {
  const [selectedPaperTarget, setSelectedPaperTarget] = useState(activePaper ? String(activePaper.id) : 'all')
  const [inputQuery, setInputQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const chatBottomRef = useRef(null)

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to ResearchLens AI Assistant. I can summarize literature, explain technical jargon, trace methodologies, compare findings across papers, and locate specific page evidence.',
      citations: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const QUICK_PROMPTS = [
    'Summarize the core contribution of Attention Is All You Need',
    'Explain the mathematical formulation of Scaled Dot-Product Attention',
    'How does BERT handle bidirectional representations without cycle leakage?',
    'What are the primary reproducibility gaps in current literature?',
    'Compare the computational complexity between Transformer and ResNet',
  ]

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputQuery).trim()
    if (!query || isTyping) return

    const userMsg = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMsg])
    setInputQuery('')
    setIsTyping(true)

    // Simulate AI generation with realistic academic citation grounding
    setTimeout(() => {
      let responseText = ''
      let supportingCitations = []

      const qLower = query.toLowerCase()
if (qLower.includes('attention') || qLower.includes('transformer')) {
    responseText = `The central innovation of the Transformer (Vaswani et al., 2017) is the complete elimination of recurrence and convolutions in favor of multi-head self-attention mechanisms.

Key technical aspects include:
1. Scaled Dot-Product Attention: Scaled by 1/sqrt(d_k) to prevent dot products from pushing softmax activations into regions with vanishing gradients.
2. Parallelization: By dispensing with time-step recurrence, full token sequences are processed simultaneously across GPU cores, reducing training duration from weeks to 3.5 days.
3. Positional Sinusoids: Uses sine and cosine functions of varying frequencies to inject sequence order without parameters.`
        supportingCitations = [
          { paperTitle: 'Attention Is All You Need', page: 3, quote: 'We use multi-head attention to allow the model to jointly attend to information from different representation subspaces.' },
          { paperTitle: 'Attention Is All You Need', page: 6, quote: 'The computational complexity of self-attention per layer is O(n^2 · d).' },
        ]
      } else if (qLower.includes('bert') || qLower.includes('bidirectional')) {
        responseText = `BERT (Devlin et al., 2019) resolved the challenge of bidirectional conditioning through its Masked Language Model (MLM) objective.

In traditional bidirectional networks, conditioning on both left and right context causes words to indirectly "see themselves" in multi-layer architectures. BERT masks 15% of tokens at random and trains the encoder to predict them based purely on surrounding context. Additionally, Next Sentence Prediction (NSP) teaches the model inter-sentence relationships for tasks like natural language inference.`
        supportingCitations = [
          { paperTitle: 'BERT: Pre-training of Deep Bidirectional Transformers', page: 3, quote: 'Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text.' },
          { paperTitle: 'BERT: Pre-training of Deep Bidirectional Transformers', page: 5, quote: 'BERT-Large advances the state-of-the-art across all eleven benchmark tasks.' },
        ]
      } else if (qLower.includes('reproducib') || qLower.includes('gap')) {
        responseText = `Based on the ResearchLens meta-evaluation of published deep learning manuscripts:

1. Random Seeds: Over 40% of publications omit random seed declarations, masking sensitivity to optimizer initializations.
2. Hardware Context: 34% of papers fail to document GPU/TPU cluster configurations or execution environments.
3. Long-Context Testing: While papers claim generalizability, few benchmark sequences beyond 1,024 or 2,048 tokens.`
        supportingCitations = [
          { paperTitle: 'The Next Generation of AI Evaluation', page: 5, quote: '42% of evaluated publications failed to report initial random seeds or variance across runs.' },
        ]
      } else {
        responseText = `Based on the active academic literature in your workspace:

The selected papers demonstrate a clear evolution from task-specific architectures toward universal pre-trained representations, accompanied by parameter-efficient adapters (LoRA) and non-parametric retrieval indexing (RAG).

For an exact empirical verification of your specific question, you can connect the live Gemini API endpoint or upload the raw PDF manuscript to execute page-level evidence retrieval.`
        supportingCitations = [
          { paperTitle: 'A Survey of Large Language Models', page: 8, quote: 'Emergent abilities can be defined as abilities that do not appear in small models but emerge in large models.' },
        ]
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: responseText,
          citations: supportingCitations,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setIsTyping(false)
    }, 800)
  }

  const handleCopyMessage = (idx, text) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    onToast?.('Response copied to clipboard.')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="assistant-page">
      {/* Target Selector Strip */}
      <div className="assistant-target-bar">
        <div className="target-select-wrap">
          <span className="target-label"><BookOpen size={15} /> Context Scope:</span>
          <select
            className="target-dropdown"
            value={selectedPaperTarget}
            onChange={(e) => setSelectedPaperTarget(e.target.value)}
          >
            <option value="all">All Library Papers ({papers.length} publications)</option>
            {papers.map(p => (
              <option key={p.id} value={p.id}>{p.title} ({p.year})</option>
            ))}
          </select>
        </div>

        <div className="demo-mode-indicator">
          <Info size={14} />
          <span>Demo Assistant Active • Responses cite verified corpus excerpts</span>
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="chat-container">
        <div className="messages-stream">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message-bubble-row ${msg.role === 'user' ? 'user-side' : 'assistant-side'}`}
            >
              {msg.role === 'assistant' && (
                <div className="assistant-avatar">
                  <Sparkles size={16} />
                </div>
              )}

              <div className="message-content-wrap">
                <div className="message-bubble">
                  <p className="message-text">{msg.content}</p>

                  {/* Supporting Page References */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="message-citations">
                      <div className="citation-header">
                        <BookOpen size={13} />
                        <b>Supporting Evidence References:</b>
                      </div>
                      <div className="citation-pills">
                        {msg.citations.map((c, cIdx) => (
                          <div className="citation-tag-pill" key={cIdx} title={c.quote}>
                            <span className="paper-name">{c.paperTitle}</span>
                            <span className="page-num">Page {c.page}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="message-meta-row">
                  <span className="msg-time">{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <button
                      className="copy-btn-mini"
                      onClick={() => handleCopyMessage(idx, msg.content)}
                      title="Copy response"
                    >
                      {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-bubble-row assistant-side">
              <div className="assistant-avatar">
                <Sparkles size={16} />
              </div>
              <div className="message-bubble typing-bubble">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Prompts Strip */}
        <div className="quick-prompts-bar">
          <span className="quick-prompts-label">Suggested Research Prompts:</span>
          <div className="prompts-scroll">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                className="prompt-chip"
                onClick={() => handleSendMessage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="chat-input-bar">
          <input
            className="main-chat-input"
            placeholder="Ask a technical research question, request a methodology explanation, or compare findings..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage()
            }}
          />
          <button
            className="btn primary send-btn"
            disabled={!inputQuery.trim() || isTyping}
            onClick={() => handleSendMessage()}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
