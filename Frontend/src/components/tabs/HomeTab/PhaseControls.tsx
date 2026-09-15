import { EquipmentType, WorkoutPhase } from '../../../types';
import { EquipmentDef } from '../../workout/equipmentData';

interface PhaseControlsProps {
  phase: WorkoutPhase;
  setPhase: (updated: WorkoutPhase) => void;
  equipmentDef: EquipmentDef;
  colorRing: string;
}

/**
 * Trường nhập Thời gian (durationMinutes)
 */
export const renderDurationField = (
  props: Partial<PhaseControlsProps> & {
    min?: number;
    max?: number;
    className?: string;
  }
) => {
  const { phase, setPhase, min = 1, max = 30, className, colorRing } = props;
  const val = phase?.durationMinutes !== undefined ? phase.durationMinutes : '';

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 truncate">
        Thời gian (phút)
      </label>
      <input
        type="number"
        min={min}
        max={max}
        placeholder="0"
        value={val}
        onChange={(e) => {
          const raw = e.target.value;
          const newDur = raw === '' ? undefined : Number(raw);
          setPhase?.({
            ...phase!,
            durationMinutes: newDur as any,
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

/**
 * Trường nhập Tham số 1 (Độ dốc / Mức kháng lực)
 */
export const renderParam1Field = (props: PhaseControlsProps) => {
  const { phase, setPhase, equipmentDef, colorRing } = props;
  const isDegree = equipmentDef.param1.key === 'inclineDegree';
  
  const rawVal = isDegree ? phase.inclineDegree : phase.resistanceLevel;
  const val = rawVal !== undefined ? rawVal : '';

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 truncate">
        {equipmentDef.param1.label || (isDegree ? 'Độ dốc (°)' : 'Kháng lực')}
      </label>
      <input
        type="number"
        step={equipmentDef.param1.step}
        min={equipmentDef.param1.min}
        max={equipmentDef.param1.max}
        placeholder="0"
        value={val}
        onChange={(e) => {
          const raw = e.target.value;
          const num = raw === '' ? undefined : Number(raw);
          if (isDegree) {
            setPhase({ ...phase, inclineDegree: num as any });
          } else {
            setPhase({ ...phase, resistanceLevel: num as any });
          }
        }}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-center text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 ${colorRing}`}
      />
    </div>
  );
};

/**
 * Trường nhập Tham số 2 (Tốc độ / Vòng quay / Nhịp chèo / Số bậc)
 */
export const renderParam2Field = (props: PhaseControlsProps) => {
  const { phase, setPhase, equipmentDef, colorRing } = props;
  const key = equipmentDef.param2.key;

  let rawVal: number | undefined;
  if (key === 'speedKmh') rawVal = phase.speedKmh;
  else if (key === 'cadenceRpm') rawVal = phase.cadenceRpm;
  else if (key === 'strokeRateSpm') rawVal = phase.strokeRateSpm;
  else if (key === 'stepsPerMin') rawVal = phase.stepsPerMin;

  const val = rawVal !== undefined ? rawVal : '';

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 truncate">
        {equipmentDef.param2.label || 'Tốc độ (km/h)'}
      </label>
      <input
        type="number"
        step={equipmentDef.param2.step}
        min={equipmentDef.param2.min}
        max={equipmentDef.param2.max}
        placeholder="0"
        value={val}
        onChange={(e) => {
          const raw = e.target.value;
          const num = raw === '' ? undefined : Number(raw);
          
          const updated = { ...phase };
          if (key === 'speedKmh') updated.speedKmh = num as any;
          else if (key === 'cadenceRpm') updated.cadenceRpm = num as any;
          else if (key === 'strokeRateSpm') updated.strokeRateSpm = num as any;
          else if (key === 'stepsPerMin') updated.stepsPerMin = num as any;
          
          setPhase(updated);
        }}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-center text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 ${colorRing}`}
      />
    </div>
  );
};

/**
 * Trường nhập Quãng đường (distanceKm)
 */
export const renderDistanceField = (
  props: PhaseControlsProps & {
    className?: string;
    phaseDistance?: number;
  }
) => {
  const { phase, setPhase, colorRing, className, phaseDistance } = props;
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

/**
 * Trường nhập Tham số phụ thứ 3 (nếu có cấu hình)
 */
export const renderParam3Field = (props: PhaseControlsProps) => {
  const { phase, setPhase, equipmentDef, colorRing } = props;
  if (!equipmentDef.param3) return null;

  const key = equipmentDef.param3.key;
  const rawVal = (phase as any)[key];
  const val = rawVal !== undefined ? rawVal : '';

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
        placeholder="0"
        value={val}
        onChange={(e) => {
          const raw = e.target.value;
          const num = raw === '' ? undefined : Number(raw);
          setPhase({ 
            ...phase, 
            [key]: num 
          } as WorkoutPhase); // Thêm "as WorkoutPhase" hoặc "as any" ở cuối để qua mặt TypeScript
        }}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-center text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 ${colorRing}`}
      />
    </div>
  );
};