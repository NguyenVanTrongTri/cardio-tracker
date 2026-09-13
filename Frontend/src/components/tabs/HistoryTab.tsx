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
import { getStoredWorkouts, deleteWorkoutRecord, saveWorkoutRecord } from '../../services/storage';
import { EquipmentType, WorkoutPhase, WorkoutRecord } from '../../types';
import { getEquipmentDef } from '../workout/equipmentData';
import { Bike, Waves, Footprints, Compass } from 'lucide-react';

export default function HistoryTab() {
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'zone2' | 'cortisol'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Delete modal state
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  // Edit modal state
  const [editingWorkout, setEditingWorkout] = useState<WorkoutRecord | null>(null);

  const loadData = () => {
    setWorkouts(getStoredWorkouts());
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

  const confirmDelete = () => {
    if (!deleteCandidateId) return;
    const updated = deleteWorkoutRecord(deleteCandidateId);
    setWorkouts(updated);
    setDeleteCandidateId(null);
  };

  const handleUpdateWorkout = (e: FormEvent) => {
    e.preventDefault();
    if (!editingWorkout) return;

    saveWorkoutRecord(editingWorkout);
    setEditingWorkout(null);
    loadData();
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return new Intl.DateTimeFormat('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
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

      {/* Empty State */}
      {filteredWorkouts.length === 0 && (
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
                    <span className="text-sm font-bold text-slate-800 font-mono">
                      {w.activeTime} phút
                    </span>
                  </div>
                  {w.totalDistanceKm ? (
                    <div>
                      <span className="text-[10px] text-slate-400 block">Quãng Đường</span>
                      <span className="text-sm font-bold text-sky-600 font-mono">
                        {w.totalDistanceKm} km
                      </span>
                    </div>
                  ) : null}
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tiêu Hao</span>
                    <span className="text-sm font-bold text-orange-600 font-mono">
                      {w.calories} kcal
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Mật Độ</span>
                    <span className="text-sm font-bold text-emerald-600 font-mono">
                      {w.efficiencyIndex} cal/p
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
                      Chi Tiết 3 Giai Đoạn ({eqDef.name})
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-center font-mono">
                      {w.phases.map((p) => {
                        const dist =
                          p.distanceKm !== undefined && Number(p.distanceKm) > 0
                            ? Number(p.distanceKm)
                            : p.speedKmh && p.durationMinutes
                            ? Math.round(((p.speedKmh * p.durationMinutes) / 60) * 100) / 100
                            : null;

                        return (
                          <div
                            key={p.phaseNumber}
                            className={`p-2 rounded-xl border flex flex-col justify-between ${
                              p.phaseNumber === 2
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <div>
                              <span className="text-[10px] text-slate-500 block">
                                P{p.phaseNumber}: {p.name}
                              </span>
                              <div className="text-xs font-semibold text-slate-800">{p.durationMinutes} phút</div>
                              {dist !== null && (
                                <div className="text-[11px] font-bold text-sky-600 my-0.5">
                                  {dist} km
                                </div>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1">
                              {renderPhaseDetails(p, w.equipmentType)}
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
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-colors shadow-xs"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit Modal */}
      {editingWorkout && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Sửa Buổi Tập ({editingWorkout.workoutStartTime.split('T')[0]})
              </h3>
              <button
                onClick={() => setEditingWorkout(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateWorkout} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Ghi chú</label>
                <input
                  type="text"
                  value={editingWorkout.notes}
                  onChange={(e) =>
                    setEditingWorkout({ ...editingWorkout, notes: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Cân nặng (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingWorkout.weightKg}
                    onChange={(e) =>
                      setEditingWorkout({ ...editingWorkout, weightKg: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Vòng eo (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingWorkout.waistCm}
                    onChange={(e) =>
                      setEditingWorkout({ ...editingWorkout, waistCm: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  Nước uống (ml)
                </label>
                <input
                  type="number"
                  step="50"
                  value={editingWorkout.waterConsumedMl}
                  onChange={(e) =>
                    setEditingWorkout({ ...editingWorkout, waterConsumedMl: Number(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="pt-2 flex gap-2">
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
