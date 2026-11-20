/**
 * ResearchLens Storage Service
 * Robust localStorage persistence with schema safety, fallback handling,
 * quota management, and default data seeding.
 */

import { readStoredArray, writeStoredArray } from '../utils/localStorage'

export const KEYS = {
  SAVED_PAPERS: 'researchlens-saved',
  SAVED_UPLOADS: 'researchlens-uploaded-saved',
  ANALYSIS_HISTORY: 'researchlens-analysis-history',
  NOTES: 'researchlens-notes',
  COLLECTIONS: 'researchlens-collections',
  HIGHLIGHTS: 'researchlens-highlights',
  ACTIVITY: 'researchlens-activity',
  SETTINGS: 'researchlens-settings',
}

export function getStoredSavedIds() {
  return readStoredArray(KEYS.SAVED_PAPERS).filter(id => Number.isInteger(id) || typeof id === 'string')
}

export function saveStoredSavedIds(ids) {
  writeStoredArray(KEYS.SAVED_PAPERS, ids)
}

export function getStoredUploads() {
  const records = readStoredArray(KEYS.SAVED_UPLOADS)
  return records.filter(r => r && typeof r === 'object' && !Array.isArray(r))
}

export function saveStoredUploads(uploads) {
  writeStoredArray(KEYS.SAVED_UPLOADS, uploads)
}

export function getStoredAnalysisHistory() {
  const history = readStoredArray(KEYS.ANALYSIS_HISTORY)
  return history.filter(r => r && typeof r === 'object' && !Array.isArray(r))
}

export function saveStoredAnalysisHistory(history) {
  writeStoredArray(KEYS.ANALYSIS_HISTORY, history)
}

export function getStoredNotes() {
  const notes = readStoredArray(KEYS.NOTES)
  if (notes.length === 0) {
    // Seed default research notes
    const seed = [
      {
        id: 'note-1',
        title: 'Key takeaways from Transformer Attention Mechanisms',
        paperId: 1,
        paperTitle: 'Attention Is All You Need',
        tags: ['Architecture', 'Scaling'],
        content: 'Self-attention calculates token interactions with O(n^2) complexity. Key idea: replacing recurrence enables massively parallel training on GPU clusters. Verify if FlashAttention-2 can be integrated in our benchmark.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'note-2',
        title: 'Reproducibility caveats in RAG architectures',
        paperId: 4,
        paperTitle: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
        tags: ['Reproducibility', 'RAG'],
        content: 'Check index versioning and vector database embeddings. Dense passage retrieval (DPR) indices change over time, which affects exact generation replication.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]
    writeStoredArray(KEYS.NOTES, seed)
    return seed
  }
  return notes
}

export function saveStoredNotes(notes) {
  writeStoredArray(KEYS.NOTES, notes)
}

export function getStoredCollections() {
  const collections = readStoredArray(KEYS.COLLECTIONS)
  if (collections.length === 0) {
    const seed = [
      { id: 'col-1', name: 'Foundation Architectures', color: '#8b5cf6', description: 'Landmark model backbones and foundational neural networks', paperIds: [1, 2, 5] },
      { id: 'col-2', name: 'Retrieval & RAG Systems', color: '#38bdf8', description: 'Parametric and non-parametric memory integrations', paperIds: [3, 4] },
      { id: 'col-3', name: 'Reproducibility & Benchmarks', color: '#10b981', description: 'Empirical verification and evaluation methodologies', paperIds: [6] },
    ]
    writeStoredArray(KEYS.COLLECTIONS, seed)
    return seed
  }
  return collections
}

export function saveStoredCollections(collections) {
  writeStoredArray(KEYS.COLLECTIONS, collections)
}

export function getStoredHighlights() {
  const highlights = readStoredArray(KEYS.HIGHLIGHTS)
  if (highlights.length === 0) {
    const seed = [
      {
        id: 'hl-1',
        paperId: 1,
        paperTitle: 'Attention Is All You Need',
        quote: 'The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.',
        page: 2,
        comment: 'Central claim on training throughput efficiency compared to RNNs.',
        tag: 'Efficiency',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'hl-2',
        paperId: 2,
        paperTitle: 'BERT: Pre-training of Deep Bidirectional Transformers',
        quote: 'Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.',
        page: 1,
        comment: 'Key distinction from unidirectional representations like OpenAI GPT-1.',
        tag: 'Architecture',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ]
    writeStoredArray(KEYS.HIGHLIGHTS, seed)
    return seed
  }
  return highlights
}

export function saveStoredHighlights(highlights) {
  writeStoredArray(KEYS.HIGHLIGHTS, highlights)
}

export function logActivity(action, details, paperTitle = null) {
  try {
    const current = readStoredArray(KEYS.ACTIVITY)
    const entry = {
      id: `act-${Date.now()}`,
      action,
      details,
      paperTitle,
      timestamp: new Date().toISOString(),
    }
    const updated = [entry, ...current].slice(0, 50)
    writeStoredArray(KEYS.ACTIVITY, updated)
    return entry
  } catch (e) {
    console.error('Failed to log activity:', e)
  }
}

export function getRecentActivity() {
  const acts = readStoredArray(KEYS.ACTIVITY)
  if (acts.length === 0) {
    return [
      { id: 'act-init-1', action: 'Analyzed paper', details: 'Full paper analysis completed', paperTitle: 'Attention Is All You Need', timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString() },
      { id: 'act-init-2', action: 'Checked reproducibility', details: 'Documentation score calculated (91%)', paperTitle: 'BERT: Pre-training of Deep Bidirectional Transformers', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
      { id: 'act-init-3', action: 'Compared papers', details: 'Side-by-side comparison between Transformer & RAG', paperTitle: '3 papers compared', timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString() },
      { id: 'act-init-4', action: 'Created literature draft', details: 'Thematic review draft generated', paperTitle: 'Language Models Literature Review', timestamp: new Date(Date.now() - 86400000).toISOString() },
    ]
  }
  return acts
}

export function getSettings() {
  try {
    const stored = localStorage.getItem(KEYS.SETTINGS)
    if (stored) return JSON.parse(stored)
  } catch (e) {}
  return {
    citationStyle: 'IEEE',
    demoMode: true,
    autoSaveNotes: true,
    showPageNumbers: true,
    theme: 'Dark Navy',
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
}
