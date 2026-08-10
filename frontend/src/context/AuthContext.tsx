import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Role, Employee, AttendanceRecord, LeaveRequest, PayrollRecord, Department, Notification, Holiday, BankDetails } from '../types'
import { api } from '../utils/api'

interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  department?: string
  avatar: string
  token: string
  phone?: string
  joinDate?: string
  salary?: number
  bankDetails?: BankDetails
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: 'employee' | 'hr'
  department?: string
  phone?: string
  employeeId?: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string, role: Role, remember?: boolean) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
  clearError: () => void

  // MERN full stack synced states
  employees: Employee[]
  attendanceRecords: AttendanceRecord[]
  leaveRequests: LeaveRequest[]
  payrollRecords: PayrollRecord[]
  departments: Department[]
  notifications: Notification[]
  dashboardStats: any
  holidays: Holiday[]

  // Operations
  refreshAllData: () => Promise<void>
  addEmployee: (data: Partial<Employee>) => Promise<void>
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>
  deleteEmployee: (id: string) => Promise<void>
  checkIn: () => Promise<void>
  checkOut: () => Promise<void>
  applyLeave: (data: any) => Promise<void>
  updateLeaveStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>
  generatePayroll: (month: string) => Promise<void>
  updatePayrollStatus: (id: string, status: 'paid' | 'processing' | 'pending') => Promise<void>
  addHoliday: (data: Partial<Holiday>) => Promise<void>
  deleteHoliday: (id: string) => Promise<void>
  editPayrollRecord: (id: string, data: Partial<PayrollRecord>) => Promise<void>
  deletePayrollRecord: (id: string) => Promise<void>
  updateBankDetails: (data: BankDetails) => Promise<void>
  updateProfile: (data: { name: string; email: string; phone: string }) => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Domain states
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [holidays, setHolidays] = useState<Holiday[]>([])

  // Fetch all database records
  const refreshAllData = async () => {
    const token = localStorage.getItem('dayflow_token') || sessionStorage.getItem('dayflow_token')
    if (!token) return

    try {
      // 1. Fetch dashboard metrics
      const stats = await api.get('/api/dashboard/stats')
      setDashboardStats(stats)
      if (stats.notifications) {
        setNotifications(stats.notifications.map((n: any) => ({ ...n, id: n._id })))
      }

      // 2. Conditional data fetches based on roles
      const storedUser = JSON.parse(localStorage.getItem('dayflow_user') || sessionStorage.getItem('dayflow_user') || '{}')
      
      if (storedUser.role === 'admin' || storedUser.role === 'hr') {
        const empList = await api.get('/api/employees')
        setEmployees(
          empList.map((e: any) => ({
            id: e.employeeId,
            name: e.name,
            email: e.email,
            department: e.department,
            role: e.designation, // Map designator to role title
            status: e.status,
            avatar: e.avatar,
            joinDate: e.joinDate,
            salary: e.salary,
            phone: e.phone,
            authRole: e.role,
            bankDetails: e.bankDetails,
          }))
        )

        const attList = await api.get('/api/attendance')
        setAttendanceRecords(attList.map((a: any) => ({ ...a, id: a._id })))

        const leaveList = await api.get('/api/leaves')
        setLeaveRequests(leaveList.map((l: any) => ({ ...l, id: l._id })))

        const deptList = await api.get('/api/departments')
        setDepartments(deptList.map((d: any) => ({ ...d, id: d._id })))
      } else {
        // Employee data fetches
        const myAtt = await api.get('/api/attendance/my-records')
        setAttendanceRecords(myAtt.map((a: any) => ({ ...a, id: a._id })))

        const myLeaves = await api.get('/api/leaves/my-leaves')
        setLeaveRequests(myLeaves.map((l: any) => ({ ...l, id: l._id })))
      }

      const payList = await api.get('/api/payroll')
      setPayrollRecords(payList.map((p: any) => ({ ...p, id: p._id })))

      const holidayList = await api.get('/api/holidays')
      setHolidays(holidayList.map((h: any) => ({ ...h, id: h._id })))

    } catch (err: any) {
      console.error('Failed to synchronize backend data:', err.message)
      if (err.message.includes('401') || err.message.includes('Not authorized') || err.message.includes('token failed')) {
        logout()
      }
    }
  }

  // Check login session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const remember = localStorage.getItem('dayflow_remember') === 'true'
      const token = remember ? localStorage.getItem('dayflow_token') : sessionStorage.getItem('dayflow_token')
      const storedUser = remember ? localStorage.getItem('dayflow_user') : sessionStorage.getItem('dayflow_user')

      if (token && storedUser) {
        try {
          // Verify session integrity
          const profile = await api.get('/api/auth/me')
          const authUser: AuthUser = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            department: profile.department,
            avatar: profile.avatar,
            token,
            phone: profile.phone,
            joinDate: profile.joinDate,
            salary: profile.salary,
            bankDetails: profile.bankDetails,
          }
          setUser(authUser)
          if (remember) {
            localStorage.setItem('dayflow_user', JSON.stringify(authUser))
          } else {
            sessionStorage.setItem('dayflow_user', JSON.stringify(authUser))
          }
        } catch (err) {
          // Clear credentials if token expired
          logout()
        }
      } else {
        logout()
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  // Refresh lists whenever user state becomes valid
  useEffect(() => {
    if (user) {
      refreshAllData()
    }
  }, [user])

  const login = async (email: string, _password: string, role: Role, remember = false) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.post('/api/auth/login', { email, password: _password, role })
      
      const authUser: AuthUser = {
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
        department: response.department,
        avatar: response.avatar,
        token: response.token,
        phone: response.phone,
        joinDate: response.joinDate,
        salary: response.salary,
        bankDetails: response.bankDetails,
      }

      if (remember) {
        localStorage.setItem('dayflow_remember', 'true')
        localStorage.setItem('dayflow_token', response.token)
        localStorage.setItem('dayflow_user', JSON.stringify(authUser))
      } else {
        localStorage.removeItem('dayflow_remember')
        localStorage.removeItem('dayflow_token')
        localStorage.removeItem('dayflow_user')
        sessionStorage.setItem('dayflow_token', response.token)
        sessionStorage.setItem('dayflow_user', JSON.stringify(authUser))
      }

      setUser(authUser)
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    setError(null)
    try {
      await api.post('/api/auth/register', data)
    } catch (err: any) {
      setError(err.message || 'Registration failed.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setError(null)
    localStorage.removeItem('dayflow_token')
    localStorage.removeItem('dayflow_user')
    localStorage.removeItem('dayflow_remember')
    sessionStorage.removeItem('dayflow_token')
    sessionStorage.removeItem('dayflow_user')
    // Reset domains
    setEmployees([])
    setAttendanceRecords([])
    setLeaveRequests([])
    setPayrollRecords([])
    setDepartments([])
    setNotifications([])
    setDashboardStats(null)
    setHolidays([])
  }

  const clearError = () => {
    setError(null)
  }

  // CRUD Implementations
  const addEmployee = async (data: Partial<Employee>) => {
    await api.post('/api/employees', {
      name: data.name,
      email: data.email,
      department: data.department,
      designation: data.role, // Maps frontend property 'role' to database field 'designation'
      salary: data.salary,
      phone: data.phone,
      joinDate: data.joinDate,
      status: data.status,
    })
    await refreshAllData()
  }

  const updateEmployee = async (id: string, data: Partial<Employee>) => {
    await api.put(`/api/employees/${id}`, {
      name: data.name,
      email: data.email,
      department: data.department,
      designation: data.role,
      salary: data.salary,
      phone: data.phone,
      status: data.status,
      joinDate: data.joinDate,
    })
    await refreshAllData()
  }

  const deleteEmployee = async (id: string) => {
    await api.delete(`/api/employees/${id}`)
    await refreshAllData()
  }

  const checkIn = async () => {
    await api.post('/api/attendance/check-in')
    await refreshAllData()
  }

  const checkOut = async () => {
    await api.post('/api/attendance/check-out')
    await refreshAllData()
  }

  const applyLeave = async (data: any) => {
    await api.post('/api/leaves/apply', data)
    await refreshAllData()
  }

  const updateLeaveStatus = async (id: string, status: 'approved' | 'rejected') => {
    await api.put(`/api/leaves/${id}/status`, { status })
    await refreshAllData()
  }

  const generatePayroll = async (month: string) => {
    await api.post('/api/payroll/generate', { month })
    await refreshAllData()
  }

  const updatePayrollStatus = async (id: string, status: 'paid' | 'processing' | 'pending') => {
    await api.put(`/api/payroll/${id}/status`, { status })
    await refreshAllData()
  }

  const addHoliday = async (data: Partial<Holiday>) => {
    await api.post('/api/holidays', data)
    await refreshAllData()
  }

  const deleteHoliday = async (id: string) => {
    await api.delete(`/api/holidays/${id}`)
    await refreshAllData()
  }

  const editPayrollRecord = async (id: string, data: Partial<PayrollRecord>) => {
    await api.put(`/api/payroll/${id}`, data)
    await refreshAllData()
  }

  const deletePayrollRecord = async (id: string) => {
    await api.delete(`/api/payroll/${id}`)
    await refreshAllData()
  }

  const updateBankDetails = async (data: BankDetails) => {
    const response = await api.put('/api/auth/profile/bank', data)
    setUser((prevUser) => {
      if (!prevUser) return null
      const updatedUser = { ...prevUser, bankDetails: response.bankDetails }
      const remember = localStorage.getItem('dayflow_remember') === 'true'
      if (remember) {
        localStorage.setItem('dayflow_user', JSON.stringify(updatedUser))
      } else {
        sessionStorage.setItem('dayflow_user', JSON.stringify(updatedUser))
      }
      return updatedUser
    })
    await refreshAllData()
  }

  const updateProfile = async (data: { name: string; email: string; phone: string }) => {
    const response = await api.put('/api/auth/profile', data)
    setUser((prevUser) => {
      if (!prevUser) return null
      const updatedUser = { 
        ...prevUser, 
        name: response.name, 
        email: response.email, 
        phone: response.phone,
        avatar: response.avatar
      }
      const remember = localStorage.getItem('dayflow_remember') === 'true'
      if (remember) {
        localStorage.setItem('dayflow_user', JSON.stringify(updatedUser))
      } else {
        sessionStorage.setItem('dayflow_user', JSON.stringify(updatedUser))
      }
      return updatedUser
    })
    await refreshAllData()
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    await api.put('/api/auth/profile/password', { currentPassword, newPassword })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        error,
        clearError,
        employees,
        attendanceRecords,
        leaveRequests,
        payrollRecords,
        departments,
        notifications,
        dashboardStats,
        refreshAllData,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        checkIn,
        checkOut,
        applyLeave,
        updateLeaveStatus,
        generatePayroll,
        updatePayrollStatus,
        holidays,
        addHoliday,
        deleteHoliday,
        editPayrollRecord,
        deletePayrollRecord,
        updateBankDetails,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
