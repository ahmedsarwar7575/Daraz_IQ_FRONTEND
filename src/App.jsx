import { useCallback, useEffect, useState } from 'react'
import AuthPanel from './features/auth/AuthPanel'
import Dashboard from './features/dashboard/Dashboard'
import HomePage from './features/home/HomePage'
import { SESSION_EXPIRED_EVENT, authApi, clearSession, getSessionToken, getSessionUser, saveSession } from './shared/api'

const publicRoutes = new Set(['home', 'services', 'about', 'contact', 'privacy', 'terms', 'login', 'register'])

const readPublicRoute = () => {
  const route = window.location.pathname.replace(/^\/+|\/+$/g, '') || 'home'
  return publicRoutes.has(route) ? route : 'home'
}

const routePath = (route) => route === 'home' ? '/' : `/${route}`

function App() {
  const [publicRoute, setPublicRoute] = useState(readPublicRoute)
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

  useEffect(() => {
    const syncRoute = () => setPublicRoute(readPublicRoute())
    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  useEffect(() => {
    if (session.user && !window.location.pathname.startsWith('/dashboard')) {
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [session.user])

  const handleAuthenticated = useCallback(({ token, user }) => {
    saveSession(token, user)
    window.history.pushState({}, '', '/dashboard')
    setSession({ loading: false, user })
  }, [])

  const handleLogout = () => {
    clearSession()
    navigatePublic('home')
    setSession({ loading: false, user: null })
  }

  const navigatePublic = (route) => {
    const nextRoute = publicRoutes.has(route) ? route : 'home'
    const nextPath = routePath(nextRoute)
    if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath)
    setPublicRoute(nextRoute)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openAuth = (mode) => navigatePublic(mode)

  if (session.loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f9f6]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d9e1e8] border-t-[#2166a5]" />
      </main>
    )
  }

  if (session.user) return <Dashboard user={session.user} onLogout={handleLogout} />

  return ['login', 'register'].includes(publicRoute)
    ? (
      <AuthPanel
        key={publicRoute}
        initialMode={publicRoute}
        onBackHome={() => navigatePublic('home')}
        onAuthenticated={handleAuthenticated}
      />
    )
    : (
      <HomePage
        page={publicRoute}
        onNavigate={navigatePublic}
        onLogin={() => openAuth('login')}
        onGetStarted={() => openAuth('register')}
      />
    )
}

export default App
