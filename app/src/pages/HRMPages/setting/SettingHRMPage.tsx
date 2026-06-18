import { useState, useCallback } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Building2, Clock, Bell, Briefcase, Plus, ChevronRight, Home } from 'lucide-react';
import { routes } from '../../../shared/lib/routes';
import { SettingsContext } from './SettingsContext';

export function SettingHRMPage() {
  const location = useLocation();
  const [addTrigger, setAddTrigger] = useState(0);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const onAddClick = useCallback(() => {
    setAddTrigger((n) => n + 1);
  }, []);

  const tabs = [
    {
      label: 'Departments',
      path: routes.hrm.setting.departments,
      icon: Building2,
      addLabel: 'Add Department',
    },
    {
      label: 'Shifts',
      path: routes.hrm.setting.shifts,
      icon: Clock,
      addLabel: 'Add Shift',
    },
    {
      label: 'Positions',
      path: routes.hrm.setting.positions,
      icon: Briefcase,
      addLabel: 'Add Position',
    },
    {
      label: 'Notifications',
      path: routes.hrm.setting.notifications,
      icon: Bell,
      addLabel: null,
    },
  ];

  const currentTab = tabs.find((t) => location.pathname.startsWith(t.path)) ?? tabs[0];

  // Build breadcrumb crumbs
  const crumbs = [
    { label: 'Settings', path: routes.hrm.setting.departments },
    { label: currentTab.label, path: currentTab.path },
    ...(activeAction ? [{ label: activeAction, path: null }] : []),
  ];

  return (
    <SettingsContext.Provider value={{ onAddClick, addTrigger, activeAction, setActiveAction }}>
      <div className="mx-auto max-w-[1600px] flex flex-col gap-4">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="flex items-center gap-1.5 text-[13px]">
            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <li key={i} className="flex items-center gap-1.5">
                  {i === 0 && (
                    <Home className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  )}
                  {!isLast && crumb.path ? (
                    <Link
                      to={crumb.path}
                      className="font-medium text-slate-500 hover:text-[#0B4EA2] transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        isLast
                          ? 'font-semibold text-[#0B4EA2]'
                          : 'font-medium text-slate-500'
                      }
                    >
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Header */}
        <div>
          <h1 className="text-[22px] font-bold text-[#0B4EA2]">Settings</h1>
          <p className="mt-1 text-[14px] text-slate-500">Manage system settings and preferences</p>
        </div>

        {/* Tabs row + Add button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tabs.map((tab) => {
              const isActive = location.pathname.startsWith(tab.path);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.label}
                  to={tab.path}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#0B4EA2] text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {currentTab.addLabel && (
            <button
              onClick={onAddClick}
              className="flex items-center gap-2 rounded-lg bg-[#0B4EA2] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#093c80]"
            >
              <Plus className="h-4 w-4" />
              {currentTab.addLabel}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <Outlet />
        </div>
      </div>
    </SettingsContext.Provider>
  );
}
