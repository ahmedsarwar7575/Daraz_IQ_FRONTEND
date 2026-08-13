import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Copy,
  ExternalLink,
  Gauge,
  KeyRound,
  LineChart,
  Loader2,
  Package,
  Percent,
  PieChart,
  RefreshCw,
  Save,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Tags,
} from 'lucide-react'
import { apiBaseUrl, copilotApi } from '../../shared/api'

const cx = (...classes) => classes.filter(Boolean).join(' ')

const featureStyles = {
  store: {
    bg: 'bg-[#edf8f4]',
    text: 'text-[#236b55]',
    border: 'border-[#b9dfd2]',
    soft: 'bg-[#f6fbf9]',
    button: 'bg-[#27745d] hover:bg-[#1f604d]',
  },
  product: {
    bg: 'bg-[#eef6fb]',
    text: 'text-[#2e6f9e]',
    border: 'border-[#c6ddea]',
    soft: 'bg-[#f6fbfe]',
    button: 'bg-[#2f6f9f] hover:bg-[#285f88]',
  },
  pricing: {
    bg: 'bg-[#fff1ea]',
    text: 'text-[#a33a22]',
    border: 'border-[#efc9c1]',
    soft: 'bg-[#fff8f4]',
    button: 'bg-[#d94c06] hover:bg-[#bd4205]',
  },
  mcp: {
    bg: 'bg-[#f1f3f5]',
    text: 'text-[#3f4953]',
    border: 'border-[#d6dce2]',
    soft: 'bg-[#f8f9fa]',
    button: 'bg-[#313a43] hover:bg-[#222a31]',
  },
}

const features = [
  {
    id: 'store',
    label: 'Store Analyst',
    eyebrow: 'Performance',
    description: 'Seven-day store review with source sync, trend context, and action priorities.',
    icon: BarChart3,
  },
  {
    id: 'product',
    label: 'Product Lab',
    eyebrow: 'Catalog',
    description: 'Own product snapshot, competitor market data, and listing recommendations in one flow.',
    icon: Search,
  },
  {
    id: 'pricing',
    label: 'Pricing Control',
    eyebrow: 'Revenue',
    description: 'Guardrail-based price analysis with a clean audit trail before any live write.',
    icon: Gauge,
  },
  {
    id: 'mcp',
    label: 'MCP Access',
    eyebrow: 'Connectors',
    description: 'OAuth-protected MCP endpoint for Claude, ChatGPT, and compatible clients.',
    icon: Server,
  },
]

const defaultManifest = {
  tools: [
    'get_store_metrics',
    'get_metrics_history',
    'analyze_store_performance',
    'get_own_product',
    'search_competitors',
    'analyze_product',
    'flag_anomalies',
    'analyze_price',
    'apply_reprice',
    'get_reprice_history',
  ],
  resources: [
    'store://metrics/latest',
    'store://metrics/history',
    'product://{id}/own',
    'product://{id}/competitors',
    'pricing://{sku}/competitor-snapshot',
    'pricing://{sku}/history',
    'pricing://{sku}/guardrails',
  ],
  prompts: ['weekly_store_review', 'product_health_check', 'reprice_workflow'],
}

const formatCurrency = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return '-'
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(number)
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

const formatNumber = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return '-'
  return new Intl.NumberFormat('en').format(number)
}

const shortId = (value) => value ? `${String(value).slice(0, 8)}...` : 'Session user'

const EmptyPanel = ({ children }) => (
  <div className="grid min-h-[150px] place-items-center rounded-md border border-dashed border-[#d8dde3] bg-[#fbfcfd] px-5 text-center text-sm text-[#7c8690]">
    {children}
  </div>
)

