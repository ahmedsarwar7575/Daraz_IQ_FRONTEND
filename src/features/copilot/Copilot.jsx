import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Gauge,
  Package,
  PlugZap,
  RefreshCw,
  Save,
  Search,
  Settings2,
  Sparkles,
  Unplug,
} from 'lucide-react'
import { apiBaseUrl, copilotApi } from '../../shared/api'
import {
  sampleProducts,
  sampleStoreReview,
  sampleCompetitors,
  sampleProductAnalysis,
  samplePriceAnalysis,
  sampleAiBriefs,
} from '../../shared/demo'
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  numeric,
} from '../../shared/format'
import {
  Button,
  ConfirmDialog,
  DemoIndicator,
  Dialog,
  Disclosure,
  EmptyState,
  Feedback,
  Field,
  IconButton,
  Kpi,
  PageHeader,
  PriorityRow,
  Select,
  Skeleton,
  StatusBadge,
  Tabs,
} from '../../shared/ui'
import {
  OrderTrend,
  PriceDistribution,
  StatusDistribution,
} from '../../shared/charts'
import MarketTable from '../../shared/MarketTable'
import { pricingChecks } from './pricing'

const featureMeta = {
  store: {
    title: 'Store Insights',
    description:
      'Understand performance, investigate changes, and find your next action.',
  },
  product: {
    title: 'Products',
    description: 'Know your product. Understand its place in the market.',
  },
  pricing: {
    title: 'Pricing',
    description:
      'Review the market, check your rules, and record a price recommendation.',
  },
  mcp: {
    title: 'Integrations',
    description: 'Connect your store intelligence to the tools you work with.',
  },
}
const productTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'market', label: 'Market comparison' },
  { id: 'quality', label: 'Listing quality' },
  { id: 'ai', label: 'AI brief' },
]
const priceTabs = [
  { id: 'recommendation', label: 'Recommendation' },
  { id: 'evidence', label: 'Market evidence' },
  { id: 'checks', label: 'Risk checks' },
  { id: 'history', label: 'Action history' },
]
const defaultRules = {
  autonomyLevel: 'suggest_only',
  minMarginPercent: 5,
  maxDeltaPercent: 15,
  maxRepricesPerSkuPerDay: 3,
  priceFloor: '',
  priceCeiling: '',
  liveWritesEnabled: false,
}
const emptyMarket = {
  query: '',
  productId: '',
  sku: '',
  currentPrice: '',
  cost: '',
  limit: 12,
}
const isShowcase = (value) =>
  Boolean(value?.showcase || /sample|showcase|demo/i.test(value?.source || ''))

function ProductImage({ product, large = false }) {
  return product?.imageUrl ? (
    <img
      className={large ? 'product-image large' : 'product-image'}
      src={product.imageUrl}
      alt=""
    />
  ) : (
    <span
      className={
        large ? 'product-image large placeholder' : 'product-image placeholder'
      }
    >
      <Package size={large ? 32 : 20} />
    </span>
  )
}

