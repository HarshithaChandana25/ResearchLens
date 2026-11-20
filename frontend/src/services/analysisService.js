/**
 * ResearchLens AI Analysis Service
 * Manages Gemini API integration through the FastAPI backend (/api/analysis/).
 * Provides structured schema compliance, reproducibility parsing, and demo fallbacks.
 */

import { requestJson } from './api'

export const ANALYSIS_SECTIONS = [
  { key: 'abstract', label: 'Abstract Summary', icon: 'FileText' },
  { key: 'research_problem', label: 'Research Problem', icon: 'AlertCircle' },
  { key: 'research_objectives', label: 'Research Objectives', icon: 'Target' },
  { key: 'research_questions', label: 'Research Questions', icon: 'HelpCircle' },
  { key: 'methodology', label: 'Proposed Methodology', icon: 'Cpu' },
  { key: 'dataset', label: 'Dataset Information', icon: 'Database' },
  { key: 'algorithms_models', label: 'Algorithms and Models', icon: 'Layers' },
  { key: 'experimental_setup', label: 'Experimental Setup', icon: 'Sliders' },
  { key: 'evaluation_metrics', label: 'Evaluation Metrics', icon: 'BarChart2' },
  { key: 'results_findings', label: 'Results and Findings', icon: 'Award' },
  { key: 'limitations', label: 'Limitations', icon: 'ShieldAlert' },
  { key: 'future_scope', label: 'Future Scope', icon: 'Compass' },
]

export const REPRODUCIBILITY_DIMENSIONS = [
  'Dataset availability',
  'Dataset source',
  'Source code availability',
  'Algorithm details',
  'Model architecture',
  'Hyperparameters',
  'Experimental environment',
  'Hardware specifications',
  'Evaluation metrics',
  'Training details',
  'Random seed information',
]

/**
 * Request real Gemini analysis from FastAPI backend
 */
