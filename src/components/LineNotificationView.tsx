import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Smartphone, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Bell, 
  Copy, 
  Check, 
  ExternalLink,
  Users
} from 'lucide-react';
import { Member, Bill, SystemConfig } from '../types';

interface LineNotificationViewProps {
  members: Member[];
  bills: Bill[];
  config: SystemConfig;
  onUpdateConfig: (newConfig: Partial<SystemConfig>) => void;
}

export const LineNotificationView: React.FC<LineNotificationViewProps> = ({
  members,
  bills,
  config,
  onUpdateConfig,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [notificationType, setNotificationType] = useState<'bill_reminder' | 'payment_confirmed' | 'overdue_alert'>('bill_reminder');
  const [customNote, setCustomNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Settings
  const [tokenInput, setTokenInput] = useState(config.lineNotifyToken || '');
  const [webhookInput, setWebhookInput] = useState(config.lineWebhookUrl || '');
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];
  const memberBills = bills.filter((b) => b.memberId === selectedMember?.id && b.status !== 'PAID');
  const activeBill = memberBills[0] || bills.find((b) => b.memberId === selectedMember?.id) || bills[0];

  const amountToDisplay = activeBill ? activeBill.amount : (selectedMember?.totalPending || 500);

  // Generate Message Text
  let messageTitle = '';
  let fullMessageText = '';

  if (notificationType === 'bill_reminder') {
    messageTitle = '📢 แจ้งเตือนบิลยอดค้างชำระ';
    fullMessageText = `เรียนคุณ ${selectedMember?.name}\n\nสมาคม/นิติบุคคล ขอแจ้งเตือนยอดค้างชำระ:\nรายการ: ${activeBill?.title || 'ค่าบริการส่วนกลาง'}\nยอดชำระ: ฿${amountToDisplay.toLocaleString('th-TH', { minimumFractionDigits: 2 })}\nกำหนดชำระ: ${activeBill?.dueDate || 'ทันที'}\n\nท่านสามารถสแกน PromptPay QR เพื่อชำระเงินและอัปโหลดสลิปได้ที่ระบบ PayMember Pro ขอบคุณครับ`;
  } else if (notificationType === 'payment_confirmed') {
    messageTitle = '✅ ยืนยันการรับชำระเงินเรียบร้อย';
    fullMessageText = `เรียนคุณ ${selectedMember?.name}\n\nระบบได้รับการชำระเงินเรียบร้อยแล้ว\nรายการ: ${activeBill?.title || 'ค่าบริการ'}\nยอดเงิน: ฿${amountToDisplay.toLocaleString('th-TH', { minimumFractionDigits: 2 })}\nสถานะ: ชำระเรียบร้อย (อนุมัติสลิปผ่าน AI)\n\nสามารถเปิดดูและดาวน์โหลดใบเสร็จรับเงิน E-Receipt ได้ทันที`;
  } else {
    messageTitle = '⚠️ แจ้งเตือนเร่งด่วน: ยอดค้างเกินกำหนด';
    fullMessageText = `แจ้งเตือนเร่งด่วน:\nคุณ ${selectedMember?.name} มียอดค้างชำระเกินกำหนดชำระ ฿${amountToDisplay.toLocaleString('th-TH', { minimumFractionDigits: 2 })}\nกรุณาดำเนินการชำระเพื่อรักษาสิทธิ์ของท่าน`;
  }

  if (customNote.trim()) {
    fullMessageText += `\nหมายเหตุ: ${customNote.trim()}`;
  }

  const handleSendNotification = async () => {
    setIsSending(true);
    setSendSuccessMessage(null);

    try {
      const res = await fetch('/api/line/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: notificationType,
          memberName: selectedMember?.name,
          memberLineId: selectedMember?.lineId,
          amount: amountToDisplay,
          billTitle: activeBill?.title || 'ค่าบริการ',
          dueDate: activeBill?.dueDate,
          lineToken: config.lineNotifyToken,
          webhookUrl: config.lineWebhookUrl,
          customNote,
        }),
      });

      const data = await res.json();
      setSendSuccessMessage(
        data.realSent
          ? 'ส่งการแจ้งเตือนไปยัง LINE เรียบร้อยแล้ว (Real API)'
          : 'จำลองการส่งการแจ้งเตือน LINE สำเร็จ (Simulated & Logged)'
      );
    } catch (e: any) {
      setSendSuccessMessage('จำลองการส่งข้อความแจ้งเตือนสำเร็จ (Offline Ready)');
    } finally {
      setIsSending(false);
      setTimeout(() => setSendSuccessMessage(null), 4000);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(fullMessageText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Direct LINE Share URL
  const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(fullMessageText)}`;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      lineNotifyToken: tokenInput.trim(),
      lineWebhookUrl: webhookInput.trim(),
    });
    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
          <MessageSquare className="w-4 h-4" />
          ระบบแจ้งเตือนผ่าน LINE อัตโนมัติ (LINE Messaging & Flex Simulator)
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#06C755]"></span>
          ระบบแจ้งเตือนและแชร์บิลไปยัง LINE
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          ส่งบิลยอดค้างชำระ ยืนยันการรับเงิน และส่งใบเสร็จให้สมาชิกผ่าน LINE ได้ทันที
        </p>
      </div>

      {/* Main Split: Left Form Controls, Right Smartphone Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Notification Creator & Settings */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Creator Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              สร้างข้อความแจ้งเตือนสมาชิก
            </h3>

            {/* Member selector */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">เลือกสมาชิกเป้าหมาย</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.memberCode}) - ค้างชำระ ฿{m.totalPending.toLocaleString()} [LINE: @{m.lineId}]
                  </option>
                ))}
              </select>
            </div>

            {/* Template Type */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">รูปแบบการแจ้งเตือน</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNotificationType('bill_reminder')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    notificationType === 'bill_reminder'
                      ? 'bg-sky-950/80 border-sky-500 text-sky-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  📢 บิลค้างชำระ
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationType('payment_confirmed')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    notificationType === 'payment_confirmed'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  ✅ ยืนยันยอดเงิน
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationType('overdue_alert')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    notificationType === 'overdue_alert'
                      ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  ⚠️ เกินกำหนด
                </button>
              </div>
            </div>

            {/* Additional note */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">ข้อความเพิ่มเติม (Optional)</label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="เช่น หากชำระแล้วกรุณาส่งสลิปให้ตรวจสอบด้วยครับ"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Send Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleSendNotification}
                disabled={isSending}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#06C755] to-emerald-600 hover:brightness-110 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'กำลังส่งการแจ้งเตือน...' : 'ส่งแจ้งเตือนผ่าน LINE อัตโนมัติ'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={lineShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  แชร์เข้าแอป LINE จริง
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>

                <button
                  onClick={handleCopyMessage}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedText ? 'คัดลอกข้อความแล้ว' : 'คัดลอกข้อความ'}
                </button>
              </div>

              {sendSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{sendSuccessMessage}</span>
                </div>
              )}
            </div>

          </div>

          {/* LINE Token / Webhook Integration Settings */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-base text-white flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-slate-400" />
              ตั้งค่าการเชื่อมต่อ LINE Notify / Webhook (สำหรับยิงออกจริง)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              หากต้องการส่งข้อความแจ้งเตือนเข้ากลุ่ม LINE หรือ LINE Official Account สามารถกรอก Token หรือ Webhook ได้ที่นี่ (หากไม่กรอก ระบบจะทำงานในโหมดจำลอง 100%)
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">LINE Notify Token (ถ้ามี)</label>
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="กรอก LINE Notify Personal Access Token..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">LINE Bot Webhook / n8n / Make Webhook URL (ถ้ามี)</label>
                <input
                  type="url"
                  value={webhookInput}
                  onChange={(e) => setWebhookInput(e.target.value)}
                  placeholder="https://api.line.me/... หรือ Webhook URL"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {savedSettingsSuccess && 'บันทึกการตั้งค่าเรียบร้อย!'}
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 cursor-pointer"
                >
                  บันทึกการตั้งค่า
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Interactive Smartphone Chat Simulator */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[340px] bg-slate-950 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-white/10">
            
            {/* Phone Screen Container */}
            <div className="bg-[#8c9cad] rounded-[32px] overflow-hidden flex flex-col h-[580px] shadow-inner font-['Prompt',sans-serif]">
              
              {/* LINE App Header */}
              <div className="bg-[#202936] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-300">‹</span>
                  <div className="relative">
                    <img
                      src={selectedMember?.avatar}
                      alt={selectedMember?.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#06C755] ring-1 ring-white"></span>
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight truncate max-w-[140px]">{selectedMember?.name}</p>
                    <p className="text-[9px] text-[#06C755] font-medium">PayMember Official</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <span>🔍</span>
                  <span>☰</span>
                </div>
              </div>

              {/* Chat Canvas */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                
                {/* Date separator */}
                <div className="text-center my-1">
                  <span className="text-[10px] text-white bg-black/20 px-2.5 py-0.5 rounded-full font-medium">
                    วันนี้, {new Date().toLocaleDateString('th-TH')}
                  </span>
                </div>

                {/* Simulated LINE Flex Message Bubble */}
                <div className="max-w-[270px] bg-white rounded-2xl shadow-md overflow-hidden text-slate-900 border border-slate-200">
                  
                  {/* Flex Message Header */}
                  <div className={`p-3 text-white ${
                    notificationType === 'payment_confirmed' ? 'bg-[#059669]' : notificationType === 'overdue_alert' ? 'bg-[#dc2626]' : 'bg-[#0284c7]'
                  }`}>
                    <span className="text-[9px] font-bold uppercase tracking-wider block opacity-80">
                      {config.orgName}
                    </span>
                    <h4 className="text-xs font-bold mt-0.5 flex items-center gap-1">
                      {messageTitle}
                    </h4>
                  </div>

                  {/* Flex Message Body */}
                  <div className="p-3.5 space-y-2 text-[11px]">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">สมาชิก:</span>
                      <span className="font-bold text-slate-800">{selectedMember?.name}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">รายการ:</span>
                      <span className="text-slate-800 truncate max-w-[140px]">{activeBill?.title || 'ค่าบริการ'}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">ยอดเงิน:</span>
                      <span className={`text-base font-extrabold ${
                        notificationType === 'payment_confirmed' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        ฿{amountToDisplay.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>กำหนดชำระ:</span>
                      <span className="font-semibold text-slate-700">{activeBill?.dueDate || 'ทันที'}</span>
                    </div>

                    {customNote && (
                      <p className="text-[10px] text-slate-600 italic bg-slate-50 p-1.5 rounded">
                        * {customNote}
                      </p>
                    )}
                  </div>

                  {/* Interactive Action Buttons inside Flex */}
                  <div className="p-2 bg-slate-50 border-t border-slate-100 space-y-1">
                    <button className="w-full py-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-lg font-bold text-[11px] shadow-xs cursor-pointer">
                      ชำระเงินออนไลน์ทันที
                    </button>
                    <button className="w-full py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-[11px] cursor-pointer">
                      ดูใบเสร็จรับเงิน
                    </button>
                  </div>

                </div>

                {/* Status bubble */}
                <div className="text-[9px] text-slate-600 text-right pr-2">
                  อ่านแล้ว • {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                </div>

              </div>

              {/* Chat Input Bar */}
              <div className="bg-white p-2 px-3 flex items-center gap-2 border-t border-slate-200 shrink-0">
                <span className="text-slate-400 text-sm">➕</span>
                <div className="flex-1 bg-slate-100 rounded-full px-3 py-1 text-[11px] text-slate-400">
                  พิมพ์ข้อความ...
                </div>
                <span className="text-[#06C755] text-sm font-bold">➤</span>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
