import { getStoredUsers } from '../services/auth';
import { getStoredWorkouts, getStoredMetrics } from '../services/storage';
import { getStoredFoodDatabase, saveStoredFoodDatabase } from '../data/foodData';
import { AdminStats, SystemAuditLog } from './types';
import { EquipmentType, WorkoutRecord } from '../types';

const AUDIT_LOGS_KEY = 'cardio_admin_audit_logs_v1';

export function getSystemAuditLogs(): SystemAuditLog[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_KEY);
    if (!raw) {
      const initialLogs: SystemAuditLog[] = [
        {
          id: 'log-1',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          adminEmail: 'admin@cardiotracker.com',
          action: 'Khởi tạo hệ thống',
          details: 'Hệ thống quản trị Cardio Tracker được kích hoạt thành công.',
          level: 'SUCCESS',
        },
        {
          id: 'log-2',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          adminEmail: 'admin@cardiotracker.com',
          action: 'Đồng bộ cơ sở dữ liệu',
          details: 'Cập nhật bảng thức ăn dinh dưỡng chuẩn Calo.',
          level: 'INFO',
        }
      ];
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function logAdminAction(adminEmail: string, action: string, details: string, level: 'INFO' | 'WARNING' | 'SUCCESS' = 'INFO') {
  try {
    const logs = getSystemAuditLogs();
    const newLog: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminEmail,
      action,
      details,
      level,
    };
    const updated = [newLog, ...logs].slice(0, 100); // keep last 100
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to log admin action', e);
  }
}

export function calculateAdminStats(): AdminStats {
  const users = getStoredUsers();
  const workouts = getStoredWorkouts();
  const foods = getStoredFoodDatabase();

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;
  const totalWorkouts = workouts.length;

  let totalCalories = 0;
  let totalMinutes = 0;
  let zone2Count = 0;
  let cortisolCount = 0;

  const equipmentMap: Record<EquipmentType, { count: number; calories: number; label: string }> = {
    TREADMILL: { count: 0, calories: 0, label: 'Máy Chạy Bộ' },
    STATIONARY_BIKE: { count: 0, calories: 0, label: 'Xe Đạp Tập' },
    ROWING_MACHINE: { count: 0, calories: 0, label: 'Máy Chèo Thuyền' },
    STAIR_CLIMBER: { count: 0, calories: 0, label: 'Máy Leo Thang' },
    OUTDOOR_RUN: { count: 0, calories: 0, label: 'Chạy Ngoài Trời' },
  };

  workouts.forEach((w) => {
    totalCalories += w.calories || 0;
    totalMinutes += w.activeTime || 0;
    if (w.isZone2) zone2Count++;
    if (w.cortisolAlert) cortisolCount++;

    const type = w.equipmentType || 'TREADMILL';
    if (equipmentMap[type]) {
      equipmentMap[type].count += 1;
      equipmentMap[type].calories += Math.round(w.calories || 0);
    }
  });

  const avgDurationMinutes = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;
  const zone2ComplianceRate = totalWorkouts > 0 ? Math.round((zone2Count / totalWorkouts) * 100) : 0;

  const equipmentBreakdown = (Object.keys(equipmentMap) as EquipmentType[]).map((type) => ({
    name: equipmentMap[type].label,
    type,
    count: equipmentMap[type].count,
    calories: equipmentMap[type].calories,
  }));

  return {
    totalUsers,
    totalAdmins,
    totalWorkouts,
    totalCaloriesBurned: Math.round(totalCalories),
    avgDurationMinutes,
    zone2ComplianceRate,
    cortisolAlertCount: cortisolCount,
    equipmentBreakdown,
    recentWorkouts: workouts.slice(0, 10),
    totalFoodItems: foods.length,
  };
}

export function exportSystemDataAsJSON(): string {
  const users = getStoredUsers();
  const workouts = getStoredWorkouts();
  const metrics = getStoredMetrics();
  const foods = getStoredFoodDatabase();
  const logs = getSystemAuditLogs();

  const backup = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    users,
    workouts,
    metrics,
    foods,
    logs,
  };

  return JSON.stringify(backup, null, 2);
}

export function importSystemDataFromJSON(jsonString: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Tệp dữ liệu không hợp lệ.' };
    }

    if (Array.isArray(data.users)) {
      localStorage.setItem('cardio_users_v2', JSON.stringify(data.users));
    }
    if (Array.isArray(data.workouts)) {
      localStorage.setItem('cardio_tracker_workouts_v2', JSON.stringify(data.workouts));
    }
    if (Array.isArray(data.metrics)) {
      localStorage.setItem('cardio_tracker_metrics_v2', JSON.stringify(data.metrics));
    }
    if (Array.isArray(data.foods)) {
      saveStoredFoodDatabase(data.foods);
    }
    if (Array.isArray(data.logs)) {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(data.logs));
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Lỗi khi phân tích tệp JSON.' };
  }
}
