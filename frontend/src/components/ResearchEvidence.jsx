import { useMemo, useState } from 'react'
import { AlertCircle, BookOpen, Network } from 'lucide-react'

const statusClass = status => (typeof status === 'string' ? status : 'Unable to Assess').toLowerCase().replaceAll(' ', '-')

export function ReproducibilityReport({ analysis }) {
  const checklist = Array.isArray(analysis?.reproducibility_checklist)
    ? analysis.reproducibility_checklist.filter(entry => entry && typeof entry === 'object')
    : []
  const completeness = analysis?.reporting_completeness
  const reported = Array.isArray(completeness?.reported) ? completeness.reported : []
  const notFound = Array.isArray(completeness?.not_found) ? completeness.not_found : []
  const unableToAssess = Array.isArray(completeness?.unable_to_assess)
    ? completeness.unable_to_assess
    : []
  const hasAssessment = checklist.length > 0 && completeness !== null && typeof completeness === 'object'

  return (
    <section className="panel evidence-panel">
      <div className="evidence-heading">
        <div>
          <h3>Reproducibility checklist</h3>
          <p>Checklist statuses and completeness are provided by the backend analysis.</p>
        </div>
        <span className="sample-tag">BACKEND ASSESSMENT</span>
      </div>
      {hasAssessment ? (
        <>
          <div className="completeness-summary">
            <div className="completeness-score">
              {typeof completeness.percentage === 'number' && Number.isFinite(completeness.percentage)
                ? `${completeness.percentage}%`
                : '—'}
            </div>
            <div>
              <b>Reporting completeness</b>
              <span>
                {reported.length} reported of {Number.isInteger(completeness.assessable_items)
                  ? completeness.assessable_items
                  : reported.length + notFound.length} assessable items
              </span>
              <span className="completeness-counts">
                Reported: {reported.length} · Not Found: {notFound.length} · Unable to Assess: {unableToAssess.length}
              </span>
            </div>
          </div>
          <p className="completeness-disclaimer">
            {typeof completeness.note === 'string' && completeness.note.trim()
              ? completeness.note
              : 'This score measures reporting completeness in the accessible analyzed text; it is not proof that the results are reproducible.'}
          </p>
          <p className="completeness-disclaimer denominator-note">Unable to Assess items are excluded from the percentage denominator.</p>
          <div className="repro-checklist">
            {checklist.map((entry, index) => (
              <article className="repro-checklist-item" key={`${entry.item}-${index}`}>
                <div className="repro-item-top">
                  <b>{typeof entry.item === 'string' ? entry.item : 'Checklist item'}</b>
                  <span className={`repro-status ${statusClass(entry.status)}`}>{typeof entry.status === 'string' ? entry.status : 'Unable to Assess'}</span>
                </div>
                <p>{typeof entry.evidence === 'string' && entry.evidence.trim() ? entry.evidence : (entry.status === 'Unable to Assess'
                  ? 'The backend could not assess this item from the supplied paper text.'
                  : entry.status === 'Not Found'
                    ? 'Not Found means this item was not located in the accessible analyzed text.'
                    : 'No evidence excerpt was returned.')}</p>
                {typeof entry.page_number === 'number' && (
                  <small className="repro-page-number">Evidence on page {entry.page_number}</small>
                )}
              </article>
            ))}
          </div>
          <div className="missing-information">
            <b>Assessment items</b>
            <div className="assessment-item-groups">
              <div><b>Reported</b>{reported.length
                ? <ul>{reported.map((entry, index) => <li key={`reported-${entry?.item}-${index}`}>{typeof entry?.item === 'string' ? entry.item : 'Checklist item'}</li>)}</ul>
                : <p>None reported.</p>}</div>
              <div><b>Not Found</b>{notFound.length
                ? <ul>{notFound.map((entry, index) => <li key={`missing-${entry?.item}-${index}`}>{typeof entry?.item === 'string' ? entry.item : 'Checklist item'}</li>)}</ul>
                : <p>None.</p>}</div>
              <div><b>Unable to Assess</b>{unableToAssess.length
                ? <ul>{unableToAssess.map((entry, index) => <li key={`unable-${entry?.item}-${index}`}>{typeof entry?.item === 'string' ? entry.item : 'Checklist item'}</li>)}</ul>
                : <p>None.</p>}</div>
            </div>
          </div>
        </>
      ) : (
        <div className="evidence-empty compact">
          <AlertCircle size={19}/>
          <span>Run the backend analysis to receive the reproducibility checklist and reporting-completeness assessment.</span>
        </div>
      )}
    </section>
  )
}

