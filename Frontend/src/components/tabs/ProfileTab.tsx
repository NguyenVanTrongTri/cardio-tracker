import { useState, useMemo, useEffect, type FormEvent } from 'react';
import {
  User,
  Target,
  CheckCircle2,
  Activity,
  Flame,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Dumbbell
} from 'lucide-react';
import { getStoredProfile, saveStoredProfile, getLatestBodyMetric } from '../../services/storage';
import { getCurrentUser, logout, subscribeAuth } from '../../services/auth';
import { UserProfile, UserAccount } from '../../types';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import AuthModal from '../auth/AuthModal';

export interface ProfileTabProps {
  onAddNotification?: (title: string, message: string) => void;
}

export default function ProfileTab({ onAddNotification }: ProfileTabProps) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(getCurrentUser());
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile());
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  // Modals state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setCurrentUser(user);
      setProfile(getStoredProfile());
    });
    return unsubscribe;
  }, []);

  const latestMetric = useMemo(() => getLatestBodyMetric(), []);

  const handleMedicalToggle = (condition: string) => {
    const current = profile.medicalConditions || [];
    if (condition === 'NONE') {
      setProfile({ ...profile, medicalConditions: ['NONE'] });
      return;
    }
    const filtered = current.filter((c) => c !== 'NONE');
    const updated = filtered.includes(condition)
      ? filtered.filter((c) => c !== condition)
      : [...filtered, condition];

    setProfile({
      ...profile,
      medicalConditions: updated.length === 0 ? ['NONE'] : updated,
    });
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    saveStoredProfile(profile);
    onAddNotification?.(
      'Cập nhật thành công! 🎉',
      'Đã cập nhật hồ sơ và mục tiêu thành công!'
    );
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-4 pb-28 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Hồ Sơ & Mục Tiêu Cá Nhân
        </h1>
        <p className="text-xs text-slate-500">
          Quản lý tài khoản, thông số sinh học và chỉ số giảm mỡ
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* 1. Thông Tin Sinh Học & Số Đo Chi Tiết */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <User size={18} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Thông Tin Sinh Học & Số Đo Body
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              value={profile.fullName || ''}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Chiều cao (cm)
              </label>
              <input
                type="number"
                min="100"
                step="1"
                max="230"
                value={profile.heightCm || ''}
                onChange={(e) =>
                  setProfile({ ...profile, heightCm: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-center text-sm font-bold text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Giới tính
              </label>
              <select
                value={profile.gender || 'MALE'}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value as 'MALE' | 'FEMALE' })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-center text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Năm sinh
              </label>
              <input
                type="number"
                min="1970"
                max="2015"
                value={profile.birthYear || ''}
                onChange={(e) =>
                  setProfile({ ...profile, birthYear: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-center text-sm font-bold text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Cân nặng (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="200"
                value={profile.weightKg || ''}
                onChange={(e) =>
                  setProfile({ ...profile, weightKg: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-center text-sm font-bold text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Vòng eo hiện tại (Thuộc tính cốt lõi) */}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-indigo-900 mb-1">
              Vòng eo hiện tại (cm) *
            </label>
            <input
              type="number"
              step="0.5"
              min="40"
              max="180"
              value={profile.waistCm || ''}
              onChange={(e) =>
                setProfile({ ...profile, waistCm: Number(e.target.value) })
              }
              placeholder="Nhập vòng eo hiện tại"
              className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl px-3 py-2 text-sm font-extrabold text-indigo-950 focus:outline-none"
            />
          </div>

          {/* Toggle mở rộng số đo các bộ phận khác */}
          <button
            type="button"
            onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
            className="w-full flex items-center justify-between pt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            <span>{showAdvancedMetrics ? 'Ẩn số đo các bộ phận khác' : '+ Bổ sung số đo các bộ phận (Mông, Ngực, Bắp tay...)'}</span>
            {showAdvancedMetrics ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showAdvancedMetrics && (
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 animate-in fade-in">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Vòng Mông (cm)</label>
                <input
                  type="number"
                  min="0"
                  value={profile.hipCm || ''}
                  onChange={(e) => setProfile({ ...profile, hipCm: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-center text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Vòng Ngực (cm)</label>
                <input
                  type="number"
                  min="0"
                  value={profile.chestCm || ''}
                  onChange={(e) => setProfile({ ...profile, chestCm: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-center text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Bắp Tay (cm)</label>
                <input
                  type="number"
                  min="0"
                  value={profile.bicepsCm || ''}
                  onChange={(e) => setProfile({ ...profile, bicepsCm: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-center text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Vòng Đùi (cm)</label>
                <input
                  type="number"
                  min="0"
                  value={profile.thighCm || ''}
                  onChange={(e) => setProfile({ ...profile, thighCm: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-center text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Vòng Cổ (cm)</label>
                <input
                  type="number"
                  min="0"
                  value={profile.neckCm || ''}
                  onChange={(e) => setProfile({ ...profile, neckCm: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-center text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">% Mỡ Cơ Thể (%)</label>
                <input
                  type="number"
                  min="0"
                  readOnly
                  value={profile.bodyFatPercentage || ''}
                  onChange={(e) => setProfile({ ...profile, bodyFatPercentage: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-center text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Vận Động & Môi Trường Tập Luyện */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Activity size={18} className="text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Vận Động & Môi Trường
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Mức độ hoạt động hàng ngày của bạn
            </label>
            <select
              value={profile.activityLevel || 'SEDENTARY'}
              onChange={(e) =>
                setProfile({ ...profile, activityLevel: e.target.value as any })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="SEDENTARY">Ít vận động (Dân văn phòng, chỉ ngồi)</option>
              <option value="LIGHT">Vận động nhẹ (Tập 1-3 buổi/tuần)</option>
              <option value="MODERATE">Vận động vừa (Tập 3-5 buổi/tuần)</option>
              <option value="ACTIVE">Vận động nhiều (Tập 6-7 buổi/tuần)</option>
              <option value="VERY_ACTIVE">Cường độ rất cao (VĐV / Lao động nặng)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Môi trường tập luyện
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProfile({ ...profile, workoutEnvironment: 'HOME' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  profile.workoutEnvironment === 'HOME'
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Dumbbell size={14} /> Tập Tại Nhà
              </button>
              <button
                type="button"
                onClick={() => setProfile({ ...profile, workoutEnvironment: 'GYM' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  profile.workoutEnvironment === 'GYM'
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Flame size={14} /> Phòng Gym
              </button>
            </div>
          </div>
        </div>

        {/* 3. Tiền Sử Bệnh Lý Nền */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <ShieldAlert size={18} className="text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Tiền Sử Bệnh Lý Nền (An Toàn)
            </h3>
          </div>

          <p className="text-[11px] text-slate-500">
            Chọn các vấn đề sức khỏe của bạn để hệ thống tối ưu bài tập và lượng thâm hụt calo an toàn:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'NONE', label: 'Không có bệnh lý' },
              { id: 'CARDIOVASCULAR', label: 'Tim mạch / Huyết áp' },
              { id: 'JOINT_BONE', label: 'Đau khớp / Cột sống' },
              { id: 'DIABETES', label: 'Tiểu đường' },
              { id: 'ASTHMA', label: 'Hen suyễn / Hô hấp' },
            ].map((item) => {
              const isChecked = profile.medicalConditions?.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleMedicalToggle(item.id)}
                  className={`py-2 px-2.5 rounded-xl border text-left text-[11px] font-bold transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {isChecked ? '✓ ' : '+ '} {item.label}
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Ghi chú sức khỏe thêm (nếu có)
            </label>
            <input
              type="text"
              value={profile.medicalNotes || ''}
              onChange={(e) => setProfile({ ...profile, medicalNotes: e.target.value })}
              placeholder="Ví dụ: Đã từng mổ dây chằng, dị ứng..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {/* 4. Thiết Lập Mục Tiêu Giảm Mỡ */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Target size={18} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Thiết Lập Mục Tiêu Giảm Mỡ
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200/80">
              <label className="block text-xs font-bold text-emerald-800 mb-1">
                Mục Tiêu Vòng Eo (cm)
              </label>
              <input
                type="number"
                step="0.5"
                min="50"
                max="150"
                value={profile.targetWaistCm || ''}
                onChange={(e) =>
                  setProfile({ ...profile, targetWaistCm: Number(e.target.value) })
                }
                className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-lg font-black text-emerald-950 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <span className="text-[10px] text-emerald-700 block text-center mt-1 font-medium">
                Khuyến nghị: {(profile.heightCm ? profile.heightCm * 0.48 : 80).toFixed(1)} cm
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mục Tiêu Cân Nặng (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="40"
                max="150"
                value={profile.targetWeightKg || ''}
                onChange={(e) =>
                  setProfile({ ...profile, targetWeightKg: Number(e.target.value) })
                }
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-lg font-black text-slate-900 text-center focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 block text-center mt-1">
                Hiện tại: {latestMetric?.weightKg || profile.weightKg || '--'} kg
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Tốc độ giảm cân mong muốn / tuần
            </label>
            <select
              value={profile.weeklyGoalKg || 0.5}
              onChange={(e) =>
                setProfile({ ...profile, weeklyGoalKg: Number(e.target.value) })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value={0.25}>Chậm & Bền vững (-0.25 kg/tuần)</option>
              <option value={0.5}>Tiêu chuẩn (-0.5 kg/tuần)</option>
              <option value={0.75}>Nhanh (-0.75 kg/tuần)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Hạn định hoàn thành (Target Date)
            </label>
            <input
              type="date"
              value={profile.targetDate || ''}
              onChange={(e) => setProfile({ ...profile, targetDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Nút Lưu Thay Đổi */}
        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm py-3.5 px-4 rounded-2xl shadow-md active:scale-[0.99] transition-all cursor-pointer"
        >
          LƯU THAY ĐỔI
        </button>
      </form>

      {/* Modals */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Xác nhận đăng xuất?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản <strong>{currentUser?.email}</strong> không?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      )}

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setProfile(getStoredProfile());
        }}
      />
    </div>
  );
}