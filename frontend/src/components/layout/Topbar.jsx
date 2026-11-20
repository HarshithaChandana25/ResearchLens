import React, { useState, useEffect } from 'react'
import { Menu, ChevronRight, Search, Bell, Activity, CheckCircle2, AlertTriangle } from 'lucide-react'
import { checkBackendHealth } from '../../services/api'

export default function Topbar({
  currentPage,
  searchQuery,
  onSearchChange,
  onOpenMobile,
  onToast,
  onNavigate,
}) {
  const [backendStatus, setBackendStatus] = useState({ checked: false, online: false })

  useEffect(() => {
    let mounted = true
    checkBackendHealth().then(status => {
      if (mounted) setBackendStatus({ checked: true, online: status.online })
    })
    return () => { mounted = false }
  }, [])

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-btn menu-btn"
          onClick={onOpenMobile}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="crumb">
          <span>Workspace</span>
          <ChevronRight size={14} />
          <b>{currentPage}</b>
        </div>
      </div>

      <div className="top-actions">
        <div className="global-search">
          <Search size={15} />
          <input
            placeholder="Search papers, methods, topics..."
            value={searchQuery}
            onChange={e => {
              onSearchChange(e.target.value)
              if (currentPage !== 'Discover Papers' && e.target.value) {
                onNavigate('Discover Papers')
              }
            }}
          />
          <kbd>⌘ K</kbd>
        </div>

        <button
          className={`backend-pill ${backendStatus.online ? 'online' : 'demo'}`}
          onClick={() => {
            onNavigate('Settings')
            onToast?.(
              backendStatus.online
                ? 'Backend connected: FastAPI service running at 127.0.0.1:8000'
                : 'FastAPI backend is offline. Using local academic dataset and preview mode.',
            )
          }}
          title={backendStatus.online ? 'FastAPI Backend Online' : 'FastAPI Offline - Demo Data Active'}
        >
          <span className="status-dot" />
          <span>{backendStatus.online ? 'FastAPI 8000' : 'Demo Mode'}</span>
        </button>

        <button
          className="icon-btn notification"
          onClick={() => onToast?.('All paper extraction pipelines and intelligence services are operational.')}
          aria-label="View notifications"
        >
          <Bell size={18} />
          <i />
        </button>

        <div className="avatar top-avatar" title="Research Scholar">
          RS
        </div>
      </div>
    </header>
  )
}
