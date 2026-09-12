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
  SlidersHorizontal
} from 'lucide-react';
import {
  calculateWorkoutTotals,
  checkPreWorkoutAlert,
  getSmartWorkoutRecommendation
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

interface HomeTabProps {
  key?: string;
  onWorkoutSaved?: () => void;
  onNavigateToHistory?: () => void;
  onAddNotification?: (title: string, message: string) => void;
}

export default function HomeTab({ onWorkoutSaved, onNavigateToHistory, onAddNotification }: HomeTabProps) {
  // Load recent workouts for smart advice
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutRecord[]>([]);
  const [profile, setProfile] = useState(getStoredProfile());

  // Form State
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  const defaultDateStr = localDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm

  const [workoutStartTime, setWorkoutStartTime] = useState(defaultDateStr);
  const [meals, setMeals] = useState<Meal[]>([]);

  // Equipment selection state
  const [equipmentType, setEquipmentType] = useState<EquipmentType>('TREADMILL');
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const equipmentDef = useMemo(() => getEquipmentDef(equipmentType), [equipmentType]);

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

  // Body metrics
  const latestMetric = useMemo(() => getLatestBodyMetric(), []);
  const [weightKg, setWeightKg] = useState<number>(latestMetric.weightKg);
  const [waistCm, setWaistCm] = useState<number>(latestMetric.waistCm);

  // 3-Phase State (initialized with current equipment defaults)
  const [phase1, setPhase1] = useState<WorkoutPhase>(equipmentDef.defaultPhases.phase1);
  const [phase2, setPhase2] = useState<WorkoutPhase>(equipmentDef.defaultPhases.phase2);
  const [phase3, setPhase3] = useState<WorkoutPhase>(equipmentDef.defaultPhases.phase3);

  const [pauseDuration, setPauseDuration] = useState<number>(0);
  const [fatigueLevel, setFatigueLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [waterConsumedMl, setWaterConsumedMl] = useState<number>(500);
  const [notes, setNotes] = useState<string>('');

  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);
  const isInitialized = useRef(false);

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
        phases: [phase1, phase2, phase3],
        pauseDuration,
        fatigueLevel,
        waterConsumedMl,
        notes,
        weightKg,
        waistCm
      });
      console.log('Meals auto-saved');
    }, 1500);

    return () => clearTimeout(timer);
  }, [meals, workoutStartTime, equipmentType, phase1, phase2, phase3, pauseDuration, fatigueLevel, waterConsumedMl, notes, weightKg, waistCm]);

  useEffect(() => {
    const workouts = getStoredWorkouts();
    const today = new Date().toISOString().split('T')[0];
    const lastWorkout = workouts[0];
    
    if (lastWorkout && lastWorkout.workoutStartTime.startsWith(today)) {
      setMeals(lastWorkout.meals);
    } else {
      setMeals([]);
    }
    
    setRecentWorkouts(workouts);
    setProfile(getStoredProfile());
  }, []);

  // Handle Equipment Switch: updates equipment and phase presets
  const handleSelectEquipment = (newType: EquipmentType) => {
    setEquipmentType(newType);
    const def = getEquipmentDef(newType);
    setPhase1(def.defaultPhases.phase1);
    setPhase2(def.defaultPhases.phase2);
    setPhase3(def.defaultPhases.phase3);
  };

  // Smart Recommendation
  const smartRec = useMemo(() => {
    return getSmartWorkoutRecommendation(recentWorkouts);
  }, [recentWorkouts]);

  // Real-time calculations with current equipment
  const phases = useMemo(() => [phase1, phase2, phase3], [phase1, phase2, phase3]);
  const liveTotals = useMemo(() => {
    return calculateWorkoutTotals(phases, pauseDuration, weightKg, equipmentType);
  }, [phases, pauseDuration, weightKg, equipmentType]);

  // Real-time Pre-workout alert
  const handleSaveWorkout = (e: FormEvent) => {
    e.preventDefault();

    const p1Dist =
      Number(phase1.distanceKm) ||
      (Number(phase1.speedKmh) && Number(phase1.durationMinutes)
        ? Math.round(((Number(phase1.speedKmh) * Number(phase1.durationMinutes)) / 60) * 100) / 100
        : 0);
    const p2Dist =
      Number(phase2.distanceKm) ||
      (Number(phase2.speedKmh) && Number(phase2.durationMinutes)
        ? Math.round(((Number(phase2.speedKmh) * Number(phase2.durationMinutes)) / 60) * 100) / 100
        : 0);
    const p3Dist =
      Number(phase3.distanceKm) ||
      (Number(phase3.speedKmh) && Number(phase3.durationMinutes)
        ? Math.round(((Number(phase3.speedKmh) * Number(phase3.durationMinutes)) / 60) * 100) / 100
        : 0);

    const saved = saveWorkoutRecord({
      equipmentType,
      workoutStartTime,
      meals: meals,
      weightKg: Number(weightKg) || 70,
      waistCm: Number(waistCm) || 80,
      phases: [
        {
          ...phase1,
          durationMinutes: Number(phase1.durationMinutes),
          speedKmh: Number(phase1.speedKmh) || 0,
          inclineDegree: Number(phase1.inclineDegree) || 0,
          distanceKm: p1Dist,
          resistanceLevel: Number(phase1.resistanceLevel) || 0,
          cadenceRpm: Number(phase1.cadenceRpm) || 0,
          strokeRateSpm: Number(phase1.strokeRateSpm) || 0,
          stepsPerMin: Number(phase1.stepsPerMin) || 0,
        },
        {
          ...phase2,
          durationMinutes: Number(phase2.durationMinutes),
          speedKmh: Number(phase2.speedKmh) || 0,
          inclineDegree: Number(phase2.inclineDegree) || 0,
          distanceKm: p2Dist,
          resistanceLevel: Number(phase2.resistanceLevel) || 0,
          cadenceRpm: Number(phase2.cadenceRpm) || 0,
          strokeRateSpm: Number(phase2.strokeRateSpm) || 0,
          stepsPerMin: Number(phase2.stepsPerMin) || 0,
        },
        {
          ...phase3,
          durationMinutes: Number(phase3.durationMinutes),
          speedKmh: Number(phase3.speedKmh) || 0,
          inclineDegree: Number(phase3.inclineDegree) || 0,
          distanceKm: p3Dist,
          resistanceLevel: Number(phase3.resistanceLevel) || 0,
          cadenceRpm: Number(phase3.cadenceRpm) || 0,
          strokeRateSpm: Number(phase3.strokeRateSpm) || 0,
          stepsPerMin: Number(phase3.stepsPerMin) || 0,
        },
      ],
      totalDistanceKm: liveTotals.totalDistanceKm,
      pauseDuration: Number(pauseDuration) || 0,
      fatigueLevel,
      waterConsumedMl: Number(waterConsumedMl) || 0,
      notes: notes.trim(),
    });

    // setSavedSuccessMessage(
    //   `🎉 Buổi tập [${equipmentDef.shortName}] đã lưu thành công! Tiêu hao ${saved.calories} kcal trong ${saved.activeTime} phút vận động.`
    // );
    // setTimeout(() => {
    //   setSavedSuccessMessage(null);
    //   if (onWorkoutSaved) onWorkoutSaved();
    // }, 2500);

    onAddNotification?.(
      'Lưu thành công! 🎉',
      `Buổi tập [${equipmentDef.shortName}] đã lưu thành công! Tiêu hao ${saved.calories} kcal trong ${saved.activeTime} phút vận động.`
    );
    if (onWorkoutSaved) onWorkoutSaved();
  };

  const fatigueLabels: Record<1 | 2 | 3 | 4 | 5, { emoji: string; text: string; color: string }> = {
    1: { emoji: '😄', text: 'Rất nhẹ', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    2: { emoji: '😊', text: 'Vừa sức', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    3: { emoji: '😐', text: 'Chuẩn Zone 2', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    4: { emoji: '😫', text: 'Rất mệt', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    5: { emoji: '😵', text: 'Kiệt sức', color: 'bg-rose-50 text-rose-700 border-rose-200' },
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

        {/* Daily Metrics Card */}
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
                value={weightKg}
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
                value={waistCm}
                onChange={(e) => setWaistCm(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 3-PHASE WORKOUT SECTION WITH WORKOUT MODALITY SELECTOR */}
        <div className="space-y-3">
          {/* Header with Workout Modality Button */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Activity size={17} className="text-emerald-600" />
                <span>Chi Tiết 3 Giai Đoạn Tập</span>
              </h3>

              {/* Nút Lựa Chọn Hình Thức Tập Luyện (Button to Choose Modality) */}
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
              </div>
              <span className="shrink-0 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md self-start">
                {equipmentDef.tag}
              </span>
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
              {renderDistanceField({ phase: phase1, setPhase: setPhase1, equipmentDef, colorRing: 'focus:ring-amber-500/20' })}
            </div>
          </div>

          {/* Phase 2: Fat Burn (Trọng tâm) */}
          <div className="bg-gradient-to-b from-emerald-50/70 to-white p-4.5 rounded-2xl border-2 border-emerald-500 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
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
                  Chuẩn Zone 2
                </span>
              ) : (
                <span className="text-xs text-slate-500 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                  {equipmentDef.zone2Criteria}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
              {renderDurationField({
                phase: phase2,
                setPhase: setPhase2,
                min: 5,
                max: 60,
                className:
                  'w-full bg-white border-2 border-emerald-300 rounded-xl px-2.5 py-2.5 text-center text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
              })}

              {renderParam1Field({ phase: phase2, setPhase: setPhase2, equipmentDef, colorRing: 'focus:ring-emerald-500/30' })}
              {renderParam2Field({ phase: phase2, setPhase: setPhase2, equipmentDef, colorRing: 'focus:ring-emerald-500/30' })}
              {renderDistanceField({
                phase: phase2,
                setPhase: setPhase2,
                equipmentDef,
                colorRing: 'focus:ring-emerald-500/30',
                className:
                  'w-full bg-white border-2 border-emerald-300 rounded-xl px-2.5 py-2.5 text-center text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
              })}
            </div>

            {/* Core Focus / Engagement Toggle tailored for current equipment */}
            <div className="bg-white/90 p-3.5 rounded-xl border border-emerald-200/90 flex items-center justify-between gap-2">
              <div className="pr-2">
                <div className="flex items-center gap-2">
                  <Zap
                    size={16}
                    className={
                      phase2.isCoreEngaged
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-slate-400'
                    }
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
                onClick={() =>
                  setPhase2({ ...phase2, isCoreEngaged: !phase2.isCoreEngaged })
                }
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
          </div>

          {/* Phase 3: Cool-down */}
          <div className="bg-white p-4 rounded-2xl border border-sky-200/70 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h4 className="text-sm font-bold text-slate-800">
                  Giai đoạn 3: Cool-down (Hạ nhiệt)
                </h4>
              </div>
              <span className="text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md font-medium">
                Hạ nhịp tim an toàn
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {renderDurationField({
                phase: phase3,
                setPhase: setPhase3,
                min: 1,
                max: 20,
                colorRing: 'focus:ring-sky-500/20',
              })}

              {renderParam1Field({ phase: phase3, setPhase: setPhase3, equipmentDef, colorRing: 'focus:ring-sky-500/20' })}
              {renderParam2Field({ phase: phase3, setPhase: setPhase3, equipmentDef, colorRing: 'focus:ring-sky-500/20' })}
              {renderDistanceField({ phase: phase3, setPhase: setPhase3, equipmentDef, colorRing: 'focus:ring-sky-500/20' })}
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
        </div>

        {/* Live Calculation Metric Bar */}
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

          {/* Cortisol Alert if Active Time > 50 min */}
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

        {/* Secondary Assessment (Mệt mỏi & Nước & Note) */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">
            Đánh Giá Cảm Giác Sau Buổi Tập
          </h3>

          {/* Fatigue Level (5 Emojis) */}
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

        {/* Primary Action Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-base py-4 px-6 rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Flame size={20} className="fill-white" />
          <span>LƯU BUỔI TẬP ({equipmentDef.shortName.toUpperCase()})</span>
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
