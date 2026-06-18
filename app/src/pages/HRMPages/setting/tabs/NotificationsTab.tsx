import { useState } from 'react';

const NOTIFICATION_SETTINGS = [
  { id: 'attendance', label: 'Attendance notifications', defaultOn: true },
  { id: 'leave', label: 'Leave requests', defaultOn: true },
  { id: 'shift', label: 'Shift updates', defaultOn: true },
  { id: 'payroll', label: 'Payroll reminders', defaultOn: false },
  { id: 'email', label: 'Email notifications', defaultOn: true },
];

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
        enabled ? 'bg-[#0B4EA2]' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
          enabled ? 'translate-x-8' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export function NotificationsTab() {
  const [settings, setSettings] = useState(
    Object.fromEntries(NOTIFICATION_SETTINGS.map((n) => [n.id, n.defaultOn]))
  );

  const toggle = (id: string) => {
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-8">
      {/* Tab Header */}
      <h2 className="mb-6 text-[16px] font-bold text-slate-800">Notification Settings</h2>

      {/* Notifications List */}
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
        {NOTIFICATION_SETTINGS.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-[#f8fafc] px-6 py-4"
          >
            <span className="text-[15px] text-slate-700">{item.label}</span>
            <Toggle enabled={settings[item.id]} onToggle={() => toggle(item.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

