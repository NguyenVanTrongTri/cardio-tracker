import type { Dispatch, SetStateAction } from 'react';
import { Meal, FoodItemEntry } from '../../../types';
import { FOOD_DATABASE } from '../../../data/foodData';

export interface MealSectionProps {
  key?: string;
  category: string;
  meals: Meal[];
  setMeals: Dispatch<SetStateAction<Meal[]>>;
}

export const MEAL_CATEGORIES = ['Bữa Sáng', 'Bữa Trưa', 'Bữa Xế', 'Bữa Tối'];

export default function MealSection({ category, meals, setMeals }: MealSectionProps) {
  const categoryMeals = meals.filter((m) => m.category === category);

  const updateMealFoodItems = (mealId: string, updatedItems: FoodItemEntry[]) => {
    setMeals(
      meals.map((m) =>
        m.id === mealId
          ? {
              ...m,
              foodItems: updatedItems,
              totalCalories: updatedItems.reduce((acc, curr) => acc + curr.calories, 0),
            }
          : m
      )
    );
  };

  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-bold text-slate-700">{category}</h4>
        {categoryMeals.length === 0 && (
          <button
            type="button"
            onClick={() => {
              const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
              setMeals([
                ...meals,
                { id: 'm-' + Date.now(), category, time: currentTime, foodItems: [], totalCalories: 0 },
              ]);
            }}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            + Thêm món
          </button>
        )}
      </div>
      {categoryMeals.map((meal) => (
        <div key={meal.id} className="space-y-2 mt-2 pt-2 border-t border-slate-200">
          <div className="flex gap-2 items-center">
            <input
              type="time"
              value={meal.time}
              onChange={(e) =>
                setMeals(meals.map((m) => (m.id === meal.id ? { ...m, time: e.target.value } : m)))
              }
              className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-medium text-slate-800"
            />
            <span className="flex-1 text-xs font-bold text-slate-600">Tổng: {meal.totalCalories} kcal</span>
            <button
              type="button"
              onClick={() => setMeals(meals.filter((m) => m.id !== meal.id))}
              className="text-slate-400 hover:text-rose-500 text-xs font-bold"
            >
              Xóa
            </button>
          </div>
          <div className="space-y-1">
            {(meal.foodItems || []).map((item) => (
              <div key={item.id} className="flex gap-1 items-center text-xs">
                <select
                  value={item.foodName}
                  onChange={(e) => {
                    const food = FOOD_DATABASE.find((f) => f.name === e.target.value);
                    const calories = food ? Math.round((item.grams / 100) * food.caloriesPer100g) : 0;
                    const updatedItems = (meal.foodItems || []).map((i) =>
                      i.id === item.id ? { ...i, foodName: e.target.value, calories } : i
                    );
                    updateMealFoodItems(meal.id, updatedItems);
                  }}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1"
                >
                  {FOOD_DATABASE.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max="500"
                  placeholder="g"
                  value={item.grams || ''}
                  onChange={(e) => {
                    const grams = Number(e.target.value);
                    const food = FOOD_DATABASE.find((f) => f.name === item.foodName);
                    const calories = (food && grams > 0) ? Math.round((grams / 100) * food.caloriesPer100g) : 0;
                    const updatedItems = (meal.foodItems || []).map((i) =>
                      i.id === item.id ? { ...i, grams: grams > 0 ? grams : 0, calories } : i
                    );
                    updateMealFoodItems(meal.id, updatedItems);
                  }}
                  className="w-16 bg-white border border-slate-200 rounded-lg px-1 py-1 text-center text-xs"
                />
                <span className="w-12 text-right">{item.calories || 0}kcal</span>
                <button
                  type="button"
                  onClick={() => {
                    const updatedItems = (meal.foodItems || []).filter((i) => i.id !== item.id);
                    updateMealFoodItems(meal.id, updatedItems);
                  }}
                  className="text-rose-400"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newItem = {
                  id: 'fi-' + Date.now(),
                  foodName: FOOD_DATABASE[0].name,
                  grams: 0,
                  calories: 0,
                };
                const updatedItems = [...(meal.foodItems || []), newItem];
                updateMealFoodItems(meal.id, updatedItems);
              }}
              className="text-xs text-emerald-600 font-bold"
            >
              + Món
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
