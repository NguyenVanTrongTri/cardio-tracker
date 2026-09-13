import { useState, type FormEvent } from 'react';
import {
  X,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Sparkles
} from 'lucide-react';
import { requestPasswordReset, verifyAndResetPassword } from '../../services/auth';
import { UserAccount } from '../../types';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
  onSuccess?: (user: UserAccount) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Forgot password inputs
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [generatedOtpDisplay, setGeneratedOtpDisplay] = useState<string | null>(null);
  const [stepForgot, setStepForgot] = useState<'request' | 'verify'>('request');

  // Status feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  if (!isOpen) return null;

  const handleRequestOtp = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = requestPasswordReset(forgotEmail);
    if (res.success && res.otp) {
      setGeneratedOtpDisplay(res.otp);
      setResetOtp(res.otp); // prefill for easy instant testing
      setStepForgot('verify');
      setSuccessMsg(`Mã xác thực OTP bảo mật đã được tạo: ${res.otp}`);
    } else {
      setErrorMsg(res.error || 'Không tìm thấy tài khoản');
    }
  };

  const handleResetPassword = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = verifyAndResetPassword(forgotEmail, resetOtp, newPassword);
    if (res.success) {
      setSuccessMsg('Đặt lại mật khẩu thành công! Hãy đăng nhập với mật khẩu mới.');
      setTimeout(() => {
        setMode('login');
        setStepForgot('request');
        setSuccessMsg(null);
      }, 1200);
    } else {
      setErrorMsg(res.error || 'Xác thực OTP thất bại');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        {/* Brand / Mode Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-2.5 shadow-xs">
            {mode === 'login' && <User size={24} />}
            {mode === 'register' && <Sparkles size={24} />}
            {mode === 'forgot' && <KeyRound size={24} />}
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {mode === 'login' && 'Đăng Nhập Tài Khoản'}
            {mode === 'register' && 'Tạo Tài Khoản Mới'}
            {mode === 'forgot' && 'Khôi Phục Mật Khẩu'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === 'login' && 'Quản lý lịch sử tập luyện và tiến trình giảm mỡ của bạn'}
            {mode === 'register' && 'Bắt đầu hành trình siết cơ bụng và đốt mỡ'}
            {mode === 'forgot' && 'Nhập email để nhận mã xác thực mật khẩu mới'}
          </p>
        </div>

        {/* Tab Switcher (Login / Register) */}

        {/* Feedback Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORMS */}
        {mode === 'login' && (
          <LoginForm
            onSuccess={onSuccess ? onSuccess : () => {}}
            onSwitchToRegister={() => {
              setMode('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            onSwitchToForgot={() => {
              setMode('forgot');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            setErrorMsg={setErrorMsg}
            setSuccessMsg={setSuccessMsg}
            setLoading={setLoading}
            loading={loading}
          />
        )}

        {mode === 'register' && (
          <RegisterForm
            onSuccess={onSuccess ? onSuccess : () => {}}
            onSwitchToLogin={() => {
              setMode('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            setErrorMsg={setErrorMsg}
            setSuccessMsg={setSuccessMsg}
            setLoading={setLoading}
            loading={loading}
          />
        )}

        {/* 3. FORGOT PASSWORD FLOW */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            {stepForgot === 'request' ? (
              <form onSubmit={handleRequestOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nhập email tài khoản của bạn
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="trongtriww@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Hệ thống sẽ tạo mã OTP xác minh an toàn để cấp mật khẩu mới.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound size={15} />
                  <span>GỬI MÃ XÁC THỰC OTP</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Quay lại Đăng nhập
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                {generatedOtpDisplay && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <span className="font-bold block">Mã xác thực OTP (15 phút):</span>
                    <span className="text-lg font-black font-mono tracking-widest text-amber-900 block my-1">
                      {generatedOtpDisplay}
                    </span>
                    <span className="text-[10px] text-amber-700">
                      (Đã tự động điền vào ô bên dưới để bạn đặt lại mật khẩu nhanh)
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mã OTP 6 chữ số
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-center font-mono text-base font-black tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck size={15} />
                  <span>XÁC NHẬN ĐỔI MẬT KHẨU</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setStepForgot('request')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Gửi lại mã OTP
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
