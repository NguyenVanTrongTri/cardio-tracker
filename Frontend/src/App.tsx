import { useState, useEffect, useRef } from 'react';
import {
  Activity,
  TrendingUp,
  History as HistoryIcon,
  User,
  Flame,
  Zap,
  Target,
  LogIn,
  LogOut,
  KeyRound,
  ChevronDown,
  UserPlus,
  ShieldCheck,
  Bell,
  CheckCheck,
  UtensilsCrossed
} from 'lucide-react';
import HomeTab from './components/tabs/HomeTab';
import ProgressTab from './components/tabs/ProgressTab';
import HistoryTab from './components/tabs/HistoryTab';
import JournalTab from './components/tabs/JournalTab';
import ProfileTab from './components/tabs/ProfileTab';
import AuthModal from './components/auth/AuthModal';
import ChangePasswordModal from './components/auth/ChangePasswordModal';
import LandingPage from './components/landing/LandingPage';
import AdminPortal from './admin/AdminPortal';
import { getCurrentUser, logout, subscribeAuth } from './services/auth';
import { UserAccount } from './types';

// Kiểu dữ liệu cho Thông báo
interface AppNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'WORKOUT' | 'METRIC' | 'STREAK';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'progress' | 'history' | 'journal' | 'profile'>('home');
  const [dataRefreshKey, setDataRefreshKey] = useState<number>(0);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(getCurrentUser());
  const [isAdminPortalActive, setIsAdminPortalActive] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 1,
      title: 'Đã đến giờ tập luyện! 🔥',
      message: 'Hôm nay bạn có lịch tập Cardio đốt mỡ 20 phút. Mở app tập ngay nhé!',
      time: '10 phút trước',
      isRead: false,
      type: 'WORKOUT'
    },
    {
      id: 2,
      title: 'Cập nhật số đo định kỳ 📏',
      message: 'Đã 7 ngày rồi! Hãy cập nhật lại Cân nặng và Vòng eo trong trang Hồ sơ nhé.',
      time: '2 giờ trước',
      isRead: false,
      type: 'METRIC'
    },
    {
      id: 3,
      title: 'Chúc mừng Chuỗi 3 Ngày! 🏆',
      message: 'Bạn đã hoàn thành chuỗi 3 ngày tập liên tục. Tiếp tục giữ vững phong độ!',
      time: 'Hôm qua',
      isRead: true,
      type: 'STREAK'
    }
  ]);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Click Outside cho User Menu
  useEffect(() => {
    const handleClickOutsideMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutsideMenu);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMenu);
    };
  }, [showUserMenu]);

  // Click Outside cho Notification Popover
  useEffect(() => {
    const handleClickOutsideNotif = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutsideNotif);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideNotif);
    };
  }, [showNotifications]);

  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setCurrentUser(user);
      setDataRefreshKey((k) => k + 1);
    });
    return unsubscribe;
  }, []);

  const handleWorkoutSaved = () => {
    setDataRefreshKey((prev) => prev + 1);
    setActiveTab('history');
  };

  const openAuthModal = (mode: 'login' | 'register' | 'forgot') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setIsAdminPortalActive(false);
    setActiveTab('home');
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  // Hàm để Admin gửi thông báo từ AdminNotifyTab
  const addNotification = (title: string, message: string) => {
    const newNotif: AppNotification = {
      id: Date.now(),
      title,
      message,
      time: 'Vừa xong',
      isRead: false,
      type: 'WORKOUT',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const tabs = [
    { id: 'home', label: 'Tập Luyện', icon: Activity },
    { id: 'progress', label: 'Tiến Trình', icon: TrendingUp },
    { id: 'history', label: 'Lịch Sử', icon: HistoryIcon },
    { id: 'journal', label: 'Nhật Ký', icon: UtensilsCrossed },
    { id: 'profile', label: 'Cá Nhân', icon: User },
    ...(currentUser?.role === 'ADMIN' ? [{ id: 'admin' as const, label: 'Admin', icon: ShieldCheck }] : []),
  ] as const;

  // RULE: If not logged in, show Introduction / Landing page only
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center selection:bg-emerald-500 selection:text-white">
        <div className="w-full max-w-lg min-h-screen bg-slate-900 shadow-2xl relative border-x border-slate-800">
          <LandingPage
            onOpenLogin={() => openAuthModal('login')}
            onOpenRegister={() => openAuthModal('register')}
            onOpenAdminDirect={() => {
              setIsAdminPortalActive(true);
            }}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setIsAuthModalOpen(false);
              if (user.role === 'ADMIN') {
                setIsAdminPortalActive(true);
              }
            }}
          />

          {/* Auth Modal (Login / Register / Forgot Password) */}
          <AuthModal
            isOpen={isAuthModalOpen}
            initialMode={authModalMode}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={(user) => {
              setCurrentUser(user);
              setIsAuthModalOpen(false);
              if (user.role === 'ADMIN') {
                setIsAdminPortalActive(true);
              }
            }}
          />
        </div>
      </div>
    );
  }

  // If Admin portal is activated and user is ADMIN, render the full admin dashboard
  if (isAdminPortalActive && currentUser.role === 'ADMIN') {
    return (
      <AdminPortal
        currentUser={currentUser}
        onExitToApp={() => setIsAdminPortalActive(false)}
        onLogout={handleLogout}
        onAddNotification={addNotification}
      />
    );
  }

  // Once logged in, show the full app inside
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Mobile Shell Container */}
      <div className="w-full max-w-lg min-h-screen bg-slate-50 flex flex-col shadow-2xl relative border-x border-slate-200/60">
        {/* Sticky Mobile Top Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Flame size={18} className="fill-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900 leading-tight">
                Cardio Tracker
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                Hệ thống giảm mỡ khoa học
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bell Notification Center */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                title="Thông báo"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>

              {/* Notification Popover Modal */}
             {/* Notification Popover Modal */}
              {showNotifications && (
                <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm">Thông báo</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                          {unreadCount} mới
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck size={13} />
                        Đọc tất cả
                      </button>
                    )}
                  </div>

                  {/* Danh sách thông báo */}
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-6">Không có thông báo nào</p>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleMarkAsRead(item.id)}
                          className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                            item.isRead
                              ? 'bg-slate-50/50 border-transparent text-slate-500'
                              : 'bg-emerald-50/40 border-emerald-100 text-slate-800 font-medium'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs font-bold ${!item.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                              {item.title}
                            </p>
                            {!item.isRead && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-snug">
                            {item.message}
                          </p>
                          <span className="text-[9px] text-slate-400 block mt-1.5 font-semibold">
                            {item.time}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Portal Toggle Button */}
            {currentUser.role === 'ADMIN' && (
              <button
                onClick={() => setIsAdminPortalActive(true)}
                className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                title="Mở Cổng Quản Trị Hệ Thống"
              >
                <ShieldCheck size={14} className="text-emerald-600" />
                <span className="text-[11px]">Admin</span>
              </button>
            )}

            {/* User Account Menu in Header */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 pl-1.5 pr-2.5 py-1 rounded-full text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                title="Menu tài khoản"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[85px] truncate text-[11px]">
                  {currentUser.fullName.split(' ').pop()}
                </span>
                <ChevronDown size={12} className="text-slate-500" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 truncate">
                        {currentUser.fullName}
                      </p>
                      {currentUser.role === 'ADMIN' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {currentUser.email}
                    </p>
                  </div>

                  {currentUser.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setIsAdminPortalActive(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 mb-1 text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 rounded-xl transition-colors text-left font-bold"
                    >
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>Cổng Quản Trị (Admin Portal)</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left"
                  >
                    <User size={14} className="text-slate-500" />
                    <span>Hồ sơ & Mục tiêu eo</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsChangePasswordOpen(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left"
                  >
                    <KeyRound size={14} className="text-indigo-600" />
                    <span>Đổi Mật Khẩu</span>
                  </button>

                  <div className="border-t border-slate-100 my-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left font-semibold"
                    >
                      <LogOut size={14} />
                      <span>Đăng Xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Main View Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeTab
              key={`home-${dataRefreshKey}`}
              onWorkoutSaved={handleWorkoutSaved}
              onNavigateToHistory={() => setActiveTab('history')}
              onAddNotification={addNotification}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressTab key={`progress-${dataRefreshKey}`} />
          )}

          {activeTab === 'history' && (
            <HistoryTab key={`history-${dataRefreshKey}`} />
          )}

          {activeTab === 'journal' && (
            <JournalTab key={`journal-${dataRefreshKey}`} />
          )}

          {activeTab === 'profile' && (
            <ProfileTab key={`profile-${dataRefreshKey}`} onAddNotification={addNotification} />
          )}
        </main>

        {/* Fixed Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-3 py-2 flex items-center justify-around shadow-2xl pointer-events-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'admin') {
                      setIsAdminPortalActive(true);
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer select-none ${
                    isActive
                      ? 'text-emerald-600 scale-105 font-bold'
                      : 'text-slate-400 hover:text-slate-600 font-medium'
                  }`}
                >
                  <div
                    className={`w-9 h-7 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'text-slate-400'
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-[11px] tracking-tight mt-0.5">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Auth Modal (Login / Register / Forgot Password) */}
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            setDataRefreshKey((k) => k + 1);
          }}
        />

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      </div>
    </div>
  );
}