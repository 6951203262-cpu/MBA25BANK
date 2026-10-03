import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  Download, 
  Upload, 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  History, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { SystemConfig, AuditLog, Member, Bill, PaymentTransaction, ExpenseRecord } from '../types';
import { exportDataAsJson } from '../utils/storage';

interface BackupAndSecurityViewProps {
  config: SystemConfig;
  auditLogs: AuditLog[];
  isOnline: boolean;
  cloudSyncing: boolean;
  allData: {
    members: Member[];
    bills: Bill[];
    transactions: PaymentTransaction[];
    expenses: ExpenseRecord[];
    config: SystemConfig;
  };
  onUpdateConfig: (newConfig: Partial<SystemConfig>) => void;
  onTriggerCloudBackup: () => void;
  onRestoreFromCloud: () => void;
  onImportBackupData: (importedData: any) => void;
}

export const BackupAndSecurityView: React.FC<BackupAndSecurityViewProps> = ({
  config,
  auditLogs,
  isOnline,
  cloudSyncing,
  allData,
  onUpdateConfig,
  onTriggerCloudBackup,
  onRestoreFromCloud,
  onImportBackupData,
}) => {
  const [pinInput, setPinInput] = useState(config.adminPin || '1234');
  const [savedPinSuccess, setSavedPinSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExportJson = () => {
    exportDataAsJson(allData, `mba25_bank_backup_${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.members && parsed.bills) {
          onImportBackupData(parsed);
          setImportSuccess(true);
          setImportError(null);
          setTimeout(() => setImportSuccess(false), 3000);
        } else {
          setImportError('โครงสร้างไฟล์สำรองไม่ถูกต้อง');
        }
      } catch (err: any) {
        setImportError('ไม่สามารถอ่านไฟล์ได้: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length < 4) return;
    onUpdateConfig({ adminPin: pinInput });
    setSavedPinSuccess(true);
    setTimeout(() => setSavedPinSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 font-['Prompt',sans-serif]">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-pink-600 mb-1">
          <ShieldCheck className="w-4 h-4" />
          ระบบความปลอดภัย การเข้ารหัส และการสำรองข้อมูลอัตโนมัติ
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2 font-['Mitr',sans-serif]">
          <Database className="w-6 h-6 text-pink-500" />
          การเข้ารหัสสำหรับแอดมิน & สำรองข้อมูล
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          จัดการรหัสผ่านผู้ดูแลระบบ ล็อกสิทธิ์การเข้าถึง และสำรองข้อมูลบัญชี MBA25 BANK
        </p>
      </div>

      {/* Security & Password Encryption Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Admin PIN Encryption */}
        <div className="bg-white border-2 border-pink-100 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-pink-50 text-pink-600 border border-pink-200">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm font-['Mitr',sans-serif]">
                การเข้ารหัสรหัสผ่านแอดมิน (Admin Passcode)
              </h3>
              <p className="text-xs text-slate-500">รหัสผ่านสำหรับปลดล็อกสิทธิ์ผู้ดูแลระบบ</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
            ระบบจะบังคับให้ใส่รหัสผ่านก่อนเข้าถึงฟังก์ชันออกบิล ล้างข้อมูลการโอน แก้ไขสมาชิก และบันทึกรายจ่าย
          </p>

          <form onSubmit={handleSavePin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">กำหนดรหัสผ่านแอดมินใหม่</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  maxLength={8}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="รหัส PIN 4-8 หลัก"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 font-mono text-center tracking-widest text-sm focus:outline-none focus:border-pink-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-xs rounded-2xl shadow-xs cursor-pointer"
                >
                  บันทึกรหัสผ่าน
                </button>
              </div>
            </div>
            {savedPinSuccess && (
              <p className="text-xs text-teal-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> บันทึกรหัสผ่านผู้ดูแลระบบใหม่เรียบร้อยแล้ว
              </p>
            )}
          </form>
        </div>

        {/* PDPA Privacy Protection Card */}
        <div className="bg-white border-2 border-pink-100 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm font-['Mitr',sans-serif]">
                การปกป้องข้อมูลส่วนบุคคล (PDPA)
              </h3>
              <p className="text-xs text-slate-500">ซ่อนเลขที่บัญชีและเบอร์โทรศัพท์</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
            เปิดระบบ Data Masking เพื่อปิดบังเลขบัญชีและเบอร์โทรศัพท์ของสมาชิก ให้แสดงผลเป็น xxx-x-xxxxx
          </p>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100">
            <div className="flex items-center gap-2 text-xs">
              {config.pdpaMasking ? <EyeOff className="w-4 h-4 text-purple-600" /> : <Eye className="w-4 h-4 text-slate-500" />}
              <span className="font-semibold text-slate-700">
                {config.pdpaMasking ? 'โหมดซ่อนข้อมูล: เปิดใช้งาน' : 'โหมดซ่อนข้อมูล: ปิดอยู่'}
              </span>
            </div>
            <button
              onClick={() => onUpdateConfig({ pdpaMasking: !config.pdpaMasking })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                config.pdpaMasking
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {config.pdpaMasking ? 'เปิดอยู่' : 'ปิดอยู่'}
            </button>
          </div>
        </div>

      </div>

      {/* Cloud Backup & Offline Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Cloud Auto-Backup */}
        <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200">
                <Cloud className={`w-5 h-5 ${cloudSyncing ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm font-['Mitr',sans-serif]">
                  การสำรองข้อมูลบนคลาวด์
                </h3>
                <p className="text-xs text-slate-500">Auto Cloud Snapshot</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
              อัตโนมัติ
            </span>
          </div>

          <div className="text-xs text-slate-600 space-y-1">
            <p>สำรองข้อมูลล่าสุด: <strong className="text-slate-800">{new Date(config.lastBackupTime || Date.now()).toLocaleTimeString('th-TH')}</strong></p>
            <p className="text-slate-400 text-[11px]">บันทึกรายชื่อ 23 สมาชิก, บิล MBA25 BANK และประวัติโอนเงินอย่างปลอดภัย</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onTriggerCloudBackup}
              disabled={cloudSyncing}
              className="py-2.5 px-3 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <CloudUpload className="w-4 h-4" />
              {cloudSyncing ? 'กำลังสำรอง...' : 'สำรองขึ้นคลาวด์'}
            </button>
            <button
              onClick={onRestoreFromCloud}
              className="py-2.5 px-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <CloudDownload className="w-4 h-4" />
              กู้คืนจากคลาวด์
            </button>
          </div>
        </div>

        {/* Offline & JSON export */}
        <div className="bg-white border border-teal-100 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200">
                {isOnline ? <Wifi className="w-5 h-5 text-teal-600" /> : <WifiOff className="w-5 h-5 text-amber-600" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm font-['Mitr',sans-serif]">
                  การทำงานแบบออฟไลน์
                </h3>
                <p className="text-xs text-slate-500">บันทึกข้อมูลในเครื่อง (LocalStorage PWA)</p>
              </div>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isOnline ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            สามารถดาวน์โหลดฐานข้อมูลสำรองเป็นไฟล์ JSON หรือนำเข้าไฟล์กลับเข้ามาได้ทุกเมื่อ
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleExportJson}
              className="py-2.5 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-teal-600" />
              ดาวน์โหลด JSON
            </button>
            <label className="py-2.5 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center">
              <Upload className="w-4 h-4 text-sky-600" />
              นำเข้าไฟล์ JSON
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>

          {importSuccess && (
            <p className="text-xs text-teal-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> นำเข้าข้อมูลเรียบร้อยแล้ว
            </p>
          )}
          {importError && (
            <p className="text-xs text-rose-500 font-bold flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {importError}
            </p>
          )}
        </div>

      </div>

      {/* Security Audit Trail Table */}
      <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 font-['Mitr',sans-serif]">
              <History className="w-5 h-5 text-pink-500" />
              บันทึกกิจกรรมความปลอดภัย (Security Audit Trail)
            </h3>
            <p className="text-xs text-slate-500">
              ประวัติการเข้าใช้งาน การตัดยอดชำระ MBA25 BANK และการเปลี่ยนแปลงข้อมูล
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {auditLogs.length} บันทึก
          </span>
        </div>

        <div className="overflow-x-auto max-h-60 overflow-y-auto pr-1">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-100 sticky top-0">
              <tr>
                <th className="py-2.5 px-3">วัน-เวลา</th>
                <th className="py-2.5 px-3">กิจกรรม</th>
                <th className="py-2.5 px-3">ผู้ปฏิบัติการ</th>
                <th className="py-2.5 px-3">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('th-TH')}
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-semibold text-pink-600">{log.action}</span>
                  </td>
                  <td className="py-2 px-3 text-sky-700">
                    {log.operator}
                  </td>
                  <td className="py-2 px-3 text-slate-700 font-sans text-xs">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
