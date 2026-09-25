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
import { EditWorkoutModal } from './HistoryTab/EditWorkoutModal';
import { DeleteConfirmationModal } from './HistoryTab/DeleteConfirmationModal';
import { formatDate, renderPhaseDetails } from './HistoryTab/utils';
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
export const getEquipmentIcon = (type?: EquipmentType) => {
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
      return <Flame size={16} className="text-emerald-500 fill-emerald-500" />;
    default:
      return <Flame size={16} className="text-emerald-500 fill-emerald-500" />;
  }
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
        <DeleteConfirmationModal
          onClose={() => setDeleteCandidateId(null)}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
        />
      )}

      {/* Quick Edit Modal */}
      {editingWorkout && (
        <EditWorkoutModal
          workout={editingWorkout}
          onClose={() => setEditingWorkout(null)}
          onUpdate={handleUpdateWorkout}
          editingWorkout={editingWorkout}
          setEditingWorkout={setEditingWorkout}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}
