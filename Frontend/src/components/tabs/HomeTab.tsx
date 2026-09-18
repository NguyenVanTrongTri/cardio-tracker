import { useState, useMemo, useEffect, useRef, type FormEvent } from 'react';
import {
  Flame,
  Timer,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Zap,
  Info,
  Droplets,
  Scale,
  Ruler,
  Clock,
  Utensils,
  ChevronRight,
  ShieldAlert,
  Activity,
  Award,
  Bike,
  Waves,
  Footprints,
  Compass,
  SlidersHorizontal,
  Wind
} from 'lucide-react';
import {
  calculateWorkoutTotals,
  checkPreWorkoutAlert,
  getSmartWorkoutRecommendation,
  getPhasesWithCumulativeDistance
} from '../../utils/calculations';
import {
  getLatestBodyMetric,
  getStoredWorkouts,
  saveWorkoutRecord,
  getStoredProfile
} from '../../services/storage';
import { EquipmentType, WorkoutPhase, WorkoutRecord, Meal } from '../../types';
import { EQUIPMENT_LIST, getEquipmentDef, EquipmentDef } from '../workout/equipmentData';
import EquipmentSelectorModal from '../workout/EquipmentSelectorModal';
import { WorkoutBanner } from './HomeTab/WorkoutBanner';
import MealSection, { MEAL_CATEGORIES } from './HomeTab/MealSection';
import { getEquipmentIcon } from './HomeTab/utils';
import { renderParam1Field, renderParam2Field, renderDurationField, renderDistanceField } from './HomeTab/PhaseControls';
import WorkoutPhasesSection from './HomeTab/WorkoutPhasesSection';
import LiveWorkoutMetrics from './HomeTab/LiveWorkoutMetrics';
import PostWorkoutAssessment from './HomeTab/PostWorkoutAssessment';
import BodyMetricsSection from './HomeTab/BodyMetricsSection';
import DraftRestoreModal from './HomeTab/DraftRestoreModal';
import { useWorkoutForm } from '../../hooks/useWorkoutForm';

interface HomeTabProps {
  key?: string;
  onWorkoutSaved?: () => void;
  onNavigateToHistory?: () => void;
  onAddNotification?: (title: string, message: string) => void;
}

