import { EquipmentType, WorkoutPhase, WorkoutRecord } from '../types';

/**
 * Calculates individual segment distances for each phase.
 * If user inputs odometer reading on treadmill (cumulative reading at that point),
 * segment distance = phase.distanceKm - previousPhase.distanceKm.
 * If phase.distanceKm is not set, calculates from (speed * duration) / 60.
 */
export function calculateSegmentDistances(phases: WorkoutPhase[]): number[] {
  const segmentDistances: number[] = [];
  let prevInputDist = 0;

  for (let i = 0; i < phases.length; i++) {
    const p = phases[i];
    const rawInput = p.distanceKm !== undefined ? Number(p.distanceKm) : undefined;

    if (rawInput !== undefined && rawInput > 0) {
      if (rawInput >= prevInputDist) {
        // User entered cumulative machine reading: segment = current - prev
        const seg = Math.round((rawInput - prevInputDist) * 100) / 100;
        segmentDistances.push(seg);
        prevInputDist = rawInput;
      } else {
        // Fallback: if user entered an individual segment distance or smaller number
        segmentDistances.push(Math.round(rawInput * 100) / 100);
        prevInputDist = prevInputDist + rawInput;
      }
    } else {
      // Default: calculate from speed * duration / 60 if not entered
      const spd = Number(p.speedKmh) || 0;
      const dur = Number(p.durationMinutes) || 0;
      const seg = Math.round(((spd * dur) / 60) * 100) / 100;
      segmentDistances.push(seg);
      prevInputDist += seg;
    }
  }

  return segmentDistances;
}

/**
 * Helper to calculate cumulative distance and individual segment distance for UI display
 */
export function getPhasesWithCumulativeDistance(phases: WorkoutPhase[]) {
  const segmentDistances = calculateSegmentDistances(phases);
  let runningTotal = 0;

  return phases.map((p, idx) => {
    const seg = segmentDistances[idx] ?? 0;
    runningTotal += seg;

    return {
      ...p,
      segmentDistanceKm: Math.round(seg * 100) / 100,
      cumulativeDistanceKm: Math.round(runningTotal * 100) / 100,
    };
  });
}

/**
 * Calculates scientific calories per phase based on equipment type:
 * - TREADMILL: ACSM walking/running equation with incline grade & speed
 * - STATIONARY_BIKE: Ergometer METs based on resistance & cadence RPM
 * - ROWING_MACHINE: Ergometer expenditure based on stroke rate & damper
 * - STAIR_CLIMBER: Stepper METs based on steps per minute
 * - OUTDOOR_RUN: Outdoor walking/running formula
 */
export function calculatePhaseCalories(
  phase: WorkoutPhase,
  weightKg: number,
  equipmentType: EquipmentType = 'TREADMILL',
  phaseSegmentDistKm?: number
): number {
  if (phase.durationMinutes <= 0 || weightKg <= 0) return 0;

  let vo2 = 3.5;

  if (equipmentType === 'TREADMILL' || equipmentType === 'OUTDOOR_RUN') {
    // Determine effective distance for this phase:
    // If phaseSegmentDistKm is provided, use it; otherwise use phase.distanceKm or speed*time
    const effectiveDist =
      phaseSegmentDistKm !== undefined && phaseSegmentDistKm > 0
        ? phaseSegmentDistKm
        : phase.distanceKm !== undefined && phase.distanceKm > 0
        ? phase.distanceKm
        : undefined;

    const effectiveSpeedKmh =
      effectiveDist !== undefined && phase.durationMinutes > 0
        ? (effectiveDist * 60) / phase.durationMinutes
        : phase.speedKmh;

    const speedMetersPerMin = (effectiveSpeedKmh * 1000) / 60;
    const gradeFraction = Math.max(0, phase.inclineDegree) / 100;
    // ACSM walking formula
    vo2 = 0.1 * speedMetersPerMin + 1.8 * speedMetersPerMin * gradeFraction + 3.5;
  } else if (equipmentType === 'STATIONARY_BIKE') {
    // Stationary bike METs (resistance level + cadence)
    const res = Number(phase.resistanceLevel) || 6;
    const rpm = Number(phase.cadenceRpm) || 70;
    const watts = res * 12 + (rpm - 50) * 1.5;
    // Cycling VO2 = (1.8 * WorkRate / Weight) + 7
    const workRateKgm = Math.max(200, watts * 6.12);
    vo2 = (1.8 * workRateKgm) / weightKg + 7;
  } else if (equipmentType === 'ROWING_MACHINE') {
    // Rowing engages 85% muscles
    const spm = Number(phase.strokeRateSpm) || 24;
    const res = Number(phase.resistanceLevel) || 5;
    const met = 4.5 + (spm / 24) * 2.5 + res * 0.3;
    vo2 = met * 3.5;
  } else if (equipmentType === 'STAIR_CLIMBER') {
    // Stepper: ~6-9 METs based on steps per min
    const steps = Number(phase.stepsPerMin) || 60;
    const met = 4.0 + (steps / 60) * 3.5;
    vo2 = met * 3.5;
  }

  const calPerMinute = (vo2 * weightKg) / 200;
  return Math.max(0, calPerMinute * phase.durationMinutes);
}

