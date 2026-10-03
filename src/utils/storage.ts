import { Member, Bill, PaymentTransaction, ExpenseRecord, SystemConfig, AuditLog } from '../types';
import { INITIAL_CONFIG, INITIAL_MEMBERS, INITIAL_BILLS, INITIAL_TRANSACTIONS, INITIAL_EXPENSES } from './mockData';

const STORAGE_KEYS = {
  MEMBERS: 'paymember_members_v7_end_of_month',
  BILLS: 'paymember_bills_v7_end_of_month',
  TRANSACTIONS: 'paymember_transactions_v7_end_of_month',
  EXPENSES: 'paymember_expenses_v7_end_of_month',
  CONFIG: 'paymember_config_v7_end_of_month',
  AUDIT_LOGS: 'paymember_audit_v7_end_of_month',
};

// Ensure due date always falls on the last day of that month
export function normalizeDueDateToEndOfMonth(dueDate: string): string {
  if (!dueDate) return dueDate;
  const parts = dueDate.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const lastDay = new Date(y, m, 0).getDate();
    return `${parts[0]}-${parts[1]}-${lastDay.toString().padStart(2, '0')}`;
  }
  return dueDate;
}

// Safe LocalStorage helpers
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed to parse storage key ${key}:`, e);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save storage key ${key}:`, e);
  }
}

export function loadAllAppData() {
  // Preserve any previously customized config (e.g. changed adminPin)
  const legacyConfig = 
    loadFromStorage<SystemConfig | null>('paymember_config_v6_cleared_except_daye_day_toey', null) ||
    loadFromStorage<SystemConfig | null>('paymember_config_v4_top_mba25', null);
  const config = loadFromStorage<SystemConfig>(STORAGE_KEYS.CONFIG, legacyConfig || INITIAL_CONFIG);

  const members = loadFromStorage<Member[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  const rawBills = loadFromStorage<Bill[]>(STORAGE_KEYS.BILLS, INITIAL_BILLS);
  const bills = rawBills.map((b) => ({
    ...b,
    dueDate: normalizeDueDateToEndOfMonth(b.dueDate),
  }));
  const transactions = loadFromStorage<PaymentTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  const expenses = loadFromStorage<ExpenseRecord[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  const auditLogs = loadFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, [
    {
      id: 'AUD-INIT',
      action: 'DUE_DATE_UPDATED',
      operator: 'SYSTEM',
      details: 'ปรับปรุงวันกำหนดชำระเงินของบิลทุกงวดเป็นวันสิ้นสุดของแต่ละเดือนเรียบร้อยแล้ว',
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1',
    },
  ]);

  return { members, bills, transactions, expenses, config, auditLogs };
}

export function saveAllAppData(data: {
  members: Member[];
  bills: Bill[];
  transactions: PaymentTransaction[];
  expenses: ExpenseRecord[];
  config: SystemConfig;
  auditLogs?: AuditLog[];
}) {
  saveToStorage(STORAGE_KEYS.MEMBERS, data.members);
  saveToStorage(STORAGE_KEYS.BILLS, data.bills);
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, data.transactions);
  saveToStorage(STORAGE_KEYS.EXPENSES, data.expenses);
  saveToStorage(STORAGE_KEYS.CONFIG, data.config);
  if (data.auditLogs) {
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);
  }
}

// PDPA Masking Utility
export function maskSensitiveData(text: string, type: 'phone' | 'account' | 'name' | 'id', enabled = true): string {
  if (!enabled || !text) return text;

  if (type === 'phone') {
    // e.g. 081-442-8819 -> 081-xxx-8819 or 0814428819 -> 081-xxx-8819
    const clean = text.replace(/[^0-9]/g, '');
    if (clean.length === 10) {
      return `${clean.slice(0, 3)}-xxx-${clean.slice(6)}`;
    }
    return text.replace(/(\d{3})\d+(\d{2})/, '$1-xxx-$2');
  }

  if (type === 'account') {
    // e.g. 142-2-89912-3 -> 142-x-xx912-x
    return text.replace(/(\d{3})[-]?(\d)[-]?(\d{3})(\d{2})[-]?(\d)/, '$1-x-xx$4-x');
  }

  if (type === 'name') {
    // Keep first word/prefix and first letter of surname
    const parts = text.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1][0]}.`;
    }
    return text;
  }

  return text;
}

// Export Database Snapshot to JSON
export function exportDataAsJson(data: any, filename = 'paymember_backup.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export Transactions to CSV (Excel with BOM for Thai character compatibility)
export function exportTransactionsToCSV(transactions: PaymentTransaction[], members: Member[]) {
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const headers = [
    'เลขที่ใบเสร็จ',
    'วันที่ชำระ',
    'รหัสสมาชิก',
    'ชื่อ-นามสกุล',
    'กลุ่ม/โซน',
    'รายการบิล',
    'ยอดเงิน (บาท)',
    'ช่องทางชำระ',
    'ธนาคาร',
    'รหัสอ้างอิง',
    'สถานะการตรวจ',
    'ผู้ตรวจสอบ',
  ];

  const rows = transactions.map((t) => {
    const member = memberMap.get(t.memberId);
    return [
      `"${t.receiptNumber}"`,
      `"${t.paidAt}"`,
      `"${member?.memberCode || t.memberId}"`,
      `"${t.memberName}"`,
      `"${member?.group || '-'}"`,
      `"${t.billTitle.replace(/"/g, '""')}"`,
      t.amount,
      `"${t.paymentMethod}"`,
      `"${t.bankName || '-'}"`,
      `"${t.transactionRef}"`,
      `"${t.status === 'APPROVED' ? 'อนุมัติเรียบร้อย' : 'รอตรวจสอบ'}"`,
      `"${t.verifiedBy === 'AI_OCR_AUTO' ? 'AI ตรวจสอบอัตโนมัติ' : 'เจ้าหน้าที่'}"`,
    ];
  });

  // UTF-8 BOM \uFEFF ensures Excel displays Thai characters perfectly!
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `paymember_report_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
