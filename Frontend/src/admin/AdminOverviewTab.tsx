import { useMemo } from 'react';
import {
  Users,
  Flame,
  Activity,
  Award,
  ShieldAlert,
  Clock,
  TrendingUp,
  Apple,
  CheckCircle2,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { AdminStats } from './types';
import { getEquipmentDef } from '../components/workout/equipmentData';

interface AdminOverviewTabProps {
  stats: AdminStats;
  onNavigateTab: (tab: 'users' | 'workouts' | 'practice' |'food' | 'settings') => void;
}

const COLORS = ['#10b981', '#3b82f6', '#06b6d4', '#f59e0b', '#8b5cf6'];

export default function AdminOverviewTab({ stats, onNavigateTab }: AdminOverviewTabProps) {
  const chartData = useMemo(() => {
    return stats.equipmentBreakdown.map((item) => ({
      name: item.name,
      buoi: item.count,
      calo: item.calories,
    }));
  }, [stats.equipmentBreakdown]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Người Dùng</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalUsers}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>{stats.totalAdmins} Quản trị viên</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Tổng Buổi Tập</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalWorkouts}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            TB {stats.avgDurationMinutes} phút / buổi
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Tổng Calo Đốt</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Flame size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalCaloriesBurned.toLocaleString()} <span className="text-sm font-semibold text-slate-400">kcal</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            Tính theo chuẩn ACSM
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Chuẩn Zone 2</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {stats.zone2ComplianceRate}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {stats.cortisolAlertCount > 0 ? (
              <span className="text-amber-600 font-medium">{stats.cortisolAlertCount} lần vượt ngưỡng Cortisol</span>
            ) : (
              <span className="text-emerald-600 font-medium">100% an toàn cơ bắp</span>
            )}
          </div>
        </div>
      </div>

      {/* Equipment Distribution Chart */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Phân Bổ Theo Bộ Môn & Thiết Bị</h3>
            <p className="text-xs text-slate-500">Thống kê số lượng buổi tập được ghi nhận trên hệ thống</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Số buổi tập</span>
            </div>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                formatter={(val: any, name: any) => [
                  name === 'buoi' ? `${val} buổi tập` : `${val} kcal`,
                  name === 'buoi' ? 'Số lượt tập' : 'Tổng tiêu hao'
                ]}
              />
              <Bar dataKey="buoi" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <button
          onClick={() => onNavigateTab('users')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-500/50 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={18} />
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Quản Lý Người Dùng</h4>
          <p className="text-xs text-slate-500 mt-0.5">Phân quyền Admin, xem danh sách thành viên và mục tiêu cân nặng.</p>
        </button>

        <button
          onClick={() => onNavigateTab('workouts')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-500/50 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity size={18} />
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Kiểm Tra Buổi Tập</h4>
          <p className="text-xs text-slate-500 mt-0.5">Xem chi tiết 3 giai đoạn, chỉ số Zone 2, bữa ăn và xuất dữ liệu.</p>
        </button>

        <button
          onClick={() => onNavigateTab('food')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-500/50 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Apple size={18} />
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Thực Phẩm & Calo</h4>
          <p className="text-xs text-slate-500 mt-0.5">{stats.totalFoodItems} món ăn trong cơ sở dữ liệu. Thêm hoặc sửa kcal.</p>
        </button>
      </div>

      {/* Recent Workouts Stream */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Buổi Tập Được Ghi Nhận Gần Đây</h3>
          </div>
          <button
            onClick={() => onNavigateTab('workouts')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
          >
            Xem tất cả
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {stats.recentWorkouts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Chưa có buổi tập nào được ghi nhận trên hệ thống.
            </div>
          ) : (
            stats.recentWorkouts.slice(0, 5).map((workout) => {
              const def = getEquipmentDef(workout.equipmentType);
              const dateStr = workout.workoutStartTime.replace('T', ' ');

              return (
                <div key={workout.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs border border-slate-200/60">
                      {def.shortName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{def.name}</span>
                        {workout.isZone2 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Zone 2
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {dateStr} • {workout.activeTime} phút
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-orange-600">
                      {Math.round(workout.calories)} kcal
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {workout.weightKg}kg • Eo {workout.waistCm}cm
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
