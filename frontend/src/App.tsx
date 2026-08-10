import { useState, useEffect } from 'react'
import type { ThemeMode } from './types'
import { AuthProvider, useAuth } from './context/AuthContext'

// Layouts
import AdminLayout from './layouts/AdminLayout'
import HRLayout from './layouts/HRLayout'
import EmployeeLayout from './layouts/EmployeeLayout'
import AuthLayout from './layouts/AuthLayout'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminEmployees from './pages/admin/Employees'
import AdminAttendance from './pages/admin/Attendance'
import AdminLeaves from './pages/admin/Leaves'
import AdminPayroll from './pages/admin/Payroll'

// HR Pages
import HRDashboard from './pages/hr/Dashboard'
import HREmployees from './pages/hr/Employees'
import HRAttendance from './pages/hr/Attendance'
import HRLeaves from './pages/hr/Leaves'
import HRPayroll from './pages/hr/Payroll'
import HRRecruitment from './pages/hr/Recruitment'
import HRReports from './pages/hr/Reports'

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard'
import EmployeeAttendance from './pages/employee/Attendance'
import EmployeeLeaves from './pages/employee/Leaves'
import EmployeePayroll from './pages/employee/Payroll'

// Generic, Auth & Request Pages
import GenericPage from './pages/GenericPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import RequestsPage from './pages/Requests'
import HolidaysPage from './pages/Holidays'
import PerformancePage from './pages/growth/Performance'
import AnalyticsPage from './pages/growth/Analytics'
import NotificationsPage from './pages/Notifications'
import SettingsPage from './pages/Settings'

type AuthPage = 'login' | 'register'

function AppShell() {
  const { user, isLoading } = useAuth()
  const [authPage, setAuthPage] = useState<AuthPage>('login')
  const [page, setPage] = useState('dashboard')
  const [theme, setTheme] = useState<ThemeMode>('light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Reset to dashboard when user changes role
  useEffect(() => {
    if (user) setPage('dashboard')
  }, [user?.role])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.1)',
          borderTopColor: '#6366f1',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 12, fontWeight: 500 }}>Restoring session...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <AuthLayout>
        {authPage === 'login' ? (
          <Login onSwitchToRegister={() => setAuthPage('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthPage('login')} />
        )}
      </AuthLayout>
    )
  }

  const renderAdminPage = () => {
    switch (page) {
      case 'dashboard':  return <AdminDashboard />
      case 'employees':  return <AdminEmployees />
      case 'attendance': return <AdminAttendance />
      case 'leaves':     return <AdminLeaves />
      case 'payroll':    return <AdminPayroll />
      case 'requests':   return <RequestsPage />
      case 'holidays':   return <HolidaysPage />
      case 'performance': return <PerformancePage />
      case 'analytics':   return <AnalyticsPage />
      case 'notifications': return <NotificationsPage />
      case 'settings':      return <SettingsPage />
      default:           return <GenericPage page={page} />
    }
  }

  const renderHRPage = () => {
    switch (page) {
      case 'dashboard':  return <HRDashboard />
      case 'employees':  return <HREmployees />
      case 'attendance': return <HRAttendance />
      case 'leaves':     return <HRLeaves />
      case 'payroll':    return <HRPayroll />
      case 'recruitment': return <HRRecruitment />
      case 'requests':   return <RequestsPage />
      case 'holidays':   return <HolidaysPage />
      case 'performance': return <PerformancePage />
      case 'analytics':   return <AnalyticsPage />
      case 'reports':     return <HRReports />
      case 'notifications': return <NotificationsPage />
      case 'settings':      return <SettingsPage />
      default:           return <GenericPage page={page} />
    }
  }

  const renderEmployeePage = () => {
    switch (page) {
      case 'dashboard':  return <EmployeeDashboard onNavigate={setPage} />
      case 'attendance': return <EmployeeAttendance />
      case 'leaves':     return <EmployeeLeaves />
      case 'payroll':    return <EmployeePayroll />
      case 'holidays':   return <HolidaysPage />
      case 'performance': return <PerformancePage />
      case 'analytics':   return <AnalyticsPage />
      case 'notifications': return <NotificationsPage />
      case 'settings':      return <SettingsPage />
      default:           return <GenericPage page={page} />
    }
  }

  const handleThemeToggle = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light')
  }

  if (user.role === 'admin') {
    return (
      <AdminLayout
        currentPage={page}
        onNavigate={setPage}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      >
        {renderAdminPage()}
      </AdminLayout>
    )
  }

  if (user.role === 'hr') {
    return (
      <HRLayout
        currentPage={page}
        onNavigate={setPage}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      >
        {renderHRPage()}
      </HRLayout>
    )
  }

  // Employee role
  return (
    <EmployeeLayout
      currentPage={page}
      onNavigate={setPage}
      theme={theme}
      onThemeToggle={handleThemeToggle}
    >
      {renderEmployeePage()}
    </EmployeeLayout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
