import { PurchaseRequest, PurchaseRequestStatus } from '../mockData';

interface StatusBadgeProps {
  status: PurchaseRequestStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<PurchaseRequestStatus, string> = {
    'In Transit': 'bg-amber-100 text-amber-700 border border-amber-200',
    'Pending':    'bg-blue-100 text-blue-700 border border-blue-200',
    'Received':   'bg-emerald-100 text-emerald-700 border border-emerald-200',
    'Cancelled':  'bg-slate-100 text-slate-500 border border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-3 py-0.5 text-[12px] font-semibold rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

interface PurchaseRequestCardProps {
  request: PurchaseRequest;
}

function PurchaseRequestCard({ request }: PurchaseRequestCardProps) {
  const canReceive = request.status === 'In Transit';

  return (
    <div className="bg-white rounded-xl border border-slate-200 px-6 py-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left content */}
      <div className="flex flex-col gap-3 flex-1">
        {/* Title row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[15px] font-bold text-slate-800">{request.itemName}</span>
          <StatusBadge status={request.status} />
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <p className="text-[12px] text-slate-400 mb-0.5">Quantity</p>
            <p className="text-[13px] font-bold text-slate-700">{request.quantity}</p>
          </div>
          <div>
            <p className="text-[12px] text-slate-400 mb-0.5">Supplier</p>
            <p className="text-[13px] font-bold text-slate-700">{request.supplier}</p>
          </div>
          <div>
            <p className="text-[12px] text-slate-400 mb-0.5">Requested By</p>
            <p className="text-[13px] font-bold text-slate-700">{request.requestedBy}</p>
          </div>
          <div>
            <p className="text-[12px] text-slate-400 mb-0.5">Date</p>
            <p className="text-[13px] font-bold text-slate-700">{request.date}</p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      {canReceive && (
        <div className="flex-shrink-0">
          <button className="px-5 py-2.5 text-[13px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors whitespace-nowrap">
            Mark as received
          </button>
        </div>
      )}
    </div>
  );
}

interface PurchaseRequestsTabProps {
  requests: PurchaseRequest[];
}

export function PurchaseRequestsTab({ requests }: PurchaseRequestsTabProps) {
  return (
    <div className="space-y-4">
      {/* Section Title */}
      <h2 className="text-[16px] font-bold text-[#0B4EA2]">Purchase Requests</h2>

      {/* Cards */}
      {requests.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-400 text-[14px]">
          No purchase requests found.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((req) => (
            <PurchaseRequestCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}
