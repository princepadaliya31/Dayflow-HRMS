import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Calendar, Download } from 'lucide-react'

const statusColors = {
  present: 'bg-emerald-500/10 text-emerald-600',
  absent: 'bg-red-500/10 text-red-500',
  late: 'bg-amber-500/10 text-amber-600',
  'half-day': 'bg-sky-500/10 text-sky-600',
}

export default function EmployeeAttendance() {
  const { user, attendanceRecords, checkIn, checkOut } = useAuth()
  const [dateFilter, setDateFilter] = useState(new Date().toLocaleDateString('en-CA'))

  const todayStr = new Date().toLocaleDateString('en-CA')
  const todayRecord = attendanceRecords.find(r => r.employeeId === user?.id && r.date === todayStr)

  const clockedIn = !!todayRecord && todayRecord.checkIn !== '--'
  const clockedOut = !!todayRecord && todayRecord.checkOut !== '--'
  const checkInTime = todayRecord?.checkIn || '--'
  const checkOutTime = todayRecord?.checkOut || '--'
  const hoursWorked = todayRecord?.hours || 0

  const handleClockAction = async () => {
    try {
      if (!clockedIn) {
        await checkIn()
      } else if (!clockedOut) {
        await checkOut()
      } else {
        alert('You have already clocked out for today.')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update clock status')
    }
  }

  // Filter records relevant to current employee (match user id or email)
  const myRecords = attendanceRecords.filter(r => r.employeeId === user?.id)
  
  const filteredRecords = myRecords
    .filter(r => {
      if (!dateFilter) return true
      return r.date <= dateFilter
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      alert('No attendance records available to export.')
      return
    }

    const headers = ['Date', 'Check In', 'Check Out', 'Hours worked', 'Status']
    const rows = filteredRecords.map(rec => {
      let formattedDate = rec.date
      try {
        const d = new Date(rec.date)
        if (!isNaN(d.getTime())) {
          const day = String(d.getDate()).padStart(2, '0')
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          const monthName = months[d.getMonth()]
          const year = d.getFullYear()
          formattedDate = `${day}-${monthName}-${year}`
        }
      } catch {}

      return [
        `" ${formattedDate}"`,
        `"${rec.checkIn}"`,
        `"${rec.checkOut}"`,
        `"${rec.hours > 0 ? rec.hours : '--'}"`,
        `"${rec.status || 'present'}"`
      ]
    })

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const exportDate = new Date().toISOString().split('T')[0]
    
    link.setAttribute('href', url)
    link.setAttribute('download', `my_attendance_${exportDate}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* Employee clock-in card */}
      <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Today, {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full ${clockedIn ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-500'}`}>
                <div className={`w-2 h-2 rounded-full ${clockedIn && !clockedOut ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                {clockedIn ? (clockedOut ? `Clocked out at ${checkOutTime}` : `Checked in at ${checkInTime}`) : 'Not checked in'}
              </div>
            </div>
          </div>
          {!clockedOut && (
            <button
              onClick={handleClockAction}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${clockedIn ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
            >
              {clockedIn ? 'Clock Out' : 'Clock In'}
            </button>
          )}
          {clockedOut && (
            <span className="text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-xl border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>Shift Completed</span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            ['Check In', checkInTime],
            ['Check Out', checkOutTime],
            ['Hours', hoursWorked > 0 ? `${hoursWorked} hrs` : '--']
          ].map(([l, v]) => (
            <div key={l} style={{ backgroundColor: 'var(--muted)' }} className="rounded-xl p-3 text-center">
              <p className="text-[11px] uppercase tracking-wide font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>{l}</p>
              <p className="font-mono text-sm font-medium" style={{ color: 'var(--foreground)' }}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and table */}
      <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              style={{ backgroundColor: 'transparent', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              className="text-sm px-3 py-2 rounded-xl border outline-none focus:border-indigo-500"
            />
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 text-sm font-medium text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer">
            <Download size={15} />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottomColor: 'var(--border)', backgroundColor: 'var(--muted)' }} className="border-b">
                {['Date', 'Check In', 'Check Out', 'Hours', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(rec => (
                <tr key={rec.id} className="border-b last:border-0 hover:bg-indigo-500/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-5 py-4 font-mono text-xs font-medium" style={{ color: 'var(--foreground)' }}>{rec.date}</td>
                  <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--foreground)' }}>{rec.checkIn}</td>
                  <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--foreground)' }}>{rec.checkOut}</td>
                  <td className="px-5 py-4 font-mono text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                    {rec.hours > 0 ? `${rec.hours}h` : '--'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[rec.status as keyof typeof statusColors] || 'bg-slate-500/10 text-slate-500'}`}>
                      {(rec.status || '').replace('-', ' ')}
                    </span>
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
