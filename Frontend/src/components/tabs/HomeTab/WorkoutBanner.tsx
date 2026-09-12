import { Flame, Timer, AlertTriangle, CheckCircle2, Sparkles, Zap, Info, Droplets, Scale, Ruler, Clock, Utensils, ChevronRight, ShieldAlert, Activity, Award, Bike, Waves, Footprints, Compass, SlidersHorizontal } from 'lucide-react';
import { Meal, WorkoutPhase, WorkoutRecord, EquipmentType } from '../../../types';
import { getEquipmentDef } from '../../workout/equipmentData';

interface WorkoutBannerProps {
  smartRec: { advice: string; suggestedIncline: number; suggestedSpeed: number };
  profileName: string;
}

export function WorkoutBanner({ smartRec, profileName }: WorkoutBannerProps) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-4.5 rounded-3xl shadow-lg border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Cardio Smart Coach
            </span>
          </div>
          <span className="text-xs text-slate-300 font-medium bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-xs">
            {profileName || 'Vận động viên'}
          </span>
        </div>

        <div className="flex items-start gap-3 mt-2">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-sm text-slate-100 font-medium leading-snug">
              {smartRec.advice}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-emerald-300/90 font-mono">
              <span>Độ dốc chuẩn: {smartRec.suggestedIncline}°</span>
              <span>•</span>
              <span>Tốc độ: {smartRec.suggestedSpeed} km/h</span>
            </div>
          </div>
        </div>
      </div>
  );
}
