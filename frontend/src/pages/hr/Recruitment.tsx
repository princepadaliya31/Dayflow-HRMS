import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import {
  Briefcase, Users, UserCheck, Clock, Plus, Search,
  ArrowRight, X, Mail, Phone, Calendar, UserPlus, Check, Award
} from 'lucide-react'

interface Job {
  _id: string
  title: string
  department: string
  description: string
  salaryRange: string
  experience: string
  status: 'open' | 'closed'
  openings: number
  createdAt: string
}

interface Candidate {
  _id: string
  name: string
  email: string
  phone: string
  jobId: string
  jobTitle: string
  experience: string
  status: 'applied' | 'interviewing' | 'shortlisted' | 'hired' | 'rejected'
  appliedDate: string
  resumeSummary: string
}

export default function HRRecruitment() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates'>('jobs')
  
  // Job search/filter
  const [jobSearch, setJobSearch] = useState('')
  const [jobDeptFilter, setJobDeptFilter] = useState('All')
  
  // Candidate filters
  const [candSearch, setCandSearch] = useState('')
  const [candStatusFilter, setCandStatusFilter] = useState('All')

  // Create Job Opening Drawer state
  const [showCreateJob, setShowCreateJob] = useState(false)
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    department: '',
    description: '',
    salaryRange: '',
    experience: '',
    openings: 1
  })

  // Candidate Details Drawer state
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  
  // Hire Wizard modal state
  const [hiringCandidate, setHiringCandidate] = useState<Candidate | null>(null)
  const [hireForm, setHireForm] = useState({
    designation: '',
    department: '',
    salary: 50000,
    joinDate: new Date().toLocaleDateString('en-CA')
  })

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true)
      const jobsList = await api.get('/api/recruitment/jobs')
      const candidatesList = await api.get('/api/recruitment/candidates')
      setJobs(jobsList)
      setCandidates(candidatesList)
    } catch (error) {
      console.error('Error fetching recruitment data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Create job opening
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/recruitment/jobs', newJobForm)
      setShowCreateJob(false)
      setNewJobForm({
        title: '',
        department: '',
        description: '',
        salaryRange: '',
        experience: '',
        openings: 1
      })
      fetchData()
    } catch (error: any) {
      alert(error.message || 'Failed to create job posting.')
    }
  }

  // Update candidate status directly
  const handleUpdateStatus = async (candId: string, newStatus: string) => {
    if (newStatus === 'hired') {
      const candidate = candidates.find(c => c._id === candId)
      if (candidate) {
        setHiringCandidate(candidate)
        setHireForm({
          designation: candidate.jobTitle,
          department: jobs.find(j => j._id === candidate.jobId)?.department || 'General',
          salary: 50000,
          joinDate: new Date().toLocaleDateString('en-CA')
        })
      }
      return
    }

    try {
      await api.put(`/api/recruitment/candidates/${candId}/status`, { status: newStatus })
      fetchData()
      if (selectedCandidate && selectedCandidate._id === candId) {
        setSelectedCandidate(prev => prev ? { ...prev, status: newStatus as any } : null)
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update candidate status.')
    }
  }

  // Submit Hire Employee Wizard
  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hiringCandidate) return

    try {
      const result = await api.post(`/api/recruitment/candidates/${hiringCandidate._id}/hire`, hireForm)
      alert(`Successfully hired ${hiringCandidate.name}! Created Employee profile with ID: ${result.employee.employeeId}`)
      setHiringCandidate(null)
      setSelectedCandidate(null)
      fetchData()
    } catch (error: any) {
      alert(error.message || 'Failed to complete hiring action.')
    }
  }

  // Derived metrics
  const activeJobsCount = jobs.filter(j => j.status === 'open').length
  const totalApplicants = candidates.length
  const interviewingCount = candidates.filter(c => c.status === 'interviewing' || c.status === 'shortlisted').length
  const hiredCount = candidates.filter(c => c.status === 'hired').length

  // Filter lists
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(jobSearch.toLowerCase()) || 
                          job.department.toLowerCase().includes(jobSearch.toLowerCase())
    const matchesDept = jobDeptFilter === 'All' || job.department === jobDeptFilter
    return matchesSearch && matchesDept
  })

  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = cand.name.toLowerCase().includes(candSearch.toLowerCase()) ||
                          cand.jobTitle.toLowerCase().includes(candSearch.toLowerCase())
    const matchesStatus = candStatusFilter === 'All' || cand.status === candStatusFilter
    return matchesSearch && matchesStatus
  })

  // Extract unique departments for filter dropdown
  const departments = ['All', ...Array.from(new Set(jobs.map(j => j.department)))]

  // Helper to count applicants per job
  const getApplicantCount = (jobId: string) => {
    return candidates.filter(c => c.jobId === jobId).length
  }

  // Color mappings
  const stageColors: Record<Candidate['status'], { text: string; bg: string }> = {
    applied: { text: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    interviewing: { text: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    shortlisted: { text: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    hired: { text: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    rejected: { text: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <div style={{ borderTopColor: 'var(--primary)' }} className="w-8 h-8 rounded-full border-2 border-indigo-100 animate-spin" />
        <p className="text-xs text-slate-400 mt-3 font-medium">Loading recruitment boards...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Jobs */}
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="p-5 rounded-2xl border flex items-center gap-4">
          <div style={{ backgroundColor: 'rgba(99,102,241,0.08)', color: 'var(--primary)' }} className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{activeJobsCount}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Active Job Openings</p>
          </div>
        </div>

        {/* Total Applicants */}
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="p-5 rounded-2xl border flex items-center gap-4">
          <div style={{ backgroundColor: 'rgba(59,130,246,0.08)', color: '#3b82f6' }} className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{totalApplicants}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Total Candidates</p>
          </div>
        </div>

        {/* Interviewing Stage */}
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="p-5 rounded-2xl border flex items-center gap-4">
          <div style={{ backgroundColor: 'rgba(245,158,11,0.08)', color: '#f59e0b' }} className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{interviewingCount}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Interviewing/Shortlisted</p>
          </div>
        </div>

        {/* Hired Candidates */}
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="p-5 rounded-2xl border flex items-center gap-4">
          <div style={{ backgroundColor: 'rgba(16,185,129,0.08)', color: '#10b981' }} className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{hiredCount}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Hired to Team</p>
          </div>
        </div>
      </div>

      {/* Tabs and Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 self-start" style={{ border: '1px solid var(--border)' }}>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'jobs'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Job Openings
          </button>
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'candidates'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Candidates / Applicants
          </button>
        </div>

        {/* Add Job Opening Button */}
        {activeTab === 'jobs' && (
          <button
            onClick={() => setShowCreateJob(true)}
            className="flex items-center justify-center gap-2 text-xs font-bold text-white px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus size={16} />
            Create Job Opening
          </button>
        )}
      </div>

      {/* Main Tab Panels */}
      {activeTab === 'jobs' ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search jobs by title or department..."
                value={jobSearch}
                onChange={e => setJobSearch(e.target.value)}
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={jobDeptFilter}
              onChange={e => setJobDeptFilter(e.target.value)}
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              className="text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 cursor-pointer min-w-[150px]"
            >
              <option value="All">All Departments</option>
              {departments.filter(d => d !== 'All').map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Job Openings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredJobs.map(job => {
              const appCount = getApplicantCount(job._id)
              return (
                <div
                  key={job._id}
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                  className="rounded-2xl border overflow-hidden p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{job.title}</h4>
                        <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider mt-0.5">{job.department}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        job.status === 'open' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <p className="text-xs line-clamp-3 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                      {job.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t text-[11px]" style={{ borderColor: 'var(--border)' }}>
                      <div>
                        <span className="block font-medium text-slate-400">Experience</span>
                        <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{job.experience || 'Not Specified'}</span>
                      </div>
                      <div>
                        <span className="block font-medium text-slate-400">Salary Range</span>
                        <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{job.salaryRange || 'Open'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-5 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users size={14} className="text-slate-400" />
                      <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{appCount}</span>
                      <span>Applicants</span>
                    </div>
                    <button
                      onClick={() => {
                        setCandSearch(job.title)
                        setCandStatusFilter('All')
                        setActiveTab('candidates')
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                      View Applicants
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              )
            })}

            {filteredJobs.length === 0 && (
              <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="col-span-full border border-dashed rounded-2xl p-12 text-center">
                <Briefcase className="mx-auto text-slate-300 mb-3" size={32} />
                <h5 className="font-bold text-xs" style={{ color: 'var(--foreground)' }}>No Job Openings Found</h5>
                <p className="text-[11px] text-slate-400 mt-1">Try broadening your search keyword or add a new job posting above.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Candidates Panel View */
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search candidates by name or applied position..."
                value={candSearch}
                onChange={e => setCandSearch(e.target.value)}
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={candStatusFilter}
              onChange={e => setCandStatusFilter(e.target.value)}
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              className="text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 cursor-pointer min-w-[150px]"
            >
              <option value="All">All Stages</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Table Container */}
          <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/30" style={{ borderColor: 'var(--border)' }}>
                    <th className="px-5 py-3">Candidate Details</th>
                    <th className="px-5 py-3">Applied Job</th>
                    <th className="px-5 py-3">Applied Date</th>
                    <th className="px-5 py-3">Experience</th>
                    <th className="px-5 py-3">Status Stage</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs" style={{ borderColor: 'var(--border)' }}>
                  {filteredCandidates.map(cand => {
                    const stage = stageColors[cand.status] || { text: '#64748b', bg: 'rgba(100,116,139,0.1)' }
                    return (
                      <tr key={cand._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                        {/* Name & Contact */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedCandidate(cand)}
                            className="font-bold hover:underline text-indigo-600 dark:text-indigo-400 text-left outline-none"
                          >
                            {cand.name}
                          </button>
                          <div className="flex gap-3 text-[10px] text-slate-400 mt-1">
                            <span className="flex items-center gap-1"><Mail size={10} />{cand.email}</span>
                            <span className="flex items-center gap-1"><Phone size={10} />{cand.phone}</span>
                          </div>
                        </td>

                        {/* Applied Job */}
                        <td className="px-5 py-4">
                          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{cand.jobTitle}</span>
                        </td>

                        {/* Applied Date */}
                        <td className="px-5 py-4 text-slate-400">
                          {cand.appliedDate}
                        </td>

                        {/* Experience */}
                        <td className="px-5 py-4 font-medium" style={{ color: 'var(--foreground)' }}>
                          {cand.experience || 'Not Specified'}
                        </td>

                        {/* Status Stage Pill */}
                        <td className="px-5 py-4">
                          <span
                            style={{ color: stage.text, backgroundColor: stage.bg }}
                            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          >
                            {cand.status}
                          </span>
                        </td>

                        {/* Actions drop control */}
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex gap-1.5 justify-end items-center">
                            {cand.status !== 'hired' && cand.status !== 'rejected' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(cand._id, 'interviewing')}
                                  title="Move to Interview"
                                  className="p-1.5 rounded-lg border border-slate-200 text-amber-500 hover:bg-amber-50 dark:border-slate-700 cursor-pointer"
                                >
                                  Interview
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(cand._id, 'shortlisted')}
                                  title="Shortlist Candidate"
                                  className="p-1.5 rounded-lg border border-slate-200 text-purple-500 hover:bg-purple-50 dark:border-slate-700 cursor-pointer"
                                >
                                  Shortlist
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(cand._id, 'hired')}
                                  title="Hire Candidate"
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] cursor-pointer"
                                >
                                  <UserPlus size={12} />
                                  Hire
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(cand._id, 'rejected')}
                                  title="Reject Candidate"
                                  className="p-1.5 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50 dark:border-slate-700 cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {cand.status === 'hired' && (
                              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                <Check size={12} />
                                Member Added
                              </span>
                            )}

                            {cand.status === 'rejected' && (
                              <span className="text-[10px] font-bold text-red-400">
                                Application Rejected
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {filteredCandidates.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-slate-400">
                        <Users className="mx-auto mb-2 text-slate-300" size={32} />
                        No candidates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE JOB OPENING DRAWER */}
      {showCreateJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div
            style={{ backgroundColor: 'var(--card)' }}
            className="w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slide-in"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <h4 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>Create Job Opening</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Post a new vacancy for candidate application</p>
                </div>
                <button
                  onClick={() => setShowCreateJob(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Backend Dev (Node.js)"
                    value={newJobForm.title}
                    onChange={e => setNewJobForm({ ...newJobForm, title: e.target.value })}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">Department</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering, Marketing, HR"
                    value={newJobForm.department}
                    onChange={e => setNewJobForm({ ...newJobForm, department: e.target.value })}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">Experience Required</label>
                    <input
                      type="text"
                      placeholder="e.g. 3-5 Years"
                      value={newJobForm.experience}
                      onChange={e => setNewJobForm({ ...newJobForm, experience: e.target.value })}
                      style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">Openings Count</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newJobForm.openings}
                      onChange={e => setNewJobForm({ ...newJobForm, openings: Number(e.target.value) || 1 })}
                      style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹6,00,000 - ₹9,00,000 PA"
                    value={newJobForm.salaryRange}
                    onChange={e => setNewJobForm({ ...newJobForm, salaryRange: e.target.value })}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">Job Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide a description of the roles, responsibilities, and qualifications..."
                    value={newJobForm.description}
                    onChange={e => setNewJobForm({ ...newJobForm, description: e.target.value })}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full text-xs px-3 py-2 rounded-xl border outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateJob(false)}
                    style={{ borderColor: 'var(--border)' }}
                    className="flex-1 py-2.5 rounded-xl border text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Post Opening
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE DETAILS DRAWER */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div
            style={{ backgroundColor: 'var(--card)' }}
            className="w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slide-in"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <h4 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>Candidate Details</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Review application submission and summary</p>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Header profile */}
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {selectedCandidate.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{selectedCandidate.name}</h5>
                    <span className="text-[10px] font-semibold text-indigo-500">{selectedCandidate.jobTitle}</span>
                  </div>
                </div>

                {/* Info List */}
                <div className="p-4 rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-900/30 border border-dashed" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Email Address</span>
                    <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{selectedCandidate.email}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Phone Number</span>
                    <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{selectedCandidate.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Experience</span>
                    <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{selectedCandidate.experience || 'Not Specified'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Applied Date</span>
                    <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{selectedCandidate.appliedDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Recruitment Stage</span>
                    <span
                      style={{
                        color: (stageColors[selectedCandidate.status] || { text: '#64748b' }).text,
                        backgroundColor: (stageColors[selectedCandidate.status] || { bg: 'rgba(0,0,0,0.05)' }).bg
                      }}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    >
                      {selectedCandidate.status}
                    </span>
                  </div>
                </div>

                {/* Resume Summary */}
                <div className="space-y-1.5">
                  <h6 className="font-semibold text-xs flex items-center gap-1.5" style={{ color: 'var(--foreground)' }}>
                    <Award size={14} className="text-indigo-500" />
                    Resume summary / Profile description
                  </h6>
                  <div
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}
                    className="p-4 rounded-xl border text-xs leading-relaxed text-slate-500 whitespace-pre-line"
                  >
                    {selectedCandidate.resumeSummary || 'No details provided.'}
                  </div>
                </div>
              </div>
            </div>

            {selectedCandidate.status !== 'hired' && selectedCandidate.status !== 'rejected' && (
              <div className="pt-6 border-t mt-6 flex gap-2" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedCandidate._id, 'rejected')
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Reject Candidate
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedCandidate._id, 'hired')
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <UserPlus size={14} />
                  Hire to Team
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HIRE WIZARD MODAL */}
      {hiringCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            className="w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-6"
          >
            <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h4 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>Hire {hiringCandidate.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Create employee user credentials in the database</p>
              </div>
              <button
                onClick={() => setHiringCandidate(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleHireSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400">Designation / Job Role</label>
                <input
                  type="text"
                  required
                  value={hireForm.designation}
                  onChange={e => setHireForm({ ...hireForm, designation: e.target.value })}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400">Department</label>
                <input
                  type="text"
                  required
                  value={hireForm.department}
                  onChange={e => setHireForm({ ...hireForm, department: e.target.value })}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">Monthly Base Salary</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={hireForm.salary}
                    onChange={e => setHireForm({ ...hireForm, salary: Number(e.target.value) || 0 })}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">Date of Joining</label>
                  <input
                    type="date"
                    required
                    value={hireForm.joinDate}
                    onChange={e => setHireForm({ ...hireForm, joinDate: e.target.value })}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-[11px] text-slate-500 leading-relaxed">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">Onboarding Credentials</span>
                The employee will be added with standard status <strong>active</strong>. Their temporary default login password is set to <strong>password123</strong>.
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setHiringCandidate(null)}
                  style={{ borderColor: 'var(--border)' }}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserCheck size={16} />
                  Complete Hiring
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
