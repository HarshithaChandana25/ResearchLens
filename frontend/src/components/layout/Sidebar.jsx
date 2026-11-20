import React from 'react'
import {
  BrainCircuit,
  LayoutDashboard,
  Compass,
  UploadCloud,
  Library,
  Bookmark,
  FileText,
  MessageSquare,
  Target,
  CheckCircle2,
  GitCompareArrows,
  Network,
  Share2,
  BookOpenCheck,
  Clock3,
  StickyNote,
  Settings,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  X,
} from 'lucide-react'

export const NAVIGATION_STRUCTURE = [
  {
    group: 'WORKSPACE',
    items: [
      { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'Discover Papers', label: 'Discover Papers', icon: Compass },
      { id: 'Upload Papers', label: 'Upload Papers', icon: UploadCloud },
      { id: 'My Library', label: 'My Library', icon: Library, badgeKey: 'libraryCount' },
      { id: 'Saved Papers', label: 'Saved Papers', icon: Bookmark, badgeKey: 'savedCount' },
    ],
  },
  {
    group: 'AI INTELLIGENCE',
    items: [
      { id: 'AI Paper Analysis', label: 'AI Paper Analysis', icon: FileText },
      { id: 'Research Assistant', label: 'Research Assistant', icon: MessageSquare },
      { id: 'Research Gap Finder', label: 'Research Gap Finder', icon: Target },
      { id: 'Reproducibility Checker', label: 'Reproducibility Checker', icon: CheckCircle2 },
      { id: 'Compare Papers', label: 'Compare Papers', icon: GitCompareArrows },
    ],
  },
  {
    group: 'RESEARCH EXPLORATION',
    items: [
      { id: 'Knowledge Graph', label: 'Knowledge Graph', icon: Network },
      { id: 'Citation Network', label: 'Citation Network', icon: Share2 },
      { id: 'Literature Review', label: 'Literature Review', icon: BookOpenCheck },
      { id: 'Research Timeline', label: 'Research Timeline', icon: Clock3 },
    ],
  },
  {
    group: 'PERSONAL',
    items: [
      { id: 'Research Notes', label: 'Research Notes', icon: StickyNote, badgeKey: 'notesCount' },
      { id: 'Settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function Sidebar({
  currentPage,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  counts = {},
  onToast,
}) {
  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <BrainCircuit size={22} />
          </div>
          <div>
            <b>Research<span>Lens</span></b>
            <small>INTELLIGENCE WORKSPACE</small>
          </div>
          <button
            className="icon-btn mobile-close"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-switch">
          <div className="avatar">RL</div>
          <div>
            <b>Research Workspace</b>
            <small>Academic Intelligence</small>
          </div>
          <ChevronRight size={15} />
        </div>

        <nav className="sidebar-nav">
          {NAVIGATION_STRUCTURE.map(section => (
            <div className="nav-group" key={section.group}>
              <div className="nav-label">{section.group}</div>
              {section.items.map(item => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                const count = item.badgeKey ? counts[item.badgeKey] : null

                return (
                  <button
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onNavigate(item.id)
                      if (onCloseMobile) onCloseMobile()
                    }}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    {typeof count === 'number' && count > 0 && <em>{count}</em>}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="spark">
              <Sparkles size={16} />
            </div>
            <b>Make Every Paper Count.</b>
            <p>Full-text PDF extraction, Gemini analysis & reproducibility verification.</p>
            <button onClick={() => onToast?.('ResearchLens Academic Intelligence Suite is active.')}>
              Active workspace <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="profile">
            <div className="avatar profile-avatar">AI</div>
            <div>
              <b>Research Scholar</b>
              <small>Pro Intelligence</small>
            </div>
            <button
              className="icon-btn"
              style={{ width: 28, height: 28 }}
              onClick={() => onNavigate('Settings')}
              title="Settings"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
