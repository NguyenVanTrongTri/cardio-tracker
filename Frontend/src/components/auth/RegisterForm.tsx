import { useState, type FormEvent } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import { register } from '../../services/auth';
import { UserAccount } from '../../types';

interface RegisterFormProps {
  onSuccess: (user: UserAccount) => void;
  onSwitchToLogin: () => void;
  setErrorMsg: (msg: string | null) => void;
  setSuccessMsg: (msg: string | null) => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
}

export default function RegisterForm({
  onSuccess,
  onSwitchToLogin,
  setErrorMsg,
  setSuccessMsg,
  setLoading,
  loading,
}: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [height, setHeight] = useState(173);
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [birthYear, setBirthYear] = useState(1996);

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = register({
      fullName: fullName,
      email: email,
      password: password,
      heightCm: Number(height),
      gender: gender,
      birthYear: Number(birthYear),
    });
    setLoading(false);

    if (res.success && res.user) {
      setSuccessMsg('Đăng ký tài khoản thành công! Đã tự động đăng nhập.');
      setTimeout(() => {
        onSuccess(res.user!);
      }, 800);
    } else {
      setErrorMsg(res.error || 'Đăng ký thất bại');
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Họ và tên
        </label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Email
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Mật khẩu (tối thiểu 6 ký tự)
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
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

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Chiều cao (cm)
          </label>
          <input
            type="number"
            min="120"
            max="230"
            required
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-center font-bold text-slate-800"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Giới tính
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-1.5 py-2 text-xs text-center font-bold text-slate-800"
          >
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Năm sinh
          </label>
          <input
            type="number"
            min="1940"
            max="2015"
            required
            value={birthYear}
            onChange={(e) => setBirthYear(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-center font-bold text-slate-800"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
      >
        <span>{loading ? 'Đang tạo tài khoản...' : 'TẠO TÀI KHOẢN NGAY'}</span>
        <Sparkles size={15} />
      </button>

      <div className="text-center pt-1">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          Bạn đã có tài khoản? Đăng nhập ngay
        </button>
      </div>
    </form>
  );
}
