/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Member, 
  Bill, 
  PaymentTransaction, 
  ExpenseRecord, 
  SystemConfig, 
  AuditLog, 
  SlipOcrResult 
} from './types';
import { 
  loadAllAppData, 
  saveAllAppData 
} from './utils/storage';

import { Navbar } from './components/Navbar';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MembersView } from './components/MembersView';
import { BillsAndPaymentView } from './components/BillsAndPaymentView';
import { HistoryAndReceiptsView } from './components/HistoryAndReceiptsView';
import { BackupAndSecurityView } from './components/BackupAndSecurityView';
import { ReceiptModal } from './components/ReceiptModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AdminLockModal } from './components/AdminLockModal';

export default function App() {
  const initialData = loadAllAppData();

  const [members, setMembers] = useState<Member[]>(initialData.members);
  const [bills, setBills] = useState<Bill[]>(initialData.bills);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(initialData.transactions);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(initialData.expenses);
  const [config, setConfig] = useState<SystemConfig>(initialData.config);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialData.auditLogs);

  // App UI state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('bills');
  const [isAdmin, setIsAdmin] = useState(false); // Default to member view for safety, admin unlocks with PIN
  const [isAdminLockModalOpen, setIsAdminLockModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [cloudSyncing, setCloudSyncing] = useState(false);

  // Modals & Navigation targets
  const [selectedBillForSlip, setSelectedBillForSlip] = useState<Bill | null>(null);
  const [viewingReceiptTxn, setViewingReceiptTxn] = useState<PaymentTransaction | null>(null);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    saveAllAppData({
      members,
      bills,
      transactions,
      expenses,
      config,
      auditLogs,
    });
  }, [members, bills, transactions, expenses, config, auditLogs]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const logAudit = useCallback((action: string, details: string, operator = isAdmin ? 'ADMIN' : 'MEMBER') => {
    const newLog: AuditLog = {
      id: 'AUD-' + Date.now(),
      action,
      operator,
      details,
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1',
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  }, [isAdmin]);

  const triggerCloudBackup = useCallback(async () => {
    setCloudSyncing(true);
    try {
      await fetch('/api/cloud-backup/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupName: `Auto Snapshot (${new Date().toLocaleTimeString('th-TH')})`,
          data: { members, bills, transactions, expenses, config },
        }),
      });
      setConfig((prev) => ({ ...prev, lastBackupTime: new Date().toISOString() }));
    } catch (e) {
      console.warn('Cloud sync skipped:', e);
    } finally {
      setCloudSyncing(false);
    }
  }, [members, bills, transactions, expenses, config]);

  const handleRestoreFromCloud = async () => {
    setCloudSyncing(true);
    try {
      const res = await fetch('/api/cloud-backup/latest');
      const data = await res.json();
      if (data.hasBackup && data.data) {
        setMembers(data.data.members || members);
        setBills(data.data.bills || bills);
        setTransactions(data.data.transactions || transactions);
        setExpenses(data.data.expenses || expenses);
        logAudit('CLOUD_RESTORE', 'กู้คืนข้อมูลสำเร็จจากจุดสำรองบนคลาวด์');
        alert('กู้คืนข้อมูลจากคลาวด์เรียบร้อยแล้ว!');
      } else {
        alert('ยังไม่มีจุดสำรองข้อมูลบนคลาวด์ในขณะนี้');
      }
    } catch (err: any) {
      alert('ไม่สามารถเชื่อมต่อคลาวด์ได้: ' + err.message);
    } finally {
      setCloudSyncing(false);
    }
  };

  const handleAddMember = (newMemberData: Omit<Member, 'id' | 'totalPaid' | 'totalPending'>) => {
    const newId = `MEM-${(members.length + 1).toString().padStart(2, '0')}`;
    const newMember: Member = {
      ...newMemberData,
      id: newId,
      totalPaid: 0,
      totalPending: 0,
    };

    setMembers((prev) => [newMember, ...prev]);
    logAudit('MEMBER_ADDED', `เพิ่มสมาชิกใหม่: ${newMember.name} (${newMember.memberCode})`);
    triggerCloudBackup();
  };

  const handleCreateBill = (billData: {
    title: string;
    description: string;
    category: string;
    amount: number;
    dueDate: string;
    targetMemberIds: string[];
  }) => {
    const newBills: Bill[] = [];
    const updatedMembers = [...members];
    const timestampStr = new Date().toISOString().split('T')[0].replace(/-/g, '');

    billData.targetMemberIds.forEach((mId, index) => {
      const member = updatedMembers.find((m) => m.id === mId);
      if (!member) return;

      const billId = `BILL-${Date.now()}-${index}`;
      const billNumber = `MBA-${timestampStr}-${Math.floor(100 + Math.random() * 900)}`;

      newBills.push({
        id: billId,
        billNumber,
        title: billData.title,
        description: billData.description,
        category: 'MBA25 BANK',
        amount: billData.amount,
        dueDate: billData.dueDate,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'PENDING',
        memberId: member.id,
        memberName: member.name,
      });

      member.totalPending += billData.amount;
    });

    setBills((prev) => [...newBills, ...prev]);
    setMembers(updatedMembers);
    logAudit('BILLS_CREATED', `ออกบิล ${billData.title} ให้สมาชิก ${billData.targetMemberIds.length} คน`);
    triggerCloudBackup();
  };

  const handleAddExpense = (newExpense: Omit<ExpenseRecord, 'id'>) => {
    const newExp: ExpenseRecord = {
      ...newExpense,
      id: `EXP-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
    logAudit('EXPENSE_RECORDED', `บันทึกรายจ่าย: ${newExp.title} ฿${newExp.amount}`);
    triggerCloudBackup();
  };

  const handleApprovePayment = async (data: {
    billId: string;
    amount: number;
    transactionRef: string;
    bankName: string;
    paidAt: string;
    slipImage: string;
    ocrResult: SlipOcrResult;
    sendLineNotify: boolean;
  }) => {
    const targetBill = bills.find((b) => b.id === data.billId);
    if (!targetBill) return;

    // 1. Mark bill as PAID
    const updatedBills = bills.map((b) => {
      if (b.id === data.billId) {
        return {
          ...b,
          status: 'PAID' as const,
          paidAt: data.paidAt,
          paymentMethod: 'BANK_TRANSFER' as const,
          transactionRef: data.transactionRef,
          slipVerified: true,
          slipUrl: data.slipImage,
        };
      }
      return b;
    });

    // 2. Create Transaction Record
    const receiptNumber = `RCP-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;
    const newTransaction: PaymentTransaction = {
      id: `TXN-${Date.now()}`,
      receiptNumber,
      billId: targetBill.id,
      billTitle: targetBill.title,
      memberId: targetBill.memberId,
      memberName: targetBill.memberName,
      amount: data.amount,
      paidAt: data.paidAt,
      paymentMethod: 'BANK_TRANSFER',
      status: 'APPROVED',
      slipImage: data.slipImage,
      transactionRef: data.transactionRef,
      bankName: data.bankName || 'ธนาคารกรุงไทย',
      senderAccount: data.ocrResult.senderAccount,
      receiverAccount: '8420786446 (กรุงไทย)',
      verifiedBy: 'AI_OCR_AUTO',
      aiConfidence: data.ocrResult.confidence,
      aiNotes: data.ocrResult.summaryRemarks,
    };

    // 3. Update member balances
    const updatedMembers = members.map((m) => {
      if (m.id === targetBill.memberId) {
        return {
          ...m,
          totalPending: Math.max(0, m.totalPending - data.amount),
          totalPaid: m.totalPaid + data.amount,
        };
      }
      return m;
    });

    setBills(updatedBills);
    setTransactions((prev) => [newTransaction, ...prev]);
    setMembers(updatedMembers);

    logAudit('PAYMENT_APPROVED', `อนุมัติตัดยอดชำระ MBA25 BANK ฿${data.amount} ของ ${targetBill.memberName} (Ref: ${data.transactionRef})`);
    triggerCloudBackup();
  };

  const handleDirectPayBill = (bill: Bill) => {
    handleApprovePayment({
      billId: bill.id,
      amount: bill.amount,
      transactionRef: `KTB8420786446-${Date.now().toString().slice(-6)}`,
      bankName: 'ธนาคารกรุงไทย (8420786446)',
      paidAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      slipImage: '',
      ocrResult: {
        isValidSlip: true,
        bankName: 'ธนาคารกรุงไทย',
        transferDate: new Date().toISOString().split('T')[0],
        transferTime: new Date().toTimeString().split(' ')[0],
        amount: bill.amount,
        senderName: bill.memberName,
        senderAccount: 'บัญชีสมาชิก',
        receiverName: 'MBA25 BANK',
        receiverAccount: '8420786446',
        transactionRef: `KTB8420786446-${Date.now().toString().slice(-6)}`,
        qrDetected: false,
        confidence: 100,
        summaryRemarks: 'ชำระเงินโอนเข้าบัญชี MBA25 BANK ธ.กรุงไทย 8420786446 สำเร็จ',
      },
      sendLineNotify: false,
    });
  };

  const handleResetMemberPayments = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    let resetAmount = 0;
    const updatedBills = bills.map((b) => {
      if (b.memberId === memberId && b.status === 'PAID') {
        resetAmount += b.amount;
        return {
          ...b,
          status: 'PENDING' as const,
          paidAt: undefined,
          paymentMethod: undefined,
          transactionRef: undefined,
          slipVerified: false,
          slipUrl: undefined,
        };
      }
      return b;
    });

    const updatedTransactions = transactions.filter((t) => t.memberId !== memberId);

    const updatedMembers = members.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          totalPaid: 0,
          totalPending: m.totalPending + resetAmount,
        };
      }
      return m;
    });

    setBills(updatedBills);
    setTransactions(updatedTransactions);
    setMembers(updatedMembers);

    logAudit('PAYMENTS_RESET', `แอดมินล้างข้อมูลการโอนเงินของ ${member.name} (ยอด ฿${resetAmount}) และคืนสถานะบิลกลับเป็นรอชำระ`);
    triggerCloudBackup();
  };

  const handleResetAllExcept = (whitelistMemberNames: string[]) => {
    const updatedBills = bills.map((b) => {
      const isWhitelisted = whitelistMemberNames.includes(b.memberName);
      if (!isWhitelisted && b.status === 'PAID') {
        return {
          ...b,
          status: 'PENDING' as const,
          paidAt: undefined,
          paymentMethod: undefined,
          transactionRef: undefined,
          slipVerified: false,
          slipUrl: undefined,
        };
      }
      return b;
    });

    const updatedTransactions = transactions.filter((t) =>
      whitelistMemberNames.includes(t.memberName)
    );

    const updatedMembers = members.map((m) => {
      const isWhitelisted = whitelistMemberNames.includes(m.name);
      if (!isWhitelisted) {
        return {
          ...m,
          totalPaid: 0,
          totalPending: 300,
        };
      }
      return m;
    });

    setBills(updatedBills);
    setTransactions(updatedTransactions);
    setMembers(updatedMembers);

    logAudit(
      'BATCH_PAYMENTS_RESET',
      `แอดมินล้างข้อมูลยอดชำระของทุกคน ยกเว้น: ${whitelistMemberNames.join(', ')}`
    );
    triggerCloudBackup();
  };

  const handleDeleteTransaction = (transactionId: string) => {
    const txn = transactions.find((t) => t.id === transactionId);
    if (!txn) return;

    const updatedBills = bills.map((b) => {
      if (b.id === txn.billId) {
        return {
          ...b,
          status: 'PENDING' as const,
          paidAt: undefined,
          paymentMethod: undefined,
          transactionRef: undefined,
          slipVerified: false,
          slipUrl: undefined,
        };
      }
      return b;
    });

    const updatedTransactions = transactions.filter((t) => t.id !== transactionId);

    const updatedMembers = members.map((m) => {
      if (m.id === txn.memberId) {
        return {
          ...m,
          totalPaid: Math.max(0, m.totalPaid - txn.amount),
          totalPending: m.totalPending + txn.amount,
        };
      }
      return m;
    });

    setBills(updatedBills);
    setTransactions(updatedTransactions);
    setMembers(updatedMembers);

    logAudit('TRANSACTION_DELETED', `แอดมินลบประวัติการโอนเงิน ${txn.receiptNumber} ของ ${txn.memberName} (ยอด ฿${txn.amount})`);
    triggerCloudBackup();
  };

  // Toggle Admin mode: if locked, show modal
  const handleToggleAdmin = () => {
    if (!isAdmin) {
      setIsAdminLockModalOpen(true);
    } else {
      setIsAdmin(false);
      logAudit('ROLE_SWITCH', 'ล็อกโหมดแอดมิน สลับสู่มุมมองสมาชิก');
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdmin(true);
    logAudit('ROLE_SWITCH', 'ยืนยันรหัสผ่านสำเร็จ เข้าสู่โหมดแอดมิน');
  };

  const handleChangeAdminPin = (newPin: string) => {
    setConfig((prev) => ({ ...prev, adminPin: newPin }));
    logAudit('PIN_CHANGED', 'เปลี่ยนรหัสผ่านแอดมินใหม่');
    triggerCloudBackup();
  };

  const handleTogglePdpa = () => {
    setConfig((prev) => {
      const next = !prev.pdpaMasking;
      logAudit('PDPA_TOGGLED', `เปลี่ยนสถานะการซ่อนข้อมูล PDPA: ${next ? 'เปิด' : 'ปิด'}`);
      return { ...prev, pdpaMasking: next };
    });
  };

  const handleUpdateConfig = (newConfig: Partial<SystemConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
    logAudit('CONFIG_UPDATED', 'แก้ไขการตั้งค่าระบบ');
    triggerCloudBackup();
  };

  const handleImportBackupData = (imported: any) => {
    if (imported.members) setMembers(imported.members);
    if (imported.bills) setBills(imported.bills);
    if (imported.transactions) setTransactions(imported.transactions);
    if (imported.expenses) setExpenses(imported.expenses);
    if (imported.config) setConfig(imported.config);
    logAudit('DATABASE_IMPORTED', 'นำเข้าฐานข้อมูลสำรอง JSON สำเร็จ');
  };

  const pendingBillsList = bills.filter((b) => b.status === 'PENDING' || b.status === 'OVERDUE' || b.status === 'REVIEW_NEEDED');
  const reviewNeededSlipsCount = bills.filter((b) => b.status === 'REVIEW_NEEDED').length;

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-slate-800 flex flex-col font-['Prompt',sans-serif]">
      
      {/* Top Navbar */}
      <Navbar
        config={config}
        isOnline={isOnline}
        isAdmin={isAdmin}
        pendingReviewCount={reviewNeededSlipsCount + pendingBillsList.length}
        onToggleAdmin={handleToggleAdmin}
        onTogglePdpa={handleTogglePdpa}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          pendingBillsCount={pendingBillsList.length}
        />

        {/* Dynamic Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              members={members}
              bills={bills}
              transactions={transactions}
              expenses={expenses}
              onOpenCreateBill={() => {
                if (!isAdmin) {
                  setIsAdminLockModalOpen(true);
                } else {
                  setCurrentTab('bills');
                }
              }}
              onOpenAddExpense={() => {
                if (!isAdmin) {
                  setIsAdminLockModalOpen(true);
                } else {
                  setIsAddExpenseModalOpen(true);
                }
              }}
              onNavigateToHistory={() => setCurrentTab('history')}
              onNavigateToMembers={() => setCurrentTab('members')}
              onNavigateToBills={() => setCurrentTab('bills')}
            />
          )}

          {currentTab === 'members' && (
            <MembersView
              members={members}
              bills={bills}
              transactions={transactions}
              config={config}
              isAdmin={isAdmin}
              onRequireAdmin={() => setIsAdminLockModalOpen(true)}
              onAddMember={handleAddMember}
              onPayBillForMember={(bill) => {
                setSelectedBillForSlip(bill);
                setCurrentTab('bills');
              }}
              onViewReceipt={(txn) => setViewingReceiptTxn(txn)}
              onResetMemberPayments={handleResetMemberPayments}
              onResetAllExcept={handleResetAllExcept}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {currentTab === 'bills' && (
            <BillsAndPaymentView
              bills={bills}
              members={members}
              config={config}
              isAdmin={isAdmin}
              onRequireAdmin={() => setIsAdminLockModalOpen(true)}
              onCreateBill={handleCreateBill}
              onConfirmPayment={handleDirectPayBill}
            />
          )}

          {currentTab === 'history' && (
            <HistoryAndReceiptsView
              transactions={transactions}
              members={members}
              config={config}
              isAdmin={isAdmin}
              onRequireAdmin={() => setIsAdminLockModalOpen(true)}
              onViewReceipt={(txn) => setViewingReceiptTxn(txn)}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {currentTab === 'backup_security' && (
            <BackupAndSecurityView
              config={config}
              auditLogs={auditLogs}
              isOnline={isOnline}
              cloudSyncing={cloudSyncing}
              allData={{ members, bills, transactions, expenses, config }}
              onUpdateConfig={handleUpdateConfig}
              onTriggerCloudBackup={triggerCloudBackup}
              onRestoreFromCloud={handleRestoreFromCloud}
              onImportBackupData={handleImportBackupData}
            />
          )}
        </main>
      </div>

      {/* Official E-Receipt Modal */}
      {viewingReceiptTxn && (
        <ReceiptModal
          transaction={viewingReceiptTxn}
          member={members.find((m) => m.id === viewingReceiptTxn.memberId)}
          config={config}
          onClose={() => setViewingReceiptTxn(null)}
        />
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onAddExpense={handleAddExpense}
      />

      {/* Notifications Drawer */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        pendingBills={pendingBillsList}
        onSelectBill={(bill) => {
          setSelectedBillForSlip(bill);
          setCurrentTab('bills');
        }}
      />

      {/* Admin Passcode Lock Modal */}
      <AdminLockModal
        isOpen={isAdminLockModalOpen}
        onClose={() => setIsAdminLockModalOpen(false)}
        correctPin={config.adminPin || '1234'}
        onSuccess={handleAdminAuthSuccess}
        onChangePin={handleChangeAdminPin}
      />

    </div>
  );
}
