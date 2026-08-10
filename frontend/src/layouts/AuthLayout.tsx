import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {children}
    </div>
  )
}
