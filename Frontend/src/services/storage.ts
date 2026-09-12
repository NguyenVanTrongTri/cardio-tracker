import { DailyBodyMetric, DailyMealJournal, Meal, UserProfile, WorkoutRecord } from '../types';
import { calculateWorkoutTotals, checkPreWorkoutAlert } from '../utils/calculations';

const PROFILE_KEY = 'cardio_tracker_profile_v2';
const METRICS_KEY = 'cardio_tracker_metrics_v2';
const WORKOUTS_KEY = 'cardio_tracker_workouts_v2';
const MEALS_JOURNAL_KEY = 'cardio_tracker_meals_journal_v1';

export const DEFAULT_PROFILE: UserProfile = {
  fullName: 'Minh Trí',
  heightCm: 173,
  gender: 'MALE',
  birthYear: 1996,
  targetWaistCm: 80,
  targetWeightKg: 67.0,
  weightKg: 70.0,
  targetDate: '2026-10-31',
  waistCm: 82,
  hipCm: 90,
  chestCm: 95,
  bicepsCm: 30,
  thighCm: 50,
  neckCm: 35,
  bodyFatPercentage: 20,
  activityLevel: 'SEDENTARY',
  workoutEnvironment: 'HOME',
  medicalConditions: ['NONE'],
  medicalNotes: '',
  weeklyGoalKg: 0.5,
};

export const INITIAL_BODY_METRICS: DailyBodyMetric[] = [
  { id: 'm-1', metricDate: '2026-08-15', weightKg: 73.0, waistCm: 86.5, recordedAt: '2026-08-15T07:00:00Z' },
  { id: 'm-2', metricDate: '2026-08-19', weightKg: 72.4, waistCm: 85.8, recordedAt: '2026-08-19T07:00:00Z' },
  { id: 'm-3', metricDate: '2026-08-23', weightKg: 71.9, waistCm: 85.0, recordedAt: '2026-08-23T07:00:00Z' },
  { id: 'm-4', metricDate: '2026-08-28', weightKg: 71.2, waistCm: 84.2, recordedAt: '2026-08-28T07:00:00Z' },
  { id: 'm-5', metricDate: '2026-09-01', weightKg: 70.6, waistCm: 83.5, recordedAt: '2026-09-01T07:00:00Z' },
  { id: 'm-6', metricDate: '2026-09-04', weightKg: 70.0, waistCm: 82.8, recordedAt: '2026-09-04T07:00:00Z' },
  { id: 'm-7', metricDate: '2026-09-07', weightKg: 69.4, waistCm: 82.0, recordedAt: '2026-09-07T07:00:00Z' },
];

