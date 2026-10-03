import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  ArrowUpRight, 
  PlusCircle, 
  Receipt, 
  Calendar, 
  CreditCard, 
  Sparkles, 
  Heart, 
  BarChart3, 
  Copy, 
  Check 
} from 'lucide-react';
import { Member, Bill, PaymentTransaction, ExpenseRecord } from '../types';
import { MONTHLY_FINANCIAL_DATA, ROOM_MONTHS, MONTHLY_RATE } from '../utils/mockData';

interface DashboardViewProps {
  members: Member[];
  bills: Bill[];
  transactions: PaymentTransaction[];
  expenses: ExpenseRecord[];
  onOpenCreateBill: () => void;
  onOpenAddExpense: () => void;
  onNavigateToHistory: () => void;
  onNavigateToMembers: () => void;
  onNavigateToBills: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  members,
  bills,
  transactions,
  expenses,
  onOpenCreateBill,
  onOpenAddExpense,
  onNavigateToHistory,
  onNavigateToMembers,
  onNavigateToBills,
}) => {
  const [copiedBank, setCopiedBank] = useState(false);

  // Compute live financial metrics
  const totalReceived = transactions
    .filter((t) => t.status === 'APPROVED')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingBills = bills.filter((b) => b.status === 'PENDING' || b.status === 'OVERDUE' || b.status === 'REVIEW_NEEDED');
  const totalPending = pendingBills.reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netFundBalance = totalReceived - totalExpenses;

  const totalBillable = totalReceived + totalPending;
  const collectionRate = totalBillable > 0 ? Math.round((totalReceived / totalBillable) * 100) : 0;

  const paidMembersCount = members.filter((m) => m.totalPaid > 0).length;
  const pendingMembersCount = members.filter((m) => m.totalPending > 0).length;

  const handleCopy = () => {
    navigator.clipboard.writeText('8420786446');
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const monthlyData = MONTHLY_FINANCIAL_DATA;
  const maxMonthValue = Math.max(8000, ...monthlyData.map((d) => Math.max(d.income, d.expense, d.pending)));

  return (
    <div className="space-y-6 pb-20 lg:pb-8 font-['Prompt',sans-serif]">
      
      {/* Top Welcome / Bank Account Card (Clean & Cute) */}
      <div className="bg-gradient-to-r from-pink-50 via-rose-50/50 to-amber-50/60 border border-pink-100 p-6 rounded-3xl relative overflow-hidden shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-600">
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
              สรุปภาพรวมบัญชี MBA25 BANK ({members.length} สมาชิก)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight font-['Mitr',sans-serif]">
              งวดเดือน ตุลาคม 2026 - มีนาคม 2028 (เดือนละ 300.-)
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              โอนชำระเข้า <strong className="text-sky-700">ธนาคารกรุงไทย เลขที่บัญชี 8420786446</strong> พร้อมระบบตรวจสลิปอัตโนมัติ
            </p>
          </div>

          {/* Quick Bank Copy & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              {copiedBank ? <Check className="w-4 h-4 text-teal-500" /> : <Copy className="w-4 h-4 text-sky-600" />}
              <span>{copiedBank ? 'คัดลอก 8420786446 แล้ว!' : 'คัดลอกบัญชี 8420786446'}</span>
            </button>
            <button
              onClick={onOpenCreateBill}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white text-xs font-semibold shadow-md shadow-pink-200 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              ออกบิลงวดใหม่
            </button>
            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-rose-500" />
              บันทึกรายจ่าย
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (Cute Pastel Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Received */}
        <div className="bg-white border border-teal-100 p-5 rounded-3xl shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">ยอดที่ได้รับแล้ว</span>
            <div className="p-2 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-teal-600 tracking-tight font-['Mitr',sans-serif]">
              ฿{totalReceived.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-teal-600 font-medium mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>ชำระแล้ว {paidMembersCount} จาก {members.length} คน ({collectionRate}%)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Pending Dues */}
        <div 
          onClick={onNavigateToMembers}
          className="bg-white border border-amber-100 p-5 rounded-3xl shadow-2xs hover:border-amber-300 transition-colors cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">ยอดค้างชำระทั้งหมด</span>
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-amber-600 tracking-tight font-['Mitr',sans-serif]">
              ฿{totalPending.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              รอชำระ {pendingMembersCount} คน (คลิกดูรายชื่อ)
            </p>
          </div>
        </div>

        {/* Card 3: Total Expenses */}
        <div 
          onClick={onOpenAddExpense}
          className="bg-white border border-rose-100 p-5 rounded-3xl shadow-2xs hover:border-rose-300 transition-colors cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">รายจ่ายส่วนกลาง</span>
            <div className="p-2 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-rose-500 tracking-tight font-['Mitr',sans-serif]">
              ฿{totalExpenses.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              บันทึกแล้ว {expenses.length} รายการ
            </p>
          </div>
        </div>

        {/* Card 4: Net Balance */}
        <div className="bg-white border border-sky-100 p-5 rounded-3xl shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">เงินกองทุนสุทธิ MBA25</span>
            <div className="p-2 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-sky-700 tracking-tight font-['Mitr',sans-serif]">
              ฿{netFundBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              เงินสะสมกองกลาง MBA25 BANK
            </p>
          </div>
        </div>

      </div>

      {/* Monthly Income vs Expense Comparison Chart */}
      <div className="bg-white border border-pink-100 p-6 rounded-3xl shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 font-['Mitr',sans-serif]">
              <BarChart3 className="w-5 h-5 text-pink-500" />
              กราฟสรุปการจัดเก็บเงิน & ค่าใช้จ่าย MBA25 BANK
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              งวดเดือน ตุลาคม 2026 - มีนาคม 2028 (เดือนละ 300 บาท/คน)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-teal-500"></span>
              <span className="text-slate-600">ชำระแล้ว</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-400"></span>
              <span className="text-slate-600">รายจ่าย</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-400"></span>
              <span className="text-slate-600">ยอดรอชำระ</span>
            </div>
          </div>
        </div>

        {/* Responsive Bar Chart */}
        <div className="w-full pt-4 pb-2 overflow-x-auto">
          <div className="min-w-[550px] space-y-6">
            <div className="grid grid-cols-6 gap-4 items-end h-60 border-b border-slate-100 pb-3 px-2">
              {monthlyData.map((item, idx) => {
                const incomeH = Math.max(8, (item.income / maxMonthValue) * 100);
                const expenseH = Math.max(8, (item.expense / maxMonthValue) * 100);
                const pendingH = Math.max(8, (item.pending / maxMonthValue) * 100);

                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] p-2 rounded-xl shadow-lg mb-2 pointer-events-none text-center whitespace-nowrap z-10">
                      <p className="font-bold text-white">{item.month}</p>
                      <p className="text-teal-300">รับ: ฿{item.income.toLocaleString()}</p>
                      <p className="text-rose-300">จ่าย: ฿{item.expense.toLocaleString()}</p>
                      <p className="text-amber-300">รอชำระ: ฿{item.pending.toLocaleString()}</p>
                    </div>

                    {/* Bars */}
                    <div className="flex items-end gap-1.5 w-full justify-center">
                      <div className="w-5 sm:w-6 flex flex-col items-center">
                        <div
                          style={{ height: `${incomeH}%` }}
                          className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-lg shadow-xs transition-all duration-500"
                        />
                      </div>
                      <div className="w-5 sm:w-6 flex flex-col items-center">
                        <div
                          style={{ height: `${expenseH}%` }}
                          className="w-full bg-gradient-to-t from-rose-400 to-rose-300 rounded-t-lg shadow-xs transition-all duration-500"
                        />
                      </div>
                      <div className="w-3.5 sm:w-4 flex flex-col items-center">
                        <div
                          style={{ height: `${pendingH}%` }}
                          className="w-full bg-amber-300 rounded-t-md transition-all duration-500"
                        />
                      </div>
                    </div>

                    <span className="mt-3 text-xs font-semibold text-slate-600 truncate text-center">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Member Dues Overview & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Members Status Overview */}
        <div className="bg-white border border-pink-100 p-6 rounded-3xl shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 font-['Mitr',sans-serif]">
                <Users className="w-5 h-5 text-amber-500" />
                สถานะสมาชิกที่รอชำระ MBA25 BANK
              </h3>
              <p className="text-xs text-slate-500">
                งวดเดือนปัจจุบัน (ตุลาคม 2026 - ยอด 300.-)
              </p>
            </div>
            <button
              onClick={onNavigateToMembers}
              className="text-xs font-bold text-pink-600 hover:text-pink-700 bg-pink-50 px-3 py-1.5 rounded-xl border border-pink-200 cursor-pointer"
            >
              ดูทั้งหมด {members.length} คน
            </button>
          </div>

          <div className="space-y-2.5">
            {members.filter((m) => m.totalPending > 0).slice(0, 5).map((member) => (
              <div 
                key={member.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-pink-50/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-9 h-9 rounded-xl object-cover bg-white p-0.5 border border-pink-100"
                  />
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-800">{member.name}</p>
                    <p className="text-[11px] text-slate-400">{member.memberCode} • สมาชิก</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm font-extrabold text-amber-600">
                    ฿{member.totalPending.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                    รอชำระ
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onNavigateToBills}
            className="w-full mt-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer text-center"
          >
            เปิดหน้ารายการจ่ายชำระ
          </button>
        </div>

        {/* Recent Payment Transfers */}
        <div className="bg-white border border-pink-100 p-6 rounded-3xl shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 font-['Mitr',sans-serif]">
                <CheckCircle2 className="w-5 h-5 text-teal-500" />
                ประวัติการโอนเงินล่าสุด
              </h3>
              <p className="text-xs text-slate-500">
                เข้าบัญชี ธ.กรุงไทย 8420786446
              </p>
            </div>
            <button
              onClick={onNavigateToHistory}
              className="text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 cursor-pointer"
            >
              ดูประวัติทั้งหมด
            </button>
          </div>

          <div className="space-y-2.5">
            {transactions.slice(0, 5).map((txn) => (
              <div 
                key={txn.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 font-bold text-xs">
                    ฿
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-800">{txn.memberName}</p>
                    <p className="text-[11px] text-slate-500">{txn.billTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm font-extrabold text-teal-600">
                    +฿{txn.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                    อนุมัติแล้ว
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div 
            onClick={onNavigateToBills}
            className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-pink-50 border border-sky-100 flex items-center justify-between cursor-pointer hover:border-pink-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏦</span>
              <div>
                <p className="text-xs font-bold text-slate-800">ชำระเงินโอนเข้าบัญชีกรุงไทย 8420786446</p>
                <p className="text-[11px] text-slate-500">แตะเพื่อไปที่หน้ารายการจ่ายชำระเงิน MBA25 BANK</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-pink-500" />
          </div>

        </div>

      </div>

    </div>
  );
};
