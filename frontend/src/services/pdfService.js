/**
 * ResearchLens PDF Service
 * Handles PDF validation, multipart file upload to /api/pdf/upload,
 * and text extraction response formatting.
 */

import { getApiBaseUrl, requestJson } from './api'

export const MAX_PDF_SIZE_BYTES = 15 * 1024 * 1024 // 15 MB

/**
 * Validate PDF file in browser before sending to server
 */
export async function validatePdfFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' }
  }

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'Only PDF documents (.pdf) are supported.' }
  }

  if (file.size === 0) {
    return { valid: false, error: 'The selected PDF is 0 bytes (empty file).' }
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 15 MB maximum limit.`,
    }
  }

  try {
    const header = await file.slice(0, 5).arrayBuffer()
    const signature = new TextDecoder().decode(header)
    if (signature !== '%PDF-') {
      return {
        valid: false,
        error: 'Invalid file signature: This does not appear to be a standard PDF document.',
      }
    }
  } catch (err) {
    return { valid: false, error: 'Unable to read the file stream from disk.' }
  }

  return { valid: true }
}

/**
 * Upload and extract text via FastAPI backend (PyMuPDF)
 */
export async function uploadPdfForExtraction(file, onProgress) {
  const validation = await validatePdfFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    const result = await requestJson('/api/pdf/upload', {
      method: 'POST',
      body: formData,
    }, 60000, 'PDF extraction timed out after 60 seconds.')

    return {
      success: true,
      filename: result.filename || file.name,
      clientFilename: file.name,
      fileSize: file.size,
      total_pages: result.total_pages || (result.pages ? result.pages.length : 1),
      metadata: result.metadata || {},
      full_text: result.full_text || '',
      pages: result.pages || [],
      extractedAt: new Date().toISOString(),
      isDemoExtraction: false,
    }
  } catch (backendError) {
    // If backend is offline, we allow client-side demo extraction ONLY if user explicitly allows demo fallback
    // Or we throw clear error with option to inspect sample paper extraction.
    throw backendError
  }
}

/**
 * Generate simulated demo extraction for offline evaluation with clear demo flags
 */
export function generateDemoExtraction(file) {
  const mockPages = [
    {
      page_number: 1,
      text: `${file.name.replace('.pdf', '')}\n\nAbstract\nThis research presents an empirical evaluation of model representations and reproducibility across standard benchmark datasets. We introduce novel architectural layers and investigate gradient dynamics.\n\n1. Introduction\nDeep learning pipelines often struggle with generalization across shifting domains. We formulate the problem and specify experimental baselines.`,
    },
    {
      page_number: 2,
      text: `2. Methodology & Architecture\nWe deploy an attention-based encoder with residual skip connections. The optimizer used is AdamW (lr=5e-5, weight_decay=0.01).\n\n3. Datasets\nEvaluated on GLUE benchmark, ImageNet-1K, and synthetic ablation sets. Random seed was fixed at 42.`,
    },
    {
      page_number: 3,
      text: `4. Experimental Results & Limitations\nOur approach yields a 4.2% accuracy lift over the nearest baseline while reducing latency by 18%. Limitations include hardware dependency on 8x NVIDIA A100 GPUs and lack of long-context testing.\n\n5. Conclusion & Future Work\nFuture investigations will address multimodal extensions and quantization for edge deployment.`,
    },
  ]

  return {
    success: true,
    filename: file.name,
    clientFilename: file.name,
    fileSize: file.size,
    total_pages: 3,
    metadata: {
      title: file.name.replace('.pdf', '').replace(/[-_]/g, ' '),
      author: 'Author (Extracted from file metadata)',
      subject: 'Computer Science - Artificial Intelligence',
      creator: 'Demo PDF Extractor (Offline Prototype)',
    },
    full_text: mockPages.map(p => p.text).join('\n\n--- Page Break ---\n\n'),
    pages: mockPages,
    extractedAt: new Date().toISOString(),
    isDemoExtraction: true,
    notice: 'Demo extraction mode: Backend extraction server was unreachable. Text generated for prototype inspection.',
  }
}
