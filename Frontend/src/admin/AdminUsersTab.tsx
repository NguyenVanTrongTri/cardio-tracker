import { useState, useMemo, type FormEvent } from 'react';
import {
  Users,
  Search,
  UserPlus,
  ShieldCheck,
  Shield,
  KeyRound,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Lock,
  Mail,
  User,
  Scale
} from 'lucide-react';
import { UserAccount } from '../types';
import {
  getStoredUsers,
  adminUpdateUserRole,
  adminResetUserPassword,
  adminDeleteUser,
  adminCreateUser
} from '../services/auth';
import { logAdminAction } from './adminService';

interface AdminUsersTabProps {
  currentUser: UserAccount;
  onRefreshStats: () => void;
}

export default function AdminUsersTab({ currentUser, onRefreshStats }: AdminUsersTabProps) {
  const [users, setUsers] = useState<UserAccount[]>(getStoredUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');

  // Modal states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [resetPassUserId, setResetPassUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Add user form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('password123');
  const [newRole, setNewRole] = useState<'ADMIN' | 'USER'>('USER');
  const [newHeight, setNewHeight] = useState(170);
  const [newGender, setNewGender] = useState<'MALE' | 'FEMALE'>('MALE');

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refreshList = () => {
    setUsers(getStoredUsers());
    onRefreshStats();
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole =
        roleFilter === 'ALL'
          ? true
          : roleFilter === 'ADMIN'
          ? u.role === 'ADMIN'
          : u.role !== 'ADMIN';
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleToggleRole = (targetUser: UserAccount) => {
    if (targetUser.id === currentUser.id) {
      showNotification('Bạn không thể tự hạ quyền Admin của chính mình.', 'error');
      return;
    }

    const nextRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const confirm = window.confirm(
      `Xác nhận ${nextRole === 'ADMIN' ? 'thăng cấp Admin' : 'chuyển thành Thành viên thường'} cho ${targetUser.fullName}?`
    );
    if (!confirm) return;

    const res = adminUpdateUserRole(targetUser.id, nextRole);
    if (res.success) {
      logAdminAction(
        currentUser.email,
        'Cập nhật quyền người dùng',
        `Chuyển ${targetUser.email} thành ${nextRole}`,
        'SUCCESS'
      );
      showNotification(`Đã cập nhật quyền của ${targetUser.fullName} thành ${nextRole}!`);
      refreshList();
    } else {
      showNotification(res.error || 'Thao tác không thành công', 'error');
    }
  };

  const handleResetPassword = (e: FormEvent) => {
    e.preventDefault();
    if (!resetPassUserId || !newPassword) return;

    const target = users.find((u) => u.id === resetPassUserId);
    const res = adminResetUserPassword(resetPassUserId, newPassword);
    if (res.success) {
      logAdminAction(
        currentUser.email,
        'Đặt lại mật khẩu',
        `Đặt lại mật khẩu cho ${target?.email || resetPassUserId}`,
        'WARNING'
      );
      showNotification(`Đã đổi mật khẩu thành công cho ${target?.fullName}!`);
      setResetPassUserId(null);
      setNewPassword('');
      refreshList();
    } else {
      showNotification(res.error || 'Không thể đổi mật khẩu', 'error');
    }
  };

  const handleDeleteUser = (targetUser: UserAccount) => {
    if (targetUser.id === currentUser.id) {
      showNotification('Không thể xóa tài khoản Admin đang đăng nhập.', 'error');
      return;
    }

    const confirm = window.confirm(
      `⚠️ BẠN CÓ CHẮC MUỐN XÓA TÀI KHOẢN: ${targetUser.fullName} (${targetUser.email})?`
    );
    if (!confirm) return;

    const res = adminDeleteUser(targetUser.id);
    if (res.success) {
      logAdminAction(
        currentUser.email,
        'Xóa tài khoản người dùng',
        `Đã xóa tài khoản ${targetUser.email}`,
        'WARNING'
      );
      showNotification(`Đã xóa tài khoản ${targetUser.fullName}.`);
      refreshList();
    } else {
      showNotification(res.error || 'Xóa tài khoản thất bại', 'error');
    }
  };

  const handleCreateUser = (e: FormEvent) => {
    e.preventDefault();
    const res = adminCreateUser({
      email: newEmail,
      fullName: newName,
      password: newPass,
      role: newRole,
      heightCm: Number(newHeight) || 170,
      gender: newGender,
    });

    if (res.success && res.user) {
      logAdminAction(
        currentUser.email,
        'Tạo người dùng mới',
        `Tạo tài khoản ${res.user.email} (Quyền: ${res.user.role})`,
        'SUCCESS'
      );
      showNotification(`Tạo người dùng ${res.user.fullName} thành công!`);
      setIsAddUserOpen(false);
      setNewEmail('');
      setNewName('');
      setNewPass('password123');
      refreshList();
    } else {
      showNotification(res.error || 'Không thể tạo tài khoản', 'error');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setRoleFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                roleFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Tất cả ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('ADMIN')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                roleFilter === 'ADMIN' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Admin ({users.filter((u) => u.role === 'ADMIN').length})
            </button>
            <button
              onClick={() => setRoleFilter('USER')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                roleFilter === 'USER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Thành viên ({users.filter((u) => u.role !== 'ADMIN').length})
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
        >
          <UserPlus size={15} />
          <span>Thêm Người Dùng</span>
        </button>
      </div>

      {/* Notification Toast */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border animate-in slide-in-from-top-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Users Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Thành Viên</th>
                <th className="py-3 px-4">Quyền Hạn</th>
                <th className="py-3 px-4">Chỉ Số Thân Thể</th>
                <th className="py-3 px-4">Ngày Tham Gia</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Không tìm thấy người dùng phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isAdmin = user.role === 'ADMIN';
                  const isCurrent = user.id === currentUser.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                              isAdmin
                                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                                : 'bg-slate-600'
                            }`}
                          >
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.fullName}</span>
                              {isCurrent && (
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-bold">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck size={12} />
                            ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80">
                            <User size={12} />
                            Thành viên
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        <div>{user.heightCm} cm • {user.gender === 'MALE' ? 'Nam' : 'Nữ'}</div>
                        <div className="text-slate-400">Mục tiêu: {user.targetWeightKg}kg / {user.targetWaistCm}cm</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {user.createdAt ? user.createdAt.split('T')[0] : '2026-08-01'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Toggle role button */}
                          <button
                            onClick={() => handleToggleRole(user)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                              isAdmin
                                ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            } ${isCurrent ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title={isAdmin ? 'Hạ quyền xuống User' : 'Thăng cấp lên Admin'}
                          >
                            <Shield size={14} />
                          </button>

                          {/* Reset password button */}
                          <button
                            onClick={() => {
                              setResetPassUserId(user.id);
                              setNewPassword('admin123');
                            }}
                            className="p-1.5 rounded-xl bg-slate-50 text-indigo-600 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer"
                            title="Đặt lại mật khẩu"
                          >
                            <KeyRound size={14} />
                          </button>

                          {/* Delete user button */}
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-xl bg-slate-50 text-rose-500 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer ${
                              isCurrent ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Thêm Người Dùng Mới</h3>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ và Tên</label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mật Khẩu Khởi Tạo</label>
                <input
                  type="text"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phân Quyền</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'ADMIN' | 'USER')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="USER">Thành viên thường</option>
                    <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giới Tính</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'MALE' | 'FEMALE')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chiều Cao (cm)</label>
                <input
                  type="number"
                  value={newHeight}
                  onChange={(e) => setNewHeight(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Lưu Người Dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPassUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Đặt Lại Mật Khẩu</h3>
              </div>
              <button
                onClick={() => setResetPassUserId(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mật khẩu mới</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetPassUserId(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Cập Nhật Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
