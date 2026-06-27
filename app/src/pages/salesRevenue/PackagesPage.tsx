import { useState, useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import { TabNav } from './components/TabNav'
import { Plus, Edit2, Eye, X, Package as PackageIcon, Check } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchPackages,
  createPackage,
  updatePackage,
} from '../../features/packages/packagesSlice'
import { fetchRoomTypes } from '../../features/roomTypes/roomTypesSlice'
import { fetchMealPlans } from '../../features/admin/mealPlansSlice'
import { fetchAdditionalServices } from '../../features/admin/additionalServicesSlice'
import { fetchRatePlans } from '../../features/ratePlans/ratePlansSlice'
import { getMealPlanById } from '../../shared/apis/AdminMealPlan'
import { getAdditionalServices } from '../../shared/apis/AdditionalServices'
import type { Package, CreatePackagePayload } from '../../models/Package'
import Swal from 'sweetalert2'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

type PanelMode = 'closed' | 'view' | 'add' | 'edit'

const emptyForm: CreatePackagePayload = {
  code: '',
  name: '',
  description: '',
  ratePlanCode: '',
  startDate: '',
  endDate: '',
  isActive: true,
  baseNightPrice: 0,
  adultExtraPrice: 0,
  childExtraPrice: 0,
  taxPercentage: 0,
  discountPercentage: 0,
  currencyCode: 'EUR',
  roomRates: [],
  mealRates: [],
  serviceRates: [],
}

