import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../shared/apis/hooks';
import { fetchHkmPurchases } from '../../../../features/HKfeatures/hkmPurchases/hkmPurchasesSlice';
import { fetchHkmIssues } from '../../../../features/HKfeatures/hkmIssues/hkmIssuesSlice';

// ─── Local Types (Unified Transactions) ───────────────────────────────────────

export type TransactionActionType = 'withdraw' | 'restock';

export interface UnifiedTransaction {
  id: string;
  item: string;
  quantity: number; // negative = withdrawn, positive = restocked
  actionType: TransactionActionType;
  dateTime: string;
  staffName: string;
  reason: string;
}

// ─── Components ───────────────────────────────────────────────────────────────

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

export function TransactionsTable() {
  const dispatch = useAppDispatch();
  const { items: purchases, status: purchasesStatus } = useAppSelector((state) => state.hkmPurchases);
  const { items: issues, status: issuesStatus } = useAppSelector((state) => state.hkmIssues);

  useEffect(() => {
    dispatch(fetchHkmPurchases());
    dispatch(fetchHkmIssues());
  }, [dispatch]);

  // Transform purchases and issues into unified transactions
  const transactions = useMemo(() => {
    const txs: UnifiedTransaction[] = [];

    // Map purchases to 'restock' transactions
    purchases.forEach((purchase) => {
      purchase.purchaseItems.forEach((pItem) => {
        txs.push({
          id: `p-${purchase.id}-${pItem.id}`,
          item: pItem.itemName || `Item #${pItem.itemId}`,
          quantity: pItem.quantity, // Positive for restock
          actionType: 'restock',
          dateTime: purchase.date 
            ? new Date(purchase.date).toLocaleString() 
            : new Date(purchase.createdAt).toLocaleString(),
          staffName: purchase.createdBy || 'System',
          reason: `Purchase (${purchase.status || 'Pending'}) from ${purchase.supplierName}`,
        });
      });
    });

    // Map issues to 'withdraw' transactions
    issues.forEach((issue) => {
      txs.push({
        id: `i-${issue.id}`,
        item: issue.itemName || `Item #${issue.itemId}`,
        quantity: -issue.quantity, // Negative for withdraw
        actionType: 'withdraw',
        dateTime: new Date(issue.createdAt).toLocaleString(),
        staffName: issue.createdBy || 'System',
        reason: issue.reason ? `Room ${issue.roomId} - ${issue.reason}` : `Room ${issue.roomId}`,
      });
    });

    // Sort by dateTime descending
    return txs.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }, [purchases, issues]);

  const isLoading = purchasesStatus === 'loading' || issuesStatus === 'loading';

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
            {isLoading && transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-[14px]">
                  Loading transactions...
                </td>
              </tr>
            )}
            {!isLoading && transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-[14px]">
                  No transactions found.
                </td>
              </tr>
            )}
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 text-[14px] font-semibold text-slate-700">{tx.item}</td>
                <td className={`px-6 py-5 text-[14px] font-bold ${tx.quantity < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                </td>
                <td className="px-6 py-5">
                  <ActionBadge type={tx.actionType} />
                </td>
                <td className="px-6 py-5 text-[14px] text-slate-500">
                  {tx.dateTime}
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
