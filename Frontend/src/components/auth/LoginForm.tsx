import { useState, type FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserAccount } from '../../types';

interface LoginFormProps {
  onSuccess: (user: UserAccount) => void;
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
  setErrorMsg: (msg: string | null) => void;
  setSuccessMsg: (msg: string | null) => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
}

export default function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onSwitchToForgot,
  setErrorMsg,
  setSuccessMsg,
  setLoading,
  loading,
}: LoginFormProps) {
  const [email, setEmail] = useState('trongtriww@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleFillAdmin = () => {
    setEmail('admin@cardiotracker.com');
    setPassword('admin123');
    setErrorMsg(null);
    setSuccessMsg('Đã điền thông tin tài khoản Quản Trị Viên (Admin). Bấm ĐĂNG NHẬP để tiếp tục!');
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await fetch('https://backendcardio.vercel.app/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { error: rawText || 'Invalid JSON response' };
      }
      
      if (response.ok && data.success && data.user) {
        setSuccessMsg(`Chào mừng bạn trở lại, ${data.user.fullName}!`);
        if (rememberMe) {
          const sessionData = {
            user: data.user,
            token: data.token,
            expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
          };
          
          localStorage.setItem('cardio_session_v2', JSON.stringify(sessionData));
          localStorage.setItem('cardio_user', JSON.stringify(data.user));
        }
        setTimeout(() => {
          onSuccess(data.user as UserAccount);
        }, 700);
      }
      else {
        setErrorMsg(data.error || `Lỗi server HTTP ${response.status}`);
      }
    } catch (err: any) {
      console.error('Network/Fetch Catch Error:', err);
      setErrorMsg(`Network Error: ${err.message || 'Không kết nối được server'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-3.5">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Địa chỉ Email
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-slate-600">
            Mật khẩu
          </label>
          <button
            type="button"
            onClick={onSwitchToForgot}
            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <span>Ghi nhớ đăng nhập</span>
        </label>

        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600"
        >
          Tạo tài khoản
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
      >
        <span>{loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}</span>
        <ArrowRight size={15} />
      </button>

      {/* Quick Admin fill button */}
      <div className="pt-2 border-t border-slate-100 mt-2">
        <button
          type="button"
          onClick={handleFillAdmin}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>⚡ Điền tài khoản Admin (admin@cardiotracker.com)</span>
        </button>
      </div>
    </form>
  );
}