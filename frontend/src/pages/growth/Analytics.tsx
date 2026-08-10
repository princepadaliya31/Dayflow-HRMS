import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { BarChart2, Users, DollarSign, Calendar, FileText, Download, Briefcase, TrendingUp, ChevronDown } from 'lucide-react'

export default function Analytics() {
  const { employees, payrollRecords, attendanceRecords, leaveRequests, departments } = useAuth()
  const [activeTab, setActiveTab] = useState<'workforce' | 'financials' | 'attendance'>('workforce')
  const [selectedDept, setSelectedDept] = useState<string>('All')
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [cycleCount, setCycleCount] = useState<number>(6)

  // Filter employees based on selected department
  const filteredEmployees = selectedDept === 'All' 
    ? employees 
    : employees.filter(emp => emp.department === selectedDept)

  // Calculate numbers
  const totalEmployeesCount = filteredEmployees.length
  const activeCount = filteredEmployees.filter(e => e.status === 'active').length
  const onLeaveCount = filteredEmployees.filter(e => e.status === 'on-leave').length

  const totalPayrollCost = payrollRecords
    .filter(rec => selectedDept === 'All' || rec.department === selectedDept)
    .reduce((sum, rec) => sum + rec.net, 0)

  const averageSalary = totalEmployeesCount > 0
    ? Math.round(filteredEmployees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / totalEmployeesCount)
    : 0

  // Seed trend data for payroll expenses (Mock last 8 months)
  const monthlyExpensesSeed = [
    { month: 'Jan 2026', cost: 360000 },
    { month: 'Feb 2026', cost: 390000 },
    { month: 'Mar 2026', cost: 420000 },
    { month: 'Apr 2026', cost: 460000 },
    { month: 'May 2026', cost: 510000 },
    { month: 'Jun 2026', cost: 540000 },
    { month: 'Jul 2026', cost: 580000 },
    { month: 'Aug 2026', cost: 620000 },
  ]

  // Slice to active period selection
  const monthlyExpenses = monthlyExpensesSeed.slice(-cycleCount)
  const maxExpense = Math.max(...monthlyExpenses.map(m => m.cost))

  // Department filtered leaves and attendance
  const filteredLeaves = leaveRequests.filter(l => selectedDept === 'All' || l.department === selectedDept)
  const totalLeavesApproved = filteredLeaves.filter(l => l.status === 'approved').length
  const totalLeavesPending = filteredLeaves.filter(l => l.status === 'pending').length

  const filteredAttendance = attendanceRecords.filter(a => selectedDept === 'All' || a.department === selectedDept)
  const totalLogged = filteredAttendance.length
  const absentLogged = filteredAttendance.filter(a => a.status === 'absent').length
  const attendanceRate = totalLogged > 0 
    ? ((1 - absentLogged / totalLogged) * 100).toFixed(1) 
    : '96.2'

  // Seed Department distributions
  const deptDist = departments.map(d => {
    const count = employees.filter(e => e.department === d.name).length
    return { name: d.name, count, pct: employees.length > 0 ? Math.round((count / employees.length) * 100) : 0 }
  })

  // Export Analytics Summary CSV
  const handleExport = () => {
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Workforce', totalEmployeesCount],
      ['Active Employees', activeCount],
      ['On Leave Employees', onLeaveCount],
      ['Total Net Payroll Expense', `INR ${totalPayrollCost}`],
      ['Average Monthly Salary', `INR ${averageSalary}`],
      ['Approved Leaves', totalLeavesApproved],
      ['Pending Leaves', totalLeavesPending],
    ]

    const csvContent = "data:text/csv;charset=utf-8," 
      + summaryData.map(e => e.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Dayflow_HR_Analytics_${selectedDept}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-wide" style={{ color: 'var(--foreground)' }}>Analytics & Reports</h2>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Deep-dive into employee count, finance sheets and stats</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {activeTab === 'attendance' && (
            <div className="flex items-center gap-1.5 text-xs font-semibold mr-2 animate-fade-in">
              <span style={{ color: 'var(--muted-foreground)' }}>Department:</span>
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                className="px-3 py-2 rounded-xl border outline-none text-xs cursor-pointer focus:border-indigo-500 transition-colors"
              >
                <option value="All">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={handleExport}
            className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download size={14} />
            Export CSV Summary
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
        {[
          { id: 'workforce', label: 'Workforce Stats', icon: <Users size={14} /> },
          { id: 'financials', label: 'Financials & Payroll', icon: <DollarSign size={14} /> },
          { id: 'attendance', label: 'Attendance & Leaves', icon: <Calendar size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any)
              if (tab.id !== 'attendance') {
                setSelectedDept('All')
              }
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id ? 'bg-indigo-500 text-white' : 'hover:bg-indigo-500/5'
            }`}
            style={activeTab !== tab.id ? { color: 'var(--foreground)' } : {}}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Workforce statistics tab */}
      {activeTab === 'workforce' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Users size={22} />
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{totalEmployeesCount}</p>
                <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Total Workforce Size</p>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Briefcase size={22} />
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-500">{activeCount}</p>
                <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Active Members</p>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Calendar size={22} />
              </div>
              <div>
                <p className="text-lg font-bold text-amber-500">{onLeaveCount}</p>
                <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>On Leave Duty</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Department Headcount Share */}
            <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-5 space-y-4">
              <h3 className="font-semibold text-sm border-b pb-3" style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}>Department Share Breakdown</h3>
              <div className="space-y-4">
                {deptDist.map(d => (
                  <div key={d.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span style={{ color: 'var(--foreground)' }}>{d.name}</span>
                      <span style={{ color: 'var(--muted-foreground)' }}>{d.count} Employees ({d.pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${d.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employment Status Overview */}
            <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-5 space-y-4">
              <h3 className="font-semibold text-sm border-b pb-3" style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}>Employment Status Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div style={{ backgroundColor: 'var(--muted)' }} className="rounded-xl p-4 text-center">
                  <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Active Utilization</p>
                  <p className="text-xl font-black text-emerald-500 mt-2">
                    {totalEmployeesCount > 0 ? Math.round((activeCount / totalEmployeesCount) * 100) : 0}%
                  </p>
                  <p className="text-[9px] mt-1" style={{ color: 'var(--muted-foreground)' }}>Currently on duty</p>
                </div>
                <div style={{ backgroundColor: 'var(--muted)' }} className="rounded-xl p-4 text-center">
                  <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Leave Overhead</p>
                  <p className="text-xl font-black text-amber-500 mt-2">
                    {totalEmployeesCount > 0 ? Math.round((onLeaveCount / totalEmployeesCount) * 100) : 0}%
                  </p>
                  <p className="text-[9px] mt-1" style={{ color: 'var(--muted-foreground)' }}>Currently off duty</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financials and Payroll costs tab */}
      {activeTab === 'financials' && (() => {
        const totalSixCycles = monthlyExpenses.reduce((acc, curr) => acc + curr.cost, 0)
        const avgSixCycles = Math.round(totalSixCycles / monthlyExpenses.length)
        const firstCycle = monthlyExpenses[0].cost
        const lastCycle = monthlyExpenses[monthlyExpenses.length - 1].cost
        const growthPct = (((lastCycle - firstCycle) / firstCycle) * 100).toFixed(1)

        const firstCycleMonth = monthlyExpenses[0].month.split(' ')[0]
        const lastCycleMonth = monthlyExpenses[monthlyExpenses.length - 1].month.split(' ')[0]

        // Dynamic bounds calculation based on selected range
        const costs = monthlyExpenses.map(m => m.cost)
        const minCost = Math.min(...costs)
        const maxCost = Math.max(...costs)

        const tempCeil = Math.ceil(maxCost / 50000) * 50000
        const tempFloor = Math.floor(minCost / 50000) * 50000
        const floor = tempCeil === tempFloor ? tempFloor - 50000 : tempFloor
        const ceiling = tempCeil === tempFloor ? tempCeil + 50000 : tempCeil
        const yRange = ceiling - floor

        // Generate 7 scale ticks
        const yTicks: number[] = []
        for (let i = 0; i <= 6; i++) {
          yTicks.push(ceiling - (i * yRange) / 6)
        }

        // Calculate coordinates dynamically in percentages (0-100)
        const points = monthlyExpenses.map((item, idx) => {
          const x = 5 + (idx / (monthlyExpenses.length - 1)) * 90
          const y = 10 + (1 - (item.cost - floor) / yRange) * 80
          return { x, y, month: item.month, cost: item.cost }
        })

        // Create path command (normalized coordinates 0-100)
        const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
        
        // Area gradient path command
        const areaPath = `${linePath} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <DollarSign size={22} />
                </div>
                <div>
                  <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>₹{totalPayrollCost.toLocaleString('en-IN')}</p>
                  <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Selected Department Net Payouts</p>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>₹{averageSalary.toLocaleString('en-IN')}</p>
                  <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Average Monthly Salary</p>
                </div>
              </div>
            </div>

            {/* Month-on-Month Expense Trend */}
            <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Gross payout — {lastCycleMonth} {monthlyExpenses[monthlyExpenses.length - 1].month.split(' ')[1]}</p>
                  <h3 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>₹{(lastCycle / 100000).toFixed(1)}L</h3>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={cycleCount}
                    onChange={e => setCycleCount(Number(e.target.value))}
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="px-3 py-2 rounded-xl border outline-none text-xs font-semibold cursor-pointer"
                  >
                    <option value={4}>4 Cycles</option>
                    <option value={6}>6 Cycles</option>
                    <option value={8}>8 Cycles</option>
                  </select>
                  <div className="bg-emerald-500/10 text-emerald-500 text-xs font-bold px-2.5 py-2 rounded-lg flex items-center gap-1">
                    <span>↗</span>
                    <span>6.9% vs Jul</span>
                  </div>
                </div>
              </div>

              {/* Chart Grid Wrapper */}
              <div className="flex gap-4 pt-4 relative">
                {/* Y-Axis scale labels */}
                <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-slate-400 h-48 w-12 text-right pr-2 select-none">
                  {yTicks.map((val, idx) => (
                    <span key={idx}>₹{Math.round(val / 1000)}k</span>
                  ))}
                </div>

                {/* Chart container area */}
                <div className="flex-1 relative h-48">
                  {/* Horizontal background grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="border-t w-full" style={{ borderColor: 'var(--border)', opacity: 0.25 }}></div>
                    ))}
                  </div>

                  {/* SVG Area and Line paths */}
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Filled Gradient Area */}
                    <path
                      d={areaPath}
                      fill="url(#chartGradient)"
                      stroke="none"
                    />

                    {/* Smooth line */}
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>

                  {/* HTML Dot Indicators to avoid SVG oval stretch */}
                  {points.map((p, idx) => {
                    const isHovered = hoveredPoint === idx
                    return (
                      <div
                        key={idx}
                        className="absolute w-2.5 h-2.5 rounded-full border border-white cursor-pointer transition-all duration-150 z-20"
                        style={{
                          left: `${p.x}%`,
                          top: `${p.y}%`,
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: isHovered ? '#3b82f6' : '#2563eb',
                          boxShadow: isHovered ? '0 0 0 6px rgba(59, 130, 246, 0.2)' : 'none',
                        }}
                        onMouseEnter={() => setHoveredPoint(idx)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    )
                  })}

                  {/* Hover Tooltip Popup Card */}
                  {hoveredPoint !== null && (
                    <div 
                      className="absolute bg-slate-900 text-white text-[10px] px-3 py-2 rounded-lg shadow-xl pointer-events-none z-30 flex flex-col gap-0.5 border border-slate-700 w-28 text-center transition-all duration-150"
                      style={{ 
                        left: `${points[hoveredPoint].x}%`,
                        transform: 'translateX(-50%)',
                        bottom: `calc(100% - ${points[hoveredPoint].y - 8}%)` 
                      }}
                    >
                      <span className="font-semibold text-slate-400">{points[hoveredPoint].month}</span>
                      <span className="font-bold text-indigo-300">₹{points[hoveredPoint].cost.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {/* X-Axis month labels positioned dynamically */}
                  <div className="absolute top-[105%] left-0 right-0 h-6 flex justify-between text-[10px] font-semibold text-slate-400">
                    {monthlyExpenses.map((item, idx) => (
                      <span 
                        key={item.month} 
                        style={{ 
                          position: 'absolute', 
                          left: `${5 + (idx / (monthlyExpenses.length - 1)) * 90}%`, 
                          transform: 'translateX(-50%)' 
                        }}
                      >
                        {item.month.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics summary card */}
            <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x overflow-hidden">
              <div className="p-5 space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{cycleCount}-cycle avg</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>₹{Math.round(avgSixCycles / 1000)}k</p>
              </div>
              
              <div className="p-5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total ({cycleCount} cycles)</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>₹{(totalSixCycles / 100000).toFixed(1)}L</p>
                </div>
              </div>

              <div className="p-5 space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Growth ({firstCycleMonth} → {lastCycleMonth})</p>
                <p className="text-2xl font-bold text-emerald-500">+{growthPct}%</p>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Attendance and Leave logs tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Calendar size={22} />
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{attendanceRate}%</p>
                <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{selectedDept === 'All' ? 'Company Attendance Rate' : `${selectedDept} Attendance Rate`}</p>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <FileText size={22} />
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-500">{totalLeavesApproved}</p>
                <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Approved Leave Requests</p>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Calendar size={22} />
              </div>
              <div>
                <p className="text-lg font-bold text-amber-500">{totalLeavesPending}</p>
                <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Pending Review Leaves</p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-5 space-y-6">
            <h3 className="font-semibold text-sm border-b pb-3" style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}>Leave Status Overhead</h3>
            <div className="space-y-6">
              {/* Approved Requests Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span style={{ color: 'var(--foreground)' }}>Approved Timeoff requests</span>
                  <span style={{ color: 'var(--muted-foreground)' }}>{totalLeavesApproved} Requests</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden border border-slate-200/20 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${filteredLeaves.length > 0 ? (totalLeavesApproved / filteredLeaves.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Pending Requests Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span style={{ color: 'var(--foreground)' }}>Pending Decision requests</span>
                  <span style={{ color: 'var(--muted-foreground)' }}>{totalLeavesPending} Requests</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden border border-slate-200/20 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${filteredLeaves.length > 0 ? (totalLeavesPending / filteredLeaves.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
