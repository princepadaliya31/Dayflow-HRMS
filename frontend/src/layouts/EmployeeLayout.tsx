import React from 'react'
import Sidebar from '../components/common/Sidebar'
import Header from '../components/common/Header'
import type { ThemeMode } from '../types'

interface EmployeeLayoutProps {
  currentPage: string
  onNavigate: (page: string) => void
  theme: ThemeMode
  onThemeToggle: () => void
  children: React.ReactNode
}

export default function EmployeeLayout({
  currentPage,
  onNavigate,
  theme,
  onThemeToggle,
  children
}: EmployeeLayoutProps) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
      <Sidebar role="employee" currentPage={currentPage} onNavigate={onNavigate} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Header
          role="employee"
          currentPage={currentPage}
          dark={theme === 'dark'}
          onThemeToggle={onThemeToggle}
          onNavigate={onNavigate}
        />

        <main
          className="page-enter"
          key={currentPage}
          style={{
            flex: 1, overflowY: 'auto', padding: 24,
            background: 'var(--background)',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
