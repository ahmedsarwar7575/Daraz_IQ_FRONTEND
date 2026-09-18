import { useCallback, useEffect, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  CircleHelp,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PlugZap,
  RefreshCw,
  Settings,
  Unplug,
} from 'lucide-react'
import { darazApi } from '../../shared/api'
import { demoStatus } from '../../shared/demo'
import {
  formatCurrency,
  formatDate,
  formatNumber,
  numeric,
} from '../../shared/format'
import {
  Brand,
  Button,
  ConfirmDialog,
  DemoIndicator,
  Dialog,
  Disclosure,
  EmptyState,
  Feedback,
  IconButton,
  Kpi,
  PageHeader,
  PriorityRow,
  Skeleton,
  StatusBadge,
  Tabs,
} from '../../shared/ui'
import { OrderTrend, StatusDistribution } from '../../shared/charts'
import Copilot from '../copilot/Copilot'
import SettingsPanel from '../settings/Settings'
import './DashboardTheme.css'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'product', label: 'Products', icon: Package },
  { id: 'store', label: 'Store Insights', icon: BarChart3 },
  { id: 'pricing', label: 'Pricing', icon: Gauge },
  { id: 'mcp', label: 'Integrations', icon: PlugZap },
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
const readDashboardView = () =>
  Object.entries(dashboardPaths).find(
    ([, path]) => window.location.pathname.replace(/\/$/, '') === path,
  )?.[0] || 'overview'

