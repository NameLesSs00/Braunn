import { AlertTriangle, CheckCircle2, Info, Loader2, X } from 'lucide-react'
import { Modal } from './Modal'

type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success'

type ConfirmActionModalProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  isLoading?: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

const variantStyles: Record<ConfirmVariant, {
  iconWrap: string
  icon: string
  button: string
  Icon: typeof AlertTriangle
}> = {
  danger: {
    iconWrap: 'bg-red-50 text-red-600',
    icon: 'text-red-600',
    button: 'bg-red-600 hover:bg-red-700 focus:ring-red-200',
    Icon: AlertTriangle,
  },
  warning: {
    iconWrap: 'bg-amber-50 text-amber-600',
    icon: 'text-amber-600',
    button: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-200',
    Icon: AlertTriangle,
  },
  info: {
    iconWrap: 'bg-blue-50 text-[#004bb4]',
    icon: 'text-[#004bb4]',
    button: 'bg-[#004bb4] hover:bg-blue-800 focus:ring-blue-200',
    Icon: Info,
  },
  success: {
    iconWrap: 'bg-emerald-50 text-emerald-600',
    icon: 'text-emerald-600',
    button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200',
    Icon: CheckCircle2,
  },
}

export function ConfirmActionModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  const styles = variantStyles[variant]
  const Icon = styles.Icon

  return (
    <Modal open={open} onClose={isLoading ? () => undefined : onCancel} lockScroll>
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-start gap-4 border-b border-slate-100 px-6 py-5">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${styles.iconWrap}`}>
            <Icon className={`h-5 w-5 ${styles.icon}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 px-6 py-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex min-w-[112px] items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70 ${styles.button}`}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
