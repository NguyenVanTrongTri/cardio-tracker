import { useState, useMemo } from 'react';
import {
  Activity,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  X,
  FileSpreadsheet,
  FileCode,
  Utensils
} from 'lucide-react';
import { EquipmentType, WorkoutRecord } from '../types';
import { getStoredWorkouts, deleteWorkoutRecord } from '../services/storage';
import { getEquipmentDef } from '../components/workout/equipmentData';
import { logAdminAction } from './adminService';

interface AdminWorkoutsTabProps {
  adminEmail: string;
  onRefreshStats: () => void;
}

export default function AdminWorkoutsTab({ adminEmail, onRefreshStats }: AdminWorkoutsTabProps) {
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>(getStoredWorkouts());
  const [searchTerm, setSearchTerm] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentType | 'ALL'>('ALL');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutRecord | null>(null);

  const userList = useMemo(() => {
    const users = new Set(workouts.map((w) => w.userName || 'Chưa đặt tên'));
    return Array.from(users).sort();
  }, [workouts]);

  const refreshList = () => {
    setWorkouts(getStoredWorkouts());
    onRefreshStats();
  };

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w) => {
      const matchSearch =
        (w.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.workoutStartTime.includes(searchTerm) ||
        (w.userName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchEquip = equipmentFilter === 'ALL' ? true : w.equipmentType === equipmentFilter;
      const matchUser = userFilter === 'ALL' ? true : (w.userName || 'Chưa đặt tên') === userFilter;
      return matchSearch && matchEquip && matchUser;
    });
  }, [workouts, searchTerm, equipmentFilter, userFilter]);

  const handleDeleteWorkout = (id: string) => {
    const confirm = window.confirm('Bạn có chắc muốn xóa bản ghi buổi tập này?');
    if (!confirm) return;

    deleteWorkoutRecord(id);
    logAdminAction(adminEmail, 'Xóa buổi tập', `Đã xóa buổi tập ID: ${id}`, 'WARNING');
    refreshList();
    if (selectedWorkout?.id === id) {
      setSelectedWorkout(null);
    }
  };

  const exportAsCSV = () => {
    const headers = ['ID,Thiết Bị,Thời Gian Bắt Đầu,Thời Lượng (phút),Calo (kcal),Zone 2,Cortisol Alert,Cân Nặng,Vòng Eo,Ghi Chú'];
    const rows = filteredWorkouts.map((w) => {
      const equip = getEquipmentDef(w.equipmentType).name;
      const cleanNotes = (w.notes || '').replace(/,/g, ';').replace(/\n/g, ' ');
      return `"${w.id}","${equip}","${w.workoutStartTime}",${w.activeTime},${w.calories},${w.isZone2 ? 'Đạt' : 'Không'},${w.cortisolAlert ? 'Cảnh báo' : 'An toàn'},${w.weightKg},${w.waistCm},"${cleanNotes}"`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cardio_workouts_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo ngày hoặc ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs">
            <Filter size={14} className="text-slate-400" />
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả người tập</option>
              {userList.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs">
            <Filter size={14} className="text-slate-400" />
            <select
              value={equipmentFilter}
              onChange={(e) => setEquipmentFilter(e.target.value as any)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả thiết bị</option>
              <option value="TREADMILL">Máy Chạy Bộ</option>
              <option value="STATIONARY_BIKE">Xe Đạp Tập</option>
              <option value="ROWING_MACHINE">Máy Chèo Thuyền</option>
              <option value="STAIR_CLIMBER">Máy Leo Thang</option>
              <option value="OUTDOOR_RUN">Chạy Ngoài Trời</option>
            </select>
          </div>
        </div>

        <button
          onClick={exportAsCSV}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
        >
          <FileSpreadsheet size={15} />
          <span>Xuất File CSV</span>
        </button>
      </div>

      {/* Workouts Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Người Tập</th>
                <th className="py-3 px-4">Thời Gian & Bộ Môn</th>
                <th className="py-3 px-4">Thời Lượng</th>
                <th className="py-3 px-4">Calo Đốt (kcal)</th>
                <th className="py-3 px-4">Đánh Giá Chuẩn</th>
                <th className="py-3 px-4">Bữa Ăn</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy buổi tập nào.
                  </td>
                </tr>
              ) : (
                filteredWorkouts.map((w) => {
                  const def = getEquipmentDef(w.equipmentType);
                  const totalMealCals = (w.meals || []).reduce((acc, m) => acc + (m.totalCalories || 0), 0);

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {w.userName || 'Chưa đặt tên'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{def.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {w.workoutStartTime.replace('T', ' ')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-800">{w.activeTime} phút</div>
                        {w.pauseDuration > 0 && (
                          <div className="text-[10px] text-slate-400">Tạm nghỉ {w.pauseDuration}p</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-orange-600">{Math.round(w.calories)} kcal</div>
                        <div className="text-[10px] text-slate-400">
                          {w.efficiencyIndex ? `${w.efficiencyIndex.toFixed(1)} cal/p` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          {w.isZone2 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-max border border-emerald-200">
                              <CheckCircle2 size={10} /> Zone 2
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full w-max">
                              Tiêu chuẩn
                            </span>
                          )}

                          {w.cortisolAlert && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full w-max border border-rose-200">
                              <AlertTriangle size={10} /> Cortisol &gt; 50p
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {totalMealCals > 0 ? (
                          <span className="font-bold text-emerald-700">
                            +{totalMealCals} kcal ({w.meals.length} bữa)
                          </span>
                        ) : (
                          <span className="text-slate-400">Chưa ghi nhận</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setSelectedWorkout(w)}
                            className="p-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
                            title="Xem chi tiết 3 giai đoạn"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteWorkout(w.id)}
                            className="p-1.5 rounded-xl bg-slate-50 text-rose-500 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer"
                            title="Xóa buổi tập"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Chi Tiết Buổi Tập [{getEquipmentDef(selectedWorkout.equipmentType).name}]
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedWorkout.workoutStartTime.replace('T', ' ')}
                </p>
              </div>
              <button
                onClick={() => setSelectedWorkout(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick stats highlight */}
            <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Thời Lượng</span>
                <span className="font-bold text-slate-900">{selectedWorkout.activeTime} phút</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Tiêu Hao</span>
                <span className="font-bold text-orange-600">{Math.round(selectedWorkout.calories)} kcal</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Cân / Eo</span>
                <span className="font-bold text-slate-800">{selectedWorkout.weightKg}kg / {selectedWorkout.waistCm}cm</span>
              </div>
            </div>

            {/* 3 Phases Inspection */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Activity size={14} className="text-emerald-600" />
                <span>Chi Tiết 3 Giai Đoạn (Phases)</span>
              </h4>

              <div className="space-y-2">
                {(selectedWorkout.phases || []).map((phase, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Giai đoạn {phase.phaseNumber}: {phase.name}</span>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {phase.durationMinutes} phút • {phase.distanceKm ? `${phase.distanceKm} km • ` : ''}Tốc độ: {phase.speedKmh} km/h • Độ dốc: {phase.inclineDegree}°
                      </div>
                    </div>
                    {phase.isCoreEngaged && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Siết cơ bụng
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Meals in session */}
            {selectedWorkout.meals && selectedWorkout.meals.length > 0 && (
              <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Utensils size={14} className="text-amber-600" />
                  <span>Dinh Dưỡng Đã Nạp ({selectedWorkout.meals.length} bữa)</span>
                </h4>
                <div className="space-y-1.5">
                  {selectedWorkout.meals.map((meal) => (
                    <div key={meal.id} className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/60 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{meal.category}</span>
                        <span className="text-slate-400 font-mono text-[11px] ml-2">({meal.time})</span>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {(meal.foodItems || []).map((fi) => `${fi.foodName} (${fi.grams}g)`).join(', ')}
                        </div>
                      </div>
                      <span className="font-bold font-mono text-amber-700">+{meal.totalCalories} kcal</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedWorkout.notes && (
              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="font-semibold text-slate-500 block mb-1">Ghi chú của người tập:</span>
                <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-700 italic">
                  "{selectedWorkout.notes}"
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedWorkout(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
