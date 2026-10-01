export interface FoodItem {
  name: string;
  caloriesPer100g: number;
  category?: string;
}

export const INITIAL_FOOD_DATABASE: FoodItem[] = [
  { name: 'Cơm trắng', caloriesPer100g: 130, category: 'Tinh bột' },
  { name: 'Ức gà (đã nấu)', caloriesPer100g: 165, category: 'Đạm' },
  { name: 'Thịt bò (nạc)', caloriesPer100g: 250, category: 'Đạm' },
  { name: 'Trứng gà (luộc)', caloriesPer100g: 155, category: 'Đạm' },
  { name: 'Bông cải xanh', caloriesPer100g: 35, category: 'Rau xanh' },
  { name: 'Khoai lang', caloriesPer100g: 86, category: 'Tinh bột' },
  { name: 'Cá hồi', caloriesPer100g: 208, category: 'Đạm & Béo tốt' },
  { name: 'Yến mạch', caloriesPer100g: 389, category: 'Tinh bột' },
];

const FOOD_STORAGE_KEY = 'cardio_food_database_v1';

export async function getStoredFoodDatabase() {
  try {
    // Gọi API tới endpoint tương ứng với hàm getCateLog ở Backend
    // (Ví dụ: đường dẫn API là /api/categories hoặc /api/meal-categories)
    const response = await fetch('/api/categories', {
      method: 'GET',
      credentials: 'include', // Đảm bảo gửi kèm cookie xác thực (tương đương withCredentials: true)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    // Kiểm tra dữ liệu trả về từ cấu trúc { success: true, data: [...] } của getCateLog
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }

    return [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách từ server:', error);
    return []; // Trả về mảng rỗng nếu lỗi mạng hoặc lỗi server để không làm sập ứng dụng
  }
}

export function saveStoredFoodDatabase(list: FoodItem[]) {
  try {
    localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save food database', e);
  }
}

export async function addFoodItemToDatabase(item: FoodItem) {
  const current = await getStoredFoodDatabase();
  const exists = current.some((f: { name: string; }) => f.name.toLowerCase() === item.name.trim().toLowerCase());
  if (exists) {
    throw new Error(`Món "${item.name}" đã tồn tại trong danh mục.`);
  }
  const updated = [...current, { ...item, name: item.name.trim() }];
  saveStoredFoodDatabase(updated);
  return updated;
}

export async function deleteFoodItemFromDatabase(name: string) {
  const current = await getStoredFoodDatabase();
  const updated = current.filter((f: { name: string; }) => f.name !== name);
  saveStoredFoodDatabase(updated);
  return updated;
}

export async function updateFoodItemInDatabase(oldName: string, updatedItem: FoodItem) {
  const current = await getStoredFoodDatabase();
  const updated = current.map((f: { name: string; }) => (f.name === oldName ? updatedItem : f));
  saveStoredFoodDatabase(updated);
  return updated;
}

export const FOOD_DATABASE: Promise<FoodItem[]> = getStoredFoodDatabase();

