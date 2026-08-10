import { useAuth } from '../context/AuthContext'
import { Building2, Users, DollarSign } from 'lucide-react'

interface GenericPageProps {
  page: string
}

export default function GenericPage({ page }: GenericPageProps) {
  const { departments } = useAuth()

  if (page === 'departments') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {departments.map(dept => (
            <div key={dept.id} style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Building2 size={18} className="text-indigo-500" />
                </div>
                <span className="text-xs font-mono font-semibold text-indigo-400">{dept.id}</span>
              </div>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--foreground)' }}>{dept.name}</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Managed by {dept.manager}</p>
              <div className="grid grid-cols-2 gap-3">
                <div style={{ backgroundColor: 'var(--muted)' }} className="rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <Users size={14} className="text-indigo-500" />
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{dept.headCount}</p>
                    <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Employees</p>
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--muted)' }} className="rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <DollarSign size={14} className="text-emerald-500" />
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>₹{(dept.budget / 100000).toFixed(1)}L</p>
                    <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Budget</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {departments.length === 0 && (
            <p className="text-xs text-center py-12" style={{ color: 'var(--muted-foreground)' }}>No departments found.</p>
          )}
        </div>
      </div>
    )
  }

  const placeholderContent: Record<string, { emoji: string; title: string; desc: string }> = {
    performance: { emoji: '📈', title: 'Performance Management', desc: 'Track goals, KPIs, reviews and ratings for your team members.' },
    analytics: { emoji: '📊', title: 'Analytics & Reports', desc: 'Deep-dive into workforce trends, payroll costs, and attendance analytics.' },
    holidays: { emoji: '🗓️', title: 'Holiday Calendar', desc: 'Manage public holidays, company events, and festive calendar.' },
    notifications: { emoji: '🔔', title: 'Notifications', desc: 'View all system alerts, announcements, and activity updates.' },
    reports: { emoji: '📄', title: 'HR Reports', desc: 'Generate and download detailed HR reports for compliance and analysis.' },
    settings: { emoji: '⚙️', title: 'Settings', desc: 'Configure your account preferences, notifications, and system settings.' },
  }

  const content = placeholderContent[page] ?? { emoji: '🚧', title: 'Coming Soon', desc: 'This section is under construction.' }

  return (
    <div className="flex flex-col items-center justify-center min-h-64 text-center py-20">
      <div className="text-5xl mb-4">{content.emoji}</div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{content.title}</h2>
      <p className="text-sm max-w-sm" style={{ color: 'var(--muted-foreground)' }}>{content.desc}</p>
    </div>
  )
}
