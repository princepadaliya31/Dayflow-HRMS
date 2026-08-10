import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Download, X } from 'lucide-react'

const statusColors = {
  paid: 'bg-emerald-500/10 text-emerald-600',
  pending: 'bg-amber-500/10 text-amber-600',
}

export default function EmployeePayroll() {
  const { user, payrollRecords, updateBankDetails } = useAuth()
  const [isEditingBank, setIsEditingBank] = useState(false)
  const [bankForm, setBankForm] = useState({
    bankName: user?.bankDetails?.bankName || '',
    accountNumber: user?.bankDetails?.accountNumber || '',
    ifscCode: user?.bankDetails?.ifscCode || '',
    branchName: user?.bankDetails?.branchName || '',
    accountHolderName: user?.bankDetails?.accountHolderName || user?.name || '',
  })

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)

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

  // Filter and sort records chronologically (newest first)
  const parseMonthYear = (monthStr: string) => {
    const parts = monthStr.split(' ')
    if (parts.length < 2) return new Date(0)
    const [monthName, yearStr] = parts
    const monthIndex = new Date(`${monthName} 1, 2000`).getMonth()
    const year = parseInt(yearStr, 10)
    if (isNaN(monthIndex) || isNaN(year)) return new Date(0)
    return new Date(year, monthIndex, 1)
  }

  const myRecords = payrollRecords
    .filter(r => r.employeeId === user?.id)
    .sort((a, b) => parseMonthYear(b.month).getTime() - parseMonthYear(a.month).getTime())

  useEffect(() => {
    if (myRecords.length > 0 && !selectedRecordId) {
      setSelectedRecordId(myRecords[0].id)
    }
  }, [myRecords, selectedRecordId])

  const myRecord = myRecords.find(r => r.id === selectedRecordId) || myRecords[0]

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

  const handleExport = () => {
    if (myRecords.length === 0) {
      alert('No records to export')
      return
    }
    const headers = ['Month', 'Basic', 'HRA', 'Allowances', 'Deductions', 'Tax', 'Net Pay', 'Status']
    const rows = myRecords.map(r => [
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
    link.setAttribute("download", `my_payroll_history.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (myRecords.length === 0) {
    return (
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

        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-8 text-center text-sm">
          <p style={{ color: 'var(--muted-foreground)' }}>
            No payroll records have been generated for you yet. Please contact HR or Administration.
          </p>
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
    )
  }

  return (
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
        <div className="text-center pb-4 border-b mb-4" style={{ borderColor: 'var(--border)' }}>
          <h1 className="text-xl font-bold tracking-wide" style={{ color: 'var(--foreground)' }}>DAYFLOW TECHNOLOGIES</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Corporate Office, Bangalore, India</p>
          <p className="text-sm font-semibold mt-2 text-indigo-600">SALARY SLIP FOR THE MONTH OF {myRecord.month.toUpperCase()}</p>
        </div>

        {/* Employee info */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b text-xs mb-5" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
          <div>
            <p className="mb-1"><span style={{ color: 'var(--muted-foreground)' }}>Employee Name:</span> <strong>{user?.name}</strong></p>
            <p className="mb-1"><span style={{ color: 'var(--muted-foreground)' }}>Employee ID:</span> <strong>{user?.id || user?.employeeId}</strong></p>
            <p className="mb-1"><span style={{ color: 'var(--muted-foreground)' }}>Department:</span> <strong>{user?.department}</strong></p>
          </div>
          <div className="text-right flex flex-col justify-start items-end">
            <p className="mb-1"><span style={{ color: 'var(--muted-foreground)' }}>Payslip Status:</span> <strong className="capitalize text-indigo-600">{myRecord.status}</strong></p>
            {user?.bankDetails?.accountNumber ? (
              <>
                <p className="mb-1 text-right">
                  <span style={{ color: 'var(--muted-foreground)' }}>Account No:</span> <strong>{user.bankDetails.accountNumber}</strong>
                </p>
                {user.bankDetails.bankName && (
                  <p className="mb-1 text-right">
                    <span style={{ color: 'var(--muted-foreground)' }}>Bank Name:</span> <strong>{user.bankDetails.bankName}</strong>
                  </p>
                )}
              </>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {[
            ['Basic', myRecord.basic],
            ['HRA', myRecord.hra],
            ['Allowances', myRecord.allowances],
            ['Deductions', -myRecord.deductions],
            ['Tax', -myRecord.tax],
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
            <p className="font-mono text-sm font-bold text-indigo-600">₹{myRecord.net.toLocaleString('en-IN')}</p>
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

      {/* Payroll history table */}
      <div 
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} 
        className="rounded-xl border overflow-hidden no-print"
      >
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
            Salary History
          </p>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 text-xs text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <Download size={13} />
            Export
          </button>
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
               {myRecords.map(rec => {
                const isSelected = rec.id === myRecord?.id
                return (
                  <tr 
                    key={rec.id} 
                    onClick={() => setSelectedRecordId(rec.id)}
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
  )
}
