/**
 * ResearchLens Export Utilities
 * Exports research intelligence, literature reviews, comparisons, and analyses
 * into standardized Markdown, CSV, JSON, and printable formats.
 */

export function exportAnalysisToMarkdown(analysis, paperTitle) {
  if (!analysis) return

  let md = `# ResearchLens AI Analysis Report: ${analysis.research_title || paperTitle}\n\n`
  md += `**Date Generated:** ${new Date().toLocaleDateString()}\n`
  md += `**Authors:** ${Array.isArray(analysis.authors) ? analysis.authors.join(', ') : (analysis.authors || 'N/A')}\n\n`
  md += `---\n\n`

  const sections = [
    ['Abstract Summary', analysis.abstract],
    ['Research Problem', analysis.research_problem],
    ['Research Objectives', analysis.research_objectives],
    ['Research Questions', analysis.research_questions],
    ['Proposed Methodology', analysis.methodology],
    ['Dataset Information', analysis.dataset],
    ['Algorithms and Models', analysis.algorithms_models],
    ['Experimental Setup', analysis.experimental_setup],
    ['Evaluation Metrics', analysis.evaluation_metrics],
    ['Results and Findings', analysis.results_findings],
    ['Limitations', analysis.limitations],
    ['Future Scope', analysis.future_scope],
  ]

  sections.forEach(([title, content]) => {
    md += `## ${title}\n\n${content || 'Not reported in analysis.'}\n\n`
  })

  if (analysis.key_findings && analysis.key_findings.length) {
    md += `## Key Findings Highlights\n\n`
    analysis.key_findings.forEach(f => {
      md += `- ${f}\n`
    })
    md += `\n`
  }

  if (analysis.reproducibility_checklist && analysis.reproducibility_checklist.length) {
    md += `## Reproducibility Checklist\n\n`
    md += `| Item | Status | Evidence / Notes |\n|---|---|---|\n`
    analysis.reproducibility_checklist.forEach(item => {
      md += `| ${item.item} | **${item.status}** | ${item.evidence || 'N/A'} |\n`
    })
    md += `\n> *Note: This checklist evaluates documentation completeness in the paper text, not physical experiment replication.*\n\n`
  }

  downloadFile(md, `${(analysis.research_title || 'paper-analysis').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 35)}.md`, 'text/markdown')
}

export function exportAnalysisToJson(analysis, paperTitle) {
  if (!analysis) return
  const jsonStr = JSON.stringify({
    exportedAt: new Date().toISOString(),
    paperTitle,
    analysis,
  }, null, 2)
  downloadFile(jsonStr, `${(analysis.research_title || 'paper-analysis').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 35)}.json`, 'application/json')
}

export function exportComparisonToMarkdown(papers, categories) {
  let md = `# ResearchLens Multi-Paper Comparative Analysis\n\n`
  md += `**Generated:** ${new Date().toLocaleDateString()}\n`
  md += `**Compared Papers (${papers.length}):**\n`
  papers.forEach((p, i) => {
    md += `${i + 1}. *${p.title}* (${p.authors}, ${p.year})\n`
  })
  md += `\n---\n\n`

  categories.forEach(cat => {
    md += `## ${cat.label}\n\n`
    papers.forEach(p => {
      md += `### ${p.title} (${p.year})\n`
      md += `${cat.getter(p) || 'Not specified'}\n\n`
    })
  })

  downloadFile(md, `researchlens-comparison-${Date.now()}.md`, 'text/markdown')
}

export function exportComparisonToCSV(papers, categories) {
  const headers = ['Category', ...papers.map(p => `"${p.title.replace(/"/g, '""')} (${p.year})"`)]
  const rows = [headers.join(',')]

  categories.forEach(cat => {
    const row = [
      `"${cat.label}"`,
      ...papers.map(p => `"${String(cat.getter(p) || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`),
    ]
    rows.push(row.join(','))
  })

  downloadFile(rows.join('\n'), `researchlens-comparison-${Date.now()}.csv`, 'text/csv')
}

export function printFormattedReport(elementId) {
  window.print()
}

export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
