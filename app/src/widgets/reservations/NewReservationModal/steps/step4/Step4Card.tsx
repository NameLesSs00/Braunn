import { IconImage } from '../../../../../shared/ui/IconImage'
import { IconType } from 'react-icons'
export function Step4Card({
  title,
  children,
  titleIconSrc,
  titleIconBgClassName,
}: {
  title: string
  children: React.ReactNode
  titleIconSrc?: string | IconType
  titleIconBgClassName?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {titleIconSrc ? (
            <div
              className={[
                'grid h-7 w-7 place-items-center rounded-lg',
                titleIconBgClassName ?? 'bg-slate-100',
              ].join(' ')}
            >
              <IconImage src={titleIconSrc} alt="" className="h-4 w-4" />
            </div>
          ) : null}
          <div className="text-sm font-semibold text-slate-800">{title}</div>
        </div>
      </div>
      {children}
    </div>
  )
}
