import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { Employee } from '../../types'
import { Search, Filter, MoreHorizontal, X, Edit2, Trash2 } from 'lucide-react'

const statusColors = {
  active: 'bg-emerald-500/10 text-emerald-600',
  inactive: 'bg-slate-500/10 text-slate-500',
  'on-leave': 'bg-amber-500/10 text-amber-600',
  pending: 'bg-amber-500/20 text-amber-700 font-semibold',
}

export default function HREmployees() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useAuth()
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<Employee | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    role: 'Software Engineer',
    joinDate: new Date().toISOString().split('T')[0],
    salary: 60000,
    status: 'active' as 'active' | 'inactive' | 'on-leave' | 'pending',
  })

  const depts = ['all', 'Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations']

  const filtered = employees.filter(e => {
    if (e.status === 'pending') return false
    if (e.authRole === 'admin') return false
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase())
    const matchDept = deptFilter === 'all' || e.department === deptFilter
    return matchSearch && matchDept
  })

  const approvedUsers = employees.filter(e => e.status !== 'pending' && e.authRole !== 'admin')
  const totalCount = approvedUsers.length
  const employeeCount = approvedUsers.filter(e => e.authRole === 'employee').length
  const hrCount = approvedUsers.filter(e => e.authRole === 'hr').length
  const leaveCount = approvedUsers.filter(e => e.status === 'on-leave').length
  const inactiveCount = approvedUsers.filter(e => e.status === 'inactive').length

  const handleOpenAddModal = () => {
    setEditingEmployee(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: 'Engineering',
      role: 'Software Engineer',
      joinDate: new Date().toISOString().split('T')[0],
      salary: 60000,
      status: 'active',
    })
    setShowModal(true)
  }

  const handleStartEdit = (emp: Employee) => {
    setEditingEmployee(emp)
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department,
      role: emp.role,
      joinDate: emp.joinDate,
      salary: emp.salary,
      status: emp.status,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          role: formData.role,
          salary: formData.salary,
          status: formData.status,
        })
      } else {
        await addEmployee({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          role: formData.role,
          joinDate: formData.joinDate,
          salary: formData.salary,
          status: formData.status,
        })
      }
      setShowModal(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: 'Engineering',
        role: 'Software Engineer',
        joinDate: new Date().toISOString().split('T')[0],
        salary: 60000,
        status: 'active',
      })
      setEditingEmployee(null)
    } catch (err: any) {
      alert(err.message || (editingEmployee ? 'Failed to update employee' : 'Failed to create employee'))
    }
  }

  const handleDelete = async (empId: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(empId)
        setSelected(null)
      } catch (err: any) {
        alert(err.message || 'Failed to delete employee')
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search employees…"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: 'var(--muted-foreground)' }} />
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            className="text-sm px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 cursor-pointer"
          >
            {depts.map(d => <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>)}
          </select>
        </div>


      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottomColor: 'var(--border)', backgroundColor: 'var(--muted)' }} className="border-b">
                {['Employee', 'Department', 'Role', 'Status', 'Joined', 'Salary', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr
                  key={emp.id}
                  className="border-b last:border-0 hover:bg-indigo-500/5 transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--border)' }}
                  onClick={() => setSelected(emp)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {emp.avatar}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--foreground)' }}>{emp.name}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4" style={{ color: 'var(--muted-foreground)' }}>{emp.department}</td>
                  <td className="px-5 py-4" style={{ color: 'var(--foreground)' }}>{emp.role}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[emp.status]}`}>
                      {emp.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--muted-foreground)' }}>{emp.joinDate}</td>
                  <td className="px-5 py-4 font-mono text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    ₹{emp.salary.toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-4 relative">
                    <button 
                      style={{ color: 'var(--muted-foreground)' }} 
                      className="hover:text-indigo-500 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-100" 
                      onClick={e => {
                        e.stopPropagation();
                        setActiveDropdownId(activeDropdownId === emp.id ? null : emp.id);
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {activeDropdownId === emp.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveDropdownId(null); }} />
                        <div 
                          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                          className="absolute right-5 mt-1 w-28 rounded-xl border shadow-xl z-20 py-1 text-xs text-left"
                        >
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(emp);
                              setActiveDropdownId(null);
                            }} 
                            style={{ color: 'var(--foreground)' }}
                            className="w-full px-3.5 py-2 hover:bg-indigo-500/5 transition-colors flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <Edit2 size={13} className="text-indigo-500" />
                            Edit
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(emp.id);
                              setActiveDropdownId(null);
                            }} 
                            className="w-full px-3.5 py-2 hover:bg-red-50 text-red-500 transition-colors flex items-center gap-2 font-medium cursor-pointer border-t"
                            style={{ borderTopColor: 'var(--border)' }}
                          >
                            <Trash2 size={13} className="text-red-500" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Total: <strong>{totalCount}</strong>
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <span><strong>{employeeCount}</strong> Employees</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span><strong>{hrCount}</strong> HRs</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-amber-600 font-medium"><strong>{leaveCount}</strong> On Leave</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-slate-500 font-medium"><strong>{inactiveCount}</strong> Inactive</span>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            className="rounded-2xl border w-full max-w-md p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>Employee Profile</h2>
              <button onClick={() => setSelected(null)} style={{ color: 'var(--muted-foreground)' }} className="hover:text-red-500 transition-colors cursor-pointer"><X size={18} /></button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xl font-bold">
                {selected.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>{selected.name}</h3>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{selected.role} · {selected.department}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize mt-1 inline-block ${statusColors[selected.status]}`}>
                  {selected.status.replace('-', ' ')}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['ID', selected.id],
                ['Email', selected.email],
                ['Phone', selected.phone || '--'],
                ['Joined', selected.joinDate],
                ['Salary', `₹${selected.salary.toLocaleString('en-IN')}`],
              ].map(([label, value]) => (
                <div key={label} style={{ backgroundColor: 'var(--muted)' }} className="rounded-xl px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => handleDelete(selected.id)}
                className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Delete Employee
              </button>
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <form
            onSubmit={handleSubmit}
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            className="rounded-2xl border w-full max-w-lg p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button type="button" onClick={() => setShowModal(false)}><X size={18} style={{ color: 'var(--muted-foreground)' }} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Full Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full Name"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Email Address</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@dayflow.io"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Phone</label>
                <input
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Department</label>
                <select
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  {depts.filter(d => d !== 'all').map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Role / Title</label>
                <input
                  required
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Senior Frontend Dev"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Salary (Monthly)</label>
                <input
                  type="number"
                  required
                  value={formData.salary}
                  onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
                  placeholder="Salary"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              {editingEmployee && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" className="flex-1 py-2.5 text-sm rounded-xl border transition-colors cursor-pointer" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }} onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors cursor-pointer">{editingEmployee ? 'Save Changes' : 'Create Employee'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
