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

export function getStoredFoodDatabase(): FoodItem[] {
  try {
    const raw = localStorage.getItem(FOOD_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(INITIAL_FOOD_DATABASE));
      return INITIAL_FOOD_DATABASE;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_FOOD_DATABASE;
  } catch {
    return INITIAL_FOOD_DATABASE;
  }
}

export function saveStoredFoodDatabase(list: FoodItem[]) {
  try {
    localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save food database', e);
  }
}

export function addFoodItemToDatabase(item: FoodItem): FoodItem[] {
  const current = getStoredFoodDatabase();
  const exists = current.some((f) => f.name.toLowerCase() === item.name.trim().toLowerCase());
  if (exists) {
    throw new Error(`Món "${item.name}" đã tồn tại trong danh mục.`);
  }
  const updated = [...current, { ...item, name: item.name.trim() }];
  saveStoredFoodDatabase(updated);
  return updated;
}

export function deleteFoodItemFromDatabase(name: string): FoodItem[] {
  const current = getStoredFoodDatabase();
  const updated = current.filter((f) => f.name !== name);
  saveStoredFoodDatabase(updated);
  return updated;
}

export function updateFoodItemInDatabase(oldName: string, updatedItem: FoodItem): FoodItem[] {
  const current = getStoredFoodDatabase();
  const updated = current.map((f) => (f.name === oldName ? updatedItem : f));
  saveStoredFoodDatabase(updated);
  return updated;
}

export const FOOD_DATABASE: FoodItem[] = getStoredFoodDatabase();

