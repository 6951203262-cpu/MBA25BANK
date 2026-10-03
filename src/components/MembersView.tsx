import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  X, 
  FileText, 
  UserPlus, 
  Heart, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { Member, Bill, PaymentTransaction, SystemConfig } from '../types';
import { maskSensitiveData } from '../utils/storage';

interface MembersViewProps {
  members: Member[];
  bills: Bill[];
  transactions: PaymentTransaction[];
  config: SystemConfig;
  isAdmin: boolean;
  onRequireAdmin: () => void;
  onAddMember: (newMember: Omit<Member, 'id' | 'totalPaid' | 'totalPending'>) => void;
  onPayBillForMember: (bill: Bill) => void;
  onViewReceipt: (transaction: PaymentTransaction) => void;
  onResetMemberPayments: (memberId: string) => void;
  onResetAllExcept?: (whitelistMemberNames: string[]) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  bills,
  transactions,
  config,
  isAdmin,
  onRequireAdmin,
  onAddMember,
  onPayBillForMember,
  onViewReceipt,
  onResetMemberPayments,
  onResetAllExcept,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HAS_DEBT' | 'CLEAR'>('ALL');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmResetMember, setConfirmResetMember] = useState<Member | null>(null);
  const [confirmDeleteTxn, setConfirmDeleteTxn] = useState<PaymentTransaction | null>(null);
  const [isResetAllModalOpen, setIsResetAllModalOpen] = useState(false);
  const [whitelistNames, setWhitelistNames] = useState<string[]>(['ดาย', 'เดย์', 'เตย']);

