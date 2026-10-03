import React, { useRef } from 'react';
import { PaymentTransaction, Member, SystemConfig } from '../types';
import { X, Printer, CheckCircle, Heart } from 'lucide-react';
import { maskSensitiveData } from '../utils/storage';

interface ReceiptModalProps {
  transaction: PaymentTransaction | null;
  member?: Member;
  config: SystemConfig;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  member,
  config,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto font-['Prompt',sans-serif]">
      <div className="relative w-full max-w-xl bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 print:m-0 print:p-0 print:shadow-none print:w-full print:max-w-none print:absolute print:inset-0 border border-pink-100">
        
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-white fill-white" />
            <span className="font-bold text-sm">ใบเสร็จรับเงิน MBA25 BANK (E-Receipt)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-pink-600 hover:bg-pink-50 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              พิมพ์ / บันทึก PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div ref={receiptRef} className="p-8 print:p-10 space-y-6 bg-white">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-pink-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500 flex items-center justify-center text-white font-bold text-base shadow-xs">
                  🏦
                </div>
                <h2 className="text-lg font-bold text-slate-900 font-['Mitr',sans-serif]">{config.orgName}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">บัญชีรับเงิน: ธนาคารกรุงไทย เลขที่ 8420786446</p>
              <p className="text-xs text-slate-500">กองทุนกลาง MBA25 BANK</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold rounded-full mb-1">
                ชำระเงินเรียบร้อย
              </span>
              <p className="text-base font-bold text-slate-800">ใบเสร็จรับเงิน</p>
              <p className="text-xs font-mono text-slate-500">เลขที่: {transaction.receiptNumber}</p>
              <p className="text-xs text-slate-400">วันที่: {transaction.paidAt}</p>
            </div>
          </div>

          {/* Member & Transfer Info */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-pink-50/40 border border-pink-100 text-xs">
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">ได้รับเงินจากสมาชิก</p>
              <p className="font-extrabold text-slate-900 text-sm font-['Mitr',sans-serif]">{transaction.memberName}</p>
              <p className="text-slate-600">รหัสสมาชิก: {member?.memberCode || transaction.memberId}</p>
              <p className="text-slate-600">สังกัด: สมาชิก MBA25</p>
              <p className="text-slate-600">เบอร์โทร: {maskSensitiveData(member?.phone || '', 'phone', config.pdpaMasking)}</p>
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">ข้อมูลการโอนเงิน</p>
              <p className="text-slate-700">โอนเข้า: <strong className="text-sky-800">ธ.กรุงไทย 8420786446</strong></p>
              <p className="text-slate-700">ธนาคาร/ช่องทาง: <span className="font-medium text-slate-800">{transaction.bankName || 'ธ.กรุงไทย'}</span></p>
              <p className="text-slate-700 font-mono text-[11px]">รหัสอ้างอิง: {transaction.transactionRef}</p>
              {transaction.aiNotes && (
                <p className="text-slate-600 text-[11px]">บันทึก: {transaction.aiNotes}</p>
              )}
              <p className="text-teal-700 flex items-center gap-1 mt-1 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                บันทึกยอดชำระเงินเรียบร้อย
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 text-xs font-bold text-slate-600 uppercase">
                <th className="py-2.5">ลำดับ</th>
                <th className="py-2.5">รายการ</th>
                <th className="py-2.5 text-right">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              <tr>
                <td className="py-3 text-slate-400 font-mono">01</td>
                <td className="py-3 font-semibold text-slate-800">
                  {transaction.billTitle}
                  <div className="text-[11px] text-slate-400 font-normal">รหัสบิล: {transaction.billId}</div>
                </td>
                <td className="py-3 text-right font-bold text-slate-900 text-sm">
                  ฿{transaction.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-100">
                <td colSpan={2} className="py-3 text-right font-bold text-slate-700 text-xs">
                  รวมเงินทั้งสิ้น (Total Net):
                </td>
                <td className="py-3 text-right font-extrabold text-base text-pink-600 font-['Mitr',sans-serif]">
                  ฿{transaction.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Stamp & Signature */}
          <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <p className="font-semibold text-slate-600">เอกสารออกโดยระบบอิเล็กทรอนิกส์</p>
              <p>กองกลาง MBA25 BANK (ธ.กรุงไทย 8420786446)</p>
              <p>งวดเดือน ตุลาคม 2026 ถึง มีนาคม 2028 (งวดละ 300.-)</p>
            </div>

            <div className="text-center w-44">
              <div className="h-10 border-b border-dashed border-pink-300 flex items-center justify-center">
                <span className="text-xs font-serif italic text-pink-600 font-bold tracking-wider">
                  [ MBA25 Verified ]
                </span>
              </div>
              <p className="text-xs font-bold text-slate-700 mt-1">ผู้ดูแลระบบ MBA25 BANK</p>
              <p className="text-[10px] text-slate-400">ธ.กรุงไทย 8420786446</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span>* สามารถสั่งพิมพ์หรือบันทึกเป็น PDF เพื่อเก็บเป็นหลักฐาน</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
          >
            ปิด
          </button>
        </div>

      </div>
    </div>
  );
};
