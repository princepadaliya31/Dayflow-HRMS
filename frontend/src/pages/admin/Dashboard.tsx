import StatsCard from '../../components/ui/StatsCard'
import { useAuth } from '../../context/AuthContext'
import { Users, Clock, CalendarOff, DollarSign, UserCheck, Loader2 } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const DEPT_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#93c5fd', '#60a5fa']

export default function AdminDashboard() {
  const { leaveRequests, dashboardStats } = useAuth()

  if (!dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    )
  }

  const { metrics, charts } = dashboardStats

  const adminStats = [
    { 
      label: 'Total Employees', 
      value: metrics.totalEmployees, 
      icon: <Users size={18} className="text-indigo-500" />, 
      color: 'bg-indigo-500/10',
      tooltipContent: metrics.totalEmployeesBreakdown ? `${metrics.totalEmployeesBreakdown.employees} Employees, ${metrics.totalEmployeesBreakdown.hr} HR` : undefined
    },
    { label: 'Attendance Rate', value: `${metrics.attendanceRate}%`, icon: <UserCheck size={18} className="text-emerald-500" />, color: 'bg-emerald-500/10' },
    { label: 'Pending Leaves', value: metrics.pendingLeaves, icon: <CalendarOff size={18} className="text-amber-500" />, color: 'bg-amber-500/10' },
    { label: 'Monthly Payroll', value: `₹${metrics.monthlyExpense.toLocaleString('en-IN')}`, icon: <DollarSign size={18} className="text-purple-500" />, color: 'bg-purple-500/10' },
    { 
      label: 'On Leave Today', 
      value: metrics.onLeaveEmployees, 
      icon: <Clock size={18} className="text-sky-500" />, 
      color: 'bg-sky-500/10',
      tooltipContent: metrics.onLeaveEmployeesBreakdown ? `${metrics.onLeaveEmployeesBreakdown.employees} Employees, ${metrics.onLeaveEmployeesBreakdown.hr} HR` : undefined
    },
    { 
      label: 'Active Staff', 
      value: metrics.activeEmployees, 
      icon: <UserCheck size={18} className="text-teal-500" />, 
      color: 'bg-teal-500/10',
      tooltipContent: metrics.activeEmployeesBreakdown ? `${metrics.activeEmployeesBreakdown.employees} Employees, ${metrics.activeEmployeesBreakdown.hr} HR` : undefined
    },
  ]

  const recentLeaves = leaveRequests.slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {adminStats.map((s, i) => (
          <StatsCard key={i} label={s.label} value={s.value} icon={s.icon} color={s.color} tooltipContent={s.tooltipContent} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance chart */}
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-5">
          <p className="font-semibold text-sm mb-4" style={{ color: 'var(--foreground)' }}>Attendance This Week</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts.attendanceChartData} barSize={20} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="present" fill="#6366f1" radius={[4, 4, 0, 0]} name="Present" />
              <Bar dataKey="absent" fill="#f87171" radius={[4, 4, 0, 0]} name="Absent" />
              <Bar dataKey="late" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Late" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Salary trend */}
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-5">
          <p className="font-semibold text-sm mb-4" style={{ color: 'var(--foreground)' }}>Payroll Trend (2026)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={charts.salaryChartData}>
              <defs>
                <linearGradient id="salGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 100000).toFixed(0)}L`} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v) => [`₹${(v as number).toLocaleString('en-IN')}`, 'Total Paid']} />
              <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fill="url(#salGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dept distribution */}
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-5">
          <p className="font-semibold text-sm mb-4" style={{ color: 'var(--foreground)' }}>Dept Distribution</p>
          {charts.deptDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={charts.deptDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {charts.deptDistribution.map((_: any, i: number) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {charts.deptDistribution.slice(0, 4).map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                    <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{d.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-center py-12" style={{ color: 'var(--muted-foreground)' }}>No department records.</p>
          )}
        </div>

        {/* Recent leave requests */}
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-5 lg:col-span-2">
          <p className="font-semibold text-sm mb-4" style={{ color: 'var(--foreground)' }}>Recent Leave Requests</p>
          <div className="space-y-2">
            {recentLeaves.map(req => (
              <div key={req.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-xs font-bold">
                    {req.employeeName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{req.employeeName}</p>
                    <p className="text-xs capitalize" style={{ color: 'var(--muted-foreground)' }}>{req.type} · {req.days} day{req.days > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize
                  ${req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                    req.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                    'bg-amber-500/10 text-amber-600'}`}>
                  {req.status}
                </span>
              </div>
            ))}
            {recentLeaves.length === 0 && (
              <p className="text-xs text-center py-8" style={{ color: 'var(--muted-foreground)' }}>No leave requests found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
