import { useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { AlertCircle, Check, ChevronDown, Edit2, Loader2, Plus, Save, Search, ToggleLeft, ToggleRight, X } from 'lucide-react'

import { appAlert } from '../../../shared/ui/AppAlert'
import { Modal } from '../../../shared/ui/Modal'
import { PoliciesTabNav } from './PoliciesTabNav'
import type { ReservationPolicy, ReservationPolicyPayload, ReservationPolicyType } from '../../../models/ReservationPolicy'
import { getReservationPolicies, getReservationPolicyById } from '../../../shared/apis/reservationPoliciesApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'
type ActiveFilter = 'all' | 'active' | 'inactive'

type SettingField = {
  key: string
  label: string
  type: 'text' | 'number' | 'time' | 'checkbox' | 'select'
  options?: Array<{ label: string; value: string }>
  min?: number
  suffix?: string
}

export type ReservationPolicyPageConfig<TSettings extends Record<string, any>> = {
  policyType: ReservationPolicyType
  title: string
  description: string
  Icon: ComponentType<{ className?: string }>
  includeReservationApplicability?: boolean
  defaultSettings: TSettings
  settingsFields: SettingField[]
  settingsSummary: (settings: TSettings) => string
  createPolicy: (payload: ReservationPolicyPayload<TSettings>) => Promise<ReservationPolicy>
  updatePolicy: (id: number, payload: ReservationPolicyPayload<TSettings>) => Promise<ReservationPolicy>
}

type CommonFormState = {
  name: string
  code: string
  isActive: boolean
  appliesToReservationType: string
  appliesToBookingSource: string
  appliesToRatePlanCode: string
  effectiveFrom: string
  effectiveTo: string
  priority: string
}

type PolicyModalProps<TSettings extends Record<string, any>> = {
  open: boolean
  config: ReservationPolicyPageConfig<TSettings>
  policy: ReservationPolicy | null
  onClose: () => void
  onSaved: (policy: ReservationPolicy) => void
}

function todayDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const emptyCommonState: CommonFormState = {
  name: '',
  code: '',
  isActive: true,
  appliesToReservationType: '',
  appliesToBookingSource: '',
  appliesToRatePlanCode: '',
  effectiveFrom: todayDate(),
  effectiveTo: '',
  priority: '0',
}

function parseSettings<TSettings extends Record<string, any>>(settings: ReservationPolicy['settings'], fallback: TSettings): TSettings {
  if (!settings) return { ...fallback }
  if (typeof settings === 'object') return { ...fallback, ...(settings as Record<string, unknown>) } as TSettings
  try {
    const parsed = JSON.parse(settings)
    return parsed && typeof parsed === 'object' ? ({ ...fallback, ...parsed } as TSettings) : { ...fallback }
  } catch {
    return { ...fallback }
  }
}

function toDateInput(value?: string | null) {
  if (!value) return ''
  return value.split('T')[0] ?? ''
}

function toApiDate(value: string) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function toRequiredApiDate(value: string) {
  return toApiDate(value || todayDate()) ?? new Date(`${todayDate()}T00:00:00`).toISOString()
}

function displayDate(value?: string | null) {
  if (!value) return 'Open ended'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

function displayValue(value?: string | null) {
  const clean = (value ?? '').trim()
  return clean || 'Any'
}

function normalizeSettings<TSettings extends Record<string, any>>(fields: SettingField[], settings: TSettings): TSettings {
  const next: Record<string, any> = {}
  fields.forEach((field) => {
    const value = settings[field.key]
    if (field.type === 'number') next[field.key] = Number(value) || 0
    else if (field.type === 'checkbox') next[field.key] = Boolean(value)
    else next[field.key] = String(value ?? '').trim()
  })
  return next as TSettings
}

function buildPolicyPayload<TSettings extends Record<string, any>>(
  config: ReservationPolicyPageConfig<TSettings>,
  common: CommonFormState,
  settings: TSettings,
): ReservationPolicyPayload<TSettings> {
  const payload: ReservationPolicyPayload<TSettings> = {
    name: common.name.trim(),
    code: common.code.trim(),
    isActive: common.isActive,
    appliesToRatePlanCode: common.appliesToRatePlanCode.trim(),
    effectiveFrom: toRequiredApiDate(common.effectiveFrom),
    effectiveTo: toApiDate(common.effectiveTo),
    priority: Number(common.priority) || 0,
    settings: normalizeSettings(config.settingsFields, settings),
  }

  if (config.includeReservationApplicability) {
    payload.appliesToReservationType = common.appliesToReservationType.trim()
    payload.appliesToBookingSource = common.appliesToBookingSource.trim()
  }

  return payload
}

function validatePolicy<TSettings extends Record<string, any>>(
  config: ReservationPolicyPageConfig<TSettings>,
  common: CommonFormState,
  settings: TSettings,
) {
  if (!common.name.trim()) return 'Policy name is required.'
  if (!common.code.trim()) return 'Policy code is required.'
  if (!common.effectiveFrom) return 'Effective From is required.'
  if (common.effectiveFrom && common.effectiveTo && common.effectiveTo < common.effectiveFrom) {
    return 'Effective To must be after Effective From.'
  }
  for (const field of config.settingsFields) {
    if (field.type === 'number') {
      const value = Number(settings[field.key])
      if (Number.isNaN(value) || value < (field.min ?? 0)) return `${field.label} must be a valid number.`
    }
    if ((field.type === 'text' || field.type === 'time' || field.type === 'select') && !String(settings[field.key] ?? '').trim()) {
      return `${field.label} is required.`
    }
  }
  return null
}

function PolicyModal<TSettings extends Record<string, any>>({ open, config, policy, onClose, onSaved }: PolicyModalProps<TSettings>) {
  const [common, setCommon] = useState<CommonFormState>(emptyCommonState)
  const [settings, setSettings] = useState<TSettings>(config.defaultSettings)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (policy) {
      setCommon({
        name: policy.name ?? '',
        code: policy.code ?? '',
        isActive: Boolean(policy.isActive),
        appliesToReservationType: policy.appliesToReservationType ?? '',
        appliesToBookingSource: policy.appliesToBookingSource ?? '',
        appliesToRatePlanCode: policy.appliesToRatePlanCode ?? '',
        effectiveFrom: toDateInput(policy.effectiveFrom) || todayDate(),
        effectiveTo: toDateInput(policy.effectiveTo),
        priority: String(policy.priority ?? 0),
      })
      setSettings(parseSettings(policy.settings, config.defaultSettings))
      return
    }
    setCommon(emptyCommonState)
    setSettings({ ...config.defaultSettings })
  }, [config.defaultSettings, open, policy])

  const save = async () => {
    const validationError = validatePolicy(config, common, settings)
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = buildPolicyPayload(config, common, settings)
      const saved = policy ? await config.updatePolicy(policy.id, payload) : await config.createPolicy(payload)
      appAlert.fire('Success', policy ? 'Policy updated successfully.' : 'Policy created successfully.', 'success')
      onSaved(saved)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save policy.'
      setError(message)
      appAlert.fire('Error', message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const updateCommon = (patch: Partial<CommonFormState>) => setCommon((prev) => ({ ...prev, ...patch }))
  const updateSetting = (key: string, value: any) => setSettings((prev) => ({ ...prev, [key]: value }))

  const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#004bb4] focus:ring-1 focus:ring-[#004bb4]'

  return (
    <Modal open={open} onClose={saving ? () => undefined : onClose} lockScroll>
      <div className="flex max-h-[92vh] w-[92vw] max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between bg-[#004bb4] px-7 py-6 text-white">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{policy ? 'Edit Policy' : 'Add Policy'}</h2>
            <p className="mt-1 text-sm text-blue-100">{config.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto bg-slate-50/30 px-7 py-6">
          {error ? (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 text-sm font-bold text-slate-800">Policy Information</div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-bold text-slate-700">Policy Name <span className="text-red-500">*</span></span>
              <input className={inputClass} value={common.name} onChange={(e) => updateCommon({ name: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-bold text-slate-700">Policy Code <span className="text-red-500">*</span></span>
              <input className={inputClass} value={common.code} onChange={(e) => updateCommon({ code: e.target.value })} />
            </label>
            {config.includeReservationApplicability ? (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-bold text-slate-700">Reservation Type</span>
                  <input className={inputClass} value={common.appliesToReservationType} placeholder="Any" onChange={(e) => updateCommon({ appliesToReservationType: e.target.value })} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-bold text-slate-700">Booking Source</span>
                  <input className={inputClass} value={common.appliesToBookingSource} placeholder="Any" onChange={(e) => updateCommon({ appliesToBookingSource: e.target.value })} />
                </label>
              </>
            ) : null}
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-bold text-slate-700">Rate Plan Code</span>
              <input className={inputClass} value={common.appliesToRatePlanCode} placeholder="Any" onChange={(e) => updateCommon({ appliesToRatePlanCode: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-bold text-slate-700">Priority</span>
              <input type="number" min={0} className={inputClass} value={common.priority} onChange={(e) => updateCommon({ priority: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-bold text-slate-700">Effective From <span className="text-red-500">*</span></span>
              <input type="date" className={inputClass} value={common.effectiveFrom} onChange={(e) => updateCommon({ effectiveFrom: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-bold text-slate-700">Effective To</span>
              <input type="date" className={inputClass} value={common.effectiveTo} onChange={(e) => updateCommon({ effectiveTo: e.target.value })} />
            </label>
            <label className="flex items-center gap-3 pt-2 md:col-span-2">
              <button
                type="button"
                onClick={() => updateCommon({ isActive: !common.isActive })}
                className={`relative h-6 w-11 rounded-full transition-colors ${common.isActive ? 'bg-[#004bb4]' : 'bg-slate-300'}`}
              >
                <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${common.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm font-semibold text-slate-700">Active policy</span>
            </label>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 text-sm font-bold text-slate-900">Policy Settings</div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {config.settingsFields.map((field) => (
                <label key={field.key} className={field.type === 'checkbox' ? 'flex items-center gap-3 pt-2' : 'block'}>
                  {field.type === 'checkbox' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => updateSetting(field.key, !Boolean(settings[field.key]))}
                        className={`relative h-6 w-11 rounded-full transition-colors ${Boolean(settings[field.key]) ? 'bg-[#004bb4]' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${Boolean(settings[field.key]) ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                      <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                    </>
                  ) : (
                    <>
                      <span className="mb-1.5 block text-[13px] font-bold text-slate-700">{field.label}</span>
                      {field.type === 'select' ? (
                        <div className="relative">
                          <select
                            value={String(settings[field.key] ?? '')}
                            onChange={(e) => updateSetting(field.key, e.target.value)}
                            className={`${inputClass} appearance-none pr-10`}
                          >
                            {(field.options ?? []).map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type={field.type}
                            min={field.min}
                            value={String(settings[field.key] ?? '')}
                            onChange={(e) => updateSetting(field.key, field.type === 'number' ? e.target.value : e.target.value)}
                            className={`${inputClass} ${field.suffix ? 'pr-12' : ''}`}
                          />
                          {field.suffix ? <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">{field.suffix}</span> : null}
                        </div>
                      )}
                    </>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-7 py-5">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#004bb4] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#003d99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Policy'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function ReservationPoliciesPage<TSettings extends Record<string, any>>({ config }: { config: ReservationPolicyPageConfig<TSettings> }) {
  const [policies, setPolicies] = useState<ReservationPolicy[]>([])
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [addOpen, setAddOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<ReservationPolicy | null>(null)
  const [loadingEditId, setLoadingEditId] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const loadPolicies = async () => {
    setStatus('loading')
    setError(null)
    try {
      const isActive = activeFilter === 'all' ? undefined : activeFilter === 'active'
      const result = await getReservationPolicies({ policyType: config.policyType, isActive })
      setPolicies(result)
      setStatus('succeeded')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load policies.'
      setError(message)
      setStatus('failed')
    }
  }

  useEffect(() => {
    void loadPolicies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, config.policyType])

  const filteredPolicies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return policies
    return policies.filter((policy) => {
      const haystack = [
        policy.name,
        policy.code,
        policy.appliesToReservationType,
        policy.appliesToBookingSource,
        policy.appliesToRatePlanCode,
      ].join(' ').toLowerCase()
      return haystack.includes(query)
    })
  }, [policies, searchQuery])

  const handleSaved = (policy: ReservationPolicy) => {
    setPolicies((prev) => {
      const index = prev.findIndex((item) => item.id === policy.id)
      if (index < 0) return [policy, ...prev]
      const next = [...prev]
      next[index] = policy
      return next
    })
    void loadPolicies()
  }

  const openEditPolicy = async (policy: ReservationPolicy) => {
    setLoadingEditId(policy.id)
    try {
      const fullPolicy = await getReservationPolicyById(policy.id)
      setEditingPolicy(fullPolicy)
    } catch (err) {
      appAlert.fire('Error', err instanceof Error ? err.message : 'Could not load policy details.', 'error')
    } finally {
      setLoadingEditId(null)
    }
  }

  const handleToggle = async (policy: ReservationPolicy) => {
    setTogglingId(policy.id)
    try {
      const fullPolicy = await getReservationPolicyById(policy.id)
      const settings = parseSettings(fullPolicy.settings, config.defaultSettings)
      const payload = buildPolicyPayload(config, {
        name: fullPolicy.name,
        code: fullPolicy.code,
        isActive: !fullPolicy.isActive,
        appliesToReservationType: fullPolicy.appliesToReservationType ?? '',
        appliesToBookingSource: fullPolicy.appliesToBookingSource ?? '',
        appliesToRatePlanCode: fullPolicy.appliesToRatePlanCode ?? '',
        effectiveFrom: toDateInput(fullPolicy.effectiveFrom) || todayDate(),
        effectiveTo: toDateInput(fullPolicy.effectiveTo),
        priority: String(fullPolicy.priority ?? 0),
      }, settings)
      const saved = await config.updatePolicy(fullPolicy.id, payload)
      handleSaved(saved)
    } catch (err) {
      appAlert.fire('Error', err instanceof Error ? err.message : 'Could not update policy status.', 'error')
    } finally {
      setTogglingId(null)
    }
  }

  const Icon = config.Icon

  return (
    <div className="flex flex-col gap-0">
      <PoliciesTabNav />

      <div className="mt-5 flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EEF4FF] text-[#0B4EA2]">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{config.title}</h2>
              <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">{config.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B4EA2] px-5 text-sm font-semibold text-white hover:bg-[#093d81]"
          >
            <Plus className="h-4 w-4" />
            Add Policy
          </button>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, name, source, or rate plan..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-[#0B4EA2]"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as ActiveFilter)}
              className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm font-semibold text-slate-600 outline-none focus:border-[#0B4EA2]"
            >
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {status === 'loading' ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#0B4EA2]" />
              <p className="text-sm font-semibold">Loading policies...</p>
            </div>
          ) : status === 'failed' ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <AlertCircle className="h-9 w-9 text-rose-500" />
              <div className="text-sm font-semibold text-slate-700">{error}</div>
              <button type="button" onClick={() => void loadPolicies()} className="rounded-lg bg-[#0B4EA2] px-4 py-2 text-sm font-semibold text-white">
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1060px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Policy</th>
                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Applies To</th>
                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Rate Plan</th>
                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Effective Dates</th>
                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Settings</th>
                    <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Priority</th>
                    <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPolicies.length > 0 ? filteredPolicies.map((policy) => {
                    const settings = parseSettings(policy.settings, config.defaultSettings)
                    return (
                      <tr key={policy.id} className="bg-white transition-colors hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="rounded-md border border-[#0B4EA2]/10 bg-[#0B4EA2]/10 px-2.5 py-1 text-[12px] font-bold text-[#0B4EA2]">
                              {policy.code}
                            </span>
                            <div className="font-semibold text-slate-800">{policy.name}</div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-600">
                          {config.includeReservationApplicability ? (
                            <div>
                              <div>{displayValue(policy.appliesToReservationType)}</div>
                              <div className="text-xs text-slate-400">Source: {displayValue(policy.appliesToBookingSource)}</div>
                            </div>
                          ) : (
                            <span>Any reservation</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-700">{displayValue(policy.appliesToRatePlanCode)}</td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-600">
                          {displayDate(policy.effectiveFrom)} {'->'} {displayDate(policy.effectiveTo)}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-700">{config.settingsSummary(settings)}</td>
                        <td className="px-5 py-4 text-center text-sm font-bold text-slate-700">{policy.priority ?? 0}</td>
                        <td className="px-5 py-4 text-center">
                          {policy.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                              <Check className="h-3 w-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                              <AlertCircle className="h-3 w-3" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => void openEditPolicy(policy)}
                              disabled={loadingEditId === policy.id}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                            >
                              {loadingEditId === policy.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Edit2 className="h-3.5 w-3.5" />}
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleToggle(policy)}
                              disabled={togglingId === policy.id}
                              className={[
                                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50',
                                policy.isActive ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                              ].join(' ')}
                            >
                              {togglingId === policy.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : policy.isActive ? <ToggleLeft className="h-3.5 w-3.5" /> : <ToggleRight className="h-3.5 w-3.5" />}
                              {policy.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-500">
                          <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100">
                            <Icon className="h-6 w-6 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">No policies found</p>
                            <p className="mt-1 text-sm">Adjust the filters or create a new policy.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <PolicyModal open={addOpen} config={config} policy={null} onClose={() => setAddOpen(false)} onSaved={handleSaved} />
      <PolicyModal open={Boolean(editingPolicy)} config={config} policy={editingPolicy} onClose={() => setEditingPolicy(null)} onSaved={handleSaved} />
    </div>
  )
}
