import { useState, useRef, useEffect } from 'react'
import type { Role } from '../../types'
import { Bell, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface HeaderProps {
  role: Role
  currentPage: string
  dark: boolean
  onThemeToggle: () => void
  onNavigate?: (page: string) => void
}

const pageTitles: Record<string, { title: string; sub: string }> = {
  dashboard: { title: 'Dashboard', sub: 'Overview of your workspace' },
  employees: { title: 'Employees', sub: 'Manage your team members' },
  departments: { title: 'Departments', sub: 'Organizational structure' },
  attendance: { title: 'Attendance', sub: 'Track daily attendance' },
  leaves: { title: 'Leave Management', sub: 'Review and approve requests' },
  payroll: { title: 'Payroll', sub: 'Salary and payslips' },
  performance: { title: 'Performance', sub: 'Reviews and goals' },
  analytics: { title: 'Analytics', sub: 'Workforce insights' },
  holidays: { title: 'Holiday Calendar', sub: 'Public and company holidays' },
  notifications: { title: 'Notifications', sub: 'Alerts and announcements' },
  reports: { title: 'Reports', sub: 'HR reports and exports' },
  settings: { title: 'Settings', sub: 'Configure your account' },
}

export default function Header({ role, currentPage, dark, onThemeToggle, onNavigate }: HeaderProps) {
  const [showNotif, setShowNotif] = useState(false)
  const { user, notifications } = useAuth()
  const notifRef = useRef<HTMLDivElement>(null)
  const [localNotifs, setLocalNotifs] = useState<any[]>([])
  const [lastSeenId, setLastSeenId] = useState(() => localStorage.getItem('dayflow_last_seen_id') || '')

  useEffect(() => {
    const syncNotifs = () => {
      const saved = localStorage.getItem('dayflow_local_notifications')
      if (saved) {
        setLocalNotifs(JSON.parse(saved))
      } else {
        setLocalNotifs(notifications || [])
      }
    }

    syncNotifs()
    const interval = setInterval(syncNotifs, 1000)
    return () => clearInterval(interval)
  }, [notifications])

  // Filter visible notifications based on target role & department
  let registrationAlertsShown = 0
  const visibleNotifs = localNotifs.filter(n => {
    const titleLower = (n.title || '').toLowerCase()
    const isRegistration = titleLower.includes('new account') || titleLower.includes('registration alert')

    if (user?.role === 'employee') {
      if (isRegistration) return false
      if (n.targetAudience && n.targetAudience !== 'All Employees' && n.targetAudience !== user.department) {
        return false
      }
    } else if (user?.role === 'hr') {
      if (n.targetAudience === 'Admin') return false
      if (isRegistration) {
        registrationAlertsShown++
        if (registrationAlertsShown > 1) return false
      }
    } else if (user?.role === 'admin') {
      if (isRegistration) {
        registrationAlertsShown++
        if (registrationAlertsShown > 1) return false
      }
    }
    return true
  })

  const unreadCount = visibleNotifs.filter(n => !n.read).length
  const newestNotifId = visibleNotifs[0]?.id || ''
  
  // Show red dot if there are unread notifications AND the newest notification is unseen
  const showRedDot = visibleNotifs.some(n => !n.read) && newestNotifId !== lastSeenId

  const handleToggleNotif = () => {
    setShowNotif(!showNotif)
    if (!showNotif && newestNotifId) {
      localStorage.setItem('dayflow_last_seen_id', newestNotifId)
      setLastSeenId(newestNotifId)
    }
  }

  const meta = pageTitles[currentPage] ?? { title: 'Dayflow', sub: '' }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const roleTag: Record<Role, { label: string; color: string; bg: string }> = {
    admin: { label: 'Admin', color: '#a78bfa', bg: 'rgba(139,92,246,0.12)' },
    hr: { label: 'HR', color: '#38bdf8', bg: 'rgba(14,165,233,0.12)' },
    employee: { label: 'Employee', color: '#34d399', bg: 'rgba(16,185,129,0.12)' },
  }
  const tag = roleTag[role]

  const notifTypeColor: Record<string, string> = {
    info: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
  }

  return (
    <header style={{
      height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', background: 'var(--card)', borderBottom: '1px solid var(--border)',
      flexShrink: 0, gap: 16,
    }}>
      {/* Left — breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            {meta.title}
          </h1>
          <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 1 }}>{meta.sub}</p>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>


        {/* Role tag */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 8,
          background: tag.bg, fontSize: 12, fontWeight: 700,
          color: tag.color, letterSpacing: '0.04em',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: tag.color }} />
          {tag.label}
        </div>

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'var(--muted)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted-foreground)', transition: 'all 0.15s',
          }}
          title={dark ? 'Switch to light' : 'Switch to dark'}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={handleToggleNotif}
            style={{
              width: 36, height: 36, borderRadius: 9,
              background: 'var(--muted)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--muted-foreground)', position: 'relative', transition: 'all 0.15s',
            }}
          >
            <Bell size={16} />
            {showRedDot && (
              <span style={{
                position: 'absolute', top: 6, right: 6, width: 8, height: 8,
                background: '#ef4444', borderRadius: '50%',
                border: '1.5px solid var(--card)',
              }} />
            )}
          </button>

          {showNotif && (
            <div className="dropdown" style={{ position: 'absolute', right: 0, top: 44, width: 320, zIndex: 50 }}>
              <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--foreground)' }}>Notifications</span>
                {unreadCount > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {visibleNotifs.map(n => (
                  <div key={n.id} style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    background: !n.read ? 'rgba(99,102,241,0.04)' : 'transparent',
                    display: 'flex', gap: 10,
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                      background: notifTypeColor[n.type] ?? '#6366f1',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{n.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2, lineHeight: 1.4 }}>{n.message}</p>
                      <p style={{ fontSize: 11, color: 'var(--primary)', marginTop: 4 }}>{n.time}</p>
                    </div>
                  </div>
                ))}
                {visibleNotifs.length === 0 && (
                  <p style={{ padding: 16, fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center' }}>No notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff',
          cursor: 'pointer', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
        }}
          onClick={() => onNavigate && onNavigate('settings')}
          title={user?.name}
        >
          {user?.avatar ?? role.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
