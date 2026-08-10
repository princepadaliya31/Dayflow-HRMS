import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Calendar, Download } from 'lucide-react'

const statusColors = {
  present: 'bg-emerald-500/10 text-emerald-600',
  absent: 'bg-red-500/10 text-red-500',
  late: 'bg-amber-500/10 text-amber-600',
  'half-day': 'bg-sky-500/10 text-sky-600',
}

export default function AdminAttendance() {
  const { attendanceRecords } = useAuth()
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))

  const filtered = attendanceRecords.filter(a => a.date === date)

  const formatDateForCSV = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = parseInt(month, 10) - 1;
    const monthName = months[monthIndex] || month;
    return ` ${day}-${monthName}-${year}`;
  }

  const handleExport = () => {
    if (filtered.length === 0) {
      alert('No attendance records to export')
      return
    }
    const headers = ['Employee Name', 'Department', 'Date', 'Check In', 'Check Out', 'Hours Worked', 'Status']
    const rows = filtered.map(r => [
      `"${r.employeeName || 'Unknown'}"`,
      `"${r.department || '--'}"`,
      `"${formatDateForCSV(r.date)}"`,
      `"${r.checkIn || '--'}"`,
      `"${r.checkOut || '--'}"`,
      r.hours !== undefined ? r.hours : 0,
      `"${r.status || 'unknown'}"`
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
      
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `attendance_records_${date}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* Filters and table */}
      <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ backgroundColor: 'transparent', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              className="text-sm px-3 py-2 rounded-xl border outline-none focus:border-indigo-500"
            />
            {date !== new Date().toLocaleDateString('en-CA') && (
              <button
                onClick={() => setDate(new Date().toLocaleDateString('en-CA'))}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-all cursor-pointer"
              >
                Today
              </button>
            )}
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 text-sm font-medium text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <Download size={15} />
            Export
          </button>
        </div>

        {/* Summary badges */}
        <div className="flex flex-wrap gap-3 px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          {[
            { label: 'Present', count: filtered.filter(a => a.status === 'present').length, color: 'bg-emerald-500/10 text-emerald-600' },
            { label: 'Absent', count: filtered.filter(a => a.status === 'absent').length, color: 'bg-red-500/10 text-red-500' },
            { label: 'Late', count: filtered.filter(a => a.status === 'late').length, color: 'bg-amber-500/10 text-amber-600' },
            { label: 'Half Day', count: filtered.filter(a => a.status === 'half-day').length, color: 'bg-sky-500/10 text-sky-600' },
          ].map(s => (
            <div key={s.label} className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full ${s.color}`}>
              <span className="font-bold">{s.count}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottomColor: 'var(--border)', backgroundColor: 'var(--muted)' }} className="border-b">
                {['Employee', 'Department', 'Check In', 'Check Out', 'Hours', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(rec => (
                <tr key={rec.id} className="border-b last:border-0 hover:bg-indigo-500/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {(rec.employeeName || 'Emp').split(' ').map(n => n[0] || '').join('')}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--foreground)' }}>{rec.employeeName || 'Unknown Employee'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4" style={{ color: 'var(--muted-foreground)' }}>{rec.department || '--'}</td>
                  <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--foreground)' }}>{rec.checkIn || '--'}</td>
                  <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--foreground)' }}>{rec.checkOut || '--'}</td>
                  <td className="px-5 py-4 font-mono text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                    {rec.hours > 0 ? `${rec.hours}h` : '--'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[rec.status as keyof typeof statusColors] || 'bg-slate-500/10 text-slate-500'}`}>
                      {rec.status || 'unknown'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center px-5 py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    No attendance records logged for this date.
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
