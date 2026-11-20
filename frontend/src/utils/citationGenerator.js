/**
 * ResearchLens Citation Generator
 * Generates accurate academic citations across APA 7th, IEEE, MLA 9th, Chicago, and BibTeX formats.
 */

export function formatAuthorsAPA(authorsStr) {
  if (!authorsStr) return 'Anonymous'
  const authors = authorsStr.split(/,|and/).map(a => a.trim()).filter(Boolean)
  if (authors.length === 1) return authors[0]
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`
  return `${authors[0]} et al.`
}

export function formatAuthorsIEEE(authorsStr) {
  if (!authorsStr) return 'Anon.'
  const authors = authorsStr.split(/,|and/).map(a => a.trim()).filter(Boolean)
  if (authors.length <= 3) return authors.join(', ')
  return `${authors[0]} et al.`
}

export function generateAPA(paper) {
  const authors = formatAuthorsAPA(paper.authors || paper.metadata?.author)
  const year = paper.year || new Date().getFullYear()
  const title = paper.title || paper.metadata?.title || paper.filename
  const venue = paper.venue || paper.metadata?.subject || 'arXiv preprint'
  const doi = paper.doi ? ` https://doi.org/${paper.doi}` : ''
  return `${authors} (${year}). ${title}. ${venue}.${doi}`
}

export function generateIEEE(paper) {
  const authors = formatAuthorsIEEE(paper.authors || paper.metadata?.author)
  const title = paper.title || paper.metadata?.title || paper.filename
  const venue = paper.venue || paper.metadata?.subject || 'Proc. Conf.'
  const year = paper.year || new Date().getFullYear()
  const doi = paper.doi ? `, doi: ${paper.doi}` : ''
  return `${authors}, "${title}," in ${venue}, ${year}${doi}.`
}

export function generateMLA(paper) {
  const authors = paper.authors ? paper.authors.split(',')[0].trim() : (paper.metadata?.author || 'Unknown')
  const title = paper.title || paper.metadata?.title || paper.filename
  const venue = paper.venue || paper.metadata?.subject || 'Academic Journal'
  const year = paper.year || new Date().getFullYear()
  return `${authors}, et al. "${title}." ${venue}, ${year}.`
}

export function generateChicago(paper) {
  const authors = paper.authors || paper.metadata?.author || 'Unknown'
  const title = paper.title || paper.metadata?.title || paper.filename
  const venue = paper.venue || paper.metadata?.subject || 'Academic Press'
  const year = paper.year || new Date().getFullYear()
  return `${authors}. "${title}." ${venue} (${year}).`
}

export function generateBibTeX(paper) {
  const firstAuthor = (paper.authors || paper.metadata?.author || 'unknown').split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')
  const year = paper.year || new Date().getFullYear()
  const key = `${firstAuthor}${year}${paper.id ? paper.id : 'ref'}`
  const title = (paper.title || paper.metadata?.title || paper.filename || '').replace(/[{}]/g, '')
  const authors = paper.authors || paper.metadata?.author || 'Unknown'
  const booktitle = paper.venue || paper.metadata?.subject || 'arXiv'

  return `@article{${key},
  author    = {${authors}},
  title     = {${title}},
  journal   = {${booktitle}},
  year      = {${year}}${paper.doi ? `,\n  doi       = {${paper.doi}}` : ''}
}`
}

export function generateCitations(paper) {
  return {
    APA: generateAPA(paper),
    IEEE: generateIEEE(paper),
    MLA: generateMLA(paper),
    Chicago: generateChicago(paper),
    BibTeX: generateBibTeX(paper),
  }
}

export function downloadBibTeXFile(paper) {
  const bibtex = generateBibTeX(paper)
  const blob = new Blob([bibtex], { type: 'application/x-bibtex;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(paper.title || 'citation').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}.bib`
  a.click()
  URL.revokeObjectURL(url)
}
