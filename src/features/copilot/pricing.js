import { numeric, formatCurrency, formatPercent } from '../../shared/format'

export function pricingChecks(analysis) {
  if (!analysis?.guardrails) return []
  const rules = analysis.guardrails
  const price = numeric(analysis.recommendedPrice)
  const current = numeric(analysis.currentPrice)
  const cost = numeric(analysis.cost)
  const delta =
    current > 0 && price !== null
      ? Math.abs(((price - current) / current) * 100)
      : null
  const floor = numeric(rules.priceFloor)
  const ceiling = numeric(rules.priceCeiling)
  // The server's minMarginPercent defines a markup on cost, not gross margin.
  const costFloor =
    cost !== null
      ? Math.round(cost * (1 + Number(rules.minMarginPercent) / 100))
      : null
  return [
    {
      label: 'Maximum price movement',
      passed:
        delta === null ? null : delta <= Number(rules.maxDeltaPercent) + 0.0001,
      evidence: `${formatPercent(delta)} movement / ${rules.maxDeltaPercent}% allowed`,
    },
    {
      label: 'Cost floor',
      passed: costFloor === null || price === null ? null : price >= costFloor,
      evidence:
        costFloor === null
          ? 'Add product cost to check this rule.'
          : `${formatCurrency(costFloor)} minimum (${rules.minMarginPercent}% above cost)`,
    },
    {
      label: 'Minimum price',
      passed: price === null ? null : floor === null || price >= floor,
      evidence:
        floor === null ? 'No minimum price configured.' : formatCurrency(floor),
    },
    {
      label: 'Maximum price',
      passed: price === null ? null : ceiling === null || price <= ceiling,
      evidence:
        ceiling === null
          ? 'No maximum price configured.'
          : formatCurrency(ceiling),
    },
    {
      label: 'Daily limit',
      passed: null,
      evidence: `${rules.maxRepricesPerSkuPerDay ?? '-'} per SKU / checked by the server when logged`,
    },
  ]
}
