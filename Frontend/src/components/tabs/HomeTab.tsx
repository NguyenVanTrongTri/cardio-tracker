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
      {showDraftModal && draftToRestore && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Tìm thấy bản nháp!</h3>
            <p className="text-sm text-slate-600 mb-6">
              Bạn có một buổi tập chưa hoàn thành từ ngày {draftToRestore.workoutStartTime.split('T')[0]}. Bạn có muốn khôi phục lại không?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  // HÀNH ĐỘNG HỦY: Xóa nháp
                  localStorage.removeItem('workout_draft'); // Thay bằng key bạn dùng
                  setShowDraftModal(false);
                }}
                className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl"
              >
                Bỏ qua
              </button>
              <button 
                // ... trong phần Khôi phục (dòng 403 trở đi)
                onClick={() => {
                  setMeals(draftToRestore.meals);
                  handleSelectEquipment(draftToRestore.equipmentType);
                  setWorkoutStartTime(draftToRestore.workoutStartTime);
                  setPauseDuration(draftToRestore.pauseDuration);
                  setFatigueLevel(draftToRestore.fatigueLevel as 1|2|3|4|5);
                  setWaterConsumedMl(draftToRestore.waterConsumedMl);
                  setNotes(draftToRestore.notes || '');
                  setWeightKg(Number(draftToRestore.weightKg));
                  setWaistCm(Number(draftToRestore.waistCm));
                  
                  // Bạn có thể cần set lại cả các state phase (phase1, phase2, phase3) 
                  // nếu muốn khôi phục cả chi tiết bài tập
                  setShowDraftModal(false);
                }}
                  

                className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 rounded-xl"
              >
                Khôi phục
              </button>
            </div>
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
