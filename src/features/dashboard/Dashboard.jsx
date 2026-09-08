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
  PieChart,
  PlugZap,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Trophy,
  Unplug,
  X,
} from 'lucide-react'
import { darazApi } from '../../shared/api'
import Copilot from '../copilot/Copilot'
import SettingsPanel from '../settings/Settings'
import './DashboardTheme.css'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'store', label: 'Store Analyst', icon: BarChart3 },
  { id: 'product', label: 'Product Lab', icon: Search },
  { id: 'pricing', label: 'Pricing Control', icon: Gauge },
  { id: 'mcp', label: 'MCP Access', icon: Server },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const dashboardPaths = {
  overview: '/dashboard',
  store: '/dashboard/store',
  product: '/dashboard/product',
  pricing: '/dashboard/pricing',
  mcp: '/dashboard/mcp',
  settings: '/dashboard/settings',
}

const readDashboardView = () => {
  const match = Object.entries(dashboardPaths).find(([, path]) => window.location.pathname === path)
  return match?.[0] || 'overview'
}

const formatDate = (value, withTime = false) => {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(value))
}

const formatNumber = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return '-'
  return new Intl.NumberFormat('en').format(number)
}

const BrandMark = ({ compact = false }) => (
  <div className="flex min-w-0 items-center gap-3">
    <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
      <img src="/favicon.svg" alt="" className="h-full w-full object-cover object-center" />
    </span>
    {!compact && (
      <div className="min-w-0">
        <span className="block truncate text-sm font-semibold text-[#15181d]">daraziq.store</span>
        <span className="block truncate text-xs text-[#7b8491]">Seller workspace</span>
      </div>
    )}
  </div>
)

