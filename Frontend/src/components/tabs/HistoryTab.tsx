import { useState, useMemo, useEffect, type FormEvent } from 'react';
import {
  Calendar,
  Flame,
  Timer,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Trash2,
  Edit3,
  Droplets,
  Zap,
  ChevronDown,
  ChevronUp,
  Activity,
  Filter,
  ShieldAlert,
  Info
} from 'lucide-react';
import { WorkoutCard } from './HistoryTab/WorkoutCard';
import { EquipmentType, WorkoutPhase, WorkoutRecord } from '../../types';
import { getEquipmentDef } from '../workout/equipmentData';
import { Bike, Waves, Footprints, Compass } from 'lucide-react';
import { API_ENDPOINTS } from '../../services/apiConfig';
const getAuthToken = () => {
  let token = '';
  const sessionData = localStorage.getItem('cardio_session_v2');
  if (sessionData) {
    try {
      const parsed = JSON.parse(sessionData);
      token = parsed.token;
    } catch (e) {
      console.error('Lỗi đọc session token:', e);
    }
  }
  if (!token) {
    token = localStorage.getItem('token') || '';
  }
  return token;
};

export default function HistoryTab() {
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'zone2' | 'cortisol'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Delete modal state
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit modal state
  const [editingWorkout, setEditingWorkout] = useState<WorkoutRecord | null>(null);
  const [isPhasesExpanded, setIsPhasesExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.WORKOUTS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // ❌ ĐÃ XÓA BỎ: Không cần Authorization Bearer token nữa vì đã dùng HttpOnly Cookie
        },
        // 🍪 BẮT BUỘC: Cho phép trình duyệt đính kèm Cookie chứa token lên Backend
        credentials: 'include', 
      });

      if (response.ok) {
        const data = await response.json();
        
        // 🛠️ Ánh xạ chuẩn các trường dữ liệu từ backend sang state của frontend
        const formattedData = (data.data || []).map((w: any) => ({
          ...w,
          phases: w.workoutPhases || [],
          efficiencyIndex: w.efficiencyIndex || "0.0",
          weightKg: w.weightKg || null,
          waistCm: w.waistCm || null,
          // Đảm bảo mapping trường cal/p (lấy từ calPerMinute do backend tính toán trả về)
          calPerMinute: w.calPerMinute || (w.activeTime > 0 ? (Number(w.calories) / Number(w.activeTime)).toFixed(1) : "0.0"),
        }));
        
        setWorkouts(formattedData);
      } else {
        console.error('Lỗi tải dữ liệu buổi tập');
      }
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredWorkouts = useMemo(() => {
    let sorted = [...workouts].sort((a, b) => 
      new Date(b.workoutStartTime).getTime() - new Date(a.workoutStartTime).getTime()
    );

    if (filter === 'zone2') {
      return sorted.filter((w) => w.isZone2);
    }
    if (filter === 'cortisol') {
      return sorted.filter((w) => w.cortisolAlert);
    }
    return sorted;
  }, [workouts, filter]);

  const confirmDelete = async () => {
  if (!deleteCandidateId) return;
  setIsDeleting(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.WORKOUTS}/${deleteCandidateId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 🍪 BẮT BUỘC: Gửi kèm HttpOnly Cookie lên server để xác thực quyền xóa
      });
      
      if (response.ok) {
        setWorkouts(workouts.filter(w => w.id !== deleteCandidateId));
        setDeleteCandidateId(null);
      } else {
        console.error('Lỗi xóa buổi tập');
      }
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateWorkout = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingWorkout) return;
    setIsUpdating(true);

    try {
      const response = await fetch(`${API_ENDPOINTS.WORKOUTS}/${editingWorkout.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        
        // 🛠️ Xử lý gọn gàng không bị lỗi type của TypeScript
        body: JSON.stringify({
            ...editingWorkout,
            weightKg: editingWorkout.weightKg ? Number(editingWorkout.weightKg) : null,
            waistCm: editingWorkout.waistCm ? Number(editingWorkout.waistCm) : null,
            waterConsumedMl: Number(editingWorkout.waterConsumedMl || 0),
            workoutPhases: editingWorkout.phases || [],
        }),
      });

      if (response.ok) {
        setEditingWorkout(null);
        loadData();
      } else {
        console.error('Lỗi cập nhật buổi tập');
      }
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      const hour = String(date.getUTCHours()).padStart(2, '0');
      const minute = String(date.getUTCMinutes()).padStart(2, '0');

      // Lấy ngày hiện tại ở dạng YYYY-MM-DD để so sánh
      const today = new Date();
      
      const isToday = 
        date.getUTCFullYear() === today.getUTCFullYear() &&
        date.getUTCMonth() === today.getUTCMonth() &&
        date.getUTCDate() === today.getUTCDate();

      // Nếu là hôm nay thì hiển thị "Hôm nay"
      if (isToday) {
        return `${hour}:${minute} Hôm nay`;
      }

      // Nếu không phải hôm nay thì hiển thị đầy đủ thứ, ngày/tháng/năm
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      const weekdayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const weekday = weekdayNames[date.getUTCDay()];

      return `${hour}:${minute} ${weekday}, ${day}/${month}/${year}`;
    } catch {
      return isoStr;
    }
  };

  const getEquipmentIcon = (type?: EquipmentType) => {
    switch (type) {
      case 'STATIONARY_BIKE':
        return <Bike size={16} className="text-blue-500" />;
      case 'ROWING_MACHINE':
        return <Waves size={16} className="text-cyan-500" />;
      case 'STAIR_CLIMBER':
        return <Footprints size={16} className="text-amber-500" />;
      case 'OUTDOOR_RUN':
        return <Compass size={16} className="text-purple-500" />;
      case 'TREADMILL':
      default:
        return <Flame size={16} className="text-emerald-500 fill-emerald-500" />;
    }
  };

  const renderPhaseDetails = (p: WorkoutPhase, eq?: EquipmentType) => {
    if (eq === 'STATIONARY_BIKE') {
      return `Mức ${p.resistanceLevel || 0} • ${p.cadenceRpm || 70} RPM`;
    }
    if (eq === 'ROWING_MACHINE') {
      return `Damper ${p.resistanceLevel || 0} • ${p.strokeRateSpm || 24} SPM`;
    }
    if (eq === 'STAIR_CLIMBER') {
      return `Mức ${p.resistanceLevel || 0} • ${p.stepsPerMin || 60} bậc/p`;
    }
    return `Dốc ${p.inclineDegree}° • ${p.speedKmh} km/h`;
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-4 pb-28 space-y-4">
      {/* Header & Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Lịch Sử Buổi Tập
          </h1>
          <p className="text-xs text-slate-500">
            {workouts.length} buổi tập đã ghi nhận
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('zone2')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === 'zone2' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Zone 2
          </button>
          <button
            onClick={() => setFilter('cortisol')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === 'cortisol' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Cảnh báo
          </button>
        </div>
      </div>

      {/* Loading & Empty State */}
      {isLoading && (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs">
          <Activity size={32} className="mx-auto text-slate-300 mb-2 animate-spin" />
          <p className="text-sm font-bold text-slate-700">Đang tải lịch sử tập...</p>
        </div>
      )}
      {!isLoading && filteredWorkouts.length === 0 && (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs">
          <Activity size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-700">Chưa có dữ liệu phù hợp</p>
          <p className="text-xs text-slate-400 mt-1">
            Hãy sang tab "Tập Luyện" để ghi nhận buổi cardio mới nhất!
          </p>
        </div>
      )}

      {/* Workout Cards List */}
      <div className="space-y-3.5">
        {filteredWorkouts.map((w) => {
          const isExpanded = expandedId === w.id;
          const p2 = w.phases.find((p) => p.phaseNumber === 2);
          const eqDef = getEquipmentDef(w.equipmentType || 'TREADMILL');

          return (
            <WorkoutCard
              key={w.id}
              workout={w}
              isExpanded={isExpanded}
              onToggleExpand={() => setExpandedId(isExpanded ? null : w.id)}
              onEdit={() => setEditingWorkout(w)}
              onDelete={() => setDeleteCandidateId(w.id)}
              getEquipmentDef={getEquipmentDef}
              getEquipmentIcon={getEquipmentIcon}
              formatDate={formatDate}
              renderPhaseDetails={renderPhaseDetails}
            />
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidateId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Xác nhận xóa buổi tập?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thao tác này sẽ xóa vĩnh viễn buổi tập khỏi lịch sử và cập nhật lại biểu đồ thống kê.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteCandidateId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className={`flex-1 py-2.5 ${isDeleting ? 'bg-rose-400' : 'bg-rose-600 hover:bg-rose-700'} text-white rounded-xl font-bold text-xs transition-colors shadow-xs`}
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit Modal */}
      {editingWorkout && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          {/* Khung modal card chính: Đặt max-h và overflow-y-auto ở đây để thanh cuộn nằm gọn bên trong khung trắng */}
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-100 flex flex-col">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Chỉnh Sửa Buổi Tập
                </h3>
              </div>
              <button
                onClick={() => setEditingWorkout(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateWorkout} className="space-y-4 text-xs">
              
              {/* 1. Thời gian bắt đầu */}
              <div>
                <label className="block text-slate-600 font-bold mb-1">Thời gian bắt đầu</label>
                <input
                  type="datetime-local"
                  value={editingWorkout.workoutStartTime ? editingWorkout.workoutStartTime.substring(0, 16) : ''}
                  onChange={(e) =>
                    setEditingWorkout({ ...editingWorkout, workoutStartTime: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-mono"
                />
              </div>

              {/* 2. Các chỉ số chính (Đã bổ sung Cân nặng và Vòng eo) */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Thời gian (phút)</label>
                  <input
                    type="number"
                    value={editingWorkout.activeTime || 0}
                    onChange={(e) =>
                      setEditingWorkout({ ...editingWorkout, activeTime: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Calo (kcal)</label>
                  <input
                    type="number"
                    value={editingWorkout.calories || 0}
                    onChange={(e) =>
                      setEditingWorkout({ ...editingWorkout, calories: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-bold font-mono text-orange-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-600 font-bold mb-1">Quãng đường (km)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingWorkout.totalDistanceKm || 0}
                    onChange={(e) =>
                      setEditingWorkout({ ...editingWorkout, totalDistanceKm: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-bold font-mono text-sky-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Cân nặng (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingWorkout.weightKg || ''}
                    onChange={(e) =>
                      setEditingWorkout({ ...editingWorkout, weightKg: Number(e.target.value) })
                    }
                    placeholder="VD: 72"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-bold font-mono text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Vòng eo (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingWorkout.waistCm || ''}
                    onChange={(e) =>
                      setEditingWorkout({ ...editingWorkout, waistCm: Number(e.target.value) })
                    }
                    placeholder="VD: 80"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-bold font-mono text-purple-600"
                  />
                </div>
              </div>
              {/* 3. Chi tiết các giai đoạn */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsPhasesExpanded(!isPhasesExpanded)}
                  className="w-full flex items-center justify-between bg-slate-100 p-3 rounded-xl text-slate-700 font-bold text-xs"
                >
                  <span>Chi tiết các giai đoạn</span>
                  {isPhasesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isPhasesExpanded && (
                  <div className="space-y-3 border border-slate-100 rounded-2xl p-2">
                    {editingWorkout.phases
                      .slice()
                      .sort((a, b) => a.phaseNumber - b.phaseNumber)
                      .map((phase, index) => {
                        const realIndex = editingWorkout.phases.findIndex(p => p.phaseNumber === phase.phaseNumber);

                        return (
                          <div key={phase.phaseNumber} className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-slate-200">
                            <div className="col-span-2 text-xs font-bold text-slate-700 border-b pb-1 mb-1">
                              Giai đoạn {phase.phaseNumber}: {phase.name}
                            </div>
                            <div>
                              <label className="block text-slate-500 text-[10px]">Thời gian (p)</label>
                              <input
                                type="number"
                                value={phase.durationMinutes}
                                onChange={(e) => {
                                  const newPhases = [...editingWorkout.phases];
                                  newPhases[realIndex].durationMinutes = Number(e.target.value);
                                  setEditingWorkout({ ...editingWorkout, phases: newPhases });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-1"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-500 text-[10px]">Tốc độ (km/h)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={phase.speedKmh}
                                onChange={(e) => {
                                  const newPhases = [...editingWorkout.phases];
                                  newPhases[realIndex].speedKmh = Number(e.target.value);
                                  setEditingWorkout({ ...editingWorkout, phases: newPhases });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-1"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-500 text-[10px]">Độ dốc (°)</label>
                              <input
                                type="number"
                                step="0.5"
                                value={phase.inclineDegree}
                                onChange={(e) => {
                                  const newPhases = [...editingWorkout.phases];
                                  newPhases[realIndex].inclineDegree = Number(e.target.value);
                                  setEditingWorkout({ ...editingWorkout, phases: newPhases });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-1"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-500 text-[10px]">Quãng đường (km)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={phase.distanceKm || 0}
                                onChange={(e) => {
                                  const newPhases = [...editingWorkout.phases];
                                  newPhases[realIndex].distanceKm = Number(e.target.value);
                                  setEditingWorkout({ ...editingWorkout, phases: newPhases });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-1"
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* 4. Mức độ mệt mỏi */}
              <div>
                <label className="block text-slate-600 font-bold mb-1">Mức độ mệt mỏi (1 - 5)</label>
                <select
                  value={editingWorkout.fatigueLevel || 3}
                  onChange={(e) =>
                    setEditingWorkout({ ...editingWorkout, fatigueLevel: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold"
                >
                  <option value={1}>1 - Rất nhẹ nhàng</option>
                  <option value={2}>2 - Thoải mái</option>
                  <option value={3}>3 - Vừa phải</option>
                  <option value={4}>4 - Khá mệt</option>
                  <option value={5}>5 - Kiệt sức / Quá tải</option>
                </select>
              </div>

              {/* 5. Ghi chú cá nhân */}
              <div>
                <label className="block text-slate-600 font-bold mb-1">Ghi chú cá nhân</label>
                <textarea
                  rows={2}
                  value={editingWorkout.notes || ''}
                  onChange={(e) =>
                    setEditingWorkout({ ...editingWorkout, notes: e.target.value })
                  }
                  placeholder="Nhập ghi chú cho buổi tập..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingWorkout(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-xs"
                >
                  {isUpdating ? 'Đang Cập nhật...' : 'Lưu cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
