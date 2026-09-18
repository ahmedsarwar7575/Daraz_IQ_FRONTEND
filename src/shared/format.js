export const numeric = (value) =>
  value === null ||
  value === undefined ||
  value === '' ||
  !Number.isFinite(Number(value))
    ? null
    : Number(value)
export const formatNumber = (value) =>
  numeric(value) === null
    ? '-'
    : new Intl.NumberFormat('en').format(Number(value))
export const formatCurrency = (value) =>
  numeric(value) === null
    ? '-'
    : new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        maximumFractionDigits: 0,
      }).format(Number(value))
export const formatPercent = (value) =>
  numeric(value) === null ? '-' : `${Number(value).toFixed(1)}%`
export const formatDate = (value, withTime = false) =>
  !value || Number.isNaN(new Date(value).getTime())
    ? 'Not available'
    : new Intl.DateTimeFormat('en', {
        day: '2-digit',
        month: 'short',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
      }).format(new Date(value))
