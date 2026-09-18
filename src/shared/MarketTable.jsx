import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { Field, Select, IconButton, EmptyState } from './ui'
import { formatCurrency, formatNumber, numeric } from './format'

export default function MarketTable({ products = [], currentPrice }) {
  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState('rank')
  const [page, setPage] = useState(0)
  const rows = useMemo(() => {
    const found = products.filter((product) =>
      `${product.title} ${product.location || ''}`
        .toLowerCase()
        .includes(filter.toLowerCase()),
    )
    return [...found].sort((a, b) =>
      sort === 'price-high'
        ? (numeric(b.price) ?? -Infinity) - (numeric(a.price) ?? -Infinity)
        : sort === 'sold'
          ? (numeric(b.soldCount) ?? -Infinity) -
            (numeric(a.soldCount) ?? -Infinity)
          : sort === 'price-low'
            ? (numeric(a.price) ?? Infinity) - (numeric(b.price) ?? Infinity)
            : (numeric(a.rank) ?? Infinity) - (numeric(b.rank) ?? Infinity),
    )
  }, [products, filter, sort])
  const pages = Math.max(1, Math.ceil(rows.length / 5))
  const currentPage = Math.min(page, pages - 1)
  const visible = rows.slice(currentPage * 5, currentPage * 5 + 5)
  return (
    <div className="market-table">
      <div className="table-toolbar">
        <Field
          label="Filter listings"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value)
            setPage(0)
          }}
          placeholder="Product or location"
        />
        <Select
          label="Sort by"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value)
            setPage(0)
          }}
        >
          <option value="rank">Market rank</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
          <option value="sold">Most sold</option>
        </Select>
      </div>
      {numeric(currentPrice) !== null && (
        <p className="market-anchor">
          Your price <strong>{formatCurrency(currentPrice)}</strong>
        </p>
      )}
      {visible.length ? (
        <>
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Competitor listings"
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">Listing</th>
                  <th scope="col">Price</th>
                  <th scope="col">Sold</th>
                  <th scope="col">Reviews</th>
                  <th scope="col">Location</th>
                  <th scope="col">
                    <span className="sr-only">Source</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((product, i) => (
                  <tr key={product.itemId || product.productUrl || i}>
                    <td>
                      <div className="listing-cell">
                        {product.imageUrl && (
                          <img src={product.imageUrl} alt="" loading="lazy" />
                        )}
                        <span title={product.title}>{product.title}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{formatCurrency(product.price)}</strong>
                      {numeric(currentPrice) !== null &&
                        numeric(product.price) !== null && (
                          <small>
                            {Number(product.price) < Number(currentPrice)
                              ? 'Below your price'
                              : Number(product.price) > Number(currentPrice)
                                ? 'Above your price'
                                : 'Matches your price'}
                          </small>
                        )}
                    </td>
                    <td>{formatNumber(product.soldCount)}</td>
                    <td>{formatNumber(product.reviewCount)}</td>
                    <td>{product.location || '-'}</td>
                    <td>
                      {product.productUrl && (
                        <a
                          className="icon-button"
                          href={product.productUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${product.title} on Daraz`}
                          title="Open source"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-listings">
            {visible.map((p, i) => (
              <article key={p.itemId || i}>
                <div className="listing-cell">
                  {p.imageUrl && <img src={p.imageUrl} alt="" loading="lazy" />}
                  <h3>{p.title}</h3>
                </div>
                <dl>
                  <div>
                    <dt>Price</dt>
                    <dd>{formatCurrency(p.price)}</dd>
                  </div>
                  <div>
                    <dt>Sold</dt>
                    <dd>{formatNumber(p.soldCount)}</dd>
                  </div>
                  <div>
                    <dt>Reviews</dt>
                    <dd>{formatNumber(p.reviewCount)}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>{p.location || '-'}</dd>
                  </div>
                </dl>
                {p.productUrl && (
                  <a
                    className="button secondary"
                    target="_blank"
                    rel="noreferrer"
                    href={p.productUrl}
                  >
                    View on Daraz <ExternalLink size={14} />
                  </a>
                )}
              </article>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title={
            products.length ? 'No matching listings' : 'No competitors loaded'
          }
        >
          Try another search or analyze the market.
        </EmptyState>
      )}
      <div className="pagination">
        <span>
          {rows.length
            ? `${currentPage * 5 + 1}-${Math.min((currentPage + 1) * 5, rows.length)} of ${rows.length} listings`
            : '0 listings'}
        </span>
        <div>
          <IconButton
            icon={ChevronLeft}
            label="Previous listings"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          />
          <span>
            {currentPage + 1} / {pages}
          </span>
          <IconButton
            icon={ChevronRight}
            label="Next listings"
            disabled={currentPage >= pages - 1}
            onClick={() => setPage(currentPage + 1)}
          />
        </div>
      </div>
    </div>
  )
}