export const INITIAL_WORKOUTS: WorkoutRecord[] = [
  {
    id: 'w-105',
    equipmentType: 'TREADMILL',
    workoutStartTime: '2026-09-06T17:30',
    meals: [{ id: 'm-1', time: '16:30', category: 'Bữa Sáng', foodItems: [{id: 'fi-1', foodName: 'Cơm trắng', grams: 200, calories: 260}], totalCalories: 260 }],
    weightKg: 69.6,
    waistCm: 82.2,
    phases: [
      { phaseNumber: 1, name: 'Warm-up', durationMinutes: 7, speedKmh: 4.5, inclineDegree: 3.0 },
      { phaseNumber: 2, name: 'Fat Burn', durationMinutes: 30, speedKmh: 5.2, inclineDegree: 8.5, isCoreEngaged: true },
      { phaseNumber: 3, name: 'Cool-down', durationMinutes: 6, speedKmh: 4.0, inclineDegree: 2.0 },
    ],
    pauseDuration: 0,
    fatigueLevel: 3,
    waterConsumedMl: 550,
    notes: 'Giữ form chuẩn, siết chặt bụng toàn bộ Phase 2.',
    activeTime: 43,
    calories: 338.5,
    efficiencyIndex: 7.87,
    isZone2: true,
    cortisolAlert: false,
    preWorkoutAlert: false,
    createdAt: '2026-09-06T18:20:00Z',
  },
  // ...
  {
    id: 'w-104',
    equipmentType: 'TREADMILL',
    workoutStartTime: '2026-09-04T18:00',
    meals: [{ id: 'm-2', time: '17:45', category: 'Bữa Trưa', foodItems: [{id: 'fi-2', foodName: 'Ức gà (đã nấu)', grams: 200, calories: 330}], totalCalories: 330 }],
    weightKg: 70.0,
    waistCm: 82.8,
    phases: [
      { phaseNumber: 1, name: 'Warm-up', durationMinutes: 8, speedKmh: 4.2, inclineDegree: 3.0 },
      { phaseNumber: 2, name: 'Fat Burn', durationMinutes: 28, speedKmh: 5.0, inclineDegree: 8.0, isCoreEngaged: true },
      { phaseNumber: 3, name: 'Cool-down', durationMinutes: 7, speedKmh: 4.0, inclineDegree: 2.0 },
    ],
    pauseDuration: 1,
    fatigueLevel: 2,
    waterConsumedMl: 500,
    notes: 'Hơi tức bụng lúc mới vào do ăn bánh chuối sát giờ.',
    activeTime: 42,
    calories: 318.2,
    efficiencyIndex: 7.58,
    isZone2: true,
    cortisolAlert: false,
    preWorkoutAlert: true,
    createdAt: '2026-09-04T18:50:00Z',
  },
  {
    id: 'w-103',
    equipmentType: 'TREADMILL',
    workoutStartTime: '2026-09-02T06:45',
    meals: [{ id: 'm-3', time: '06:00', category: 'Bữa Sáng', foodItems: [{id: 'fi-3', foodName: 'Thịt bò (nạc)', grams: 200, calories: 500}], totalCalories: 500 }],
    weightKg: 70.4,
    waistCm: 83.2,
    phases: [
      { phaseNumber: 1, name: 'Warm-up', durationMinutes: 10, speedKmh: 4.5, inclineDegree: 4.0 },
      { phaseNumber: 2, name: 'Fat Burn', durationMinutes: 38, speedKmh: 5.3, inclineDegree: 8.0, isCoreEngaged: false },
      { phaseNumber: 3, name: 'Cool-down', durationMinutes: 8, speedKmh: 4.0, inclineDegree: 2.0 },
    ],
    pauseDuration: 2,
    fatigueLevel: 4,
    waterConsumedMl: 700,
    notes: 'Đi hơi quá đà hơn 50 phút, chân mỏi rã rời.',
    activeTime: 54,
    calories: 422.0,
    efficiencyIndex: 7.81,
    isZone2: false,
    cortisolAlert: true,
    preWorkoutAlert: false,
    createdAt: '2026-09-02T07:45:00Z',
  },
  {
    id: 'w-102',
    equipmentType: 'TREADMILL',
    workoutStartTime: '2026-08-31T17:15',
    meals: [{ id: 'm-4', time: '16:00', category: 'Bữa Xế', foodItems: [{id: 'fi-4', foodName: 'Cơm trắng', grams: 200, calories: 260}], totalCalories: 260 }],
    weightKg: 70.8,
    waistCm: 83.8,
    phases: [
      { phaseNumber: 1, name: 'Warm-up', durationMinutes: 6, speedKmh: 4.2, inclineDegree: 2.5 },
      { phaseNumber: 2, name: 'Fat Burn', durationMinutes: 30, speedKmh: 5.0, inclineDegree: 8.0, isCoreEngaged: true },
      { phaseNumber: 3, name: 'Cool-down', durationMinutes: 5, speedKmh: 4.0, inclineDegree: 2.0 },
    ],
    pauseDuration: 0,
    fatigueLevel: 2,
    waterConsumedMl: 600,
    notes: 'Nhịp tim duy trì đều ở 132 bpm, mồ hôi đẫm áo.',
    activeTime: 41,
    calories: 312.4,
    efficiencyIndex: 7.62,
    isZone2: true,
    cortisolAlert: false,
    preWorkoutAlert: false,
    createdAt: '2026-08-31T18:05:00Z',
  },
  {
    id: 'w-101',
    equipmentType: 'TREADMILL',
    workoutStartTime: '2026-08-28T17:30',
    meals: [{ id: 'm-5', time: '16:15', category: 'Bữa Tối', foodItems: [{id: 'fi-5', foodName: 'Ức gà (đã nấu)', grams: 200, calories: 330}], totalCalories: 330 }],
    weightKg: 71.2,
    waistCm: 84.2,
    phases: [
      { phaseNumber: 1, name: 'Warm-up', durationMinutes: 6, speedKmh: 4.0, inclineDegree: 2.0 },
      { phaseNumber: 2, name: 'Fat Burn', durationMinutes: 24, speedKmh: 4.8, inclineDegree: 7.0, isCoreEngaged: false },
      { phaseNumber: 3, name: 'Cool-down', durationMinutes: 5, speedKmh: 3.8, inclineDegree: 1.0 },
    ],
    pauseDuration: 0,
    fatigueLevel: 2,
    waterConsumedMl: 450,
    notes: 'Dốc 7 độ hơi nhẹ, chưa đủ điều kiện Zone 2 8 độ.',
    activeTime: 35,
    calories: 236.0,
    efficiencyIndex: 6.74,
    isZone2: false,
    cortisolAlert: false,
    preWorkoutAlert: false,
    createdAt: '2026-08-28T18:15:00Z',
  },
];

