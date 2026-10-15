import { UtensilsCrossed, X } from 'lucide-react';
import { FoodItemEntry } from '../../../types';
import { FoodItem } from '../../../data/foodData';

interface JournalMealModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  modalMode: 'add' | 'edit';
  modalDate: string;
  modalTime: string;
  setModalTime: (time: string) => void;
  expandedCategories: Record<string, boolean>;
  toggleCategory: (category: string) => void;
  modalMealsData: Record<string, FoodItemEntry[]>;
  setModalMealsData: (data: Record<string, FoodItemEntry[]>) => void;
  foodDb: FoodItem[];
  isLoading: boolean;
  isMealExists: boolean | undefined;
  handleSaveMeal: () => Promise<boolean | undefined>;
  mealCategories: string[];
}

export const JournalMealModal = ({
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
  foodDb,
  isLoading,
  isMealExists,
  handleSaveMeal,
  mealCategories
}: JournalMealModalProps) => {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
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

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 overflow-y-auto flex-1">
          <div className="space-y-4">
            {mealCategories.map((category) => {
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
                        setModalMealsData({
                          ...modalMealsData,
                          [category]: [
                            ...(modalMealsData[category] || []),
                            { id: `fi-${Date.now()}`, foodName: 'Món ăn mới', grams: 150, calories: 100 }
                          ]
                        });
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
                              const newName = e.target.value;
                              const food = foodDb.find(f => f.name === newName);
                              const calories = food ? Math.round((food.caloriesPer100g * item.grams) / 100) : item.calories;
                              
                              setModalMealsData({
                                ...modalMealsData,
                                [category]: modalMealsData[category].map(i => i.id === item.id 
                                  ? { ...i, foodName: newName, calories } 
                                  : i)
                              });
                            }}
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1"
                          />

                          <input
                            type="number"
                            min="1"
                            value={item.grams ||''}
                            onChange={(e) => {
                              const grams = Number(e.target.value);
                              const food = foodDb.find(f => f.name === item.foodName);
                              const calories = food ? Math.round((food.caloriesPer100g * grams) / 100) : item.calories;
                              
                              setModalMealsData({
                                ...modalMealsData,
                                [category]: modalMealsData[category].map(i => i.id === item.id ? { ...i, grams, calories } : i)
                              });
                            }}
                            className="w-16 bg-white border border-slate-200 rounded-lg px-1 py-1 text-center"
                            placeholder="g"
                          />

                          <span className="w-16 text-right font-medium">{item.calories} kcal</span>

                          <button
                            type="button"
                            onClick={() => setModalMealsData({
                              ...modalMealsData,
                              [category]: modalMealsData[category].filter(i => i.id !== item.id)
                            })}
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
            onClick={() => handleSaveMeal()}
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
  );
};
