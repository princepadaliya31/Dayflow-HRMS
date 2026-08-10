import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Loader2, CheckCircle2, Users, User, ArrowLeft, ArrowRight } from 'lucide-react'

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations', 'Legal', 'Product']

const ROLE_CONFIG = {
  employee: {
    label: 'Employee',
    icon: User,
    color: '#10b981',
    desc: 'For team members joining Dayflow to manage their profile, attendance, leaves, and payslips.',
    fields: ['name', 'email', 'phone', 'department', 'employeeId', 'password', 'confirm'],
  },
  hr: {
    label: 'HR Manager',
    icon: Users,
    color: '#0ea5e9',
    desc: 'For HR professionals who manage employee records, leaves, payroll, and team performance.',
    fields: ['name', 'email', 'phone', 'department', 'hrCode', 'password', 'confirm'],
  },
}

interface RegisterProps {
  onSwitchToLogin: () => void
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const { register, isLoading, error, clearError } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [roleChoice, setRoleChoice] = useState<'employee' | 'hr'>('employee')
  const [agreed, setAgreed] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  // Clear auth errors on load, role swap, or step switch
  useEffect(() => {
    if (clearError) clearError()
  }, [step, roleChoice, clearError])

  const [form, setForm] = useState({
    name: '', email: '', phone: '', department: '',
    employeeId: '', hrCode: '', password: '', confirm: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (form.name.includes('@')) {
      alert('Please enter your Full Name, not your email address.')
      return
    }

    if (!form.email.toLowerCase().endsWith('@gmail.com')) {
      alert('Email address must end with @gmail.com')
      return
    }

    if (!form.phone.trim()) {
      alert('Please enter your phone number.')
      return
    }

    if (!agreed) {
      alert('You must agree to the Terms of Service and Privacy Policy to create an account.')
      return
    }

    if (form.password !== form.confirm) {
      alert('Passwords do not match. Please check your entries.')
      return
    }

    if (form.phone) {
      const hasInvalidChars = /[^\d\s\-\+]/.test(form.phone)
      if (hasInvalidChars) {
        alert('Phone number can only contain digits, spaces, dashes, and the + sign.')
        return
      }

      const cleaned = form.phone.replace(/[\s-]/g, '')
      let digits = cleaned
      if (cleaned.startsWith('+91')) {
        digits = cleaned.substring(3)
      } else if (cleaned.startsWith('91') && cleaned.length === 12) {
        digits = cleaned.substring(2)
      }
      
      const isTenDigits = /^\d{10}$/.test(digits)
      if (!isTenDigits) {
        alert('Phone number must contain exactly 10 digits (e.g. +91 **********).')
        return
      }
    }

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: roleChoice,
        department: roleChoice === 'hr' ? 'HR' : form.department,
        phone: form.phone,
        employeeId: form.employeeId || undefined,
      })
      setIsRegistered(true)
    } catch (err) {
      // Error handles inside context
    }
  }

  const cfg = ROLE_CONFIG[roleChoice]

  return (
    <div className="auth-root">
      <div className="dot-grid" style={{ opacity: 0.06 }} />
      <div className="auth-form-side" style={{ padding: '32px 20px' }}>
        <div className="auth-card">
          {/* Centered Logo Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
              marginBottom: 12,
            }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>D</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Dayflow</h1>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Create your workflow profile</p>
          </div>

          {/* Registration step bar indicator */}
          {!isRegistered && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
              {[1, 2].map(n => (
                <div key={n} style={{
                  height: 4, width: 48, borderRadius: 2,
                  background: step >= n ? '#6366f1' : '#e2e8f0',
                  transition: 'background 0.2s'
                }} />
              ))}
            </div>
          )}

          {/* Back to login */}
          <button
            onClick={onSwitchToLogin}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
              color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              marginBottom: 20, padding: '4px 0', transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#0f172a')}
            onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
          >
            <ArrowLeft size={15} />
            Back to Login
          </button>

          {isRegistered ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(16,185,129,0.08)', color: '#10b981',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 12 }}>
                Pending Admin Approval
              </h2>
              <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.65, marginBottom: 24 }}>
                Your registration was submitted successfully! Your account is currently **pending administrator approval**.
                You will be able to sign in once an Admin or HR manager approves your profile.
              </p>
              <button
                onClick={onSwitchToLogin}
                className="df-btn df-btn-primary"
                style={{ width: '100%', height: 46, background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Step 1 — Choose role */}
              {step === 1 && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, marginBottom: 20 }}>
                    {(Object.entries(ROLE_CONFIG) as [typeof roleChoice, typeof ROLE_CONFIG.employee][]).map(([r, rc]) => {
                      const Icon = rc.icon
                      const active = roleChoice === r
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRoleChoice(r)}
                          style={{
                            textAlign: 'left', padding: 16, borderRadius: 16,
                            border: `2px solid ${active ? rc.color : '#e2e8f0'}`,
                            background: active ? `${rc.color}08` : 'rgba(0,0,0,0.01)',
                            cursor: 'pointer', transition: 'all 0.15s',
                            boxShadow: active ? `0 0 0 3px ${rc.color}15` : 'none',
                          }}
                        >
                          <div style={{
                            width: 40, height: 40, borderRadius: 10, marginBottom: 14,
                            background: active ? `${rc.color}18` : '#f1f5f9',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Icon size={20} style={{ color: active ? rc.color : '#94a3b8' }} />
                          </div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{rc.label}</p>
                          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{rc.desc}</p>
                          {active && (
                            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4, color: rc.color }}>
                              <CheckCircle2 size={14} />
                              <span style={{ fontSize: 12, fontWeight: 600 }}>Selected</span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  <div style={{
                    background: '#f1f5f9', borderRadius: 10, padding: '12px 14px',
                    marginBottom: 20, fontSize: 12, color: '#64748b', lineHeight: 1.6
                  }}>
                    <strong style={{ color: '#0f172a' }}>Note:</strong> Admin accounts cannot be self-registered.
                    Contact your IT administrator for admin access.
                  </div>

                  <button
                    className="df-btn df-btn-primary"
                    onClick={() => setStep(2)}
                    style={{ width: '100%', height: 46, fontSize: 15, background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                  >
                    Continue as {cfg.label} <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* Step 2 — Profile form */}
              {step === 2 && (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, background: `${cfg.color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <cfg.icon size={15} style={{ color: cfg.color }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {cfg.label} Registration
                      </span>
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                      Complete your profile
                    </h2>
                  </div>

                  {error && (
                    <div style={{
                      background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
                      borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#ef4444', fontSize: 13
                    }}>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {/* Full name */}
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                          Full Name *
                        </label>
                        <input
                          className="df-input"
                          type="text"
                          value={form.name}
                          onChange={set('name')}
                          placeholder="Full name"
                          required
                        />
                      </div>

                      {/* Email address */}
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                          Email Address *
                        </label>
                        <input
                          className="df-input"
                          type="email"
                          value={form.email}
                          onChange={set('email')}
                          placeholder={roleChoice === 'hr' ? 'hr@gmail.com' : 'employee@gmail.com'}
                          required
                        />
                      </div>

                      {/* Phone number */}
                      <div style={{ gridColumn: roleChoice === 'hr' ? '1 / -1' : 'auto' }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                          Phone Number *
                        </label>
                        <input
                          className="df-input"
                          type="tel"
                          value={form.phone}
                          onChange={set('phone')}
                          placeholder="+91 **********"
                          required
                        />
                      </div>

                      {/* Department */}
                      {roleChoice !== 'hr' && (
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                            Department *
                          </label>
                          <select
                            className="df-input"
                            value={form.department}
                            onChange={set('department')}
                            required
                            style={{ cursor: 'pointer' }}
                          >
                            <option value="">Select…</option>
                            {DEPARTMENTS.filter(d => d !== 'HR').map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      )}

                      {/* Employee ID or HR code */}
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                          {roleChoice === 'employee' ? 'Employee ID *' : 'HR Authorization Code *'}
                        </label>
                        <input
                          className="df-input"
                          type="text"
                          value={roleChoice === 'employee' ? form.employeeId : form.hrCode}
                          onChange={set(roleChoice === 'employee' ? 'employeeId' : 'hrCode')}
                          placeholder={roleChoice === 'employee' ? 'e.g. E001' : 'Provided by Admin'}
                          required
                        />
                        <p style={{ fontSize: 11, color: '#64748b', marginTop: 5 }}>
                          {roleChoice === 'employee'
                            ? 'Your employee ID is assigned by HR during onboarding.'
                            : 'The HR authorization code is provided by your system administrator.'}
                        </p>
                      </div>

                      {/* Password */}
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                          Password *
                        </label>
                        <input
                          className="df-input"
                          type="password"
                          value={form.password}
                          onChange={set('password')}
                          placeholder="••••••••"
                          required
                          autoComplete="new-password"
                        />
                      </div>

                      {/* Confirm password */}
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                          Confirm Password *
                        </label>
                        <input
                          className="df-input"
                          type="password"
                          value={form.confirm}
                          onChange={set('confirm')}
                          placeholder="••••••••"
                          required
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    {/* Terms */}
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 16, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={e => setAgreed(e.target.checked)}
                        style={{ marginTop: 2, width: 15, height: 15, accentColor: '#6366f1', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                        I agree to Dayflow's{' '}
                        <a href="#" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</a>{' '}
                        and{' '}
                        <a href="#" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>.
                      </span>
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginTop: 20 }}>
                      <button
                        type="button"
                        className="df-btn df-btn-outline"
                        onClick={() => setStep(1)}
                        style={{ height: 46, border: '1.5px solid #e2e8f0', background: 'transparent', color: '#475569' }}
                      >
                        <ArrowLeft size={15} /> Back
                      </button>
                      <button
                        type="submit"
                        className="df-btn df-btn-primary"
                        disabled={isLoading}
                        style={{ height: 46, fontSize: 15, background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                      >
                        {isLoading ? (
                          <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating account…</>
                        ) : (
                          <>Create Account <ArrowRight size={16} /></>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#64748b' }}>
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  style={{ color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Sign in
                </button>
              </p>
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
