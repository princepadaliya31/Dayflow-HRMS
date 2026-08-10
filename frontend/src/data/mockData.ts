import type { Employee, AttendanceRecord, LeaveRequest, PayrollRecord, Department, Notification } from '../types'

export const employees: Employee[] = [
  { id: 'E001', name: 'Arjun Mehta', email: 'arjun.mehta@dayflow.io', department: 'Engineering', role: 'Senior Engineer', status: 'active', avatar: 'AM', joinDate: '2021-03-15', salary: 125000, phone: '+91 98765 43210' },
  { id: 'E002', name: 'Priya Sharma', email: 'priya.sharma@dayflow.io', department: 'Design', role: 'UX Lead', status: 'active', avatar: 'PS', joinDate: '2020-07-22', salary: 110000, phone: '+91 98765 43211' },
  { id: 'E003', name: 'Rohan Das', email: 'rohan.das@dayflow.io', department: 'Marketing', role: 'Marketing Manager', status: 'on-leave', avatar: 'RD', joinDate: '2019-11-01', salary: 95000, phone: '+91 98765 43212' },
  { id: 'E004', name: 'Sneha Patel', email: 'sneha.patel@dayflow.io', department: 'Engineering', role: 'Frontend Dev', status: 'active', avatar: 'SP', joinDate: '2022-01-10', salary: 85000, phone: '+91 98765 43213' },
  { id: 'E005', name: 'Vikram Singh', email: 'vikram.singh@dayflow.io', department: 'Sales', role: 'Sales Executive', status: 'active', avatar: 'VS', joinDate: '2022-06-20', salary: 78000, phone: '+91 98765 43214' },
  { id: 'E006', name: 'Ananya Roy', email: 'ananya.roy@dayflow.io', department: 'HR', role: 'HR Specialist', status: 'active', avatar: 'AR', joinDate: '2021-09-05', salary: 82000, phone: '+91 98765 43215' },
  { id: 'E007', name: 'Kabir Nair', email: 'kabir.nair@dayflow.io', department: 'Finance', role: 'Finance Analyst', status: 'active', avatar: 'KN', joinDate: '2020-04-18', salary: 98000, phone: '+91 98765 43216' },
  { id: 'E008', name: 'Meera Joshi', email: 'meera.joshi@dayflow.io', department: 'Design', role: 'Visual Designer', status: 'inactive', avatar: 'MJ', joinDate: '2023-02-14', salary: 72000, phone: '+91 98765 43217' },
  { id: 'E009', name: 'Aditya Kumar', email: 'aditya.kumar@dayflow.io', department: 'Engineering', role: 'Backend Dev', status: 'active', avatar: 'AK', joinDate: '2021-12-01', salary: 105000, phone: '+91 98765 43218' },
  { id: 'E010', name: 'Ritu Verma', email: 'ritu.verma@dayflow.io', department: 'Operations', role: 'Ops Manager', status: 'active', avatar: 'RV', joinDate: '2019-06-30', salary: 115000, phone: '+91 98765 43219' },
]

export const attendanceRecords: AttendanceRecord[] = [
  { id: 'A001', employeeId: 'E001', employeeName: 'Arjun Mehta', department: 'Engineering', date: '2026-07-13', checkIn: '09:02', checkOut: '18:15', status: 'present', hours: 9.2 },
  { id: 'A002', employeeId: 'E002', employeeName: 'Priya Sharma', department: 'Design', date: '2026-07-13', checkIn: '09:45', checkOut: '18:00', status: 'late', hours: 8.25 },
  { id: 'A003', employeeId: 'E003', employeeName: 'Rohan Das', department: 'Marketing', date: '2026-07-13', checkIn: '--', checkOut: '--', status: 'absent', hours: 0 },
  { id: 'A004', employeeId: 'E004', employeeName: 'Sneha Patel', department: 'Engineering', date: '2026-07-13', checkIn: '08:55', checkOut: '17:55', status: 'present', hours: 9.0 },
  { id: 'A005', employeeId: 'E005', employeeName: 'Vikram Singh', department: 'Sales', date: '2026-07-13', checkIn: '09:00', checkOut: '13:30', status: 'half-day', hours: 4.5 },
  { id: 'A006', employeeId: 'E006', employeeName: 'Ananya Roy', department: 'HR', date: '2026-07-13', checkIn: '08:50', checkOut: '18:10', status: 'present', hours: 9.33 },
  { id: 'A007', employeeId: 'E007', employeeName: 'Kabir Nair', department: 'Finance', date: '2026-07-13', checkIn: '09:05', checkOut: '18:05', status: 'present', hours: 9.0 },
  { id: 'A008', employeeId: 'E009', employeeName: 'Aditya Kumar', department: 'Engineering', date: '2026-07-13', checkIn: '09:30', checkOut: '18:30', status: 'late', hours: 9.0 },
]

