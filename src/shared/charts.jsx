import { useEffect, useState } from 'react'
import { EmptyState } from './ui'
import { formatCurrency, formatDate, formatNumber, numeric } from './format'

// Keep SVG coordinates close to CSS pixels so small screens retain readable axes.
function useChartWidth() {
  const [element, setElement] = useState(null)
  const [width, setWidth] = useState(680)
  useEffect(() => {
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))))
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])
  return { ref: setElement, width }
}

export function OrderTrend({ items = [], bars = false }) {
  const [hover, setHover] = useState('')
  const { ref, width } = useChartWidth()
  const data = items.filter((item) => numeric(item.orders) !== null)
  if (!data.length)
    return (
      <EmptyState title="No order trend yet">
        Order activity will appear after your store syncs.
      </EmptyState>
    )
  const max = Math.max(4, ...data.map((item) => Number(item.orders)))
  const x = (i) => 48 + (i / Math.max(1, data.length - 1)) * (width - 84)
  const barWidth = Math.min(16, (width - 84) / data.length * .68)
  const y = (n) => 214 - (n / max) * 170
  const points = data.map((item, i) => `${x(i)},${y(item.orders)}`).join(' ')
  return (
    <div className="chart" ref={ref}>
      <div className="chart-tooltip" aria-live="polite">
        {hover}
      </div>
      <svg
        viewBox={`0 0 ${width} 260`}
        role="img"
        aria-label="Daily orders with dates and order counts"
      >
        <title>Daily orders</title>
        {[0, 1, 2, 3, 4].map((tick) => (
          <g key={tick}>
            <line
              className="chart-grid"
              x1="48"
              x2={width - 30}
              y1={y((max * tick) / 4)}
              y2={y((max * tick) / 4)}
            />
            <text x="36" y={y((max * tick) / 4) + 4} textAnchor="end">
              {Math.round((max * tick) / 4)}
            </text>
          </g>
        ))}
        <text x="48" y="22">
          Orders
        </text>
        {!bars && (
          <>
            <polygon
              points={`48,214 ${points} ${x(data.length - 1)},214`}
              fill="#f2f6f6"
            />
            <polyline
              points={points}
              fill="none"
              stroke="#437a83"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </>
        )}
        {data.map((item, i) => {
          const description = `${formatDate(item.date)}: ${formatNumber(item.orders)} orders`
          return (
            <g
              key={item.date}
              tabIndex={0}
              role="img"
              aria-label={description}
              onFocus={() => setHover(description)}
              onBlur={() => setHover('')}
              onMouseEnter={() => setHover(description)}
              onMouseLeave={() => setHover('')}
            >
              <title>{description}</title>
              {bars ? (
                <rect
                  x={x(i) - barWidth / 2}
                  y={y(item.orders)}
                  width={barWidth}
                  height={214 - y(item.orders)}
                  fill="#437a83"
                  rx="2"
                />
              ) : (
                <>
                  <circle
                    cx={x(i)}
                    cy={y(item.orders)}
                    r="10"
                    fill="transparent"
                  />
                  <circle
                    cx={x(i)}
                    cy={y(item.orders)}
                    r={data.length === 1 ? 4 : 2.5}
                    fill="#437a83"
                  />
                </>
              )}
            </g>
          )
        })}
        {[...new Set([0, Math.floor(data.length / 2), data.length - 1])].map(
          (i) => (
            <text
              key={i}
              x={x(i)}
              y="246"
              textAnchor={
                i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'
              }
            >
              {formatDate(data[i].date)}
            </text>
          ),
        )}
      </svg>
    </div>
  )
}

export function StatusDistribution({ items = [] }) {
  const total = items.reduce((sum, item) => sum + (numeric(item.count) || 0), 0)
  if (!total) return <EmptyState title="No fulfillment data" />
  return (
    <div className="distribution">
      {items.map((item) => (
        <div className="distribution-row" key={item.status}>
          <span>{item.status}</span>
          <div className="distribution-track">
            <span
              style={{
                width: `${(item.count / total) * 100}%`,
                background:
                  item.status === 'delivered'
                    ? '#327f6a'
                    : item.status === 'cancelled' || item.status === 'returned'
                      ? '#b88951'
                      : '#829399',
              }}
            />
          </div>
          <strong>{formatNumber(item.count)}</strong>
        </div>
      ))}
    </div>
  )
}

