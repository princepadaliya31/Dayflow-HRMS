import { useState } from 'react'
import type { Role } from '../../types'
import {
  LayoutDashboard, Users, Clock, CalendarDays, DollarSign,
  TrendingUp, Bell, Settings, ChevronLeft, ChevronRight,
  Building2, BarChart3, FileText, Calendar, LogOut, UserCheck, UserPlus
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface NavItem {
  icon: React.ReactNode
  label: string
  page: string
  roles: Role[]
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard size={17} />, label: 'Dashboard', page: 'dashboard', roles: ['admin', 'hr', 'employee'] },
  { icon: <Users size={17} />, label: 'Employees', page: 'employees', roles: ['admin', 'hr'] },
  { icon: <UserCheck size={17} />, label: 'Approval Requests', page: 'requests', roles: ['admin', 'hr'] },
  { icon: <Building2 size={17} />, label: 'Departments', page: 'departments', roles: ['admin'] },
  { icon: <Clock size={17} />, label: 'Attendance', page: 'attendance', roles: ['admin', 'hr', 'employee'] },
  { icon: <CalendarDays size={17} />, label: 'Leaves', page: 'leaves', roles: ['admin', 'hr', 'employee'] },
  { icon: <DollarSign size={17} />, label: 'Payroll', page: 'payroll', roles: ['admin', 'hr', 'employee'] },
  { icon: <TrendingUp size={17} />, label: 'Performance', page: 'performance', roles: ['admin', 'hr', 'employee'] },
  { icon: <BarChart3 size={17} />, label: 'Analytics', page: 'analytics', roles: ['admin'] },
  { icon: <Calendar size={17} />, label: 'Holidays', page: 'holidays', roles: ['admin', 'hr', 'employee'] },
  { icon: <Bell size={17} />, label: 'Notifications', page: 'notifications', roles: ['admin', 'hr', 'employee'] },
  { icon: <FileText size={17} />, label: 'Reports', page: 'reports', roles: ['hr'] },
  { icon: <UserPlus size={17} />, label: 'Recruit Employees', page: 'recruitment', roles: ['hr'] },
  { icon: <Settings size={17} />, label: 'Settings', page: 'settings', roles: ['admin', 'hr', 'employee'] },
]

const roleLabel: Record<Role, string> = { admin: 'Administrator', hr: 'HR Manager', employee: 'Employee' }

interface SidebarProps {
  role: Role
  currentPage: string
  onNavigate: (page: string) => void
}

export default function Sidebar({ role, currentPage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout()
    }
  }
  const filtered = navItems.filter(item => item.roles.includes(role))

  const sectionGroups = [
    { label: 'Overview', pages: ['dashboard'] },
    { label: 'People', pages: ['employees', 'departments', 'requests', 'recruitment'] },
    { label: 'Time & Leave', pages: ['attendance', 'leaves', 'holidays'] },
    { label: 'Finance', pages: ['payroll'] },
    { label: 'Growth', pages: ['performance', 'analytics', 'reports'] },
    { label: 'System', pages: ['notifications', 'settings'] },
  ]

  return (
    <div style={{ position: 'relative', height: '100vh', flexShrink: 0 }}>
      <aside
        className="sidebar"
        style={{
          width: collapsed ? 60 : 220,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
          position: 'relative',
          borderRight: '1px solid rgba(255,255,255,0.04)',
          overflow: 'hidden',
        }}
      >
      {/* Logo */}
      <div style={{
        height: 60, display: 'flex', alignItems: 'center',
        padding: collapsed ? '0 14px' : '0 18px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        {collapsed ? (
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(99,102,241,0.4)',
            position: 'relative'
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>D</span>
            <span style={{ position: 'absolute', right: 2, bottom: 2, color: '#fff', fontSize: 7 }}>✦</span>
          </div>
        ) : (
          <div style={{
            background: '#4f46e5',
            padding: '6px 14px',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
          }}>
            <span style={{
              color: '#ffffff',
              fontFamily: "'Outfit', 'Inter', sans-serif",
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center'
            }}>
              Dayflow
              <span style={{ marginLeft: 3, fontSize: 10, alignSelf: 'flex-end', marginBottom: 2 }}>✦</span>
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 8px' }}>
        {sectionGroups.map(group => {
          const groupItems = filtered.filter(item => group.pages.includes(item.page))
          if (groupItems.length === 0) return null
          return (
            <div key={group.label} style={{ marginBottom: 4 }}>
              {!collapsed && (
                <p style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: '#334155',
                  padding: '10px 10px 4px',
                }}>
                  {group.label}
                </p>
              )}
              {groupItems.map(item => {
                const active = currentPage === item.page
                return (
                  <button
                    key={item.page}
                    onClick={() => onNavigate(item.page)}
                    title={collapsed ? item.label : undefined}
                    className={`sidebar-link${active ? ' active' : ''}`}
                    style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                  >
                    <span style={{ flexShrink: 0 }}>{item.icon}</span>
                    {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                  </button>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* User profile */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: collapsed ? '10px 0' : '12px 10px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(99,102,241,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#818cf8',
          }}>
            {user?.avatar ?? role.slice(0, 2).toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <p style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name ?? roleLabel[role]}
              </p>
              <p style={{ color: '#475569', fontSize: 11 }}>{roleLabel[role]}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={handleLogout}
            title="Logout"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', flexShrink: 0, padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
          >
            <LogOut size={15} />
          </button>
        )}
      </div>

    </aside>

    {/* Collapse toggle */}
    <button
      onClick={() => setCollapsed(!collapsed)}
      style={{
        position: 'absolute', right: -12, top: 72,
        width: 24, height: 24, borderRadius: '50%',
        background: '#6366f1', color: '#fff',
        border: '2px solid #0b0f19',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.5)',
        zIndex: 100, transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#4f46e5')}
      onMouseLeave={e => (e.currentTarget.style.background = '#6366f1')}
    >
      {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
    </button>
  </div>
  )
}