function ProductSelector({
  products,
  selected,
  search,
  onSearch,
  onSelect,
  loading,
  busy,
  compact = false,
}) {
  const filtered = products.filter((product) =>
    `${product.title || ''} ${product.sku || ''} ${product.itemId || ''}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )
  return (
    <div className={`product-selector ${compact ? 'compact' : ''}`}>
      <div className="selector-heading">
        <h2>Your products</h2>
        <span>{products.length}</span>
      </div>
      <Field
        label="Search products"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Name or SKU"
        type="search"
      />
      <div className="product-options">
        {loading ? (
          <Skeleton label="Loading products" />
        ) : filtered.length ? (
          filtered.map((product, index) => (
            <button
              type="button"
              key={product.sku || product.itemId || index}
              disabled={busy}
              className={`product-option ${selected === product.sku ? 'selected' : ''}`}
              aria-pressed={selected === product.sku}
              onClick={() => onSelect(product)}
            >
              <ProductImage product={product} />
              <span className="product-option-content">
                <strong title={product.title}>
                  {product.title || 'Untitled product'}
                </strong>
                <small>{product.sku || 'No SKU'}</small>
                <span>
                  <b>{formatCurrency(product.price)}</b>
                  <small>
                    {numeric(product.stock) === null
                      ? 'Stock unavailable'
                      : `${formatNumber(product.stock)} in stock`}
                  </small>
                </span>
                {numeric(product.stock) === 0 && (
                  <StatusBadge tone="warning">Out of stock</StatusBadge>
                )}
              </span>
            </button>
          ))
        ) : (
          <EmptyState
            title={products.length ? 'No matching products' : 'No products yet'}
          >
            {products.length
              ? 'Try another name or SKU.'
              : 'Your catalog will appear after your store syncs.'}
          </EmptyState>
        )}
      </div>
    </div>
  )
}

function Brief({ result, loading, onGenerate, disabled }) {
  const lines = String(result?.brief || '')
    .replace(/\*\*/g, '')
    .split('\n')
    .filter((line) => line.trim())
  return (
    <div className="ai-brief">
      <div className="section-heading">
        <div>
          <h2>AI brief</h2>
          <p>
            {result
              ? `${result.providerLabel || 'AI'} / ${result.model || 'Model not provided'}`
              : 'A summary based on the selected product or store review.'}
          </p>
        </div>
        <Button
          icon={Sparkles}
          loading={loading}
          disabled={disabled}
          onClick={onGenerate}
        >
          {result ? 'Regenerate' : 'Generate brief'}
        </Button>
      </div>
      {result?.warning && <Feedback error={result.warning} />}
      {lines.length ? (
        <div className="brief-text">
          {lines.map((line, i) =>
            /^(executive summary|what changed|recommended actions|risk checks|pricing rationale):?$/i.test(
              line.trim(),
            ) ? (
              <h3 key={i}>{line.replace(':', '')}</h3>
            ) : (
              <p key={i}>{line.replace(/^[-*]\s+/, '')}</p>
            ),
          )}
        </div>
      ) : (
        <EmptyState title="No brief generated">
          Generate a brief when you need more context. Review its evidence
          before acting.
        </EmptyState>
      )}
    </div>
  )
}

function Findings({ items = [], onNavigate, sku }) {
  return items.length ? (
    <div className="priority-list">
      {items.map((item, index) => (
        <PriorityRow
          key={index}
          number={index + 1}
          title={item.title || item.message}
          severity={item.severity}
          evidence={item.metric}
          action={item.action}
          button={
            /pric|margin/i.test(`${item.title} ${item.action}`)
              ? 'Review pricing'
              : 'Review products'
          }
          onAction={() =>
            onNavigate(
              /pric|margin/i.test(`${item.title} ${item.action}`)
                ? 'pricing'
                : 'product',
              sku,
            )
          }
        />
      ))}
    </div>
  ) : (
    <EmptyState title="No findings yet">
      Run an analysis to load recommendations.
    </EmptyState>
  )
}

export default function Copilot({
  connected,
  demo = false,
  initialFeature = 'store',
  selectedSku,
  onNavigate,
  onConnect,
}) {
  const [manifest, setManifest] = useState(null)
  const [products, setProducts] = useState([])
  const [catalogDemo, setCatalogDemo] = useState(false)
  const [catalogStatus, setCatalogStatus] = useState(null)
  const [storeReview, setStoreReview] = useState(null)
  const [competitors, setCompetitors] = useState(null)
  const [productAnalysis, setProductAnalysis] = useState(null)
  const [priceAnalysis, setPriceAnalysis] = useState(null)
  const [repriceResult, setRepriceResult] = useState(null)
  const [history, setHistory] = useState(null)
  const [aiBriefs, setAiBriefs] = useState({})
  const [working, setWorking] = useState('')
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [dateRange, setDateRange] = useState({ days: 30, from: '', to: '' })
  const [productSearch, setProductSearch] = useState('')
  const [marketForm, setMarketForm] = useState(emptyMarket)
  const [guardrailForm, setGuardrailForm] = useState(defaultRules)
  const [savedRules, setSavedRules] = useState(null)
  const [productTab, setProductTab] = useState('overview')
  const [pricingTab, setPricingTab] = useState('recommendation')
  const [briefOpen, setBriefOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [setupOpen, setSetupOpen] = useState(false)
  const [disconnectOpen, setDisconnectOpen] = useState(false)
  const [confirmLog, setConfirmLog] = useState(false)
  const [confirmLive, setConfirmLive] = useState(false)
  const [client, setClient] = useState('Compatible AI client')
  const mounted = useRef(true)
  const requestVersion = useRef(0)
  const selectedSkuRef = useRef(selectedSku)

  const selectProduct = useCallback((product) => {
    requestVersion.current += 1
    setMarketForm((current) => ({
      ...current,
      query: product.query || product.title || '',
      productId: product.itemId || product.sku || '',
      sku: product.sku || '',
      currentPrice: String(product.price ?? ''),
      cost: String(product.cost ?? ''),
    }))
    setProductAnalysis(null)
    setPriceAnalysis(null)
    setCompetitors(null)
    setRepriceResult(null)
    setHistory(null)
    setAiBriefs((current) => ({ store: current.store }))
    setProductTab('overview')
    setPricingTab('recommendation')
    setSelectorOpen(false)
    setError('')
    setNotice('')
  }, [])

  useEffect(() => {
    selectedSkuRef.current = selectedSku
  }, [selectedSku])
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      requestVersion.current += 1
    }
  }, [])

  useEffect(() => {
    let active = true
    Promise.allSettled([
      copilotApi.manifest(),
      copilotApi.getGuardrails(),
      copilotApi.products(),
    ]).then(([manifestResult, rulesResult, productResult]) => {
      if (!active) return
      if (manifestResult.status === 'fulfilled')
        setManifest(manifestResult.value)
      if (rulesResult.status === 'fulfilled') {
        setGuardrailForm({ ...defaultRules, ...rulesResult.value.guardrails })
        setSavedRules(rulesResult.value.guardrails)
      }
      if (productResult.status === 'fulfilled') {
        const fetched = productResult.value.products || []
        setProducts(fetched)
        setCatalogStatus(productResult.value)
        setCatalogDemo(isShowcase(productResult.value))
        const visible = demo && !connected ? sampleProducts : fetched
        if (visible.length)
          selectProduct(
            visible.find((p) => p.sku === selectedSkuRef.current) || visible[0],
          )
        else setMarketForm(emptyMarket)
      } else if (demo && !connected)
        selectProduct(
          sampleProducts.find((p) => p.sku === selectedSkuRef.current) ||
            sampleProducts[0],
        )
      const failed = [manifestResult, rulesResult, productResult].filter(
        (result) => result.status === 'rejected',
      )
      if (failed.length)
        setError(
          failed
            .map((result) => result.reason.message)
            .filter((message, i, all) => all.indexOf(message) === i)
            .join(' '),
        )
      setLoadingProducts(false)
    })
    return () => {
      active = false
    }
  }, [connected, demo, selectProduct])

  const visibleProducts = demo && !connected ? sampleProducts : products
  const selected = visibleProducts.find(
    (product) => product.sku === marketForm.sku,
  )
  const sampleProduct =
    (demo || catalogDemo) &&
    marketForm.sku === sampleProducts[0].sku &&
    marketForm.query === sampleProducts[0].query &&
    Number(marketForm.currentPrice) === sampleProducts[0].price &&
    Number(marketForm.cost) === sampleProducts[0].cost
  const displayStore = storeReview || (demo ? sampleStoreReview : null)
  const displayProduct =
    productAnalysis || (sampleProduct ? sampleProductAnalysis : null)
  const displayMarket =
    competitors ||
    displayProduct?.competitors ||
    (sampleProduct ? sampleCompetitors : null)
  const displayPrice =
    priceAnalysis ||
    (sampleProduct
      ? {
          ...samplePriceAnalysis,
          sku: sampleProducts[0].sku,
          cost: sampleProducts[0].cost,
          guardrails: { ...defaultRules, ...samplePriceAnalysis.guardrails },
        }
      : null)
  const activeDemo =
    demo ||
    catalogDemo ||
    isShowcase(
      initialFeature === 'store'
        ? displayStore
        : initialFeature === 'pricing'
          ? displayPrice?.competitors
          : displayMarket,
    )
  const displayBrief = (mode) =>
    aiBriefs[mode] ||
    ((mode === 'store' ? demo : sampleProduct) ? sampleAiBriefs[mode] : null)
  const meta = featureMeta[initialFeature]
  const mcpEndpoint = `${apiBaseUrl.replace(/\/$/, '')}/mcp`
  const checks = pricingChecks(displayPrice)
  const cost = numeric(displayPrice?.cost)
  const recommended = numeric(displayPrice?.recommendedPrice)
  const margin =
    cost !== null && recommended > 0
      ? ((recommended - cost) / recommended) * 100
      : null
  const hasFailedCheck = checks.some((check) => check.passed === false)

  const run = async (key, handler) => {
    if (working) return
    setWorking(key)
    setError('')
    setNotice('')
    const version = requestVersion.current
    try {
      const commit = await handler()
      if (mounted.current && version === requestVersion.current) commit?.()
    } catch (requestError) {
      if (mounted.current && version === requestVersion.current)
        setError(requestError.message)
    } finally {
      if (mounted.current) setWorking('')
    }
  }
  const rangePayload = () => ({
    days: Number(dateRange.days || 30),
    ...(dateRange.from ? { from: dateRange.from } : {}),
    ...(dateRange.to ? { to: dateRange.to } : {}),
  })
  const marketPayload = () => ({
    ...marketForm,
    productId: marketForm.productId || marketForm.sku,
    limit: Number(marketForm.limit),
    refresh: true,
  })
  const pricePayload = () => ({
    sku: marketForm.sku,
    query: marketForm.query,
    currentPrice: marketForm.currentPrice,
    cost: marketForm.cost,
    limit: Number(marketForm.limit),
    refresh: true,
  })
  const assertMarket = () => {
    if (!marketForm.query.trim())
      throw new Error('Enter a product or market search.')
    if (
      !Number.isInteger(Number(marketForm.limit)) ||
      Number(marketForm.limit) < 1 ||
      Number(marketForm.limit) > 50
    )
      throw new Error('Choose between 1 and 50 competitor listings.')
  }
  const assertPrice = () => {
    assertMarket()
    if (!marketForm.sku.trim())
      throw new Error('Select a product or enter its SKU.')
    if (!(numeric(marketForm.currentPrice) > 0))
      throw new Error('Enter a current price greater than zero.')
    if (
      marketForm.cost !== '' &&
      (numeric(marketForm.cost) === null || numeric(marketForm.cost) < 0)
    )
      throw new Error('Product cost must be zero or greater.')
  }
  const updateMarket = (field) => (event) => {
    setMarketForm((current) => ({
      ...current,
      [field]: event.target.value,
      ...(field === 'sku' ? { productId: event.target.value } : {}),
    }))
    setPriceAnalysis(null)
    setProductAnalysis(null)
    setCompetitors(null)
    setRepriceResult(null)
    setHistory(null)
    setAiBriefs((current) => ({ store: current.store }))
  }
  const updateRange = (field) => (event) => {
    setDateRange((current) => ({
      ...current,
      [field]: event.target.value,
      ...(field === 'days' ? { from: '', to: '' } : {}),
    }))
    setStoreReview(null)
    setAiBriefs((current) => ({ ...current, store: null }))
  }
  const reviewStore = () =>
    run('store', async () => {
      if (dateRange.from && dateRange.to && dateRange.from > dateRange.to)
        throw new Error('The start date must be before the end date.')
      if (demo && !connected)
        return () => {
          setStoreReview(sampleStoreReview)
          setNotice(
            'Data covers 10 Aug to 8 Sep 2026. Connect Daraz to review another period.',
          )
        }
      const result = await copilotApi.analyzeStore(rangePayload())
      return () => setStoreReview(result)
    })
  const searchMarket = (refresh = false) =>
    run(refresh ? 'refreshMarket' : 'market', async () => {
      assertMarket()
      if (demo && !connected) {
        if (!sampleProduct)
          throw new Error(
            'This demo market snapshot is available for AuroraSound X7. Connect Daraz to research your own products.',
          )
        return () => setCompetitors(sampleCompetitors)
      }
      const result = await copilotApi.searchCompetitors({
        query: marketForm.query,
        limit: Number(marketForm.limit),
        refresh,
      })
      return () => setCompetitors(result)
    })
  const analyzeProduct = () =>
    run('product', async () => {
      assertMarket()
      if (demo && !connected) {
        if (!sampleProduct)
          throw new Error(
            'Select AuroraSound X7 to explore the demo analysis, or connect your store.',
          )
        return () => {
          setProductAnalysis(sampleProductAnalysis)
          setCompetitors(sampleCompetitors)
        }
      }
      const result = await copilotApi.analyzeProduct(marketPayload())
      return () => {
        setProductAnalysis(result)
        setCompetitors(result.competitors)
      }
    })
  const analyzePrice = () =>
    run('price', async () => {
      assertPrice()
      if (demo && !connected) {
        if (!sampleProduct)
          throw new Error(
            'Select AuroraSound X7 to explore the demo recommendation, or connect your store.',
          )
        return () =>
          setPriceAnalysis({
            ...samplePriceAnalysis,
            cost: sampleProducts[0].cost,
            guardrails: { ...defaultRules, ...samplePriceAnalysis.guardrails },
          })
      }
      const result = await copilotApi.analyzePrice(pricePayload())
      return () => {
        setPriceAnalysis(result)
        setPricingTab('recommendation')
        setRepriceResult(null)
      }
    })
  const generateBrief = (mode) =>
    run(`ai-${mode}`, async () => {
      if (
        mode === 'store' &&
        dateRange.from &&
        dateRange.to &&
        dateRange.from > dateRange.to
      )
        throw new Error('The start date must be before the end date.')
      if (mode !== 'store') mode === 'pricing' ? assertPrice() : assertMarket()
      if (demo && !connected) {
        if (mode !== 'store' && !sampleProduct)
          throw new Error('Select AuroraSound X7 to read the demo brief.')
        return () =>
          setAiBriefs((current) => ({
            ...current,
            [mode]: sampleAiBriefs[mode],
          }))
      }
      const result = await copilotApi.aiBrief({
        mode,
        ...(mode === 'store'
          ? rangePayload()
          : mode === 'product'
            ? marketPayload()
            : pricePayload()),
      })
      return () => {
        setAiBriefs((current) => ({ ...current, [mode]: result }))
        if (mode === 'store') setStoreReview(result.data)
        if (mode === 'product') {
          setProductAnalysis(result.data)
          setCompetitors(result.data?.competitors)
        }
        if (mode === 'pricing') setPriceAnalysis(result.data)
      }
    })
  const saveGuardrails = () =>
    run('guardrails', async () => {
      const floor = numeric(guardrailForm.priceFloor)
      const ceiling = numeric(guardrailForm.priceCeiling)
      if (floor !== null && ceiling !== null && floor > ceiling)
        throw new Error('Minimum price cannot exceed maximum price.')
      const result = await copilotApi.updateGuardrails(guardrailForm)
      return () => {
        setGuardrailForm({ ...defaultRules, ...result.guardrails })
        setSavedRules(result.guardrails)
        setPriceAnalysis(null)
        setAiBriefs((current) => ({ ...current, pricing: null }))
        setRulesOpen(false)
        setNotice(
          'Pricing rules saved. Analyze again to use the updated rules.',
        )
      }
    })
  const logReprice = () =>
    run('reprice', async () => {
      if (!priceAnalysis?.recommendedPrice || activeDemo)
        throw new Error(
          'Analyze a real product before logging a recommendation.',
        )
      const result = await copilotApi.applyReprice({
        sku: marketForm.sku,
        currentPrice: priceAnalysis.currentPrice,
        price: priceAnalysis.recommendedPrice,
        reason: 'Copilot guarded pricing recommendation',
      })
      return () => {
        setRepriceResult(result)
        setHistory(null)
        setConfirmLog(false)
        if (result.log?.status === 'rejected') setError(result.message || 'The recommendation was rejected by your pricing rules.')
        else setNotice(result.message || 'This recommendation is already recorded.')
        setPricingTab('history')
      }
    })
  const loadHistory = () =>
    run('history', async () => {
      if (!marketForm.sku.trim())
        throw new Error('Select a product to load its history.')
      if (activeDemo) return () => setHistory([])
      const result = await copilotApi.repriceHistory(marketForm.sku)
      return () => setHistory(result.logs || [])
    })
  const copyEndpoint = () =>
    run('copy', async () => {
      await navigator.clipboard.writeText(mcpEndpoint)
      return () => setNotice('Connection endpoint copied.')
    })
  const updateRule = (field) => (event) =>
    setGuardrailForm((current) => ({ ...current, [field]: event.target.value }))
  const selector = (
    <ProductSelector
      products={visibleProducts}
      selected={marketForm.sku}
      search={productSearch}
      onSearch={setProductSearch}
      onSelect={selectProduct}
      loading={loadingProducts}
      busy={Boolean(working)}
    />
  )
  const marketFields = (
    <fieldset disabled={Boolean(working)} className="form-grid">
      <Field
        label="Market search"
        value={marketForm.query}
        onChange={updateMarket('query')}
        required
      />
      <Field
        label="SKU / item ID"
        value={marketForm.sku}
        onChange={updateMarket('sku')}
      />
      <Field
        label="Current price (PKR)"
        value={marketForm.currentPrice}
        onChange={updateMarket('currentPrice')}
        type="number"
        min="0.01"
        step="any"
      />
      <Field
        label="Product cost (PKR)"
        value={marketForm.cost}
        onChange={updateMarket('cost')}
        type="number"
        min="0"
        step="any"
      />
      <Field
        label="Competitor limit"
        value={marketForm.limit}
        onChange={updateMarket('limit')}
        type="number"
        min="1"
        max="50"
      />
    </fieldset>
  )

  return (
    <div className={`copilot-workspace feature-${initialFeature}`}>
      <PageHeader title={meta.title} description={meta.description}>
        {initialFeature === 'store' && (
          <Button
            variant="secondary"
            icon={Sparkles}
            onClick={() => setBriefOpen(true)}
          >
            AI brief
          </Button>
        )}
        {initialFeature === 'pricing' && (
          <Button
            variant="ghost"
            icon={Settings2}
            onClick={() => setRulesOpen(true)}
          >
            Pricing rules
          </Button>
        )}
        {initialFeature === 'mcp' && (
          <Button icon={ArrowRight} onClick={() => setSetupOpen(true)}>
            Connect AI client
          </Button>
        )}
      </PageHeader>
      <Feedback error={error} onDismiss={() => setError('')} />
      {['product', 'pricing'].includes(initialFeature) &&
        catalogStatus?.warning && <Feedback error={catalogStatus.warning} />}
      {['product', 'pricing'].includes(initialFeature) &&
        catalogStatus?.reconnectRequired && (
          <div className="connection-note">
            <span>
              {catalogStatus.message ||
                'Reconnect Daraz to load your products.'}
            </span>
            {catalogStatus.reconnectUrl ? (
              <a className="button" href={catalogStatus.reconnectUrl}>
                Reconnect Daraz
              </a>
            ) : (
              <Button onClick={onConnect}>Reconnect Daraz</Button>
            )}
          </div>
        )}
      {activeDemo && (!demo || initialFeature === 'store') && (
        <div className="data-note">
          <DemoIndicator />
          <span>
            {initialFeature === 'store'
              ? 'Sample period: 10 Aug - 8 Sep 2026'
              : 'Synthetic sample catalog and market data'}
          </span>
        </div>
      )}
      {!connected && !demo && initialFeature !== 'mcp' && (
        <div className="connection-note">
          <span>Connect Daraz to load your store and products.</span>
          <Button variant="secondary" onClick={onConnect}>
            Connect Daraz
          </Button>
        </div>
      )}

      {initialFeature === 'store' && (
        <>
          <form
            className="analysis-toolbar"
            onSubmit={(e) => {
              e.preventDefault()
              reviewStore()
            }}
          >
            <Select
              label="Date range"
              value={dateRange.days}
              disabled={Boolean(working)}
              onChange={updateRange('days')}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </Select>
            <Field
              label="From"
              type="date"
              value={dateRange.from}
              disabled={Boolean(working)}
              onChange={updateRange('from')}
              max={dateRange.to || undefined}
            />
            <Field
              label="To"
              type="date"
              value={dateRange.to}
              disabled={Boolean(working)}
              onChange={updateRange('to')}
              min={dateRange.from || undefined}
            />
            <Button
              type="submit"
              icon={RefreshCw}
              loading={working === 'store'}
              disabled={Boolean(working)}
            >
              Review store
            </Button>
          </form>
          {working === 'store' && !displayStore ? (
            <Skeleton label="Analyzing store" />
          ) : displayStore ? (
            <>
              {displayStore.reconnectRequired && (
                <div className="connection-note">
                  <span>Daraz authorization needs to be refreshed.</span>
                  {displayStore.reconnectUrl ? (
                    <a className="button" href={displayStore.reconnectUrl}>
                      Reconnect Daraz
                    </a>
                  ) : (
                    <Button onClick={onConnect}>Reconnect Daraz</Button>
                  )}
                </div>
              )}
              <div className="kpi-strip">
                <Kpi
                  label="Orders"
                  value={formatNumber(displayStore.metrics?.orders)}
                  detail={
                    displayStore.range
                      ? `${formatDate(displayStore.range.from)} - ${formatDate(displayStore.range.to)}`
                      : 'Analyzed period'
                  }
                />
                <Kpi
                  label="Revenue"
                  value={formatCurrency(displayStore.metrics?.revenue)}
                  detail="Analyzed period"
                />
                <Kpi
                  label="Cancellation rate"
                  value={formatPercent(displayStore.metrics?.cancelRate)}
                  detail="Order cancellations"
                />
                <Kpi
                  label="On-time shipping"
                  value={formatPercent(displayStore.metrics?.shipOnTimeRate)}
                  detail="Fulfillment performance"
                />
              </div>
              <section className="analysis-section">
                <div className="section-heading">
                  <h2>Order trend</h2>
                  <StatusBadge
                    tone={
                      displayStore.sourceSummary?.failed?.length
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {formatNumber(displayStore.sourceSummary?.synced)} /{' '}
                    {formatNumber(displayStore.sourceSummary?.total)} sources
                    synced
                  </StatusBadge>
                </div>
                <OrderTrend items={displayStore.charts?.dailyOrders || []} />
              </section>
              <section className="analysis-section">
                <div className="section-heading">
                  <h2>Findings & next steps</h2>
                </div>
                <Findings
                  items={displayStore.recommendations || []}
                  onNavigate={onNavigate}
                />
              </section>
              <Disclosure title="Fulfillment breakdown">
                <div className="fulfillment-details">
                  <StatusDistribution
                    items={displayStore.charts?.statusBreakdown || []}
                  />
                  <dl className="detail-list">
                    <div>
                      <dt>Return rate</dt>
                      <dd>{formatPercent(displayStore.metrics?.returnRate)}</dd>
                    </div>
                    <div>
                      <dt>Seller rating</dt>
                      <dd>
                        {formatNumber(displayStore.metrics?.sellerRating)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </Disclosure>
              <Disclosure title="Data sources & freshness">
                <dl className="detail-list">
                  <div>
                    <dt>Sources</dt>
                    <dd>
                      {displayStore.sourceSummary?.sourceLabels?.join(', ') ||
                        'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt>Last updated</dt>
                    <dd>
                      {formatDate(
                        displayStore.fetchedAt ||
                          displayStore.generatedAt ||
                          displayStore.lastSyncedAt,
                        true,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Unavailable sources</dt>
                    <dd>
                      {displayStore.sourceSummary?.failed
                        ?.map((source) =>
                          typeof source === 'string'
                            ? source
                            : source.label || source.source || source.message,
                        )
                        .join(', ') || 'None reported'}
                    </dd>
                  </div>
                </dl>
              </Disclosure>
            </>
          ) : (
            <EmptyState
              title="Your store review starts here"
              action={
                <Button
                  variant="secondary"
                  onClick={reviewStore}
                  disabled={Boolean(working)}
                >
                  Review store
                </Button>
              }
            >
              Choose a period to load orders, revenue, and recommendations.
            </EmptyState>
          )}
        </>
      )}

      {initialFeature === 'product' && (
        <div className="product-workspace">
          <aside className="product-master">{selector}</aside>
          <section className="product-detail">
            <div className="mobile-product-select">
              <Button
                variant="secondary"
                icon={Package}
                onClick={() => setSelectorOpen(true)}
              >
                Select product
              </Button>
            </div>
            {loadingProducts ? (
              <Skeleton label="Loading selected product" />
            ) : selected || marketForm.sku ? (
              <>
                <div className="product-snapshot">
                  <ProductImage
                    product={selected || displayProduct?.ownProduct}
                    large
                  />
                  <div>
                    <span className="muted">{marketForm.sku}</span>
                    <h2>
                      {selected?.title ||
                        displayProduct?.ownProduct?.title ||
                        marketForm.query ||
                        'Selected product'}
                    </h2>
                    <div className="snapshot-facts">
                      <strong>
                        {formatCurrency(
                          selected?.price ?? marketForm.currentPrice,
                        )}
                      </strong>
                      <span>
                        {numeric(selected?.stock) === null
                          ? 'Stock unavailable'
                          : `${formatNumber(selected.stock)} in stock`}
                      </span>
                      {numeric(selected?.stock) === 0 && (
                        <StatusBadge tone="warning">Out of stock</StatusBadge>
                      )}
                    </div>
                  </div>
                </div>
                <Tabs
                  tabs={productTabs}
                  value={productTab}
                  onChange={setProductTab}
                  label="Product detail"
                >
                  {productTab === 'overview' && (
                    <>
                      <div className="section-heading">
                        <h2>Market position</h2>
                        <Button
                          icon={Search}
                          onClick={analyzeProduct}
                          loading={working === 'product'}
                          disabled={Boolean(working)}
                        >
                          Analyze product
                        </Button>
                      </div>
                      <div className="product-metrics">
                        <Kpi
                          label="Your price"
                          value={formatCurrency(
                            displayProduct?.computed?.ownPrice ??
                              marketForm.currentPrice,
                          )}
                        />
                        <Kpi
                          label="Market median"
                          value={formatCurrency(
                            displayMarket?.metrics?.medianPrice,
                          )}
                        />
                        <Kpi
                          label="Price percentile"
                          value={formatNumber(
                            displayProduct?.computed?.pricePercentile,
                          )}
                        />
                      </div>
                      {displayProduct?.recommendations?.length ? (
                        <div className="product-verdict">
                          <span className="eyebrow">RECOMMENDED NEXT STEP</span>
                          <h3>{displayProduct.recommendations[0].title}</h3>
                          <p>{displayProduct.recommendations[0].metric}</p>
                          <p>{displayProduct.recommendations[0].action}</p>
                          <Button
                            variant="secondary"
                            icon={ArrowRight}
                            onClick={() =>
                              onNavigate('pricing', marketForm.sku)
                            }
                          >
                            Review pricing
                          </Button>
                        </div>
                      ) : (
                        <EmptyState title="Ready for a closer look">
                          Analyze this product to see its market position and
                          next steps.
                        </EmptyState>
                      )}
                      <Disclosure title="Search & product inputs">
                        {marketFields}
                      </Disclosure>
                      <Disclosure title="Catalog comparison">
                        <div
                          className="table-scroll"
                          tabIndex={0}
                          role="region"
                          aria-label="Catalog comparison"
                        >
                          <table>
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Reviews</th>
                                <th>Rating</th>
                              </tr>
                            </thead>
                            <tbody>
                              {visibleProducts.map((product) => (
                                <tr key={product.sku}>
                                  <td>{product.sku}</td>
                                  <td>{formatCurrency(product.price)}</td>
                                  <td>{formatNumber(product.stock)}</td>
                                  <td>{formatNumber(product.reviewCount)}</td>
                                  <td>{formatNumber(product.rating)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Disclosure>
                    </>
                  )}
                  {productTab === 'market' && (
                    <>
                      <div className="market-search">
                        <Field
                          label="Market search"
                          value={marketForm.query}
                          disabled={Boolean(working)}
                          onChange={updateMarket('query')}
                        />
                        <Button
                          icon={Search}
                          loading={working === 'market'}
                          disabled={Boolean(working)}
                          onClick={() => searchMarket(false)}
                        >
                          Search market
                        </Button>
                        <IconButton
                          icon={RefreshCw}
                          label="Refresh market data"
                          disabled={Boolean(working)}
                          onClick={() => searchMarket(true)}
                        />
                      </div>
                      <PriceDistribution
                        products={displayMarket?.products || []}
                        currentPrice={marketForm.currentPrice}
                        median={displayMarket?.metrics?.medianPrice}
                      />
                      {displayMarket?.warning && (
                        <Feedback error={displayMarket.warning} />
                      )}
                      <MarketTable
                        key={marketForm.query}
                        products={displayMarket?.products || []}
                        currentPrice={marketForm.currentPrice}
                      />
                      <Disclosure title="Market snapshot details">
                        <dl className="detail-list">
                          <div>
                            <dt>Lower quartile (P25)</dt>
                            <dd>
                              {formatCurrency(displayMarket?.metrics?.p25Price)}
                            </dd>
                          </div>
                          <div>
                            <dt>Listings with prices</dt>
                            <dd>
                              {formatNumber(
                                displayMarket?.metrics?.pricedCount,
                              )}{' '}
                              / {formatNumber(displayMarket?.metrics?.count)}
                            </dd>
                          </div>
                          <div>
                            <dt>Source</dt>
                            <dd>{displayMarket?.source || '-'}</dd>
                          </div>
                          <div>
                            <dt>Retrieved</dt>
                            <dd>
                              {formatDate(displayMarket?.scrapedAt, true)}
                            </dd>
                          </div>
                          <div>
                            <dt>Cache valid until</dt>
                            <dd>
                              {formatDate(displayMarket?.cachedUntil, true)}
                            </dd>
                          </div>
                        </dl>
                        {marketFields}
                      </Disclosure>
                    </>
                  )}
                  {productTab === 'quality' && (
                    <>
                      <div className="section-heading">
                        <h2>Listing quality</h2>
                        <Button
                          variant="secondary"
                          icon={Search}
                          loading={working === 'product'}
                          disabled={Boolean(working)}
                          onClick={analyzeProduct}
                        >
                          Analyze listing
                        </Button>
                      </div>
                      <dl className="detail-list">
                        <div>
                          <dt>Title length</dt>
                          <dd>
                            {formatNumber(
                              displayProduct?.computed?.titleLength ??
                                selected?.title?.length,
                            )}{' '}
                            characters
                          </dd>
                        </div>
                        <div>
                          <dt>Competitor title median</dt>
                          <dd>
                            {formatNumber(
                              displayProduct?.computed?.competitorTitleMedian,
                            )}{' '}
                            characters
                          </dd>
                        </div>
                        <div>
                          <dt>Product images</dt>
                          <dd>
                            {formatNumber(
                              displayProduct?.computed?.imageCount ??
                                selected?.imageCount,
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt>Rating</dt>
                          <dd>{formatNumber(selected?.rating)}</dd>
                        </div>
                        <div>
                          <dt>Reviews</dt>
                          <dd>{formatNumber(selected?.reviewCount)}</dd>
                        </div>
                      </dl>
                      <Findings
                        items={displayProduct?.recommendations || []}
                        onNavigate={onNavigate}
                        sku={marketForm.sku}
                      />
                    </>
                  )}
                  {productTab === 'ai' && (
                    <Brief
                      result={displayBrief('product')}
                      loading={working === 'ai-product'}
                      disabled={Boolean(working)}
                      onGenerate={() => generateBrief('product')}
                    />
                  )}
                </Tabs>
              </>
            ) : (
              <>
                <EmptyState title="Select a product to begin">
                  Your catalog and market comparisons will appear here.
                </EmptyState>
                <Disclosure title="Search by SKU or item ID">
                  {marketFields}
                  <div className="dialog-actions">
                    <Button
                      onClick={analyzeProduct}
                      loading={working === 'product'}
                      disabled={Boolean(working)}
                    >
                      Analyze product
                    </Button>
                  </div>
                </Disclosure>
              </>
            )}
          </section>
        </div>
      )}

      {initialFeature === 'pricing' && (
        <>
          <ol className="pricing-steps" aria-label="Pricing workflow">
            {[
              'Select product',
              'Analyze market',
              'Review price',
              'Check rules',
              'Log action',
            ].map((step, i) => (
              <li
                key={step}
                className={
                  (repriceResult
                    ? 4
                    : displayPrice
                      ? 2
                      : marketForm.sku
                        ? 1
                        : 0) === i
                    ? 'current'
                    : ''
                }
              >
                <span>{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <div className="pricing-product">
            <ProductImage product={selected} />
            <div>
              <span className="muted">
                {marketForm.sku || 'No product selected'}
              </span>
              <h2>
                {selected?.title || marketForm.query || 'Select a product'}
              </h2>
            </div>
            <Button
              variant="secondary"
              icon={Package}
              onClick={() => setSelectorOpen(true)}
              disabled={Boolean(working)}
            >
              Change product
            </Button>
          </div>
          <div className="pricing-summary">
            <div>
              <span className="eyebrow">CURRENT PRICE</span>
              <p>
                {formatCurrency(
                  displayPrice?.currentPrice ?? marketForm.currentPrice,
                )}
              </p>
            </div>
            <ArrowRight size={22} className="price-arrow" />
            <div className="recommended-price">
              <span className="eyebrow">RECOMMENDED PRICE</span>
              <p>{formatCurrency(displayPrice?.recommendedPrice)}</p>
              <small>
                {displayPrice
                  ? `${formatPercent(displayPrice.deltaPercent)} movement`
                  : 'Awaiting analysis'}
              </small>
            </div>
            <div className="pricing-primary">
              {priceAnalysis && !activeDemo ? (
                <Button
                  icon={CheckCircle2}
                  onClick={() => setConfirmLog(true)}
                  disabled={Boolean(working) || hasFailedCheck}
                >
                  Log recommendation
                </Button>
              ) : (
                <Button
                  icon={Gauge}
                  onClick={analyzePrice}
                  loading={working === 'price'}
                  disabled={Boolean(working) || !marketForm.sku}
                >
                  Analyze price
                </Button>
              )}
              <span>
                {activeDemo
                  ? 'Demo only / No marketplace changes'
                  : 'Records an action; live writes are unavailable.'}
              </span>
            </div>
          </div>
          <div className="pricing-facts">
            <div>
              <span>Market position</span>
              <strong>
                {displayPrice?.pricePercentile === null ||
                displayPrice?.pricePercentile === undefined
                  ? '-'
                  : `${displayPrice.pricePercentile}th percentile`}
              </strong>
            </div>
            <div>
              <span>Gross margin</span>
              <strong>{formatPercent(margin)}</strong>
            </div>
            <div>
              <span>Pricing checks</span>
              <StatusBadge
                tone={
                  !displayPrice
                    ? 'neutral'
                    : hasFailedCheck
                      ? 'danger'
                      : 'warning'
                }
              >
                {!displayPrice
                  ? 'Not analyzed'
                  : hasFailedCheck
                    ? 'Check failed'
                    : 'Review risk checks'}
              </StatusBadge>
            </div>
          </div>
          <Tabs
            tabs={priceTabs}
            value={pricingTab}
            onChange={(tab) => {
              setPricingTab(tab)
              if (tab === 'history' && history === null && !working)
                loadHistory()
            }}
            label="Pricing detail"
          >
            {pricingTab === 'recommendation' && (
              <>
                <div className="section-heading">
                  <h2>Why this price?</h2>
                  <div className="toolbar">
                    {priceAnalysis && (
                      <Button
                        variant="ghost"
                        icon={RefreshCw}
                        loading={working === 'price'}
                        disabled={Boolean(working)}
                        onClick={analyzePrice}
                      >
                        Reanalyze
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      icon={Sparkles}
                      onClick={() => setBriefOpen(true)}
                    >
                      AI brief
                    </Button>
                  </div>
                </div>
                {displayPrice?.rationale?.length ? (
                  <ul className="rationale-list">
                    {displayPrice.rationale.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState title="No recommendation yet">
                    Analyze the selected product to see a price recommendation
                    and its evidence.
                  </EmptyState>
                )}
                <Disclosure title="Analysis inputs">{marketFields}</Disclosure>
                <Disclosure title="Pricing rule summary">
                  <dl className="detail-list">
                    <div>
                      <dt>Mode</dt>
                      <dd>
                        {savedRules?.autonomyLevel?.replaceAll('_', ' ') ||
                          'Not loaded'}
                      </dd>
                    </div>
                    <div>
                      <dt>Maximum movement</dt>
                      <dd>{formatPercent(savedRules?.maxDeltaPercent)}</dd>
                    </div>
                    <div>
                      <dt>Daily limit</dt>
                      <dd>
                        {formatNumber(savedRules?.maxRepricesPerSkuPerDay)}
                      </dd>
                    </div>
                  </dl>
                  <Button
                    variant="secondary"
                    icon={Settings2}
                    onClick={() => setRulesOpen(true)}
                  >
                    Configure rules
                  </Button>
                </Disclosure>
              </>
            )}
            {pricingTab === 'evidence' && (
              <>
                <div className="section-heading">
                  <h2>Competitor price distribution</h2>
                  <span className="muted">
                    {formatNumber(
                      displayPrice?.competitors?.metrics?.pricedCount,
                    )}{' '}
                    priced listings
                  </span>
                </div>
                <PriceDistribution
                  products={displayPrice?.competitors?.products || []}
                  currentPrice={displayPrice?.currentPrice}
                  recommendedPrice={displayPrice?.recommendedPrice}
                  median={displayPrice?.competitors?.metrics?.medianPrice}
                />
                {displayPrice?.competitors?.warning && (
                  <Feedback error={displayPrice.competitors.warning} />
                )}
                <MarketTable
                  products={displayPrice?.competitors?.products || []}
                  currentPrice={displayPrice?.currentPrice}
                />
              </>
            )}
            {pricingTab === 'checks' && (
              <>
                <div className="section-heading">
                  <h2>Guardrail results</h2>
                  <Button
                    variant="ghost"
                    icon={Settings2}
                    onClick={() => setRulesOpen(true)}
                  >
                    Configure rules
                  </Button>
                </div>
                {checks.length ? (
                  checks.map((check) => (
                    <div className="risk-row" key={check.label}>
                      <div>
                        <h3>{check.label}</h3>
                        <p>{check.evidence}</p>
                      </div>
                      <StatusBadge
                        tone={
                          check.passed === true
                            ? 'success'
                            : check.passed === false
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {check.passed === true
                          ? 'Passed'
                          : check.passed === false
                            ? 'Failed'
                            : 'Not verified'}
                      </StatusBadge>
                    </div>
                  ))
                ) : (
                  <EmptyState title="Analyze a price to check its rules" />
                )}
                <p className="muted mt-5">
                  Gross margin is calculated from selling price and product
                  cost, before fees. The cost-floor rule uses the configured
                  percentage above cost. The server checks the daily limit when
                  the recommendation is logged.
                </p>
              </>
            )}
            {pricingTab === 'history' && (
              <>
                <div className="section-heading">
                  <h2>Action history</h2>
                  <Button
                    icon={RefreshCw}
                    variant="secondary"
                    loading={working === 'history'}
                    disabled={Boolean(working)}
                    onClick={loadHistory}
                  >
                    Refresh history
                  </Button>
                </div>
                {repriceResult?.log && (
                  <div className="latest-log">
                    <StatusBadge
                      tone={
                        repriceResult.log.status === 'rejected'
                          ? 'danger'
                          : 'neutral'
                      }
                    >
                      {repriceResult.log.status}
                    </StatusBadge>
                    <p>{repriceResult.message || 'Recommendation recorded.'}</p>
                    <p>
                      {formatCurrency(repriceResult.log.oldPrice)} to{' '}
                      {formatCurrency(repriceResult.log.newPrice)}
                    </p>
                    <Disclosure title="Server guardrail results">
                      <dl className="detail-list">
                        {Object.entries(
                          repriceResult.log.guardrailResult || {},
                        ).map(([name, value]) => (
                          <div key={name}>
                            <dt>{name.replace(/([A-Z])/g, ' $1')}</dt>
                            <dd>
                              {value === null
                                ? 'Not set'
                                : typeof value === 'boolean'
                                  ? value
                                    ? 'Yes'
                                    : 'No'
                                  : String(value)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </Disclosure>
                  </div>
                )}
                {history?.length ? (
                  <div
                    className="table-scroll"
                    tabIndex={0}
                    role="region"
                    aria-label="Pricing action history"
                  >
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Previous</th>
                          <th>Requested</th>
                          <th>Recorded</th>
                          <th>Status</th>
                          <th>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((log, i) => (
                          <tr key={log.id || i}>
                            <td>{formatDate(log.createdAt, true)}</td>
                            <td>{formatCurrency(log.oldPrice)}</td>
                            <td>{formatCurrency(log.requestedPrice)}</td>
                            <td>{formatCurrency(log.newPrice)}</td>
                            <td>
                              <StatusBadge
                                tone={
                                  log.status === 'rejected'
                                    ? 'danger'
                                    : 'neutral'
                                }
                              >
                                {log.status}
                              </StatusBadge>
                            </td>
                            <td>{log.reason || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : working === 'history' ? (
                  <Skeleton label="Loading price history" />
                ) : (
                  <EmptyState
                    title={
                      history === null
                        ? "Load this product's history"
                        : 'No recorded actions'
                    }
                  >
                    {activeDemo
                      ? 'Demo recommendations cannot be logged to your account.'
                      : 'Recorded recommendations and their outcomes will appear here.'}
                  </EmptyState>
                )}
              </>
            )}
          </Tabs>
        </>
      )}

      {initialFeature === 'mcp' && (
        <div className="integrations-content">
          <section className="integration-intro">
            <div className="integration-glyph">
              <PlugZap size={30} />
            </div>
            <div>
              <div className="section-heading">
                <h2>Your store, in your AI client</h2>
                <StatusBadge>OAuth protected</StatusBadge>
              </div>
              <p>
                Ask your AI client about store performance, product comparisons,
                and pricing. You choose which client to authorize.
              </p>
              <p className="muted">
                Client authorization status is managed in your AI client.
              </p>
            </div>
          </section>
          <ol className="setup-steps">
            <li>
              <span>1</span>
              <div>
                <h3>Add a connection</h3>
                <p>Open your AI client's integrations or connector settings.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <h3>Paste your endpoint</h3>
                <p>Add the connection address below as a remote MCP server.</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <h3>Authorize your account</h3>
                <p>Sign in and review the access requested by your client.</p>
              </div>
            </li>
          </ol>
          <div className="endpoint-row">
            <div>
              <label htmlFor="mcp-endpoint">Connection endpoint</label>
              <input id="mcp-endpoint" value={mcpEndpoint} readOnly />
            </div>
            <IconButton
              icon={Copy}
              label="Copy endpoint"
              disabled={Boolean(working)}
              onClick={copyEndpoint}
            />
          </div>
          <div className="integration-access">
            <div>
              <h3>Authorization & control</h3>
              <p>
                Your client must sign in before it can access seller tools. This
                workspace does not receive your client's connection status.
              </p>
            </div>
            <Button
              variant="secondary"
              icon={Unplug}
              onClick={() => setDisconnectOpen(true)}
            >
              Disconnect a client
            </Button>
          </div>
          <Disclosure title="Developer details">
            <div className="developer-details">
              <p className="muted">
                Remote MCP endpoint. Authorization uses the client's OAuth flow;
                no API token needs to be copied from this workspace.
              </p>
              {manifest ? (
                ['tools', 'resources', 'prompts'].map((kind) => (
                  <div key={kind}>
                    <h3>
                      {kind} <span>{manifest[kind]?.length || 0}</span>
                    </h3>
                    <ul>
                      {(manifest[kind] || []).map((item) => (
                        <li key={typeof item === 'string' ? item : item.name}>
                          <code>
                            {typeof item === 'string' ? item : item.name}
                          </code>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <EmptyState title="Connection details unavailable">
                  Reload the page to request the available tools.
                </EmptyState>
              )}
            </div>
          </Disclosure>
        </div>
      )}

      <Dialog
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        title="Select product"
        drawer
      >
        {selector}
      </Dialog>
      <Dialog
        open={briefOpen}
        onClose={() => setBriefOpen(false)}
        title={
          initialFeature === 'store' ? 'Store AI brief' : 'Pricing AI brief'
        }
        drawer
      >
        <Feedback error={error} onDismiss={() => setError('')} />
        {activeDemo && <DemoIndicator />}
        <Brief
          result={displayBrief(
            initialFeature === 'store' ? 'store' : 'pricing',
          )}
          loading={working.startsWith('ai-')}
          disabled={Boolean(working)}
          onGenerate={() =>
            generateBrief(initialFeature === 'store' ? 'store' : 'pricing')
          }
        />
      </Dialog>
      <Dialog
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="Pricing rules"
        drawer
      >
        <Feedback error={error} onDismiss={() => setError('')} />
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault()
            if (
              guardrailForm.liveWritesEnabled &&
              !savedRules?.liveWritesEnabled
            ) {
              setRulesOpen(false)
              setConfirmLive(true)
            } else saveGuardrails()
          }}
        >
          <p className="muted">
            These limits apply to your account. Analyze again after saving to
            review a new recommendation.
          </p>
          <Select
            label="Approval mode"
            value={guardrailForm.autonomyLevel}
            onChange={updateRule('autonomyLevel')}
          >
            <option value="suggest_only">Suggest only</option>
            <option value="approval_required">Approval required</option>
          </Select>
          <div className="form-grid">
            <Field
              label="Minimum above cost (%)"
              type="number"
              min="0"
              step="any"
              required
              value={guardrailForm.minMarginPercent}
              onChange={updateRule('minMarginPercent')}
            />
            <Field
              label="Maximum price movement (%)"
              type="number"
              min="0"
              max="100"
              step="any"
              required
              value={guardrailForm.maxDeltaPercent}
              onChange={updateRule('maxDeltaPercent')}
            />
            <Field
              label="Reprices per SKU per day"
              type="number"
              min="1"
              required
              value={guardrailForm.maxRepricesPerSkuPerDay}
              onChange={updateRule('maxRepricesPerSkuPerDay')}
            />
            <Field
              label="Minimum price (PKR)"
              type="number"
              min="0"
              step="any"
              value={guardrailForm.priceFloor ?? ''}
              onChange={updateRule('priceFloor')}
            />
            <Field
              label="Maximum price (PKR)"
              type="number"
              min="0"
              step="any"
              value={guardrailForm.priceCeiling ?? ''}
              onChange={updateRule('priceCeiling')}
            />
          </div>
          <label className="check-field">
            <input
              type="checkbox"
              checked={Boolean(guardrailForm.liveWritesEnabled)}
              onChange={(e) =>
                setGuardrailForm((current) => ({
                  ...current,
                  liveWritesEnabled: e.target.checked,
                }))
              }
            />
            Allow live writes when available
          </label>
          <p className="muted">
            The current service records pricing actions only. Changing this
            setting does not update marketplace prices.
          </p>
          {!savedRules && (
            <Feedback error="Pricing rules could not be loaded. Reload before saving." />
          )}
          <Button
            type="submit"
            icon={Save}
            loading={working === 'guardrails'}
            disabled={Boolean(working) || !savedRules}
          >
            Save pricing rules
          </Button>
        </form>
      </Dialog>
      <ConfirmDialog
        open={confirmLive}
        onClose={() => {
          setConfirmLive(false)
          setRulesOpen(true)
        }}
        onConfirm={() => {
          setConfirmLive(false)
          saveGuardrails()
        }}
        title="Allow future live price writes?"
        confirmLabel="Save preference"
      >
        You are enabling the live-write preference. The current service still
        only logs recommendations. Review each price and confirm before any
        marketplace update.
      </ConfirmDialog>
      <ConfirmDialog
        open={confirmLog}
        onClose={() => setConfirmLog(false)}
        onConfirm={logReprice}
        loading={working === 'reprice'}
        title="Log this recommendation?"
        confirmLabel="Confirm & log"
      >
        <Feedback error={error} onDismiss={() => setError('')} />
        <p>
          <strong>{marketForm.sku}</strong>
        </p>
        <p>
          {formatCurrency(priceAnalysis?.currentPrice)} to{' '}
          <strong>{formatCurrency(priceAnalysis?.recommendedPrice)}</strong>
        </p>
        <p className="mt-3">
          The server will validate the saved guardrails and record the result.
          The current service does not change the live Daraz price.
        </p>
        {cost === null && (
          <p className="mt-3">
            Product cost is missing. The cost-floor check is not verified.
          </p>
        )}
      </ConfirmDialog>
      <Dialog
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        title="Connect AI client"
      >
        <Feedback error={error} onDismiss={() => { setError(''); setNotice('') }}>{notice}</Feedback>
        <div className="form-stack">
          <Select
            label="AI client"
            value={client}
            onChange={(e) => setClient(e.target.value)}
          >
            <option>Compatible AI client</option>
            <option>Claude</option>
            <option>ChatGPT</option>
          </Select>
          <p className="muted">
            In {client === 'Compatible AI client' ? 'your client' : client}, add
            a remote MCP connection using the endpoint below, then complete the
            authorization window.
          </p>
          <div className="endpoint-row">
            <code>{mcpEndpoint}</code>
            <IconButton
              icon={Copy}
              label="Copy connection endpoint"
              disabled={Boolean(working)}
              onClick={copyEndpoint}
            />
          </div>
          <p className="muted">
            Availability depends on your client's support for remote MCP and
            OAuth. Authorization starts in the client.
          </p>
          <Button
            icon={ExternalLink}
            variant="secondary"
            onClick={() => {
              setSetupOpen(false)
              onNavigate('settings')
            }}
          >
            Review AI provider settings
          </Button>
        </div>
      </Dialog>
      <Dialog
        open={disconnectOpen}
        onClose={() => setDisconnectOpen(false)}
        title="Disconnect an AI client"
      >
        <div className="form-stack">
          <p className="muted">
            Open the connected client's integration settings, select
            daraziq.store, and remove the connection. This page cannot revoke
            OAuth grants or verify whether a client is still authorized.
          </p>
          <p className="muted">
            For account-wide access removal, contact support. Removing the
            client connection may not invalidate previously issued access tokens
            immediately.
          </p>
          <a
            className="button secondary"
            href="mailto:ahmedsarwar7575@gmail.com?subject=AI%20client%20access%20removal"
          >
            Contact support
          </a>
        </div>
      </Dialog>
      {notice && (
        <Feedback toast onDismiss={() => setNotice('')}>
          {notice}
        </Feedback>
      )}
    </div>
  )
}
