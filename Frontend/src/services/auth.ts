import { UserAccount, AuthSession, UserProfile } from '../types';

const USERS_STORAGE_KEY = 'cardio_users_v2';
const SESSION_STORAGE_KEY = 'cardio_session_v2';
const API_BASE_URL = 'https://backendcardio.vercel.app/api';

// Pre-seeded users
export const INITIAL_ADMIN_USER: UserAccount = {
  id: 'usr-admin-master',
  email: 'admin@cardiotracker.com',
  password: 'admin123456',
  fullName: 'Quản Trị Viên (Admin)',
  role: 'ADMIN',
  heightCm: 175,
  gender: 'MALE',
  birthYear: 1990,
  targetWaistCm: 78.0,
  targetWeightKg: 68.0,
  targetDate: '2026-12-31',
  createdAt: '2026-01-01T08:00:00Z',
};

export const INITIAL_USER: UserAccount = {
  id: 'usr-trongtri',
  email: 'abc@gmail.com',
  password: '123456',
  fullName: 'Nguyễn Minh Trí',
  role: 'USER',
  heightCm: 173,
  gender: 'MALE',
  birthYear: 1996,
  targetWaistCm: 80.0,
  targetWeightKg: 67.0,
  targetDate: '2026-10-31',
  createdAt: '2026-08-01T08:00:00Z',
};

// Event listeners for reactive state updates
type AuthListener = (user: UserAccount | null) => void;
const listeners: Set<AuthListener> = new Set();

export function subscribeAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(user: UserAccount | null) {
  listeners.forEach((l) => l(user));
}

export function getStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    let list: UserAccount[] = [];
    if (!raw) {
      list = [INITIAL_ADMIN_USER, INITIAL_USER];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(list));
      return list;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      list = [INITIAL_ADMIN_USER, INITIAL_USER];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(list));
      return list;
    }
    list = parsed;

    // Ensure Master Admin exists
    const hasAdmin = list.some((u) => u.email.toLowerCase() === INITIAL_ADMIN_USER.email.toLowerCase());
    if (!hasAdmin) {
      list.push(INITIAL_ADMIN_USER);
    }

    // Ensure trongtriww@gmail.com has ADMIN role
    list = list.map((u) => {
      if (u.email.toLowerCase() === 'trongtriww@gmail.com' && u.role !== 'ADMIN') {
        return { ...u, role: 'ADMIN' };
      }
      return u;
    });

    saveUsers(list);
    return list;
  } catch {
    return [INITIAL_ADMIN_USER, INITIAL_USER];
  }
}

function saveUsers(users: UserAccount[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const session: AuthSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return session.user;
  } catch {
    return null;
  }
}

