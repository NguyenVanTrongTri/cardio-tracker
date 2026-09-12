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
          const newDist =
            phase && phase.speedKmh && newDur > 0
              ? Math.round(((phase.speedKmh * newDur) / 60) * 100) / 100
              : phase?.distanceKm;
          setPhase?.({
            ...phase!,
            durationMinutes: newDur,
            distanceKm: newDist,
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
  props: PhaseControlsProps
) => {
  const { phase, setPhase, equipmentDef, colorRing } = props;
  const isDegree = equipmentDef.param1.key === 'inclineDegree';
  const val = isDegree ? phase.inclineDegree : (phase.resistanceLevel ?? 0);

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 truncate">
        Độ dốc (°)
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
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-center text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 ${colorRing}`}
      />
    </div>
  );
};

export const renderParam2Field = (
  props: PhaseControlsProps
) => {
  const { phase, setPhase, equipmentDef, colorRing } = props;
  const key = equipmentDef.param2.key;
  let val: number = phase.speedKmh;
  if (key === 'cadenceRpm') val = phase.cadenceRpm ?? 70;
  else if (key === 'strokeRateSpm') val = phase.strokeRateSpm ?? 24;
  else if (key === 'stepsPerMin') val = phase.stepsPerMin ?? 60;

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 truncate">
        Tốc độ (km/h)
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
            const newDist =
              phase.durationMinutes > 0 && num > 0
                ? Math.round(((num * phase.durationMinutes) / 60) * 100) / 100
                : phase.distanceKm;
            setPhase({ ...phase, speedKmh: num, distanceKm: newDist });
          } else if (key === 'cadenceRpm') {
            setPhase({ ...phase, cadenceRpm: num });
          } else if (key === 'strokeRateSpm') {
            setPhase({ ...phase, strokeRateSpm: num });
          } else if (key === 'stepsPerMin') {
            setPhase({ ...phase, stepsPerMin: num });
          }
        }}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-center text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 ${colorRing}`}
      />
    </div>
  );
};

export const renderDistanceField = (
  props: PhaseControlsProps & {
    className?: string;
  }
) => {
  const { phase, setPhase, equipmentDef, colorRing, className } = props;
  const isSpeedDriven =
    equipmentDef.param2.key === 'speedKmh' ||
    equipmentDef.param3?.key === 'speedKmh' ||
    equipmentDef.id === 'TREADMILL' ||
    equipmentDef.id === 'OUTDOOR_RUN';

  const calculatedDist =
    phase.distanceKm !== undefined
      ? phase.distanceKm
      : phase.speedKmh && phase.durationMinutes
      ? Math.round(((phase.speedKmh * phase.durationMinutes) / 60) * 100) / 100
      : 0;

  return (
    <div>
      <label
        className="block text-xs font-semibold text-slate-600 mb-1 truncate"
        title="Quãng đường (km) theo máy chạy để tính calo chuẩn xác"
      >
        Quãng đường (km)
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        max="50"
        value={calculatedDist}
        onChange={(e) => {
          const raw = e.target.value;
          const num = raw === '' ? 0 : Number(raw);
          const syncSpeed =
            isSpeedDriven && phase.durationMinutes > 0 && num > 0
              ? Math.round(((num * 60) / phase.durationMinutes) * 10) / 10
              : phase.speedKmh;
          setPhase({
            ...phase,
            distanceKm: num,
            speedKmh: syncSpeed,
          });
        }}
        className={
          className ||
          `w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-center text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 ${colorRing}`
        }
      />
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
