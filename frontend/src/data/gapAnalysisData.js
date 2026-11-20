/**
 * ResearchLens Research Gap Analysis Engine Data
 * Synthesizes cross-paper patterns, identifies saturation, unexplored gaps,
 * common limitations, conflicting literature claims, and missing experiments.
 */

export const GAP_DATA = {
  frequentlyStudiedTopics: [
    {
      topic: 'Self-Attention Scaling & Dense Transformers',
      paperCount: 6,
      saturationScore: 92,
      trend: 'Saturated',
      description: 'Extensive focus on stacking attention layers and dense auto-regressive parameter scaling. Diminishing returns on purely scaling parameters without data quality filtering.',
    },
    {
      topic: 'In-Context Prompting & Zero-Shot Instruction Tuning',
      paperCount: 5,
      saturationScore: 85,
      trend: 'High Activity',
      description: 'Widespread research exploring prompt engineering, chain-of-thought rationales, and alignment tuning across standard academic benchmarks.',
    },
    {
      topic: 'Supervised Fine-Tuning & Parameter-Efficient Adapters (PEFT/LoRA)',
      paperCount: 4,
      saturationScore: 78,
      trend: 'Active',
      description: 'Heavy concentration on rank decomposition and low-bit quantization adapters for single-domain task transfers.',
    },
  ],

  lessExploredAreas: [
    {
      id: 'gap-1',
      title: 'Long-Tail Domain Robustness & OOD Generalization',
      urgency: 'High',
      gapScore: 88,
      papersAnalyzed: ['Attention Is All You Need', 'BERT', 'LoRA'],
      verifiedObservation: 'All evaluated models benchmarked against clean, standard datasets (GLUE, WMT, SQuAD). Real-world noisy OCR, grammatical irregularities, and dialect variations are sparsely tested.',
      aiSuggestedDirection: 'Formulate adversarial domain-shift test suites auditing attention weight dispersion under out-of-distribution phonological and syntactic noise.',
      suggestedQuestions: [
        'How do LoRA low-rank updates behave under significant vocabulary distribution shifts?',
        'Does dense retrieval (RAG) suffer from semantic drift when querying historical or low-resource vernacular texts?',
      ],
    },
    {
      id: 'gap-2',
      title: 'Deterministic Reproducibility & Random Seed Variance',
      urgency: 'Critical',
      gapScore: 94,
      papersAnalyzed: ['All 8 benchmark publications'],
      verifiedObservation: 'Over 40% of publications omit random seed specifications, and fewer than 15% provide multi-seed variance bounds on large-scale pre-training runs.',
      aiSuggestedDirection: 'Implement standardized seed variance auditing frameworks that mandate multi-run confidence intervals before claiming empirical superiority.',
      suggestedQuestions: [
        'What is the true variance in GLUE score gains attributable solely to optimizer seed initialization?',
        'How does non-deterministic floating-point reduction across GPU clusters alter downstream attention weights?',
      ],
    },
    {
      id: 'gap-3',
      title: 'Real-Time Edge Energy Consumption & Carbon Footprint',
      urgency: 'Medium',
      gapScore: 76,
      papersAnalyzed: ['ResNet', 'BERT', 'Attention Is All You Need'],
      verifiedObservation: 'Publications consistently report accuracy gains but omit inference energy metrics (Joules per query) and training hardware carbon equivalents.',
      aiSuggestedDirection: 'Establish dual-objective Pareto frontiers mapping model accuracy against watt-hours consumed on consumer-grade edge hardware.',
      suggestedQuestions: [
        'Can sub-quadratic attention variants run within a 15W edge budget without degrading multilingual translation quality?',
      ],
    },
    {
      id: 'gap-4',
      title: 'Multimodal Cross-Attention Latency Bottlenecks',
      urgency: 'High',
      gapScore: 82,
      papersAnalyzed: ['Attention Is All You Need', 'ResNet'],
      verifiedObservation: 'Vision and language modalities are frequently fused via late cross-attention or simple projection matrices, which create quadratic latency spikes.',
      aiSuggestedDirection: 'Explore early-stage token interleaving with shared state-space representations.',
      suggestedQuestions: [
        'Can linear attention mechanisms replace softmax attention in multimodal vision-language token projectors?',
      ],
    },
  ],

  commonLimitations: [
    {
      limitation: 'Quadratic Computational Complexity O(n^2)',
      frequency: '6 out of 8 papers',
      impact: 'Severely constrains sequence lengths, memory scaling during training, and real-time streaming inference.',
      affectedModels: ['Transformer Big', 'BERT', 'BART (in RAG)'],
    },
    {
      limitation: 'Vulnerability to Retrieval Hallucinations & Distractor Noise',
      frequency: '3 out of 8 papers',
      impact: 'When external non-parametric retrieval returns conflicting or out-of-context documents, generation quality collapses.',
      affectedModels: ['RAG', 'Chain-of-Thought Prompting'],
    },
    {
      limitation: 'Sensitivity to Learning Rate Warmup & Optimizer Schedules',
      frequency: '5 out of 8 papers',
      impact: 'Minor deviations in warmup duration or weight decay lead to training instability or gradient divergence.',
      affectedModels: ['Transformer', 'ResNet (152 layers)', 'BERT-Large', 'LoRA'],
    },
    {
      limitation: 'High VRAM Requirements for Training & Pre-training',
      frequency: '7 out of 8 papers',
      impact: 'Limits democratic access for independent academic researchers lacking multi-node A100/H100 clusters.',
      affectedModels: ['BERT', 'PaLM 540B', 'Transformer', 'ResNet'],
    },
  ],

  conflictingFindings: [
    {
      id: 'conflict-1',
      topic: 'Full Fine-Tuning vs Parameter-Efficient Adaptation (PEFT)',
      findingA: 'Hu et al. (LoRA, 2021) demonstrate that adapting low-rank matrices (r=4 to 8) matches or slightly exceeds full fine-tuning performance on GPT-3.',
      findingB: 'Devlin et al. (BERT, 2019) and classical literature emphasize that whole-network joint parameter tuning is required for optimal downstream semantic representations.',
      conflictAnalysis: 'The conflict arises because larger foundational models (>10B parameters) exhibit low intrinsic rank during adaptation, whereas smaller models (<350M parameters) often require full-network updates to adapt to complex syntax shifts.',
      reconciliationProposal: 'Investigate dynamic rank allocation (AdaLoRA) where layers with high gradient variance receive higher rank capacity.',
    },
    {
      id: 'conflict-2',
      topic: 'Retrieval Augmentation vs Pure Parametric Pre-training Scale',
      findingA: 'Lewis et al. (RAG, 2020) prove that small parametric models with external non-parametric retrieval beat much larger closed-book models on factual benchmarks.',
      findingB: 'Wei et al. (2022) and Zhao et al. (2023) show that scaling parameters to 100B+ allows models to memorize vast world knowledge and reason without external indexing.',
      conflictAnalysis: 'Parametric memorization provides high-speed generation but cannot be audited or updated; non-parametric retrieval provides verifiable attribution but suffers from retrieval latency and passage noise.',
      reconciliationProposal: 'Hybrid architectures that query non-parametric indices only when model internal uncertainty (entropy) exceeds a confidence threshold.',
    },
  ],

  missingExperiments: [
    {
      experiment: 'Ablation of Positional Encodings under 16k+ Token Injections',
      papersLacking: ['Attention Is All You Need', 'BERT'],
      whyNeeded: 'Both landmark papers stop testing at 512 or 1024 tokens. Real-world documents (legal briefs, book chapters, long codebases) frequently exceed 10,000 tokens.',
    },
    {
      experiment: 'Cross-Architecture Seed Variance Distribution Audits',
      papersLacking: ['Attention Is All You Need', 'ResNet', 'RAG'],
      whyNeeded: 'Single-run reported figures fail to establish whether a 1.5% accuracy margin is statistically significant or an artifact of lucky initialization.',
    },
    {
      experiment: 'Stress Testing Under Retrieval Document Poisoning & Adversarial Prompts',
      papersLacking: ['RAG', 'Chain-of-Thought Prompting'],
      whyNeeded: 'Evaluating model robustness when 20% to 50% of retrieved external documents contain deliberately contradictory falsehoods.',
    },
  ],

  topicMatrixChart: [
    { topic: 'Architecture', studied: 90, gap: 25 },
    { topic: 'Pre-training', studied: 85, gap: 30 },
    { topic: 'Fine-Tuning', studied: 75, gap: 40 },
    { topic: 'Retrieval (RAG)', studied: 65, gap: 55 },
    { topic: 'Reproducibility', studied: 30, gap: 85 },
    { topic: 'Edge / Energy', studied: 20, gap: 90 },
    { topic: 'Safety & Rigor', studied: 45, gap: 70 },
  ],
}
