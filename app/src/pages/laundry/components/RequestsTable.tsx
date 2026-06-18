export type RequestStatus = 'Pending' | 'In Progress' | 'Ready for Delivery' | 'Completed'

export type LaundryRequest = {
  requestNo: string
  roomNo: string
  guestName: string
  serviceItems: string
  requestDate: string
  requestTime: string
  expectedDelivery: string
  expectedTime: string
  status: RequestStatus
}

const statusBadge: Record<RequestStatus, string> = {
  Pending: 'bg-amber-100 text-amber-600',
  'In Progress': 'bg-blue-100 text-blue-600',
  'Ready for Delivery': 'bg-purple-100 text-purple-700',
  Completed: 'bg-emerald-100 text-emerald-600',
}

const actionLabel: Record<RequestStatus, string> = {
  Pending: 'Start',
  'In Progress': 'Completed',
  'Ready for Delivery': 'deliver',
  Completed: 'deliver',
}

type Props = {
  requests: LaundryRequest[]
  page: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (p: number) => void
}

export function RequestsTable({ requests, page, totalPages, totalCount, pageSize, onPageChange }: Props) {
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            {['REQUEST NO', 'ROOM NO', 'GUEST NAME', 'SERVICE ITEMS', 'REQUEST DATE', 'EXPECTED DELIVERY', 'STATUS', 'ACTIONS'].map((col) => (
              <th
                key={col}
                className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {requests.map((row) => {
            const isCompleted = row.status === 'Completed'
            return (
              <tr key={row.requestNo} className="transition-colors hover:bg-slate-50/50">
                <td className="px-5 py-4 font-semibold text-slate-700">{row.requestNo}</td>
                <td className="px-5 py-4 text-slate-600">{row.roomNo}</td>
                <td className="px-5 py-4 font-semibold text-slate-700">{row.guestName}</td>
                <td className="px-5 py-4 text-slate-500 max-w-[160px]">{row.serviceItems}</td>
                <td className="px-5 py-4 text-slate-500">
                  <div>{row.requestDate}</div>
                  <div className="text-[11px] text-slate-400">{row.requestTime}</div>
                </td>
                <td className="px-5 py-4 text-slate-500">
                  <div>{row.expectedDelivery}</div>
                  <div className="text-[11px] text-slate-400">{row.expectedTime}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold ${statusBadge[row.status]}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    disabled={isCompleted}
                    className={[
                      'rounded-xl px-4 py-2 text-[12px] font-semibold transition-all',
                      isCompleted
                        ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                        : 'bg-[#0B4EA2] text-white hover:bg-[#093d81] active:scale-95',
                    ].join(' ')}
                  >
                    {actionLabel[row.status]}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Pagination footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
        <span className="text-[12px] text-slate-400">
          Showing {from} to {to} of {totalCount} requests
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            «
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={[
                'flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-medium transition-colors',
                p === page
                  ? 'bg-[#0B4EA2] text-white'
                  : 'text-slate-500 hover:bg-slate-100',
              ].join(' ')}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            »
          </button>
        </div>
      </div>
    </div>
  )
}
