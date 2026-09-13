import { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  TrendingDown,
  Flame,
  Award,
  Zap,
  ArrowRight,
  Scale,
  Ruler,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  getStoredMetrics,
  getStoredProfile,
  getStoredWorkouts
} from '../../services/storage';
import { DailyBodyMetric, UserProfile, WorkoutRecord } from '../../types';
import { getEquipmentDef } from '../workout/equipmentData';

export default function ProgressTab() {
  const [metrics, setMetrics] = useState<DailyBodyMetric[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile());

  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [chartView, setChartView] = useState<'waist' | 'weight' | 'both'>('waist');

  // Comparison State
  const [workoutAId, setWorkoutAId] = useState<string>('');
  const [workoutBId, setWorkoutBId] = useState<string>('');

  useEffect(() => {
    const loadedMetrics = getStoredMetrics();
    const loadedWorkouts = getStoredWorkouts();
    setMetrics(loadedMetrics);
    setWorkouts(loadedWorkouts);
    setProfile(getStoredProfile());

    if (loadedWorkouts.length >= 2) {
      setWorkoutAId(loadedWorkouts[0].id);
      setWorkoutBId(loadedWorkouts[1].id);
    } else if (loadedWorkouts.length === 1) {
      setWorkoutAId(loadedWorkouts[0].id);
    }
  }, []);

  // Filtered workouts by range
  const filteredWorkouts = useMemo(() => {
    const days = timeRange === 'week' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return workouts.filter((w) => new Date(w.workoutStartTime) >= cutoff);
  }, [workouts, timeRange]);

  // Quick stats calculation
  const stats = useMemo(() => {
    const list = filteredWorkouts.length > 0 ? filteredWorkouts : workouts;
    const totalCalories = Math.round(list.reduce((sum, w) => sum + w.calories, 0));
    
    // Zone 2 count
    const zone2Count = list.filter((w) => w.isZone2).length;
    const zone2Ratio = list.length > 0 ? Math.round((zone2Count / list.length) * 100) : 0;

    // Core engagement count in Phase 2
    const coreCount = list.filter((w) => {
      const p2 = w.phases.find((p) => p.phaseNumber === 2);
      return Boolean(p2?.isCoreEngaged);
    }).length;
    const coreRatio = list.length > 0 ? Math.round((coreCount / list.length) * 100) : 0;

    // Waist difference to target
    const currentWaist = metrics.length > 0 ? metrics[metrics.length - 1].waistCm : 82.0;
    const waistDelta = Math.round((currentWaist - profile.targetWaistCm) * 10) / 10;

    // Rate of waist loss (cm/week estimate)
    let waistReductionRate = 0.5;
    if (metrics.length >= 2) {
      const first = metrics[0];
      const last = metrics[metrics.length - 1];
      const diffCm = first.waistCm - last.waistCm;
      const days = Math.max(
        1,
        (new Date(last.metricDate).getTime() - new Date(first.metricDate).getTime()) /
          (1000 * 3600 * 24)
      );
      waistReductionRate = Math.round(((diffCm / days) * 7) * 10) / 10;
    }

    return {
      totalCalories,
      zone2Ratio,
      coreRatio,
      currentWaist,
      waistDelta,
      waistReductionRate: Math.max(0, waistReductionRate),
    };
  }, [filteredWorkouts, workouts, metrics, profile]);

  // Chart data formatted
  const chartData = useMemo(() => {
    return metrics.map((m) => {
      // format date MM/DD
      const dateParts = m.metricDate.split('-');
      const shortDate = `${dateParts[2]}/${dateParts[1]}`;
      return {
        date: shortDate,
        fullDate: m.metricDate,
        waist: m.waistCm,
        weight: m.weightKg,
        targetWaist: profile.targetWaistCm,
      };
    });
  }, [metrics, profile.targetWaistCm]);

  // Comparison workouts
  const workoutA = useMemo(() => workouts.find((w) => w.id === workoutAId), [workouts, workoutAId]);
  const workoutB = useMemo(() => workouts.find((w) => w.id === workoutBId), [workouts, workoutBId]);

  return (
    <div className="max-w-xl mx-auto px-4 pt-4 pb-28 space-y-6">
      {/* Header & Range Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Tiến Trình & Báo Cáo
          </h1>
          <p className="text-xs text-slate-500">
            Theo dõi xu hướng siết mỡ & phân tích hiệu suất
          </p>
        </div>

        <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded-lg transition-all ${
              timeRange === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Tuần Này
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded-lg transition-all ${
              timeRange === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Tháng Này
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Calories */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-md border border-slate-700/60">
          <div className="flex items-center gap-2 text-orange-400 mb-1">
            <Flame size={17} className="fill-orange-400" />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
              Tổng Kcal Đốt
            </span>
          </div>
          <div className="text-2xl font-black font-mono">
            {stats.totalCalories.toLocaleString()}
            <span className="text-xs text-slate-400 font-normal ml-1">kcal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {timeRange === 'week' ? 'Trong 7 ngày qua' : 'Trong 30 ngày qua'}
          </p>
        </div>

        {/* Waist Gap to Target */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
            <Ruler size={16} />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
              Mục Tiêu Eo
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats.waistDelta > 0 ? `-${stats.waistDelta}` : 'Đạt'}
            <span className="text-xs text-slate-500 font-normal ml-1">cm</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Mục tiêu: {profile.targetWaistCm} cm (Hiện tại: {stats.currentWaist} cm)
          </p>
        </div>

        {/* Speed of Waist Loss */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
            <TrendingDown size={16} />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
              Tốc Độ Giảm
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            -{stats.waistReductionRate}
            <span className="text-xs text-slate-500 font-normal ml-1">cm/tuần</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Đúng tiến độ chuẩn bền vững
          </p>
        </div>

        {/* Zone 2 Quality Badge */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-amber-500 mb-1">
            <Award size={16} />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
              Chuẩn Zone 2
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats.zone2Ratio}%
            <span className="text-xs text-slate-500 font-normal ml-1">buổi</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Kỷ luật gồng core: <strong className="text-emerald-600">{stats.coreRatio}%</strong>
          </p>
        </div>
      </div>

      {/* Progress Line Chart (Recharts) */}
      <div className="bg-white p-4.5 rounded-3xl shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Biểu Đồ Tiến Trình Vòng Eo & Cân Nặng
            </h3>
            <p className="text-xs text-slate-500">
              Đường nét đứt đỏ: Ngưỡng mục tiêu ({profile.targetWaistCm} cm)
            </p>
          </div>

          {/* Toggle view */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setChartView('waist')}
              className={`px-2.5 py-1 rounded-lg ${
                chartView === 'waist' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Vòng Eo
            </button>
            <button
              onClick={() => setChartView('weight')}
              className={`px-2.5 py-1 rounded-lg ${
                chartView === 'weight' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Cân Nặng
            </button>
            <button
              onClick={() => setChartView('both')}
              className={`px-2.5 py-1 rounded-lg ${
                chartView === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Cả Hai
            </button>
          </div>
        </div>

        {/* Chart Render */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                }}
                labelStyle={{ color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                iconType="circle"
              />

              {/* Target waist reference line */}
              {(chartView === 'waist' || chartView === 'both') && (
                <ReferenceLine
                  y={profile.targetWaistCm}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: `Mục tiêu (${profile.targetWaistCm}cm)`,
                    position: 'insideTopRight',
                    fill: '#ef4444',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              )}

              {(chartView === 'waist' || chartView === 'both') && (
                <Line
                  type="monotone"
                  dataKey="waist"
                  name="Vòng eo (cm)"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#4f46e5' }}
                />
              )}

              {(chartView === 'weight' || chartView === 'both') && (
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Cân nặng (kg)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#059669' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workout Comparison Module */}
      <div className="bg-white p-4.5 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            So Sánh Song Song 2 Buổi Tập
          </h3>
        </div>

        {workouts.length < 2 ? (
          <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl text-center">
            Cần ít nhất 2 buổi tập được ghi nhận để sử dụng tính năng so sánh trực quan.
          </p>
        ) : (
          <>
            {/* Selection Dropdowns */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Buổi Tập A
                </label>
                <select
                  value={workoutAId}
                  onChange={(e) => setWorkoutAId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {workouts.map((w) => (
                    <option key={w.id} value={w.id}>
                      [{getEquipmentDef(w.equipmentType).shortName}] {w.workoutStartTime.replace('T', ' ')} ({w.calories} kcal)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Buổi Tập B
                </label>
                <select
                  value={workoutBId}
                  onChange={(e) => setWorkoutBId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {workouts.map((w) => (
                    <option key={w.id} value={w.id}>
                      [{getEquipmentDef(w.equipmentType).shortName}] {w.workoutStartTime.replace('T', ' ')} ({w.calories} kcal)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Details Table / Cards */}
            {workoutA && workoutB && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                {/* Header Row */}
                <div className="grid grid-cols-3 bg-slate-100/80 p-2.5 font-bold text-slate-700 text-center border-b border-slate-200">
                  <div className="text-left">Chỉ Số</div>
                  <div className="text-indigo-600 truncate">
                    Buổi A ({workoutA.workoutStartTime.split('T')[0]})
                  </div>
                  <div className="text-emerald-600 truncate">
                    Buổi B ({workoutB.workoutStartTime.split('T')[0]})
                  </div>
                </div>

                {/* Equipment Row */}
                <div className="grid grid-cols-3 p-2.5 items-center border-b border-slate-100 text-center bg-slate-50/50">
                  <span className="text-left font-semibold text-slate-600">Hình thức tập</span>
                  <span className="font-bold text-slate-800">{getEquipmentDef(workoutA.equipmentType).shortName}</span>
                  <span className="font-bold text-slate-800">{getEquipmentDef(workoutB.equipmentType).shortName}</span>
                </div>

                {/* Calo */}
                <div className="grid grid-cols-3 p-2.5 items-center border-b border-slate-100 text-center">
                  <span className="text-left font-semibold text-slate-600">Tổng Calo</span>
                  <span className="font-mono font-bold text-slate-900">{workoutA.calories} kcal</span>
                  <span className="font-mono font-bold text-slate-900">{workoutB.calories} kcal</span>
                </div>

                {/* Quãng đường tổng */}
                {(() => {
                  const getDist = (w: typeof workoutA) => {
                    if (w.totalDistanceKm !== undefined && w.totalDistanceKm > 0) return w.totalDistanceKm;
                    return (
                      Math.round(
                        w.phases.reduce((sum, p) => {
                          if (p.distanceKm !== undefined && Number(p.distanceKm) > 0) return sum + Number(p.distanceKm);
                          return sum + ((Number(p.speedKmh) || 0) * (Number(p.durationMinutes) || 0)) / 60;
                        }, 0) * 100
                      ) / 100
                    );
                  };
                  const distA = getDist(workoutA);
                  const distB = getDist(workoutB);
                  return (
                    <div className="grid grid-cols-3 p-2.5 items-center border-b border-slate-100 text-center bg-sky-50/40">
                      <span className="text-left font-semibold text-sky-800">Tổng Quãng Đường</span>
                      <span className="font-mono font-bold text-sky-700">{distA} km</span>
                      <span className="font-mono font-bold text-sky-700">{distB} km</span>
                    </div>
                  );
                })()}

                {/* Active Time */}
                <div className="grid grid-cols-3 p-2.5 items-center border-b border-slate-100 text-center bg-slate-50/50">
                  <span className="text-left font-semibold text-slate-600">Active Time</span>
                  <span className="font-mono font-bold">{workoutA.activeTime} phút</span>
                  <span className="font-mono font-bold">{workoutB.activeTime} phút</span>
                </div>

                {/* Efficiency Index */}
                <div className="grid grid-cols-3 p-2.5 items-center border-b border-slate-100 text-center">
                  <span className="text-left font-semibold text-slate-600">Mật độ Calo</span>
                  <span className="font-mono font-bold text-indigo-700">{workoutA.efficiencyIndex} cal/p</span>
                  <span className="font-mono font-bold text-emerald-700">{workoutB.efficiencyIndex} cal/p</span>
                </div>

                {/* Incline Phase 2 */}
                <div className="grid grid-cols-3 p-2.5 items-center border-b border-slate-100 text-center bg-slate-50/50">
                  <span className="text-left font-semibold text-slate-600">Độ dốc Phase 2</span>
                  <span className="font-mono font-bold">
                    {workoutA.phases.find((p) => p.phaseNumber === 2)?.inclineDegree || 0}°
                  </span>
                  <span className="font-mono font-bold">
                    {workoutB.phases.find((p) => p.phaseNumber === 2)?.inclineDegree || 0}°
                  </span>
                </div>

                {/* Core engagement */}
                <div className="grid grid-cols-3 p-2.5 items-center border-b border-slate-100 text-center">
                  <span className="text-left font-semibold text-slate-600">Siết Core P2</span>
                  <span>
                    {workoutA.phases.find((p) => p.phaseNumber === 2)?.isCoreEngaged ? (
                      <span className="text-emerald-600 font-bold">✓ Có</span>
                    ) : (
                      <span className="text-slate-400">Không</span>
                    )}
                  </span>
                  <span>
                    {workoutB.phases.find((p) => p.phaseNumber === 2)?.isCoreEngaged ? (
                      <span className="text-emerald-600 font-bold">✓ Có</span>
                    ) : (
                      <span className="text-slate-400">Không</span>
                    )}
                  </span>
                </div>

                {/* Zone 2 Status */}
                <div className="grid grid-cols-3 p-2.5 items-center text-center bg-slate-50/50">
                  <span className="text-left font-semibold text-slate-600">Chuẩn Zone 2</span>
                  <span>
                    {workoutA.isZone2 ? (
                      <span className="inline-block bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        ✓ Đạt
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Chưa đạt</span>
                    )}
                  </span>
                  <span>
                    {workoutB.isZone2 ? (
                      <span className="inline-block bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        ✓ Đạt
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Chưa đạt</span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
