import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  ReceiptText, 
  ShieldCheck
} from 'lucide-react';

export type NavigationTab = 
  | 'dashboard'
  | 'members'
  | 'bills'
  | 'history'
  | 'backup_security';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  pendingBillsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingBillsCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'สรุปภาพรวม & ยอดรวม',
      icon: LayoutDashboard,
      badge: null,
      activeColor: 'from-pink-500 to-rose-400',
    },
    {
      id: 'members' as NavigationTab,
      label: 'รายชื่อสมาชิก (23 คน)',
      icon: Users,
      badge: '23',
      badgeColor: 'bg-teal-50 text-teal-700 border border-teal-200',
      activeColor: 'from-teal-500 to-emerald-400',
    },
    {
      id: 'bills' as NavigationTab,
      label: 'จ่ายชำระ MBA25 BANK (งวด 300.-)',
      icon: CreditCard,
      badge: pendingBillsCount > 0 ? `${pendingBillsCount}` : null,
      badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200',
      activeColor: 'from-sky-500 to-cyan-400',
    },
    {
      id: 'history' as NavigationTab,
      label: 'ประวัติโอนเงิน & ใบเสร็จ',
      icon: ReceiptText,
      badge: null,
      activeColor: 'from-amber-500 to-orange-400',
    },
    {
      id: 'backup_security' as NavigationTab,
      label: 'ความปลอดภัย & สำรองข้อมูล',
      icon: ShieldCheck,
      badge: null,
      activeColor: 'from-slate-600 to-slate-500',
    },
  ];

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-pink-100 p-4 shrink-0 min-h-[calc(100vh-65px)] font-['Prompt',sans-serif]">
        <div className="space-y-1.5">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            เมนูหลัก (Navigation)
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? `bg-gradient-to-r ${item.activeColor} text-white shadow-md shadow-slate-200`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-pink-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${isActive ? 'bg-white/20 text-white' : item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bank Account Info Highlight Card */}
        <div className="mt-auto pt-6">
          <div className="p-4 rounded-3xl bg-gradient-to-br from-sky-50 via-teal-50/40 to-pink-50/50 border border-sky-100 text-xs shadow-2xs">
            <div className="flex items-center gap-2 text-sky-700 font-bold mb-1">
              <span className="text-base">🏦</span>
              <span>บัญชีรับเงิน MBA25 BANK</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">ธนาคารกรุงไทย</p>
            <div className="mt-1.5 p-2 rounded-xl bg-white border border-sky-200 text-center font-mono font-bold text-sky-800 text-sm tracking-wide shadow-2xs">
              8420786446
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-1">
              ยอดเดือนละ 300 บาท
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (< 1024px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-pink-100 px-2 py-1.5 flex justify-around items-center shadow-lg font-['Prompt',sans-serif]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center py-1 px-1.5 rounded-xl text-[10px] font-medium transition-colors relative cursor-pointer ${
                isActive ? 'text-pink-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-pink-500' : 'text-slate-400'}`} />
                {item.badge && !isActive && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-pink-400 text-white font-extrabold text-[8px] flex items-center justify-center">
                    !
                  </span>
                )}
              </div>
              <span className="truncate max-w-[55px] text-[9px]">
                {item.label.includes('MBA25') ? 'MBA25' : item.label.includes('สมาชิก') ? 'สมาชิก 23' : item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
