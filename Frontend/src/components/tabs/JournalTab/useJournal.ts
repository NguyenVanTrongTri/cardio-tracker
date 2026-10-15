import { useState, useMemo, useEffect } from 'react';
import { DailyMealJournal, Meal, FoodItemEntry } from '../../../types';
import { FoodItem } from '../../../data/foodData';
import {
  fetchMeals,
  fetchFoodCategories,
  createMeal,
  updateMeal,
  deleteMeal
} from './journalService';

export const useJournal = () => {
  const [journals, setJournals] = useState<DailyMealJournal[]>([]);
  const [foodDb, setFoodDb] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter & UI states
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | 'custom'>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isModalOpenDetail, setIsModalOpenDetail] = useState(false);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [modalDate, setModalDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalCategory, setModalCategory] = useState('Bữa Trưa');
  const [modalTime, setModalTime] = useState(
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  );
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [modalMealsData, setModalMealsData] = useState<Record<string, FoodItemEntry[]>>({});
  const [modalItems, setModalItems] = useState<FoodItemEntry[]>([]);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ date: string; mealId?: string; type: 'meal' | 'day' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const rawMeals = await fetchMeals();
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
    } catch (error: any) {
      console.error('Error loading meals:', error);
      showToast(error.message || 'Không thể tải nhật ký dinh dưỡng!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const fetchFoods = async () => {
      try {
        const data = await fetchFoodCategories();
        if (Array.isArray(data)) {
          setFoodDb(data.map((item: any) => ({
            id: item.id,
            name: item.name,
            caloriesPer100g: item.caloriesPer100g ?? 0,
            category: item.category || 'Khác',
          })));
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách thực phẩm:', error);
      }
    };
    fetchFoods();
  }, []);

  const filteredJournals = useMemo(() => {
    if (dateFilter === 'custom' && customDate) {
      return journals.filter((j) => j.date === customDate);
    }
    if (dateFilter === '7days') {
      const now = new Date();
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return journals.filter((j) => new Date(j.date) >= past7);
    }
    return journals;
  }, [journals, dateFilter, customDate]);

  const stats = useMemo(() => {
    if (!journals || journals.length === 0) return { avgIn: 0, totalDays: 0, avgBurn: 0, avgNet: 0 };
    const totalDays = journals.length;
    const totalCalIn = journals.reduce((sum, j) => sum + (j.totalCalories || 0), 0);
    const totalCalBurn = journals.reduce((sum, j) => sum + (j.workoutCaloriesBurned || 0), 0);
    const avgIn = Math.round(totalCalIn / totalDays);
    const avgBurn = Math.round(totalCalBurn / totalDays);
    const avgNet = avgIn - avgBurn;
    return { avgIn, totalDays, avgBurn, avgNet };
  }, [journals]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const normalizeTime = (timeStr: string) => {
    if (!timeStr) return "12:00";
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    const date = new Date(`1970-01-01 ${timeStr}`);
    if (isNaN(date.getTime())) return "12:00";
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const toggleExpandDate = (date: string) => {
    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  const handleOpenAddModal = (date?: string, category?: string) => {
    setModalMode('add');
    setIsDetailMode(false);
    setEditingMealId(null);
    setModalDate(date || new Date().toISOString().split('T')[0]);
    setModalCategory(category || 'Bữa Trưa');
    setModalTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    setModalItems([{ id: `fi-${Date.now()}`, foodName: foodDb[0]?.name || 'Cơm trắng', grams: 200, calories: 260 }]);
    setModalMealsData({});
    setIsModalOpen(true);
  };
  
  const handleOpenEditJournalModal = (date: string) => {
    const dayData = journals.find(j => j.date === date);
    if (!dayData) {
      showToast('Không tìm thấy dữ liệu ngày này', 'error');
      return;
    }
    setModalMode('edit');
    setEditingMealId(null);
    setModalDate(date);
    setIsDetailMode(false);
    
    const mappedMealsData: Record<string, FoodItemEntry[]> = {};
    const newExpandedCategories: Record<string, boolean> = {};

    dayData.meals.forEach(m => {
      mappedMealsData[m.category] = m.foodItems || [];
      if (m.foodItems && m.foodItems.length > 0) {
        newExpandedCategories[m.category] = true;
      }
    });

    setModalMealsData(mappedMealsData);
    setExpandedCategories(newExpandedCategories);

    if (dayData.meals.length > 0 && dayData.meals[0].time) {
      setModalTime(normalizeTime(dayData.meals[0].time));
    } else {
      setModalTime('12:00');
    }
    setIsModalOpen(true);
  };

  const isMealExists = useMemo(() => {
    const categoriesToSave = Object.keys(modalMealsData).filter(cat => modalMealsData[cat] && modalMealsData[cat].length > 0);
    return modalMode === 'add' && categoriesToSave.length > 0 && journals.find(j => j.date === modalDate)?.meals.some(m => categoriesToSave.includes(m.category));
  }, [modalMealsData, modalMode, modalDate, journals]);

  const handleSaveMeal = async () => {
    const hasAnyItems = Object.values(modalMealsData).some(items => items && items.length > 0);
    if (!hasAnyItems) {
      showToast('Vui lòng nhập ít nhất một món ăn cho bữa bất kỳ!', 'error');
      return;
    }
    
    if (modalMode === 'add' && isMealExists) {
      showToast('Bữa ăn đã tồn tại trong ngày này!', 'error');
      return;
    }
    
    setIsLoading(true);

    try {
      const dayJournal = journals.find(j => j.date === modalDate);
      const allCategories = Object.keys(modalMealsData);

      for (const category of allCategories) {
        const currentMealItems = modalMealsData[category] || [];
        const existingMeal = dayJournal?.meals.find(m => m.category === category);

        if (existingMeal) {
          await updateMeal(existingMeal.id, {
            mealDate: modalDate,
            category: category,
            mealTime: modalTime,
            foodItems: currentMealItems.map(item => ({
              foodName: item.foodName,
              grams: Number(item.grams) || 0,
              calories: Number(item.calories) || 0,
            }))
          });
          continue; 
        }

        if (!existingMeal && currentMealItems.length > 0) {
          await createMeal({
            mealDate: modalDate,
            category: category,
            mealTime: modalTime,
            foodItems: currentMealItems.map(item => ({
              foodName: item.foodName,
              grams: Number(item.grams) || 0,
              calories: Number(item.calories) || 0,
            }))
          });
        }
      }

      showToast(modalMode === 'edit' ? 'Cập nhật nhật ký thành công!' : 'Thêm bữa ăn thành công!', 'success');
      setIsModalOpen(false);
      setModalMealsData({});
      loadData();
      return true;
    } catch (error: any) {
      console.error('Lỗi kết nối API:', error);
      showToast(error.message || 'Có lỗi xảy ra khi lưu dữ liệu!', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsLoading(true);
    try {
      if (deleteTarget.type === 'meal' && deleteTarget.mealId) {
        await deleteMeal(deleteTarget.mealId);
        showToast('Xóa bữa ăn thành công!', 'success');
      } else if (deleteTarget.type === 'day') {
        const mealsToDelete = journals.find(j => j.date === deleteTarget.date)?.meals || [];
        for (const meal of mealsToDelete) {
          await deleteMeal(meal.id);
        }
        showToast('Xóa nhật ký ngày thành công!', 'success');
      }
      await loadData();
    } catch (error: any) {
      showToast(error?.message || 'Có lỗi xảy ra khi xóa!', 'error');
    } finally {
      setIsLoading(false);
      setDeleteTarget(null);
    }
  };

  return {
    journals, foodDb, isLoading, feedback, showToast, stats, 
    dateFilter, setDateFilter, customDate, setCustomDate, expandedDates, toggleExpandDate,
    isModalOpen, setIsModalOpen, modalMode, isModalOpenDetail, isDetailMode,
    modalDate, setModalDate, modalCategory, setModalCategory, modalTime, setModalTime,
    expandedCategories, toggleCategory, modalMealsData, setModalMealsData, modalItems, setModalItems,
    deleteTarget, setDeleteTarget,
    filteredJournals, handleOpenAddModal, handleOpenEditJournalModal, isMealExists, handleSaveMeal, handleDelete
  };
};
