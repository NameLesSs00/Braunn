import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../../shared/lib/routes';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchHkmInventoryUnits,
  createHkmInventoryUnit,
} from '../../../features/HKfeatures/hkmInventoryUnits/hkmInventoryUnitsSlice';
import {
  fetchHkmInventoryCategories,
  createHkmInventoryCategory,
} from '../../../features/HKfeatures/hkmInventoryCategories/hkmInventoryCategoriesSlice';
import {
  fetchLostFoundCategories,
  createLostFoundCategory,
} from '../../../features/HKfeatures/lostFoundCategories/lostFoundCategoriesSlice';
import { SettingsTabs, type SettingsTab } from './components/SettingsTabs';
import { UnitsTable } from './components/UnitsTable';
import { CategoriesTable } from './components/CategoriesTable';
import { ItemsTable } from './components/ItemsTable';
import { LostFoundCategoriesTable } from './components/LostFoundCategoriesTable';
import { AddUnitModal } from './components/AddUnitModal';
import { AddCategoryModal } from './components/AddCategoryModal';
import { AddItemModal } from './components/AddItemModal';
import { AddLostFoundCategoryModal } from './components/AddLostFoundCategoryModal';
import { IoSettingsOutline } from 'react-icons/io5';
import { FiPlus } from 'react-icons/fi';

export function SettingsHKPage() {
  const dispatch = useAppDispatch();

  const { units, status: unitsStatus, error: unitsError } = useAppSelector((s) => s.hkmInventoryUnits);
  const { categories, status: catStatus, error: catError } = useAppSelector((s) => s.hkmInventoryCategories);
  const {
    categories: lfCategories,
    totalCount: lfTotalCount,
    status: lfStatus,
    error: lfError,
  } = useAppSelector((s) => s.lostFoundCategories);

  const [activeTab, setActiveTab] = useState<SettingsTab>('Units');
  const [addUnitOpen, setAddUnitOpen] = useState(false);
  const [addCatOpen, setAddCatOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addLFCatOpen, setAddLFCatOpen] = useState(false);

  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [isAddingLFCat, setIsAddingLFCat] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Fetch on first visit to each tab
  useEffect(() => {
    if (activeTab === 'Units' && unitsStatus === 'idle') {
      dispatch(fetchHkmInventoryUnits());
    }
    if (activeTab === 'Category' && catStatus === 'idle') {
      dispatch(fetchHkmInventoryCategories());
    }
    if (activeTab === 'Items') {
      if (unitsStatus === 'idle') dispatch(fetchHkmInventoryUnits());
      if (catStatus === 'idle') dispatch(fetchHkmInventoryCategories());
    }
    if (activeTab === 'L&F Categories' && lfStatus === 'idle') {
      dispatch(fetchLostFoundCategories());
    }
  }, [activeTab, unitsStatus, catStatus, lfStatus, dispatch]);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
  };

  const handleAddUnit = async (name: string) => {
    setIsAddingUnit(true);
    await dispatch(createHkmInventoryUnit({ name }));
    setIsAddingUnit(false);
    setAddUnitOpen(false);
  };

  const handleAddCategory = async (name: string) => {
    setIsAddingCat(true);
    await dispatch(createHkmInventoryCategory({ name }));
    setIsAddingCat(false);
    setAddCatOpen(false);
  };

  const handleAddLFCategory = async (name: string) => {
    setIsAddingLFCat(true);
    await dispatch(createLostFoundCategory({ name }));
    setIsAddingLFCat(false);
    setAddLFCatOpen(false);
    setActiveAction(null);
  };

  const openAddLFCatModal = () => {
    setAddLFCatOpen(true);
    setActiveAction('Add L&F Category');
  };

  const closeAddLFCatModal = () => {
    setAddLFCatOpen(false);
    setActiveAction(null);
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
              <p className="text-[13px] text-slate-400">Manage inventory & Lost and Found configuration</p>
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
            {activeTab === 'L&F Categories' && (
              <button
                onClick={openAddLFCatModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a4bbd] text-[13px] font-semibold text-white hover:bg-blue-800 transition-colors shadow-sm"
              >
                {/* @ts-ignore */}
                <FiPlus className="w-4 h-4" />
                Add L&amp;F Category
              </button>
            )}
          </div>
        </div>

        <nav aria-label="breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-slate-500">
            <li>
              <Link to={routes.hk.settings} className="font-medium text-slate-500 hover:text-[#0B4EA2] transition-colors">
                Settings
              </Link>
            </li>
            <li>
              <span className="text-slate-300">/</span>
            </li>
            <li className="font-semibold text-[#0B4EA2]">{activeTab}</li>
            {activeAction && (
              <>
                <li>
                  <span className="text-slate-300">/</span>
                </li>
                <li className="font-semibold text-[#0B4EA2]">{activeAction}</li>
              </>
            )}
          </ol>
        </nav>
      </div>

      {/* Sub-tabs + content */}
      <div className="space-y-5">
        <SettingsTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {activeTab === 'Units' && (
          <UnitsTable units={units} isLoading={unitsStatus === 'loading'} error={unitsError} />
        )}

        {activeTab === 'Category' && (
          <CategoriesTable categories={categories} isLoading={catStatus === 'loading'} error={catError} />
        )}

        {activeTab === 'Items' && <ItemsTable />}

        {activeTab === 'L&F Categories' && (
          <LostFoundCategoriesTable
            categories={lfCategories}
            totalCount={lfTotalCount}
            isLoading={lfStatus === 'loading'}
            error={lfError}
            onActionChange={setActiveAction}
          />
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
      <AddLostFoundCategoryModal
        isOpen={addLFCatOpen}
        onConfirm={handleAddLFCategory}
        onCancel={closeAddLFCatModal}
        isSaving={isAddingLFCat}
      />
    </div>
  );
}
