export type Role = 'admin' | 'hr' | 'employee'

export type ThemeMode = 'light' | 'dark'

export interface BankDetails {
  bankName: string
  accountNumber: string
  ifscCode: string
  branchName: string
  accountHolderName: string
}

export interface Employee {
  id: string
  name: string
  email: string
  department: string
  role: string
  status: 'active' | 'inactive' | 'on-leave' | 'pending'
  avatar: string
  joinDate: string
  salary: number
  phone: string
  authRole?: Role
  bankDetails?: BankDetails
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  department: string
  date: string
  checkIn: string
  checkOut: string
  status: 'present' | 'absent' | 'late' | 'half-day'
  hours: number
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  department: string
  type: 'sick' | 'casual' | 'annual' | 'maternity' | 'unpaid'
  from: string
  to: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  appliedOn: string
}

export interface PayrollRecord {
  id: string
  employeeId: string
  employeeName: string
  department: string
  month: string
  baseSalary?: number
  presentDays?: number
  basic: number
  hra: number
  allowances: number
  deductions: number
  tax: number
  net: number
  status: 'paid' | 'pending'
  bankDetails?: BankDetails
}

export interface Department {
  id: string
  name: string
  manager: string
  headCount: number
  budget: number
}

export interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'warning' | 'success'
}

export interface Holiday {
  id: string
  title: string
  date: string
  type: 'public' | 'company'
  description?: string
}
