import React, { useState } from 'react';
import { 
  CreditCard, 
  PlusCircle, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Copy, 
  Check, 
  UploadCloud, 
  Filter, 
  X, 
  FileCheck2, 
  Users, 
  Sparkles, 
  Heart 
} from 'lucide-react';
import { Bill, Member, SystemConfig } from '../types';
import { ROOM_MONTHS, MONTHLY_RATE } from '../utils/mockData';

interface BillsAndPaymentViewProps {
  bills: Bill[];
  members: Member[];
  config: SystemConfig;
  isAdmin: boolean;
  onRequireAdmin: () => void;
  onCreateBill: (billData: {
    title: string;
    description: string;
    category: string;
    amount: number;
    dueDate: string;
    targetMemberIds: string[];
  }) => void;
  onConfirmPayment: (bill: Bill) => void;
}

export const BillsAndPaymentView: React.FC<BillsAndPaymentViewProps> = ({
  bills,
  members,
  config,
  isAdmin,
  onRequireAdmin,
  onCreateBill,
  onConfirmPayment,
}) => {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'PAID' | 'ALL'>('PENDING');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL');
  
  // Pay Modal state (No QR Code)
  const [payingBill, setPayingBill] = useState<Bill | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Create Bill Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRoomMonth, setSelectedRoomMonth] = useState(ROOM_MONTHS[0].name);
  const [billAmount, setBillAmount] = useState<number>(MONTHLY_RATE); // 300.-
  const [billDueDate, setBillDueDate] = useState(ROOM_MONTHS[0].dueDate);
  const [billTargetType, setBillTargetType] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');

  // Filter bills
  const filteredBills = bills.filter((b) => {
    let matchesStatus = true;
    if (activeTab === 'PENDING') {
      matchesStatus = b.status === 'PENDING' || b.status === 'OVERDUE' || b.status === 'REVIEW_NEEDED';
    } else if (activeTab === 'PAID') {
      matchesStatus = b.status === 'PAID';
    }

    let matchesMonth = true;
    if (selectedMonthFilter !== 'ALL') {
      matchesMonth = b.title.includes(selectedMonthFilter);
    }

    return matchesStatus && matchesMonth;
  });

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2200);
  };

  const handleFormCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    if (billAmount <= 0) return;

    let targetMemberIds: string[] = [];
    if (billTargetType === 'ALL') {
      targetMemberIds = members.map((m) => m.id);
    } else {
      targetMemberIds = [selectedMemberId];
    }

    onCreateBill({
      title: `MBA25 BANK เดือน ${selectedRoomMonth}`,
      description: `งวด ${selectedRoomMonth} ยอด ฿${billAmount} (โอนเข้า ธ.กรุงไทย 8420786446)`,
      category: 'MBA25 BANK',
      amount: Number(billAmount),
      dueDate: billDueDate,
      targetMemberIds,
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 font-['Prompt',sans-serif]">
      
      {/* Top Banner: Krungthai Bank Highlight Card */}
      <div className="bg-gradient-to-r from-sky-50 via-teal-50 to-pink-50 border-2 border-sky-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-700">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping"></span>
              ช่องทางการชำระเงิน MBA25 BANK (23 สมาชิก)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight font-['Mitr',sans-serif]">
              ธนาคารกรุงไทย เลขที่บัญชี <span className="text-sky-700 underline decoration-sky-300">8420786446</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              ยอดชำระ <strong>เดือนละ 300 บาท</strong> งวดประจำเดือน <strong>ตุลาคม 2026 ถึง มีนาคม 2028</strong>
            </p>
          </div>

          {/* Quick Copy Account Box */}
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-sky-200 shadow-2xs self-start md:self-auto">
            <div className="text-left pr-2 border-r border-slate-200">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">ธนาคารกรุงไทย (KTB)</span>
              <span className="font-mono text-base font-extrabold text-sky-800">8420786446</span>
            </div>
            <button
              onClick={() => handleCopyAccount('8420786446')}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                copiedAccount
                  ? 'bg-teal-500 text-white shadow-xs'
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200'
              }`}
            >
              {copiedAccount ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAccount ? 'คัดลอกแล้ว!' : 'คัดลอกเลขบัญชี'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Bar & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 font-['Mitr',sans-serif]">
            <CreditCard className="w-5 h-5 text-pink-500" />
            รายการจ่ายชำระ MBA25 BANK (เดือนละ 300 บาท)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            งวดตุลาคม 2026 - มีนาคม 2028 ของสมาชิก 23 คน
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAdmin) {
              onRequireAdmin();
            } else {
              setIsCreateModalOpen(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-pink-200 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          ออกบิล MBA25 BANK งวดใหม่
        </button>
      </div>

      {/* Tabs and Month Filter Bar */}
      <div className="bg-white border border-pink-100 p-3.5 rounded-3xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-2xs">
        
        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-semibold ${
              activeTab === 'PENDING' 
                ? 'bg-amber-400 text-slate-900 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รอชำระ ({bills.filter((b) => b.status !== 'PAID').length})
          </button>
          <button
            onClick={() => setActiveTab('PAID')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-semibold ${
              activeTab === 'PAID' 
                ? 'bg-teal-500 text-white shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ชำระแล้ว ({bills.filter((b) => b.status === 'PAID').length})
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-semibold ${
              activeTab === 'ALL' 
                ? 'bg-slate-700 text-white shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({bills.length})
          </button>
        </div>

        {/* Room Months Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">งวดเดือน:</span>
          <select
            value={selectedMonthFilter}
            onChange={(e) => setSelectedMonthFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-2xl px-3 py-2 focus:outline-none focus:border-pink-400 cursor-pointer font-medium"
          >
            <option value="ALL">ทุกล่วงหน้า (ต.ค. 2026 - มี.ค. 2028)</option>
            {ROOM_MONTHS.map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Bills Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredBills.map((bill) => {
          const isPaid = bill.status === 'PAID';
          const isOverdue = bill.status === 'OVERDUE';
          const memberObj = members.find((m) => m.id === bill.memberId);

          return (
            <div
              key={bill.id}
              className={`bg-white border rounded-3xl p-5 flex flex-col justify-between transition-all shadow-2xs hover:shadow-md ${
                isPaid 
                  ? 'border-teal-100 bg-teal-50/20' 
                  : isOverdue 
                  ? 'border-rose-200 bg-rose-50/30' 
                  : 'border-pink-100 hover:border-pink-300'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={memberObj?.avatar}
                      alt={bill.memberName}
                      className="w-9 h-9 rounded-2xl object-cover bg-pink-100 p-0.5 border border-pink-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{bill.memberName}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{memberObj?.memberCode || 'MBA'}</span>
                    </div>
                  </div>

                  {isPaid ? (
                    <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-500" /> ชำระแล้ว
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> รอชำระ
                    </span>
                  )}
                </div>

                {/* Title & Info */}
                <h3 className="font-bold text-slate-800 text-sm leading-snug">{bill.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{bill.description}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>กำหนดชำระ:</span>
                    <span className="font-medium text-slate-700">{bill.dueDate} (วันสิ้นเดือน)</span>
                  </div>
                  {isPaid && bill.paidAt && (
                    <div className="flex justify-between text-teal-600 font-medium">
                      <span>วันที่โอนชำระ:</span>
                      <span>{bill.paidAt}</span>
                    </div>
                  )}
                </div>

                {/* Amount Banner (฿300.00) */}
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">ยอดชำระ</span>
                  <span className={`text-lg font-extrabold ${isPaid ? 'text-teal-600' : 'text-pink-600'}`}>
                    ฿{bill.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {!isPaid ? (
                  <button
                    onClick={() => setPayingBill(bill)}
                    className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    โอนจ่ายชำระ 300.-
                  </button>
                ) : (
                  <div className="flex items-center justify-center py-2 text-xs font-semibold text-teal-700 bg-teal-50 rounded-2xl border border-teal-200">
                    <FileCheck2 className="w-4 h-4 mr-1.5 text-teal-500" />
                    ชำระเงินเรียบร้อยแล้ว
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {filteredBills.length === 0 && (
        <div className="text-center py-12 bg-white border border-pink-100 rounded-3xl text-slate-400">
          <Heart className="w-10 h-10 mx-auto mb-2 text-pink-300" />
          <p className="font-semibold text-slate-700">ไม่พบรายการบิล MBA25 BANK ในงวดที่เลือก</p>
        </div>
      )}

      {/* Pay Modal (No QR CODE) */}
      {payingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto font-['Prompt',sans-serif]">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-slate-800 my-8 border border-pink-100 animate-fade-in">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-sky-500 flex items-center justify-center text-white font-bold shadow-md shadow-sky-200">
                  🏦
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">โอนเงินเข้า MBA25 BANK</h3>
                  <p className="text-[11px] text-slate-400">ธนาคารกรุงไทย เลขที่ 8420786446</p>
                </div>
              </div>
              <button
                onClick={() => setPayingBill(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill Summary */}
            <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100 text-xs space-y-1 mb-4">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{payingBill.title}</span>
                <span className="text-pink-600 font-extrabold text-base">
                  ฿{payingBill.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">สมาชิกผู้โอน: {payingBill.memberName}</p>
            </div>

            {/* Bank Transfer Details Box (Clean & Prominent) */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-sky-50 via-teal-50/30 to-pink-50/30 border-2 border-sky-200 text-center space-y-3 shadow-inner">
              <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-bold text-xs inline-block">
                ธนาคารกรุงไทย (Krungthai Bank)
              </span>

              <div>
                <p className="text-xs text-slate-500 font-medium">เลขที่บัญชีสำหรับโอนเงิน</p>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span className="text-2xl sm:text-3xl font-mono font-extrabold text-sky-900 tracking-wider">
                    8420786446
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleCopyAccount('8420786446')}
                className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  copiedAccount
                    ? 'bg-teal-500 text-white'
                    : 'bg-white hover:bg-sky-50 text-sky-700 border border-sky-300'
                }`}
              >
                {copiedAccount ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedAccount ? 'คัดลอกเลขบัญชี 8420786446 สำเร็จแล้ว!' : 'แตะเพื่อคัดลอกเลขที่บัญชี 8420786446'}
              </button>

              <p className="text-[11px] text-slate-500">
                ชื่อบัญชี: บัญชีกองกลาง MBA25 BANK (ยอด ฿{payingBill.amount.toLocaleString()})
              </p>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1 leading-relaxed">
              <p className="font-bold text-slate-700">ขั้นตอนการชำระเงิน:</p>
              <p>1. โอนเงินผ่านแอปธนาคารของคุณเข้าบัญชี <strong>กรุงไทย 8420786446</strong> ยอด ฿{payingBill.amount.toLocaleString()}</p>
              <p>2. เมื่อโอนเงินเรียบร้อยแล้ว แตะปุ่มยืนยันด้านล่างเพื่อตัดยอดบิลทันที</p>
            </div>

            {/* Confirmation CTA */}
            <div className="mt-5 space-y-2">
              <button
                onClick={() => {
                  const billToPay = payingBill;
                  setPayingBill(null);
                  onConfirmPayment(billToPay);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-200 transition-all cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                โอนเงินเรียบร้อยแล้ว ยืนยันการชำระเงิน (ตัดยอดทันที)
              </button>

              <button
                onClick={() => setPayingBill(null)}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer text-center"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Create Bill Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto font-['Prompt',sans-serif]">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-slate-800 my-8 border border-pink-100 animate-fade-in">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-pink-500" />
                ออกบิล MBA25 BANK งวดใหม่
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormCreateBill} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">เลือกงวดเดือน</label>
                <select
                  value={selectedRoomMonth}
                  onChange={(e) => {
                    setSelectedRoomMonth(e.target.value);
                    const matched = ROOM_MONTHS.find((m) => m.name === e.target.value);
                    if (matched) setBillDueDate(matched.dueDate);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none focus:border-pink-400 cursor-pointer"
                >
                  {ROOM_MONTHS.map((m) => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">ยอดเงิน (บาท)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={billAmount}
                    onChange={(e) => setBillAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-slate-800 font-bold text-pink-600 focus:outline-none focus:border-pink-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">กำหนดชำระภายใน (วันสิ้นเดือน)</label>
                  <input
                    type="date"
                    required
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-slate-800 focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>

              {/* Target Members Selection */}
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">สมาชิกผู้รับบิล</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setBillTargetType('ALL')}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      billTargetType === 'ALL'
                        ? 'bg-pink-50 border-pink-400 text-pink-700 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <Users className="w-4 h-4 mx-auto mb-1 text-pink-500" />
                    สมาชิกทุกคน (23 คน)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillTargetType('SPECIFIC')}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      billTargetType === 'SPECIFIC'
                        ? 'bg-sky-50 border-sky-400 text-sky-700 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <Users className="w-4 h-4 mx-auto mb-1 text-sky-500" />
                    เลือกสมาชิกเฉพาะคน
                  </button>
                </div>

                {billTargetType === 'SPECIFIC' && (
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-slate-800 focus:outline-none focus:border-pink-400 cursor-pointer"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.memberCode})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-medium cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold rounded-2xl shadow-md shadow-pink-200 cursor-pointer"
                >
                  ออกบิลเรียกเก็บ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
