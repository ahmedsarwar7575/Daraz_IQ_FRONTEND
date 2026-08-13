import { useEffect, useMemo, useState } from 'react'
import {
  Bot,
  CheckCircle2,
  CircleAlert,
  KeyRound,
  Loader2,
  LockKeyhole,
  Route,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { settingsApi } from '../../shared/api'

const providers = [
  {
    id: 'openrouter',
    label: 'OpenRouter',
    detail: 'Free router and multi-model catalog',
    icon: Route,
    accent: 'border-[#c6ddea] bg-[#eef6fb] text-[#2e6f9e]',
  },
  {
    id: 'openai',
    label: 'OpenAI GPT',
    detail: 'Direct GPT model calls',
    icon: Bot,
    accent: 'border-[#b9dfd2] bg-[#edf8f4] text-[#236b55]',
  },
]

const Field = ({ label, ...props }) => (
  <label className="block min-w-0">
    <span className="mb-2 block text-xs font-semibold uppercase text-[#858e97]">{label}</span>
    <input
      className="h-10 w-full rounded-md border border-[#d9dde3] bg-white px-3 text-sm text-[#171c22] transition placeholder:text-[#a0a7ae] focus:border-[#f85606] focus:outline-none focus:ring-2 focus:ring-[#fdd8c6]"
      {...props}
    />
  </label>
)

const StatusPill = ({ ready, hasUserKey, hasPlatformKey }) => {
  const text = ready
    ? hasUserKey
      ? 'User key'
      : hasPlatformKey
        ? 'Platform key'
        : 'Ready'
    : 'Needs key'
  return (
    <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
      ready ? 'bg-[#edf8f4] text-[#26735b]' : 'bg-[#fff6f3] text-[#a33a22]'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ready ? 'bg-[#35a17e]' : 'bg-[#d94c06]'}`} />
      {text}
    </span>
  )
}

const ProviderButton = ({ provider, active, onClick }) => {
  const Icon = provider.icon
  return (
    <button
      onClick={onClick}
      className={`min-w-0 cursor-pointer rounded-md border p-4 text-left shadow-[0_8px_18px_rgba(21,26,33,0.03)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(21,26,33,0.07)] ${
        active ? provider.accent : 'border-[#dfe3e8] bg-white text-[#46525d] hover:border-[#cfd6dd] hover:bg-[#f8f9fa]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{provider.label}</p>
          <p className="mt-1 truncate text-xs opacity-80">{provider.detail}</p>
        </div>
        <Icon size={18} />
      </div>
    </button>
  )
}

const ProviderPanel = ({
  title,
  description,
  model,
  modelPlaceholder,
  apiKey,
  keyPlaceholder,
  status,
  clear,
  onModel,
  onKey,
  onClear,
}) => (
  <section className="overflow-hidden border border-[#dfe3e8] bg-white shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
    <div className="flex flex-col justify-between gap-3 border-b border-[#e2e5e9] px-5 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 truncate text-xs text-[#7c8690]">{description}</p>
      </div>
      <StatusPill {...status} />
    </div>
    <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
      <Field label="Model" value={model} onChange={onModel} placeholder={modelPlaceholder} />
      <Field label="API key" type="password" value={apiKey} onChange={onKey} placeholder={keyPlaceholder} autoComplete="off" />
    </div>
    <div className="flex flex-col justify-between gap-3 border-t border-[#e2e5e9] px-5 py-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 text-xs text-[#7c8690]">
        <LockKeyhole size={14} /> Keys are encrypted at rest.
      </div>
      <button
        onClick={onClear}
        className={`inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition hover:-translate-y-0.5 ${
          clear ? 'border-[#efc9c1] bg-[#fff6f3] text-[#a33a22]' : 'border-[#d5dae0] text-[#3f4953] hover:bg-[#f8f9fa]'
        }`}
      >
        <Trash2 size={15} /> {clear ? 'Will clear' : 'Clear saved key'}
      </button>
    </div>
  </section>
)

function Settings({ user }) {
  const [settings, setSettings] = useState(null)
  const [form, setForm] = useState({
    activeProvider: 'openrouter',
    openaiModel: 'gpt-5.6-terra',
    openrouterModel: 'openrouter/free',
    openaiApiKey: '',
    openrouterApiKey: '',
    clearOpenaiKey: false,
    clearOpenrouterKey: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    settingsApi.ai()
      .then(({ settings: result }) => {
        if (!active) return
        setSettings(result)
        setForm((current) => ({
          ...current,
          activeProvider: result.activeProvider,
          openaiModel: result.providers.openai.model,
          openrouterModel: result.providers.openrouter.model,
        }))
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const activeProvider = useMemo(
    () => providers.find((provider) => provider.id === form.activeProvider) || providers[0],
    [form.activeProvider],
  )

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const toggleClear = (field) => () => {
    setForm((current) => ({ ...current, [field]: !current[field] }))
  }

  const save = async () => {
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const { settings: result } = await settingsApi.updateAi(form)
      setSettings(result)
      setForm((current) => ({
        ...current,
        activeProvider: result.activeProvider,
        openaiModel: result.providers.openai.model,
        openrouterModel: result.providers.openrouter.model,
        openaiApiKey: '',
        openrouterApiKey: '',
        clearOpenaiKey: false,
        clearOpenrouterKey: false,
      }))
      setNotice('AI provider settings saved.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[420px] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d9dde3] border-t-[#f85606]" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 border-b border-[#dfe3e8] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase text-[#8a939c]">Settings</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#171c22]">AI provider</h1>
          <p className="mt-1.5 text-sm text-[#727d87]">Provider routing for {user.name}.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#f85606] px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#dd4c04] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save settings
        </button>
      </div>

      {(notice || error) && (
        <div className={`mt-5 flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${error ? 'border-[#efc9c1] bg-[#fff6f3] text-[#983720]' : 'border-[#b9dfd2] bg-[#f1faf7] text-[#236b55]'}`}>
          {error ? <CircleAlert size={17} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={17} className="mt-0.5 shrink-0" />}
          <span className="flex-1">{error || notice}</span>
        </div>
      )}

      <section className="mt-7 overflow-hidden border border-[#dfe3e8] bg-white shadow-[0_10px_28px_rgba(21,26,33,0.04)]">
        <div className="border-b border-[#e2e5e9] px-5 py-4">
          <h2 className="text-base font-semibold">Active provider</h2>
          <p className="mt-1 text-xs text-[#7c8690]">{activeProvider.label}</p>
        </div>
        <div className="grid gap-3 px-5 py-5 md:grid-cols-2">
          {providers.map((provider) => (
            <ProviderButton
              key={provider.id}
              provider={provider}
              active={form.activeProvider === provider.id}
              onClick={() => setForm((current) => ({ ...current, activeProvider: provider.id }))}
            />
          ))}
        </div>
      </section>

      <div className="mt-7 grid gap-7 xl:grid-cols-2">
        <ProviderPanel
          title="OpenRouter"
          description="Default route for low-cost AI briefs"
          model={form.openrouterModel}
          modelPlaceholder={settings?.defaults?.openrouterModel || 'openrouter/free'}
          apiKey={form.openrouterApiKey}
          keyPlaceholder={settings?.providers.openrouter.hasUserKey ? 'Saved key active' : 'Platform or user key'}
          status={settings?.providers.openrouter || {}}
          clear={form.clearOpenrouterKey}
          onModel={update('openrouterModel')}
          onKey={update('openrouterApiKey')}
          onClear={toggleClear('clearOpenrouterKey')}
        />

        <ProviderPanel
          title="OpenAI GPT"
          description="Direct OpenAI Responses API route"
          model={form.openaiModel}
          modelPlaceholder={settings?.defaults?.openaiModel || 'gpt-5.6-terra'}
          apiKey={form.openaiApiKey}
          keyPlaceholder={settings?.providers.openai.hasUserKey ? 'Saved key active' : 'Platform or user key'}
          status={settings?.providers.openai || {}}
          clear={form.clearOpenaiKey}
          onModel={update('openaiModel')}
          onKey={update('openaiApiKey')}
          onClear={toggleClear('clearOpenaiKey')}
        />
      </div>

      <section className="mt-7 grid overflow-hidden border border-[#dfe3e8] bg-[#e5e8eb] shadow-[0_10px_28px_rgba(21,26,33,0.04)] sm:grid-cols-3">
        <div className="bg-white px-5 py-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#8a939c]">
            <Sparkles size={14} /> Active
          </div>
          <p className="mt-2 truncate text-xl font-semibold text-[#171c22]">{activeProvider.label}</p>
          <p className="mt-1 truncate text-xs text-[#7c8690]">Used by Copilot AI brief</p>
        </div>
        <div className="bg-white px-5 py-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#8a939c]">
            <KeyRound size={14} /> OpenRouter
          </div>
          <p className="mt-2 truncate text-xl font-semibold text-[#171c22]">{settings?.providers.openrouter.ready ? 'Ready' : 'Needs key'}</p>
          <p className="mt-1 truncate text-xs text-[#7c8690]">{settings?.providers.openrouter.model}</p>
        </div>
        <div className="bg-white px-5 py-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#8a939c]">
            <Bot size={14} /> OpenAI GPT
          </div>
          <p className="mt-2 truncate text-xl font-semibold text-[#171c22]">{settings?.providers.openai.ready ? 'Ready' : 'Needs key'}</p>
          <p className="mt-1 truncate text-xs text-[#7c8690]">{settings?.providers.openai.model}</p>
        </div>
      </section>
    </div>
  )
}

export default Settings
