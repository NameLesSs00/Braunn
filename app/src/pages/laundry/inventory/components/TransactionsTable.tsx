import { WithdrawTransaction, TransactionActionType } from '../mockData';

interface ActionBadgeProps {
  type: TransactionActionType;
}

function ActionBadge({ type }: ActionBadgeProps) {
  const styles: Record<TransactionActionType, string> = {
    withdraw: 'bg-amber-100 text-amber-700 border border-amber-200',
    restock: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  };
  return (
    <span className={`inline-flex items-center justify-center px-4 py-1 text-[12px] font-medium rounded-full ${styles[type]}`}>
      {type}
    </span>
  );
}

interface TransactionsTableProps {
  data: WithdrawTransaction[];
}

export function TransactionsTable({ data }: TransactionsTableProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-slate-200">
              {['Item', 'Quantity', 'Action Type', 'Date & Time', 'Staff Name', 'Reason'].map((col) => (
                <th key={col} className="px-6 py-4 text-[12px] font-bold text-slate-700">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 text-[14px] font-semibold text-slate-700">{tx.item}</td>
                <td className={`px-6 py-5 text-[14px] font-bold ${tx.quantity < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                </td>
                <td className="px-6 py-5">
                  <ActionBadge type={tx.actionType} />
                </td>
                <td className="px-6 py-5 text-[14px] text-slate-500 whitespace-pre-line">
                  {tx.dateTime.replace(' ', '\n')}
                </td>
                <td className="px-6 py-5 text-[14px] text-slate-600 font-medium">{tx.staffName}</td>
                <td className="px-6 py-5 text-[14px] text-slate-500">{tx.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