export function PackagesPage() {
  const dispatch = useAppDispatch()
  
  const { packages, status: packagesStatus } = useAppSelector((s) => s.packages)
  const { items: roomTypes, status: roomTypesStatus } = useAppSelector((s) => s.roomTypes)
  const { items: mealPlans, status: mealPlansStatus } = useAppSelector((s) => s.mealPlans)
  const { items: additionalServices, status: servicesStatus } = useAppSelector((s) => s.additionalServices)
  const { items: ratePlans, status: ratePlansStatus } = useAppSelector((s) => s.ratePlans)

  const [panelMode, setPanelMode] = useState<PanelMode>('closed')
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  
  const [resolvedMeals, setResolvedMeals] = useState<Record<string, string>>({})
  const [resolvedServices, setResolvedServices] = useState<Record<string, string>>({})
  
  const [form, setForm] = useState<CreatePackagePayload>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [showDisabled, setShowDisabled] = useState(false)

  useEffect(() => {
    if (packagesStatus === 'idle') dispatch(fetchPackages())
    if (roomTypesStatus === 'idle') dispatch(fetchRoomTypes())
    if (mealPlansStatus === 'idle') dispatch(fetchMealPlans())
    if (servicesStatus === 'idle') dispatch(fetchAdditionalServices())
    if (ratePlansStatus === 'idle') dispatch(fetchRatePlans())
  }, [dispatch, packagesStatus, roomTypesStatus, mealPlansStatus, servicesStatus, ratePlansStatus])

  const openAdd = () => {
    setForm(emptyForm)
    setFormError(null)
    setSelectedPackage(null)
    setPanelMode('add')
  }

  const openEdit = (pkg: Package) => {
    setForm({
      code: pkg.code,
      name: pkg.name,
      description: pkg.description,
      ratePlanCode: pkg.ratePlanCode,
      startDate: pkg.startDate,
      endDate: pkg.endDate,
      isActive: pkg.isActive,
      baseNightPrice: pkg.baseNightPrice,
      adultExtraPrice: pkg.adultExtraPrice,
      childExtraPrice: pkg.childExtraPrice,
      taxPercentage: pkg.taxPercentage,
      discountPercentage: pkg.discountPercentage,
      currencyCode: pkg.currencyCode,
      roomRates: pkg.roomRates,
      mealRates: pkg.mealRates,
      serviceRates: pkg.serviceRates,
    })
    setFormError(null)
    setSelectedPackage(pkg)
    setPanelMode('edit')
  }

  const openView = async (pkg: Package) => {
    setSelectedPackage(pkg)
    setPanelMode('view')
    
    // Fetch meal names by ID
    const newMeals: Record<string, string> = {}
    for (const m of pkg.mealRates) {
      try {
        const meal = await getMealPlanById(m.mealPlanId)
        newMeals[m.mealPlanId] = meal.name
      } catch (e) {
        newMeals[m.mealPlanId] = m.mealPlanId
      }
    }
    setResolvedMeals(newMeals)

    // Fetch service names from list
    try {
      const allServices = await getAdditionalServices()
      const newServices: Record<string, string> = {}
      for (const s of pkg.serviceRates) {
        const found = allServices.find(x => x.id === s.additionalServiceId)
        newServices[s.additionalServiceId] = found ? found.name : s.additionalServiceId
      }
      setResolvedServices(newServices)
    } catch (e) {
      const fallback: Record<string, string> = {}
      pkg.serviceRates.forEach(s => fallback[s.additionalServiceId] = s.additionalServiceId)
      setResolvedServices(fallback)
    }
  }

  const closePanel = () => {
    setPanelMode('closed')
    setSelectedPackage(null)
    setForm(emptyForm)
    setFormError(null)
  }

  const handleToggle = async (pkg: Package) => {
    setTogglingId(pkg.id)
    try {
      await dispatch(updatePackage({
        id: pkg.id,
        payload: {
          code: pkg.code,
          name: pkg.name,
          description: pkg.description,
          ratePlanCode: pkg.ratePlanCode,
          startDate: pkg.startDate,
          endDate: pkg.endDate,
          isActive: !pkg.isActive,
          baseNightPrice: pkg.baseNightPrice,
          adultExtraPrice: pkg.adultExtraPrice,
          childExtraPrice: pkg.childExtraPrice,
          taxPercentage: pkg.taxPercentage,
          discountPercentage: pkg.discountPercentage,
          currencyCode: pkg.currencyCode,
          roomRates: pkg.roomRates,
          mealRates: pkg.mealRates,
          serviceRates: pkg.serviceRates,
        }
      })).unwrap()
      await dispatch(fetchPackages())
    } catch (e) {
      console.error(e)
    } finally {
      setTogglingId(null)
    }
  }

  const handleSubmit = async () => {
    if (!form.name || !form.ratePlanCode || !form.startDate || !form.endDate) {
      setFormError('Please fill in all required fields (Name, Rate Plan Code, Start Date, End Date).')
      return
    }

    if (form.roomRates.length === 0) {
      setFormError('You must include at least one Room Rate.')
      return
    }

    const hasEmptyRoom = form.roomRates.some(r => !r.roomTypeId)
    if (hasEmptyRoom) {
      setFormError('Please select a Room Type for all added room rates, or remove the empty row.')
      return
    }

    const hasEmptyMeal = form.mealRates.some(m => !m.mealPlanId)
    if (hasEmptyMeal) {
      setFormError('Please select a Meal Plan for all added meal rates, or remove the empty row.')
      return
    }

    const hasEmptyService = form.serviceRates.some(s => !s.additionalServiceId)
    if (hasEmptyService) {
      setFormError('Please select a Service for all added service rates, or remove the empty row.')
      return
    }

    setSubmitting(true)
    setFormError(null)
    try {
      if (panelMode === 'add') {
        await dispatch(createPackage(form)).unwrap()
        await dispatch(fetchPackages())
      } else if (panelMode === 'edit' && selectedPackage) {
        await dispatch(updatePackage({ id: selectedPackage.id, payload: form })).unwrap()
        await dispatch(fetchPackages())
      }
      closePanel()
      Swal.fire('Success', 'Package saved successfully', 'success')
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const isLoading = packagesStatus === 'loading'
  const filteredPackages = useMemo(() => packages.filter(p => showDisabled || p.isActive), [packages, showDisabled])

  const getRoomName = (id: string) => roomTypes.find((r: any) => r.id === id)?.name || id
  const getRoomViewType = (id: string) => roomTypes.find((r: any) => r.id === id)?.viewType || 'N/A'
  const getMealName = (id: string) => resolvedMeals[id] || id
  const getServiceName = (id: string) => resolvedServices[id] || id

  return (
    <motion.div className="space-y-0 pb-12" initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div variants={itemVariants}>
        <TabNav />
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center justify-between px-6 pt-6 pb-2">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-800 tracking-tight">Packages</h1>
          <p className="text-slate-500 mt-1 text-[15px]">Manage packages and combined offerings</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 h-10 px-5 bg-[#0B4EA2] text-white rounded-lg font-semibold text-sm hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
          Add Package
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="px-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PackageIcon className="w-5 h-5 text-[#0B4EA2]" />
              <span className="text-[15px] font-bold text-slate-800">All Packages</span>
              <span className="text-xs text-slate-400 font-medium">{filteredPackages.length} total</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showDisabled}
                onChange={(e) => setShowDisabled(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0B4EA2] focus:ring-[#0B4EA2]"
              />
              <span className="text-sm font-medium text-slate-600">Show disabled</span>
            </label>
          </div>

          {isLoading ? (
            <div className="divide-y divide-slate-100 p-5 text-center text-slate-500">Loading packages...</div>
          ) : filteredPackages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                <PackageIcon className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-slate-700 font-semibold text-[15px]">No packages found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase">Rate Code</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase">Start Date</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase">End Date</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase">Final Night Price</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase">Tax %</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase text-center">Status</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPackages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50/50 bg-white">
                      <td className="px-5 py-4 font-semibold text-slate-800 text-[14px]">{pkg.ratePlanCode}</td>
                      <td className="px-5 py-4 text-slate-600 text-[14px]">{pkg.startDate}</td>
                      <td className="px-5 py-4 text-slate-600 text-[14px]">{pkg.endDate}</td>
                      <td className="px-5 py-4 font-bold text-[#0B4EA2] text-[14px]">
                        {pkg.finalNightPrice ?? 0} {pkg.currencyCode}
                      </td>
                      <td className="px-5 py-4 text-slate-600 text-[14px]">{pkg.taxPercentage}%</td>
                      <td className="px-5 py-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={pkg.isActive}
                            onChange={() => handleToggle(pkg)}
                            disabled={togglingId === pkg.id}
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B4EA2]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0B4EA2]"></div>
                        </label>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openView(pkg)}
                            title="View"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#0B4EA2] hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => openEdit(pkg)}
                            title="Edit"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#0B4EA2] hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* View Modal */}
      {panelMode === 'view' && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-[#0B4EA2] shadow-sm">
              <h2 className="text-xl font-bold text-white">View Package</h2>
              <button onClick={closePanel} className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-slate-500 text-xs font-bold uppercase">Name</span><p className="text-slate-800 font-semibold">{selectedPackage.name}</p></div>
                <div><span className="text-slate-500 text-xs font-bold uppercase">Code</span><p className="text-slate-800 font-semibold">{selectedPackage.code}</p></div>
                <div><span className="text-slate-500 text-xs font-bold uppercase">Rate Plan Code</span><p className="text-slate-800 font-semibold">{selectedPackage.ratePlanCode}</p></div>
                <div><span className="text-slate-500 text-xs font-bold uppercase">Description</span><p className="text-slate-800 font-semibold">{selectedPackage.description}</p></div>
                <div><span className="text-slate-500 text-xs font-bold uppercase">Start Date</span><p className="text-slate-800 font-semibold">{selectedPackage.startDate}</p></div>
                <div><span className="text-slate-500 text-xs font-bold uppercase">End Date</span><p className="text-slate-800 font-semibold">{selectedPackage.endDate}</p></div>
                <div><span className="text-slate-500 text-xs font-bold uppercase">Final Night Price</span><p className="text-[#0B4EA2] font-bold">{selectedPackage.finalNightPrice} {selectedPackage.currencyCode}</p></div>
                <div><span className="text-slate-500 text-xs font-bold uppercase">Tax</span><p className="text-slate-800 font-semibold">{selectedPackage.taxPercentage}%</p></div>
                <div><span className="text-slate-500 text-xs font-bold uppercase">Base Night Price</span><p className="text-slate-800 font-semibold">{selectedPackage.baseNightPrice} {selectedPackage.currencyCode}</p></div>
                <div><span className="text-slate-500 text-xs font-bold uppercase">Discount</span><p className="text-slate-800 font-semibold">{selectedPackage.discountPercentage}%</p></div>
                <div><span className="text-slate-500 text-xs font-bold uppercase">Adult Extra Price</span><p className="text-slate-800 font-semibold">{selectedPackage.adultExtraPrice} {selectedPackage.currencyCode}</p></div>
                <div><span className="text-slate-500 text-xs font-bold uppercase">Child Extra Price</span><p className="text-slate-800 font-semibold">{selectedPackage.childExtraPrice} {selectedPackage.currencyCode}</p></div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-3">Room Rates</h3>
                {selectedPackage.roomRates.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedPackage.roomRates.map((r, idx) => (
                      <li key={idx} className="flex justify-between bg-slate-50 p-2 rounded">
                        <span className="text-sm font-medium text-slate-700">{getRoomName(r.roomTypeId)} (View Type: {getRoomViewType(r.roomTypeId)})</span>
                        <span className="text-sm text-slate-500">Max Guests: {r.maxGuestsAllowed}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-slate-400">No rooms included</p>}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-3">Meal Rates</h3>
                {selectedPackage.mealRates.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedPackage.mealRates.map((m, idx) => (
                      <li key={idx} className="flex justify-between bg-slate-50 p-2 rounded">
                        <span className="text-sm font-medium text-slate-700">{getMealName(m.mealPlanId)}</span>
                        <span className="text-sm text-slate-500">{m.pricePerNight} {selectedPackage.currencyCode}/night</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-slate-400">No meals included</p>}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-3">Service Rates</h3>
                {selectedPackage.serviceRates.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedPackage.serviceRates.map((s, idx) => (
                      <li key={idx} className="flex justify-between bg-slate-50 p-2 rounded">
                        <span className="text-sm font-medium text-slate-700">{getServiceName(s.additionalServiceId)}</span>
                        <span className="text-sm text-slate-500">{s.pricePerNight} {selectedPackage.currencyCode}/night</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-slate-400">No services included</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {(panelMode === 'add' || panelMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-[#0B4EA2] shadow-sm">
              <h2 className="text-xl font-bold text-white">
                {panelMode === 'add' ? 'Add Package' : 'Edit Package'}
              </h2>
              <button onClick={closePanel} className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg px-4 py-3">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-slate-600 mb-1">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-600 mb-1">Code</label>
                  <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-600 mb-1">Rate Plan Code <span className="text-red-500">*</span></label>
                  <select value={form.ratePlanCode} onChange={e => setForm({...form, ratePlanCode: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">Select a rate plan...</option>
                    {ratePlans.filter(rp => rp.isActive).map(rp => (
                      <option key={rp.code} value={rp.code}>{rp.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-600 mb-1">Currency Code</label>
                  <select value={form.currencyCode} onChange={e => setForm({...form, currencyCode: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-600 mb-1">Start Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-600 mb-1">End Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-600 mb-1">Base Night Price</label>
                  <input type="number" value={form.baseNightPrice} onChange={e => setForm({...form, baseNightPrice: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-600 mb-1">Adult Extra Price</label>
                  <input type="number" value={form.adultExtraPrice} onChange={e => setForm({...form, adultExtraPrice: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-600 mb-1">Child Extra Price</label>
                  <input type="number" value={form.childExtraPrice} onChange={e => setForm({...form, childExtraPrice: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-600 mb-1">Tax %</label>
                  <input type="number" value={form.taxPercentage} onChange={e => setForm({...form, taxPercentage: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-600 mb-1">Discount %</label>
                  <input type="number" value={form.discountPercentage} onChange={e => setForm({...form, discountPercentage: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[13px] font-bold text-slate-600 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" rows={2} />
                </div>
              </div>
              
              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                    <h3 className="text-sm font-bold text-slate-800">Room Rates</h3>
                    <button onClick={() => setForm({...form, roomRates: [...form.roomRates, { roomTypeId: '', maxGuestsAllowed: 1 }]})} className="text-[#0B4EA2] text-xs font-bold flex items-center gap-1 hover:underline">
                      <Plus className="w-3 h-3" /> Add Room
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.roomRates.map((r, i) => (
                      <div key={i} className="flex items-end gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex-1">
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Room Type</label>
                          <select value={r.roomTypeId} onChange={e => {
                            const newR = [...form.roomRates]; newR[i].roomTypeId = e.target.value; setForm({...form, roomRates: newR})
                          }} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm">
                            <option value="">Select Room</option>
                            {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                          </select>
                        </div>
                        <div className="w-32">
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Max Guests</label>
                          <input type="number" min={1} value={r.maxGuestsAllowed} onChange={e => {
                            const newR = [...form.roomRates]; newR[i].maxGuestsAllowed = Number(e.target.value); setForm({...form, roomRates: newR})
                          }} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm" />
                        </div>
                        <button onClick={() => {
                          const newR = [...form.roomRates]; newR.splice(i, 1); setForm({...form, roomRates: newR})
                        }} className="h-8 w-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {form.roomRates.length === 0 && <p className="text-xs text-slate-400 italic">No room rates added.</p>}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                    <h3 className="text-sm font-bold text-slate-800">Meal Rates</h3>
                    <button onClick={() => setForm({...form, mealRates: [...form.mealRates, { mealPlanId: '', pricePerNight: 0 }]})} className="text-[#0B4EA2] text-xs font-bold flex items-center gap-1 hover:underline">
                      <Plus className="w-3 h-3" /> Add Meal
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.mealRates.map((m, i) => (
                      <div key={i} className="flex items-end gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex-1">
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Meal Plan</label>
                          <select value={m.mealPlanId} onChange={e => {
                            const val = e.target.value;
                            const newM = [...form.mealRates]; 
                            newM[i].mealPlanId = val;
                            const selectedMeal = mealPlans.find(mp => mp.id === val);
                            if (selectedMeal) {
                              newM[i].pricePerNight = selectedMeal.pricePerDay;
                            }
                            setForm({...form, mealRates: newM});
                          }} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-white">
                            <option value="">Select Meal Plan</option>
                            {mealPlans.map(mp => <option key={mp.id} value={mp.id}>{mp.name}</option>)}
                          </select>
                        </div>
                        <div className="w-32">
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Price/Night</label>
                          <input type="number" min={0} value={m.pricePerNight} onChange={e => {
                            const newM = [...form.mealRates]; newM[i].pricePerNight = Number(e.target.value); setForm({...form, mealRates: newM})
                          }} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm" />
                        </div>
                        <button onClick={() => {
                          const newM = [...form.mealRates]; newM.splice(i, 1); setForm({...form, mealRates: newM})
                        }} className="h-8 w-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {form.mealRates.length === 0 && <p className="text-xs text-slate-400 italic">No meal rates added.</p>}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                    <h3 className="text-sm font-bold text-slate-800">Service Rates</h3>
                    <button onClick={() => setForm({...form, serviceRates: [...form.serviceRates, { additionalServiceId: '', pricePerNight: 0 }]})} className="text-[#0B4EA2] text-xs font-bold flex items-center gap-1 hover:underline">
                      <Plus className="w-3 h-3" /> Add Service
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.serviceRates.map((s, i) => (
                      <div key={i} className="flex items-end gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex-1">
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Service</label>
                          <select value={s.additionalServiceId} onChange={e => {
                            const val = e.target.value;
                            const newS = [...form.serviceRates]; 
                            newS[i].additionalServiceId = val;
                            const selectedService = additionalServices.find(as => as.id === val);
                            if (selectedService) {
                              newS[i].pricePerNight = selectedService.price;
                            }
                            setForm({...form, serviceRates: newS});
                          }} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-white">
                            <option value="">Select Service</option>
                            {additionalServices.map(as => <option key={as.id} value={as.id}>{as.name}</option>)}
                          </select>
                        </div>
                        <div className="w-32">
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Price/Night</label>
                          <input type="number" min={0} value={s.pricePerNight} onChange={e => {
                            const newS = [...form.serviceRates]; newS[i].pricePerNight = Number(e.target.value); setForm({...form, serviceRates: newS})
                          }} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm" />
                        </div>
                        <button onClick={() => {
                          const newS = [...form.serviceRates]; newS.splice(i, 1); setForm({...form, serviceRates: newS})
                        }} className="h-8 w-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {form.serviceRates.length === 0 && <p className="text-xs text-slate-400 italic">No service rates added.</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex gap-3">
              <button onClick={closePanel} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-semibold hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 px-4 py-2.5 rounded-lg bg-[#0B4EA2] text-white font-semibold hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save Package'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
