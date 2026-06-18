import { useState } from 'react';
import { X, Sparkles, Calendar, DollarSign, Settings, CheckCircle2, ChevronDown, Info } from 'lucide-react';

interface AddSeasonalPricingPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  { id: 1, name: 'Season Details', icon: Sparkles },
  { id: 2, name: 'Date Range', icon: Calendar },
  { id: 3, name: 'Pricing', icon: DollarSign },
  { id: 4, name: 'Settings', icon: Settings },
  { id: 5, name: 'Review', icon: CheckCircle2 },
];

const seasonTypes = [
  {
    id: 'High Season',
    title: 'High Season',
    description: 'Increased demand period',
    activeColors: 'border-red-300 bg-red-50',
    textColors: 'text-red-700',
    descColors: 'text-red-500'
  },
  {
    id: 'Low Season',
    title: 'Low Season',
    description: 'Lower occupancy period',
    activeColors: 'border-blue-300 bg-blue-50',
    textColors: 'text-slate-800',
    descColors: 'text-slate-500'
  },
  {
    id: 'Shoulder Season',
    title: 'Shoulder Season',
    description: 'Transition period',
    activeColors: 'border-blue-300 bg-blue-50',
    textColors: 'text-slate-800',
    descColors: 'text-slate-500'
  },
  {
    id: 'Holiday/Event',
    title: 'Holiday/Event',
    description: 'Special events/holidays',
    activeColors: 'border-blue-300 bg-blue-50',
    textColors: 'text-slate-800',
    descColors: 'text-slate-500'
  }
];

const defaultRooms = [
  { id: 'standard', name: 'Standard', basePrice: 120 },
  { id: 'deluxe', name: 'Deluxe', basePrice: 160 },
  { id: 'suite', name: 'Suite', basePrice: 240 },
];

