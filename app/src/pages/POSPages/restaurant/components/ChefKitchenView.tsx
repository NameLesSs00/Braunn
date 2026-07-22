import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Bell, CheckCircle2, ChefHat, Clock, Flame, User } from 'lucide-react'
import type { KitchenOrder, KitchenOrderStatus } from '../data/restaurantPOSData'
import { initialKitchenOrders } from '../data/restaurantPOSData'

const columnConfig: Record<
  KitchenOrderStatus,
  {
    label: string
    text: string
    border: string
    header: string
    action: string
    actionClass: string
    color: string
    headerBg: string
    buttonStyle: CSSProperties
  }
> = {
  new: {
    label: 'New Orders',
    text: 'text-blue-600',
    border: 'border-blue-500',
    header: 'bg-blue-50',
    action: 'Start Preparing',
    actionClass: 'bg-[#F6B800] text-white hover:bg-[#dfa600]',
    color: '#155BFF',
    headerBg: '#EFF6FF',
    buttonStyle: { backgroundColor: '#F6B800', color: '#ffffff', border: '1px solid #F6B800' },
  },
  preparing: {
    label: 'Preparing',
    text: 'text-amber-600',
    border: 'border-amber-500',
    header: 'bg-amber-50',
    action: 'Make as Ready',
    actionClass: 'bg-[#08C957] text-white hover:bg-[#07b14d]',
    color: '#C97600',
    headerBg: '#FFFBE8',
    buttonStyle: { backgroundColor: '#08C957', color: '#ffffff', border: '1px solid #08C957' },
  },
  ready: {
    label: 'Ready',
    text: 'text-emerald-600',
    border: 'border-emerald-500',
    header: 'bg-emerald-50',
    action: 'Serve',
    actionClass: 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    color: '#079B49',
    headerBg: '#ECFDF3',
    buttonStyle: { backgroundColor: '#ECFDF3', color: '#078447', border: '1px solid #9FF2C6' },
  },
}

const statuses: KitchenOrderStatus[] = ['new', 'preparing', 'ready']

function nextStatus(status: KitchenOrderStatus): KitchenOrderStatus | null {
  if (status === 'new') return 'preparing'
  if (status === 'preparing') return 'ready'
  return null
}

function SummaryChip({
  label,
  value,
  className,
  icon,
}: {
  label: string
  value: number
  className: string
  icon?: ReactNode
}) {
  return (
    <div className={['flex min-h-8 items-center gap-2 rounded-full px-4 text-sm font-medium shadow-sm', className].join(' ')}>
      {icon}
      <span>{label}: {value}</span>
    </div>
  )
}

function KitchenOrderCard({
  order,
  onAdvance,
}: {
  order: KitchenOrder
  onAdvance: (order: KitchenOrder) => void
}) {
  const config = columnConfig[order.status]

  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="text-center text-xl font-medium text-slate-900">{order.table}</h3>
      <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
        <Clock className="h-3.5 w-3.5" />
        Waiting: {order.waitingMinutes} min
      </div>
      <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-4">
        {order.items.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-3 text-sm text-slate-700">
            <span>{item.name}</span>
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-500">
              x{item.quantity}
            </span>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-md text-xs font-medium"
        style={config.buttonStyle}
        onClick={() => onAdvance(order)}
      >
        {order.status === 'new' ? <ChefHat className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
        {config.action}
      </button>
    </article>
  )
}

export function ChefKitchenView() {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialKitchenOrders)

  const counts = useMemo(() => {
    return {
      active: orders.length,
      new: orders.filter((order) => order.status === 'new').length,
      preparing: orders.filter((order) => order.status === 'preparing').length,
      ready: orders.filter((order) => order.status === 'ready').length,
      delayed: orders.filter((order) => order.waitingMinutes >= 15 && order.status !== 'ready').length,
    }
  }, [orders])

  const advanceOrder = (order: KitchenOrder) => {
    const followingStatus = nextStatus(order.status)
    if (!followingStatus) {
      setOrders((current) => current.filter((item) => item.id !== order.id))
      return
    }

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? {
              ...item,
              status: followingStatus,
            }
          : item,
      ),
    )
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden text-white" style={{ backgroundColor: '#082F68' }}>
      <header
        className="flex min-h-[88px] flex-wrap items-center justify-between gap-4"
        style={{
          backgroundColor: '#0A3977',
          padding: '18px clamp(20px, 5vw, 80px)',
        }}
      >
        <div className="flex items-center gap-4 sm:gap-6">
          <img src="/assets/logoCheff.png" alt="Braun" className="h-[62px] w-auto" />
          <h1 className="text-2xl font-semibold">Kitchen Screen</h1>
        </div>
        <div className="flex items-center gap-5 sm:gap-8">
          <Bell className="h-7 w-7 text-white" />
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#DCEBFF]">
              <User className="h-6 w-6 fill-white text-white" />
            </div>
            <div>
              <div className="text-base text-white">chef name</div>
              <div className="text-sm text-white/65">Morning Shift</div>
            </div>
          </div>
        </div>
      </header>

      <main
        className="mx-auto"
        style={{
          maxWidth: 1280,
          padding: 'clamp(28px, 5vw, 76px) clamp(20px, 3vw, 32px) 52px',
        }}
      >
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-orange-50 text-orange-500">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Kitchen screen</h2>
              <p className="mt-2 text-xl text-white">Live order management board</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <SummaryChip
              label="Active Orders"
              value={counts.active}
              className="bg-white text-slate-600"
              icon={<Flame className="h-4 w-4 text-orange-500" />}
            />
            <SummaryChip label="New Orders" value={counts.new} className="bg-blue-50 text-blue-600" />
            <SummaryChip label="Preparing" value={counts.preparing} className="bg-amber-50 text-amber-600" />
            <SummaryChip label="Delayed Orders" value={counts.delayed} className="bg-rose-50 text-rose-600" />
            <SummaryChip label="Ready" value={counts.ready} className="bg-emerald-50 text-emerald-600" />
          </div>
        </div>

        <section className="mt-9 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {statuses.map((status) => {
            const config = columnConfig[status]
            const statusOrders = orders.filter((order) => order.status === status)

            return (
              <div key={status} className="min-w-0">
                <div
                  className="flex h-12 items-center justify-between rounded-t-md border-b-2 px-4"
                  style={{
                    backgroundColor: config.headerBg,
                    borderBottomColor: config.color,
                    color: config.color,
                  }}
                >
                  <h3 className="text-xl font-medium">{config.label}</h3>
                  <span
                    className="grid h-6 w-6 place-items-center rounded-full text-xs font-semibold"
                    style={{ backgroundColor: config.color, color: '#ffffff' }}
                  >
                    <span>{statusOrders.length}</span>
                  </span>
                </div>

                <div className="mt-4 space-y-6">
                  {statusOrders.length > 0 ? (
                    statusOrders.map((order) => (
                      <KitchenOrderCard key={order.id} order={order} onAdvance={advanceOrder} />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-8 text-center text-sm text-white/70">
                      No orders in this column
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </section>
      </main>
    </div>
  )
}
