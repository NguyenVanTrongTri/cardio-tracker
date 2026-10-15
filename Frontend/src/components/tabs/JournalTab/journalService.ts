import { API_ENDPOINTS } from '../../../services/apiConfig';
import { FoodItemEntry, Meal } from '../../../types';

export const fetchMeals = async () => {
  const response = await fetch(`${API_ENDPOINTS.MEALS}`, {
    method: 'GET',
    credentials: 'include',
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Lỗi khi tải nhật ký dinh dưỡng');
  }
  return result.data;
};

export const fetchFoodCategories = async () => {
  const response = await fetch(API_ENDPOINTS.CATEGORIES, {
    method: 'GET',
    credentials: 'include',
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Lỗi khi tải danh sách thực phẩm');
  }
  return result.data;
};

export const createMeal = async (payload: {
  mealDate: string;
  category: string;
  mealTime: string;
  foodItems: { foodName: string; grams: number; calories: number }[];
}) => {
  const response = await fetch(API_ENDPOINTS.MEALS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Lỗi khi lưu bữa ăn');
  }
  return result;
};

export const updateMeal = async (
  mealId: string,
  payload: {
    mealDate: string;
    category: string;
    mealTime: string;
    foodItems: { foodName: string; grams: number; calories: number }[];
  }
) => {
  const response = await fetch(`${API_ENDPOINTS.MEALS}/${mealId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Lỗi khi cập nhật bữa ăn');
  }
  return result;
};

export const deleteMeal = async (mealId: string) => {
  const response = await fetch(`${API_ENDPOINTS.MEALS}/${mealId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Lỗi khi xóa bữa ăn');
  }
  return result;
};
