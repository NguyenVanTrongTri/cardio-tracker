import { UtensilsCrossed, Plus, Calendar, Flame, ChevronDown, ChevronUp, Apple, Edit3, Trash2, X } from 'lucide-react';
import { useJournal } from './JournalTab/useJournal';
import { JournalMealModal } from './JournalTab/JournalMealModal';
import { JournalList } from './JournalTab/JournalList';
import { getStoredFoodDatabase } from '../../data/foodData';


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
      <JournalList
        filteredJournals={filteredJournals}
        expandedDates={expandedDates}
        toggleExpandDate={toggleExpandDate}
        handleOpenEditJournalModal={handleOpenEditJournalModal}
        setDeleteTarget={setDeleteTarget}
        handleOpenAddModal={handleOpenAddModal}
      />

      {/* Modal: Add/Edit Meal */}
      <JournalMealModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        modalMode={modalMode}
        modalDate={modalDate}
        modalTime={modalTime}
        setModalTime={setModalTime}
        expandedCategories={expandedCategories}
        toggleCategory={toggleCategory}
        modalMealsData={modalMealsData}
        setModalMealsData={setModalMealsData}
        foodDb={getStoredFoodDatabase()}
        isLoading={isLoading}
        isMealExists={isMealExists}
        handleSaveMeal={handleSaveMeal}
        mealCategories={MEAL_CATEGORIES}
      />

      {/* Modal: Confirm Delete */}

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
