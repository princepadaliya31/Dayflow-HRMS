import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  FileText, Clock, CalendarDays, DollarSign, Download, Filter, Search,
  RefreshCw, CheckCircle, AlertCircle, XCircle
} from 'lucide-react'

export default function HRReports() {
  const {
    employees,
    attendanceRecords,
    leaveRequests,
    payrollRecords,
    departments,
    refreshAllData
  } = useAuth()

  const [activeReport, setActiveReport] = useState<'attendance' | 'leaves' | 'payroll'>('attendance')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // --- REPORT FILTER STATES ---
  // Common dates default to current month range (e.g. 2026-08-01 to 2026-08-10)
  const [startDate, setStartDate] = useState('2026-08-01')
  const [endDate, setEndDate] = useState('2026-08-10')
  const [deptFilter, setDeptFilter] = useState('All')
  const [empFilter, setEmpFilter] = useState('All')

  // Leave specific filters
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('All')
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('All')

  // Payroll specific filters
  const [payrollMonth, setPayrollMonth] = useState('2026-08')
  const [payrollStatusFilter, setPayrollStatusFilter] = useState('All')

  // Refresh datasets
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (refreshAllData) {
        await refreshAllData()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsRefreshing(false)
    }
  }

  // --- FILTER GENERATED DATA ---

  // 1. Attendance Report Logic
  // Computes aggregate summaries per employee within the date range
  const getAttendanceSummary = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Get list of employees matching department
    const targetEmployees = employees.filter(emp => {
      const matchDept = deptFilter === 'All' || emp.department === deptFilter
      const matchEmp = empFilter === 'All' || emp.id === empFilter
      return matchDept && matchEmp
    })

    return targetEmployees.map(emp => {
      // Find all records for this employee within range
      const records = attendanceRecords.filter(rec => {
        if (rec.employeeId !== emp.id) return false
        const recDate = new Date(rec.date)
        return recDate >= start && recDate <= end
      })

      const totalDays = records.length
      const presentDays = records.filter(r => r.status === 'present').length
      const lateDays = records.filter(r => r.status === 'late').length
      const absentDays = records.filter(r => r.status === 'absent').length
      const halfDays = records.filter(r => r.status === 'half-day').length
      const totalHours = records.reduce((sum, r) => sum + (r.hours || 0), 0)

      const attendanceRate = totalDays > 0 
        ? ((presentDays + lateDays + halfDays * 0.5) / totalDays) * 100 
        : 0

      return {
        id: emp.id,
        name: emp.name,
        department: emp.department,
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        halfDays,
        totalHours: Math.round(totalHours * 100) / 100,
        attendanceRate: Math.round(attendanceRate)
      }
    })
  }

  // 2. Leave Report Logic
  const getLeaveReport = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    return leaveRequests.filter(req => {
      // Date filter
      const reqFrom = new Date(req.from)
      const dateMatch = reqFrom >= start && reqFrom <= end

      // Department filter
      const emp = employees.find(e => e.id === req.employeeId)
      const empDept = emp?.department || req.department
      const deptMatch = deptFilter === 'All' || empDept === deptFilter

      // Employee filter
      const empMatch = empFilter === 'All' || req.employeeId === empFilter

      // Leave fields filter
      const typeMatch = leaveTypeFilter === 'All' || req.type === leaveTypeFilter.toLowerCase()
      const statusMatch = leaveStatusFilter === 'All' || req.status === leaveStatusFilter.toLowerCase()

      return dateMatch && deptMatch && empMatch && typeMatch && statusMatch
    })
  }

  // 3. Payroll Report Logic
  const getPayrollReport = () => {
    return payrollRecords.filter(pay => {
      // Month filter (match e.g. "August 2026" or "2026-08")
      // Check if pay.month contains string or matches formatted query
      const payMonthQuery = payrollMonth // e.g. "2026-08"
      const dateParts = payMonthQuery.split('-') // ["2026", "08"]
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      const queryMonthName = monthNames[parseInt(dateParts[1], 10) - 1]
      const matchesMonth = pay.month.toLowerCase().includes(queryMonthName?.toLowerCase()) && pay.month.includes(dateParts[0])

      // Department filter
      const deptMatch = deptFilter === 'All' || pay.department === deptFilter

      // Employee filter
      const empMatch = empFilter === 'All' || pay.employeeId === empFilter

      // Status filter
      const statusMatch = payrollStatusFilter === 'All' || pay.status === payrollStatusFilter.toLowerCase()

      return matchesMonth && deptMatch && empMatch && statusMatch
    })
  }

  // --- CSV EXPORTER ACTION ---
  const handleExportCSV = () => {
    let headers: string[] = []
    let rows: any[][] = []
    let fileName = 'report'

    if (activeReport === 'attendance') {
      headers = ['Employee ID', 'Employee Name', 'Department', 'Scheduled Days', 'Present', 'Late', 'Half-day', 'Absent', 'Total Hours', 'Attendance Rate (%)']
      rows = getAttendanceSummary().map(row => [
        `"${row.id}"`,
        `"${row.name}"`,
        `"${row.department}"`,
        row.totalDays,
        row.presentDays,
        row.lateDays,
        row.halfDays,
        row.absentDays,
        row.totalHours,
        `${row.attendanceRate}%`
      ])
      fileName = `attendance_summary_${startDate}_to_${endDate}`
    } else if (activeReport === 'leaves') {
      headers = ['Employee Name', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Days Count', 'Reason', 'Status']
      rows = getLeaveReport().map(row => {
        // Prepend space to dates to prevent Excel ######## formatting
        const formattedFrom = ` ${row.from}`
        const formattedTo = ` ${row.to}`
        return [
          `"${row.employeeName}"`,
          `"${row.department}"`,
          `"${row.type.toUpperCase()}"`,
          `"${formattedFrom}"`,
          `"${formattedTo}"`,
          row.days,
          `"${row.reason || ''}"`,
          `"${row.status.toUpperCase()}"`
        ]
      })
      fileName = `leave_report_${startDate}_to_${endDate}`
    } else if (activeReport === 'payroll') {
      headers = ['Employee Name', 'Department', 'Payroll Month', 'Basic Salary', 'HRA', 'Allowances', 'Deductions', 'Tax Deduction', 'Net Pay', 'Payment Status']
      rows = getPayrollReport().map(row => [
        `"${row.employeeName}"`,
        `"${row.department}"`,
        `"${row.month}"`,
        row.basic,
        row.hra,
        row.allowances,
        row.deductions,
        row.tax,
        row.net,
        `"${row.status.toUpperCase()}"`
      ])
      fileName = `payroll_report_${payrollMonth}`
    }

    if (rows.length === 0) {
      alert('No summary records available to export for current filter criteria.')
      return
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${fileName}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // --- DERIVED RESULTS FOR TABLES ---
  const attendanceData = getAttendanceSummary()
  const leaveData = getLeaveReport()
  const payrollData = getPayrollReport()

  // Reset employee filter when department changes
  useEffect(() => {
    setEmpFilter('All')
  }, [deptFilter])

  return (
    <div className="space-y-6">
      {/* Top controls / tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Switch report type tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start">
          <button
            onClick={() => {
              setActiveTabFilters()
              setActiveReport('attendance')
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeReport === 'attendance'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Clock size={14} />
            Attendance Summary
          </button>
          <button
            onClick={() => {
              setActiveTabFilters()
              setActiveReport('leaves')
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeReport === 'leaves'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CalendarDays size={14} />
            Leaves Report
          </button>
          <button
            onClick={() => {
              setActiveTabFilters()
              setActiveReport('payroll')
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeReport === 'payroll'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <DollarSign size={14} />
            Payroll Costings
          </button>
        </div>

        {/* Global actions */}
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold border px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Sync Data
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* FILTER CONTROL CARD */}
      <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="p-5 rounded-2xl border shadow-xs space-y-4">
        <h3 className="text-xs font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <Filter size={15} className="text-indigo-500" />
          Filter Generation Scope
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Department Filter (Universal) */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase">Department</label>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Employee Filter (Universal) */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase">Employee</label>
            <select
              value={empFilter}
              onChange={e => setEmpFilter(e.target.value)}
              style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Employees</option>
              {employees
                .filter(e => deptFilter === 'All' || e.department === deptFilter)
                .map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
            </select>
          </div>

          {/* Attendance and Leave Date Filters */}
          {activeReport !== 'payroll' ? (
            <>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full text-xs px-3 py-2 rounded-xl border outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full text-xs px-3 py-2 rounded-xl border outline-none focus:border-indigo-500"
                />
              </div>
            </>
          ) : (
            // Payroll Month Filter
            <>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Payroll Month</label>
                <input
                  type="month"
                  value={payrollMonth}
                  onChange={e => setPayrollMonth(e.target.value)}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full text-xs px-3 py-2 rounded-xl border outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Payment Status</label>
                <select
                  value={payrollStatusFilter}
                  onChange={e => setPayrollStatusFilter(e.target.value)}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </>
          )}

          {/* Conditional Filters for Leaves */}
          {activeReport === 'leaves' && (
            <>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Leave Type</label>
                <select
                  value={leaveTypeFilter}
                  onChange={e => setLeaveTypeFilter(e.target.value)}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="Casual">Casual</option>
                  <option value="Sick">Sick</option>
                  <option value="Annual">Annual</option>
                  <option value="Maternity">Maternity</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Leave Stage Status</label>
                <select
                  value={leaveStatusFilter}
                  onChange={e => setLeaveStatusFilter(e.target.value)}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Stages</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* GENERATED DATA RENDERED TABLES */}
      <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border overflow-hidden">
        {activeReport === 'attendance' && (
          <div className="overflow-x-auto">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Employee Details</th>
                  <th>Department</th>
                  <th>Scheduled Days</th>
                  <th>Present / Late / Half / Absent</th>
                  <th>Total Hours</th>
                  <th className="text-right">Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-bold" style={{ color: 'var(--foreground)' }}>
                      {row.name}
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{row.id}</span>
                    </td>
                    <td className="px-5 py-4" style={{ color: 'var(--foreground)' }}>
                      {row.department}
                    </td>
                    <td className="px-5 py-4 font-semibold" style={{ color: 'var(--foreground)' }}>
                      {row.totalDays} Days
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5 font-medium text-[11px]">
                        <span className="text-emerald-500">{row.presentDays}P</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-amber-500">{row.lateDays}L</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-sky-500">{row.halfDays}H</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-red-500">{row.absentDays}A</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium" style={{ color: 'var(--foreground)' }}>
                      {row.totalHours} Hrs
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        row.attendanceRate >= 90 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                          : row.attendanceRate >= 75 
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' 
                            : 'bg-red-50 text-red-500 dark:bg-red-950/20'
                      }`}>
                        {row.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
                {attendanceData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-400">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'leaves' && (
          <div className="overflow-x-auto">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Employee Details</th>
                  <th>Leave Type</th>
                  <th>Duration Range</th>
                  <th>Days</th>
                  <th>Reason Description</th>
                  <th className="text-right">Stage Status</th>
                </tr>
              </thead>
              <tbody>
                {leaveData.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-bold" style={{ color: 'var(--foreground)' }}>
                      {row.employeeName}
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{row.department}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>
                      {row.type}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-500">
                      {row.from} to {row.to}
                    </td>
                    <td className="px-5 py-4 font-bold" style={{ color: 'var(--foreground)' }}>
                      {row.days}
                    </td>
                    <td className="px-5 py-4 text-slate-400 max-w-xs truncate">
                      {row.reason}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        row.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                          : row.status === 'rejected'
                            ? 'bg-red-50 text-red-500 dark:bg-red-950/20'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                      }`}>
                        {row.status === 'approved' && <CheckCircle size={10} />}
                        {row.status === 'rejected' && <XCircle size={10} />}
                        {row.status === 'pending' && <AlertCircle size={10} />}
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {leaveData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-400">
                      No leave requests found for current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'payroll' && (
          <div className="overflow-x-auto">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Employee Details</th>
                  <th>Department</th>
                  <th>Payroll Month</th>
                  <th>Basic + HRA + Allowances</th>
                  <th>Deductions + Tax</th>
                  <th className="text-right">Net Salary</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-bold" style={{ color: 'var(--foreground)' }}>
                      {row.employeeName}
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{row.employeeId}</span>
                    </td>
                    <td className="px-5 py-4" style={{ color: 'var(--foreground)' }}>
                      {row.department}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-400">
                      {row.month}
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ color: 'var(--foreground)' }} className="font-semibold">₹{row.basic?.toLocaleString('en-IN') || 0}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">+{row.hra?.toLocaleString('en-IN') || 0} HRA / +{row.allowances?.toLocaleString('en-IN') || 0} Allow</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-red-500 font-semibold">-₹{row.deductions?.toLocaleString('en-IN') || 0}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">-₹{row.tax?.toLocaleString('en-IN') || 0} Tax</span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                      ₹{row.net?.toLocaleString('en-IN') || 0}
                      <span className={`block text-[9px] font-extrabold uppercase mt-0.5 tracking-wider ${
                        row.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
                {payrollData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-400">
                      No payroll costings generated for this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )

  // Clear filters helper on report change
  function setActiveTabFilters() {
    setDeptFilter('All')
    setEmpFilter('All')
  }
}