export async function requestPaperAnalysis(paperText, pages = []) {
  if (!paperText || !paperText.trim()) {
    throw new Error('Paper text cannot be empty.')
  }

  const payload = {
    paper_text: paperText,
    pages: pages.map(p => ({
      page_number: p.page_number,
      text: p.text,
    })),
  }

  const result = await requestJson('/api/analysis/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 300000, 'AI analysis took longer than 5 minutes. The backend may still be processing.')

  return {
    ...result,
    isDemoAnalysis: false,
  }
}

/**
 * Generate comprehensive offline demo analysis for testing and preview
 */
export function generateDemoAnalysis(title, authors = 'ResearchLens Demo Collection') {
  return {
    isDemoAnalysis: true,
    research_title: title,
    authors: Array.isArray(authors) ? authors : [authors],
    abstract: `This paper presents an in-depth investigation into foundational architecture and methodological rigor. Through extensive empirical baselines, the study demonstrates the trade-offs between parameter efficiency, sample complexity, and generalization accuracy across diverse multimodal benchmarks.`,
    research_problem: `Current deep learning pipelines suffer from vulnerability to domain shift, quadratic computational scaling in sequence length, and insufficient transparency regarding training hyperparameter sensitivity.`,
    research_objectives: `1. Formulate a scalable architectural framework minimizing memory footprint.\n2. Quantify empirical gains against state-of-the-art benchmarks.\n3. Establish reproducible baseline metrics under constrained compute environments.`,
    research_questions: `RQ1: Does sparse attention retain semantic expressiveness in long-context tasks?\nRQ2: To what extent does pre-training data composition impact domain transfer accuracy?\nRQ3: What is the minimum compute budget required to reach baseline parity?`,
    methodology: `A hybrid architectural paradigm integrating multi-head attention with localized cross-entropy loss and dynamic residual weighting. The training procedure incorporates curriculum learning and gradient clipping to stabilize parameter updates.`,
    dataset: `Benchmark evaluations utilized 3 primary corpora: GLUE benchmark (8 tasks), Multi30k (de-en), and a newly curated domain adaptation corpus comprising 1.2M cleaned token sequences.`,
    algorithms_models: `Deep Transformer Encoder-Decoder (12 layers, 16 attention heads, hidden dimension 768) trained with AdamW optimizer, warmup-decay cosine schedule, and stochastic depth regularization.`,
    experimental_setup: `Training conducted on a cluster of 8x NVIDIA A100 (80GB) GPUs using PyTorch 2.2 with FlashAttention-2. Mixed precision (bfloat16) enabled. Batch size 128 across 300,000 optimization steps.`,
    evaluation_metrics: `BLEU-4, ROUGE-L, perplexity (PPL), exact match accuracy (EM), and inference throughput (tokens/sec/watt).`,
    results_findings: `The proposed architecture achieves a 3.4 BLEU gain over standard Transformer baselines while reducing memory footprint by 42%. Inference speed increased by 1.8x without degrading out-of-domain perplexity.`,
    limitations: `Ablation tests revealed sensitivity to learning rate warmup schedules. Performance diminishes when context windows exceed 8,192 tokens without positional interpolation. Requires significant compute for initial pre-training.`,
    future_scope: `Investigate sub-quadratic state space models (Mamba integration), automated hyperparameter search via Bayesian optimization, and deployment on edge TPU architectures.`,
    paper_summary: `A foundational contribution illustrating how attention mechanism refactorings enable higher throughput and superior generalization across language tasks.`,
    key_findings: [
      'Reduces GPU VRAM consumption by 42% via chunked memory caching.',
      'Achieves +3.4 BLEU score improvement across standard translation benchmarks.',
      'Demonstrates linear scaling characteristics up to 8k context length.',
      'Ablation studies reveal crucial dependency on first 5,000 warmup steps.',
    ],
    glossary: [
      { term: 'Attention Mechanism', definition: 'A mechanism that allows models to dynamically weight the relevance of different input tokens.' },
      { term: 'Perplexity (PPL)', definition: 'A measurement of how well a probability model predicts a sample in natural language processing.' },
      { term: 'FlashAttention', definition: 'An IO-aware exact attention algorithm that reduces memory access overhead on modern GPUs.' },
      { term: 'Cosine Warmup Schedule', definition: 'A learning rate schedule where learning rate linearly increases during warmup then decays along a cosine curve.' },
    ],
    evidence_references: [
      { section: 'Methodology', page: 3, quote: 'We introduce chunked positional indexing to bypass quadratic KV-cache allocation.' },
      { section: 'Results', page: 6, quote: 'Across all 8 GLUE test sets, the model scored 88.4 average score vs 85.0 baseline.' },
      { section: 'Limitations', page: 8, quote: 'Inference latency degraded when sequence length exceeded 8,192 without rotary interpolation.' },
    ],
    reproducibility_checklist: [
      { item: 'Dataset availability', status: 'Reported', evidence: 'GLUE benchmark is publicly accessible via huggingface.co/datasets/glue.', page_number: 2 },
      { item: 'Dataset source', status: 'Reported', evidence: 'Corpus sources detailed in Section 3.1 with URL citations.', page_number: 3 },
      { item: 'Source code availability', status: 'Reported', evidence: 'Official repository cited at github.com/researchlens-demo/repro.', page_number: 1 },
      { item: 'Algorithm details', status: 'Reported', evidence: 'Pseudocode and mathematical formulations provided in Algorithm 1.', page_number: 4 },
      { item: 'Model architecture', status: 'Reported', evidence: 'Layer specifications, dimension tables, and activation functions listed.', page_number: 4 },
      { item: 'Hyperparameters', status: 'Reported', evidence: 'Learning rate (5e-5), batch size (128), warmup (5000 steps), beta=(0.9, 0.98).', page_number: 5 },
      { item: 'Experimental environment', status: 'Reported', evidence: 'PyTorch 2.2, CUDA 12.1, Ubuntu 22.04 LTS.', page_number: 5 },
      { item: 'Hardware specifications', status: 'Reported', evidence: 'Cluster of 8x NVIDIA A100 (80GB) GPUs.', page_number: 5 },
      { item: 'Evaluation metrics', status: 'Reported', evidence: 'BLEU, ROUGE-L, and PPL described with standard evaluation scripts.', page_number: 6 },
      { item: 'Training details', status: 'Reported', evidence: '300,000 steps total training duration over 48 continuous compute hours.', page_number: 5 },
      { item: 'Random seed information', status: 'Not Found', evidence: 'No specific random seed (e.g. seed=42) or variance across seeds was stated.', page_number: null },
    ],
    reporting_completeness: {
      percentage: 90.9,
      assessable_items: 11,
      reported: 10,
      not_found: 1,
      unable_to_assess: 0,
      note: 'This score measures reporting completeness in the analyzed paper text; it does not confirm experimental reproducibility.',
    },
  }
}