function Overview({
  stats,
  demo,
  connected,
  connect,
  working,
  loading,
  refresh,
  onNavigate,
}) {
  const [chartTab, setChartTab] = useState('trend')
  const [barView, setBarView] = useState(false)
  const pending = stats?.charts?.statusBreakdown?.find(
    (entry) => entry.status === 'pending',
  )?.count
  const returned = stats?.charts?.statusBreakdown?.find(
    (entry) => entry.status === 'returned',
  )?.count
  const priorities = []
  if (numeric(pending) > 0)
    priorities.push({
      title: `${formatNumber(pending)} orders are pending`,
      evidence: 'These orders are still waiting in the fulfillment queue.',
      action: 'Review pending orders and check dispatch dates.',
      button: 'Review orders',
      target: 'store',
      severity: 'medium',
    })
  if (
    numeric(stats?.synced) !== null &&
    numeric(stats?.totalSources) !== null &&
    stats.synced < stats.totalSources
  )
    priorities.push({
      title: 'Some store sources have not synced',
      evidence: `${stats.synced} of ${stats.totalSources} sources are available.`,
      action: 'Review source status before making a price change.',
      button: 'Check sources',
      target: 'store',
      severity: 'high',
    })
  if (numeric(returned) > 0)
    priorities.push({
      title: `${formatNumber(returned)} returns to review`,
      evidence: 'Returns reduce completed sales in this period.',
      action: 'Review fulfillment performance and affected listings.',
      button: 'Review returns',
      target: 'store',
    })
  if (priorities.length < 3 && numeric(stats?.products) > 0)
    priorities.push({
      title: 'Compare your products with the market',
      evidence: `${formatNumber(stats.products)} products in your catalog.`,
      action:
        'Check a product against competitor prices before your next update.',
      button: 'Explore products',
      target: 'product',
    })
  return (
    <>
      <PageHeader
        title="Overview"
        description={
          demo
            ? 'Store data / Last 30 days'
            : stats?.lastSyncedAt
              ? `Last synced ${formatDate(stats.lastSyncedAt, true)} / Last 30 days`
              : 'Your store performance and priorities for today.'
        }
      >
        {connected ? (
          <Button
            icon={RefreshCw}
            variant="secondary"
            loading={loading}
            onClick={refresh}
          >
            Refresh
          </Button>
        ) : (
          <Button icon={PlugZap} loading={working} onClick={connect}>
            Connect Daraz
          </Button>
        )}
      </PageHeader>
      {loading && !stats ? (
        <Skeleton label="Loading store performance" />
      ) : (
        <>
          {!connected && (
            <div className="connection-note">
              <span>
                {demo
                  ? 'Your store is not connected. You are exploring a sample store.'
                  : 'Your store is not connected. Connect Daraz to see your performance.'}
              </span>
              {demo && <DemoIndicator />}
            </div>
          )}
          <section
            className="priorities-section"
            aria-labelledby="priorities-heading"
          >
            <div className="section-heading">
              <h2 id="priorities-heading">Today's priorities</h2>
              <span className="muted">
                {priorities.length
                  ? `${Math.min(3, priorities.length)} to review`
                  : 'Getting started'}
              </span>
            </div>
            <div className="priority-list">
              {priorities.length ? (
                priorities
                  .slice(0, 3)
                  .map((priority, index) => (
                    <PriorityRow
                      key={priority.title}
                      {...priority}
                      number={index + 1}
                      onAction={() => onNavigate(priority.target)}
                    />
                  ))
              ) : (
                <EmptyState
                  title={
                    connected
                      ? 'No priorities available yet'
                      : 'Bring your store into view'
                  }
                >
                  {connected
                    ? 'Refresh your store or run a review in Store Insights.'
                    : 'Authorize your store to see orders, products, and pricing opportunities.'}
                </EmptyState>
              )}
            </div>
          </section>
          <div className="kpi-strip">
            <Kpi
              label="Orders"
              value={formatNumber(stats?.ordersLast30Days)}
              detail="Last 30 days"
            />
            <Kpi
              label="Revenue"
              value={formatCurrency(stats?.revenue)}
              detail="Last 30 days"
            />
            <Kpi
              label="Products"
              value={formatNumber(stats?.products)}
              detail="In your catalog"
            />
            <Kpi
              label="Pending orders"
              value={formatNumber(pending)}
              detail="Awaiting fulfillment"
            />
          </div>
          <section className="overview-analysis" aria-label="Store activity">
            <div className="overview-chart">
              <Tabs
                label="Order activity"
                tabs={[
                  { id: 'trend', label: 'Order trend' },
                  { id: 'fulfillment', label: 'Fulfillment' },
                ]}
                value={chartTab}
                onChange={setChartTab}
              >
                {chartTab === 'trend' ? (
                  <>
                    <div className="section-heading">
                      <p>Last 30 days</p>
                      <label className="check-field cursor-pointer">
                        <input
                          type="checkbox"
                          checked={barView}
                          onChange={(e) => setBarView(e.target.checked)}
                        />
                        Bar view
                      </label>
                    </div>
                    <OrderTrend
                      items={stats?.charts?.dailyOrders || []}
                      bars={barView}
                    />
                  </>
                ) : (
                  <StatusDistribution
                    items={stats?.charts?.statusBreakdown || []}
                  />
                )}
              </Tabs>
            </div>
            <div className="top-products">
              <div className="section-heading">
                <h2>Best sellers</h2>
                <IconButton
                  icon={ArrowRight}
                  label="View products"
                  onClick={() => onNavigate('product')}
                />
              </div>
              {stats?.charts?.topProducts?.length ? (
                stats.charts.topProducts.slice(0, 4).map((product, index) => (
                  <button
                    className="top-product-row"
                    key={product.sku || product.title}
                    onClick={() => onNavigate('product', product.sku)}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <strong title={product.title}>{product.title}</strong>
                      <small>{formatNumber(product.units)} units</small>
                    </div>
                    <b>
                      {formatNumber(product.orders)}
                      <small>orders</small>
                    </b>
                  </button>
                ))
              ) : (
                <EmptyState title="No best sellers yet">
                  Product sales will appear when item-level orders are
                  available.
                </EmptyState>
              )}
              {stats?.charts?.topProducts?.length > 4 && (
                <Disclosure title="All best sellers">
                  {stats.charts.topProducts.slice(4).map((product) => (
                    <PriorityRow
                      key={product.sku || product.title}
                      title={product.title}
                      evidence={`${formatNumber(product.orders)} orders / ${formatNumber(product.units)} units`}
                      onAction={() => onNavigate('product', product.sku)}
                    />
                  ))}
                </Disclosure>
              )}
            </div>
          </section>
        </>
      )}
    </>
  )
}

