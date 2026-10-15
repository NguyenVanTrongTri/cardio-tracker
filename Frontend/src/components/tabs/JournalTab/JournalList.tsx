import { ChevronDown, ChevronUp, Edit3, Trash2, Flame } from 'lucide-react';

interface JournalListProps {
  filteredJournals: any[];
  expandedDates: Record<string, boolean>;
  toggleExpandDate: (date: string) => void;
  handleOpenEditJournalModal: (date: string) => void;
  setDeleteTarget: (target: any) => void;
  handleOpenAddModal: (date?: string) => void;
}

export const JournalList = ({
  filteredJournals,
  expandedDates,
  toggleExpandDate,
  handleOpenEditJournalModal,
  setDeleteTarget,
  handleOpenAddModal,
}: JournalListProps) => {
  return (
    <div className="space-y-3.5">
      {filteredJournals.map((journal) => {
        const isExpanded = expandedDates[journal.date] !== false;

        return (
          <div
            key={journal.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all"
          >
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

              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                <span className="bg-orange-50 text-orange-700 font-bold px-2 py-0.5 rounded-lg border border-orange-200/60 flex items-center gap-1">
                  <Flame size={12} />
                  Nạp: {journal.totalCalories} kcal
                </span>
              </div>
            </div>

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
                    .sort((a: any, b: any) => (a.time || '').localeCompare(b.time || ''))
                    .map((meal: any) => (
                      <div
                        key={meal.id}
                        className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors"
                      >
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
                        {meal.foodItems && Array.isArray(meal.foodItems) && meal.foodItems.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {meal.foodItems.map((item: any) => (
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
      })}
    </div>
  );
};
