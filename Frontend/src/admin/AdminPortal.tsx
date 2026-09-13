import { useState, useEffect } from 'react';
import {
  Flame,
  LayoutDashboard,
  Users,
  Activity,
  Apple,
  Settings,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Bell,
  RefreshCw,
  Bike
} from 'lucide-react';
import { UserAccount } from '../types';
import { calculateAdminStats } from './adminService';
import { AdminStats } from './types';
import AdminOverviewTab from './AdminOverviewTab';
import AdminUsersTab from './AdminUsersTab';
import AdminWorkoutsTab from './AdminWorkoutsTab';
import AdminPracticeTab from './AdminPracticeTab';
import AdminFoodTab from './AdminFoodTab';
import AdminNotifyTab from './AdminNotifyTab';
import AdminSettingsTab from './AdminSettingsTab';
import { EQUIPMENT_LIST } from '../components/workout/equipmentData';

interface AdminPortalProps {
  currentUser: UserAccount;
  onExitToApp: () => void;
  onLogout: () => void;
  onAddNotification: (title: string, message: string) => void;
}

interface AdminNavTab {
  id: 'overview' | 'users' | 'workouts' | 'practice' | 'food' | 'notify' | 'settings';
  label: string;
  icon: any;
  badge?: number;
}

export default function AdminPortal({ currentUser, onExitToApp, onLogout, onAddNotification }: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'workouts' | 'practice' | 'food' | 'notify' | 'settings'>('overview');
  const [stats, setStats] = useState<AdminStats>(calculateAdminStats());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStats = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setStats(calculateAdminStats());
      setIsRefreshing(false);
    }, 300);
  };

  useEffect(() => {
    setStats(calculateAdminStats());
  }, [activeTab]);

  const navTabs: AdminNavTab[] = [
    { id: 'overview', label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'users', label: 'Người Dùng', icon: Users, badge: stats.totalUsers },
    { id: 'workouts', label: 'Buổi Tập', icon: Activity, badge: stats.totalWorkouts },
    { id: 'practice', label: 'Bài Tập/Máy', icon: Bike, badge: EQUIPMENT_LIST.length },
    { id: 'food', label: 'Thực Phẩm', icon: Apple, badge: stats.totalFoodItems },
    { id: 'notify', label: 'Thông Báo', icon: Bell },
    { id: 'settings', label: 'Hệ Thống', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 selection:bg-emerald-500 selection:text-white flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Flame size={20} className="fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white leading-tight">
                  Cardio Admin Portal
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck size={11} />
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Quản trị hệ thống & giám sát giảm mỡ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={refreshStats}
              className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
                isRefreshing ? 'animate-spin text-emerald-400' : ''
              }`}
              title="Làm mới dữ liệu thống kê"
            >
              <RefreshCw size={16} />
            </button>

            <button
              onClick={onExitToApp}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Về Ứng Dụng Cardio</span>
              <span className="sm:hidden">Ứng Dụng</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-bold border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Đăng Xuất</span>
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 scrollbar-none py-1">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-slate-950 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <AdminOverviewTab
            stats={stats}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'users' && (
          <AdminUsersTab
            currentUser={currentUser}
            onRefreshStats={refreshStats}
          />
        )}

        {activeTab === 'workouts' && (
          <AdminWorkoutsTab
            adminEmail={currentUser.email}
            onRefreshStats={refreshStats}
          />
        )}

        {activeTab === 'practice' && (
          <AdminPracticeTab
            adminEmail={currentUser.email}
            onRefreshStats={refreshStats}
          />
        )}

        {activeTab === 'food' && (
          <AdminFoodTab
            adminEmail={currentUser.email}
            onRefreshStats={refreshStats}
          />
        )}

        {activeTab === 'notify' && (
          <AdminNotifyTab
            adminEmail={currentUser.email}
            onRefreshStats={refreshStats}
            onAddNotification={onAddNotification}
          />
        )}

        {activeTab === 'settings' && (
          <AdminSettingsTab
            currentUser={currentUser}
            onRefreshStats={refreshStats}
          />
        )}
      </main>

      {/* Admin Footer */}
      <footer className="max-w-6xl w-full mx-auto px-4 py-4 text-center text-xs text-slate-400 border-t border-slate-200/80">
        Cardio Tracker Administration • Tài khoản: <strong className="text-slate-600">{currentUser.email}</strong> • Phiên bản 2.4
      </footer>
    </div>
  );
}
