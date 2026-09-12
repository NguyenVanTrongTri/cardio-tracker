import {
  Flame,
  Zap,
  Target,
  ShieldAlert,
  TrendingUp,
  Activity,
  CheckCircle2,
  ArrowRight,
  LogIn,
  UserPlus,
  Heart,
  Scale,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { login } from '../../services/auth';
import { UserAccount } from '../../types';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  onOpenAdminDirect?: () => void;
}

export default function LandingPage({
  onOpenLogin,
  onOpenRegister,
  onLoginSuccess,
  onOpenAdminDirect,
}: LandingPageProps) {
  const handleQuickAdminLogin = () => {
    const res = login('admin@cardiotracker.com', 'admin123456');
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      if (onOpenAdminDirect) onOpenAdminDirect();
    }
  };

  const handleQuickDemoLogin = () => {
    const res = login('trongtriww@gmail.com', 'password123');
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Bar */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Flame size={20} className="fill-white" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white leading-tight">
              Cardio Tracker
            </h1>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
              Hệ thống giảm mỡ khoa học
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleQuickAdminLogin}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-xs font-bold text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Đăng nhập trực tiếp bằng tài khoản Quản trị viên"
          >
            <ShieldCheck size={14} />
            <span className="hidden sm:inline">Admin Portal</span>
          </button>

          <button
            onClick={onOpenLogin}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogIn size={13} />
            <span>Đăng Nhập</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-5 py-6 space-y-6 flex-1 max-w-lg mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
            <Sparkles size={12} />
            <span>MỤC TIÊU GIẢM CÂN KHOA HỌC</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Tối Ưu Đốt Mỡ Thừa <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Chuẩn Khoa Học Zone 2
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
            Hệ thống ghi nhận cardio trên máy chạy bộ với 3 giai đoạn chuẩn y học, siết cơ bụng, kiểm soát nhịp tim và ngăn ngừa dị hóa cơ bắp do cortisol.
          </p>
        </div>

        {/* Live Preview Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-4.5 shadow-xl relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-slate-300">Buổi tập hiệu quả</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 size={12} />
              Zone 2 Certified
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-700/50 text-center font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Thời Gian</span>
              <span className="text-sm font-bold text-white">43 phút</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Tiêu Hao</span>
              <span className="text-sm font-bold text-orange-400">338.5 kcal</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Mật Độ</span>
              <span className="text-sm font-bold text-emerald-400">7.87 cal/p</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-700/50">
            <span className="text-slate-400 font-mono">Độ dốc 8.5° Tốc độ 5.2 km/h</span>
          </div>
        </div>

        {/* 4 Pillars Features List */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-800/50 border border-slate-700/60 p-3.5 rounded-2xl space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Activity size={18} />
            </div>
            <h3 className="text-xs font-black text-white">3 Giai Đoạn Chuẩn</h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              Khởi động, Đốt mỡ dốc cao, Hạ nhiệt thư giãn.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-3.5 rounded-2xl space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
            <h3 className="text-xs font-black text-white">Cảnh Báo Cortisol</h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              Tự động cảnh báo khi tập quá 50 phút để chống mất cơ.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-3.5 rounded-2xl space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <h3 className="text-xs font-black text-white">Biểu Đồ Eo & Ký</h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              Theo dõi trực quan tiến trình giảm mỡ.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-3.5 rounded-2xl space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Heart size={18} />
            </div>
            <h3 className="text-xs font-black text-white">BMR & Vùng Nhịp Tim</h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              Tính toán cá nhân hóa nhịp tim tối ưu đốt mỡ theo độ tuổi.
            </p>
          </div>
        </div>

        {/* Call to Actions (CTA) */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onOpenLogin}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>ĐĂNG NHẬP VÀO TÀI KHOẢN</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={handleQuickAdminLogin}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-xs rounded-2xl border border-emerald-500/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck size={16} />
            <span>VÀO CỔNG QUẢN TRỊ VIÊN (ADMIN)</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
        Đăng nhập an toàn • Lưu trữ dữ liệu cá nhân • Tiêu chuẩn khoa học
        <br />
        Đội ngũ phát triển: <span className="font-bold text-slate-300">Nguyễn Văn Trọng Trí</span>
        <br />
        © 2026 Cardio Tracker. All rights reserved.
      </div>
    </div>
  );
}