export const leaveRequests: LeaveRequest[] = [
  { id: 'L001', employeeId: 'E003', employeeName: 'Rohan Das', department: 'Marketing', type: 'sick', from: '2026-07-10', to: '2026-07-14', days: 5, reason: 'Fever and flu', status: 'approved', appliedOn: '2026-07-09' },
  { id: 'L002', employeeId: 'E005', employeeName: 'Vikram Singh', department: 'Sales', type: 'casual', from: '2026-07-20', to: '2026-07-21', days: 2, reason: 'Family function', status: 'pending', appliedOn: '2026-07-12' },
  { id: 'L003', employeeId: 'E001', employeeName: 'Arjun Mehta', department: 'Engineering', type: 'annual', from: '2026-08-01', to: '2026-08-07', days: 7, reason: 'Vacation', status: 'pending', appliedOn: '2026-07-11' },
  { id: 'L004', employeeId: 'E004', employeeName: 'Sneha Patel', department: 'Engineering', type: 'sick', from: '2026-07-08', to: '2026-07-09', days: 2, reason: 'Doctor visit', status: 'approved', appliedOn: '2026-07-07' },
  { id: 'L005', employeeId: 'E009', employeeName: 'Aditya Kumar', department: 'Engineering', type: 'casual', from: '2026-07-18', to: '2026-07-18', days: 1, reason: 'Personal work', status: 'rejected', appliedOn: '2026-07-10' },
]

export const payrollRecords: PayrollRecord[] = [
  { id: 'P001', employeeId: 'E001', employeeName: 'Arjun Mehta', department: 'Engineering', month: 'June 2026', basic: 75000, hra: 30000, allowances: 12000, deductions: 5000, tax: 12800, net: 99200, status: 'paid' },
  { id: 'P002', employeeId: 'E002', employeeName: 'Priya Sharma', department: 'Design', month: 'June 2026', basic: 66000, hra: 26400, allowances: 10000, deductions: 4500, tax: 10400, net: 87500, status: 'paid' },
  { id: 'P003', employeeId: 'E007', employeeName: 'Kabir Nair', department: 'Finance', month: 'June 2026', basic: 58800, hra: 23520, allowances: 9000, deductions: 4000, tax: 9200, net: 78120, status: 'paid' },
  { id: 'P004', employeeId: 'E009', employeeName: 'Aditya Kumar', department: 'Engineering', month: 'June 2026', basic: 63000, hra: 25200, allowances: 11000, deductions: 4200, tax: 10800, net: 84200, status: 'pending' },
  { id: 'P005', employeeId: 'E010', employeeName: 'Ritu Verma', department: 'Operations', month: 'June 2026', basic: 69000, hra: 27600, allowances: 10500, deductions: 4800, tax: 11500, net: 90800, status: 'processing' },
]

export const departments: Department[] = [
  { id: 'D001', name: 'Engineering', manager: 'Arjun Mehta', headCount: 28, budget: 3200000 },
  { id: 'D002', name: 'Design', manager: 'Priya Sharma', headCount: 12, budget: 1400000 },
  { id: 'D003', name: 'Marketing', manager: 'Rohan Das', headCount: 15, budget: 1800000 },
  { id: 'D004', name: 'Sales', manager: 'Vikram Singh', headCount: 22, budget: 2100000 },
  { id: 'D005', name: 'Finance', manager: 'Kabir Nair', headCount: 9, budget: 980000 },
  { id: 'D006', name: 'HR', manager: 'Ananya Roy', headCount: 7, budget: 750000 },
  { id: 'D007', name: 'Operations', manager: 'Ritu Verma', headCount: 18, budget: 2000000 },
]

export const notifications: Notification[] = [
  { id: 'N001', title: 'Leave Request', message: 'Vikram Singh applied for 2 days casual leave', time: '2 hours ago', read: false, type: 'info' },
  { id: 'N002', title: 'Payroll Processed', message: 'June 2026 payroll has been successfully processed', time: '5 hours ago', read: false, type: 'success' },
  { id: 'N003', title: 'New Employee', message: 'Welcome onboard — Meera Joshi joined Design team', time: '1 day ago', read: true, type: 'success' },
  { id: 'N004', title: 'Attendance Alert', message: '3 employees marked absent today without leave', time: '1 day ago', read: true, type: 'warning' },
]

export const attendanceChartData = [
  { day: 'Mon', present: 142, absent: 12, late: 8 },
  { day: 'Tue', present: 138, absent: 15, late: 11 },
  { day: 'Wed', present: 145, absent: 9, late: 7 },
  { day: 'Thu', present: 140, absent: 13, late: 9 },
  { day: 'Fri', present: 135, absent: 18, late: 13 },
]

export const salaryChartData = [
  { month: 'Jan', total: 8200000 },
  { month: 'Feb', total: 8350000 },
  { month: 'Mar', total: 8480000 },
  { month: 'Apr', total: 8200000 },
  { month: 'May', total: 8620000 },
  { month: 'Jun', total: 8750000 },
]

export const deptDistribution = [
  { name: 'Engineering', value: 28 },
  { name: 'Sales', value: 22 },
  { name: 'Operations', value: 18 },
  { name: 'Marketing', value: 15 },
  { name: 'Design', value: 12 },
  { name: 'Finance', value: 9 },
  { name: 'HR', value: 7 },
]