export default function Dashboard({ user, onLogout }) {
  const query = new URLSearchParams(window.location.search)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [notice, setNotice] = useState(() =>
    query.get('daraz') === 'connected'
      ? 'Daraz account connected successfully.'
      : '',
  )
  const [error, setError] = useState(() =>
    query.get('daraz') === 'error'
      ? query.get('message') || 'Daraz connection failed.'
      : '',
  )
  const [view, setView] = useState(readDashboardView)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [storeOpen, setStoreOpen] = useState(false)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const [selectedSku, setSelectedSku] = useState('')
  const [showDemo, setShowDemo] = useState(true)

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
    if (window.location.search)
      window.history.replaceState({}, '', window.location.pathname)
    darazApi
      .status()
      .then((result) => {
        if (active) setStatus(result)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const syncView = () => {
      setView(readDashboardView())
      setMobileOpen(false)
    }
    window.addEventListener('popstate', syncView)
    return () => window.removeEventListener('popstate', syncView)
  }, [])

  useEffect(() => {
    document.title = `${navItems.find((item) => item.id === view)?.label || 'Workspace'} | Daraz IQ`
  }, [view])

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
    setWorking(true)
    setError('')
    try {
      await darazApi.disconnect()
      setStatus({ connected: false })
      setNotice('Daraz account disconnected.')
      setConfirmDisconnect(false)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setWorking(false)
    }
  }
  const changeView = (target, sku) => {
    const next = dashboardPaths[target] ? target : 'overview'
    if (window.location.pathname !== dashboardPaths[next])
      window.history.pushState({}, '', dashboardPaths[next])
    if (sku) setSelectedSku(sku)
    setView(next)
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const connected = Boolean(status?.connected)
  const demo = Boolean(status?.showcase || (!connected && status && showDemo))
  const stats = demo && !connected ? demoStatus.stats : status?.stats
  const label = navItems.find((item) => item.id === view)?.label
  const navigation = (
    <nav className="workspace-nav" aria-label="Workspace">
      {navItems.map(({ id, label: name, icon: Icon }) => (
        <a
          key={id}
          href={dashboardPaths[id]}
          className={`${id === view ? 'active' : ''} ${id === 'mcp' ? 'nav-divider' : ''}`}
          aria-current={id === view ? 'page' : undefined}
          title={name}
          onClick={(event) => {
            if (!event.metaKey && !event.ctrlKey && !event.shiftKey) {
              event.preventDefault()
              changeView(id)
            }
          }}
        >
          <Icon size={18} />
          <span>{name}</span>
        </a>
      ))}
    </nav>
  )

  return (
    <div className="seller-console">
      <a className="skip-link" href="#workspace-main">
        Skip to content
      </a>
      <aside className="workspace-sidebar">
        <a
          href="/dashboard"
          className="sidebar-brand"
          onClick={(e) => {
            e.preventDefault()
            changeView('overview')
          }}
        >
          <Brand />
        </a>
        <div className="workspace-label">SELLER WORKSPACE</div>
        {navigation}
        <div className="sidebar-bottom">
          <button className="sidebar-help" onClick={() => changeView('mcp')}>
            <CircleHelp size={17} />
            <span>Connections & help</span>
          </button>
          <details
            className="account-menu"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.currentTarget.open = false
                event.currentTarget.querySelector('summary').focus()
              }
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                event.currentTarget.open = false
            }}
          >
            <summary aria-label="Account menu">
              <span className="account-avatar">
                {(user.name || 'S').charAt(0).toUpperCase()}
              </span>
              <span className="account-label">
                My account<small>Seller workspace</small>
              </span>
              <ChevronDown size={15} />
            </summary>
            <div className="account-popover">
              <p>{user.name || 'Seller'}</p>
              <p className="muted">{user.email}</p>
              <Button
                variant="ghost"
                icon={Settings}
                onClick={() => changeView('settings')}
              >
                Settings
              </Button>
              <Button variant="ghost" icon={LogOut} onClick={onLogout}>
                Sign out
              </Button>
            </div>
          </details>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-topbar">
          <div className="topbar-location">
            <span className="mobile-menu-trigger">
              <IconButton
                icon={Menu}
                label="Open navigation"
                onClick={() => setMobileOpen(true)}
              />
            </span>
            <span className="desktop-breadcrumb">
              Workspace <span>/</span>
            </span>
            <strong>{label}</strong>
          </div>
          <div className="topbar-status">
            {demo ? (
              <DemoIndicator />
            ) : (
              status && <StatusBadge>Store data</StatusBadge>
            )}
            <button
              className="store-status-button"
              onClick={() => setStoreOpen(true)}
            >
              <span
                className={`connection-dot ${connected ? 'connected' : ''}`}
              />
              <span>
                {loading && !status
                  ? 'Checking store'
                  : connected
                    ? 'Daraz connected'
                    : status
                      ? 'Store not connected'
                      : 'Status unavailable'}
              </span>
              <ChevronDown size={13} />
            </button>
          </div>
        </header>
        <main className="workspace-main" id="workspace-main">
          <Feedback error={error} onDismiss={() => setError('')} />
          {view === 'settings' ? (
            <SettingsPanel />
          ) : view === 'overview' ? (
            <Overview
              stats={stats}
              connected={connected}
              demo={demo}
              connect={connect}
              working={working}
              loading={loading}
              refresh={loadStatus}
              onNavigate={changeView}
            />
          ) : (
            <Copilot
              connected={connected}
              demo={demo}
              initialFeature={view}
              selectedSku={selectedSku}
              onNavigate={changeView}
              onConnect={connect}
            />
          )}
          <footer className="workspace-footer">
            <span>daraziq.store</span>
            <span>
              {demo
                ? 'Data / Sample store'
                : `Last synced: ${formatDate(status?.stats?.lastSyncedAt, true)}`}
            </span>
          </footer>
        </main>
      </div>
      <Dialog
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="Workspace navigation"
        drawer
      >
        <Brand />
        {navigation}
        <Button icon={LogOut} variant="ghost" onClick={onLogout}>
          Sign out
        </Button>
      </Dialog>
      <Dialog
        open={storeOpen}
        onClose={() => setStoreOpen(false)}
        title="Daraz connection"
        drawer
      >
        <Feedback error={error} onDismiss={() => setError('')} />
        <div className="form-stack">
          <StatusBadge tone={connected ? 'success' : 'neutral'} dot>
            {connected ? 'Connected' : 'Not connected'}
          </StatusBadge>
          <p className="muted">
            {connected
              ? 'Your Daraz account is authorized for store, order, and product access.'
              : 'Connect your Daraz seller account to load your store performance and products.'}
          </p>
          {connected && (
            <dl className="detail-list">
              <div>
                <dt>Store</dt>
                <dd>{status.connection?.sellerName || 'Daraz store'}</dd>
              </div>
              <div>
                <dt>Market</dt>
                <dd>
                  {status.connection?.country ||
                    status.connection?.accountPlatform ||
                    '-'}
                </dd>
              </div>
              <div>
                <dt>Connected</dt>
                <dd>{formatDate(status.connection?.connectedAt)}</dd>
              </div>
              <div>
                <dt>Last synced</dt>
                <dd>{formatDate(status.stats?.lastSyncedAt, true)}</dd>
              </div>
              <div>
                <dt>Sources synced</dt>
                <dd>
                  {formatNumber(status.stats?.synced)} /{' '}
                  {formatNumber(status.stats?.totalSources)}
                </dd>
              </div>
            </dl>
          )}
          {connected ? (
            <Button
              variant="danger"
              icon={Unplug}
              onClick={() => {
                setStoreOpen(false)
                setConfirmDisconnect(true)
              }}
            >
              Disconnect Daraz
            </Button>
          ) : (
            <>
              <Button loading={working} icon={PlugZap} onClick={connect}>
                Connect Daraz
              </Button>
              <label className="check-field">
                <input
                  type="checkbox"
                  checked={showDemo}
                  onChange={(e) => setShowDemo(e.target.checked)}
                />
                Explore with Store data
              </label>
            </>
          )}
          <Button
            variant="secondary"
            icon={RefreshCw}
            loading={loading}
            onClick={loadStatus}
          >
            Refresh status
          </Button>
          <p className="muted">
            Access credentials are encrypted at rest. Disconnecting removes the
            stored Daraz tokens.
          </p>
        </div>
      </Dialog>
      <ConfirmDialog
        open={confirmDisconnect}
        onClose={() => setConfirmDisconnect(false)}
        onConfirm={disconnect}
        loading={working}
        title="Disconnect Daraz?"
        confirmLabel="Disconnect account"
        danger
      >
        Stored Daraz access tokens will be removed. Reconnect your account to
        resume store updates.
      </ConfirmDialog>
      {notice && (
        <Feedback toast onDismiss={() => setNotice('')}>
          {notice}
        </Feedback>
      )}
    </div>
  )
}
