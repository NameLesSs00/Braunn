import { Search } from 'lucide-react'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search by room, request or employee' }: Props) {
  return (
    <div className="relative min-w-[250px] flex-1">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-full bg-[#F3F5FF] px-6 pr-12 text-sm text-slate-700 outline-none placeholder:text-slate-400"
        placeholder={placeholder}
      />
      <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 opacity-70">
        <Search className="h-4 w-4 text-slate-500" />
      </div>
    </div>
  )
}
