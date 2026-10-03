import { Member, Bill, PaymentTransaction, ExpenseRecord, SystemConfig } from '../types';

export const ROOM_MONTHS = [
  { id: '2026-10', name: 'ตุลาคม 2026', shortName: 'ต.ค. 26', dueDate: '2026-10-31' },
  { id: '2026-11', name: 'พฤศจิกายน 2026', shortName: 'พ.ย. 26', dueDate: '2026-11-30' },
  { id: '2026-12', name: 'ธันวาคม 2026', shortName: 'ธ.ค. 26', dueDate: '2026-12-31' },
  { id: '2027-01', name: 'มกราคม 2027', shortName: 'ม.ค. 27', dueDate: '2027-01-31' },
  { id: '2027-02', name: 'กุมภาพันธ์ 2027', shortName: 'ก.พ. 27', dueDate: '2027-02-28' },
  { id: '2027-03', name: 'มีนาคม 2027', shortName: 'มี.ค. 27', dueDate: '2027-03-31' },
  { id: '2027-04', name: 'เมษายน 2027', shortName: 'เม.ย. 27', dueDate: '2027-04-30' },
  { id: '2027-05', name: 'พฤษภาคม 2027', shortName: 'พ.ค. 27', dueDate: '2027-05-31' },
  { id: '2027-06', name: 'มิถุนายน 2027', shortName: 'มิ.ย. 27', dueDate: '2027-06-30' },
  { id: '2027-07', name: 'กรกฎาคม 2027', shortName: 'ก.ค. 27', dueDate: '2027-07-31' },
  { id: '2027-08', name: 'สิงหาคม 2027', shortName: 'ส.ค. 27', dueDate: '2027-08-31' },
  { id: '2027-09', name: 'กันยายน 2027', shortName: 'ก.ย. 27', dueDate: '2027-09-30' },
  { id: '2027-10', name: 'ตุลาคม 2027', shortName: 'ต.ค. 27', dueDate: '2027-10-31' },
  { id: '2027-11', name: 'พฤศจิกายน 2027', shortName: 'พ.ย. 27', dueDate: '2027-11-30' },
  { id: '2027-12', name: 'ธันวาคม 2027', shortName: 'ธ.ค. 27', dueDate: '2027-12-31' },
  { id: '2028-01', name: 'มกราคม 2028', shortName: 'ม.ค. 28', dueDate: '2028-01-31' },
  { id: '2028-02', name: 'กุมภาพันธ์ 2028', shortName: 'ก.พ. 28', dueDate: '2028-02-29' },
  { id: '2028-03', name: 'มีนาคม 2028', shortName: 'มี.ค. 28', dueDate: '2028-03-31' },
];

export const INITIAL_CONFIG: SystemConfig = {
  orgName: 'MBA25 BANK',
  promptPayId: '8420786446',
  promptPayName: 'MBA25 BANK',
  bankName: 'ธนาคารกรุงไทย',
  bankAccountNumber: '8420786446',
  bankAccountName: 'บัญชีกองกลาง MBA25 BANK',
  lineNotifyToken: '',
  lineWebhookUrl: '',
  adminPin: '1234',
  pdpaMasking: true,
  autoCloudBackup: true,
  lastBackupTime: new Date().toISOString(),
};

// 23 Members: 22 previous + ท็อป
const RAW_MEMBER_NAMES = [
  'เหมียว',
  'จูน',
  'น้ำเหมย',
  'เบญ',
  'จ๋า',
  'เรย์',
  'เตย',
  'มาดามเตย',
  'พลอย',
  'ดาย',
  'ซีเจ',
  'เดย์',
  'ตุลย์',
  'จีจี้',
  'นัท',
  'ตาล',
  'แอมมี่',
  'น้ำผึ้ง',
  'แอนนี่',
  'มิวสิค',
  'ฟอร์ด',
  'เติร์ด',
  'ท็อป',
];

export const MONTHLY_RATE = 300; // เดือนละ 300 บาท

// รายชื่อสมาชิกที่ชำระเงินแล้ว: ดาย, เดย์, เตย (คนอื่นล้างยอดชำระเป็น 0 บาท ทั้งหมด)
export const PAID_MEMBER_NAMES = ['ดาย', 'เดย์', 'เตย'];

