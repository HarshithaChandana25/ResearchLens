/**
 * ResearchLens Citation Network & Knowledge Graph Dataset
 * Multi-layer graph containing papers, authors, topics,
 * citation inflow/outflow directions, and citation velocity timelines.
 */

export const CITATION_NETWORK_DATA = {
  nodes: [
    { id: 'p1', type: 'paper', label: 'Attention Is All You Need', year: 2017, venue: 'NeurIPS', citations: 118400, topic: 'Deep Learning', velocity: 'High' },
    { id: 'p2', type: 'paper', label: 'BERT: Deep Bidirectional Transformers', year: 2019, venue: 'NAACL', citations: 88500, topic: 'Natural Language Processing', velocity: 'High' },
    { id: 'p3', type: 'paper', label: 'RAG for Knowledge-Intensive NLP', year: 2020, venue: 'NeurIPS', citations: 12400, topic: 'Generative AI', velocity: 'Very High' },
    { id: 'p4', type: 'paper', label: 'Deep Residual Learning (ResNet)', year: 2016, venue: 'CVPR', citations: 215000, topic: 'Computer Vision', velocity: 'Sustained' },
    { id: 'p5', type: 'paper', label: 'Survey of Large Language Models', year: 2023, venue: 'AI Open', citations: 5600, topic: 'Generative AI', velocity: 'High' },
    { id: 'p7', type: 'paper', label: 'Chain-of-Thought Prompting', year: 2022, venue: 'NeurIPS', citations: 8200, topic: 'Generative AI', velocity: 'Very High' },
    { id: 'p8', type: 'paper', label: 'LoRA: Low-Rank Adaptation of LLMs', year: 2021, venue: 'ICLR', citations: 18400, topic: 'Deep Learning', velocity: 'Exceptional' },

    // Author nodes
    { id: 'a1', type: 'author', label: 'Ashish Vaswani', institution: 'Google Brain', hIndex: 42 },
    { id: 'a2', type: 'author', label: 'Jacob Devlin', institution: 'Google AI Language', hIndex: 38 },
    { id: 'a3', type: 'author', label: 'Patrick Lewis', institution: 'Facebook AI Research', hIndex: 26 },
    { id: 'a4', type: 'author', label: 'Kaiming He', institution: 'FAIR / MIT', hIndex: 84 },
    { id: 'a5', type: 'author', label: 'Jason Wei', institution: 'Google Research / OpenAI', hIndex: 31 },
    { id: 'a6', type: 'author', label: 'Edward J. Hu', institution: 'Microsoft Research', hIndex: 19 },

    // Topic nodes
    { id: 't1', type: 'topic', label: 'Self-Attention & Transformers' },
    { id: 't2', type: 'topic', label: 'Masked Language Modeling' },
    { id: 't3', type: 'topic', label: 'Dense Passage Retrieval' },
    { id: 't4', type: 'topic', label: 'Residual Skip Connections' },
    { id: 't5', type: 'topic', label: 'Low-Rank Adaptation (PEFT)' },
    { id: 't6', type: 'topic', label: 'Chain-of-Thought Reasoning' },
  ],

  edges: [
    // Authorship
    { source: 'a1', target: 'p1', type: 'authored', label: 'First author' },
    { source: 'a2', target: 'p2', type: 'authored', label: 'First author' },
    { source: 'a3', target: 'p3', type: 'authored', label: 'First author' },
    { source: 'a4', target: 'p4', type: 'authored', label: 'First author' },
    { source: 'a5', target: 'p7', type: 'authored', label: 'First author' },
    { source: 'a6', target: 'p8', type: 'authored', label: 'First author' },

    // Citations (Paper -> Paper)
    { source: 'p2', target: 'p1', type: 'cites', label: 'Cites Attention mechanism' },
    { source: 'p3', target: 'p1', type: 'cites', label: 'Cites Seq2Seq Transformer' },
    { source: 'p3', target: 'p2', type: 'cites', label: 'Cites BERT dual-encoder' },
    { source: 'p5', target: 'p1', type: 'cites', label: 'Surveys Transformer foundations' },
    { source: 'p5', target: 'p2', type: 'cites', label: 'Surveys pre-training models' },
    { source: 'p5', target: 'p3', type: 'cites', label: 'Surveys retrieval augmentation' },
    { source: 'p5', target: 'p7', type: 'cites', label: 'Surveys reasoning elicitation' },
    { source: 'p5', target: 'p8', type: 'cites', label: 'Surveys parameter efficiency' },
    { source: 'p7', target: 'p1', type: 'cites', label: 'Built on Transformer architecture' },
    { source: 'p8', target: 'p1', type: 'cites', label: 'Adapts Transformer attention projections' },
    { source: 'p8', target: 'p2', type: 'cites', label: 'Benchmarks on RoBERTa/BERT' },

    // Topic associations
    { source: 'p1', target: 't1', type: 'topic_of', label: 'Introduced' },
    { source: 'p2', target: 't2', type: 'topic_of', label: 'Introduced' },
    { source: 'p3', target: 't3', type: 'topic_of', label: 'Applied' },
    { source: 'p4', target: 't4', type: 'topic_of', label: 'Introduced' },
    { source: 'p7', target: 't6', type: 'topic_of', label: 'Introduced' },
    { source: 'p8', target: 't5', type: 'topic_of', label: 'Introduced' },
  ],

  citationFlow: {
    'p1': {
      inflowCount: 118400,
      outflowCount: 38,
      inflowKeyPapers: [
        { title: 'BERT: Pre-training of Deep Bidirectional Transformers', year: 2019, citations: 88500 },
        { title: 'Language Models are Few-Shot Learners (GPT-3)', year: 2020, citations: 46000 },
        { title: 'An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale (ViT)', year: 2020, citations: 39000 },
        { title: 'Exploring the Limits of Transfer Learning with T5', year: 2020, citations: 22000 },
      ],
      outflowKeyPapers: [
        { title: 'Neural Machine Translation by Jointly Learning to Align and Translate (Bahdanau et al.)', year: 2014, citations: 32000 },
        { title: 'Effective Approaches to Attention-based Neural Machine Translation (Luong et al.)', year: 2015, citations: 14500 },
        { title: 'Layer Normalization (Ba, Kiros, Hinton)', year: 2016, citations: 9200 },
        { title: 'Adam: A Method for Stochastic Optimization (Kingma, Ba)', year: 2014, citations: 160000 },
      ],
    },
    'p2': {
      inflowCount: 88500,
      outflowCount: 46,
      inflowKeyPapers: [
        { title: 'RoBERTa: A Robustly Optimized BERT Pretraining Approach (Liu et al.)', year: 2019, citations: 24000 },
        { title: 'DistilBERT, a distilled version of BERT (Sanh et al.)', year: 2019, citations: 11000 },
        { title: 'Retrieval-Augmented Generation (Lewis et al.)', year: 2020, citations: 12400 },
      ],
      outflowKeyPapers: [
        { title: 'Attention Is All You Need (Vaswani et al.)', year: 2017, citations: 118400 },
        { title: 'Deep Contextualized Word Representations (ELMo - Peters et al.)', year: 2018, citations: 15000 },
        { title: 'Improving Language Understanding by Generative Pre-Training (GPT-1 - Radford et al.)', year: 2018, citations: 8500 },
      ],
    },
    'p3': {
      inflowCount: 12400,
      outflowCount: 52,
      inflowKeyPapers: [
        { title: 'Self-RAG: Learning to Retrieve, Generate, and Critique (Asai et al.)', year: 2023, citations: 950 },
        { title: 'Corrective Retrieval Augmented Generation (CRAG)', year: 2024, citations: 480 },
        { title: 'A Survey on Retrieval-Augmented Generation for LLMs (Gao et al.)', year: 2023, citations: 1800 },
      ],
      outflowKeyPapers: [
        { title: 'Dense Passage Retrieval for Open-Domain QA (Karpukhin et al.)', year: 2020, citations: 4200 },
        { title: 'BART: Denoising Sequence-to-Sequence Pre-training (Lewis et al.)', year: 2019, citations: 16000 },
        { title: 'REALM: Retrieval-Augmented Language Model Pre-Training (Guu et al.)', year: 2020, citations: 2900 },
      ],
    },
  },

  citationHistoryByYear: [
    { year: 2017, attention: 120, resnet: 4500, bert: 0, rag: 0 },
    { year: 2018, attention: 1200, resnet: 14000, bert: 50, rag: 0 },
    { year: 2019, attention: 4800, resnet: 28000, bert: 2800, rag: 0 },
    { year: 2020, attention: 14500, resnet: 42000, bert: 11200, rag: 450 },
    { year: 2021, attention: 24000, resnet: 55000, bert: 19800, rag: 1600 },
    { year: 2022, attention: 31000, resnet: 62000, bert: 24500, rag: 3200 },
    { year: 2023, attention: 39000, resnet: 68000, bert: 27000, rag: 5100 },
    { year: 2024, attention: 42000, resnet: 72000, bert: 28500, rag: 7200 },
  ],
}
