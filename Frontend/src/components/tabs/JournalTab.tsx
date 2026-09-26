import { useState, useMemo, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Calendar,
  Flame,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Apple,
  X,
} from 'lucide-react';
import { DailyMealJournal, Meal, FoodItemEntry } from '../../types';
import { FOOD_DATABASE, FoodItem } from '../../data/foodData';
import { API_ENDPOINTS } from '../../services/apiConfig';

const MEAL_CATEGORIES = ['Bữa Sáng', 'Bữa Trưa', 'Bữa Xế', 'Bữa Tối'];

export default function JournalTab() {
  const [journals, setJournals] = useState<DailyMealJournal[]>([]);
  const [foodDb, setFoodDb] = useState<FoodItem[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | 'custom'>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [modalDate, setModalDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalTime, setModalTime] = useState(
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  );
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [modalMealsData, setModalMealsData] = useState<Record<string, FoodItemEntry[]>>({});
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ date: string; mealId?: string; type: 'meal' | 'day' } | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const loadData = async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.MEALS}`, {
        method: 'GET',
        credentials: 'include',
      });
      const result = await res.json();

      if (result.success) {
        const rawMeals = result.data;
        const grouped = rawMeals.reduce((acc: Record<string, DailyMealJournal>, meal: any) => {
          const dateKey = meal.mealDate ? meal.mealDate.split('T')[0] : 'Unknown';
          if (!acc[dateKey]) {
            acc[dateKey] = { id: dateKey, date: dateKey, meals: [], totalCalories: 0 };
          }
          const mealObj: Meal = {
            id: meal.id,
            category: meal.category,
            time: meal.mealTime,
            foodItems: meal.foodItems,
            totalCalories: meal.totalCalories
          };
          acc[dateKey].meals.push(mealObj);
          acc[dateKey].totalCalories += meal.totalCalories;
          return acc;
        }, {} as Record<string, DailyMealJournal>);

        const list: DailyMealJournal[] = Object.values(grouped);
        setJournals(list);
        const initExpanded: Record<string, boolean> = {};
        list.forEach((j) => { initExpanded[j.date] = true; });
        setExpandedDates(initExpanded);
      } else {
        showToast(result.message || 'Không thể tải nhật ký!', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Lỗi kết nối!', 'error');
    }
  };

  useEffect(() => {
    loadData();
    setFoodDb(FOOD_DATABASE);
  }, []);

  const handleOpenAddModal = (date?: string) => {
    setModalMode('add');
    setModalDate(date || new Date().toISOString().split('T')[0]);
    setModalTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    setModalMealsData({});
    setIsModalOpen(true);
  };

  const handleOpenEditJournalModal = (date: string) => {
    const dayData = journals.find(j => j.date === date);
    if (!dayData) {
      showToast('Không tìm thấy dữ liệu', 'error');
      return;
    }
    setModalMode('edit');
    setModalDate(date);
    const mappedMealsData: Record<string, FoodItemEntry[]> = {};
    dayData.meals.forEach(m => {
       mappedMealsData[m.category] = m.foodItems || [];
    });
    setModalMealsData(mappedMealsData);
    setIsModalOpen(true);
  };

  const isMealExists = useMemo(() => {
    const categoriesInModal = Object.keys(modalMealsData).filter(cat => modalMealsData[cat].length > 0);
    return journals.find(j => j.date === modalDate)?.meals.some(m => categoriesInModal.includes(m.category));
  }, [journals, modalDate, modalMealsData]);

  const handleSaveMeal = async () => {
    const categoriesToSave = Object.keys(modalMealsData).filter(cat => modalMealsData[cat].length > 0);
    if (categoriesToSave.length === 0) return;
    
    setIsLoading(true);
    try {
      for (const category of categoriesToSave) {
        const payload = {
          mealDate: modalDate,
          category: category,
          mealTime: modalTime,
          foodItems: modalMealsData[category].map(item => ({
            foodName: item.foodName,
            grams: Number(item.grams) || 0,
            calories: Number(item.calories) || 0,
          }))
        };
        await fetch(API_ENDPOINTS.MEALS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      setModalMealsData({});
      loadData();
    } catch (error) {
      showToast('Lỗi lưu bữa ăn!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ... (Phần render giữ nguyên như logic đã sửa trước đó)
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-24 animate-in fade-in duration-300">
      {/* ... (Header, Stats, List, Modals) */}
    </div>
  );
}
