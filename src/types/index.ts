export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'REVIEW_NEEDED';

export type PaymentMethod = 'PROMPTPAY' | 'BANK_TRANSFER' | 'CARD' | 'CASH';

export interface Member {
  id: string;
  memberCode: string; // e.g. "MEM-001"
  name: string;
  phone: string;
  email: string;
  lineId: string;
  group: string; // e.g. "กลุ่ม A - ชั้น 1", "ฝ่ายบัญชี", "สมาชิกทั่วไป"
  avatar: string;
  joinedDate: string;
  totalPaid: number;
  totalPending: number;
  status: 'ACTIVE' | 'INACTIVE';
  bankAccount?: string;
  notes?: string;
}

export interface Bill {
  id: string;
  billNumber: string; // e.g. "INV-2026-001"
  title: string;
  description: string;
  category: string; // e.g. "ค่าส่วนกลาง", "ค่าน้ำ/ค่าไฟ", "เงินสมทบโครงการ", "ค่าสมาชิกรายปี"
  amount: number;
  dueDate: string;
  createdAt: string;
  status: PaymentStatus;
  memberId: string;
  memberName: string;
  slipUrl?: string;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  slipVerified?: boolean;
}

export interface PaymentTransaction {
  id: string;
  receiptNumber: string;
  billId: string;
  billTitle: string;
  memberId: string;
  memberName: string;
  amount: number;
  paidAt: string;
  paymentMethod: PaymentMethod;
  status: 'APPROVED' | 'REVIEW_NEEDED' | 'REJECTED';
  slipImage?: string;
  transactionRef: string;
  bankName: string;
  senderAccount?: string;
  receiverAccount?: string;
  verifiedBy: 'AI_OCR_AUTO' | 'ADMIN_MANUAL';
  aiConfidence?: number;
  aiNotes?: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  recordedBy: string;
  note?: string;
}

export interface SlipOcrResult {
  isValidSlip: boolean;
  bankName: string;
  transferDate: string;
  transferTime: string;
  amount: number;
  senderName: string;
  senderAccount?: string;
  receiverName: string;
  receiverAccount?: string;
  transactionRef: string;
  qrDetected?: boolean;
  confidence: number;
  summaryRemarks: string;
  mismatchReason?: string;
  isFallback?: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  operator: string;
  details: string;
  timestamp: string;
  ip?: string;
}

export interface SystemConfig {
  orgName: string;
  promptPayId: string; // Phone or Tax ID
  promptPayName: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  lineNotifyToken: string;
  lineWebhookUrl: string;
  adminPin: string;
  pdpaMasking: boolean;
  autoCloudBackup: boolean;
  lastBackupTime?: string;
}
