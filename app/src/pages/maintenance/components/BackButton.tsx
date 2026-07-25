import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type Props = {
  label?: string
  className?: string
}

export function BackButton({ label = 'Back', className = '' }: Props) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className={[
        'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50',
        className,
      ].join(' ')}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  )
}