export function PriceDistribution({
  products = [],
  currentPrice,
  recommendedPrice,
  median,
}) {
  const [hover, setHover] = useState('')
  const { ref, width } = useChartWidth()
  const prices = products
    .map((product) => numeric(product.price))
    .filter((n) => n !== null && n > 0)
  if (!prices.length)
    return (
      <EmptyState title="No market prices yet">
        Analyze a product to compare its price with the market.
      </EmptyState>
    )
  const all = [
    ...prices,
    numeric(currentPrice),
    numeric(recommendedPrice),
    numeric(median),
  ].filter((n) => n !== null && n > 0)
  const min = Math.floor(Math.min(...all) * 0.9)
  const max = Math.ceil(Math.max(...all) * 1.1)
  const step = (max - min) / 8
  const bins = Array.from({ length: 8 }, (_, i) => ({
    start: min + i * step,
    end: min + (i + 1) * step,
    count: prices.filter(
      (n) =>
        n >= min + i * step && (i === 7 ? n <= max : n < min + (i + 1) * step),
    ).length,
  }))
  const peak = Math.ceil(Math.max(1, ...bins.map((bin) => bin.count)) / 2) * 2
  const x = (n) => 48 + ((n - min) / (max - min)) * (width - 84)
  const markers = [
    { label: 'Your price', value: numeric(currentPrice), color: '#263d4b' },
    {
      label: 'Recommended',
      value: numeric(recommendedPrice),
      color: '#c6450a',
    },
    { label: 'Median', value: numeric(median), color: '#14735e' },
  ].filter((m) => m.value !== null && m.value > 0)
  return (
    <div className="chart" ref={ref}>
      <div className="chart-tooltip" aria-live="polite">
        {hover}
      </div>
      <svg
        viewBox={`0 0 ${width} 280`}
        role="img"
        aria-label="Competitor price distribution in PKR with your price, recommendation and median"
      >
        <title>Competitor price distribution</title>
        <text x="48" y="20">
          Listings
        </text>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <line
              className="chart-grid"
              x1="48"
              x2={width - 36}
              y1={216 - i * 80}
              y2={216 - i * 80}
            />
            <text x="36" y={220 - i * 80} textAnchor="end">
              {formatNumber((peak * i) / 2)}
            </text>
          </g>
        ))}
        {bins.map((bin, i) => {
          const label = `${formatCurrency(bin.start)} to ${formatCurrency(bin.end)}: ${bin.count} listings`
          return (
            <rect
              key={i}
              x={x(bin.start) + 5}
              y={216 - (bin.count / peak) * 160}
              width={(width - 84) / 8 - 10}
              height={Math.max(1, (bin.count / peak) * 160)}
              rx="2"
              fill="#c6d8da"
              tabIndex={0}
              role="img"
              aria-label={label}
              onFocus={() => setHover(label)}
              onBlur={() => setHover('')}
              onMouseEnter={() => setHover(label)}
              onMouseLeave={() => setHover('')}
            >
              <title>{label}</title>
            </rect>
          )
        })}
        {markers.map((m) => (
          <line
            key={m.label}
            x1={x(m.value)}
            x2={x(m.value)}
            y1="34"
            y2="216"
            stroke={m.color}
            strokeWidth="2"
            strokeDasharray={m.label === 'Median' ? '4 4' : undefined}
          >
            <title>
              {m.label}: {formatCurrency(m.value)}
            </title>
          </line>
        ))}
        {[min, (min + max) / 2, max].map((n, i) => (
          <text
            key={i}
            x={x(n)}
            y="243"
            textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'}
          >
            {formatNumber(Math.round(n))}
          </text>
        ))}
        <text x={width / 2} y="270" textAnchor="middle">
          Price (PKR)
        </text>
      </svg>
      <div className="chart-legend">
        {markers.map((m) => (
          <span key={m.label} style={{ color: m.color }}>
            <i />
            {m.label}: {formatCurrency(m.value)}
          </span>
        ))}
      </div>
    </div>
  )
}
