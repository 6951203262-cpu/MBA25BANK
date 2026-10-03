import React from 'react';
import { X, Bell, Clock, CheckCircle2, ChevronRight, Heart } from 'lucide-react';
import { Bill } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingBills: Bill[];
  onSelectBill: (bill: Bill) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  pendingBills,
  onSelectBill,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm font-['Prompt',sans-serif]">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-slate-800 border border-pink-100 animate-fade-in">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-base text-slate-800 font-['Mitr',sans-serif]">การแจ้งเตือนยอดรอชำระ MBA25</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {pendingBills.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-teal-500" />
              <p className="text-xs font-semibold text-slate-600">ไม่มีรายการค้างชำระ สมาชิกทุกคนจ่ายครบแล้ว!</p>
            </div>
          ) : (
            pendingBills.map((bill) => (
              <div
                key={bill.id}
                onClick={() => {
                  onSelectBill(bill);
                  onClose();
                }}
                className="p-3 rounded-2xl border border-pink-100 bg-pink-50/20 hover:bg-pink-50/60 flex items-center justify-between cursor-pointer transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{bill.memberName} - {bill.title}</p>
                    <p className="text-[11px] text-slate-400">
                      ยอด ฿{bill.amount.toLocaleString()} • ครบกำหนด {bill.dueDate}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
