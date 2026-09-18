import { useState, useMemo, useEffect, useRef, type FormEvent } from 'react';
import { EquipmentType, WorkoutPhase, WorkoutRecord, Meal } from '../types';
import { EQUIPMENT_LIST, getEquipmentDef } from '../components/workout/equipmentData';
import {
  calculateWorkoutTotals,
  getSmartWorkoutRecommendation,
  getPhasesWithCumulativeDistance
} from '../utils/calculations';
import {
  getLatestBodyMetric,
  getStoredWorkouts,
  saveWorkoutRecord,
  getStoredProfile
} from '../services/storage';

export const useWorkoutForm = () => {
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutRecord[]>([]);
  const [profile, setProfile] = useState(getStoredProfile());

  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  const defaultDateStr = localDate.toISOString().slice(0, 16);

  const [workoutStartTime, setWorkoutStartTime] = useState(defaultDateStr);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [equipmentType, setEquipmentType] = useState<EquipmentType>('TREADMILL');
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const equipmentDef = useMemo(() => getEquipmentDef(equipmentType), [equipmentType]);

  const latestMetric = useMemo(() => getLatestBodyMetric(), []);
  const [weightKg, setWeightKg] = useState<number>(latestMetric.weightKg);
  const [waistCm, setWaistCm] = useState<number>(latestMetric.waistCm);

  const [phase1, setPhase1] = useState<WorkoutPhase>({ phaseNumber: 1, name: 'Warm-up', durationMinutes: 0, speedKmh: 0, inclineDegree: 0 });
  const [phase2, setPhase2] = useState<WorkoutPhase>({ phaseNumber: 2, name: 'Fat Burn', durationMinutes: 0, speedKmh: 0, inclineDegree: 0, isCoreEngaged: false });
  const [phase3, setPhase3] = useState<WorkoutPhase>({ phaseNumber: 3, name: 'Cool-down', durationMinutes: 0, speedKmh: 0, inclineDegree: 0 });

  const [isIntervalMode, setIsIntervalMode] = useState<boolean>(false);
  const [enableRelief, setEnableRelief] = useState<boolean>(true);
  const [enableSurge, setEnableSurge] = useState<boolean>(true);
  
  const [phase2Relief, setPhase2Relief] = useState<WorkoutPhase>({
    phaseNumber: 2,
    name: 'Nhịp xả bớt mệt (Relief)',
    durationMinutes: 0,
    speedKmh: 0,
    inclineDegree: 0,
    distanceKm: 0,
    resistanceLevel: 0,
    cadenceRpm: 0,
    strokeRateSpm: 0,
    stepsPerMin: 0,
    subType: 'RELIEF',
  });

  const [phase2Surge, setPhase2Surge] = useState<WorkoutPhase>({
    phaseNumber: 2,
    name: 'Bứt tốc / Leo dốc 2 (Surge)',
    durationMinutes: 0,
    speedKmh: 0,
    inclineDegree: 0,
    distanceKm: 0,
    resistanceLevel: 0,
    cadenceRpm: 0,
    strokeRateSpm: 0,
    stepsPerMin: 0,
    subType: 'SURGE',
  });

  const [pauseDuration, setPauseDuration] = useState<number>(0);
  const [fatigueLevel, setFatigueLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [waterConsumedMl, setWaterConsumedMl] = useState<number>(500);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [workoutId] = useState(() => crypto.randomUUID());
  
  const handleSelectEquipment = (newType: EquipmentType) => {
    setEquipmentType(newType);
    setPhase1({ phaseNumber: 1, name: 'Warm-up', durationMinutes: 0, speedKmh: 0, inclineDegree: 0 });
    setPhase2({ phaseNumber: 2, name: 'Fat Burn', durationMinutes: 0, speedKmh: 0, inclineDegree: 0, isCoreEngaged: false });
    setPhase3({ phaseNumber: 3, name: 'Cool-down', durationMinutes: 0, speedKmh: 0, inclineDegree: 0 });
    
    setPhase2Relief((prev) => ({ ...prev, durationMinutes: 0, speedKmh: 0, inclineDegree: 0, distanceKm: 0, resistanceLevel: 0, cadenceRpm: 0, strokeRateSpm: 0, stepsPerMin: 0 }));
    setPhase2Surge((prev) => ({ ...prev, durationMinutes: 0, speedKmh: 0, inclineDegree: 0, distanceKm: 0, resistanceLevel: 0, cadenceRpm: 0, strokeRateSpm: 0, stepsPerMin: 0 }));
  };

  const applyEquipmentDefaults = () => {
    const def = getEquipmentDef(equipmentType);
    setPhase1(def.defaultPhases.phase1);
    setPhase2(def.defaultPhases.phase2);
    setPhase3(def.defaultPhases.phase3);
    
    if (equipmentType === 'TREADMILL' || equipmentType === 'OUTDOOR_RUN') {
      setPhase2Relief((prev) => ({ ...prev, inclineDegree: 0, speedKmh: 5.0, distanceKm: 0.42 }));
      setPhase2Surge((prev) => ({ ...prev, inclineDegree: 8, speedKmh: 5.5, distanceKm: 0.46 }));
    } else if (equipmentType === 'STATIONARY_BIKE') {
      setPhase2Relief((prev) => ({ ...prev, resistanceLevel: 3, cadenceRpm: 65, speedKmh: 18 }));
      setPhase2Surge((prev) => ({ ...prev, resistanceLevel: 8, cadenceRpm: 80, speedKmh: 24 }));
    }
  };

  return {
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
  };
};
