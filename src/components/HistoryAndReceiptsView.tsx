import React, { useState } from 'react';
import { 
  ReceiptText, 
  Search, 
  Eye, 
  CheckCircle, 
  X, 
  FileSpreadsheet, 
  Printer, 
  ShieldCheck,
  Heart,
  Trash2
} from 'lucide-react';
import { PaymentTransaction, Member, SystemConfig } from '../types';
import { exportTransactionsToCSV } from '../utils/storage';

interface HistoryAndReceiptsViewProps {
  transactions: PaymentTransaction[];
  members: Member[];
  config: SystemConfig;
  isAdmin?: boolean;
  onRequireAdmin?: () => void;
  onViewReceipt: (transaction: PaymentTransaction) => void;
  onDeleteTransaction?: (transactionId: string) => void;
}

export const HistoryAndReceiptsView: React.FC<HistoryAndReceiptsViewProps> = ({
  transactions,
  members,
  config,
  isAdmin,
  onRequireAdmin,
  onViewReceipt,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('ALL');
  const [viewingSlipImage, setViewingSlipImage] = useState<string | null>(null);
  const [confirmDeleteTxn, setConfirmDeleteTxn] = useState<PaymentTransaction | null>(null);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.billTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.transactionRef.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMember = selectedMemberFilter === 'ALL' || t.memberId === selectedMemberFilter;

    return matchesSearch && matchesMember;
  });

  const totalCollectedInView = filteredTransactions
    .filter((t) => t.status === 'APPROVED')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions, members);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 font-['Prompt',sans-serif]">
      
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2 font-['Mitr',sans-serif]">
            <ReceiptText className="w-6 h-6 text-pink-500" />
            ประวัติการโอนเงิน & ใบเสร็จรับเงิน
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            บันทึกการโอนเข้า ธ.กรุงไทย 8420786446 ของสมาชิกทุกคนอย่างละเอียด
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-teal-600" />
          ส่งออกรายงาน Excel / CSV
        </button>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-pink-100 p-4 rounded-3xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-400">จำนวนครั้งที่โอนชำระ</span>
          <p className="text-2xl font-extrabold text-slate-800 mt-1 font-['Mitr',sans-serif]">{transactions.length} รายการ</p>
        </div>
        <div className="bg-white border border-teal-100 p-4 rounded-3xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-400">ยอดเงินที่ได้รับรวม</span>
          <p className="text-2xl font-extrabold text-teal-600 mt-1 font-['Mitr',sans-serif]">
            ฿{totalCollectedInView.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white border border-sky-100 p-4 rounded-3xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-400">บัญชีรับเงิน</span>
          <p className="text-xl font-bold text-sky-800 mt-1 font-mono">
            KTB 8420786446
          </p>
        </div>
      </div>

      {/* Search and Member Filter */}
      <div className="bg-white border border-pink-100 p-3.5 rounded-3xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อสมาชิก, เลขที่ใบเสร็จ, งวดเดือน, รหัสอ้างอิง..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-400"
          />
        </div>

        <select
          value={selectedMemberFilter}
          onChange={(e) => setSelectedMemberFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-2xl px-3 py-2.5 focus:outline-none focus:border-pink-400 cursor-pointer font-medium"
        >
          <option value="ALL">สมาชิกทุกคน ({members.length} คน)</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Transactions Table / Cards */}
      <div className="bg-white border border-pink-100 rounded-3xl overflow-hidden shadow-2xs">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">เลขที่ใบเสร็จ</th>
                <th className="py-3 px-4">สมาชิก</th>
                <th className="py-3 px-4">รายการชำระ MBA25 BANK</th>
                <th className="py-3 px-4">ยอดเงิน</th>
                <th className="py-3 px-4">วัน-เวลาที่โอน</th>
                <th className="py-3 px-4">ธนาคาร & รหัสอ้างอิง</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-right">เอกสาร</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-pink-50/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-pink-600">
                    {txn.receiptNumber}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {txn.memberName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {txn.billTitle}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-teal-600 text-sm">
                    ฿{txn.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {txn.paidAt}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-800 font-medium block">{txn.bankName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Ref: {txn.transactionRef}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3 text-teal-500" />
                      อนุมัติแล้ว
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {txn.slipImage && (
                        <button
                          onClick={() => setViewingSlipImage(txn.slipImage || null)}
                          title="ดูรูปสลิป"
                          className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-sky-600 border border-slate-200 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onViewReceipt(txn)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-xs shadow-2xs cursor-pointer"
                      >
                        <Printer className="w-3 h-3" />
                        ใบเสร็จ
                      </button>
                      {isAdmin && onDeleteTransaction && (
                        <button
                          onClick={() => setConfirmDeleteTxn(txn)}
                          title="ล้าง/ลบรายการโอนเงินนี้ (สิทธิ์แอดมิน)"
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredTransactions.map((txn) => (
            <div key={txn.id} className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-xs text-pink-600">{txn.receiptNumber}</span>
                <span className="font-extrabold text-teal-600 text-sm">
                  ฿{txn.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{txn.memberName}</p>
                <p className="text-xs text-slate-500">{txn.billTitle}</p>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>{txn.paidAt}</span>
                <span>{txn.bankName}</span>
              </div>
              <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  อนุมัติแล้ว
                </span>
                <div className="flex items-center gap-2">
                  {txn.slipImage && (
                    <button
                      onClick={() => setViewingSlipImage(txn.slipImage || null)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 text-sky-700 text-xs font-semibold cursor-pointer"
                    >
                      ดูสลิป
                    </button>
                  )}
                  <button
                    onClick={() => onViewReceipt(txn)}
                    className="px-3 py-1 rounded-xl bg-pink-500 text-white text-xs font-bold shadow-2xs cursor-pointer"
                  >
                    ดูใบเสร็จ
                  </button>
                  {isAdmin && onDeleteTransaction && (
                    <button
                      onClick={() => setConfirmDeleteTxn(txn)}
                      title="ล้างรายการโอนนี้"
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12 bg-white border border-pink-100 rounded-3xl text-slate-400">
          <Heart className="w-10 h-10 mx-auto mb-2 text-pink-300" />
          <p className="font-semibold text-slate-700">ไม่พบประวัติการชำระเงินตามเงื่อนไข</p>
        </div>
      )}

      {/* Slip Image Viewer */}
      {viewingSlipImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative max-w-sm sm:max-w-md w-full bg-white rounded-3xl p-5 shadow-2xl border border-pink-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-500" />
                รูปสลิปหลักฐานการโอนเงิน (Krungthai 8420786446)
              </span>
              <button
                onClick={() => setViewingSlipImage(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 border border-slate-200">
              <img
                src={viewingSlipImage}
                alt="Slip Preview"
                className="max-h-[480px] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Transaction */}
      {confirmDeleteTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm font-['Prompt',sans-serif]">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-slate-800 border border-rose-100 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-800 font-['Mitr',sans-serif]">
              ลบประวัติการโอนเงิน?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1.5 leading-relaxed">
              ต้องการลบประวัติเลขที่ <strong>{confirmDeleteTxn.receiptNumber}</strong> ของ <strong>{confirmDeleteTxn.memberName}</strong> ยอด ฿{confirmDeleteTxn.amount.toLocaleString()}?
              <br />
              ระบบจะคืนสถานะบิลกลับเป็น <span className="text-amber-600 font-bold">"รอชำระ"</span> ให้กับสมาชิก
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
                  if (onDeleteTransaction) {
                    onDeleteTransaction(confirmDeleteTxn.id);
                  }
                  setConfirmDeleteTxn(null);
                }}
                className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-rose-200 cursor-pointer"
              >
                ยืนยันลบรายการ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
