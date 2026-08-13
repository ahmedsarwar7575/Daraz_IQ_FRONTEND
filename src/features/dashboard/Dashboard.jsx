import { useCallback, useEffect, useState } from 'react'
import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Gauge,
  LayoutDashboard,
  LogOut,
  Package,
  PlugZap,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Unplug,
  X,
} from 'lucide-react'
import { darazApi } from '../../shared/api'
import Copilot from '../copilot/Copilot'
import SettingsPanel from '../settings/Settings'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'Workspace' },
  { id: 'store', label: 'Store Analyst', icon: BarChart3, group: 'Tools' },
  { id: 'product', label: 'Product Lab', icon: Search, group: 'Tools' },
  { id: 'pricing', label: 'Pricing Control', icon: Gauge, group: 'Tools' },
  { id: 'mcp', label: 'MCP Access', icon: Server, group: 'Tools' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'System' },
]

const formatDate = (value, withTime = false) => {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(value))
}

const Metric = ({ icon: Icon, label, value, detail, tone }) => (
  <article className="min-w-0 border border-[#dfe3e8] bg-white p-5 shadow-[0_10px_28px_rgba(21,26,33,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cfd6dd] hover:shadow-[0_18px_36px_rgba(21,26,33,0.08)]">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#66717c]">{label}</p>
        <p className="mt-3 text-[28px] font-semibold text-[#171c22]">{value ?? '-'}</p>
        <p className="mt-1 truncate text-xs text-[#8a939d]">{detail}</p>
      </div>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${tone}`}>
        <Icon size={18} />
      </span>
    </div>
  </article>
)

function Dashboard({ user, onLogout }) {
  const initialNotice = new URLSearchParams(window.location.search).get('daraz') === 'connected'
    ? 'Daraz account connected successfully.'
    : ''
  const initialError = new URLSearchParams(window.location.search).get('daraz') === 'error'
    ? new URLSearchParams(window.location.search).get('message') || 'Daraz connection failed.'
    : ''
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [notice, setNotice] = useState(initialNotice)
  const [error, setError] = useState(initialError)
  const [view, setView] = useState('overview')

  const loadStatus = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setStatus(await darazApi.status())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    if (window.location.search) window.history.replaceState({}, '', window.location.pathname)
    darazApi.status()
      .then((result) => {
        if (active) setStatus(result)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const connect = async () => {
    setWorking(true)
    setError('')
    try {
      const { authorizationUrl } = await darazApi.connect()
      window.location.assign(authorizationUrl)
    } catch (requestError) {
      setError(requestError.message)
      setWorking(false)
    }
  }

  const disconnect = async () => {
    if (!window.confirm('Disconnect this Daraz account? Stored access tokens will be removed.')) return
    setWorking(true)
    setError('')
    try {
      await darazApi.disconnect()
      setStatus({ connected: false })
      setNotice('Daraz account disconnected.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setWorking(false)
    }
  }

  const connection = status?.connection
  const stats = status?.stats
  const navClass = (target) => `flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-sm font-medium transition duration-200 ${
    view === target
      ? 'bg-[#171c22] text-white shadow-sm'
      : 'text-[#6f7983] hover:bg-[#f4f6f8] hover:text-[#1f2933]'
  }`
  const mobileNavClass = (target) => `grid h-9 w-9 cursor-pointer place-items-center rounded-md transition ${
    view === target
      ? 'bg-[#f85606] text-white'
      : 'text-[#66717c] hover:bg-[#f1f3f5] hover:text-[#262d34]'
  }`
  const groupedNav = navItems.reduce((groups, item) => {
    groups[item.group] = [...(groups[item.group] || []), item]
    return groups
  }, {})

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#171c22]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[272px] border-r border-[#dfe3e8] bg-white lg:flex lg:flex-col">
        <div className="flex h-[72px] items-center gap-3 border-b border-[#e3e6ea] px-6">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#f85606] text-white shadow-sm"><Store size={18} /></span>
          <div className="min-w-0">
            <span className="block font-semibold">SellerDesk</span>
            <span className="block text-xs text-[#7c8690]">Daraz operations</span>
          </div>
        </div>
        <nav className="flex-1 space-y-5 px-3 py-5">
          {Object.entries(groupedNav).map(([group, items]) => (
            <div key={group}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase text-[#98a0a9]">{group}</p>
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon
                  return (
                    <button key={item.id} onClick={() => setView(item.id)} className={navClass(item.id)}>
                      <Icon size={17} /> {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-[#e3e6ea] p-4">
          <div className="flex items-center gap-3">
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
              : <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e8eef2] text-sm font-semibold text-[#46545f]">{user.name.charAt(0).toUpperCase()}</span>}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-[#7e8791]">{user.email}</p>
            </div>
            <button onClick={onLogout} aria-label="Sign out" title="Sign out" className="grid h-8 w-8 cursor-pointer place-items-center rounded-md text-[#7c8690] transition hover:bg-[#f1f3f5] hover:text-[#262d34]">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[272px]">
        <header className="flex h-16 items-center justify-between border-b border-[#dfe3e8] bg-white px-5 sm:px-8 lg:hidden">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-[#f85606] text-white"><Store size={17} /></span>
            <span className="font-semibold">SellerDesk</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto rounded-md border border-[#dfe3e8] bg-white p-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button key={item.id} onClick={() => setView(item.id)} title={item.label} aria-label={item.label} className={mobileNavClass(item.id)}>
                  <Icon size={16} />
                </button>
              )
            })}
          </div>
          <button onClick={onLogout} aria-label="Sign out" className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border border-[#dfe3e8] text-[#66717c] transition hover:bg-[#f8f9fa]"><LogOut size={17} /></button>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
          {view === 'settings' ? (
            <SettingsPanel user={user} />
          ) : ['store', 'product', 'pricing', 'mcp'].includes(view) ? (
            <Copilot connected={Boolean(status?.connected)} user={user} initialFeature={view} showSwitcher={false} />
          ) : (
            <>
              <div className="flex flex-col justify-between gap-4 border-b border-[#dfe3e8] pb-6 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase text-[#8a939c]">Dashboard</p>
                  <h1 className="mt-2 text-2xl font-semibold text-[#171c22]">Seller overview</h1>
                  <p className="mt-1.5 text-sm text-[#727d87]">Monitor your connected Daraz account.</p>
                </div>
                {status?.connected && (
                  <button onClick={loadStatus} disabled={loading} className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#d5dae0] bg-white px-3.5 text-sm font-medium text-[#3f4953] transition hover:-translate-y-0.5 hover:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:opacity-60">
                    <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
                  </button>
                )}
              </div>

              {(notice || error) && (
                <div className={`mt-5 flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${error ? 'border-[#efc9c1] bg-[#fff6f3] text-[#983720]' : 'border-[#b9dfd2] bg-[#f1faf7] text-[#236b55]'}`}>
                  {error ? <CircleAlert size={17} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={17} className="mt-0.5 shrink-0" />}
                  <span className="flex-1">{error || notice}</span>
                  <button onClick={() => { setError(''); setNotice('') }} aria-label="Dismiss message" className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded text-current hover:bg-black/5"><X size={14} /></button>
                </div>
              )}

              {loading && !status ? (
                <div className="grid min-h-[420px] place-items-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d9dde3] border-t-[#f85606]" />
                </div>
              ) : status?.connected ? (
                <>
                  <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric icon={ShoppingBag} label="Orders" value={stats?.ordersLast30Days} detail="Last 30 days" tone="bg-[#fff1ea] text-[#d94c06]" />
                    <Metric icon={Package} label="Products" value={stats?.products} detail="All catalog items" tone="bg-[#edf5fb] text-[#3477a6]" />
                    <Metric icon={ShieldCheck} label="Data sources" value={`${stats?.synced ?? 0}/${stats?.totalSources ?? 3}`} detail="Synced successfully" tone="bg-[#edf8f4] text-[#2b8469]" />
                    <Metric icon={Clock3} label="Last sync" value={stats?.lastSyncedAt ? new Date(stats.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'} detail={formatDate(stats?.lastSyncedAt)} tone="bg-[#f2f0f8] text-[#695aa3]" />
                  </section>

                  <section className="mt-7 overflow-hidden border border-[#dfe3e8] bg-white shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
                    <div className="flex flex-col justify-between gap-4 border-b border-[#e2e5e9] px-5 py-4 sm:flex-row sm:items-center">
                      <div>
                        <h2 className="text-base font-semibold">Connected account</h2>
                        <p className="mt-1 text-xs text-[#7c8690]">Daraz Open Platform</p>
                      </div>
                      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#edf8f4] px-3 py-1 text-xs font-semibold text-[#26735b]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#35a17e]" /> Connected
                      </span>
                    </div>
                    <div className="grid gap-px bg-[#e5e8eb] sm:grid-cols-2 lg:grid-cols-4">
                      <div className="bg-white px-5 py-5">
                        <p className="text-xs font-medium text-[#858e97]">Seller</p>
                        <p className="mt-2 truncate text-sm font-semibold">{connection?.sellerName || 'Daraz seller'}</p>
                      </div>
                      <div className="bg-white px-5 py-5">
                        <p className="text-xs font-medium text-[#858e97]">Seller ID</p>
                        <p className="mt-2 truncate text-sm font-semibold">{connection?.sellerId || 'Not provided'}</p>
                      </div>
                      <div className="bg-white px-5 py-5">
                        <p className="text-xs font-medium text-[#858e97]">Market</p>
                        <p className="mt-2 truncate text-sm font-semibold">{connection?.country || connection?.accountPlatform || 'Daraz'}</p>
                      </div>
                      <div className="bg-white px-5 py-5">
                        <p className="text-xs font-medium text-[#858e97]">Connected on</p>
                        <p className="mt-2 truncate text-sm font-semibold">{formatDate(connection?.connectedAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between gap-4 border-t border-[#e2e5e9] px-5 py-4 sm:flex-row sm:items-center">
                      <p className="text-xs text-[#7e8791]">Access credentials are encrypted at rest.</p>
                      <button onClick={disconnect} disabled={working} className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#e1b8ae] px-3.5 text-sm font-medium text-[#a33a22] transition hover:-translate-y-0.5 hover:bg-[#fff6f3] disabled:cursor-not-allowed disabled:opacity-60">
                        <Unplug size={15} /> Disconnect account
                      </button>
                    </div>
                  </section>
                </>
              ) : (
                <section className="mt-7 overflow-hidden border border-[#dfe3e8] bg-white shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
                  <div className="grid lg:grid-cols-[1fr_320px]">
                    <div className="p-7 sm:p-10">
                      <span className="grid h-11 w-11 place-items-center rounded-md bg-[#fff0e8] text-[#e34d03]"><PlugZap size={21} /></span>
                      <h2 className="mt-6 text-xl font-semibold">Connect your Daraz seller account</h2>
                      <p className="mt-3 max-w-lg text-sm leading-6 text-[#707b86]">
                        Authorize SellerDesk through Daraz to view seller details, order volume, and product totals.
                      </p>
                      <button onClick={connect} disabled={working} className="mt-7 flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#f85606] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#dd4c04] disabled:cursor-not-allowed disabled:opacity-60">
                        {working ? 'Opening Daraz...' : 'Connect Daraz'} <ChevronRight size={16} />
                      </button>
                    </div>
                    <div className="border-t border-[#e2e5e9] bg-[#f8f9fa] p-7 lg:border-l lg:border-t-0">
                      <p className="text-xs font-semibold uppercase text-[#8b949d]">Connection scope</p>
                      <div className="mt-5 space-y-4">
                        {['Seller profile', 'Orders summary', 'Product catalog'].map((label) => (
                          <div key={label} className="flex items-center gap-3 text-sm text-[#505b65]">
                            <CheckCircle2 size={17} className="text-[#399477]" /> {label}
                          </div>
                        ))}
                      </div>
                      <p className="mt-7 border-t border-[#dde1e5] pt-5 text-xs leading-5 text-[#7c8690]">
                        You can disconnect the account and remove stored credentials at any time.
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          <footer className="mt-8 flex items-center gap-2 text-xs text-[#8a939c]">
            <BarChart3 size={14} /> SellerDesk workspace
          </footer>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
