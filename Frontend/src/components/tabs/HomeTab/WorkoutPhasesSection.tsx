import React, { useEffect, useState } from 'react';
import { Activity, Flame, SlidersHorizontal, CheckCircle2, Zap, Wind } from 'lucide-react';
import { EquipmentType, WorkoutPhase } from '../../../types';
import { EquipmentDef } from '../../workout/equipmentData';
import { renderParam1Field, renderParam2Field, renderDurationField, renderDistanceField } from './PhaseControls';
import { getEquipmentIcon } from './utils';
import { API_ENDPOINTS } from '@/src/services/apiConfig';

interface WorkoutPhasesSectionProps {
  equipmentType: EquipmentType;
  equipmentDef: EquipmentDef;
  enabledEquipmentList: any[];
  phase1: WorkoutPhase;
  setPhase1: React.Dispatch<React.SetStateAction<WorkoutPhase>>;
  phase2: WorkoutPhase;
  setPhase2: React.Dispatch<React.SetStateAction<WorkoutPhase>>;
  phase3: WorkoutPhase;
  setPhase3: React.Dispatch<React.SetStateAction<WorkoutPhase>>;
  isIntervalMode: boolean;
  setIsIntervalMode: React.Dispatch<React.SetStateAction<boolean>>;
  enableRelief: boolean;
  setEnableRelief: React.Dispatch<React.SetStateAction<boolean>>;
  enableSurge: boolean;
  setEnableSurge: React.Dispatch<React.SetStateAction<boolean>>;
  phase2Relief: WorkoutPhase;
  setPhase2Relief: React.Dispatch<React.SetStateAction<WorkoutPhase>>;
  phase2Surge: WorkoutPhase;
  setPhase2Surge: React.Dispatch<React.SetStateAction<WorkoutPhase>>;
  pauseDuration: number;
  setPauseDuration: React.Dispatch<React.SetStateAction<number>>;
  phaseDistances: { phase1: number, phase2: number, phase3: number, phase2Relief: number, phase2Surge: number };
  handleSelectEquipment: (type: EquipmentType) => void;
  setIsEquipmentModalOpen: (open: boolean) => void;
  applyEquipmentDefaults: () => void;
  liveTotals: any;
}

