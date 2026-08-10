import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { User, Shield, Sliders, Save, CheckCircle, Moon, Sun, Key, ShieldCheck } from 'lucide-react'

export default function Settings() {
  const { user, updateBankDetails, updateProfile, updatePassword, refreshAllData } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bankName: user?.bankDetails?.bankName || '',
    accountNumber: user?.bankDetails?.accountNumber || '',
    ifscCode: user?.bankDetails?.ifscCode || '',
    branchName: user?.bankDetails?.branchName || '',
    accountHolderName: user?.bankDetails?.accountHolderName || user?.name || '',
  })

  // Security Form state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false,
  })

  // Preferences state
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem('dayflow_prefs')
    if (saved) return JSON.parse(saved)
    return {
      language: 'English',
      emailOnPayroll: true,
      emailOnLeave: true,
      emailOnPerformance: true,
      emailOnSystemAlerts: true,
    }
  })

  // Submit Profile & Bank Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSaveSuccess(false)
    try {
      // 1. Update personal details (name, email, phone) on the database
      if (updateProfile) {
        await updateProfile({
          name: profileForm.name,
          email: profileForm.email,
          phone: profileForm.phone,
        })
      }

      // 2. Update bank details via Context (which updates it on the database)
      if (updateBankDetails && user?.role !== 'admin') {
        await updateBankDetails({
          bankName: profileForm.bankName,
          accountNumber: profileForm.accountNumber,
          ifscCode: profileForm.ifscCode,
          branchName: profileForm.branchName,
          accountHolderName: profileForm.accountHolderName,
        })
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      alert(err.message || 'Failed to update profile settings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bankName: user.bankDetails?.bankName || '',
        accountNumber: user.bankDetails?.accountNumber || '',
        ifscCode: user.bankDetails?.ifscCode || '',
        branchName: user.bankDetails?.branchName || '',
        accountHolderName: user.bankDetails?.accountHolderName || user.name || '',
      })
    }
  }, [user])

  // Save Security password changes
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (securityForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long.')
      return
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      alert('New password and confirmation do not match!')
      return
    }
    setIsLoading(true)
    try {
      if (updatePassword) {
        await updatePassword(securityForm.currentPassword, securityForm.newPassword)
      }
      setSaveSuccess(true)
      setSecurityForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactor: securityForm.twoFactor,
      })
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  // Save system preferences
  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('dayflow_prefs', JSON.stringify(prefs))
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <div className="space-y-4">

      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle size={14} />
          Changes saved successfully!
        </div>
      )}

      {/* Main split box */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Left Side Tab Navigation Card */}
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border p-4 space-y-1">
          {[
            { id: 'profile', label: 'Profile Settings', icon: <User size={14} /> },
            { id: 'security', label: 'Security & Sign-in', icon: <Shield size={14} /> },
            user?.role === 'employee' ? { id: 'preferences', label: 'System Preferences', icon: <Sliders size={14} /> } : null,
          ].filter(Boolean).map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any)
                setSaveSuccess(false)
              }}
              className={`w-full px-4 py-3 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2.5 ${
                activeTab === tab.id ? 'bg-indigo-500 text-white' : 'hover:bg-indigo-500/5'
              }`}
              style={activeTab !== tab.id ? { color: 'var(--foreground)' } : {}}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Side Settings Panel Details */}
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="rounded-xl border lg:col-span-3 overflow-hidden">
          {/* Profile settings panel */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile}>
              <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Personal Details</h3>
                <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Update your name, contact phone and bank details</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                      style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                      style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className={`grid grid-cols-1 ${user?.role === 'admin' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Phone Number</label>
                    <input
                      type="text"
                      required
                      value={profileForm.phone}
                      onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                    />
                  </div>
                  {user?.role !== 'admin' && (
                    <>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Designation / Job Role</label>
                        <input
                          type="text"
                          disabled
                          value={user?.role === 'hr' ? 'HR Manager' : 'Staff Employee'}
                          style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)', opacity: 0.6 }}
                          className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Department</label>
                        <input
                          type="text"
                          disabled
                          value={user?.department || 'Operations'}
                          style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)', opacity: 0.6 }}
                          className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none cursor-not-allowed"
                        />
                      </div>
                    </>
                  )}
                </div>

                {user?.role !== 'admin' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Employee ID</label>
                        <input
                          type="text"
                          disabled
                          value={user?.id || ''}
                          style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)', opacity: 0.6 }}
                          className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Date of Joining</label>
                        <input
                          type="text"
                          disabled
                          value={user?.joinDate || ''}
                          style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)', opacity: 0.6 }}
                          className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Base Salary (Monthly)</label>
                        <input
                          type="text"
                          disabled
                          value={user?.salary ? `₹${user.salary.toLocaleString('en-IN')}` : '—'}
                          style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)', opacity: 0.6 }}
                          className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-4" style={{ borderColor: 'var(--border)' }}>
                      <h4 className="font-semibold text-xs text-indigo-500">Bank Account Details (Used for Payroll)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Bank Name</label>
                          <input
                            type="text"
                            placeholder="e.g. HDFC Bank"
                            value={profileForm.bankName}
                            onChange={e => setProfileForm({ ...profileForm, bankName: e.target.value })}
                            style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                            className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Account Number</label>
                          <input
                            type="text"
                            placeholder="e.g. 50100239485"
                            value={profileForm.accountNumber}
                            onChange={e => setProfileForm({ ...profileForm, accountNumber: e.target.value })}
                            style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                            className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>IFSC Code</label>
                          <input
                            type="text"
                            placeholder="e.g. HDFC0001234"
                            value={profileForm.ifscCode}
                            onChange={e => setProfileForm({ ...profileForm, ifscCode: e.target.value })}
                            style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                            className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Branch Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Connaught Place Branch"
                            value={profileForm.branchName}
                            onChange={e => setProfileForm({ ...profileForm, branchName: e.target.value })}
                            style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                            className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Account Holder Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Vivek Kumar"
                            value={profileForm.accountHolderName}
                            onChange={e => setProfileForm({ ...profileForm, accountHolderName: e.target.value })}
                            style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                            className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="p-5 border-t flex justify-end" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Save size={14} />
                  {isLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          )}

          {/* Security settings panel */}
          {activeTab === 'security' && (
            <form onSubmit={handleSaveSecurity}>
              <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Sign-in & Credentials</h3>
                <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Change your account password and toggle extra layers of security</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Current Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={securityForm.currentPassword}
                      onChange={e => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                      style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Min. 8 characters"
                        value={securityForm.newPassword}
                        onChange={e => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                        style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Confirm New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Confirm password"
                        value={securityForm.confirmPassword}
                        onChange={e => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                        style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>


              </div>
              <div className="p-5 border-t flex justify-end" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Key size={14} />
                  Change Password
                </button>
              </div>
            </form>
          )}

          {/* Preferences settings panel */}
          {activeTab === 'preferences' && (
            <form onSubmit={handleSavePrefs}>
              <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>System Prefs & Email Alerts</h3>
                <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Choose system language and configure when to receive automatic email notifications</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1 w-full md:w-1/2">
                  <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>System Language</label>
                  <select
                    value={prefs.language}
                    onChange={e => setPrefs({ ...prefs, language: e.target.value })}
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="English">English (United States)</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                    <option value="German">German (Deutsch)</option>
                  </select>
                </div>

                <div className="border-t pt-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
                  <h4 className="font-semibold text-xs" style={{ color: 'var(--foreground)' }}>Email Alerts Subscription</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'emailOnPayroll', label: 'Notify me when my monthly payroll/payslip is generated' },
                      { id: 'emailOnLeave', label: 'Notify me when my leave application status is approved/rejected' },
                      { id: 'emailOnPerformance', label: 'Notify me when I receive a new performance evaluation review score' },
                      { id: 'emailOnSystemAlerts', label: 'Send system announcements and upcoming holiday alerts' },
                    ].map(item => (
                      <label key={item.id} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={prefs[item.id as keyof typeof prefs] as boolean}
                          onChange={e => setPrefs({ ...prefs, [item.id]: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5 border-t flex justify-end" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Save size={14} />
                  Save Preferences
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
