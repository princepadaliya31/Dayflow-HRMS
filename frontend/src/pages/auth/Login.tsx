import { useState, useEffect, type FormEvent } from 'react'
import type { Role } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import { Eye, EyeOff, Loader2, Shield, Users, User, ArrowRight, ArrowLeft } from 'lucide-react'

const ROLE_CONFIG = {
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'from-violet-600 to-indigo-700',
    light: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    demo: { email: 'admin@gmail.com', pass: 'admin123' },
    hint: 'Full system access — manage employees, payroll, analytics and settings.',
  },
  hr: {
    label: 'HR Manager',
    icon: Users,
    color: 'from-sky-600 to-cyan-700',
    light: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    demo: { email: 'hr@gmail.com', pass: 'HR@123' },
    hint: 'Manage employee lifecycle, attendance, leaves, and payroll processing.',
  },
  employee: {
    label: 'Employee',
    icon: User,
    color: 'from-emerald-600 to-teal-700',
    light: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    demo: { email: 'employee@gmail.com', pass: 'Emp@123' },
    hint: 'View payslips, apply leaves, track attendance and check performance.',
  },
}

interface LoginProps {
  onSwitchToRegister: () => void
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  const { login, isLoading, error, clearError } = useAuth()
  const [role, setRole] = useState<Role>('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)

  // Forgot password flow states
  // 'none' | 'email' | 'otp' | 'reset'
  const [forgotFlowStep, setForgotFlowStep] = useState<'none' | 'email' | 'otp' | 'reset'>('none')
  const [forgotEmail, setForgotEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState<string | null>(null)
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  // 180 seconds countdown timer
  const [timer, setTimer] = useState(180)
  const [resendTrigger, setResendTrigger] = useState(0)

  // Clear errors on load, role swap, or forgot step shift
  useEffect(() => {
    if (clearError) clearError()
    setForgotError(null)
    setForgotSuccess(null)
    setEmailError(null)
  }, [role, forgotFlowStep, clearError])

  const config = ROLE_CONFIG[role]

  // Countdown timer hook
  useEffect(() => {
    let interval: any = null
    if (forgotFlowStep === 'otp') {
      setTimer(180)
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setForgotError('The OTP code has expired. Please request a new verification code.')
            setForgotSuccess(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      setTimer(180)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [forgotFlowStep, resendTrigger])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setEmailError(null)

    const finalEmail = email.trim()
    const finalPassword = password

    if (!finalEmail || !finalEmail.toLowerCase().endsWith('@gmail.com')) {
      setEmailError('Sorry, please type a valid login email.')
      return
    }
    login(finalEmail, finalPassword, role, remember)
  }

  // OTP Step 1: Send OTP to Email
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault()
    if (!forgotEmail.toLowerCase().endsWith('@gmail.com')) {
      setForgotError('Email address must end with @gmail.com')
      return
    }

    setForgotLoading(true)
    setForgotError(null)
    setForgotSuccess(null)
    try {
      const response = await api.post('/api/auth/forgot-password', { email: forgotEmail })
      setForgotSuccess(response.message)
      if (response.simulated) {
        alert('Demo/Mock Mode: Reset OTP verification code has been logged to the backend console terminal!')
      } else {
        alert('OTP code has been successfully sent to ' + forgotEmail)
      }
      setForgotFlowStep('otp')
    } catch (err: any) {
      const errMsg = err.message || 'Failed to send OTP verification code.'
      setForgotError(errMsg)
      alert('Error sending OTP: ' + errMsg)
    } finally {
      setForgotLoading(false)
    }
  }

  // Resend OTP code action
  const handleResendOtp = async () => {
    setForgotLoading(true)
    setForgotError(null)
    setForgotSuccess(null)
    setOtpCode('')
    try {
      const response = await api.post('/api/auth/forgot-password', { email: forgotEmail })
      setForgotSuccess(response.message)
      if (response.simulated) {
        alert('Demo/Mock Mode: Reset OTP verification code has been logged to the backend console terminal!')
      } else {
        alert('OTP code has been successfully resent to ' + forgotEmail)
      }
      setResendTrigger(prev => prev + 1) // rebuild interval and restart at 180
    } catch (err: any) {
      const errMsg = err.message || 'Failed to resend OTP verification code.'
      setForgotError(errMsg)
      alert('Error resending OTP: ' + errMsg)
    } finally {
      setForgotLoading(false)
    }
  }

  // OTP Step 2: Verify OTP code
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault()
    if (timer === 0) {
      setForgotError('This OTP code has expired. Please request a new code.')
      return
    }
    if (!otpCode || otpCode.length !== 6) {
      setForgotError('Please enter a valid 6-digit OTP code.')
      return
    }

    setForgotLoading(true)
    setForgotError(null)
    setForgotSuccess(null)
    try {
      const response = await api.post('/api/auth/verify-otp', { email: forgotEmail, otp: otpCode })
      setForgotSuccess(response.message)
      setForgotFlowStep('reset')
    } catch (err: any) {
      setForgotError(err.message || 'Verification failed. Invalid or expired OTP code.')
    } finally {
      setForgotLoading(false)
    }
  }

  // OTP Step 3: Reset password
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match.')
      return
    }

    setForgotLoading(true)
    setForgotError(null)
    setForgotSuccess(null)
    try {
      const response = await api.post('/api/auth/reset-password', {
        email: forgotEmail,
        otp: otpCode,
        newPassword
      })
      alert(response.message || 'Your password has been reset successfully!')
      
      // Reset state and redirect back to login
      setForgotFlowStep('none')
      setEmail(forgotEmail)
      setPassword('')
      setForgotEmail('')
      setOtpCode('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err: any) {
      setForgotError(err.message || 'Password reset failed.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="auth-root">
      <div className="dot-grid" style={{ opacity: 0.06 }} />
      <div className="auth-form-side">
        <div className="auth-card">
          {/* Logo header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
            <div style={{
              background: '#4f46e5',
              padding: '6px 16px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.3)',
              marginBottom: 12,
            }}>
              <span style={{
                color: '#ffffff',
                fontFamily: "'Outfit', 'Inter', sans-serif",
                fontWeight: 900,
                fontSize: 20,
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center'
              }}>
                Dayflow
                <span style={{ marginLeft: 3, fontSize: 10, alignSelf: 'flex-end', marginBottom: 2 }}>✦</span>
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 4 }}>
              {forgotFlowStep !== 'none' ? 'Reset your account password' : 'Your workflow, beautifully managed'}
            </p>
          </div>

          {/* Error and Success alerts inside forgot flow */}
          {forgotSuccess && (
            <div style={{
              backgroundColor: '#ecfdf5', border: '1px solid #d1fae5', color: '#10b981',
              fontSize: 12, padding: '10px 14px', borderRadius: 10, fontWeight: 600, textAlign: 'center', marginBottom: 16
            }}>
              {forgotSuccess}
            </div>
          )}

          {/* FORGOT PASSWORD FORM STEP 1: EMAIL ADDRESS INPUT */}
          {forgotFlowStep === 'email' && (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Email Address
                </label>
                <input
                  className="df-input"
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={forgotEmail}
                  onChange={e => {
                    setForgotEmail(e.target.value)
                    setForgotError(null)
                  }}
                  style={forgotError ? { borderColor: '#ef4444' } : {}}
                />
                {forgotError && (
                  <p style={{ color: '#ef4444', fontSize: 12, fontWeight: 500, marginTop: 4 }}>
                    {forgotError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="df-btn df-btn-primary"
                disabled={forgotLoading}
                style={{ width: '100%', height: 46, fontSize: 15, background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
              >
                {forgotLoading ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending OTP…</>
                ) : (
                  <>Send OTP Code <ArrowRight size={16} /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotFlowStep('none')
                  setForgotError(null)
                  setForgotSuccess(null)
                }}
                style={{
                  background: 'none', border: 'none', color: '#64748b', fontSize: 12,
                  fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 8
                }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM STEP 2: ENTER OTP WITH 180s TIMER */}
          {forgotFlowStep === 'otp' && (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  6-Digit OTP Verification Code
                </label>
                <input
                  className="df-input"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit OTP code"
                  value={otpCode}
                  onChange={e => {
                    setOtpCode(e.target.value.replace(/\D/g, ''))
                    setForgotError(null)
                  }}
                  style={forgotError ? { textAlign: 'center', letterSpacing: '8px', fontSize: 18, fontWeight: 'bold', borderColor: '#ef4444' } : { textAlign: 'center', letterSpacing: '8px', fontSize: 18, fontWeight: 'bold' }}
                />
                {forgotError && (
                  <p style={{ color: '#ef4444', fontSize: 12, fontWeight: 500, marginTop: 4, textAlign: 'center' }}>
                    {forgotError}
                  </p>
                )}

                {/* Countdown timer & Resend button display */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginTop: 8 }}>
                  <span style={{ color: timer === 0 ? '#ef4444' : timer < 30 ? '#f59e0b' : '#64748b', fontWeight: 600 }}>
                    {timer > 0 ? `OTP expires in ${formatTime(timer)}` : 'OTP expired'}
                  </span>
                  {timer === 0 ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={forgotLoading}
                      style={{ color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: 11 }}>Wait to resend</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="df-btn df-btn-primary"
                disabled={forgotLoading || timer === 0}
                style={{
                  width: '100%', height: 46, fontSize: 15,
                  background: timer === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  cursor: timer === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {forgotLoading ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Verifying…</>
                ) : (
                  <>Verify OTP Code <ArrowRight size={16} /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotFlowStep('email')
                  setForgotError(null)
                  setForgotSuccess(null)
                }}
                style={{
                  background: 'none', border: 'none', color: '#64748b', fontSize: 12,
                  fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 8
                }}
              >
                <ArrowLeft size={14} /> Re-enter Email Address
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM STEP 3: RESET TO NEW PASSWORD */}
          {forgotFlowStep === 'reset' && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  New Secure Password
                </label>
                <input
                  className="df-input"
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={e => {
                    setNewPassword(e.target.value)
                    setForgotError(null)
                  }}
                  style={forgotError ? { borderColor: '#ef4444' } : {}}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Confirm New Password
                </label>
                <input
                  className="df-input"
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmNewPassword}
                  onChange={e => {
                    setConfirmNewPassword(e.target.value)
                    setForgotError(null)
                  }}
                  style={forgotError ? { borderColor: '#ef4444' } : {}}
                />
                {forgotError && (
                  <p style={{ color: '#ef4444', fontSize: 12, fontWeight: 500, marginTop: 4 }}>
                    {forgotError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="df-btn df-btn-primary"
                disabled={forgotLoading}
                style={{ width: '100%', height: 46, fontSize: 15, background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
              >
                {forgotLoading ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving password…</>
                ) : (
                  <>Update Password & Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}

          {/* STANDARD SIGN-IN FORM */}
          {forgotFlowStep === 'none' && (
            <>
              {/* Role selection tab row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}>
                {(Object.keys(ROLE_CONFIG) as Role[]).map(r => {
                  const item = ROLE_CONFIG[r]
                  const active = role === r
                  const Icon = item.icon
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        setRole(r)
                        setEmail('')
                        setPassword('')
                      }}
                      style={{
                        padding: '12px 6px', borderRadius: 12, border: active ? '2px solid #6366f1' : '1px solid #e2e8f0',
                        backgroundColor: active ? '#f5f3ff' : 'white', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon size={16} style={{ color: active ? '#6366f1' : '#94a3b8' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#4f46e5' : '#64748b' }}>
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    Email Address
                  </label>
                  <input
                    className="df-input"
                    type="email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value)
                      setEmailError(null)
                      if (error && clearError) clearError()
                    }}
                    placeholder={config.demo.email}
                    autoComplete="off"
                    style={emailError || error ? { borderColor: '#ef4444' } : {}}
                  />
                  {emailError && (
                    <p style={{ color: '#ef4444', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>
                      {emailError}
                    </p>
                  )}
                  {error && (
                    <p style={{ color: '#ef4444', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>
                      {error}
                    </p>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Password
                    </label>
                    {role !== 'admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setForgotFlowStep('email')
                          setForgotEmail(email)
                          setForgotError(null)
                          setForgotSuccess(null)
                          setEmailError(null)
                        }}
                        style={{ fontSize: 11, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="df-input"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value)
                        if (error && clearError) clearError()
                      }}
                      placeholder={config.demo.pass}
                      autoComplete="new-password"
                      style={error ? { paddingRight: 44, borderColor: '#ef4444' } : { paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#94a3b8', display: 'flex', alignItems: 'center',
                      }}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={e => setRemember(e.target.checked)}
                      style={{ width: 15, height: 15, accentColor: '#6366f1', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 12, color: '#475569' }}>Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="df-btn df-btn-primary"
                  disabled={isLoading}
                  style={{ width: '100%', marginTop: 4, height: 46, fontSize: 15, background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                >
                  {isLoading ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</>
                  ) : (
                    <>Sign In <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              {/* Footer actions */}
              {role !== 'admin' ? (
                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#64748b' }}>
                  Don't have an account?{' '}
                  <button
                    onClick={onSwitchToRegister}
                    style={{ color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#64748b' }}>
                  Admin accounts are provisioned by your system administrator.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
