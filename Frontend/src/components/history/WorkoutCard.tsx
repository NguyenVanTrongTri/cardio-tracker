import { Bike, Waves, Footprints, Compass, Flame, Zap, CheckCircle2, AlertTriangle, ChevronUp, ChevronDown, Edit3, Trash2, ShieldAlert } from 'lucide-react';
import { EquipmentType, WorkoutPhase, WorkoutRecord } from '../../types';
import { getEquipmentDef } from '../workout/equipmentData';

interface Props {
  workout: WorkoutRecord;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (w: WorkoutRecord) => void;
  onDelete: (id: string) => void;
  formatDate: (isoStr: string) => string;
}

export default function WorkoutCard({ workout, isExpanded, onToggleExpand, onEdit, onDelete, formatDate }: Props) {
  const p2 = workout.phases.find((p) => p.phaseNumber === 2);
  const eqDef = getEquipmentDef(workout.equipmentType || 'TREADMILL');

  const getEquipmentIcon = (type?: EquipmentType) => {
    switch (type) {
      case 'STATIONARY_BIKE': return <Bike size={16} className="text-blue-500" />;
      case 'ROWING_MACHINE': return <Waves size={16} className="text-cyan-500" />;
      case 'STAIR_CLIMBER': return <Footprints size={16} className="text-amber-500" />;
      case 'OUTDOOR_RUN': return <Compass size={16} className="text-purple-500" />;
      case 'TREADMILL':
      default: return <Flame size={16} className="text-emerald-500 fill-emerald-500" />;
    }
  };

  const renderPhaseDetails = (p: WorkoutPhase, eq?: EquipmentType) => {
    if (eq === 'STATIONARY_BIKE') return `Mức ${p.resistanceLevel || 0} • ${p.cadenceRpm || 70} RPM`;
    if (eq === 'ROWING_MACHINE') return `Damper ${p.resistanceLevel || 0} • ${p.strokeRateSpm || 24} SPM`;
    if (eq === 'STAIR_CLIMBER') return `Mức ${p.resistanceLevel || 0} • ${p.stepsPerMin || 60} bậc/p`;
    return `Dốc ${p.inclineDegree}° • ${p.speedKmh} km/h`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {formatDate(workout.workoutStartTime)}
            </span>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mt-0.5">
              {getEquipmentIcon(workout.equipmentType)}
              <span>{eqDef.shortName}</span>
              {p2?.isCoreEngaged && (
                <span className="text-amber-500 text-xs font-bold bg-amber-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <Zap size={12} className="fill-amber-500" />
                  Core
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(workout)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors" title="Chỉnh sửa"><Edit3 size={16} /></button>
            <button onClick={() => onDelete(workout.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors" title="Xóa"><Trash2 size={16} /></button>
          </div>
        </div>

        <div className={`grid ${workout.totalDistanceKm ? 'grid-cols-4' : 'grid-cols-3'} gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 my-2.5 text-center`}>
            <div>
                <span className="text-[10px] text-slate-400 block">Thời Gian</span>
                <span className="text-sm font-bold text-slate-800 font-mono">{workout.activeTime}<span className="text-[10px] text-slate-500 font-normal ml-0.5">phút</span></span>
            </div>
            {workout.totalDistanceKm ? (
            <div>
                <span className="text-[10px] text-slate-400 block">Quãng Đường</span>
                <span className="text-sm font-bold text-sky-600 font-mono">{workout.totalDistanceKm}<span className="text-[10px] text-sky-500 font-normal ml-0.5">km</span></span>
            </div>
            ) : null}
            <div>
                <span className="text-[10px] text-slate-400 block">Tiêu Hao</span>
                <span className="text-sm font-bold text-orange-600 font-mono">{workout.calories}<span className="text-[10px] text-orange-500 font-normal ml-0.5">kcal</span></span>
            </div>
            <div>
                <span className="text-[10px] text-slate-400 block">Mật Độ</span>
                <span className="text-sm font-bold text-emerald-600 font-mono">{workout.efficiencyIndex}<span className="text-[10px] text-emerald-500 font-normal ml-0.5">cal/p</span></span>
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
            {workout.isZone2 && (<span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-600" />Zone 2 Certified</span>)}
            {workout.cortisolAlert && (<span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><ShieldAlert size={13} className="text-rose-600" />Cortisol Warning (&gt;50p)</span>)}
            {workout.preWorkoutAlert && (<span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><AlertTriangle size={13} className="text-amber-600" />Ăn sát giờ (&lt;20p)</span>)}
        </div>

        <button onClick={onToggleExpand} className="w-full flex items-center justify-center gap-1 text-xs text-slate-500 font-semibold pt-2 mt-2 border-t border-slate-100 hover:text-slate-800">
            {isExpanded ? (<><span>Thu gọn chi tiết</span><ChevronUp size={14} /></>) : (<><span>Xem chi tiết 3 giai đoạn & ghi chú</span><ChevronDown size={14} /></>)}
        </button>
      </div>

      {isExpanded && (
        <div className="bg-slate-50/80 p-4 border-t border-slate-100 space-y-3 text-xs">
          <div>
            <h4 className="font-bold text-slate-700 mb-2">Chi Tiết Các Giai Đoạn ({eqDef.name})</h4>
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              {workout.phases.map((p, idx) => {
                const isRelief = p.subType === 'RELIEF' || p.name.toLowerCase().includes('xả');
                const isSurge = p.subType === 'SURGE' || p.name.toLowerCase().includes('bứt tốc');
                return (
                  <div key={`${p.phaseNumber}-${idx}`} className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 ${isRelief ? 'bg-sky-50/80 border-sky-200 text-sky-950' : isSurge ? 'bg-amber-50/80 border-amber-200 text-amber-950 font-bold' : p.phaseNumber === 2 ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <span className="text-[9px] text-slate-500 font-bold uppercase truncate w-full" title={p.name}>{isRelief ? 'Xả' : isSurge ? 'Bứt' : `P${p.phaseNumber}`}</span>
                    <div className="text-xs font-black text-slate-900 leading-none">{p.durationMinutes}<span className="text-[9px] font-normal text-slate-500 ml-0.5">p</span></div>
                    {p.distanceKm !== undefined && Number(p.distanceKm) > 0 && (<div className="text-[10px] font-bold text-sky-600 leading-none">{p.distanceKm}<span className="text-[8px] font-normal ml-0.5">km</span></div>)}
                    <div className="text-[9px] text-slate-500 mt-0.5 leading-none truncate w-full">{renderPhaseDetails(p, workout.equipmentType).replace('•', '|')}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80">
            <div><span className="text-slate-400">Nước bù: </span><strong>{workout.waterConsumedMl} ml</strong></div>
            <div><span className="text-slate-400">Cân nặng / Eo: </span><strong>{workout.weightKg} kg / {workout.waistCm} cm</strong></div>
            <div><span className="text-slate-400">Mức mệt mỏi: </span><strong>{workout.fatigueLevel}/5</strong></div>
          </div>
          {workout.notes && (<div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-slate-700 italic">"{workout.notes}"</div>)}
        </div>
      )}
    </div>
  );
}
