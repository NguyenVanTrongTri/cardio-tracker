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

    try {
      const response = await fetch(`${API_ENDPOINTS.WORKOUTS}/${editingWorkout.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        credentials: 'include',
        // Đảm bảo gửi đúng cấu trúc backend mong đợi
        body: JSON.stringify({
            ...editingWorkout,
            weightKg: Number(editingWorkout.weightKg),
            waistCm: Number(editingWorkout.waistCm),
            waterConsumedMl: Number(editingWorkout.waterConsumedMl),
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
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      const hour = String(date.getUTCHours()).padStart(2, '0');
      const minute = String(date.getUTCMinutes()).padStart(2, '0');
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
            <div
              key={w.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Card Header & Summary */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {formatDate(w.workoutStartTime)}
                    </span>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mt-0.5">
                      {getEquipmentIcon(w.equipmentType)}
                      <span>{eqDef.shortName}</span>
                      {p2?.isCoreEngaged && (
                        <span className="text-amber-500 text-xs font-bold bg-amber-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <Zap size={12} className="fill-amber-500" />
                          Core
                        </span>
                      )}
                    </h3>
                  </div>

                  {/* Actions Menu */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingWorkout(w)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteCandidateId(w.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Primary Metric Badges */}
                <div className={`grid ${w.totalDistanceKm ? 'grid-cols-4' : 'grid-cols-3'} gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 my-2.5 text-center`}>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Thời Gian</span>
                    <span className="text-sm font-bold text-slate-800 font-mono"> {/* 👈 Đổi từ text-xs thành text-sm */}
                      {w.activeTime}
                      <span className="text-[10px] text-slate-500 font-normal ml-0.5">phút</span>
                    </span>
                  </div>
                  {w.totalDistanceKm ? (
                    <div>
                      <span className="text-[10px] text-slate-400 block">Quãng Đường</span>
                      <span className="text-sm font-bold text-sky-600 font-mono"> {/* 👈 Đổi từ text-xs thành text-sm */}
                        {w.totalDistanceKm}
                        <span className="text-[10px] text-sky-500 font-normal ml-0.5">km</span>
                      </span>
                    </div>
                  ) : null}
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tiêu Hao</span>
                    <span className="text-sm font-bold text-orange-600 font-mono"> {/* 👈 Đổi từ text-xs thành text-sm */}
                      {w.calories}
                      <span className="text-[10px] text-orange-500 font-normal ml-0.5">kcal</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Mật Độ</span>
                    <span className="text-sm font-bold text-emerald-600 font-mono"> {/* 👈 Đổi từ text-xs thành text-sm */}
                      {w.efficiencyIndex}
                      <span className="text-[10px] text-emerald-500 font-normal ml-0.5">cal/p</span>
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {w.isZone2 && (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      Zone 2 Certified
                    </span>
                  )}

                  {w.cortisolAlert && (
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <ShieldAlert size={13} className="text-rose-600" />
                      Cortisol Warning (&gt;50p)
                    </span>
                  )}

                  {w.preWorkoutAlert && (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <AlertTriangle size={13} className="text-amber-600" />
                      Ăn sát giờ (&lt;20p)
                    </span>
                  )}
                </div>

                {/* Expand Toggle */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : w.id)}
                  className="w-full flex items-center justify-center gap-1 text-xs text-slate-500 font-semibold pt-2 mt-2 border-t border-slate-100 hover:text-slate-800"
                >
                  {isExpanded ? (
                    <>
                      <span>Thu gọn chi tiết</span>
                      <ChevronUp size={14} />
                    </>
                  ) : (
                    <>
                      <span>Xem chi tiết 3 giai đoạn & ghi chú</span>
                      <ChevronDown size={14} />
                    </>
                  )}
                </button>
              </div>

              {/* Expanded Detailed Breakdown */}
              {isExpanded && (
                <div className="bg-slate-50/80 p-4 border-t border-slate-100 space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-700 mb-2">
                      Chi Tiết Các Giai Đoạn ({eqDef.name})
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-center font-mono">
                      {w.phases.map((p, idx) => {
                        const dist =
                          p.distanceKm !== undefined && Number(p.distanceKm) > 0
                            ? Number(p.distanceKm)
                            : p.speedKmh && p.durationMinutes
                            ? Math.round(((Number(p.speedKmh) * Number(p.durationMinutes)) / 60) * 100) / 100
                            : null;

                        const isRelief = p.subType === 'RELIEF' || p.name.toLowerCase().includes('xả');
                        const isSurge = p.subType === 'SURGE' || p.name.toLowerCase().includes('bứt tốc');

                        return (
                          <div
                            key={`${p.phaseNumber}-${idx}`}
                            className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 ${
                              isRelief
                                ? 'bg-sky-50/80 border-sky-200 text-sky-950'
                                : isSurge
                                ? 'bg-amber-50/80 border-amber-200 text-amber-950 font-bold'
                                : p.phaseNumber === 2
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="text-[9px] text-slate-500 font-bold uppercase truncate w-full" title={p.name}>
                              {isRelief ? 'Xả' : isSurge ? 'Bứt' : `P${p.phaseNumber}`}
                            </span>
                            <div className="text-xs font-black text-slate-900 leading-none">
                              {p.durationMinutes}<span className="text-[9px] font-normal text-slate-500 ml-0.5">p</span>
                            </div>
                            {dist !== null && (
                              <div className="text-[10px] font-bold text-sky-600 leading-none">
                                {dist}<span className="text-[8px] font-normal ml-0.5">km</span>
                              </div>
                            )}
                            <div className="text-[9px] text-slate-500 mt-0.5 leading-none truncate w-full">
                              {renderPhaseDetails(p, w.equipmentType).replace('•', '|')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Secondary info */}
                  <div className="grid grid-cols-2 gap-2 text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-slate-400">Nước bù: </span>
                      <strong>{w.waterConsumedMl} ml</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Cân nặng / Eo: </span>
                      <strong>{w.weightKg} kg / {w.waistCm} cm</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Mức mệt mỏi: </span>
                      <strong>{w.fatigueLevel}/5</strong>
                    </div>
                  </div>

                  {w.notes && (
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-slate-700 italic">
                      "{w.notes}"
                    </div>
                  )}
                </div>
              )}
            </div>
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
  <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
    <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-100 my-8">
      {/* Header Modal */}
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Chỉnh Sửa Buổi Tập
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {editingWorkout.workoutStartTime ? editingWorkout.workoutStartTime.replace('T', ' ').substring(0, 16) : ''}
          </span>
        </div>
        <button
          onClick={() => setEditingWorkout(null)}
          className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleUpdateWorkout} className="space-y-4 text-xs">
        
        {/* 1. Thời gian bắt đầu (Cho phép đổi ngày giờ nếu cần) */}
        <div>
          <label className="block text-slate-600 font-bold mb-1">Thời gian bắt đầu (Ngày & Giờ)</label>
          <input
            type="datetime-local"
            value={editingWorkout.workoutStartTime ? editingWorkout.workoutStartTime.substring(0, 16) : ''}
            onChange={(e) =>
              setEditingWorkout({ ...editingWorkout, workoutStartTime: e.target.value })
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono"
          />
        </div>

        {/* 2. Các chỉ số chính (Primary Metrics) */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60">
          <div>
            <label className="block text-slate-600 font-bold mb-1">Thời gian tập (phút)</label>
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
            <label className="block text-slate-600 font-bold mb-1">Calo tiêu hao (kcal)</label>
            <input
              type="number"
              value={editingWorkout.calories || 0}
              onChange={(e) =>
                setEditingWorkout({ ...editingWorkout, calories: Number(e.target.value) })
              }
              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-bold font-mono text-orange-600"
            />
          </div>
          {editingWorkout.totalDistanceKm !== undefined && editingWorkout.totalDistanceKm !== null && (
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
          )}
        </div>

        {/* 3. Thông tin bổ sung (Secondary Info: Thể chất & Nước uống) */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Cân nặng (kg)</label>
            <input
              type="number"
              step="0.1"
              value={editingWorkout.weightKg || ''}
              onChange={(e) =>
                setEditingWorkout({ ...editingWorkout, weightKg: Number(e.target.value) })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-bold"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Vòng eo (cm)</label>
            <input
              type="number"
              step="0.5"
              value={editingWorkout.waistCm || ''}
              onChange={(e) =>
                setEditingWorkout({ ...editingWorkout, waistCm: Number(e.target.value) })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-bold"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Nước (ml)</label>
            <input
              type="number"
              step="50"
              value={editingWorkout.waterConsumedMl || ''}
              onChange={(e) =>
                setEditingWorkout({ ...editingWorkout, waterConsumedMl: Number(e.target.value) })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-bold"
            />
          </div>
        </div>

        {/* 4. Chi tiết các giai đoạn */}
        <div className="space-y-3">
          <label className="block text-slate-600 font-bold">Chi tiết các giai đoạn</label>
          {editingWorkout.phases.map((phase, index) => (
            <div key={index} className="grid grid-cols-2 gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
              <div className="col-span-2 text-xs font-bold text-slate-700">Giai đoạn {phase.phaseNumber}: {phase.name}</div>
              <div>
                <label className="block text-slate-500 text-[10px]">Thời gian (p)</label>
                <input
                  type="number"
                  value={phase.durationMinutes}
                  onChange={(e) => {
                    const newPhases = [...editingWorkout.phases];
                    newPhases[index].durationMinutes = Number(e.target.value);
                    setEditingWorkout({ ...editingWorkout, phases: newPhases });
                  }}
                  className="w-full bg-white border border-slate-200 rounded p-1"
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
                    newPhases[index].speedKmh = Number(e.target.value);
                    setEditingWorkout({ ...editingWorkout, phases: newPhases });
                  }}
                  className="w-full bg-white border border-slate-200 rounded p-1"
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
                    newPhases[index].inclineDegree = Number(e.target.value);
                    setEditingWorkout({ ...editingWorkout, phases: newPhases });
                  }}
                  className="w-full bg-white border border-slate-200 rounded p-1"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-500 text-[10px]">Quãng đường (km)</label>
                <input
                  type="number"
                  step="0.01"
                  value={phase.distanceKm || 0}
                  onChange={(e) => {
                    const newPhases = [...editingWorkout.phases];
                    newPhases[index].distanceKm = Number(e.target.value);
                    setEditingWorkout({ ...editingWorkout, phases: newPhases });
                  }}
                  className="w-full bg-white border border-slate-200 rounded p-1"
                />
              </div>
            </div>
          ))}
        </div>

        {/* 5. Mức độ mệt mỏi */}
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

        {/* Actions Button */}
        <div className="pt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setEditingWorkout(null)}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-xs"
          >
            Lưu cập nhật
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}
