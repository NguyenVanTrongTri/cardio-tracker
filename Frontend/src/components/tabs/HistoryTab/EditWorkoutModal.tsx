import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { WorkoutRecord } from '../../../types';

interface EditWorkoutModalProps {
  workout: WorkoutRecord;
  onClose: () => void;
  onUpdate: (e: React.FormEvent) => void;
  editingWorkout: WorkoutRecord;
  setEditingWorkout: (workout: WorkoutRecord) => void;
  isUpdating: boolean;
}

export const EditWorkoutModal: React.FC<EditWorkoutModalProps> = ({ 
  workout, 
  onClose, 
  onUpdate, 
  editingWorkout, 
  setEditingWorkout, 
  isUpdating 
}) => {
  const [isPhasesExpanded, setIsPhasesExpanded] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-100 flex flex-col">
        <div className="flex items-center justify-between border-b pb-3 shrink-0">
          <h3 className="text-base font-bold text-slate-900">Chỉnh Sửa Buổi Tập</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors">✕</button>
        </div>

        <form onSubmit={onUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-bold mb-1">Thời gian bắt đầu</label>
            <input
              type="datetime-local"
              value={editingWorkout.workoutStartTime ? editingWorkout.workoutStartTime.substring(0, 16) : ''}
              onChange={(e) => setEditingWorkout({ ...editingWorkout, workoutStartTime: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Thời gian (phút)</label>
              <input
                type="number"
                value={editingWorkout.activeTime || 0}
                onChange={(e) => setEditingWorkout({ ...editingWorkout, activeTime: Number(e.target.value) })}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-bold font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">Calo (kcal)</label>
              <input
                type="number"
                value={editingWorkout.calories || 0}
                onChange={(e) => setEditingWorkout({ ...editingWorkout, calories: Number(e.target.value) })}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-bold font-mono text-orange-600"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-slate-600 font-bold mb-1">Quãng đường (km)</label>
              <input
                type="number"
                step="0.01"
                value={editingWorkout.totalDistanceKm || 0}
                onChange={(e) => setEditingWorkout({ ...editingWorkout, totalDistanceKm: Number(e.target.value) })}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-bold font-mono text-sky-600"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">Cân nặng (kg)</label>
              <input
                type="number"
                step="0.1"
                value={editingWorkout.weightKg || ''}
                onChange={(e) => setEditingWorkout({ ...editingWorkout, weightKg: Number(e.target.value) })}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-bold font-mono text-emerald-600"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">Vòng eo (cm)</label>
              <input
                type="number"
                step="0.5"
                value={editingWorkout.waistCm || ''}
                onChange={(e) => setEditingWorkout({ ...editingWorkout, waistCm: Number(e.target.value) })}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-bold font-mono text-purple-600"
              />
            </div>
          </div>
          
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
                        <div className="col-span-2 text-xs font-bold text-slate-700 border-b pb-1 mb-1">Giai đoạn {phase.phaseNumber}: {phase.name}</div>
                        <div>
                          <label className="block text-slate-500 text-[10px]">Thời gian (p)</label>
                          <input type="number" value={phase.durationMinutes} onChange={(e) => { const newPhases = [...editingWorkout.phases]; newPhases[realIndex].durationMinutes = Number(e.target.value); setEditingWorkout({ ...editingWorkout, phases: newPhases }); }} className="w-full bg-slate-50 border border-slate-200 rounded p-1" />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px]">Tốc độ (km/h)</label>
                          <input type="number" step="0.1" value={phase.speedKmh} onChange={(e) => { const newPhases = [...editingWorkout.phases]; newPhases[realIndex].speedKmh = Number(e.target.value); setEditingWorkout({ ...editingWorkout, phases: newPhases }); }} className="w-full bg-slate-50 border border-slate-200 rounded p-1" />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px]">Độ dốc (°)</label>
                          <input type="number" step="0.5" value={phase.inclineDegree} onChange={(e) => { const newPhases = [...editingWorkout.phases]; newPhases[realIndex].inclineDegree = Number(e.target.value); setEditingWorkout({ ...editingWorkout, phases: newPhases }); }} className="w-full bg-slate-50 border border-slate-200 rounded p-1" />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px]">Quãng đường (km)</label>
                          <input type="number" step="0.01" value={phase.distanceKm || 0} onChange={(e) => { const newPhases = [...editingWorkout.phases]; newPhases[realIndex].distanceKm = Number(e.target.value); setEditingWorkout({ ...editingWorkout, phases: newPhases }); }} className="w-full bg-slate-50 border border-slate-200 rounded p-1" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Mức độ mệt mỏi (1 - 5)</label>
            <select
              value={editingWorkout.fatigueLevel || 3}
              onChange={(e) => setEditingWorkout({ ...editingWorkout, fatigueLevel: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold"
            >
              {[1, 2, 3, 4, 5].map(level => <option key={level} value={level}>{level} - {level === 1 ? 'Rất nhẹ nhàng' : level === 5 ? 'Kiệt sức' : 'Vừa phải'}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Ghi chú cá nhân</label>
            <textarea
              rows={2}
              value={editingWorkout.notes || ''}
              onChange={(e) => setEditingWorkout({ ...editingWorkout, notes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 resize-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors">Hủy</button>
            <button type="submit" disabled={isUpdating} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-xs">
              {isUpdating ? 'Đang Cập nhật...' : 'Lưu cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