export function login(
  email: string,
  pass: string,
  rememberMe = true
): { success: boolean; user?: UserAccount; error?: string } {
  const users = getStoredUsers();
  const trimmedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);

  if (!user) {
    return { success: false, error: 'Email không tồn tại trong hệ thống.' };
  }

  if (user.password !== pass) {
    return { success: false, error: 'Mật khẩu không chính xác. Vui lòng thử lại!' };
  }

  const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const session: AuthSession = {
    user,
    token: `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    expiresAt: Date.now() + duration,
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  localStorage.removeItem('cardio_explicit_logout');
  notifyListeners(user);

  return { success: true, user };
}

export async function register(data: {
  email: string;
  password: string;
  fullName: string;
  heightCm: number;
  gender: 'MALE' | 'FEMALE';
  birthYear: number;
  targetWaistCm?: number;
  targetWeightKg?: number;
  targetDate?: string;
}): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return { 
        success: false, 
        error: result.error || 'Đăng ký thất bại trên hệ thống.' 
      };
    }

    if (result.token) {
      const session: AuthSession = {
        user: result.user,
        token: result.token,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      localStorage.removeItem('cardio_explicit_logout');
      notifyListeners(result.user);
    }

    return { success: true, user: result.user };
  } catch (error) {
    console.error('Lỗi kết nối API đăng ký:', error);
    return { success: false, error: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.' };
  }
}

export function logout(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.setItem('cardio_explicit_logout', 'true');
  notifyListeners(null);
}

export function changePassword(
  userId: string,
  oldPass: string,
  newPass: string
): { success: boolean; error?: string } {
  if (!newPass || newPass.length < 6) {
    return { success: false, error: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' };
  }

  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) {
    return { success: false, error: 'Tài khoản không tìm thấy.' };
  }

  if (users[index].password !== oldPass) {
    return { success: false, error: 'Mật khẩu hiện tại không đúng.' };
  }

  users[index].password = newPass;
  saveUsers(users);

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const session: AuthSession = JSON.parse(raw);
      session.user.password = newPass;
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  }

  return { success: true };
}

// Chuyển sang dùng fetch trực tiếp giống hàm register để đồng bộ và không lỗi axiosClient
export async function requestPasswordReset(email: string) {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Không thể gửi yêu cầu lấy mã OTP.');
  }
  return data; // { success: true, otp: "..." }
}

export async function verifyAndResetPassword(email: string, otp: string, newPassword: string) {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
  }
  return data; // { success: true }
}

export function updateCurrentUserProfile(
  profileData: Partial<UserProfile>
): { success: boolean; user?: UserAccount } {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false };

  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === currentUser.id);
  if (index === -1) return { success: false };

  users[index] = {
    ...users[index],
    ...profileData,
  };
  saveUsers(users);

  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (raw) {
    const session: AuthSession = JSON.parse(raw);
    session.user = users[index];
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }
  notifyListeners(users[index]);

  return { success: true, user: users[index] };
}

// ADMIN Management Functions
export function adminUpdateUserRole(
  userId: string,
  newRole: 'ADMIN' | 'USER'
): { success: boolean; error?: string } {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return { success: false, error: 'Không tìm thấy người dùng.' };

  users[index].role = newRole;
  saveUsers(users);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const session: AuthSession = JSON.parse(raw);
      session.user.role = newRole;
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      notifyListeners(session.user);
    }
  }

  return { success: true };
}

export function adminResetUserPassword(
  userId: string,
  newPass: string
): { success: boolean; error?: string } {
  if (!newPass || newPass.length < 6) {
    return { success: false, error: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' };
  }
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return { success: false, error: 'Không tìm thấy người dùng.' };

  users[index].password = newPass;
  saveUsers(users);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const session: AuthSession = JSON.parse(raw);
      session.user.password = newPass;
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      notifyListeners(session.user);
    }
  }

  return { success: true };
}

export function adminDeleteUser(userId: string): { success: boolean; error?: string } {
  const current = getCurrentUser();
  if (current && current.id === userId) {
    return { success: false, error: 'Không thể xóa tài khoản của chính bạn khi đang đăng nhập.' };
  }

  const users = getStoredUsers();
  const updated = users.filter((u) => u.id !== userId);
  if (updated.length === users.length) {
    return { success: false, error: 'Không tìm thấy người dùng để xóa.' };
  }

  saveUsers(updated);
  return { success: true };
}

export function adminCreateUser(userData: {
  email: string;
  fullName: string;
  password?: string;
  role?: 'ADMIN' | 'USER';
  heightCm?: number;
  gender?: 'MALE' | 'FEMALE';
  birthYear?: number;
  targetWeightKg?: number;
  targetWaistCm?: number;
}): { success: boolean; user?: UserAccount; error?: string } {
  const users = getStoredUsers();
  const email = userData.email.trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Email không hợp lệ.' };
  }

  if (users.some((u) => u.email.toLowerCase() === email)) {
    return { success: false, error: 'Email này đã tồn tại trong hệ thống.' };
  }

  const newUser: UserAccount = {
    id: `usr-${Date.now()}`,
    email,
    password: userData.password || 'password123',
    fullName: userData.fullName.trim() || 'Người dùng mới',
    role: userData.role || 'USER',
    heightCm: userData.heightCm || 170,
    gender: userData.gender || 'MALE',
    birthYear: userData.birthYear || 1995,
    targetWaistCm: userData.targetWaistCm || 80,
    targetWeightKg: userData.targetWeightKg || 68,
    targetDate: '2026-12-31',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, user: newUser };
}