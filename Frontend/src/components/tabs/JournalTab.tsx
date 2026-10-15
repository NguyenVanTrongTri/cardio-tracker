import {
  UtensilsCrossed,
  Plus,
  Calendar,
  Flame,
  ChevronDown,
  ChevronUp,
  Apple,
  Edit3,
  Trash2,
  X
} from 'lucide-react';
import { useJournal } from './JournalTab/useJournal';

const MEAL_CATEGORIES = ['Bữa Sáng', 'Bữa Trưa', 'Bữa Xế', 'Bữa Tối'];

export default function JournalTab() {
  const {
    journals,
    isLoading,
    stats,
    dateFilter,
    setDateFilter,
    customDate,
    setCustomDate,
    expandedDates,
    toggleExpandDate,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    modalDate,
    modalTime,
    setModalTime,
    expandedCategories,
    toggleCategory,
    modalMealsData,
    setModalMealsData,
    deleteTarget,
    setDeleteTarget,
    filteredJournals,
    handleOpenAddModal,
    handleOpenEditJournalModal,
    isMealExists,
    handleSaveMeal,
    handleDelete
  } = useJournal();

  const handleConfirmDelete = async () => {
    await handleDelete();
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
        {(!filteredJournals || filteredJournals.length === 0) ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
              <Apple size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Chưa có nhật ký bữa ăn nào</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Hãy ghi lại các bữa ăn của ngày hôm nay hoặc những ngày trước để kiểm soát calo thâm hụt và giảm mỡ hiệu quả.
            </p>
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
                        {journal.date}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400" />
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditJournalModal(journal.date)}
                        title="Chỉnh sửa thông tin ngày này"
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Edit3 size={16} />
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
                    {(!journal.meals || journal.meals.length === 0) ? (
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
                      journal.meals
                        .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                        .map((meal) => (
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
                          </div>
                          {/* Food Items List */}
                          {meal.foodItems && Array.isArray(meal.foodItems) && meal.foodItems.length > 0 ? (
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
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            
            {/* 1. Header của Modal */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {modalMode === 'edit' ? `Chỉnh Sửa Nhật Ký (${modalDate})` : 'Ghi Bữa Ăn Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* 2. Nội dung chính bên trong Modal */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 overflow-y-auto flex-1">
              <div className="space-y-4">
                {MEAL_CATEGORIES.map((category) => {
                  const isOpen = !!expandedCategories[category];
                  const categoryItems = modalMealsData[category] || [];

                  return (
                    <div key={category} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <h4 
                          className="text-sm font-bold text-slate-700 cursor-pointer"
                          onClick={() => toggleCategory(category)}
                        >
                          {category}
                        </h4>
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (!expandedCategories[category]) toggleCategory(category);
                            setModalMealsData(prev => ({
                              ...prev,
                              [category]: [
                                ...(prev[category] || []),
                                { id: `fi-${Date.now()}`, foodName: 'Món ăn mới', grams: 150, calories: 100 }
                              ]
                            }));
                          }}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                        >
                          + Thêm món
                        </button>
                      </div>
                      
                      {isOpen && (
                        <div className="space-y-2 mt-2 pt-2 border-t border-slate-200">
                          <div className="flex gap-2 items-center mb-2">
                            <input 
                              type="time" 
                              value={modalTime}
                              lang="en-GB" 
                              onChange={(e) => setModalTime(e.target.value)} 
                              className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-medium text-slate-800" 
                            />
                            <span className="text-xs text-slate-500">Tổng: {categoryItems.reduce((sum, item) => sum + item.calories, 0)} kcal</span>
                          </div>
                        
                          {categoryItems.map((item) => (
                            <div key={item.id} className="flex gap-2 items-center text-xs">
                              <input
                                value={item.foodName}
                                onChange={(e) => {
                                  setModalMealsData(prev => ({
                                    ...prev,
                                    [category]: prev[category].map(i => i.id === item.id ? { ...i, foodName: e.target.value } : i)
                                  }));
                                }}
                                className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1"
                              />

                              <input
                                type="number"
                                min="1"
                                value={item.grams ||''}
                                onChange={(e) => {
                                  const grams = Number(e.target.value);
                                  setModalMealsData(prev => ({
                                    ...prev,
                                    [category]: prev[category].map(i => i.id === item.id ? { ...i, grams } : i)
                                  }));
                                }}
                                className="w-16 bg-white border border-slate-200 rounded-lg px-1 py-1 text-center"
                                placeholder="g"
                              />

                              <span className="w-16 text-right font-medium">{item.calories} kcal</span>

                              <button
                                type="button"
                                onClick={() => setModalMealsData(prev => ({
                                  ...prev,
                                  [category]: prev[category].filter(i => i.id !== item.id)
                                }))}
                                className="text-slate-400 hover:text-rose-500 font-bold px-1 cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Footer chứa các nút hành động */}
            <div className="p-3.5 border-t border-slate-100 flex gap-2 bg-slate-50/70 shrink-0">
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
                disabled={isLoading || (modalMode === 'add' && isMealExists)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold text-white ${
                  (modalMode === 'add' && isMealExists)
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer'
                }`}
              >
                {isLoading ? 'Đang xử lý...' : (modalMode === 'add' && isMealExists ? 'Bữa ăn đã tồn tại' : (modalMode === 'edit' ? 'Cập nhật' : 'Lưu Bữa Ăn'))}
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
                {isLoading ? 'Đang xóa...' : 'Xác Nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