import { getCurrentUser, updateCurrentUserProfile } from './auth';

export function getStoredProfile(): UserProfile {
  try {
    const currentUser = getCurrentUser();
    if (currentUser) {
      return {
        fullName: currentUser.fullName,
        heightCm: currentUser.heightCm,
        gender: currentUser.gender,
        birthYear: currentUser.birthYear,
        targetWaistCm: currentUser.targetWaistCm,
        targetWeightKg: currentUser.targetWeightKg,
        weightKg: currentUser.weightKg || 70.0,
        targetDate: currentUser.targetDate,
        waistCm: currentUser.waistCm,
        hipCm: currentUser.hipCm,
        chestCm: currentUser.chestCm,
        bicepsCm: currentUser.bicepsCm,
        thighCm: currentUser.thighCm,
        neckCm: currentUser.neckCm,
        bodyFatPercentage: currentUser.bodyFatPercentage,
        activityLevel: currentUser.activityLevel,
        workoutEnvironment: currentUser.workoutEnvironment,
        medicalConditions: currentUser.medicalConditions,
        medicalNotes: currentUser.medicalNotes,
        weeklyGoalKg: currentUser.weeklyGoalKg,
      };
    }
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    updateCurrentUserProfile(profile);
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function getStoredMetrics(): DailyBodyMetric[] {
  try {
    const raw = localStorage.getItem(METRICS_KEY);
    if (!raw) {
      localStorage.setItem(METRICS_KEY, JSON.stringify(INITIAL_BODY_METRICS));
      return INITIAL_BODY_METRICS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BODY_METRICS;
  } catch {
    return INITIAL_BODY_METRICS;
  }
}

export function saveBodyMetric(weightKg: number, waistCm: number, dateStr?: string): DailyBodyMetric[] {
  const list = getStoredMetrics();
  const today = dateStr || new Date().toISOString().split('T')[0];

  const existingIdx = list.findIndex((m) => m.metricDate === today);
  if (existingIdx >= 0) {
    list[existingIdx] = {
      ...list[existingIdx],
      weightKg,
      waistCm,
      recordedAt: new Date().toISOString(),
    };
  } else {
    list.push({
      id: `m-${Date.now()}`,
      metricDate: today,
      weightKg,
      waistCm,
      recordedAt: new Date().toISOString(),
    });
  }

  list.sort((a, b) => a.metricDate.localeCompare(b.metricDate));
  try {
    localStorage.setItem(METRICS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save metric', e);
  }
  return list;
}

export function getLatestBodyMetric(): { weightKg: number; waistCm: number } {
  const list = getStoredMetrics();
  if (list.length === 0) {
    return { weightKg: 70.0, waistCm: 82.5 };
  }
  const last = list[list.length - 1];
  return { weightKg: last.weightKg, waistCm: last.waistCm };
}

export function getStoredWorkouts(): WorkoutRecord[] {
  try {
    const raw = localStorage.getItem(WORKOUTS_KEY);
    if (!raw) {
      localStorage.setItem(WORKOUTS_KEY, JSON.stringify(INITIAL_WORKOUTS));
      return INITIAL_WORKOUTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_WORKOUTS;
  } catch {
    return INITIAL_WORKOUTS;
  }
}

export function saveWorkoutRecord(newWorkout: Omit<WorkoutRecord, 'id' | 'activeTime' | 'calories' | 'efficiencyIndex' | 'isZone2' | 'cortisolAlert' | 'preWorkoutAlert' | 'createdAt'> & { id?: string }): WorkoutRecord {
  const list = getStoredWorkouts();
  const id = newWorkout.id || `w-${Date.now()}`;

  const totals = calculateWorkoutTotals(
    newWorkout.phases,
    newWorkout.pauseDuration,
    newWorkout.weightKg,
    newWorkout.equipmentType
  );

  const profile = getStoredProfile();
  const preWorkoutAlert = newWorkout.meals.some(meal => checkPreWorkoutAlert(
    newWorkout.workoutStartTime,
    meal.time
  ));

  const fullRecord: WorkoutRecord = {
    ...newWorkout,
    id,
    userName: profile.fullName,
    activeTime: totals.activeTime,
    totalDistanceKm: newWorkout.totalDistanceKm ?? totals.totalDistanceKm,
    calories: totals.calories,
    efficiencyIndex: totals.efficiencyIndex,
    isZone2: totals.isZone2,
    cortisolAlert: totals.cortisolAlert,
    preWorkoutAlert,
    createdAt: new Date().toISOString(),
  };

  const existingIdx = list.findIndex((w) => w.id === id);
  if (existingIdx >= 0) {
    list[existingIdx] = fullRecord;
  } else {
    list.unshift(fullRecord);
  }

  try {
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save workout', e);
  }

  // Also auto-record daily metric
  const dateOnly = newWorkout.workoutStartTime.split('T')[0] || new Date().toISOString().split('T')[0];
  saveBodyMetric(newWorkout.weightKg, newWorkout.waistCm, dateOnly);

  return fullRecord;
}

export function deleteWorkoutRecord(id: string): WorkoutRecord[] {
  const list = getStoredWorkouts().filter((w) => w.id !== id);
  try {
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to delete workout', e);
  }
  return list;
}

// ==================== MEAL JOURNAL STORAGE ====================

interface StandaloneJournalRecord {
  id: string;
  date: string; // YYYY-MM-DD
  meals: Meal[];
  notes?: string;
  updatedAt: string;
}

export function getStoredMealJournals(): DailyMealJournal[] {
  // 1. Get standalone journal entries
  let standaloneList: StandaloneJournalRecord[] = [];
  try {
    const raw = localStorage.getItem(MEALS_JOURNAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) standaloneList = parsed;
    }
  } catch (e) {
    console.error('Failed to parse meal journal', e);
  }

  // 2. Extract meals & calories burned from stored workouts
  const workouts = getStoredWorkouts();
  const dateMap = new Map<string, { meals: Meal[]; workoutCalories: number; notes: string }>();

  workouts.forEach((w) => {
    const date = (w.workoutStartTime || '').split('T')[0];
    if (!date) return;

    if (!dateMap.has(date)) {
      dateMap.set(date, { meals: [], workoutCalories: 0, notes: '' });
    }
    const cur = dateMap.get(date)!;
    cur.workoutCalories += w.calories || 0;
    if (Array.isArray(w.meals) && w.meals.length > 0) {
      w.meals.forEach((m) => {
        // Prevent duplicate meal ID
        if (!cur.meals.some((existing) => existing.id === m.id)) {
          cur.meals.push(m);
        }
      });
    }
  });

  // 3. Merge standalone entries
  standaloneList.forEach((entry) => {
    const date = entry.date;
    if (!dateMap.has(date)) {
      dateMap.set(date, { meals: [], workoutCalories: 0, notes: entry.notes || '' });
    }
    const cur = dateMap.get(date)!;
    if (entry.notes) cur.notes = entry.notes;
    entry.meals.forEach((m) => {
      const existingIdx = cur.meals.findIndex((ex) => ex.id === m.id);
      if (existingIdx >= 0) {
        cur.meals[existingIdx] = m;
      } else {
        cur.meals.push(m);
      }
    });
  });

  // 4. Transform into DailyMealJournal array sorted by date descending
  const result: DailyMealJournal[] = [];
  dateMap.forEach((val, date) => {
    // Only include if there are meals or workouts
    if (val.meals.length > 0 || val.workoutCalories > 0) {
      const totalCalories = val.meals.reduce((sum, m) => sum + (Number(m.totalCalories) || 0), 0);
      result.push({
        id: `journal-${date}`,
        date,
        meals: val.meals.sort((a, b) => (a.time || '').localeCompare(b.time || '')),
        totalCalories,
        workoutCaloriesBurned: val.workoutCalories,
        notes: val.notes,
        updatedAt: new Date().toISOString(),
      });
    }
  });

  result.sort((a, b) => b.date.localeCompare(a.date));
  return result;
}

export function saveMealToDateJournal(date: string, meal: Meal, notes?: string): DailyMealJournal[] {
  let standaloneList: StandaloneJournalRecord[] = [];
  try {
    const raw = localStorage.getItem(MEALS_JOURNAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) standaloneList = parsed;
    }
  } catch (e) {
    console.error('Failed to parse meal journal', e);
  }

  const existingIdx = standaloneList.findIndex((item) => item.date === date);
  if (existingIdx >= 0) {
    const entry = standaloneList[existingIdx];
    const mealIdx = entry.meals.findIndex((m) => m.id === meal.id);
    if (mealIdx >= 0) {
      entry.meals[mealIdx] = meal;
    } else {
      entry.meals.push(meal);
    }
    if (notes !== undefined) entry.notes = notes;
    entry.updatedAt = new Date().toISOString();
  } else {
    standaloneList.push({
      id: `sj-${Date.now()}`,
      date,
      meals: [meal],
      notes,
      updatedAt: new Date().toISOString(),
    });
  }

  try {
    localStorage.setItem(MEALS_JOURNAL_KEY, JSON.stringify(standaloneList));
  } catch (e) {
    console.error('Failed to save meal journal', e);
  }

  return getStoredMealJournals();
}

export function deleteMealFromDateJournal(date: string, mealId: string): DailyMealJournal[] {
  let standaloneList: StandaloneJournalRecord[] = [];
  try {
    const raw = localStorage.getItem(MEALS_JOURNAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) standaloneList = parsed;
    }
  } catch (e) {
    console.error('Failed to parse meal journal', e);
  }

  const existingIdx = standaloneList.findIndex((item) => item.date === date);
  if (existingIdx >= 0) {
    standaloneList[existingIdx].meals = standaloneList[existingIdx].meals.filter((m) => m.id !== mealId);
    try {
      localStorage.setItem(MEALS_JOURNAL_KEY, JSON.stringify(standaloneList));
    } catch (e) {
      console.error('Failed to update meal journal', e);
    }
  }

  // Also update in workout if it originated from a workout on that date
  const workouts = getStoredWorkouts();
  let workoutModified = false;
  workouts.forEach((w) => {
    const wDate = (w.workoutStartTime || '').split('T')[0];
    if (wDate === date && Array.isArray(w.meals) && w.meals.some((m) => m.id === mealId)) {
      w.meals = w.meals.filter((m) => m.id !== mealId);
      workoutModified = true;
    }
  });

  if (workoutModified) {
    try {
      localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
    } catch (e) {
      console.error('Failed to update workout meals', e);
    }
  }

  return getStoredMealJournals();
}

export function deleteDailyJournal(date: string): DailyMealJournal[] {
  let standaloneList: StandaloneJournalRecord[] = [];
  try {
    const raw = localStorage.getItem(MEALS_JOURNAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) standaloneList = parsed;
    }
  } catch (e) {
    console.error('Failed to parse meal journal', e);
  }

  const updated = standaloneList.filter((item) => item.date !== date);
  try {
    localStorage.setItem(MEALS_JOURNAL_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save meal journal', e);
  }

  // Clear meals in workouts of that date too
  const workouts = getStoredWorkouts();
  let workoutModified = false;
  workouts.forEach((w) => {
    const wDate = (w.workoutStartTime || '').split('T')[0];
    if (wDate === date && Array.isArray(w.meals) && w.meals.length > 0) {
      w.meals = [];
      workoutModified = true;
    }
  });

  if (workoutModified) {
    try {
      localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
    } catch (e) {
      console.error('Failed to clear workout meals', e);
    }
  }

  return getStoredMealJournals();
}
