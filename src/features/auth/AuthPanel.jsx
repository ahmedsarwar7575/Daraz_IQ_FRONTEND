import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react'
import { authApi } from '../../shared/api'
import { Brand } from '../../shared/ui'
import CommerceScene from '../marketing/CommerceScene'
import './AuthPanel.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

function GoogleButton({ onCredential }) {
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!googleClientId) return undefined
    let cancelled = false

    const renderButton = () => {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current)
        return
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

    return () => {
      cancelled = true
    }
  }, [onCredential])

  if (!googleClientId) return null
  return (
    <div
      ref={buttonRef}
      className="flex min-h-11 w-full justify-center overflow-hidden"
    />
  )
}

const Input = ({ icon: Icon, label, ...props }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-[#303640]">
      {label}
    </span>
    <span className="flex h-11 items-center gap-3 rounded-md border border-[#d8dde3] bg-white px-3 transition focus-within:border-[#9aa4b2] focus-within:ring-2 focus-within:ring-[#edf0f3]">
      <Icon size={17} className="shrink-0 text-[#7b8491]" />
      <input
        className="min-w-0 flex-1 bg-transparent text-sm text-[#15181d] outline-none placeholder:text-[#98a2b3]"
        {...props}
      />
    </span>
  </label>
)

function AuthPanel({ initialMode = 'login', onBackHome, onAuthenticated }) {
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
  })
  const [otpSent, setOtpSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    document.title = `${mode === 'register' ? 'Create account' : mode === 'verify' ? 'Verify email' : 'Sign in'} | Daraz IQ`
  }, [mode])

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
        await authApi.register({
          name: form.name,
          email: form.email,
          password: form.password,
        })
        setMode('verify')
        setNotice('We sent a 6-digit code to your email.')
        return
      }
      if (mode === 'verify') {
        onAuthenticated(
          await authApi.verifyEmail({ email: form.email, otp: form.otp }),
        )
        return
      }
      if (mode === 'otp') {
        if (!otpSent) {
          await authApi.requestOtp(form.email)
          setOtpSent(true)
          setNotice('Check your inbox for your sign-in code.')
        } else {
          onAuthenticated(
            await authApi.verifyOtp({ email: form.email, otp: form.otp }),
          )
        }
        return
      }
      onAuthenticated(
        await authApi.login({ email: form.email, password: form.password }),
      )
    })
  }

  const handleGoogle = useCallback(
    async (credential) => {
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
    },
    [onAuthenticated],
  )

  const title = {
    login: 'Welcome back',
    register: 'Create your workspace',
    verify: 'Verify your email',
    otp: otpSent ? 'Enter your code' : 'Sign in with a code',
  }[mode]

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-story" aria-label="Daraz IQ">
          <a
            href="/"
            onClick={(event) => {
              event.preventDefault()
              onBackHome()
            }}
          >
            <Brand />
          </a>
          <div className="auth-story-copy">
            <span>YOUR AMBITION, MEET YOUR TOOLKIT</span>
            <p className="auth-story-title">
              Big plans.
              <br />
              <span>A better next move.</span>
            </p>
            <p>
              A little intelligence for everything you sell. Your Daraz
              business, with a clearer path forward.
            </p>
          </div>
          <div className="auth-scene-stage">
            <CommerceScene variant="auth" />
          </div>
          <p className="auth-trust">
            <ShieldCheck size={18} /> Daraz authorization. Encrypted
            credentials. Your control.
          </p>
        </section>

        <section className="auth-form-section">
          <div className="w-full max-w-[400px]">
            <div className="auth-mobile-brand mb-8 flex items-center justify-between gap-3 lg:hidden">
              <Brand />
              <img src="/seller-toolkit-3d.png" alt="" width="80" height="80" />
            </div>

            {onBackHome && mode !== 'verify' && (
              <button
                type="button"
                onClick={onBackHome}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-[#687480] hover:text-[#20262d]"
              >
                <ArrowLeft size={16} /> Back to home
              </button>
            )}

            {(mode === 'verify' || mode === 'otp') && (
              <button
                type="button"
                onClick={() => changeMode('login')}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-[#687480] hover:text-[#20262d]"
              >
                <ArrowLeft size={16} /> Back to sign in
              </button>
            )}

            <h1 className="text-2xl font-semibold text-[#15181d]">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              {mode === 'register' && 'Start with your business email.'}
              {mode === 'login' && 'Sign in to manage your connected store.'}
              {mode === 'verify' &&
                `Enter the code sent to ${form.email || 'your email'}.`}
              {mode === 'otp' &&
                (otpSent
                  ? `We sent a code to ${form.email}.`
                  : 'Use a one-time code instead of your password.')}
            </p>

            <form
              onSubmit={submit}
              className="mt-7 space-y-5"
              aria-busy={loading}
            >
              <fieldset disabled={loading} className="space-y-5">
                {mode === 'register' && (
                  <Input
                    icon={User}
                    label="Full name"
                    name="name"
                    value={form.name}
                    onChange={update('name')}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />
                )}

                {(mode === 'login' ||
                  mode === 'register' ||
                  (mode === 'otp' && !otpSent)) && (
                  <Input
                    icon={Mail}
                    label="Email address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                )}

                {(mode === 'login' || mode === 'register') && (
                  <div>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#303640]">
                        Password
                      </span>
                      <span className="flex h-11 items-center gap-3 rounded-md border border-[#d8dde3] bg-white px-3 transition focus-within:border-[#9aa4b2] focus-within:ring-2 focus-within:ring-[#edf0f3]">
                        <LockKeyhole
                          size={17}
                          className="shrink-0 text-[#7b8491]"
                        />
                        <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={form.password}
                          onChange={update('password')}
                          placeholder={
                            mode === 'register'
                              ? 'At least 8 characters'
                              : 'Your password'
                          }
                          autoComplete={
                            mode === 'register'
                              ? 'new-password'
                              : 'current-password'
                          }
                          minLength={8}
                          required
                          className="min-w-0 flex-1 bg-transparent text-sm text-[#15181d] outline-none placeholder:text-[#98a2b3]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          className="text-[#7b8491] hover:text-[#303640]"
                          aria-label={
                            showPassword ? 'Hide password' : 'Show password'
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </span>
                    </label>
                  </div>
                )}

                {(mode === 'verify' || (mode === 'otp' && otpSent)) && (
                  <Input
                    icon={KeyRound}
                    label="6-digit code"
                    value={form.otp}
                    onChange={update('otp')}
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000"
                    autoComplete="one-time-code"
                    required
                  />
                )}

                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-[#f2c6bc] bg-[#fff8f6] px-3 py-2.5 text-sm text-[#9a341f]"
                  >
                    {error}
                  </div>
                )}
                {notice && (
                  <div
                    role="status"
                    className="rounded-lg border border-[#bde1d5] bg-[#f4fbf8] px-3 py-2.5 text-sm text-[#236b55]"
                  >
                    {notice}
                  </div>
                )}

                <button
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center rounded-md bg-[#20252c] px-4 text-sm font-semibold text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? 'Please wait...'
                    : mode === 'register'
                      ? 'Create account'
                      : mode === 'verify'
                        ? 'Verify and continue'
                        : mode === 'otp'
                          ? otpSent
                            ? 'Verify and sign in'
                            : 'Send sign-in code'
                          : 'Sign in'}
                </button>
              </fieldset>
            </form>

            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => changeMode('otp')}
                  className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-medium text-[#53606c] hover:text-[#1e252c]"
                >
                  <KeyRound size={16} /> Sign in with email code
                </button>
                {googleClientId && (
                  <div className="my-6 flex items-center gap-3 text-xs text-[#9199a2] before:h-px before:flex-1 before:bg-[#e2e5e9] after:h-px after:flex-1 after:bg-[#e2e5e9]">
                    or
                  </div>
                )}
                <GoogleButton onCredential={handleGoogle} />
              </>
            )}

            {(mode === 'login' || mode === 'register') && (
              <p className="mt-7 text-center text-sm text-[#626b74]">
                {mode === 'login'
                  ? 'New to daraziq.store?'
                  : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() =>
                    changeMode(mode === 'login' ? 'register' : 'login')
                  }
                  className="font-semibold text-[#2e3943] hover:text-[#f85606]"
                >
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
