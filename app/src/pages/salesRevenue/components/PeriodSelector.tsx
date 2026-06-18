import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function PeriodSelector() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('This Month')
  const options = ['This Month', 'Last Month', 'This Quarter', 'This Year']

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        {selected}
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                setSelected(opt)
                setOpen(false)
              }}
              className={[
                'block w-full px-4 py-2 text-left text-sm',
                selected === opt ? 'bg-slate-100 font-medium' : 'hover:bg-slate-50',
              ].join(' ')}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
