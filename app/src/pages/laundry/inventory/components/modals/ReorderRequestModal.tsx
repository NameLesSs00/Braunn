import { Modal } from './Modal';
import { FiCalendar, FiTrash2, FiPlus } from 'react-icons/fi';

interface ReorderRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReorderRequestModal({ isOpen, onClose }: ReorderRequestModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reorder Request"
      maxWidth="max-w-4xl"
    >
      <div className="p-8">
        <form className="space-y-8">
          {/* Request Information Section */}
          <div className="space-y-4">
            <h3 className="text-[15px] font-bold text-slate-800">Request Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-slate-700">
                  Request Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    defaultValue="12/22/2025"
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] text-[14px] text-slate-700"
                  />
                  {/* @ts-ignore */}
                  <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-slate-700">
                  Required By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  defaultValue="Sarah Miller"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] text-[14px] text-slate-700"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-slate-700">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] text-[14px] text-slate-500 bg-white appearance-none">
                  <option value="" disabled selected hidden>Select Supplier</option>
                  <option value="supplier1">Supplier 1</option>
                  <option value="supplier2">Supplier 2</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <h3 className="text-[15px] font-bold text-slate-800">Notes</h3>
            <textarea
              rows={3}
              placeholder="Add any notes or special instructions..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] text-[14px] placeholder:text-slate-400 text-slate-700 resize-none"
            />
          </div>

          {/* Items Table Section */}
          <div className="space-y-4">
            <h3 className="text-[15px] font-bold text-slate-800">Items</h3>
            
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-slate-200">
                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500 w-[35%]">ITEM <span className="text-red-500">*</span></th>
                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500 text-center">CURRENT<br/>STOCK</th>
                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500 text-center">MINIMUM<br/>LEVEL</th>
                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500 text-center">REORDER QUANTITY <span className="text-red-500">*</span></th>
                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500">UNIT</th>
                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Row 1 */}
                  <tr>
                    <td className="px-4 py-3">
                      <select className="w-full px-4 py-2 rounded-md border border-slate-200 focus:outline-none text-[14px] text-slate-700 bg-white appearance-none">
                        <option>Laundry Detergent (LND-001)</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center text-[14px] text-slate-700">45</td>
                    <td className="px-4 py-3 text-center text-[14px] text-slate-700">20</td>
                    <td className="px-4 py-3 text-center">
                      <input type="number" defaultValue={30} className="w-24 px-4 py-2 rounded-md border border-slate-200 focus:outline-none text-[14px] text-slate-700 text-center" />
                    </td>
                    <td className="px-4 py-3 text-[14px] text-slate-700">Litre</td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
                        {/* @ts-ignore */}
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  {/* Row 2 */}
                  <tr>
                    <td className="px-4 py-3">
                      <select className="w-full px-4 py-2 rounded-md border border-slate-200 focus:outline-none text-[14px] text-slate-700 bg-white appearance-none">
                        <option>Bleach (LND-003)</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center text-[14px] text-red-500 font-medium">8</td>
                    <td className="px-4 py-3 text-center text-[14px] text-slate-700">15</td>
                    <td className="px-4 py-3 text-center">
                      <input type="number" defaultValue={20} className="w-24 px-4 py-2 rounded-md border border-slate-200 focus:outline-none text-[14px] text-slate-700 text-center" />
                    </td>
                    <td className="px-4 py-3 text-[14px] text-slate-700">Litre</td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
                        {/* @ts-ignore */}
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button type="button" className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-[#0a4bbd] text-[#0a4bbd] text-[14px] font-semibold hover:bg-blue-50 transition-colors">
              {/* @ts-ignore */}
              <FiPlus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 pt-4 mt-8">
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
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
