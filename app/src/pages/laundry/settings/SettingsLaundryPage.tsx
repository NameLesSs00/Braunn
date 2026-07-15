import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appAlert } from '../../../shared/ui/AppAlert';
import { routes } from '../../../shared/lib/routes';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchLaundryInventoryUnits,
  createLaundryInventoryUnit,
} from '../../../features/Laundryfeatures/laundryInventoryUnits/laundryInventoryUnitsSlice';
import {
  fetchLaundryInventoryCategories,
  createLaundryInventoryCategory,
} from '../../../features/Laundryfeatures/laundryInventoryCategories/laundryInventoryCategoriesSlice';
import {
  fetchLaundryTypes,
  createLaundryType,
} from '../../../features/Laundryfeatures/laundryTypes/laundryTypesSlice';
import { LaundrySettingsTabs, type LaundrySettingsTab } from './components/LaundrySettingsTabs';
import { LaundryUnitsTable } from './components/LaundryUnitsTable';
import { LaundryCategoriesTable } from './components/LaundryCategoriesTable';
import { LaundryItemsTable } from './components/LaundryItemsTable';
import { LaundryTypesTable } from './components/LaundryTypesTable';
import { AddUnitModal } from './components/AddUnitModal';
import { AddCategoryModal } from './components/AddCategoryModal';
import { AddItemModal } from './components/AddItemModal';
import { AddTypeModal } from './components/AddTypeModal';
import { IoSettingsOutline } from 'react-icons/io5';
import { FiPlus } from 'react-icons/fi';

const showSuccess = (title: string) =>
  appAlert.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon: 'success',
    title,
  });

const showError = (title: string) =>
  appAlert.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    icon: 'error',
    title,
  });

