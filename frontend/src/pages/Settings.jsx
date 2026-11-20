import React, { useState, useEffect } from 'react'
import {
  Settings as SettingsIcon,
  Server,
  Database,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Download,
  Info,
  BookOpen,
} from 'lucide-react'
import {
  getApiBaseUrl,
  setApiBaseUrl,
  checkBackendHealth,
  DEFAULT_API_BASE_URL,
} from '../services/api'
import { getSettings, saveSettings } from '../services/storageService'

export default function Settings({ onToast }) {
  const [userSettings, setUserSettings] = useState(getSettings())
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl())
  const [testingHealth, setTestingHealth] = useState(false)
  const [healthResult, setHealthResult] = useState(null)
  const [storageUsage, setStorageUsage] = useState({ usedKb: 0, itemsCount: 0 })

  useEffect(() => {
    runHealthCheck()
    calculateStorage()
  }, [])

  const calculateStorage = () => {
    let total = 0
    let count = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += (localStorage[key].length * 2) // UTF-16 approximate bytes
        count++
      }
    }
    setStorageUsage({
      usedKb: (total / 1024).toFixed(1),
      itemsCount: count,
    })
  }

  const runHealthCheck = async () => {
    setTestingHealth(true)
    const result = await checkBackendHealth()
    setHealthResult(result)
    setTestingHealth(false)
  }

  const handleSaveApiUrl = () => {
    setApiBaseUrl(apiUrl)
    runHealthCheck()
    onToast?.(`API Base URL updated to "${apiUrl}".`)
  }

  const handleUpdateSetting = (key, value) => {
    const updated = { ...userSettings, [key]: value }
    setUserSettings(updated)
    saveSettings(updated)
    onToast?.('Settings updated.')
  }

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear saved browser storage? (Bookmarks and notes will be reset to default)')) {
      localStorage.clear()
      calculateStorage()
      onToast?.('Local storage cache cleared.')
      window.location.reload()
    }
  }

  return (
    <div className="settings-page">
      {/* Intro Header */}
      <div className="page-intro-box">
        <div className="intro-content">
          <div className="eyebrow"><SettingsIcon size={14} /> PLATFORM CONFIGURATION & INTEGRATIONS</div>
          <h2>Settings & Backend Architecture</h2>
          <p>
            Configure academic citation defaults, manage local storage persistence,
            and inspect integration endpoints for FastAPI, Gemini, and PyMuPDF services.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Academic Preferences */}
        <div className="panel settings-card">
          <div className="panel-title">
            <div>
              <h3>Research Preferences</h3>
              <p>Configure defaults for citation formatting and workspace display</p>
            </div>
            <BookOpen size={16} />
          </div>

          <div className="setting-field-row">
            <div>
              <b>Default Citation Format</b>
              <small>Used for quick-copy buttons throughout the workspace</small>
            </div>
            <select
              value={userSettings.citationStyle || 'IEEE'}
              onChange={(e) => handleUpdateSetting('citationStyle', e.target.value)}
            >
              <option value="IEEE">IEEE Format</option>
              <option value="APA">APA 7th Edition</option>
              <option value="MLA">MLA 9th Edition</option>
              <option value="Chicago">Chicago Manual</option>
              <option value="BibTeX">BibTeX Entry</option>
            </select>
          </div>

          <div className="setting-field-row">
            <div>
              <b>Theme Appearance</b>
              <small>Optimized for low-glare prolonged manuscript reading</small>
            </div>
            <span className="status-pill">Dark Navy (Academic Slate)</span>
          </div>

          <div className="setting-field-row">
            <div>
              <b>Evidence Page Numbers</b>
              <small>Display page-anchored evidence tags next to extracted findings</small>
            </div>
            <label className="toggle-switch-label">
              <input
                type="checkbox"
                checked={userSettings.showPageNumbers !== false}
                onChange={(e) => handleUpdateSetting('showPageNumbers', e.target.checked)}
              />
              <span>Enabled</span>
            </label>
          </div>
        </div>

        {/* Backend Connectivity */}
        <div className="panel settings-card">
          <div className="panel-title">
            <div>
              <h3>FastAPI Backend Connection</h3>
              <p>REST API endpoints powering PyMuPDF PDF extraction and Gemini AI analysis</p>
            </div>
            <Server size={16} />
          </div>

          <div className="setting-field-col">
            <label>Backend API Base URL:</label>
            <div className="input-with-button">
              <input
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://127.0.0.1:8000"
              />
              <button className="btn primary small-btn" onClick={handleSaveApiUrl}>
                Save URL
              </button>
            </div>
          </div>

          <div className="health-status-box">
            <div className="health-top">
              <b>Connection Status:</b>
              <button
                className="btn secondary small-btn"
                onClick={runHealthCheck}
                disabled={testingHealth}
              >
                {testingHealth ? <RefreshCw size={13} className="spin" /> : <RefreshCw size={13} />}
                {testingHealth ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {healthResult?.online ? (
              <div className="health-badge-row online">
                <CheckCircle2 size={16} />
                <span>FastAPI Service Online at {healthResult.url} (Health: Healthy)</span>
              </div>
            ) : (
              <div className="health-badge-row offline">
                <AlertCircle size={16} />
                <span>
                  Backend Offline at {healthResult?.url || apiUrl}. Using local academic dataset and preview mode.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Backend Architecture & Readiness Matrix */}
        <div className="panel settings-card full-width">
          <div className="panel-title">
            <div>
              <h3>Backend Architecture & Integration Readiness</h3>
              <p>Status of external services, APIs, and data layers</p>
            </div>
            <Shield size={16} />
          </div>

          <div className="readiness-table-wrap">
            <table className="readiness-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Service Role</th>
                  <th>Endpoint / Target</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>FastAPI Server</b></td>
                  <td>Core REST backend & async task coordination</td>
                  <td><code>http://127.0.0.1:8000</code></td>
                  <td>
                    {healthResult?.online ? (
                      <span className="badge-ready">Online (:8000)</span>
                    ) : (
                      <span className="badge-offline">Offline (Local Preview Active)</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td><b>PyMuPDF (fitz)</b></td>
                  <td>PDF text block extraction & page boundary parsing</td>
                  <td><code>POST /api/pdf/upload</code></td>
                  <td><span className="badge-ready">Backend Ready</span></td>
                </tr>
                <tr>
                  <td><b>Google Gemini API</b></td>
                  <td>Deep 12-section paper analysis & reproducibility checklist</td>
                  <td><code>POST /api/analysis/</code> (via backend proxy)</td>
                  <td><span className="badge-ready">Backend Ready (No Frontend Key Leak)</span></td>
                </tr>
                <tr>
                  <td><b>Semantic Scholar API</b></td>
                  <td>Academic literature search & citation graph lookup</td>
                  <td><code>api.semanticscholar.org/graph/v1</code></td>
                  <td><span className="badge-ready">Ready with Fallback</span></td>
                </tr>
                <tr>
                  <td><b>PostgreSQL / Supabase</b></td>
                  <td>Persistent multi-user library & vectors</td>
                  <td><code>Database readiness layer</code></td>
                  <td><span className="badge-offline">LocalStorage Active (Client Persistence)</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Local Storage Management */}
        <div className="panel settings-card full-width">
          <div className="panel-title">
            <div>
              <h3>Browser Local Storage Management</h3>
              <p>Monitor client-side quota for saved papers, notes, highlights, and analysis records</p>
            </div>
            <Database size={16} />
          </div>

          <div className="storage-stats-row">
            <div className="storage-metric">
              <b>{storageUsage.usedKb} KB</b>
              <span>Estimated Storage Used</span>
            </div>
            <div className="storage-metric">
              <b>{storageUsage.itemsCount} Keys</b>
              <span>Active Storage Entries</span>
            </div>
            <div className="storage-metric">
              <b>5,000 KB</b>
              <span>Browser Quota Cap</span>
            </div>

            <button className="btn secondary danger-btn" onClick={handleClearCache}>
              <Trash2 size={14} /> Clear Browser Cache & Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
