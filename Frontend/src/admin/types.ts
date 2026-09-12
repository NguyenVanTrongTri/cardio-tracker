import { EquipmentType, UserAccount, WorkoutRecord } from '../types';
import { FoodItem } from '../data/foodData';

export interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalWorkouts: number;
  totalCaloriesBurned: number;
  avgDurationMinutes: number;
  zone2ComplianceRate: number; // percentage (0 - 100)
  cortisolAlertCount: number;
  equipmentBreakdown: { name: string; type: EquipmentType; count: number; calories: number }[];
  recentWorkouts: WorkoutRecord[];
  totalFoodItems: number;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  details: string;
  level: 'INFO' | 'WARNING' | 'SUCCESS';
}