export function SettingsLaundryPage() {
  const dispatch = useAppDispatch();

  const { units, status: unitsStatus, error: unitsError } = useAppSelector((s) => s.laundryInventoryUnits);
  const { categories, status: catStatus, error: catError } = useAppSelector((s) => s.laundryInventoryCategories);
  const { types, status: typesStatus, error: typesError } = useAppSelector((s) => s.laundryTypes);

  const [activeTab, setActiveTab] = useState<LaundrySettingsTab>('Units');
  const [addUnitOpen, setAddUnitOpen] = useState(false);
  const [addCatOpen, setAddCatOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addTypeOpen, setAddTypeOpen] = useState(false);

  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [isAddingType, setIsAddingType] = useState(false);

  // Lazy-load data when switching tabs
  useEffect(() => {
    if (activeTab === 'Units' && unitsStatus === 'idle') {
      dispatch(fetchLaundryInventoryUnits());
    }
    if (activeTab === 'Category' && catStatus === 'idle') {
      dispatch(fetchLaundryInventoryCategories());
    }
    if (activeTab === 'Types' && typesStatus === 'idle') {
      dispatch(fetchLaundryTypes());
    }
    if (activeTab === 'Items') {
      if (unitsStatus === 'idle') dispatch(fetchLaundryInventoryUnits());
      if (catStatus === 'idle') dispatch(fetchLaundryInventoryCategories());
    }
  }, [activeTab, unitsStatus, catStatus, typesStatus, dispatch]);

  const handleAddUnit = async (name: string) => {
    setIsAddingUnit(true);
    const result = await dispatch(createLaundryInventoryUnit({ name }));
    setIsAddingUnit(false);
    setAddUnitOpen(false);
    if (createLaundryInventoryUnit.fulfilled.match(result)) {
      showSuccess('Unit created successfully');
    } else {
      showError((result.payload as string) || 'Failed to create unit');
    }
  };

  const handleAddCategory = async (name: string) => {
    setIsAddingCat(true);
    const result = await dispatch(createLaundryInventoryCategory({ name }));
    setIsAddingCat(false);
    setAddCatOpen(false);
    if (createLaundryInventoryCategory.fulfilled.match(result)) {
      showSuccess('Category created successfully');
    } else {
      showError((result.payload as string) || 'Failed to create category');
    }
  };

  const handleAddType = async (name: string) => {
    setIsAddingType(true);
    const result = await dispatch(createLaundryType({ name }));
    setIsAddingType(false);
    setAddTypeOpen(false);
    if (createLaundryType.fulfilled.match(result)) {
      showSuccess('Type created successfully');
    } else {
      showError((result.payload as string) || 'Failed to create type');
    }
  };

  return (
    <div className="py-6 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#EEF4FF]">
              {/* @ts-ignore */}
              <IoSettingsOutline className="w-5 h-5 text-[#0a4bbd]" />
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-slate-800 leading-tight">Settings</h1>
              <p className="text-[13px] text-slate-400">Manage laundry inventory configuration</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTab === 'Units' && (
              <button
                onClick={() => setAddUnitOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a4bbd] text-[13px] font-semibold text-white hover:bg-blue-800 transition-colors shadow-sm"
              >
                {/* @ts-ignore */}
                <FiPlus className="w-4 h-4" />
                Add Unit
              </button>
            )}
            {activeTab === 'Category' && (
              <button
                onClick={() => setAddCatOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a4bbd] text-[13px] font-semibold text-white hover:bg-blue-800 transition-colors shadow-sm"
              >
                {/* @ts-ignore */}
                <FiPlus className="w-4 h-4" />
                Add Category
              </button>
            )}
            {activeTab === 'Items' && (
              <button
                onClick={() => setAddItemOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a4bbd] text-[13px] font-semibold text-white hover:bg-blue-800 transition-colors shadow-sm"
              >
                {/* @ts-ignore */}
                <FiPlus className="w-4 h-4" />
                Add Item
              </button>
            )}
            {activeTab === 'Types' && (
              <button
                onClick={() => setAddTypeOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a4bbd] text-[13px] font-semibold text-white hover:bg-blue-800 transition-colors shadow-sm"
              >
                {/* @ts-ignore */}
                <FiPlus className="w-4 h-4" />
                Add Type
              </button>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-slate-500">
            <li>
              <Link
                to={routes.laundry.overview}
                className="font-medium text-slate-500 hover:text-[#0B4EA2] transition-colors"
              >
                Laundry
              </Link>
            </li>
            <li><span className="text-slate-300">/</span></li>
            <li>
              <Link
                to={routes.laundry.settings}
                className="font-medium text-slate-500 hover:text-[#0B4EA2] transition-colors"
              >
                Settings
              </Link>
            </li>
            <li><span className="text-slate-300">/</span></li>
            <li className="font-semibold text-[#0B4EA2]">{activeTab}</li>
          </ol>
        </nav>
      </div>

      {/* Sub-tabs + content */}
      <div className="space-y-5">
        <LaundrySettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'Units' && (
          <LaundryUnitsTable units={units} isLoading={unitsStatus === 'loading'} error={unitsError} />
        )}
        {activeTab === 'Category' && (
          <LaundryCategoriesTable categories={categories} isLoading={catStatus === 'loading'} error={catError} />
        )}
        {activeTab === 'Items' && <LaundryItemsTable />}
        {activeTab === 'Types' && (
          <LaundryTypesTable types={types} isLoading={typesStatus === 'loading'} error={typesError} />
        )}
      </div>

      {/* Modals */}
      <AddUnitModal
        isOpen={addUnitOpen}
        onConfirm={handleAddUnit}
        onCancel={() => setAddUnitOpen(false)}
        isSaving={isAddingUnit}
      />
      <AddCategoryModal
        isOpen={addCatOpen}
        onConfirm={handleAddCategory}
        onCancel={() => setAddCatOpen(false)}
        isSaving={isAddingCat}
      />
      <AddItemModal
        isOpen={addItemOpen}
        onClose={() => setAddItemOpen(false)}
      />
      <AddTypeModal
        isOpen={addTypeOpen}
        onConfirm={handleAddType}
        onCancel={() => setAddTypeOpen(false)}
        isSaving={isAddingType}
      />
    </div>
  );
}