export function AddSeasonalPricingPopup({ isOpen, onClose }: AddSeasonalPricingPopupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [seasonName, setSeasonName] = useState('');
  const [selectedSeasonType, setSelectedSeasonType] = useState('High Season');
  const [description, setDescription] = useState('');
  
  // Step 2 State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applyWeekdays, setApplyWeekdays] = useState(false);
  const [applyWeekends, setApplyWeekends] = useState(false);

  // Step 3 State
  const [pricingAdjustments, setPricingAdjustments] = useState(
    defaultRooms.reduce((acc, room) => ({
      ...acc,
      [room.id]: { type: 'Percentage %', value: '0' }
    }), {} as Record<string, { type: string, value: string }>)
  );

  // Step 4 State
  const [minStay, setMinStay] = useState('');
  const [maxStay, setMaxStay] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [priorityLevel, setPriorityLevel] = useState(5);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#004bb4] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Add Seasonal Pricing</h2>
            <p className="text-blue-100 text-sm mt-1">Step {currentStep} of {steps.length}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-blue-100 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* content container */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Stepper */}
          <div className="flex items-start justify-between mb-10 w-full relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = currentStep > step.id;

              return (
                <div key={step.id} className="flex flex-col items-center flex-1 relative">
                  {/* Connecting Line */}
                  {idx < steps.length - 1 && (
                    <div className={`absolute top-6 left-[50%] w-full h-[2px] -z-10 ${currentStep > step.id ? 'bg-[#004bb4]' : 'bg-slate-200'}`} />
                  )}
                  
                  <div className="bg-white px-4 z-10 flex items-center justify-center">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isActive 
                          ? 'bg-[#004bb4] border-[#004bb4] text-white shadow-md' 
                          : isPast
                          ? 'bg-blue-50 border-blue-200 text-[#004bb4]'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <span 
                    className={`text-sm font-semibold mt-3 ${
                      isActive ? 'text-[#004bb4]' : isPast ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Form Content - Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Season Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Season Name *
                </label>
                <input 
                  type="text" 
                  value={seasonName}
                  onChange={(e) => setSeasonName(e.target.value)}
                  placeholder="e.g., Summer Peak 2026"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#004bb4] transition-all text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Season Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Season Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {seasonTypes.map(type => {
                    const isSelected = selectedSeasonType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedSeasonType(type.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected 
                            ? type.activeColors
                            : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                        }`}
                      >
                        <h4 className={`font-bold mb-1 ${isSelected ? type.textColors : 'text-slate-700'}`}>
                          {type.title}
                        </h4>
                        <p className={`text-sm ${isSelected ? type.descColors : 'text-slate-500'}`}>
                          {type.description}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <textarea 
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add Note about This season pricing"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#004bb4] transition-all text-slate-800 placeholder-slate-400 resize-none"
                />
              </div>
            </div>
          )}

          {/* Form Content - Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Start Date *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="MM/DD/YY"
                      className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#004bb4] transition-all text-slate-800 placeholder-slate-400"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    End Date *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="MM/DD/YY"
                      className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#004bb4] transition-all text-slate-800 placeholder-slate-400"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-[#f0f7ff] border border-blue-200 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-[#004bb4] shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-[#004bb4] text-sm">Duration: 4 days</h5>
                  <p className="text-[#3b82f6] text-sm mt-0.5">
                    This seasonal pricing will be applied to all selected dates and room types
                  </p>
                </div>
              </div>

              {/* Apply to Days */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-4">
                  Apply to Days
                </label>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      applyWeekdays ? 'bg-[#004bb4] border-[#004bb4]' : 'bg-white border-blue-400'
                    }`}>
                      {applyWeekdays && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={applyWeekdays}
                      onChange={(e) => setApplyWeekdays(e.target.checked)}
                    />
                    <span className="text-slate-600 font-medium group-hover:text-slate-800 transition-colors">
                      Weekdays (Saturday - sunday)
                    </span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      applyWeekends ? 'bg-[#004bb4] border-[#004bb4]' : 'bg-white border-blue-400'
                    }`}>
                      {applyWeekends && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={applyWeekends}
                      onChange={(e) => setApplyWeekends(e.target.checked)}
                    />
                    <span className="text-slate-600 font-medium group-hover:text-slate-800 transition-colors">
                      Weekends (Friday - Sunday)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Form Content - Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="text-slate-600 font-medium">Configure pricing adjustments for each room type</p>
              </div>

              <div className="space-y-6">
                {defaultRooms.map(room => {
                  const adjustment = pricingAdjustments[room.id];
                  const valueNum = parseFloat(adjustment.value) || 0;
                  const isPercentage = adjustment.type.includes('%');
                  
                  const finalResult = isPercentage
                    ? room.basePrice + (room.basePrice * valueNum / 100)
                    : room.basePrice + valueNum;
                    
                  const calculationText = isPercentage 
                    ? `Calculation: €${room.basePrice} + (${valueNum}%) = €${finalResult.toFixed(2)}`
                    : `Calculation: €${room.basePrice} + €${valueNum} = €${finalResult.toFixed(2)}`;

                  return (
                    <div key={room.id} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                      {/* Header */}
                      <div className="p-6 pb-0 flex items-center justify-between mb-6">
                        <h4 className="text-lg font-bold text-slate-800">{room.name}</h4>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-semibold">
                          Base: €{room.basePrice}
                        </span>
                      </div>
                      
                      {/* Controls */}
                      <div className="px-6 grid grid-cols-3 gap-6 mb-6">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">
                            Adjustment Type
                          </label>
                          <div className="relative">
                            <select 
                              className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#004bb4] transition-all text-slate-800 appearance-none font-medium bg-white"
                              value={adjustment.type}
                              onChange={(e) => setPricingAdjustments(prev => ({
                                ...prev,
                                [room.id]: { ...prev[room.id], type: e.target.value }
                              }))}
                            >
                              <option>Percentage %</option>
                              <option>Fixed Amount €</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">
                            Adjustment Value
                          </label>
                          <input 
                            type="number"
                            value={adjustment.value}
                            onChange={(e) => setPricingAdjustments(prev => ({
                              ...prev,
                              [room.id]: { ...prev[room.id], value: e.target.value }
                            }))}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#004bb4] transition-all text-slate-800 font-medium"
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">
                            Final Rate
                          </label>
                          <div className="w-full px-4 py-3 rounded-xl bg-green-50 text-green-700 font-bold border border-green-100 flex items-center">
                            €{finalResult.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Calculation Footer */}
                      <div className="bg-[#f8fafc] px-6 py-3 border-t border-slate-100">
                        <span className="text-xs font-medium text-slate-500">
                          {calculationText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Content - Step 4 */}
          {currentStep === 4 && (
            <div className="space-y-8">
              {/* Stays */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Minimum Stay (Nights)
                  </label>
                  <input 
                    type="number" 
                    value={minStay}
                    onChange={(e) => setMinStay(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#004bb4] transition-all text-slate-800 placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Maximum Stay (Nights)
                  </label>
                  <input 
                    type="number" 
                    value={maxStay}
                    onChange={(e) => setMaxStay(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#004bb4] transition-all text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Cancellation Policy */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Cancellation Policy
                </label>
                <div className="relative">
                  <select 
                    title="Cancellation Policy"
                    value={cancellationPolicy}
                    onChange={(e) => setCancellationPolicy(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#004bb4] transition-all text-slate-800 appearance-none font-medium bg-white"
                  >
                    <option value="" disabled selected hidden>select</option>
                    <option value="flexible">Flexible</option>
                    <option value="moderate">Moderate</option>
                    <option value="strict">Strict</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Priority Level */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-4">
                  Priority Level
                </label>
                <div className="flex items-center gap-6">
                  {/* Slider Container */}
                  <div className="flex-1 relative flex items-center h-8">
                    {/* Track Background */}
                    <div className="absolute w-full h-2 rounded-full bg-slate-100 border border-slate-200"></div>
                    
                    {/* Filled Track */}
                    <div 
                      className="absolute h-2 rounded-l-full bg-[#004bb4]"
                      style={{ width: `${(priorityLevel / 10) * 100}%` }}
                    ></div>
                    
                    {/* Native Range Input over top */}
                    <input 
                      type="range"
                      min="1"
                      max="10"
                      value={priorityLevel}
                      onChange={(e) => setPriorityLevel(parseInt(e.target.value))}
                      className="absolute w-full appearance-none bg-transparent cursor-pointer h-full z-10 
                        [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:w-5 
                        [&::-webkit-slider-thumb]:h-5 
                        [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-[#004bb4] 
                        [&::-webkit-slider-thumb]:border-4 
                        [&::-webkit-slider-thumb]:border-white 
                        [&::-webkit-slider-thumb]:shadow-md
                        [&::-moz-range-thumb]:w-5 
                        [&::-moz-range-thumb]:h-5 
                        [&::-moz-range-thumb]:rounded-full 
                        [&::-moz-range-thumb]:bg-[#004bb4] 
                        [&::-moz-range-thumb]:border-4 
                        [&::-moz-range-thumb]:border-white"
                    />
                  </div>

                  {/* Value Box */}
                  <div className="w-16 h-10 border-2 border-[#004bb4] rounded-lg bg-blue-50 flex items-center justify-center font-bold text-[#004bb4]">
                    {priorityLevel}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-3 font-medium">
                  Higher priority rules will override lower priority ones when conflicts occur
                </p>
              </div>
            </div>
          )}

          {/* Form Content - Step 5 (Review) */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Ready Banner */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-4 items-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="text-green-800 font-bold mb-0.5">Ready to Apply Seasonal Pricing</h4>
                  <p className="text-green-600 text-sm">Review the details below before confirming</p>
                </div>
              </div>

              {/* Season Information */}
              <div className="border border-slate-200 rounded-xl bg-white p-6 shadow-sm">
                <h4 className="text-lg font-bold text-slate-800 mb-6">Season Information</h4>
                <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <h5 className="text-sm text-slate-400 font-semibold mb-1.5">Season Name</h5>
                    <p className="font-bold text-slate-800">{seasonName || 'N/A'}</p>
                  </div>
                  <div>
                    <h5 className="text-sm text-slate-400 font-semibold mb-1.5">Season Type</h5>
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                      {selectedSeasonType}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-sm text-slate-400 font-semibold mb-1.5">Date Range</h5>
                    <p className="font-bold text-slate-800">
                      {startDate || 'N/A'} to {endDate || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm text-slate-400 font-semibold mb-1.5">Apply to</h5>
                    <p className="font-bold text-slate-800">
                      {(applyWeekdays && applyWeekends) 
                        ? 'All Days' 
                        : (applyWeekdays ? 'Weekdays' : (applyWeekends ? 'Weekends' : 'All Days'))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Adjustments */}
              <div className="border border-slate-200 rounded-xl bg-white p-6 shadow-sm">
                <h4 className="text-lg font-bold text-slate-800 mb-6">Pricing Adjustments</h4>
                <div className="space-y-3">
                  {defaultRooms.map(room => {
                    const adjustment = pricingAdjustments[room.id];
                    const valueNum = parseFloat(adjustment?.value) || 0;
                    const isPercentage = adjustment?.type.includes('%');
                    
                    const finalResult = isPercentage
                      ? room.basePrice + (room.basePrice * valueNum / 100)
                      : room.basePrice + valueNum;

                    return (
                      <div key={room.id} className="bg-[#f8fafc] rounded-xl px-4 py-3 flex items-center justify-between border border-slate-100">
                        <span className="font-bold text-slate-700">{room.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">€{room.basePrice}</span>
                          <span className="text-slate-300">&gt;</span>
                          <span className="font-bold text-green-600">€{finalResult.toFixed(2)}</span>
                          <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold">
                            {valueNum}{isPercentage ? '%' : '€'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-8 py-5 flex items-center justify-between bg-slate-50/50">
          <button 
            onClick={() => currentStep > 1 ? setCurrentStep(prev => prev - 1) : onClose()}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors min-w-[120px]"
          >
            {currentStep > 1 ? 'Back' : 'Cancel'}
          </button>
          
          <span className="text-slate-500 font-medium">
            Step {currentStep} of {steps.length}
          </span>
          
          {currentStep === steps.length ? (
            <button 
              onClick={onClose}
              className="px-8 py-2.5 rounded-xl bg-[#059669] text-white font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Confirm & Apply
            </button>
          ) : (
            <button 
              onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length))}
              className="px-8 py-2.5 rounded-xl bg-[#004bb4] text-white font-bold hover:bg-blue-800 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
