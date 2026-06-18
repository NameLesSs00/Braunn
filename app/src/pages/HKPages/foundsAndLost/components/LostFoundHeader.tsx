interface LostFoundHeaderProps {
  onReportClick: () => void;
}

export function LostFoundHeader({ onReportClick }: LostFoundHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#103b7a]">Lost & Found Management</h1>
        <p className="mt-2 text-[15px] text-slate-500">Track and manage items found in guest rooms</p>
      </div>
      <button 
        onClick={onReportClick}
        className="px-6 py-3 bg-[#0a4bbd] hover:bg-blue-800 transition-colors text-white font-bold rounded-xl"
      >
        Report Item
      </button>
    </div>
  );
}