const Metric = ({ icon: Icon, label, value, detail, description, tone }) => (
  <article className="min-w-0 rounded-lg border border-[#e5e7eb] bg-white p-4">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase text-[#8a94a3]">{label}</p>
        <p className="mt-3 truncate text-2xl font-semibold text-[#15181d]">{value ?? '-'}</p>
        <p className="mt-1 truncate text-xs text-[#667085]">{detail}</p>
        {description && <p className="sr-only">{description}</p>}
      </div>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tone || 'bg-[#f5f6f8] text-[#667085]'}`}>
        <Icon size={18} />
      </span>
    </div>
  </article>
)

const EmptyState = ({ children }) => (
  <div className="grid min-h-[160px] place-items-center rounded-lg border border-dashed border-[#d8dde3] bg-[#fafbfc] px-5 text-center text-sm text-[#667085]">
    {children}
  </div>
)

const MiniBars = ({ items = [], valueKey = 'orders' }) => {
  const max = Math.max(1, ...items.map((item) => Number(item[valueKey]) || 0))
  if (!items.some((item) => Number(item[valueKey]) > 0)) return <EmptyState>No order activity in this range yet.</EmptyState>
  return (
    <div className="flex h-48 items-end gap-1.5 rounded-lg border border-[#e5e7eb] bg-[#fafbfc] px-3 py-3">
      {items.map((item) => {
        const value = Number(item[valueKey]) || 0
        return (
          <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-40 w-full items-end">
              <div
                className="w-full rounded-t-sm bg-[#f85606] transition hover:bg-[#db4d05]"
                title={`${item.date}: ${value} orders`}
                style={{ height: `${Math.max(3, (value / max) * 100)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

const PieBreakdown = ({ items = [] }) => {
  const total = items.reduce((sum, item) => sum + (Number(item.count) || 0), 0)
  if (!total) return <EmptyState>No status breakdown available yet.</EmptyState>
  const palette = ['#f85606', '#2f6f9f', '#27745d', '#d6a21b', '#6b5aa3']
  const gradient = items.map((item, index) => {
    const start = items.slice(0, index).reduce((sum, entry) => sum + ((Number(entry.count) || 0) / total) * 100, 0)
    const end = start + ((Number(item.count) || 0) / total) * 100
    return `${palette[index % palette.length]} ${start}% ${end}%`
  }).join(', ')

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="h-32 w-32 shrink-0 rounded-full border border-[#e5e7eb]" style={{ background: `conic-gradient(${gradient})` }} />
      <div className="min-w-0 flex-1 space-y-2">
        {items.map((item, index) => (
          <div key={item.status} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-[#4d5863]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
              <span className="truncate capitalize">{item.status}</span>
            </span>
            <span className="font-semibold text-[#15181d]">{formatNumber(item.count)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const TopProducts = ({ items = [] }) => {
  if (!items.length) return <EmptyState>No hit-selling product yet because this account has no item-level order data in the selected period.</EmptyState>
  return (
    <div className="divide-y divide-[#eef0f2] rounded-md border border-[#e1e5e9] bg-white">
      {items.map((item, index) => (
          <div key={`${item.sku || item.title}-${index}`} className="flex items-center gap-3 px-4 py-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#f5f6f8] text-sm font-semibold text-[#4b5563]">{index + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#242b33]">{item.title}</p>
            <p className="mt-0.5 truncate text-xs text-[#8a94a3]">{item.sku || 'No SKU'} · {formatNumber(item.units)} units</p>
          </div>
          <span className="text-sm font-semibold text-[#15181d]">{formatNumber(item.orders)}</span>
        </div>
      ))}
    </div>
  )
}

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
  const [view, setView] = useState(readDashboardView)

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

  useEffect(() => {
    const syncView = () => setView(readDashboardView())
    window.addEventListener('popstate', syncView)
    return () => window.removeEventListener('popstate', syncView)
  }, [])

  const changeView = (target) => {
    const nextPath = dashboardPaths[target] || dashboardPaths.overview
    if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath)
    setView(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const connection = status?.connection
  const stats = status?.stats
  const navClass = (target) => `flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-sm font-medium transition duration-200 ${
    view === target
      ? 'bg-[#20252c] text-white'
      : 'text-[#667085] hover:bg-[#f3f4f6] hover:text-[#20252c]'
  }`
  const mobileNavClass = (target) => `grid h-9 min-w-9 flex-1 cursor-pointer place-items-center rounded-md transition ${
    view === target
      ? 'bg-[#20252c] text-white'
      : 'text-[#667085] hover:bg-[#f3f4f6] hover:text-[#20252c]'
  }`

  return (
    <div className="seller-console min-h-screen bg-[#f7f8fa] text-[#15181d]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[248px] border-r border-[#e5e7eb] bg-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-[#eef0f2] px-5">
          <BrandMark />
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button key={item.id} onClick={() => changeView(item.id)} className={navClass(item.id)}>
                <Icon size={17} /> {item.label}
              </button>
            )
          })}
        </nav>
        <div className="border-t border-[#eef0f2] p-4">
          <div className="flex items-center gap-3">
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
              : <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f0f2f4] text-sm font-semibold text-[#4b5563]">{user.name.charAt(0).toUpperCase()}</span>}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#15181d]">{user.name}</p>
              <p className="truncate text-xs text-[#8a94a3]">{user.email}</p>
            </div>
            <button onClick={onLogout} aria-label="Sign out" title="Sign out" className="grid h-8 w-8 cursor-pointer place-items-center rounded-md text-[#667085] transition hover:bg-[#f3f4f6] hover:text-[#20252c]">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="border-b border-[#e5e7eb] bg-white px-4 py-3 sm:px-6 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <BrandMark compact />
              <span className="truncate font-semibold text-[#15181d]">daraziq.store</span>
            </div>
            <button onClick={onLogout} aria-label="Sign out" className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-md border border-[#e5e7eb] text-[#667085] transition hover:bg-[#f3f4f6]"><LogOut size={17} /></button>
          </div>
          <div className="app-scrollbar mt-3 flex items-center gap-1 overflow-x-auto rounded-lg border border-[#e5e7eb] bg-white p-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button key={item.id} onClick={() => changeView(item.id)} title={item.label} aria-label={item.label} className={mobileNavClass(item.id)}>
                  <Icon size={16} />
                </button>
              )
            })}
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {view === 'settings' ? (
            <SettingsPanel user={user} />
          ) : ['store', 'product', 'pricing', 'mcp'].includes(view) ? (
            <Copilot connected={Boolean(status?.connected)} user={user} initialFeature={view} showSwitcher={false} />
          ) : (
            <>
              <div className="flex flex-col justify-between gap-4 border-b border-[#e5e7eb] pb-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-medium uppercase text-[#8a94a3]">Dashboard</p>
                  <h1 className="mt-2 text-2xl font-semibold text-[#15181d]">Seller overview</h1>
                  <p className="mt-1.5 max-w-2xl text-sm text-[#667085]">Track store connection, orders, catalog health, and the next workflows from one place.</p>
                </div>
                {status?.connected && (
                  <button onClick={loadStatus} disabled={loading} className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#d8dde3] bg-white px-3.5 text-sm font-medium text-[#344054] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60">
                    <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
                  </button>
                )}
              </div>

              {(notice || error) && (
                <div className={`mt-5 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${error ? 'border-[#f2c6bc] bg-[#fff8f6] text-[#983720]' : 'border-[#b9dfd2] bg-[#f4fbf8] text-[#236b55]'}`}>
                  {error ? <CircleAlert size={17} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={17} className="mt-0.5 shrink-0" />}
                  <span className="flex-1">{error || notice}</span>
                  <button onClick={() => { setError(''); setNotice('') }} aria-label="Dismiss message" className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded text-current hover:bg-black/5"><X size={14} /></button>
                </div>
              )}

              {loading && !status ? (
                <div className="grid min-h-[420px] place-items-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d8dde3] border-t-[#20252c]" />
                </div>
              ) : status?.connected ? (
                <>
                  <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric icon={ShoppingBag} label="Orders" value={formatNumber(stats?.ordersLast30Days)} detail="Last 30 days" description="Recent order volume returned by the Daraz Orders API." tone="bg-[#fff1ea] text-[#d94c06]" />
                    <Metric icon={Package} label="Products" value={formatNumber(stats?.products)} detail="Total catalog items" description="All products found from the connected Daraz catalog." tone="bg-[#edf5fb] text-[#3477a6]" />
                    <Metric icon={ShieldCheck} label="Data sources" value={`${stats?.synced ?? 0}/${stats?.totalSources ?? 3}`} detail="Seller, orders, catalog" description="Data sources are Daraz API groups used to build the dashboard." tone="bg-[#edf8f4] text-[#2b8469]" />
                    <Metric icon={Clock3} label="Last sync" value={stats?.lastSyncedAt ? new Date(stats.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'} detail={formatDate(stats?.lastSyncedAt)} description="The latest successful dashboard refresh time." tone="bg-[#f2f0f8] text-[#695aa3]" />
                  </section>

                  <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-base font-semibold text-[#15181d]">Orders</h2>
                          <p className="mt-1 text-xs text-[#667085]">Daily order volume from the last 30 days</p>
                        </div>
                        <PieChart size={18} className="text-[#f85606]" />
                      </div>
                      <MiniBars items={stats?.charts?.dailyOrders || []} />
                    </div>

                    <div className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-base font-semibold text-[#15181d]">Status</h2>
                          <p className="mt-1 text-xs text-[#667085]">Distribution from recent Daraz orders</p>
                        </div>
                        <PieChart size={18} className="text-[#2f6f9f]" />
                      </div>
                      <PieBreakdown items={stats?.charts?.statusBreakdown || []} />
                    </div>
                  </section>

                  <section className="mt-6 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold text-[#15181d]">Top products</h2>
                        <p className="mt-1 text-xs text-[#667085]">Best sellers detected from item-level order data</p>
                      </div>
                      <Trophy size={18} className="text-[#d94c06]" />
                    </div>
                    <TopProducts items={stats?.charts?.topProducts || []} />
                  </section>

                  <section className="mt-6 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
                    <div className="flex flex-col justify-between gap-4 border-b border-[#eef0f2] px-5 py-4 sm:flex-row sm:items-center">
                      <div>
                        <h2 className="text-base font-semibold text-[#15181d]">Daraz account</h2>
                        <p className="mt-1 text-xs text-[#667085]">Connected through Daraz Open Platform</p>
                      </div>
                      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#edf8f4] px-3 py-1 text-xs font-semibold text-[#26735b]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#35a17e]" /> Connected
                      </span>
                    </div>
                    <div className="grid gap-px bg-[#eef0f2] sm:grid-cols-2 lg:grid-cols-3">
                      <div className="bg-white px-5 py-5">
                        <p className="text-xs font-medium text-[#8a94a3]">Seller ID</p>
                        <p className="mt-2 truncate text-sm font-semibold text-[#15181d]">{connection?.sellerId || 'Not provided'}</p>
                      </div>
                      <div className="bg-white px-5 py-5">
                        <p className="text-xs font-medium text-[#8a94a3]">Market</p>
                        <p className="mt-2 truncate text-sm font-semibold text-[#15181d]">{connection?.country || connection?.accountPlatform || 'Daraz'}</p>
                      </div>
                      <div className="bg-white px-5 py-5">
                        <p className="text-xs font-medium text-[#8a94a3]">Connected on</p>
                        <p className="mt-2 truncate text-sm font-semibold text-[#15181d]">{formatDate(connection?.connectedAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between gap-4 border-t border-[#eef0f2] px-5 py-4 sm:flex-row sm:items-center">
                      <p className="text-xs text-[#667085]">Access credentials are encrypted at rest.</p>
                      <button onClick={disconnect} disabled={working} className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#e1b8ae] px-3.5 text-sm font-medium text-[#a33a22] transition hover:bg-[#fff8f6] disabled:cursor-not-allowed disabled:opacity-60">
                        <Unplug size={15} /> Disconnect account
                      </button>
                    </div>
                  </section>
                </>
              ) : (
                <section className="mt-6 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
                  <div className="grid lg:grid-cols-[1fr_300px]">
                    <div className="p-6 sm:p-8">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#fff0e8] text-[#e34d03]"><PlugZap size={20} /></span>
                      <h2 className="mt-5 text-xl font-semibold text-[#15181d]">Connect your Daraz seller account</h2>
                      <p className="mt-3 max-w-lg text-sm leading-6 text-[#667085]">
                        Authorize daraziq.store through Daraz to view seller details, order volume, and product totals.
                      </p>
                      <button onClick={connect} disabled={working} className="mt-6 flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#f85606] px-4 text-sm font-semibold text-white transition hover:bg-[#db4d05] disabled:cursor-not-allowed disabled:opacity-60">
                        {working ? 'Opening Daraz...' : 'Connect Daraz'} <ChevronRight size={16} />
                      </button>
                    </div>
                    <div className="border-t border-[#eef0f2] bg-[#fafbfc] p-6 lg:border-l lg:border-t-0">
                      <p className="text-xs font-semibold uppercase text-[#8a94a3]">Connection scope</p>
                      <div className="mt-5 space-y-4">
                        {['Seller profile', 'Orders summary', 'Product catalog'].map((label) => (
                          <div key={label} className="flex items-center gap-3 text-sm text-[#4b5563]">
                            <CheckCircle2 size={17} className="text-[#399477]" /> {label}
                          </div>
                        ))}
                      </div>
                      <p className="mt-7 border-t border-[#e5e7eb] pt-5 text-xs leading-5 text-[#667085]">
                        You can disconnect the account and remove stored credentials at any time.
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          <footer className="mt-8 flex items-center gap-2 text-xs text-[#8a94a3]">
            <BarChart3 size={14} /> daraziq.store workspace
          </footer>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
