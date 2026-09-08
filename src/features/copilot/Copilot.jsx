import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
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
    border: 'border-[#d4ece3]',
    soft: 'bg-white',
    button: 'bg-[#20252c] hover:bg-[#111827]',
  },
  product: {
    bg: 'bg-[#eef6fb]',
    text: 'text-[#2e6f9e]',
    border: 'border-[#d5e6f0]',
    soft: 'bg-white',
    button: 'bg-[#20252c] hover:bg-[#111827]',
  },
  pricing: {
    bg: 'bg-[#fff1ea]',
    text: 'text-[#a33a22]',
    border: 'border-[#f3d4cb]',
    soft: 'bg-white',
    button: 'bg-[#20252c] hover:bg-[#111827]',
  },
  mcp: {
    bg: 'bg-[#f1f3f5]',
    text: 'text-[#3f4953]',
    border: 'border-[#e1e5e9]',
    soft: 'bg-white',
    button: 'bg-[#20252c] hover:bg-[#111827]',
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

const sampleDailyOrders = [
  18, 22, 19, 24, 21, 28, 33, 25, 29, 31,
  27, 36, 34, 38, 41, 37, 44, 39, 42, 47,
  43, 50, 46, 54, 58, 53, 61, 57, 65, 68,
].map((orders, index) => {
  const date = new Date('2026-09-08T00:00:00.000Z')
  date.setDate(date.getDate() - (29 - index))
  return { date: date.toISOString().slice(0, 10), orders }
})

const sampleImages = {
  earbuds: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=420&q=80',
  watch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=420&q=80',
  headset: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=420&q=80',
  shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=420&q=80',
  backpack: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=420&q=80',
  camera: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=420&q=80',
  skincare: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=420&q=80',
  laptop: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=420&q=80',
}

const sampleProducts = [
  {
    itemId: 'DRZ-1847201',
    sku: 'AUR-EB-X7-BLK',
    title: 'AuroraSound X7 Wireless Earbuds with ANC and 42H Case',
    query: 'wireless earbuds',
    price: 5290,
    cost: 3475,
    stock: 184,
    rating: 4.7,
    reviewCount: 1284,
    imageCount: 7,
    imageUrl: sampleImages.earbuds,
    source: 'Sample catalog',
  },
  {
    itemId: 'DRZ-1847202',
    sku: 'NOVA-FIT-S2-GRY',
    title: 'NovaFit S2 Bluetooth Calling Smart Watch',
    query: 'smartwatch',
    price: 6990,
    cost: 4550,
    stock: 96,
    rating: 4.6,
    reviewCount: 842,
    imageCount: 8,
    imageUrl: sampleImages.watch,
    source: 'Sample catalog',
  },
  {
    itemId: 'DRZ-1847203',
    sku: 'SONIC-HS-G9',
    title: 'SonicWave G9 Gaming Headset with Noise Cancel Mic',
    query: 'gaming headset',
    price: 4190,
    cost: 2680,
    stock: 142,
    rating: 4.5,
    reviewCount: 613,
    imageCount: 6,
    imageUrl: sampleImages.headset,
    source: 'Sample catalog',
  },
  {
    itemId: 'DRZ-1847204',
    sku: 'STRIDE-RN-41',
    title: 'StrideFlex Lightweight Running Shoes for Men',
    query: 'running shoes',
    price: 3590,
    cost: 2210,
    stock: 211,
    rating: 4.4,
    reviewCount: 932,
    imageCount: 9,
    imageUrl: sampleImages.shoes,
    source: 'Sample catalog',
  },
  {
    itemId: 'DRZ-1847205',
    sku: 'URBAN-BP-18L',
    title: 'UrbanCarry 18L Water Resistant Laptop Backpack',
    query: 'laptop backpack',
    price: 2990,
    cost: 1815,
    stock: 258,
    rating: 4.6,
    reviewCount: 1087,
    imageCount: 7,
    imageUrl: sampleImages.backpack,
    source: 'Sample catalog',
  },
  {
    itemId: 'DRZ-1847206',
    sku: 'PIXEL-MINI-CAM',
    title: 'PixelMini 1080p Vlogging Camera Kit',
    query: 'vlogging camera',
    price: 12990,
    cost: 9050,
    stock: 47,
    rating: 4.3,
    reviewCount: 274,
    imageCount: 8,
    imageUrl: sampleImages.camera,
    source: 'Sample catalog',
  },
  {
    itemId: 'DRZ-1847207',
    sku: 'GLOW-SERUM-C',
    title: 'GlowNest Vitamin C Serum 30ml',
    query: 'vitamin c serum',
    price: 1690,
    cost: 930,
    stock: 319,
    rating: 4.8,
    reviewCount: 1516,
    imageCount: 6,
    imageUrl: sampleImages.skincare,
    source: 'Sample catalog',
  },
  {
    itemId: 'DRZ-1847208',
    sku: 'PRODOCK-USBC-7',
    title: 'ProDock 7-in-1 USB-C Hub for Laptop',
    query: 'usb c hub',
    price: 4490,
    cost: 2860,
    stock: 118,
    rating: 4.5,
    reviewCount: 689,
    imageCount: 6,
    imageUrl: sampleImages.laptop,
    source: 'Sample catalog',
  },
]

const sampleCompetitorProducts = [
  { rank: 1, itemId: 'MKT-WIRELESS-EARBUDS-01', title: 'Prime Wireless Earbuds 1', productUrl: 'https://www.daraz.pk/catalog/?q=wireless+earbuds', imageUrl: sampleImages.earbuds, price: 3810, currency: 'PKR', discountPercent: 8, soldCount: 259, reviewCount: 74, rating: 4.1, location: 'Karachi', imageCount: 5 },
  { rank: 2, itemId: 'MKT-WIRELESS-EARBUDS-02', title: 'Metro Wireless Earbuds 2', productUrl: 'https://www.daraz.pk/catalog/?q=wireless+earbuds', imageUrl: sampleImages.earbuds, price: 4290, currency: 'PKR', discountPercent: 12, soldCount: 285, reviewCount: 103, rating: 4.2, location: 'Lahore', imageCount: 6 },
  { rank: 3, itemId: 'MKT-WIRELESS-EARBUDS-03', title: 'Value Wireless Earbuds 3', productUrl: 'https://www.daraz.pk/catalog/?q=wireless+earbuds', imageUrl: sampleImages.earbuds, price: 4660, currency: 'PKR', discountPercent: 15, soldCount: 311, reviewCount: 132, rating: 4.4, location: 'Islamabad', imageCount: 7 },
  { rank: 4, itemId: 'MKT-WIRELESS-EARBUDS-04', title: 'Elite Wireless Earbuds 4', productUrl: 'https://www.daraz.pk/catalog/?q=wireless+earbuds', imageUrl: sampleImages.earbuds, price: 4970, currency: 'PKR', discountPercent: 19, soldCount: 337, reviewCount: 161, rating: 4.5, location: 'Faisalabad', imageCount: 8 },
  { rank: 5, itemId: 'MKT-WIRELESS-EARBUDS-05', title: 'Swift Wireless Earbuds 5', productUrl: 'https://www.daraz.pk/catalog/?q=wireless+earbuds', imageUrl: sampleImages.earbuds, price: 5190, currency: 'PKR', discountPercent: 22, soldCount: 363, reviewCount: 190, rating: 4.7, location: 'Rawalpindi', imageCount: 5 },
  { rank: 6, itemId: 'MKT-WIRELESS-EARBUDS-06', title: 'Prime Wireless Earbuds 6', productUrl: 'https://www.daraz.pk/catalog/?q=wireless+earbuds', imageUrl: sampleImages.earbuds, price: 5450, currency: 'PKR', discountPercent: 25, soldCount: 389, reviewCount: 219, rating: 4.1, location: 'Karachi', imageCount: 6 },
  { rank: 7, itemId: 'MKT-WIRELESS-EARBUDS-07', title: 'Metro Wireless Earbuds 7', productUrl: 'https://www.daraz.pk/catalog/?q=wireless+earbuds', imageUrl: sampleImages.earbuds, price: 5710, currency: 'PKR', discountPercent: 8, soldCount: 415, reviewCount: 248, rating: 4.2, location: 'Lahore', imageCount: 7 },
  { rank: 8, itemId: 'MKT-WIRELESS-EARBUDS-08', title: 'Value Wireless Earbuds 8', productUrl: 'https://www.daraz.pk/catalog/?q=wireless+earbuds', imageUrl: sampleImages.earbuds, price: 6030, currency: 'PKR', discountPercent: 12, soldCount: 441, reviewCount: 277, rating: 4.4, location: 'Islamabad', imageCount: 8 },
  { rank: 9, itemId: 'MKT-WIRELESS-EARBUDS-09', title: 'Elite Wireless Earbuds 9', productUrl: 'https://www.daraz.pk/catalog/?q=wireless+earbuds', imageUrl: sampleImages.earbuds, price: 6350, currency: 'PKR', discountPercent: 15, soldCount: 467, reviewCount: 306, rating: 4.5, location: 'Faisalabad', imageCount: 5 },
  { rank: 10, itemId: 'MKT-WIRELESS-EARBUDS-10', title: 'Swift Wireless Earbuds 10', productUrl: 'https://www.daraz.pk/catalog/?q=wireless+earbuds', imageUrl: sampleImages.earbuds, price: 6820, currency: 'PKR', discountPercent: 19, soldCount: 493, reviewCount: 335, rating: 4.7, location: 'Rawalpindi', imageCount: 6 },
  { rank: 11, itemId: 'MKT-WIRELESS-EARBUDS-11', title: 'Prime Wireless Earbuds 11', productUrl: 'https://www.daraz.pk/catalog/?q=wireless+earbuds', imageUrl: sampleImages.earbuds, price: 7300, currency: 'PKR', discountPercent: 22, soldCount: 519, reviewCount: 364, rating: 4.1, location: 'Karachi', imageCount: 7 },
  { rank: 12, itemId: 'MKT-WIRELESS-EARBUDS-12', title: 'Metro Wireless Earbuds 12', productUrl: 'https://www.daraz.pk/catalog/?q=wireless+earbuds', imageUrl: sampleImages.earbuds, price: 8040, currency: 'PKR', discountPercent: 25, soldCount: 545, reviewCount: 393, rating: 4.2, location: 'Lahore', imageCount: 8 },
]

const sampleCompetitors = {
  query: 'wireless earbuds',
  source: 'showcase market',
  scrapedAt: '2026-09-08T16:24:00.000Z',
  cachedUntil: '2026-09-08T22:24:00.000Z',
  metrics: {
    count: 12,
    pricedCount: 12,
    minPrice: 3810,
    p25Price: 4660,
    medianPrice: 5580,
    p75Price: 6350,
    maxPrice: 8040,
    medianSold: 402,
    medianReviews: 234,
  },
  products: sampleCompetitorProducts,
}

const sampleStoreReview = {
  connected: true,
  showcase: true,
  metrics: {
    orders: 1190,
    revenue: 5254000,
    cancelRate: 1.2,
    returnRate: 2.4,
    sellerRating: 96.8,
    shipOnTimeRate: 94.6,
  },
  sourceSummary: {
    synced: 3,
    total: 3,
    failed: [],
    sourceLabels: ['Seller profile', 'Orders history', 'Product catalog'],
  },
  charts: {
    dailyOrders: sampleDailyOrders,
    statusBreakdown: [
      { status: 'delivered', count: 904 },
      { status: 'shipped', count: 155 },
      { status: 'pending', count: 89 },
      { status: 'returned', count: 29 },
      { status: 'cancelled', count: 13 },
    ],
  },
  recommendations: [
    {
      severity: 'high',
      title: 'Review wireless earbuds before campaign traffic increases',
      metric: 'Current price is 5,290 while market median is 5,580',
      action: 'Lower to 4,870 only if stock stays above 120 units and margin remains above 24%.',
    },
    {
      severity: 'medium',
      title: 'Backpack inventory is carrying the weekend demand',
      metric: '194 orders with 258 units still available',
      action: 'Keep the product visible in the next homepage slot and monitor stock daily.',
    },
    {
      severity: 'low',
      title: 'Store health is stable',
      metric: '1.2% cancellation rate and 94.6% ship-on-time rate',
      action: 'No account-risk action is needed today.',
    },
  ],
}

const sampleProductAnalysis = {
  ownProduct: sampleProducts[0],
  computed: {
    ownPrice: 5290,
    competitorMedianPrice: 5580,
    pricePercentile: 58,
    titleLength: sampleProducts[0].title.length,
    competitorTitleMedian: 26,
    imageCount: 7,
  },
  competitors: sampleCompetitors,
  recommendations: [
    {
      severity: 'high',
      title: 'Price can move without leaving the main market band',
      metric: 'Recommended price: PKR 4,870',
      action: 'Use the lower price for the campaign window, then review after 48 hours.',
    },
    {
      severity: 'medium',
      title: 'Listing content is stronger than the median competitor',
      metric: '7 images against a market median of 6',
      action: 'Keep the current gallery and move the battery-life image to position two.',
    },
    {
      severity: 'low',
      title: 'Review count supports trust',
      metric: '1,284 reviews at 4.7 rating',
      action: 'Do not rewrite the title today; price is the more important lever.',
    },
  ],
}

const samplePriceAnalysis = {
  currentPrice: 5290,
  recommendedPrice: 4870,
  deltaPercent: -7.9,
  pricePercentile: 58,
  guardrails: {
    autonomyLevel: 'suggest_only',
    minMarginPercent: 5,
    maxDeltaPercent: 15,
  },
  competitors: sampleCompetitors,
  rationale: [
    'The current price is slightly above the fast-moving competitor cluster.',
    'A price of PKR 4,870 keeps margin positive while moving below the median.',
    'The change stays inside the 15% max-delta guardrail and should be logged before any live update.',
  ],
}

const sampleAiBriefs = {
  store: {
    providerLabel: 'Showcase brief',
    model: 'sample-data',
    brief: 'Executive summary\nOrders are healthy and account risk is low.\nRecommended actions\nReview the earbuds price before campaign traffic starts.\nKeep the backpack placement live because stock and order velocity are both strong.\nRisk checks\nDo not make live pricing changes outside guardrails.',
  },
  product: {
    providerLabel: 'Showcase brief',
    model: 'sample-data',
    brief: 'Executive summary\nAuroraSound X7 is trusted by buyers and has enough stock for a controlled price test.\nRecommended actions\nTest PKR 4,870 for 48 hours.\nKeep the current title and improve only the second image slot.\nRisk checks\nStop the test if margin drops below the configured floor.',
  },
  pricing: {
    providerLabel: 'Showcase brief',
    model: 'sample-data',
    brief: 'Pricing rationale\nPKR 4,870 is below the market median while staying within the seller guardrail.\nRecommended actions\nLog the recommendation first, then review sales velocity after two days.\nRisk checks\nDo not enable live writes until approval workflow is confirmed.',
  },
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
  <div className="grid min-h-[140px] place-items-center rounded-lg border border-dashed border-[#d8dde3] bg-[#fafbfc] px-5 text-center text-sm text-[#667085]">
    {children}
  </div>
)

const DistributionBars = ({ products = [] }) => {
  const prices = products.map((product) => Number(product.price)).filter(Number.isFinite).slice(0, 14)
  const max = Math.max(1, ...prices)
  if (!prices.length) return <EmptyPanel>No competitor prices loaded yet.</EmptyPanel>
  return (
    <div className="flex h-40 items-end gap-2 rounded-lg border border-[#e5e7eb] bg-[#fafbfc] px-4 py-4">
      {prices.map((price, index) => (
        <div key={`${price}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex h-32 w-full items-end">
            <div
              className="w-full rounded-t-sm bg-[#d94c06]"
              title={formatCurrency(price)}
              style={{ height: `${Math.max(8, (price / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

const LineTrend = ({ items = [], valueKey = 'orders', color = '#2166a5' }) => {
  const values = items.map((item) => Number(item[valueKey]) || 0)
  const max = Math.max(1, ...values)
  const points = values.map((value, index) => {
    const x = values.length === 1 ? 0 : (index / (values.length - 1)) * 100
    const y = 84 - (value / max) * 68
    return `${x},${y}`
  })
  if (!values.length) return <EmptyPanel>No trend data available for this period.</EmptyPanel>
  return (
    <svg className="analytics-line h-44 w-full" viewBox="0 0 100 90" preserveAspectRatio="none" role="img" aria-label="Store trend">
      <path className="area" d={`M0,88 L${points.join(' L')} L100,88 Z`} style={{ fill: `${color}1a` }} />
      <path d={`M${points.join(' L')}`} style={{ stroke: color }} />
    </svg>
  )
}

const StatusPie = ({ items = [] }) => {
  const total = items.reduce((sum, item) => sum + (Number(item.count) || 0), 0)
  if (!total) return <EmptyPanel>No status data available for this range.</EmptyPanel>
  const palette = ['#f35b04', '#2166a5', '#1f8a70', '#d6a21b', '#6b5aa3']
  const gradient = items.map((item, index) => {
    const start = items.slice(0, index).reduce((sum, entry) => sum + ((Number(entry.count) || 0) / total) * 100, 0)
    const end = start + ((Number(item.count) || 0) / total) * 100
    return `${palette[index % palette.length]} ${start}% ${end}%`
  }).join(', ')

  return (
    <div className="flex flex-col gap-4 rounded-md border border-[#e1e5e9] bg-[#fafbfc] p-4 sm:flex-row sm:items-center">
      <div className="h-28 w-28 shrink-0 rounded-full border border-[#d9e1e8]" style={{ background: `conic-gradient(${gradient})` }} />
      <div className="min-w-0 flex-1 space-y-2">
        {items.map((item, index) => (
          <div key={item.status} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-[#53606c]">
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

const ProductSignalHeatmap = ({ products = [] }) => {
  const items = products.slice(0, 8)
  if (!items.length) return <EmptyPanel>No product signal data available yet.</EmptyPanel>
  const signals = [
    { key: 'price', label: 'Price', max: Math.max(1, ...items.map((item) => Number(item.price) || 0)) },
    { key: 'stock', label: 'Stock', max: Math.max(1, ...items.map((item) => Number(item.stock) || 0)) },
    { key: 'reviewCount', label: 'Reviews', max: Math.max(1, ...items.map((item) => Number(item.reviewCount) || 0)) },
    { key: 'rating', label: 'Rating', max: 5 },
  ]
  return (
    <div className="overflow-x-auto rounded-md border border-[#e1e5e9] bg-white">
      <div className="grid min-w-[620px] grid-cols-[210px_repeat(4,minmax(0,1fr))]">
        <div className="border-b border-[#eef0f2] px-4 py-3 text-xs font-medium text-[#65707c]">Product</div>
        {signals.map((signal) => (
          <div key={signal.key} className="border-b border-[#eef0f2] px-3 py-3 text-xs font-medium text-[#65707c]">{signal.label}</div>
        ))}
        {items.map((product) => (
          <Fragment key={product.sku}>
            <div className="border-b border-[#eef0f2] px-4 py-3">
              <p className="truncate text-sm font-medium text-[#1f2933]">{product.sku}</p>
              <p className="mt-1 truncate text-xs text-[#65707c]">{product.title}</p>
            </div>
            {signals.map((signal) => {
              const value = Number(product[signal.key]) || 0
              const level = Math.max(1, Math.min(4, Math.ceil((value / signal.max) * 4)))
              return (
                <div key={`${product.sku}-${signal.key}`} className="border-b border-[#eef0f2] px-3 py-3">
                  <span className="heatmap-cell block h-7 w-full" data-level={level} title={`${signal.label}: ${value}`} />
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

const FormattedBrief = ({ text }) => {
  const clean = String(text || '').replace(/\*\*/g, '').replace(/\\\*/g, '*').trim()
  if (!clean) return <p className="text-sm leading-6 text-[#667085]">No brief generated yet.</p>
  const lines = clean.split('\n').map((line) => line.trim()).filter(Boolean)
  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        const heading = /^(executive summary|what changed|recommended actions|risk checks|pricing rationale)$/i.test(line.replace(':', ''))
        const bullet = /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)
        if (heading) {
          return <h3 key={`${line}-${index}`} className="pt-1 text-sm font-semibold text-[#15181d]">{line.replace(':', '')}</h3>
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
      <thead className="border-b border-[#e5e7eb] bg-[#fafbfc] text-xs font-medium text-[#8a94a3]">
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
          <tr key={product.itemId || product.productUrl || product.title} className="bg-white hover:bg-[#fafbfc]">
            <td className="px-5 py-3">
              <div className="flex items-center gap-3">
                {product.imageUrl
                  ? <img src={product.imageUrl} alt="" className="h-11 w-11 rounded-md object-cover" />
                  : <span className="h-11 w-11 rounded-md bg-[#edf1f4]" />}
                <div className="min-w-0">
                  <p className="max-w-[430px] truncate font-medium text-[#242b33]">{product.title}</p>
                  <p className="mt-1 text-xs text-[#8a94a3]">Rank {product.rank || '-'}</p>
                </div>
              </div>
            </td>
            <td className="px-5 py-3 font-semibold">{formatCurrency(product.price)}</td>
            <td className="px-5 py-3 text-[#53606c]">{formatNumber(product.soldCount)}</td>
            <td className="px-5 py-3 text-[#53606c]">{formatNumber(product.reviewCount)}</td>
            <td className="px-5 py-3 text-[#53606c]">{product.location || '-'}</td>
            <td className="px-5 py-3">
              {product.productUrl ? (
                <a href={product.productUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#d8dde3] px-2.5 text-xs font-semibold text-[#344054] transition hover:bg-[#f8fafc]">
                  Open <ExternalLink size={13} />
                </a>
              ) : '-'}
            </td>
          </tr>
        ))}
        {!products.length && (
          <tr>
            <td className="px-5 py-10 text-center text-sm text-[#667085]" colSpan={6}>{empty}</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)

const Button = ({ icon: Icon, children, loading, tone = 'store', variant = 'primary', ...props }) => {
  const style = featureStyles[tone] || featureStyles.store
  const className = variant === 'secondary'
    ? 'border border-[#d8dde3] bg-white text-[#344054] hover:bg-[#f8fafc]'
    : `${style.button} text-white`

  return (
    <button
      className={cx(
        'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md px-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
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
    <span className="mb-2 block text-xs font-semibold text-[#858e97]">{label}</span>
    <input
      className="h-10 w-full rounded-md border border-[#d8dde3] bg-white px-3 text-sm text-[#15181d] transition placeholder:text-[#98a2b3] hover:border-[#c4cbd2] focus:border-[#9aa4b2] focus:outline-none focus:ring-2 focus:ring-[#edf0f3]"
      {...props}
    />
  </label>
)

const Select = ({ label, children, ...props }) => (
  <label className="block min-w-0">
    <span className="mb-2 block text-xs font-semibold text-[#858e97]">{label}</span>
    <select
      className="h-10 w-full cursor-pointer rounded-md border border-[#d8dde3] bg-white px-3 text-sm text-[#15181d] transition hover:border-[#c4cbd2] focus:border-[#9aa4b2] focus:outline-none focus:ring-2 focus:ring-[#edf0f3]"
      {...props}
    >
      {children}
    </select>
  </label>
)

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex h-10 cursor-pointer items-center justify-between gap-3 rounded-md border border-[#d8dde3] bg-white px-3 transition hover:border-[#c4cbd2] hover:bg-[#fafbfc]">
    <span className="truncate text-sm font-medium text-[#344054]">{label}</span>
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
    <div className="min-w-0 border border-[#e5e7eb] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-[#8a94a3]">{label}</p>
          <p className="mt-2 truncate text-xl font-semibold text-[#15181d]">{value ?? '-'}</p>
          <p className="mt-1 truncate text-xs text-[#667085]">{detail}</p>
        </div>
        <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-lg', style.bg, style.text)}>
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
  return <span className={cx('rounded-full px-2.5 py-1 text-[11px] font-medium capitalize', tone)}>{value || 'low'}</span>
}

const InsightList = ({ items = [], empty = 'No findings yet.' }) => (
  <div className="divide-y divide-[#eef0f2] rounded-lg border border-[#e5e7eb] bg-white">
    {items.length ? items.map((item, index) => (
      <div key={`${item.title || item.message}-${index}`} className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Severity value={item.severity || 'low'} />
          <h4 className="text-sm font-semibold text-[#15181d]">{item.title || item.message}</h4>
        </div>
        {item.metric && <p className="mt-2 text-xs font-medium text-[#667085]">{item.metric}</p>}
        <p className="mt-1 text-sm leading-6 text-[#4b5563]">{item.action || item.message}</p>
      </div>
    )) : (
      <div className="p-6 text-center text-sm text-[#667085]">{empty}</div>
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
        'flex min-h-12 min-w-0 cursor-pointer items-center gap-3 rounded-md border px-3 text-left text-sm font-semibold transition',
        active
          ? `${style.border} ${style.bg} ${style.text}`
          : 'border-[#e5e7eb] bg-white text-[#667085] hover:border-[#d8dde3] hover:bg-[#fafbfc]',
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
      'mt-5 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm',
      danger ? 'border-[#f2c6bc] bg-[#fff8f6] text-[#983720]' : 'border-[#b9dfd2] bg-[#f4fbf8] text-[#236b55]',
    )}>
      {danger ? <CircleAlert size={17} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={17} className="mt-0.5 shrink-0" />}
      <span className="flex-1">{error || notice || 'Connect Daraz to unlock live store metrics. Competitor benchmarking can still use cached market data.'}</span>
    </div>
  )
}

const AiBrief = ({ result, loading, onGenerate, tone, disabled }) => (
  <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
    <div className="flex flex-col justify-between gap-3 border-b border-[#eef0f2] px-5 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-[#15181d]">AI brief</h2>
        <p className="mt-1 truncate text-xs text-[#667085]">
          {result ? `${result.providerLabel || 'Local'} using ${result.model || 'fallback'}` : 'Provider from Settings'}
        </p>
      </div>
      <Button icon={Sparkles} tone={tone} loading={loading} onClick={onGenerate} disabled={disabled}>
        Generate
      </Button>
    </div>
    <div className="min-h-[180px] px-5 py-5">
      {result?.warning && (
        <div className="mb-4 rounded-md border border-[#f2c6bc] bg-[#fff8f6] px-3 py-2 text-xs text-[#983720]">
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
    query: sampleProducts[0].query,
    productId: sampleProducts[0].itemId,
    sku: sampleProducts[0].sku,
    currentPrice: String(sampleProducts[0].price),
    cost: String(sampleProducts[0].cost),
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
  const visibleProducts = products.length ? products : sampleProducts
  const displayStoreReview = storeReview || sampleStoreReview
  const displayCompetitors = competitors || sampleCompetitors
  const displayProductAnalysis = productAnalysis || sampleProductAnalysis
  const displayPriceAnalysis = priceAnalysis || samplePriceAnalysis
  const displayBriefs = {
    store: aiBriefs.store || sampleAiBriefs.store,
    product: aiBriefs.product || sampleAiBriefs.product,
    pricing: aiBriefs.pricing || sampleAiBriefs.pricing,
  }
  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase()
    if (!term) return visibleProducts
    return visibleProducts.filter((product) => `${product.title || ''} ${product.sku || ''} ${product.itemId || ''}`.toLowerCase().includes(term))
  }, [visibleProducts, productSearch])

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
        const fetchedProducts = productResult.products || []
        setProducts(fetchedProducts)
        selectProduct(fetchedProducts[0] || sampleProducts[0], false)
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
      <div className="flex flex-col justify-between gap-4 border-b border-[#e5e7eb] pb-5 lg:flex-row lg:items-end">
        <div className="flex min-w-0 items-start gap-3">
          <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-lg', featureStyles[activeFeature]?.bg, featureStyles[activeFeature]?.text)}>
            <ActiveIcon size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#8a94a3]">{activeMeta.eyebrow}</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#15181d]">{activeMeta.label}</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#667085]">{activeMeta.description}</p>
          </div>
        </div>
        {activeFeature === 'mcp' && (
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d8dde3] bg-white px-3 text-xs font-semibold text-[#344054]">
              <Bot size={15} /> {primitiveCounts.tools} tools
            </span>
            <span className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d8dde3] bg-white px-3 text-xs font-semibold text-[#344054]">
              <Server size={15} /> OAuth MCP
            </span>
          </div>
        )}
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
          <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-[#eef0f2] px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-semibold">Store review</h2>
                <p className="mt-1 text-xs text-[#667085]">Live metrics, date range, source sync, anomaly signals</p>
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
            <div className="grid gap-4 border-b border-[#eef0f2] px-5 py-5 sm:grid-cols-3">
              <Select label="Range" value={dateRange.days} onChange={updateRange('days')}>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </Select>
              <Field label="From" type="date" value={dateRange.from} onChange={updateRange('from')} />
              <Field label="To" type="date" value={dateRange.to} onChange={updateRange('to')} />
            </div>
            <div className="grid gap-px bg-[#e5e8eb] sm:grid-cols-2 xl:grid-cols-4">
              <MetricTile tone="store" icon={BarChart3} label="Orders" value={formatNumber(displayStoreReview?.metrics?.orders)} detail={`${dateRange.days || 7} days`} />
              <MetricTile tone="store" icon={Tags} label="Revenue" value={formatCurrency(displayStoreReview?.metrics?.revenue)} detail="Recent sales" />
              <MetricTile tone="store" icon={Percent} label="Cancel" value={displayStoreReview?.metrics?.cancelRate ?? '-'} detail="Order risk" />
              <MetricTile tone="store" icon={Activity} label="Sources" value={`${displayStoreReview?.sourceSummary?.synced ?? 0}/${displayStoreReview?.sourceSummary?.total ?? 3}`} detail="Synced" />
            </div>
            <div className="px-5 py-5">
              {displayStoreReview?.reconnectRequired && (
                <div className="mb-5 flex flex-col gap-3 rounded-md border border-[#efc9c1] bg-[#fff6f3] px-4 py-3 text-sm text-[#983720] sm:flex-row sm:items-center sm:justify-between">
                  <span>Daraz authorization needs to be refreshed before live metrics are reliable.</span>
                  {displayStoreReview.reconnectUrl && (
                    <a href={displayStoreReview.reconnectUrl} className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-[#d94c06] px-3 text-sm font-semibold text-white transition hover:bg-[#bd4205]">
                      Reconnect Daraz
                    </a>
                  )}
                </div>
              )}
              <InsightList items={displayStoreReview?.recommendations || []} empty="Run a store review to load findings." />
            </div>
            <div className="grid gap-5 border-t border-[#eef0f2] px-5 py-5 xl:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#15181d]">Order trend</h3>
                  <LineChart size={17} className="text-[#27745d]" />
                </div>
                <LineTrend items={displayStoreReview?.charts?.dailyOrders || []} color="#1f8a70" />
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#15181d]">Order status mix</h3>
                  <PieChart size={17} className="text-[#27745d]" />
                </div>
                <StatusPie items={displayStoreReview?.charts?.statusBreakdown || []} />
              </div>
            </div>
          </section>

          <AiBrief
            tone="store"
            result={displayBriefs.store}
            loading={working === 'aiStore'}
            onGenerate={generateStoreBrief}
          />
        </div>
      )}

      {activeFeature === 'product' && (
        <div className="mt-7 space-y-7">
          <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-[#eef0f2] px-5 py-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-base font-semibold">Product Lab</h2>
                <p className="mt-1 text-xs text-[#667085]">Competitor search, listing diff, product recommendations</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" tone="product" icon={Search} loading={working === 'market'} onClick={() => searchMarket(false)}>
                  Search
                </Button>
                <Button variant="secondary" tone="product" icon={RefreshCw} loading={working === 'refreshMarket'} onClick={() => searchMarket(true)}>
                  Refresh
                </Button>
                <Button tone="product" icon={ClipboardList} loading={working === 'product'} onClick={analyzeProduct}>
                  Analyze
                </Button>
                <Button variant="secondary" tone="product" icon={Sparkles} loading={working === 'aiProduct'} onClick={generateProductBrief}>
                  AI brief
                </Button>
              </div>
            </div>

            <div className="border-b border-[#eef0f2] px-5 py-5">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h3 className="text-sm font-semibold text-[#15181d]">Your products</h3>
                  <p className="mt-1 text-xs text-[#667085]">
                    {loadingProducts ? 'Loading Daraz catalog...' : `${filteredProducts.length} of ${visibleProducts.length} products shown`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Search by product name or SKU"
                    className="h-10 w-full rounded-md border border-[#d8dde3] bg-white px-3 text-sm text-[#15181d] transition placeholder:text-[#98a2b3] focus:border-[#9aa4b2] focus:outline-none focus:ring-2 focus:ring-[#edf0f3] sm:w-72"
                  />
                  {loadingProducts
                    ? <Loader2 size={18} className="animate-spin text-[#2e6f9e]" />
                    : <Package size={18} className="text-[#2e6f9e]" />}
                </div>
              </div>
              {!loadingProducts && !products.length && (
                <div className="mb-4 rounded-md border border-[#c6d2dd] bg-[#f8fbfd] px-4 py-3 text-sm text-[#4d5965]">
                  Showing sample catalog data until live Daraz product snapshots arrive.
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.slice(0, 9).map((product) => (
                  <button
                    key={product.id || product.sku}
                    onClick={() => selectProduct(product)}
                    className={cx(
                      'min-w-0 cursor-pointer rounded-md border p-4 text-left transition hover:bg-[#fafbfc]',
                      marketForm.sku === product.sku
                        ? 'border-[#c6ddea] bg-[#eef6fb]'
                        : 'border-[#e5e7eb] bg-white',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#15181d]">{product.title}</p>
                        <p className="mt-1 truncate text-xs text-[#667085]">{product.sku}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-[#2e6f9e]">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-px bg-[#dfe6ec] text-xs">
                      <span className="bg-white px-2 py-1.5 text-[#667085]">Stock {product.stock ?? '-'}</span>
                      <span className="bg-white px-2 py-1.5 text-[#667085]">Rate {product.rating ?? '-'}</span>
                      <span className="bg-white px-2 py-1.5 text-[#667085]">Reviews {product.reviewCount ?? '-'}</span>
                    </div>
                  </button>
                ))}
                {loadingProducts && (
                  <div className="rounded-md border border-[#e5e7eb] bg-white p-4 text-sm text-[#667085]">
                    Loading product snapshots.
                  </div>
                )}
                {!loadingProducts && visibleProducts.length > 0 && !filteredProducts.length && (
                  <div className="rounded-md border border-[#e5e7eb] bg-white p-4 text-sm text-[#667085]">
                    No product matches that search.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 border-b border-[#eef0f2] px-5 py-5 sm:grid-cols-2 lg:grid-cols-5">
              <Field label="Market query" value={marketForm.query} onChange={updateMarket('query')} />
              <Field label="SKU / item ID" value={marketForm.sku} onChange={updateMarket('sku')} placeholder="Optional" />
              <Field label="Current price" value={marketForm.currentPrice} onChange={updateMarket('currentPrice')} inputMode="decimal" />
              <Field label="Cost" value={marketForm.cost} onChange={updateMarket('cost')} inputMode="decimal" />
              <Field label="Limit" value={marketForm.limit} onChange={updateMarket('limit')} inputMode="numeric" />
            </div>

            <div className="grid gap-px bg-[#e5e8eb] sm:grid-cols-2 lg:grid-cols-4">
              <MetricTile tone="product" icon={Tags} label="Median" value={formatCurrency(displayCompetitors?.metrics?.medianPrice)} detail="Competitor price" />
              <MetricTile tone="product" icon={Gauge} label="P25" value={formatCurrency(displayCompetitors?.metrics?.p25Price)} detail="Aggressive band" />
              <MetricTile tone="product" icon={Percent} label="Priced" value={`${displayCompetitors?.metrics?.pricedCount ?? 0}/${displayCompetitors?.metrics?.count ?? 0}`} detail={displayCompetitors?.source || 'No snapshot'} />
              <MetricTile tone="product" icon={LineChart} label="Cached" value={formatDate(displayCompetitors?.cachedUntil)} detail={formatDate(displayCompetitors?.scrapedAt)} />
            </div>
          </section>

          <div className="grid gap-7 xl:grid-cols-[1fr_390px]">
            <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
              <div className="border-b border-[#eef0f2] px-5 py-4">
                <h2 className="text-base font-semibold">Product verdict</h2>
                <p className="mt-1 text-xs text-[#667085]">{displayProductAnalysis?.ownProduct?.source || 'Sample analysis'}</p>
              </div>
              <div className="grid gap-px bg-[#e5e8eb] sm:grid-cols-3">
                <MetricTile tone="product" icon={Tags} label="Own price" value={formatCurrency(displayProductAnalysis?.computed?.ownPrice)} detail="Current price" />
                <MetricTile tone="product" icon={Percent} label="Position" value={displayProductAnalysis?.computed?.pricePercentile ?? '-'} detail="Price percentile" />
                <MetricTile tone="product" icon={ClipboardList} label="Title length" value={displayProductAnalysis?.computed?.titleLength ?? '-'} detail="Listing signal" />
              </div>
              <div className="px-5 py-5">
                <InsightList items={displayProductAnalysis?.recommendations || []} empty="Analyze a product to load recommendations." />
              </div>
            </section>

            <AiBrief
              tone="product"
              result={displayBriefs.product}
              loading={working === 'aiProduct'}
              onGenerate={generateProductBrief}
            />
          </div>

          <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#eef0f2] px-5 py-4">
              <h2 className="text-base font-semibold">Product signal heatmap</h2>
              <p className="mt-1 text-xs text-[#667085]">Quick scan across price, stock, reviews, and rating strength</p>
            </div>
            <div className="px-5 py-5">
              <ProductSignalHeatmap products={visibleProducts} />
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-[#eef0f2] px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-semibold">Competitor products</h2>
                <p className="mt-1 text-xs text-[#667085]">Scraped Daraz market listings with prices and source links</p>
              </div>
              {displayCompetitors?.warning && <span className="rounded-md bg-[#fff6f3] px-3 py-2 text-xs font-medium text-[#983720]">{displayCompetitors.warning}</span>}
            </div>
            <CompetitorTable products={displayCompetitors?.products || []} />
          </section>
        </div>
      )}

      {activeFeature === 'pricing' && (
        <div className="mt-7 space-y-7">
          <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-[#eef0f2] px-5 py-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-base font-semibold">Pricing Control</h2>
                <p className="mt-1 text-xs text-[#667085]">Guardrails, price recommendation, audit log</p>
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

            <div className="grid gap-4 border-b border-[#eef0f2] px-5 py-5 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="SKU" value={marketForm.sku} onChange={updateMarket('sku')} />
              <Field label="Query" value={marketForm.query} onChange={updateMarket('query')} />
              <Field label="Current price" value={marketForm.currentPrice} onChange={updateMarket('currentPrice')} inputMode="decimal" />
              <Field label="Cost" value={marketForm.cost} onChange={updateMarket('cost')} inputMode="decimal" />
            </div>

            <div className="grid gap-px bg-[#e5e8eb] sm:grid-cols-2 xl:grid-cols-4">
              <MetricTile tone="pricing" icon={Tags} label="Current" value={formatCurrency(displayPriceAnalysis?.currentPrice || marketForm.currentPrice)} detail="Seller price" />
              <MetricTile tone="pricing" icon={Gauge} label="Recommended" value={formatCurrency(displayPriceAnalysis?.recommendedPrice)} detail={`${displayPriceAnalysis?.deltaPercent ?? '-'}% delta`} />
              <MetricTile tone="pricing" icon={Percent} label="Position" value={displayPriceAnalysis?.pricePercentile ?? '-'} detail="Competitor percentile" />
              <MetricTile tone="pricing" icon={ShieldCheck} label="Audit" value={repriceResult?.log?.status || '-'} detail={repriceResult?.message || 'No price logged'} />
            </div>
            <div className="grid gap-5 border-t border-[#eef0f2] px-5 py-5 xl:grid-cols-[0.85fr_1.15fr]">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#15181d]">Competitor price spread</h3>
                  <PieChart size={17} className="text-[#d94c06]" />
                </div>
                <DistributionBars products={displayPriceAnalysis?.competitors?.products || []} />
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#15181d]">Pricing rationale</h3>
                  <LineChart size={17} className="text-[#d94c06]" />
                </div>
                <div className="space-y-2 rounded-md border border-[#e1e5e9] bg-[#fafbfc] p-4">
                  {(displayPriceAnalysis?.rationale || []).length ? displayPriceAnalysis.rationale.map((item) => (
                    <p key={item} className="text-sm leading-6 text-[#4d5863]">{item}</p>
                  )) : <EmptyPanel>Run price analysis to calculate guardrails and market rationale.</EmptyPanel>}
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-7 xl:grid-cols-[1fr_390px]">
            <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
              <div className="flex flex-col justify-between gap-4 border-b border-[#eef0f2] px-5 py-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-base font-semibold">Guardrails</h2>
                  <p className="mt-1 text-xs text-[#667085]">Server-side controls for every reprice request</p>
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
              result={displayBriefs.pricing}
              loading={working === 'aiPricing'}
              onGenerate={generatePricingBrief}
              disabled={!marketForm.currentPrice}
            />
          </div>

          <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#eef0f2] px-5 py-4">
              <h2 className="text-base font-semibold">Competitor products</h2>
              <p className="mt-1 text-xs text-[#667085]">Listings used for the pricing recommendation</p>
            </div>
            <CompetitorTable products={displayPriceAnalysis?.competitors?.products || []} empty="Run price analysis to load competitor products." />
          </section>
        </div>
      )}

      {activeFeature === 'mcp' && (
        <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_390px]">
          <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-[#eef0f2] px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-semibold">MCP Access</h2>
                <p className="mt-1 text-xs text-[#667085]">External client transport for the same seller tools</p>
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
                <code className="min-w-0 overflow-x-auto rounded-md border border-[#d8dde3] bg-[#f8f9fa] px-3 py-2 text-xs text-[#313a43]">
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

          <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#eef0f2] px-5 py-4">
              <h2 className="text-base font-semibold">MCP surface</h2>
              <p className="mt-1 text-xs text-[#667085]">Available to Claude, GPT, or another MCP client</p>
            </div>
            <div className="divide-y divide-[#e5e8eb]">
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-[#8a94a3]">Tools</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(manifest?.tools || []).map((item) => (
                    <span key={item} className="rounded-md border border-[#e5e7eb] bg-[#f8f9fa] px-2.5 py-1.5 text-xs font-medium text-[#3f4953]">{item}</span>
                  ))}
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-[#8a94a3]">Resources</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(manifest?.resources || []).map((item) => (
                    <span key={item} className="rounded-md border border-[#e5e7eb] bg-[#f8f9fa] px-2.5 py-1.5 text-xs font-medium text-[#3f4953]">{item}</span>
                  ))}
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-[#8a94a3]">Prompts</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(manifest?.prompts || []).map((item) => (
                    <span key={item} className="rounded-md border border-[#e5e7eb] bg-[#f8f9fa] px-2.5 py-1.5 text-xs font-medium text-[#3f4953]">{item}</span>
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
