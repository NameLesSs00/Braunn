import { ReactNode, useEffect, useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { translateAppText } from '../lib/appTranslation'
import { Modal } from './Modal'

type AlertIcon = 'success' | 'error' | 'warning' | 'info' | 'question'

type AlertOptions = {
  icon?: AlertIcon
  title?: ReactNode
  text?: ReactNode
  html?: ReactNode
  timer?: number
  showConfirmButton?: boolean
  confirmButtonText?: string
}

type AlertResult = {
  isConfirmed: boolean
  isDismissed: boolean
}

type AlertState = AlertOptions & {
  resolve: (result: AlertResult) => void
}

type FireArgs = [AlertOptions] | [ReactNode, ReactNode?, AlertIcon?]

let showAlert: ((options: AlertOptions) => Promise<AlertResult>) | null = null

function normalizeArgs(args: FireArgs): AlertOptions {
  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && !Array.isArray(args[0])) {
    return args[0] as AlertOptions
  }

  const [title, text, icon] = args
  return { title, text, icon }
}

function translateNode(node: ReactNode) {
  return typeof node === 'string' ? translateAppText(node) : node
}

function translateAlertOptions(options: AlertOptions): AlertOptions {
  return {
    ...options,
    title: translateNode(options.title),
    text: translateNode(options.text),
    html: translateNode(options.html),
    confirmButtonText: options.confirmButtonText ? translateAppText(options.confirmButtonText) : options.confirmButtonText,
  }
}

function iconConfig(icon: AlertIcon | undefined) {
  switch (icon) {
    case 'success':
      return {
        Icon: CheckCircle2,
        wrap: 'bg-emerald-50 text-emerald-600',
        button: 'bg-[#004bb4] hover:bg-blue-800 focus:ring-blue-100',
      }
    case 'error':
      return {
        Icon: AlertCircle,
        wrap: 'bg-red-50 text-red-600',
        button: 'bg-red-600 hover:bg-red-700 focus:ring-red-100',
      }
    case 'warning':
    case 'question':
      return {
        Icon: AlertTriangle,
        wrap: 'bg-amber-50 text-amber-600',
        button: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-100',
      }
    case 'info':
    default:
      return {
        Icon: Info,
        wrap: 'bg-blue-50 text-[#004bb4]',
        button: 'bg-[#004bb4] hover:bg-blue-800 focus:ring-blue-100',
      }
  }
}

export const appAlert = {
  fire: (...args: FireArgs) => {
    const options = translateAlertOptions(normalizeArgs(args))
    if (!showAlert) {
      window.alert(String(options.text ?? options.title ?? ''))
      return Promise.resolve({ isConfirmed: true, isDismissed: false })
    }
    return showAlert(options)
  },
}

export function AppAlertProvider({ children }: { children: ReactNode }) {
  const [alertState, setAlertState] = useState<AlertState | null>(null)

  useEffect(() => {
    showAlert = (options) => new Promise((resolve) => {
      setAlertState({ ...options, resolve })
    })

    return () => {
      showAlert = null
    }
  }, [])

  useEffect(() => {
    if (!alertState?.timer) return

    const timer = window.setTimeout(() => {
      alertState.resolve({ isConfirmed: true, isDismissed: false })
      setAlertState(null)
    }, alertState.timer)

    return () => window.clearTimeout(timer)
  }, [alertState])

  const closeAlert = (result: AlertResult) => {
    alertState?.resolve(result)
    setAlertState(null)
  }

  const config = iconConfig(alertState?.icon)
  const Icon = config.Icon
  const showConfirmButton = alertState?.showConfirmButton !== false

  return (
    <>
      {children}
      <Modal open={Boolean(alertState)} onClose={() => closeAlert({ isConfirmed: false, isDismissed: true })} lockScroll>
        <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl">
          <div className="relative px-6 py-6">
            <button
              type="button"
              onClick={() => closeAlert({ isConfirmed: false, isDismissed: true })}
              className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label={translateAppText('Close')}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4 pr-8">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${config.wrap}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                {alertState?.title && (
                  <h2 className="text-base font-bold text-slate-900">{alertState.title}</h2>
                )}
                {(alertState?.text || alertState?.html) && (
                  <div className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500">
                    {alertState.html ?? alertState.text}
                  </div>
                )}
              </div>
            </div>
          </div>

          {showConfirmButton && (
            <div className="flex items-center justify-end border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => closeAlert({ isConfirmed: true, isDismissed: false })}
                className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-4 ${config.button}`}
              >
                {alertState?.confirmButtonText ?? 'OK'}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
