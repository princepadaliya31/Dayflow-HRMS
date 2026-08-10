import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Download, FileText, Eye, Edit2, Trash2, MoreHorizontal, X, Printer, Calendar } from 'lucide-react'
import type { PayrollRecord } from '../../types'

const statusColors = {
  paid: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
}

export default function HRPayroll() {
  const { user, employees, payrollRecords, generatePayroll, updatePayrollStatus, editPayrollRecord, deletePayrollRecord, updateBankDetails } = useAuth()
  const [isEditingBank, setIsEditingBank] = useState(false)
  const [bankForm, setBankForm] = useState({
    bankName: user?.bankDetails?.bankName || '',
    accountNumber: user?.bankDetails?.accountNumber || '',
    ifscCode: user?.bankDetails?.ifscCode || '',
    branchName: user?.bankDetails?.branchName || '',
    accountHolderName: user?.bankDetails?.accountHolderName || user?.name || '',
  })

  useEffect(() => {
    if (user?.bankDetails) {
      setBankForm({
        bankName: user.bankDetails.bankName || '',
        accountNumber: user.bankDetails.accountNumber || '',
        ifscCode: user.bankDetails.ifscCode || '',
        branchName: user.bankDetails.branchName || '',
        accountHolderName: user.bankDetails.accountHolderName || user.name || '',
      })
    }
  }, [user])

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateBankDetails(bankForm)
      setIsEditingBank(false)
      alert('Bank details updated successfully!')
    } catch (err: any) {
      alert(err.message || 'Failed to update bank details')
    }
  }
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  })
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'manage' | 'personal'>('manage')
  const [selectedPersonalId, setSelectedPersonalId] = useState<string | null>(null)
  
  // Modals state
  const [viewingRecord, setViewingRecord] = useState<PayrollRecord | null>(null)
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null)
  const [editFormData, setEditFormData] = useState({
    basic: 0,
    hra: 0,
    allowances: 0,
    deductions: 0,
    tax: 0,
  })

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  // Dynamic month list generator (latest 12 months + database months)
  const getRecentMonthsList = () => {
    const list: string[] = []
    const date = new Date()
    for (let i = 0; i < 12; i++) {
      const mName = date.toLocaleString('default', { month: 'long', year: 'numeric' })
      list.push(mName)
      date.setMonth(date.getMonth() - 1)
    }
    return list
  }

  const dbMonths = Array.from(new Set(payrollRecords.map(r => r.month)))
  const defaultMonths = getRecentMonthsList()
  const allMonths = Array.from(new Set([...dbMonths, ...defaultMonths]))
  
  const sortedMonths = allMonths.sort((a, b) => {
    const dateA = new Date(a)
    const dateB = new Date(b)
    return dateB.getTime() - dateA.getTime()
  })

  // Filter records by selected month
  const monthRecords = payrollRecords.filter(r => r.month === selectedMonth)

  // Apply filters
  const filteredRecords = monthRecords.filter(rec => {
    const matchesSearch = rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || rec.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || rec.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesDept && matchesStatus;
  })

  const paidRecords = monthRecords.filter(r => r.status === 'paid')
  const pendingRecords = monthRecords.filter(r => r.status === 'pending')

  const totalPaid = paidRecords.reduce((acc, r) => acc + r.net, 0)
  const totalPending = pendingRecords.reduce((acc, r) => acc + r.net, 0)

  // Personal user record checks (for Admin / HR's own payslip)
  const parseMonthYear = (monthStr: string) => {
    const parts = monthStr.split(' ')
    if (parts.length < 2) return new Date(0)
    const [monthName, yearStr] = parts
    const monthIndex = new Date(`${monthName} 1, 2000`).getMonth()
    const year = parseInt(yearStr, 10)
    if (isNaN(monthIndex) || isNaN(year)) return new Date(0)
    return new Date(year, monthIndex, 1)
  }

  const myPersonalRecords = payrollRecords
    .filter(r => r.employeeId === user?.id)
    .sort((a, b) => parseMonthYear(b.month).getTime() - parseMonthYear(a.month).getTime())

  useEffect(() => {
    if (myPersonalRecords.length > 0 && !selectedPersonalId) {
      setSelectedPersonalId(myPersonalRecords[0].id)
    }
  }, [myPersonalRecords, selectedPersonalId])

  const myPersonalRecord = myPersonalRecords.find(r => r.id === selectedPersonalId) || myPersonalRecords[0]

  const handleGenerate = async () => {
    try {
      await generatePayroll(selectedMonth)
      alert(`Payroll processed for ${selectedMonth}!`)
    } catch (err: any) {
      alert(err.message || 'Failed to generate payroll')
    }
  }

  const handleUpdateStatus = async (id: string) => {
    try {
      await updatePayrollStatus(id, 'paid')
      alert('Salary status successfully marked as Paid!')
    } catch (err: any) {
      alert(err.message || 'Failed to update status')
    }
  }

  const handleDeleteRecord = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the payroll record for ${name}?`)) {
      try {
        await deletePayrollRecord(id)
      } catch (err: any) {
        alert(err.message || 'Failed to delete record')
      }
    }
  }

  const handleStartEdit = (rec: PayrollRecord) => {
    setEditingRecord(rec)
    setEditFormData({
      basic: rec.basic,
      hra: rec.hra,
      allowances: rec.allowances || 0,
      deductions: rec.deductions,
      tax: rec.tax,
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRecord) return
    try {
      await editPayrollRecord(editingRecord.id, editFormData)
      setEditingRecord(null)
    } catch (err: any) {
      alert(err.message || 'Failed to update payroll amounts')
    }
  }

  const handleExport = () => {
    if (monthRecords.length === 0) {
      alert('No records to export')
      return
    }
    const headers = ['Employee Name', 'Department', 'Month', 'Basic', 'HRA', 'Allowances', 'Deductions', 'Tax', 'Net Pay', 'Status']
    const rows = monthRecords.map(r => [
      `"${r.employeeName}"`,
      `"${r.department}"`,
      `"${r.month}"`,
      r.basic,
      r.hra,
      r.allowances,
      r.deductions,
      r.tax,
      r.net,
      r.status
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
      
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `payroll_records_${selectedMonth.replace(' ', '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  const computedNet = editFormData.basic + editFormData.hra + editFormData.allowances - editFormData.deductions - editFormData.tax

  return (
    <div className="space-y-4">
      {/* Tab switcher if user has a salary record */}
      {myPersonalRecord && (
        <div className="flex gap-2 border-b pb-3 no-print" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${activeTab === 'manage' ? 'bg-indigo-500 text-white' : 'hover:bg-indigo-500/5'}`}
            style={activeTab !== 'manage' ? { color: 'var(--foreground)' } : {}}
          >
            Manage Payroll
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${activeTab === 'personal' ? 'bg-indigo-500 text-white' : 'hover:bg-indigo-500/5'}`}
            style={activeTab !== 'personal' ? { color: 'var(--foreground)' } : {}}
          >
            My Payslip
          </button>
        </div>
      )}

      {activeTab === 'personal' && myPersonalRecord ? (
        <div className="space-y-4">
          {/* Bank Details section */}
          <div 
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} 
            className="rounded-xl border p-6 no-print"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Bank Account Details</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Your salary will be disbursed to this account</p>
              </div>
              <button
                onClick={() => setIsEditingBank(true)}
                className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 transition-colors border border-indigo-500/20 px-3 py-1.5 rounded-lg hover:bg-indigo-500/5 cursor-pointer"
              >
                Edit Bank Details
              </button>
            </div>
            
            {user?.bankDetails?.accountNumber ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  ['Account Holder', user.bankDetails.accountHolderName],
                  ['Bank Name', user.bankDetails.bankName],
                  ['Account Number', user.bankDetails.accountNumber],
                  ['IFSC Code', user.bankDetails.ifscCode],
                  ['Branch Name', user.bankDetails.branchName || 'Not Specified'],
                ].map(([label, val]) => (
                  <div key={label} style={{ backgroundColor: 'var(--muted)' }} className="rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                    <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{val}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ backgroundColor: 'var(--muted)' }} className="rounded-xl p-4 text-center">
                <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  No bank account details added yet. Please edit your bank details to ensure smooth salary payouts.
                </p>
              </div>
            )}
          </div>

          {/* Employee payslip view */}
          <div 
            id="printable-receipt" 
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} 
            className="rounded-xl border p-6 print-modal"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>Payslip — {myPersonalRecord.month}</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{user?.name} · {user?.department}</p>
              </div>
              <span className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${statusColors[myPersonalRecord.status]}`}>{myPersonalRecord.status}</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
              {[
                ['Basic', myPersonalRecord.basic],
                ['HRA', myPersonalRecord.hra],
                ['Allowances', myPersonalRecord.allowances],
                ['Deductions', -myPersonalRecord.deductions],
                ['Tax', -myPersonalRecord.tax],
              ].map(([label, value]) => (
                <div key={label as string} style={{ backgroundColor: 'var(--muted)' }} className="rounded-xl p-4">
                  <p className="text-[11px] uppercase tracking-wide font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>{label as string}</p>
                  <p className={`font-mono text-sm font-semibold ${(value as number) < 0 ? 'text-red-500' : ''}`} style={(value as number) >= 0 ? { color: 'var(--foreground)' } : {}}>
                    {(value as number) < 0 ? '-' : ''}₹{Math.abs(value as number).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
              <div className="rounded-xl p-4 bg-indigo-500/10">
                <p className="text-[11px] uppercase tracking-wide font-semibold mb-1 text-indigo-500">Net Pay</p>
                <p className="font-mono text-sm font-bold text-indigo-600">₹{myPersonalRecord.net.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 text-sm font-medium bg-indigo-500 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-colors cursor-pointer no-print"
            >
              <Download size={15} />
              Download Payslip PDF
            </button>
          </div>

          {/* Salary History */}
          <div 
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} 
            className="rounded-xl border overflow-hidden no-print"
          >
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                Salary History
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottomColor: 'var(--border)', backgroundColor: 'var(--muted)' }} className="border-b">
                    {['Month', 'Basic', 'HRA', 'Allowances', 'Deductions', 'Tax', 'Net Pay', 'Status'].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myPersonalRecords.map(rec => {
                    const isSelected = rec.id === myPersonalRecord?.id
                    return (
                      <tr 
                        key={rec.id} 
                        onClick={() => setSelectedPersonalId(rec.id)}
                        className={`border-b last:border-0 hover:bg-indigo-500/5 transition-colors cursor-pointer ${
                          isSelected ? 'bg-indigo-500/10 dark:bg-indigo-500/20 font-semibold' : ''
                        }`} 
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <td className="px-5 py-4 font-medium" style={{ color: 'var(--foreground)' }}>{rec.month}</td>
                        <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--foreground)' }}>₹{rec.basic.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--foreground)' }}>₹{rec.hra.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--foreground)' }}>₹{rec.allowances.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 font-mono text-xs text-red-500">-₹{rec.deductions.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 font-mono text-xs text-red-500">-₹{rec.tax.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 font-mono text-sm font-semibold text-indigo-600">₹{rec.net.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[rec.status]}`}>{rec.status}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Bank Details Modal */}
          {isEditingBank && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
              <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>Edit Bank Details</h3>
                  <button 
                    onClick={() => setIsEditingBank(false)} 
                    className="hover:bg-slate-100 p-1.5 rounded-lg cursor-pointer"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleBankSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Account Holder Name</label>
                    <input
                      type="text"
                      required
                      value={bankForm.accountHolderName}
                      onChange={e => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                      style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      className="w-full text-sm px-3.5 py-2 rounded-xl border outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Bank Name</label>
                    <input
                      type="text"
                      required
                      value={bankForm.bankName}
                      onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                      style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      className="w-full text-sm px-3.5 py-2 rounded-xl border outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Account Number</label>
                    <input
                      type="text"
                      required
                      value={bankForm.accountNumber}
                      onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                      style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      className="w-full text-sm px-3.5 py-2 rounded-xl border outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>IFSC Code</label>
                      <input
                        type="text"
                        required
                        value={bankForm.ifscCode}
                        onChange={e => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                        style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        className="w-full text-sm px-3.5 py-2 rounded-xl border outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Branch Name</label>
                      <input
                        type="text"
                        value={bankForm.branchName}
                        onChange={e => setBankForm({ ...bankForm, branchName: e.target.value })}
                        style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        className="w-full text-sm px-3.5 py-2 rounded-xl border outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    <button
                      type="button"
                      onClick={() => setIsEditingBank(false)}
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      className="border px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Save Bank Details
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 no-print">
            <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border">
              <Calendar size={16} className="text-slate-400" />
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                style={{ color: 'var(--foreground)', backgroundColor: 'transparent', outline: 'none' }}
                className="border-none outline-none text-sm font-semibold cursor-pointer focus:outline-none focus:ring-0"
              >
                {sortedMonths.map(m => (
                  <option key={m} value={m} style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 text-sm font-medium text-indigo-500 border border-indigo-500/30 px-4 py-2.5 rounded-xl hover:bg-indigo-500/5 transition-colors cursor-pointer"
            >
              <FileText size={15} />
              Generate Payroll
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
            {[
              { label: 'Total Disbursed', value: `₹${totalPaid.toLocaleString('en-IN')}`, sub: `${paidRecords.length} records completed`, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
              { label: 'Pending', value: `₹${totalPending.toLocaleString('en-IN')}`, sub: `${pendingRecords.length} pending execution`, color: 'text-amber-600', bg: 'bg-amber-500/10' },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-4">
                <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md mb-3 ${s.bg} ${s.color}`}>
                  {s.label}
                </div>
                <p className="text-xl font-semibold font-mono" style={{ color: 'var(--foreground)' }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Payroll table */}
          <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border overflow-hidden no-print">
            <div className="px-5 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
              <p className="font-semibold text-sm whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                Payroll Records — {selectedMonth}
              </p>
              
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                {/* Search Input */}
                <input 
                  type="text"
                  placeholder="Search Employee..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-44"
                  style={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--foreground)' 
                  }}
                />
                
                {/* Department Dropdown */}
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  style={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--foreground)' 
                  }}
                >
                  <option value="All">All Departments</option>
                  {Array.from(new Set(payrollRecords.map(r => r.department))).filter(Boolean).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                {/* Status Dropdown */}
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  style={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--foreground)' 
                  }}
                >
                  <option value="All">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>

                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 text-xs text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer border px-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <Download size={13} />
                  Export CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottomColor: 'var(--border)', backgroundColor: 'var(--muted)' }} className="border-b">
                    {['Employee', 'Dept', 'Full Salary', 'Present Days', 'Basic', 'HRA', 'Deductions', 'Tax', 'Net Pay', 'Status', ''].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((rec, idx) => {
                    const openUpward = idx >= filteredRecords.length - 2 && filteredRecords.length > 2;
                    return (
                      <tr key={rec.id} className="border-b last:border-0 hover:bg-indigo-500/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xs font-bold">
                              {rec.employeeName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium" style={{ color: 'var(--foreground)' }}>{rec.employeeName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4" style={{ color: 'var(--muted-foreground)' }}>{rec.department}</td>
                        <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--foreground)' }}>₹{(rec.baseSalary || (rec.basic + rec.hra + rec.allowances)).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{rec.presentDays !== undefined ? rec.presentDays : 30} days</td>
                        <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--foreground)' }}>₹{rec.basic.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--foreground)' }}>₹{rec.hra.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 font-mono text-xs text-red-500">-₹{rec.deductions.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 font-mono text-xs text-red-500">-₹{rec.tax.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 font-mono text-sm font-semibold text-indigo-600">₹{rec.net.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[rec.status]}`}>{rec.status}</span>
                        </td>
                        <td className="px-5 py-4 relative">
                          <button 
                            style={{ color: 'var(--muted-foreground)' }} 
                            className="hover:text-indigo-500 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-100" 
                            onClick={e => {
                              e.stopPropagation();
                              setActiveDropdownId(activeDropdownId === rec.id ? null : rec.id);
                            }}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {activeDropdownId === rec.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveDropdownId(null); }} />
                              <div 
                                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                                className={`absolute right-5 w-36 rounded-xl border shadow-xl z-20 py-1 text-xs text-left ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'}`}
                              >
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingRecord(rec);
                                  setActiveDropdownId(null);
                                }} 
                                style={{ color: 'var(--foreground)' }}
                                className="w-full px-3.5 py-2 hover:bg-indigo-500/5 transition-colors flex items-center gap-2 font-medium cursor-pointer"
                              >
                                <Eye size={13} className="text-indigo-500" />
                                View Payslip
                              </button>

                              {rec.status !== 'paid' && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEdit(rec);
                                    setActiveDropdownId(null);
                                  }} 
                                  style={{ color: 'var(--foreground)' }}
                                  className="w-full px-3.5 py-2 hover:bg-indigo-500/5 transition-colors flex items-center gap-2 font-medium cursor-pointer border-t"
                                  style={{ borderTopColor: 'var(--border)' }}
                                >
                                  <Edit2 size={13} className="text-amber-500" />
                                  Edit Record
                                </button>
                              )}

                              {rec.status !== 'paid' && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(rec.id);
                                    setActiveDropdownId(null);
                                  }} 
                                  style={{ color: 'var(--foreground)' }}
                                  className="w-full px-3.5 py-2 hover:bg-indigo-500/5 transition-colors flex items-center gap-2 font-medium cursor-pointer border-t"
                                  style={{ borderTopColor: 'var(--border)' }}
                                >
                                  <FileText size={13} className="text-emerald-500" />
                                  Mark as Paid
                                </button>
                              )}

                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRecord(rec.id, rec.employeeName);
                                  setActiveDropdownId(null);
                                }} 
                                className="w-full px-3.5 py-2 hover:bg-red-50 text-red-500 transition-colors flex items-center gap-2 font-medium cursor-pointer border-t"
                                style={{ borderTopColor: 'var(--border)' }}
                              >
                                <Trash2 size={13} className="text-red-500" />
                                Delete Record
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={11} className="text-center px-5 py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {monthRecords.length === 0 
                          ? 'No payroll slips generated for this month. Click "Generate Payroll" to calculate.'
                          : 'No payroll records match your filter criteria.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* View Payslip Modal */}
          {viewingRecord && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingRecord(null)}>
              <div
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                className="rounded-2xl border w-full max-w-2xl p-6 shadow-2xl relative print-modal"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6 no-print">
                  <h2 className="font-bold text-base text-indigo-500">Dayflow HRMS Payslip Receipt</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 border border-indigo-500/30 text-indigo-500 text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-500/5 transition-colors cursor-pointer"
                    >
                      <Printer size={13} />
                      Print / Save PDF
                    </button>
                    <button 
                      onClick={() => setViewingRecord(null)} 
                      style={{ color: 'var(--muted-foreground)' }} 
                      className="hover:text-red-500 p-1 transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Receipt Content */}
                <div className="space-y-6 text-sm" id="printable-receipt">
                  <div className="text-center pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <h1 className="text-xl font-bold tracking-wide" style={{ color: 'var(--foreground)' }}>DAYFLOW TECHNOLOGIES</h1>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Corporate Office, Bangalore, India</p>
                    <p className="text-sm font-semibold mt-2 text-indigo-600">SALARY SLIP FOR THE MONTH OF {viewingRecord.month.toUpperCase()}</p>
                  </div>

                  {/* Employee info */}
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b text-xs" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                    <div>
                      <p className="mb-1"><span style={{ color: 'var(--muted-foreground)' }}>Employee Name:</span> <strong>{viewingRecord.employeeName}</strong></p>
                      <p className="mb-1"><span style={{ color: 'var(--muted-foreground)' }}>Employee ID:</span> <strong>{viewingRecord.employeeId}</strong></p>
                      <p className="mb-1"><span style={{ color: 'var(--muted-foreground)' }}>Department:</span> <strong>{viewingRecord.department}</strong></p>
                    </div>
                    <div className="text-right flex flex-col justify-start items-end">
                      <p className="mb-1"><span style={{ color: 'var(--muted-foreground)' }}>Payslip Status:</span> <strong className="capitalize text-indigo-600">{viewingRecord.status}</strong></p>
                      {(() => {
                        const matchingEmployee = employees.find(e => e.employeeId === viewingRecord.employeeId);
                        const bankDetails = matchingEmployee?.bankDetails || viewingRecord.bankDetails;
                        return bankDetails && bankDetails.accountNumber ? (
                          <>
                            <p className="mb-1 text-right">
                              <span style={{ color: 'var(--muted-foreground)' }}>Account No:</span> <strong>{bankDetails.accountNumber}</strong>
                            </p>
                            {bankDetails.bankName && (
                              <p className="mb-1 text-right">
                                <span style={{ color: 'var(--muted-foreground)' }}>Bank Name:</span> <strong>{bankDetails.bankName}</strong>
                              </p>
                            )}
                          </>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  {/* Breakup Grid */}
                  <div className="grid grid-cols-2 gap-6 text-xs">
                    {/* Earnings */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm border-b pb-1" style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}>EARNINGS</h3>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--muted-foreground)' }}>Basic Salary</span>
                        <span className="font-mono">₹{viewingRecord.basic.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--muted-foreground)' }}>HRA</span>
                        <span className="font-mono">₹{viewingRecord.hra.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--muted-foreground)' }}>Allowances</span>
                        <span className="font-mono">₹{viewingRecord.allowances.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                        <span>Gross Earnings</span>
                        <span className="font-mono">₹{(viewingRecord.basic + viewingRecord.hra + viewingRecord.allowances).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Deductions */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm border-b pb-1" style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}>DEDUCTIONS</h3>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--muted-foreground)' }}>Provident Fund (PF)</span>
                        <span className="font-mono text-red-500">-₹{viewingRecord.deductions.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--muted-foreground)' }}>Income Tax / TDS</span>
                        <span className="font-mono text-red-500">-₹{viewingRecord.tax.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                        <span>Total Deductions</span>
                        <span className="font-mono text-red-500">-₹{(viewingRecord.deductions + viewingRecord.tax).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay summary */}
                  <div className="rounded-xl p-4 bg-indigo-500/10 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Net Payable Salary</h4>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Basic + HRA + Allowances - Deductions - Tax</p>
                    </div>
                    <p className="font-mono text-xl font-bold text-indigo-600">
                      ₹{viewingRecord.net.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="text-center pt-4 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                    This is a system generated document and does not require a physical signature.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Payroll Modal */}
          {editingRecord && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingRecord(null)}>
              <div
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                className="rounded-2xl border w-full max-w-md p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>Edit Payroll Record</h2>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {editingRecord.employeeName} · {editingRecord.month}
                    </p>
                  </div>
                  <button onClick={() => setEditingRecord(null)} style={{ color: 'var(--muted-foreground)' }} className="hover:text-red-500 p-1 transition-colors cursor-pointer"><X size={18} /></button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-medium text-xs" style={{ color: 'var(--muted-foreground)' }}>Basic Salary (₹)</label>
                      <input
                        type="number"
                        required
                        value={editFormData.basic}
                        onChange={e => setEditFormData({ ...editFormData, basic: Number(e.target.value) })}
                        style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        className="w-full px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-medium text-xs" style={{ color: 'var(--muted-foreground)' }}>HRA (₹)</label>
                      <input
                        type="number"
                        required
                        value={editFormData.hra}
                        onChange={e => setEditFormData({ ...editFormData, hra: Number(e.target.value) })}
                        style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        className="w-full px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-medium text-xs" style={{ color: 'var(--muted-foreground)' }}>Other Allowances (₹)</label>
                    <input
                      type="number"
                      required
                      value={editFormData.allowances}
                      onChange={e => setEditFormData({ ...editFormData, allowances: Number(e.target.value) })}
                      style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      className="w-full px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-medium text-xs text-red-500">Deductions / PF (₹)</label>
                      <input
                        type="number"
                        required
                        value={editFormData.deductions}
                        onChange={e => setEditFormData({ ...editFormData, deductions: Number(e.target.value) })}
                        style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        className="w-full px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-medium text-xs text-red-500">Income Tax / TDS (₹)</label>
                      <input
                        type="number"
                        required
                        value={editFormData.tax}
                        onChange={e => setEditFormData({ ...editFormData, tax: Number(e.target.value) })}
                        style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        className="w-full px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl p-4 bg-indigo-500/10 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Calculated Net Pay</h4>
                      <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Recalculated dynamically</p>
                    </div>
                    <p className="font-mono text-lg font-bold text-indigo-600">
                      ₹{computedNet.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingRecord(null)}
                      style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
