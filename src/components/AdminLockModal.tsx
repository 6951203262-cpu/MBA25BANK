import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, ShieldAlert, X, Sparkles, Check } from 'lucide-react';

interface AdminLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctPin: string;
  onSuccess: () => void;
  onChangePin?: (newPin: string) => void;
}

export const AdminLockModal: React.FC<AdminLockModalProps> = ({
  isOpen,
  onClose,
  correctPin,
  onSuccess,
  onChangePin,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === correctPin) {
      setErrorMsg('');
      setPin('');
      onSuccess();
      onClose();
    } else {
      setErrorMsg('รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      setPin('');
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== correctPin) {
      setErrorMsg('รหัสผ่านปัจจุบันไม่ถูกต้อง');
      return;
    }
    if (newPin.length < 4) {
      setErrorMsg('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 หลัก');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMsg('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน');
      return;
    }

    if (onChangePin) {
      onChangePin(newPin);
      setSuccessNotice('เปลี่ยนรหัสผ่านแอดมินเรียบร้อยแล้ว!');
      setTimeout(() => {
        setIsChangingPin(false);
        setSuccessNotice('');
        setPin('');
        setNewPin('');
        setConfirmPin('');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in font-['Prompt',sans-serif]">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl border border-pink-100 p-6 text-slate-700">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cute Icon */}
        <div className="text-center mb-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-300 to-amber-200 flex items-center justify-center shadow-lg shadow-pink-200/50 mb-3">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center justify-center gap-1.5">
            ยืนยันรหัสผ่านผู้ดูแลระบบ
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isChangingPin 
              ? 'กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่' 
              : 'ต้องใช้รหัสผ่านเพื่อเข้าถึงสิทธิ์ผู้ดูแลระบบ'}
          </p>
        </div>

        {!isChangingPin ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="กรอกรหัสผ่านผู้ดูแลระบบ"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-center text-xl font-mono tracking-widest text-slate-800 placeholder:text-xs placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:border-pink-400 transition-colors"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-500 text-center flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-sm shadow-md shadow-pink-200 transition-all cursor-pointer"
              >
                ปลดล็อกโหมดแอดมิน
              </button>

              <div className="flex items-center justify-end pt-2 text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPin(true);
                    setErrorMsg('');
                  }}
                  className="text-pink-500 hover:underline cursor-pointer"
                >
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePinSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1">รหัสผ่านปัจจุบัน</label>
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="กรอกรหัสผ่านเดิม"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono text-center focus:outline-none focus:border-pink-400"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">รหัสผ่านใหม่ (อย่างน้อย 4 หลัก)</label>
              <input
                type="password"
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="รหัสผ่านใหม่"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono text-center focus:outline-none focus:border-pink-400"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">ยืนยันรหัสผ่านใหม่อีกครั้ง</label>
              <input
                type="password"
                required
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="ยืนยันรหัสผ่านใหม่"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono text-center focus:outline-none focus:border-pink-400"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-500 text-center">{errorMsg}</p>
            )}

            {successNotice && (
              <p className="text-xs text-emerald-600 text-center font-bold flex items-center justify-center gap-1">
                <Check className="w-4 h-4" /> {successNotice}
              </p>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPin(false);
                  setErrorMsg('');
                }}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 font-medium cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold cursor-pointer shadow-sm"
              >
                บันทึกรหัสใหม่
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
