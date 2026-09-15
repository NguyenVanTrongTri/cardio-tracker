import { EquipmentType, WorkoutPhase } from '../../../types';
import { EquipmentDef } from '../../workout/equipmentData';

interface PhaseControlsProps {
  phase: WorkoutPhase;
  setPhase: (updated: WorkoutPhase) => void;
  equipmentDef: EquipmentDef;
  colorRing: string;
}

export const renderDurationField = (
  props: Partial<PhaseControlsProps> & {
    min?: number;
    max?: number;
    className?: string;
  }
) => {
  const { phase, setPhase, min = 1, max = 30, className, colorRing } = props;

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 truncate">
        Thời gian (phút)
      </label>
      <input
        type="number"
        min={min}
        max={max}
        value={phase?.durationMinutes || ''}
        onChange={(e) => {
          const newDur = Number(e.target.value);
          setPhase?.({
            ...phase!,
            durationMinutes: newDur,
          });
        }}
        className={
          className ||
          `w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-center text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 ${colorRing || ''}`
        }
      />
    </div>
  );
};

export const renderParam1Field = (
  props: PhaseControlsProps & { 
    className?: string;
    phaseValue?: number; // Calculated segment value for this phase
  }
) => {
  const { phase, setPhase, equipmentDef, colorRing, className, phaseValue } = props;
  const isDegree = equipmentDef.param1.key === 'inclineDegree';
  const val = isDegree ? phase.inclineDegree : (phase.resistanceLevel ?? 0);
  const label = equipmentDef.param1.label;

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 truncate">
        {label} ({equipmentDef.param1.unit})
      </label>
      <input
        type="number"
        step={equipmentDef.param1.step}
        min={equipmentDef.param1.min}
        max={equipmentDef.param1.max}
        value={val}
        onChange={(e) => {
          const num = Number(e.target.value);
          if (isDegree) {
            setPhase({ ...phase, inclineDegree: num });
          } else {
            setPhase({ ...phase, resistanceLevel: num });
          }
        }}
        className={
          className ||
          `w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-center text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 ${colorRing}`
        }
      />
      {phaseValue !== undefined && (
        <p className="text-[10px] text-emerald-600 mt-1 font-mono font-bold truncate">
          Giai đoạn này: {phaseValue.toFixed(1)}
        </p>
      )}
    </div>
  );
};

export const renderParam2Field = (
  props: PhaseControlsProps & { 
    className?: string;
    phaseValue?: number; 
  }
) => {
  const { phase, setPhase, equipmentDef, colorRing, className, phaseValue } = props;
  const key = equipmentDef.param2.key;
  let val: number = phase.speedKmh;
  if (key === 'cadenceRpm') val = phase.cadenceRpm ?? 70;
  else if (key === 'strokeRateSpm') val = phase.strokeRateSpm ?? 24;
  else if (key === 'stepsPerMin') val = phase.stepsPerMin ?? 60;

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 truncate">
        {equipmentDef.param2.label} ({equipmentDef.param2.unit})
      </label>
      <input
        type="number"
        step={equipmentDef.param2.step}
        min={equipmentDef.param2.min}
        max={equipmentDef.param2.max}
        value={val}
        onChange={(e) => {
          const num = Number(e.target.value);
          if (key === 'speedKmh') {
            setPhase({ ...phase, speedKmh: num });
          } else if (key === 'cadenceRpm') {
            setPhase({ ...phase, cadenceRpm: num });
          } else if (key === 'strokeRateSpm') {
            setPhase({ ...phase, strokeRateSpm: num });
          } else if (key === 'stepsPerMin') {
            setPhase({ ...phase, stepsPerMin: num });
          }
        }}
        className={
          className ||
          `w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-center text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 ${colorRing}`
        }
      />
      {phaseValue !== undefined && (
        <p className="text-[10px] text-emerald-600 mt-1 font-mono font-bold truncate">
          Giai đoạn này: {phaseValue.toFixed(1)}
        </p>
      )}
    </div>
  );
};

export const renderDistanceField = (
  props: PhaseControlsProps & {
    className?: string;
    phaseDistance?: number;
  }
) => {
  const { phase, setPhase, colorRing, className, phaseDistance } = props;

  // The input value is directly what the user sees on the machine at the end of this phase
  const machineDist = phase.distanceKm !== undefined ? phase.distanceKm : '';

  return (
    <div>
      <label
        className="block text-xs font-semibold text-slate-600 mb-1 truncate"
        title="Quãng đường hiển thị trên máy tại thời điểm kết thúc giai đoạn này (km)"
      >
        Quãng đường (km)
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        max="100"
        placeholder="0.00"
        value={machineDist}
        onChange={(e) => {
          const raw = e.target.value;
          const num = raw === '' ? undefined : Number(raw);
          setPhase({
            ...phase,
            distanceKm: num,
          });
        }}
        className={
          className ||
          `w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-center text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 ${colorRing}`
        }
      />
      {phaseDistance !== undefined && (
        <p className="text-[10px] text-emerald-600 mt-1 font-mono font-bold truncate" title="Quãng đường đi được riêng của giai đoạn này">
          Đoạn này: {phaseDistance.toFixed(2)} km
        </p>
      )}
    </div>
  );
};

export const renderParam3Field = (
  props: PhaseControlsProps
) => {
  const { phase, setPhase, equipmentDef, colorRing } = props;
  if (!equipmentDef.param3) return null;

  const key = equipmentDef.param3.key;
  // NOTE: Assuming phase has a property corresponding to param3 key
  const val = (phase as any)[key] || 0;

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 truncate">
        {equipmentDef.param3.label} ({equipmentDef.param3.unit})
      </label>
      <input
        type="number"
        step={equipmentDef.param3.step}
        min={equipmentDef.param3.min}
        max={equipmentDef.param3.max}
        value={val}
        onChange={(e) => {
          const num = Number(e.target.value);
          setPhase({ ...phase, [key]: num });
        }}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-center text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 ${colorRing}`}
      />
    </div>
  );
};
