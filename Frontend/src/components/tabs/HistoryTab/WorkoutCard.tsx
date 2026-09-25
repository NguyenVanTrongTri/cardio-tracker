import React from 'react';
import { Edit3, Trash2, Zap, CheckCircle2, ShieldAlert, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import { WorkoutRecord, WorkoutPhase } from '../../../types';

interface WorkoutCardProps {
  workout: WorkoutRecord;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  getEquipmentDef: any; // Thay tạm bằng any để loại bỏ lỗi
  getEquipmentIcon: any;
  formatDate: any;
  renderPhaseDetails: any;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout: w,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  getEquipmentDef,
  getEquipmentIcon,
  formatDate,
  renderPhaseDetails
}) => {
  const p2 = w.phases.find((p) => p.phaseNumber === 2);
  const eqDef = getEquipmentDef(w.equipmentType || 'TREADMILL');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow overflow-hidden">
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
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Chỉnh sửa"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={onDelete}
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
              {w.activeTime}
              <span className="text-[10px] text-slate-500 font-normal ml-0.5">phút</span>
            </span>
          </div>
          {w.totalDistanceKm ? (
            <div>
              <span className="text-[10px] text-slate-400 block">Quãng Đường</span>
              <span className="text-sm font-bold text-sky-600 font-mono">
                {w.totalDistanceKm}
                <span className="text-[10px] text-sky-500 font-normal ml-0.5">km</span>
              </span>
            </div>
          ) : null}
          <div>
            <span className="text-[10px] text-slate-400 block">Tiêu Hao</span>
            <span className="text-sm font-bold text-orange-600 font-mono">
              {w.calories}
              <span className="text-[10px] text-orange-500 font-normal ml-0.5">kcal</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Mật Độ</span>
            <span className="text-sm font-bold text-emerald-600 font-mono">
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
          onClick={onToggleExpand}
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
};
