import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { UserCheck, UserX, Search, Filter } from 'lucide-react'

export default function RequestsPage() {
  const { user, employees, updateEmployee, deleteEmployee, refreshAllData } = useAuth()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'hr' | 'employee'>('all')

  useEffect(() => {
    refreshAllData()
  }, [])

  const requests = employees.filter(e => {
    if (e.status !== 'pending') return false

    // HR should not see pending HR registration requests
    if (user?.role === 'hr' && e.authRole === 'hr') return false

    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
    
    const matchRole = roleFilter === 'all' || e.authRole === roleFilter
    return matchSearch && matchRole
  })

  const handleApprove = async (id: string, name: string) => {
    try {
      await updateEmployee(id, { status: 'active' })
      alert(`Approved registration request for ${name}!`)
    } catch (err: any) {
      alert(err.message || 'Failed to approve registration.')
    }
  }

  const handleReject = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to reject and delete the request for ${name}?`)) {
      try {
        await deleteEmployee(id)
        alert(`Rejected registration request for ${name}.`)
      } catch (err: any) {
        alert(err.message || 'Failed to reject registration.')
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="flex items-center gap-2.5 px-3 py-2 rounded-xl border w-full max-w-sm">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search request by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ color: 'var(--foreground)' }}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <div style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="flex items-center gap-2 px-3 py-2 rounded-xl border">
            <Filter size={14} className="text-gray-400" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as any)}
              style={{ color: 'var(--foreground)', backgroundColor: 'transparent' }}
              className="border-none outline-none text-xs font-semibold cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="hr">HR Specialists</option>
              <option value="employee">Employees</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottomColor: 'var(--border)', backgroundColor: 'var(--muted)' }} className="border-b">
                {['User Info', 'Role Requested', 'Department', 'Phone', 'Date Applied', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr
                  key={req.id}
                  className="border-b last:border-0 hover:bg-indigo-500/5 transition-colors"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {req.avatar}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--foreground)' }}>{req.name}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{req.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${
                      req.authRole === 'hr' ? 'bg-sky-500/10 text-sky-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {req.authRole === 'hr' ? 'HR Manager' : 'Employee'}
                    </span>
                  </td>
                  <td className="px-5 py-4" style={{ color: 'var(--muted-foreground)' }}>{req.department}</td>
                  <td className="px-5 py-4" style={{ color: 'var(--foreground)' }}>{req.phone || '--'}</td>
                  <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--muted-foreground)' }}>{req.joinDate}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(req.id, req.name)}
                        className="flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                        title="Accept / Approve"
                      >
                        <UserCheck size={14} /> Accept
                      </button>
                      <button
                        onClick={() => handleReject(req.id, req.name)}
                        className="flex items-center gap-1.5 border border-red-200 text-red-500 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Reject / Delete"
                      >
                        <UserX size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10" style={{ color: 'var(--muted-foreground)' }}>
                    No pending registration requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
