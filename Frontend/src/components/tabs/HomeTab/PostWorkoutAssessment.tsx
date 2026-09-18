import React from 'react';
import { Droplets } from 'lucide-react';

interface PostWorkoutAssessmentProps {
  fatigueLevel: 1 | 2 | 3 | 4 | 5;
  setFatigueLevel: (level: 1 | 2 | 3 | 4 | 5) => void;
  waterConsumedMl: number;
  setWaterConsumedMl: React.Dispatch<React.SetStateAction<number>>;
  notes: string;
  setNotes: (notes: string) => void;
}

const fatigueLabels: Record<1 | 2 | 3 | 4 | 5, { emoji: string; text: string; color: string }> = {
  1: { emoji: '😄', text: 'Rất nhẹ', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  2: { emoji: '😊', text: 'Vừa sức', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  3: { emoji: '😐', text: 'Chuẩn Zone 2', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  4: { emoji: '😫', text: 'Rất mệt', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  5: { emoji: '😵', text: 'Kiệt sức', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const PostWorkoutAssessment: React.FC<PostWorkoutAssessmentProps> = ({
  fatigueLevel,
  setFatigueLevel,
  waterConsumedMl,
  setWaterConsumedMl,
  notes,
  setNotes,
}) => {
  return (
    <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-slate-800">
        Đánh Giá Cảm Giác Sau Buổi Tập
      </h3>

      {/* Fatigue Level */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2">
          Mức độ mệt mỏi (Fatigue 1 - 5)
        </label>
        <div className="grid grid-cols-5 gap-2">
          {([1, 2, 3, 4, 5] as const).map((level) => {
            const item = fatigueLabels[level];
            const isSelected = fatigueLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setFatigueLevel(level)}
                className={`py-2 px-1 rounded-2xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  isSelected
                    ? `${item.color} border-2 shadow-xs scale-105 font-bold`
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[10px] leading-tight text-center">
                  {item.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Water Consumed */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Droplets size={14} className="text-sky-500" />
            Lượng nước bổ sung (ml)
          </label>
          <span className="text-xs font-mono font-bold text-sky-600">
            {waterConsumedMl} ml
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            step="50"
            min="0"
            max="3000"
            value={waterConsumedMl}
            onChange={(e) => setWaterConsumedMl(Number(e.target.value))}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setWaterConsumedMl((prev) => prev + 150)}
            className="px-3 py-2 bg-sky-50 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 hover:bg-sky-100 cursor-pointer"
          >
            +150ml
          </button>
          <button
            type="button"
            onClick={() => setWaterConsumedMl((prev) => prev + 250)}
            className="px-3 py-2 bg-sky-50 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 hover:bg-sky-100 cursor-pointer"
          >
            +250ml
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">
          Ghi chú buổi tập
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="VD: Chân thanh thoát, giữ nhịp thở đều, mồ hôi toát tốt..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>
    </div>
  );
};

export default PostWorkoutAssessment;