  // New member form without room details
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');

  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);

    let matchesStatus = true;
    if (statusFilter === 'HAS_DEBT') {
      matchesStatus = member.totalPending > 0;
    } else if (statusFilter === 'CLEAR') {
      matchesStatus = member.totalPending === 0;
    }

    return matchesSearch && matchesStatus;
  });

  const totalMembersWithDebt = members.filter((m) => m.totalPending > 0).length;
  const totalDebtAmount = members.reduce((sum, m) => sum + m.totalPending, 0);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    if (!newMemberName.trim()) return;

    onAddMember({
      memberCode: `MBA-${(members.length + 1).toString().padStart(2, '0')}`,
      name: newMemberName.trim(),
      phone: newMemberPhone.trim() || '08x-xxx-xxxx',
      email: `${newMemberName.trim()}@mba25.com`,
      lineId: `mba_${newMemberName.trim()}`,
      group: 'สมาชิก MBA25',
      avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(newMemberName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc`,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      bankAccount: 'xxx-x-xxxxx-x',
    });

    setIsAddModalOpen(false);
    setNewMemberName('');
    setNewMemberPhone('');
  };

  const memberBills = selectedMember ? bills.filter((b) => b.memberId === selectedMember.id) : [];
  const memberPendingBills = memberBills.filter((b) => b.status === 'PENDING' || b.status === 'OVERDUE' || b.status === 'REVIEW_NEEDED');
  const memberTransactions = selectedMember ? transactions.filter((t) => t.memberId === selectedMember.id) : [];

  return (
    <div className="space-y-6 pb-20 lg:pb-8 font-['Prompt',sans-serif]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2 font-['Mitr',sans-serif]">
            <Users className="w-6 h-6 text-pink-500" />
            รายชื่อสมาชิก MBA25 BANK ({members.length} คน)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            สรุปสถานะการชำระเงินรายบุคคล งวดตุลาคม 2026 - มีนาคม 2028 (เดือนละ 300.-)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {isAdmin && onResetAllExcept && (
            <button
              onClick={() => setIsResetAllModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
              title="ล้างยอดชำระของทุกคน (กำหนดข้อยกเว้น)"
            >
              <RotateCcw className="w-4 h-4 text-amber-600" />
              ล้างยอดทุกคน (ยกเว้น...)
            </button>
          )}

          <button
            onClick={() => {
              if (!isAdmin) {
                onRequireAdmin();
              } else {
                setIsAddModalOpen(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-pink-200 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            เพิ่มสมาชิกใหม่
          </button>
        </div>
      </div>

      {/* Mini Stats (Clean & Pastel) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-pink-100 p-4 rounded-3xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-400">สมาชิกทั้งหมด</span>
          <p className="text-2xl font-extrabold text-slate-800 mt-1 font-['Mitr',sans-serif]">{members.length} คน</p>
        </div>
        <div className="bg-white border border-amber-100 p-4 rounded-3xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-400">สมาชิกที่รอชำระงวดนี้</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1 font-['Mitr',sans-serif]">{totalMembersWithDebt} คน</p>
        </div>
        <div className="bg-white border border-teal-100 p-4 rounded-3xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-400">ยอดรอชำระรวม</span>
          <p className="text-2xl font-extrabold text-pink-600 mt-1 font-['Mitr',sans-serif]">
            ฿{totalDebtAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-pink-100 p-3.5 rounded-3xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-2xs">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อสมาชิก 23 คน (เช่น ท็อป, เหมียว, จูน, น้ำเหมย, เตย...)"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-400 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ทั้งหมด ({members.length})
          </button>
          <button
            onClick={() => setStatusFilter('HAS_DEBT')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              statusFilter === 'HAS_DEBT' ? 'bg-amber-400 text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            รอชำระ
          </button>
          <button
            onClick={() => setStatusFilter('CLEAR')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              statusFilter === 'CLEAR' ? 'bg-teal-500 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ชำระครบ
          </button>
        </div>

      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMembers.map((member) => {
          const hasDebt = member.totalPending > 0;
          return (
            <div
              key={member.id}
              className="bg-white border border-pink-100 rounded-3xl p-5 hover:border-pink-300 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-2xl object-cover bg-pink-50 p-1 border border-pink-200 shadow-2xs"
                    />
                    <div>
                      <h3 className="font-bold text-slate-800 text-base font-['Mitr',sans-serif] leading-snug">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded">
                          {member.memberCode}
                        </span>
                        <span className="text-[10px] text-slate-400">MBA25</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    hasDebt 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-teal-50 text-teal-700 border-teal-200'
                  }`}>
                    {hasDebt ? 'รอชำระ' : 'ชำระแล้ว'}
                  </span>
                </div>

                {/* Balance Info */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">รอชำระงวดนี้</span>
                    <span className={`text-base font-extrabold ${hasDebt ? 'text-amber-600' : 'text-slate-400'}`}>
                      ฿{member.totalPending.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">ชำระแล้วสะสม</span>
                    <span className="text-sm font-bold text-teal-600">
                      ฿{member.totalPaid.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedMember(member)}
                  className="w-full py-2 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  ดูรายละเอียด & ประวัติการโอน
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 bg-white border border-pink-100 rounded-3xl text-slate-400">
          <Heart className="w-10 h-10 mx-auto mb-2 text-pink-300" />
          <p className="font-semibold text-slate-700">ไม่พบชื่อสมาชิกตามที่พิมพ์</p>
        </div>
      )}

      {/* Member Detail Drawer / Modal (No room details) */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto font-['Prompt',sans-serif]">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 text-slate-800 my-8 border border-pink-100 animate-fade-in">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  className="w-14 h-14 rounded-2xl object-cover bg-pink-50 p-1 border-2 border-pink-200"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-800 font-['Mitr',sans-serif]">{selectedMember.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="font-mono text-sky-700 font-bold bg-sky-50 px-1.5 rounded border border-sky-200">
                      {selectedMember.memberCode}
                    </span>
                    <span>•</span>
                    <span>สมาชิก MBA25 BANK</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dues Status */}
            <div className="grid grid-cols-2 gap-3 py-4 border-b border-slate-100 text-xs">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-amber-800 font-medium block">ยอดค้างชำระงวดนี้</span>
                <span className="font-extrabold text-amber-700 text-base">
                  ฿{selectedMember.totalPending.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200">
                <span className="text-teal-800 font-medium block">ชำระแล้วสะสม</span>
                <span className="font-extrabold text-teal-700 text-base">
                  ฿{selectedMember.totalPaid.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Pending Invoices */}
            <div className="mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                รายการที่รอชำระ ({memberPendingBills.length})
              </h4>

              {memberPendingBills.length === 0 ? (
                <p className="text-xs text-teal-700 py-3 bg-teal-50 rounded-2xl text-center font-semibold border border-teal-100">
                  🎉 สมาชิกท่านนี้ไม่มีรายการค้างชำระ
                </p>
              ) : (
                <div className="space-y-2">
                  {memberPendingBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{bill.title}</p>
                        <p className="text-[11px] text-slate-400">ครบกำหนด: {bill.dueDate}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-pink-600">
                          ฿{bill.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedMember(null);
                            onPayBillForMember(bill);
                          }}
                          className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                        >
                          ชำระเงิน
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment History */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                ประวัติการชำระเงินที่ผ่านมา ({memberTransactions.length})
              </h4>

              {memberTransactions.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 bg-slate-50 rounded-2xl text-center">
                  ยังไม่มีประวัติการโอนเงินที่บันทึกไว้
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {memberTransactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{txn.billTitle}</p>
                        <p className="text-[10px] text-slate-400">{txn.paidAt} • {txn.bankName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal-600">
                          ฿{txn.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          onClick={() => onViewReceipt(txn)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-semibold cursor-pointer"
                        >
                          ใบเสร็จ
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setConfirmDeleteTxn(txn)}
                            title="ลบ/ยกเลิกรายการโอนนี้ (สิทธิ์แอดมิน)"
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Reset Payments Action */}
            <div className="mt-5 p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-rose-900">จัดการข้อมูลการโอนเงิน (สิทธิ์แอดมิน)</h5>
                    <p className="text-[11px] text-rose-600">
                      ล้างประวัติการโอนเงินทั้งหมด และปรับสถานะบิลของ {selectedMember.name} กลับเป็นรอชำระ
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!isAdmin) {
                      onRequireAdmin();
                    } else {
                      setConfirmResetMember(selectedMember);
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  ล้างข้อมูลการโอนเงิน
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-semibold cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add Member Modal (Without Room Details) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto font-['Prompt',sans-serif]">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-slate-800 my-8 border border-pink-100 animate-fade-in">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-pink-500" />
                เพิ่มสมาชิก MBA25
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">ชื่อสมาชิก *</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="เช่น ท็อป, เหมียว, นัท"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-slate-800 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">เบอร์โทรศัพท์ (ถ้ามี)</label>
                <input
                  type="text"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  placeholder="08x-xxx-xxxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-slate-800 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-medium cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold rounded-2xl shadow-md shadow-pink-200 cursor-pointer"
                >
                  บันทึกสมาชิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Reset Member Payments */}
      {confirmResetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto font-['Prompt',sans-serif]">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-slate-800 border border-rose-100 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-800 font-['Mitr',sans-serif]">
              ยืนยันการล้างข้อมูลการโอนเงิน?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1.5 leading-relaxed">
              คุณกำลังจะล้างประวัติการโอนเงินของ <strong className="text-rose-600">{confirmResetMember.name}</strong> ({confirmResetMember.memberCode})
              <br />
              ระบบจะปรับเปลี่ยนสถานะบิลที่ชำระแล้วให้กลับเป็น <span className="text-amber-600 font-bold">"รอชำระ"</span> และลบรายการบันทึกโอนเงินทั้งหมดของสมาชิกท่านนี้
            </p>

            <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
              <div className="flex justify-between">
                <span>ยอดเงินชำระสะสมที่จะถูกรีเซ็ต:</span>
                <span className="font-extrabold text-rose-600">฿{confirmResetMember.totalPaid.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>ผู้ดำเนินการ:</span>
                <span className="font-bold text-slate-700">แอดมินระบบ MBA25 BANK</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setConfirmResetMember(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = confirmResetMember.id;
                  onResetMemberPayments(targetId);
                  setConfirmResetMember(null);
                  setSelectedMember(null);
                }}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-rose-200 cursor-pointer"
              >
                ยืนยันล้างข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Single Transaction */}
      {confirmDeleteTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto font-['Prompt',sans-serif]">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-slate-800 border border-rose-100 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-800 font-['Mitr',sans-serif]">
              ลบรายการบันทึกการโอนเงิน?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1.5 leading-relaxed">
              ต้องการลบประวัติเลขที่ <strong>{confirmDeleteTxn.receiptNumber}</strong> ของ <strong>{confirmDeleteTxn.memberName}</strong> ยอด ฿{confirmDeleteTxn.amount.toLocaleString()}?
              <br />
              ระบบจะคืนสถานะบิลที่เกี่ยวข้องกลับเป็น "รอชำระ"
            </p>

            <div className="mt-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setConfirmDeleteTxn(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTransaction(confirmDeleteTxn.id);
                  setConfirmDeleteTxn(null);
                  setSelectedMember(null);
                }}
                className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-rose-200 cursor-pointer"
              >
                ยืนยันลบรายการ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Batch Reset Payments Except Whitelist */}
      {isResetAllModalOpen && onResetAllExcept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto font-['Prompt',sans-serif]">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-slate-800 border border-amber-100 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-800 font-['Mitr',sans-serif]">
              ล้างยอดชำระของสมาชิกทุกคน
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1 leading-relaxed">
              ติ๊กเลือกสมาชิกที่<strong>ต้องการคงยอดชำระไว้</strong> (ไม่ล้างยอด):
            </p>

            <div className="mt-3 max-h-52 overflow-y-auto space-y-1 p-2 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              {members.map((m) => {
                const isChecked = whitelistNames.includes(m.name);
                return (
                  <label
                    key={m.id}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                      isChecked ? 'bg-amber-100/70 text-amber-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWhitelistNames([...whitelistNames, m.name]);
                          } else {
                            setWhitelistNames(whitelistNames.filter((name) => name !== m.name));
                          }
                        }}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <span>{m.name} ({m.memberCode})</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isChecked ? 'คงยอดชำระไว้' : 'ล้างเป็นรอชำระ'}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-3 p-3 bg-amber-50/80 rounded-2xl border border-amber-200/60 text-[11px] text-amber-800 leading-relaxed">
              💡 ผลลัพธ์: สมาชิก {members.length - whitelistNames.length} คนจะถูกล้างยอดชำระกลับเป็น 0.- (รอชำระ 300.-) ส่วนสมาชิก {whitelistNames.length} คน ({whitelistNames.join(', ') || 'ไม่มี'}) จะคงสถานะชำระแล้วตามเดิม
            </div>

            <div className="mt-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsResetAllModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetAllExcept(whitelistNames);
                  setIsResetAllModalOpen(false);
                }}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-amber-200 cursor-pointer"
              >
                ยืนยันล้างข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
