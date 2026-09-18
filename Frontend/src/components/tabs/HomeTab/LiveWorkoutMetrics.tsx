import React from 'react';
import { ShieldAlert, Activity } from 'lucide-react';
import { EquipmentDef } from '../../workout/equipmentData';

interface LiveTotals {
  grossTime: number;
  activeTime: number;
  totalDistanceKm: number;
  calories: number;
  efficiencyIndex: number;
  isZone2: boolean;
  cortisolAlert: boolean;
}

interface LiveWorkoutMetricsProps {
  liveTotals: LiveTotals;
  equipmentDef: EquipmentDef;
}

const LiveWorkoutMetrics: React.FC<LiveWorkoutMetricsProps> = ({ liveTotals, equipmentDef }) => {
  return (
    <div className="bg-slate-900 text-white p-4.5 rounded-3xl shadow-xl space-y-3.5 border border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Activity size={15} className="text-emerald-400" />
          <span>Ước Tính Tiêu Hao: {equipmentDef.shortName}</span>
        </span>
        {liveTotals.isZone2 && (
          <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            ✓ Đạt Zone 2
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/50">
          <span className="text-xs text-slate-400 block mb-0.5">Thời Gian</span>
          <span className="text-xl font-black text-white font-mono">
            {liveTotals.activeTime}
          </span>
          <span className="text-xs text-slate-400 ml-1">phút</span>
        </div>

        <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/50">
          <span className="text-xs text-slate-400 block mb-0.5">Quãng Đường</span>
          <span className="text-xl font-black text-sky-400 font-mono">
            {liveTotals.totalDistanceKm ?? 0}
          </span>
          <span className="text-xs text-slate-400 ml-1">km</span>
        </div>

        <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/50">
          <span className="text-xs text-slate-400 block mb-0.5">Tiêu Hao</span>
          <span className="text-xl font-black text-orange-400 font-mono">
            {liveTotals.calories}
          </span>
          <span className="text-xs text-slate-400 ml-1">kcal</span>
        </div>

        <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/50">
          <span className="text-xs text-slate-400 block mb-0.5">Mật độ</span>
          <span className="text-xl font-black text-emerald-400 font-mono">
            {liveTotals.efficiencyIndex}
          </span>
          <span className="text-xs text-slate-400 ml-1">cal/p</span>
        </div>
      </div>

      {liveTotals.cortisolAlert && (
        <div className="bg-rose-950/80 border border-rose-600/60 p-3 rounded-2xl flex items-start gap-2.5 text-rose-200 animate-pulse">
          <ShieldAlert size={20} className="text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="text-rose-300 block">
              🚨 CẢNH BÁO CORTISOL: Vượt quá 50 phút!
            </strong>
            Tập cardio quá dài sẽ làm tăng nồng độ hoóc-môn Cortisol, gây dị hóa cơ bắp
            và tích trữ mỡ bụng. Khuyến nghị kết thúc trong 40-48 phút.
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveWorkoutMetrics;
