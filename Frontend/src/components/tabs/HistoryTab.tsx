import { useState, useMemo, type FormEvent } from 'react';
import { Activity } from 'lucide-react';
import { WorkoutRecord } from '../../types';
import { useWorkoutHistory } from '../../hooks/useWorkoutHistory';
import WorkoutCard from '../history/WorkoutCard';
import DeleteWorkoutModal from '../history/DeleteWorkoutModal';
import EditWorkoutModal from '../history/EditWorkoutModal';
import { API_ENDPOINTS } from '../../services/apiConfig';

export default function HistoryTab() {
  const { workouts, setWorkouts, isLoading, loadData } = useWorkoutHistory();
  const [filter, setFilter] = useState<'all' | 'zone2' | 'cortisol'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editingWorkout, setEditingWorkout] = useState<WorkoutRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredWorkouts = useMemo(() => {
    let sorted = [...workouts].sort((a, b) => 
      new Date(b.workoutStartTime).getTime() - new Date(a.workoutStartTime).getTime()
    );

    if (filter === 'zone2') return sorted.filter((w) => w.isZone2);
    if (filter === 'cortisol') return sorted.filter((w) => w.cortisolAlert);
    return sorted;
  }, [workouts, filter]);

  const confirmDelete = async () => {
    if (!deleteCandidateId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.WORKOUTS}/${deleteCandidateId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        setWorkouts(workouts.filter(w => w.id !== deleteCandidateId));
        setDeleteCandidateId(null);
      }
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateWorkout = async (e: FormEvent, updatedWorkout: WorkoutRecord) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.WORKOUTS}/${updatedWorkout.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            ...updatedWorkout,
            weightKg: updatedWorkout.weightKg ? Number(updatedWorkout.weightKg) : null,
            waistCm: updatedWorkout.waistCm ? Number(updatedWorkout.waistCm) : null,
            waterConsumedMl: Number(updatedWorkout.waterConsumedMl || 0),
            workoutPhases: updatedWorkout.phases || [],
        }),
      });
      if (response.ok) {
        setEditingWorkout(null);
        loadData();
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
      const today = new Date();
      const isToday = date.getUTCFullYear() === today.getUTCFullYear() && date.getUTCMonth() === today.getUTCMonth() && date.getUTCDate() === today.getUTCDate();
      if (isToday) return `${hour}:${minute} Hôm nay`;
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      const weekdayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return `${hour}:${minute} ${weekdayNames[date.getUTCDay()]}, ${day}/${month}/${year}`;
    } catch { return isoStr; }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-4 pb-28 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Lịch Sử Buổi Tập</h1>
          <p className="text-xs text-slate-500">{workouts.length} buổi tập đã ghi nhận</p>
        </div>
        <div className="flex gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button onClick={() => setFilter('all')} className={`px-2.5 py-1 rounded-lg transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Tất cả</button>
          <button onClick={() => setFilter('zone2')} className={`px-2.5 py-1 rounded-lg transition-all ${filter === 'zone2' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'}`}>Zone 2</button>
          <button onClick={() => setFilter('cortisol')} className={`px-2.5 py-1 rounded-lg transition-all ${filter === 'cortisol' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'}`}>Cảnh báo</button>
        </div>
      </div>

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
        </div>
      )}

      <div className="space-y-3.5">
        {filteredWorkouts.map((w) => (
          <WorkoutCard key={w.id} workout={w} isExpanded={expandedId === w.id} onToggleExpand={() => setExpandedId(expandedId === w.id ? null : w.id)} onEdit={setEditingWorkout} onDelete={setDeleteCandidateId} formatDate={formatDate} />
        ))}
      </div>

      <DeleteWorkoutModal isOpen={!!deleteCandidateId} onClose={() => setDeleteCandidateId(null)} onConfirm={confirmDelete} isDeleting={isDeleting} />
      {editingWorkout && <EditWorkoutModal workout={editingWorkout} onClose={() => setEditingWorkout(null)} onUpdate={handleUpdateWorkout} isUpdating={isUpdating} />}
    </div>
  );
}