export function calculateWorkoutTotals(
  phases: WorkoutPhase[],
  pauseDuration: number,
  weightKg: number,
  equipmentType: EquipmentType = 'TREADMILL'
) {
  const grossTime = phases.reduce((sum, p) => sum + (Number(p.durationMinutes) || 0), 0);
  const activeTime = Math.max(0, grossTime - (Number(pauseDuration) || 0));

  const segmentDistances = calculateSegmentDistances(phases);
  const totalDistanceKm = Math.round(
    segmentDistances.reduce((sum, d) => sum + d, 0) * 100
  ) / 100;

  const calories = phases.reduce(
    (sum, p, idx) => sum + calculatePhaseCalories(p, weightKg, equipmentType, segmentDistances[idx]),
    0
  );

  const roundedCalories = Math.round(calories * 10) / 10;
  const efficiencyIndex =
    activeTime > 0 ? Math.round((roundedCalories / activeTime) * 100) / 100 : 0;

  const p2Phases = phases.filter((p) => p.phaseNumber === 2);
  const totalP2Time = p2Phases.reduce((sum, p) => sum + (Number(p.durationMinutes) || 0), 0);
  const maxIncline = Math.max(0, ...p2Phases.map((p) => Number(p.inclineDegree) || 0));
  const maxResistance = Math.max(0, ...p2Phases.map((p) => Number(p.resistanceLevel) || 0));
  let isZone2 = false;

  if (p2Phases.length > 0 && activeTime >= 30 && activeTime <= 55 && totalP2Time >= 15) {
    if (equipmentType === 'TREADMILL') {
      isZone2 = maxIncline >= 6;
    } else if (equipmentType === 'STATIONARY_BIKE') {
      isZone2 = maxResistance >= 5;
    } else {
      isZone2 = true;
    }
  }

  const cortisolAlert = activeTime > 50;

  return {
    grossTime,
    activeTime,
    totalDistanceKm,
    calories: roundedCalories,
    efficiencyIndex,
    isZone2,
    cortisolAlert,
  };
}

/**
 * Checks if pre-meal was within 20 minutes of workout start
 */
export function checkPreWorkoutAlert(
  workoutStartTime: string,
  preMealTime: string
): boolean {
  if (!workoutStartTime || !preMealTime) return false;

  try {
    // workoutStartTime can be "2026-09-07T17:30" or "17:30"
    let workoutHour = 0;
    let workoutMin = 0;

    if (workoutStartTime.includes('T')) {
      const timePart = workoutStartTime.split('T')[1];
      const [h, m] = timePart.split(':').map(Number);
      workoutHour = h;
      workoutMin = m;
    } else if (workoutStartTime.includes(':')) {
      const [h, m] = workoutStartTime.split(':').map(Number);
      workoutHour = h;
      workoutMin = m;
    }

    const [mealHour, mealMin] = preMealTime.split(':').map(Number);

    const workoutTotalMin = workoutHour * 60 + workoutMin;
    const mealTotalMin = mealHour * 60 + mealMin;

    const diff = workoutTotalMin - mealTotalMin;
    // Alert if meal was eaten less than 20 minutes before workout, or eaten right at start
    return diff >= 0 && diff < 20;
  } catch {
    return false;
  }
}

/**
 * Smart recommendation engine based on recent workouts
 */
export function getSmartWorkoutRecommendation(recentWorkouts: WorkoutRecord[]): {
  advice: string;
  type: 'increase' | 'recovery' | 'optimal';
  suggestedIncline: number;
  suggestedSpeed: number;
} {
  if (!recentWorkouts || recentWorkouts.length === 0) {
    return {
      advice: 'Hôm nay hãy giữ dốc 8°, 5.0 km/h để bắt nhịp đốt mỡ Zone 2 lý tưởng nhé!',
      type: 'optimal',
      suggestedIncline: 8,
      suggestedSpeed: 5.0,
    };
  }

  const lastWorkout = recentWorkouts[0];
  const last3 = recentWorkouts.slice(0, 3);

  // Check fatigue >= 4 or ActiveTime > 50 -> Recovery
  if (lastWorkout.fatigueLevel >= 4 || lastWorkout.activeTime > 50) {
    return {
      advice: 'Buổi trước cường độ cao hoặc mệt mỏi! Hôm nay nên giữ dốc nhẹ 6°, 4.5 km/h trong 35-40 phút để hồi phục cơ bắp.',
      type: 'recovery',
      suggestedIncline: 6,
      suggestedSpeed: 4.5,
    };
  }

  // Check if fatigue <= 2 for 3 consecutive workouts -> Increase load
  if (
    last3.length >= 3 &&
    last3.every((w) => w.fatigueLevel <= 2)
  ) {
    return {
      advice: '3 buổi gần nhất bạn thích nghi rất tốt (mệt mỏi nhẹ). Hãy thử nâng dốc lên 9.0° hoặc tốc độ 5.2 km/h để bứt phá mỡ thừa!',
      type: 'increase',
      suggestedIncline: 9,
      suggestedSpeed: 5.2,
    };
  }

  return {
    advice: 'Hôm nay hãy giữ dốc 8°, tốc độ 5.0 km/h và nhớ siết chặt cơ core ở Giai đoạn 2 nhé!',
    type: 'optimal',
    suggestedIncline: 8,
    suggestedSpeed: 5.0,
  };
}
