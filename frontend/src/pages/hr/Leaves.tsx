import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Check, X } from 'lucide-react'

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

export default function HRLeaves() {
  const { leaveRequests, updateLeaveStatus } = useAuth()
  const [filter, setFilter] = useState('all')

  const filtered = leaveRequests.filter(req => filter === 'all' || req.status === filter)

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateLeaveStatus(id, status)
    } catch (err: any) {
      alert(err.message || 'Failed to update leave status')
    }
  }

  return (
    <div className="space-y-4">
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottomColor: 'var(--border)', backgroundColor: 'var(--muted)' }} className="border-b">
                {['Employee', 'Type', 'Duration', 'Days', 'Reason', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => (
                <tr key={req.id} className="border-b last:border-0 hover:bg-indigo-500/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {(req.employeeName || 'Emp').split(' ').map(n => n[0] || '').join('')}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--foreground)' }}>{req.employeeName || 'Unknown Employee'}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{req.department || '--'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${typeColors[req.type as keyof typeof typeColors] || 'bg-slate-500/10 text-slate-500'}`}>{req.type || 'unknown'}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {req.from || '--'} → {req.to || '--'}
                  </td>
                  <td className="px-5 py-4 font-medium text-center" style={{ color: 'var(--foreground)' }}>{req.days || 0}</td>
                  <td className="px-5 py-4 max-w-40 truncate" style={{ color: 'var(--muted-foreground)' }}>{req.reason || '--'}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[req.status as keyof typeof statusColors] || 'bg-slate-500/10 text-slate-500'}`}>{req.status || 'unknown'}</span>
                  </td>
                  <td className="px-5 py-4">
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(req.id, 'approved')}
                          className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500/20 transition-colors cursor-pointer"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => handleStatusChange(req.id, 'rejected')}
                          className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
