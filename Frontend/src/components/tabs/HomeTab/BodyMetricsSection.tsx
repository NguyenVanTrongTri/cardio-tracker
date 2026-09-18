import React from 'react';
import { Scale } from 'lucide-react';

interface BodyMetricsSectionProps {
  weightKg: number | string;
  setWeightKg: (weight: number) => void;
  waistCm: number | string;
  setWaistCm: (waist: number) => void;
}

const BodyMetricsSection: React.FC<BodyMetricsSectionProps> = ({
  weightKg,
  setWeightKg,
  waistCm,
  setWaistCm,
}) => {
  return (
    <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale size={17} className="text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-800">
            Chỉ Số Cơ Thể Hôm Nay
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Tự động kế thừa gần nhất
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Cân nặng</span>
            <span className="font-semibold text-emerald-600">kg</span>
          </div>
          <input
            type="number"
            step="0.1"
            min="30"
            max="200"
            value={weightKg || ''}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Vòng eo</span>
            <span className="font-semibold text-indigo-600">cm</span>
          </div>
          <input
            type="number"
            step="0.5"
            min="50"
            max="180"
            value={waistCm || ''}
            onChange={(e) => setWaistCm(Number(e.target.value))}
            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

export default BodyMetricsSection;
