export type SettingsTab = 'Units' | 'Category' | 'Items' | 'L&F Categories';

export const SETTINGS_TABS: SettingsTab[] = ['Units', 'Category', 'Items', 'L&F Categories'];

interface SettingsTabsProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm w-fit">
      {SETTINGS_TABS.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`py-3 px-8 text-[14px] font-semibold text-center transition-colors relative whitespace-nowrap ${
              isActive
                ? 'text-[#0a4bbd]'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0a4bbd] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
