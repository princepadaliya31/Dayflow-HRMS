import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Plus, TrendingUp, Target, Award, Star, Calendar, Percent, Trash2, CheckCircle, BarChart2 } from 'lucide-react'

interface Goal {
  id: string
  employeeId: string
  employeeName: string
  title: string
  category: 'Sales' | 'Engineering' | 'Marketing' | 'Design' | 'Learning' | 'General'
  targetDate: string
  progress: number
  status: 'on-track' | 'behind' | 'completed'
}

interface Review {
  id: string
  employeeId: string
  employeeName: string
  reviewerName: string
  cycle: string
  rating: number
  comments: string
  date: string
}

export default function Performance() {
  const { user, employees } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'kpis' | 'reviews'>('overview')
  
  // Goals state with local storage persistence
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('dayflow_goals')
    if (saved) return JSON.parse(saved)
    return [
      { id: 'g1', employeeId: 'E001', employeeName: 'Arjun Mehta', title: 'Deliver Phase 2 of React Frontend migration', category: 'Engineering', targetDate: '2026-08-31', progress: 75, status: 'on-track' },
      { id: 'g2', employeeId: 'E002', employeeName: 'Priya Sharma', title: 'Complete redesign of client settings panel', category: 'Design', targetDate: '2026-08-15', progress: 90, status: 'on-track' },
      { id: 'g3', employeeId: 'E003', employeeName: 'Rohan Das', title: 'Generate 50 high-quality product leads', category: 'Sales', targetDate: '2026-09-30', progress: 40, status: 'behind' },
      { id: 'g4', employeeId: 'E004', employeeName: 'Sneha Patel', title: 'Implement full test coverage for API endpoints', category: 'Engineering', targetDate: '2026-08-20', progress: 100, status: 'completed' },
    ]
  })

  // Reviews state with local storage persistence
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('dayflow_reviews')
    if (saved) return JSON.parse(saved)
    return [
      { id: 'r1', employeeId: 'E001', employeeName: 'Arjun Mehta', reviewerName: 'Admin Manager', cycle: 'Q2 2026', rating: 5, comments: 'Arjun did an exceptional job leading the frontend team migration. Coding standards are excellent.', date: '2026-07-15' },
      { id: 'r2', employeeId: 'E002', employeeName: 'Priya Sharma', reviewerName: 'Admin Manager', cycle: 'Q2 2026', rating: 4, comments: 'Priya shows high aesthetic maturity. Client designs look top-tier. Keep it up!', date: '2026-07-14' },
      { id: 'r3', employeeId: 'E004', employeeName: 'Sneha Patel', reviewerName: 'HR Specialist', cycle: 'Q2 2026', rating: 5, comments: 'Excellent commitment to quality engineering. Added test coverages as requested ahead of time.', date: '2026-07-12' },
    ]
  })

  // Persist states
  useEffect(() => {
    localStorage.setItem('dayflow_goals', JSON.stringify(goals))
  }, [goals])

  useEffect(() => {
    localStorage.setItem('dayflow_reviews', JSON.stringify(reviews))
  }, [reviews])

  // Modals state
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [newGoalForm, setNewGoalForm] = useState({
    employeeId: user?.role === 'employee' ? user.id : '',
    title: '',
    category: 'General' as Goal['category'],
    targetDate: '',
    progress: 0,
  })

  const [isAddingReview, setIsAddingReview] = useState(false)
  const [newReviewForm, setNewReviewForm] = useState({
    employeeId: '',
    cycle: 'Q3 2026',
    rating: 5,
    comments: '',
  })

  const [isUpdatingProgress, setIsUpdatingProgress] = useState<Goal | null>(null)
  const [progressValue, setProgressValue] = useState(0)

  // Filter lists based on role
  const isEmployee = user?.role === 'employee'
  const myGoals = isEmployee ? goals.filter(g => g.employeeId === user.id) : goals
  const myReviews = isEmployee ? reviews.filter(r => r.employeeId === user.id) : reviews

  // Handle forms
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    let empName = user?.name || 'Unknown'
    if (user?.role !== 'employee') {
      const selectedEmp = employees.find(emp => emp.id === newGoalForm.employeeId)
      empName = selectedEmp ? selectedEmp.name : 'Unknown'
    }

    const goalObj: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: newGoalForm.employeeId || user?.id || '',
      employeeName: empName,
      title: newGoalForm.title,
      category: newGoalForm.category,
      targetDate: newGoalForm.targetDate,
      progress: Number(newGoalForm.progress),
      status: Number(newGoalForm.progress) === 100 ? 'completed' : Number(newGoalForm.progress) < 50 ? 'behind' : 'on-track',
    }

    setGoals([goalObj, ...goals])
    setIsAddingGoal(false)
    setNewGoalForm({
      employeeId: user?.role === 'employee' ? user.id : '',
      title: '',
      category: 'General',
      targetDate: '',
      progress: 0,
    })
  }

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedEmp = employees.find(emp => emp.id === newReviewForm.employeeId)
    if (!selectedEmp) {
      alert('Please select a valid employee')
      return
    }

    const reviewObj: Review = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: newReviewForm.employeeId,
      employeeName: selectedEmp.name,
      reviewerName: user?.name || 'Manager',
      cycle: newReviewForm.cycle,
      rating: newReviewForm.rating,
      comments: newReviewForm.comments,
      date: new Date().toISOString().split('T')[0],
    }

    setReviews([reviewObj, ...reviews])
    setIsAddingReview(false)
    setNewReviewForm({
      employeeId: '',
      cycle: 'Q3 2026',
      rating: 5,
      comments: '',
    })
  }

  const handleDeleteGoal = (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter(g => g.id !== id))
    }
  }

  const handleDeleteReview = (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      setReviews(reviews.filter(r => r.id !== id))
    }
  }

  const handleUpdateProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isUpdatingProgress) return

    setGoals(goals.map(g => {
      if (g.id === isUpdatingProgress.id) {
        return {
          ...g,
          progress: progressValue,
          status: progressValue === 100 ? 'completed' : progressValue < 50 ? 'behind' : 'on-track',
        }
      }
      return g
    }))
    setIsUpdatingProgress(null)
  }

  // Calculate Metrics
  const averageRating = myReviews.length > 0 
    ? (myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1)
    : '5.0'

  const overallGoalProgress = myGoals.length > 0
    ? Math.round(myGoals.reduce((sum, g) => sum + g.progress, 0) / myGoals.length)
    : 0

  return (
    <div className="space-y-4">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-wide" style={{ color: 'var(--foreground)' }}>Performance Management</h2>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Review ratings, OKRs, progress goals and KPIs</p>
        </div>
        <div className="flex gap-2">
          {!isEmployee && (
            <button
              onClick={() => setIsAddingReview(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Award size={14} />
              Write Performance Review
            </button>
          )}
          <button
            onClick={() => {
              setNewGoalForm({
                employeeId: user?.role === 'employee' ? user.id : '',
                title: '',
                category: 'General',
                targetDate: '',
                progress: 0,
              })
              setIsAddingGoal(true)
            }}
            className="border text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <Plus size={14} />
            Assign New Goal / OKR
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
        {[
          { id: 'overview', label: 'Overview', icon: <TrendingUp size={14} /> },
          { id: 'goals', label: 'Goals & OKRs', icon: <Target size={14} /> },
          { id: 'kpis', label: 'Core KPIs', icon: <BarChart2 size={14} /> },
          { id: 'reviews', label: 'Performance Reviews', icon: <Award size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => setActiveTab('reviews')}
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} 
          className="rounded-xl border p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-amber-500/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Star size={22} fill="currentColor" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-500">{averageRating} / 5.0</p>
            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
              {isEmployee ? 'My Performance Score' : 'Average Review Rating'}
            </p>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('goals')}
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} 
          className="rounded-xl border p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-indigo-500/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Target size={22} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{myGoals.length} Active Goals</p>
            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Tracked objectives & key results</p>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('goals')}
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} 
          className="rounded-xl border p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-emerald-500/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Percent size={22} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{overallGoalProgress}% Overall Progress</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${overallGoalProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Active Goals card */}
          <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-5 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Current Objectives & OKRs</h3>
              <button onClick={() => setActiveTab('goals')} className="text-xs font-semibold text-indigo-500 hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {myGoals.slice(0, 3).map(goal => (
                <div key={goal.id} style={{ backgroundColor: 'var(--muted)' }} className="rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500">{goal.category}</span>
                      <h4 className="font-semibold text-xs mt-1.5" style={{ color: 'var(--foreground)' }}>{goal.title}</h4>
                      {!isEmployee && <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Assigned to: {goal.employeeName}</p>}
                    </div>
                    <span className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full ${
                      goal.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                      goal.status === 'behind' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {goal.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1 font-mono">
                      <span style={{ color: 'var(--muted-foreground)' }}>Completion Progress</span>
                      <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        goal.status === 'completed' ? 'bg-emerald-500' :
                        goal.status === 'behind' ? 'bg-rose-500' : 'bg-indigo-500'
                      }`} style={{ width: `${goal.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
              {myGoals.length === 0 && (
                <p className="text-xs text-center py-12" style={{ color: 'var(--muted-foreground)' }}>No active objectives. Assign goals to get started.</p>
              )}
            </div>
          </div>

          {/* Recent feedback feed */}
          <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Recent Reviews & Feedback</h3>
              <button onClick={() => setActiveTab('reviews')} className="text-xs font-semibold text-indigo-500 hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {myReviews.slice(0, 3).map(rev => (
                <div key={rev.id} className="space-y-1.5 border-l-2 pl-3" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-indigo-500">{rev.cycle}</span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, idx) => <Star key={idx} size={10} fill="currentColor" />)}
                    </div>
                  </div>
                  <h4 className="font-semibold text-xs" style={{ color: 'var(--foreground)' }}>
                    {isEmployee ? `Reviewed by ${rev.reviewerName}` : `Review for ${rev.employeeName}`}
                  </h4>
                  <p className="text-[11px] line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>"{rev.comments}"</p>
                </div>
              ))}
              {myReviews.length === 0 && (
                <p className="text-xs text-center py-12" style={{ color: 'var(--muted-foreground)' }}>No reviews log yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Goal & OKR Progress List</h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {myGoals.map(goal => (
              <div key={goal.id} style={{ backgroundColor: 'var(--muted)' }} className="rounded-xl p-4 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500">{goal.category}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsUpdatingProgress(goal)
                          setProgressValue(goal.progress)
                        }}
                        className="text-[10px] font-semibold text-indigo-500 hover:underline cursor-pointer"
                      >
                        Update Progress
                      </button>
                      {!isEmployee && (
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-red-500 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <h4 className="font-semibold text-xs mt-2" style={{ color: 'var(--foreground)' }}>{goal.title}</h4>
                  {!isEmployee && <p className="text-[10px] mt-1" style={{ color: 'var(--muted-foreground)' }}>Assigned Employee: <strong>{goal.employeeName}</strong></p>}
                  <p className="text-[10px] mt-1" style={{ color: 'var(--muted-foreground)' }}><Calendar size={10} className="inline mr-1" /> Target Due: {goal.targetDate}</p>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1 font-mono">
                    <span style={{ color: 'var(--muted-foreground)' }}>Objective Complete</span>
                    <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      goal.status === 'completed' ? 'bg-emerald-500' :
                      goal.status === 'behind' ? 'bg-rose-500' : 'bg-indigo-500'
                    }`} style={{ width: `${goal.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
            {myGoals.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>No active objectives. Assign goals to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'kpis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Attendance Rate', value: '96.2%', sub: 'Target: >95%', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { label: 'Task Completion', value: '88.4%', sub: 'Target: >85%', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Feedback Score', value: '4.8 / 5', sub: 'Target: >4.5', color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Leave Utilization', value: '12 Days', sub: 'Used this cycle', color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((kpi, idx) => (
            <div key={idx} style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{kpi.label}</span>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                  <CheckCircle size={14} />
                </span>
              </div>
              <div>
                <h4 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{kpi.value}</h4>
                <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Official Reviews Log</h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {myReviews.map(rev => (
              <div key={rev.id} className="p-5 flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500">{rev.cycle}</span>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{rev.date}</span>
                  </div>
                  <h4 className="font-bold text-xs" style={{ color: 'var(--foreground)' }}>
                    {isEmployee ? `Evaluated by ${rev.reviewerName}` : `Review for ${rev.employeeName}`}
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>"{rev.comments}"</p>
                </div>
                <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-2">
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <Star key={starIdx} size={14} fill={starIdx < rev.rating ? 'currentColor' : 'none'} className={starIdx < rev.rating ? 'text-amber-500' : 'text-slate-300'} />
                    ))}
                  </div>
                  {!isEmployee && (
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="text-red-500 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {myReviews.length === 0 && (
              <p className="text-xs text-center py-12 text-slate-500">No official evaluations found in this cycle.</p>
            )}
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {isAddingGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>Assign Performance Goal</h3>
              <button onClick={() => setIsAddingGoal(false)} className="text-slate-400 hover:text-red-500 cursor-pointer">×</button>
            </div>
            <form onSubmit={handleAddGoal} className="space-y-4">
              {!isEmployee && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Target Employee</label>
                  <select
                    required
                    value={newGoalForm.employeeId}
                    onChange={e => setNewGoalForm({ ...newGoalForm, employeeId: e.target.value })}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-1">
                <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Objective/Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Migrate dashboard API endpoints to Redux Toolkit"
                  value={newGoalForm.title}
                  onChange={e => setNewGoalForm({ ...newGoalForm, title: e.target.value })}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Category</label>
                  <select
                    value={newGoalForm.category}
                    onChange={e => setNewGoalForm({ ...newGoalForm, category: e.target.value as Goal['category'] })}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  >
                    {['General', 'Sales', 'Engineering', 'Marketing', 'Design', 'Learning'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Target Date</label>
                  <input
                    type="date"
                    required
                    value={newGoalForm.targetDate}
                    onChange={e => setNewGoalForm({ ...newGoalForm, targetDate: e.target.value })}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Current Progress ({newGoalForm.progress}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newGoalForm.progress}
                  onChange={e => setNewGoalForm({ ...newGoalForm, progress: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="border px-4 py-2 rounded-xl text-xs cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Review Modal */}
      {isAddingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>Write Performance Review</h3>
              <button onClick={() => setIsAddingReview(false)} className="text-slate-400 hover:text-red-500 cursor-pointer">×</button>
            </div>
            <form onSubmit={handleAddReview} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Target Employee</label>
                <select
                  required
                  value={newReviewForm.employeeId}
                  onChange={e => setNewReviewForm({ ...newReviewForm, employeeId: e.target.value })}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Review Cycle</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q3 2026"
                    value={newReviewForm.cycle}
                    onChange={e => setNewReviewForm({ ...newReviewForm, cycle: e.target.value })}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Rating (1-5 Stars)</label>
                  <select
                    value={newReviewForm.rating}
                    onChange={e => setNewReviewForm({ ...newReviewForm, rating: Number(e.target.value) })}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none"
                  >
                    <option value={5}>5 Stars (Excellent)</option>
                    <option value={4}>4 Stars (Good)</option>
                    <option value={3}>3 Stars (Average)</option>
                    <option value={2}>2 Stars (Below Avg)</option>
                    <option value={1}>1 Star (Poor)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Evaluation Feedback Comments</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide positive achievements and key improvement fields..."
                  value={newReviewForm.comments}
                  onChange={e => setNewReviewForm({ ...newReviewForm, comments: e.target.value })}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full text-xs px-3 py-2 rounded-xl border outline-none resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingReview(false)}
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="border px-4 py-2 rounded-xl text-xs cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Progress Slider Modal */}
      {isUpdatingProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Update Goal Progress</h3>
              <button onClick={() => setIsUpdatingProgress(null)} className="text-slate-400 hover:text-red-500 cursor-pointer">×</button>
            </div>
            <form onSubmit={handleUpdateProgressSubmit} className="space-y-4">
              <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{isUpdatingProgress.title}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span style={{ color: 'var(--muted-foreground)' }}>Slide to adjust progress</span>
                  <span className="font-bold text-indigo-500">{progressValue}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={e => setProgressValue(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsUpdatingProgress(null)}
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="border px-4 py-2 rounded-xl text-xs cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
