import { useState, type FormEvent } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import { register } from '../../services/auth';
import { UserAccount } from '../../types';
import { API_ENDPOINTS } from '../../services/apiConfig';

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

 const handleRegister = async (e: FormEvent) => {
  e.preventDefault();
  setErrorMsg(null);
  setLoading(true);
  
  try {
    const response = await fetch(API_ENDPOINTS.AUTH_REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 🍪 BẮT BUỘC PHẢI CÓ DÒNG NÀY ĐỂ NHẬN COOKIE TỪ BACKEND TRẢ VỀ
      credentials: 'include', 
      body: JSON.stringify({
        fullName: fullName,
        email: email,
        password: password,
        heightCm: Number(height),
        gender: gender,
        birthYear: Number(birthYear),
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setSuccessMsg('Đăng ký tài khoản thành công! Đã tự động đăng nhập.');

      // ❌ ĐÃ XÓA BỎ: Không còn lưu 'token' vào localStorage nữa vì token đã nằm trong HttpOnly Cookie.
      // Bạn vẫn có thể lưu thông tin user (không chứa token) nếu muốn hiển thị giao diện nhanh:
      if (data.user) {
        const session = {
          user: data.user,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        };
        localStorage.setItem('cardio_user_session', JSON.stringify(session));
        localStorage.removeItem('cardio_explicit_logout');
      }

      setTimeout(() => {
        onSuccess(data.user);
      }, 800);
    } else {
      setErrorMsg(data.error || 'Đăng ký thất bại');
    }
  } catch (error) {
    setErrorMsg('Không thể kết nối đến máy chủ!');
  } finally {
    setLoading(false);
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
            value={height || ''}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-center font-bold text-slate-800"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Giới tính
          </label>
          <select
            value={gender || ''}
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
            value={birthYear || ''}
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
