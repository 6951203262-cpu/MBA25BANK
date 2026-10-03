import React from 'react';
import { 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Bell, 
  Lock,
  Unlock,
  Heart
} from 'lucide-react';
import { SystemConfig } from '../types';

interface NavbarProps {
  config: SystemConfig;
  isOnline: boolean;
  isAdmin: boolean;
  pendingReviewCount: number;
  onToggleAdmin: () => void;
  onTogglePdpa: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  isOnline,
  isAdmin,
  pendingReviewCount,
  onToggleAdmin,
  onTogglePdpa,
  onOpenNotifications,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100/80 px-4 lg:px-8 py-3 transition-colors shadow-xs font-['Prompt',sans-serif]">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-300 to-amber-200 flex items-center justify-center shadow-md shadow-pink-200/50">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg text-slate-800 tracking-tight flex items-center gap-1.5 font-['Mitr',sans-serif]">
                MBA25 BANK <span className="text-pink-600 font-extrabold text-xs px-2 py-0.5 rounded-full bg-pink-50 border border-pink-200">23 สมาชิก</span>
              </h1>
              {isAdmin ? (
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-rose-500" /> แอดมิน
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <UserCheck className="w-3 h-3 text-teal-500" /> สมาชิก
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-[200px] md:max-w-xs flex items-center gap-1">
              <span>ธ.กรุงไทย</span>
              <strong className="text-sky-700 font-mono font-bold bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">8420786446</strong>
            </p>
          </div>
        </div>

        {/* Status Indicators & Action Controls */}
        <div className="flex items-center gap-2 md:gap-2.5">
          
          {/* Online / Offline status */}
          <div 
            title={isOnline ? "ระบบเชื่อมต่ออินเทอร์เน็ตปกติ" : "โหมดออฟไลน์: บันทึกข้อมูลและทำงานได้ต่อเนื่อง"}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              isOnline 
                ? 'bg-teal-50 text-teal-700 border-teal-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                <Wifi className="w-3.5 h-3.5 text-teal-500" />
                <span className="text-[11px]">ออนไลน์</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px]">ออฟไลน์</span>
              </>
            )}
          </div>

          {/* PDPA Privacy Masking Toggle */}
          <button
            onClick={onTogglePdpa}
            title={config.pdpaMasking ? 'โหมด PDPA: ซ่อนเลขบัญชี/เบอร์โทร (คลิกเพื่อแสดง)' : 'คลิกเพื่อเปิดโหมดปกป้องข้อมูลส่วนบุคคล (PDPA)'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              config.pdpaMasking
                ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {config.pdpaMasking ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-purple-500" />
                <span className="hidden sm:inline">PDPA ซ่อนข้อมูล</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">แสดงข้อมูลเต็ม</span>
              </>
            )}
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            title="แจ้งเตือนบิลรอชำระ"
            className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {pendingReviewCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {pendingReviewCount}
              </span>
            )}
          </button>

          {/* Admin Mode Toggle Button */}
          <button
            onClick={onToggleAdmin}
            title="สลับโหมดผู้ดูแลระบบ (ต้องใส่รหัสผ่าน)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              isAdmin
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white shadow-pink-200'
            }`}
          >
            {isAdmin ? <Unlock className="w-3.5 h-3.5 text-rose-500" /> : <Lock className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAdmin ? 'ล็อกโหมดแอดมิน' : 'เข้าสู่ระบบแอดมิน'}</span>
            <span className="sm:hidden">{isAdmin ? 'ล็อก' : 'แอดมิน'}</span>
          </button>

        </div>
      </div>
    </header>
  );
};