// Generate 23 members without room details
export const INITIAL_MEMBERS: Member[] = RAW_MEMBER_NAMES.map((name, index) => {
  const codeNum = (index + 1).toString().padStart(2, '0');
  
  // ล้างยอดชำระของทุกคน ยกเว้น ดาย เดย์ เตย
  const hasPaidCurrentMonth = PAID_MEMBER_NAMES.includes(name);

  return {
    id: `MEM-${codeNum}`,
    memberCode: `MBA-${codeNum}`,
    name: name,
    phone: `08${(index + 1).toString().padStart(2, '0')}-${100 + index * 15}-${1000 + index * 33}`,
    email: `${name.toLowerCase()}@mba25.com`,
    lineId: `mba_${name.toLowerCase()}`,
    group: 'สมาชิก MBA25',
    avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    joinedDate: '2026-10-01',
    totalPaid: hasPaidCurrentMonth ? MONTHLY_RATE : 0,
    totalPending: hasPaidCurrentMonth ? 0 : MONTHLY_RATE,
    status: 'ACTIVE',
    bankAccount: 'xxx-x-xx644-6 (KTB)',
    notes: 'สมาชิก MBA25 BANK',
  };
});

// Initial Bills: MBA25 BANK เดือน ตุลาคม 2026 for all 23 members (300 บาท/คน)
export const INITIAL_BILLS: Bill[] = INITIAL_MEMBERS.map((member, index) => {
  const isPaid = member.totalPaid > 0;
  const billCode = (index + 1).toString().padStart(3, '0');

  return {
    id: `BILL-OCT26-${billCode}`,
    billNumber: `MBA-202610-${billCode}`,
    title: 'MBA25 BANK เดือน ตุลาคม 2026',
    description: 'ยอดชำระ MBA25 BANK ประจำงวดเดือน ตุลาคม 2026 (ธ.กรุงไทย 8420786446)',
    category: 'MBA25 BANK',
    amount: MONTHLY_RATE, // 300 บาท
    dueDate: '2026-10-31',
    createdAt: '2026-10-01',
    status: isPaid ? 'PAID' : 'PENDING',
    memberId: member.id,
    memberName: member.name,
    paidAt: isPaid ? '2026-10-02 11:20:15' : undefined,
    paymentMethod: isPaid ? 'BANK_TRANSFER' : undefined,
    transactionRef: isPaid ? `KTB20261002${billCode}99` : undefined,
    slipVerified: isPaid,
  };
});

// Initial Transactions for paid members
export const INITIAL_TRANSACTIONS: PaymentTransaction[] = INITIAL_BILLS.filter((b) => b.status === 'PAID').map((b, idx) => ({
  id: `TXN-OCT26-${idx + 1}`,
  receiptNumber: `RCP-202610-${(idx + 1).toString().padStart(3, '0')}`,
  billId: b.id,
  billTitle: b.title,
  memberId: b.memberId,
  memberName: b.memberName,
  amount: MONTHLY_RATE, // 300 บาท
  paidAt: b.paidAt || '2026-10-02 11:20:15',
  paymentMethod: 'BANK_TRANSFER',
  status: 'APPROVED',
  transactionRef: b.transactionRef || `KTB8420786446-${idx + 1}`,
  bankName: 'ธนาคารกรุงไทย (KTB)',
  senderAccount: 'xxx-x-xxxxx-x',
  receiverAccount: '8420786446 (กรุงไทย)',
  verifiedBy: 'AI_OCR_AUTO',
  aiConfidence: 99,
  aiNotes: 'ตรวจสอบสลิปโอนเข้า MBA25 BANK ธ.กรุงไทย 8420786446 ยอดเงิน 300.00 บาท ถูกต้องครบถ้วน',
}));

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'EXP-001',
    title: 'ค่าใช้จ่ายและกิจกรรมกลุ่ม MBA25',
    category: 'กิจกรรมกลุ่ม',
    amount: 1200,
    date: '2026-10-02',
    recordedBy: 'แอดมิน',
    note: 'ค่าใช้จ่ายดำเนินงานส่วนกลาง',
  },
  {
    id: 'EXP-002',
    title: 'ค่าบริการจัดการเอกสารและระบบ',
    category: 'บริหารจัดการ',
    amount: 800,
    date: '2026-10-01',
    recordedBy: 'แอดมิน',
    note: 'ค่าธรรมเนียมและอุปกรณ์ส่วนกลาง',
  },
];

export const MONTHLY_FINANCIAL_DATA = [
  { month: 'ต.ค. 2026', income: 900, expense: 2000, pending: 6000 },
  { month: 'พ.ย. 2026 (เป้าหมาย)', income: 0, expense: 0, pending: 6900 },
  { month: 'ธ.ค. 2026 (เป้าหมาย)', income: 0, expense: 0, pending: 6900 },
  { month: 'ม.ค. 2027 (เป้าหมาย)', income: 0, expense: 0, pending: 6900 },
  { month: 'ก.พ. 2027 (เป้าหมาย)', income: 0, expense: 0, pending: 6900 },
  { month: 'มี.ค. 2027 (เป้าหมาย)', income: 0, expense: 0, pending: 6900 },
];
