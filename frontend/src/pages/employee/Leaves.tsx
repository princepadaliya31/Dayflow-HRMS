import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Plus, X } from 'lucide-react'

const statusColors = {
  pending: 'bg-amber-500/10 text-amber-600',
  approved: 'bg-emerald-500/10 text-emerald-600',
  rejected: 'bg-red-500/10 text-red-500',
}

const typeColors: Record<string, string> = {
  sick: 'bg-red-500/10 text-red-500',
  casual: 'bg-sky-500/10 text-sky-600',
  annual: 'bg-indigo-500/10 text-indigo-600',
  maternity: 'bg-pink-500/10 text-pink-600',
  unpaid: 'bg-slate-500/10 text-slate-500',
}

export default function EmployeeLeaves() {
  const { user, leaveRequests, applyLeave } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')

  // Form State
  const [type, setType] = useState<'sick' | 'casual' | 'annual' | 'maternity' | 'unpaid'>('sick')
  const [from, setFrom] = useState(new Date().toISOString().split('T')[0])
  const [to, setTo] = useState(new Date().toISOString().split('T')[0])
  const [reason, setReason] = useState('')

  // Filter requests relevant to the current logged in user
  const myRequests = leaveRequests.filter(req => req.employeeId === user?.id && (filter === 'all' || req.status === filter))

  const usedSick = leaveRequests.filter(r => r.employeeId === user?.id && r.status === 'approved' && r.type === 'sick').reduce((acc, curr) => acc + curr.days, 0)
  const usedCasual = leaveRequests.filter(r => r.employeeId === user?.id && r.status === 'approved' && r.type === 'casual').reduce((acc, curr) => acc + curr.days, 0)
  const usedAnnual = leaveRequests.filter(r => r.employeeId === user?.id && r.status === 'approved' && r.type === 'annual').reduce((acc, curr) => acc + curr.days, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const d1 = new Date(from)
      const d2 = new Date(to)
      const diffTime = d2.getTime() - d1.getTime()
      const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1)

      await applyLeave({
        type,
        from,
        to,
        days,
        reason,
      })

      setShowForm(false)
      setReason('')
    } catch (err: any) {
      alert(err.message || 'Failed to submit leave request')
    }
  }

  return (
    <div className="space-y-4">
      {/* Balance cards for employee */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { type: 'Annual', total: 21, used: usedAnnual, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { type: 'Sick', total: 10, used: usedSick, color: 'text-red-500', bg: 'bg-red-500/10' },
          { type: 'Casual', total: 6, used: usedCasual, color: 'text-sky-500', bg: 'bg-sky-500/10' },
          { type: 'Unpaid', total: '∞', used: 0, color: 'text-slate-500', bg: 'bg-slate-500/10' },
        ].map(b => (
          <div key={b.type} style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-4">
            <div className={`text-xs font-semibold uppercase tracking-wide mb-3 px-2 py-1 rounded-md inline-block ${b.bg} ${b.color}`}>{b.type}</div>
            <p className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
              {typeof b.total === 'number' ? b.total - b.used : '—'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              {b.used} used of {b.total}
            </p>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize transition-colors cursor-pointer ${filter === f ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-indigo-600 transition-colors cursor-pointer">
            <Plus size={15} />
            Apply Leave
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottomColor: 'var(--border)', backgroundColor: 'var(--muted)' }} className="border-b">
                {['Type', 'Duration', 'Days', 'Reason', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myRequests.map(req => (
                <tr key={req.id} className="border-b last:border-0 hover:bg-indigo-500/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${typeColors[req.type as keyof typeof typeColors] || 'bg-slate-500/10 text-slate-500'}`}>{req.type || 'unknown'}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {req.from || '--'} → {req.to || '--'}
                  </td>
                  <td className="px-5 py-4 font-medium" style={{ color: 'var(--foreground)' }}>{req.days || 0}</td>
                  <td className="px-5 py-4 max-w-40 truncate" style={{ color: 'var(--muted-foreground)' }}>{req.reason || '--'}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[req.status as keyof typeof statusColors] || 'bg-slate-500/10 text-slate-500'}`}>{req.status || 'unknown'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply leave modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <form
            onSubmit={handleSubmit}
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            className="rounded-2xl border w-full max-w-md p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>Apply for Leave</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={18} style={{ color: 'var(--muted-foreground)' }} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Leave Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>From Date</label>
                <input
                  required
                  type="date"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>To Date</label>
                <input
                  required
                  type="date"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Reason</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="State reason for leave request..."
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" className="flex-1 py-2.5 text-sm rounded-xl border cursor-pointer" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors cursor-pointer">Submit Request</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
