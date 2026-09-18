import { useEffect, useState } from 'react'
import { LockKeyhole, RefreshCw, Save, Trash2, Undo2 } from 'lucide-react'
import { settingsApi } from '../../shared/api'
import {
  Button,
  ConfirmDialog,
  Feedback,
  Field,
  PageHeader,
  Select,
  Skeleton,
  StatusBadge,
} from '../../shared/ui'

const initialForm = {
  activeProvider: 'openrouter',
  openaiModel: '',
  openrouterModel: '',
  openaiApiKey: '',
  openrouterApiKey: '',
  clearOpenaiKey: false,
  clearOpenrouterKey: false,
}
const formFromSettings = (result) => ({
  ...initialForm,
  activeProvider: result.activeProvider,
  openaiModel: result.providers.openai.model,
  openrouterModel: result.providers.openrouter.model,
})

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [clearProvider, setClearProvider] = useState(null)

  useEffect(() => {
    let active = true
    settingsApi
      .ai()
      .then(({ settings: result }) => {
        if (active) {
          setSettings(result)
          setForm(formFromSettings(result))
        }
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

  const retry = async () => {
    setLoading(true)
    setError('')
    try {
      const { settings: result } = await settingsApi.ai()
      setSettings(result)
      setForm(formFromSettings(result))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }
  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setNotice('')
  }
  const provider = form.activeProvider
  const providerLabel = provider === 'openai' ? 'OpenAI' : 'OpenRouter'
  const state = settings?.providers?.[provider]
  const modelField = `${provider}Model`
  const keyField = `${provider}ApiKey`
  const clearField =
    provider === 'openai' ? 'clearOpenaiKey' : 'clearOpenrouterKey'
  const clearing = form[clearField]
  const keyStatus = !state
    ? 'Status unavailable'
    : clearing
      ? 'Removal pending'
      : state.hasUserKey
        ? 'Personal key saved securely'
        : state.hasPlatformKey
          ? 'Using platform credentials'
          : 'Missing configuration'

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const { settings: result } = await settingsApi.updateAi(form)
      setSettings(result)
      setForm(formFromSettings(result))
      setNotice('AI settings saved securely.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Choose the AI provider and model used for your briefs."
      />
      <Feedback error={error} onDismiss={() => setError('')} />
      {loading ? (
        <Skeleton label="Loading AI settings" />
      ) : !settings ? (
        <div className="empty-state">
          <h3>Settings could not be loaded</h3>
          <p>Try again to see your saved provider configuration.</p>
          <Button icon={RefreshCw} onClick={retry}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="settings-layout">
          <form className="settings-form form-stack" onSubmit={save}>
            <h2 className="settings-section-title">AI provider</h2>
            <fieldset className="form-stack" disabled={saving}>
              <Select
                label="Provider"
                value={provider}
                onChange={update('activeProvider')}
              >
                <option value="openrouter">OpenRouter</option>
                <option value="openai">OpenAI</option>
              </Select>
              <Field
                label="Model"
                value={form[modelField]}
                onChange={update(modelField)}
                placeholder={
                  settings.defaults?.[modelField] || 'Model identifier'
                }
                list={`${provider}-models`}
                maxLength={160}
                hint="Use a model identifier supported by your selected provider."
                required
              />
              <datalist id={`${provider}-models`}>
                {[...new Set([state?.model, settings.defaults?.[modelField]])]
                  .filter(Boolean)
                  .map((model) => (
                    <option key={model} value={model} />
                  ))}
              </datalist>
              <div className="settings-key-state">
                <div>
                  <StatusBadge
                    tone={
                      clearing
                        ? 'warning'
                        : state?.ready
                          ? 'success'
                          : 'warning'
                    }
                  >
                    {keyStatus}
                  </StatusBadge>
                  <p>
                    {clearing
                      ? 'The personal key will be removed when you save.'
                      : state?.hasUserKey
                        ? 'The stored key is never returned to this browser.'
                        : state?.hasPlatformKey
                          ? 'Your briefs use the platform key unless you add a personal key.'
                          : 'Add a personal key to enable this provider.'}
                  </p>
                </div>
                {state?.hasUserKey && (
                  <Button
                    variant="ghost"
                    icon={clearing ? Undo2 : Trash2}
                    onClick={() =>
                      clearing
                        ? setForm((current) => ({
                            ...current,
                            [clearField]: false,
                          }))
                        : setClearProvider(provider)
                    }
                  >
                    {clearing ? 'Undo removal' : 'Remove key'}
                  </Button>
                )}
              </div>
              <Field
                label={
                  state?.hasUserKey
                    ? 'Replace personal API key'
                    : 'Personal API key (optional)'
                }
                type="password"
                name={keyField}
                value={form[keyField]}
                onChange={(event) => {
                  update(keyField)(event)
                  if (event.target.value)
                    setForm((current) => ({ ...current, [clearField]: false }))
                }}
                placeholder="Enter a new key"
                autoComplete="off"
                spellCheck={false}
                hint="Leave blank to keep your current credentials."
              />
            </fieldset>
            <div className="settings-form-footer">
              <Button type="submit" icon={Save} loading={saving}>
                Save settings
              </Button>
              <span className="muted">
                {providerLabel} / {form[modelField]}
              </span>
            </div>
          </form>
          <aside className="settings-security">
            <LockKeyhole size={22} />
            <h2>Your keys stay private</h2>
            <p>
              Personal API keys are encrypted at rest and used only by the
              server to request your AI briefs.
            </p>
            <p>
              The workspace displays whether a key is configured, never the
              saved key itself.
            </p>
            <p>
              Your selected provider receives the store or product information
              needed for the brief.
            </p>
          </aside>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(clearProvider)}
        onClose={() => setClearProvider(null)}
        title="Remove the saved personal key?"
        confirmLabel="Mark for removal"
        danger
        onConfirm={() => {
          const field =
            clearProvider === 'openai' ? 'clearOpenaiKey' : 'clearOpenrouterKey'
          setForm((current) => ({
            ...current,
            [field]: true,
            [`${clearProvider}ApiKey`]: '',
          }))
          setClearProvider(null)
        }}
      >
        The key will be removed when you save settings.{' '}
        {settings?.providers?.[clearProvider]?.hasPlatformKey
          ? 'This provider will then use platform credentials.'
          : 'This provider will need a new key before generating briefs.'}
      </ConfirmDialog>
      {notice && (
        <Feedback toast onDismiss={() => setNotice('')}>
          {notice}
        </Feedback>
      )}
    </>
  )
}
