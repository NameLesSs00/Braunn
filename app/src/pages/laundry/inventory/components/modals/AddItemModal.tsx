import { Modal } from './Modal';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Inventory Item"
      subtitle="Fill in the details to add a new item to inventory"
      maxWidth="max-w-3xl"
    >
      <div className="p-8">
        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Item Code */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-slate-800">
                Item Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., LND-001"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400"
              />
            </div>

            {/* Item Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-slate-800">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Laundry Detergent"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-slate-800">
                Category <span className="text-red-500">*</span>
              </label>
              <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-700 bg-white appearance-none">
                <option value="" disabled selected hidden>Select Category</option>
                <option value="Detergents">Detergents</option>
                <option value="Chemicals">Chemicals</option>
                <option value="Finishing">Finishing</option>
              </select>
            </div>

            {/* Unit */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-slate-800">
                Unit <span className="text-red-500">*</span>
              </label>
              <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-700 bg-white appearance-none">
                <option value="" disabled selected hidden>Select Unit</option>
                <option value="Litre">Litre</option>
                <option value="Bottles">Bottles</option>
                <option value="Kg">Kg</option>
              </select>
            </div>

            {/* Current Stock */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-slate-800">
                Current Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400"
              />
            </div>

            {/* Minimum Level */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-slate-800">
                Minimum Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Supplier (Full Width) */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-slate-800">
              Supplier <span className="text-red-500">*</span>
            </label>
            <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-700 bg-white appearance-none">
              <option value="" disabled selected hidden>Select Supplier</option>
              <option value="Chem Solutions">Chem Solutions, LLC</option>
              <option value="CleanPro">CleanPro Supplies</option>
            </select>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 pt-6 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-xl border border-slate-300 text-[15px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              cancel
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-[#0a4bbd] text-[15px] font-bold text-white hover:bg-blue-800 transition-colors"
            >
              Add item
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
