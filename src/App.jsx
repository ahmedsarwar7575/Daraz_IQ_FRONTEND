import { useCallback, useEffect, useState } from 'react'
import AuthPanel from './features/auth/AuthPanel'
import Dashboard from './features/dashboard/Dashboard'
import { SESSION_EXPIRED_EVENT, authApi, clearSession, getSessionToken, getSessionUser, saveSession } from './shared/api'

function App() {
  const [session, setSession] = useState(() => {
    const token = getSessionToken()
    const cachedUser = token ? getSessionUser() : null
    return {
      loading: Boolean(token && !cachedUser),
      user: cachedUser,
    }
  })

  useEffect(() => {
    const token = getSessionToken()
    if (!token) return
    authApi.me()
      .then(({ user }) => {
        saveSession(token, user)
        setSession({ loading: false, user })
      })
      .catch((error) => {
        if (error.status === 401) {
          clearSession()
          setSession({ loading: false, user: null })
          return
        }
        setSession((current) => ({ ...current, loading: false }))
      })
  }, [])

  useEffect(() => {
    const expireSession = () => {
      clearSession()
      setSession({ loading: false, user: null })
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, expireSession)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expireSession)
  }, [])

  const handleAuthenticated = useCallback(({ token, user }) => {
    saveSession(token, user)
    setSession({ loading: false, user })
  }, [])

  const handleLogout = () => {
    clearSession()
    setSession({ loading: false, user: null })
  }

  if (session.loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8fa]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d9dde3] border-t-[#f85606]" />
      </main>
    )
  }

  return session.user
    ? <Dashboard user={session.user} onLogout={handleLogout} />
    : <AuthPanel onAuthenticated={handleAuthenticated} />
}

export default App