const MiniBars = ({ items = [], valueKey = 'orders', color = '#27745d' }) => {
  const max = Math.max(1, ...items.map((item) => Number(item[valueKey]) || 0))
  if (!items.some((item) => Number(item[valueKey]) > 0)) return <EmptyPanel>No chart data available for this period.</EmptyPanel>
  return (
    <div className="flex h-48 items-end gap-1.5 rounded-md border border-[#e1e5e9] bg-[#fbfcfd] px-3 py-3">
      {items.map((item) => {
        const value = Number(item[valueKey]) || 0
        return (
          <div key={item.date || item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-36 w-full items-end">
              <div
                className="w-full rounded-t-sm transition"
                title={`${item.date || item.label}: ${value}`}
                style={{ height: `${Math.max(3, (value / max) * 100)}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

const DistributionBars = ({ products = [] }) => {
  const prices = products.map((product) => Number(product.price)).filter(Number.isFinite).slice(0, 14)
  const max = Math.max(1, ...prices)
  if (!prices.length) return <EmptyPanel>No competitor prices loaded yet.</EmptyPanel>
  return (
    <div className="flex h-44 items-end gap-2 rounded-md border border-[#e1e5e9] bg-[#fbfcfd] px-4 py-4">
      {prices.map((price, index) => (
        <div key={`${price}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex h-32 w-full items-end">
            <div
              className="w-full rounded-t-sm bg-[#d94c06] transition hover:bg-[#b83f04]"
              title={formatCurrency(price)}
              style={{ height: `${Math.max(8, (price / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

const FormattedBrief = ({ text }) => {
  const clean = String(text || '').replace(/\*\*/g, '').replace(/\\\*/g, '*').trim()
  if (!clean) return <p className="text-sm leading-6 text-[#7c8690]">No brief generated yet.</p>
  const lines = clean.split('\n').map((line) => line.trim()).filter(Boolean)
  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        const heading = /^(executive summary|what changed|recommended actions|risk checks|pricing rationale)$/i.test(line.replace(':', ''))
        const bullet = /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)
        if (heading) {
          return <h3 key={`${line}-${index}`} className="pt-1 text-sm font-semibold uppercase text-[#171c22]">{line.replace(':', '')}</h3>
        }
        return (
          <p key={`${line}-${index}`} className={cx('text-sm leading-6 text-[#3f4953]', bullet && 'pl-3')}>
            {line.replace(/^[-*]\s+/, '')}
          </p>
        )
      })}
    </div>
  )
}

const CompetitorTable = ({ products = [], empty = 'No competitor products loaded yet.' }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[820px] text-left text-sm">
      <thead className="border-b border-[#e2e5e9] bg-[#f8f9fa] text-xs font-semibold uppercase text-[#858e97]">
        <tr>
          <th className="px-5 py-3">Listing</th>
          <th className="px-5 py-3">Price</th>
          <th className="px-5 py-3">Sold</th>
          <th className="px-5 py-3">Reviews</th>
          <th className="px-5 py-3">Location</th>
          <th className="px-5 py-3">Link</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#eef0f2]">
        {products.slice(0, 12).map((product) => (
          <tr key={product.itemId || product.productUrl || product.title} className="bg-white transition hover:bg-[#f8fbfd]">
            <td className="px-5 py-3">
              <div className="flex items-center gap-3">
                {product.imageUrl
                  ? <img src={product.imageUrl} alt="" className="h-11 w-11 rounded-md object-cover" />
                  : <span className="h-11 w-11 rounded-md bg-[#edf1f4]" />}
                <div className="min-w-0">
                  <p className="max-w-[430px] truncate font-medium text-[#2e3943]">{product.title}</p>
                  <p className="mt-1 text-xs text-[#8a939c]">Rank {product.rank || '-'}</p>
                </div>
              </div>
            </td>
            <td className="px-5 py-3 font-semibold">{formatCurrency(product.price)}</td>
            <td className="px-5 py-3 text-[#53606c]">{formatNumber(product.soldCount)}</td>
            <td className="px-5 py-3 text-[#53606c]">{formatNumber(product.reviewCount)}</td>
            <td className="px-5 py-3 text-[#53606c]">{product.location || '-'}</td>
            <td className="px-5 py-3">
              {product.productUrl ? (
                <a href={product.productUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#d5dae0] px-2.5 text-xs font-semibold text-[#3f4953] transition hover:-translate-y-0.5 hover:bg-[#f8f9fa]">
                  Open <ExternalLink size={13} />
                </a>
              ) : '-'}
            </td>
          </tr>
        ))}
        {!products.length && (
          <tr>
            <td className="px-5 py-10 text-center text-sm text-[#7c8690]" colSpan={6}>{empty}</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)

const Button = ({ icon: Icon, children, loading, tone = 'store', variant = 'primary', ...props }) => {
  const style = featureStyles[tone] || featureStyles.store
  const className = variant === 'secondary'
    ? 'border border-[#d5dae0] bg-white text-[#3f4953] hover:bg-[#f7f8f9]'
    : `${style.button} text-white`

  return (
    <button
      className={cx(
        'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md px-3.5 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60',
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
      <span className="truncate">{children}</span>
    </button>
  )
}

const Field = ({ label, ...props }) => (
  <label className="block min-w-0">
    <span className="mb-2 block text-xs font-semibold uppercase text-[#858e97]">{label}</span>
    <input
      className="h-10 w-full rounded-md border border-[#d9dde3] bg-white px-3 text-sm text-[#171c22] transition hover:border-[#c4cbd2] focus:border-[#f85606] focus:outline-none focus:ring-2 focus:ring-[#fdd8c6]"
      {...props}
    />
  </label>
)

const Select = ({ label, children, ...props }) => (
  <label className="block min-w-0">
    <span className="mb-2 block text-xs font-semibold uppercase text-[#858e97]">{label}</span>
    <select
      className="h-10 w-full cursor-pointer rounded-md border border-[#d9dde3] bg-white px-3 text-sm text-[#171c22] transition hover:border-[#c4cbd2] focus:border-[#f85606] focus:outline-none focus:ring-2 focus:ring-[#fdd8c6]"
      {...props}
    >
      {children}
    </select>
  </label>
)

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex h-10 cursor-pointer items-center justify-between gap-3 rounded-md border border-[#d9dde3] bg-white px-3 transition hover:border-[#c4cbd2] hover:bg-[#fbfcfd]">
    <span className="truncate text-sm font-medium text-[#3f4953]">{label}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 accent-[#f85606]"
    />
  </label>
)

const MetricTile = ({ icon: Icon, label, value, detail, tone = 'store' }) => {
  const style = featureStyles[tone] || featureStyles.store
  return (
    <div className="min-w-0 border border-[#e1e5e9] bg-white p-4 shadow-[0_8px_22px_rgba(21,26,33,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cfd6dd] hover:shadow-[0_16px_32px_rgba(21,26,33,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase text-[#8a939c]">{label}</p>
          <p className="mt-2 truncate text-xl font-semibold text-[#171c22]">{value ?? '-'}</p>
          <p className="mt-1 truncate text-xs text-[#7c8690]">{detail}</p>
        </div>
        <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-md', style.bg, style.text)}>
          <Icon size={17} />
        </span>
      </div>
    </div>
  )
}

const Severity = ({ value }) => {
  const tone = value === 'high'
    ? 'bg-[#fff1ea] text-[#9a341f]'
    : value === 'medium'
      ? 'bg-[#fff8e6] text-[#7a5200]'
      : 'bg-[#edf8f4] text-[#236b55]'
  return <span className={cx('rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase', tone)}>{value || 'low'}</span>
}

const InsightList = ({ items = [], empty = 'No findings yet.' }) => (
  <div className="divide-y divide-[#e5e8eb] border border-[#e1e5e9] bg-white">
    {items.length ? items.map((item, index) => (
      <div key={`${item.title || item.message}-${index}`} className="p-4 transition hover:bg-[#fbfcfd]">
        <div className="flex flex-wrap items-center gap-2">
          <Severity value={item.severity || 'low'} />
          <h4 className="text-sm font-semibold text-[#171c22]">{item.title || item.message}</h4>
        </div>
        {item.metric && <p className="mt-2 text-xs font-medium text-[#66717c]">{item.metric}</p>}
        <p className="mt-1 text-sm leading-6 text-[#505b65]">{item.action || item.message}</p>
      </div>
    )) : (
      <div className="p-6 text-center text-sm text-[#7c8690]">{empty}</div>
    )}
  </div>
)

const FeatureTab = ({ feature, active, onClick }) => {
  const style = featureStyles[feature.id]
  const Icon = feature.icon
  return (
    <button
      onClick={onClick}
      className={cx(
        'flex min-h-14 min-w-0 cursor-pointer items-center gap-3 rounded-md border px-3 text-left text-sm font-semibold transition duration-200 hover:-translate-y-0.5',
        active
          ? `${style.border} ${style.bg} ${style.text}`
          : 'border-[#e0e4e8] bg-white text-[#66717c] hover:border-[#cfd6dd] hover:bg-[#f8f9fa]',
      )}
    >
      <Icon size={17} />
      <span className="min-w-0">
        <span className="block truncate">{feature.label}</span>
        <span className="block truncate text-[11px] font-medium opacity-70">{feature.eyebrow}</span>
      </span>
    </button>
  )
}

const Notice = ({ error, notice, connected }) => {
  if (!error && !notice && connected) return null
  const danger = Boolean(error || !connected)
  return (
    <div className={cx(
      'mt-5 flex items-start gap-3 rounded-md border px-4 py-3 text-sm',
      danger ? 'border-[#efc9c1] bg-[#fff6f3] text-[#983720]' : 'border-[#b9dfd2] bg-[#f1faf7] text-[#236b55]',
    )}>
      {danger ? <CircleAlert size={17} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={17} className="mt-0.5 shrink-0" />}
      <span className="flex-1">{error || notice || 'Connect Daraz to unlock live store metrics. Competitor benchmarking can still use cached market data.'}</span>
    </div>
  )
}

const AiBrief = ({ result, loading, onGenerate, tone, disabled }) => (
  <section className="overflow-hidden border border-[#dfe3e8] bg-white shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
    <div className="flex flex-col justify-between gap-3 border-b border-[#e2e5e9] px-5 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-[#171c22]">AI brief</h2>
        <p className="mt-1 truncate text-xs text-[#7c8690]">
          {result ? `${result.providerLabel || 'Local'} · ${result.model || 'fallback'}` : 'Provider from Settings'}
        </p>
      </div>
      <Button icon={Sparkles} tone={tone} loading={loading} onClick={onGenerate} disabled={disabled}>
        Generate
      </Button>
    </div>
    <div className="min-h-[180px] px-5 py-5">
      {result?.warning && (
        <div className="mb-4 rounded-md border border-[#efc9c1] bg-[#fff6f3] px-3 py-2 text-xs text-[#983720]">
          {result.warning}
        </div>
      )}
      <FormattedBrief text={result?.brief} />
    </div>
  </section>
)

function Copilot({ connected, user, initialFeature = 'store', showSwitcher = true }) {
  const [localFeature, setLocalFeature] = useState(initialFeature)
  const [manifest, setManifest] = useState(defaultManifest)
  const [products, setProducts] = useState([])
  const [storeReview, setStoreReview] = useState(null)
  const [competitors, setCompetitors] = useState(null)
  const [productAnalysis, setProductAnalysis] = useState(null)
  const [priceAnalysis, setPriceAnalysis] = useState(null)
  const [repriceResult, setRepriceResult] = useState(null)
  const [aiBriefs, setAiBriefs] = useState({})
  const [working, setWorking] = useState('')
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [dateRange, setDateRange] = useState({ days: 7, from: '', to: '' })
  const [productSearch, setProductSearch] = useState('')
  const [marketForm, setMarketForm] = useState({
    query: '',
    productId: '',
    sku: '',
    currentPrice: '',
    cost: '',
    limit: 12,
  })
  const [guardrailForm, setGuardrailForm] = useState({
    autonomyLevel: 'suggest_only',
    minMarginPercent: 5,
    maxDeltaPercent: 15,
    maxRepricesPerSkuPerDay: 3,
    priceFloor: '',
    priceCeiling: '',
    liveWritesEnabled: false,
  })

  const mcpEndpoint = `${apiBaseUrl.replace(/\/$/, '')}/mcp`
  const primitiveCounts = useMemo(() => ({
    tools: manifest?.tools?.length || 0,
    resources: manifest?.resources?.length || 0,
    prompts: manifest?.prompts?.length || 0,
  }), [manifest])
  const activeFeature = showSwitcher ? localFeature : initialFeature
  const activeMeta = features.find((feature) => feature.id === activeFeature) || features[0]
  const ActiveIcon = activeMeta.icon
  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase()
    if (!term) return products
    return products.filter((product) => `${product.title || ''} ${product.sku || ''} ${product.itemId || ''}`.toLowerCase().includes(term))
  }, [products, productSearch])

  const rangePayload = () => ({
    days: Number(dateRange.days || 7),
    ...(dateRange.from ? { from: dateRange.from } : {}),
    ...(dateRange.to ? { to: dateRange.to } : {}),
  })

  const selectProduct = useCallback((product, showNotice = true) => {
    setMarketForm((current) => ({
      ...current,
      query: product.query || product.title || '',
      productId: product.itemId || product.sku,
      sku: product.sku || '',
      currentPrice: String(product.price || ''),
      cost: String(product.cost || ''),
    }))
    setProductAnalysis(null)
    setPriceAnalysis(null)
    setRepriceResult(null)
    if (showNotice) setNotice(`${product.sku} selected.`)
  }, [])

  useEffect(() => {
    let active = true
    Promise.all([copilotApi.manifest(), copilotApi.getGuardrails(), copilotApi.products()])
      .then(([manifestResult, guardrailResult, productResult]) => {
        if (!active) return
        setManifest(manifestResult)
        setGuardrailForm((current) => ({ ...current, ...guardrailResult.guardrails }))
        setProducts(productResult.products || [])
        if (productResult.products?.[0]) selectProduct(productResult.products[0], false)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoadingProducts(false)
      })
    return () => { active = false }
  }, [selectProduct])

  const updateMarket = (field) => (event) => {
    setMarketForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const updateRange = (field) => (event) => {
    const value = event.target.value
    setDateRange((current) => ({
      ...current,
      [field]: value,
      ...(field === 'days' ? { from: '', to: '' } : {}),
    }))
  }

  const updateGuardrail = (field) => (event) => {
    const value = field === 'liveWritesEnabled' ? event.target.checked : event.target.value
    setGuardrailForm((current) => ({ ...current, [field]: value }))
  }

  const run = async (key, handler) => {
    setWorking(key)
    setError('')
    setNotice('')
    try {
      await handler()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setWorking('')
    }
  }

  const setAiResult = (mode, result) => {
    setAiBriefs((current) => ({ ...current, [mode]: result }))
  }

  const reviewStore = () => run('store', async () => {
    setStoreReview(await copilotApi.analyzeStore(rangePayload()))
  })

  const generateStoreBrief = () => run('aiStore', async () => {
    const result = await copilotApi.aiBrief({ mode: 'store', ...rangePayload() })
    setAiResult('store', result)
    setStoreReview(result.data)
  })

  const searchMarket = (refresh = false) => run(refresh ? 'refreshMarket' : 'market', async () => {
    const result = await copilotApi.searchCompetitors({
      query: marketForm.query,
      limit: Number(marketForm.limit),
      refresh,
    })
    setCompetitors(result)
  })

  const analyzeProduct = () => run('product', async () => {
    const result = await copilotApi.analyzeProduct({
      ...marketForm,
      productId: marketForm.productId || marketForm.sku,
      limit: Number(marketForm.limit),
      refresh: true,
    })
    setProductAnalysis(result)
    setCompetitors(result.competitors)
  })

  const generateProductBrief = () => run('aiProduct', async () => {
    const result = await copilotApi.aiBrief({
      mode: 'product',
      ...marketForm,
      productId: marketForm.productId || marketForm.sku,
      limit: Number(marketForm.limit),
      refresh: true,
    })
    setAiResult('product', result)
    setProductAnalysis(result.data)
    setCompetitors(result.data?.competitors)
  })

  const analyzePrice = () => run('price', async () => {
    setPriceAnalysis(await copilotApi.analyzePrice({
      sku: marketForm.sku,
      query: marketForm.query,
      currentPrice: marketForm.currentPrice,
      cost: marketForm.cost,
      limit: Number(marketForm.limit),
      refresh: true,
    }))
  })

  const generatePricingBrief = () => run('aiPricing', async () => {
    const result = await copilotApi.aiBrief({
      mode: 'pricing',
      sku: marketForm.sku,
      query: marketForm.query,
      currentPrice: marketForm.currentPrice,
      cost: marketForm.cost,
      limit: Number(marketForm.limit),
      refresh: true,
    })
    setAiResult('pricing', result)
    setPriceAnalysis(result.data)
  })

  const saveGuardrails = () => run('guardrails', async () => {
    const result = await copilotApi.updateGuardrails(guardrailForm)
    setGuardrailForm((current) => ({ ...current, ...result.guardrails }))
    setNotice('Guardrails saved.')
  })

  const logReprice = () => run('reprice', async () => {
    const result = await copilotApi.applyReprice({
      sku: marketForm.sku,
      currentPrice: marketForm.currentPrice,
      price: priceAnalysis?.recommendedPrice,
      reason: 'Copilot guarded pricing recommendation',
    })
    setRepriceResult(result)
    setNotice(result.message)
  })

  const copyMcpEndpoint = () => run('copyEndpoint', async () => {
    await navigator.clipboard.writeText(mcpEndpoint)
    setNotice('MCP endpoint copied.')
  })

  return (
    <div>
      <div className="overflow-hidden border border-[#dfe3e8] bg-white shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
        <div className={cx('flex flex-col justify-between gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-center', featureStyles[activeFeature]?.soft)}>
          <div className="flex min-w-0 items-start gap-4">
            <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-md', featureStyles[activeFeature]?.bg, featureStyles[activeFeature]?.text)}>
              <ActiveIcon size={21} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-[#8a939c]">{activeMeta.eyebrow}</p>
              <h1 className="mt-1 text-2xl font-semibold text-[#171c22]">{activeMeta.label}</h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#687480]">{activeMeta.description}</p>
            </div>
          </div>
          {activeFeature === 'mcp' && (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d6dce2] bg-white px-3 text-xs font-semibold text-[#3f4953] shadow-sm">
                <Bot size={15} /> {primitiveCounts.tools} tools
              </span>
              <span className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d6dce2] bg-white px-3 text-xs font-semibold text-[#3f4953] shadow-sm">
                <Server size={15} /> OAuth MCP
              </span>
            </div>
          )}
        </div>
      </div>

      <Notice error={error} notice={notice} connected={connected} />

      {showSwitcher && (
        <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <FeatureTab
              key={feature.id}
              feature={feature}
              active={activeFeature === feature.id}
              onClick={() => setLocalFeature(feature.id)}
            />
          ))}
        </section>
      )}

      {activeFeature === 'store' && (
        <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_390px]">
          <section className="overflow-hidden border border-[#dfe3e8] bg-white shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
            <div className="flex flex-col justify-between gap-4 border-b border-[#e2e5e9] px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-semibold">Store review</h2>
                <p className="mt-1 text-xs text-[#7c8690]">Live metrics, date range, source sync, anomaly signals</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button icon={BarChart3} tone="store" loading={working === 'store'} onClick={reviewStore}>
                  Run review
                </Button>
                <Button icon={Sparkles} tone="store" variant="secondary" loading={working === 'aiStore'} onClick={generateStoreBrief}>
                  AI brief
                </Button>
              </div>
            </div>
            <div className="grid gap-4 border-b border-[#e2e5e9] px-5 py-5 sm:grid-cols-3">
              <Select label="Range" value={dateRange.days} onChange={updateRange('days')}>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </Select>
              <Field label="From" type="date" value={dateRange.from} onChange={updateRange('from')} />
              <Field label="To" type="date" value={dateRange.to} onChange={updateRange('to')} />
            </div>
            <div className="grid gap-px bg-[#e5e8eb] sm:grid-cols-2 xl:grid-cols-4">
              <MetricTile tone="store" icon={BarChart3} label="Orders" value={formatNumber(storeReview?.metrics?.orders)} detail={`${dateRange.days || 7} days`} />
              <MetricTile tone="store" icon={Tags} label="Revenue" value={formatCurrency(storeReview?.metrics?.revenue)} detail="Finance" />
              <MetricTile tone="store" icon={Percent} label="Cancel" value={storeReview?.metrics?.cancelRate ?? '-'} detail="Rate" />
              <MetricTile tone="store" icon={Activity} label="Sources" value={`${storeReview?.sourceSummary?.synced ?? 0}/${storeReview?.sourceSummary?.total ?? 3}`} detail="Synced" />
            </div>
            <div className="px-5 py-5">
              {storeReview?.reconnectRequired && (
                <div className="mb-5 flex flex-col gap-3 rounded-md border border-[#efc9c1] bg-[#fff6f3] px-4 py-3 text-sm text-[#983720] sm:flex-row sm:items-center sm:justify-between">
                  <span>Daraz authorization needs to be refreshed before live metrics are reliable.</span>
                  {storeReview.reconnectUrl && (
                    <a href={storeReview.reconnectUrl} className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-[#d94c06] px-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#bd4205]">
                      Reconnect Daraz
                    </a>
                  )}
                </div>
              )}
              <InsightList items={storeReview?.recommendations || []} empty="Run a store review to load findings." />
            </div>
            <div className="grid gap-5 border-t border-[#e2e5e9] px-5 py-5 xl:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#171c22]">Daily orders</h3>
                  <LineChart size={17} className="text-[#27745d]" />
                </div>
                <MiniBars items={storeReview?.charts?.dailyOrders || []} color="#27745d" />
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#171c22]">Order statuses</h3>
                  <PieChart size={17} className="text-[#27745d]" />
                </div>
                <div className="space-y-2 rounded-md border border-[#e1e5e9] bg-[#fbfcfd] p-4">
                  {(storeReview?.charts?.statusBreakdown || []).length ? (storeReview.charts.statusBreakdown.map((item) => (
                    <div key={item.status} className="flex items-center justify-between gap-3 text-sm">
                      <span className="capitalize text-[#53606c]">{item.status}</span>
                      <span className="font-semibold text-[#171c22]">{formatNumber(item.count)}</span>
                    </div>
                  ))) : <EmptyPanel>No status data available for this range.</EmptyPanel>}
                </div>
              </div>
            </div>
          </section>

          <AiBrief
            tone="store"
            result={aiBriefs.store}
            loading={working === 'aiStore'}
            onGenerate={generateStoreBrief}
          />
        </div>
      )}

      {activeFeature === 'product' && (
        <div className="mt-7 space-y-7">
          <section className="overflow-hidden border border-[#dfe3e8] bg-white shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
            <div className="flex flex-col justify-between gap-4 border-b border-[#e2e5e9] px-5 py-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-base font-semibold">Product Lab</h2>
                <p className="mt-1 text-xs text-[#7c8690]">Competitor search, listing diff, product recommendations</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" tone="product" icon={Search} loading={working === 'market'} onClick={() => searchMarket(false)}>
                  Search
                </Button>
                <Button variant="secondary" tone="product" icon={RefreshCw} loading={working === 'refreshMarket'} onClick={() => searchMarket(true)}>
                  Refresh
                </Button>
                <Button tone="product" icon={ArrowRight} loading={working === 'product'} onClick={analyzeProduct}>
                  Analyze
                </Button>
                <Button variant="secondary" tone="product" icon={Sparkles} loading={working === 'aiProduct'} onClick={generateProductBrief}>
                  AI brief
                </Button>
              </div>
            </div>

            <div className="border-b border-[#e2e5e9] px-5 py-5">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h3 className="text-sm font-semibold text-[#171c22]">Your products</h3>
                  <p className="mt-1 text-xs text-[#7c8690]">
                    {loadingProducts ? 'Loading Daraz catalog...' : `${filteredProducts.length} of ${products.length} products shown`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Search by product name or SKU"
                    className="h-10 w-full rounded-md border border-[#d9dde3] bg-white px-3 text-sm text-[#171c22] transition placeholder:text-[#9ca4ae] focus:border-[#f85606] focus:outline-none focus:ring-2 focus:ring-[#fdd8c6] sm:w-72"
                  />
                  {loadingProducts
                    ? <Loader2 size={18} className="animate-spin text-[#2e6f9e]" />
                    : <Package size={18} className="text-[#2e6f9e]" />}
                </div>
              </div>
              {!loadingProducts && !products.length && (
                <div className="mb-4 rounded-md border border-[#efc9c1] bg-[#fff6f3] px-4 py-3 text-sm text-[#983720]">
                  No real Daraz products were returned yet. Reconnect Daraz or check that Product API permission is enabled for your Daraz app.
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.slice(0, 9).map((product) => (
                  <button
                    key={product.id || product.sku}
                    onClick={() => selectProduct(product)}
                    className={cx(
                      'min-w-0 cursor-pointer rounded-md border p-4 text-left shadow-[0_8px_18px_rgba(21,26,33,0.03)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#f8fbfd] hover:shadow-[0_14px_28px_rgba(21,26,33,0.07)]',
                      marketForm.sku === product.sku
                        ? 'border-[#c6ddea] bg-[#eef6fb]'
                        : 'border-[#dfe3e8] bg-white',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#171c22]">{product.title}</p>
                        <p className="mt-1 truncate text-xs text-[#7c8690]">{product.sku}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-[#2e6f9e]">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-px bg-[#dfe6ec] text-xs">
                      <span className="bg-white px-2 py-1.5 text-[#66717c]">Stock {product.stock ?? '-'}</span>
                      <span className="bg-white px-2 py-1.5 text-[#66717c]">Rate {product.rating ?? '-'}</span>
                      <span className="bg-white px-2 py-1.5 text-[#66717c]">Reviews {product.reviewCount ?? '-'}</span>
                    </div>
                  </button>
                ))}
                {loadingProducts && (
                  <div className="rounded-md border border-[#dfe3e8] bg-white p-4 text-sm text-[#7c8690]">
                    Loading product snapshots.
                  </div>
                )}
                {!loadingProducts && !products.length && (
                  <div className="rounded-md border border-[#dfe3e8] bg-white p-4 text-sm text-[#7c8690]">
                    No product snapshots yet.
                  </div>
                )}
                {!loadingProducts && products.length > 0 && !filteredProducts.length && (
                  <div className="rounded-md border border-[#dfe3e8] bg-white p-4 text-sm text-[#7c8690]">
                    No product matches that search.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 border-b border-[#e2e5e9] px-5 py-5 sm:grid-cols-2 lg:grid-cols-5">
              <Field label="Market query" value={marketForm.query} onChange={updateMarket('query')} />
              <Field label="SKU / item ID" value={marketForm.sku} onChange={updateMarket('sku')} placeholder="Optional" />
              <Field label="Current price" value={marketForm.currentPrice} onChange={updateMarket('currentPrice')} inputMode="decimal" />
              <Field label="Cost" value={marketForm.cost} onChange={updateMarket('cost')} inputMode="decimal" />
              <Field label="Limit" value={marketForm.limit} onChange={updateMarket('limit')} inputMode="numeric" />
            </div>

            <div className="grid gap-px bg-[#e5e8eb] sm:grid-cols-2 lg:grid-cols-4">
              <MetricTile tone="product" icon={Tags} label="Median" value={formatCurrency(competitors?.metrics?.medianPrice)} detail="Competitor price" />
              <MetricTile tone="product" icon={Gauge} label="P25" value={formatCurrency(competitors?.metrics?.p25Price)} detail="Aggressive band" />
              <MetricTile tone="product" icon={Percent} label="Priced" value={`${competitors?.metrics?.pricedCount ?? 0}/${competitors?.metrics?.count ?? 0}`} detail={competitors?.source || 'No snapshot'} />
              <MetricTile tone="product" icon={LineChart} label="Cached" value={formatDate(competitors?.cachedUntil)} detail={formatDate(competitors?.scrapedAt)} />
            </div>
          </section>

          <div className="grid gap-7 xl:grid-cols-[1fr_390px]">
            <section className="overflow-hidden border border-[#dfe3e8] bg-white shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
              <div className="border-b border-[#e2e5e9] px-5 py-4">
                <h2 className="text-base font-semibold">Product verdict</h2>
                <p className="mt-1 text-xs text-[#7c8690]">{productAnalysis?.ownProduct?.source || 'Waiting for analysis'}</p>
              </div>
              <div className="grid gap-px bg-[#e5e8eb] sm:grid-cols-3">
                <MetricTile tone="product" icon={Tags} label="Own price" value={formatCurrency(productAnalysis?.computed?.ownPrice)} detail="Current price" />
                <MetricTile tone="product" icon={Percent} label="Position" value={productAnalysis?.computed?.pricePercentile ?? '-'} detail="Price percentile" />
                <MetricTile tone="product" icon={ClipboardList} label="Title length" value={productAnalysis?.computed?.titleLength ?? '-'} detail="Listing signal" />
              </div>
              <div className="px-5 py-5">
                <InsightList items={productAnalysis?.recommendations || []} empty="Analyze a product to load recommendations." />
              </div>
            </section>

            <AiBrief
              tone="product"
              result={aiBriefs.product}
              loading={working === 'aiProduct'}
              onGenerate={generateProductBrief}
            />
          </div>

          <section className="overflow-hidden border border-[#dfe3e8] bg-white shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
            <div className="flex flex-col justify-between gap-4 border-b border-[#e2e5e9] px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-semibold">Competitor products</h2>
                <p className="mt-1 text-xs text-[#7c8690]">Scraped Daraz market listings with prices and source links</p>
              </div>
              {competitors?.warning && <span className="rounded-md bg-[#fff6f3] px-3 py-2 text-xs font-medium text-[#983720]">{competitors.warning}</span>}
            </div>
            <CompetitorTable products={competitors?.products || []} />
          </section>
        </div>
      )}

      {activeFeature === 'pricing' && (
        <div className="mt-7 space-y-7">
          <section className="overflow-hidden border border-[#dfe3e8] bg-white shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
            <div className="flex flex-col justify-between gap-4 border-b border-[#e2e5e9] px-5 py-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-base font-semibold">Pricing Control</h2>
                <p className="mt-1 text-xs text-[#7c8690]">Guardrails, price recommendation, audit log</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button tone="pricing" icon={Gauge} loading={working === 'price'} onClick={analyzePrice}>
                  Analyze price
                </Button>
                <Button variant="secondary" tone="pricing" icon={Sparkles} loading={working === 'aiPricing'} onClick={generatePricingBrief}>
                  AI brief
                </Button>
                <Button tone="pricing" icon={CheckCircle2} loading={working === 'reprice'} onClick={logReprice} disabled={!priceAnalysis?.recommendedPrice}>
                  Log price
                </Button>
              </div>
            </div>

            <div className="grid gap-4 border-b border-[#e2e5e9] px-5 py-5 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="SKU" value={marketForm.sku} onChange={updateMarket('sku')} />
              <Field label="Query" value={marketForm.query} onChange={updateMarket('query')} />
              <Field label="Current price" value={marketForm.currentPrice} onChange={updateMarket('currentPrice')} inputMode="decimal" />
              <Field label="Cost" value={marketForm.cost} onChange={updateMarket('cost')} inputMode="decimal" />
            </div>

            <div className="grid gap-px bg-[#e5e8eb] sm:grid-cols-2 xl:grid-cols-4">
              <MetricTile tone="pricing" icon={Tags} label="Current" value={formatCurrency(priceAnalysis?.currentPrice || marketForm.currentPrice)} detail="Seller price" />
              <MetricTile tone="pricing" icon={Gauge} label="Recommended" value={formatCurrency(priceAnalysis?.recommendedPrice)} detail={`${priceAnalysis?.deltaPercent ?? '-'}% delta`} />
              <MetricTile tone="pricing" icon={Percent} label="Position" value={priceAnalysis?.pricePercentile ?? '-'} detail="Competitor percentile" />
              <MetricTile tone="pricing" icon={ShieldCheck} label="Audit" value={repriceResult?.log?.status || '-'} detail={repriceResult?.message || 'No price logged'} />
            </div>
            <div className="grid gap-5 border-t border-[#e2e5e9] px-5 py-5 xl:grid-cols-[0.85fr_1.15fr]">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#171c22]">Competitor price spread</h3>
                  <PieChart size={17} className="text-[#d94c06]" />
                </div>
                <DistributionBars products={priceAnalysis?.competitors?.products || []} />
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#171c22]">Pricing rationale</h3>
                  <LineChart size={17} className="text-[#d94c06]" />
                </div>
                <div className="space-y-2 rounded-md border border-[#e1e5e9] bg-[#fbfcfd] p-4">
                  {(priceAnalysis?.rationale || []).length ? priceAnalysis.rationale.map((item) => (
                    <p key={item} className="text-sm leading-6 text-[#4d5863]">{item}</p>
                  )) : <EmptyPanel>Run price analysis to calculate guardrails and market rationale.</EmptyPanel>}
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-7 xl:grid-cols-[1fr_390px]">
            <section className="overflow-hidden border border-[#dfe3e8] bg-white shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
              <div className="flex flex-col justify-between gap-4 border-b border-[#e2e5e9] px-5 py-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-base font-semibold">Guardrails</h2>
                  <p className="mt-1 text-xs text-[#7c8690]">Server-side controls for every reprice request</p>
                </div>
                <Button variant="secondary" tone="pricing" icon={Save} loading={working === 'guardrails'} onClick={saveGuardrails}>
                  Save
                </Button>
              </div>
              <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
                <Select label="Autonomy" value={guardrailForm.autonomyLevel} onChange={updateGuardrail('autonomyLevel')}>
                  <option value="suggest_only">Suggest only</option>
                  <option value="approval_required">Approval required</option>
                </Select>
                <Field label="Min margin %" value={guardrailForm.minMarginPercent} onChange={updateGuardrail('minMarginPercent')} inputMode="decimal" />
                <Field label="Max delta %" value={guardrailForm.maxDeltaPercent} onChange={updateGuardrail('maxDeltaPercent')} inputMode="decimal" />
                <Field label="Runs / day" value={guardrailForm.maxRepricesPerSkuPerDay} onChange={updateGuardrail('maxRepricesPerSkuPerDay')} inputMode="numeric" />
                <Field label="Floor" value={guardrailForm.priceFloor ?? ''} onChange={updateGuardrail('priceFloor')} inputMode="decimal" />
                <Field label="Ceiling" value={guardrailForm.priceCeiling ?? ''} onChange={updateGuardrail('priceCeiling')} inputMode="decimal" />
                <Toggle label="Live writes" checked={Boolean(guardrailForm.liveWritesEnabled)} onChange={updateGuardrail('liveWritesEnabled')} />
              </div>
            </section>

            <AiBrief
              tone="pricing"
              result={aiBriefs.pricing}
              loading={working === 'aiPricing'}
              onGenerate={generatePricingBrief}
              disabled={!marketForm.currentPrice}
            />
          </div>

          <section className="overflow-hidden border border-[#dfe3e8] bg-white shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
            <div className="border-b border-[#e2e5e9] px-5 py-4">
              <h2 className="text-base font-semibold">Competitor products</h2>
              <p className="mt-1 text-xs text-[#7c8690]">Listings used for the pricing recommendation</p>
            </div>
            <CompetitorTable products={priceAnalysis?.competitors?.products || []} empty="Run price analysis to load competitor products." />
          </section>
        </div>
      )}

      {activeFeature === 'mcp' && (
        <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_390px]">
          <section className="overflow-hidden border border-[#dfe3e8] bg-white shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
            <div className="flex flex-col justify-between gap-4 border-b border-[#e2e5e9] px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-semibold">MCP Access</h2>
                <p className="mt-1 text-xs text-[#7c8690]">External client transport for the same seller tools</p>
              </div>
              <Button tone="mcp" icon={Copy} loading={working === 'copyEndpoint'} onClick={copyMcpEndpoint}>
                Copy endpoint
              </Button>
            </div>

            <div className="grid gap-px bg-[#e5e8eb] sm:grid-cols-3">
              <MetricTile tone="mcp" icon={Bot} label="Tools" value={primitiveCounts.tools} detail="Operations" />
              <MetricTile tone="mcp" icon={Activity} label="Resources" value={primitiveCounts.resources} detail="Static + templates" />
              <MetricTile tone="mcp" icon={Sparkles} label="Prompts" value={primitiveCounts.prompts} detail="Workflows" />
            </div>

            <div className="divide-y divide-[#e5e8eb]">
              <div className="grid gap-3 px-5 py-5 lg:grid-cols-[170px_1fr]">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#3f4953]">
                  <Server size={16} /> Endpoint
                </div>
                <code className="min-w-0 overflow-x-auto rounded-md border border-[#d9dde3] bg-[#f8f9fa] px-3 py-2 text-xs text-[#313a43]">
                  {mcpEndpoint}
                </code>
              </div>
              <div className="grid gap-3 px-5 py-5 lg:grid-cols-[170px_1fr]">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#3f4953]">
                  <KeyRound size={16} /> Identity
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricTile tone="mcp" icon={KeyRound} label="Resolved user" value={shortId(user?.id)} detail={user?.email || 'Session'} />
                  <MetricTile tone="mcp" icon={ShieldCheck} label="Scope" value="Scoped" detail="OAuth + JWT" />
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden border border-[#dfe3e8] bg-white shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
            <div className="border-b border-[#e2e5e9] px-5 py-4">
              <h2 className="text-base font-semibold">MCP surface</h2>
              <p className="mt-1 text-xs text-[#7c8690]">Available to Claude, GPT, or another MCP client</p>
            </div>
            <div className="divide-y divide-[#e5e8eb]">
              <div className="px-5 py-4">
                <p className="text-xs font-semibold uppercase text-[#8a939c]">Tools</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(manifest?.tools || []).map((item) => (
                    <span key={item} className="rounded-md border border-[#dfe3e8] bg-[#f8f9fa] px-2.5 py-1.5 text-xs font-medium text-[#3f4953]">{item}</span>
                  ))}
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs font-semibold uppercase text-[#8a939c]">Resources</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(manifest?.resources || []).map((item) => (
                    <span key={item} className="rounded-md border border-[#dfe3e8] bg-[#f8f9fa] px-2.5 py-1.5 text-xs font-medium text-[#3f4953]">{item}</span>
                  ))}
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs font-semibold uppercase text-[#8a939c]">Prompts</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(manifest?.prompts || []).map((item) => (
                    <span key={item} className="rounded-md border border-[#dfe3e8] bg-[#f8f9fa] px-2.5 py-1.5 text-xs font-medium text-[#3f4953]">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Copilot
