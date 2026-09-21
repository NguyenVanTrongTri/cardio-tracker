const API_BASE_URL = 'https://cardio-tracker-2uf7.vercel.app/api';

// 1. Gửi yêu cầu lấy mã OTP quên mật khẩu
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

// 2. Xác thực OTP và đặt lại mật khẩu mới
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

export async function changePasswordApi(oldPass: string, newPass: string) {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
    // 🍪 BẮT BUỘC PHẢI CÓ ĐỂ GỬI COOKIE CHỨA TOKEN LÊN SERVER
    credentials: 'include', 
    body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Đổi mật khẩu thất bại.');
  }
  return data; // { success: true, message: "..." }
}