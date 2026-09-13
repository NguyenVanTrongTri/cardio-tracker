export type Gender = 'MALE' | 'FEMALE';

export interface UserAccount {
  id: string;
  email: string;
  password?: string; // Stored securely
  fullName: string;
  role?: 'ADMIN' | 'USER'; // Admin or Regular User
  heightCm: number;
  gender: Gender;
  birthYear: number;
  targetWaistCm: number;
  targetWeightKg: number;
  weightKg?: number; // Added
  targetDate: string;
  createdAt: string;
  waistCm?: number;
  hipCm?: number;
  chestCm?: number;
  bicepsCm?: number;
  thighCm?: number;
  neckCm?: number;
  bodyFatPercentage?: number;
  activityLevel?: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
  workoutEnvironment?: 'HOME' | 'GYM';
  medicalConditions?: string[];
  medicalNotes?: string;
  weeklyGoalKg?: number;
}

export interface AuthSession {
  user: UserAccount;
  token: string;
  expiresAt: number;
}

export interface PasswordResetCode {
  email: string;
  code: string;
  expiresAt: number;
}

export interface UserProfile {
  fullName: string;
  heightCm: number;
  gender: Gender;
  birthYear: number;
  targetWaistCm: number;
  targetWeightKg: number;
  weightKg: number; // Added
  targetDate: string;
  waistCm?: number;
  hipCm?: number;
  chestCm?: number;
  bicepsCm?: number;
  thighCm?: number;
  neckCm?: number;
  bodyFatPercentage?: number;
  activityLevel?: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
  workoutEnvironment?: 'HOME' | 'GYM';
  medicalConditions?: string[];
  medicalNotes?: string;
  weeklyGoalKg?: number;
}

export interface DailyBodyMetric {
  id: string;
  metricDate: string; // YYYY-MM-DD
  weightKg: number;
  waistCm: number;
  recordedAt: string;
}

export type EquipmentType =
  | 'TREADMILL'
  | 'STATIONARY_BIKE'
  | 'ROWING_MACHINE'
  | 'STAIR_CLIMBER'
  | 'OUTDOOR_RUN';

export interface WorkoutPhase {
  phaseNumber: 1 | 2 | 3;
  name: 'Warm-up' | 'Fat Burn' | 'Cool-down';
  durationMinutes: number;
  speedKmh: number;
  inclineDegree: number;
  distanceKm?: number;      // Quãng đường (km)
  isCoreEngaged?: boolean;
  // Specific attributes for other modalities:
  resistanceLevel?: number; // Xe đạp (1-20), Máy chèo (1-10), Leo thang (1-20)
  cadenceRpm?: number;      // Vòng quay / phút (xe đạp)
  strokeRateSpm?: number;   // Nhịp chèo / phút (máy chèo)
  stepsPerMin?: number;     // Số bậc leo / phút (máy leo thang)
}

export interface FoodItemEntry {
  id: string;
  foodName: string;
  grams: number;
  calories: number;
}

export interface Meal {
  id: string;
  category: string;
  time: string;
  foodItems: FoodItemEntry[];
  totalCalories: number;
}

export interface DailyMealJournal {
  id: string;
  date: string; // YYYY-MM-DD
  meals: Meal[];
  totalCalories: number;
  workoutCaloriesBurned?: number;
  notes?: string;
  updatedAt?: string;
}

export interface WorkoutRecord {
  id: string;
  userName?: string;
  equipmentType: EquipmentType;
  workoutStartTime: string; // ISO or YYYY-MM-DDTHH:mm
  meals: Meal[];
  weightKg: number;
  waistCm: number;
  phases: WorkoutPhase[];
  totalDistanceKm?: number; // Tổng quãng đường (km)
  pauseDuration: number;
  fatigueLevel: 1 | 2 | 3 | 4 | 5;
  waterConsumedMl: number;
  notes: string;
  
  // Calculated metrics:
  activeTime: number; // in minutes
  calories: number; // ACSM kcal
  efficiencyIndex: number; // kcal / min
  isZone2: boolean;
  cortisolAlert: boolean;
  preWorkoutAlert: boolean;
  createdAt: string;
}

export interface WorkoutComparisonMetrics {
  workoutA: WorkoutRecord;
  workoutB: WorkoutRecord;
  deltaCalories: number;
  deltaActiveTime: number;
  deltaEfficiency: number;
  deltaIncline: number;
}