function ProcessingCoverage({ analysis }) {
  const coverage = analysis?.processing_coverage
  if (!coverage || typeof coverage !== 'object' || Array.isArray(coverage)) return null

  const status = typeof coverage.status === 'string' ? coverage.status : 'Unavailable'
  const statusClassName = status.toLowerCase() === 'complete'
    ? 'complete'
    : status.toLowerCase() === 'partial'
      ? 'partial'
      : 'unknown'
  const formatCount = value => Number.isInteger(value) && value >= 0 ? value.toLocaleString() : '—'
  const ranges = Array.isArray(coverage.unprocessed_ranges)
    ? coverage.unprocessed_ranges.filter(range =>
      Number.isInteger(range?.start_char)
      && range.start_char >= 0
      && Number.isInteger(range?.end_char_exclusive)
      && range.end_char_exclusive > range.start_char,
    )
    : []

  return (
    <section className="panel evidence-panel processing-coverage">
      <div className="evidence-heading">
        <div>
          <h3>Processing coverage</h3>
          <p>Text coverage reported by the backend analysis.</p>
        </div>
        <span className={`coverage-status ${statusClassName}`}>{status}</span>
      </div>
      <div className="coverage-metrics">
        <div><b>{formatCount(coverage.processed_characters)} / {formatCount(coverage.total_characters)}</b><span>Characters processed</span></div>
        <div><b>{formatCount(coverage.unprocessed_characters)}</b><span>Characters unprocessed</span></div>
        <div><b>{formatCount(coverage.processed_chunks)} / {formatCount(coverage.total_chunks)}</b><span>Chunks processed</span></div>
      </div>
      {ranges.length > 0 && (
        <div className="coverage-ranges">
          <b>Unprocessed text ranges</b>
          <ul>
            {ranges.map((range, index) => (
              <li key={`${range.start_char}-${range.end_char_exclusive}-${index}`}>
                Characters {(range.start_char + 1).toLocaleString()}–{range.end_char_exclusive.toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
      {Number.isInteger(coverage.unprocessed_characters) && coverage.unprocessed_characters > 0 && ranges.length === 0 && (
        <p className="coverage-note">The backend reported unprocessed text but did not return valid range details.</p>
      )}
    </section>
  )
}

export function RelatedPapers() {
  return (
    <section className="panel evidence-panel">
      <div className="evidence-heading">
        <div>
          <h3>Related papers</h3>
          <p>Recommendations require real citation or paper metadata.</p>
        </div>
        <BookOpen size={18} className="evidence-icon"/>
      </div>
      <div className="evidence-empty">
        <AlertCircle size={20}/>
        <b>No verified recommendations available</b>
        <span>The connected API does not provide related-paper records. The local demo collection is not used to generate recommendations.</span>
      </div>
    </section>
  )
}

const usableGraphText = value => typeof value === 'string'
  && value.trim()
  && !['unable to assess', 'not found', 'unknown', 'not provided'].includes(value.trim().toLowerCase())

function getGraphAnalysis(record) {
  const analysis = record?.analysis
  if (!analysis || typeof analysis !== 'object' || Array.isArray(analysis)) return null
  const nested = analysis.analysis
  return nested && typeof nested === 'object' && !Array.isArray(nested) ? nested : analysis
}

function getGraphAuthors(record, analysis) {
  const authors = []
  if (Array.isArray(analysis?.authors)) {
    analysis.authors.filter(usableGraphText).forEach(name => authors.push({
      name: name.trim(),
      source: 'Backend analysis',
    }))
  } else if (usableGraphText(analysis?.authors)) {
    authors.push({ name: analysis.authors.trim(), source: 'Backend analysis' })
  }
  if (usableGraphText(record.metadata?.author)) {
    authors.push({ name: record.metadata.author.trim(), source: 'PDF metadata' })
  }

  const uniqueAuthors = new Map()
  authors.forEach(author => {
    const key = author.name.toLocaleLowerCase()
    const existing = uniqueAuthors.get(key)
    if (existing) existing.sources.add(author.source)
    else uniqueAuthors.set(key, { name: author.name, sources: new Set([author.source]) })
  })
  return [...uniqueAuthors.values()]
}

export function ResearchKnowledgeGraph({ history = [], savedPapers = [] }) {
  const [selectedNode, setSelectedNode] = useState(null)
  const graph = useMemo(() => {
    const recordsById = new Map()
    ;[...(Array.isArray(savedPapers) ? savedPapers : []), ...(Array.isArray(history) ? history : [])]
      .filter(record => record && typeof record === 'object' && !Array.isArray(record))
      .forEach((record, index) => {
        const key = String(record.paperId ?? record.id ?? `${record.filename ?? 'paper'}-${index}`)
        const existing = recordsById.get(key)
        const existingAnalysis = getGraphAnalysis(existing)
        const nextAnalysis = getGraphAnalysis(record)
        recordsById.set(key, {
          ...existing,
          ...record,
          metadata: { ...existing?.metadata, ...record.metadata },
          analysis: nextAnalysis ? { ...existingAnalysis, ...nextAnalysis } : existing?.analysis,
          createdAt: record.createdAt ?? existing?.createdAt,
        })
      })

    const papers = [...recordsById.entries()].flatMap(([id, record]) => {
      const analysis = getGraphAnalysis(record)
      const metadataTitle = usableGraphText(record.metadata?.title) ? record.metadata.title.trim() : ''
      const analysisTitle = usableGraphText(analysis?.research_title) ? analysis.research_title.trim() : ''
      const filename = usableGraphText(record.clientFilename)
        ? record.clientFilename.trim()
        : usableGraphText(record.filename) ? record.filename.trim() : ''
      const title = metadataTitle || analysisTitle || filename
      if (!title) return []
      return [{
        id,
        record,
        analysis,
        title,
        titleSource: metadataTitle ? 'PDF metadata' : analysisTitle ? 'Backend analysis' : 'Uploaded filename',
        authors: getGraphAuthors(record, analysis),
      }]
    })

    const authorMap = new Map()
    papers.forEach(paper => paper.authors.forEach(author => {
      const key = author.name.toLocaleLowerCase()
      if (!authorMap.has(key)) authorMap.set(key, { key, name: author.name, papers: new Map(), sources: new Set() })
      const authorNode = authorMap.get(key)
      authorNode.papers.set(paper.id, paper)
      author.sources.forEach(source => authorNode.sources.add(source))
    }))
    return { papers, authors: [...authorMap.values()] }
  }, [history, savedPapers])
  const authorByKey = new Map(graph.authors.map(author => [author.key, author]))
  const paperY = new Map(graph.papers.map((paper, index) => [paper.id, 56 + index * 82]))
  const authorY = new Map(graph.authors.map((author, index) => [author.key, 56 + index * 82]))
  const graphHeight = Math.max(150, Math.max(graph.papers.length, graph.authors.length) * 82 + 28)
  const selectedPaper = selectedNode?.type === 'paper'
    ? graph.papers.find(paper => paper.id === selectedNode.id)
    : null
  const selectedAuthor = selectedNode?.type === 'author'
    ? authorByKey.get(selectedNode.id)
    : null
  const selectFromKeyboard = (event, node) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelectedNode(node)
    }
  }

  return (
    <section className="panel evidence-panel knowledge-graph-panel">
      <div className="evidence-heading">
        <div>
          <h3>Knowledge graph</h3>
          <p>Uploaded papers and authors linked only when present in saved record metadata or its backend analysis.</p>
        </div>
        <Network size={18} className="evidence-icon"/>
      </div>
      {graph.papers.length ? (
        <>
          <div className="knowledge-graph-legend" aria-label="Knowledge graph legend">
            <span><i className="graph-legend-paper"/> Paper</span>
            <span><i className="graph-legend-author"/> Author</span>
            <span><i className="graph-legend-edge"/> Authorship recorded in source data</span>
          </div>
          <div className="evidence-graph knowledge-graph-canvas">
            <svg viewBox={`0 0 960 ${graphHeight}`} role="img" aria-label="Knowledge graph of saved uploaded papers and their recorded authors">
              {graph.papers.flatMap(paper => paper.authors.map(author => (
                <line
                  key={`edge-${paper.id}-${author.name.toLocaleLowerCase()}`}
                  x1="280"
                  y1={paperY.get(paper.id)}
                  x2="680"
                  y2={authorY.get(author.name.toLocaleLowerCase())}
                  stroke="#7662a8"
                  strokeWidth="2"
                >
                  <title>{`Authorship recorded for ${paper.title}; source: ${[...author.sources].join(' and ')}`}</title>
                </line>
              )))}
              {graph.papers.map(paper => (
                <g
                  key={`paper-${paper.id}`}
                  className={`knowledge-graph-node paper-node ${selectedNode?.type === 'paper' && selectedNode.id === paper.id ? 'selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Paper: ${paper.title}. Select to view details.`}
                  onClick={() => setSelectedNode({ type: 'paper', id: paper.id })}
                  onKeyDown={event => selectFromKeyboard(event, { type: 'paper', id: paper.id })}
                >
                  <title>{`${paper.title} (${paper.titleSource})`}</title>
                  <circle cx="260" cy={paperY.get(paper.id)} r="10" fill="#a98bff"/>
                  <text x="282" y={paperY.get(paper.id) + 4}>{paper.title.length > 54 ? `${paper.title.slice(0, 51)}…` : paper.title}</text>
                </g>
              ))}
              {graph.authors.map(author => (
                <g
                  key={`author-${author.key}`}
                  className={`knowledge-graph-node author-node ${selectedNode?.type === 'author' && selectedNode.id === author.key ? 'selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Author: ${author.name}. Select to view linked papers.`}
                  onClick={() => setSelectedNode({ type: 'author', id: author.key })}
                  onKeyDown={event => selectFromKeyboard(event, { type: 'author', id: author.key })}
                >
                  <title>{`${author.name}; source: ${[...author.sources].join(' and ')}`}</title>
                  <circle cx="700" cy={authorY.get(author.key)} r="10" fill="#80b7d8"/>
                  <text x="722" y={authorY.get(author.key) + 4}>{author.name.length > 34 ? `${author.name.slice(0, 31)}…` : author.name}</text>
                </g>
              ))}
            </svg>
          </div>
          <p className="graph-disclaimer">Solid lines represent an author name recorded in a saved PDF metadata field or returned by the backend analysis. They do not represent verified citations or independently validated authorship. No methods, datasets, citations, or other inferred relationships are shown.</p>
          {(selectedPaper || selectedAuthor) && (
            <div className="graph-node-details" aria-live="polite">
              <div className="graph-node-details-heading">
                <div>
                  <span className="sample-tag">{selectedPaper ? 'PAPER DETAILS' : 'AUTHOR DETAILS'}</span>
                  <h4>{selectedPaper?.title ?? selectedAuthor?.name}</h4>
                </div>
                <button className="btn secondary" onClick={() => setSelectedNode(null)}>Close</button>
              </div>
              {selectedPaper ? (
                <>
                  <p><b>Title source:</b> {selectedPaper.titleSource}</p>
                  {selectedPaper.authors.length ? (
                    <div className="graph-detail-authors">
                      <b>Authors recorded in source data</b>
                      {selectedPaper.authors.map(author => (
                        <button key={author.name.toLocaleLowerCase()} onClick={() => setSelectedNode({ type: 'author', id: author.name.toLocaleLowerCase() })}>
                          {author.name} <small>{[...author.sources].join(' · ')}</small>
                        </button>
                      ))}
                    </div>
                  ) : <p>No author metadata or analysis-reported authors are available for this paper.</p>}
                  {usableGraphText(selectedPaper.analysis?.paper_summary) && <p><b>Backend summary:</b> {selectedPaper.analysis.paper_summary}</p>}
                  {usableGraphText(selectedPaper.record.filename) && <p><b>Uploaded file:</b> {selectedPaper.record.filename}</p>}
                  {selectedPaper.record.createdAt && <p><b>Saved analysis:</b> {new Date(selectedPaper.record.createdAt).toLocaleString()}</p>}
                </>
              ) : (
                <>
                  <p>Author name recorded in: {[...selectedAuthor.sources].join(' and ')}.</p>
                  <b>Linked papers</b>
                  <div className="graph-detail-authors">
                    {[...selectedAuthor.papers.values()].map(paper => (
                      <button key={paper.id} onClick={() => setSelectedNode({ type: 'paper', id: paper.id })}>{paper.title}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="evidence-empty">
          <Network size={20}/>
          <b>No uploaded papers available</b>
          <span>Save or analyze an uploaded paper to add its real title and any recorded author information here. No relationships are inferred.</span>
        </div>
      )}
    </section>
  )
}

export { ProcessingCoverage }
