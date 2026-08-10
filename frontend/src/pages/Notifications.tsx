import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Bell, Check, Trash2, CheckCircle, Info, Megaphone, AlertTriangle, BellRing, Plus, X, Star, Eye, ShieldAlert, Award, FileText, CheckCircle2, Bookmark } from 'lucide-react'

interface ReadReceipt {
  employeeName: string
  acknowledgedAt: string
}

interface NotificationItem {
  id: string
  title: string
  message: string
  time?: string
  read: boolean
  type: 'info' | 'warning' | 'success' | 'alert' | 'announcement'
  createdAt?: string
  requiresAcknowledgment?: boolean
  acknowledged?: boolean
  acknowledgedAt?: string
  targetAudience?: string
  starred?: boolean
  author?: string
  receipts?: ReadReceipt[]
}

export default function Notifications() {
  const { user, notifications: contextNotifications } = useAuth()
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>([])
  const [filter, setFilter] = useState<'all' | 'action' | 'starred' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Selected notification for Detail Modal
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null)

  // Announcement Modal Form State
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [newType, setNewType] = useState<'info' | 'warning' | 'success' | 'alert' | 'announcement'>('announcement')
  const [requiresAck, setRequiresAck] = useState(false)
  const [audience, setAudience] = useState('All Employees')

  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr'

  // Sync state with context notifications or local storage persistence
  useEffect(() => {
    const saved = localStorage.getItem('dayflow_local_notifications')
    if (saved) {
      setLocalNotifications(JSON.parse(saved))
    } else {
      // Seed default notification values if empty
      const defaults: NotificationItem[] = [
        { 
          id: 'n1', 
          title: 'System Maintenance Scheduled', 
          message: 'Dayflow database upgrade is scheduled for Sunday, August 16th, at 02:00 AM IST. Expect up to 15 mins of downtime.', 
          time: '2 hours ago', 
          read: false, 
          type: 'warning', 
          requiresAcknowledgment: true,
          acknowledged: false,
          targetAudience: 'All Employees',
          author: 'System Admin',
          starred: false,
          receipts: []
        },
        { 
          id: 'n2', 
          title: 'Annual HR Compliance Acknowledgement', 
          message: 'Please review and acknowledge the updated Employee Handbook for the fiscal year 2026-2027.', 
          time: '1 day ago', 
          read: false, 
          type: 'announcement', 
          requiresAcknowledgment: true,
          acknowledged: false,
          targetAudience: 'All Employees',
          author: 'HR Dept',
          starred: true,
          receipts: []
        },
        { 
          id: 'n3', 
          title: 'Payslip Available', 
          message: 'Your salary payslip for the month of July 2026 has been successfully generated and is ready for download.', 
          time: '2 days ago', 
          read: false, 
          type: 'info',
          requiresAcknowledgment: false,
          targetAudience: 'All Employees',
          author: 'Finance Office',
          starred: false
        },
        { 
          id: 'n4', 
          title: 'Q3 Product Strategy Alignment', 
          message: 'The Q3 engineering and product OKRs alignment document has been published in the documentation drive.', 
          time: '3 days ago', 
          read: true, 
          type: 'success',
          requiresAcknowledgment: false,
          targetAudience: 'Engineering',
          author: 'VP of Product',
          starred: false
        },
      ]
      setLocalNotifications(defaults)
      localStorage.setItem('dayflow_local_notifications', JSON.stringify(defaults))
    }
  }, [contextNotifications])

  // Save changes locally
  const saveToStorage = (updated: NotificationItem[]) => {
    setLocalNotifications(updated)
    localStorage.setItem('dayflow_local_notifications', JSON.stringify(updated))
  }

  // Action helpers
  const handleMarkAsRead = (id: string) => {
    const updated = localNotifications.map(n => n.id === id ? { ...n, read: true } : n)
    saveToStorage(updated)
  }

  const handleMarkAsUnread = (id: string) => {
    const updated = localNotifications.map(n => n.id === id ? { ...n, read: false } : n)
    saveToStorage(updated)
  }

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = localNotifications.map(n => n.id === id ? { ...n, starred: !n.starred } : n)
    saveToStorage(updated)
  }

  const handleAcknowledge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const nowStr = new Date().toLocaleString()
    const updated = localNotifications.map(n => {
      if (n.id === id) {
        // Create read receipt for admin view tracking
        const newReceipt: ReadReceipt = {
          employeeName: user?.name || 'Employee',
          acknowledgedAt: nowStr
        }
        const receiptsList = n.receipts ? [...n.receipts, newReceipt] : [newReceipt]
        return { 
          ...n, 
          acknowledged: true, 
          acknowledgedAt: nowStr,
          read: true,
          receipts: receiptsList
        }
      }
      return n
    })
    saveToStorage(updated)

    // Update current selected modal detail if open
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification(prev => prev ? { ...prev, acknowledged: true, acknowledgedAt: nowStr } : null)
    }
  }

  const handleDelete = (id: string) => {
    if (!isAdminOrHR) return
    const updated = localNotifications.filter(n => n.id !== id)
    saveToStorage(updated)
  }

  const handleMarkAllRead = () => {
    const updated = localNotifications.map(n => ({ ...n, read: true }))
    saveToStorage(updated)
  }

  const handleClearAll = () => {
    if (!isAdminOrHR) return
    if (confirm('Are you sure you want to delete all notifications?')) {
      saveToStorage([])
    }
  }

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdminOrHR) return
    if (!newTitle.trim() || !newMessage.trim()) return

    const newItem: NotificationItem = {
      id: `n_custom_${Date.now()}`,
      title: newTitle,
      message: newMessage,
      time: 'Just now',
      read: false,
      type: newType,
      requiresAcknowledgment: requiresAck,
      acknowledged: false,
      targetAudience: audience,
      author: user?.name || 'Admin',
      starred: false,
      receipts: []
    }

    const updated = [newItem, ...localNotifications]
    saveToStorage(updated)

    // Reset Form
    setNewTitle('')
    setNewMessage('')
    setNewType('announcement')
    setRequiresAck(false)
    setAudience('All Employees')
    setShowAddModal(false)
  }

  // Filtering logs based on chosen tab
  // 1. First filter by user role permissions (who should see what)
  // Keep track of registration alerts to only display the single newest one
  let registrationAlertsShown = 0

  const visibleNotifications = localNotifications.filter(n => {
    const titleLower = (n.title || '').toLowerCase()
    const isRegistration = titleLower.includes('new account') || titleLower.includes('registration alert')

    if (user?.role === 'employee') {
      // Employees should NOT see "New Account Created" or administrative messages
      if (isRegistration) {
        return false
      }
      
      // Target audience check
      if (n.targetAudience && n.targetAudience !== 'All Employees' && n.targetAudience !== user.department) {
        return false
      }
    } else if (user?.role === 'hr') {
      // HR should not see Admin-only target notifications
      if (n.targetAudience === 'Admin') {
        return false
      }
      // Group/deduplicate registration alerts for HR
      if (isRegistration) {
        registrationAlertsShown++
        if (registrationAlertsShown > 1) {
          return false
        }
      }
    } else if (user?.role === 'admin') {
      // Group/deduplicate registration alerts for Admin
      if (isRegistration) {
        registrationAlertsShown++
        if (registrationAlertsShown > 1) {
          return false
        }
      }
    }
    return true
  })

  // 2. Then filter by chosen tab
  const filtered = visibleNotifications.filter(n => {
    let tabMatch = true
    if (filter === 'action') {
      tabMatch = !!n.requiresAcknowledgment && !n.acknowledged
    } else if (filter === 'starred') {
      tabMatch = !!n.starred
    } else if (filter === 'read') {
      tabMatch = n.read
    }

    const typeMatch = typeFilter === 'all' ? true : n.type === typeFilter
    return tabMatch && typeMatch
  })

  // 3. Counters (computed over visible notifications only!)
  const unreadCount = visibleNotifications.filter(n => !n.read).length
  const actionRequiredCount = visibleNotifications.filter(n => n.requiresAcknowledgment && !n.acknowledged).length

  // Icon mapping helper
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
      case 'alert':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
            <AlertTriangle size={18} />
          </div>
        )
      case 'success':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
            <CheckCircle size={18} />
          </div>
        )
      case 'announcement':
        return (
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 flex-shrink-0">
            <Megaphone size={18} />
          </div>
        )
      case 'info':
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 flex-shrink-0">
            <Info size={18} />
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-wide flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            Notifications & Announcements
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                {unreadCount} New
              </span>
            )}
          </h2>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Acknowledge receipts, check compliance guidelines and system announcements</p>
        </div>
        <div className="flex gap-2">
          {/* Add Announcement (Admin/HR Only) */}
          {isAdminOrHR && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus size={14} />
              Publish Announcement
            </button>
          )}

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="border text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <Check size={14} />
              Mark All as Read
            </button>
          )}

          {/* Clear All (Admin/HR Only) */}
          {isAdminOrHR && localNotifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="border text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors hover:text-red-500 hover:border-red-500/30"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <Trash2 size={14} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter and Content Card */}
      <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border overflow-hidden">
        {/* Filter controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All Alerts' },
              { id: 'action', label: `Pending Action (${actionRequiredCount})` },
              { id: 'starred', label: 'Starred' },
              { id: 'read', label: 'Archived / Read' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                  filter === f.id ? 'bg-indigo-500 text-white' : 'bg-indigo-500/5 hover:bg-indigo-500/10'
                }`}
                style={filter !== f.id ? { color: 'var(--foreground)' } : {}}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span style={{ color: 'var(--muted-foreground)' }}>Filter Type:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              className="px-3 py-2 rounded-xl border outline-none text-xs"
            >
              <option value="all">All Types</option>
              <option value="info">System Info</option>
              <option value="warning">Warnings</option>
              <option value="success">Success logs</option>
              <option value="alert">Alerts</option>
              <option value="announcement">Announcements</option>
            </select>
          </div>
        </div>

        {/* Notifications List Log */}
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedNotification(item)}
              className={`p-5 flex items-start gap-4 transition-all hover:bg-indigo-500/[0.01] cursor-pointer ${
                !item.read ? 'bg-indigo-500/[0.02]' : ''
              }`}
            >
              {/* Star toggle */}
              <button
                onClick={(e) => handleToggleStar(item.id, e)}
                className={`self-center p-1 rounded-lg transition-colors ${
                  item.starred ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
                }`}
              >
                <Star size={15} fill={item.starred ? 'currentColor' : 'transparent'} />
              </button>

              {/* Notification Type Icon */}
              {getIcon(item.type)}

              {/* Text content details */}
              <div className="flex-1 space-y-1.5">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-xs font-semibold ${!item.read ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}`}
                      style={item.read ? { color: 'var(--foreground)' } : {}}
                    >
                      {item.title}
                    </h4>
                    {item.requiresAcknowledgment && !item.acknowledged && (
                      <span className="bg-amber-500/10 text-amber-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Requires Acknowledgment
                      </span>
                    )}
                    {item.requiresAcknowledgment && item.acknowledged && (
                      <span className="bg-emerald-500/10 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Receipt Acknowledged
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
                    {item.time || 'recent'}
                  </span>
                </div>
                <p className="text-xs max-w-2xl truncate" style={{ color: 'var(--muted-foreground)' }}>
                  {item.message}
                </p>
                <div className="flex gap-2 text-[10px] text-slate-400">
                  <span>Author: <strong className="font-semibold text-slate-500">{item.author || 'System'}</strong></span>
                  <span>•</span>
                  <span>Target: <strong className="font-semibold text-slate-500">{item.targetAudience || 'All'}</strong></span>
                </div>
              </div>

              {/* Action buttons on hover/side */}
              <div className="flex gap-2 self-center" onClick={e => e.stopPropagation()}>
                {/* Acknowledge Action Button */}
                {item.requiresAcknowledgment && !item.acknowledged && (
                  <button
                    onClick={(e) => handleAcknowledge(item.id, e)}
                    className="bg-amber-500 text-white hover:bg-amber-600 text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Acknowledge
                  </button>
                )}

                {item.read ? (
                  <button
                    onClick={() => handleMarkAsUnread(item.id)}
                    className="p-1.5 rounded-lg border hover:bg-indigo-500/5 transition-colors cursor-pointer text-slate-400 hover:text-indigo-500"
                    style={{ borderColor: 'var(--border)' }}
                    title="Mark as unread"
                  >
                    <BellRing size={13} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="p-1.5 rounded-lg border hover:bg-emerald-500/5 transition-colors cursor-pointer text-slate-400 hover:text-emerald-500"
                    style={{ borderColor: 'var(--border)' }}
                    title="Mark as read"
                  >
                    <Check size={13} />
                  </button>
                )}
                
                {/* Delete button (Admin/HR Only) */}
                {isAdminOrHR && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg border hover:bg-rose-500/5 transition-colors cursor-pointer text-slate-400 hover:text-rose-500"
                    style={{ borderColor: 'var(--border)' }}
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Bell size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>All Caught Up!</h4>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>No notifications match your current filter selection.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 1. View Announcement Details Modal (For All Roles) */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedNotification(null)}>
          <div
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            className="rounded-2xl border w-full max-w-lg p-6 shadow-2xl space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b pb-3.5" style={{ borderColor: 'var(--border)' }}>
              <div className="space-y-1">
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  selectedNotification.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                  selectedNotification.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                  selectedNotification.type === 'announcement' ? 'bg-purple-500/10 text-purple-500' : 'bg-indigo-500/10 text-indigo-500'
                }`}>
                  {selectedNotification.type}
                </span>
                <h3 className="font-bold text-base mt-1" style={{ color: 'var(--foreground)' }}>
                  {selectedNotification.title}
                </h3>
              </div>
              <button onClick={() => setSelectedNotification(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>

            <div className="space-y-4">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>
                {selectedNotification.message}
              </p>

              <div style={{ backgroundColor: 'var(--muted)' }} className="rounded-xl p-3.5 flex flex-wrap justify-between items-center text-xs gap-3">
                <div className="space-y-1">
                  <p style={{ color: 'var(--muted-foreground)' }}>Published By</p>
                  <p className="font-bold" style={{ color: 'var(--foreground)' }}>{selectedNotification.author || 'System Operator'}</p>
                </div>
                <div className="space-y-1">
                  <p style={{ color: 'var(--muted-foreground)' }}>Audience Target</p>
                  <p className="font-bold" style={{ color: 'var(--foreground)' }}>{selectedNotification.targetAudience || 'All Staff'}</p>
                </div>
                <div className="space-y-1">
                  <p style={{ color: 'var(--muted-foreground)' }}>Date Posted</p>
                  <p className="font-mono text-[10px]" style={{ color: 'var(--foreground)' }}>{selectedNotification.time || 'Recent'}</p>
                </div>
              </div>

              {/* Acknowledge receipt action in modal */}
              {selectedNotification.requiresAcknowledgment && (
                <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                  {selectedNotification.acknowledged ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 p-3 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 size={15} />
                        Receipt Acknowledged
                      </div>
                      <span className="text-[10px] font-mono">{selectedNotification.acknowledgedAt}</span>
                    </div>
                  ) : (
                    <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <p className="font-semibold flex items-center gap-1">
                          <Bookmark size={14} />
                          Signature Required
                        </p>
                        <p className="text-[10px] text-amber-500/80">Please acknowledge that you have read this official system announcement.</p>
                      </div>
                      <button
                        onClick={(e) => handleAcknowledge(selectedNotification.id, e)}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer text-center"
                      >
                        Acknowledge Announcement
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Admin/HR Read Receipts Tracking Log */}
              {isAdminOrHR && selectedNotification.requiresAcknowledgment && (
                <div className="border-t pt-4 space-y-2.5" style={{ borderColor: 'var(--border)' }}>
                  <h4 className="font-semibold text-xs text-indigo-500 flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    Employee Read Receipts ({selectedNotification.receipts?.length || 0})
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                    {selectedNotification.receipts && selectedNotification.receipts.length > 0 ? (
                      selectedNotification.receipts.map((rec, index) => (
                        <div key={index} className="flex justify-between text-[11px] py-1 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                          <span className="font-medium" style={{ color: 'var(--foreground)' }}>{rec.employeeName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{rec.acknowledgedAt}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400 text-center py-4">No employees have acknowledged this yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedNotification(null)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-colors shadow-md"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Add Announcement Modal (Admin/HR Only) */}
      {showAddModal && isAdminOrHR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <form
            onSubmit={handleAddAnnouncement}
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            className="rounded-2xl border w-full max-w-md p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Megaphone size={16} className="text-indigo-500" />
                Publish System Announcement
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Server Migration Details"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Announcement Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter details of the system announcement or alert..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Notification Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="info">System Info</option>
                    <option value="warning">System Warning</option>
                    <option value="success">Success log</option>
                    <option value="alert">System Alert</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Target Audience</label>
                  <select
                    value={audience}
                    onChange={e => setAudience(e.target.value)}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="All Employees">All Employees</option>
                    <option value="Engineering">Engineering Only</option>
                    <option value="Design">Design Only</option>
                    <option value="Marketing">Marketing Only</option>
                    <option value="Sales">Sales Only</option>
                    <option value="HR">HR Only</option>
                  </select>
                </div>
              </div>

              {/* Requires Acknowledgment checkbox */}
              <label className="flex items-center gap-2 pt-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={requiresAck}
                  onChange={e => setRequiresAck(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Requires official Employee Acknowledgment receipt</span>
              </label>
            </div>

            <div className="flex gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors cursor-pointer"
              >
                Publish Announcement
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
