// Generates realistic SVG-based Thai Bank Transfer Slips for instant 1-click testing
export interface SampleSlip {
  id: string;
  name: string;
  bankName: string;
  bankColor: string;
  amount: number;
  senderName: string;
  senderAccount: string;
  receiverName: string;
  receiverAccount: string;
  refNumber: string;
  date: string;
  time: string;
  dataUrl: string;
}

function createSlipSvgDataUrl(
  bankName: string,
  primaryColor: string,
  accentColor: string,
  amount: number,
  sender: string,
  senderAcc: string,
  receiver: string,
  receiverAcc: string,
  ref: string,
  dateTime: string
): string {
  const formattedAmount = amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="740" viewBox="0 0 480 740" style="background:#ffffff; font-family:'Prompt',sans-serif;">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${primaryColor}"/>
        <stop offset="100%" stop-color="${accentColor}"/>
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.1"/>
      </filter>
    </defs>

    <!-- Slip Header Container -->
    <rect width="480" height="130" fill="url(#bgGrad)"/>
    
    <!-- Bank Logo Emblem Simulation -->
    <circle cx="55" cy="65" r="26" fill="#ffffff" opacity="0.95"/>
    <text x="55" y="73" font-size="20" font-weight="bold" fill="${primaryColor}" text-anchor="middle">🏦</text>
    
    <text x="95" y="58" font-size="19" font-weight="bold" fill="#ffffff">${bankName}</text>
    <text x="95" y="80" font-size="13" fill="#ffffff" opacity="0.9">หลักฐานการโอนเงินสำเร็จ (Transfer Slip)</text>

    <!-- Main Card Body -->
    <rect x="20" y="110" width="440" height="605" rx="16" fill="#ffffff" filter="url(#shadow)"/>

    <!-- Success Badge -->
    <circle cx="240" cy="155" r="22" fill="#10b981"/>
    <path d="M230 155 L237 162 L250 148" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <text x="240" y="198" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle">โอนเงินสำเร็จ</text>
    <text x="240" y="218" font-size="12" fill="#64748b" text-anchor="middle">${dateTime}</text>

    <!-- Amount Banner -->
    <rect x="40" y="235" width="400" height="75" rx="12" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="240" y="262" font-size="13" fill="#64748b" text-anchor="middle">จำนวนเงิน (THB)</text>
    <text x="240" y="295" font-size="28" font-weight="bold" fill="#0f172a" text-anchor="middle">฿${formattedAmount}</text>

    <!-- Sender Section -->
    <g transform="translate(45, 335)">
      <circle cx="16" cy="16" r="16" fill="#e2e8f0"/>
      <text x="16" y="21" font-size="12" fill="#475569" text-anchor="middle">จาก</text>
      <text x="42" y="16" font-size="14" font-weight="bold" fill="#1e293b">${sender}</text>
      <text x="42" y="32" font-size="12" fill="#64748b">${senderAcc}</text>
    </g>

    <line x1="61" y1="380" x2="61" y2="400" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="3,3"/>

    <!-- Receiver Section (KTB 8420786446 - MBA25 BANK) -->
    <g transform="translate(45, 415)">
      <circle cx="16" cy="16" r="16" fill="#dbeafe"/>
      <text x="16" y="21" font-size="12" fill="#1e40af" text-anchor="middle">ไปยัง</text>
      <text x="42" y="16" font-size="14" font-weight="bold" fill="#1e293b">${receiver}</text>
      <text x="42" y="32" font-size="12" font-weight="bold" fill="#0284c7">${receiverAcc}</text>
    </g>

    <!-- Divider -->
    <line x1="45" y1="475" x2="435" y2="475" stroke="#e2e8f0" stroke-width="1.5"/>

    <!-- Reference & Details -->
    <text x="45" y="505" font-size="13" fill="#64748b">เลขที่อ้างอิง</text>
    <text x="435" y="505" font-size="13" font-weight="bold" fill="#334155" text-anchor="end">${ref}</text>

    <text x="45" y="535" font-size="13" fill="#64748b">ค่าธรรมเนียม</text>
    <text x="435" y="535" font-size="13" fill="#10b981" text-anchor="end">0.00 บาท</text>

    <text x="45" y="565" font-size="13" fill="#64748b">บันทึกช่วยจำ</text>
    <text x="435" y="565" font-size="13" fill="#475569" text-anchor="end">MBA25 BANK ประจำเดือน</text>

    <!-- Bank Stamp -->
    <g transform="translate(190, 595)">
      <rect x="0" y="0" width="100" height="100" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
      <rect x="10" y="10" width="25" height="25" fill="#0284c7"/>
      <rect x="14" y="14" width="17" height="17" fill="#ffffff"/>
      <rect x="18" y="18" width="9" height="9" fill="#0284c7"/>
      
      <rect x="65" y="10" width="25" height="25" fill="#0284c7"/>
      <rect x="69" y="14" width="17" height="17" fill="#ffffff"/>
      <rect x="73" y="18" width="9" height="9" fill="#0284c7"/>

      <rect x="10" y="65" width="25" height="25" fill="#0284c7"/>
      <rect x="14" y="69" width="17" height="17" fill="#ffffff"/>
      <rect x="18" y="73" width="9" height="9" fill="#0284c7"/>

      <rect x="42" y="20" width="16" height="8" fill="#0284c7"/>
      <rect x="40" y="38" width="22" height="22" fill="#0284c7"/>
      <rect x="68" y="44" width="20" height="8" fill="#0284c7"/>
      <rect x="44" y="68" width="18" height="18" fill="#0284c7"/>
      <rect x="70" y="70" width="18" height="18" fill="#0284c7"/>
    </g>
    <text x="240" y="706" font-size="11" fill="#94a3b8" text-anchor="middle">สแกนตรวจสอบสลิป (MBA25 BANK)</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_SLIPS: SampleSlip[] = [
  {
    id: 'ktb-top-300',
    name: 'สลิปกรุงไทย (ท็อป) ฿300.00',
    bankName: 'ธนาคารกรุงไทย (Krungthai)',
    bankColor: '#0284c7',
    amount: 300,
    senderName: 'คุณท็อป',
    senderAccount: 'xxx-9-81234-x (KTB)',
    receiverName: 'MBA25 BANK (ธ.กรุงไทย)',
    receiverAccount: '8420786446',
    refNumber: 'KTB20261003TOP842',
    date: '2026-10-03',
    time: '14:28:15',
    dataUrl: createSlipSvgDataUrl(
      'ธนาคารกรุงไทย (Krungthai)',
      '#0284c7',
      '#0369a1',
      300,
      'คุณท็อป',
      'xxx-9-81234-x (KTB)',
      'MBA25 BANK',
      '8420786446 (ธ.กรุงไทย)',
      'KTB20261003TOP842',
      '03 ต.ค. 2026 - 14:28 น.'
    ),
  },
  {
    id: 'kbank-miew-300',
    name: 'สลิปกสิกรไทย (เหมียว) ฿300.00',
    bankName: 'ธนาคารกสิกรไทย (KBank)',
    bankColor: '#059669',
    amount: 300,
    senderName: 'คุณเหมียว',
    senderAccount: 'xxx-1-44789-x (KBank)',
    receiverName: 'MBA25 BANK (ธ.กรุงไทย)',
    receiverAccount: '8420786446',
    refNumber: '014277153641BLP04938',
    date: '2026-10-03',
    time: '11:15:42',
    dataUrl: createSlipSvgDataUrl(
      'ธนาคารกสิกรไทย (KBank)',
      '#059669',
      '#047857',
      300,
      'คุณเหมียว',
      'xxx-1-44789-x (KBank)',
      'MBA25 BANK',
      '8420786446 (ธ.กรุงไทย)',
      '014277153641BLP04938',
      '03 ต.ค. 2026 - 11:15 น.'
    ),
  },
  {
    id: 'scb-june-300',
    name: 'สลิปไทยพาณิชย์ (จูน) ฿300.00',
    bankName: 'ธนาคารไทยพาณิชย์ (SCB)',
    bankColor: '#4f46e5',
    amount: 300,
    senderName: 'คุณจูน',
    senderAccount: 'xxx-7-62104-x (SCB)',
    receiverName: 'MBA25 BANK (ธ.กรุงไทย)',
    receiverAccount: '8420786446',
    refNumber: 'SCB20261003998124',
    date: '2026-10-03',
    time: '09:40:02',
    dataUrl: createSlipSvgDataUrl(
      'ธนาคารไทยพาณิชย์ (SCB)',
      '#4f46e5',
      '#4338ca',
      300,
      'คุณจูน',
      'xxx-7-62104-x (SCB)',
      'MBA25 BANK',
      '8420786446 (ธ.กรุงไทย)',
      'SCB20261003998124',
      '03 ต.ค. 2026 - 09:40 น.'
    ),
  },
];