export default function HomeTab({ onWorkoutSaved, onNavigateToHistory, onAddNotification }: HomeTabProps) {
  const {
    recentWorkouts,
    profile,
    workoutStartTime, setWorkoutStartTime,
    meals, setMeals,
    equipmentType,
    isEquipmentModalOpen, setIsEquipmentModalOpen,
    equipmentDef,
    weightKg, setWeightKg,
    waistCm, setWaistCm,
    phase1, setPhase1,
    phase2, setPhase2,
    phase3, setPhase3,
    isIntervalMode, setIsIntervalMode,
    enableRelief, setEnableRelief,
    enableSurge, setEnableSurge,
    phase2Relief, setPhase2Relief,
    phase2Surge, setPhase2Surge,
    pauseDuration, setPauseDuration,
    fatigueLevel, setFatigueLevel,
    waterConsumedMl, setWaterConsumedMl,
    notes, setNotes,
    isSaving, setIsSaving,
    workoutId,
    handleSelectEquipment,
    applyEquipmentDefaults
  } = useWorkoutForm();

  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('practices-enabled-status');
    return saved ? JSON.parse(saved) : {};
  });

  const enabledEquipmentList = useMemo(() => {
    return EQUIPMENT_LIST.filter(item => enabledMap[item.id] !== false);
  }, [enabledMap]);

  useEffect(() => {
    if (enabledEquipmentList.length > 0 && enabledMap[equipmentType] === false) {
      handleSelectEquipment(enabledEquipmentList[0].id as EquipmentType);
    }
  }, [enabledEquipmentList, equipmentType, enabledMap]);

  const [draftToRestore, setDraftToRestore] = useState<WorkoutRecord | null>(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const isInitialized = useRef(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  // Real-time calculated phases
  const phases = useMemo(() => {
    if (!isIntervalMode) {
      return [phase1, phase2, phase3];
    }
    const list: WorkoutPhase[] = [
      phase1,
      { ...phase2, name: 'Đợt 1: Leo dốc chính', subType: 'MAIN' },
    ];
    if (enableRelief) {
      list.push({ ...phase2Relief, phaseNumber: 2 });
    }
    if (enableSurge) {
      list.push({ ...phase2Surge, phaseNumber: 2 });
    }
    list.push(phase3);
    return list;
  }, [isIntervalMode, phase1, phase2, phase2Relief, phase2Surge, enableRelief, enableSurge, phase3]);

  const phasesWithCumulative = useMemo(() => {
    return getPhasesWithCumulativeDistance(phases);
  }, [phases]);

  // Map of segment distances by phase index or role for PhaseControls

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }

    const timer = setTimeout(() => {
      saveWorkoutRecord({
        workoutStartTime,
        meals,
        equipmentType,
        phases: phasesWithCumulative,
        pauseDuration,
        fatigueLevel,
        waterConsumedMl,
        notes,
        weightKg,
        waistCm
      });
      console.log('Workout auto-saved');
    }, 1500);

    return () => clearTimeout(timer);
  }, [meals, workoutStartTime, equipmentType, phasesWithCumulative, pauseDuration, fatigueLevel, waterConsumedMl, notes, weightKg, waistCm]);

  useEffect(() => {
  const workouts = getStoredWorkouts();
  const lastWorkout = workouts[0];
  
    if (lastWorkout) {
      const draftDate = lastWorkout.workoutStartTime.split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      
      // Nếu bản nháp khác ngày hôm nay -> Hiện Modal hỏi
      if (draftDate !== today) {
        setDraftToRestore(lastWorkout);
        setShowDraftModal(true);
      } else {
        // Nếu là hôm nay thì khôi phục thẳng hoặc để người dùng tiếp tục
        setMeals(lastWorkout.meals);
        // ... bạn có thể khôi phục các state khác ở đây nếu muốn
      }
    }
    // setRecentWorkouts(workouts);
    // setProfile(getStoredProfile());
  }, []);

  // Handle Equipment Switch: updates equipment and resets phases
  // handleSelectEquipment is now from hook
  const handleSelectEquipmentLocal = handleSelectEquipment;

  // Populate equipment defaults
  // applyEquipmentDefaults is now from hook
  const applyEquipmentDefaultsLocal = applyEquipmentDefaults;

  // Smart Recommendation
  const smartRec = useMemo(() => {
    return getSmartWorkoutRecommendation(recentWorkouts);
  }, [recentWorkouts]);

  // Real-time calculations with current equipment
  const liveTotals = useMemo(() => {
    return calculateWorkoutTotals(phases, pauseDuration, weightKg, equipmentType);
  }, [phases, pauseDuration, weightKg, equipmentType]);

  const phaseDistances = useMemo(() => {
    // Return segment distances corresponding to each phase in the form
    // [phase1, phase2, phase2Relief?, phase2Surge?, phase3]
    const p1 = phasesWithCumulative.find((p) => p.phaseNumber === 1)?.segmentDistanceKm;
    const p2Main = phasesWithCumulative.find((p) => p.phaseNumber === 2 && (!p.subType || p.subType === 'MAIN'))?.segmentDistanceKm;
    const p2Relief = phasesWithCumulative.find((p) => p.subType === 'RELIEF')?.segmentDistanceKm;
    const p2Surge = phasesWithCumulative.find((p) => p.subType === 'SURGE')?.segmentDistanceKm;
    const p3 = phasesWithCumulative.find((p) => p.phaseNumber === 3)?.segmentDistanceKm;

    return {
      phase1: p1 || 0,
      phase2: p2Main || 0,
      phase2Relief: p2Relief || 0,
      phase2Surge: p2Surge || 0,
      phase3: p3 || 0,
    };
  }, [phasesWithCumulative]);

  // Tính toán xem dữ liệu có thay đổi so với bản nháp gần nhất không
  const isDirty = useMemo(() => {
    const lastStored = getStoredWorkouts()[0];
    if (!lastStored) return true; // Chưa có bản nháp nào thì luôn coi là "bẩn" (cần lưu)
    
    // So sánh dữ liệu hiện tại với bản nháp gần nhất
    return JSON.stringify(lastStored.phases) !== JSON.stringify(phasesWithCumulative);
  }, [phasesWithCumulative, equipmentType, meals]);
  // Real-time Pre-workout alert\
  
  const handleSaveWorkout = async (e: FormEvent) => {
    e.preventDefault();
    console.log('handleSaveWorkout called, isDirty:', isDirty);
    if (!isDirty) {
      onAddNotification?.('Thông báo', 'Dữ liệu không có thay đổi mới để lưu!');
      return;
    }

    console.log('Setting isSaving to true');
    setTimeout(() => setIsSaving(true), 0);

    const savedPhases = phasesWithCumulative.map((p) => {
      return {
        ...p,
        durationMinutes: Number(p.durationMinutes) || 0,
        speedKmh: Number(p.speedKmh) || 0,
        inclineDegree: Number(p.inclineDegree) || 0,
        distanceKm: p.distanceKm !== undefined ? Number(p.distanceKm) : undefined,
        segmentDistanceKm: p.segmentDistanceKm,
        cumulativeDistanceKm: p.cumulativeDistanceKm,
        resistanceLevel: Number(p.resistanceLevel) || 0,
        cadenceRpm: Number(p.cadenceRpm) || 0,
        strokeRateSpm: Number(p.strokeRateSpm) || 0,
        stepsPerMin: Number(p.stepsPerMin) || 0,
      };
    });

    try {
      // 👉 Lấy token chuẩn từ session v2 đã được lưu lúc đăng nhập
      let token = '';
      const sessionData = localStorage.getItem('cardio_session_v2');
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          token = parsed.token;
        } catch (e) {
          console.error('Lỗi đọc session token:', e);
        }
      }
      // Fallback dự phòng nếu có nơi nào lưu lẻ key 'token'
      if (!token) {
        token = localStorage.getItem('token') || '';
      }

      // 👉 Trỏ trực tiếp tới domain backend trên Vercel
      const response = await fetch('https://backendcardio.vercel.app/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          id: workoutId,
          equipmentType,
          workoutStartTime,
          meals: meals,
          weightKg: Number(weightKg) || 70,
          waistCm: Number(waistCm) || 80,
          phases: savedPhases,
          activeTime: liveTotals.activeTime,
          calories: liveTotals.calories,
          totalDistanceKm: liveTotals.totalDistanceKm,
          pauseDuration: Number(pauseDuration) || 0,
          fatigueLevel,
          waterConsumedMl: Number(waterConsumedMl) || 0,
          notes: notes.trim(),
        }),
      });

      // 👉 Bắt response cẩn thận giống phong cách trang Login
      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { message: rawText || 'Invalid JSON response' };
      }

      if (!response.ok) {
        throw new Error(data.message || `Lỗi server HTTP ${response.status}`);
      }
      localStorage.removeItem('workout_draft');

      // Thông báo thành công
      onAddNotification?.(
        'Lưu thành công! 🎉',
        `Buổi tập [${equipmentDef.shortName}] đã được lưu trữ an toàn vào cơ sở dữ liệu!`
      );
      
      if (onWorkoutSaved) onWorkoutSaved();
    } catch (error: any) {
      console.error('Lỗi kết nối API:', error);
      onAddNotification?.(
        'Lưu thất bại ❌',
        `Không thể lưu buổi tập: ${error.message || 'Lỗi kết nối server!'}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-4 pb-28 space-y-5">
      {/* Top Welcome & Smart Coaching Banner */}
      <WorkoutBanner smartRec={smartRec} profileName={profile.fullName} />

      {/* Success Notification */}
      {savedSuccessMessage && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 size={24} className="shrink-0 text-emerald-200" />
          <div className="flex-1 text-sm font-medium">
            {savedSuccessMessage}
          </div>
        </div>
      )}
      {showDraftModal && draftToRestore && (
        <DraftRestoreModal
          draft={draftToRestore}
          onDiscard={() => {
            localStorage.removeItem('workout_draft');
            setShowDraftModal(false);
          }}
          onRestore={() => {
            setMeals(draftToRestore.meals);
            handleSelectEquipment(draftToRestore.equipmentType);
            setWorkoutStartTime(draftToRestore.workoutStartTime);
            setPauseDuration(draftToRestore.pauseDuration);
            setFatigueLevel(draftToRestore.fatigueLevel as 1|2|3|4|5);
            setWaterConsumedMl(draftToRestore.waterConsumedMl);
            setNotes(draftToRestore.notes || '');
            setWeightKg(Number(draftToRestore.weightKg));
            setWaistCm(Number(draftToRestore.waistCm));
            setShowDraftModal(false);
          }}
        />
      )}

      {/* Main Form */}
      <form onSubmit={handleSaveWorkout} className="space-y-5">
        {/* Date & Time Picker */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-2.5">
            <Clock size={16} className="text-slate-500" />
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Thời Điểm Bắt Đầu Tập
            </label>
          </div>
          <input
            type="datetime-local"
            value={workoutStartTime}
            onChange={(e) => setWorkoutStartTime(e.target.value)}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Pre-workout Meal Section & Smart Alert */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils size={17} className="text-amber-600" />
              <h3 className="text-sm font-bold text-slate-800">
                Bữa Ăn
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {MEAL_CATEGORIES.map((category) => (
              <MealSection key={category} category={category} meals={meals} setMeals={setMeals} />
            ))}
          </div>
          {meals.some(meal => checkPreWorkoutAlert(workoutStartTime, meal.time)) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-amber-800 text-xs">
              <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Cảnh báo xóc hông:</strong> Bữa ăn cách giờ tập dưới 20 phút. Nên giãn cách tối thiểu 30-45 phút để dạ dày tiêu hóa nhẹ nhàng.
              </div>
            </div>
          )}
        </div>

        <BodyMetricsSection weightKg={weightKg} setWeightKg={setWeightKg} waistCm={waistCm} setWaistCm={setWaistCm} />

        <WorkoutPhasesSection
          equipmentType={equipmentType}
          equipmentDef={equipmentDef}
          enabledEquipmentList={enabledEquipmentList}
          phase1={phase1} setPhase1={setPhase1}
          phase2={phase2} setPhase2={setPhase2}
          phase3={phase3} setPhase3={setPhase3}
          isIntervalMode={isIntervalMode} setIsIntervalMode={setIsIntervalMode}
          enableRelief={enableRelief} setEnableRelief={setEnableRelief}
          enableSurge={enableSurge} setEnableSurge={setEnableSurge}
          phase2Relief={phase2Relief} setPhase2Relief={setPhase2Relief}
          phase2Surge={phase2Surge} setPhase2Surge={setPhase2Surge}
          phaseDistances={phaseDistances}
          handleSelectEquipment={handleSelectEquipment}
          setIsEquipmentModalOpen={setIsEquipmentModalOpen}
          applyEquipmentDefaults={applyEquipmentDefaults}
          liveTotals={liveTotals}
          pauseDuration={pauseDuration}
          setPauseDuration={setPauseDuration}
        />

        <LiveWorkoutMetrics liveTotals={liveTotals} equipmentDef={equipmentDef} />
        <PostWorkoutAssessment
          fatigueLevel={fatigueLevel}
          setFatigueLevel={setFatigueLevel}
          waterConsumedMl={waterConsumedMl}
          setWaterConsumedMl={setWaterConsumedMl}
          notes={notes}
          setNotes={setNotes}
        />

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={isSaving}
          className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-base py-4 px-6 rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <Flame size={20} className="fill-white" />
          <span>{isSaving ? 'ĐANG LƯU...!' : `LƯU BUỔI TẬP (${equipmentDef.shortName.toUpperCase()})`}</span>
        </button>
      </form>

      {/* Equipment Selector Modal */}
      <EquipmentSelectorModal
        isOpen={isEquipmentModalOpen}
        currentType={equipmentType}
        onSelect={handleSelectEquipment}
        onClose={() => setIsEquipmentModalOpen(false)}
      />
    </div>
  );
}
