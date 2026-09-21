

// Tự động nhận diện môi trường: Nếu chạy local thì trỏ về localhost, còn lên production thì lấy domain Vercel (hoặc biến môi trường)
const API_BASE_URL = 'https://cardio-tracker-2uf7.vercel.app/api';

export const API_ENDPOINTS = {
  PRACTICES: `${API_BASE_URL}/practices`,
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  WORKOUTS: `${API_BASE_URL}/workouts`,
  USERS: `${API_BASE_URL}/users`,
};