const WorkoutPhasesSection: React.FC<WorkoutPhasesSectionProps> = ({
  equipmentType,
  equipmentDef,
  phase1,
  setPhase1,
  phase2,
  setPhase2,
  phase3,
  setPhase3,
  isIntervalMode,
  setIsIntervalMode,
  enableRelief,
  setEnableRelief,
  enableSurge,
  setEnableSurge,
  phase2Relief,
  setPhase2Relief,
  phase2Surge,
  setPhase2Surge,
  pauseDuration,
  setPauseDuration,
  phaseDistances,
  handleSelectEquipment,
  setIsEquipmentModalOpen,
  applyEquipmentDefaults,
  liveTotals,
}) => {
  const [enabledEquipmentList, setEnabledEquipmentList] = useState<any[]>([]);
  useEffect(() => {
    const fetchPractices = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.PRACTICES}?onlyEnabled=true`);
        const result = await res.json();
        
        if (result.success && Array.isArray(result.data)) {
          const formatted = result.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            shortName: item.shortName || item.short_name,
            tag: item.tag,
            badgeColor: item.badgeColor || item.badge_color,
            bgLight: item.bgLight || item.bg_light,
            description: item.description,
            enabled: item.enabled,
            ...(item.configJson || item.config_json || {})
          }));

          setEnabledEquipmentList(formatted);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách bài tập từ DB:", error);
      }
    };
    
    fetchPractices();
  }, []);
  return (
    <div className="space-y-3">
      {/* Header with Workout Modality Button */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Activity size={17} className="text-emerald-600" />
            <span>Chi Tiết 3 Giai Đoạn Tập</span>
          </h3>

          <button
            type="button"
            onClick={() => setIsEquipmentModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Bấm để thay đổi hình thức tập luyện"
          >
            <SlidersHorizontal size={13} className="text-emerald-400" />
            <span>Đổi Hình Thức</span>
          </button>
        </div>

        {/* Quick Horizontal Modality Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {enabledEquipmentList.map((item) => {
            const isSelected = item.id === equipmentType;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectEquipment(item.id)}
                className={`shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs scale-[1.02]'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 border border-slate-200/60'
                }`}
              >
                {getEquipmentIcon(item.id, 14)}
                <span>{item.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Active Modality Description Banner */}
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60 flex items-start justify-between gap-2">
          <div className="text-xs">
            <span className="font-extrabold text-slate-800 block">
              Đang chọn: {equipmentDef.name}
            </span>
            <span className="text-slate-500 text-[11px] block mt-0.5">
              {equipmentDef.description}
            </span>
            <button
              type="button"
              onClick={applyEquipmentDefaults}
              className="mt-2 px-3 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg shadow-2xs flex items-center gap-1.5 transition-all"
            >
              💡 Gợi ý
            </button>
          </div>
          <span className="shrink-0 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md self-start">
            {equipmentDef.tag}
          </span>
        </div>
      </div>
      {/* Phase 1: Warm-up */}
      <div className="bg-white p-4 rounded-2xl border border-amber-200/60 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h4 className="text-sm font-bold text-slate-800">
              Giai đoạn 1: Warm-up (Khởi động)
            </h4>
          </div>
          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
            Kích hoạt khớp & tim mạch
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {renderDurationField({ phase: phase1, setPhase: setPhase1, equipmentDef, colorRing: 'focus:ring-amber-500/20' })}
          {renderParam1Field({ phase: phase1, setPhase: setPhase1, equipmentDef, colorRing: 'focus:ring-amber-500/20' })}
          {renderParam2Field({ phase: phase1, setPhase: setPhase1, equipmentDef, colorRing: 'focus:ring-amber-500/20' })}
          {renderDistanceField({ 
            phase: phase1, 
            setPhase: setPhase1, 
            equipmentDef, 
            colorRing: 'focus:ring-amber-500/20',
            phaseDistance: phaseDistances.phase1
          })}
        </div>
      </div>

      {/* Phase 2: Fat Burn (Trọng tâm) */}
      <div className="bg-gradient-to-b from-emerald-50/70 to-white p-4.5 rounded-2xl border-2 border-emerald-500 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-extrabold flex items-center justify-center shadow-xs">
              2
            </span>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                Giai đoạn 2: Fat Burn (Đốt Mỡ)
                <Flame size={16} className="text-orange-500 fill-orange-500" />
              </h4>
              <p className="text-xs text-emerald-800">
                Trọng tâm Zone 2 • Tối ưu chuyển hóa mỡ thừa
              </p>
            </div>
          </div>

          {liveTotals.isZone2 ? (
            <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
              <CheckCircle2 size={13} />
              Tối ưu
            </span>
          ) : (
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
              Chưa tối ưu
            </span>
          )}
        </div>
        
        {/* Standard Phase 2 View (Single Phase) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
          {renderDurationField({
            phase: phase2,
            setPhase: setPhase2,
            min: 5,
            max: 60,
            className: 'w-full bg-white border-2 border-emerald-300 rounded-xl px-2.5 py-2.5 text-center text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
          })}

          {renderParam1Field({ phase: phase2, setPhase: setPhase2, equipmentDef, colorRing: 'focus:ring-emerald-500/30' })}
          {renderParam2Field({ phase: phase2, setPhase: setPhase2, equipmentDef, colorRing: 'focus:ring-emerald-500/30' })}
          {renderDistanceField({
            phase: phase2,
            setPhase: setPhase2,
            equipmentDef,
            colorRing: 'focus:ring-emerald-500/30',
            className: 'w-full bg-white border-2 border-emerald-300 rounded-xl px-2.5 py-2.5 text-center text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
            phaseDistance: phaseDistances.phase2
          })}
        </div>

        {/* Core Focus / Engagement Toggle tailored for current equipment */}
        <div className="bg-white/90 p-3.5 rounded-xl border border-emerald-200/90 flex items-center justify-between gap-2">
          <div className="pr-2">
            <div className="flex items-center gap-2">
              <Zap
                size={16}
                className={phase2.isCoreEngaged ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}
              />
              <span className="text-xs font-bold text-slate-800">
                {equipmentDef.coreFocus.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              {equipmentDef.coreFocus.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPhase2({ ...phase2, isCoreEngaged: !phase2.isCoreEngaged })}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              phase2.isCoreEngaged ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
            aria-label="Toggle Core Engagement"
          >
            <span
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                phase2.isCoreEngaged ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Nút nhỏ Tạo nhịp phụ ngay dưới Siết Cơ Bụng */}
        <div className="mt-2.5 pt-2 border-t border-emerald-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {isIntervalMode ? 'Đang mở nhịp xả & bứt tốc' : 'Cần xả nhịp hay bứt tốc đợt 2?'}
          </span>
          <button
            type="button"
            onClick={() => setIsIntervalMode(!isIntervalMode)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isIntervalMode
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 shadow-2xs'
            }`}
          >
            <SlidersHorizontal size={12} />
            <span>{isIntervalMode ? 'Ẩn nhịp phụ' : '+ Tạo nhịp phụ'}</span>
          </button>
        </div>

        {/* Khối Nhịp Phụ Tùy Chọn */}
        {isIntervalMode && (
          <div className="space-y-3 mt-3 pt-3 border-t border-emerald-200/80">
            {/* Sub-block 1: Relief Phase */}
            <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Wind size={14} className="text-sky-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Nhịp xả bớt mệt (Hạ dốc 0°)
                  </span>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableRelief}
                    onChange={(e) => setEnableRelief(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-sky-900">Bật</span>
                </label>
              </div>
              {enableRelief ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {renderDurationField({ phase: phase2Relief, setPhase: setPhase2Relief, equipmentDef, colorRing: 'focus:ring-sky-500/30' })}
                  {renderParam1Field({ phase: phase2Relief, setPhase: setPhase2Relief, equipmentDef, colorRing: 'focus:ring-sky-500/30' })}
                  {renderParam2Field({ phase: phase2Relief, setPhase: setPhase2Relief, equipmentDef, colorRing: 'focus:ring-sky-500/30' })}
                  {renderDistanceField({ phase: phase2Relief, setPhase: setPhase2Relief, equipmentDef, colorRing: 'focus:ring-sky-500/30', phaseDistance: phaseDistances.phase2Relief })}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">Đã tắt nhịp xả này.</p>
              )}
            </div>

            {/* Sub-block 2: Surge Phase */}
            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame size={14} className="text-orange-500" />
                  <span className="text-xs font-bold text-slate-900">
                    Bứt tốc / Leo dốc đợt 2 (Surge)
                  </span>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableSurge}
                    onChange={(e) => setEnableSurge(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-amber-900">Bật</span>
                </label>
              </div>
              {enableSurge ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {renderDurationField({ phase: phase2Surge, setPhase: setPhase2Surge, equipmentDef, colorRing: 'focus:ring-amber-500/30' })}
                  {renderParam1Field({ phase: phase2Surge, setPhase: setPhase2Surge, equipmentDef, colorRing: 'focus:ring-amber-500/30' })}
                  {renderParam2Field({ phase: phase2Surge, setPhase: setPhase2Surge, equipmentDef, colorRing: 'focus:ring-amber-500/30' })}
                  {renderDistanceField({ phase: phase2Surge, setPhase: setPhase2Surge, equipmentDef, colorRing: 'focus:ring-amber-500/30', phaseDistance: phaseDistances.phase2Surge })}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">Đã tắt bứt tốc này.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Phase 3: Cool-down */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h4 className="text-sm font-bold text-slate-800">
              Giai đoạn 3: Cool-down (Thả lỏng)
            </h4>
          </div>
          <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md font-medium">
            Hồi phục & ổn định
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {renderDurationField({ phase: phase3, setPhase: setPhase3, equipmentDef, colorRing: 'focus:ring-slate-500/20' })}
          {renderParam1Field({ phase: phase3, setPhase: setPhase3, equipmentDef, colorRing: 'focus:ring-slate-500/20' })}
          {renderParam2Field({ phase: phase3, setPhase: setPhase3, equipmentDef, colorRing: 'focus:ring-slate-500/20' })}
          {renderDistanceField({ 
            phase: phase3, 
            setPhase: setPhase3, 
            equipmentDef, 
            colorRing: 'focus:ring-slate-500/20',
            phaseDistance: phaseDistances.phase3
          })}
        </div>
      </div>
      {/* Pause duration */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">
          Thời gian tạm dừng trong buổi (Pause, phút)
        </span>
        <div className="w-24">
          <input
            type="number"
            min="0"
            max="20"
            value={pauseDuration}
            onChange={(e) => setPauseDuration(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-center text-sm font-bold text-slate-800 focus:outline-none"
          />
        </div>
      </div>
    </div>
    );
};

export default WorkoutPhasesSection;
