import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  BarChart3,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Store,
  User,
} from 'lucide-react'
import { authApi } from '../../shared/api'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

function GoogleButton({ onCredential }) {
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!googleClientId) return undefined
    let cancelled = false

    const renderButton = () => {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current) return
      buttonRef.current.replaceChildren()
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: ({ credential }) => onCredential(credential),
      })
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: Math.min(buttonRef.current.clientWidth, 400),
      })
    }

    const existing = document.querySelector('script[data-google-identity]')
    if (existing) {
      if (window.google) renderButton()
      else existing.addEventListener('load', renderButton, { once: true })
    } else {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.dataset.googleIdentity = 'true'
      script.addEventListener('load', renderButton, { once: true })
      document.head.appendChild(script)
    }

    return () => { cancelled = true }
  }, [onCredential])

  if (!googleClientId) return null
  return <div ref={buttonRef} className="flex min-h-11 w-full justify-center overflow-hidden" />
}

const Input = ({ icon: Icon, label, ...props }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-[#303640]">{label}</span>
    <span className="flex h-11 items-center gap-3 rounded-md border border-[#d9dde3] bg-white px-3 transition focus-within:border-[#f85606] focus-within:ring-1 focus-within:ring-[#fdd8c6]">
      <Icon size={17} className="shrink-0 text-[#788390]" />
      <input className="min-w-0 flex-1 bg-transparent text-sm text-[#151a21] outline-none placeholder:text-[#9ca4ae]" {...props} />
    </span>
  </label>
)

function AuthPanel({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', otp: '' })
  const [otpSent, setOtpSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const resetFeedback = () => {
    setError('')
    setNotice('')
  }

  const changeMode = (nextMode) => {
    resetFeedback()
    setOtpSent(false)
    setForm((current) => ({ ...current, otp: '' }))
    setMode(nextMode)
  }

  const run = async (action) => {
    resetFeedback()
    setLoading(true)
    try {
      await action()
    } catch (requestError) {
      setError(requestError.message)
      if (requestError.code === 'EMAIL_NOT_VERIFIED') setMode('verify')
    } finally {
      setLoading(false)
    }
  }

  const submit = (event) => {
    event.preventDefault()
    run(async () => {
      if (mode === 'register') {
        await authApi.register({ name: form.name, email: form.email, password: form.password })
        setMode('verify')
        setNotice('We sent a 6-digit code to your email.')
        return
      }
      if (mode === 'verify') {
        onAuthenticated(await authApi.verifyEmail({ email: form.email, otp: form.otp }))
        return
      }
      if (mode === 'otp') {
        if (!otpSent) {
          await authApi.requestOtp(form.email)
          setOtpSent(true)
          setNotice('Check your inbox for your sign-in code.')
        } else {
          onAuthenticated(await authApi.verifyOtp({ email: form.email, otp: form.otp }))
        }
        return
      }
      onAuthenticated(await authApi.login({ email: form.email, password: form.password }))
    })
  }

  const handleGoogle = useCallback(async (credential) => {
    setError('')
    setNotice('')
    setLoading(true)
    try {
      onAuthenticated(await authApi.google(credential))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [onAuthenticated])

  const title = {
    login: 'Welcome back',
    register: 'Create your workspace',
    verify: 'Verify your email',
    otp: otpSent ? 'Enter your code' : 'Sign in with a code',
  }[mode]

  return (
    <main className="min-h-screen bg-[#f4f6f8] p-3 sm:p-5">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-6xl overflow-hidden rounded-lg border border-[#dfe3e8] bg-white shadow-[0_18px_50px_rgba(27,35,45,0.08)] sm:min-h-[calc(100vh-40px)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#18232c] p-10 text-white lg:flex">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[#f85606]" />
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#f85606]">
              <Store size={19} strokeWidth={2.2} />
            </span>
            <span className="text-base font-semibold">SellerDesk</span>
          </div>

          <div className="max-w-md">
            <p className="mb-5 text-xs font-semibold uppercase text-[#f7a379]">Daraz operations</p>
            <h1 className="text-[42px] font-semibold leading-[1.15] text-white">
              Your seller account, clearly in view.
            </h1>
            <p className="mt-5 max-w-sm text-[15px] leading-7 text-[#b8c1c9]">
              Connect your store securely and keep the numbers that matter close at hand.
            </p>
          </div>

          <div className="grid grid-cols-3 border-y border-white/10 py-5">
            <div className="flex items-center gap-2.5 text-sm text-[#d9dfe4]">
              <ShieldCheck size={17} className="text-[#65c3a5]" /> Secure OAuth
            </div>
            <div className="flex items-center gap-2.5 text-sm text-[#d9dfe4]">
              <BarChart3 size={17} className="text-[#65c3a5]" /> Live stats
            </div>
            <div className="flex items-center gap-2.5 text-sm text-[#d9dfe4]">
              <Check size={17} className="text-[#65c3a5]" /> Easy control
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-9 sm:px-10 lg:px-16">
          <div className="w-full max-w-[400px]">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-[#f85606] text-white">
                <Store size={19} />
              </span>
              <span className="font-semibold text-[#18232c]">SellerDesk</span>
            </div>

            {(mode === 'verify' || mode === 'otp') && (
              <button type="button" onClick={() => changeMode('login')} className="mb-6 flex items-center gap-2 text-sm font-medium text-[#687480] hover:text-[#20262d]">
                <ArrowLeft size={16} /> Back to sign in
              </button>
            )}

            <h2 className="text-2xl font-semibold text-[#171c22]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#707b86]">
              {mode === 'register' && 'Start with your business email.'}
              {mode === 'login' && 'Sign in to manage your connected store.'}
              {mode === 'verify' && `Enter the code sent to ${form.email || 'your email'}.`}
              {mode === 'otp' && (otpSent ? `We sent a code to ${form.email}.` : 'Use a one-time code instead of your password.')}
            </p>

            <form onSubmit={submit} className="mt-7 space-y-5">
              {mode === 'register' && (
                <Input icon={User} label="Full name" value={form.name} onChange={update('name')} placeholder="Your name" autoComplete="name" required />
              )}

              {(mode === 'login' || mode === 'register' || (mode === 'otp' && !otpSent)) && (
                <Input icon={Mail} label="Email address" type="email" value={form.email} onChange={update('email')} placeholder="name@company.com" autoComplete="email" required />
              )}

              {(mode === 'login' || mode === 'register') && (
                <div>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[#303640]">Password</span>
                    <span className="flex h-11 items-center gap-3 rounded-md border border-[#d9dde3] bg-white px-3 transition focus-within:border-[#f85606] focus-within:ring-1 focus-within:ring-[#fdd8c6]">
                      <LockKeyhole size={17} className="shrink-0 text-[#788390]" />
                      <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={8} required className="min-w-0 flex-1 bg-transparent text-sm text-[#151a21] outline-none placeholder:text-[#9ca4ae]" />
                      <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-[#788390] hover:text-[#303640]" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </span>
                  </label>
                </div>
              )}

              {(mode === 'verify' || (mode === 'otp' && otpSent)) && (
                <Input icon={KeyRound} label="6-digit code" value={form.otp} onChange={update('otp')} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" autoComplete="one-time-code" required />
              )}

              {error && <div role="alert" className="rounded-md border border-[#f1c8bd] bg-[#fff5f2] px-3 py-2.5 text-sm text-[#9a341f]">{error}</div>}
              {notice && <div className="rounded-md border border-[#bde1d5] bg-[#f0faf6] px-3 py-2.5 text-sm text-[#236b55]">{notice}</div>}

              <button disabled={loading} className="flex h-11 w-full items-center justify-center rounded-md bg-[#f85606] px-4 text-sm font-semibold text-white transition hover:bg-[#dd4c04] disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Please wait...' : mode === 'register' ? 'Create account' : mode === 'verify' ? 'Verify and continue' : mode === 'otp' ? (otpSent ? 'Verify and sign in' : 'Send sign-in code') : 'Sign in'}
              </button>
            </form>

            {mode === 'login' && (
              <>
                <button type="button" onClick={() => changeMode('otp')} className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-medium text-[#53606c] hover:text-[#1e252c]">
                  <KeyRound size={16} /> Sign in with email code
                </button>
                {googleClientId && (
                  <div className="my-6 flex items-center gap-3 text-xs text-[#9199a2] before:h-px before:flex-1 before:bg-[#e2e5e9] after:h-px after:flex-1 after:bg-[#e2e5e9]">or</div>
                )}
                <GoogleButton onCredential={handleGoogle} />
              </>
            )}

            {(mode === 'login' || mode === 'register') && (
              <p className="mt-7 text-center text-sm text-[#707b86]">
                {mode === 'login' ? 'New to SellerDesk?' : 'Already have an account?'}{' '}
                <button type="button" onClick={() => changeMode(mode === 'login' ? 'register' : 'login')} className="font-semibold text-[#2e3943] hover:text-[#f85606]">
                  {mode === 'login' ? 'Create account' : 'Sign in'}
                </button>
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default AuthPanel
