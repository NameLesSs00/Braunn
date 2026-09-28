import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { routes } from '../../../shared/lib/routes'

type ComingSoonPageProps = {
  moduleName: string
  icon?: React.ReactNode
  accentColor?: string
}

export function ComingSoonPage({
  moduleName,
  icon,
  accentColor = '#0B4EA2',
}: ComingSoonPageProps) {
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F6F8FC] px-4">
      {/* Background decorative blobs */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full opacity-10 blur-3xl"
        style={{ background: accentColor }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full opacity-10 blur-3xl"
        style={{ background: accentColor }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-slate-300/40">
        {/* Top accent bar */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }} />

        <div className="flex flex-col items-center px-8 pb-10 pt-10 text-center">
          {/* Icon badge */}
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: `${accentColor}14`, border: `1.5px solid ${accentColor}22` }}
          >
            {icon ? (
              <span style={{ color: accentColor }} className="[&>svg]:h-9 [&>svg]:w-9">
                {icon}
              </span>
            ) : (
              <Sparkles style={{ color: accentColor }} className="h-9 w-9" />
            )}
          </div>

          {/* Title */}
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900">
            {moduleName}
          </h1>

          {/* Tagline */}
          <p className="mb-2 text-base font-semibold text-slate-600">
            This module is available on contact.
          </p>

          {/* Divider */}
          <div className="mb-8 h-px w-full " />

          {/* Back link */}
          <button
            type="button"
            onClick={() => navigate(routes.systems)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to System Selection
          </button>
        </div>
      </div>

      {/* Braun logo watermark */}
      <img
        src="/assets/Asset 9 1.svg"
        alt="Braun"
        className="absolute bottom-6 left-1/2 h-7 w-auto -translate-x-1/2 opacity-20"
      />
    </div>
  )
}
