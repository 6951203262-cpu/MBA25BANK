import React, { useState } from 'react';
import { X, Receipt } from 'lucide-react';
import { ExpenseRecord } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('สาธารณูปโภค');
  const [amount, setAmount] = useState<number>(500);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    onAddExpense({
      title: title.trim(),
      category,
      amount: Number(amount),
      date,
      recordedBy: 'แอดมิน MBA25 BANK',
      note: note.trim(),
    });

    onClose();
    setTitle('');
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto font-['Prompt',sans-serif]">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-slate-800 my-8 border border-pink-100 animate-fade-in">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-800 flex items-center gap-2 font-['Mitr',sans-serif]">
            <Receipt className="w-5 h-5 text-rose-500" />
            บันทึกรายจ่ายส่วนกลาง MBA25 BANK
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-600 mb-1 font-semibold">รายการรายจ่าย *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ค่าน้ำ ค่าไฟส่วนกลาง, ค่าแม่บ้าน"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">หมวดหมู่</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-400 cursor-pointer"
              >
                <option value="สาธารณูปโภค">สาธารณูปโภค</option>
                <option value="ซ่อมบำรุงและดูแลพื้นที่">ซ่อมบำรุงและดูแลพื้นที่</option>
                <option value="ค่าแม่บ้าน">ค่าแม่บ้าน</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">จำนวนเงิน (บาท) *</label>
              <input
                type="number"
                required
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-slate-800 font-bold text-rose-600 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">วันที่ทำรายการ</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">หมายเหตุ / เลขที่บิล</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="รายละเอียดเพิ่มเติม..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div className="pt-3 flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-medium cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-xs cursor-pointer"
            >
              บันทึกรายจ่าย
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
