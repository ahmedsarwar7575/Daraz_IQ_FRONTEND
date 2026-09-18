import { useEffect, useId, useRef } from 'react'
import {
  ArrowRight,
  ChevronDown,
  CircleAlert,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react'

export function Brand() {
  return (
    <span className="brand">
      <img src="/favicon.svg" alt="" />
      <span>
        daraz<span className="brand-iq">iq</span>
        <span className="font-normal text-[#667078]">.store</span>
      </span>
    </span>
  )
}

export function Button({
  icon: Icon,
  children,
  loading,
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`button ${variant} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </button>
  )
}

export function IconButton({ icon: Icon, label, ...props }) {
  return (
    <button
      type="button"
      className="icon-button"
      title={label}
      aria-label={label}
      {...props}
    >
      <Icon size={18} />
    </button>
  )
}

export function StatusBadge({ children, tone = 'neutral', dot = false }) {
  return (
    <span className={`status-badge ${tone}`}>
      {dot && <span className="status-dot" />}
      {children}
    </span>
  )
}

export function DemoIndicator() {
  // return <StatusBadge tone="demo">store data</StatusBadge>
}

export function PageHeader({ title, description, children }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  )
}

export function Field({ label, hint, ...props }) {
  const id = useId()
  return (
    <label className="field">
      <span id={`${id}-label`}>{label}</span>
      <input
        aria-labelledby={`${id}-label`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...props}
      />
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </label>
  )
}

export function Select({ label, children, ...props }) {
  const id = useId()
  return (
    <label className="field">
      <span id={`${id}-label`}>{label}</span>
      <select aria-labelledby={`${id}-label`} {...props}>
        {children}
      </select>
    </label>
  )
}

export function Kpi({ label, value, detail }) {
  return (
    <dl className="kpi">
      <dt>{label}</dt>
      <dd>{value ?? '-'}{detail && <small>{detail}</small>}</dd>
    </dl>
  )
}

export function PriorityRow({
  title,
  evidence,
  action,
  severity,
  number,
  button,
  onAction,
}) {
  return (
    <div className="priority-row">
      {number && (
        <span className="priority-number">
          {String(number).padStart(2, '0')}
        </span>
      )}
      <div className="priority-content">
        <div className="priority-title">
          <h3>{title}</h3>
          {severity && (
            <StatusBadge
              tone={
                severity === 'high'
                  ? 'danger'
                  : severity === 'medium'
                    ? 'warning'
                    : 'neutral'
              }
            >
              {severity === 'high'
                ? 'Needs attention'
                : severity === 'medium'
                  ? 'Review'
                  : 'For your review'}
            </StatusBadge>
          )}
        </div>
        {evidence && <p>{evidence}</p>}
        {action && <p className="priority-action">{action}</p>}
      </div>
      {onAction && (
        <Button variant="secondary" icon={ArrowRight} onClick={onAction}>
          {button || 'Review'}
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}

export function Feedback({ error, children, onDismiss, toast = false }) {
  if (!error && !children) return null
  const Icon = error ? CircleAlert : CheckCircle2
  return (
    <div
      className={`feedback ${error ? 'error' : ''} ${toast ? 'toast' : ''}`}
      role={error ? 'alert' : 'status'}
    >
      <Icon size={18} className="shrink-0" />
      <span>{error || children}</span>
      {onDismiss && (
        <IconButton icon={X} label="Dismiss message" onClick={onDismiss} />
      )}
    </div>
  )
}

export function Skeleton({ label = 'Loading' }) {
  return (
    <div className="skeleton-set" role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div className="skeleton" style={{ width: '35%' }} />
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  )
}

export function Tabs({ tabs, value, onChange, label, children }) {
  const id = useId()
  const onKeyDown = (event, index) => {
    let next
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
    if (event.key === 'ArrowLeft')
      next = (index - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = tabs.length - 1
    if (next === undefined) return
    event.preventDefault()
    onChange(tabs[next].id)
    document.getElementById(`${id}-${tabs[next].id}`)?.focus()
  }
  return (
    <>
      <div className="tabs" role="tablist" aria-label={label}>
        {tabs.map((tab, index) => (
          <button
            type="button"
            key={tab.id}
            id={`${id}-${tab.id}`}
            role="tab"
            aria-selected={tab.id === value}
            aria-controls={`${id}-panel`}
            tabIndex={tab.id === value ? 0 : -1}
            onKeyDown={(event) => onKeyDown(event, index)}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-${value}`}
        tabIndex={0}
      >
        {children}
      </div>
    </>
  )
}

export function Disclosure({ title, children, open }) {
  return (
    <details className="disclosure" open={open}>
      <summary>
        {title}
        <ChevronDown size={16} />
      </summary>
      <div className="disclosure-content">{children}</div>
    </details>
  )
}

export function Dialog({ open, onClose, title, children, drawer = false }) {
  const ref = useRef(null)
  const id = useId()
  useEffect(() => {
    const dialog = ref.current
    if (!open) return
    const previousFocus = document.activeElement
    dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [open])
  return (
    <dialog
      ref={ref}
      className={`dialog ${drawer ? 'drawer' : ''}`}
      aria-labelledby={id}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === ref.current) {
          const box = ref.current.getBoundingClientRect()
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            onClose()
        }
      }}
    >
      <div className="dialog-header">
        <h2 id={id}>{title}</h2>
        <IconButton icon={X} label="Close dialog" onClick={onClose} />
      </div>
      {open && <div className="dialog-body">{children}</div>}
    </dialog>
  )
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = 'Confirm',
  loading,
  danger = false,
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="muted">{children}</div>
      <div className="dialog-actions">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
