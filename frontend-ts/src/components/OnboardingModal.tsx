import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '@/store'
import { logout, updateAuthUser } from '@/store/slices/AuthSlice'
import { clearHostel } from '@/store/slices/HostelSlice'
import {
  useSendEmailOtpMutation,
  useVerifyEmailOtpMutation,
  useUpdateOnboardingPasswordMutation,
  useSignAgreementMutation,
  useLogoutMutation,
} from '@/hooks/mutations/useAuthMutations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Mail,
  Lock,
  FileCheck2,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  LogOut,
  Send,
  KeyRound,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

export default function OnboardingModal() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  // Step state: 1 = Email, 2 = Password, 3 = Agreement
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)

  // Email form state
  const [newEmail, setNewEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)

  // Password form state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordUpdated, setPasswordUpdated] = useState(false)

  // Agreement form state
  const [agreementChecked, setAgreementChecked] = useState(false)

  // Mutations
  const sendOtpMutation = useSendEmailOtpMutation()
  const verifyOtpMutation = useVerifyEmailOtpMutation()
  const updatePasswordMutation = useUpdateOnboardingPasswordMutation()
  const signAgreementMutation = useSignAgreementMutation()
  const logoutMutation = useLogoutMutation()

  // If not logged in or agreement is already signed, do not show modal
  if (!isAuthenticated || !user || user.agreement === 'signed') {
    return null
  }

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    if (newEmail.trim().toLowerCase() === user.email.toLowerCase()) {
      toast.info('This is already your registered email. You can skip this step.')
      return
    }

    try {
      await sendOtpMutation.mutateAsync(newEmail.trim().toLowerCase())
      setOtpSent(true)
      toast.success(`Verification code sent to ${newEmail}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP. Email may already be in use.')
    }
  }

  // Step 1: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (otpCode.trim().length !== 6) {
      toast.error('Please enter the 6-digit verification code')
      return
    }

    try {
      const res = await verifyOtpMutation.mutateAsync({
        newEmail: newEmail.trim().toLowerCase(),
        otp: otpCode.trim(),
      })
      setEmailVerified(true)
      dispatch(updateAuthUser({ email: res.user?.email || newEmail.trim().toLowerCase() }))
      toast.success('Email verified and updated successfully!')
      setTimeout(() => {
        setCurrentStep(2)
      }, 900)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid or expired OTP')
    }
  }

  // Step 2: Update Password
  const handleUpdatePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      await updatePasswordMutation.mutateAsync(newPassword)
      setPasswordUpdated(true)
      toast.success('Password updated successfully!')
      setTimeout(() => {
        setCurrentStep(3)
      }, 900)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update password')
    }
  }

  // Step 3: Accept Agreement
  const handleAcceptAgreement = async () => {
    if (!agreementChecked) {
      toast.error('Please check the box to agree to the terms and hostel guidelines.')
      return
    }

    try {
      await signAgreementMutation.mutateAsync()
      dispatch(updateAuthUser({ agreement: 'signed', agreementSignedAt: new Date().toISOString() }))
      toast.success('Agreement accepted! Welcome to MessPro.')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to sign agreement. Please try again.')
    }
  }

  // Step 3: Decline / Logout
  const handleDeclineAndLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch (e) {
      // Ignore
    } finally {
      dispatch(logout())
      dispatch(clearHostel())
      navigate('/login')
      toast.info('Logged out. You must accept the agreement to access your portal.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Progress Steps */}
        <div className="p-6 bg-muted/40 border-b border-border/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  Welcome to MessPro, {user.name || 'User'}!
                </h2>
                <p className="text-xs text-muted-foreground">
                  Complete your initial account setup to access your portal
                </p>
              </div>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {/* Step 1 Pill */}
            <div
              className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all ${
                currentStep === 1
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400'
                  : emailVerified
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted/50 border-border text-muted-foreground'
              }`}
            >
              {emailVerified ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              ) : (
                <Mail className="w-4 h-4 shrink-0" />
              )}
              <span className="truncate">1. Email</span>
            </div>

            {/* Step 2 Pill */}
            <div
              className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all ${
                currentStep === 2
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400'
                  : passwordUpdated
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted/50 border-border text-muted-foreground'
              }`}
            >
              {passwordUpdated ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              ) : (
                <Lock className="w-4 h-4 shrink-0" />
              )}
              <span className="truncate">2. Password</span>
            </div>

            {/* Step 3 Pill */}
            <div
              className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all ${
                currentStep === 3
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400'
                  : 'bg-muted/50 border-border text-muted-foreground'
              }`}
            >
              <FileCheck2 className="w-4 h-4 shrink-0" />
              <span className="truncate">3. Agreement</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: CHANGE EMAIL */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  Update Your Email Address
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You can bind your personal email address now for notifications and security. If you are satisfied with your existing email, you may skip this step.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Current Registered Email</span>
                <p className="text-sm font-semibold text-foreground">{user.email}</p>
              </div>

              {!emailVerified ? (
                <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1.5">
                      New Email Address
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="e.g. yourname@gmail.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        disabled={otpSent || sendOtpMutation.isPending}
                        className="flex-1 text-xs"
                      />
                      {!otpSent ? (
                        <Button
                          type="button"
                          onClick={() => handleSendOtp()}
                          disabled={sendOtpMutation.isPending || !newEmail}
                          className="shrink-0 text-xs font-semibold gap-1.5"
                        >
                          {sendOtpMutation.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          Send OTP
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setOtpSent(false)
                            setOtpCode('')
                          }}
                          className="shrink-0 text-xs"
                        >
                          Change
                        </Button>
                      )}
                    </div>
                  </div>

                  {otpSent && (
                    <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground">
                          Enter 6-Digit Verification Code
                        </label>
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          disabled={sendOtpMutation.isPending}
                          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                        >
                          Resend Code
                        </button>
                      </div>
                      <Input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="text-center tracking-widest text-base font-mono font-bold"
                      />
                      <Button
                        type="submit"
                        disabled={verifyOtpMutation.isPending || otpCode.length !== 6}
                        className="w-full text-xs font-semibold gap-1.5"
                      >
                        {verifyOtpMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        Verify & Update Email
                      </Button>
                    </div>
                  )}
                </form>
              ) : (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Email Updated Successfully</h4>
                    <p className="text-[11px] text-muted-foreground">Your account is bound to {user.email}.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CHANGE PASSWORD */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-purple-500" />
                  Set Your New Password
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Choose a secure password for your future logins (minimum 8 characters). You may skip this step to keep your temporary password.
                </p>
              </div>

              {!passwordUpdated ? (
                <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground block">
                      New Password (min 8 characters)
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground block">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={updatePasswordMutation.isPending || newPassword.length < 8}
                    className="w-full text-xs font-semibold gap-1.5 mt-2"
                  >
                    {updatePasswordMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    Save & Set Password
                  </Button>
                </form>
              ) : (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Password Set Successfully</h4>
                    <p className="text-[11px] text-muted-foreground">You can now use your new password for all future logins.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: LEGAL AGREEMENT */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-500" />
                  Hostel Resident & Portal Agreement
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Please review and accept the official terms of residence, dining protocols, and portal usage policy.
                </p>
              </div>

              {/* Scrollable Terms Container */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-3 max-h-48 overflow-y-auto leading-relaxed">
                <p className="font-semibold text-foreground">1. Dining & Attendance Compliance</p>
                <p>
                  As a registered resident/member of MessPro, you agree to follow the designated meal schedules and scan dynamic QR or biometric terminal authentication during dining hours.
                </p>
                <p className="font-semibold text-foreground">2. Financial Responsibilities & Due Dates</p>
                <p>
                  Monthly mess bills and hostel residence dues must be cleared within the stipulated grace period to avoid suspension of dining services or room privileges.
                </p>
                <p className="font-semibold text-foreground">3. Account Integrity & Security</p>
                <p>
                  You are solely responsible for maintaining the confidentiality of your login credentials. Sharing biometric access, QR codes, or accounts is strictly prohibited.
                </p>
                <p className="font-semibold text-foreground">4. Maintenance & Grievance Redressal</p>
                <p>
                  Any maintenance complaints or service requests must be formally logged via the portal for SLA tracking and administrative transparency.
                </p>
              </div>

              {/* Mandatory Checkbox */}
              <div className="p-3.5 rounded-xl border border-border bg-card flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreementCheckbox"
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="agreementCheckbox" className="text-xs text-foreground leading-snug cursor-pointer font-medium">
                  I confirm that I have read, understood, and solemnly agree to adhere to all terms, code of conduct, and hostel regulations specified above.
                </label>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  Agreement cannot be skipped. If you decline these terms, you will be logged out.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-between gap-3">
          {currentStep === 1 && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(2)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Skip Email Update
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setCurrentStep(2)}
                className="text-xs font-semibold gap-1.5 cursor-pointer"
              >
                Continue to Password
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(3)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Skip Password Update
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setCurrentStep(3)}
                className="text-xs font-semibold gap-1.5 cursor-pointer"
              >
                Continue to Agreement
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </>
          )}

          {currentStep === 3 && (
            <>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDeclineAndLogout}
                disabled={logoutMutation.isPending}
                className="text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Decline & Log Out
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!agreementChecked || signAgreementMutation.isPending}
                onClick={handleAcceptAgreement}
                className="text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                {signAgreementMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                Accept & Enter Dashboard
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
