import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Search, Filter, Plus, Trash2, X, Calendar, MapPin, ChevronLeft, ChevronRight, Grid, List } from 'lucide-react'
import type { Holiday } from '../types'

const typeColors = {
  public: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
  company: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
}

export default function HolidaysPage() {
  const { user, holidays, addHoliday, deleteHoliday, refreshAllData } = useAuth()
  
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'public' | 'company'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeView, setActiveView] = useState<'calendar' | 'list'>('calendar')
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 7, 1)) // Default to August 2026
  const [selectedDay, setSelectedDay] = useState<number | null>(null) // Default to no selected day

  useEffect(() => {
    refreshAllData()
  }, [])
  
  // Add Form State
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'public' as 'public' | 'company',
    description: '',
  })

  const filteredHolidays = holidays.filter(h => {
    const matchSearch = h.title.toLowerCase().includes(search.toLowerCase()) || 
      (h.description || '').toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || h.type === typeFilter
    return matchSearch && matchType
  })

  // Group holidays by month
  const getMonthName = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('default', { month: 'long', year: 'numeric' })
    } catch {
      return 'Other'
    }
  }

  const getDayOfWeek = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('default', { weekday: 'long' })
    } catch {
      return ''
    }
  }

  const getFormattedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('default', { day: 'numeric', month: 'short' })
    } catch {
      return dateStr
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.date) {
      alert('Title and Date are required')
      return
    }

    try {
      await addHoliday(formData)
      setShowAddModal(false)
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        type: 'public',
        description: '',
      })
    } catch (err: any) {
      alert(err.message || 'Failed to add holiday')
    }
  }

  const handleDeleteHoliday = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteHoliday(id)
      } catch (err: any) {
        alert(err.message || 'Failed to delete holiday')
      }
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border w-full max-w-sm">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search holidays..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ color: 'var(--foreground)' }}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          
          <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border">
            <Filter size={14} className="text-slate-400" />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              style={{ color: 'var(--foreground)', backgroundColor: 'transparent' }}
              className="border-none outline-none text-xs font-semibold cursor-pointer"
            >
              <option value="all">All Holiday Types</option>
              <option value="public">Public Holidays</option>
              <option value="company">Company Events</option>
            </select>
          </div>

          {/* View Toggle */}
          <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="flex items-center rounded-xl border p-1 gap-1">
            <button
              onClick={() => setActiveView('calendar')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${activeView === 'calendar' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-600'}`}
              title="Calendar View"
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${activeView === 'list' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-lg shadow-indigo-500/10"
          >
            <Plus size={16} />
            Add Holiday
          </button>
        )}
      </div>

      {/* Holiday Content Grid/List */}
      {activeView === 'calendar' ? (
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-2xl border p-6 flex flex-col">
          {/* Calendar Month Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-xl" style={{ color: 'var(--foreground)' }}>
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                Select a day to view or edit holiday descriptions
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
                  setSelectedDay(null)
                }}
                className="p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => {
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
                  setSelectedDay(null)
                }}
                className="p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekdays Header */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-2.5">
            {(() => {
              const year = currentMonth.getFullYear()
              const month = currentMonth.getMonth()
              const firstDayIndex = new Date(year, month, 1).getDay()
              const totalDays = new Date(year, month + 1, 0).getDate()
              
              const cells = []
              // Empty cells
              for (let i = 0; i < firstDayIndex; i++) {
                cells.push(<div key={`empty-${i}`} className="min-h-[105px] border border-transparent"></div>)
              }
              
              // Day cells
              for (let day = 1; day <= totalDays; day++) {
                const yyyy = year
                const mm = String(month + 1).padStart(2, '0')
                const dd = String(day).padStart(2, '0')
                const dateStr = `${yyyy}-${mm}-${dd}`
                
                const dayHolidays = holidays.filter(h => {
                  if (!h.date) return false
                  return h.date === dateStr || h.date.startsWith(dateStr)
                })
                
                const isSelected = selectedDay === day
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
                
                cells.push(
                  <div
                    key={`day-${day}`}
                    onClick={() => setSelectedDay(day)}
                    style={{ 
                      borderColor: isSelected 
                        ? '#6366f1' 
                        : isToday
                          ? 'rgba(99, 102, 241, 0.4)'
                          : 'var(--border)',
                    }}
                    className={`min-h-[105px] rounded-xl border flex flex-col justify-between p-2 cursor-pointer transition-all hover:bg-indigo-500/5 relative select-none ${
                      isSelected 
                        ? 'ring-2 ring-indigo-500/30 bg-indigo-500/5' 
                        : isToday 
                          ? 'bg-indigo-500/5' 
                          : 'bg-transparent'
                    }`}
                  >
                    {/* Day number & today marker */}
                    <div className="flex items-center justify-between">
                      <span 
                        className={`text-xs font-bold ${
                          isSelected || isToday
                            ? 'text-indigo-600 dark:text-indigo-400' 
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {day}
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" title="Today" />
                      )}
                    </div>

                    {/* Events list inside cell */}
                    <div className="flex flex-col gap-1 mt-1.5 w-full overflow-hidden">
                      {dayHolidays.map(h => {
                        const isCompany = h.type === 'company'
                        return (
                          <div 
                            key={h.id}
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold truncate text-left w-full border shadow-sm ${
                              isCompany 
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-500/20 border-l-2 border-l-indigo-500' 
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-500/20 border-l-2 border-l-emerald-500'
                            }`}
                            title={`${h.title} (${h.type === 'company' ? 'Company Event' : 'Public Holiday'})`}
                          >
                            {h.title}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              }
              return cells
            })()}
          </div>

          {/* Selected Date Details Panel (Rendered underneath full width calendar if day has events) */}
          {selectedDay && (() => {
            const yyyy = currentMonth.getFullYear()
            const mm = String(currentMonth.getMonth() + 1).padStart(2, '0')
            const dd = String(selectedDay).padStart(2, '0')
            const dateStr = `${yyyy}-${mm}-${dd}`
            const dayHolidays = holidays.filter(h => h.date === dateStr || h.date.startsWith(dateStr))
            
            if (dayHolidays.length === 0) return null;
            
            return (
              <div 
                className="mt-6 p-4 rounded-xl border flex flex-col gap-3"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
              >
                <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
                  <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                    Schedules for {new Date(yyyy, currentMonth.getMonth(), selectedDay).toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <button 
                    onClick={() => setSelectedDay(null)}
                    style={{ color: 'var(--muted-foreground)' }}
                    className="hover:text-red-500 text-xs transition-colors cursor-pointer"
                  >
                    Close Details
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dayHolidays.map(h => (
                    <div 
                      key={h.id} 
                      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} 
                      className="p-4 rounded-xl border flex flex-col gap-2 relative shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold capitalize ${typeColors[h.type]}`}>
                          {h.type === 'company' ? 'Company Event' : 'Public Holiday'}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteHoliday(h.id, h.title)}
                            className="text-red-500 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <h4 className="font-bold text-xs" style={{ color: 'var(--foreground)' }}>{h.title}</h4>
                      {h.description && (
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{h.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      ) : (
        filteredHolidays.length === 0 ? (
          <div 
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} 
            className="rounded-2xl border p-12 text-center flex flex-col items-center justify-center min-h-[300px]"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-4">
              <Calendar size={32} />
            </div>
            <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--foreground)' }}>No holidays found</h3>
            <p className="text-sm max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
              There are no holidays matching your search criteria or registered in the calendar.
            </p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottomColor: 'var(--border)', backgroundColor: 'var(--muted)' }} className="border-b">
                    {['Holiday Title', 'Date', 'Day', 'Type', 'Description', isAdmin ? 'Actions' : ''].filter(Boolean).map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ color: 'var(--foreground)' }} className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredHolidays.map((holiday) => (
                    <tr key={holiday.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-sm">
                            {holiday.title.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{holiday.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium font-mono text-sm">{getFormattedDate(holiday.date)}</td>
                      <td className="px-5 py-4 text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{getDayOfWeek(holiday.date)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${typeColors[holiday.type]}`}>
                          {holiday.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {holiday.description || 'No description provided'}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleDeleteHoliday(holiday.id, holiday.title)}
                            className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50/50 transition-colors cursor-pointer"
                            title="Delete Holiday"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
              <p className="text-xs">Total Scheduled: <strong>{filteredHolidays.length}</strong> holidays</p>
            </div>
          </div>
        )
      )}

      {/* Add Holiday Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            className="rounded-2xl border w-full max-w-md p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>Add New Holiday</h2>
              <button 
                onClick={() => setShowAddModal(false)} 
                style={{ color: 'var(--muted-foreground)' }} 
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="font-medium text-xs" style={{ color: 'var(--muted-foreground)' }}>Holiday Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day, New Year"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-medium text-xs" style={{ color: 'var(--muted-foreground)' }}>Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-xs" style={{ color: 'var(--muted-foreground)' }}>Holiday Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="public">Public Holiday</option>
                    <option value="company">Company Event</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-xs" style={{ color: 'var(--muted-foreground)' }}>Description (Optional)</label>
                <textarea
                  placeholder="e.g. National holiday celebrating independence"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
