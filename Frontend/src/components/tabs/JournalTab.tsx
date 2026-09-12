import { useState, useMemo, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Calendar,
  Flame,
  Clock,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Apple,
  Scale,
  Sparkles,
  Info,
  Check,
  X,
  TrendingDown,
  Activity
} from 'lucide-react';
import { DailyMealJournal, Meal, FoodItemEntry } from '../../types';
import {
  getStoredMealJournals,
  saveMealToDateJournal,
  deleteMealFromDateJournal,
  deleteDailyJournal
} from '../../services/storage';
import { getStoredFoodDatabase, FoodItem } from '../../data/foodData';

const MEAL_CATEGORIES = ['Bữa Sáng', 'Bữa Trưa', 'Bữa Xế', 'Bữa Tối', 'Bữa Phụ'];

export default function JournalTab() {
  const [journals, setJournals] = useState<DailyMealJournal[]>([]);
  const [foodDb, setFoodDb] = useState<FoodItem[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | 'custom'>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  // Modal State for adding/editing a meal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalCategory, setModalCategory] = useState('Bữa Trưa');
  const [modalTime, setModalTime] = useState(
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  );
  const [modalItems, setModalItems] = useState<FoodItemEntry[]>([
    { id: 'fi-1', foodName: 'Cơm trắng', grams: 200, calories: 260 },
  ]);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);

  // Confirmation modal for delete
  const [deleteTarget, setDeleteTarget] = useState<{ date: string; mealId?: string; type: 'meal' | 'day' } | null>(null);

  const loadData = () => {
    const list = getStoredMealJournals();
    setJournals(list);
    setFoodDb(getStoredFoodDatabase());
    // Mặc định mở rộng tất cả các ngày
    const initExpanded: Record<string, boolean> = {};
    list.forEach((j) => {
      initExpanded[j.date] = true;
    });
    setExpandedDates(initExpanded);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Journals
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

  // Macro Summary
  const stats = useMemo(() => {
    if (journals.length === 0) return { avgIn: 0, totalDays: 0, avgBurn: 0, avgNet: 0 };
    const totalDays = journals.length;
    const totalCalIn = journals.reduce((sum, j) => sum + j.totalCalories, 0);
    const totalCalBurn = journals.reduce((sum, j) => sum + (j.workoutCaloriesBurned || 0), 0);
    const avgIn = Math.round(totalCalIn / totalDays);
    const avgBurn = Math.round(totalCalBurn / totalDays);
    const avgNet = avgIn - avgBurn;
    return { avgIn, totalDays, avgBurn, avgNet };
  }, [journals]);

  const toggleExpandDate = (date: string) => {
    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  const handleOpenAddModal = (date?: string, category?: string) => {
    setEditingMealId(null);
    setModalDate(date || new Date().toISOString().split('T')[0]);
    setModalCategory(category || 'Bữa Trưa');
    setModalTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    setModalItems([{ id: `fi-${Date.now()}`, foodName: foodDb[0]?.name || 'Cơm trắng', grams: 200, calories: 260 }]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (date: string, meal: Meal) => {
    setEditingMealId(meal.id);
    setModalDate(date);
    setModalCategory(meal.category);
    setModalTime(meal.time);
    setModalItems(meal.foodItems && meal.foodItems.length > 0 ? [...meal.foodItems] : [
      { id: `fi-${Date.now()}`, foodName: foodDb[0]?.name || 'Cơm trắng', grams: 200, calories: 260 }
    ]);
    setIsModalOpen(true);
  };

  const handleSaveMeal = () => {
    if (modalItems.length === 0) return;
    const totalCalories = modalItems.reduce((sum, i) => sum + (Number(i.calories) || 0), 0);
    const newMeal: Meal = {
      id: editingMealId || `m-${Date.now()}`,
      category: modalCategory,
      time: modalTime,
      foodItems: modalItems,
      totalCalories,
    };

    const updated = saveMealToDateJournal(modalDate, newMeal);
    setJournals(updated);
    setExpandedDates((prev) => ({ ...prev, [modalDate]: true }));
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'meal' && deleteTarget.mealId) {
      const updated = deleteMealFromDateJournal(deleteTarget.date, deleteTarget.mealId);
      setJournals(updated);
    } else if (deleteTarget.type === 'day') {
      const updated = deleteDailyJournal(deleteTarget.date);
      setJournals(updated);
    }
    setDeleteTarget(null);
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let prefix = '';
      if (dateStr === todayStr) prefix = 'Hôm nay • ';
      else if (dateStr === yesterday) prefix = 'Hôm qua • ';

      const weekday = date.toLocaleDateString('vi-VN', { weekday: 'long' });
      const dayMonth = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return `${prefix}${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dayMonth}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-24 animate-in fade-in duration-300">
      {/* Tab Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <UtensilsCrossed size={18} />
            </div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">
              Nhật Ký Bữa Ăn
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi chi tiết món ăn & thâm hụt calo các ngày
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={15} />
          <span>Ghi Bữa Ăn</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Trung Bình Nạp
          </span>
          <span className="text-base font-black text-orange-600 font-mono">
            {stats.avgIn} <span className="text-xs font-medium">kcal/ng</span>
          </span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Trung Bình Đốt
          </span>
          <span className="text-base font-black text-indigo-600 font-mono">
            {stats.avgBurn} <span className="text-xs font-medium">kcal/ng</span>
          </span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Cân Bằng Ròng
          </span>
          <span className={`text-base font-black font-mono ${stats.avgNet <= 1200 ? 'text-emerald-600' : 'text-amber-600'}`}>
            +{stats.avgNet} <span className="text-xs font-medium">kcal</span>
          </span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Số Ngày Lưu
          </span>
          <span className="text-base font-black text-slate-800 font-mono">
            {stats.totalDays} <span className="text-xs font-medium">ngày</span>
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl">
        <button
          onClick={() => setDateFilter('all')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            dateFilter === 'all'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Tất cả ngày ({journals.length})
        </button>
        <button
          onClick={() => setDateFilter('7days')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            dateFilter === '7days'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          7 ngày gần nhất
        </button>
        <button
          onClick={() => setDateFilter('custom')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            dateFilter === 'custom'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Chọn ngày cụ thể
        </button>
      </div>

      {dateFilter === 'custom' && (
        <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <Calendar size={16} className="text-slate-400" />
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="flex-1 text-xs font-semibold text-slate-800 border-none focus:outline-none"
          />
          {customDate && (
            <button
              onClick={() => setCustomDate('')}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Xóa lọc
            </button>
          )}
        </div>
      )}

      {/* Daily Journals List */}
      <div className="space-y-3.5">
        {filteredJournals.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
              <Apple size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Chưa có nhật ký bữa ăn nào</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Hãy ghi lại các bữa ăn của ngày hôm nay hoặc những ngày trước để kiểm soát calo thâm hụt và giảm mỡ hiệu quả.
            </p>
            <button
              onClick={() => handleOpenAddModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              <Plus size={14} />
              <span>Ghi Bữa Ăn Đầu Tiên</span>
            </button>
          </div>
        ) : (
          filteredJournals.map((journal) => {
            const isExpanded = expandedDates[journal.date] !== false;

            return (
              <div
                key={journal.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all"
              >
                {/* Daily Card Header */}
                <div className="p-3.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => toggleExpandDate(journal.date)}
                      className="flex items-center gap-2 text-left flex-1 cursor-pointer select-none"
                    >
                      <span className="font-bold text-sm text-slate-800">
                        {formatDisplayDate(journal.date)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400" />
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenAddModal(journal.date)}
                        title="Thêm bữa ăn vào ngày này"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ date: journal.date, type: 'day' })}
                        title="Xóa toàn bộ bữa ăn ngày này"
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Badges: Nạp / Đốt / Ròng */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                    <span className="bg-orange-50 text-orange-700 font-bold px-2 py-0.5 rounded-lg border border-orange-200/60 flex items-center gap-1">
                      <Flame size={12} />
                      Nạp: {journal.totalCalories} kcal
                    </span>
                  </div>
                </div>

                {/* Collapsible Meals Detail */}
                {isExpanded && (
                  <div className="p-3.5 space-y-3">
                    {journal.meals.length === 0 ? (
                      <div className="text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400">Ngày này chưa có bữa ăn nào được ghi.</p>
                        <button
                          onClick={() => handleOpenAddModal(journal.date)}
                          className="mt-1 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                        >
                          + Ghi bữa ăn ngay
                        </button>
                      </div>
                    ) : (
                      journal.meals.map((meal) => (
                        <div
                          key={meal.id}
                          className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors"
                        >
                          {/* Meal Header */}
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-800">
                                {meal.category}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                {meal.time || '--:--'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono font-black text-orange-600">
                                {meal.totalCalories} kcal
                              </span>
                              <button
                                onClick={() => handleOpenEditModal(journal.date, meal)}
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                title="Sửa bữa ăn"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ date: journal.date, mealId: meal.id, type: 'meal' })}
                                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                title="Xóa bữa ăn"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Food Items List */}
                          {meal.foodItems && meal.foodItems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {meal.foodItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/70 text-xs"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    <span className="font-medium text-slate-700 truncate">
                                      {item.foodName}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 font-mono shrink-0">
                                    <span className="text-slate-400 text-[11px]">{item.grams}g</span>
                                    <span className="font-bold text-slate-800">{item.calories} cal</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">Chưa có chi tiết món ăn</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add/Edit Meal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingMealId ? 'Chỉnh Sửa Bữa Ăn' : 'Ghi Bữa Ăn Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto">
              {/* Date & Category */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Ngày Ăn
                  </label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Phân Loại Bữa
                  </label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {MEAL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Giờ Ăn
                </label>
                <input
                  type="time"
                  value={modalTime}
                  onChange={(e) => setModalTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Food Items */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Các Món Ăn Trong Bữa
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const defaultFood = foodDb[0]?.name || 'Cơm trắng';
                      const defaultPer100g = foodDb[0]?.caloriesPer100g || 130;
                      setModalItems([
                        ...modalItems,
                        {
                          id: `fi-${Date.now()}`,
                          foodName: defaultFood,
                          grams: 150,
                          calories: Math.round((150 / 100) * defaultPer100g),
                        },
                      ]);
                    }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    + Thêm món
                  </button>
                </div>

                <div className="space-y-2">
                  {modalItems.map((item, idx) => (
                    <div key={item.id} className="flex gap-1.5 items-center bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                      <select
                        value={item.foodName}
                        onChange={(e) => {
                          const food = foodDb.find((f) => f.name === e.target.value);
                          const per100 = food ? food.caloriesPer100g : 130;
                          const calories = Math.round(((item.grams || 100) / 100) * per100);
                          setModalItems(
                            modalItems.map((it) =>
                              it.id === item.id ? { ...it, foodName: e.target.value, calories } : it
                            )
                          );
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800 focus:outline-none"
                      >
                        {foodDb.map((f) => (
                          <option key={f.name} value={f.name}>
                            {f.name} ({f.caloriesPer100g} kcal/100g)
                          </option>
                        ))}
                      </select>

                      <div className="relative w-20">
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          placeholder="g"
                          value={item.grams || ''}
                          onChange={(e) => {
                            const grams = Number(e.target.value);
                            const food = foodDb.find((f) => f.name === item.foodName);
                            const per100 = food ? food.caloriesPer100g : 130;
                            const calories = Math.round((grams / 100) * per100);
                            setModalItems(
                              modalItems.map((it) =>
                                it.id === item.id ? { ...it, grams, calories } : it
                              )
                            );
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-800 text-center focus:outline-none pr-4"
                        />
                        <span className="absolute right-1.5 top-2 text-[10px] text-slate-400 font-bold">g</span>
                      </div>

                      <div className="w-16 text-right font-mono font-black text-orange-600 text-xs">
                        {item.calories} cal
                      </div>

                      {modalItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setModalItems(modalItems.filter((it) => it.id !== item.id))}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calories Preview */}
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80 flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-950">Tổng calo bữa ăn:</span>
                <span className="font-mono text-base font-black text-emerald-700">
                  {modalItems.reduce((acc, curr) => acc + (Number(curr.calories) || 0), 0)} kcal
                </span>
              </div>
            </div>

            <div className="p-3.5 border-t border-slate-100 flex gap-2 bg-slate-50/70">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveMeal}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                Lưu Bữa Ăn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl border border-slate-100 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={20} />
            </div>
            <h4 className="font-bold text-sm text-slate-900">
              {deleteTarget.type === 'day'
                ? 'Xóa tất cả bữa ăn ngày này?'
                : 'Xóa bữa ăn này?'}
            </h4>
            <p className="text-xs text-slate-500">
              Hành động này sẽ xóa dữ liệu bữa ăn tương ứng khỏi nhật ký dinh dưỡng.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
