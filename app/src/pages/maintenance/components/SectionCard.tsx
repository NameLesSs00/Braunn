type Props = {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export function SectionCard({ title, subtitle, children, className = '' }: Props) {
  return (
    <section className={['rounded-2xl bg-white p-5 shadow-sm', className].join(' ')}>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  )
}
