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
  PackageCheck,
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

const formatNumber = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return '-'
  return new Intl.NumberFormat('en').format(number)
}

const BrandMark = ({ compact = false }) => (
  <div className="flex min-w-0 items-center gap-3">
    <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-md border border-[#e5e8eb] bg-white shadow-sm">
      <img src="/favicon.svg" alt="" className="h-full w-full object-cover object-center" />
    </span>
    {!compact && (
      <div className="min-w-0">
        <span className="block truncate font-semibold">daraziq.store</span>
        <span className="block truncate text-xs text-[#7c8690]">Daraz intelligence</span>
      </div>
    )}
  </div>
)

const Metric = ({ icon: Icon, label, value, detail, description, tone }) => (
  <article className="min-w-0 border border-[#dfe3e8] bg-white p-5 shadow-[0_10px_28px_rgba(21,26,33,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cfd6dd] hover:shadow-[0_18px_36px_rgba(21,26,33,0.08)]">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#66717c]">{label}</p>
        <p className="mt-3 text-[28px] font-semibold text-[#171c22]">{value ?? '-'}</p>
        <p className="mt-1 truncate text-xs text-[#8a939d]">{detail}</p>
        {description && <p className="mt-3 text-xs leading-5 text-[#707b86]">{description}</p>}
      </div>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${tone}`}>
        <Icon size={18} />
      </span>
    </div>
  </article>
)

const EmptyState = ({ children }) => (
  <div className="grid min-h-[180px] place-items-center rounded-md border border-dashed border-[#d8dde3] bg-[#fbfcfd] px-5 text-center text-sm text-[#7c8690]">
    {children}
  </div>
)

const MiniBars = ({ items = [], valueKey = 'orders' }) => {
  const max = Math.max(1, ...items.map((item) => Number(item[valueKey]) || 0))
  if (!items.some((item) => Number(item[valueKey]) > 0)) return <EmptyState>No order activity in this range yet.</EmptyState>
  return (
    <div className="flex h-52 items-end gap-1.5 rounded-md border border-[#e1e5e9] bg-[#fbfcfd] px-3 py-3">
      {items.map((item) => {
        const value = Number(item[valueKey]) || 0
        return (
          <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-40 w-full items-end">
              <div
                className="w-full rounded-t-sm bg-[#f85606] transition hover:bg-[#d94c06]"
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
      <div className="h-36 w-36 shrink-0 rounded-full border border-[#e1e5e9]" style={{ background: `conic-gradient(${gradient})` }} />
      <div className="min-w-0 flex-1 space-y-2">
        {items.map((item, index) => (
          <div key={item.status} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-[#4d5863]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
              <span className="truncate capitalize">{item.status}</span>
            </span>
            <span className="font-semibold text-[#171c22]">{formatNumber(item.count)}</span>
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
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#fff1ea] text-sm font-semibold text-[#d94c06]">{index + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#242b33]">{item.title}</p>
            <p className="mt-0.5 truncate text-xs text-[#8a939c]">{item.sku || 'No SKU'} · {formatNumber(item.units)} units</p>
          </div>
          <span className="text-sm font-semibold text-[#171c22]">{formatNumber(item.orders)}</span>
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
          <BrandMark />
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
            <BrandMark compact />
            <span className="font-semibold">daraziq.store</span>
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
                  <p className="mt-1.5 text-sm text-[#727d87]">Monitor products, orders, sync health, and marketplace signals from your connected Daraz account.</p>
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
                    <Metric icon={ShoppingBag} label="Orders" value={formatNumber(stats?.ordersLast30Days)} detail="Last 30 days" description="Recent order volume returned by the Daraz Orders API." tone="bg-[#fff1ea] text-[#d94c06]" />
                    <Metric icon={Package} label="Products" value={formatNumber(stats?.products)} detail="Total catalog items" description="All products found from the connected Daraz catalog." tone="bg-[#edf5fb] text-[#3477a6]" />
                    <Metric icon={ShieldCheck} label="Data sources" value={`${stats?.synced ?? 0}/${stats?.totalSources ?? 3}`} detail="Seller, orders, catalog" description="Data sources are Daraz API groups used to build the dashboard." tone="bg-[#edf8f4] text-[#2b8469]" />
                    <Metric icon={Clock3} label="Last sync" value={stats?.lastSyncedAt ? new Date(stats.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'} detail={formatDate(stats?.lastSyncedAt)} description="The latest successful dashboard refresh time." tone="bg-[#f2f0f8] text-[#695aa3]" />
                  </section>

                  <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric icon={ShoppingBag} label="This month" value={formatNumber(stats?.ordersThisMonth)} detail="Month-to-date orders" tone="bg-white text-[#d94c06]" />
                    <Metric icon={ShoppingBag} label="This year" value={formatNumber(stats?.ordersThisYear)} detail="Year-to-date orders" tone="bg-white text-[#2f6f9f]" />
                    <Metric icon={PackageCheck} label="Active products" value={formatNumber(stats?.activeProducts)} detail="Live catalog count" tone="bg-white text-[#27745d]" />
                    <Metric icon={Package} label="Draft products" value={formatNumber(stats?.draftProducts)} detail="Pending or draft count" tone="bg-white text-[#6b5aa3]" />
                  </section>

                  <section className="mt-7 grid gap-7 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="overflow-hidden border border-[#dfe3e8] bg-white p-5 shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-base font-semibold">Order heatmap</h2>
                          <p className="mt-1 text-xs text-[#7c8690]">Daily orders from the last 30 days</p>
                        </div>
                        <PieChart size={18} className="text-[#f85606]" />
                      </div>
                      <MiniBars items={stats?.charts?.dailyOrders || []} />
                    </div>

                    <div className="overflow-hidden border border-[#dfe3e8] bg-white p-5 shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-base font-semibold">Order status</h2>
                          <p className="mt-1 text-xs text-[#7c8690]">Distribution from recent Daraz orders</p>
                        </div>
                        <PieChart size={18} className="text-[#2f6f9f]" />
                      </div>
                      <PieBreakdown items={stats?.charts?.statusBreakdown || []} />
                    </div>
                  </section>

                  <section className="mt-7 overflow-hidden border border-[#dfe3e8] bg-white p-5 shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold">Hit-selling products</h2>
                        <p className="mt-1 text-xs text-[#7c8690]">Top products detected from item-level order data</p>
                      </div>
                      <Trophy size={18} className="text-[#d94c06]" />
                    </div>
                    <TopProducts items={stats?.charts?.topProducts || []} />
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
                    <div className="grid gap-px bg-[#e5e8eb] sm:grid-cols-2 lg:grid-cols-3">
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
                        Authorize daraziq.store through Daraz to view seller details, order volume, and product totals.
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
            <BarChart3 size={14} /> daraziq.store workspace
          </footer>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
